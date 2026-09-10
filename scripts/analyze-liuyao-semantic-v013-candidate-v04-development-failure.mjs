import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-development-report-v0.1.json';
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v04-development.lock.json';
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json';
const designPath = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const outPath = 'data/liuyao-semantic-v013-candidate-v04-development-failure-diagnostic-v0.1.json';

const EXPECTED_REPORT_BLOB = '13d73d9ddd44e3ed3187d0b153a5ea316eaf9d91';
const EXPECTED_DEVELOPMENT_SHA256 = '5787dcea81d8e86839aaad17d012c7195def1638d048f404ee0c25e91fb9b213';
const DEVELOPMENT_SEAL_COMMIT = '8fa9a4e50ebe500c6f28144b0158fd1e3baf273f';
const SCORING_REPORT_COMMIT = '4493321a90dfffa71c1d1bfd60a376e941faa8cb';

const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n, d) => d ? n / d : 0;

const report = readJson(reportPath);
const developmentLock = readJson(developmentLockPath);
const runtimeLock = readJson(runtimeLockPath);
const design = readJson(designPath);

assert(gitBlobSha(reportPath) === EXPECTED_REPORT_BLOB, `Candidate v0.4 development report drift: ${gitBlobSha(reportPath)}`);
assert(report.version === '0.13-candidate-v0.4-development-report-v0.1', `unexpected report version: ${report.version}`);
assert(report.status === 'failed_fresh_candidate_v04_development', `diagnosis requires failed v0.4 development report: ${report.status}`);
assert(report.readyForCandidateLock === false, 'failed Candidate v0.4 report unexpectedly allows candidate lock');
assert(Array.isArray(report.results) && report.results.length === 198, `development report result count ${report.results?.length} != 198`);
assert(developmentLock.status === 'locked_before_first_development_encoder_scoring', `development lock status drift: ${developmentLock.status}`);
assert(developmentLock.dataset?.sha256 === EXPECTED_DEVELOPMENT_SHA256, 'sealed development dataset SHA-256 drift');
assert(developmentLock.dataset?.rows === 198, 'sealed development row count drift');
assert(developmentLock.generation?.encoderScoringPerformedBeforeSeal === false, 'development cohort was scored before seal');
assert(runtimeLock.status === 'runtime_locked_before_fresh_development', `runtime lock status drift: ${runtimeLock.status}`);
assert(runtimeLock.execution?.fallbackGlobalThreshold === 0.5549057227178391, 'Fallback Identity v0.2 threshold drift');
assert(runtimeLock.execution?.semanticActThreshold === 0.5045675974201208, 'Semantic Act v0.1 threshold drift');
assert(runtimeLock.execution?.routeabilityThreshold === 0.7678148573595883, 'Routeability threshold drift');
assert(runtimeLock.execution?.routeInventoryCount === 22, 'route inventory drift');
assert(design.freshDevelopmentPolicy?.promotionGates, 'Candidate v0.4 frozen promotion gates missing');

const results = report.results;
const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const knownNonExact = known.filter((row) => row.finalExact !== true);
const wrongAcceptedKnown = known.filter((row) => row.final?.disposition === 'route_known' && row.final?.routeId !== row.expectedRoute);
const falseActivations = nonRoute.filter((row) => row.final?.disposition === 'route_known');

assert(known.length === 132 && nonRoute.length === 66, `report partition drift: known=${known.length}, nonRoute=${nonRoute.length}`);
assert(knownNonExact.length === 36, `expected 36 known non-exact rows, got ${knownNonExact.length}`);
assert(wrongAcceptedKnown.length === 2, `expected 2 wrong accepted known rows, got ${wrongAcceptedKnown.length}`);
assert(falseActivations.length === 10, `expected 10 non-route false activations, got ${falseActivations.length}`);

const causeOfKnownFailure = (row) => {
  if (row.final?.disposition === 'route_known' && row.final?.routeId !== row.expectedRoute) return 'wrong_route_accepted';
  if (row.semanticAct?.status !== 'eligible') return 'semantic_act_reject';
  if (row.final?.reasonCode === 'scope_hard_veto') return 'scope_hard_veto';
  if (!row.routeability || row.routeability.disposition !== 'route_known') return 'routeability_reject';
  const fallbackReason = row.fallbackIdentity?.decision?.reasonCode;
  if (fallbackReason === 'fallback_identity_all22_reject_all') return 'fallback_reject_all';
  if (fallbackReason === 'fallback_identity_all22_multiple_admissions') return 'fallback_multiple_admissions';
  if (!row.selection || row.selection.status !== 'selected') return 'selection_unresolved';
  return 'finalization_other';
};

const falseActivationSource = (row) => {
  if (row.arbitration?.routeId && row.arbitration.routeId === row.final?.routeId) {
    return `arbitration_${row.arbitration.strength || 'unknown'}`;
  }
  if (row.fallbackIdentity?.decision?.status === 'selected' && row.fallbackIdentity.decision.routeId === row.final?.routeId) {
    return 'fallback_identity_all22';
  }
  if (row.selection?.status === 'selected' && row.selection.routeId === row.final?.routeId) return 'selection_other';
  return 'unknown';
};

const countBy = (rows, getter) => {
  const out = {};
  for (const row of rows) {
    const key = String(getter(row));
    out[key] = (out[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
};

const compactKnown = (row) => ({
  id:row.id,
  text:row.text,
  expectedRoute:row.expectedRoute,
  expectedCandidatePath:row.expectedCandidatePath || null,
  failureCause:causeOfKnownFailure(row),
  semanticAct:row.semanticAct ? { status:row.semanticAct.status, probability:row.semanticAct.probability, threshold:row.semanticAct.threshold } : null,
  arbitration:row.arbitration ? { routeId:row.arbitration.routeId || null, strength:row.arbitration.strength || null } : null,
  routeability:row.routeability ? { disposition:row.routeability.disposition, probability:row.routeability.probability, threshold:row.routeability.threshold, reasonCode:row.routeability.reasonCode } : null,
  fallbackIdentity:row.fallbackIdentity ? { status:row.fallbackIdentity.decision?.status || null, routeId:row.fallbackIdentity.decision?.routeId || null, reasonCode:row.fallbackIdentity.decision?.reasonCode || null } : null,
  selection:row.selection ? { status:row.selection.status, routeId:row.selection.routeId || null, reasonCode:row.selection.reasonCode || null } : null,
  final:{ disposition:row.final?.disposition || null, routeId:row.final?.routeId || null, reasonCode:row.final?.reasonCode || null }
});

const compactFalseActivation = (row) => ({
  id:row.id,
  text:row.text,
  nonRouteSubtype:row.nonRouteSubtype,
  source:falseActivationSource(row),
  semanticAct:row.semanticAct ? { status:row.semanticAct.status, probability:row.semanticAct.probability, threshold:row.semanticAct.threshold } : null,
  arbitration:row.arbitration ? { routeId:row.arbitration.routeId || null, strength:row.arbitration.strength || null } : null,
  routeability:row.routeability ? { disposition:row.routeability.disposition, probability:row.routeability.probability, threshold:row.routeability.threshold, reasonCode:row.routeability.reasonCode } : null,
  fallbackIdentity:row.fallbackIdentity ? { status:row.fallbackIdentity.decision?.status || null, routeId:row.fallbackIdentity.decision?.routeId || null, reasonCode:row.fallbackIdentity.decision?.reasonCode || null } : null,
  selection:row.selection ? { status:row.selection.status, routeId:row.selection.routeId || null, reasonCode:row.selection.reasonCode || null } : null,
  final:{ disposition:row.final?.disposition || null, routeId:row.final?.routeId || null, reasonCode:row.final?.reasonCode || null }
});

const knownPaths = ['strong_arbitration', 'support_arbitration', 'fallback_identity_all22'];
const byKnownPath = {};
for (const pathId of knownPaths) {
  const rows = known.filter((row) => row.expectedCandidatePath === pathId);
  const accepted = rows.filter((row) => row.final?.disposition === 'route_known');
  const exact = rows.filter((row) => row.final?.disposition === 'route_known' && row.final?.routeId === row.expectedRoute);
  const wrong = accepted.filter((row) => row.final?.routeId !== row.expectedRoute);
  const fallbackReached = rows.filter((row) => row.reachesFallbackIdentity === true);
  byKnownPath[pathId] = {
    n:rows.length,
    exact:exact.length,
    exactRate:ratio(exact.length, rows.length),
    accepted:accepted.length,
    acceptedCorrect:exact.length,
    wrongAccepted:wrong.length,
    acceptedRouteAccuracy:ratio(exact.length, accepted.length),
    semanticActRejects:rows.filter((row) => row.semanticAct?.status !== 'eligible').length,
    routeabilityRejects:rows.filter((row) => row.semanticAct?.status === 'eligible' && (!row.routeability || row.routeability.disposition !== 'route_known')).length,
    fallbackReached:fallbackReached.length,
    fallbackSelected:fallbackReached.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length,
    fallbackRejectAll:fallbackReached.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_reject_all').length,
    fallbackMultipleAdmissions:fallbackReached.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_multiple_admissions').length,
    selectionUnresolved:rows.filter((row) => row.routeability?.disposition === 'route_known' && (!row.selection || row.selection.status !== 'selected')).length,
    scopeHardVeto:rows.filter((row) => row.final?.reasonCode === 'scope_hard_veto').length
  };
}

const byExpectedRoute = {};
for (const row of knownNonExact) {
  const route = row.expectedRoute;
  const cause = causeOfKnownFailure(row);
  const entry = byExpectedRoute[route] || { misses:0, causes:{} };
  entry.misses += 1;
  entry.causes[cause] = (entry.causes[cause] || 0) + 1;
  byExpectedRoute[route] = entry;
}
for (const entry of Object.values(byExpectedRoute)) {
  entry.causes = Object.fromEntries(Object.entries(entry.causes).sort(([a], [b]) => a.localeCompare(b)));
}

const subtypeOrder = ['outside_current_22', 'route_unresolved', 'near_domain_not_current_route'];
const byNonRouteSubtype = {};
for (const subtype of subtypeOrder) {
  const rows = nonRoute.filter((row) => row.nonRouteSubtype === subtype);
  const activated = rows.filter((row) => row.final?.disposition === 'route_known');
  byNonRouteSubtype[subtype] = {
    n:rows.length,
    falseActivations:activated.length,
    falseActivationRate:ratio(activated.length, rows.length),
    semanticActRejected:rows.filter((row) => row.semanticAct?.status !== 'eligible').length,
    routeabilityRejectedAfterEligible:rows.filter((row) => row.semanticAct?.status === 'eligible' && (!row.routeability || row.routeability.disposition !== 'route_known')).length,
    falseActivationSources:countBy(activated, falseActivationSource),
    activatedRoutes:countBy(activated, (row) => row.final?.routeId || 'null')
  };
}

const gates = design.freshDevelopmentPolicy.promotionGates;
const exactKnownCount = known.filter((row) => row.final?.disposition === 'route_known' && row.final?.routeId === row.expectedRoute).length;
const acceptedKnown = known.filter((row) => row.final?.disposition === 'route_known');
const headline = {
  knownExactRoute:ratio(exactKnownCount, known.length),
  acceptedRouteAccuracy:ratio(acceptedKnown.filter((row) => row.final?.routeId === row.expectedRoute).length, acceptedKnown.length),
  overallFalseRouteActivation:ratio(falseActivations.length, nonRoute.length),
  maxFalseRouteActivationPerSubtype:Math.max(...Object.values(byNonRouteSubtype).map((entry) => entry.falseActivationRate)),
  noStructuralPathCollapse:Object.values(byKnownPath).every((entry) => entry.exact > 0),
  checks:report.checks,
  readyForCandidateLock:false
};

const v03 = design.diagnosisSignals || {};
const v04NearDomain = byNonRouteSubtype.near_domain_not_current_route;
const v04RouteUnresolved = byNonRouteSubtype.route_unresolved;
const dominantSubtype = Object.entries(byNonRouteSubtype).sort((a,b) => b[1].falseActivations - a[1].falseActivations)[0];

const diagnostic = {
  version:'0.13-candidate-v0.4-development-failure-diagnostic-v0.1',
  status:'immutable_failure_diagnosis_from_committed_first_development_report',
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.4',
  provenance:{
    sourceReport:{ path:reportPath, gitBlobSha:EXPECTED_REPORT_BLOB, sha256:sha256(reportPath), commit:SCORING_REPORT_COMMIT },
    sealedDevelopment:{ path:developmentLockPath, datasetSha256:EXPECTED_DEVELOPMENT_SHA256, sealCommit:DEVELOPMENT_SEAL_COMMIT },
    runtimeLock:{ path:runtimeLockPath, gitBlobSha:gitBlobSha(runtimeLockPath) },
    design:{ path:designPath, gitBlobSha:gitBlobSha(designPath) }
  },
  policy:{
    rerunsEncoder:false,
    invokesModel:false,
    readsIndependentEvaluation:false,
    readsSealedBlindEvaluation:false,
    mutatesCandidateV04:false,
    mutatesDevelopmentCohort:false,
    mutatesThresholds:false,
    sourceIsCommittedFirstDevelopmentReportOnly:true
  },
  frozenPromotionGates:gates,
  headline,
  totals:{
    rows:results.length,
    known:known.length,
    nonRoute:nonRoute.length,
    knownExact:exactKnownCount,
    knownNonExact:knownNonExact.length,
    acceptedKnown:acceptedKnown.length,
    wrongAcceptedKnown:wrongAcceptedKnown.length,
    nonRouteFalseActivations:falseActivations.length
  },
  knownFailureCauses:countBy(knownNonExact, causeOfKnownFailure),
  byKnownPath,
  knownMissesByExpectedRoute:Object.fromEntries(Object.entries(byExpectedRoute).sort(([a], [b]) => a.localeCompare(b))),
  wrongAcceptedKnown:wrongAcceptedKnown.map(compactKnown),
  byNonRouteSubtype,
  falseRouteActivations:falseActivations.map(compactFalseActivation),
  routeUnresolvedFalseActivations:falseActivations.filter((row) => row.nonRouteSubtype === 'route_unresolved').map(compactFalseActivation),
  candidateV03DirectionalComparison:{
    cohortLevelDirectionalOnly:true,
    pairedRowComparison:false,
    candidateV03Signals:v03,
    candidateV04Signals:{
      knownMisses:knownNonExact.length,
      wrongAcceptedKnown:wrongAcceptedKnown.length,
      overallNonRouteFalseActivations:falseActivations.length,
      nearDomainFalseActivations:v04NearDomain.falseActivations,
      routeUnresolvedFalseActivations:v04RouteUnresolved.falseActivations,
      strongExact:byKnownPath.strong_arbitration.exact,
      supportExact:byKnownPath.support_arbitration.exact,
      fallbackExact:byKnownPath.fallback_identity_all22.exact
    }
  },
  diagnosis:{
    failureIsMultiSurface:true,
    structuralPathCollapseObserved:headline.noStructuralPathCollapse === false,
    dominantNonRouteFailureSubtype:{ subtype:dominantSubtype[0], falseActivations:dominantSubtype[1].falseActivations, rate:dominantSubtype[1].falseActivationRate },
    nearDomainInformationProcedureSafetyObserved:v04NearDomain.falseActivations === 0,
    routeUnresolvedSafetyIsDominant:v04RouteUnresolved.falseActivations === Math.max(...Object.values(byNonRouteSubtype).map((entry) => entry.falseActivations)),
    knownRecallBelowGate:headline.knownExactRoute < gates.minimumKnownExactRoute,
    acceptedPrecisionBelowGate:headline.acceptedRouteAccuracy < gates.minimumAcceptedRouteAccuracy,
    overallSafetyBelowGate:headline.overallFalseRouteActivation > gates.maximumOverallFalseRouteActivation,
    subtypeSafetyBelowGate:headline.maxFalseRouteActivationPerSubtype > gates.maximumFalseRouteActivationPerNonRouteSubtype,
    sameVersionRetuneAuthorized:false
  },
  nextAction:'freeze_candidate_v05_design_from_this_diagnosis_before_any_new_training_calibration_threshold_or_runtime_change'
};

writeJson(outPath, diagnostic);
console.log('Candidate v0.4 immutable development failure diagnosis written.');
console.log(JSON.stringify({
  headline:diagnostic.headline,
  knownFailureCauses:diagnostic.knownFailureCauses,
  byKnownPath:diagnostic.byKnownPath,
  byNonRouteSubtype:diagnostic.byNonRouteSubtype,
  wrongAcceptedKnown:diagnostic.wrongAcceptedKnown.map((row) => ({ id:row.id, expectedRoute:row.expectedRoute, finalRoute:row.final.routeId, cause:row.failureCause }))
}, null, 2));
