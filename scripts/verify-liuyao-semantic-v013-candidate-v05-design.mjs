import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const designFile = 'data/liuyao-semantic-v013-candidate-v05-design-v0.1.json';
const terminalFile = 'data/liuyao-semantic-v013-candidate-v04-terminal-v0.1.json';
const failureFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration-failure.json';
const design = readJson(designFile);
const terminal = readJson(terminalFile);
const failure = readJson(failureFile);

assert(design.version === '0.13-candidate-v0.5-design-v0.1' && design.status === 'design_frozen_before_v05_calibration_data', 'Candidate v0.5 design is not frozen');
assert(terminal.status === 'failed_before_candidate_lock' && terminal.candidateLockCreated === false && terminal.promotionAllowed === false, 'Candidate v0.4 terminal status drift');
assert(failure.status === 'calibration_failed_no_safe_cutoff' && failure.safeThresholdCount === 0 && failure.candidateV04Lockable === false, 'Candidate v0.4 Scope failure evidence drift');
assert(design.sourceDiagnosis?.candidateV04Terminal === terminalFile && design.sourceDiagnosis?.scopeCalibrationFailure === failureFile, 'Candidate v0.5 diagnosis provenance drift');
assert(design.sourceDiagnosis?.trainingEligible === false && design.sourceDiagnosis?.calibrationEligible === false && design.sourceDiagnosis?.independentEligible === false, 'Candidate v0.4 failure evidence reuse policy drift');
assert(design.candidateV04?.mutationAllowed === false && design.candidateV04?.scopeCalibrationMayBeReusedForV05 === false, 'Candidate v0.4 immutability/reuse policy drift');

assert(design.plannedModules?.evidence?.version === 'v0.4' && design.plannedModules?.evidence?.base === 'v0.3', 'Candidate v0.5 Evidence version drift');
assert(design.plannedModules?.evidence?.supportedCurrentTargetPrecedence === true, 'supported current-target precedence must remain');
assert(design.plannedModules?.arbitration?.version === 'v0.13' && design.plannedModules?.arbitration?.base === 'v0.12', 'Candidate v0.5 Arbitration version drift');
for (const key of ['compatibility','routeability','routerAndScopeModel','fallbackIdentity','fallbackAcceptance','selection','finalization']) {
  const module = design.plannedModules?.[key];
  assert(module, `Candidate v0.5 module missing: ${key}`);
  if (Object.hasOwn(module, 'change')) assert(module.change === 'none', `Candidate v0.5 unexpectedly changes ${key}`);
}
assert(design.plannedModules?.fallbackAcceptance?.thresholdRetune === false, 'Fallback Acceptance retune forbidden');
assert(design.plannedModules?.routerAndScopeModel?.scopeWeightsRetuned === false, 'Scope weights retune forbidden');
assert(design.plannedModules?.scopeFinalization?.freeParameter === 'one_global_scope_hard_veto_cutoff', 'Candidate v0.5 Scope free-parameter drift');
assert(design.plannedModules?.scopeFinalization?.v04CalibrationReusable === false && design.plannedModules?.scopeFinalization?.freshV05CalibrationRequired === true, 'fresh v0.5 Scope calibration discipline drift');

assert(design.regressionPolicy?.candidateV04IrreducibleRowsMayBeUsedAsRegression === true, 'v0.4 failures should remain regression evidence');
assert(design.regressionPolicy?.candidateV04IrreducibleRowsMayBeUsedForV05Calibration === false && design.regressionPolicy?.candidateV04IrreducibleRowsMayBeUsedForV05Independent === false, 'v0.4 failures must not leak into v0.5 calibration/independent');
assert(design.regressionPolicy?.requiredRegressionOutcomes?.['SC2-198'] === 'explicit_unsupported_target_before_arbitration', 'SC2-198 regression contract drift');
assert(design.regressionPolicy?.requiredRegressionOutcomes?.['SC2-220'] === 'explicit_unsupported_target_before_arbitration', 'SC2-220 regression contract drift');

const calibration = design.freshCalibrationPolicy || {};
assert(calibration.createdAfterThisDesignFreeze === true && calibration.reuseV04ScopeCalibration === false && calibration.reuseFallbackAcceptanceCalibration === false, 'fresh v0.5 calibration provenance drift');
assert(calibration.parameterCount === 1 && calibration.parameter === 'scope_hard_veto_cutoff' && calibration.otherParametersMayChange === false, 'v0.5 calibration parameter contract drift');
assert(calibration.constraints?.minimumAcceptedRouteAccuracy === 0.98 && calibration.constraints?.maximumOverallFalseRouteActivation === 0.05 && calibration.constraints?.maximumFalseRouteActivationPerNonRouteSubtype === 0.05, 'v0.5 calibration safety constraints drift');
assert(design.evaluationPolicy?.promotionGates?.minimumKnownExactRoute === 0.8 && design.evaluationPolicy?.promotionGates?.minimumAcceptedRouteAccuracy === 0.98, 'v0.5 promotion retention/accuracy gates drift');
assert(design.evaluationPolicy?.promotionGates?.maximumOverallFalseRouteActivation === 0.05 && design.evaluationPolicy?.promotionGates?.maximumFalseRouteActivationPerNonRouteSubtype === 0.05, 'v0.5 promotion FA gates drift');
assert(design.evaluationPolicy?.candidateLockBeforeIndependent === true && design.evaluationPolicy?.freshPostLockIndependentRequired === true && design.evaluationPolicy?.sameVersionRetuneAfterIndependent === false, 'v0.5 independent-eval discipline drift');
assert(design.traditionalBoundary?.traditionalObservationSelectionModified === false && design.traditionalBoundary?.timeEngineModified === false && design.traditionalBoundary?.baziModified === false && design.traditionalBoundary?.shicaoModified === false, 'Candidate v0.5 boundary violation');

console.log('LiuYao Candidate v0.5 design freeze verified.');
console.log('- Candidate v0.4 is terminally failed before lock; its Scope calibration is regression-only for v0.5');
console.log('- v0.5 change surface: Evidence v0.4 + Arbitration v0.13 default extractor only');
console.log('- learned Router/Scope/Routeability/Identity and Fallback Acceptance remain frozen');
console.log('- fresh v0.5 Scope calibration has exactly one free parameter and preserves 98% / 5% / 5% safety gates');
console.log(`- design SHA-256: ${sha256(designFile)}`);
