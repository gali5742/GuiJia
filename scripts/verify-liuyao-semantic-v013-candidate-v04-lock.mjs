import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const candidatePath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.json'
const lockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'
const developmentReportPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-report.json'
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'

const read = (path) => fs.readFileSync(path)
const readJson = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const verifyBinding = (binding, label) => {
  assert(binding?.path && fs.existsSync(binding.path), `${label} path missing`)
  assert(binding.gitBlobSha === gitBlobSha(binding.path), `${label} Git blob drift: ${binding.path}`)
  assert(binding.sha256 === sha256(binding.path), `${label} SHA256 drift: ${binding.path}`)
}

for (const path of [candidatePath, lockPath, developmentReportPath, runtimeLockPath]) {
  assert(fs.existsSync(path), `Candidate v0.4 lock verification input missing: ${path}`)
}

const candidate = readJson(candidatePath)
const lock = readJson(lockPath)
const report = readJson(developmentReportPath)
const runtimeLock = readJson(runtimeLockPath)

assert(candidate.version === '0.13-candidate-v0.4', 'Candidate v0.4 version mismatch')
assert(candidate.status === 'frozen_candidate_after_fresh_development_pass', 'Candidate v0.4 status mismatch')
assert(candidate.scope === 'liuyao_semantic_decision_stack_v0.13', 'Candidate v0.4 scope mismatch')
assert(candidate.modernSemanticOnly === true, 'Candidate v0.4 modern semantic boundary missing')
assert(candidate.routeInventoryCount === 22 && candidate.routeInventoryFrozenBeforeBaseline1 === true, 'Candidate v0.4 route inventory drift')
assert(candidate.traditionalLiuYaoBoundaryModified === false, 'Candidate v0.4 modified traditional LiuYao boundary')

assert(candidate.runtime?.semanticActEligibility === 'v0.1', 'Semantic Act runtime version drift')
assert(candidate.runtime?.evidence === 'v0.3', 'Evidence runtime version drift')
assert(candidate.runtime?.arbitration === 'v0.12', 'Arbitration runtime version drift')
assert(candidate.runtime?.compatibility === 'v0.3', 'Compatibility runtime version drift')
assert(candidate.runtime?.routeability === 'v0.5-execution-v0.1', 'Routeability runtime version drift')
assert(candidate.runtime?.fallbackIdentity === 'v0.2-all22', 'Fallback Identity runtime version drift')
assert(candidate.runtime?.selection === 'v0.5', 'Selection runtime version drift')
assert(candidate.runtime?.finalization === 'v0.1', 'Finalization runtime version drift')

assert(candidate.execution?.canonicalTextsPerEncoderCall === 1, 'Candidate v0.4 execution is not single-text')
assert(candidate.execution?.routeabilityThreshold === 0.7678148573595883, 'Routeability threshold drift')
assert(candidate.execution?.semanticActThreshold === 0.5045675974201208, 'Semantic Act threshold drift')
assert(candidate.execution?.scopeHardVetoCutoff === 0.4319473801404805, 'Scope hard veto drift')
assert(candidate.execution?.fallbackGlobalThreshold === 0.5549057227178391, 'Fallback global threshold drift')
assert(candidate.execution?.fallbackCandidateUniverse === 'all_current_22_routes', 'Fallback universe drift')
assert(candidate.execution?.routerTop2FallbackRestriction === false, 'Router Top2 fallback restriction reintroduced')
assert(candidate.execution?.routeSpecificFallbackThresholds === false, 'Route-specific fallback thresholds introduced')
assert(candidate.execution?.fallbackBelowThresholdRouteabilityRescue === false, 'Below-threshold fallback rescue reintroduced')

verifyBinding(candidate.runtimeLock, 'candidate.runtimeLock')
for (const binding of candidate.runtimeSources || []) verifyBinding(binding, 'candidate.runtimeSources')
assert((candidate.runtimeSources || []).length >= 13, 'Candidate runtime source binding unexpectedly incomplete')
for (const binding of Object.values(candidate.preLockEvidence || {})) verifyBinding(binding, 'candidate.preLockEvidence')

assert(report.status === 'pre_lock_development_pass' && report.readyForCandidateLock === true, 'Development report no longer supports Candidate lock')
assert(Object.values(report.checks || {}).length === 5 && Object.values(report.checks).every(Boolean), 'Development gates no longer all PASS')
assert(report.summary?.known === 132 && report.summary?.nonRoute === 66, 'Development report population drift')
assert(report.summary?.attrition?.wrongSelectedRoute === 0, 'Development report contains wrong selected known route')
assert(candidate.freshDevelopment?.readyForCandidateLock === true, 'Candidate does not record development lock readiness')
assert(JSON.stringify(candidate.freshDevelopment?.checks) === JSON.stringify(report.checks), 'Candidate development checks do not match report')
assert(candidate.freshDevelopment?.metrics?.knownExactRoute === report.summary.knownExactRoute, 'Candidate known exact metric drift')
assert(candidate.freshDevelopment?.metrics?.acceptedRouteAccuracy === report.summary.acceptedRouteAccuracy, 'Candidate accepted route accuracy drift')
assert(candidate.freshDevelopment?.metrics?.nonRouteFalseRouteActivation === report.summary.nonRouteFalseRouteActivation, 'Candidate non-route safety metric drift')
assert(candidate.freshDevelopment?.metrics?.wrongSelectedRoute === 0, 'Candidate records wrong selected route')

assert(candidate.evaluationPolicy?.current198DevelopmentIsDevelopmentOnly === true, 'Development-only policy missing')
assert(candidate.evaluationPolicy?.developmentMayTrainCalibrateOrRetuneCandidate === false, 'Development may train/calibrate/retune candidate')
assert(candidate.evaluationPolicy?.developmentMayMutateCandidateRuntime === false, 'Development may mutate runtime')
assert(candidate.evaluationPolicy?.independentEvalMustBeFreshAfterThisLock === true, 'Fresh post-lock independent requirement missing')
assert(candidate.evaluationPolicy?.independentEvalReadBeforeThisLock === false, 'Independent evaluation was read before lock')
assert(candidate.evaluationPolicy?.independentEvalMayNotTrainCalibrateOrRetuneThisCandidate === true, 'Independent evaluation may retune candidate')
assert(candidate.evaluationPolicy?.candidateMutationAfterLock === false, 'Candidate mutation permitted after lock')
assert(candidate.evaluationPolicy?.noSameVersionRetuneAfterIndependentEval === true, 'Same-version retune allowed after independent evaluation')
assert(candidate.evaluationPolicy?.sealedBlindEvaluationReadBeforeThisLock === false, 'Sealed blind evaluation was read before lock')
assert(candidate.evaluationPolicy?.postBaselineNewThemeCorpusImported === false, 'Post-Baseline new-theme corpus imported')
assert(candidate.nextAction === 'fresh_post_lock_candidate_v04_independent_evaluation_only', 'Candidate next action drift')

assert(lock.version === '0.13-candidate-v0.4-lock-v0.1', 'Candidate v0.4 lock version mismatch')
assert(lock.status === 'locked_after_fresh_development_pass_before_independent_evaluation', 'Candidate v0.4 lock status mismatch')
assert(lock.scope === candidate.scope, 'Candidate lock scope mismatch')
verifyBinding(lock.candidate, 'lock.candidate')
verifyBinding(lock.runtimeLock, 'lock.runtimeLock')
verifyBinding(lock.developmentArtifact, 'lock.developmentArtifact')
verifyBinding(lock.developmentLock, 'lock.developmentLock')
verifyBinding(lock.developmentFreshnessReport, 'lock.developmentFreshnessReport')
verifyBinding(lock.correctedScoringContract, 'lock.correctedScoringContract')
verifyBinding(lock.scoringContractCorrection, 'lock.scoringContractCorrection')
verifyBinding(lock.preLockDevelopmentReport, 'lock.preLockDevelopmentReport')

assert(lock.developmentGatePass?.readyForCandidateLock === true, 'Lock lacks development gate PASS')
assert(Object.values(lock.developmentGatePass?.checks || {}).length === 5 && Object.values(lock.developmentGatePass.checks).every(Boolean), 'Lock development gates are not all PASS')
assert(lock.developmentGatePass?.knownExactRoute === report.summary.knownExactRoute, 'Lock known exact metric drift')
assert(lock.developmentGatePass?.acceptedRouteAccuracy === report.summary.acceptedRouteAccuracy, 'Lock accepted route accuracy drift')
assert(lock.developmentGatePass?.overallFalseRouteActivation === report.summary.nonRouteFalseRouteActivation, 'Lock overall false activation drift')
assert(lock.developmentGatePass?.nearDomainFalseRouteActivation === report.summary.byNonRouteSubtype?.near_domain_not_current_route?.falseRouteActivation, 'Lock near-domain false activation drift')
assert(lock.developmentGatePass?.wrongSelectedRoute === 0, 'Lock records wrong selected known route')

assert(lock.invariants?.routeCount === 22, 'Lock route count drift')
assert(lock.invariants?.routeInventoryExpansionBeforeBaseline1 === false, 'Lock permits pre-Baseline route expansion')
assert(lock.invariants?.candidateMutationAllowed === false, 'Lock permits Candidate mutation')
assert(lock.invariants?.thresholdRetuningAllowed === false, 'Lock permits threshold retuning')
assert(lock.invariants?.routeSpecificFallbackThresholds === false, 'Lock permits route-specific Fallback thresholds')
assert(lock.invariants?.routerTop2FallbackRestriction === false, 'Lock reintroduces Router Top2 Fallback restriction')
assert(lock.invariants?.traditionalLiuYaoFeaturesModified === false, 'Lock records traditional LiuYao modifications')
assert(lock.invariants?.developmentMayFeedTrainingOrCalibration === false, 'Lock permits development leakage into training/calibration')
assert(lock.invariants?.independentEvaluationMustBeFreshPostLock === true, 'Lock does not require fresh post-lock independent evaluation')
assert(lock.invariants?.independentEvaluationReadBeforeLock === false, 'Lock records independent evaluation read before lock')
assert(lock.invariants?.sealedBlindEvaluationReadBeforeLock === false, 'Lock records sealed blind evaluation read before lock')
assert(lock.invariants?.postBaselineNewThemeImported === false, 'Lock records post-Baseline new-theme import')
assert(lock.lockGeneration?.encoderScoringPerformedDuringLockGeneration === false, 'Encoder scoring occurred during lock generation')
assert(lock.lockGeneration?.independentEvaluationReadDuringLockGeneration === false, 'Independent evaluation read during lock generation')
assert(lock.nextAction === 'fresh_post_lock_candidate_v04_independent_evaluation_only', 'Lock next action drift')

assert(runtimeLock.status === 'runtime_locked_before_fresh_development', 'Runtime lock status drift')
assert(lock.runtimeLock.gitBlobSha === gitBlobSha(runtimeLockPath), 'Runtime lock blob mismatch')
assert(lock.preLockDevelopmentReport.gitBlobSha === gitBlobSha(developmentReportPath), 'Development report blob mismatch')

console.log('CANDIDATE_V04_LOCK_VERIFIED', JSON.stringify({
  candidateGitBlobSha: lock.candidate.gitBlobSha,
  candidateSha256: lock.candidate.sha256,
  lockGitBlobSha: gitBlobSha(lockPath),
  lockSha256: sha256(lockPath),
  knownExactRoute: lock.developmentGatePass.knownExactRoute,
  acceptedRouteAccuracy: lock.developmentGatePass.acceptedRouteAccuracy,
  overallFalseRouteActivation: lock.developmentGatePass.overallFalseRouteActivation,
  nearDomainFalseRouteActivation: lock.developmentGatePass.nearDomainFalseRouteActivation,
  independentEvaluationReadBeforeLock: false,
  nextAction: lock.nextAction
}, null, 2))
