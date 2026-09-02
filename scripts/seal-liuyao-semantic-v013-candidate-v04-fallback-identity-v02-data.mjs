import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json';
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json';
const schemaPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.2.json';
const failedSchemaV01Path = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';
const semanticActLockPath = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json';
const lockPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');

const schema = readJson(schemaPath);
const training = readJson(trainingPath);
const calibration = readJson(calibrationPath);
if (schema.status !== 'frozen_after_v01_preseal_path_contract_failure_before_encoder_scoring') throw new Error('Fallback v0.2 schema v0.2 not frozen');
if (schema.supersedes?.gitBlobSha !== '3bdbf13c25c72d3529f345b194af653bcfdcdf50') throw new Error('Fallback v0.2 failed schema v0.1 binding drift');
if (training.schema !== schemaPath || calibration.schema !== schemaPath) throw new Error('Fallback v0.2 corpora not rebound to schema v0.2');
if (training.sealed || calibration.sealed) {
  if (!(training.sealed && calibration.sealed && fs.existsSync(path.join(root, lockPath)))) throw new Error('partial Fallback v0.2 data seal detected');
  console.log('Candidate v0.4 Fallback Identity v0.2 data already sealed.');
  process.exit(0);
}
if (training.status !== 'presealed_training_augmentation' || calibration.status !== 'presealed_calibration_data') throw new Error('Fallback v0.2 data not in preseal state');
if (training.policy?.encoderScoringObserved !== false || calibration.policy?.encoderScoringObserved !== false) throw new Error('encoder scoring observed before Fallback v0.2 data seal');
const trainingFallbackKnown = training.rows.filter((row) => row.identityLabel === 'route_identity_positive' && row.deterministicPath === 'fallback_candidate').length;
const calibrationFallbackKnown = calibration.rows.filter((row) => row.identityLabel === 'route_identity_positive' && row.deterministicPath === 'fallback_candidate').length;
if (trainingFallbackKnown < schema.trainingPathContract.minimumFallbackStyleKnownTotal) throw new Error('training fallback-style coverage below schema minimum');
if (calibrationFallbackKnown < schema.calibrationPathContract.minimumFallbackStyleKnownTotal) throw new Error('calibration fallback-style coverage below schema minimum');

training.status = 'sealed_training_augmentation';
training.sealed = true;
training.sealedBeforeFirstEncoderScoring = true;
calibration.status = 'sealed_calibration_data';
calibration.sealed = true;
calibration.sealedBeforeFirstEncoderScoring = true;
writeJson(trainingPath, training);
writeJson(calibrationPath, calibration);

const lock = {
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-data-lock-v0.2',
  status:'locked',
  scope:'liuyao_semantic_fallback_identity_v0.2_data',
  trainingPath,
  trainingSha256:sha256(trainingPath),
  calibrationPath,
  calibrationSha256:sha256(calibrationPath),
  schemaPath,
  schemaSha256:sha256(schemaPath),
  supersededPresealSchemaPath:failedSchemaV01Path,
  supersededPresealSchemaSha256:sha256(failedSchemaV01Path),
  supersededPresealSchemaGitBlobSha:'3bdbf13c25c72d3529f345b194af653bcfdcdf50',
  dataContractPath:contractPath,
  dataContractSha256:sha256(contractPath),
  semanticActModelLockPath:semanticActLockPath,
  semanticActModelLockSha256:sha256(semanticActLockPath),
  trainingRows:training.rows.length,
  calibrationRows:calibration.rows.length,
  trainingFallbackStyleKnown:trainingFallbackKnown,
  calibrationFallbackStyleKnown:calibrationFallbackKnown,
  routeInventoryCount:22,
  encoderScoringBeforeSeal:false,
  fallbackThresholdSelectionBeforeSeal:false,
  routerTop2MembershipUsedAsGenerationFilter:false,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false,
  candidateV03FailureDiagnosticReadForWording:false,
  newThemeResearchImported:false,
  traditionalLiuYaoFeaturesUsed:false
};
writeJson(lockPath, lock);
console.log('Candidate v0.4 Fallback Identity v0.2 training/calibration corpora sealed under schema v0.2.');
console.log(`- training SHA256: ${lock.trainingSha256}`);
console.log(`- calibration SHA256: ${lock.calibrationSha256}`);
console.log(`- deterministic path mix: training fallback ${trainingFallbackKnown}/132; calibration fallback ${calibrationFallbackKnown}/88`);
