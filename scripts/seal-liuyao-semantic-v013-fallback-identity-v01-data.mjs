import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingFile = 'data/liuyao-semantic-fallback-identity-v0.1-training.json';
const calibrationFile = 'data/liuyao-semantic-fallback-identity-v0.1-calibration.json';
const designFile = 'data/liuyao-semantic-v013-candidate-v03-design-v0.1.json';
const lockFile = 'data/liuyao-semantic-fallback-identity-v0.1-data.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');

const training = readJson(trainingFile);
const calibration = readJson(calibrationFile);
if (training.status !== 'presealed_training_data' || training.sealed !== false) throw new Error('training data must be presealed');
if (calibration.status !== 'presealed_calibration_data' || calibration.sealed !== false) throw new Error('calibration data must be presealed');
training.status = 'sealed_training_data';
training.sealed = true;
calibration.status = 'sealed_calibration_data';
calibration.sealed = true;
writeJson(trainingFile, training);
writeJson(calibrationFile, calibration);

const lock = {
  version:'0.13-fallback-identity-v0.1-data-lock-v0.1',
  status:'locked',
  scope:'liuyao_semantic_fallback_identity_v0.1',
  trainingPath:trainingFile,
  trainingSha256:sha256(trainingFile),
  calibrationPath:calibrationFile,
  calibrationSha256:sha256(calibrationFile),
  designPath:designFile,
  designSha256:sha256(designFile),
  policy:{
    trainingAndCalibrationSealedBeforeFirstEncoderScoring:true,
    calibrationMayNotTrainModel:true,
    calibrationMayChooseOnlyOneGlobalFallbackThreshold:true,
    postSealWordingMutationAllowed:false
  }
};
writeJson(lockFile, lock);
console.log('Sealed Fallback Identity v0.1 training + calibration before model scoring.');
console.log(`- training SHA-256: ${lock.trainingSha256}`);
console.log(`- calibration SHA-256: ${lock.calibrationSha256}`);
