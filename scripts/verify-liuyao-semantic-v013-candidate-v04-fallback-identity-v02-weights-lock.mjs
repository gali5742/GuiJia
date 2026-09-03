import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha=(relative)=>{const b=read(relative);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-calibration-contract-v0.1.json';
const contract=readJson(contractPath);
const modelPath=contract.weightTrainingLifecycle.outputModelPath;
const lockPath=contract.weightTrainingLifecycle.outputModelLockPath;
assert(fs.existsSync(path.join(root,modelPath)),'Fallback Identity v0.2 model artifact missing');
assert(fs.existsSync(path.join(root,lockPath)),'Fallback Identity v0.2 model lock missing');
const model=readJson(modelPath);
const lock=readJson(lockPath);

assert(contract.status==='locked_before_first_v02_training_encoder_pass','training/calibration contract status drift');
assert(model.status===contract.weightTrainingLifecycle.requiredModelStatus,'model status is not weights_locked_before_threshold_calibration');
assert(lock.status===contract.weightTrainingLifecycle.requiredModelStatus,'model lock status is not weights_locked_before_threshold_calibration');
assert(lock.artifact===modelPath,'model lock artifact path drift');
assert(lock.artifactSha256===sha256(modelPath),'model lock artifact SHA256 mismatch');
assert(model.trainingContract?.path===contractPath&&model.trainingContract?.sha256===sha256(contractPath),'model training contract provenance mismatch');
assert(lock.trainingContract?.path===contractPath&&lock.trainingContract?.sha256===sha256(contractPath),'lock training contract provenance mismatch');
assert(model.trainingAssembly?.gitBlobSha===contract.trainingAssembly.gitBlobSha,'model training assembly provenance mismatch');
assert(lock.trainingAssembly?.gitBlobSha===contract.trainingAssembly.gitBlobSha,'lock training assembly provenance mismatch');
assert(gitBlobSha(contract.trainingAssembly.reportPath)===contract.trainingAssembly.gitBlobSha,'frozen training assembly report drift');
assert(model.encoder?.executionContractSha256===contract.encoder.executionContractSha256,'model encoder execution contract drift');
assert(lock.encoderExecutionContract?.sha256===contract.encoder.executionContractSha256,'lock encoder execution contract drift');
assert(model.algorithm?.moduleSha256===contract.algorithm.moduleSha256,'model algorithm module drift');
assert(lock.algorithm?.sha256===contract.algorithm.moduleSha256,'lock algorithm module drift');

assert(model.execution?.canonicalTextsPerEncoderCall===1,'model did not record canonical single-text execution');
assert(model.execution?.multiTextFeatureExtractionBatchUsed===false,'model reports multi-text feature extraction use');
assert(model.execution?.encoderCalls===contract.encoder.trainingEncoderCalls,'model training encoder-call count drift');
assert(model.execution?.rowsEmbedded===contract.trainingAssembly.deduplicatedRows,'model embedded-row count drift');
assert(lock.canonicalTextsPerEncoderCall===1,'lock canonical text count drift');
assert(lock.trainingEncoderCalls===contract.encoder.trainingEncoderCalls,'lock training encoder-call count drift');
assert(model.encoder?.inputNormalization==='String(text).trim()','model input normalization is not production-equivalent trim-only');

assert(model.training?.total===contract.trainingAssembly.deduplicatedRows,'model training total drift');
assert(model.training?.known===contract.trainingAssembly.knownRows,'model training known count drift');
assert(model.training?.nonRoute===contract.trainingAssembly.nonRouteRows,'model training non-route count drift');
assert(lock.trainingRows===contract.trainingAssembly.deduplicatedRows,'lock training total drift');
assert(lock.trainingKnown===contract.trainingAssembly.knownRows,'lock known count drift');
assert(lock.trainingNonRoute===contract.trainingAssembly.nonRouteRows,'lock non-route count drift');
assert(model.algorithm?.trainedFromScratch===true&&model.algorithm?.legacyV01WeightsReused===false,'model was not trained from scratch');
assert(lock.trainFromScratch===true&&lock.legacyV01WeightsReused===false,'lock does not attest from-scratch training');
assert(JSON.stringify(model.algorithm?.hyperparameters)===JSON.stringify(contract.algorithm.hyperparameters),'model hyperparameters drift');
assert(JSON.stringify(model.algorithm?.routeOrder)===JSON.stringify(contract.algorithm.routeOrder),'model route order drift');

for(const [field,expected] of Object.entries(contract.weightTrainingLifecycle.requiredModelFields)){
  assert(model[field]===expected,`model lifecycle field ${field} drift: ${model[field]} != ${expected}`);
  assert(lock[field]===expected,`lock lifecycle field ${field} drift: ${lock[field]} != ${expected}`);
}
assert(model.calibrationRowsEmbedded===false&&model.calibrationRowsRead===false,'model training touched calibration rows');
assert(lock.calibrationRowsEmbedded===false&&lock.calibrationRowsRead===false,'lock indicates calibration rows were touched');
assert(model.routerLoaded===false&&model.routerTopKRead===false,'Router was used during Fallback Identity weight training');
assert(model.traditionalLiuYaoFeaturesUsed===false,'traditional LiuYao features entered Fallback Identity weight training');

const routeIds=contract.algorithm.routeOrder;
assert(Object.keys(model.heads||{}).length===routeIds.length,'model head count drift');
for(const routeId of routeIds){
  const head=model.heads?.[routeId];
  assert(head?.routeId===routeId,`head route id drift: ${routeId}`);
  assert(Array.isArray(head.weights)&&head.weights.length===contract.encoder.vectorSize,`head weight size drift: ${routeId}`);
  assert(head.weights.every(Number.isFinite),`head contains non-finite weight: ${routeId}`);
  assert(Number.isFinite(head.bias),`head bias is non-finite: ${routeId}`);
  assert(head.positiveCount===contract.trainingAssembly.byRoute[routeId],`head positive count drift: ${routeId}`);
  assert(head.negativeCount===contract.trainingAssembly.deduplicatedRows-head.positiveCount,`head negative count drift: ${routeId}`);
  assert(model.training.byRoute?.[routeId]===contract.trainingAssembly.byRoute[routeId],`model route training count drift: ${routeId}`);
}

assert(model.globalThreshold===null&&lock.globalThreshold===null,'global threshold exists before threshold calibration');
assert(model.thresholdSelected===false&&lock.thresholdSelected===false,'threshold was selected before calibration');
assert(model.calibrationProbabilitiesScored===false&&lock.calibrationProbabilitiesScored===false,'calibration probabilities were scored before weight lock');
assert(lock.nextAction==='run_locked_125_row_all22_global_threshold_calibration','unexpected model-lock next action');

console.log('Fallback Identity v0.2 weights-only model lock verification PASS.');
console.log(JSON.stringify({status:model.status,modelSha256:sha256(modelPath),trainingRows:model.training.total,trainingEncoderCalls:model.execution.encoderCalls,routeCount:routeIds.length,globalThreshold:model.globalThreshold,thresholdSelected:model.thresholdSelected,calibrationProbabilitiesScored:model.calibrationProbabilitiesScored},null,2));
