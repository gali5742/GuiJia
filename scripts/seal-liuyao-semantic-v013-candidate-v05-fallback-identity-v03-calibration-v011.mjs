import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'))
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`)
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex')

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011-data-contract-v0.1.json'
const methodologyPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-methodology-v0.1.json'
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.json'
const lockPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v0.1.1.lock.json'
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011.mjs'
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011-preseal.mjs'
const sealerPath = 'scripts/seal-liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-v011.mjs'

if (fs.existsSync(path.join(root, lockPath))) throw new Error('calibration v0.1.1 lock already exists')
const contract = readJson(contractPath)
const calibration = readJson(calibrationPath)
if (contract.status !== 'frozen_before_calibration_v011_generation_or_encoder_scoring') throw new Error('replacement contract not frozen')
if (calibration.status !== 'presealed_fallback_identity_v03_calibration_v011' || calibration.sealed !== false) throw new Error('calibration v0.1.1 not presealed')
if (calibration.rows?.length !== 880) throw new Error('calibration v0.1.1 row count drift')
if (sha256(contract.carriedTraining.path) !== contract.carriedTraining.sha256) throw new Error('carried training drift')

calibration.status = 'sealed_fallback_identity_v03_calibration_v011'
calibration.sealed = true
calibration.sealPolicy = {
  immutableAfterSeal: true,
  encoderScoringObservedBeforeSeal: false,
  trainingEligible: false,
  thresholdSelectionEligibleOnlyAfterPostSealReachabilityPass: true,
  developmentEligible: false,
  supersededCalibrationV01MutationAllowed: false
}
writeJson(calibrationPath, calibration)

writeJson(lockPath, {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-v0.1.1-lock-v0.1',
  status: 'locked_before_first_calibration_v011_encoder_scoring',
  calibrationPath,
  calibrationSha256: sha256(calibrationPath),
  calibrationRows: 880,
  replacementContractPath: contractPath,
  replacementContractSha256: sha256(contractPath),
  methodologyPath,
  methodologySha256: sha256(methodologyPath),
  carriedTrainingPath: contract.carriedTraining.path,
  carriedTrainingSha256: contract.carriedTraining.sha256,
  carriedTrainingRows: contract.carriedTraining.rows,
  carriedTrainingRegenerated: false,
  generatorPath,
  generatorSha256: sha256(generatorPath),
  verifierPath,
  verifierSha256: sha256(verifierPath),
  sealerPath,
  sealerSha256: sha256(sealerPath),
  encoderScoringObserved: false,
  fallbackWeightsTrained: false,
  fallbackProbabilitiesObserved: false,
  globalThresholdSelected: false,
  failedCalibrationV01RowsUsedForGeneration: false,
  officialV04IndependentRowsUsed: false,
  sealedBlindEvaluationRead: false,
  nextAction: 'freeze_calibration_v011_postseal_reachability_contract_before_any_encoder_scoring_or_fallback_v03_weight_fit'
})
console.log('Candidate v0.5 Fallback Identity v0.3 calibration v0.1.1 sealed before encoder scoring.')
console.log(`- calibration sha256: ${sha256(calibrationPath)}`)
console.log(`- lock: ${lockPath}`)
