import './verify-liuyao-semantic-fallback-identity-v01-training-contract.mjs';
import './verify-liuyao-semantic-fallback-identity-v01-calibration-runtime-lock.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const ratio = (n, d) => d ? n / d : 0;

const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const contract = readJson(contractPath);
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');
const freshTraining = readJson(contract.sealedData.trainingPath);
const freshCalibration = readJson(contract.sealedData.calibrationPath);
const routeIds = [...contract.algorithm.routeOrder];
const routeSet = new Set(routeIds);

if (routeIds.length !== 22) throw new Error(`Fallback Identity route count ${routeIds.length} != 22`);
if (freshTraining.sealed !== true || freshTraining.status !== 'sealed_training_data') throw new Error('Fallback Identity fresh training data is not sealed');
if (freshCalibration.sealed !== true || freshCalibration.status !== 'sealed_calibration_data') throw new Error('Fallback Identity fresh calibration data is not sealed');
if (routeabilityModel.status !== 'frozen' || routeabilityModel.model?.weights?.length !== 512) throw new Error('Frozen Routeability v0.2 base model missing');
if (frozen.encoder?.revision !== contract.encoder.revision || frozen.encoder?.vectorSize !== 512) throw new Error('Frozen encoder contract drift');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-fallback-identity-model-v01.js',
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
]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
}

const G = context.GuiJia;
const identityModel = G?.liuyaoSemanticFallbackIdentityModelV01;
const evidenceExtractor = G?.liuyaoSemanticRouteEvidenceV03;
const arbitration = G?.liuyaoSemanticRouteArbitrationV012;
const routeability = G?.liuyaoSemanticRouteabilityV05;
const identityGate = G?.liuyaoSemanticFallbackIdentityV01;
const selection = G?.liuyaoSemanticRouteSelectionV04;
const finalization = G?.liuyaoSemanticFinalizationV01;
if (!identityModel?.trainAll || !identityModel?.probability || !evidenceExtractor?.extract || !arbitration?.arbitrate || !routeability?.decide || !identityGate?.decide || !selection?.decide || !finalization?.finalize) {
  throw new Error('Candidate v0.3 training/runtime modules failed to load');
}
if (routeability.threshold !== 0.7675678218564946) throw new Error(`Routeability frozen threshold drift: ${routeability.threshold}`);

const historicalPaths = contract.trainingSources.allowedHistoricalRouterTrainOnly.filter((relative) => !relative.endsWith('-label-patch.json'));
const expansionPatchPath = 'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json';
const expansionPatch = readJson(expansionPatchPath);
const assembled = [];
const addTrainingRow = ({ text, expectedRoute=null, source, subtype }) => {
  const cleanText = String(text || '').trim();
  if (!cleanText) throw new Error(`Empty Fallback Identity training text from ${source}`);
  const route = routeSet.has(expectedRoute) ? expectedRoute : null;
  if (expectedRoute && !route && expectedRoute !== '__other__') throw new Error(`Unknown training route ${expectedRoute} from ${source}`);
  assembled.push({ text:cleanText, expectedRoute:route, source, subtype });
};

for (const relative of historicalPaths) {
  const source = readJson(relative);
  for (const routeId of routeIds) {
    for (const text of source.routes?.[routeId]?.train || []) {
      addTrainingRow({ text, expectedRoute:routeId, source:relative, subtype:'historical_route_train' });
    }
  }
  for (const sample of source.hardNegatives?.train || []) {
    const text = typeof sample === 'string' ? sample : sample?.text;
    let expectedRoute = typeof sample === 'object' && sample ? sample.expectedRoute || null : null;
    if (!expectedRoute && relative.endsWith('liuyao-semantic-route-training-v0.4-expansion.json')) {
      expectedRoute = expansionPatch.train?.[text] || null;
    }
    addTrainingRow({
      text,
      expectedRoute:routeSet.has(expectedRoute) ? expectedRoute : null,
      source:relative,
      subtype:routeSet.has(expectedRoute) ? 'historical_contrastive_known' : 'historical_genuine_nonroute'
    });
  }
}

for (const row of freshTraining.rows || []) {
  const expectedRoute = routeSet.has(row.expectedRoute) ? row.expectedRoute : null;
  if (row.identityLabel === 'route_identity_positive' && !expectedRoute) throw new Error(`Fresh positive training row lacks current22 route: ${row.text}`);
  if (row.identityLabel === 'route_identity_negative' && expectedRoute) throw new Error(`Fresh negative training row carries current22 route: ${row.text}`);
  addTrainingRow({
    text:row.text,
    expectedRoute,
    source:contract.sealedData.trainingPath,
    subtype:row.subtype || (expectedRoute ? 'fresh_known' : 'fresh_nonroute')
  });
}

const trainingRows = [...identityModel.deduplicateRows(assembled)];
const calibrationRows = (freshCalibration.rows || []).map((row, index) => {
  const expectedRoute = routeSet.has(row.expectedRoute) ? row.expectedRoute : null;
  if (row.identityLabel === 'route_identity_positive' && !expectedRoute) throw new Error(`Calibration positive lacks current22 route: ${row.text}`);
  if (row.identityLabel === 'route_identity_negative' && expectedRoute) throw new Error(`Calibration negative carries current22 route: ${row.text}`);
  return {
    id:row.id || `FI-CAL-${String(index + 1).padStart(3, '0')}`,
    text:String(row.text || '').trim(),
    expectedRoute,
    expectedDisposition:expectedRoute ? 'route_known' : 'non_route',
    subtype:row.subtype || (expectedRoute ? 'fallback_style_known' : 'unspecified_nonroute')
  };
});
if (!trainingRows.length || !calibrationRows.length) throw new Error('Fallback Identity training/calibration rows missing');

const trainingTextSet = new Set(trainingRows.map((row) => identityModel.normalizeText(row.text)));
const calibrationTextSet = new Set();
for (const row of calibrationRows) {
  const normalized = identityModel.normalizeText(row.text);
  if (!normalized) throw new Error('Empty normalized calibration text');
  if (trainingTextSet.has(normalized)) throw new Error(`Calibration overlaps training after normalization: ${row.text}`);
  if (calibrationTextSet.has(normalized)) throw new Error(`Duplicate normalized calibration text: ${row.text}`);
  calibrationTextSet.add(normalized);
}

const trainingKnown = trainingRows.filter((row) => row.expectedRoute);
const trainingNonRoute = trainingRows.filter((row) => !row.expectedRoute);
for (const routeId of routeIds) {
  if (!trainingKnown.some((row) => row.expectedRoute === routeId)) throw new Error(`Training has no positive rows for ${routeId}`);
}
const calibrationKnown = calibrationRows.filter((row) => row.expectedRoute);
const calibrationNonRoute = calibrationRows.filter((row) => !row.expectedRoute);
if (calibrationKnown.length !== 66 || calibrationNonRoute.length !== 68) {
  throw new Error(`Fallback Identity calibration count drift: ${calibrationKnown.length} known / ${calibrationNonRoute.length} nonroute`);
}

console.log(`Fallback Identity training rows: ${trainingRows.length} (${trainingKnown.length} known / ${trainingNonRoute.length} nonroute)`);
console.log(`Fallback Identity calibration rows: ${calibrationRows.length} (${calibrationKnown.length} known / ${calibrationNonRoute.length} nonroute)`);

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
  dtype:frozen.encoder.dtype,
  revision:frozen.encoder.revision
});

const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`Embedding size ${hidden} != ${frozen.encoder.vectorSize}`);
  const raw = tensor.data;
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let index = 0; index < hidden; index += 1) vector[index] = Number(raw[offset + index]);
    vectors.push(vector);
  }
  return vectors;
};
const embed = async (texts, chunkSize=24) => {
  const vectors = [];
  for (let start = 0; start < texts.length; start += chunkSize) {
    const chunk = texts.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
    vectors.push(...tensorToVectors(output, chunk.length));
    console.log(`embedded ${Math.min(start + chunk.length, texts.length)}/${texts.length}`);
  }
  return vectors;
};

const trainingVectors = await embed(trainingRows.map((row) => row.text));
const trained = identityModel.trainAll(trainingRows, trainingVectors);
const calibrationVectors = await embed(calibrationRows.map((row) => row.text));

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
const classifyRouter = (vector) => {
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

const calibrationBase = calibrationRows.map((row, index) => {
  const vector = calibrationVectors[index];
  const head = classifyRouter(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const routeabilityProbabilityValue = routeabilityProbability(vector);
  const gate = routeability.decide({ probability:routeabilityProbabilityValue, arbitration:arb, evidence });
  const scope = scopeScore(vector);
  const probabilities = {};
  for (const candidate of [head.top1, head.top2]) {
    probabilities[candidate.id] = identityModel.probability(trained.heads[candidate.id], vector);
  }
  return {
    ...row,
    head,
    evidence,
    arbitration:arb,
    routeability:gate,
    scope,
    identityProbabilities:Object.freeze(probabilities),
    reachesFallbackIdentity:gate.disposition === 'route_known' && !arb?.routeId
  };
});

const evaluateThreshold = (threshold) => {
  const evaluated = calibrationBase.map((row) => {
    let fallbackIdentityDecision = null;
    if (row.reachesFallbackIdentity) {
      fallbackIdentityDecision = identityGate.decide({
        head:row.head,
        probabilities:row.identityProbabilities,
        threshold
      });
    }
    const selected = row.routeability.disposition === 'route_known'
      ? selection.decide({
          arbitration:row.arbitration,
          head:row.head,
          evidence:row.evidence,
          routeabilityDisposition:'route_known',
          fallbackIdentityDecision
        })
      : null;
    const final = finalization.finalize({
      routeability:row.routeability,
      selection:selected,
      scope:row.scope,
      arbitration:row.arbitration,
      evidence:row.evidence
    });
    return { ...row, fallbackIdentityDecision, selection:selected, final };
  });

  const known = evaluated.filter((row) => row.expectedDisposition === 'route_known');
  const nonRoute = evaluated.filter((row) => row.expectedDisposition === 'non_route');
  const acceptedKnown = known.filter((row) => row.final.disposition === 'route_known');
  const knownRetention = ratio(acceptedKnown.length, known.length);
  const knownExactRoute = ratio(known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, known.length);
  const acceptedRouteAccuracy = ratio(acceptedKnown.filter((row) => row.final.routeId === row.expectedRoute).length, acceptedKnown.length);
  const overallFalseActivation = ratio(nonRoute.filter((row) => row.final.disposition === 'route_known').length, nonRoute.length);
  const byNonRouteSubtype = {};
  for (const subtype of [...new Set(nonRoute.map((row) => row.subtype))].sort()) {
    const subset = nonRoute.filter((row) => row.subtype === subtype);
    byNonRouteSubtype[subtype] = {
      n:subset.length,
      falseRouteActivation:ratio(subset.filter((row) => row.final.disposition === 'route_known').length, subset.length)
    };
  }
  const maxSubtypeFalseActivation = Math.max(0, ...Object.values(byNonRouteSubtype).map((row) => row.falseRouteActivation));
  const checks = {
    acceptedRouteAccuracy:acceptedRouteAccuracy >= 0.98,
    overallFalseActivation:overallFalseActivation <= 0.05,
    perSubtypeFalseActivation:Object.values(byNonRouteSubtype).every((row) => row.falseRouteActivation <= 0.05)
  };
  return {
    threshold,
    knownRetention,
    knownExactRoute,
    acceptedRouteAccuracy,
    overallFalseActivation,
    maxSubtypeFalseActivation,
    byNonRouteSubtype,
    reachesFallbackIdentity:{
      known:known.filter((row) => row.reachesFallbackIdentity).length,
      nonRoute:nonRoute.filter((row) => row.reachesFallbackIdentity).length
    },
    checks,
    feasible:Object.values(checks).every(Boolean),
    evaluated
  };
};

const observed = [...new Set(calibrationBase.flatMap((row) => Object.values(row.identityProbabilities)))].sort((a, b) => a - b);
const thresholdSet = new Set([0, 0.5, 1]);
for (const value of observed) thresholdSet.add(value);
for (let index = 0; index + 1 < observed.length; index += 1) thresholdSet.add((observed[index] + observed[index + 1]) / 2);
const thresholdCandidates = [...thresholdSet].filter((value) => Number.isFinite(value) && value >= 0 && value <= 1).sort((a, b) => a - b);
const attempts = thresholdCandidates.map(evaluateThreshold);
const feasible = attempts.filter((row) => row.feasible);
const safer = (a, b) => {
  if (a.knownRetention !== b.knownRetention) return b.knownRetention - a.knownRetention;
  if (a.overallFalseActivation !== b.overallFalseActivation) return a.overallFalseActivation - b.overallFalseActivation;
  if (a.maxSubtypeFalseActivation !== b.maxSubtypeFalseActivation) return a.maxSubtypeFalseActivation - b.maxSubtypeFalseActivation;
  return b.threshold - a.threshold;
};
feasible.sort(safer);
const selectedCalibration = feasible[0] || null;

const summarizeAttempt = (row) => ({
  threshold:row.threshold,
  knownRetention:row.knownRetention,
  knownExactRoute:row.knownExactRoute,
  acceptedRouteAccuracy:row.acceptedRouteAccuracy,
  overallFalseActivation:row.overallFalseActivation,
  maxSubtypeFalseActivation:row.maxSubtypeFalseActivation,
  byNonRouteSubtype:row.byNonRouteSubtype,
  reachesFallbackIdentity:row.reachesFallbackIdentity,
  checks:row.checks,
  feasible:row.feasible
});
const constraintFailureCount = (row) => Object.values(row.checks).filter((value) => !value).length;
const diagnosticAttempts = [...attempts].sort((a, b) => {
  const failures = constraintFailureCount(a) - constraintFailureCount(b);
  if (failures) return failures;
  if (a.overallFalseActivation !== b.overallFalseActivation) return a.overallFalseActivation - b.overallFalseActivation;
  if (a.maxSubtypeFalseActivation !== b.maxSubtypeFalseActivation) return a.maxSubtypeFalseActivation - b.maxSubtypeFalseActivation;
  if (a.acceptedRouteAccuracy !== b.acceptedRouteAccuracy) return b.acceptedRouteAccuracy - a.acceptedRouteAccuracy;
  if (a.knownRetention !== b.knownRetention) return b.knownRetention - a.knownRetention;
  return b.threshold - a.threshold;
}).slice(0, 20).map(summarizeAttempt);

const serializeHeads = () => Object.fromEntries(routeIds.map((routeId) => {
  const head = trained.heads[routeId];
  return [routeId, {
    weights:Array.from(head.weights),
    bias:head.bias,
    positiveCount:head.positiveCount,
    negativeCount:head.negativeCount
  }];
}));
const sourcePaths = [
  ...contract.trainingSources.allowedHistoricalRouterTrainOnly,
  contract.sealedData.trainingPath,
  contract.sealedData.calibrationPath,
  contract.algorithm.modulePath,
  contractPath,
  contract.calibrationRuntimeLock.path,
  'data/liuyao-semantic-frozen-dependencies-v0.1.lock.json',
  'data/liuyao-semantic-routeability-v0.2.json'
];
const sources = sourcePaths.map((relative) => ({ path:relative, sha256:sha256File(relative) }));
const countBy = (rows, key) => rows.reduce((acc, row) => {
  const value = row[key] || 'unspecified';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const reportPath = 'data/liuyao-semantic-fallback-identity-v0.1-calibration-report.json';
const artifactPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.json';
const lockPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json';
const report = {
  version:'0.13-fallback-identity-v0.1-calibration-report-v0.1',
  status:selectedCalibration ? 'feasible_global_threshold_selected' : 'no_feasible_global_threshold',
  scope:'liuyao_semantic_fallback_identity_v0.1',
  policy:{
    calibrationTrainsModel:false,
    oneGlobalThresholdOnly:true,
    routeSpecificThresholds:false,
    routeabilityThresholdRetuned:false,
    scopeCutoffRetuned:false,
    routerMarginTuned:false,
    objective:contract.calibrationBoundary.objective
  },
  calibrationRows:{
    total:calibrationRows.length,
    known:calibrationKnown.length,
    nonRoute:calibrationNonRoute.length,
    bySubtype:countBy(calibrationRows, 'subtype')
  },
  thresholdCandidatesTested:attempts.length,
  selected:selectedCalibration ? summarizeAttempt(selectedCalibration) : null,
  diagnosticTop20:diagnosticAttempts
};
writeJson(reportPath, report);

const artifact = {
  version:'0.13-fallback-identity-v0.1-model-v0.1',
  status:selectedCalibration ? 'frozen' : 'trained_unfrozen_no_feasible_threshold',
  scope:'liuyao_semantic_fallback_identity_v0.1',
  trainingContract:{ path:contractPath, sha256:sha256File(contractPath) },
  calibrationRuntimeLock:{
    path:contract.calibrationRuntimeLock.path,
    gitBlobSha:contract.calibrationRuntimeLock.gitBlobSha
  },
  encoder:{
    modelId:frozen.encoder.modelId,
    revision:frozen.encoder.revision,
    transformersJsVersion:'4.2.0',
    dtype:frozen.encoder.dtype,
    vectorSize:frozen.encoder.vectorSize,
    pooling:frozen.encoder.pooling,
    normalize:frozen.encoder.normalize
  },
  sources,
  training:{
    total:trainingRows.length,
    known:trainingKnown.length,
    nonRoute:trainingNonRoute.length,
    bySource:countBy(trainingRows, 'source'),
    bySubtype:countBy(trainingRows, 'subtype'),
    hyperparameters:contract.algorithm.hyperparameters,
    classBalancing:contract.algorithm.classBalancing,
    positiveLabelRule:contract.algorithm.positiveLabelRule,
    negativeLabelRule:contract.algorithm.negativeLabelRule
  },
  calibration:selectedCalibration ? {
    threshold:selectedCalibration.threshold,
    knownRetention:selectedCalibration.knownRetention,
    knownExactRoute:selectedCalibration.knownExactRoute,
    acceptedRouteAccuracy:selectedCalibration.acceptedRouteAccuracy,
    overallFalseActivation:selectedCalibration.overallFalseActivation,
    maxSubtypeFalseActivation:selectedCalibration.maxSubtypeFalseActivation,
    byNonRouteSubtype:selectedCalibration.byNonRouteSubtype,
    reachesFallbackIdentity:selectedCalibration.reachesFallbackIdentity,
    objective:contract.calibrationBoundary.objective
  } : null,
  model:{ heads:serializeHeads() }
};
writeJson(artifactPath, artifact);

if (!selectedCalibration) {
  if (fs.existsSync(path.join(root, lockPath))) fs.unlinkSync(path.join(root, lockPath));
  console.error('No global Fallback Identity threshold satisfies the frozen calibration constraints.');
  console.error(JSON.stringify({ diagnosticTop20:report.diagnosticTop20.slice(0, 5) }, null, 2));
  process.exitCode = 2;
} else {
  const artifactSha256 = sha256File(artifactPath);
  const lock = {
    version:'0.13-fallback-identity-v0.1-model-lock-v0.1',
    status:'locked',
    artifact:artifactPath,
    artifactSha256,
    trainingContractSha256:sha256File(contractPath),
    calibrationRuntimeLockGitBlobSha:contract.calibrationRuntimeLock.gitBlobSha,
    calibrationReport:reportPath,
    calibrationReportSha256:sha256File(reportPath),
    routeCount:routeIds.length,
    vectorSize:512,
    globalThreshold:selectedCalibration.threshold,
    routeSpecificThresholds:false,
    routeabilityThreshold:routeability.threshold,
    scopeHardVetoCutoff:frozen.semanticStackPolicy.hardVetoCutoff
  };
  writeJson(lockPath, lock);
  console.log('Frozen Fallback Identity v0.1 model and one global threshold.');
  console.log(JSON.stringify({
    threshold:selectedCalibration.threshold,
    knownRetention:selectedCalibration.knownRetention,
    knownExactRoute:selectedCalibration.knownExactRoute,
    acceptedRouteAccuracy:selectedCalibration.acceptedRouteAccuracy,
    overallFalseActivation:selectedCalibration.overallFalseActivation,
    byNonRouteSubtype:selectedCalibration.byNonRouteSubtype,
    reachesFallbackIdentity:selectedCalibration.reachesFallbackIdentity,
    artifactSha256
  }, null, 2));
}
