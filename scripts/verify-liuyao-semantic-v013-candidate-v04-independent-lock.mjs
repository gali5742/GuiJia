import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const independentPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const presealReportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-preseal-report-v0.1.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'

const read = (path) => fs.readFileSync(path)
const readJson = (path) => JSON.parse(read(path).toString('utf8'))
const sha256 = (path) => crypto.createHash('sha256').update(read(path)).digest('hex')
const gitBlobSha = (path) => execFileSync('git', ['hash-object', path], { encoding:'utf8' }).trim()
const assert = (value, message) => { if (!value) throw new Error(message) }
const verifyBinding = (value, label) => {
  assert(value?.path && fs.existsSync(value.path), `${label} path missing`)
  assert(value.gitBlobSha === gitBlobSha(value.path), `${label} Git blob drift: ${value.path}`)
  assert(value.sha256 === sha256(value.path), `${label} SHA256 drift: ${value.path}`)
}

for (const path of [independentPath, presealReportPath, lockPath, candidateLockPath]) assert(fs.existsSync(path), `independent lock verification input missing: ${path}`)
const independent = readJson(independentPath)
const report = readJson(presealReportPath)
const lock = readJson(lockPath)
const candidateLock = readJson(candidateLockPath)

assert(lock.version === '0.13-candidate-v0.4-independent-lock-v0.1', 'independent lock version mismatch')
assert(lock.status === 'sealed_before_first_post_lock_independent_encoder_scoring', 'independent lock status mismatch')
assert(lock.scope === 'fresh_post_lock_candidate_v04_independent_evaluation', 'independent lock scope mismatch')
verifyBinding(lock.candidateLock, 'lock.candidateLock')
verifyBinding(lock.independentContract, 'lock.independentContract')
verifyBinding(lock.independentArtifact, 'lock.independentArtifact')
verifyBinding(lock.presealReport, 'lock.presealReport')
for (const [path, binding] of Object.entries(lock.generationAndPresealScripts || {})) {
  assert(path === binding.path, `script binding key/path mismatch: ${path}`)
  verifyBinding(binding, `lock.generationAndPresealScripts.${path}`)
}
assert(Object.keys(lock.generationAndPresealScripts || {}).length >= 6, 'independent lock script bindings incomplete')

assert(lock.independentArtifact.sha256 === '193aa0c86eac0945844a2675571522a407d60cfe8d1e7f24a1cd47c374c533e8', 'independent artifact reference PASS SHA drift')
assert(lock.independentArtifact.gitBlobSha === '2c4b7c8f5398210fdf48f1d085cda4b9b7c00774', 'independent artifact reference PASS blob drift')
assert(lock.presealReport.sha256 === '24e4a42c1ec2897bc2a8a789e6c7d4a448d27331befbacd89e694927c8a2388e', 'preseal report reference PASS SHA drift')
assert(lock.presealReport.gitBlobSha === '1c97f1b11394c1698f5b5fba8cdb3503eba17a47', 'preseal report reference PASS blob drift')
assert(lock.candidateLock.sha256 === '6f4d94209a781ffc650b6b3046143655756c6d1ba58a737fc5a559595a214126', 'Candidate lock SHA drift')
assert(lock.candidateLock.gitBlobSha === '57286439b7c370b2390d97e06d7664a57d34d520', 'Candidate lock blob drift')

assert(independent.rows?.length === 198, 'sealed independent rows !=198')
assert(independent.counts?.known === 132 && independent.counts?.nonRoute === 66, 'sealed independent known/nonroute counts drift')
for (const [key, expected] of Object.entries({strong_arbitration:44,support_arbitration:44,fallback_head:44,outside_current_22:22,route_unresolved:22,near_domain_not_current_route:22})) {
  assert(independent.counts?.[key] === expected, `sealed independent ${key} count drift`)
}
assert(Object.values(independent.fallbackAll22Coverage || {}).length === 22 && Object.values(independent.fallbackAll22Coverage).every((value) => value === 2), 'sealed independent fallback all22 coverage drift')
assert(independent.encoderScoringObserved === false && independent.modelProbabilityObserved === false, 'independent scored before seal')

assert(report.status === 'PASS', 'sealed preseal report not PASS')
assert(report.structural?.pass === true && report.structural?.failureCount === 0, 'sealed structural preseal failed')
assert(report.freshness?.pass === true, 'sealed freshness preseal failed')
assert(report.freshness?.historicalRejectedRowCount === 0 && report.freshness?.historicalRejectionCount === 0, 'sealed freshness has historical rejects')
assert(report.freshness?.internalRejectedRowCount === 0 && report.freshness?.internalRejectedPairCount === 0, 'sealed freshness has internal rejects')

assert(lock.referencePassingPresealRun?.runId === 34011312636 && lock.referencePassingPresealRun?.jobId === 101427536553, 'reference passing preseal run drift')
assert(lock.referencePassingPresealRun?.triggerCommit === '1aa5c3fcbd12d174714e6c3181c84ef0884d1492', 'reference passing preseal trigger drift')
assert(lock.population?.total === 198 && lock.population?.known === 132 && lock.population?.nonRoute === 66, 'lock population drift')
assert(lock.population?.fallbackAll22ExactlyTwoPerRoute === true, 'lock all22 fallback coverage invariant missing')
assert(lock.execution?.canonicalTextsPerEncoderCall === 1, 'independent execution not single-text')
assert(lock.execution?.encoderModelId === 'Xenova/bge-small-zh-v1.5', 'independent encoder drift')
assert(lock.execution?.encoderRevision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'independent encoder revision drift')
assert(lock.execution?.transformersJsVersion === '4.2.0' && lock.execution?.dtype === 'q8' && lock.execution?.vectorSize === 512 && lock.execution?.pooling === 'mean' && lock.execution?.normalize === true, 'independent representation contract drift')

for (const [key, expected] of Object.entries({
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
})) assert(lock.invariants?.[key] === expected, `independent lock invariant drift: ${key}`)
assert(lock.lockGeneration?.encoderInstalled === false, 'encoder installed during independent lock generation')
assert(lock.lockGeneration?.encoderScoringPerformed === false, 'encoder scoring performed during independent lock generation')
assert(lock.lockGeneration?.modelProbabilityObserved === false, 'model probability observed during independent lock generation')
assert(lock.lockGeneration?.runtimeMutation === false, 'runtime mutation occurred during independent lock generation')
assert(lock.nextAction === 'freeze_independent_scoring_contract_then_score_exactly_198_sealed_rows', 'independent lock next action drift')

assert(candidateLock.status === 'locked_after_fresh_development_pass_before_independent_evaluation', 'Candidate v0.4 lock drift')
assert(candidateLock.invariants?.candidateMutationAllowed === false && candidateLock.invariants?.thresholdRetuningAllowed === false, 'Candidate lock mutation/retune invariant drift')

console.log('CANDIDATE_V04_INDEPENDENT_LOCK_VERIFIED', JSON.stringify({
  independentArtifactSha256:lock.independentArtifact.sha256,
  independentArtifactGitBlobSha:lock.independentArtifact.gitBlobSha,
  presealReportSha256:lock.presealReport.sha256,
  lockSha256:sha256(lockPath),
  lockGitBlobSha:gitBlobSha(lockPath),
  sealedBeforeFirstIndependentEncoderScoring:lock.invariants.sealedBeforeFirstIndependentEncoderScoring,
  nextAction:lock.nextAction
}, null, 2))
