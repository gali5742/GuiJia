import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const WEIGHTS_URL = new URL('../data/semantic-router-weights-v0.1.json', import.meta.url);
const BLIND_URL = new URL('../data/liuyao-semantic-route-blind-eval-v0.2.json', import.meta.url);
const BLIND_PATCH_URL = new URL('../data/liuyao-semantic-route-blind-eval-v0.2-seal-patch.json', import.meta.url);

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
let weights = null;
let blindData = null;
let blindPatch = null;
const embeddingCache = new Map();

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};

const sigmoid = (x) => {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
};

const dot = (a, b) => {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += a[i] * b[i];
  return total;
};

const softmax = (logits) => {
  let max = -Infinity;
  for (const value of logits) if (value > max) max = value;
  const exps = new Float64Array(logits.length);
  let total = 0;
  for (let i = 0; i < logits.length; i += 1) {
    exps[i] = Math.exp(logits[i] - max);
    total += exps[i];
  }
  const probs = new Float64Array(logits.length);
  for (let i = 0; i < logits.length; i += 1) probs[i] = exps[i] / Math.max(total, 1e-12);
  return probs;
};

const tensorToVectors = (tensor, count) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || 512;
  if (hidden !== weights.encoder.vectorSize) throw new Error(`向量维度不一致：${hidden} != ${weights.encoder.vectorSize}`);
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

const validateWeights = (artifact) => {
  if (artifact?.version !== '0.1' || artifact?.status !== 'frozen') throw new Error('静态语义权重不是 frozen v0.1');
  if (artifact?.architecture !== 'bge-multinomial-route-route-conditioned-logistic') throw new Error('静态语义权重架构不匹配');
  if (artifact?.encoder?.modelId !== 'Xenova/bge-small-zh-v1.5' || artifact?.encoder?.dtype !== 'q8') throw new Error('静态权重 encoder 配置不匹配');
  if (!Array.isArray(artifact?.routeIds) || artifact.routeIds.length !== 15) throw new Error('静态权重 route 数量异常');
  for (const routeId of artifact.routeIds) {
    const gate = artifact.gates?.[routeId];
    if (!gate || !Array.isArray(gate.weights) || gate.weights.length !== artifact.encoder.vectorSize) throw new Error(`静态权重缺少 gate: ${routeId}`);
  }
};

const ensureWeights = async () => {
  if (!weights) {
    const artifact = await fetchJson(WEIGHTS_URL);
    validateWeights(artifact);
    weights = artifact;
  }
  return weights;
};

const embedTexts = async (texts, { chunkSize=24, onProgress } = {}) => {
  if (!extractor || !weights) throw new Error('请先加载静态语义路由器');
  const missing = [...new Set(texts)].filter((text) => !embeddingCache.has(text));
  for (let start = 0; start < missing.length; start += chunkSize) {
    const chunk = missing.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:weights.encoder.pooling, normalize:weights.encoder.normalize });
    const vectors = tensorToVectors(output, chunk.length);
    chunk.forEach((text, index) => embeddingCache.set(text, vectors[index]));
    onProgress?.(Math.min(start + chunk.length, missing.length), missing.length);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return texts.map((text) => embeddingCache.get(text));
};

const routeScores = (vector) => {
  const logits = new Float64Array(weights.routeIds.length);
  for (let i = 0; i < weights.routeIds.length; i += 1) {
    logits[i] = dot(weights.routeHead.weights[i], vector) + weights.routeHead.biases[i];
  }
  const probs = softmax(logits);
  return weights.routeIds.map((id, index) => ({ id, title:ROUTE_TITLES[id] || id, score:probs[index] })).sort((a, b) => b.score - a.score);
};

const classifyVector = (vector) => {
  const scores = routeScores(vector);
  const top1 = scores[0];
  const top2 = scores[1];
  const gate = weights.gates[top1.id];
  const gateScore = sigmoid(dot(gate.weights, vector) + gate.bias);
  const accepted = gateScore >= gate.threshold;
  return {
    accepted,
    predicted:accepted ? top1.id : '__unresolved__',
    top1,
    top2,
    routeMargin:top1.score - top2.score,
    gateScore,
    gateThreshold:gate.threshold,
    scores
  };
};

const load = async (progressCallback) => {
  await ensureWeights();
  if (!extractor) {
    extractor = await pipeline('feature-extraction', weights.encoder.modelId, {
      dtype:weights.encoder.dtype,
      progress_callback:progressCallback
    });
  }
  return {
    weightsVersion:weights.version,
    architecture:weights.architecture,
    modelId:weights.encoder.modelId,
    dtype:weights.encoder.dtype,
    routes:weights.routeIds.length,
    training:{ ...weights.training }
  };
};

const classify = async (text) => {
  const normalized = String(text || '').trim();
  if (!normalized) throw new Error('请输入占问文本');
  if (!extractor) throw new Error('请先加载静态语义路由器');
  const [vector] = await embedTexts([normalized]);
  return classifyVector(vector);
};

const ensureBlind = async () => {
  if (!blindData || !blindPatch) {
    [blindData, blindPatch] = await Promise.all([fetchJson(BLIND_URL), fetchJson(BLIND_PATCH_URL)]);
    if (blindData.version !== '0.2' || blindData.status !== 'sealed') throw new Error('Blind Eval v0.2 未处于 sealed 状态');
    if (blindPatch.version !== '0.2-seal-patch' || blindPatch.status !== 'sealed') throw new Error('Blind Eval seal patch 状态异常');
  }
};

const applyBlindPatch = (text) => blindPatch.replacements?.[text] || text;

const blindRows = async () => {
  await ensureBlind();
  const rows = [];
  for (const routeId of weights.routeIds) {
    for (const rawText of blindData.samples?.[routeId] || []) rows.push({ text:applyBlindPatch(rawText), expected:routeId, category:'known_route' });
  }
  for (const rawText of blindData.samples?.__out_of_scope__ || []) rows.push({ text:applyBlindPatch(rawText), expected:'__out_of_scope__', category:'out_of_scope' });
  for (const rawText of blindData.samples?.__underspecified__ || []) rows.push({ text:applyBlindPatch(rawText), expected:'__underspecified__', category:'underspecified' });
  return rows;
};

const summarizeBlind = (results) => {
  const known = results.filter((row) => row.category === 'known_route');
  const out = results.filter((row) => row.category === 'out_of_scope');
  const under = results.filter((row) => row.category === 'underspecified');
  const acceptedKnown = known.filter((row) => row.accepted);
  const correctAcceptedKnown = acceptedKnown.filter((row) => row.predicted === row.expected);
  const routeCorrectKnown = known.filter((row) => row.top1.id === row.expected);
  const outRejected = out.filter((row) => !row.accepted);
  const underRejected = under.filter((row) => !row.accepted);
  const safeCorrect = correctAcceptedKnown.length + outRejected.length + underRejected.length;
  return {
    total:results.length,
    knownCount:known.length,
    outOfScopeCount:out.length,
    underspecifiedCount:under.length,
    routeKnownTop1Accuracy:routeCorrectKnown.length / Math.max(1, known.length),
    knownCoverage:acceptedKnown.length / Math.max(1, known.length),
    acceptedKnownAccuracy:correctAcceptedKnown.length / Math.max(1, acceptedKnown.length),
    outOfScopeRejectionRate:outRejected.length / Math.max(1, out.length),
    falseActivationRate:(out.length - outRejected.length) / Math.max(1, out.length),
    underspecifiedRejectionRate:underRejected.length / Math.max(1, under.length),
    underspecifiedActivationRate:(under.length - underRejected.length) / Math.max(1, under.length),
    safeOverallAccuracy:safeCorrect / Math.max(1, results.length)
  };
};

const runBlindEvaluation = async ({ onProgress } = {}) => {
  if (!extractor) throw new Error('请先加载静态语义路由器');
  const rows = await blindRows();
  const vectors = [];
  const chunkSize = 20;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    vectors.push(...await embedTexts(chunk.map((row) => row.text)));
    onProgress?.(Math.min(start + chunk.length, rows.length), rows.length);
  }
  const results = rows.map((row, index) => ({ ...row, ...classifyVector(vectors[index]) }));
  return { metrics:summarizeBlind(results), results };
};

export const semanticRouterRuntimeV01 = {
  load,
  classify,
  runBlindEvaluation,
  get weightsMeta(){
    if (!weights) return null;
    return { version:weights.version, architecture:weights.architecture, encoder:{ ...weights.encoder }, routeIds:[...weights.routeIds], training:{ ...weights.training } };
  }
};
