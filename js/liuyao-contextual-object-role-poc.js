import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const DATA_URL = new URL('../data/liuyao-contextual-object-role-training-v0.2.json', import.meta.url);
const PATCH_URL = new URL('../data/liuyao-contextual-object-role-training-v0.2-seal-patch.json', import.meta.url);
const LABELS = Object.freeze(['investment_target_role','purchase_target_role','delivery_target_role','no_supported_role']);
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
  const raw = tensor?.data || [];
  const vectors = [];
  for (let row = 0; row < batch; row += 1) {
    const offset = row * hidden;
    const vector = new Float32Array(hidden);
    for (let col = 0; col < hidden; col += 1) vector[col] = Number(raw[offset + col] || 0);
    vectors.push(vector);
  }
  return vectors;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};

const applySealPatch = (source, patch) => {
  const clone = JSON.parse(JSON.stringify(source));
  const replacements = new Map((patch?.replacements || []).map((item) => [String(item.from || ''), String(item.to || '')]));
  let applied = 0;
  for (const group of Object.values(clone.labels || {})) {
    for (const split of ['train','validation']) {
      for (const sample of group?.[split] || []) {
        const replacement = replacements.get(String(sample.context || ''));
        if (replacement) {
          sample.context = replacement;
          applied += 1;
        }
      }
    }
  }
  if (applied !== replacements.size) throw new Error(`Contextual Object Role seal patch 只应用 ${applied}/${replacements.size} 条`);
  clone.sealPatch = { version:patch?.version || null, applied };
  return clone;
};

const ensureData = async () => {
  if (!data) {
    const [base, patch] = await Promise.all([fetchJson(DATA_URL), fetchJson(PATCH_URL)]);
    data = applySealPatch(base, patch);
  }
  return data;
};

const composeInput = (entity, context) => `对象候选：${String(entity || '').trim()}。当前问题：${String(context || '').trim()}`;

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

const trainMultinomial = (rows, vectors, { epochs=280, learningRate=0.82, l2=0.0007 } = {}) => {
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

const scoresForVector = (vector) => {
  if (!head) throw new Error('Contextual Object Role classifier 尚未训练');
  const logits = new Float64Array(LABELS.length);
  for (let c = 0; c < LABELS.length; c += 1) logits[c] = dot(head.weights[c], vector) + head.biases[c];
  const probs = softmax(logits);
  return LABELS.map((id, index) => ({ id, score:probs[index] })).sort((a, b) => b.score - a.score);
};

const chooseThreshold = (label, rows, vectors) => {
  if (label === 'no_supported_role') return 0;
  const positives = [];
  const negatives = [];
  for (let i = 0; i < rows.length; i += 1) {
    const score = scoresForVector(vectors[i]).find((item) => item.id === label)?.score || 0;
    (rows[i].label === label ? positives : negatives).push(score);
  }
  const values = [...positives, ...negatives].sort((a, b) => a - b);
  const candidates = new Set([0.35, 0.4, 0.45, 0.5, 0.55, 0.6]);
  for (let i = 0; i < values.length - 1; i += 1) candidates.add((values[i] + values[i + 1]) / 2);
  let best = null;
  for (const threshold of candidates) {
    const tp = positives.filter((score) => score >= threshold).length;
    const fp = negatives.filter((score) => score >= threshold).length;
    const recall = tp / Math.max(1, positives.length);
    const fpr = fp / Math.max(1, negatives.length);
    const precision = tp / Math.max(1, tp + fp);
    const strict = fpr <= 0.05;
    const utility = recall * 5 + precision * 5 + (1 - fpr) * 5;
    const record = { threshold, recall, fpr, precision, strict, utility };
    if (!best || (record.strict && !best.strict) || (record.strict === best.strict && record.utility > best.utility)) best = record;
  }
  return best?.threshold ?? 0.5;
};

const classifyVector = (vector) => {
  const scores = scoresForVector(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const margin = top1.score - top2.score;
  const threshold = thresholds?.[top1.id] ?? 0.5;
  const accepted = top1.id === 'no_supported_role' ? false : top1.score >= threshold && margin >= MIN_MARGIN;
  return {
    top1,
    top2,
    margin,
    threshold,
    accepted,
    role:accepted ? top1.id : 'no_supported_role',
    confidence:top1.score,
    scores
  };
};

const metrics = (rows, results) => {
  let top1Correct = 0;
  let knownTotal = 0;
  let roleAccepted = 0;
  let roleAcceptedCorrect = 0;
  let noneTotal = 0;
  let noneRejected = 0;
  let falseRoleActivation = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const result = results[i];
    if (result.top1.id === row.label) top1Correct += 1;
    if (row.label === 'no_supported_role') {
      noneTotal += 1;
      if (!result.accepted) noneRejected += 1;
      else falseRoleActivation += 1;
    } else {
      knownTotal += 1;
      if (result.accepted) {
        roleAccepted += 1;
        if (result.role === row.label) roleAcceptedCorrect += 1;
      }
    }
  }
  const allAccepted = roleAccepted + falseRoleActivation;
  return {
    top1Accuracy:top1Correct / Math.max(1, rows.length),
    knownRoleCoverage:roleAccepted / Math.max(1, knownTotal),
    acceptedKnownRoleAccuracy:roleAcceptedCorrect / Math.max(1, roleAccepted),
    noRoleRejection:noneRejected / Math.max(1, noneTotal),
    falseRoleActivation:falseRoleActivation / Math.max(1, noneTotal),
    acceptedDecisionPrecision:roleAcceptedCorrect / Math.max(1, allAccepted),
    knownTotal,
    noRoleTotal:noneTotal
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
  onStage?.('embedding', '生成 Contextual Object Role Train / Validation embeddings');
  const allTexts = [...trainRows, ...validationRows].map((row) => row.text);
  await embedTexts(allTexts, { onProgress:onEmbeddingProgress });
  const trainVectors = trainRows.map((row) => embeddingCache.get(row.text));
  const validationVectors = validationRows.map((row) => embeddingCache.get(row.text));
  onStage?.('training', '训练 4-class contextual role linear head');
  head = trainMultinomial(trainRows, trainVectors);
  onStage?.('calibration', '仅使用 Validation 校准三个可绑定 role 的阈值');
  thresholds = Object.fromEntries(LABELS.map((label) => [label, chooseThreshold(label, validationRows, validationVectors)]));
  const validationResults = validationVectors.map(classifyVector);
  const validationMetrics = metrics(validationRows, validationResults);
  onStage?.('done', 'Contextual Object Role PoC v0.2 已训练');
  return { trainCount:trainRows.length, validationCount:validationRows.length, thresholds, validationMetrics, validationRows, validationResults, sealPatch:data.sealPatch };
};

const classify = async (entity, context) => {
  if (!head || !thresholds) throw new Error('请先训练 Contextual Object Role PoC');
  const text = composeInput(entity, context);
  const [vector] = await embedTexts([text]);
  const result = classifyVector(vector);
  return {
    entity:String(entity || '').trim(),
    context:String(context || '').trim(),
    ...result,
    modelId:'guijia-contextual-object-role-poc-v0.2',
    prediction:{
      entity:String(entity || '').trim(),
      role:result.role,
      type:result.role,
      confidence:result.confidence,
      score:result.top1.score,
      margin:result.margin,
      threshold:result.threshold,
      accepted:result.accepted,
      modelId:'guijia-contextual-object-role-poc-v0.2'
    }
  };
};

export const contextualObjectRolePocV02 = Object.freeze({
  version:'0.2',
  task:'contextual_object_role',
  modelId:MODEL_ID,
  modelDtype:MODEL_DTYPE,
  labels:LABELS,
  minMargin:MIN_MARGIN,
  loadModel,
  train,
  classify
});
