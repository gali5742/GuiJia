import {preflight,verifyWeights,verifyCalibration,modelApi,calibrate,metrics,thresholdLock,executionPath,git} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-lib.mjs';
import {binding,exists,assert,write} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-lib.mjs';
preflight();const {c,d,r,m}=verifyWeights({requireCommitted:true});
if(exists(c.outputs.report)){const old=verifyCalibration();console.log('Immutable calibration replayed; no rescoring.');if(old.status!=='calibration_passed')process.exitCode=2;}
else {
  assert(!exists(c.outputs.thresholdLock),'Partial threshold lock forbidden');
  const weightCommit=git(['rev-parse','HEAD']),api=modelApi(c);
  const rows=d.calibration.rows.map((src,i)=>({id:src.id,expectedRoute:src.expectedRoute,subtype:src.subtype,roleSafetyGroup:src.roleSafetyGroup||null,reachesFallback:r.rows[i].upstream.reachesFallback,probabilities:api.scoreAll(m,r.rows[i].vector)}));
  const result=calibrate(rows,c.calibration,c.routes);
  const report={version:'0.13-candidate-v0.6-fallback-identity-v0.4-calibration-report-v0.1',status:result.status,modelBinding:binding(c.outputs.model),weightsLockBinding:binding(c.outputs.weightsLock),dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),reachabilityLockBinding:binding(c.outputs.reachabilityLock),weightCommit,execution:{newEncoderInvocations:0,cachedUpstreamVectors:c.calibration.rows,weightsCommittedBeforeFallbackProbabilityScoring:true,rawCalibrationRowsRetained:c.calibration.rows,calibrationRowsUsedForTraining:0},rows,result,conditionalMetrics:result.selectedThreshold===null?null:metrics(rows.filter(x=>x.reachesFallback),result.selectedThreshold,c.routes),governance:{postHocRepair:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV04DevelopmentUsedForCalibration:false,candidateV05CalibrationUsedForTrainingOrCalibration:false},nextAction:result.selectedThreshold===null?'preserve_failed_attempt_stop_line_new_version_contract_and_seal_required':'owner_v06_phase_b_report_then_Selection_v06_and_integrated_runtime'};
  write(c.outputs.report,report);if(result.selectedThreshold!==null)write(c.outputs.thresholdLock,thresholdLock(c,report));verifyCalibration();
  console.log(JSON.stringify({status:result.status,selectedThreshold:result.selectedThreshold,selectedMetrics:result.selectedMetrics,feasibleRegimes:result.feasibleRegimes}));
  if(result.selectedThreshold===null)process.exitCode=2;
}
