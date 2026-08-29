import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const DATA_URL = new URL('../data/liuyao-entity-typing-training-v0.1.json', import.meta.url);
const LABELS = Object.freeze(['investment_asset','purchasable_item','delivery_subject','unknown']);
const MIN_MARGIN = 0.03;

let extractor = null;
let data = null;
let head = null;
let thresholds = null;
const embeddingCache = new Map();

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
  for (let i = 0; i < logits.length; i += 1) { exps[i] = Math.exp(logits[i] - max); total += exps[i]; }
  const probs = new Float64Array(logits.length);
  for (let i = 0; i < logits.length; i += 1) probs[i] = exps[i] / Math.max(total, 1e-12);
  return probs;
};
const tensorToVectors = (tensor, count) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || VECTOR_SIZE;
  const batch = count || dims[0] || 1;
  const values = tensor?.data || [];
  const result = [];
  for (let row = 0; row < batch; row += 1) {
    const offset = row * hidden;
    const vector = new Float32Array(hidden);
    for (let col = 0; col < hidden; col += 1) vector[col] = Number(values[offset + col] || 0);
    result.push(vector);
  }
  return result;
};
const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};
const composeInput = (entity, context) => `对象：${String(entity || '').trim()}。上下文：${String(context || '').trim()}`;

const ensureData = async () => {
  if (!data) data = await fetchJson(DATA_URL);
  return data;
};
const flatten = (split) => {
  const rows = [];
  for (const label of LABELS) {
    for (const sample of data.labels?.[label]?.[split] || []) {
      rows.push({ label, entity:sample.entity, context:sample.context, text:composeInput(sample.entity, sample.context) });
    }
  }
  return rows;
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

const trainMultinomial = (rows, vectors, { epochs=260, learningRate=0.78, l2=0.0006 } = {}) => {
  const classCount = LABELS.length;
  const weights = Array.from({ length:classCount }, () => new Float32Array(VECTOR_SIZE));
  const biases = new Float64Array(classCount);
  const gradients = Array.from({ length:classCount }, () => new Float64Array(VECTOR_SIZE));
  const gradBiases = new Float64Array(classCount);
  const labelIndex = new Map(LABELS.map((id, index) => [id, index]));
  for (let epoch = 0; epoch < epochs; epoch += 1) {
    for (const gradient of gradients) gradient.fill(0);
    gradBiases.fill(0);
    for (let i = 0; i < rows.length; i += 1) {
      const vector = vectors[i];
      const logits = new Float64Array(classCount);
      for (let c = 0; c < classCount; c += 1) logits[c] = dot(weights[c], vector) + biases[c];
      const probs = softmax(logits);
      const target = labelIndex.get(rows[i].label);
      for (let c = 0; c < classCount; c += 1) {
        const error = probs[c] - (c === target ? 1 : 0);
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

const scoresForVector = (vector) => {
  if (!head) throw new Error('Entity Typing classifier 尚未训练');
  const logits = new Float64Array(LABELS.length);
  for (let c = 0; c < LABELS.length; c += 1) logits[c] = dot(head.weights[c], vector) + head.biases[c];
  const probs = softmax(logits);
  return LABELS.map((id, index) => ({ id, score:probs[index] })).sort((a, b) => b.score - a.score);
};

const chooseThreshold = (label, rows, vectors) => {
  if (label === 'unknown') return 0;
  const positives = [];
  const negatives = [];
  for (let i = 0; i < rows.length; i += 1) {
    const score = scoresForVector(vectors[i]).find((item) => item.id === label)?.score || 0;
    (rows[i].label === label ? positives : negatives).push(score);
  }
  const values = [...positives, ...negatives].sort((a, b) => a - b);
  const candidates = new Set([0.45, 0.5, 0.55, 0.6]);
  for (let i = 0; i < values.length - 1; i += 1) candidates.add((values[i] + values[i + 1]) / 2);
  let best = null;
  for (const threshold of candidates) {
    const tp = positives.filter((score) => score >= threshold).length;
    const fp = negatives.filter((score) => score >= threshold).length;
    const recall = tp / Math.max(1, positives.length);
    const fpr = fp / Math.max(1, negatives.length);
    const precision = tp / Math.max(1, tp + fp);
    const strict = fpr <= 0.08;
    const utility = recall * 5 + precision * 4 + (1 - fpr) * 4;
    const record = { threshold, recall, fpr, precision, strict, utility };
    if (!best || (record.strict && !best.strict) || (record.strict === best.strict && record.utility > best.utility)) best = record;
  }
  return best?.threshold ?? 0.55;
};

const classifyVector = (vector) => {
  const scores = scoresForVector(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const margin = top1.score - top2.score;
  const threshold = thresholds?.[top1.id] ?? 0.55;
  const accepted = top1.id === 'unknown' ? false : top1.score >= threshold && margin >= MIN_MARGIN;
  return {
    top1,
    top2,
    margin,
    threshold,
    accepted,
    type:accepted ? top1.id : (top1.id === 'unknown' ? 'unknown' : 'unknown'),
    confidence:top1.score,
    scores
  };
};

const metrics = (rows, results) => {
  let top1Correct = 0;
  let typedAccepted = 0;
  let typedCorrect = 0;
  let knownTotal = 0;
  let unknownTotal = 0;
  let unknownRejected = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const result = results[i];
    if (result.top1.id === row.label) top1Correct += 1;
    if (row.label === 'unknown') {
      unknownTotal += 1;
      if (!result.accepted) unknownRejected += 1;
    } else {
      knownTotal += 1;
      if (result.accepted) {
        typedAccepted += 1;
        if (result.type === row.label) typedCorrect += 1;
      }
    }
  }
  return {
    top1Accuracy:top1Correct / Math.max(1, rows.length),
    typedCoverage:typedAccepted / Math.max(1, knownTotal),
    acceptedTypedAccuracy:typedCorrect / Math.max(1, typedAccepted),
    unknownRejection:unknownRejected / Math.max(1, unknownTotal),
    trainableKnown:knownTotal,
    unknownTotal
  };
};

const loadModel = async (progressCallback) => {
  if (extractor) return extractor;
  extractor = await pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:progressCallback });
  return extractor;
};

const train = async ({ onStage, onEmbeddingProgress } = {}) => {
  if (!extractor) throw new Error('请先加载 BGE');
  await ensureData();
  const trainRows = flatten('train');
  const validationRows = flatten('validation');
  onStage?.('embedding', '生成 Train / Validation embeddings');
  const allTexts = [...trainRows, ...validationRows].map((row) => row.text);
  await embedTexts(allTexts, { onProgress:onEmbeddingProgress });
  const trainVectors = trainRows.map((row) => embeddingCache.get(row.text));
  const validationVectors = validationRows.map((row) => embeddingCache.get(row.text));
  onStage?.('training', '训练 4-class multinomial linear head');
  head = trainMultinomial(trainRows, trainVectors);
  onStage?.('calibration', '仅使用 Validation 校准三类可绑定类型阈值');
  thresholds = Object.fromEntries(LABELS.map((label) => [label, chooseThreshold(label, validationRows, validationVectors)]));
  const validationResults = validationVectors.map(classifyVector);
  const validationMetrics = metrics(validationRows, validationResults);
  onStage?.('done', 'Entity Typing PoC v0.1 已训练');
  return { trainCount:trainRows.length, validationCount:validationRows.length, thresholds, validationMetrics, validationRows, validationResults };
};

const classify = async (entity, context) => {
  if (!head || !thresholds) throw new Error('请先训练 Entity Typing PoC');
  const text = composeInput(entity, context);
  const [vector] = await embedTexts([text]);
  const result = classifyVector(vector);
  return {
    entity:String(entity || '').trim(),
    context:String(context || '').trim(),
    ...result,
    modelId:'guijia-entity-typing-poc-v0.1',
    prediction:{
      entity:String(entity || '').trim(),
      type:result.type,
      confidence:result.confidence,
      score:result.top1.score,
      margin:result.margin,
      accepted:result.accepted,
      modelId:'guijia-entity-typing-poc-v0.1'
    }
  };
};

export const entityTypingPocV01 = Object.freeze({
  version:'0.1',
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  labels:LABELS,
  minMargin:MIN_MARGIN,
  loadModel,
  train,
  classify
});
