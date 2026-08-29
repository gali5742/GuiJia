import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const TRAIN_BASE_URL = new URL('../data/liuyao-semantic-route-training-v0.1.json', import.meta.url);
const TRAIN_AUG_URL = new URL('../data/liuyao-semantic-route-training-v0.2-augmentation.json', import.meta.url);
const TRAIN_TARGETED_URL = new URL('../data/liuyao-semantic-route-training-v0.3-targeted.json', import.meta.url);
const TRAIN_EXPANSION_URL = new URL('../data/liuyao-semantic-route-training-v0.4-expansion.json', import.meta.url);
const INVENTORY_URL = new URL('../data/liuyao-semantic-route-inventory-v0.2.json', import.meta.url);

const ROUTE_TITLES = Object.freeze({
  financial_fortune:'阶段 / 长期财运',
  business_operation:'经营盈利',
  commercial_transaction:'商业交易成交',
  inventory_purchase:'经营进货 / 补库存',
  inventory_sale:'库存销售 / 出货',
  borrow_money:'借入 / 贷款获批',
  lend_money:'我方出借',
  debt_collection:'讨债 / 收回应收款',
  debt_repayment:'偿债 / 还清贷款',
  partnership:'合伙经营',
  investment_profit:'投资盈利',
  investment_liquidation:'投资卖出 / 套现',
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
let inventoryData = null;
let routeIds = [];
let routeHead = null;
let localGateHeads = null;
let logisticThresholds = null;
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
  if (hidden !== VECTOR_SIZE) throw new Error(`BGE vector size mismatch: ${hidden} != ${VECTOR_SIZE}`);
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

const mergeTraining = (base, augmentation, targeted, expansion, inventory) => {
  const ids = (inventory.routes || []).map((row) => row.routeId);
  if (ids.length !== 22) throw new Error(`route inventory != 22: ${ids.length}`);
  const routes = {};
  for (const id of ids) {
    if (base.routes?.[id]) {
      if (!augmentation.routes?.[id]) throw new Error(`augmentation 缺少旧 route: ${id}`);
      const focused = targeted.routes?.[id] || { train:[], validation:[] };
      routes[id] = {
        train:[...(base.routes[id].train || []), ...(augmentation.routes[id].train || []), ...(focused.train || [])],
        validation:[...(base.routes[id].validation || []), ...(augmentation.routes[id].validation || []), ...(focused.validation || [])]
      };
      continue;
    }
    const expanded = expansion.routes?.[id];
    if (!expanded) throw new Error(`v0.4 expansion 缺少新增 route: ${id}`);
    routes[id] = {
      train:[...(expanded.train || [])],
      validation:[...(expanded.validation || [])]
    };
  }
  return {
    version:'0.7-combined-22-route',
    routes,
    hardNegatives:{
      train:[...(base.hardNegatives?.train || []), ...(augmentation.hardNegatives?.train || []), ...(targeted.hardNegatives?.train || []), ...(expansion.hardNegatives?.train || [])],
      validation:[...(base.hardNegatives?.validation || []), ...(augmentation.hardNegatives?.validation || []), ...(targeted.hardNegatives?.validation || []), ...(expansion.hardNegatives?.validation || [])]
    }
  };
};

const ensureData = async () => {
  if (!trainingData || !inventoryData) {
    const [base, augmentation, targeted, expansion, inventory] = await Promise.all([
      fetchJson(TRAIN_BASE_URL), fetchJson(TRAIN_AUG_URL), fetchJson(TRAIN_TARGETED_URL), fetchJson(TRAIN_EXPANSION_URL), fetchJson(INVENTORY_URL)
    ]);
    if (inventory.version !== '0.2' || inventory.status !== 'draft_inventory') throw new Error('Semantic Router route inventory must be draft v0.2');
    trainingData = mergeTraining(base, augmentation, targeted, expansion, inventory);
    inventoryData = inventory;
  }
  routeIds = (inventoryData.routes || []).map((row) => row.routeId);
  return { trainingData, inventoryData };
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

const routeScores = (vector) => {
  if (!routeHead) throw new Error('Route classifier 尚未训练');
  const logits = new Float64Array(routeIds.length);
  for (let c = 0; c < routeIds.length; c += 1) logits[c] = dot(routeHead.weights[c], vector) + routeHead.biases[c];
  const probs = softmax(logits);
  return routeIds.map((id, index) => ({ id, title:ROUTE_TITLES[id] || id, score:probs[index] })).sort((a, b) => b.score - a.score);
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
const logisticScore = (routeId, vector) => {
  const head = localGateHeads?.[routeId];
  if (!head) throw new Error(`缺少局部 Gate: ${routeId}`);
  return sigmoid(dot(head.weights, vector) + head.bias);
};
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

const classifyVector = (vector) => {
  if (!routeHead || !localGateHeads || !logisticThresholds) throw new Error('请先训练 v0.7');
  const scores = routeScores(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const routeMargin = top1.score - top2.score;
  const gateScore = logisticScore(top1.id, vector);
  const threshold = logisticThresholds[top1.id].threshold;
  const accepted = gateScore >= threshold;
  return { top1, top2, routeMargin, scores, gate:{ score:gateScore, threshold, accepted, predicted:accepted ? top1.id : '__other__' } };
};
const evaluateRows = (rows, vectors) => rows.map((row, index) => {
  const result = classifyVector(vectors[index]);
  return { ...row, ...result, correct:result.gate.predicted === row.label };
});
const summarize = (results) => {
  const known = results.filter((row) => row.label !== '__other__');
  const other = results.filter((row) => row.label === '__other__');
  const acceptedKnown = known.filter((row) => row.gate.accepted);
  const correctAcceptedKnown = acceptedKnown.filter((row) => row.gate.predicted === row.label);
  const rejectedOther = other.filter((row) => !row.gate.accepted);
  const routeCorrectKnown = known.filter((row) => row.top1.id === row.label);
  const exact = results.filter((row) => row.correct);
  return {
    total:results.length,
    exactAccuracy:exact.length / Math.max(1, results.length),
    knownCoverage:acceptedKnown.length / Math.max(1, known.length),
    acceptedKnownAccuracy:correctAcceptedKnown.length / Math.max(1, acceptedKnown.length),
    otherRejectionRate:rejectedOther.length / Math.max(1, other.length),
    falseActivationRate:(other.length - rejectedOther.length) / Math.max(1, other.length),
    routeKnownTop1Accuracy:routeCorrectKnown.length / Math.max(1, known.length),
    knownCount:known.length,
    otherCount:other.length,
    acceptedKnownCount:acceptedKnown.length,
    correctAcceptedKnownCount:correctAcceptedKnown.length
  };
};
const summarizeByRoute = (results) => routeIds.map((routeId) => {
  const rows = results.filter((row) => row.label === routeId);
  const accepted = rows.filter((row) => row.gate.accepted);
  const correctAccepted = accepted.filter((row) => row.gate.predicted === routeId);
  const top1Correct = rows.filter((row) => row.top1.id === routeId);
  const wrong = rows.filter((row) => row.gate.predicted !== routeId);
  const confusions = {};
  for (const row of wrong) confusions[row.gate.predicted] = (confusions[row.gate.predicted] || 0) + 1;
  return {
    routeId,
    title:ROUTE_TITLES[routeId] || routeId,
    count:rows.length,
    top1Accuracy:top1Correct.length / Math.max(1, rows.length),
    coverage:accepted.length / Math.max(1, rows.length),
    acceptedAccuracy:correctAccepted.length / Math.max(1, accepted.length),
    exactAccuracy:rows.filter((row) => row.correct).length / Math.max(1, rows.length),
    confusions
  };
});

const loadModel = async (progressCallback) => {
  await ensureData();
  if (!extractor) extractor = await pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:progressCallback });
  return { modelId:MODEL_ID, dtype:MODEL_DTYPE, routes:routeIds.length, inventoryVersion:inventoryData.version };
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

  onStage?.('route', `正在训练 ${routeIds.length} 类 Multinomial Route classifier…`);
  routeHead = trainMultinomialRouteHead(trainPositives, trainPositiveVectors);
  await new Promise((resolve) => setTimeout(resolve, 0));

  onStage?.('logistic', `正在训练 ${routeIds.length} 个 route-conditioned Logistic Acceptance Gate…`);
  localGateHeads = {};
  for (let i = 0; i < routeIds.length; i += 1) {
    const routeId = routeIds[i];
    localGateHeads[routeId] = trainLocalGate(routeId, trainRows, trainVectors);
    if ((i + 1) % 3 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }

  onStage?.('calibration', '正在用 validation 分 route 校准 acceptance threshold…');
  const validationRoutePredictions = validationVectors.map((vector) => {
    const scores = routeScores(vector);
    return { top1:scores[0], top2:scores[1] };
  });
  logisticThresholds = {};
  for (const routeId of routeIds) {
    const localRows = localCalibrationRows(routeId, validationRows, validationVectors, validationRoutePredictions);
    const positives = [];
    const negatives = [];
    for (const item of localRows) {
      const score = logisticScore(routeId, item.vector);
      (item.positive ? positives : negatives).push(score);
    }
    logisticThresholds[routeId] = chooseThreshold(positives, negatives, { defaultThreshold:0.5 });
  }

  const validationResults = evaluateRows(validationRows, validationVectors);
  const validationMetrics = summarize(validationResults);
  const validationByRoute = summarizeByRoute(validationResults);
  onStage?.('done', '训练完成：冻结 v0.6 架构 + 22-route expansion corpus');
  return {
    trainCount:trainRows.length,
    trainPositiveCount:trainPositives.length,
    trainOtherCount:trainNegatives.length,
    validationCount:validationRows.length,
    validationPositiveCount:validationPositives.length,
    validationOtherCount:validationNegatives.length,
    routeCount:routeIds.length,
    validationMetrics,
    validationByRoute,
    validationResults,
    logisticThresholds
  };
};
const classify = async (text) => {
  if (!routeHead || !localGateHeads) throw new Error('请先训练 v0.7');
  const normalized = String(text || '').trim();
  if (!normalized) throw new Error('请输入占问文本');
  const [vector] = await embedTexts([normalized]);
  return classifyVector(vector);
};

export const semanticRouterPocV07 = {
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  version:'0.7',
  get routes(){ return routeIds.map((id) => ({ id, title:ROUTE_TITLES[id] || id })); },
  loadModel,
  train,
  classify
};
