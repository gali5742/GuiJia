import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-fallback-identity-v0.1.json';
const lockPath = 'data/liuyao-semantic-fallback-identity-v0.1.lock.json';
const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const dataLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-data.lock.json';
assert(fs.existsSync(path.join(root, artifactPath)), 'Fallback Identity artifact missing');
assert(fs.existsSync(path.join(root, lockPath)), 'Fallback Identity model lock missing');

const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
const contract = readJson(contractPath);
const dataLock = readJson(dataLockPath);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);

assert(artifact.version === '0.1' && artifact.status === 'frozen' && artifact.scope === 'liuyao_semantic_fallback_identity_v0.1', 'Fallback Identity artifact contract drift');
assert(lock.version === '0.13-fallback-identity-v0.1-model-lock-v0.1' && lock.status === 'locked', 'Fallback Identity model lock contract drift');
assert(lock.artifactPath === artifactPath && lock.artifactSha256 === sha256File(artifactPath), 'Fallback Identity artifact SHA drift');
assert(lock.trainingContractSha256 === sha256File(contractPath), 'Fallback Identity training contract SHA drift');
assert(lock.dataLockSha256 === sha256File(dataLockPath), 'Fallback Identity data lock SHA drift');
assert(artifact.trainingContract?.sha256 === sha256File(contractPath), 'artifact training contract SHA drift');
assert(artifact.dataLock?.sha256 === sha256File(dataLockPath), 'artifact data-lock SHA drift');
assert(artifact.dataLock?.trainingSha256 === dataLock.trainingSha256, 'artifact training corpus SHA drift');
assert(artifact.dataLock?.calibrationSha256 === dataLock.calibrationSha256, 'artifact calibration corpus SHA drift');

assert(artifact.encoder?.modelId === contract.encoder.modelId, 'artifact encoder model drift');
assert(artifact.encoder?.revision === contract.encoder.revision, 'artifact encoder revision drift');
assert(artifact.encoder?.vectorSize === 512 && artifact.encoder?.dtype === 'q8' && artifact.encoder?.pooling === 'mean' && artifact.encoder?.normalize === true, 'artifact encoder settings drift');
assert(Array.isArray(artifact.routeOrder) && artifact.routeOrder.length === 22, 'artifact route order length drift');
assert(JSON.stringify(artifact.routeOrder) === JSON.stringify(routeIds), 'artifact route order must exactly match current 22-route inventory');
assert(artifact.model?.type === '22_independent_one_vs_rest_logistic_heads', 'artifact model type drift');

for (const routeId of routeIds) {
  const head = artifact.model?.heads?.[routeId];
  assert(head, `Fallback Identity head missing: ${routeId}`);
  assert(Array.isArray(head.weights) && head.weights.length === 512, `Fallback Identity ${routeId} weight shape drift`);
  assert(head.weights.every(Number.isFinite) && Number.isFinite(head.bias), `Fallback Identity ${routeId} non-finite parameters`);
  assert(head.trainingCounts?.positive > 0 && head.trainingCounts?.negative > 0, `Fallback Identity ${routeId} class counts missing`);
  assert(artifact.training?.byExpectedRoute?.[routeId] === head.trainingCounts.positive, `Fallback Identity ${routeId} positive count mismatch`);
}
assert(Object.keys(artifact.model.heads || {}).length === 22, 'Fallback Identity artifact must contain exactly 22 heads');
assert(artifact.trainingContract?.epochs === 360, 'artifact epochs drift');
assert(artifact.trainingContract?.baseLearningRate === 0.42, 'artifact learning rate drift');
assert(artifact.trainingContract?.l2 === 0.0015, 'artifact l2 drift');
assert(artifact.trainingContract?.routeSpecificHyperparametersAllowed === false, 'route-specific hyperparameters must be disabled');

const calibration = artifact.calibration || {};
const metrics = calibration.metrics || {};
assert(calibration.thresholdPolicy === 'one_global_threshold_for_all_22_heads', 'Fallback Identity global threshold policy drift');
assert(Number.isFinite(calibration.threshold) && calibration.threshold > 0 && calibration.threshold < 1, 'Fallback Identity threshold invalid');
assert(lock.threshold === calibration.threshold, 'Fallback Identity lock threshold drift');
assert(calibration.routeSpecificThresholds === false, 'route-specific threshold drift');
assert(calibration.routeabilityThresholdRetuned === false && calibration.scopeHardVetoRetuned === false, 'upstream threshold retune forbidden');
assert(metrics.acceptedRouteAccuracy + 1e-12 >= contract.calibration.constraints.minimumAcceptedRouteAccuracy, `accepted route accuracy gate failed: ${metrics.acceptedRouteAccuracy}`);
assert(metrics.overallNonRouteFalseActivation <= contract.calibration.constraints.maximumOverallNonRouteFalseActivation + 1e-12, `overall false activation gate failed: ${metrics.overallNonRouteFalseActivation}`);
assert(metrics.maximumSubtypeFalseActivation <= contract.calibration.constraints.maximumFalseActivationPerNonRouteSubtype + 1e-12, `subtype false activation gate failed: ${metrics.maximumSubtypeFalseActivation}`);
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  assert(metrics.bySubtype?.[subtype]?.n > 0, `calibration subtype missing: ${subtype}`);
  assert(metrics.bySubtype[subtype].falseActivation <= 0.05 + 1e-12, `calibration subtype unsafe ${subtype}: ${metrics.bySubtype[subtype].falseActivation}`);
}

const trainingSourcePaths = (artifact.sources || []).filter((row) => row.role.includes('train')).map((row) => row.path);
for (const forbidden of ['sealed-blind','independent','development-report','decision-stack-v0.13-development','routeability-v0.3-calibration']) {
  assert(!trainingSourcePaths.some((value) => value.includes(forbidden)), `forbidden source used for training: ${forbidden}`);
}
assert((artifact.sources || []).some((row) => row.role === 'fresh_fallback_identity_calibration_only'), 'calibration source audit record missing');

const runtimeSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-fallback-identity-frozen-v01.js'), 'utf8');
assert(!runtimeSource.includes('@huggingface/transformers'), 'runtime loader must not instantiate encoder or training dependency');
assert(!/\.train\s*\(/.test(runtimeSource), 'runtime loader must not train');
assert(!/calibrate\s*\(/.test(runtimeSource), 'runtime loader must not calibrate');
assert(runtimeSource.includes('one_global_threshold_for_all_22_heads'), 'runtime loader must validate global-threshold policy');

console.log('LiuYao Fallback Identity v0.1 frozen model verified.');
console.log(`- heads: 22 x 512`);
console.log(`- global threshold: ${calibration.threshold}`);
console.log(`- calibration known retention: ${metrics.knownRetention}`);
console.log(`- accepted route accuracy: ${metrics.acceptedRouteAccuracy}`);
console.log(`- overall non-route false activation: ${metrics.overallNonRouteFalseActivation}`);
console.log(`- maximum subtype false activation: ${metrics.maximumSubtypeFalseActivation}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
