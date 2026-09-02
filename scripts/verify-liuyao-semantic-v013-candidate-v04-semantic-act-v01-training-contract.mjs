import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-training-contract.json';
const contract = readJson(contractPath);
assert(contract.status === 'locked_before_first_semantic_act_encoder_scoring', 'Semantic Act training contract not locked');
assert(contract.scope === 'liuyao_semantic_act_eligibility_v0.1', 'Semantic Act training scope drift');
assert(gitBlobSha(contract.candidateDesign.path) === contract.candidateDesign.gitBlobSha, 'Candidate v0.4 design blob drift');
assert(gitBlobSha(contract.sealedData.lockPath) === contract.sealedData.lockGitBlobSha, 'Semantic Act data lock blob drift');
assert(sha256(contract.sealedData.trainingPath) === contract.sealedData.trainingSha256, 'Semantic Act training data SHA drift');
assert(sha256(contract.sealedData.calibrationPath) === contract.sealedData.calibrationSha256, 'Semantic Act calibration data SHA drift');
assert(sha256('data/liuyao-semantic-v013-candidate-v04-semantic-act-data-schema-v0.1.json') === contract.sealedData.schemaSha256, 'Semantic Act schema SHA drift');
assert(sha256('data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json') === contract.sealedData.dataContractSha256, 'Candidate v0.4 data contract SHA drift');
assert(gitBlobSha(contract.encoderExecution.contractPath) === contract.encoderExecution.contractGitBlobSha, 'embedding execution contract blob drift');
assert(sha256(contract.encoderExecution.correctedFrozenDependenciesPath) === contract.encoderExecution.correctedFrozenDependenciesSha256, 'corrected frozen dependency SHA drift');
assert(gitBlobSha(contract.algorithm.modulePath) === contract.algorithm.moduleGitBlobSha, 'Semantic Act model algorithm blob drift');
assert(contract.encoderExecution.canonicalTextsPerEncoderCall === 1 && contract.encoderExecution.multiTextFeatureExtractionBatchForbidden === true, 'single-text encoder execution contract drift');
assert(contract.encoderExecution.transformersJsVersion === '4.2.0' && contract.encoderExecution.vectorSize === 512, 'Semantic Act encoder runtime drift');
assert(contract.algorithm.hyperparameters.epochs === 360, 'Semantic Act epochs drift');
assert(contract.algorithm.hyperparameters.learningRate === 0.42, 'Semantic Act learning rate drift');
assert(contract.algorithm.hyperparameters.l2 === 0.0015, 'Semantic Act L2 drift');
assert(contract.algorithm.hyperparameterSearchAllowed === false && contract.algorithm.encoderRetrainingAllowed === false, 'Semantic Act tuning boundary drift');
assert(contract.calibrationBoundary.calibrationMayTrainWeights !== true, 'calibration may not train weights');
assert(contract.calibrationBoundary.weightsFrozenBeforeCalibrationScoring === true, 'weights must freeze before calibration scoring');
assert(contract.calibrationBoundary.minimumEligibleRetention === 0.95, 'Semantic Act eligible retention gate drift');
assert(contract.calibrationBoundary.maximumIneligibleFalsePass === 0.05, 'Semantic Act false-pass gate drift');
assert(contract.calibrationBoundary.routeSpecificOrDomainSpecificThresholdsForbidden === true, 'per-domain Semantic Act thresholds forbidden');
assert(contract.protectedEvaluationBoundary.independentEvaluationRead === false, 'independent read forbidden');
assert(contract.protectedEvaluationBoundary.sealedBlindEvaluationRead === false, 'sealed blind read forbidden');
assert(contract.protectedEvaluationBoundary.CandidateV03FailureRowsRead === false, 'Candidate v0.3 failure rows read forbidden');
assert(contract.protectedEvaluationBoundary.developmentReadForThresholdSelection === false, 'development threshold selection forbidden');

const training = readJson(contract.sealedData.trainingPath);
const calibration = readJson(contract.sealedData.calibrationPath);
assert(training.sealed === true && training.status === 'sealed_training_data' && training.rows?.length === 132, 'sealed Semantic Act training corpus drift');
assert(calibration.sealed === true && calibration.status === 'sealed_calibration_data' && calibration.rows?.length === 66, 'sealed Semantic Act calibration corpus drift');
assert(training.policy?.encoderScoringPerformed === false && calibration.policy?.encoderScoringPerformed === false, 'encoder scoring marker drift before training');

console.log('Candidate v0.4 Semantic Act v0.1 training contract verified before encoder scoring.');
console.log('- algorithm: deterministic binary logistic, 360 epochs / lr 0.42 / L2 0.0015');
console.log('- encoder execution: one normalized question per invocation');
console.log('- calibration gates: eligible retention >= 0.95; ineligible false-pass <= 0.05');
console.log('- independent/blind/development threshold-selection reads: forbidden');
