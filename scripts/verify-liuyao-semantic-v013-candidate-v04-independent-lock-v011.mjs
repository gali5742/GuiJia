import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const lockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock-v0.1.1.json'
const artifactPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'
const oldLockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock.json'
const correctionPath = 'data/liuyao-semantic-v013-candidate-v04-independent-lock-correction-v0.1.json'
const DATA_SEAL_COMMIT = 'ac113ff1c888a9519e4fbd420a5616f645737692'

const read = (path) => fs.readFileSync(path)
const json = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding:'utf8' }).trim()
const assert = (value, message) => { if (!value) throw new Error(message) }
const verifyBinding = (entry, label) => {
  assert(entry?.path && fs.existsSync(entry.path), `${label} path missing: ${entry?.path}`)
  assert(gitBlobSha(entry.path) === entry.gitBlobSha, `${label} Git blob drift: ${entry.path}`)
  assert(sha256(entry.path) === entry.sha256, `${label} SHA256 drift: ${entry.path}`)
}

assert(fs.existsSync(lockPath), `corrected lock missing: ${lockPath}`)
const lock = json(lockPath)
const correction = json(correctionPath)
const oldLock = json(oldLockPath)

assert(lock.version === '0.13-candidate-v0.4-independent-lock-v0.1.1', 'corrected lock version drift')
assert(lock.status === 'corrected_lock_sealed_before_first_post_lock_independent_encoder_scoring', 'corrected lock status drift')
assert(lock.dataSeal?.commit === DATA_SEAL_COMMIT, 'corrected lock data seal commit drift')
execFileSync('git', ['merge-base', '--is-ancestor', DATA_SEAL_COMMIT, 'HEAD'])

verifyBinding(lock.dataSeal.independentArtifact, 'independent artifact')
verifyBinding(lock.dataSeal.presealReport, 'preseal report')
verifyBinding(lock.candidateLock, 'candidate lock')
verifyBinding(lock.independentContract, 'independent contract')
verifyBinding(lock.correctionEvidence, 'correction evidence')
verifyBinding(lock.supersedes.lock, 'superseded lock')

for (const [path, entry] of Object.entries(lock.stableGenerationAndPresealSources ?? {})) {
  assert(entry.path === path, `stable source key/path mismatch: ${path}`)
  verifyBinding(entry, `stable source ${path}`)
}

const sealArtifactBlob = execFileSync('git', ['rev-parse', `${DATA_SEAL_COMMIT}:${artifactPath}`], { encoding:'utf8' }).trim()
const sealReportBlob = execFileSync('git', ['rev-parse', `${DATA_SEAL_COMMIT}:${reportPath}`], { encoding:'utf8' }).trim()
assert(sealArtifactBlob === lock.dataSeal.artifactBlobAtSealCommit, 'artifact blob at data seal commit drift')
assert(sealReportBlob === lock.dataSeal.reportBlobAtSealCommit, 'report blob at data seal commit drift')
assert(sealArtifactBlob === lock.dataSeal.independentArtifact.gitBlobSha, 'current independent artifact differs from data seal commit blob')
assert(sealReportBlob === lock.dataSeal.presealReport.gitBlobSha, 'current preseal report differs from data seal commit blob')

assert(correction.status === 'frozen_before_corrected_independent_lock_and_before_first_independent_encoder_scoring', 'correction evidence status drift')
assert(correction.correctionPolicy?.oldLockMayBeRewritten === false, 'correction policy permits rewriting old lock')
assert(correction.correctionPolicy?.independentArtifactMayBeRegeneratedOrEdited === false, 'correction policy permits independent mutation')
assert(correction.correctionPolicy?.presealReportMayBeRegeneratedOrEdited === false, 'correction policy permits report mutation')
assert(correction.correctionPolicy?.correctedLockPath === lockPath, 'correction policy corrected lock path drift')
assert(correction.executionBoundary?.independentScoringForbiddenUntilCorrectedLockVerifiedAndCommitted === true, 'correction execution boundary drift')
assert(oldLock.version === '0.13-candidate-v0.4-independent-lock-v0.1', 'superseded old lock version drift')
assert(lock.supersedes?.validForIndependentScoring === false, 'corrected lock does not invalidate v0.1 for scoring')

assert(lock.population?.total === 198 && lock.population?.known === 132 && lock.population?.nonRoute === 66, 'corrected lock population drift')
assert(lock.execution?.canonicalTextsPerEncoderCall === 1, 'canonical text per encoder call drift')
assert(lock.execution?.encoderModelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift')
assert(lock.execution?.encoderRevision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift')
assert(lock.execution?.transformersJsVersion === '4.2.0', 'Transformers.js version drift')
assert(lock.execution?.dtype === 'q8' && lock.execution?.vectorSize === 512 && lock.execution?.pooling === 'mean' && lock.execution?.normalize === true, 'encoder execution contract drift')

for (const [key, expected] of Object.entries({
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
})) assert(lock.invariants?.[key] === expected, `corrected lock invariant drift: ${key}`)

assert(lock.correctionExecution?.encoderInstalled === false, 'encoder installed during correction')
assert(lock.correctionExecution?.encoderScoringPerformed === false, 'independent encoder scoring occurred during correction')
assert(lock.correctionExecution?.modelProbabilityObserved === false, 'model probability observed during correction')
assert(lock.correctionExecution?.independentRowsRegeneratedOrEdited === false, 'independent rows changed during correction')
assert(lock.correctionExecution?.presealReportRegeneratedOrEdited === false, 'preseal report changed during correction')
assert(lock.correctionExecution?.runtimeMutation === false, 'runtime mutated during correction')
assert(lock.nextAction === 'freeze_independent_scoring_contract_then_score_exactly_198_sealed_rows_once', 'corrected lock next action drift')

console.log('CANDIDATE_V04_INDEPENDENT_LOCK_V011_VERIFIED', JSON.stringify({
  lock: { path: lockPath, gitBlobSha: gitBlobSha(lockPath), sha256: sha256(lockPath) },
  dataSealCommit: DATA_SEAL_COMMIT,
  artifactGitBlobSha: lock.dataSeal.independentArtifact.gitBlobSha,
  reportGitBlobSha: lock.dataSeal.presealReport.gitBlobSha,
  stableGeneratorGitBlobSha: lock.stableGenerationAndPresealSources['scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs']?.gitBlobSha,
  sealedBeforeFirstIndependentEncoderScoring: lock.invariants.sealedBeforeFirstIndependentEncoderScoring,
  nextAction: lock.nextAction
}, null, 2))
