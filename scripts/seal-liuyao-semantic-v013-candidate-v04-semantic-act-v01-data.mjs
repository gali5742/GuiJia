import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-training.json';
const calibrationFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json';
const lockFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-data.lock.json';
const schemaFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-data-schema-v0.1.json';
const contractFile = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const training = readJson(trainingFile);
const calibration = readJson(calibrationFile);
const schema = readJson(schemaFile);
const contract = readJson(contractFile);
assert(training.status === 'presealed_training_data' && training.sealed === false, 'Semantic Act training is not presealed');
assert(calibration.status === 'presealed_calibration_data' && calibration.sealed === false, 'Semantic Act calibration is not presealed');
assert(training.policy?.encoderScoringPerformed === false && calibration.policy?.encoderScoringPerformed === false, 'encoder scoring occurred before seal');
assert(training.policy?.independentEvaluationRead === false && calibration.policy?.independentEvaluationRead === false, 'independent evaluation read before seal');
assert(training.policy?.sealedBlindEvaluationRead === false && calibration.policy?.sealedBlindEvaluationRead === false, 'sealed blind evaluation read before seal');
assert(schema.sealing?.trainingAndCalibrationSealTogether === true && schema.sealing?.encoderScoringBeforeSeal === false, 'Semantic Act sealing policy drift');
assert(contract.corpora?.semanticActTraining?.freshRequired === true && contract.corpora?.semanticActCalibration?.freshRequired === true, 'v0.4 data contract Semantic Act freshness drift');

training.status = 'sealed_training_data';
training.sealed = true;
training.sealPolicy = {
  sealedTogetherWithCalibration:true,
  sealedBeforeFirstEncoderScoring:true,
  independentEvaluationReadBeforeSeal:false,
  sealedBlindEvaluationReadBeforeSeal:false,
  thresholdSelectedBeforeSeal:false
};
calibration.status = 'sealed_calibration_data';
calibration.sealed = true;
calibration.sealPolicy = {
  sealedTogetherWithTraining:true,
  sealedBeforeFirstEncoderScoring:true,
  independentEvaluationReadBeforeSeal:false,
  sealedBlindEvaluationReadBeforeSeal:false,
  thresholdSelectedBeforeSeal:false
};
writeJson(trainingFile, training);
writeJson(calibrationFile, calibration);

writeJson(lockFile, {
  version:'0.13-candidate-v0.4-semantic-act-data-lock-v0.1',
  status:'locked',
  scope:'liuyao_semantic_act_eligibility_v0.1_data',
  trainingPath:trainingFile,
  trainingSha256:sha256(trainingFile),
  calibrationPath:calibrationFile,
  calibrationSha256:sha256(calibrationFile),
  schemaPath:schemaFile,
  schemaSha256:sha256(schemaFile),
  contractPath:contractFile,
  contractSha256:sha256(contractFile),
  trainingRows:training.rows.length,
  calibrationRows:calibration.rows.length,
  routeInventoryCount:22,
  encoderScoringBeforeSeal:false,
  thresholdSelectionBeforeSeal:false,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false,
  candidateV03FailureRowsReadForGeneration:false,
  newThemeResearchImported:false,
  traditionalLiuYaoFeaturesUsed:false
});

console.log('Candidate v0.4 Semantic Act v0.1 training/calibration corpora sealed together.');
console.log(`- training SHA256: ${sha256(trainingFile)}`);
console.log(`- calibration SHA256: ${sha256(calibrationFile)}`);
