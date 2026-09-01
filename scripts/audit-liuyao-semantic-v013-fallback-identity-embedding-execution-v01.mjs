import './verify-liuyao-semantic-fallback-identity-v01-model.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const sha256File = (relative) => crypto.createHash('sha256').update(readBytes(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = readBytes(relative);
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
};
const ratio = (n, d) => d ? n / d : 0;

const runtimePath = 'js/liuyao-semantic-router-runtime-v01.js';
const runtimeSource = fs.readFileSync(path.join(root, runtimePath), 'utf8');
if (!runtimeSource.includes('const [vector] = await embedTexts([normalized]);')) {
  throw new Error('Production semantic-router classify() no longer has the expected single-text embedding call');
}

const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');
const identityArtifact = readJson('data/liuyao-semantic-fallback-identity-v0.1-model.json');
const calibration = readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const calibrationRows = (calibration.rows || []).map((row, index) => ({
  id:row.id || `FI-CAL-${String(index + 1).padStart(3, '0')}`,
  text:String(row.text || '').trim()
}));
if (calibrationRows.length !== 134) throw new Error(`Fallback Identity calibration rows ${calibrationRows.length} != 134`);
if (identityArtifact.status !== 'frozen') throw new Error('Frozen Fallback Identity model required');
if (frozen.encoder?.vectorSize !== 512 || routeabilityModel.model?.weights?.length !== 512) throw new Error('Frozen learned dependency shape drift');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-routeability-v05.js',
  'js/liuyao-semantic-fallback-identity-v01.js',
  'js/liuyao-semantic-route-selection-v04.js',
  'js/liuyao-semantic-finalization-v01.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });

const G = context.GuiJia;
const evidenceExtractor = G?.liuyaoSemanticRouteEvidenceV03;
const arbitration = G?.liuyaoSemanticRouteArbitrationV012;
const routeability = G?.liuyaoSemanticRouteabilityV05;
const identityGate = G?.liuyaoSemanticFallbackIdentityV01;
const selection = G?.liuyaoSemanticRouteSelectionV04;
const finalization = G?.liuyaoSemanticFinalizationV01;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !routeability?.decide || !identityGate?.decide || !selection?.decide || !finalization?.finalize) {
  throw new Error('Candidate v0.3 deterministic runtime failed to load');
}

const dot = (weights, vector) => {
  let total = 0;
  for (let index = 0; index < weights.length; index += 1) total += weights[index] * vector[index];
  return total;
};
const sigmoid = (value) => value >= 0 ? 1 / (1 + Math.exp(-value)) : Math.exp(value) / (1 + Math.exp(value));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / Math.max(total, 1e-12));
};
const routerHead = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] })).sort((a, b) => b.score - a.score);
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score };
};
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias);
const scopeScore = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias);
  return {
    probability,
    hardVetoCutoff:frozen.semanticStackPolicy.hardVetoCutoff,
    hardVeto:probability < frozen.semanticStackPolicy.hardVetoCutoff
  };
};
const identityProbability = (routeId, vector) => {
  const head = identityArtifact.model?.heads?.[routeId];
  if (!head || head.weights?.length !== 512) throw new Error(`Missing frozen Identity head ${routeId}`);
  return sigmoid(dot(head.weights, vector) + head.bias);
};
const cosine = (a, b) => {
  let product = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    product += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return product / Math.max(Math.sqrt(aa * bb), 1e-12);
};
const maxAbsDelta = (a, b) => {
  let max = 0;
  for (let i = 0; i < a.length; i += 1) max = Math.max(max, Math.abs(a[i] - b[i]));
  return max;
};
const sameTop2Set = (a, b) => {
  const left = [a.top1.id, a.top2.id].sort().join('|');
  const right = [b.top1.id, b.top2.id].sort().join('|');
  return left === right;
};

const scoreStack = (row, vector) => {
  const head = routerHead(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const routeProbability = routeabilityProbability(vector);
  const routeabilityDecision = routeability.decide({ probability:routeProbability, arbitration:arb, evidence });
  const allIdentityProbabilities = Object.fromEntries(frozen.router.routeOrder.map((routeId) => [routeId, identityProbability(routeId, vector)]));
  let fallbackIdentityDecision = null;
  if (routeabilityDecision.disposition === 'route_known' && !arb?.routeId) {
    fallbackIdentityDecision = identityGate.decide({
      head,
      probabilities:allIdentityProbabilities,
      threshold:identityArtifact.calibration.threshold
    });
  }
  const selected = routeabilityDecision.disposition === 'route_known'
    ? selection.decide({
        arbitration:arb,
        head,
        evidence,
        routeabilityDisposition:'route_known',
        fallbackIdentityDecision
      })
    : null;
  const scope = scopeScore(vector);
  const final = finalization.finalize({
    routeability:routeabilityDecision,
    selection:selected,
    scope,
    arbitration:arb,
    evidence
  });
  return {
    head,
    routeProbability,
    routeabilityDecision,
    scope,
    allIdentityProbabilities,
    fallbackIdentityDecision,
    final
  };
};

const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`Embedding size ${hidden} != ${frozen.encoder.vectorSize}`);
  const raw = tensor.data;
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let i = 0; i < hidden; i += 1) vector[i] = Number(raw[offset + i]);
    vectors.push(vector);
  }
  return vectors;
};

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
  dtype:frozen.encoder.dtype,
  revision:frozen.encoder.revision
});

const singleVectors = [];
for (let i = 0; i < calibrationRows.length; i += 1) {
  const output = await extractor([calibrationRows[i].text], { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
  singleVectors.push(tensorToVectors(output, 1)[0]);
  if ((i + 1) % 20 === 0 || i + 1 === calibrationRows.length) console.log(`single embedded ${i + 1}/${calibrationRows.length}`);
}
const batchVectors = [];
for (let start = 0; start < calibrationRows.length; start += 24) {
  const chunk = calibrationRows.slice(start, start + 24);
  const output = await extractor(chunk.map((row) => row.text), { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
  batchVectors.push(...tensorToVectors(output, chunk.length));
  console.log(`batch24 embedded ${Math.min(start + chunk.length, calibrationRows.length)}/${calibrationRows.length}`);
}

const rows = calibrationRows.map((row, index) => {
  const singleVector = singleVectors[index];
  const batchVector = batchVectors[index];
  const single = scoreStack(row, singleVector);
  const batch = scoreStack(row, batchVector);
  let identityMaxDelta = 0;
  for (const routeId of frozen.router.routeOrder) {
    identityMaxDelta = Math.max(identityMaxDelta, Math.abs(single.allIdentityProbabilities[routeId] - batch.allIdentityProbabilities[routeId]));
  }
  const singleFallback = single.fallbackIdentityDecision;
  const batchFallback = batch.fallbackIdentityDecision;
  const fallbackKey = (value) => value ? `${value.status}:${value.routeId || ''}:${value.reasonCode || ''}` : 'not_reached';
  return {
    id:row.id,
    cosine:cosine(singleVector, batchVector),
    maxAbsVectorDelta:maxAbsDelta(singleVector, batchVector),
    routerTop1Changed:single.head.top1.id !== batch.head.top1.id,
    routerTop2SetChanged:!sameTop2Set(single.head, batch.head),
    routeabilityDispositionChanged:single.routeabilityDecision.disposition !== batch.routeabilityDecision.disposition,
    routeabilityReasonChanged:single.routeabilityDecision.reasonCode !== batch.routeabilityDecision.reasonCode,
    scopeHardVetoChanged:single.scope.hardVeto !== batch.scope.hardVeto,
    identityMaxProbabilityDelta:identityMaxDelta,
    fallbackIdentityDecisionChanged:fallbackKey(singleFallback) !== fallbackKey(batchFallback),
    finalDispositionOrRouteChanged:single.final.disposition !== batch.final.disposition || single.final.routeId !== batch.final.routeId,
    finalReasonChanged:single.final.reasonCode !== batch.final.reasonCode
  };
});

const cosines = rows.map((row) => row.cosine);
const vectorDeltas = rows.map((row) => row.maxAbsVectorDelta);
const identityDeltas = rows.map((row) => row.identityMaxProbabilityDelta);
const changedIds = (key) => rows.filter((row) => row[key]).map((row) => row.id);
const report = {
  version:'0.13-fallback-identity-v0.1-embedding-execution-audit-v0.1',
  status:'architecture_only_execution_audit',
  scope:'liuyao_semantic_current22',
  policy:{
    training:false,
    calibration:false,
    thresholdSelection:false,
    modelMutation:false,
    candidatePromotionEvidence:false,
    sourceCorpus:'already_consumed_sealed_fallback_identity_calibration_only'
  },
  executionContractObserved:{
    productionRuntime:{
      path:runtimePath,
      gitBlobSha:gitBlobSha(runtimePath),
      classifyEmbeddingCall:'embedTexts([normalized])',
      effectiveEncoderBatchSizeForNormalClassify:1
    },
    frozenTrainingAndCalibration:{
      script:'scripts/train-and-calibrate-liuyao-semantic-fallback-identity-v01.mjs',
      embeddingChunkSize:24
    }
  },
  frozenInputs:{
    calibration:{ path:'data/liuyao-semantic-fallback-identity-v0.1-calibration.json', sha256:sha256File('data/liuyao-semantic-fallback-identity-v0.1-calibration.json'), rows:calibrationRows.length },
    identityModel:{ path:'data/liuyao-semantic-fallback-identity-v0.1-model.json', sha256:sha256File('data/liuyao-semantic-fallback-identity-v0.1-model.json') },
    frozenDependencies:{ path:'data/liuyao-semantic-frozen-dependencies-v0.1.json', sha256:sha256File('data/liuyao-semantic-frozen-dependencies-v0.1.json') },
    routeabilityModel:{ path:'data/liuyao-semantic-routeability-v0.2.json', sha256:sha256File('data/liuyao-semantic-routeability-v0.2.json') }
  },
  metrics:{
    rows:rows.length,
    cosine:{ min:Math.min(...cosines), mean:cosines.reduce((a, b) => a + b, 0) / cosines.length, max:Math.max(...cosines) },
    maxAbsVectorDelta:Math.max(...vectorDeltas),
    cosineBelow:{
      '0.9999':rows.filter((row) => row.cosine < 0.9999).length,
      '0.999':rows.filter((row) => row.cosine < 0.999).length,
      '0.995':rows.filter((row) => row.cosine < 0.995).length
    },
    routerTop1Changes:changedIds('routerTop1Changed').length,
    routerTop2SetChanges:changedIds('routerTop2SetChanged').length,
    routeabilityDispositionChanges:changedIds('routeabilityDispositionChanged').length,
    routeabilityReasonChanges:changedIds('routeabilityReasonChanged').length,
    scopeHardVetoChanges:changedIds('scopeHardVetoChanged').length,
    maxIdentityProbabilityDelta:Math.max(...identityDeltas),
    fallbackIdentityDecisionChanges:changedIds('fallbackIdentityDecisionChanged').length,
    finalDispositionOrRouteChanges:changedIds('finalDispositionOrRouteChanged').length,
    finalReasonChanges:changedIds('finalReasonChanged').length
  },
  changedRowIds:{
    routerTop1:changedIds('routerTop1Changed'),
    routerTop2Set:changedIds('routerTop2SetChanged'),
    routeabilityDisposition:changedIds('routeabilityDispositionChanged'),
    scopeHardVeto:changedIds('scopeHardVetoChanged'),
    fallbackIdentityDecision:changedIds('fallbackIdentityDecisionChanged'),
    finalDispositionOrRoute:changedIds('finalDispositionOrRouteChanged')
  },
  conclusion:{
    discreteDecisionDriftObserved:rows.some((row) => row.routerTop1Changed || row.routerTop2SetChanged || row.routeabilityDispositionChanged || row.scopeHardVetoChanged || row.fallbackIdentityDecisionChanged || row.finalDispositionOrRouteChanged),
    freshDevelopmentMayProceedWithoutExecutionContractReview:false,
    note:'This report is architecture-only. It must not be used to retune any threshold or model.'
  }
};
writeJson('data/liuyao-semantic-fallback-identity-v0.1-embedding-execution-audit.json', report);
console.log(JSON.stringify(report.metrics, null, 2));
console.log(`discrete decision drift observed: ${report.conclusion.discreteDecisionDriftObserved}`);
