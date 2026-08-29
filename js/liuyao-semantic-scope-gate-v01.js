import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const MODEL_DTYPE = 'q8';
const VECTOR_SIZE = 512;
const DATA_URL = new URL('../data/liuyao-semantic-scope-gate-v0.1-development.json', import.meta.url);
const PATCH_URL = new URL('../data/liuyao-semantic-scope-gate-v0.1-preuse-patch.json', import.meta.url);
const VERSION = '0.1-dev';

let extractor = null;
let data = null;
let dataPatch = null;
let gate = null;
let threshold = 0.5;
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
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const safeRatio = (n, d) => d ? n / d : NaN;
const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};
const tensorToVectors = (tensor, count) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || VECTOR_SIZE;
  if (hidden !== VECTOR_SIZE) throw new Error(`BGE vector size mismatch: ${hidden} != ${VECTOR_SIZE}`);
  const batch = count || dims[0] || 1;
  const raw = tensor?.data || [];
  const vectors = [];
  for (let row = 0; row < batch; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let col = 0; col < hidden; col += 1) vector[col] = Number(raw[offset + col] || 0);
    vectors.push(vector);
  }
  return vectors;
};

const ensureData = async () => {
  if (!data) {
    [data, dataPatch] = await Promise.all([fetchJson(DATA_URL), fetchJson(PATCH_URL)]);
    if (data.version !== '0.1-development' || data.status !== 'development_preuse') throw new Error('Scope Gate v0.1 development data mismatch');
    if (data.scope !== 'liuyao_current_22_router_only') throw new Error('Scope Gate scope mismatch');
    if (data.policy?.useRouterConfidenceFeatures !== false || data.policy?.useUnresolvedAsNegativeTraining !== false) throw new Error('Scope Gate responsibility policy mismatch');
    if (dataPatch.version !== '0.1-preuse-wording-patch' || dataPatch.status !== 'development_preuse_patch' || dataPatch.base !== 'liuyao-semantic-scope-gate-v0.1-development.json') throw new Error('Scope Gate v0.1 wording patch mismatch');
  }
  return data;
};
const effectiveText = (text) => dataPatch?.replacements?.[text] || text;

const embedTexts = async (texts, { chunkSize=24, onProgress } = {}) => {
  if (!extractor) throw new Error('BGE 尚未加载');
  const unique = [...new Set(texts)];
  const missing = unique.filter((text) => !embeddingCache.has(text));
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

const flattenSplit = async (split) => {
  await ensureData();
  const rows = [];
  let index = 1;
  for (const [routeId, spec] of Object.entries(data.supported || {})) {
    for (const raw of spec[split] || []) rows.push({
      id:`SG-${split}-${String(index++).padStart(3,'0')}`,
      text:effectiveText(raw),
      supported:true,
      groupType:'route',
      groupId:routeId
    });
  }
  for (const [category, spec] of Object.entries(data.outside_current_22 || {})) {
    for (const raw of spec[split] || []) rows.push({
      id:`SG-${split}-${String(index++).padStart(3,'0')}`,
      text:effectiveText(raw),
      supported:false,
      groupType:'outside_category',
      groupId:category
    });
  }
  return rows;
};

const trainLogistic = (rows, vectors, { epochs=360, learningRate=0.42, l2=0.0015 } = {}) => {
  const weights = new Float32Array(VECTOR_SIZE);
  let bias = 0;
  const grad = new Float64Array(VECTOR_SIZE);
  for (let epoch = 0; epoch < epochs; epoch += 1) {
    grad.fill(0);
    let gradBias = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const y = rows[i].supported ? 1 : 0;
      const p = sigmoid(dot(weights, vectors[i]) + bias);
      const error = p - y;
      gradBias += error;
      for (let j = 0; j < VECTOR_SIZE; j += 1) grad[j] += error * vectors[i][j];
    }
    const lr = learningRate / (1 + epoch * 0.01);
    const scale = 1 / rows.length;
    for (let j = 0; j < VECTOR_SIZE; j += 1) weights[j] -= lr * (grad[j] * scale + l2 * weights[j]);
    bias -= lr * gradBias * scale;
  }
  return { weights, bias };
};

const probabilityFromVector = (vector) => {
  if (!gate) throw new Error('Scope Gate 尚未训练');
  return sigmoid(dot(gate.weights, vector) + gate.bias);
};

const statsAt = (rows, candidateThreshold) => {
  const supported = rows.filter((row) => row.supported);
  const outside = rows.filter((row) => !row.supported);
  const supportedRecall = safeRatio(supported.filter((row) => row.probability >= candidateThreshold).length, supported.length);
  const outsideRejection = safeRatio(outside.filter((row) => row.probability < candidateThreshold).length, outside.length);
  return {
    threshold:candidateThreshold,
    supportedRecall,
    outsideRejection,
    balancedAccuracy:(supportedRecall + outsideRejection) / 2,
    minSide:Math.min(supportedRecall, outsideRejection)
  };
};

const calibrateThreshold = (rows) => {
  const values = [...new Set(rows.map((row) => row.probability))].sort((a,b)=>a-b);
  const candidates = [0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95];
  for (const value of values) candidates.push(value);
  for (let i = 0; i + 1 < values.length; i += 1) candidates.push((values[i] + values[i + 1]) / 2);
  const unique = [...new Set(candidates.filter((v)=>v>0&&v<1))].sort((a,b)=>a-b);
  let best = null;
  for (const candidate of unique) {
    const current = statsAt(rows, candidate);
    if (!best || current.balancedAccuracy > best.balancedAccuracy + 1e-12 ||
      (Math.abs(current.balancedAccuracy - best.balancedAccuracy) <= 1e-12 && current.minSide > best.minSide + 1e-12) ||
      (Math.abs(current.balancedAccuracy - best.balancedAccuracy) <= 1e-12 && Math.abs(current.minSide - best.minSide) <= 1e-12 && current.outsideRejection > best.outsideRejection + 1e-12)) {
      best = current;
    }
  }
  return best;
};

const enrichRows = async (rows, { onProgress, label='embed' } = {}) => {
  const vectors = await embedTexts(rows.map((row)=>row.text), {
    onProgress:(done,total)=>onProgress?.(done,total,label)
  });
  return rows.map((row,index)=>({ ...row, vector:vectors[index] }));
};

const train = async ({ onProgress } = {}) => {
  await ensureData();
  const trainRows = await enrichRows(await flattenSplit('train'), { onProgress, label:'train embedding' });
  gate = trainLogistic(trainRows, trainRows.map((row)=>row.vector));
  const calibrationRows = await enrichRows(await flattenSplit('calibration'), { onProgress, label:'calibration embedding' });
  for (const row of calibrationRows) row.probability = probabilityFromVector(row.vector);
  const calibration = calibrateThreshold(calibrationRows);
  threshold = calibration.threshold;
  return {
    version:VERSION,
    threshold,
    trainCount:trainRows.length,
    calibrationCount:calibrationRows.length,
    calibration
  };
};

const summarizeGroups = (rows, predicate) => {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.groupId)) groups.set(row.groupId, []);
    groups.get(row.groupId).push(row);
  }
  return [...groups.entries()].map(([groupId, groupRows]) => ({
    groupId,
    n:groupRows.length,
    accuracy:safeRatio(groupRows.filter(predicate).length, groupRows.length),
    meanProbability:groupRows.reduce((sum,row)=>sum+row.probability,0)/groupRows.length
  }));
};

const runValidation = async ({ onProgress } = {}) => {
  if (!gate) throw new Error('请先训练并校准 Scope Gate');
  const rows = await enrichRows(await flattenSplit('validation'), { onProgress, label:'validation embedding' });
  for (const row of rows) {
    row.probability = probabilityFromVector(row.vector);
    row.accepted = row.probability >= threshold;
    row.correct = row.accepted === row.supported;
  }
  const summary = statsAt(rows, threshold);
  return {
    version:VERSION,
    threshold,
    ...summary,
    overallExact:safeRatio(rows.filter((row)=>row.correct).length, rows.length),
    falseActivation:1-summary.outsideRejection,
    supportedByRoute:summarizeGroups(rows.filter((row)=>row.supported), (row)=>row.accepted),
    outsideByCategory:summarizeGroups(rows.filter((row)=>!row.supported), (row)=>!row.accepted),
    rows
  };
};

const runUnresolvedDiagnostic = async ({ onProgress } = {}) => {
  if (!gate) throw new Error('请先训练并校准 Scope Gate');
  await ensureData();
  const texts = (data.diagnostic_unresolved || []).map(effectiveText);
  const vectors = await embedTexts(texts, { onProgress:(done,total)=>onProgress?.(done,total,'unresolved diagnostic') });
  const rows = texts.map((text,index)=>{
    const probability = probabilityFromVector(vectors[index]);
    return {
      id:`SG-diagnostic-${String(index+1).padStart(3,'0')}`,
      text,
      probability,
      scopeAccepted:probability>=threshold
    };
  });
  return {
    count:rows.length,
    scopeAcceptedCount:rows.filter((row)=>row.scopeAccepted).length,
    meanProbability:rows.reduce((sum,row)=>sum+row.probability,0)/Math.max(1,rows.length),
    rows
  };
};

export const semanticScopeGateV01 = Object.freeze({
  version:VERSION,
  loadModel:async(onProgress)=>{
    if (!extractor) extractor = await pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:onProgress });
    return { model:MODEL_ID, dtype:MODEL_DTYPE, vectorSize:VECTOR_SIZE };
  },
  train,
  runValidation,
  runUnresolvedDiagnostic,
  flattenSplit,
  classifyScope:async(text)=>{
    if (!gate) throw new Error('请先训练并校准 Scope Gate');
    const [vector] = await embedTexts([String(text||'')]);
    const probability = probabilityFromVector(vector);
    return { probability, accepted:probability>=threshold, threshold };
  }
});
