import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const TRAIN_URL = new URL('../data/liuyao-semantic-route-training-v0.1.json', import.meta.url);
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
let heads = null;
let thresholds = { minScore:0.55, minMargin:0.08 };
let routeIds = [];
let embeddingCache = new Map();

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

const ensureData = async () => {
  if (!trainingData) trainingData = await fetchJson(TRAIN_URL);
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
    for (const text of trainingData.routes[routeId][split] || []) rows.push({ text, label:routeId, kind:'route' });
  }
  return rows;
};

const hardNegativeRows = (split) => (trainingData.hardNegatives?.[split] || []).map((sample) => ({
  text:sample.text,
  label:'__other__',
  kind:'hard-negative',
  targets:sample.targets || ['*']
}));

const trainOneHead = (routeId, rows, vectors, { epochs=60, learningRate=0.22, l2=0.0008 } = {}) => {
  const weights = new Float32Array(VECTOR_SIZE);
  let bias = 0;
  const positives = rows.filter((row) => row.label === routeId).length;
  let negativeWeightSum = 0;
  for (const row of rows) {
    if (row.label === routeId) continue;
    if (row.kind === 'hard-negative') negativeWeightSum += (row.targets.includes(routeId) || row.targets.includes('*')) ? 2.2 : 0.35;
    else negativeWeightSum += 0.75;
  }
  const positiveWeight = Math.min(10, Math.max(1, negativeWeightSum / Math.max(1, positives)));
  const grad = new Float32Array(VECTOR_SIZE);

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    grad.fill(0);
    let gradBias = 0;
    let weightTotal = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const vector = vectors[i];
      const target = row.label === routeId ? 1 : 0;
      let sampleWeight;
      if (target) sampleWeight = positiveWeight;
      else if (row.kind === 'hard-negative') sampleWeight = (row.targets.includes(routeId) || row.targets.includes('*')) ? 2.2 : 0.35;
      else sampleWeight = 0.75;

      const probability = sigmoid(dot(weights, vector) + bias);
      const error = (probability - target) * sampleWeight;
      gradBias += error;
      weightTotal += sampleWeight;
      for (let j = 0; j < VECTOR_SIZE; j += 1) grad[j] += error * vector[j];
    }
    const scale = 1 / Math.max(1, weightTotal);
    const lr = learningRate / (1 + epoch * 0.035);
    for (let j = 0; j < VECTOR_SIZE; j += 1) {
      const g = grad[j] * scale + l2 * weights[j];
      weights[j] -= lr * g;
    }
    bias -= lr * gradBias * scale;
  }
  return { routeId, weights, bias, positiveWeight };
};

const scoreVector = (vector) => {
  if (!heads) throw new Error('分类头尚未训练');
  const scores = routeIds.map((routeId) => {
    const head = heads[routeId];
    const score = sigmoid(dot(head.weights, vector) + head.bias);
    return { id:routeId, title:ROUTE_TITLES[routeId] || routeId, score };
  }).sort((a, b) => b.score - a.score);
  return scores;
};

const classifyVector = (vector, customThresholds = thresholds) => {
  const scores = scoreVector(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const margin = top1.score - top2.score;
  const accepted = top1.score >= customThresholds.minScore && margin >= customThresholds.minMargin;
  return {
    predicted:accepted ? top1.id : '__other__',
    accepted,
    top1,
    top2,
    margin,
    scores,
    thresholds:{ ...customThresholds }
  };
};

const evaluateRows = (rows, vectors, customThresholds) => rows.map((row, index) => {
  const result = classifyVector(vectors[index], customThresholds);
  return {
    ...row,
    ...result,
    correct:result.predicted === row.label
  };
});

const summarize = (results) => {
  const known = results.filter((row) => row.label !== '__other__');
  const other = results.filter((row) => row.label === '__other__');
  const acceptedKnown = known.filter((row) => row.accepted);
  const correctAcceptedKnown = acceptedKnown.filter((row) => row.predicted === row.label);
  const rejectedOther = other.filter((row) => !row.accepted);
  const exact = results.filter((row) => row.correct);
  return {
    total:results.length,
    exactAccuracy:exact.length / Math.max(1, results.length),
    knownCoverage:acceptedKnown.length / Math.max(1, known.length),
    acceptedKnownAccuracy:correctAcceptedKnown.length / Math.max(1, acceptedKnown.length),
    otherRejectionRate:rejectedOther.length / Math.max(1, other.length),
    falseActivationRate:(other.length - rejectedOther.length) / Math.max(1, other.length),
    knownCount:known.length,
    otherCount:other.length,
    acceptedKnownCount:acceptedKnown.length,
    correctAcceptedKnownCount:correctAcceptedKnown.length
  };
};

const calibrateThresholds = (rows, vectors) => {
  let best = null;
  for (let score = 0.40; score <= 0.85 + 1e-9; score += 0.025) {
    for (let margin = 0; margin <= 0.25 + 1e-9; margin += 0.025) {
      const candidate = { minScore:Number(score.toFixed(3)), minMargin:Number(margin.toFixed(3)) };
      const results = evaluateRows(rows, vectors, candidate);
      const metrics = summarize(results);
      const strictOk = metrics.acceptedKnownAccuracy >= 0.98 && metrics.falseActivationRate <= 0.05;
      const utility = metrics.knownCoverage * 4 + metrics.acceptedKnownAccuracy * 3 + metrics.otherRejectionRate * 3 - metrics.falseActivationRate * 6;
      const record = { ...candidate, metrics, strictOk, utility };
      if (!best) best = record;
      else if (record.strictOk && !best.strictOk) best = record;
      else if (record.strictOk === best.strictOk) {
        if (record.strictOk) {
          if (record.metrics.knownCoverage > best.metrics.knownCoverage + 1e-9) best = record;
          else if (Math.abs(record.metrics.knownCoverage - best.metrics.knownCoverage) < 1e-9 && record.metrics.otherRejectionRate > best.metrics.otherRejectionRate + 1e-9) best = record;
        } else if (record.utility > best.utility) best = record;
      }
    }
  }
  return best;
};

const loadModel = async (progressCallback) => {
  await ensureData();
  if (!extractor) {
    extractor = await pipeline('feature-extraction', MODEL_ID, {
      dtype:MODEL_DTYPE,
      progress_callback:progressCallback
    });
  }
  return { modelId:MODEL_ID, dtype:MODEL_DTYPE, routes:routeIds.length };
};

const train = async ({ onStage, onEmbeddingProgress } = {}) => {
  await ensureData();
  if (!extractor) throw new Error('请先加载模型');

  const trainRows = [...flattenPositives('train'), ...hardNegativeRows('train')];
  const validationRows = [...flattenPositives('validation'), ...hardNegativeRows('validation')];
  const allRows = [...trainRows, ...validationRows];

  onStage?.('embedding', `正在生成 ${allRows.length} 条训练/验证向量…`);
  const allVectors = await embedTexts(allRows.map((row) => row.text), { onProgress:onEmbeddingProgress });
  const trainVectors = allVectors.slice(0, trainRows.length);
  const validationVectors = allVectors.slice(trainRows.length);

  onStage?.('training', `正在训练 ${routeIds.length} 个 one-vs-rest Logistic Regression 分类头…`);
  heads = {};
  for (let i = 0; i < routeIds.length; i += 1) {
    const routeId = routeIds[i];
    heads[routeId] = trainOneHead(routeId, trainRows, trainVectors);
    onStage?.('head', `已训练 ${i + 1}/${routeIds.length}：${routeId}`);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  onStage?.('calibration', '正在使用独立 validation 自动选择接受阈值…');
  const calibration = calibrateThresholds(validationRows, validationVectors);
  thresholds = { minScore:calibration.minScore, minMargin:calibration.minMargin };
  const validationResults = evaluateRows(validationRows, validationVectors, thresholds);
  const validationMetrics = summarize(validationResults);
  onStage?.('done', `训练完成：score≥${thresholds.minScore.toFixed(3)}，margin≥${thresholds.minMargin.toFixed(3)}`);
  return {
    trainCount:trainRows.length,
    validationCount:validationRows.length,
    routeCount:routeIds.length,
    thresholds:{ ...thresholds },
    validationMetrics,
    validationResults,
    strictCalibration:calibration.strictOk
  };
};

const classify = async (text, customThresholds) => {
  if (!heads) throw new Error('请先训练分类头');
  const [vector] = await embedTexts([text]);
  return classifyVector(vector, customThresholds || thresholds);
};

const runEvaluation = async ({ customThresholds, onProgress } = {}) => {
  await ensureData();
  if (!heads) throw new Error('请先训练分类头');
  const rows = [];
  for (const [label, texts] of Object.entries(evalData.samples || {})) {
    for (const text of texts) rows.push({ text, label });
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

export const semanticRouterPocV03 = {
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  get routes(){ return routeIds.map((id) => ({ id, title:ROUTE_TITLES[id] || id })); },
  get thresholds(){ return { ...thresholds }; },
  loadModel,
  train,
  classify,
  runEvaluation
};
