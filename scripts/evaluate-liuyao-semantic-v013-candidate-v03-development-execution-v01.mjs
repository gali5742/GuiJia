import './verify-liuyao-semantic-fallback-identity-v01-execution-v01-model.mjs';
import './verify-liuyao-semantic-v013-candidate-v03-development-execution-v01.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const ratio = (n, d) => d ? n / d : 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const developmentPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const reportPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-report.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const frozenPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const frozenLockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const routeabilityPath = 'data/liuyao-semantic-routeability-v0.2-execution-v0.1.json';
const routeabilityThresholdPath = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const fallbackModelPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.json';
const fallbackLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.lock.json';
const runtimeLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-calibration-runtime.lock.json';
const designPath = 'data/liuyao-semantic-v013-candidate-v03-design-v0.1.json';

const sealCommit = String(process.env.DEVELOPMENT_SEAL_COMMIT || '').trim();
assert(/^[0-9a-f]{40}$/.test(sealCommit), 'DEVELOPMENT_SEAL_COMMIT must be the committed development data+lock SHA before scoring');

const development = readJson(developmentPath);
const developmentLock = readJson(developmentLockPath);
const contract = readJson(contractPath);
const frozen = readJson(frozenPath);
const frozenLock = readJson(frozenLockPath);
const routeabilityModel = readJson(routeabilityPath);
const routeabilityThresholdArtifact = readJson(routeabilityThresholdPath);
const fallbackModel = readJson(fallbackModelPath);
const fallbackLock = readJson(fallbackLockPath);
const runtimeLock = readJson(runtimeLockPath);
const design = readJson(designPath);

assert(development.status === 'sealed_development_eval' && development.sealed === true, 'fresh Candidate v0.3 development data is not sealed');
assert(developmentLock.status === 'locked' && developmentLock.artifactSha256 === sha256(developmentPath), 'development data lock drift');
assert(developmentLock.sealedBeforeFirstDevelopmentEncoderScoring === true, 'development data was not sealed before scoring');
assert(developmentLock.independentEvaluationDataReadBeforeSeal === false, 'development seal read independent evaluation data');
assert(development.rows?.length === 198, `development rows ${development.rows?.length} != 198`);
assert(frozen.status === 'frozen' && frozen.correction?.canonicalTextsPerEncoderCall === 1, 'corrected frozen dependencies invalid');
assert(frozenLock.artifactSha256 === '58bf137a7de167e2e71baffa474e8eed7d92ea11fd6ad6460b66591ad52441e9', 'corrected frozen dependency SHA drift');
assert(routeabilityModel.status === 'frozen' && routeabilityModel.model?.weights?.length === 512, 'corrected Routeability v0.2 base invalid');
assert(sha256(routeabilityPath) === '5ff8a892463c1953c6f3fb86fced25c992b55aeb5e07e9e88de97acf5d06354d', 'corrected Routeability base SHA drift');
assert(sha256(routeabilityThresholdPath) === '20f80cf0e4437e4d52db992b25af1c58e310a3ef9538f72a95afb4c3eda7c039', 'corrected Routeability threshold artifact SHA drift');
assert(fallbackLock.status === 'locked' && fallbackLock.artifactSha256 === sha256(fallbackModelPath), 'corrected Fallback model lock drift');
assert(fallbackLock.canonicalTextsPerEncoderCall === 1, 'corrected Fallback execution shape drift');
assert(fallbackLock.globalThreshold === 0.5571407097788003, 'corrected Fallback threshold drift');
assert(fallbackLock.routeabilityThreshold === 0.7678148573595883, 'corrected Routeability threshold drift');
assert(fallbackLock.scopeHardVetoCutoff === 0.4319473801404805, 'corrected Scope cutoff drift');
assert(routeabilityThresholdArtifact.calibration?.threshold === fallbackLock.routeabilityThreshold, 'Routeability threshold artifact/lock mismatch');
assert(contract.independentEvaluation?.readDuringDevelopment === false, 'development contract permits independent evaluation read');
assert(design.evaluationPolicy?.promotionGates, 'Candidate v0.3 promotion gates missing');

for (const [relative, expectedBlob] of Object.entries(runtimeLock.modules || {})) {
  assert(gitBlobSha(relative) === expectedBlob, `Candidate runtime module blob drift before development scoring: ${relative}`);
}

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array };
context.window = context; context.globalThis = context; vm.createContext(context);
const ordinaryModules = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js'
];
for (const relative of ordinaryModules) vm.runInContext(read(relative).toString('utf8'), context, { filename:relative });
const routeabilityRuntimePath = 'js/liuyao-semantic-routeability-v05.js';
let routeabilitySource = read(routeabilityRuntimePath).toString('utf8');
const fromThreshold = 'const FROZEN_THRESHOLD = 0.7675678218564946;';
const toThreshold = `const FROZEN_THRESHOLD = ${fallbackLock.routeabilityThreshold};`;
const replacementCount = routeabilitySource.split(fromThreshold).length - 1;
assert(replacementCount === 1, `Routeability runtime threshold patch anchor count ${replacementCount}`);
routeabilitySource = routeabilitySource.replace(fromThreshold, toThreshold);
vm.runInContext(routeabilitySource, context, { filename:`${routeabilityRuntimePath}#execution-v0.1` });
for (const relative of [
  'js/liuyao-semantic-fallback-identity-v01.js',
  'js/liuyao-semantic-route-selection-v04.js',
  'js/liuyao-semantic-finalization-v01.js'
]) vm.runInContext(read(relative).toString('utf8'), context, { filename:relative });

const G = context.GuiJia;
const evidenceExtractor = G?.liuyaoSemanticRouteEvidenceV03;
const arbitration = G?.liuyaoSemanticRouteArbitrationV012;
const routeability = G?.liuyaoSemanticRouteabilityV05;
const identityGate = G?.liuyaoSemanticFallbackIdentityV01;
const selection = G?.liuyaoSemanticRouteSelectionV04;
const finalization = G?.liuyaoSemanticFinalizationV01;
assert(evidenceExtractor?.extract && arbitration?.arbitrate && routeability?.decide && identityGate?.decide && selection?.decide && finalization?.finalize, 'Candidate v0.3 corrected runtime modules failed to load');
assert(routeability.threshold === fallbackLock.routeabilityThreshold, 'temporarily instrumented Routeability threshold mismatch');

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / Math.max(total, 1e-12));
};
const classifyRouter = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] })).sort((a,b) => b.score - a.score);
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score };
};
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias);
const scopeScore = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias);
  return { probability, hardVetoCutoff:fallbackLock.scopeHardVetoCutoff, hardVeto:probability < fallbackLock.scopeHardVetoCutoff };
};
const fallbackProbabilities = (head, vector) => {
  const probabilities = {};
  for (const routeId of [...new Set([head.top1?.id, head.top2?.id].filter(Boolean))]) {
    const modelHead = fallbackModel.model?.heads?.[routeId];
    assert(modelHead?.weights?.length === 512 && Number.isFinite(modelHead.bias), `corrected Fallback head missing: ${routeId}`);
    probabilities[routeId] = sigmoid(dot(modelHead.weights, vector) + modelHead.bias);
  }
  return probabilities;
};

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
  dtype:frozen.encoder.dtype,
  revision:frozen.encoder.revision
});
const tensorToVector = (tensor) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  assert(hidden === frozen.encoder.vectorSize, `embedding size ${hidden} != ${frozen.encoder.vectorSize}`);
  const vector = new Float32Array(hidden);
  for (let i = 0; i < hidden; i += 1) vector[i] = Number(tensor.data[i]);
  return vector;
};
const embedOne = async (text, index, total) => {
  const normalized = String(text || '').trim();
  assert(normalized, 'empty development question');
  const output = await extractor([normalized], { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
  if ((index + 1) % 10 === 0 || index === total - 1) console.log(`single-text embedded ${index + 1}/${total}`);
  return tensorToVector(output);
};

const results = [];
for (let index = 0; index < development.rows.length; index += 1) {
  const row = development.rows[index];
  const vector = await embedOne(row.text, index, development.rows.length);
  const head = classifyRouter(vector);
  const probability = routeabilityProbability(vector);
  const scope = scopeScore(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const gate = routeability.decide({ probability, threshold:fallbackLock.routeabilityThreshold, arbitration:arb, evidence });
  const reachesFallbackIdentity = gate.disposition === 'route_known' && !arb?.routeId;
  const identityProbabilities = reachesFallbackIdentity ? fallbackProbabilities(head, vector) : null;
  const fallbackIdentityDecision = reachesFallbackIdentity
    ? identityGate.decide({ head, probabilities:identityProbabilities, threshold:fallbackLock.globalThreshold })
    : null;
  const selected = gate.disposition === 'route_known'
    ? selection.decide({ arbitration:arb, head, evidence, routeabilityDisposition:'route_known', fallbackIdentityDecision })
    : null;
  const final = finalization.finalize({ routeability:gate, selection:selected, scope, arbitration:arb, evidence });
  const expectedKnown = row.expectedDisposition === 'route_known';
  const finalExact = expectedKnown
    ? final.disposition === 'route_known' && final.routeId === row.expectedRoute
    : final.disposition === 'non_route';
  results.push({
    id:row.id, text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute || null,
    expectedCandidatePath:row.expectedCandidatePath || null,
    nonRouteSubtype:row.nonRouteSubtype || null,
    router:head,
    routeability:{ probability, threshold:fallbackLock.routeabilityThreshold, disposition:gate.disposition, reasonCode:gate.reasonCode },
    arbitration:arb,
    reachesFallbackIdentity,
    fallbackIdentity:reachesFallbackIdentity ? { probabilities:identityProbabilities, decision:fallbackIdentityDecision } : null,
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    scope,
    final,
    headTop1Exact:expectedKnown && head.top1.id === row.expectedRoute,
    finalExact,
    falseRouteActivation:!expectedKnown && final.disposition === 'route_known'
  });
}

const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const acceptedKnown = known.filter((row) => row.final.disposition === 'route_known');
const summary = {
  rows:results.length,
  known:known.length,
  nonRoute:nonRoute.length,
  routeabilityKnownRecall:ratio(known.filter((row)=>row.routeability.disposition === 'route_known').length, known.length),
  knownFinalRetention:ratio(acceptedKnown.length, known.length),
  knownExactRoute:ratio(known.filter((row)=>row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, known.length),
  acceptedRouteAccuracy:ratio(acceptedKnown.filter((row)=>row.final.routeId === row.expectedRoute).length, acceptedKnown.length),
  nonRouteFalseRouteActivation:ratio(nonRoute.filter((row)=>row.falseRouteActivation).length, nonRoute.length),
  nonRouteNoRouteActivationSafety:ratio(nonRoute.filter((row)=>row.final.disposition !== 'route_known').length, nonRoute.length),
  attrition:{
    routeabilityAccepted:known.filter((row)=>row.routeability.disposition === 'route_known').length,
    routeabilityRejected:known.filter((row)=>row.routeability.disposition !== 'route_known').length,
    fallbackReached:known.filter((row)=>row.reachesFallbackIdentity).length,
    fallbackSelected:known.filter((row)=>row.fallbackIdentity?.decision?.status === 'selected').length,
    fallbackUnresolved:known.filter((row)=>row.reachesFallbackIdentity && row.fallbackIdentity?.decision?.status !== 'selected').length,
    selectionSelected:known.filter((row)=>row.selection?.status === 'selected').length,
    selectionUnresolved:known.filter((row)=>row.routeability.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    scopeHardVeto:known.filter((row)=>row.final.reasonCode === 'scope_hard_veto').length,
    finalRouteKnown:acceptedKnown.length,
    finalExact:known.filter((row)=>row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length,
    wrongSelectedRoute:known.filter((row)=>row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
  },
  byKnownPath:{},
  byNonRouteSubtype:{}
};
for (const pathId of ['strong_arbitration','support_arbitration','fallback_head']) {
  const subset = known.filter((row)=>row.expectedCandidatePath === pathId);
  const accepted = subset.filter((row)=>row.final.disposition === 'route_known');
  summary.byKnownPath[pathId] = {
    n:subset.length,
    routeabilityRecall:ratio(subset.filter((row)=>row.routeability.disposition === 'route_known').length, subset.length),
    fallbackReached:subset.filter((row)=>row.reachesFallbackIdentity).length,
    fallbackSelected:subset.filter((row)=>row.fallbackIdentity?.decision?.status === 'selected').length,
    finalRetention:ratio(accepted.length, subset.length),
    finalExact:ratio(subset.filter((row)=>row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, subset.length),
    acceptedAccuracy:ratio(accepted.filter((row)=>row.final.routeId === row.expectedRoute).length, accepted.length),
    scopeHardVeto:subset.filter((row)=>row.final.reasonCode === 'scope_hard_veto').length,
    wrongSelected:subset.filter((row)=>row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
  };
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  const subset = nonRoute.filter((row)=>row.nonRouteSubtype === subtype);
  summary.byNonRouteSubtype[subtype] = {
    n:subset.length,
    falseRouteActivation:ratio(subset.filter((row)=>row.falseRouteActivation).length, subset.length),
    noRouteActivationSafety:ratio(subset.filter((row)=>row.final.disposition !== 'route_known').length, subset.length),
    fallbackReached:subset.filter((row)=>row.reachesFallbackIdentity).length
  };
}
const promotionGates = design.evaluationPolicy.promotionGates;
const checks = {
  knownExactRoute:summary.knownExactRoute >= promotionGates.minimumKnownExactRoute,
  acceptedRouteAccuracy:summary.acceptedRouteAccuracy >= promotionGates.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation:summary.nonRouteFalseRouteActivation <= promotionGates.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation:Object.values(summary.byNonRouteSubtype).every((row)=>row.falseRouteActivation <= promotionGates.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse:Object.values(summary.byKnownPath).every((row)=>row.finalExact > 0)
};
const report = {
  version:'0.13-candidate-v0.3-development-report-execution-v0.1',
  status:'corrected_pre_lock_development_diagnostic',
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.3',
  policy:{
    usesIndependentEval:false,
    readsIndependentEval:false,
    training:false,
    calibration:false,
    retunesThresholds:false,
    claimsGeneralization:false,
    developmentOnly:true
  },
  execution:{
    canonicalTextsPerEncoderCall:1,
    developmentSealCommit:sealCommit,
    developmentArtifactSha256:developmentLock.artifactSha256,
    correctedFrozenDependenciesSha256:frozenLock.artifactSha256,
    correctedRouteabilityBaseSha256:sha256(routeabilityPath),
    correctedRouteabilityThresholdArtifactSha256:sha256(routeabilityThresholdPath),
    correctedFallbackIdentityArtifactSha256:fallbackLock.artifactSha256,
    routeabilityThreshold:fallbackLock.routeabilityThreshold,
    scopeHardVetoCutoff:fallbackLock.scopeHardVetoCutoff,
    fallbackIdentityGlobalThreshold:fallbackLock.globalThreshold,
    routeabilityRuntimeTemporaryThresholdReplacementCount:replacementCount
  },
  candidate:{ evidence:'v0.3', arbitration:'v0.12', compatibility:'v0.3', routeability:'v0.5-execution-corrected-threshold', fallbackIdentity:'v0.1-execution-v0.1', selection:'v0.4', finalization:'v0.1' },
  promotionGates,
  summary,
  checks,
  readyForCandidateLock:Object.values(checks).every(Boolean),
  failures:results.filter((row)=>!row.finalExact),
  results
};
writeJson(reportPath, report);
console.log(JSON.stringify({ readyForCandidateLock:report.readyForCandidateLock, checks, summary }, null, 2));
