import './verify-liuyao-semantic-fallback-identity-v01-training-contract.mjs';
import './verify-liuyao-semantic-embedding-execution-contract-v01.mjs';
import './verify-liuyao-semantic-frozen-dependencies-v02.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readText = (relative) => read(relative).toString('utf8');
const readJson = (relative) => JSON.parse(readText(relative));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertBlob = (relative, expected) => assert(gitBlobSha(relative) === expected, `${relative} git blob drift: ${gitBlobSha(relative)} != ${expected}`);
const assertSha256 = (relative, expected) => assert(sha256(relative) === expected, `${relative} sha256 drift: ${sha256(relative)} != ${expected}`);

const correctionPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-correction-contract.json';
const correction = readJson(correctionPath);
const runtime = readJson(correction.calibrationRuntimeLock.path);
const base = readJson(correction.baseTrainingContract.path);
const legacyRuntime = readJson(runtime.legacyRuntimeLock.path);
const correctedLock = readJson(runtime.artifacts.correctedFrozenDependenciesLock.path);
const routeabilityBaseLock = readJson('data/liuyao-semantic-routeability-v0.2-execution-v0.1.lock.json');
const routeabilityCalibrationLock = readJson('data/liuyao-semantic-routeability-v0.3-execution-v0.1.lock.json');

assert(correction.status === 'locked_before_first_corrected_encoder_scoring', 'Execution correction contract is not pre-scoring locked');
assert(runtime.status === 'locked_before_first_corrected_encoder_scoring', 'Corrected calibration runtime is not pre-scoring locked');
assert(correction.scope === 'liuyao_semantic_fallback_identity_v0.1_execution_v0.1', 'Correction scope drift');
assert(runtime.scope === correction.scope, 'Runtime/correction scope mismatch');

assertBlob(correction.baseTrainingContract.path, correction.baseTrainingContract.gitBlobSha);
assertBlob(correction.baseTrainer.path, correction.baseTrainer.gitBlobSha);
assertBlob(correction.baseModelAlgorithm.path, correction.baseModelAlgorithm.gitBlobSha);
assertSha256(correction.baseModelAlgorithm.path, correction.baseModelAlgorithm.sha256);
assertBlob(correction.sealedData.lockPath, correction.sealedData.lockGitBlobSha);
assertBlob(correction.sealedData.trainingPath, correction.sealedData.trainingGitBlobSha);
assertBlob(correction.sealedData.calibrationPath, correction.sealedData.calibrationGitBlobSha);
assertBlob(correction.calibrationRuntimeLock.path, correction.calibrationRuntimeLock.gitBlobSha);
assertBlob(runtime.execution.contractPath, runtime.execution.contractGitBlobSha);
assertSha256(runtime.execution.contractPath, runtime.execution.contractSha256);

for (const [relative, expected] of Object.entries(runtime.modules)) assertBlob(relative, expected);
assert(JSON.stringify(runtime.modules) === JSON.stringify(legacyRuntime.modules), 'Decision-path module set drifted from the historical calibration freeze');

for (const item of [runtime.artifacts.correctedFrozenDependencies, runtime.artifacts.routeabilityBaseModel, runtime.artifacts.routeabilityThresholdSource]) {
  assertBlob(item.path, item.gitBlobSha);
  assertSha256(item.path, item.sha256);
}
assertBlob(runtime.artifacts.correctedFrozenDependenciesLock.path, runtime.artifacts.correctedFrozenDependenciesLock.gitBlobSha);

assert(correctedLock.status === 'locked', 'Corrected frozen dependencies are not locked');
assert(correctedLock.artifactSha256 === runtime.artifacts.correctedFrozenDependencies.sha256, 'Corrected dependency artifact hash mismatch');
assert(correctedLock.canonicalTextsPerEncoderCall === 1, 'Corrected dependencies are not single-text');
assert(correctedLock.routeabilityArtifactSha256 === runtime.artifacts.routeabilityThresholdSource.sha256, 'Corrected Routeability threshold artifact mismatch');
assert(correctedLock.routeabilityThreshold === runtime.invariants.routeabilityThreshold, 'Corrected Routeability threshold mismatch');
assert(correctedLock.scopeHardVetoCutoff === runtime.invariants.scopeHardVetoCutoff, 'Corrected Scope hard-veto mismatch');
assert(correctedLock.legacyHardVetoCutoffInherited === false, 'Legacy Scope hard-veto was inherited');

assert(routeabilityBaseLock.artifactSha256 === runtime.artifacts.routeabilityBaseModel.sha256, 'Routeability base lock mismatch');
assert(routeabilityBaseLock.canonicalTextsPerEncoderCall === 1, 'Routeability base is not single-text');
assert(routeabilityCalibrationLock.artifactSha256 === runtime.artifacts.routeabilityThresholdSource.sha256, 'Routeability calibration lock mismatch');
assert(routeabilityCalibrationLock.baseModelSha256 === runtime.artifacts.routeabilityBaseModel.sha256, 'Routeability calibration/base mismatch');
assert(routeabilityCalibrationLock.canonicalTextsPerEncoderCall === 1, 'Routeability calibration is not single-text');
assert(routeabilityCalibrationLock.threshold === runtime.invariants.routeabilityThreshold, 'Routeability calibration threshold drift');

assert(runtime.execution.canonicalTextsPerEncoderCall === 1, 'Fallback execution must encode one text per call');
assert(runtime.execution.processorCallsPerQuestion === 1, 'Fallback execution processor-call contract drift');
assert(runtime.execution.modelForwardCallsPerQuestion === 1, 'Fallback execution model-forward contract drift');
assert(runtime.temporaryInstrumentation.repositorySourceMutation === false, 'Repository source mutation is forbidden');
assert(runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.requiredExactReplacementCount === 1, 'Routeability runtime instrumentation must be exactly one replacement');
assert(runtime.invariants.legacyRouteabilityThresholdInherited === false, 'Legacy Routeability threshold inheritance forbidden');
assert(runtime.invariants.legacyScopeHardVetoCutoffInherited === false, 'Legacy Scope hard-veto inheritance forbidden');
assert(runtime.invariants.oneGlobalFallbackThresholdOnly === true, 'One-global-threshold invariant missing');
assert(runtime.invariants.routeSpecificFallbackThresholdsForbidden === true, 'Route-specific thresholds must remain forbidden');
assert(runtime.invariants.routeabilityThresholdRetuneForbidden === true, 'Routeability retuning must remain forbidden');
assert(runtime.invariants.scopeCutoffRetuneForbidden === true, 'Scope retuning must remain forbidden');

assert(base.algorithm.type === correction.preservedTrainingAlgorithm.type, 'Fallback algorithm type drift');
assert(base.algorithm.hyperparameters.epochs === correction.preservedTrainingAlgorithm.epochs, 'Epoch drift');
assert(base.algorithm.hyperparameters.learningRate === correction.preservedTrainingAlgorithm.learningRate, 'Learning-rate drift');
assert(base.algorithm.hyperparameters.l2 === correction.preservedTrainingAlgorithm.l2, 'L2 drift');
assert(base.algorithm.optimizer === correction.preservedTrainingAlgorithm.optimizer, 'Optimizer drift');
assert(base.algorithm.learningRateAtEpoch === correction.preservedTrainingAlgorithm.learningRateAtEpoch, 'Learning-rate schedule drift');
assert(JSON.stringify(base.algorithm.classBalancing) === JSON.stringify(correction.preservedTrainingAlgorithm.classBalancing), 'Class balancing drift');
assert(JSON.stringify(base.algorithm.regularization) === JSON.stringify(correction.preservedTrainingAlgorithm.regularization), 'Regularization drift');
assert(base.calibrationBoundary.routeSpecificThresholdsForbidden === true, 'Base contract no longer forbids route-specific thresholds');
assert(base.calibrationBoundary.routeabilityThresholdRetuneForbidden === true, 'Base contract no longer forbids Routeability retuning');
assert(base.calibrationBoundary.scopeCutoffRetuneForbidden === true, 'Base contract no longer forbids Scope retuning');
assert(base.calibrationBoundary.routerMarginTuningForbidden === true, 'Base contract no longer forbids Router-margin tuning');

const trainerSource = readText(correction.baseTrainer.path);
const legacyThreshold = String(runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.from);
const correctedThreshold = String(runtime.temporaryInstrumentation.routeabilityRuntimeThresholdLiteral.to);
assert(trainerSource.includes(legacyThreshold), 'Historical trainer no longer contains expected legacy Routeability threshold anchor');
assert(!trainerSource.includes(correctedThreshold), 'Historical trainer appears to have been directly corrected; temporary instrumentation boundary violated');
assert(trainerSource.includes("const embed = async (texts, chunkSize=24) =>"), 'Historical batched embed anchor drifted');

const forbiddenTokens = ['development-report', 'independent-eval', 'sealed-blind'];
const correctionText = JSON.stringify(correction);
for (const token of forbiddenTokens) assert(!correctionText.includes(token), `Correction contract illegally references ${token}`);

console.log('Fallback Identity execution-v0.1 preflight verified.');
console.log(JSON.stringify({
  correctionContractGitBlobSha:gitBlobSha(correctionPath),
  runtimeLockGitBlobSha:gitBlobSha(correction.calibrationRuntimeLock.path),
  correctedDependencySha256:runtime.artifacts.correctedFrozenDependencies.sha256,
  routeabilityThreshold:runtime.invariants.routeabilityThreshold,
  scopeHardVetoCutoff:runtime.invariants.scopeHardVetoCutoff,
  canonicalTextsPerEncoderCall:runtime.execution.canonicalTextsPerEncoderCall
}, null, 2));
