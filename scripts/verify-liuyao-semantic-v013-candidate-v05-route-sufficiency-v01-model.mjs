import { preflight, verifyWeights, verifyCalibration } from './liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
if (process.argv.includes('--preflight')) {
  preflight();
  console.log('Sealed/committed data and successful GitHub data CI confirmed before encoder scoring.');
} else if (process.argv.includes('--weights')) {
  verifyWeights();
  console.log('Route Sufficiency weights lock verified; calibration threshold absent from weights artifact.');
} else {
  const report = verifyCalibration();
  console.log(JSON.stringify({status:report.status,threshold:report.result.selectedThreshold,metrics:report.result.selectedMetrics,encoderReplayPerformed:false},null,2));
}
