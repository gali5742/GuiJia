import './verify-liuyao-semantic-fallback-identity-v01-training-contract.mjs';
import './verify-liuyao-semantic-fallback-identity-v01-calibration-runtime-lock.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.json';
const lockPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json';
const reportPath = 'data/liuyao-semantic-fallback-identity-v0.1-calibration-report.json';
const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
const report = readJson(reportPath);
const contract = readJson(contractPath);

assert(artifact.version === '0.13-fallback-identity-v0.1-model-v0.1', `artifact version drift: ${artifact.version}`);
assert(artifact.status === 'frozen', `Fallback Identity artifact not frozen: ${artifact.status}`);
assert(artifact.scope === 'liuyao_semantic_fallback_identity_v0.1', `artifact scope drift: ${artifact.scope}`);
assert(lock.version === '0.13-fallback-identity-v0.1-model-lock-v0.1', `lock version drift: ${lock.version}`);
assert(lock.status === 'locked', `lock status drift: ${lock.status}`);
assert(lock.artifact === artifactPath, 'lock artifact path drift');
assert(lock.artifactSha256 === sha256File(artifactPath), 'Fallback Identity artifact SHA drift');
assert(lock.trainingContractSha256 === sha256File(contractPath), 'training contract SHA drift after model freeze');
assert(lock.calibrationRuntimeLockGitBlobSha === contract.calibrationRuntimeLock.gitBlobSha, 'model lock calibration-runtime binding drift');
assert(lock.calibrationReport === reportPath, 'calibration report path drift');
assert(lock.calibrationReportSha256 === sha256File(reportPath), 'calibration report SHA drift');
assert(artifact.trainingContract?.sha256 === sha256File(contractPath), 'artifact training-contract binding drift');
assert(artifact.calibrationRuntimeLock?.path === contract.calibrationRuntimeLock.path, 'artifact calibration-runtime path drift');
assert(artifact.calibrationRuntimeLock?.gitBlobSha === contract.calibrationRuntimeLock.gitBlobSha, 'artifact calibration-runtime Git blob drift');

assert(report.status === 'feasible_global_threshold_selected', `calibration report status ${report.status} is not feasible`);
assert(report.policy?.calibrationTrainsModel === false, 'calibration must not train model');
assert(report.policy?.oneGlobalThresholdOnly === true, 'calibration must select one global threshold only');
assert(report.policy?.routeSpecificThresholds === false, 'route-specific threshold policy drift');
assert(report.policy?.routeabilityThresholdRetuned === false, 'Routeability threshold was retuned');
assert(report.policy?.scopeCutoffRetuned === false, 'Scope cutoff was retuned');
assert(report.policy?.routerMarginTuned === false, 'Router margin was tuned');
assert(report.calibrationRows?.total === 134, `calibration total ${report.calibrationRows?.total} != 134`);
assert(report.calibrationRows?.known === 66, `calibration known ${report.calibrationRows?.known} != 66`);
assert(report.calibrationRows?.nonRoute === 68, `calibration nonroute ${report.calibrationRows?.nonRoute} != 68`);

const selected = report.selected;
assert(selected && Number.isFinite(selected.threshold) && selected.threshold >= 0 && selected.threshold <= 1, 'selected global threshold missing/invalid');
assert(selected.acceptedRouteAccuracy >= 0.98, `accepted route accuracy ${selected.acceptedRouteAccuracy} < 0.98`);
assert(selected.overallFalseActivation <= 0.05, `overall nonroute false activation ${selected.overallFalseActivation} > 0.05`);
assert(Object.values(selected.byNonRouteSubtype || {}).length > 0, 'nonroute subtype calibration metrics missing');
for (const [subtype, metrics] of Object.entries(selected.byNonRouteSubtype || {})) {
  assert(metrics.falseRouteActivation <= 0.05, `${subtype} false route activation ${metrics.falseRouteActivation} > 0.05`);
}
assert(lock.globalThreshold === selected.threshold, 'lock threshold != calibration selected threshold');
assert(artifact.calibration?.threshold === selected.threshold, 'artifact threshold != calibration selected threshold');
assert(lock.routeSpecificThresholds === false, 'lock unexpectedly permits route-specific thresholds');
assert(lock.routeabilityThreshold === 0.7675678218564946, `Routeability threshold drift: ${lock.routeabilityThreshold}`);
assert(lock.scopeHardVetoCutoff === 0.4196, `Scope cutoff drift: ${lock.scopeHardVetoCutoff}`);

const routeIds = contract.algorithm.routeOrder;
assert(routeIds.length === 22, `contract routes ${routeIds.length} != 22`);
assert(lock.routeCount === 22, `lock routes ${lock.routeCount} != 22`);
assert(lock.vectorSize === 512, `lock vector size ${lock.vectorSize} != 512`);
const heads = artifact.model?.heads || {};
assert(Object.keys(heads).length === 22, `artifact head count ${Object.keys(heads).length} != 22`);
for (const routeId of routeIds) {
  const head = heads[routeId];
  assert(head, `missing Fallback Identity head: ${routeId}`);
  assert(Array.isArray(head.weights) && head.weights.length === 512, `${routeId} weight dimension drift`);
  assert(Number.isFinite(head.bias), `${routeId} bias missing`);
  assert(Number.isInteger(head.positiveCount) && head.positiveCount > 0, `${routeId} positive count invalid`);
  assert(Number.isInteger(head.negativeCount) && head.negativeCount > 0, `${routeId} negative count invalid`);
  assert(!Object.prototype.hasOwnProperty.call(head, 'threshold'), `${routeId} carries forbidden route-specific threshold`);
}
assert(Object.keys(heads).every((routeId) => routeIds.includes(routeId)), 'artifact contains non-current22 head');

assert(artifact.encoder?.revision === contract.encoder.revision, 'artifact encoder revision drift');
assert(artifact.encoder?.vectorSize === 512, 'artifact encoder vector size drift');
assert(artifact.encoder?.dtype === 'q8', 'artifact encoder dtype drift');
assert(artifact.training?.hyperparameters?.epochs === 360, 'artifact epochs drift');
assert(artifact.training?.hyperparameters?.learningRate === 0.42, 'artifact learning rate drift');
assert(artifact.training?.hyperparameters?.l2 === 0.0015, 'artifact l2 drift');
assert(artifact.training?.classBalancing?.positiveTotalWeight === 0.5, 'artifact positive class total weight drift');
assert(artifact.training?.classBalancing?.negativeTotalWeight === 0.5, 'artifact negative class total weight drift');

for (const source of artifact.sources || []) {
  assert(typeof source.path === 'string' && typeof source.sha256 === 'string', 'artifact source binding malformed');
  assert(sha256File(source.path) === source.sha256, `artifact source drift: ${source.path}`);
}
assert((artifact.sources || []).some((source) => source.path === contract.sealedData.trainingPath), 'sealed fresh training source missing from artifact');
assert((artifact.sources || []).some((source) => source.path === contract.sealedData.calibrationPath), 'sealed calibration source missing from artifact');
assert((artifact.sources || []).some((source) => source.path === contract.calibrationRuntimeLock.path), 'calibration runtime lock missing from artifact sources');

const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const serialized = JSON.stringify(artifact);
for (const term of forbiddenTerms) assert(!serialized.includes(term), `traditional field leaked into model artifact: ${term}`);

console.log('Fallback Identity v0.1 frozen model verified.');
console.log(`- heads: ${Object.keys(heads).length}`);
console.log(`- global threshold: ${selected.threshold}`);
console.log(`- calibration known retention: ${selected.knownRetention}`);
console.log(`- calibration known exact: ${selected.knownExactRoute}`);
console.log(`- calibration accepted accuracy: ${selected.acceptedRouteAccuracy}`);
console.log(`- calibration overall false activation: ${selected.overallFalseActivation}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
