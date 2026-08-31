import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-fallback-identity-v0.1-training-contract.json');
const design = readJson('data/liuyao-semantic-v013-candidate-v03-design-v0.1.json');
const dataLock = readJson('data/liuyao-semantic-fallback-identity-v0.1-data.lock.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');

assert(contract.version === '0.13-fallback-identity-v0.1-training-contract-v0.1', `training contract version ${contract.version}`);
assert(contract.status === 'frozen_before_first_model_scoring', `training contract status ${contract.status}`);
assert(contract.scope === 'liuyao_semantic_fallback_identity_v0.1', 'training contract scope drift');
assert(design.status === 'design_frozen_before_v03_data', 'candidate v0.3 design must remain frozen');
assert(dataLock.status === 'locked', 'Fallback Identity fresh data must be locked before model scoring');
assert(inventory.routes?.length === 22, `route inventory ${inventory.routes?.length} != 22`);

const encoder = contract.encoder || {};
assert(encoder.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift');
assert(encoder.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift');
assert(encoder.transformersJsVersion === '4.2.0', 'Transformers.js version drift');
assert(encoder.dtype === 'q8' && encoder.vectorSize === 512 && encoder.pooling === 'mean' && encoder.normalize === true, 'encoder contract drift');

const model = contract.model || {};
assert(model.type === '22_independent_one_vs_rest_logistic_heads', 'model type drift');
assert(model.headCount === 22, 'head count drift');
assert(model.initialization === 'all_zero_weights_and_bias', 'initialization drift');
assert(model.optimizer === 'deterministic_full_batch_gradient_descent', 'optimizer drift');
assert(model.epochs === 360, `epochs drift ${model.epochs}`);
assert(model.baseLearningRate === 0.42, `learning rate drift ${model.baseLearningRate}`);
assert(model.learningRateSchedule === 'baseLearningRate/(1+epoch*0.01)', 'learning-rate schedule drift');
assert(model.l2 === 0.0015, `l2 drift ${model.l2}`);
assert(model.classBalance?.enabled === true, 'class balance must be enabled');
assert(model.classBalance?.positiveClassTotalWeight === 0.5 && model.classBalance?.negativeClassTotalWeight === 0.5, 'class weight totals drift');
assert(model.routeSpecificHyperparametersAllowed === false, 'route-specific hyperparameters forbidden');
assert(model.traditionalLiuYaoFeaturesAllowed === false, 'traditional features forbidden');
assert(model.randomness === 'none', 'training randomness forbidden');

const forbidden = new Set(contract.trainingDataPolicy?.forbidden || []);
for (const required of [
  'all Router validation splits',
  'all sealed blind corpora',
  'Candidate v0.1 independent eval',
  'Candidate v0.2 independent eval',
  'v0.13 development evaluation',
  'Routeability v0.3 calibration',
  'Fallback Identity v0.1 calibration'
]) assert(forbidden.has(required), `training forbidden-source contract missing: ${required}`);

const calibration = contract.calibration || {};
assert(calibration.thresholdPolicy === 'one_global_threshold_for_all_22_heads', 'global threshold contract drift');
assert(calibration.routeSpecificThresholdsAllowed === false, 'route-specific thresholds forbidden');
assert(calibration.routeabilityThresholdMayChange === false && calibration.scopeHardVetoMayChange === false, 'upstream thresholds may not change');
assert(calibration.constraints?.minimumAcceptedRouteAccuracy === 0.98, 'accepted accuracy gate drift');
assert(calibration.constraints?.maximumOverallNonRouteFalseActivation === 0.05, 'overall false activation gate drift');
assert(calibration.constraints?.maximumFalseActivationPerNonRouteSubtype === 0.05, 'subtype false activation gate drift');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'js/liuyao-semantic-fallback-identity-model-v01.js'), 'utf8'),
  context,
  { filename:'js/liuyao-semantic-fallback-identity-model-v01.js' }
);
const api = context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(api?.version === '0.1-dev' && api.vectorSize === 512, 'Fallback Identity model API missing');
assert(api.defaults?.epochs === 360 && api.defaults?.learningRate === 0.42 && api.defaults?.l2 === 0.0015, 'implementation defaults drift from frozen contract');

const vector = (index, sign=1) => {
  const v = new Float32Array(512);
  v[index] = sign;
  return v;
};
const rows = [
  { expectedRoute:'financial_fortune' },
  { expectedRoute:'financial_fortune' },
  { expectedRoute:'business_operation' },
  { expectedRoute:null }
];
const vectors = [vector(0,1), vector(0,0.8), vector(1,1), vector(2,1)];
const options = { epochs:12, learningRate:0.2, l2:0.001 };
const a = api.trainHead(rows, vectors, 'financial_fortune', options);
const b = api.trainHead(rows, vectors, 'financial_fortune', options);
assert(a.trainingCounts.positive === 2 && a.trainingCounts.negative === 2, 'synthetic class counts drift');
assert(a.bias === b.bias, 'deterministic training bias mismatch');
assert(Array.from(a.weights).every((value, index) => value === b.weights[index]), 'deterministic training weights mismatch');
assert(api.probability(a, vectors[0]) > api.probability(a, vectors[2]), 'synthetic positive should score above negative');

console.log('LiuYao Fallback Identity v0.1 training contract verified.');
console.log('- model: 22 independent class-balanced one-vs-rest logistic heads');
console.log('- optimizer: deterministic full-batch GD; epochs=360; lr=0.42; l2=0.0015');
console.log('- calibration: one global threshold; accepted accuracy >=98%; overall/subtype false activation <=5%');
console.log('- sealed blind/independent/development/calibration leakage into training: forbidden by contract');
