import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const TRAIN_BASE_URL = new URL('../data/liuyao-semantic-route-training-v0.1.json', import.meta.url);
const TRAIN_AUG_URL = new URL('../data/liuyao-semantic-route-training-v0.2-augmentation.json', import.meta.url);
const EVAL_URL = new URL('../data/liuyao-semantic-route-eval-v0.1.json', import.meta.url);

const ROUTE_TITLES = Object.freeze({
  financial_fortune:'阶段财运',
  business_operation:'经营盈利',
  borrow_money:'借款 / 贷款获批',
  debt_repayment:'偿债 / 还清贷款',
  investment_profit:'投资盈利',
  investment_suitability:'投资适合度',
  investment_position_decision:'持仓决策',
  investment_price_trend:'投资标的价格走势',
  income_salary:'工资 / 薪资',
  income_bonus:'奖金 / 年终奖',
  receive_item:'收货 / 到手',
  item_purchase:'购买物品',
  relationship_development:'特定对象恋爱发展',
  marriage_match:'婚事 / 能否结婚',
  marital_relationship:'既有婚姻关系'
});

let extractor = null;
let trainingData = null;
let evalData = null;
let gateHead = null;
let routeHead = null;
let routeIds = [];
let thresholds = { minGateProbability:0.50, minRouteMargin:0.05 };
const embeddingCache = new Map();

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

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};

const mergeTraining = (base, augmentation) => {
  const ids = Object.keys(base.routes || {});
  const routes = {};
  for (const id of ids) {
    if (!augmentation.routes?.[id]) throw new Error(`augmentation 缺少 route: ${id}`);
    routes[id] = {
      train:[...(base.routes[id].train || []), ...(augmentation.routes[id].train || [])],
      validation:[...(base.routes[id].validation || []), ...(augmentation.routes[id].validation || [])]
    };
  }
  return {
    version:'0.4-combined',
    routes,
    hardNegatives:{
      train:[...(base.hardNegatives?.train || []), ...(augmentation.hardNegatives?.train || [])],
      validation:[...(base.hardNegatives?.validation || []), ...(augmentation.hardNegatives?.validation || [])]
    }
  };
};

const ensureData = async () => {
  if (!trainingData) {
    const [base, augmentation] = await Promise.all([fetchJson(TRAIN_BASE_URL), fetchJson(TRAIN_AUG_URL)]);
    trainingData = mergeTraining(base, augmentation);
  }
  if (!evalData) evalData = await fetchJson(EVAL_URL);
  routeIds = Object.keys(trainingData.routes || {});
  return { trainingData, evalData };
};

const embedTexts = async (texts, { chunkSize=24, onProgress } = {}) => {
  if (!extractor) throw new Error('模型尚未加载');
  const missing = [...new Set(texts)].filter((text) => !embeddingCache.has(text));
  for (let start = 0; start < missing.length; start += chunkSize) {
    const chunk = missing.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:'mean', normalize:true });
    const vectors = tensorToVectors(output, chunk.length);
    chunk.forEach((text, index) => embeddingCache.set(text, vectors[index]));
    onProgress?.(Math.min(start + chunk.length, missing.length), missing.length);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return texts.map((text) => embeddingCache.get(text));
};

const flattenPositives = (split) => {
  const rows = [];
  for (const routeId of routeIds) {
    for (const text of trainingData.routes[routeId][split] || []) rows.push({ text, label:routeId, known:true, kind:'route' });
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

const trainGate = (rows, vectors, { epochs=140, learningRate=0.42, l2=0.0006 } = {}) => {
  const weights = new Float32Array(VECTOR_SIZE);
  let bias = 0;
  const positiveCount = rows.filter((row) => row.known).length;
  const negativeCount = rows.length - positiveCount;
  const positiveWeight = rows.length / Math.max(1, 2 * positiveCount);
  const negativeWeight = rows.length / Math.max(1, 2 * negativeCount);
  const grad = new Float64Array(VECTOR_SIZE);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    grad.fill(0);
    let gradBias = 0;
    let weightTotal = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const target = rows[i].known ? 1 : 0;
      const sampleWeight = target ? positiveWeight : negativeWeight;
      const p = sigmoid(dot(weights, vectors[i]) + bias);
      const error = (p - target) * sampleWeight;
      gradBias += error;
      weightTotal += sampleWeight;
      for (let j = 0; j < VECTOR_SIZE; j += 1) grad[j] += error * vectors[i][j];
    }
    const scale = 1 / Math.max(1, weightTotal);
    const lr = learningRate / (1 + epoch * 0.025);
    for (let j = 0; j < VECTOR_SIZE; j += 1) weights[j] -= lr * (grad[j] * scale + l2 * weights[j]);
    bias -= lr * gradBias * scale;
  }
  return { weights, bias, positiveWeight, negativeWeight };
};

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

const gateProbability = (vector) => {
  if (!gateHead) throw new Error('Known/Other Gate 尚未训练');
  return sigmoid(dot(gateHead.weights, vector) + gateHead.bias);
};

const routeScores = (vector) => {
  if (!routeHead) throw new Error('Route classifier 尚未训练');
  const logits = new Float64Array(routeIds.length);
  for (let c = 0; c < routeIds.length; c += 1) logits[c] = dot(routeHead.weights[c], vector) + routeHead.biases[c];
  const probs = softmax(logits);
  return routeIds.map((id, index) => ({ id, title:ROUTE_TITLES[id] || id, score:probs[index] })).sort((a, b) => b.score - a.score);
};

const classifyVector = (vector, customThresholds = thresholds) => {
  const knownProbability = gateProbability(vector);
  const scores = routeScores(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const routeMargin = top1.score - top2.score;
  const gatePassed = knownProbability >= customThresholds.minGateProbability;
  const routePassed = routeMargin >= customThresholds.minRouteMargin;
  const accepted = gatePassed && routePassed;
  return {
    predicted:accepted ? top1.id : '__other__',
    accepted,
    gatePassed,
    routePassed,
    knownProbability,
    top1,
    top2,
    routeMargin,
    scores,
    thresholds:{ ...customThresholds }
  };
};

const evaluateRows = (rows, vectors, customThresholds) => rows.map((row, index) => {
  const result = classifyVector(vectors[index], customThresholds);
  return { ...row, ...result, correct:result.predicted === row.label };
});

const summarize = (results) => {
  const known = results.filter((row) => row.label !== '__other__');
  const other = results.filter((row) => row.label === '__other__');
  const acceptedKnown = known.filter((row) => row.accepted);
  const correctAcceptedKnown = acceptedKnown.filter((row) => row.predicted === row.label);
  const rejectedOther = other.filter((row) => !row.accepted);
  const gateKnown = known.filter((row) => row.gatePassed);
  const gateRejectedOther = other.filter((row) => !row.gatePassed);
  const routeCorrectKnown = known.filter((row) => row.top1?.id === row.label);
  const exact = results.filter((row) => row.correct);
  return {
    total:results.length,
    exactAccuracy:exact.length / Math.max(1, results.length),
    knownCoverage:acceptedKnown.length / Math.max(1, known.length),
    acceptedKnownAccuracy:correctAcceptedKnown.length / Math.max(1, acceptedKnown.length),
    otherRejectionRate:rejectedOther.length / Math.max(1, other.length),
    falseActivationRate:(other.length - rejectedOther.length) / Math.max(1, other.length),
    gateKnownRecall:gateKnown.length / Math.max(1, known.length),
    gateOtherRejectionRate:gateRejectedOther.length / Math.max(1, other.length),
    routeKnownTop1Accuracy:routeCorrectKnown.length / Math.max(1, known.length),
    knownCount:known.length,
    otherCount:other.length,
    acceptedKnownCount:acceptedKnown.length,
    correctAcceptedKnownCount:correctAcceptedKnown.length
  };
};

const calibrateThresholds = (rows, vectors) => {
  let best = null;
  for (let gate = 0.30; gate <= 0.80 + 1e-9; gate += 0.025) {
    for (let margin = 0; margin <= 0.30 + 1e-9; margin += 0.025) {
      const candidate = {
        minGateProbability:Number(gate.toFixed(3)),
        minRouteMargin:Number(margin.toFixed(3))
      };
      const results = evaluateRows(rows, vectors, candidate);
      const metrics = summarize(results);
      const strictOk = metrics.acceptedKnownAccuracy >= 0.98 && metrics.falseActivationRate <= 0.05;
      const utility = metrics.knownCoverage * 5 + metrics.acceptedKnownAccuracy * 3 + metrics.otherRejectionRate * 3 - metrics.falseActivationRate * 8;
      const record = { ...candidate, metrics, strictOk, utility };
      if (!best) best = record;
      else if (record.strictOk && !best.strictOk) best = record;
      else if (record.strictOk === best.strictOk) {
        if (record.strictOk) {
          if (record.metrics.knownCoverage > best.metrics.knownCoverage + 1e-9) best = record;
          else if (Math.abs(record.metrics.knownCoverage - best.metrics.knownCoverage) < 1e-9 && record.metrics.otherRejectionRate > best.metrics.otherRejectionRate + 1e-9) best = record;
          else if (Math.abs(record.metrics.knownCoverage - best.metrics.knownCoverage) < 1e-9 && Math.abs(record.metrics.otherRejectionRate - best.metrics.otherRejectionRate) < 1e-9 && record.metrics.acceptedKnownAccuracy > best.metrics.acceptedKnownAccuracy + 1e-9) best = record;
        } else if (record.utility > best.utility) best = record;
      }
    }
  }
  return best;
};

const loadModel = async (progressCallback) => {
  await ensureData();
  if (!extractor) {
    extractor = await pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:progressCallback });
  }
  return { modelId:MODEL_ID, dtype:MODEL_DTYPE, routes:routeIds.length };
};

const train = async ({ onStage, onEmbeddingProgress } = {}) => {
  await ensureData();
  if (!extractor) throw new Error('请先加载模型');

  const trainPositives = flattenPositives('train');
  const trainNegatives = hardNegativeRows('train');
  const validationPositives = flattenPositives('validation');
  const validationNegatives = hardNegativeRows('validation');
  const trainRows = [...trainPositives, ...trainNegatives];
  const validationRows = [...validationPositives, ...validationNegatives];
  const allRows = [...trainRows, ...validationRows];

  onStage?.('embedding', `正在生成 ${allRows.length} 条训练/验证向量…`);
  const allVectors = await embedTexts(allRows.map((row) => row.text), { onProgress:onEmbeddingProgress });
  const trainVectors = allVectors.slice(0, trainRows.length);
  const validationVectors = allVectors.slice(trainRows.length);
  const trainPositiveVectors = trainVectors.slice(0, trainPositives.length);

  onStage?.('gate', '正在训练 Known / Other 二分类 Gate…');
  gateHead = trainGate(trainRows, trainVectors);
  await new Promise((resolve) => setTimeout(resolve, 0));

  onStage?.('route', `正在训练 ${routeIds.length} 类 Multinomial Logistic Regression…`);
  routeHead = trainMultinomialRouteHead(trainPositives, trainPositiveVectors);
  await new Promise((resolve) => setTimeout(resolve, 0));

  onStage?.('calibration', '正在使用独立 validation 自动选择 Gate / Route 阈值…');
  const calibration = calibrateThresholds(validationRows, validationVectors);
  thresholds = {
    minGateProbability:calibration.minGateProbability,
    minRouteMargin:calibration.minRouteMargin
  };
  const validationResults = evaluateRows(validationRows, validationVectors, thresholds);
  const validationMetrics = summarize(validationResults);
  onStage?.('done', `训练完成：gate≥${thresholds.minGateProbability.toFixed(3)}，route margin≥${thresholds.minRouteMargin.toFixed(3)}`);
  return {
    trainCount:trainRows.length,
    trainPositiveCount:trainPositives.length,
    trainOtherCount:trainNegatives.length,
    validationCount:validationRows.length,
    validationPositiveCount:validationPositives.length,
    validationOtherCount:validationNegatives.length,
    routeCount:routeIds.length,
    thresholds:{ ...thresholds },
    validationMetrics,
    validationResults,
    strictCalibration:calibration.strictOk
  };
};

const classify = async (text, customThresholds) => {
  if (!gateHead || !routeHead) throw new Error('请先训练 Gate 与 Route classifier');
  const [vector] = await embedTexts([text]);
  return classifyVector(vector, customThresholds || thresholds);
};

const runEvaluation = async ({ customThresholds, onProgress } = {}) => {
  await ensureData();
  if (!gateHead || !routeHead) throw new Error('请先训练 Gate 与 Route classifier');
  const rows = [];
  for (const [label, texts] of Object.entries(evalData.samples || {})) {
    for (const text of texts) rows.push({ text, label, known:label !== '__other__' });
  }
  const vectors = [];
  const chunkSize = 20;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    vectors.push(...await embedTexts(chunk.map((row) => row.text)));
    onProgress?.(Math.min(start + chunk.length, rows.length), rows.length);
  }
  const usedThresholds = customThresholds || thresholds;
  const results = evaluateRows(rows, vectors, usedThresholds);
  return { metrics:summarize(results), results, thresholds:{ ...usedThresholds } };
};

export const semanticRouterPocV04 = {
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  get routes(){ return routeIds.map((id) => ({ id, title:ROUTE_TITLES[id] || id })); },
  get thresholds(){ return { ...thresholds }; },
  loadModel,
  train,
  classify,
  runEvaluation
};
