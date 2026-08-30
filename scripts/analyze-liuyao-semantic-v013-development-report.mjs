import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-development-report.json'), 'utf8'));
const out = path.join(root, 'data/liuyao-semantic-decision-stack-v0.13-development-diagnostic.json');
const rows = report.results || [];
if (rows.length !== 198) throw new Error(`development report row count ${rows.length} != 198`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-selection-v01.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV01;
const compatibility = context.GuiJia?.liuyaoSemanticRouteCompatibilityV01;
const selection = context.GuiJia?.liuyaoSemanticRouteSelectionV01;
if (!evidenceExtractor?.extract || !compatibility?.evaluate || !selection?.decide) throw new Error('diagnostic routing modules failed to load');

const ratio = (n,d) => d ? n/d : 0;
const known = rows.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = rows.filter((row) => row.expectedDisposition === 'non_route');
const rejectedKnown = known.filter((row) => row.routeability.disposition === 'non_route');
const rejectedByPath = {};
const rejectedByRoute = {};
for (const row of rejectedKnown) {
  rejectedByPath[row.expectedCandidatePath] = (rejectedByPath[row.expectedCandidatePath] || 0) + 1;
  rejectedByRoute[row.expectedRoute] = (rejectedByRoute[row.expectedRoute] || 0) + 1;
}

const strongRescueRows = [];
for (const row of rows) {
  if (row.routeability.disposition !== 'non_route' || row.arbitration?.strength !== 'strong') continue;
  const evidence = evidenceExtractor.extract(row.text);
  const arbCompatibility = compatibility.evaluate(row.arbitration.routeId, evidence);
  const selected = selection.decide({ arbitration:row.arbitration, head:row.head, evidence, routeabilityDisposition:'route_known' });
  const rescued = selected.status === 'selected' && !row.scope.hardVeto;
  strongRescueRows.push({
    id:row.id,
    text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    nonRouteSubtype:row.nonRouteSubtype,
    probability:row.routeability.probability,
    arbitrationRoute:row.arbitration.routeId,
    arbitrationCompatibility:arbCompatibility.status,
    selectionStatus:selected.status,
    selectionRoute:selected.routeId,
    selectionReason:selected.reasonCode,
    scopeHardVeto:row.scope.hardVeto,
    rescued,
    exactIfRescued:row.expectedDisposition === 'route_known' && rescued && selected.routeId === row.expectedRoute,
    falseActivationIfRescued:row.expectedDisposition === 'non_route' && rescued
  });
}
const strongKnown = strongRescueRows.filter((row) => row.expectedDisposition === 'route_known');
const strongNonRoute = strongRescueRows.filter((row) => row.expectedDisposition === 'non_route');

const thresholdRows = rows.map((row) => ({
  probability:row.routeability.probability,
  label:row.expectedDisposition === 'route_known' ? 'route_known' : 'non_route'
}));
const candidates = [...new Set(thresholdRows.map((row) => row.probability))].sort((a,b) => a-b);
let bestAtFivePercent = null;
for (const threshold of candidates) {
  const knownRecall = ratio(thresholdRows.filter((row) => row.label === 'route_known' && row.probability >= threshold).length, known.length);
  const falseActivation = ratio(thresholdRows.filter((row) => row.label === 'non_route' && row.probability >= threshold).length, nonRoute.length);
  const candidate = { threshold, knownRecall, falseActivation, nonRouteSafety:1-falseActivation };
  if (falseActivation <= 0.05 + 1e-12 && (!bestAtFivePercent || knownRecall > bestAtFivePercent.knownRecall || (knownRecall === bestAtFivePercent.knownRecall && falseActivation < bestAtFivePercent.falseActivation))) bestAtFivePercent = candidate;
}

const wrongFallback = known.filter((row) => row.expectedCandidatePath === 'fallback_head' && row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute).map((row) => {
  const evidence = evidenceExtractor.extract(row.text);
  return {
    id:row.id,
    text:row.text,
    expectedRoute:row.expectedRoute,
    finalRoute:row.finalRoute,
    headTop1:row.head.top1,
    headTop2:row.head.top2,
    expectedCompatibility:compatibility.evaluate(row.expectedRoute, evidence),
    top1Compatibility:compatibility.evaluate(row.head.top1.id, evidence),
    top2Compatibility:compatibility.evaluate(row.head.top2.id, evidence),
    routeabilityProbability:row.routeability.probability
  };
});

const rejectedSorted = [...rejectedKnown].sort((a,b) => b.routeability.probability - a.routeability.probability);
const diagnostic = {
  version:'0.13-development-diagnostic-v0.1',
  status:'development_diagnostic',
  scope:'liuyao_semantic_decision_stack_v0.13',
  baselineThreshold:report.results[0]?.routeability.threshold,
  gateRejects:{
    total:rejectedKnown.length,
    byPath:rejectedByPath,
    byRoute:rejectedByRoute,
    closestBelowThreshold:rejectedSorted.slice(0,15).map((row) => ({ id:row.id, text:row.text, expectedRoute:row.expectedRoute, path:row.expectedCandidatePath, probability:row.routeability.probability, arbitration:row.arbitration }))
  },
  strongArbitrationRescue:{
    rejectedRowsWithStrongArbitration:strongRescueRows.length,
    knownCandidates:strongKnown.length,
    knownRescuedExact:strongKnown.filter((row) => row.exactIfRescued).length,
    nonRouteCandidates:strongNonRoute.length,
    nonRouteFalseActivations:strongNonRoute.filter((row) => row.falseActivationIfRescued).length,
    rows:strongRescueRows
  },
  diagnosticThresholdSweep:{
    note:'Development-only counterfactual; not Routeability v0.2 recalibration.',
    bestAtMaxFivePercentFalseActivation:bestAtFivePercent
  },
  wrongFallback
};
fs.writeFileSync(out, `${JSON.stringify(diagnostic, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  gateRejects:diagnostic.gateRejects.total,
  rejectedByPath:diagnostic.gateRejects.byPath,
  strongArbitrationRescue:{
    knownCandidates:diagnostic.strongArbitrationRescue.knownCandidates,
    knownRescuedExact:diagnostic.strongArbitrationRescue.knownRescuedExact,
    nonRouteCandidates:diagnostic.strongArbitrationRescue.nonRouteCandidates,
    nonRouteFalseActivations:diagnostic.strongArbitrationRescue.nonRouteFalseActivations
  },
  thresholdSweep:diagnostic.diagnosticThresholdSweep.bestAtMaxFivePercentFalseActivation,
  wrongFallback:diagnostic.wrongFallback
}, null, 2));
