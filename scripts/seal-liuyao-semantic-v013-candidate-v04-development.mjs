import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'

const sourceDevelopment = 'tmp/liuyao-semantic-v013-candidate-v04-development.json'
const sourceFreshnessReport = 'tmp/liuyao-semantic-v013-candidate-v04-development-freshness-report.json'
const targetDevelopment = 'data/liuyao-semantic-v013-candidate-v04-development.json'
const targetFreshnessReport = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-report-v0.1.json'
const targetLock = 'data/liuyao-semantic-v013-candidate-v04-development.lock.json'

const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'
const protocolPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-contract-v0.2.1.json'
const verifierContractPath = 'data/liuyao-semantic-v013-candidate-v04-development-freshness-verifier-contract-v0.1.json'
const manifestPath = 'data/liuyao-semantic-v013-candidate-v04-development-exclusion-manifest-v0.2.json'
const failureEvidencePath = 'data/liuyao-semantic-v013-candidate-v04-development-preseal-freshness-failure-v0.1.json'
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-development.mjs'
const correctionPath = 'scripts/apply-liuyao-semantic-v013-candidate-v04-development-preseal-structural-correction.mjs'
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v04-development-freshness.mjs'

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}
function sha256(path) {
  return crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')
}
function gitBlobSha(path) {
  return execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()
}
function bind(path) {
  return { path, gitBlobSha: gitBlobSha(path), sha256: sha256(path) }
}

for (const path of [sourceDevelopment, sourceFreshnessReport, runtimeLockPath, protocolPath, verifierContractPath, manifestPath, failureEvidencePath, generatorPath, correctionPath, verifierPath]) {
  if (!fs.existsSync(path)) throw new Error(`required seal input missing: ${path}`)
}
for (const path of [targetDevelopment, targetFreshnessReport, targetLock]) {
  if (fs.existsSync(path)) throw new Error(`seal target already exists; post-seal mutation forbidden: ${path}`)
}

const development = readJson(sourceDevelopment)
const freshness = readJson(sourceFreshnessReport)
const runtime = readJson(runtimeLockPath)
if (!Array.isArray(development.rows) || development.rows.length !== 198) throw new Error('development row count must be 198')
if (development.encoderScoringObserved !== false || development.modelProbabilityObserved !== false) throw new Error('development artifact already observed scoring')
if (development.runtimeMutationAllowed !== false) throw new Error('development artifact permits runtime mutation')
if (freshness.status !== 'PASS' || freshness.results?.pass !== true) throw new Error('freshness report is not PASS')
if (freshness.results.historicalRejectedRowCount !== 0 || freshness.results.internalRejectedPairCount !== 0) throw new Error('freshness report contains rejects')
if (freshness.encoderOrModelScoringObserved !== false) throw new Error('freshness report indicates scoring')
if (runtime.status !== 'runtime_locked_before_fresh_development') throw new Error('runtime lock status mismatch')
if (runtime.nextAction !== 'build_and_seal_fresh_candidate_v04_development_before_first_development_encoder_scoring') throw new Error('runtime nextAction mismatch')

fs.copyFileSync(sourceDevelopment, targetDevelopment)
fs.copyFileSync(sourceFreshnessReport, targetFreshnessReport)

const lock = {
  version: '0.13-candidate-v0.4-development-lock-v0.1',
  status: 'locked_before_first_candidate_v04_development_encoder_scoring',
  artifact: {
    ...bind(targetDevelopment),
    rowCount: 198,
    expectedCounts: development.counts
  },
  freshnessReport: {
    ...bind(targetFreshnessReport),
    status: freshness.status,
    historicalRejectedRowCount: 0,
    internalRejectedPairCount: 0
  },
  runtimeLock: bind(runtimeLockPath),
  generationProtocol: bind(protocolPath),
  freshnessVerifierContract: bind(verifierContractPath),
  exclusionManifest: bind(manifestPath),
  presealFreshnessFailureEvidence: bind(failureEvidencePath),
  scripts: {
    generator: bind(generatorPath),
    presealCorrection: bind(correctionPath),
    freshnessVerifier: bind(verifierPath)
  },
  successfulPresealWorkflow: {
    runId: 33981152758,
    jobId: 101346483484,
    artifactId: 9973783227,
    artifactZipSha256: '397d6fc6c4ee4c9fdb00b95149c37b9896637f5a7c8a4abdb38be9814a435b32',
    triggerCommit: '0e6892c9795f119c8e8ac7abec153945ca0e7baf'
  },
  execution: {
    canonicalTextsPerEncoderCall: runtime.execution.canonicalTextsPerEncoderCall,
    encoderModelId: runtime.execution.encoderModelId,
    encoderRevision: runtime.execution.encoderRevision,
    vectorSize: runtime.execution.vectorSize,
    scopeHardVetoCutoff: runtime.execution.scopeHardVetoCutoff,
    routeabilityThreshold: runtime.execution.routeabilityThreshold,
    semanticActThreshold: runtime.execution.semanticActThreshold,
    fallbackGlobalThreshold: runtime.execution.fallbackGlobalThreshold
  },
  sealing: {
    structuralValidationPassed: true,
    postGenerationFreshnessPassed: true,
    sealedBeforeFirstDevelopmentEncoderScoring: true,
    postSealWordingMutationAllowed: false,
    developmentMayTrainModels: false,
    developmentMayCalibrateThresholds: false,
    developmentMayMutateRuntime: false
  },
  protectedEvaluationBoundary: {
    independentEvaluationReadBeforeSeal: false,
    sealedBlindEvaluationReadBeforeSeal: false,
    postBaselineNewThemeImported: false
  },
  nextAction: 'first_candidate_v04_integrated_development_scoring_with_frozen_runtime_only'
}

fs.writeFileSync(targetLock, `${JSON.stringify(lock, null, 2)}\n`)
console.log('CANDIDATE_V04_DEVELOPMENT_SEAL_SUMMARY', JSON.stringify({
  status: lock.status,
  artifactSha256: lock.artifact.sha256,
  artifactGitBlobSha: lock.artifact.gitBlobSha,
  freshnessReportSha256: lock.freshnessReport.sha256,
  freshnessReportGitBlobSha: lock.freshnessReport.gitBlobSha,
  rowCount: lock.artifact.rowCount,
  sealedBeforeFirstDevelopmentEncoderScoring: true,
  nextAction: lock.nextAction
}))
