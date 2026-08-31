import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => createHash('sha256').update(read(relative)).digest('hex');
const ratio = (n, d) => d ? n / d : 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const candidateFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.json';
const candidateLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json';
const evalFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.json';
const evalLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.lock.json';
const reportFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-report-v0.1.json';

const candidate = readJson(candidateFile);
const candidateLock = readJson(candidateLockFile);
const evaluation = readJson(evalFile);
const evalLock = readJson(evalLockFile);
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');

assert(candidate.status === 'frozen_candidate', 'Candidate v0.2 not frozen');
assert(candidateLock.status === 'locked' && candidateLock.candidateSha256 === sha256(candidateFile), 'Candidate v0.2 lock drift');
assert(candidateLock.candidateSha256 === '23368e0911f1164f6af5d7e72dd894ebfcc767524840e5bba796aaff6940f828', 'unexpected Candidate v0.2 SHA');
assert(evaluation.status === 'sealed_independent_eval' && evaluation.sealed === true, 'independent eval is not sealed');
assert(evalLock.status === 'locked' && evalLock.dataSha256 === sha256(evalFile), 'independent eval lock drift');
assert(evalLock.candidateSha256 === candidateLock.candidateSha256, 'evaluation bound to wrong candidate');
assert(evalLock.candidateLockSha256 === sha256(candidateLockFile), 'candidate lock SHA mismatch');
assert(evaluation.rows?.length === 198, `independent rows=${evaluation.rows?.length}`);
assert(candidate.routeability?.baseModelSha256 === routeabilityModel.source?.artifactSha256 || candidate.routeability?.baseModelSha256 === routeabilityModel.model?.sourceArtifactSha256 || candidate.routeability?.baseModelSha256 === 'd4b1ecdc13fc391c370a461873963280555e69931835663a7597267666862344', 'Routeability base model identity drift');

if (fs.existsSync(path.join(root, reportFile))) {
  throw new Error('Candidate v0.2 independent report already exists; first result is immutable and must not be rerun/overwritten');
}

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-divination-policy-gate-v01.js',
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-routeability-v04.js',
  'js/liuyao-semantic-route-selection-v03.js',
  'js/liuyao-semantic-finalization-v01.js'
]) vm.runInContext(read(relative).toString('utf8'), context, { filename:relative });

const G = context.GuiJia;
const policyGate = G.liuyaoDivinationPolicyGateV01;
const evidenceExtractor = G.liuyaoSemanticRouteEvidenceV02;
const arbitration = G.liuyaoSemanticRouteArbitrationV012;
const routeability = G.liuyaoSemanticRouteabilityV04;
const selection = G.liuyaoSemanticRouteSelectionV03;
const finalization = G.liuyaoSemanticFinalizationV01;
assert(policyGate?.evaluate && evidenceExtractor?.extract && arbitration?.arbitrate && routeability?.decide && selection?.decide && finalization?.finalize, 'Candidate v0.2 runtime modules failed to load');

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
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] })).sort((a, b) => b.score - a.score);
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score };
};
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias);
const scoreScope = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias);
  return {
    probability,
    hardVetoCutoff:frozen.semanticStackPolicy.hardVetoCutoff,
    hardVeto:probability < frozen.semanticStackPolicy.hardVetoCutoff
  };
};

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
  dtype:frozen.encoder.dtype,
  revision:frozen.encoder.revision
});
const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`embedding size ${hidden}`);
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let i = 0; i < hidden; i += 1) vector[i] = Number(tensor.data[offset + i]);
    vectors.push(vector);
  }
  return vectors;
};
const embed = async (texts, chunkSize=24) => {
  const vectors = [];
  for (let start = 0; start < texts.length; start += chunkSize) {
    const chunk = texts.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
    vectors.push(...tensorToVectors(output, chunk.length));
    console.log(`embedded ${Math.min(start + chunk.length, texts.length)}/${texts.length}`);
  }
  return vectors;
};

const vectors = await embed(evaluation.rows.map((row) => row.text));
const threshold = candidate.routeability.threshold;
const results = evaluation.rows.map((row, index) => {
  const policy = policyGate.evaluate(row.text);
  if (!policy.allowed) {
    return {
      ...row,
      policy,
      finalDisposition:'policy_blocked',
      finalRoute:null,
      finalReason:policy.reasonCode,
      finalExact:row.expectedDisposition === 'non_route'
    };
  }

  const vector = vectors[index];
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const head = classifyRouter(vector);
  const probability = routeabilityProbability(vector);
  const gate = routeability.decide({ probability, threshold, arbitration:arb, evidence });
  const scope = scoreScope(vector);
  const selected = gate.disposition === 'route_known'
    ? selection.decide({ arbitration:arb, head, evidence, routeabilityDisposition:'route_known' })
    : null;
  const final = finalization.finalize({ routeability:gate, selection:selected, scope, arbitration:arb, evidence });
  const finalExact = row.expectedDisposition === 'route_known'
    ? final.disposition === 'route_known' && final.routeId === row.expectedRoute
    : final.disposition !== 'route_known';
  return {
    ...row,
    policy:{ allowed:true, reasonCode:policy.reasonCode },
    evidence,
    arbitration:arb,
    head,
    routeability:{ probability, threshold, disposition:gate.disposition, reasonCode:gate.reasonCode },
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    scope,
    finalDisposition:final.disposition,
    finalRoute:final.routeId,
    finalReason:final.reasonCode,
    scopeBypassed:final.scopeBypassed,
    headTop1Exact:row.expectedDisposition === 'route_known' && head.top1.id === row.expectedRoute,
    finalExact
  };
});

const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const acceptedKnown = known.filter((row) => row.finalDisposition === 'route_known');
const headCorrect = known.filter((row) => row.headTop1Exact);
const headWrong = known.filter((row) => !row.headTop1Exact);
const subtypeIds = ['outside_current_22','route_unresolved','near_domain_not_current_route'];
const pathIds = ['strong_arbitration','support_arbitration','fallback_head'];

const summary = {
  total:results.length,
  known:known.length,
  nonRoute:nonRoute.length,
  routeability:{
    threshold,
    knownRecall:ratio(known.filter((row) => row.routeability?.disposition === 'route_known').length, known.length),
    falseActivation:ratio(nonRoute.filter((row) => row.routeability?.disposition === 'route_known').length, nonRoute.length)
  },
  head:{
    top1Exact:ratio(headCorrect.length, known.length)
  },
  final:{
    knownRouteRetention:ratio(acceptedKnown.length, known.length),
    knownExactRoute:ratio(known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, known.length),
    acceptedRouteAccuracy:ratio(acceptedKnown.filter((row) => row.finalRoute === row.expectedRoute).length, acceptedKnown.length),
    nonRouteSafety:ratio(nonRoute.filter((row) => row.finalDisposition !== 'route_known').length, nonRoute.length),
    falseRouteActivation:ratio(nonRoute.filter((row) => row.finalDisposition === 'route_known').length, nonRoute.length)
  },
  correction:{
    headCorrectCount:headCorrect.length,
    headWrongCount:headWrong.length,
    headCorrectRetention:ratio(headCorrect.filter((row) => row.finalExact).length, headCorrect.length),
    headErrorCorrection:ratio(headWrong.filter((row) => row.finalExact).length, headWrong.length),
    headWrongFinalCorrect:headWrong.filter((row) => row.finalExact).length,
    headCorrectFinalWrong:headCorrect.filter((row) => !row.finalExact).length
  },
  responsibility:{
    confirmedStrongRescue:results.filter((row) => row.routeability?.reasonCode === 'confirmed_strong_rescue').length,
    confirmedSupportRescue:results.filter((row) => row.routeability?.reasonCode === 'confirmed_support_rescue').length,
    supportPriority:results.filter((row) => row.selection?.reasonCode === 'support_arbitration_priority_after_routeability').length,
    confirmedStrongScopeBypass:results.filter((row) => row.finalReason === 'confirmed_strong_scope_bypass').length
  },
  failureStages:{
    policyBlocked:known.filter((row) => row.finalDisposition === 'policy_blocked').length,
    routeabilityReject:known.filter((row) => row.routeability?.disposition === 'non_route').length,
    selectionUnresolved:known.filter((row) => row.routeability?.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    scopeHardVeto:known.filter((row) => row.finalReason === 'scope_hard_veto').length,
    wrongSelectedRoute:known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  },
  byKnownPath:{},
  byNonRouteSubtype:{}
};
for (const pathId of pathIds) {
  const subset = known.filter((row) => row.expectedCandidatePath === pathId);
  const accepted = subset.filter((row) => row.finalDisposition === 'route_known');
  summary.byKnownPath[pathId] = {
    n:subset.length,
    routeabilityRecall:ratio(subset.filter((row) => row.routeability?.disposition === 'route_known').length, subset.length),
    finalExact:ratio(subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, subset.length),
    acceptedAccuracy:ratio(accepted.filter((row) => row.finalRoute === row.expectedRoute).length, accepted.length),
    rejects:subset.filter((row) => row.routeability?.disposition === 'non_route').length,
    wrongSelected:subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  };
}
for (const subtype of subtypeIds) {
  const subset = nonRoute.filter((row) => row.nonRouteSubtype === subtype);
  summary.byNonRouteSubtype[subtype] = {
    n:subset.length,
    routeabilityFalseActivation:ratio(subset.filter((row) => row.routeability?.disposition === 'route_known').length, subset.length),
    finalFalseActivation:ratio(subset.filter((row) => row.finalDisposition === 'route_known').length, subset.length),
    finalSafety:ratio(subset.filter((row) => row.finalDisposition !== 'route_known').length, subset.length)
  };
}

const promotionPolicy = {
  minimumKnownExactRoute:0.80,
  preferredKnownExactRoute:[0.82,0.85],
  minimumAcceptedRouteAccuracy:0.98,
  maximumOverallFalseRouteActivation:0.05,
  maximumFalseRouteActivationPerNonRouteSubtype:0.05,
  requireNoStructuralPathCollapse:true
};
const checks = {
  knownExactRoute:summary.final.knownExactRoute >= promotionPolicy.minimumKnownExactRoute,
  acceptedRouteAccuracy:summary.final.acceptedRouteAccuracy >= promotionPolicy.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation:summary.final.falseRouteActivation <= promotionPolicy.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation:Object.values(summary.byNonRouteSubtype).every((row) => row.finalFalseActivation <= promotionPolicy.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse:Object.values(summary.byKnownPath).every((row) => row.finalExact > 0)
};
const promotionPassed = Object.values(checks).every(Boolean);

const report = {
  version:'0.13-candidate-v0.2-independent-report-v0.1',
  status:'first_post_lock_independent_result',
  immutable:true,
  candidate:{
    path:candidateFile,
    lockPath:candidateLockFile,
    candidateSha256:candidateLock.candidateSha256,
    candidateLockSha256:sha256(candidateLockFile)
  },
  evaluation:{
    path:evalFile,
    lockPath:evalLockFile,
    dataSha256:evalLock.dataSha256,
    lockSha256:sha256(evalLockFile),
    rows:evaluation.rows.length
  },
  policy:{
    training:false,
    calibration:false,
    candidateMutation:false,
    postRunWordingPatch:false,
    sameVersionRetune:false,
    resultMustBeRecordedWhetherPassOrFail:true
  },
  summary,
  promotionPolicy,
  promotionChecks:checks,
  promotionPassed,
  verdict:promotionPassed ? 'candidate_v02_passes_current22_baseline_promotion_gates' : 'candidate_v02_fails_current22_baseline_promotion_gates',
  failures:results.filter((row) => !row.finalExact).map((row) => ({
    id:row.id,
    text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    expectedCandidatePath:row.expectedCandidatePath,
    nonRouteSubtype:row.nonRouteSubtype,
    routeability:row.routeability,
    head:row.head ? { top1:row.head.top1, top2:row.head.top2, routeMargin:row.head.routeMargin } : null,
    arbitration:row.arbitration,
    selection:row.selection,
    scope:row.scope,
    finalDisposition:row.finalDisposition,
    finalRoute:row.finalRoute,
    finalReason:row.finalReason,
    scopeBypassed:row.scopeBypassed,
    headTop1Exact:row.headTop1Exact,
    finalExact:row.finalExact
  }))
};

fs.writeFileSync(path.join(root, reportFile), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  candidateSha256:candidateLock.candidateSha256,
  evaluationSha256:evalLock.dataSha256,
  summary,
  promotionChecks:checks,
  promotionPassed,
  verdict:report.verdict
}, null, 2));
