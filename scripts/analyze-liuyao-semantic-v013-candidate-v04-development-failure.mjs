import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  report:'data/liuyao-semantic-v013-candidate-v04-development-report-v0.1.json',
  developmentLock:'data/liuyao-semantic-v013-candidate-v04-development.lock.json',
  runtimeLock:'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json',
  design:'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json',
  out:'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.1.json'
};
const EXPECTED = {
  reportBlob:'13d73d9ddd44e3ed3187d0b153a5ea316eaf9d91',
  datasetSha256:'5787dcea81d8e86839aaad17d012c7195def1638d048f404ee0c25e91fb9b213',
  sealCommit:'8fa9a4e50ebe500c6f28144b0158fd1e3baf273f',
  reportCommit:'4493321a90dfffa71c1d1bfd60a376e941faa8cb'
};
const read = p => fs.readFileSync(path.join(root, p));
const json = p => JSON.parse(read(p).toString('utf8'));
const sha256 = p => crypto.createHash('sha256').update(read(p)).digest('hex');
const blobSha = p => {
  const b = read(p);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
};
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const rate = (n,d) => d ? n/d : 0;
const countBy = (rows, fn) => {
  const m = new Map();
  for (const row of rows) { const k = String(fn(row)); m.set(k, (m.get(k) || 0) + 1); }
  return Object.fromEntries([...m.entries()].sort(([a],[b]) => a.localeCompare(b)));
};

const report = json(P.report);
const developmentLock = json(P.developmentLock);
const runtimeLock = json(P.runtimeLock);
const design = json(P.design);

assert(blobSha(P.report) === EXPECTED.reportBlob, `first-development report blob drift: ${blobSha(P.report)}`);
assert(report.version === '0.13-candidate-v0.4-development-report-v0.1', `report version drift: ${report.version}`);
assert(report.status === 'fresh_development_fail_immutable', `diagnosis requires immutable failed report: ${report.status}`);
assert(report.readyForCandidateLock === false, 'failed report unexpectedly permits Candidate lock');
assert(Array.isArray(report.results) && report.results.length === 198, `report results ${report.results?.length} != 198`);
assert(developmentLock.status === 'locked_before_first_development_encoder_scoring', `development lock status drift: ${developmentLock.status}`);
assert(developmentLock.dataset?.sha256 === EXPECTED.datasetSha256, 'sealed dataset SHA-256 drift');
assert(developmentLock.generation?.encoderScoringPerformedBeforeSeal === false, 'development cohort was scored before seal');
assert(runtimeLock.status === 'runtime_locked_before_fresh_development', `runtime lock status drift: ${runtimeLock.status}`);
assert(runtimeLock.execution?.fallbackGlobalThreshold === 0.5549057227178391, 'Fallback threshold drift');
assert(runtimeLock.execution?.semanticActThreshold === 0.5045675974201208, 'Semantic Act threshold drift');
assert(runtimeLock.execution?.routeabilityThreshold === 0.7678148573595883, 'Routeability threshold drift');
assert(runtimeLock.execution?.routeInventoryCount === 22, 'route inventory drift');

const R = report.results;
const known = R.filter(x => x.expectedDisposition === 'route_known');
const nonRoute = R.filter(x => x.expectedDisposition === 'non_route');
const exactKnown = known.filter(x => x.final?.disposition === 'route_known' && x.final?.routeId === x.expectedRoute);
const acceptedKnown = known.filter(x => x.final?.disposition === 'route_known');
const knownMiss = known.filter(x => !(x.final?.disposition === 'route_known' && x.final?.routeId === x.expectedRoute));
const wrongAccepted = acceptedKnown.filter(x => x.final?.routeId !== x.expectedRoute);
const falseActs = nonRoute.filter(x => x.final?.disposition === 'route_known');
assert(known.length === 132 && nonRoute.length === 66, `partition drift ${known.length}/${nonRoute.length}`);
assert(knownMiss.length === 36, `known miss count drift: ${knownMiss.length}`);
assert(wrongAccepted.length === 2, `wrong accepted count drift: ${wrongAccepted.length}`);
assert(falseActs.length === 10, `non-route false activation count drift: ${falseActs.length}`);

const failureCause = x => {
  if (x.final?.disposition === 'route_known' && x.final?.routeId !== x.expectedRoute) return 'wrong_route_accepted';
  if (x.semanticAct?.status !== 'eligible') return 'semantic_act_reject';
  if (x.final?.reasonCode === 'scope_hard_veto') return 'scope_hard_veto';
  if (!x.routeability || x.routeability.disposition !== 'route_known') return 'routeability_reject';
  const f = x.fallbackIdentity?.decision?.reasonCode;
  if (f === 'fallback_identity_all22_reject_all') return 'fallback_reject_all';
  if (f === 'fallback_identity_all22_multiple_admissions') return 'fallback_multiple_admissions';
  if (!x.selection || x.selection.status !== 'selected') return 'selection_unresolved';
  return 'finalization_other';
};
const activationSource = x => {
  if (x.arbitration?.routeId === x.final?.routeId) return `arbitration_${x.arbitration?.strength || 'unknown'}`;
  if (x.fallbackIdentity?.decision?.status === 'selected' && x.fallbackIdentity?.decision?.routeId === x.final?.routeId) return 'fallback_identity_all22';
  if (x.selection?.status === 'selected' && x.selection?.routeId === x.final?.routeId) return 'selection_other';
  return 'unknown';
};
const pathIds = ['strong_arbitration','support_arbitration','fallback_identity_all22'];
const byKnownPath = {};
for (const id of pathIds) {
  const rows = known.filter(x => x.expectedCandidatePath === id);
  const exact = rows.filter(x => x.final?.disposition === 'route_known' && x.final?.routeId === x.expectedRoute);
  const accepted = rows.filter(x => x.final?.disposition === 'route_known');
  const reached = rows.filter(x => x.reachesFallbackIdentity === true);
  byKnownPath[id] = {
    n:rows.length,
    exact:exact.length,
    exactRate:rate(exact.length, rows.length),
    accepted:accepted.length,
    wrongAccepted:accepted.filter(x => x.final?.routeId !== x.expectedRoute).length,
    acceptedRouteAccuracy:rate(exact.length, accepted.length),
    semanticActRejects:rows.filter(x => x.semanticAct?.status !== 'eligible').length,
    routeabilityRejects:rows.filter(x => x.semanticAct?.status === 'eligible' && (!x.routeability || x.routeability.disposition !== 'route_known')).length,
    fallbackReached:reached.length,
    fallbackSelected:reached.filter(x => x.fallbackIdentity?.decision?.status === 'selected').length,
    fallbackRejectAll:reached.filter(x => x.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_reject_all').length,
    fallbackMultipleAdmissions:reached.filter(x => x.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_multiple_admissions').length,
    selectionUnresolved:rows.filter(x => x.routeability?.disposition === 'route_known' && (!x.selection || x.selection.status !== 'selected')).length,
    scopeHardVeto:rows.filter(x => x.final?.reasonCode === 'scope_hard_veto').length
  };
}
const subtypeIds = ['outside_current_22','route_unresolved','near_domain_not_current_route'];
const bySubtype = {};
for (const id of subtypeIds) {
  const rows = nonRoute.filter(x => x.nonRouteSubtype === id);
  const activated = rows.filter(x => x.final?.disposition === 'route_known');
  bySubtype[id] = {
    n:rows.length,
    falseActivations:activated.length,
    falseActivationRate:rate(activated.length, rows.length),
    semanticActRejected:rows.filter(x => x.semanticAct?.status !== 'eligible').length,
    routeabilityRejectedAfterEligible:rows.filter(x => x.semanticAct?.status === 'eligible' && (!x.routeability || x.routeability.disposition !== 'route_known')).length,
    falseActivationSources:countBy(activated, activationSource),
    activatedRoutes:countBy(activated, x => x.final?.routeId || 'null')
  };
}
const missesByRoute = {};
for (const x of knownMiss) {
  const e = missesByRoute[x.expectedRoute] ||= { misses:0, causes:{} };
  e.misses += 1;
  const c = failureCause(x);
  e.causes[c] = (e.causes[c] || 0) + 1;
}
for (const e of Object.values(missesByRoute)) e.causes = Object.fromEntries(Object.entries(e.causes).sort(([a],[b]) => a.localeCompare(b)));
const compactKnown = x => ({
  id:x.id, text:x.text, expectedRoute:x.expectedRoute, expectedCandidatePath:x.expectedCandidatePath || null,
  failureCause:failureCause(x),
  semanticAct:x.semanticAct ? {status:x.semanticAct.status, probability:x.semanticAct.probability, threshold:x.semanticAct.threshold}:null,
  arbitration:x.arbitration ? {routeId:x.arbitration.routeId || null, strength:x.arbitration.strength || null}:null,
  routeability:x.routeability ? {disposition:x.routeability.disposition, probability:x.routeability.probability, reasonCode:x.routeability.reasonCode}:null,
  fallbackIdentity:x.fallbackIdentity ? {status:x.fallbackIdentity.decision?.status || null, routeId:x.fallbackIdentity.decision?.routeId || null, reasonCode:x.fallbackIdentity.decision?.reasonCode || null}:null,
  selection:x.selection ? {status:x.selection.status, routeId:x.selection.routeId || null, reasonCode:x.selection.reasonCode || null}:null,
  final:{disposition:x.final?.disposition || null, routeId:x.final?.routeId || null, reasonCode:x.final?.reasonCode || null}
});
const compactFalse = x => ({
  id:x.id, text:x.text, nonRouteSubtype:x.nonRouteSubtype, source:activationSource(x),
  semanticAct:x.semanticAct ? {status:x.semanticAct.status, probability:x.semanticAct.probability, threshold:x.semanticAct.threshold}:null,
  arbitration:x.arbitration ? {routeId:x.arbitration.routeId || null, strength:x.arbitration.strength || null}:null,
  routeability:x.routeability ? {disposition:x.routeability.disposition, probability:x.routeability.probability, reasonCode:x.routeability.reasonCode}:null,
  fallbackIdentity:x.fallbackIdentity ? {status:x.fallbackIdentity.decision?.status || null, routeId:x.fallbackIdentity.decision?.routeId || null, reasonCode:x.fallbackIdentity.decision?.reasonCode || null}:null,
  selection:x.selection ? {status:x.selection.status, routeId:x.selection.routeId || null, reasonCode:x.selection.reasonCode || null}:null,
  final:{disposition:x.final?.disposition || null, routeId:x.final?.routeId || null, reasonCode:x.final?.reasonCode || null}
});

const gates = design.freshDevelopmentPolicy.promotionGates;
const headline = {
  knownExactRoute:rate(exactKnown.length, known.length),
  acceptedRouteAccuracy:rate(exactKnown.length, acceptedKnown.length),
  overallFalseRouteActivation:rate(falseActs.length, nonRoute.length),
  maxFalseRouteActivationPerSubtype:Math.max(...Object.values(bySubtype).map(x => x.falseActivationRate)),
  noStructuralPathCollapse:Object.values(byKnownPath).every(x => x.exact > 0),
  checks:report.checks,
  readyForCandidateLock:false
};
const dominant = Object.entries(bySubtype).sort((a,b) => b[1].falseActivations-a[1].falseActivations)[0];
const output = {
  version:'0.13-candidate-v0.4-development-failure-diagnostic-v0.1',
  status:'immutable_failure_diagnosis_from_committed_first_development_report',
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.4',
  provenance:{
    sourceReport:{path:P.report, gitBlobSha:EXPECTED.reportBlob, sha256:sha256(P.report), commit:EXPECTED.reportCommit},
    sealedDevelopment:{path:P.developmentLock, datasetSha256:EXPECTED.datasetSha256, sealCommit:EXPECTED.sealCommit},
    runtimeLock:{path:P.runtimeLock, gitBlobSha:blobSha(P.runtimeLock)},
    design:{path:P.design, gitBlobSha:blobSha(P.design)}
  },
  policy:{rerunsEncoder:false, invokesModel:false, readsIndependentEvaluation:false, readsSealedBlindEvaluation:false, mutatesCandidateV04:false, mutatesDevelopmentCohort:false, mutatesThresholds:false, sourceIsCommittedFirstDevelopmentReportOnly:true},
  frozenPromotionGates:gates,
  headline,
  totals:{rows:R.length, known:known.length, nonRoute:nonRoute.length, knownExact:exactKnown.length, knownNonExact:knownMiss.length, acceptedKnown:acceptedKnown.length, wrongAcceptedKnown:wrongAccepted.length, nonRouteFalseActivations:falseActs.length},
  knownFailureCauses:countBy(knownMiss, failureCause),
  byKnownPath,
  knownMissesByExpectedRoute:Object.fromEntries(Object.entries(missesByRoute).sort(([a],[b]) => a.localeCompare(b))),
  wrongAcceptedKnown:wrongAccepted.map(compactKnown),
  byNonRouteSubtype:bySubtype,
  falseRouteActivations:falseActs.map(compactFalse),
  routeUnresolvedFalseActivations:falseActs.filter(x => x.nonRouteSubtype === 'route_unresolved').map(compactFalse),
  candidateV03DirectionalComparison:{
    cohortLevelDirectionalOnly:true, pairedRowComparison:false,
    candidateV03Signals:design.diagnosisSignals || {},
    candidateV04Signals:{knownMisses:knownMiss.length, wrongAcceptedKnown:wrongAccepted.length, overallNonRouteFalseActivations:falseActs.length, nearDomainFalseActivations:bySubtype.near_domain_not_current_route.falseActivations, routeUnresolvedFalseActivations:bySubtype.route_unresolved.falseActivations, strongExact:byKnownPath.strong_arbitration.exact, supportExact:byKnownPath.support_arbitration.exact, fallbackExact:byKnownPath.fallback_identity_all22.exact}
  },
  diagnosis:{
    failureIsMultiSurface:true,
    structuralPathCollapseObserved:!headline.noStructuralPathCollapse,
    dominantNonRouteFailureSubtype:{subtype:dominant[0], falseActivations:dominant[1].falseActivations, rate:dominant[1].falseActivationRate},
    nearDomainInformationProcedureSafetyObserved:bySubtype.near_domain_not_current_route.falseActivations === 0,
    routeUnresolvedSafetyIsDominant:bySubtype.route_unresolved.falseActivations === Math.max(...Object.values(bySubtype).map(x => x.falseActivations)),
    knownRecallBelowGate:headline.knownExactRoute < gates.minimumKnownExactRoute,
    acceptedPrecisionBelowGate:headline.acceptedRouteAccuracy < gates.minimumAcceptedRouteAccuracy,
    overallSafetyBelowGate:headline.overallFalseRouteActivation > gates.maximumOverallFalseRouteActivation,
    subtypeSafetyBelowGate:headline.maxFalseRouteActivationPerSubtype > gates.maximumFalseRouteActivationPerNonRouteSubtype,
    sameVersionRetuneAuthorized:false
  },
  nextAction:'freeze_candidate_v05_design_from_this_diagnosis_before_any_new_training_calibration_threshold_or_runtime_change'
};

fs.writeFileSync(path.join(root, P.out), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log('Candidate v0.4 immutable failure diagnosis written.');
console.log(JSON.stringify({headline, knownFailureCauses:output.knownFailureCauses, byKnownPath, byNonRouteSubtype:bySubtype, wrongAcceptedKnown:output.wrongAcceptedKnown.map(x => ({id:x.id, expectedRoute:x.expectedRoute, finalRoute:x.final.routeId}))}, null, 2));
