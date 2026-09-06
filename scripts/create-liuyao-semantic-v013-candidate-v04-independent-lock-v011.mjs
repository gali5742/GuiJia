import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const artifactPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'
const oldLockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock.json'
const correctionPath = 'data/liuyao-semantic-v013-candidate-v04-independent-lock-correction-v0.1.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'
const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-contract-v0.1.json'
const outputPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock-v0.1.1.json'

const DATA_SEAL_COMMIT = 'ac113ff1c888a9519e4fbd420a5616f645737692'
const EXPECTED = Object.freeze({
  artifactSha256: '193aa0c86eac0945844a2675571522a407d60cfe8d1e7f24a1cd47c374c533e8',
  artifactGitBlobSha: '2c4b7c8f5398210fdf48f1d085cda4b9b7c00774',
  reportSha256: '24e4a42c1ec2897bc2a8a789e6c7d4a448d27331befbacd89e694927c8a2388e',
  reportGitBlobSha: '1c97f1b11394c1698f5b5fba8cdb3503eba17a47',
  oldLockSha256: 'ed90b16dab216edd96291c494599510b879d84715251f4abd673792334459677',
  oldLockGitBlobSha: '2b5732914195162a2dd04c75083626aa29cbedd3',
  candidateLockSha256: '6f4d94209a781ffc650b6b3046143655756c6d1ba58a737fc5a559595a214126',
  candidateLockGitBlobSha: '57286439b7c370b2390d97e06d7664a57d34d520',
  correctionGitBlobSha: '502342667cfc9e2d81afaeeee5a41679fbf68354'
})

const read = (path) => fs.readFileSync(path)
const json = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
const assert = (value, message) => { if (!value) throw new Error(message) }
const binding = (path) => ({ path, gitBlobSha: gitBlobSha(path), sha256: sha256(path) })

assert(!fs.existsSync(outputPath), `corrected lock already exists: ${outputPath}`)
for (const path of [artifactPath, reportPath, oldLockPath, correctionPath, candidateLockPath, contractPath]) {
  assert(fs.existsSync(path), `required lock input missing: ${path}`)
}

execFileSync('git', ['merge-base', '--is-ancestor', DATA_SEAL_COMMIT, 'HEAD'])

assert(sha256(artifactPath) === EXPECTED.artifactSha256, 'sealed independent artifact SHA256 drift')
assert(gitBlobSha(artifactPath) === EXPECTED.artifactGitBlobSha, 'sealed independent artifact Git blob drift')
assert(sha256(reportPath) === EXPECTED.reportSha256, 'sealed independent preseal report SHA256 drift')
assert(gitBlobSha(reportPath) === EXPECTED.reportGitBlobSha, 'sealed independent preseal report Git blob drift')
assert(sha256(oldLockPath) === EXPECTED.oldLockSha256, 'superseded v0.1 lock SHA256 drift')
assert(gitBlobSha(oldLockPath) === EXPECTED.oldLockGitBlobSha, 'superseded v0.1 lock Git blob drift')
assert(sha256(candidateLockPath) === EXPECTED.candidateLockSha256, 'Candidate v0.4 lock SHA256 drift')
assert(gitBlobSha(candidateLockPath) === EXPECTED.candidateLockGitBlobSha, 'Candidate v0.4 lock Git blob drift')
assert(gitBlobSha(correctionPath) === EXPECTED.correctionGitBlobSha, 'correction evidence Git blob drift')

const artifact = json(artifactPath)
const report = json(reportPath)
const oldLock = json(oldLockPath)
const correction = json(correctionPath)
const candidateLock = json(candidateLockPath)
const contract = json(contractPath)

assert(artifact.rows?.length === 198 && artifact.counts?.known === 132 && artifact.counts?.nonRoute === 66, 'sealed independent population drift')
assert(artifact.encoderScoringObserved === false && artifact.modelProbabilityObserved === false, 'sealed independent artifact indicates pre-seal scoring')
assert(report.status === 'PASS' && report.structural?.pass === true && report.freshness?.pass === true, 'preseal PASS report drift')
assert(oldLock.version === '0.13-candidate-v0.4-independent-lock-v0.1', 'unexpected superseded lock version')
assert(correction.status === 'frozen_before_corrected_independent_lock_and_before_first_independent_encoder_scoring', 'lock correction evidence not frozen')
assert(correction.dataSealCommit === DATA_SEAL_COMMIT, 'correction evidence data seal commit drift')
assert(correction.supersededLock?.validForIndependentScoring === false, 'correction evidence does not invalidate v0.1 lock')
assert(correction.executionBoundary?.independentEncoderScoringPerformedBeforeThisCorrection === false, 'correction evidence indicates independent scoring already occurred')
assert(candidateLock.status === 'locked_after_fresh_development_pass_before_independent_evaluation', 'Candidate v0.4 lock status drift')
assert(contract.status === 'frozen_after_candidate_lock_before_fresh_independent_generation', 'independent contract status drift')

// Stable repository sources only. These are read from the clean committed checkout;
// unlike v0.1, no temporary patched working-tree state may enter this binding.
const stableSourcePaths = [
  'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-structural-correction.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-fallback-correction.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-freshness-correction.mjs',
  'scripts/verify-liuyao-semantic-v013-candidate-v04-independent-preseal.mjs',
  'scripts/run-liuyao-semantic-v013-candidate-v04-independent-preseal-with-diagnostics.mjs',
  'scripts/seal-liuyao-semantic-v013-candidate-v04-independent.mjs',
  'scripts/verify-liuyao-semantic-v013-candidate-v04-independent-lock.mjs'
]
for (const path of stableSourcePaths) assert(fs.existsSync(path), `stable source missing: ${path}`)

const dataSealArtifactBlob = execFileSync('git', ['rev-parse', `${DATA_SEAL_COMMIT}:${artifactPath}`], { encoding: 'utf8' }).trim()
const dataSealReportBlob = execFileSync('git', ['rev-parse', `${DATA_SEAL_COMMIT}:${reportPath}`], { encoding: 'utf8' }).trim()
assert(dataSealArtifactBlob === EXPECTED.artifactGitBlobSha, 'data seal commit does not contain expected independent artifact blob')
assert(dataSealReportBlob === EXPECTED.reportGitBlobSha, 'data seal commit does not contain expected preseal report blob')

const lock = {
  version: '0.13-candidate-v0.4-independent-lock-v0.1.1',
  status: 'corrected_lock_sealed_before_first_post_lock_independent_encoder_scoring',
  scope: 'fresh_post_lock_candidate_v04_independent_evaluation',
  supersedes: {
    lock: binding(oldLockPath),
    validForIndependentScoring: false,
    reason: 'v0.1 bound one transient CI-patched generator working-tree state; independent artifact/report bytes were unaffected'
  },
  correctionEvidence: binding(correctionPath),
  dataSeal: {
    commit: DATA_SEAL_COMMIT,
    independentArtifact: binding(artifactPath),
    presealReport: binding(reportPath),
    artifactBlobAtSealCommit: dataSealArtifactBlob,
    reportBlobAtSealCommit: dataSealReportBlob
  },
  candidateLock: binding(candidateLockPath),
  independentContract: binding(contractPath),
  stableGenerationAndPresealSources: Object.fromEntries(stableSourcePaths.map((path) => [path, binding(path)])),
  population: {
    total: 198,
    known: 132,
    nonRoute: 66,
    strong_arbitration: 44,
    support_arbitration: 44,
    fallback_head: 44,
    outside_current_22: 22,
    route_unresolved: 22,
    near_domain_not_current_route: 22,
    fallbackAll22ExactlyTwoPerRoute: true
  },
  execution: {
    canonicalTextsPerEncoderCall: 1,
    encoderModelId: 'Xenova/bge-small-zh-v1.5',
    encoderRevision: '75c43b069aac4d136ba6bc1122f995fedcfd2781',
    transformersJsVersion: '4.2.0',
    dtype: 'q8',
    vectorSize: 512,
    pooling: 'mean',
    normalize: true
  },
  invariants: {
    correctedLockOnlyRepairsSourceBinding: true,
    independentArtifactUnchangedFromDataSeal: true,
    presealReportUnchangedFromDataSeal: true,
    sealedBeforeFirstIndependentEncoderScoring: true,
    postSealWordingMutationAllowed: false,
    independentMayTrainModels: false,
    independentMayCalibrateThresholds: false,
    independentMaySelectThresholds: false,
    independentMayMutateCandidateRuntime: false,
    candidateMutationAllowed: false,
    thresholdRetuningAllowed: false,
    independentRowsMayFeedLaterTraining: false,
    independentRowsMayFeedLaterCalibration: false,
    sealedBlindEvaluationRead: false,
    postBaselineNewThemeImported: false
  },
  correctionExecution: {
    encoderInstalled: false,
    encoderScoringPerformed: false,
    modelProbabilityObserved: false,
    independentRowsRegeneratedOrEdited: false,
    presealReportRegeneratedOrEdited: false,
    runtimeMutation: false
  },
  nextAction: 'freeze_independent_scoring_contract_then_score_exactly_198_sealed_rows_once'
}

fs.writeFileSync(outputPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_LOCK_V011_CREATED', JSON.stringify({
  output: binding(outputPath),
  dataSealCommit: DATA_SEAL_COMMIT,
  artifact: lock.dataSeal.independentArtifact,
  report: lock.dataSeal.presealReport,
  nextAction: lock.nextAction
}, null, 2))
