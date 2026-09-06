import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`)
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex')

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const trainingPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-training.json'
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data.lock.json'
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-v01.mjs'
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-preseal-v01.mjs'
const sealerPath = 'scripts/seal-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-v01.mjs'

if (fs.existsSync(path.join(root, lockPath))) throw new Error('v0.5 data lock already exists')
const contract = readJson(contractPath)
const methodology = readJson(methodologyPath)
const training = readJson(trainingPath)
const calibration = readJson(calibrationPath)

if (contract.status !== 'frozen_before_candidate_v05_data_generation_or_encoder_scoring') throw new Error('data contract not frozen')
if (methodology.status !== 'frozen_before_v05_training_data_generation_or_encoder_scoring') throw new Error('methodology not frozen')
if (training.status !== 'presealed_fallback_identity_v03_training' || training.sealed !== false) throw new Error('training is not presealed')
if (calibration.status !== 'presealed_fallback_identity_v03_calibration' || calibration.sealed !== false) throw new Error('calibration is not presealed')
if (training.rows?.length !== 264 || calibration.rows?.length !== 352) throw new Error('unexpected row counts')

training.status = 'sealed_fallback_identity_v03_training'
training.sealed = true
training.sealPolicy = {
  immutableAfterSeal: true,
  encoderScoringObservedBeforeSeal: false,
  trainingMayChangeAfterSeal: false,
  eligibleOnlyForFallbackV03WeightFit: true,
  calibrationEligible: false,
  developmentEligible: false
}
calibration.status = 'sealed_fallback_identity_v03_calibration'
calibration.sealed = true
calibration.sealPolicy = {
  immutableAfterSeal: true,
  encoderScoringObservedBeforeSeal: false,
  trainingEligible: false,
  thresholdSelectionEligibleOnlyAfterPostSealReachabilityPass: true,
  developmentEligible: false
}

writeJson(trainingPath, training)
writeJson(calibrationPath, calibration)

writeJson(lockPath, {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-data-lock-v0.1',
  status: 'locked_before_first_v05_encoder_scoring',
  scope: 'fresh_v05_fallback_identity_v03_training_and_calibration_bundle',
  trainingPath,
  trainingSha256: sha256(trainingPath),
  calibrationPath,
  calibrationSha256: sha256(calibrationPath),
  dataContractPath: contractPath,
  dataContractSha256: sha256(contractPath),
  methodologyPath,
  methodologySha256: sha256(methodologyPath),
  generatorPath,
  generatorSha256: sha256(generatorPath),
  verifierPath,
  verifierSha256: sha256(verifierPath),
  sealerPath,
  sealerSha256: sha256(sealerPath),
  rowCounts: { training: 264, calibration: 352, calibrationKnown: 176, calibrationNonRoute: 176 },
  encoderScoringObserved: false,
  fallbackWeightsTrained: false,
  fallbackProbabilitiesObserved: false,
  globalThresholdSelected: false,
  officialV04IndependentRowsUsed: false,
  sealedBlindEvaluationRead: false,
  nextAction: 'freeze_post_seal_calibration_reachability_contract_before_any_encoder_scoring_or_fallback_v03_training'
})

console.log('Candidate v0.5 Fallback Identity v0.3 training/calibration bundle sealed before encoder scoring.')
console.log(`- training sha256: ${sha256(trainingPath)}`)
console.log(`- calibration sha256: ${sha256(calibrationPath)}`)
console.log(`- lock: ${lockPath}`)
