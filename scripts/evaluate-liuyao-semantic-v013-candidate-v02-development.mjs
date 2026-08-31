import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ratio = (n, d) => d ? n / d : 0;

const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');
const routeabilityV03 = readJson('data/liuyao-semantic-routeability-v0.3.json');
const development = readJson('data/liuyao-semantic-decision-stack-v0.13-development.json');
const calibration = readJson('data/liuyao-semantic-routeability-v0.3-calibration.json');

if (development.status !== 'sealed_development_eval' || development.rows?.length !== 198) throw new Error('sealed development set missing');
if (calibration.status !== 'fresh_calibration' || calibration.rows?.length !== 223) throw new Error('fresh calibration set missing');
if (routeabilityV03.status !== 'frozen' || !Number.isFinite(routeabilityV03.calibration?.threshold)) throw new Error('frozen v0.3 threshold missing');
if (routeabilityModel.model?.weights?.length !== 512) throw new Error('frozen Routeability base model missing');
if (frozen.encoder?.revision !== routeabilityModel.encoder?.revision) throw new Error('encoder/model revision mismatch');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-selection-v03.js',
  'js/liuyao-semantic-routeability-v04.js',
  'js/liuyao-semantic-finalization-v01.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });

const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
const selection = context.GuiJia?.liuyaoSemanticRouteSelectionV03;
const routeability = context.GuiJia?.liuyaoSemanticRouteabilityV04;
const finalization = context.GuiJia?.liuyaoSemanticFinalizationV01;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !selection?.decide || !routeability?.decide || !finalization?.finalize) {
  throw new Error('v0.13-v0.2 responsibility modules failed to load');
}

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

const datasets = [
  {
    id:'sealed_development_198',
    rows:development.rows.map((row) => ({
      id:row.id,
      text:row.text,
      expectedDisposition:row.expectedDisposition,
      expectedRoute:row.expectedRoute || null,
      path:row.expectedCandidatePath || null,
      subtype:row.nonRouteSubtype || null
    }))
  },
  {
    id:'fresh_calibration_223',
    rows:calibration.rows.map((row) => ({
      id:row.id,
      text:row.text,
      expectedDisposition:row.routeabilityLabel === 'route_known' ? 'route_known' : 'non_route',
      expectedRoute:row.routeId || null,
      path:row.candidatePath || null,
      subtype:row.subtype || null
    }))
  }
];
const allRows = datasets.flatMap((dataset) => dataset.rows.map((row) => ({ ...row, datasetId:dataset.id })));
const vectors = await embed(allRows.map((row) => row.text));

const results = allRows.map((row, index) => {
  const vector = vectors[index];
  const probability = routeabilityProbability(vector);
  const head = classifyRouter(vector);
  const scope = scopeScore(vector);
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const gate = routeability.decide({ probability, threshold:routeabilityV03.calibration.threshold, arbitration:arb, evidence });
  const selected = gate.disposition === 'route_known'
    ? selection.decide({ arbitration:arb, head, evidence, routeabilityDisposition:'route_known' })
    : null;
  const final = finalization.finalize({ routeability:gate, selection:selected, scope, arbitration:arb, evidence });
  return {
    ...row,
    probability,
    head,
    scope,
    arbitration:arb,
    routeability:{ disposition:gate.disposition, reasonCode:gate.reasonCode },
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    final,
    headTop1Exact:row.expectedDisposition === 'route_known' && head.top1.id === row.expectedRoute,
    finalExact:row.expectedDisposition === 'route_known'
      ? final.disposition === 'route_known' && final.routeId === row.expectedRoute
      : final.disposition === 'non_route',
    falseRouteActivation:row.expectedDisposition === 'non_route' && final.disposition === 'route_known'
  };
});

const summarize = (datasetId) => {
  const rows = results.filter((row) => row.datasetId === datasetId);
  const known = rows.filter((row) => row.expectedDisposition === 'route_known');
  const nonRoute = rows.filter((row) => row.expectedDisposition === 'non_route');
  const accepted = known.filter((row) => row.final.disposition === 'route_known');
  const summary = {
    rows:rows.length,
    known:known.length,
    nonRoute:nonRoute.length,
    routeabilityKnownRecall:ratio(known.filter((row) => row.routeability.disposition === 'route_known').length, known.length),
    knownFinalRetention:ratio(accepted.length, known.length),
    knownExactRoute:ratio(known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, known.length),
    acceptedRouteAccuracy:ratio(accepted.filter((row) => row.final.routeId === row.expectedRoute).length, accepted.length),
    nonRouteFalseRouteActivation:ratio(nonRoute.filter((row) => row.falseRouteActivation).length, nonRoute.length),
    nonRouteNoRouteActivationSafety:ratio(nonRoute.filter((row) => row.final.disposition !== 'route_known').length, nonRoute.length),
    rescueAndBypass:{
      confirmedStrongRescue:rows.filter((row) => row.routeability.reasonCode === 'confirmed_strong_rescue').length,
      confirmedSupportRescue:rows.filter((row) => row.routeability.reasonCode === 'confirmed_support_rescue').length,
      supportPriority:rows.filter((row) => row.selection?.reasonCode === 'support_arbitration_priority_after_routeability').length,
      confirmedStrongScopeBypass:rows.filter((row) => row.final.reasonCode === 'confirmed_strong_scope_bypass').length
    },
    byKnownPath:{},
    byNonRouteSubtype:{},
    failures:{
      routeabilityReject:known.filter((row) => row.routeability.disposition === 'non_route').length,
      selectionUnresolved:known.filter((row) => row.routeability.disposition === 'route_known' && row.selection?.status !== 'selected').length,
      scopeHardVeto:known.filter((row) => row.final.reasonCode === 'scope_hard_veto').length,
      wrongSelectedRoute:known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
    }
  };
  for (const pathId of ['strong_arbitration','support_arbitration','fallback_head']) {
    const subset = known.filter((row) => row.path === pathId);
    if (!subset.length) continue;
    const acceptedSubset = subset.filter((row) => row.final.disposition === 'route_known');
    summary.byKnownPath[pathId] = {
      n:subset.length,
      routeabilityRecall:ratio(subset.filter((row) => row.routeability.disposition === 'route_known').length, subset.length),
      finalExact:ratio(subset.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, subset.length),
      acceptedAccuracy:ratio(acceptedSubset.filter((row) => row.final.routeId === row.expectedRoute).length, acceptedSubset.length)
    };
  }
  for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
    const subset = nonRoute.filter((row) => row.subtype === subtype);
    if (!subset.length) continue;
    summary.byNonRouteSubtype[subtype] = {
      n:subset.length,
      falseRouteActivation:ratio(subset.filter((row) => row.falseRouteActivation).length, subset.length),
      noRouteActivationSafety:ratio(subset.filter((row) => row.final.disposition !== 'route_known').length, subset.length)
    };
  }
  return summary;
};

const byDataset = Object.fromEntries(datasets.map((dataset) => [dataset.id, summarize(dataset.id)]));
const promotionPolicy = {
  minimumKnownExactRoute:0.80,
  minimumAcceptedRouteAccuracy:0.98,
  maximumOverallFalseRouteActivation:0.05,
  maximumFalseRouteActivationPerNonRouteSubtype:0.05,
  requireNoStructuralPathCollapse:true
};
const developmentSummary = byDataset.sealed_development_198;
const developmentChecks = {
  knownExactRoute:developmentSummary.knownExactRoute >= promotionPolicy.minimumKnownExactRoute,
  acceptedRouteAccuracy:developmentSummary.acceptedRouteAccuracy >= promotionPolicy.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation:developmentSummary.nonRouteFalseRouteActivation <= promotionPolicy.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation:Object.values(developmentSummary.byNonRouteSubtype).every((row) => row.falseRouteActivation <= promotionPolicy.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse:Object.values(developmentSummary.byKnownPath).every((row) => row.finalExact > 0)
};

const report = {
  version:'0.13-candidate-v0.2-development-report-v0.1',
  status:'pre_lock_development_diagnostic',
  policy:{
    usesIndependentEval:false,
    training:false,
    calibration:false,
    mutatesCandidateV01:false,
    claimsGeneralization:false
  },
  candidateDraft:{
    evidence:'v0.2',
    arbitration:'v0.12',
    compatibility:'v0.2',
    routeabilityPolicy:'v0.4',
    selection:'v0.3',
    finalization:'v0.1',
    routeabilityBaseModel:'frozen_v0.2',
    threshold:routeabilityV03.calibration.threshold,
    router:'v0.8.1-canonical-frozen',
    scopeHardVeto:frozen.semanticStackPolicy.hardVetoCutoff
  },
  promotionPolicy,
  byDataset,
  developmentChecks,
  readyForCandidateLock:Object.values(developmentChecks).every(Boolean),
  failures:results.filter((row) => !row.finalExact).map((row) => ({
    dataset:row.datasetId,
    id:row.id,
    text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    path:row.path,
    subtype:row.subtype,
    routeability:row.routeability,
    arbitration:row.arbitration,
    selection:row.selection,
    scope:row.scope,
    final:row.final,
    headTop1:row.head.top1
  }))
};

writeJson('data/liuyao-semantic-v013-candidate-v02-development-report.json', report);
console.log(JSON.stringify({
  readyForCandidateLock:report.readyForCandidateLock,
  developmentChecks,
  byDataset:Object.fromEntries(Object.entries(byDataset).map(([id, value]) => [id, {
    knownExactRoute:value.knownExactRoute,
    acceptedRouteAccuracy:value.acceptedRouteAccuracy,
    nonRouteFalseRouteActivation:value.nonRouteFalseRouteActivation,
    rescueAndBypass:value.rescueAndBypass,
    failures:value.failures,
    byKnownPath:value.byKnownPath,
    byNonRouteSubtype:value.byNonRouteSubtype
  }]))
}, null, 2));
