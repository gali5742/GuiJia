import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
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

const lockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json';
const lock = readJson(lockPath);
const design = readJson(lock.designBinding.path);
const dataContract = readJson(lock.dataContractBinding.path);
const frozenLock = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.lock.json');
const semanticActLock = readJson(lock.frozenArtifacts.semanticActModel.lockPath);
const routeabilityLock = readJson(lock.frozenArtifacts.routeabilityThresholdExecution.lockPath);
const fallbackWeightsLock = readJson(lock.frozenArtifacts.fallbackIdentityModel.weightsLockPath);
const fallbackThresholdLock = readJson(lock.frozenArtifacts.fallbackIdentityModel.thresholdLockPath);

assert(lock.status === 'runtime_locked_before_fresh_development', 'Candidate v0.4 runtime lock status invalid');
assert(gitBlobSha(lock.designBinding.path) === lock.designBinding.gitBlobSha, 'Candidate v0.4 design blob drift');
assert(gitBlobSha(lock.dataContractBinding.path) === lock.dataContractBinding.gitBlobSha, 'Candidate v0.4 data contract blob drift');
assert(design.status === 'design_frozen_before_v04_training_or_calibration', 'Candidate v0.4 design not frozen');
assert(dataContract.status === 'frozen_before_v04_data_generation', 'Candidate v0.4 data contract not frozen');

for (const [relative, expected] of Object.entries(lock.modules)) {
  assert(gitBlobSha(relative) === expected, `Candidate v0.4 runtime module drift: ${relative}`);
}
for (const artifact of Object.values(lock.frozenArtifacts)) {
  assert(sha256(artifact.path) === artifact.sha256, `Candidate v0.4 frozen artifact drift: ${artifact.path}`);
}

assert(frozenLock.artifactSha256 === lock.frozenArtifacts.representationCorrectedDependencies.sha256, 'corrected frozen dependency SHA mismatch');
assert(frozenLock.canonicalTextsPerEncoderCall === 1, 'corrected dependency encoder call shape drift');
assert(frozenLock.scopeHardVetoCutoff === lock.execution.scopeHardVetoCutoff, 'Scope hard-veto cutoff drift');
assert(frozenLock.routeabilityThreshold === lock.execution.routeabilityThreshold, 'corrected dependency Routeability threshold drift');
assert(routeabilityLock.artifactSha256 === lock.frozenArtifacts.routeabilityThresholdExecution.sha256, 'Routeability execution artifact lock mismatch');
assert(routeabilityLock.baseModelSha256 === lock.frozenArtifacts.routeabilityBaseExecution.sha256, 'Routeability execution base model lock mismatch');
assert(routeabilityLock.threshold === lock.execution.routeabilityThreshold, 'Routeability execution threshold drift');
assert(design.correctedExecutionBaseline.routeabilityThreshold === lock.execution.routeabilityThreshold, 'design/runtime Routeability threshold mismatch');
assert(dataContract.execution.routeabilityThresholdFrozen === lock.execution.routeabilityThreshold, 'data contract/runtime Routeability threshold mismatch');

assert(semanticActLock.modelSha256 === lock.frozenArtifacts.semanticActModel.sha256, 'Semantic Act model lock mismatch');
assert(semanticActLock.threshold === lock.execution.semanticActThreshold, 'Semantic Act threshold drift');
assert(semanticActLock.canonicalTextsPerEncoderCall === 1, 'Semantic Act encoder call shape drift');
assert(semanticActLock.developmentRead === false && semanticActLock.independentEvaluationRead === false, 'Semantic Act lock contamination flag invalid');

assert(fallbackWeightsLock.artifactSha256 === lock.frozenArtifacts.fallbackIdentityModel.sha256, 'Fallback v0.2 weights lock mismatch');
assert(fallbackWeightsLock.routeCount === 22 && fallbackWeightsLock.trainingEncoderCalls === 1016, 'Fallback v0.2 weights execution contract drift');
assert(fallbackWeightsLock.calibrationRowsRead === false && fallbackWeightsLock.thresholdSelected === false, 'Fallback v0.2 weights/calibration isolation drift');
assert(fallbackThresholdLock.globalThreshold === lock.execution.fallbackGlobalThreshold, 'Fallback v0.2 threshold drift');
assert(fallbackThresholdLock.routeCount === 22 && fallbackThresholdLock.scoreAll22Heads === true, 'Fallback v0.2 all-22 threshold contract drift');
assert(fallbackThresholdLock.routeSpecificThresholds === false, 'Fallback v0.2 route-specific thresholds appeared');
assert(lock.fallbackCalibrationDiagnostic.knownRetention === fallbackThresholdLock.selectedMetrics.knownRetention, 'Fallback calibration diagnostic retention drift');
assert(lock.fallbackCalibrationDiagnostic.acceptedRouteAccuracy === fallbackThresholdLock.selectedMetrics.acceptedRouteAccuracy, 'Fallback calibration diagnostic accuracy drift');
assert(lock.fallbackCalibrationDiagnostic.overallNonRouteFalseActivation === fallbackThresholdLock.selectedMetrics.overallNonRouteFalseActivation, 'Fallback calibration diagnostic false activation drift');

assert(lock.execution.canonicalTextsPerEncoderCall === 1, 'Candidate v0.4 runtime must use one canonical text per encoder call');
assert(lock.execution.encoderRevision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'Candidate v0.4 encoder revision drift');
assert(lock.execution.routeInventoryCount === 22, 'Candidate v0.4 route inventory drift');
assert(lock.execution.fallbackCandidateUniverse === 'all_current_22_routes' && lock.execution.routerTop2FallbackRestriction === false, 'Fallback candidate universe regressed to Router Top2');
assert(lock.execution.semanticActBeforeArbitrationRescue === true, 'Semantic Act ordering contract missing');
assert(lock.execution.fallbackBelowThresholdRouteabilityRescue === false, 'below-threshold Fallback Routeability rescue must remain disabled');
assert(lock.isolation.frontendCutover === false, 'Candidate v0.4 experimental runtime may not claim frontend cutover');

const frontend = readText('index.html');
[
  'liuyao-semantic-candidate-v04-runtime-v01.js',
  'liuyao-semantic-act-eligibility-v01.js',
  'liuyao-semantic-fallback-identity-scorer-v02.js'
].forEach((name) => assert(!frontend.includes(name), `experimental Candidate v0.4 runtime leaked into index.html: ${name}`));

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array };
context.window = context; context.globalThis = context; vm.createContext(context);
const loadOrder = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-act-eligibility-v01.js',
  'js/liuyao-semantic-routeability-v05-execution-v01.js',
  'js/liuyao-semantic-fallback-identity-scorer-v02.js',
  'js/liuyao-semantic-fallback-identity-v02.js',
  'js/liuyao-semantic-route-selection-v05.js',
  'js/liuyao-semantic-finalization-v01.js',
  'js/liuyao-semantic-candidate-v04-runtime-v01.js'
];
for (const relative of loadOrder) vm.runInContext(readText(relative), context, { filename:relative });
const G = context.GuiJia;
assert(G.liuyaoSemanticRouteabilityV05ExecutionV01.threshold === lock.execution.routeabilityThreshold, 'loaded corrected Routeability runtime threshold mismatch');
assert(G.liuyaoSemanticFallbackIdentityScorerV02.routeIds.length === 22, 'loaded Fallback scorer is not all-22');
assert(G.liuyaoSemanticActEligibilityV01.selectsRoute === false, 'Semantic Act gate may not select routes');
assert(G.liuyaoSemanticCandidateV04RuntimeV01.routerTop2FallbackRestriction === false, 'integrated runtime Router Top2 restriction drift');
assert(G.liuyaoSemanticCandidateV04RuntimeV01.semanticActBeforeArbitrationRescue === true, 'integrated runtime Semantic Act ordering drift');

let driftRejected = false;
try {
  G.liuyaoSemanticRouteabilityV05ExecutionV01.decide({ probability:0.9, threshold:0.7675678218564946, evidence:{} });
} catch (error) {
  driftRejected = /threshold drift/.test(error.message);
}
assert(driftRejected, 'corrected Routeability runtime accepted historical threshold');

const fakeSemanticAct = (bias) => ({
  version:'0.13-candidate-v0.4-semantic-act-eligibility-v0.1-model-v0.1',
  status:'locked_after_fresh_calibration',
  positiveLabel:'eligible_divination_outcome_or_decision',
  negativeLabel:'ineligible_information_or_procedure',
  vectorSize:512,
  model:{ weights:Array(512).fill(0), bias },
  threshold:0.5
});
const originalEvidence = G.liuyaoSemanticRouteEvidenceV03;
G.liuyaoSemanticRouteEvidenceV03 = Object.freeze({ extract(){ throw new Error('evidence_should_not_run'); } });
const ineligible = G.liuyaoSemanticCandidateV04RuntimeV01.decide({
  text:'',
  vector:new Float32Array(512),
  semanticActArtifact:fakeSemanticAct(-2),
  routeabilityProbability:1,
  routerHead:{ top1:{id:'borrow_money',score:0.1}, top2:{id:'lend_money',score:0.09} },
  scope:{ hardVeto:false },
  fallbackArtifact:null,
  fallbackThresholdLock:null
});
assert(ineligible.final.disposition === 'non_route', 'ineligible Semantic Act did not hard-stop to non_route');
assert(ineligible.arbitration === null && ineligible.routeability === null && ineligible.fallbackIdentity === null, 'ineligible Semantic Act leaked into downstream routing');
G.liuyaoSemanticRouteEvidenceV03 = originalEvidence;

const modernOnlySource = [
  'js/liuyao-semantic-act-eligibility-v01.js',
  'js/liuyao-semantic-routeability-v05-execution-v01.js',
  'js/liuyao-semantic-fallback-identity-scorer-v02.js',
  'js/liuyao-semantic-fallback-identity-v02.js',
  'js/liuyao-semantic-route-selection-v05.js',
  'js/liuyao-semantic-candidate-v04-runtime-v01.js'
].map(readText).join('\n');
['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => {
  assert(!modernOnlySource.includes(term), `traditional LiuYao feature leaked into Candidate v0.4 semantic runtime: ${term}`);
});

console.log('Candidate v0.4 integrated runtime lock verified');
console.log(`  Routeability threshold: ${lock.execution.routeabilityThreshold}`);
console.log(`  Semantic Act threshold: ${lock.execution.semanticActThreshold}`);
console.log(`  Fallback global threshold: ${lock.execution.fallbackGlobalThreshold}`);
console.log(`  Fallback calibration known retention (diagnostic only): ${lock.fallbackCalibrationDiagnostic.knownRetention}`);
