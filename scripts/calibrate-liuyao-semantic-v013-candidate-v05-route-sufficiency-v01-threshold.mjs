import { preflight, verifyWeights, modelApi, embedder, calibrate, thresholdLock, verifyCalibration, executionPath } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
import { exists, assert, write, binding, equal } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const {c,corpora} = preflight();
const {model} = verifyWeights({requireCommitted:true});
if (exists(c.outputPolicy.calibrationReportPath)) {
  const report = verifyCalibration();
  console.log(`Existing immutable calibration report: ${report.status}; no scoring or retuning.`);
  if (report.status !== 'calibration_passed') process.exitCode = 1;
} else {
  assert(!exists(c.outputPolicy.thresholdLockPath), 'Partial threshold lock forbidden');
  const originalModelBinding = binding(c.outputPolicy.modelPath);
  const api = modelApi(c), embed = await embedder(c), rows = [];
  for (let i = 0; i < corpora.calibration.rows.length; i++) {
    const {id,text,label,domainFamily} = corpora.calibration.rows[i];
    const vector = await embed(text);
    rows.push({id,label,domainFamily,vector:Array.from(vector),probability:api.probability(model.model,vector)});
    if ((i+1)%10 === 0 || i+1 === corpora.calibration.rows.length) console.log(`calibration single-text encoder calls: ${i+1}/88`);
  }
  const result = calibrate(rows,c.calibrationBoundary,c.labels);
  assert(equal(originalModelBinding,binding(c.outputPolicy.modelPath)), 'Weights changed during calibration');
  const report = {
    version:'0.13-candidate-v0.5-route-sufficiency-v0.1-calibration-report-v0.1',status:result.status,
    modelBinding:originalModelBinding,weightsLockBinding:binding(c.outputPolicy.weightsLockPath),calibrationBinding:binding(c.outputPolicy.calibrationPath),executionContractBinding:binding(executionPath),
    gates:c.calibrationBoundary,
    execution:{calibrationEncoderInvocations:88,canonicalTextsPerEncoderCall:1,weightsFrozenBeforeCalibrationScoring:true,weightsCommittedBeforeCalibrationScoring:true,weightsTrainedOnCalibration:false},
    governance:{independentEvaluationRead:false,sealedBlindEvaluationRead:false,developmentUsedForThresholdSelection:false,postHocRepair:false},
    result,rows
  };
  write(c.outputPolicy.calibrationReportPath,report);
  if (result.status === 'calibration_passed') write(c.outputPolicy.thresholdLockPath,thresholdLock(c,report));
  verifyCalibration();
  console.log(JSON.stringify({status:result.status,threshold:result.selectedThreshold,metrics:result.selectedMetrics},null,2));
  if (result.status !== 'calibration_passed') process.exitCode = 1;
}
