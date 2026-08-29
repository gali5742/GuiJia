import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const TRANSFORMERS_VERSION = '4.2.0';
const VECTOR_SIZE = 512;
const OUTPUT_PATH = path.join(root, 'data', 'semantic-router-weights-v0.1.json');
const SOURCE_FILES = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json'
];

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sourceHashes = Object.fromEntries(SOURCE_FILES.map((relative) => [relative, sha256(fs.readFileSync(path.join(root, relative)))]));

const sigmoid = (x) => {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
};

const dot = (weights, vector) => {
  let sum = 0;
  for (let i = 0; i < weights.length; i += 1) sum += weights[i] * vector[i];
  return sum;
};

const softmax = (logits) => {
  let max = -Infinity;
  for (const value of logits) if (value > max) max = value;
  const exps = new Float64Array(logits.length);
  let total = 0;
  for (let i = 0; i < logits.length; i += 1) {
    const value = Math.exp(logits[i] - max);
    exps[i] = value;
    total += value;
  }
  const probs = new Float64Array(logits.length);
  for (let i = 0; i < logits.length; i += 1) probs[i] = exps[i] / Math.max(total, 1e-12);
  return probs;
};

const tensorToVectors = (tensor, count) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || VECTOR_SIZE;
  if (hidden !== VECTOR_SIZE) throw new Error(`Unexpected hidden size ${hidden}; expected ${VECTOR_SIZE}.`);
  const batch = count || dims[0] || 1;
  const data = tensor?.data || [];
  const result = [];
  for (let row = 0; row < batch; row += 1) {
    const offset = row * hidden;
    const vector = new Float32Array(hidden);
    for (let col = 0; col < hidden; col += 1) vector[col] = Number(data[offset + col] || 0);
    result.push(vector);
  }
  return result;
};

const mergeTraining = (base, augmentation, targeted) => {
  const ids = Object.keys(base.routes || {});
  const routes = {};
  for (const id of ids) {
    if (!augmentation.routes?.[id]) throw new Error(`augmentation missing route: ${id}`);
    const focused = targeted.routes?.[id] || { train:[], validation:[] };
    routes[id] = {
      train:[...(base.routes[id].train || []), ...(augmentation.routes[id].train || []), ...(focused.train || [])],
      validation:[...(base.routes[id].validation || []), ...(augmentation.routes[id].validation || []), ...(focused.validation || [])]
    };
  }
  return {
    routes,
    hardNegatives:{
      train:[...(base.hardNegatives?.train || []), ...(augmentation.hardNegatives?.train || []), ...(targeted.hardNegatives?.train || [])],
      validation:[...(base.hardNegatives?.validation || []), ...(augmentation.hardNegatives?.validation || []), ...(targeted.hardNegatives?.validation || [])]
    }
  };
};

const routeIds = Object.keys(readJson(SOURCE_FILES[0]).routes || {});
const base = readJson(SOURCE_FILES[0]);
const augmentation = readJson(SOURCE_FILES[1]);
const targeted = readJson(SOURCE_FILES[2]);
const trainingData = mergeTraining(base, augmentation, targeted);

const flattenPositives = (split) => {
  const rows = [];
  for (const routeId of routeIds) {
    for (const text of trainingData.routes[routeId][split] || []) rows.push({ text, label:routeId, known:true, kind:'route', targets:[] });
  }
  return rows;
};

const hardNegativeRows = (split) => (trainingData.hardNegatives?.[split] || []).map((sample) => ({
  text:sample.text,
  label:'__other__',
  known:false,
  kind:'hard-negative',
  targets:sample.targets || ['*']
}));

const trainMultinomialRouteHead = (rows, vectors, { epochs=220, learningRate=0.82, l2=0.0005 } = {}) => {
  const classCount = routeIds.length;
  const weights = Array.from({ length:classCount }, () => new Float32Array(VECTOR_SIZE));
  const biases = new Float64Array(classCount);
  const gradients = Array.from({ length:classCount }, () => new Float64Array(VECTOR_SIZE));
  const gradBiases = new Float64Array(classCount);
  const labelIndex = new Map(routeIds.map((id, index) => [id, index]));

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    for (const gradient of gradients) gradient.fill(0);
    gradBiases.fill(0);
    for (let i = 0; i < rows.length; i += 1) {
      const vector = vectors[i];
      const logits = new Float64Array(classCount);
      for (let c = 0; c < classCount; c += 1) logits[c] = dot(weights[c], vector) + biases[c];
      const probs = softmax(logits);
      const targetIndex = labelIndex.get(rows[i].label);
      for (let c = 0; c < classCount; c += 1) {
        const error = probs[c] - (c === targetIndex ? 1 : 0);
        gradBiases[c] += error;
        for (let j = 0; j < VECTOR_SIZE; j += 1) gradients[c][j] += error * vector[j];
      }
    }
    const scale = 1 / Math.max(1, rows.length);
    const lr = learningRate / (1 + epoch * 0.018);
    for (let c = 0; c < classCount; c += 1) {
      for (let j = 0; j < VECTOR_SIZE; j += 1) weights[c][j] -= lr * (gradients[c][j] * scale + l2 * weights[c][j]);
      biases[c] -= lr * gradBiases[c] * scale;
    }
  }
  return { weights, biases };
};

const localNegativeWeight = (row, routeId) => {
  if (row.label === routeId) return 0;
  if (row.kind === 'hard-negative') {
    if (row.targets.includes('*') || row.targets.includes(routeId)) return 2.6;
    return 0.12;
  }
  return 0.22;
};

const trainLocalGate = (routeId, rows, vectors, { epochs=150, learningRate=0.38, l2=0.0007 } = {}) => {
  const weights = new Float32Array(VECTOR_SIZE);
  let bias = 0;
  let positiveWeightBase = 0;
  let negativeWeightBase = 0;
  for (const row of rows) {
    if (row.label === routeId) positiveWeightBase += 1;
    else negativeWeightBase += localNegativeWeight(row, routeId);
  }
  const positiveScale = Math.min(8, Math.max(1, negativeWeightBase / Math.max(1, positiveWeightBase)));
  const grad = new Float64Array(VECTOR_SIZE);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    grad.fill(0);
    let gradBias = 0;
    let totalWeight = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const target = row.label === routeId ? 1 : 0;
      const sampleWeight = target ? positiveScale : localNegativeWeight(row, routeId);
      if (sampleWeight <= 0) continue;
      const p = sigmoid(dot(weights, vectors[i]) + bias);
      const error = (p - target) * sampleWeight;
      gradBias += error;
      totalWeight += sampleWeight;
      for (let j = 0; j < VECTOR_SIZE; j += 1) grad[j] += error * vectors[i][j];
    }
    const scale = 1 / Math.max(1, totalWeight);
    const lr = learningRate / (1 + epoch * 0.025);
    for (let j = 0; j < VECTOR_SIZE; j += 1) weights[j] -= lr * (grad[j] * scale + l2 * weights[j]);
    bias -= lr * gradBias * scale;
  }
  return { weights, bias, positiveScale };
};

const routeScores = (routeHead, vector) => {
  const logits = new Float64Array(routeIds.length);
  for (let c = 0; c < routeIds.length; c += 1) logits[c] = dot(routeHead.weights[c], vector) + routeHead.biases[c];
  const probs = softmax(logits);
  return routeIds.map((id, index) => ({ id, score:probs[index] })).sort((a, b) => b.score - a.score);
};

const logisticScore = (head, vector) => sigmoid(dot(head.weights, vector) + head.bias);

const localCalibrationRows = (routeId, rows, vectors, routePredictions) => {
  const selected = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const routedHere = routePredictions[i].top1.id === routeId;
    const positive = row.label === routeId;
    const targetedNegative = row.kind === 'hard-negative' && (row.targets.includes('*') || row.targets.includes(routeId));
    const wrongRouteNegative = row.label !== routeId && routedHere;
    if (positive || targetedNegative || wrongRouteNegative) selected.push({ row, vector:vectors[i], positive });
  }
  return selected;
};

const chooseThreshold = (positiveScores, negativeScores, { defaultThreshold=0.5 } = {}) => {
  if (!positiveScores.length) return { threshold:defaultThreshold, recall:0, falsePositiveRate:0, precision:0, strict:false, positives:0, negatives:negativeScores.length };
  const values = [...positiveScores, ...negativeScores].filter(Number.isFinite).sort((a, b) => a - b);
  const candidates = new Set([defaultThreshold]);
  if (values.length) {
    candidates.add(values[0] - 1e-6);
    candidates.add(values[values.length - 1] + 1e-6);
    for (let i = 0; i < values.length - 1; i += 1) candidates.add((values[i] + values[i + 1]) / 2);
  }
  let best = null;
  for (const threshold of candidates) {
    const tp = positiveScores.filter((score) => score >= threshold).length;
    const fp = negativeScores.filter((score) => score >= threshold).length;
    const recall = tp / positiveScores.length;
    const falsePositiveRate = fp / Math.max(1, negativeScores.length);
    const precision = tp / Math.max(1, tp + fp);
    const strictLimit = negativeScores.length >= 10 ? 0.10 : 0.20;
    const strict = falsePositiveRate <= strictLimit;
    const utility = recall * 5 + precision * 3 + (1 - falsePositiveRate) * 3;
    const record = { threshold, recall, falsePositiveRate, precision, strict, utility, positives:positiveScores.length, negatives:negativeScores.length };
    if (!best) best = record;
    else if (record.strict && !best.strict) best = record;
    else if (record.strict === best.strict) {
      if (record.strict) {
        if (record.recall > best.recall + 1e-9) best = record;
        else if (Math.abs(record.recall - best.recall) < 1e-9 && record.falsePositiveRate < best.falsePositiveRate - 1e-9) best = record;
        else if (Math.abs(record.recall - best.recall) < 1e-9 && Math.abs(record.falsePositiveRate - best.falsePositiveRate) < 1e-9 && record.precision > best.precision + 1e-9) best = record;
      } else if (record.utility > best.utility) best = record;
    }
  }
  return best;
};

const roundArray = (values, digits=9) => Array.from(values, (value) => Number(Number(value).toFixed(digits)));

const main = async () => {
  env.allowLocalModels = false;
  env.useBrowserCache = false;
  const extractor = await pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE });

  const trainPositives = flattenPositives('train');
  const trainNegatives = hardNegativeRows('train');
  const validationPositives = flattenPositives('validation');
  const validationNegatives = hardNegativeRows('validation');
  const trainRows = [...trainPositives, ...trainNegatives];
  const validationRows = [...validationPositives, ...validationNegatives];
  const allRows = [...trainRows, ...validationRows];

  const vectors = [];
  const chunkSize = 24;
  for (let start = 0; start < allRows.length; start += chunkSize) {
    const chunk = allRows.slice(start, start + chunkSize);
    const output = await extractor(chunk.map((row) => row.text), { pooling:'mean', normalize:true });
    vectors.push(...tensorToVectors(output, chunk.length));
    process.stdout.write(`embedded ${Math.min(start + chunk.length, allRows.length)}/${allRows.length}\n`);
  }

  const trainVectors = vectors.slice(0, trainRows.length);
  const validationVectors = vectors.slice(trainRows.length);
  const trainPositiveVectors = trainVectors.slice(0, trainPositives.length);
  const routeHead = trainMultinomialRouteHead(trainPositives, trainPositiveVectors);
  const localGateHeads = {};
  for (const routeId of routeIds) localGateHeads[routeId] = trainLocalGate(routeId, trainRows, trainVectors);

  const validationRoutePredictions = validationVectors.map((vector) => {
    const scores = routeScores(routeHead, vector);
    return { top1:scores[0], top2:scores[1] };
  });
  const thresholds = {};
  for (const routeId of routeIds) {
    const localRows = localCalibrationRows(routeId, validationRows, validationVectors, validationRoutePredictions);
    const positives = [];
    const negatives = [];
    for (const item of localRows) {
      const score = logisticScore(localGateHeads[routeId], item.vector);
      (item.positive ? positives : negatives).push(score);
    }
    thresholds[routeId] = chooseThreshold(positives, negatives, { defaultThreshold:0.5 });
  }

  const artifact = {
    version:'0.1',
    status:'frozen',
    architecture:'bge-multinomial-route-route-conditioned-logistic',
    encoder:{
      modelId:MODEL_ID,
      dtype:MODEL_DTYPE,
      transformersVersion:TRANSFORMERS_VERSION,
      vectorSize:VECTOR_SIZE,
      pooling:'mean',
      normalize:true
    },
    routeIds,
    routeHead:{
      weights:routeHead.weights.map((weights) => roundArray(weights)),
      biases:roundArray(routeHead.biases, 12)
    },
    gates:Object.fromEntries(routeIds.map((routeId) => [routeId, {
      weights:roundArray(localGateHeads[routeId].weights),
      bias:Number(localGateHeads[routeId].bias.toFixed(12)),
      positiveScale:Number(localGateHeads[routeId].positiveScale.toFixed(12)),
      threshold:Number(thresholds[routeId].threshold.toFixed(12)),
      calibration:{
        recall:Number(thresholds[routeId].recall.toFixed(12)),
        falsePositiveRate:Number(thresholds[routeId].falsePositiveRate.toFixed(12)),
        precision:Number(thresholds[routeId].precision.toFixed(12)),
        positives:thresholds[routeId].positives,
        negatives:thresholds[routeId].negatives
      }
    }])),
    training:{
      sourceFiles:SOURCE_FILES,
      sourceHashes,
      trainPositiveCount:trainPositives.length,
      trainOtherCount:trainNegatives.length,
      validationPositiveCount:validationPositives.length,
      validationOtherCount:validationNegatives.length,
      algorithm:{
        route:{ type:'multinomial-logistic-regression', epochs:220, learningRate:0.82, l2:0.0005, lrDecay:0.018 },
        gate:{ type:'route-conditioned-logistic-regression', epochs:150, learningRate:0.38, l2:0.0007, lrDecay:0.025, targetedNegativeWeight:2.6, untargetedHardNegativeWeight:0.12, otherRouteWeight:0.22 },
        calibration:{ source:'validation-only', perRoute:true, strictNegativeLimit:'0.10 when >=10 negatives, else 0.20' }
      }
    }
  };
  const canonical = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.writeFileSync(OUTPUT_PATH, canonical);
  console.log(`wrote ${path.relative(root, OUTPUT_PATH)} (${Buffer.byteLength(canonical)} bytes)`);
};

await main();
