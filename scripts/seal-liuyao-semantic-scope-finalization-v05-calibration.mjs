import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = 'data/liuyao-semantic-scope-finalization-v0.5-calibration.json';
const lockFile = 'data/liuyao-semantic-scope-finalization-v0.5-calibration.lock.json';
const patchFile = 'data/liuyao-semantic-scope-finalization-v0.5-calibration-preseal-patch.json';
const designFile = 'data/liuyao-semantic-v013-candidate-v07-design-v0.1.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const calibration = readJson(calibrationFile);
const design = readJson(designFile);
const patch = readJson(patchFile);
assert(design.status === 'design_frozen_before_v07_question_mode_implementation_and_calibration_data', 'Candidate v0.7 design is not frozen');
assert(calibration.version === '0.13-scope-finalization-v0.5-calibration-v0.1', `unexpected calibration version ${calibration.version}`);
assert(calibration.status === 'presealed_fresh_scope_calibration' && calibration.sealed === false, 'Candidate v0.7 Scope calibration is not presealed');
assert(calibration.rows?.length === 222 && calibration.counts?.route_known === 132 && calibration.counts?.non_route === 90, 'Candidate v0.7 Scope calibration counts drift');
assert(calibration.policy?.parameterCount === 1 && calibration.policy?.parameterToCalibrate === 'scope_hard_veto_cutoff', 'Candidate v0.7 Scope calibration parameter contract drift');
assert(calibration.policy?.otherModelOrGateParametersMayChange === false && calibration.policy?.multiTextEncoderBatchForbidden === true, 'Candidate v0.7 Scope mutation/representation policy drift');
assert(calibration.policy?.candidateV06ScopeCalibrationExcluded === true && calibration.policy?.candidateV05ScopeCalibrationExcluded === true && calibration.policy?.candidateV04ScopeCalibrationExcluded === true && calibration.policy?.allDevelopmentIndependentBlindExcluded === true && calibration.policy?.predecessorRegressionRowsExcluded === true, 'Candidate v0.7 source exclusion policy drift');
assert(patch.status === 'recorded_before_seal_and_before_scope_scoring', 'Candidate v0.7 preseal patch status drift');
assert(patch.modelOrThresholdScoredBeforePatch === false && patch.semanticRuntimeModified === false && patch.questionModeModified === false && patch.verifierWeakened === false, 'Candidate v0.7 preseal patch provenance drift');
assert(Array.isArray(patch.changes) && patch.changes.length > 0, 'Candidate v0.7 preseal patch changes missing');

const sealed = {
  ...calibration,
  status:'sealed_fresh_scope_calibration',
  sealed:true,
  sealing:{
    sealedAt:new Date().toISOString(),
    immutableForScopeThresholdCalibration:true,
    wordingMayChangeAfterSeal:false,
    rowsMayBeAddedAfterSeal:false,
    labelsMayChangeAfterSeal:false,
    mayBeReusedAsDevelopmentIndependentOrBlind:false
  }
};
writeJson(calibrationFile, sealed);

const lock = {
  version:'0.13-scope-finalization-v0.5-calibration-lock-v0.1',
  status:'locked',
  scope:'liuyao_semantic_candidate_v0.7_scope_finalization',
  calibrationPath:calibrationFile,
  calibrationSha256:sha256(calibrationFile),
  presealPatchPath:patchFile,
  presealPatchSha256:sha256(patchFile),
  designPath:designFile,
  designSha256:sha256(designFile),
  designFreezeCommit:sealed.provenance.designFreezeCommit,
  counts:sealed.counts,
  policy:{
    useForTraining:false,
    useForScopeThresholdCalibration:true,
    reuseAsDevelopmentEval:false,
    reuseAsIndependent:false,
    reuseAsBlind:false,
    parameterCount:1,
    parameter:'scope_hard_veto_cutoff',
    otherModelOrGateParametersMayChange:false,
    multiTextEncoderBatchForbidden:true,
    candidateV06ScopeCalibrationExcluded:true,
    candidateV05ScopeCalibrationExcluded:true,
    candidateV04ScopeCalibrationExcluded:true,
    fallbackAcceptanceCalibrationExcluded:true,
    routeabilityCalibrationExcluded:true,
    allDevelopmentIndependentBlindExcluded:true,
    predecessorRegressionRowsExcluded:true
  }
};
writeJson(lockFile, lock);
console.log('LiuYao Candidate v0.7 fresh Scope calibration sealed.');
console.log(`- calibration SHA-256: ${lock.calibrationSha256}`);
console.log(`- preseal patch SHA-256: ${lock.presealPatchSha256}`);
console.log(`- design SHA-256: ${lock.designSha256}`);
console.log('- 222 rows are immutable for the single Scope cutoff calibration');
