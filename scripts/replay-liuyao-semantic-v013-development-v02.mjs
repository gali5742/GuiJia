import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const baseline = readJson('data/liuyao-semantic-decision-stack-v0.13-development-report.json');
const rows = baseline.results || [];
if (rows.length !== 198) throw new Error(`baseline result rows ${rows.length} != 198`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-selection-v02.js',
  'js/liuyao-semantic-routeability-v03.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const G = context.GuiJia;
const evidenceExtractor = G.liuyaoSemanticRouteEvidenceV02;
const arbitration = G.liuyaoSemanticRouteArbitrationV012;
const selection = G.liuyaoSemanticRouteSelectionV02;
const routeability = G.liuyaoSemanticRouteabilityV03;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !selection?.decide || !routeability?.decide) throw new Error('refined semantic modules failed to load');

const replayed = rows.map((row) => {
  const evidence = evidenceExtractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, evidence);
  const gate = routeability.decide({ probability:row.routeability.probability, threshold:row.routeability.threshold, arbitration:arb, evidence });
  let selected = null;
  let finalDisposition = 'non_route';
  let finalRoute = null;
  let finalReason = gate.reasonCode;
  if (gate.disposition === 'route_known') {
    selected = selection.decide({ arbitration:arb, head:row.head, evidence, routeabilityDisposition:'route_known' });
    if (selected.status !== 'selected') {
      finalDisposition = 'route_unresolved';
      finalReason = selected.reasonCode;
    } else if (row.scope.hardVeto) {
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
    nonRouteSubtype:row.nonRouteSubtype,
    routeability:{ probability:row.routeability.probability, threshold:row.routeability.threshold, disposition:gate.disposition, reasonCode:gate.reasonCode },
    head:row.head,
    scope:row.scope,
    arbitration:arb,
    selection:selected ? { status:selected.status, routeId:selected.routeId, reasonCode:selected.reasonCode } : null,
    unsupportedTargets:evidence.unsupportedTargets || [],
    finalDisposition,
    finalRoute,
    finalReason,
    headTop1Exact:row.expectedDisposition === 'route_known' && row.head.top1.id === row.expectedRoute,
    finalExact:row.expectedDisposition === 'route_known' ? finalDisposition === 'route_known' && finalRoute === row.expectedRoute : finalDisposition === 'non_route',
    falseRouteActivation:row.expectedDisposition === 'non_route' && finalDisposition === 'route_known'
  };
});
const ratio = (n,d) => d ? n/d : 0;
const known = replayed.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = replayed.filter((row) => row.expectedDisposition === 'non_route');
const acceptedKnown = known.filter((row) => row.finalDisposition === 'route_known');
const summary = {
  total:replayed.length,
  routeability:{
    knownRecall:ratio(known.filter((row) => row.routeability.disposition === 'route_known').length, known.length),
    nonRouteSafety:ratio(nonRoute.filter((row) => row.routeability.disposition === 'non_route').length, nonRoute.length),
    falseActivation:ratio(nonRoute.filter((row) => row.routeability.disposition === 'route_known').length, nonRoute.length),
    strongRescues:replayed.filter((row) => row.routeability.reasonCode === 'confirmed_strong_rescue').length,
    explicitUnsupportedBlocks:replayed.filter((row) => row.routeability.reasonCode === 'explicit_unsupported_target').length
  },
  final:{
    knownRouteRetention:ratio(acceptedKnown.length, known.length),
    knownExactRoute:ratio(known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, known.length),
    acceptedRouteAccuracy:ratio(acceptedKnown.filter((row) => row.finalRoute === row.expectedRoute).length, acceptedKnown.length),
    nonRouteExactSafety:ratio(nonRoute.filter((row) => row.finalDisposition === 'non_route').length, nonRoute.length),
    falseRouteActivation:ratio(nonRoute.filter((row) => row.finalDisposition === 'route_known').length, nonRoute.length)
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
    finalExact:ratio(subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute).length, subset.length),
    acceptedAccuracy:ratio(accepted.filter((row) => row.finalRoute === row.expectedRoute).length, accepted.length),
    rejects:subset.filter((row) => row.routeability.disposition === 'non_route').length,
    wrongSelected:subset.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).length
  };
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  const subset = nonRoute.filter((row) => row.nonRouteSubtype === subtype);
  summary.byNonRouteSubtype[subtype] = {
    n:subset.length,
    routeabilitySafety:ratio(subset.filter((row) => row.routeability.disposition === 'non_route').length, subset.length),
    finalSafety:ratio(subset.filter((row) => row.finalDisposition === 'non_route').length, subset.length),
    falseActivation:ratio(subset.filter((row) => row.finalDisposition === 'route_known').length, subset.length)
  };
}
const report = {
  version:'0.13-development-report-v0.2',
  status:'development_replay_after_tuning',
  scope:'liuyao_semantic_decision_stack_v0.13',
  warning:'The 198-row development set has now informed this refinement. These metrics are tuning diagnostics, not independent generalization evidence.',
  candidate:{ evidence:'v0.2', arbitration:'v0.12', compatibility:'v0.2', selection:'v0.2', routeabilityPolicy:'v0.3_over_frozen_v0.2_model_and_threshold' },
  summary,
  failures:replayed.filter((row) => !row.finalExact),
  results:replayed
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-development-report-v0.2.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(summary, null, 2));
console.log(`Failures: ${report.failures.length}/${replayed.length}`);
