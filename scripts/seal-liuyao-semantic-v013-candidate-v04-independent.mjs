import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const independentPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const presealReportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock.json'
const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-contract-v0.1.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'

const EXPECTED = Object.freeze({
  independentSha256:'193aa0c86eac0945844a2675571522a407d60cfe8d1e7f24a1cd47c374c533e8',
  independentGitBlobSha:'2c4b7c8f5398210fdf48f1d085cda4b9b7c00774',
  presealReportSha256:'24e4a42c1ec2897bc2a8a789e6c7d4a448d27331befbacd89e694927c8a2388e',
  presealReportGitBlobSha:'1c97f1b11394c1698f5b5fba8cdb3503eba17a47',
  candidateLockSha256:'6f4d94209a781ffc650b6b3046143655756c6d1ba58a737fc5a559595a214126',
  candidateLockGitBlobSha:'57286439b7c370b2390d97e06d7664a57d34d520'
})

const read = (path) => fs.readFileSync(path)
const json = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding:'utf8' }).trim()
const assert = (value, message) => { if (!value) throw new Error(message) }
const binding = (path) => ({ path, gitBlobSha:gitBlobSha(path), sha256:sha256(path) })

for (const path of [independentPath, presealReportPath, contractPath, candidateLockPath]) assert(fs.existsSync(path), `seal input missing: ${path}`)
assert(!fs.existsSync(lockPath), `independent lock already exists: ${lockPath}`)

const independent = json(independentPath)
const report = json(presealReportPath)
const contract = json(contractPath)
const candidateLock = json(candidateLockPath)

assert(sha256(independentPath) === EXPECTED.independentSha256, 'independent artifact SHA256 differs from reference PASS')
assert(gitBlobSha(independentPath) === EXPECTED.independentGitBlobSha, 'independent artifact Git blob differs from reference PASS')
assert(sha256(presealReportPath) === EXPECTED.presealReportSha256, 'independent preseal report SHA256 differs from reference PASS')
assert(gitBlobSha(presealReportPath) === EXPECTED.presealReportGitBlobSha, 'independent preseal report Git blob differs from reference PASS')
assert(sha256(candidateLockPath) === EXPECTED.candidateLockSha256, 'Candidate v0.4 lock SHA256 drift')
assert(gitBlobSha(candidateLockPath) === EXPECTED.candidateLockGitBlobSha, 'Candidate v0.4 lock Git blob drift')

assert(independent.status === 'generated_post_lock_unscored_awaiting_preseal_verification', 'unexpected independent artifact status before seal')
assert(independent.rows?.length === 198 && independent.counts?.known === 132 && independent.counts?.nonRoute === 66, 'independent population drift')
assert(independent.encoderScoringObserved === false && independent.modelProbabilityObserved === false, 'independent artifact was scored before seal')
assert(report.status === 'PASS', 'independent preseal report not PASS')
assert(report.structural?.pass === true && report.structural?.failureCount === 0, 'independent structural preseal not PASS')
assert(report.freshness?.pass === true, 'independent freshness preseal not PASS')
assert(report.freshness?.historicalRejectedRowCount === 0 && report.freshness?.internalRejectedPairCount === 0, 'independent freshness still has rejects')
assert(contract.status === 'frozen_after_candidate_lock_before_fresh_independent_generation', 'independent contract drift')
assert(candidateLock.status === 'locked_after_fresh_development_pass_before_independent_evaluation', 'Candidate v0.4 lock status drift')
assert(candidateLock.invariants?.independentEvaluationMustBeFreshPostLock === true, 'Candidate lock does not require fresh independent')

const scriptPaths = [
  'scripts/generate-liuyao-semantic-v013-candidate-v04-independent.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-structural-correction.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-fallback-correction.mjs',
  'scripts/apply-liuyao-semantic-v013-candidate-v04-independent-preseal-freshness-correction.mjs',
  'scripts/verify-liuyao-semantic-v013-candidate-v04-independent-preseal.mjs',
  'scripts/run-liuyao-semantic-v013-candidate-v04-independent-preseal-with-diagnostics.mjs'
]
for (const path of scriptPaths) assert(fs.existsSync(path), `seal script binding missing: ${path}`)

const lock = {
  version:'0.13-candidate-v0.4-independent-lock-v0.1',
  status:'sealed_before_first_post_lock_independent_encoder_scoring',
  scope:'fresh_post_lock_candidate_v04_independent_evaluation',
  candidateLock:binding(candidateLockPath),
  independentContract:binding(contractPath),
  independentArtifact:binding(independentPath),
  presealReport:binding(presealReportPath),
  generationAndPresealScripts:Object.fromEntries(scriptPaths.map((path) => [path, binding(path)])),
  referencePassingPresealRun:{
    runId:34011312636,
    jobId:101427536553,
    triggerCommit:'1aa5c3fcbd12d174714e6c3181c84ef0884d1492',
    independentArtifactSha256:EXPECTED.independentSha256,
    independentArtifactGitBlobSha:EXPECTED.independentGitBlobSha,
    presealReportSha256:EXPECTED.presealReportSha256,
    presealReportGitBlobSha:EXPECTED.presealReportGitBlobSha
  },
  population:{
    total:198,
    known:132,
    nonRoute:66,
    strong_arbitration:44,
    support_arbitration:44,
    fallback_head:44,
    outside_current_22:22,
    route_unresolved:22,
    near_domain_not_current_route:22,
    fallbackAll22ExactlyTwoPerRoute:true
  },
  execution:{
    canonicalTextsPerEncoderCall:1,
    encoderModelId:'Xenova/bge-small-zh-v1.5',
    encoderRevision:'75c43b069aac4d136ba6bc1122f995fedcfd2781',
    transformersJsVersion:'4.2.0',
    dtype:'q8',
    vectorSize:512,
    pooling:'mean',
    normalize:true
  },
  invariants:{
    sealedBeforeFirstIndependentEncoderScoring:true,
    postSealWordingMutationAllowed:false,
    independentMayTrainModels:false,
    independentMayCalibrateThresholds:false,
    independentMaySelectThresholds:false,
    independentMayMutateCandidateRuntime:false,
    candidateMutationAllowed:false,
    thresholdRetuningAllowed:false,
    independentRowsMayFeedLaterTraining:false,
    independentRowsMayFeedLaterCalibration:false,
    sealedBlindEvaluationRead:false,
    postBaselineNewThemeImported:false
  },
  lockGeneration:{
    encoderInstalled:false,
    encoderScoringPerformed:false,
    modelProbabilityObserved:false,
    runtimeMutation:false
  },
  nextAction:'freeze_independent_scoring_contract_then_score_exactly_198_sealed_rows'
}

fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')
console.log('CANDIDATE_V04_INDEPENDENT_SEALED', JSON.stringify({ independentArtifact:lock.independentArtifact, presealReport:lock.presealReport, lock:binding(lockPath), nextAction:lock.nextAction }, null, 2))
