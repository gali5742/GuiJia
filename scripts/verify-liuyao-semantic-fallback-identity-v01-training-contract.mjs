import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const sha256File = (relative) => crypto.createHash('sha256').update(readBytes(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = readBytes(relative);
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const contract = readJson(contractPath);
const dataLock = readJson(contract.sealedData.lockPath);
const dependencyLock = readJson(contract.encoder.dependencyLockPath);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const training = readJson(contract.sealedData.trainingPath);
const calibration = readJson(contract.sealedData.calibrationPath);

assert(contract.version === '0.13-fallback-identity-v0.1-training-contract-v0.1', `contract version drift: ${contract.version}`);
assert(contract.status === 'locked_before_first_encoder_scoring', `contract status drift: ${contract.status}`);
assert(contract.scope === 'liuyao_semantic_fallback_identity_v0.1', `contract scope drift: ${contract.scope}`);

assert(sha256File(contract.candidateDesign.path) === contract.candidateDesign.sha256, 'Candidate v0.3 design SHA drift');
assert(sha256File(contract.sealedData.lockPath) === contract.sealedData.lockSha256, 'Fallback Identity data lock SHA drift');
assert(sha256File(contract.sealedData.trainingPath) === contract.sealedData.trainingSha256, 'sealed training SHA drift');
assert(sha256File(contract.sealedData.calibrationPath) === contract.sealedData.calibrationSha256, 'sealed calibration SHA drift');
assert(sha256File(contract.encoder.dependencyLockPath) === contract.encoder.dependencyLockSha256, 'encoder dependency lock SHA drift');
assert(dependencyLock.artifactSha256 === contract.encoder.artifactSha256, 'encoder artifact SHA drift');
assert(dependencyLock.encoderRevision === contract.encoder.revision, 'encoder revision drift');
assert(dataLock.trainingSha256 === contract.sealedData.trainingSha256, 'data lock training binding drift');
assert(dataLock.calibrationSha256 === contract.sealedData.calibrationSha256, 'data lock calibration binding drift');
assert(dataLock.designSha256 === contract.candidateDesign.sha256, 'data lock design binding drift');
assert(dataLock.policy?.trainingAndCalibrationSealedBeforeFirstEncoderScoring === true, 'data was not sealed before first scoring');
assert(dataLock.policy?.calibrationMayNotTrainModel === true, 'calibration training prohibition drift');
assert(dataLock.policy?.calibrationMayChooseOnlyOneGlobalFallbackThreshold === true, 'global-threshold-only policy drift');

assert(training.sealed === true && training.status === 'sealed_training_data', 'fresh Fallback Identity training data must remain sealed');
assert(calibration.sealed === true && calibration.status === 'sealed_calibration_data', 'fresh Fallback Identity calibration data must remain sealed');
assert(training.policy?.useForFallbackIdentityTraining === true, 'fresh training data training permission drift');
assert(training.policy?.useForThresholdCalibration === false, 'fresh training data must not calibrate threshold');
assert(calibration.policy?.useForFallbackIdentityTraining === false, 'calibration data entered training');
assert(calibration.policy?.useForThresholdCalibration === true, 'calibration threshold permission drift');

const inventoryRoutes = (inventory.routes || []).map((row) => row.routeId);
assert(inventoryRoutes.length === 22, `route inventory count ${inventoryRoutes.length} != 22`);
assert(JSON.stringify(inventoryRoutes) === JSON.stringify(contract.algorithm.routeOrder), 'Fallback Identity route order drift');
assert(contract.algorithm.type === '22_independent_one_vs_rest_binary_logistic_heads', `algorithm type drift: ${contract.algorithm.type}`);
assert(contract.algorithm.hyperparameters.epochs === 360, 'epochs drift');
assert(contract.algorithm.hyperparameters.learningRate === 0.42, 'learningRate drift');
assert(contract.algorithm.hyperparameters.l2 === 0.0015, 'l2 drift');
assert(contract.algorithm.classBalancing.positiveTotalWeight === 0.5, 'positive class total weight drift');
assert(contract.algorithm.classBalancing.negativeTotalWeight === 0.5, 'negative class total weight drift');
assert(contract.algorithm.regularization.weights === 'l2', 'weight regularization drift');
assert(contract.algorithm.regularization.bias === 'none', 'bias must remain unregularized');
assert(contract.algorithm.normalizedTextConflictPolicy === 'hard_fail', 'normalized-text conflict policy drift');
assert(contract.algorithm.sameNormalizedTextSameLabelPolicy === 'deduplicate_before_embedding', 'dedup-before-embedding policy drift');

assert(contract.encoder.vectorSize === 512, `encoder vector size ${contract.encoder.vectorSize} != 512`);
assert(contract.encoder.dtype === 'q8', `encoder dtype drift: ${contract.encoder.dtype}`);
assert(contract.encoder.pooling === 'mean' && contract.encoder.normalize === true, 'encoder pooling/normalization drift');
assert(contract.encoder.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision changed');

assert(sha256File(contract.algorithm.modulePath) === contract.algorithm.moduleSha256, 'Fallback Identity algorithm module SHA drift');
const context = { console, Math, JSON, Map, Set, Array, Object, Number, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, contract.algorithm.modulePath), 'utf8'), context, { filename:contract.algorithm.modulePath });
const model = context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(model, 'Fallback Identity model module failed to load');
assert(model.vectorSize === 512, 'runtime vector size drift');
assert(JSON.stringify([...model.routeIds]) === JSON.stringify(contract.algorithm.routeOrder), 'runtime route order drift');
assert(model.hyperparameters.epochs === contract.algorithm.hyperparameters.epochs, 'runtime epochs drift');
assert(model.hyperparameters.learningRate === contract.algorithm.hyperparameters.learningRate, 'runtime learningRate drift');
assert(model.hyperparameters.l2 === contract.algorithm.hyperparameters.l2, 'runtime l2 drift');
assert(model.classBalancing.positiveTotalWeight === 0.5 && model.classBalancing.negativeTotalWeight === 0.5, 'runtime class balance drift');
assert(model.biasRegularized === false, 'runtime bias regularization drift');

const requiredHistorical = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json'
];
assert(JSON.stringify(contract.trainingSources.allowedHistoricalRouterTrainOnly) === JSON.stringify(requiredHistorical), 'historical train-source whitelist drift');
const historicalBlobShas = contract.trainingSources.historicalSourceGitBlobShas || {};
assert(Object.keys(historicalBlobShas).length === requiredHistorical.length, 'historical train-source Git blob binding count drift');
for (const relative of requiredHistorical) {
  assert(typeof historicalBlobShas[relative] === 'string', `missing historical Git blob binding: ${relative}`);
  assert(gitBlobSha(relative) === historicalBlobShas[relative], `historical training source drift: ${relative}`);
}
assert(contract.trainingSources.allowedFreshTraining.length === 1 && contract.trainingSources.allowedFreshTraining[0] === contract.sealedData.trainingPath, 'fresh training source drift');
assert(contract.trainingSources.mustExclude.includes(contract.sealedData.calibrationPath), 'calibration file missing from training exclusion list');
assert(contract.trainingSources.mustExclude.some((value) => /validation/i.test(value)), 'Router validation exclusion missing');
assert(contract.trainingSources.mustExclude.some((value) => /blind/i.test(value)), 'blind exclusion missing');
assert(contract.trainingSources.mustExclude.some((value) => /independent/i.test(value)), 'independent exclusion missing');
assert(contract.trainingSources.mustExclude.some((value) => /development/i.test(value)), 'development exclusion missing');

assert(contract.calibrationBoundary.calibrationMayTrain === false, 'calibration may not train');
assert(contract.calibrationBoundary.mayChooseOnly === 'one_global_fallback_identity_threshold', 'calibration must choose one global threshold only');
assert(contract.calibrationBoundary.routeSpecificThresholdsForbidden === true, 'route-specific thresholds must remain forbidden');
assert(contract.calibrationBoundary.routeabilityThresholdRetuneForbidden === true, 'Routeability threshold retune must remain forbidden');
assert(contract.calibrationBoundary.scopeCutoffRetuneForbidden === true, 'Scope cutoff retune must remain forbidden');
assert(contract.calibrationBoundary.routerMarginTuningForbidden === true, 'Router margin tuning must remain forbidden');
assert(contract.featureBoundary.traditionalLiuYaoFeaturesForbidden === true, 'traditional feature boundary drift');
assert(contract.featureBoundary.semanticFeature === 'frozen_encoder_vector_only', 'Fallback Identity feature source drift');

const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const moduleSource = fs.readFileSync(path.join(root, contract.algorithm.modulePath), 'utf8');
for (const term of forbiddenTerms) assert(!moduleSource.includes(term), `traditional feature leaked into model module: ${term}`);

console.log('Fallback Identity v0.1 training contract verified.');
console.log(`- routes: ${contract.algorithm.routeOrder.length}`);
console.log(`- vector size: ${contract.encoder.vectorSize}`);
console.log(`- optimizer: epochs=${contract.algorithm.hyperparameters.epochs}, lr=${contract.algorithm.hyperparameters.learningRate}, l2=${contract.algorithm.hyperparameters.l2}`);
console.log('- class balancing: positive total 0.5 / negative total 0.5');
console.log(`- historical training sources pinned: ${requiredHistorical.length}`);
console.log('- calibration: separate, one global threshold only');
