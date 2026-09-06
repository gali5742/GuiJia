import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'))
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex')
const gitBlobSha = (relative) => {
  const bytes = read(relative)
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
}
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const ratio = (n, d) => d ? n / d : 0
const close = (actual, expected, label) => assert(Math.abs(actual - expected) <= 1e-12, `${label}: ${actual} != ${expected}`)

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-scoring-contract-v0.1.json'
const independentPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const independentLockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock-v0.1.1.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-execution-v0.1-report.json'

const contract = readJson(contractPath)
const independent = readJson(independentPath)
const independentLock = readJson(independentLockPath)
const candidateLock = readJson(candidateLockPath)
const runtimeLock = readJson(runtimeLockPath)
const report = readJson(reportPath)

assert(contract.status === 'locked_before_first_candidate_v04_independent_encoder_scoring', 'verifier: independent scoring contract status drift')
assert(gitBlobSha(independentPath) === contract.sealedIndependent.artifactGitBlobSha, 'verifier: independent artifact Git blob drift')
assert(sha256(independentPath) === contract.sealedIndependent.artifactSha256, 'verifier: independent artifact SHA drift')
assert(gitBlobSha(independentLockPath) === contract.correctedIndependentLock.gitBlobSha, 'verifier: corrected independent lock Git blob drift')
assert(sha256(independentLockPath) === contract.correctedIndependentLock.sha256, 'verifier: corrected independent lock SHA drift')
assert(independentLock.status === 'corrected_lock_sealed_before_first_post_lock_independent_encoder_scoring', 'verifier: corrected lock status drift')
assert(gitBlobSha(candidateLockPath) === contract.candidateLock.gitBlobSha, 'verifier: Candidate lock Git blob drift')
assert(sha256(candidateLockPath) === contract.candidateLock.sha256, 'verifier: Candidate lock SHA drift')
assert(gitBlobSha(runtimeLockPath) === contract.frozenRuntime.lockGitBlobSha, 'verifier: runtime lock Git blob drift')
assert(sha256(runtimeLockPath) === contract.frozenRuntime.lockSha256, 'verifier: runtime lock SHA drift')
assert(independentLock.invariants?.postSealWordingMutationAllowed === false, 'verifier: post-seal wording mutation allowed')
assert(independentLock.invariants?.independentMayTrainModels === false, 'verifier: independent training allowed')
assert(independentLock.invariants?.independentMayCalibrateThresholds === false, 'verifier: independent calibration allowed')

assert(report.version === '0.13-candidate-v0.4-independent-report-execution-v0.1', 'verifier: report version drift')
assert(report.policy?.usesIndependentEval === true, 'verifier: report is not independent evaluation')
assert(report.policy?.readsSealedBlindEval === false, 'verifier: sealed blind evaluation contamination')
assert(report.policy?.training === false && report.policy?.calibration === false, 'verifier: report permits fitting')
assert(report.policy?.selectsThresholds === false && report.policy?.retunesThresholds === false, 'verifier: threshold selection/retuning occurred')
assert(report.policy?.mutatesRuntime === false && report.policy?.mutatesCandidate === false && report.policy?.mutatesIndependentData === false, 'verifier: report permits mutation')
assert(report.policy?.independentRowsReusableForTrainingOrCalibration === false, 'verifier: independent rows reusable for fitting')
assert(report.execution?.scoringContractGitBlobSha === gitBlobSha(contractPath), 'verifier: scoring contract binding drift')
assert(report.execution?.scoringContractSha256 === sha256(contractPath), 'verifier: scoring contract SHA drift')
assert(report.execution?.independentArtifactGitBlobSha === contract.sealedIndependent.artifactGitBlobSha, 'verifier: report independent blob mismatch')
assert(report.execution?.independentArtifactSha256 === contract.sealedIndependent.artifactSha256, 'verifier: report independent SHA mismatch')
assert(report.execution?.correctedIndependentLockGitBlobSha === contract.correctedIndependentLock.gitBlobSha, 'verifier: report corrected lock mismatch')
assert(report.execution?.correctedIndependentLockSha256 === contract.correctedIndependentLock.sha256, 'verifier: report corrected lock SHA mismatch')
assert(report.execution?.candidateLockGitBlobSha === contract.candidateLock.gitBlobSha, 'verifier: report Candidate lock mismatch')
assert(report.execution?.runtimeLockGitBlobSha === contract.frozenRuntime.lockGitBlobSha, 'verifier: report runtime lock mismatch')
assert(report.execution?.runtimeLockSha256 === contract.frozenRuntime.lockSha256, 'verifier: report runtime SHA mismatch')
assert(report.execution?.canonicalTextsPerEncoderCall === 1, 'verifier: canonicalTextsPerEncoderCall drift')
assert(report.execution?.processorCallsPerQuestion === 1, 'verifier: processorCallsPerQuestion drift')
assert(report.execution?.modelForwardCallsPerQuestion === 1, 'verifier: modelForwardCallsPerQuestion drift')
assert(report.execution?.encoderInvocationCount === 198, 'verifier: encoder invocation count != 198')
assert(report.execution?.canonicalTextsSubmitted === 198, 'verifier: canonical texts submitted != 198')
assert(report.execution?.encoderModelId === contract.embeddingExecution.modelId, 'verifier: encoder model drift')
assert(report.execution?.encoderRevision === contract.embeddingExecution.revision, 'verifier: encoder revision drift')
assert(report.execution?.transformersJsVersion === contract.embeddingExecution.transformersJsVersion, 'verifier: Transformers.js version drift')
assert(report.execution?.dtype === contract.embeddingExecution.dtype, 'verifier: encoder dtype drift')
assert(report.execution?.vectorSize === contract.embeddingExecution.vectorSize, 'verifier: vector size drift')
assert(report.execution?.pooling === contract.embeddingExecution.pooling && report.execution?.normalize === contract.embeddingExecution.normalize, 'verifier: pooling/normalize drift')
assert(report.execution?.fallbackCandidateUniverse === 'all_current_22_routes', 'verifier: Fallback universe drift')
assert(report.execution?.routerTop2FallbackRestriction === false, 'verifier: Router Top2 Fallback restriction enabled')
close(report.execution.semanticActThreshold, contract.frozenRuntime.semanticActThreshold, 'Semantic Act threshold')
close(report.execution.routeabilityThreshold, contract.frozenRuntime.routeabilityThreshold, 'Routeability threshold')
close(report.execution.scopeHardVetoCutoff, contract.frozenRuntime.scopeHardVetoCutoff, 'scope cutoff')
close(report.execution.fallbackIdentityGlobalThreshold, contract.frozenRuntime.fallbackIdentityGlobalThreshold, 'Fallback threshold')

assert(Array.isArray(report.results) && report.results.length === 198, 'verifier: report must contain 198 results')
assert(Array.isArray(independent.rows) && independent.rows.length === 198, 'verifier: independent must contain 198 rows')
const expectedById = new Map(independent.rows.map((row) => [row.id, row]))
assert(expectedById.size === 198, 'verifier: duplicate independent ids')
assert(new Set(report.results.map((row) => row.id)).size === 198, 'verifier: duplicate report ids')

for (const row of report.results) {
  const expected = expectedById.get(row.id)
  assert(expected, `verifier: unknown result id ${row.id}`)
  assert(row.text === expected.text, `verifier: result text drift ${row.id}`)
  assert(row.expectedDisposition === expected.expectedDisposition, `verifier: disposition label drift ${row.id}`)
  assert((row.expectedRoute || null) === (expected.expectedRoute || null), `verifier: route label drift ${row.id}`)
  assert((row.expectedCandidatePath || null) === (expected.expectedCandidatePath || null), `verifier: path label drift ${row.id}`)
  assert((row.nonRouteSubtype || null) === (expected.nonRouteSubtype || null), `verifier: subtype label drift ${row.id}`)
  assert(row.semanticAct && ['eligible', 'ineligible'].includes(row.semanticAct.status), `verifier: Semantic Act result invalid ${row.id}`)
  assert(Number.isFinite(row.semanticAct.probability), `verifier: Semantic Act probability missing ${row.id}`)
  assert(row.router?.top1?.id && row.router?.top2?.id, `verifier: Router Top2 missing ${row.id}`)
  assert(Number.isFinite(row.routeabilityProbability), `verifier: Routeability probability missing ${row.id}`)
  assert(row.scope && Number.isFinite(row.scope.probability), `verifier: scope score missing ${row.id}`)
  if (row.semanticAct.status === 'ineligible') {
    assert(row.routeability === null && row.arbitration === null && row.fallbackIdentity === null && row.selection === null, `verifier: ineligible Semantic Act leaked downstream ${row.id}`)
    assert(row.final?.disposition === 'non_route', `verifier: ineligible Semantic Act did not finalize non_route ${row.id}`)
  }
  if (row.reachesFallbackIdentity) {
    assert(row.fallbackIdentity?.probabilities && Object.keys(row.fallbackIdentity.probabilities).length === 22, `verifier: all-22 Fallback probabilities missing ${row.id}`)
    assert(row.fallbackIdentity?.decision?.candidateUniverse === 'all_current_22_routes', `verifier: Fallback universe mismatch ${row.id}`)
    assert(Array.isArray(row.fallbackIdentity?.decision?.candidates) && row.fallbackIdentity.decision.candidates.length === 22, `verifier: Fallback decision lacks 22 candidates ${row.id}`)
  } else {
    assert(row.fallbackIdentity === null, `verifier: Fallback payload exists without reachability ${row.id}`)
  }
  const expectedKnown = expected.expectedDisposition === 'route_known'
  const exact = expectedKnown
    ? row.final?.disposition === 'route_known' && row.final?.routeId === expected.expectedRoute
    : row.final?.disposition === 'non_route'
  const falseActivation = !expectedKnown && row.final?.disposition === 'route_known'
  assert(row.finalExact === exact, `verifier: finalExact drift ${row.id}`)
  assert(row.falseRouteActivation === falseActivation, `verifier: falseRouteActivation drift ${row.id}`)
}

const known = report.results.filter((row) => row.expectedDisposition === 'route_known')
const nonRoute = report.results.filter((row) => row.expectedDisposition === 'non_route')
const acceptedKnown = known.filter((row) => row.final.disposition === 'route_known')
assert(known.length === 132 && nonRoute.length === 66, 'verifier: known/non-route counts drift')
const recomputed = {
  semanticActKnownRetention: ratio(known.filter((row) => row.semanticAct.status === 'eligible').length, known.length),
  semanticActNonRouteRejection: ratio(nonRoute.filter((row) => row.semanticAct.status === 'ineligible').length, nonRoute.length),
  routeabilityKnownRecall: ratio(known.filter((row) => row.routeability?.disposition === 'route_known').length, known.length),
  knownFinalRetention: ratio(acceptedKnown.length, known.length),
  knownExactRoute: ratio(known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, known.length),
  acceptedRouteAccuracy: ratio(acceptedKnown.filter((row) => row.final.routeId === row.expectedRoute).length, acceptedKnown.length),
  nonRouteFalseRouteActivation: ratio(nonRoute.filter((row) => row.falseRouteActivation).length, nonRoute.length),
  nonRouteNoRouteActivationSafety: ratio(nonRoute.filter((row) => row.final.disposition !== 'route_known').length, nonRoute.length)
}
for (const [key, value] of Object.entries(recomputed)) close(report.summary[key], value, `summary.${key}`)
assert(report.summary.rows === 198 && report.summary.known === 132 && report.summary.nonRoute === 66, 'verifier: summary counts drift')

const expectedAttrition = {
  semanticActRejectedKnown: known.filter((row) => row.semanticAct.status !== 'eligible').length,
  semanticActRejectedNonRoute: nonRoute.filter((row) => row.semanticAct.status !== 'eligible').length,
  routeabilityAcceptedKnown: known.filter((row) => row.routeability?.disposition === 'route_known').length,
  routeabilityRejectedKnownAfterSemanticAct: known.filter((row) => row.semanticAct.status === 'eligible' && row.routeability?.disposition !== 'route_known').length,
  fallbackReachedKnown: known.filter((row) => row.reachesFallbackIdentity).length,
  fallbackSelectedKnown: known.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length,
  fallbackRejectAllKnown: known.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_reject_all').length,
  fallbackMultipleAdmissionsKnown: known.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_multiple_admissions').length,
  selectionSelectedKnown: known.filter((row) => row.selection?.status === 'selected').length,
  selectionUnresolvedKnown: known.filter((row) => row.routeability?.disposition === 'route_known' && row.selection?.status !== 'selected').length,
  scopeHardVetoKnown: known.filter((row) => row.final.reasonCode === 'scope_hard_veto').length,
  finalRouteKnown: acceptedKnown.length,
  finalExact: known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length,
  wrongSelectedRoute: known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
}
for (const [key, value] of Object.entries(expectedAttrition)) assert(report.summary.attrition[key] === value, `verifier: attrition.${key} drift`)

for (const pathId of ['strong_arbitration', 'support_arbitration', 'fallback_head']) {
  const subset = known.filter((row) => row.expectedCandidatePath === pathId)
  const accepted = subset.filter((row) => row.final.disposition === 'route_known')
  const actual = report.summary.byKnownPath[pathId]
  assert(actual?.n === 44 && subset.length === 44, `verifier: ${pathId} count drift`)
  close(actual.semanticActRetention, ratio(subset.filter((row) => row.semanticAct.status === 'eligible').length, subset.length), `${pathId}.semanticActRetention`)
  close(actual.routeabilityRecall, ratio(subset.filter((row) => row.routeability?.disposition === 'route_known').length, subset.length), `${pathId}.routeabilityRecall`)
  assert(actual.fallbackReached === subset.filter((row) => row.reachesFallbackIdentity).length, `verifier: ${pathId}.fallbackReached drift`)
  assert(actual.fallbackSelected === subset.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length, `verifier: ${pathId}.fallbackSelected drift`)
  close(actual.finalRetention, ratio(accepted.length, subset.length), `${pathId}.finalRetention`)
  close(actual.finalExact, ratio(subset.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, subset.length), `${pathId}.finalExact`)
  close(actual.acceptedAccuracy, ratio(accepted.filter((row) => row.final.routeId === row.expectedRoute).length, accepted.length), `${pathId}.acceptedAccuracy`)
}
for (const subtype of ['outside_current_22', 'route_unresolved', 'near_domain_not_current_route']) {
  const subset = nonRoute.filter((row) => row.nonRouteSubtype === subtype)
  const actual = report.summary.byNonRouteSubtype[subtype]
  assert(actual?.n === 22 && subset.length === 22, `verifier: ${subtype} count drift`)
  close(actual.semanticActRejection, ratio(subset.filter((row) => row.semanticAct.status === 'ineligible').length, subset.length), `${subtype}.semanticActRejection`)
  close(actual.falseRouteActivation, ratio(subset.filter((row) => row.falseRouteActivation).length, subset.length), `${subtype}.falseRouteActivation`)
  close(actual.noRouteActivationSafety, ratio(subset.filter((row) => row.final.disposition !== 'route_known').length, subset.length), `${subtype}.noRouteActivationSafety`)
  assert(actual.fallbackReached === subset.filter((row) => row.reachesFallbackIdentity).length, `verifier: ${subtype}.fallbackReached drift`)
}

const gates = contract.promotionGates
const expectedChecks = {
  knownExactRoute: recomputed.knownExactRoute >= gates.minimumKnownExactRoute,
  acceptedRouteAccuracy: recomputed.acceptedRouteAccuracy >= gates.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation: recomputed.nonRouteFalseRouteActivation <= gates.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation: Object.values(report.summary.byNonRouteSubtype).every((row) => row.falseRouteActivation <= gates.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse: Object.values(report.summary.byKnownPath).every((row) => row.finalExact > 0)
}
for (const [key, value] of Object.entries(expectedChecks)) assert(report.checks[key] === value, `verifier: check ${key} drift`)
const expectedReady = Object.values(expectedChecks).every(Boolean)
assert(report.readyForBaseline10Promotion === expectedReady, 'verifier: promotion readiness drift')
assert(report.status === (expectedReady ? 'post_lock_independent_pass' : 'post_lock_independent_fail'), 'verifier: report status drift')
assert(report.failures.length === report.results.filter((row) => !row.finalExact).length, 'verifier: failure count drift')
assert(report.nextAction === (expectedReady
  ? 'freeze_baseline_1_0_promotion_decision_before_any_further_evaluation_or_runtime_change'
  : 'freeze_immutable_candidate_v04_independent_failure_evidence_no_same_version_retuning'), 'verifier: nextAction drift')

console.log(JSON.stringify({
  verified: true,
  status: report.status,
  readyForBaseline10Promotion: report.readyForBaseline10Promotion,
  checks: report.checks,
  summary: report.summary
}, null, 2))
