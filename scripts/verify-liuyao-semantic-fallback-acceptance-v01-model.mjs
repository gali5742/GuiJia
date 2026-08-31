import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const close = (a, b, epsilon = 1e-12) => Math.abs(a - b) <= epsilon;

const artifactFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.json';
const lockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.lock.json';
const contractFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-contract.json';
const calibrationFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json';
const calibrationLockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.lock.json';
const artifact = readJson(artifactFile);
const lock = readJson(lockFile);
const contract = readJson(contractFile);
const calibration = readJson(calibrationFile);
const calibrationLock = readJson(calibrationLockFile);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);

assert(artifact.version === '0.13-fallback-acceptance-v0.1', `artifact version ${artifact.version}`);
assert(artifact.status === 'frozen_fresh_calibrated', `artifact status ${artifact.status}`);
assert(artifact.scope === 'liuyao_semantic_pure_fallback_acceptance', 'artifact scope drift');
assert(artifact.architecture?.ranker === 'frozen_identity_v0.2_global_argmax_all_22_routes', 'ranker architecture drift');
assert(artifact.architecture?.gate === 'routeability_probability_and_identity_top1_probability_two_global_threshold_conjunction', 'gate architecture drift');
assert(artifact.architecture?.routerTopKHardBoundary === false, 'Router TopK must not be a hard fallback boundary');
assert(artifact.architecture?.marginThreshold == null && artifact.architecture?.routeSpecificThresholds === false, 'forbidden acceptance feature present');
assert(calibration.status === 'sealed_fresh_calibration' && calibration.sealed === true, 'fresh calibration is not sealed');
assert(calibrationLock.status === 'locked' && calibrationLock.calibrationSha256 === sha256(calibrationFile), 'calibration lock drift');
assert(contract.status === 'frozen_architecture_before_fresh_calibration', 'contract status drift');

const expectedDependencies = {
  contract: contractFile,
  calibration: calibrationFile,
  calibrationLock: calibrationLockFile,
  correctedSemanticDependencies: 'data/liuyao-semantic-frozen-dependencies-v0.2.json',
  correctedRouteability: 'data/liuyao-semantic-routeability-v0.4.json',
  identityRanker: 'data/liuyao-semantic-fallback-identity-v0.2.json',
  routeInventory: 'data/liuyao-semantic-route-inventory-v0.2.json'
};
for (const [key, relative] of Object.entries(expectedDependencies)) {
  assert(artifact.dependencies?.[key]?.path === relative, `${key} dependency path drift`);
  assert(artifact.dependencies?.[key]?.sha256 === sha256(relative), `${key} dependency SHA drift`);
}
assert(!JSON.stringify(artifact.dependencies).includes('fallback-identity-v0.1-calibration'), 'old fallback calibration leaked into fresh gate dependency graph');

const encoder = artifact.encoder || {};
assert(encoder.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift');
assert(encoder.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift');
assert(encoder.transformersJsVersion === '4.2.0' && encoder.dtype === 'q8', 'encoder runtime drift');
assert(encoder.vectorSize === 512 && encoder.pooling === 'mean' && encoder.normalize === true && encoder.textsPerEncoderCall === 1, 'canonical single-text representation drift');

const thresholds = artifact.thresholds || {};
assert(Number.isFinite(thresholds.routeabilityAcceptThreshold) && thresholds.routeabilityAcceptThreshold >= 0 && thresholds.routeabilityAcceptThreshold <= 1, 'invalid Routeability acceptance threshold');
assert(Number.isFinite(thresholds.identityAcceptThreshold) && thresholds.identityAcceptThreshold >= 0 && thresholds.identityAcceptThreshold <= 1, 'invalid Identity acceptance threshold');
assert(Object.keys(thresholds).sort().join(',') === 'identityAcceptThreshold,routeabilityAcceptThreshold', 'exactly two global thresholds required');

const metrics = artifact.calibration?.metrics || {};
const constraints = contract.freshCalibration?.constraints || {};
assert(artifact.calibration?.fresh === true && artifact.calibration?.independentGeneralizationClaim === false, 'fresh calibration evidence discipline drift');
assert(artifact.calibration?.totalRows === 178 && artifact.calibration?.knownRows === 88 && artifact.calibration?.nonRouteRows === 90, 'calibration totals drift');
assert(metrics.knownTotal === 88 && metrics.nonRouteTotal === 90, 'metric totals drift');
assert(metrics.knownExact >= 0 && metrics.knownExact <= 88, 'known exact out of range');
assert(close(metrics.knownRetention, metrics.knownExact / 88), 'known retention arithmetic drift');
assert(metrics.falseActivations >= 0 && metrics.falseActivations <= 90, 'false activation count out of range');
assert(close(metrics.overallFalseActivation, metrics.falseActivations / 90), 'overall false activation arithmetic drift');
assert(metrics.selectedTotal === metrics.knownExact + metrics.wrongKnownSelected + metrics.falseActivations, 'selected total arithmetic drift');
assert(close(metrics.acceptedRouteAccuracy, metrics.selectedTotal ? metrics.knownExact / metrics.selectedTotal : 1), 'accepted route accuracy arithmetic drift');
assert(metrics.acceptedRouteAccuracy >= constraints.minimumAcceptedRouteAccuracy - 1e-12, 'accepted route accuracy safety gate failed');
assert(metrics.overallFalseActivation <= constraints.maximumOverallNonRouteFalseActivation + 1e-12, 'overall non-route false activation safety gate failed');
assert(metrics.maxSubtypeFalseActivation <= constraints.maximumFalseActivationPerNonRouteSubtype + 1e-12, 'subtype false activation safety gate failed');

let subtypeActivations = 0;
let maxSubtype = 0;
for (const subtype of ['outside_current_22', 'route_unresolved', 'near_domain_not_current_route']) {
  const row = metrics.bySubtype?.[subtype];
  assert(row?.total === 30, `${subtype} total drift`);
  assert(row.gateReachable >= 10 && row.gateReachable <= 30, `${subtype} gate-reachable count invalid`);
  assert(row.activated >= 0 && row.activated <= row.gateReachable, `${subtype} activated count invalid`);
  assert(close(row.falseActivation, row.activated / 30), `${subtype} false activation arithmetic drift`);
  subtypeActivations += row.activated;
  maxSubtype = Math.max(maxSubtype, row.falseActivation);
}
assert(subtypeActivations === metrics.falseActivations, 'subtype activation sum drift');
assert(close(maxSubtype, metrics.maxSubtypeFalseActivation), 'max subtype false activation drift');

assert(routeIds.length === 22, 'route inventory count drift');
let byRouteTotal = 0;
let byRouteTop1Correct = 0;
let byRouteAcceptedExact = 0;
for (const routeId of routeIds) {
  const row = artifact.calibration?.byRoute?.[routeId];
  assert(row?.total === 4, `${routeId} calibration count drift`);
  assert(row.identityTop1Correct >= 0 && row.identityTop1Correct <= 4, `${routeId} Top1 count invalid`);
  assert(row.acceptedExact >= 0 && row.acceptedExact <= row.identityTop1Correct, `${routeId} accepted exact invalid`);
  byRouteTotal += row.total;
  byRouteTop1Correct += row.identityTop1Correct;
  byRouteAcceptedExact += row.acceptedExact;
}
assert(byRouteTotal === 88, 'by-route total drift');
assert(byRouteAcceptedExact === metrics.knownExact, 'by-route accepted exact sum drift');
assert(close(artifact.calibration.identityGlobalTop1AccuracyBeforeGate, byRouteTop1Correct / 88), 'Identity Top1 accuracy arithmetic drift');

assert(lock.version === '0.13-fallback-acceptance-v0.1-lock-v0.1' && lock.status === 'locked_fresh_calibrated', 'artifact lock contract drift');
assert(lock.artifactPath === artifactFile && lock.artifactSha256 === sha256(artifactFile), 'artifact SHA lock drift');
assert(lock.calibrationSha256 === sha256(calibrationFile) && lock.contractSha256 === sha256(contractFile), 'artifact provenance lock drift');
assert(close(lock.thresholds.routeabilityAcceptThreshold, thresholds.routeabilityAcceptThreshold) && close(lock.thresholds.identityAcceptThreshold, thresholds.identityAcceptThreshold), 'threshold lock drift');
assert(close(lock.safety.acceptedRouteAccuracy, metrics.acceptedRouteAccuracy) && close(lock.safety.overallFalseActivation, metrics.overallFalseActivation) && close(lock.safety.maxSubtypeFalseActivation, metrics.maxSubtypeFalseActivation), 'safety lock drift');
assert(lock.freshIndependentStillRequired === true && artifact.nextEvidenceRequirement === 'candidate_lock_then_fresh_post_lock_independent_evaluation', 'fresh independent requirement missing');

console.log('LiuYao Fallback Acceptance v0.1 fresh-calibrated gate verified.');
console.log(`- thresholds: routeability=${thresholds.routeabilityAcceptThreshold}; identity=${thresholds.identityAcceptThreshold}`);
console.log(`- known retention: ${metrics.knownExact}/88 = ${metrics.knownRetention}`);
console.log(`- Identity Top1 before gate: ${artifact.calibration.identityGlobalTop1AccuracyBeforeGate}`);
console.log(`- accepted route accuracy: ${metrics.acceptedRouteAccuracy}`);
console.log(`- non-route false activation: ${metrics.falseActivations}/90 = ${metrics.overallFalseActivation}`);
console.log(`- max subtype false activation: ${metrics.maxSubtypeFalseActivation}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
