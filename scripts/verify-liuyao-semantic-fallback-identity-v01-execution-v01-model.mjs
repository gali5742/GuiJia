import './verify-liuyao-semantic-fallback-identity-v01-execution-v01-preflight.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const correctionPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-correction-contract.json';
const correction = readJson(correctionPath);
const runtime = readJson(correction.calibrationRuntimeLock.path);
const base = readJson(correction.baseTrainingContract.path);
const model = readJson(correction.outputs.model);
const lock = readJson(correction.outputs.modelLock);
const report = readJson(correction.outputs.calibrationReport);

assert(report.status === 'feasible_global_threshold_selected', `Corrected calibration did not pass: ${report.status}`);
assert(model.status === 'frozen', `Corrected model is not frozen: ${model.status}`);
assert(lock.status === 'locked', 'Corrected model lock is not locked');
assert(model.scope === correction.scope && report.scope === correction.scope, 'Corrected output scope mismatch');
assert(lock.artifact === correction.outputs.model, 'Model lock artifact path mismatch');
assert(lock.artifactSha256 === sha256(correction.outputs.model), 'Model lock artifact SHA mismatch');
assert(lock.calibrationReport === correction.outputs.calibrationReport, 'Calibration report path mismatch');
assert(lock.calibrationReportSha256 === sha256(correction.outputs.calibrationReport), 'Calibration report SHA mismatch');
assert(lock.executionCorrectionContract.gitBlobSha === gitBlobSha(correctionPath), 'Correction contract blob mismatch in model lock');
assert(lock.calibrationRuntimeLock.gitBlobSha === gitBlobSha(correction.calibrationRuntimeLock.path), 'Calibration runtime lock blob mismatch in model lock');

assert(model.execution?.canonicalTextsPerEncoderCall === 1, 'Corrected model is not single-text');
assert(lock.canonicalTextsPerEncoderCall === 1, 'Corrected model lock is not single-text');
assert(report.executionCorrection?.canonicalTextsPerEncoderCall === 1, 'Corrected report is not single-text');
assert(model.execution?.contractSha256 === runtime.execution.contractSha256, 'Execution contract SHA mismatch');
assert(model.correctedDependencies?.frozenDependenciesSha256 === runtime.artifacts.correctedFrozenDependencies.sha256, 'Corrected dependency snapshot mismatch');
assert(model.correctedDependencies?.routeabilityBaseModelSha256 === runtime.artifacts.routeabilityBaseModel.sha256, 'Corrected Routeability base mismatch');
assert(model.correctedDependencies?.routeabilityThresholdArtifactSha256 === runtime.artifacts.routeabilityThresholdSource.sha256, 'Corrected Routeability threshold artifact mismatch');
assert(model.correctedDependencies?.routeabilityThreshold === runtime.invariants.routeabilityThreshold, 'Corrected Routeability threshold mismatch');
assert(model.correctedDependencies?.scopeHardVetoCutoff === runtime.invariants.scopeHardVetoCutoff, 'Corrected Scope hard-veto mismatch');
assert(lock.routeabilityThreshold === runtime.invariants.routeabilityThreshold, 'Locked Routeability threshold mismatch');
assert(lock.scopeHardVetoCutoff === runtime.invariants.scopeHardVetoCutoff, 'Locked Scope hard-veto mismatch');
assert(lock.routeabilityThreshold !== 0.7675678218564946, 'Legacy Routeability threshold leaked into corrected lock');
assert(lock.scopeHardVetoCutoff !== 0.4196, 'Legacy Scope hard-veto leaked into corrected lock');

const heads = model.model?.heads || {};
const routeIds = base.algorithm.routeOrder;
assert(routeIds.length === 22, 'Base route count drift');
assert(Object.keys(heads).length === 22, `Corrected head count ${Object.keys(heads).length} != 22`);
assert(Object.keys(heads).every((routeId) => routeIds.includes(routeId)), 'Corrected model contains a non-frozen route');
for (const routeId of routeIds) {
  const head = heads[routeId];
  assert(head && Array.isArray(head.weights) && head.weights.length === 512, `${routeId} head shape invalid`);
  assert(Number.isFinite(head.bias), `${routeId} bias invalid`);
}
assert(model.training?.hyperparameters?.epochs === 360, 'Epoch drift in generated model');
assert(model.training?.hyperparameters?.learningRate === 0.42, 'Learning-rate drift in generated model');
assert(model.training?.hyperparameters?.l2 === 0.0015, 'L2 drift in generated model');
assert(JSON.stringify(model.training?.classBalancing) === JSON.stringify(base.algorithm.classBalancing), 'Class balancing drift in generated model');

const selected = report.selected;
assert(selected && Number.isFinite(selected.threshold), 'No corrected global threshold selected');
assert(model.calibration && model.calibration.threshold === selected.threshold, 'Model/report threshold mismatch');
assert(lock.globalThreshold === selected.threshold, 'Lock/report threshold mismatch');
assert(report.policy?.oneGlobalThresholdOnly === true, 'Report lost one-global-threshold policy');
assert(report.policy?.routeSpecificThresholds === false, 'Report permits route-specific thresholds');
assert(lock.routeSpecificThresholds === false, 'Lock permits route-specific thresholds');
assert(report.policy?.routeabilityThresholdRetuned === false, 'Fallback calibration retuned Routeability');
assert(report.policy?.scopeCutoffRetuned === false, 'Fallback calibration retuned Scope hard-veto');
assert(report.policy?.routerMarginTuned === false, 'Fallback calibration tuned Router margin');

assert(selected.acceptedRouteAccuracy >= correction.calibrationHardGates.acceptedRouteAccuracyMin, `Accepted route accuracy ${selected.acceptedRouteAccuracy} below hard gate`);
assert(selected.overallFalseActivation <= correction.calibrationHardGates.overallNonrouteFalseActivationMax, `Overall nonroute false activation ${selected.overallFalseActivation} above hard gate`);
assert(selected.maxSubtypeFalseActivation <= correction.calibrationHardGates.eachNonrouteSubtypeFalseActivationMax, `Worst subtype false activation ${selected.maxSubtypeFalseActivation} above hard gate`);
assert(selected.checks?.acceptedRouteAccuracy === true, 'Accepted-route-accuracy check false');
assert(selected.checks?.overallFalseActivation === true, 'Overall false-activation check false');
assert(selected.checks?.perSubtypeFalseActivation === true, 'Per-subtype false-activation check false');
for (const [subtype, row] of Object.entries(selected.byNonRouteSubtype || {})) {
  assert(row.falseRouteActivation <= correction.calibrationHardGates.eachNonrouteSubtypeFalseActivationMax, `${subtype} false activation ${row.falseRouteActivation} above hard gate`);
}

const forbiddenThresholdMaps = ['routeThresholds', 'thresholdByRoute', 'routeSpecificThresholdMap', 'perRouteThresholds'];
const serialized = JSON.stringify({ model, lock, report });
for (const key of forbiddenThresholdMaps) assert(!serialized.includes(`\"${key}\"`), `Forbidden route-specific threshold structure found: ${key}`);

const sourcePaths = new Set((model.sources || []).map((item) => item.path));
assert(sourcePaths.has(correctionPath), 'Correction contract missing from generated model provenance');
assert(sourcePaths.has(correction.calibrationRuntimeLock.path), 'Corrected runtime lock missing from generated model provenance');
assert(sourcePaths.has(runtime.artifacts.routeabilityThresholdSource.path), 'Corrected Routeability threshold source missing from generated model provenance');
assert(!sourcePaths.has('data/liuyao-semantic-fallback-identity-v0.1-calibration-runtime.lock.json'), 'Legacy calibration runtime lock incorrectly listed as active corrected provenance');
assert(!sourcePaths.has('data/liuyao-semantic-frozen-dependencies-v0.1.lock.json'), 'Legacy frozen dependency lock leaked into corrected provenance');
assert(!sourcePaths.has('data/liuyao-semantic-routeability-v0.2.json'), 'Legacy Routeability base leaked into corrected provenance');

console.log('Fallback Identity execution-v0.1 model/calibration verified.');
console.log(JSON.stringify({
  globalThreshold:selected.threshold,
  knownRetention:selected.knownRetention,
  acceptedRouteAccuracy:selected.acceptedRouteAccuracy,
  overallFalseActivation:selected.overallFalseActivation,
  maxSubtypeFalseActivation:selected.maxSubtypeFalseActivation,
  byNonRouteSubtype:selected.byNonRouteSubtype,
  routeabilityThreshold:lock.routeabilityThreshold,
  scopeHardVetoCutoff:lock.scopeHardVetoCutoff,
  artifactSha256:lock.artifactSha256
}, null, 2));
