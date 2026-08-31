import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const report = readJson('data/liuyao-semantic-decision-stack-v0.13-independent-report-v0.1.json');
const evaluation = readJson('data/liuyao-semantic-decision-stack-v0.13-independent-eval.json');
const textById = new Map(evaluation.rows.map((row) => [row.id, row.text]));

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const compatibility = context.GuiJia?.liuyaoSemanticRouteCompatibilityV02;
if (!evidenceExtractor?.extract || !compatibility?.evaluate) throw new Error('counterfactual modules missing');

const rows = report.results.map((row) => {
  const text = textById.get(row.id) || '';
  const evidence = evidenceExtractor.extract(text);
  const arbitrationCompatibility = row.arbitration?.routeId ? compatibility.evaluate(row.arbitration.routeId, evidence) : null;
  return { ...row, text, evidence, arbitrationCompatibility };
});
const known = rows.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = rows.filter((row) => row.expectedDisposition === 'non_route');
const compact = (row) => ({
  id:row.id,
  text:row.text,
  expectedRoute:row.expectedRoute,
  subtype:row.nonRouteSubtype,
  routeability:row.routeability,
  arbitration:row.arbitration,
  arbitrationCompatibility:row.arbitrationCompatibility,
  scope:row.scope,
  head:row.head,
  finalRoute:row.finalRoute,
  finalReason:row.finalReason
});

const strongScopeBypassKnown = known.filter((row) => row.finalReason === 'scope_hard_veto' && row.arbitration?.strength === 'strong' && row.arbitrationCompatibility?.status === 'confirmed');
const strongScopeBypassNonRoute = nonRoute.filter((row) => row.routeability?.disposition === 'route_known' && row.scope?.hardVeto && row.arbitration?.strength === 'strong' && row.arbitrationCompatibility?.status === 'confirmed');

const supportAcceptedKnown = known.filter((row) => row.routeability?.disposition === 'route_known' && row.arbitration?.strength === 'support' && row.arbitrationCompatibility?.status !== 'contradicted');
const supportPriorityKnownFixes = supportAcceptedKnown.filter((row) => row.finalRoute !== row.expectedRoute && row.arbitration.routeId === row.expectedRoute);
const supportPriorityKnownHarms = supportAcceptedKnown.filter((row) => row.finalRoute === row.expectedRoute && row.arbitration.routeId !== row.expectedRoute);
const supportAcceptedNonRoute = nonRoute.filter((row) => row.routeability?.disposition === 'route_known' && row.arbitration?.strength === 'support' && row.arbitrationCompatibility?.status !== 'contradicted');

const supportRejectedKnown = known.filter((row) => row.routeability?.disposition === 'non_route' && row.arbitration?.strength === 'support');
const supportRejectedConfirmedKnown = supportRejectedKnown.filter((row) => row.arbitrationCompatibility?.status === 'confirmed');
const supportRejectedCompatibleKnown = supportRejectedKnown.filter((row) => row.arbitrationCompatibility?.status === 'compatible');
const supportRejectedConfirmedNonRoute = nonRoute.filter((row) => row.routeability?.disposition === 'non_route' && row.arbitration?.strength === 'support' && row.arbitrationCompatibility?.status === 'confirmed');
const supportRejectedCompatibleNonRoute = nonRoute.filter((row) => row.routeability?.disposition === 'non_route' && row.arbitration?.strength === 'support' && row.arbitrationCompatibility?.status === 'compatible');

const result = {
  version:'0.13-v0.2-responsibility-counterfactual-v0.1',
  status:'diagnostic_only',
  policy:{ candidateV01Mutation:false, nextIndependentEvalReuse:false },
  candidateV01:report.candidate.candidateSha256,
  independentEvalSha256:report.evaluation.dataSha256,
  strongConfirmedScopeBypass:{
    recoverableKnown:strongScopeBypassKnown.length,
    newlyActivatedNonRoute:strongScopeBypassNonRoute.length,
    knownRows:strongScopeBypassKnown.map(compact),
    nonRouteRows:strongScopeBypassNonRoute.map(compact)
  },
  supportPriorityAfterRouteabilityAccept:{
    acceptedKnownSupportCandidates:supportAcceptedKnown.length,
    knownWrongSelectionsCorrectable:supportPriorityKnownFixes.length,
    knownCorrectSelectionsThatWouldBeHarmed:supportPriorityKnownHarms.length,
    nonRouteAcceptedSupportCandidates:supportAcceptedNonRoute.length,
    correctableRows:supportPriorityKnownFixes.map(compact),
    harmRows:supportPriorityKnownHarms.map(compact),
    nonRouteRows:supportAcceptedNonRoute.map(compact)
  },
  belowThresholdSupportRescue:{
    knownSupportRejects:supportRejectedKnown.length,
    knownConfirmed:supportRejectedConfirmedKnown.length,
    knownCompatible:supportRejectedCompatibleKnown.length,
    nonRouteConfirmed:supportRejectedConfirmedNonRoute.length,
    nonRouteCompatible:supportRejectedCompatibleNonRoute.length,
    knownConfirmedRows:supportRejectedConfirmedKnown.map(compact),
    nonRouteConfirmedRows:supportRejectedConfirmedNonRoute.map(compact),
    nonRouteCompatibleRows:supportRejectedCompatibleNonRoute.map(compact)
  }
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-v013-candidate-v02-responsibility-counterfactual.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  strongConfirmedScopeBypass:{ recoverableKnown:result.strongConfirmedScopeBypass.recoverableKnown, newlyActivatedNonRoute:result.strongConfirmedScopeBypass.newlyActivatedNonRoute },
  supportPriorityAfterRouteabilityAccept:{ acceptedKnownSupportCandidates:result.supportPriorityAfterRouteabilityAccept.acceptedKnownSupportCandidates, knownWrongSelectionsCorrectable:result.supportPriorityAfterRouteabilityAccept.knownWrongSelectionsCorrectable, knownCorrectSelectionsThatWouldBeHarmed:result.supportPriorityAfterRouteabilityAccept.knownCorrectSelectionsThatWouldBeHarmed, nonRouteAcceptedSupportCandidates:result.supportPriorityAfterRouteabilityAccept.nonRouteAcceptedSupportCandidates },
  belowThresholdSupportRescue:{ knownSupportRejects:result.belowThresholdSupportRescue.knownSupportRejects, knownConfirmed:result.belowThresholdSupportRescue.knownConfirmed, knownCompatible:result.belowThresholdSupportRescue.knownCompatible, nonRouteConfirmed:result.belowThresholdSupportRescue.nonRouteConfirmed, nonRouteCompatible:result.belowThresholdSupportRescue.nonRouteCompatible }
}, null, 2));
