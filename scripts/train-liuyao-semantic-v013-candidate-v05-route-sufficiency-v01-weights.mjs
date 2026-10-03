import { preflight, modelApi, embedder, weightsLock, verifyWeights, executionPath } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
import { exists, assert, write, binding } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const {c,corpora} = preflight();
if (exists(c.outputPolicy.modelPath) || exists(c.outputPolicy.weightsLockPath)) {
  verifyWeights({requireCommitted:true});
  console.log('Committed weights already locked; no encoder scoring or retraining.');
} else {
  assert(!exists(c.outputPolicy.calibrationReportPath) && !exists(c.outputPolicy.thresholdLockPath), 'Calibration may not precede training');
  const api = modelApi(c);
  const rows = corpora.training.rows.map(({id,text,label}) => ({id,text,label}));
  assert(api.deduplicateRows(rows).length === 132, 'Training dedup must not change sealed membership');
  const embed = await embedder(c), vectors = [];
  for (let i = 0; i < rows.length; i++) {
    vectors.push(await embed(rows[i].text));
    if ((i+1)%10 === 0 || i+1 === rows.length) console.log(`training single-text encoder calls: ${i+1}/132`);
  }
  const trained = api.train(rows,vectors,c.algorithm.hyperparameters);
  const model = {
    version:'0.13-candidate-v0.5-route-sufficiency-v0.1-model-v0.1',status:'weights_locked_before_threshold_calibration',vectorSize:512,
    positiveLabel:c.labels[0],negativeLabel:c.labels[1],
    model:{weights:Array.from(trained.weights,Number),bias:Number(trained.bias)},
    executionContractBinding:binding(executionPath),dataLockBinding:binding(c.outputPolicy.dataLockPath),
    execution:{trainingEncoderInvocations:132,calibrationEncoderInvocations:0,canonicalTextsPerEncoderCall:1,encoder:c.encoderExecution,hyperparameters:c.algorithm.hyperparameters,trainFromScratch:true,independentEvaluationRead:false,sealedBlindEvaluationRead:false}
  };
  write(c.outputPolicy.modelPath,model);
  write(c.outputPolicy.weightsLockPath,weightsLock(c,model));
  verifyWeights();
  console.log('512 weights locked. Commit weights before any calibration scoring.');
}
