import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-report.json';
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const outputPath = 'data/liuyao-semantic-v013-candidate-v03-development-failure-diagnostic-v0.1.json';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ratio = (n, d) => d ? n / d : 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const countBy = (rows, fn) => {
  const out = {};
  for (const row of rows) {
    const key = String(fn(row) ?? 'null');
    out[key] = (out[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(out).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
};

const report = readJson(reportPath);
const developmentLock = readJson(developmentLockPath);

// Immutable inputs: this diagnostic is architecture-only evidence derived from the first
// corrected fresh Candidate v0.3 development run. It must not silently follow later mutations.
assert(gitBlobSha(reportPath) === 'eeff1c256f3f962b1577a3e866d095ab6ed1347f', `development report Git blob drift: ${gitBlobSha(reportPath)}`);
assert(sha256(reportPath) === '9bf0fab26070d34bcb2144738a0f8dab6fc81c698f13a731b7ae5f22bfec1cec', `development report SHA-256 drift: ${sha256(reportPath)}`);
assert(gitBlobSha(developmentLockPath) === 'bf1f86d1569e5f91e19ce61bbbdd8598d760ad21', `development lock Git blob drift: ${gitBlobSha(developmentLockPath)}`);
assert(developmentLock.artifactSha256 === '507db53e3e8ea9ce06737d5a86f9df1c317004a661a7ba4d43b330046423c540', 'development artifact binding drift');
assert(report.execution?.developmentArtifactSha256 === developmentLock.artifactSha256, 'report/development-lock artifact mismatch');
assert(report.version === '0.13-candidate-v0.3-development-report-execution-v0.1', `report version drift: ${report.version}`);
assert(report.status === 'corrected_pre_lock_development_diagnostic', `report status drift: ${report.status}`);
assert(report.policy?.readsIndependentEval === false && report.policy?.usesIndependentEval === false, 'report used/read independent evaluation');
assert(report.policy?.training === false && report.policy?.calibration === false && report.policy?.retunesThresholds === false, 'development report changed model/calibration');
assert(report.readyForCandidateLock === false, 'Candidate v0.3 unexpectedly marked ready for lock');
assert(Array.isArray(report.results) && report.results.length === 198, `development result count ${report.results?.length}`);

const results = report.results;
const known = results.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route');
const knownMisses = known.filter((row) => !row.finalExact);
const falseActivations = nonRoute.filter((row) => row.falseRouteActivation);
const nearDomain = nonRoute.filter((row) => row.nonRouteSubtype === 'near_domain_not_current_route');
const nearDomainFalseActivations = nearDomain.filter((row) => row.falseRouteActivation);
assert(known.length === 132 && nonRoute.length === 66, `known/nonroute count drift ${known.length}/${nonRoute.length}`);
assert(knownMisses.length === 28, `known miss count ${knownMisses.length} != 28`);
assert(falseActivations.length === 9, `nonroute false activation count ${falseActivations.length} != 9`);
assert(nearDomainFalseActivations.length === 9, `near-domain false activation count ${nearDomainFalseActivations.length} != 9`);
assert(nonRoute.filter((row) => row.nonRouteSubtype !== 'near_domain_not_current_route' && row.falseRouteActivation).length === 0, 'false activation leaked outside near-domain subtype');

const classifyKnownMiss = (row) => {
  if (row.routeability?.disposition !== 'route_known') return `routeability_reject:${row.routeability?.reasonCode || 'unknown'}`;
  if (row.reachesFallbackIdentity) {
    const decision = row.fallbackIdentity?.decision;
    if (decision?.status !== 'selected') return `fallback_unresolved:${decision?.reasonCode || 'missing_decision'}`;
  }
  if (row.selection?.status !== 'selected') return `selection_unresolved:${row.selection?.reasonCode || 'missing_selection'}`;
  if (row.final?.disposition !== 'route_known') return `final_reject:${row.final?.reasonCode || row.final?.disposition || 'unknown'}`;
  if (row.final?.routeId !== row.expectedRoute) return `wrong_route:${row.final?.routeId || 'null'}`;
  return 'unclassified';
};

const knownMissBuckets = countBy(knownMisses, classifyKnownMiss);
const fallbackKnown = known.filter((row) => row.expectedCandidatePath === 'fallback_head');
const fallbackMisses = fallbackKnown.filter((row) => !row.finalExact);
assert(fallbackKnown.length === 44, `fallback known count ${fallbackKnown.length} != 44`);
assert(fallbackMisses.length === 28, `fallback miss count ${fallbackMisses.length} != 28`);
assert(knownMisses.every((row) => row.expectedCandidatePath === 'fallback_head'), 'known misses occurred outside fallback_head');

const expectedRouteCandidate = (row) => {
  const candidates = row.fallbackIdentity?.decision?.candidates || [];
  return candidates.find((candidate) => candidate.routeId === row.expectedRoute) || null;
};
const expectedRouteProbability = (row) => {
  const direct = row.fallbackIdentity?.probabilities?.[row.expectedRoute];
  if (Number.isFinite(direct)) return direct;
  const candidate = expectedRouteCandidate(row);
  return Number.isFinite(candidate?.probability) ? candidate.probability : null;
};
const fallbackReached = fallbackKnown.filter((row) => row.reachesFallbackIdentity);
const fallbackUnresolved = fallbackReached.filter((row) => row.fallbackIdentity?.decision?.status !== 'selected');
const fallbackSelected = fallbackReached.filter((row) => row.fallbackIdentity?.decision?.status === 'selected');
const fallbackExpectedCandidatePresent = fallbackReached.filter((row) => Number.isFinite(expectedRouteProbability(row)));
const fallbackExpectedCandidateAbsent = fallbackReached.filter((row) => !Number.isFinite(expectedRouteProbability(row)));
const fallbackUnresolvedDetails = fallbackUnresolved.map((row) => ({
  id:row.id,
  expectedRoute:row.expectedRoute,
  text:row.text,
  routerTop1:row.router?.top1?.id || null,
  routerTop2:row.router?.top2?.id || null,
  routerExpectedRank:row.router?.top1?.id === row.expectedRoute ? 1 : row.router?.top2?.id === row.expectedRoute ? 2 : null,
  routeabilityProbability:row.routeability?.probability ?? null,
  fallbackReason:row.fallbackIdentity?.decision?.reasonCode || null,
  expectedRouteProbability:expectedRouteProbability(row),
  globalThreshold:report.execution?.fallbackIdentityGlobalThreshold ?? null,
  expectedRouteGapToThreshold:Number.isFinite(expectedRouteProbability(row))
    ? expectedRouteProbability(row) - report.execution.fallbackIdentityGlobalThreshold
    : null,
  finalReason:row.final?.reasonCode || null
}));

const fallbackByExpectedRoute = {};
for (const routeId of [...new Set(fallbackKnown.map((row) => row.expectedRoute))].sort()) {
  const subset = fallbackKnown.filter((row) => row.expectedRoute === routeId);
  const reached = subset.filter((row) => row.reachesFallbackIdentity);
  fallbackByExpectedRoute[routeId] = {
    n:subset.length,
    routeabilityRejected:subset.filter((row) => row.routeability?.disposition !== 'route_known').length,
    fallbackReached:reached.length,
    fallbackSelected:reached.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length,
    fallbackRejectAll:reached.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_reject_all').length,
    fallbackMultipleAdmission:reached.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_multiple_admissions').length,
    expectedRouteOutsideTop2:reached.filter((row) => !Number.isFinite(expectedRouteProbability(row))).length,
    finalExact:subset.filter((row) => row.finalExact).length
  };
}

const classifyFalseActivationPath = (row) => {
  if (row.reachesFallbackIdentity) return `fallback:${row.fallbackIdentity?.decision?.reasonCode || 'unknown'}>${row.selection?.reasonCode || 'unknown'}`;
  if (row.arbitration?.routeId) return `arbitration_${row.arbitration?.strength || 'unknown'}:${row.selection?.reasonCode || row.final?.reasonCode || 'unknown'}`;
  return `nonfallback:${row.selection?.reasonCode || row.final?.reasonCode || 'unknown'}`;
};
const nearDomainDetails = nearDomainFalseActivations.map((row) => ({
  id:row.id,
  text:row.text,
  finalRoute:row.final?.routeId || null,
  finalReason:row.final?.reasonCode || null,
  arbitrationRoute:row.arbitration?.routeId || null,
  arbitrationStrength:row.arbitration?.strength || null,
  routeabilityProbability:row.routeability?.probability ?? null,
  routeabilityReason:row.routeability?.reasonCode || null,
  reachesFallbackIdentity:Boolean(row.reachesFallbackIdentity),
  fallbackStatus:row.fallbackIdentity?.decision?.status || null,
  fallbackReason:row.fallbackIdentity?.decision?.reasonCode || null,
  selectionRoute:row.selection?.routeId || null,
  selectionReason:row.selection?.reasonCode || null,
  pathBucket:classifyFalseActivationPath(row)
}));

const strong = known.filter((row) => row.expectedCandidatePath === 'strong_arbitration');
const support = known.filter((row) => row.expectedCandidatePath === 'support_arbitration');
assert(strong.length === 44 && support.length === 44, 'strong/support path counts drift');

const diagnostic = {
  version:'0.13-candidate-v0.3-development-failure-diagnostic-v0.1',
  status:'architecture_only_after_failed_fresh_development',
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.3',
  immutableInputs:{
    developmentReport:{ path:reportPath, gitBlobSha:gitBlobSha(reportPath), sha256:sha256(reportPath) },
    developmentLock:{ path:developmentLockPath, gitBlobSha:gitBlobSha(developmentLockPath), artifactSha256:developmentLock.artifactSha256 },
    developmentSealCommit:report.execution.developmentSealCommit
  },
  policy:{
    candidateV03MutationAllowed:false,
    candidateLockAllowed:false,
    architectureDiagnosisOnly:true,
    trainingEligible:false,
    calibrationEligible:false,
    thresholdSelectionEligible:false,
    developmentRowsMayEnterFutureTraining:false,
    developmentRowsMayEnterFutureCalibration:false,
    independentEvaluationRead:false,
    independentEvaluationCreated:false,
    thresholdRetunePerformed:false,
    routeInventoryChanged:false,
    newThemeResearchImported:false,
    traditionalLiuYaoFeaturesUsed:false
  },
  failedPromotionChecks:{ ...report.checks },
  headline:{
    knownTotal:known.length,
    knownExact:known.filter((row) => row.finalExact).length,
    knownMisses:knownMisses.length,
    knownExactRate:ratio(known.filter((row) => row.finalExact).length, known.length),
    acceptedRouteAccuracy:report.summary.acceptedRouteAccuracy,
    nonRouteTotal:nonRoute.length,
    falseActivations:falseActivations.length,
    falseActivationRate:ratio(falseActivations.length, nonRoute.length),
    strongPathExact:`${strong.filter((row) => row.finalExact).length}/${strong.length}`,
    supportPathExact:`${support.filter((row) => row.finalExact).length}/${support.length}`,
    fallbackPathExact:`${fallbackKnown.filter((row) => row.finalExact).length}/${fallbackKnown.length}`,
    nearDomainFalseActivation:`${nearDomainFalseActivations.length}/${nearDomain.length}`
  },
  knownMissDiagnosis:{
    allMissesAreFallbackHead:knownMisses.every((row) => row.expectedCandidatePath === 'fallback_head'),
    buckets:knownMissBuckets,
    fallbackHead:{
      n:fallbackKnown.length,
      exact:fallbackKnown.filter((row) => row.finalExact).length,
      routeabilityRejected:fallbackKnown.filter((row) => row.routeability?.disposition !== 'route_known').length,
      routeabilityAccepted:fallbackReached.length,
      fallbackSelected:fallbackSelected.length,
      fallbackUnresolved:fallbackUnresolved.length,
      expectedRoutePresentAmongScoredTop2:fallbackExpectedCandidatePresent.length,
      expectedRouteAbsentFromScoredTop2:fallbackExpectedCandidateAbsent.length,
      unresolvedReasonCounts:countBy(fallbackUnresolved, (row) => row.fallbackIdentity?.decision?.reasonCode || 'missing_decision'),
      expectedRouteRankCounts:countBy(fallbackReached, (row) => row.router?.top1?.id === row.expectedRoute ? 'rank1' : row.router?.top2?.id === row.expectedRoute ? 'rank2' : 'outside_top2'),
      byExpectedRoute:fallbackByExpectedRoute,
      unresolvedRows:fallbackUnresolvedDetails
    }
  },
  nearDomainLeakDiagnosis:{
    n:nearDomain.length,
    falseActivations:nearDomainFalseActivations.length,
    falseActivationRate:ratio(nearDomainFalseActivations.length, nearDomain.length),
    fallbackReachedAmongFalseActivations:nearDomainFalseActivations.filter((row) => row.reachesFallbackIdentity).length,
    directArbitrationAmongFalseActivations:nearDomainFalseActivations.filter((row) => row.arbitration?.routeId).length,
    byFinalRoute:countBy(nearDomainFalseActivations, (row) => row.final?.routeId || 'null'),
    byArbitrationStrength:countBy(nearDomainFalseActivations, (row) => row.arbitration?.strength || 'none'),
    byRouteabilityReason:countBy(nearDomainFalseActivations, (row) => row.routeability?.reasonCode || 'none'),
    bySelectionReason:countBy(nearDomainFalseActivations, (row) => row.selection?.reasonCode || 'none'),
    byPathBucket:countBy(nearDomainFalseActivations, classifyFalseActivationPath),
    rows:nearDomainDetails
  },
  architectureSignals:{
    strongArbitrationPathStable:strong.every((row) => row.finalExact),
    supportArbitrationPathStable:support.every((row) => row.finalExact),
    acceptedKnownPrecisionStable:report.summary.acceptedRouteAccuracy === 1,
    fallbackRecallIsKnownRouteBottleneck:fallbackKnown.filter((row) => row.finalExact).length < fallbackKnown.length * 0.8,
    nearDomainSafetyIsPrimaryFalseActivationFailure:nearDomainFalseActivations.length === falseActivations.length && falseActivations.length > 0,
    scopeHardVetoIsObservedBottleneck:report.summary.attrition?.scopeHardVeto > 0,
    wrongAcceptedKnownRouteObserved:report.summary.attrition?.wrongSelectedRoute > 0
  },
  nextVersionBoundary:{
    required:true,
    candidateVersionMustAdvance:true,
    candidateV03ThresholdOrModelRetuneForbidden:true,
    preserveStrongAndSupportBehaviorAsRegressionTarget:true,
    futureDesignMayUseThisDiagnosticForArchitectureOnly:true,
    futureTrainingOrCalibrationMustUseFreshEligibleCorpora:true,
    freshDevelopmentRequiredAfterNextCandidateDesign:true,
    candidateLockRequiredBeforeFreshIndependent:true,
    formalRouteExpansionStillForbiddenBeforeBaseline1:true
  }
};

writeJson(outputPath, diagnostic);
console.log('Candidate v0.3 failed fresh-development diagnosis generated from immutable development evidence only.');
console.log(JSON.stringify({
  headline:diagnostic.headline,
  knownMissBuckets:diagnostic.knownMissDiagnosis.buckets,
  fallbackUnresolvedReasons:diagnostic.knownMissDiagnosis.fallbackHead.unresolvedReasonCounts,
  nearDomainByPath:diagnostic.nearDomainLeakDiagnosis.byPathBucket,
  nearDomainByFinalRoute:diagnostic.nearDomainLeakDiagnosis.byFinalRoute,
  architectureSignals:diagnostic.architectureSignals
}, null, 2));
