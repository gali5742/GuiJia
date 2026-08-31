import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const safeRatio = (n, d, empty=0) => d ? n / d : empty;

const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const dataLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-data.lock.json';
const trainingPath = 'data/liuyao-semantic-fallback-identity-v0.1-training.json';
const calibrationPath = 'data/liuyao-semantic-fallback-identity-v0.1-calibration.json';
const artifactPath = 'data/liuyao-semantic-fallback-identity-v0.1.json';
const artifactLockPath = 'data/liuyao-semantic-fallback-identity-v0.1.lock.json';

const contract = readJson(contractPath);
const dataLock = readJson(dataLockPath);
const freshTraining = readJson(trainingPath);
const freshCalibration = readJson(calibrationPath);
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityArtifact = readJson('data/liuyao-semantic-routeability-v0.2.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);

assert(contract.status === 'frozen_before_first_model_scoring', 'Fallback Identity training contract is not frozen');
assert(dataLock.status === 'locked', 'Fallback Identity data lock missing');
assert(freshTraining.status === 'sealed_training_data' && freshTraining.sealed === true, 'Fallback Identity training corpus not sealed');
assert(freshCalibration.status === 'sealed_calibration_data' && freshCalibration.sealed === true, 'Fallback Identity calibration corpus not sealed');
assert(dataLock.trainingSha256 === sha256File(trainingPath), 'Fallback Identity training data SHA drift');
assert(dataLock.calibrationSha256 === sha256File(calibrationPath), 'Fallback Identity calibration data SHA drift');
assert(routeIds.length === 22, `route inventory ${routeIds.length} != 22`);
assert(frozen.encoder?.revision === contract.encoder.revision, 'encoder revision differs from frozen training contract');
assert(frozen.encoder?.vectorSize === 512 && frozen.encoder?.dtype === 'q8', 'frozen encoder contract drift');
assert(routeabilityArtifact.model?.weights?.length === 512, 'frozen Routeability v0.2 model missing');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number, Date, Intl, Set, Map };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-fallback-identity-model-v01.js',
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const modelApi = context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(modelApi?.trainHeads && modelApi?.probability, 'Fallback Identity model implementation unavailable');
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'v0.3 fallback semantic path unavailable');
assert(modelApi.defaults?.epochs === contract.model.epochs, 'training epochs implementation drift');
assert(modelApi.defaults?.learningRate === contract.model.baseLearningRate, 'training learning rate implementation drift');
assert(modelApi.defaults?.l2 === contract.model.l2, 'training l2 implementation drift');

const historicalSources = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json'
];
const expansionPatchPath = 'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json';
const expansionPatch = readJson(expansionPatchPath);
const sourceRecords = [
  ...historicalSources.map((source) => ({ path:source, role:'historical_router_train_split', sha256:sha256File(source) })),
  { path:expansionPatchPath, role:'historical_train_label_patch', sha256:sha256File(expansionPatchPath) },
  { path:trainingPath, role:'fresh_fallback_identity_training_augmentation', sha256:sha256File(trainingPath) },
  { path:calibrationPath, role:'fresh_fallback_identity_calibration_only', sha256:sha256File(calibrationPath) },
  { path:contractPath, role:'frozen_training_contract', sha256:sha256File(contractPath) },
  { path:dataLockPath, role:'sealed_data_lock', sha256:sha256File(dataLockPath) },
  { path:'data/liuyao-semantic-frozen-dependencies-v0.1.json', role:'frozen_encoder_and_router', sha256:sha256File('data/liuyao-semantic-frozen-dependencies-v0.1.json') },
  { path:'data/liuyao-semantic-routeability-v0.2.json', role:'frozen_routeability_model', sha256:sha256File('data/liuyao-semantic-routeability-v0.2.json') }
];

const trainMap = new Map();
const addTrain = (text, expectedRoute, source, subtype) => {
  const key = normalize(text);
  if (!key) return;
  if (expectedRoute != null && !routeIds.includes(expectedRoute)) throw new Error(`Unknown training route ${expectedRoute}: ${text}`);
  const existing = trainMap.get(key);
  if (existing && existing.expectedRoute !== expectedRoute) {
    throw new Error(`Fallback Identity conflicting train labels: ${text} => ${existing.expectedRoute} vs ${expectedRoute}`);
  }
  if (!existing) trainMap.set(key, { text, expectedRoute:expectedRoute ?? null, source, subtype });
};

for (const sourcePath of historicalSources) {
  const source = readJson(sourcePath);
  for (const routeId of routeIds) {
    for (const text of source.routes?.[routeId]?.train || []) addTrain(text, routeId, sourcePath, 'historical_route_train');
  }
  for (const sample of source.hardNegatives?.train || []) {
    let expectedRoute = sample.expectedRoute || null;
    if (!expectedRoute && sourcePath.endsWith('v0.4-expansion.json')) expectedRoute = expansionPatch.train?.[sample.text] || null;
    addTrain(sample.text, expectedRoute && routeIds.includes(expectedRoute) ? expectedRoute : null, sourcePath, expectedRoute ? 'historical_contrastive_known' : 'historical_hard_negative');
  }
}
for (const row of freshTraining.rows || []) addTrain(row.text, row.expectedRoute, trainingPath, row.subtype);
const trainingRows = [...trainMap.values()];
assert(trainingRows.length > freshTraining.rows.length, 'historical Router train splits were not added');

const calibrationTextSet = new Set((freshCalibration.rows || []).map((row) => normalize(row.text)));
for (const row of trainingRows) assert(!calibrationTextSet.has(normalize(row.text)), `Calibration overlaps effective training: ${row.text}`);
for (const forbiddenFragment of ['validation','blind','independent','development-report','v0.3-calibration']) {
  assert(!sourceRecords.some((row) => row.role.includes('train') && row.path.includes(forbiddenFragment)), `Forbidden training source leaked: ${forbiddenFragment}`);
}

const trainingByExpectedRoute = {};
for (const routeId of routeIds) trainingByExpectedRoute[routeId] = trainingRows.filter((row) => row.expectedRoute === routeId).length;
const trainingNonRoute = trainingRows.filter((row) => row.expectedRoute == null).length;
for (const routeId of routeIds) assert(trainingByExpectedRoute[routeId] > 0, `No positives for ${routeId}`);
console.log(`Fallback Identity effective training rows: ${trainingRows.length}; non-route=${trainingNonRoute}`);
console.log(`Fallback Identity sealed calibration rows: ${freshCalibration.rows.length}`);

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', contract.encoder.modelId, {
  dtype:contract.encoder.dtype,
  revision:contract.encoder.revision
});
const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== contract.encoder.vectorSize) throw new Error(`Embedding size ${hidden} != ${contract.encoder.vectorSize}`);
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
const embed = async (texts, chunkSize=24) => {
  const vectors = [];
  for (let start = 0; start < texts.length; start += chunkSize) {
    const chunk = texts.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:contract.encoder.pooling, normalize:contract.encoder.normalize });
    vectors.push(...tensorToVectors(output, chunk.length));
    console.log(`embedded ${Math.min(start + chunk.length, texts.length)}/${texts.length}`);
  }
  return vectors;
};

const trainingVectors = await embed(trainingRows.map((row) => row.text));
const heads = modelApi.trainHeads(trainingRows, trainingVectors, routeIds, {
  epochs:contract.model.epochs,
  learningRate:contract.model.baseLearningRate,
  l2:contract.model.l2
});

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / Math.max(total, 1e-12));
};
const classifyHead = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = routeIds.map((id, index) => ({ id, score:probabilities[index] })).sort((a,b) => b.score-a.score);
  return { top1:scores[0], top2:scores[1], margin:scores[0].score-scores[1].score };
};
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityArtifact.model.weights, vector) + routeabilityArtifact.model.bias);
const routeabilityThreshold = 0.7675678218564946;

const calibrationVectors = await embed(freshCalibration.rows.map((row) => row.text));
const calibrationRows = freshCalibration.rows.map((row, index) => {
  const vector = calibrationVectors[index];
  const evidence = evidenceApi.extract(row.text);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  const routeabilityProbabilityValue = routeabilityProbability(vector);
  const head = classifyHead(vector);
  const eligible = (evidence.unsupportedTargets || []).length === 0
    && arbitration == null
    && routeabilityProbabilityValue >= routeabilityThreshold;
  const identityProbabilities = {};
  for (const candidate of [head.top1, head.top2]) identityProbabilities[candidate.id] = modelApi.probability(heads[candidate.id], vector);
  return {
    ...row,
    evidenceUnsupportedTargets:[...(evidence.unsupportedTargets || [])],
    arbitration,
    routeabilityProbability:routeabilityProbabilityValue,
    routeabilityAccepted:routeabilityProbabilityValue >= routeabilityThreshold,
    eligible,
    head,
    identityProbabilities
  };
});

const observed = calibrationRows.filter((row) => row.eligible).flatMap((row) => [
  row.identityProbabilities[row.head.top1.id],
  row.identityProbabilities[row.head.top2.id]
]).filter(Number.isFinite).sort((a,b) => a-b);
assert(observed.length > 0, 'No eligible Fallback Identity calibration candidate scores');
const values = [...new Set(observed)];
const candidateThresholds = new Set([0.5]);
for (const value of values) candidateThresholds.add(value);
for (let i = 0; i + 1 < values.length; i += 1) candidateThresholds.add((values[i] + values[i+1]) / 2);
const lowEdge = Math.max(1e-12, values[0] - 1e-9);
const highEdge = Math.min(1 - 1e-12, values[values.length-1] + 1e-9);
candidateThresholds.add(lowEdge);
candidateThresholds.add(highEdge);

const decideAt = (row, threshold) => {
  if (!row.eligible) return { selectedRoute:null, outcome:'ineligible' };
  const candidates = [row.head.top1.id, row.head.top2.id].map((routeId) => ({
    routeId,
    probability:row.identityProbabilities[routeId],
    admitted:row.identityProbabilities[routeId] >= threshold
  }));
  const admitted = candidates.filter((candidate) => candidate.admitted);
  return admitted.length === 1
    ? { selectedRoute:admitted[0].routeId, outcome:'selected' }
    : { selectedRoute:null, outcome:admitted.length ? 'multiple_admissions' : 'reject_all' };
};
const statsAt = (threshold) => {
  const decisions = calibrationRows.map((row) => ({ row, decision:decideAt(row, threshold) }));
  const known = decisions.filter(({row}) => row.expectedRoute != null);
  const nonRoute = decisions.filter(({row}) => row.expectedRoute == null);
  const selected = decisions.filter(({decision}) => decision.selectedRoute != null);
  const correctSelected = selected.filter(({row,decision}) => row.expectedRoute != null && decision.selectedRoute === row.expectedRoute);
  const knownExact = known.filter(({row,decision}) => decision.selectedRoute === row.expectedRoute).length;
  const wrongKnownSelected = known.filter(({row,decision}) => decision.selectedRoute != null && decision.selectedRoute !== row.expectedRoute).length;
  const falseActivated = nonRoute.filter(({decision}) => decision.selectedRoute != null).length;
  const bySubtype = {};
  for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
    const rows = nonRoute.filter(({row}) => row.subtype === subtype);
    const activated = rows.filter(({decision}) => decision.selectedRoute != null).length;
    bySubtype[subtype] = { n:rows.length, falseActivation:safeRatio(activated, rows.length), activated };
  }
  const maximumSubtypeFalseActivation = Math.max(...Object.values(bySubtype).map((row) => row.falseActivation));
  return {
    threshold,
    knownTotal:known.length,
    knownExact,
    knownRetention:safeRatio(knownExact, known.length),
    selectedTotal:selected.length,
    correctSelected:correctSelected.length,
    wrongKnownSelected,
    acceptedRouteAccuracy:safeRatio(correctSelected.length, selected.length, 1),
    nonRouteTotal:nonRoute.length,
    falseActivated,
    overallNonRouteFalseActivation:safeRatio(falseActivated, nonRoute.length),
    maximumSubtypeFalseActivation,
    bySubtype,
    eligibleKnown:known.filter(({row}) => row.eligible).length,
    eligibleNonRoute:nonRoute.filter(({row}) => row.eligible).length,
    rejectAll:decisions.filter(({decision}) => decision.outcome === 'reject_all').length,
    multipleAdmissions:decisions.filter(({decision}) => decision.outcome === 'multiple_admissions').length
  };
};

const constraints = contract.calibration.constraints;
let best = null;
for (const threshold of [...candidateThresholds].filter((value) => value > 0 && value < 1).sort((a,b)=>a-b)) {
  const current = statsAt(threshold);
  if (current.acceptedRouteAccuracy + 1e-12 < constraints.minimumAcceptedRouteAccuracy) continue;
  if (current.overallNonRouteFalseActivation > constraints.maximumOverallNonRouteFalseActivation + 1e-12) continue;
  if (current.maximumSubtypeFalseActivation > constraints.maximumFalseActivationPerNonRouteSubtype + 1e-12) continue;
  if (!best
    || current.knownRetention > best.knownRetention + 1e-12
    || (Math.abs(current.knownRetention-best.knownRetention) <= 1e-12 && current.acceptedRouteAccuracy > best.acceptedRouteAccuracy + 1e-12)
    || (Math.abs(current.knownRetention-best.knownRetention) <= 1e-12 && Math.abs(current.acceptedRouteAccuracy-best.acceptedRouteAccuracy) <= 1e-12 && current.overallNonRouteFalseActivation < best.overallNonRouteFalseActivation - 1e-12)
    || (Math.abs(current.knownRetention-best.knownRetention) <= 1e-12 && Math.abs(current.acceptedRouteAccuracy-best.acceptedRouteAccuracy) <= 1e-12 && Math.abs(current.overallNonRouteFalseActivation-best.overallNonRouteFalseActivation) <= 1e-12 && current.maximumSubtypeFalseActivation < best.maximumSubtypeFalseActivation - 1e-12)
    || (Math.abs(current.knownRetention-best.knownRetention) <= 1e-12 && Math.abs(current.acceptedRouteAccuracy-best.acceptedRouteAccuracy) <= 1e-12 && Math.abs(current.overallNonRouteFalseActivation-best.overallNonRouteFalseActivation) <= 1e-12 && Math.abs(current.maximumSubtypeFalseActivation-best.maximumSubtypeFalseActivation) <= 1e-12 && current.threshold > best.threshold)) {
    best = current;
  }
}
assert(best, 'No global Fallback Identity threshold satisfies frozen calibration safety constraints');

const artifact = {
  version:'0.1',
  status:'frozen',
  scope:'liuyao_semantic_fallback_identity_v0.1',
  encoder:{ ...contract.encoder },
  routeOrder:[...routeIds],
  trainingContract:{
    path:contractPath,
    sha256:sha256File(contractPath),
    epochs:contract.model.epochs,
    baseLearningRate:contract.model.baseLearningRate,
    learningRateSchedule:contract.model.learningRateSchedule,
    l2:contract.model.l2,
    classBalance:contract.model.classBalance,
    routeSpecificHyperparametersAllowed:false
  },
  dataLock:{
    path:dataLockPath,
    sha256:sha256File(dataLockPath),
    trainingSha256:dataLock.trainingSha256,
    calibrationSha256:dataLock.calibrationSha256
  },
  sources:sourceRecords,
  training:{
    total:trainingRows.length,
    nonRoute:trainingNonRoute,
    byExpectedRoute:trainingByExpectedRoute
  },
  model:{
    type:'22_independent_one_vs_rest_logistic_heads',
    heads:Object.fromEntries(routeIds.map((routeId) => [routeId, {
      weights:Array.from(heads[routeId].weights),
      bias:heads[routeId].bias,
      trainingCounts:heads[routeId].trainingCounts
    }]))
  },
  calibration:{
    objective:contract.calibration.objective,
    thresholdPolicy:contract.calibration.thresholdPolicy,
    threshold:best.threshold,
    metrics:best,
    total:freshCalibration.rows.length,
    known:freshCalibration.rows.filter((row) => row.expectedRoute != null).length,
    nonRoute:freshCalibration.rows.filter((row) => row.expectedRoute == null).length,
    constraints,
    candidatesEvaluated:candidateThresholds.size,
    routeabilityThreshold,
    routeabilityThresholdRetuned:false,
    scopeHardVetoRetuned:false,
    routeSpecificThresholds:false
  }
};
fs.writeFileSync(path.join(root, artifactPath), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
const artifactSha256 = sha256File(artifactPath);
const lock = {
  version:'0.13-fallback-identity-v0.1-model-lock-v0.1',
  status:'locked',
  artifactPath,
  artifactSha256,
  trainingContractSha256:sha256File(contractPath),
  dataLockSha256:sha256File(dataLockPath),
  threshold:best.threshold,
  encoderRevision:contract.encoder.revision,
  policy:{
    runtimeLoadOnly:true,
    routeSpecificThresholds:false,
    calibrationMayNotRetrainModel:true
  }
};
fs.writeFileSync(path.join(root, artifactLockPath), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

console.log('Fallback Identity v0.1 training/calibration complete.');
console.log(`- effective training: ${trainingRows.length}`);
console.log(`- global threshold: ${best.threshold}`);
console.log(`- calibration known retention: ${best.knownRetention}`);
console.log(`- accepted route accuracy: ${best.acceptedRouteAccuracy}`);
console.log(`- overall non-route false activation: ${best.overallNonRouteFalseActivation}`);
console.log(`- max subtype false activation: ${best.maximumSubtypeFalseActivation}`);
console.log(`- artifact SHA-256: ${artifactSha256}`);
