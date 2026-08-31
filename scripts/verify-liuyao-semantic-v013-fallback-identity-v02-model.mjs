import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-fallback-identity-v0.2.json';
const lockPath = 'data/liuyao-semantic-fallback-identity-v0.2.lock.json';
const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
const contract = readJson('data/liuyao-semantic-fallback-identity-v0.2-training-contract.json');
const dataLock = readJson('data/liuyao-semantic-fallback-identity-v0.1-data.lock.json');
const correctedLock = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.lock.json');
const routeabilityLock = readJson('data/liuyao-semantic-routeability-v0.4.lock.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);

assert(artifact.version === '0.2' && artifact.status === 'frozen_representation_corrected', 'artifact version/status mismatch');
assert(artifact.scope === 'liuyao_semantic_fallback_identity_v0.2', 'artifact scope mismatch');
assert(artifact.encoder?.textsPerEncoderCall === 1, 'artifact must use single-text embeddings');
assert(artifact.representationCorrection?.legacyArtifactMutated === false, 'legacy artifact mutation forbidden');
for (const key of ['modelMathChanged','trainingRowsChanged','calibrationRowsChanged','trainingHyperparametersRetuned','freshGeneralizationClaim']) {
  assert(artifact.representationCorrection?.[key] === false, `${key} must remain false`);
}
assert(routeIds.length === 22 && artifact.routeOrder?.length === 22, 'route count mismatch');
assert(routeIds.every((id, index) => artifact.routeOrder[index] === id), 'route order mismatch');
assert(Object.keys(artifact.model?.heads || {}).length === 22, 'head count mismatch');
for (const routeId of routeIds) {
  const head = artifact.model.heads[routeId];
  assert(head?.weights?.length === 512, `${routeId} weight shape mismatch`);
  assert(head.weights.every(Number.isFinite), `${routeId} contains non-finite weights`);
  assert(Number.isFinite(head.bias), `${routeId} bias invalid`);
  assert(head.trainingCounts?.positive > 0 && head.trainingCounts?.negative > 0, `${routeId} class counts invalid`);
}

assert(artifact.training?.total === 974, `training total ${artifact.training?.total} != 974`);
assert(artifact.training?.nonRoute === 213, `training non-route ${artifact.training?.nonRoute} != 213`);
assert(artifact.dataLock?.trainingSha256 === dataLock.trainingSha256 && artifact.dataLock?.calibrationSha256 === dataLock.calibrationSha256, 'sealed data SHA drift');
assert(artifact.trainingContract?.sha256 === sha256('data/liuyao-semantic-fallback-identity-v0.2-training-contract.json'), 'training contract SHA drift');
assert(artifact.dependencies?.correctedSemanticDependencies?.sha256 === correctedLock.artifactSha256, 'corrected dependency SHA drift');
assert(artifact.dependencies?.correctedRouteability?.sha256 === routeabilityLock.artifactSha256, 'corrected Routeability SHA drift');
assert(artifact.dependencies?.correctedRouteability?.threshold === routeabilityLock.threshold, 'corrected Routeability threshold drift');

const calibration = artifact.calibration || {};
const metrics = calibration.metrics || {};
assert(calibration.evidenceStatus === 'representation_correction_reprocessed_not_fresh', 'calibration evidence status mismatch');
assert(calibration.thresholdPolicy === 'one_global_threshold_for_all_22_heads', 'global threshold policy mismatch');
assert(Number.isFinite(calibration.threshold) && calibration.threshold > 0 && calibration.threshold < 1, 'global threshold invalid');
assert(calibration.routeSpecificThresholds === false, 'route-specific thresholds forbidden');
assert(calibration.routeabilityThresholdRetuned === false && calibration.scopeHardVetoRetuned === false, 'upstream thresholds retuned');
assert(metrics.acceptedRouteAccuracy + 1e-12 >= contract.calibration.constraints.minimumAcceptedRouteAccuracy, `accepted route accuracy ${metrics.acceptedRouteAccuracy} below gate`);
assert(metrics.overallNonRouteFalseActivation <= contract.calibration.constraints.maximumOverallNonRouteFalseActivation + 1e-12, `overall false activation ${metrics.overallNonRouteFalseActivation} above gate`);
assert(metrics.maximumSubtypeFalseActivation <= contract.calibration.constraints.maximumFalseActivationPerNonRouteSubtype + 1e-12, `subtype false activation ${metrics.maximumSubtypeFalseActivation} above gate`);
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  assert(metrics.bySubtype?.[subtype], `missing subtype metric ${subtype}`);
  assert(metrics.bySubtype[subtype].falseActivation <= 0.05 + 1e-12, `${subtype} false activation above gate`);
}
assert(metrics.knownTotal === 66 && calibration.total === 134 && calibration.known === 66 && calibration.nonRoute === 68, 'calibration counts drift');
assert(metrics.eligibleKnown <= metrics.knownTotal && metrics.eligibleNonRoute <= calibration.nonRoute, 'eligibility counts invalid');

assert(lock.version === '0.13-fallback-identity-v0.2-model-lock-v0.1' && lock.status === 'locked_representation_corrected', 'lock version/status mismatch');
assert(lock.artifactPath === artifactPath, 'lock artifact path mismatch');
assert(lock.artifactSha256 === sha256(artifactPath), 'artifact SHA mismatch');
assert(lock.trainingContractSha256 === sha256('data/liuyao-semantic-fallback-identity-v0.2-training-contract.json'), 'lock contract SHA mismatch');
assert(lock.dataLockSha256 === sha256('data/liuyao-semantic-fallback-identity-v0.1-data.lock.json'), 'lock data SHA mismatch');
assert(lock.correctedDependencySha256 === correctedLock.artifactSha256, 'lock corrected dependency SHA mismatch');
assert(lock.correctedRouteabilitySha256 === routeabilityLock.artifactSha256, 'lock Routeability SHA mismatch');
assert(lock.threshold === calibration.threshold && lock.routeabilityThreshold === routeabilityLock.threshold, 'lock threshold mismatch');
assert(lock.textsPerEncoderCall === 1, 'lock embedding execution mismatch');
assert(lock.calibrationEvidenceStatus === 'representation_correction_reprocessed_not_fresh', 'lock evidence status mismatch');
assert(lock.policy?.runtimeLoadOnly === true && lock.policy?.routeSpecificThresholds === false && lock.policy?.calibrationMayNotRetrainModel === true, 'lock runtime policy drift');

const sourcePaths = new Set((artifact.sources || []).map((row) => row.path));
for (const forbiddenFragment of ['sealed-blind','independent-eval','development-report','routeability-v0.3-calibration']) {
  const leakedTrain = (artifact.sources || []).some((row) => row.role?.includes('train') && row.path.includes(forbiddenFragment));
  assert(!leakedTrain, `forbidden training source leaked: ${forbiddenFragment}`);
}
assert(sourcePaths.has('data/liuyao-semantic-embedding-execution-contract-v0.1.json'), 'execution contract source missing');

console.log('LiuYao Fallback Identity v0.2 corrected model verified.');
console.log('- heads: 22 x 512; canonical single-text representation');
console.log(`- global threshold: ${calibration.threshold}`);
console.log(`- eligible known: ${metrics.eligibleKnown}/${metrics.knownTotal}`);
console.log(`- known retention: ${metrics.knownRetention}`);
console.log(`- accepted route accuracy: ${metrics.acceptedRouteAccuracy}`);
console.log(`- non-route false activation: ${metrics.overallNonRouteFalseActivation}`);
console.log(`- maximum subtype false activation: ${metrics.maximumSubtypeFalseActivation}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
