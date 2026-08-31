import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const ratio = (n, d) => d ? n / d : 0;

const evalFile = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.json';
const evalLockFile = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.lock.json';
const candidateLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json';
const independent = readJson(evalFile);
const independentLock = readJson(evalLockFile);
const candidateLock = readJson(candidateLockFile);
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');
const routeabilityV03 = readJson('data/liuyao-semantic-routeability-v0.3.json');

if (candidateLock.status !== 'locked' || candidateLock.candidateSha256 !== '6503446eb9c9e606ed3de53de5a9e98c1a77362d7a491b2a113f6f31ced059a9') throw new Error('unexpected v0.13 candidate lock');
if (independent.status !== 'sealed_independent_eval' || independent.sealed !== true || independent.rows?.length !== 198) throw new Error('sealed post-lock independent eval missing');
if (independentLock.status !== 'locked' || independentLock.candidateSha256 !== candidateLock.candidateSha256) throw new Error('independent eval lock mismatch');
if (sha256(evalFile) !== independentLock.dataSha256) throw new Error('independent eval data hash drift');
if (sha256(candidateLockFile) !== independentLock.candidateLockSha256) throw new Error('candidate lock hash drift');
if (frozen.router?.routeOrder?.length !== 22 || frozen.router?.routeHead?.weights?.length !== 22) throw new Error('frozen Router v0.8.1 artifact missing');
if (routeabilityModel.status !== 'frozen' || routeabilityModel.model?.weights?.length !== 512) throw new Error('frozen Routeability model missing');
if (routeabilityV03.status !== 'frozen' || !Number.isFinite(routeabilityV03.calibration?.threshold)) throw new Error('frozen Routeability v0.3 policy missing');
if (routeabilityModel.encoder?.revision !== frozen.encoder?.revision) throw new Error('encoder revision mismatch');
if (routeabilityV03.baseModel?.sha256 !== sha256('data/liuyao-semantic-routeability-v0.2.json')) throw new Error('Routeability v0.3 base-model hash drift');

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
  'js/liuyao-semantic-route-selection-v02.js',
  'js/liuyao-semantic-routeability-v03.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });

const policyGate = context.GuiJia?.liuyaoDivinationPolicyGateV01;
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
const selection = context.GuiJia?.liuyaoSemanticRouteSelectionV02;
const routeabilityGate = context.GuiJia?.liuyaoSemanticRouteabilityV03;
if (!policyGate?.evaluate || !evidenceExtractor?.extract || !arbitration?.arbitrate || !selection?.decide || !routeabilityGate?.decide) throw new Error('locked v0.13 semantic candidate modules failed to load');

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
const scoreRouteability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias);
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
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`Embedding size ${hidden} != ${frozen.encoder.vectorSize}`);
  const raw = tensor.data;
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let i = 0; i < hidden; i += 1) vector[i] = Number(raw[offset + i]);
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

const vectors = await embed(independent.rows.map((row) => row.text));
const results = independent.rows.map((row, index) => {
  const policy = policyGate.evaluate(row.text);
  if (!policy.allowed) throw new Error(`sealed independent row unexpectedly blocked by policy: ${row.id}`);
  const vector = vectors[index];
  const probability = scoreRouteability(vector);
  const head = classifyRouter(vector);
  const scope = scoreScope(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const routeability = routeabilityGate.decide({
    probability,
    threshold:routeabilityV03.calibration.threshold,
    arbitration:arb,
    evidence
  });

  let selected = null;
  let finalDisposition = 'non_route';
  let finalRoute = null;
  let finalReason = routeability.reasonCode;
  if (routeability.disposition === 'route_known') {
    selected = selection.decide({ arbitration:arb, head, evidence, routeabilityDisposition:'route_known' });
    if (selected.status !== 'selected') {
      finalDisposition = 'route_unresolved';
      finalReason = selected.reasonCode;
    } else if (scope.hardVeto) {
      finalDisposition = 'non_route';
      finalReason = 'scope_hard_veto';
    } else {
      finalDisposition = 'route_known';
      finalRoute = selected.routeId;
      finalReason = selected.reasonCode;
    }
  }

  return {
    id:row.id,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    expectedCandidatePath:row.expectedCandidatePath,
    nonRouteSubtype:row.nonRouteSubtype || null,
    policy:{ status:policy.status, reasonCode:policy.reasonCode },
    routeability:{ probability, threshold:routeabilityV03.calibration.threshold, disposition:routeability.disposition, reasonCode:routeability.reasonCode },
    head,
    scope,
    arbitration:arb,
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    finalDisposition,
    finalRoute,
    finalReason,
    headTop1Exact:row.expectedDisposition === 'route_known' && head.top1.id === row.expectedRoute,
    finalExact:row.expectedDisposition === 'route_known'
      ? finalDisposition === 'route_known' && finalRoute === row.expectedRoute
      : finalDisposition === 'non_route',
    finalFalseActivation:row.expectedDisposition === 'non_route' && finalDisposition === 'route_known'
  };
});

const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const selectedKnown = known.filter((row) => row.finalDisposition === 'route_known');
const routeabilityKnown = known.filter((row) => row.routeability.disposition === 'route_known');
const routeabilityNonRouteActivations = nonRoute.filter((row) => row.routeability.disposition === 'route_known');
const finalNonRouteActivations = nonRoute.filter((row) => row.finalDisposition === 'route_known');
const summary = {
  total:results.length,
  routeability:{
    threshold:routeabilityV03.calibration.threshold,
    knownRecall:ratio(routeabilityKnown.length, known.length),
    nonRouteSafety:ratio(nonRoute.length - routeabilityNonRouteActivations.length, nonRoute.length),
    falseActivation:ratio(routeabilityNonRouteActivations.length, nonRoute.length),
    strongRescues:results.filter((row) => row.routeability.reasonCode === 'confirmed_strong_rescue').length,
    explicitUnsupportedBlocks:results.filter((row) => row.routeability.reasonCode === 'explicit_unsupported_target').length
  },
  router:{ top1ExactKnown:ratio(known.filter((row) => row.headTop1Exact).length, known.length) },
  final:{
    knownRouteRetention:ratio(selectedKnown.length, known.length),
    knownExactRoute:ratio(known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, known.length),
    acceptedRouteAccuracy:ratio(selectedKnown.filter((row) => row.finalRoute === row.expectedRoute).length, selectedKnown.length),
    nonRouteExactSafety:ratio(nonRoute.filter((row) => row.finalDisposition === 'non_route').length, nonRoute.length),
    nonRouteNoRouteActivationSafety:ratio(nonRoute.length - finalNonRouteActivations.length, nonRoute.length),
    falseRouteActivation:ratio(finalNonRouteActivations.length, nonRoute.length)
  },
  correction:{
    headWrongFinalCorrect:known.filter((row) => !row.headTop1Exact && row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length,
    headCorrectFinalWrong:known.filter((row) => row.headTop1Exact && !(row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute)).length
  },
  failureStages:{
    routeabilityReject:known.filter((row) => row.routeability.disposition === 'non_route').length,
    scopeHardVeto:known.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status === 'selected' && row.scope.hardVeto).length,
    selectionUnresolved:known.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    wrongSelectedRoute:known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  },
  byKnownPath:{},
  byNonRouteSubtype:{}
};
for (const pathId of ['strong_arbitration','support_arbitration','fallback_head']) {
  const subset = known.filter((row) => row.expectedCandidatePath === pathId);
  const accepted = subset.filter((row) => row.finalDisposition === 'route_known');
  summary.byKnownPath[pathId] = {
    n:subset.length,
    routeabilityRecall:ratio(subset.filter((row) => row.routeability.disposition === 'route_known').length, subset.length),
    headTop1Exact:ratio(subset.filter((row) => row.headTop1Exact).length, subset.length),
    finalRetention:ratio(accepted.length, subset.length),
    finalExact:ratio(subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, subset.length),
    acceptedAccuracy:ratio(accepted.filter((row) => row.finalRoute === row.expectedRoute).length, accepted.length),
    routeabilityRejects:subset.filter((row) => row.routeability.disposition === 'non_route').length,
    scopeHardVetos:subset.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status === 'selected' && row.scope.hardVeto).length,
    unresolved:subset.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    wrongSelected:subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  };
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  const subset = nonRoute.filter((row) => row.nonRouteSubtype === subtype);
  summary.byNonRouteSubtype[subtype] = {
    n:subset.length,
    routeabilitySafety:ratio(subset.filter((row) => row.routeability.disposition === 'non_route').length, subset.length),
    finalExactSafety:ratio(subset.filter((row) => row.finalDisposition === 'non_route').length, subset.length),
    noRouteActivationSafety:ratio(subset.filter((row) => row.finalDisposition !== 'route_known').length, subset.length),
    falseRouteActivation:ratio(subset.filter((row) => row.finalDisposition === 'route_known').length, subset.length)
  };
}

const report = {
  version:'0.13-independent-report-v0.1',
  status:'post_lock_independent_evaluation',
  scope:'liuyao_semantic_decision_stack_v0.13',
  candidate:{ candidateSha256:candidateLock.candidateSha256, lockFile:candidateLockFile },
  evaluation:{ dataFile:evalFile, lockFile:evalLockFile, dataSha256:independentLock.dataSha256, rowCount:independent.rows.length },
  frozen:{ encoderRevision:frozen.encoder.revision, routerVersion:frozen.router.version, scopeHardVetoCutoff:frozen.semanticStackPolicy.hardVetoCutoff, routeabilityThreshold:routeabilityV03.calibration.threshold },
  policy:{ training:false, calibration:false, candidateMutation:false, postRunWordingPatch:false },
  summary,
  results
};
writeJson('data/liuyao-semantic-decision-stack-v0.13-independent-report-v0.1.json', report);
console.log(JSON.stringify(summary, null, 2));
console.log(`Independent failures: ${results.filter((row) => !row.finalExact).length}/${results.length}`);
console.log(`Candidate: ${candidateLock.candidateSha256}`);
console.log(`Eval data SHA-256: ${independentLock.dataSha256}`);
