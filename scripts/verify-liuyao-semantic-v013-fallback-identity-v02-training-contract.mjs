import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-fallback-identity-v0.2-training-contract.json');
const execution = readJson('data/liuyao-semantic-embedding-execution-contract-v0.1.json');
const corrected = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.json');
const correctedLock = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.lock.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.4.json');
const routeabilityLock = readJson('data/liuyao-semantic-routeability-v0.4.lock.json');
const dataLock = readJson('data/liuyao-semantic-fallback-identity-v0.1-data.lock.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');

assert(contract.version === '0.13-fallback-identity-v0.2-training-contract-v0.1', `contract version ${contract.version}`);
assert(contract.status === 'frozen_representation_correction_before_scoring', `contract status ${contract.status}`);
assert(contract.scope === 'liuyao_semantic_fallback_identity_v0.2', 'contract scope drift');
assert(contract.correctionType === 'embedding_execution_representation_only', 'correction type drift');
assert(execution.version === '0.13-semantic-embedding-execution-v0.1', 'embedding execution contract version drift');
assert(execution.status === 'frozen_after_batch_invariance_audit', 'embedding execution contract must remain frozen after audit');
assert(execution.canonicalInvocation?.textsPerEncoderCall === 1, 'canonical embedding execution must be single-text');
assert(execution.canonicalInvocation?.multiTextEncoderBatchAllowed === false, 'multi-text encoder batches must remain forbidden');
assert(corrected.status === 'frozen_representation_corrected' && corrected.encoder?.textsPerEncoderCall === 1, 'corrected semantic dependencies missing');
assert(correctedLock.status === 'locked_representation_corrected', 'corrected dependency lock missing');
assert(routeability.status === 'frozen_representation_corrected' && routeability.encoder?.textsPerEncoderCall === 1, 'corrected Routeability missing');
assert(routeabilityLock.status === 'locked_representation_corrected' && routeabilityLock.textsPerEncoderCall === 1, 'corrected Routeability lock missing');
assert(dataLock.status === 'locked', 'sealed Fallback Identity data lock missing');
assert(inventory.routes?.length === 22, `route inventory ${inventory.routes?.length} != 22`);

const rc = contract.representationCorrection || {};
assert(rc.legacyArtifactMutated === false, 'legacy Fallback Identity artifact must remain immutable');
assert(rc.textsPerEncoderCall === 1, 'representation correction must use single-text embeddings');
for (const key of ['modelMathChanged','trainingRowsChanged','calibrationRowsChanged','trainingHyperparametersRetuned','freshGeneralizationClaim']) {
  assert(rc[key] === false, `${key} must remain false`);
}

const encoder = contract.encoder || {};
assert(encoder.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift');
assert(encoder.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift');
assert(encoder.transformersJsVersion === '4.2.0', 'Transformers.js version drift');
assert(encoder.dtype === 'q8' && encoder.vectorSize === 512 && encoder.pooling === 'mean' && encoder.normalize === true, 'encoder contract drift');
assert(encoder.textsPerEncoderCall === 1, 'encoder call cardinality drift');

const model = contract.model || {};
assert(model.type === '22_independent_one_vs_rest_logistic_heads' && model.headCount === 22, 'model architecture drift');
assert(model.initialization === 'all_zero_weights_and_bias', 'initialization drift');
assert(model.optimizer === 'deterministic_full_batch_gradient_descent', 'optimizer drift');
assert(model.epochs === 360 && model.baseLearningRate === 0.42 && model.l2 === 0.0015, 'training hyperparameter drift');
assert(model.learningRateSchedule === 'baseLearningRate/(1+epoch*0.01)', 'learning rate schedule drift');
assert(model.classBalance?.enabled === true && model.classBalance?.positiveClassTotalWeight === 0.5 && model.classBalance?.negativeClassTotalWeight === 0.5, 'class balance drift');
assert(model.routeSpecificHyperparametersAllowed === false && model.traditionalLiuYaoFeaturesAllowed === false && model.randomness === 'none', 'model policy drift');

const calibration = contract.calibration || {};
assert(calibration.thresholdPolicy === 'one_global_threshold_for_all_22_heads', 'global threshold policy drift');
assert(calibration.routeSpecificThresholdsAllowed === false, 'route-specific thresholds forbidden');
assert(calibration.routeabilityThresholdMayChange === false && calibration.scopeHardVetoMayChange === false, 'upstream thresholds may not change here');
assert(calibration.constraints?.minimumAcceptedRouteAccuracy === 0.98, 'accepted accuracy gate drift');
assert(calibration.constraints?.maximumOverallNonRouteFalseActivation === 0.05, 'overall false activation gate drift');
assert(calibration.constraints?.maximumFalseActivationPerNonRouteSubtype === 0.05, 'subtype false activation gate drift');
assert(contract.dataPolicy?.reuseIsFreshEvidence === false, 'reprocessed calibration must not be fresh evidence');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/liuyao-semantic-fallback-identity-model-v01.js'), 'utf8'), context, { filename:'js/liuyao-semantic-fallback-identity-model-v01.js' });
const api = context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(api?.version === '0.1-dev' && api.vectorSize === 512, 'Fallback Identity model API missing');
assert(api.defaults?.epochs === 360 && api.defaults?.learningRate === 0.42 && api.defaults?.l2 === 0.0015, 'implementation defaults drift');

const v = (index, value=1) => { const x = new Float32Array(512); x[index] = value; return x; };
const rows = [{ expectedRoute:'financial_fortune' }, { expectedRoute:'financial_fortune' }, { expectedRoute:'business_operation' }, { expectedRoute:null }];
const vectors = [v(0), v(0,0.8), v(1), v(2)];
const options = { epochs:12, learningRate:0.2, l2:0.001 };
const a = api.trainHead(rows, vectors, 'financial_fortune', options);
const b = api.trainHead(rows, vectors, 'financial_fortune', options);
assert(a.bias === b.bias && Array.from(a.weights).every((value, index) => value === b.weights[index]), 'training must remain deterministic');
assert(api.probability(a, vectors[0]) > api.probability(a, vectors[2]), 'synthetic model sanity failed');

console.log('LiuYao Fallback Identity v0.2 representation-correction contract verified.');
console.log('- model math/data/hyperparameters: inherited unchanged from v0.1');
console.log('- canonical encoder execution: one text per call');
console.log(`- corrected Routeability threshold: ${routeabilityLock.threshold}`);
console.log('- reused calibration is representation-correction evidence only, not fresh generalization evidence');
