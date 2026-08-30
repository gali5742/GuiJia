import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const development = readJson('data/liuyao-semantic-decision-stack-v0.13-development.json');
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityArtifact = readJson('data/liuyao-semantic-routeability-v0.2.json');

if (development.rows?.length !== 198 || development.sealed !== true) throw new Error('sealed v0.13 development eval missing');
if (frozen.router?.routeOrder?.length !== 22) throw new Error('frozen Router v0.8.1 artifact missing');
if (routeabilityArtifact.status !== 'frozen' || routeabilityArtifact.model?.weights?.length !== 512) throw new Error('frozen Routeability v0.2 artifact missing');
if (routeabilityArtifact.encoder?.revision !== frozen.encoder?.revision) throw new Error('Routeability/frozen encoder revision mismatch');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-selection-v01.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV01;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV011;
const selection = context.GuiJia?.liuyaoSemanticRouteSelectionV01;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !selection?.decide) throw new Error('v0.13 routing modules failed to load');

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
const scoreRouteability = (vector) => {
  const probability = sigmoid(dot(routeabilityArtifact.model.weights, vector) + routeabilityArtifact.model.bias);
  return {
    probability,
    threshold:routeabilityArtifact.calibration.threshold,
    disposition:probability >= routeabilityArtifact.calibration.threshold ? 'route_known' : 'non_route'
  };
};
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

const vectors = await embed(development.rows.map((row) => row.text));
const results = development.rows.map((row, index) => {
  const vector = vectors[index];
  const routeability = scoreRouteability(vector);
  const head = classifyRouter(vector);
  const scope = scoreScope(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  let selected = null;
  let finalDisposition = 'non_route';
  let finalRoute = null;
  let finalReason = 'routeability_non_route';

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
    text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    expectedCandidatePath:row.expectedCandidatePath,
    nonRouteSubtype:row.nonRouteSubtype || null,
    routeability,
    head,
    scope,
    arbitration:arb,
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    finalDisposition,
    finalRoute,
    finalReason,
    headTop1Exact:row.expectedDisposition === 'route_known' && head.top1.id === row.expectedRoute,
    finalExact:row.expectedDisposition === 'route_known' ? finalDisposition === 'route_known' && finalRoute === row.expectedRoute : finalDisposition === 'non_route',
    finalFalseActivation:row.expectedDisposition === 'non_route' && finalDisposition === 'route_known'
  };
});

const ratio = (n,d) => d ? n/d : 0;
const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const selectedKnown = known.filter((row) => row.finalDisposition === 'route_known');
const summary = {
  total:results.length,
  routeability:{
    knownRecall:ratio(known.filter((row) => row.routeability.disposition === 'route_known').length, known.length),
    nonRouteSafety:ratio(nonRoute.filter((row) => row.routeability.disposition === 'non_route').length, nonRoute.length),
    falseActivation:ratio(nonRoute.filter((row) => row.routeability.disposition === 'route_known').length, nonRoute.length)
  },
  router:{
    top1ExactKnown:ratio(known.filter((row) => row.headTop1Exact).length, known.length)
  },
  final:{
    knownRouteRetention:ratio(selectedKnown.length, known.length),
    knownExactRoute:ratio(known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, known.length),
    acceptedRouteAccuracy:ratio(selectedKnown.filter((row) => row.finalRoute === row.expectedRoute).length, selectedKnown.length),
    nonRouteExactSafety:ratio(nonRoute.filter((row) => row.finalDisposition === 'non_route').length, nonRoute.length),
    nonRouteNoRouteActivationSafety:ratio(nonRoute.filter((row) => row.finalDisposition !== 'route_known').length, nonRoute.length),
    falseRouteActivation:ratio(nonRoute.filter((row) => row.finalFalseActivation).length, nonRoute.length)
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
  const rows = known.filter((row) => row.expectedCandidatePath === pathId);
  const selected = rows.filter((row) => row.finalDisposition === 'route_known');
  summary.byKnownPath[pathId] = {
    n:rows.length,
    routeabilityRecall:ratio(rows.filter((row) => row.routeability.disposition === 'route_known').length, rows.length),
    headTop1Exact:ratio(rows.filter((row) => row.headTop1Exact).length, rows.length),
    finalRetention:ratio(selected.length, rows.length),
    finalExact:ratio(rows.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, rows.length),
    acceptedAccuracy:ratio(selected.filter((row) => row.finalRoute === row.expectedRoute).length, selected.length),
    routeabilityRejects:rows.filter((row) => row.routeability.disposition === 'non_route').length,
    scopeHardVetos:rows.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status === 'selected' && row.scope.hardVeto).length,
    unresolved:rows.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    wrongSelected:rows.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  };
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  const rows = nonRoute.filter((row) => row.nonRouteSubtype === subtype);
  summary.byNonRouteSubtype[subtype] = {
    n:rows.length,
    routeabilitySafety:ratio(rows.filter((row) => row.routeability.disposition === 'non_route').length, rows.length),
    finalExactSafety:ratio(rows.filter((row) => row.finalDisposition === 'non_route').length, rows.length),
    noRouteActivationSafety:ratio(rows.filter((row) => row.finalDisposition !== 'route_known').length, rows.length),
    falseRouteActivation:ratio(rows.filter((row) => row.finalDisposition === 'route_known').length, rows.length)
  };
}

const report = {
  version:'0.13-development-report-v0.1',
  status:'development_evaluation',
  scope:'liuyao_semantic_decision_stack_v0.13',
  candidate:{
    router:'frozen_v0.8.1_artifact',
    routeability:'frozen_v0.2',
    evidence:'v0.1',
    arbitration:'v0.11',
    compatibility:'v0.1',
    selection:'v0.1',
    scopeHardVeto:frozen.semanticStackPolicy.hardVetoCutoff
  },
  summary,
  failures:results.filter((row) => !row.finalExact),
  results
};
writeJson('data/liuyao-semantic-decision-stack-v0.13-development-report.json', report);

console.log('LiuYao Semantic Decision Stack v0.13 development E2E complete.');
console.log(JSON.stringify(summary, null, 2));
console.log(`Failures: ${report.failures.length}/${results.length}`);
