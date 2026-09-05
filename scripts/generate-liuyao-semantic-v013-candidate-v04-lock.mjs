import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const candidatePath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.json'
const lockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'
const developmentPath = 'data/liuyao-semantic-v013-candidate-v04-development.json'
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v04-development.lock.json'
const freshnessReportPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-report-v0.1.json'
const scoringContractPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-contract-v0.1.1.json'
const scoringCorrectionPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-contract-correction-v0.1.json'
const developmentReportPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-report.json'

const read = (path) => fs.readFileSync(path)
const readJson = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const bind = (path) => ({ path, gitBlobSha: gitBlobSha(path), sha256: sha256(path) })

for (const path of [runtimeLockPath, developmentPath, developmentLockPath, freshnessReportPath, scoringContractPath, scoringCorrectionPath, developmentReportPath]) {
  assert(fs.existsSync(path), `required Candidate v0.4 lock input missing: ${path}`)
}
for (const path of [candidatePath, lockPath]) {
  assert(!fs.existsSync(path), `Candidate v0.4 lock target already exists: ${path}`)
}

const runtimeLock = readJson(runtimeLockPath)
const developmentLock = readJson(developmentLockPath)
const scoringContract = readJson(scoringContractPath)
const developmentReport = readJson(developmentReportPath)
const freshnessReport = readJson(freshnessReportPath)

assert(runtimeLock.status === 'runtime_locked_before_fresh_development', 'runtime lock status mismatch')
assert(runtimeLock.isolation?.freshV04DevelopmentMayModifyRuntime === false, 'runtime lock permits development mutation')
assert(runtimeLock.isolation?.independentEvaluationRead === false, 'runtime lock says independent evaluation was read')
assert(runtimeLock.isolation?.sealedBlindEvaluationRead === false, 'runtime lock says sealed blind evaluation was read')
assert(developmentLock.status === 'locked_before_first_candidate_v04_development_encoder_scoring', 'development lock status mismatch')
assert(developmentLock.sealing?.sealedBeforeFirstDevelopmentEncoderScoring === true, 'development was not sealed before scoring')
assert(developmentLock.sealing?.postSealWordingMutationAllowed === false, 'development lock permits post-seal mutation')
assert(developmentLock.sealing?.developmentMayTrainModels === false, 'development lock permits training')
assert(developmentLock.sealing?.developmentMayCalibrateThresholds === false, 'development lock permits calibration')
assert(developmentLock.sealing?.developmentMayMutateRuntime === false, 'development lock permits runtime mutation')
assert(developmentLock.protectedEvaluationBoundary?.independentEvaluationReadBeforeSeal === false, 'independent evaluation read before development seal')
assert(developmentLock.protectedEvaluationBoundary?.sealedBlindEvaluationReadBeforeSeal === false, 'sealed blind evaluation read before development seal')
assert(gitBlobSha(developmentPath) === developmentLock.artifact.gitBlobSha, 'sealed development Git blob mismatch')
assert(sha256(developmentPath) === developmentLock.artifact.sha256, 'sealed development SHA256 mismatch')
assert(freshnessReport.status === 'PASS' && freshnessReport.results?.pass === true, 'development freshness not PASS')
assert(freshnessReport.results.historicalRejectedRowCount === 0, 'development freshness historical reject exists')
assert(freshnessReport.results.internalRejectedPairCount === 0, 'development freshness internal reject exists')
assert(scoringContract.status === 'locked_before_first_candidate_v04_development_encoder_scoring', 'corrected scoring contract not locked')
assert(scoringContract.correctionEvidence?.encoderOrModelScoringObservedBeforeCorrection === false, 'scoring binding correction happened after scoring')
assert(scoringContract.sealedDevelopment.artifactGitBlobSha === developmentLock.artifact.gitBlobSha, 'scoring contract development blob mismatch')
assert(scoringContract.sealedDevelopment.artifactSha256 === developmentLock.artifact.sha256, 'scoring contract development SHA mismatch')
assert(scoringContract.frozenRuntime.lockGitBlobSha === gitBlobSha(runtimeLockPath), 'scoring contract runtime blob mismatch')
assert(scoringContract.frozenRuntime.lockSha256 === sha256(runtimeLockPath), 'scoring contract runtime SHA mismatch')
assert(developmentReport.version === '0.13-candidate-v0.4-development-report-execution-v0.1', 'development report version mismatch')
assert(developmentReport.status === 'pre_lock_development_pass', 'Candidate v0.4 development did not PASS')
assert(developmentReport.readyForCandidateLock === true, 'Candidate v0.4 report is not ready for lock')
assert(Object.values(developmentReport.checks || {}).length === 5 && Object.values(developmentReport.checks).every(Boolean), 'not all Candidate v0.4 development gates passed')
assert(developmentReport.policy?.readsIndependentEval === false && developmentReport.policy?.usesIndependentEval === false, 'development report used/read independent evaluation')
assert(developmentReport.policy?.readsSealedBlindEval === false, 'development report read sealed blind evaluation')
assert(developmentReport.policy?.training === false && developmentReport.policy?.calibration === false && developmentReport.policy?.retunesThresholds === false, 'development report is not evaluation-only')
assert(developmentReport.policy?.mutatesRuntime === false && developmentReport.policy?.mutatesDevelopmentData === false, 'development report mutated frozen state')
assert(developmentReport.execution?.developmentArtifactGitBlobSha === developmentLock.artifact.gitBlobSha, 'development report artifact blob mismatch')
assert(developmentReport.execution?.developmentArtifactSha256 === developmentLock.artifact.sha256, 'development report artifact SHA mismatch')
assert(developmentReport.execution?.runtimeLockGitBlobSha === gitBlobSha(runtimeLockPath), 'development report runtime blob mismatch')
assert(developmentReport.execution?.runtimeLockSha256 === sha256(runtimeLockPath), 'development report runtime SHA mismatch')
assert(developmentReport.execution?.encoderInvocationCount === 198 && developmentReport.execution?.canonicalTextsSubmitted === 198, 'development report execution count mismatch')
assert(developmentReport.execution?.canonicalTextsPerEncoderCall === 1, 'development report violated single-text execution')
assert(developmentReport.execution?.routerTop2FallbackRestriction === false, 'development report unexpectedly restricted Fallback to Router Top2')
assert(developmentReport.summary?.known === 132 && developmentReport.summary?.nonRoute === 66, 'development report row counts drift')
assert(developmentReport.summary?.attrition?.wrongSelectedRoute === 0, 'development report contains wrong selected known route')

const runtimeSources = []
for (const [path, expectedBlob] of Object.entries(runtimeLock.modules || {})) {
  assert(fs.existsSync(path), `runtime module missing: ${path}`)
  assert(gitBlobSha(path) === expectedBlob, `runtime module Git blob drift: ${path}`)
  runtimeSources.push(bind(path))
}
for (const spec of Object.values(runtimeLock.frozenArtifacts || {})) {
  if (!spec?.path) continue
  assert(fs.existsSync(spec.path), `frozen artifact missing: ${spec.path}`)
  if (spec.sha256) assert(sha256(spec.path) === spec.sha256, `frozen artifact SHA drift: ${spec.path}`)
  runtimeSources.push(bind(spec.path))
  for (const key of ['lockPath', 'weightsLockPath', 'thresholdLockPath']) {
    if (spec[key]) {
      assert(fs.existsSync(spec[key]), `frozen lock missing: ${spec[key]}`)
      runtimeSources.push(bind(spec[key]))
    }
  }
}
const uniqueRuntimeSources = [...new Map(runtimeSources.map((item) => [item.path, item])).values()].sort((a, b) => a.path.localeCompare(b.path))

const gates = scoringContract.promotionGates
const summary = developmentReport.summary
const candidate = {
  version: '0.13-candidate-v0.4',
  status: 'frozen_candidate_after_fresh_development_pass',
  scope: 'liuyao_semantic_decision_stack_v0.13',
  modernSemanticOnly: true,
  routeInventoryCount: 22,
  routeInventoryFrozenBeforeBaseline1: true,
  traditionalLiuYaoBoundaryModified: false,
  runtime: {
    semanticActEligibility: 'v0.1',
    evidence: 'v0.3',
    arbitration: 'v0.12',
    compatibility: 'v0.3',
    routeability: 'v0.5-execution-v0.1',
    fallbackIdentity: 'v0.2-all22',
    selection: 'v0.5',
    finalization: 'v0.1'
  },
  execution: {
    canonicalTextsPerEncoderCall: 1,
    encoderModelId: runtimeLock.execution.encoderModelId,
    encoderRevision: runtimeLock.execution.encoderRevision,
    vectorSize: runtimeLock.execution.vectorSize,
    scopeHardVetoCutoff: runtimeLock.execution.scopeHardVetoCutoff,
    routeabilityThreshold: runtimeLock.execution.routeabilityThreshold,
    semanticActThreshold: runtimeLock.execution.semanticActThreshold,
    fallbackGlobalThreshold: runtimeLock.execution.fallbackGlobalThreshold,
    fallbackCandidateUniverse: runtimeLock.execution.fallbackCandidateUniverse,
    routerTop2FallbackRestriction: runtimeLock.execution.routerTop2FallbackRestriction,
    routeSpecificFallbackThresholds: runtimeLock.execution.routeSpecificFallbackThresholds,
    fallbackBelowThresholdRouteabilityRescue: runtimeLock.execution.fallbackBelowThresholdRouteabilityRescue
  },
  runtimeLock: bind(runtimeLockPath),
  runtimeSources: uniqueRuntimeSources,
  preLockEvidence: {
    developmentArtifact: bind(developmentPath),
    developmentLock: bind(developmentLockPath),
    freshnessReport: bind(freshnessReportPath),
    scoringContract: bind(scoringContractPath),
    scoringContractCorrection: bind(scoringCorrectionPath),
    developmentReport: bind(developmentReportPath)
  },
  freshDevelopment: {
    status: developmentReport.status,
    readyForCandidateLock: true,
    checks: developmentReport.checks,
    metrics: {
      knownExactRoute: summary.knownExactRoute,
      acceptedRouteAccuracy: summary.acceptedRouteAccuracy,
      nonRouteFalseRouteActivation: summary.nonRouteFalseRouteActivation,
      byNonRouteSubtype: summary.byNonRouteSubtype,
      byKnownPath: summary.byKnownPath,
      wrongSelectedRoute: summary.attrition.wrongSelectedRoute
    },
    promotionGates: gates,
    marginDiagnostics: {
      knownExactPassedByRows: summary.attrition.finalExact - Math.ceil(gates.minimumKnownExactRoute * summary.known) + 1,
      knownExactNumerator: summary.attrition.finalExact,
      knownExactDenominator: summary.known,
      nearDomainFalseActivations: Math.round(summary.byNonRouteSubtype.near_domain_not_current_route.falseRouteActivation * summary.byNonRouteSubtype.near_domain_not_current_route.n),
      nearDomainRows: summary.byNonRouteSubtype.near_domain_not_current_route.n,
      interpretation: 'formal development PASS under frozen gates; margins remain diagnostic and may not trigger same-version retuning'
    }
  },
  evaluationPolicy: {
    current198DevelopmentIsDevelopmentOnly: true,
    developmentMayTrainCalibrateOrRetuneCandidate: false,
    developmentMayMutateCandidateRuntime: false,
    independentEvalMustBeFreshAfterThisLock: true,
    independentEvalReadBeforeThisLock: false,
    independentEvalMayNotTrainCalibrateOrRetuneThisCandidate: true,
    candidateMutationAfterLock: false,
    noSameVersionRetuneAfterIndependentEval: true,
    sealedBlindEvaluationReadBeforeThisLock: false,
    postBaselineNewThemeCorpusImported: false
  },
  nextAction: 'fresh_post_lock_candidate_v04_independent_evaluation_only'
}
fs.writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`)

const lock = {
  version: '0.13-candidate-v0.4-lock-v0.1',
  status: 'locked_after_fresh_development_pass_before_independent_evaluation',
  scope: candidate.scope,
  candidate: bind(candidatePath),
  runtimeLock: bind(runtimeLockPath),
  developmentArtifact: bind(developmentPath),
  developmentLock: bind(developmentLockPath),
  developmentFreshnessReport: bind(freshnessReportPath),
  correctedScoringContract: bind(scoringContractPath),
  scoringContractCorrection: bind(scoringCorrectionPath),
  preLockDevelopmentReport: bind(developmentReportPath),
  developmentGatePass: {
    readyForCandidateLock: true,
    checks: developmentReport.checks,
    knownExactRoute: summary.knownExactRoute,
    acceptedRouteAccuracy: summary.acceptedRouteAccuracy,
    overallFalseRouteActivation: summary.nonRouteFalseRouteActivation,
    nearDomainFalseRouteActivation: summary.byNonRouteSubtype.near_domain_not_current_route.falseRouteActivation,
    wrongSelectedRoute: summary.attrition.wrongSelectedRoute
  },
  invariants: {
    routeCount: 22,
    routeInventoryExpansionBeforeBaseline1: false,
    candidateMutationAllowed: false,
    thresholdRetuningAllowed: false,
    routeSpecificFallbackThresholds: false,
    routerTop2FallbackRestriction: false,
    traditionalLiuYaoFeaturesModified: false,
    developmentMayFeedTrainingOrCalibration: false,
    independentEvaluationMustBeFreshPostLock: true,
    independentEvaluationReadBeforeLock: false,
    sealedBlindEvaluationReadBeforeLock: false,
    postBaselineNewThemeImported: false
  },
  lockGeneration: {
    baseCommit: process.env.GITHUB_SHA || null,
    reportVerifierRequiredBeforeGeneration: true,
    encoderScoringPerformedDuringLockGeneration: false,
    independentEvaluationReadDuringLockGeneration: false
  },
  nextAction: candidate.nextAction
}
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)

console.log('CANDIDATE_V04_LOCK_GENERATED', JSON.stringify({
  candidateSha256: lock.candidate.sha256,
  candidateGitBlobSha: lock.candidate.gitBlobSha,
  developmentReportSha256: lock.preLockDevelopmentReport.sha256,
  developmentReportGitBlobSha: lock.preLockDevelopmentReport.gitBlobSha,
  runtimeLockSha256: lock.runtimeLock.sha256,
  readyForCandidateLock: lock.developmentGatePass.readyForCandidateLock,
  independentEvaluationReadBeforeLock: false,
  nextAction: lock.nextAction
}, null, 2))
