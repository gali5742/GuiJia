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
const ratio=(n,d)=>d?n/d:0;

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-calibration-contract-v0.1.json';
const reportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-threshold-calibration-report-v0.1.json';
const thresholdLockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-threshold.lock.json';
const contract=readJson(contractPath);
const report=readJson(reportPath);
const modelPath=contract.weightTrainingLifecycle.outputModelPath;
const modelLockPath=contract.weightTrainingLifecycle.outputModelLockPath;
const model=readJson(modelPath);
const modelLock=readJson(modelLockPath);
const manifestPath=contract.thresholdCalibrationMembership.manifestPath;

assert(model.status===contract.weightTrainingLifecycle.requiredModelStatus&&modelLock.status===contract.weightTrainingLifecycle.requiredModelStatus,'weights-only lock not preserved');
assert(modelLock.artifactSha256===sha256(modelPath),'weights model hash changed during calibration');
assert(model.globalThreshold===null&&model.thresholdSelected===false&&model.calibrationProbabilitiesScored===false,'weights artifact was mutated by calibration');
assert(modelLock.globalThreshold===null&&modelLock.thresholdSelected===false&&modelLock.calibrationProbabilitiesScored===false,'weights lock was mutated by calibration');
assert(report.immutableInputs?.weightsModel?.sha256===sha256(modelPath),'report weights model provenance mismatch');
assert(report.immutableInputs?.weightsLock?.sha256===sha256(modelLockPath),'report weights lock provenance mismatch');
assert(report.immutableInputs?.calibrationMembership?.gitBlobSha===contract.thresholdCalibrationMembership.gitBlobSha,'report calibration membership provenance mismatch');
assert(gitBlobSha(manifestPath)===contract.thresholdCalibrationMembership.gitBlobSha,'calibration membership drift');
assert(report.execution?.rows===contract.thresholdCalibrationMembership.totalRows,'calibration report row count drift');
assert(report.execution?.known===contract.thresholdCalibrationMembership.knownRows,'calibration report known count drift');
assert(report.execution?.nonRoute===contract.thresholdCalibrationMembership.nonRouteRows,'calibration report non-route count drift');
assert(report.execution?.canonicalTextsPerEncoderCall===1,'calibration report does not attest single-text execution');
assert(report.execution?.encoderCalls===contract.encoder.thresholdCalibrationEncoderCallsAfterWeightLock,'calibration encoder-call count drift');
assert(report.execution?.headScoresPerRow===22&&report.execution?.totalHeadProbabilities===contract.thresholdCalibrationMembership.totalRows*22,'all-22 scoring count drift');
assert(report.policy?.weightsRetrained===false&&report.policy?.weightsMutated===false&&report.policy?.calibrationMayTrainWeights===false,'calibration report indicates weight mutation/training');
assert(report.policy?.scoreAll22Heads===true&&report.policy?.routerCandidateRestrictionUsed===false,'calibration did not use all-22 candidate universe');
assert(report.policy?.routeSpecificThresholdsUsed===false&&report.policy?.oneGlobalThresholdOnly===true,'calibration threshold policy drift');
assert(report.policy?.zeroOrMultipleAdmissionAbstains===true,'calibration runtime admission rule drift');

const routeIds=contract.algorithm.routeOrder;
assert(report.rows?.length===contract.thresholdCalibrationMembership.totalRows,'calibration probability rows missing');
const ids=new Set();
for(const row of report.rows){
  assert(row.id&&!ids.has(row.id),`duplicate calibration probability row id: ${row.id}`);
  ids.add(row.id);
  assert(Object.keys(row.probabilities||{}).length===routeIds.length,`row ${row.id} does not contain exactly 22 head probabilities`);
  for(const routeId of routeIds){
    const probability=row.probabilities?.[routeId];
    assert(Number.isFinite(probability)&&probability>=0&&probability<=1,`invalid probability ${row.id}/${routeId}`);
  }
}

const observed=[...new Set(report.rows.flatMap((row)=>routeIds.map((routeId)=>row.probabilities[routeId])))].sort((a,b)=>a-b);
const thresholdSet=new Set([0,0.5,1]);
for(const value of observed)thresholdSet.add(value);
for(let index=0;index+1<observed.length;index+=1)thresholdSet.add((observed[index]+observed[index+1])/2);
const thresholds=[...thresholdSet].filter((value)=>Number.isFinite(value)&&value>=0&&value<=1).sort((a,b)=>a-b);
assert(report.thresholdSearch?.observedDistinctProbabilities===observed.length,'observed probability count drift');
assert(report.thresholdSearch?.thresholdCandidatesTested===thresholds.length,'threshold candidate count drift');

const expectedSubtypes=Object.keys(contract.thresholdCalibrationMembership.nonRouteBySubtype);
const evaluate=(threshold)=>{
  const decisions=report.rows.map((row)=>{
    const admitted=routeIds.filter((routeId)=>row.probabilities[routeId]>=threshold);
    return {...row,admitted,uniqueRoute:admitted.length===1?admitted[0]:null};
  });
  const known=decisions.filter((row)=>row.expectedDisposition==='route_known');
  const nonRoute=decisions.filter((row)=>row.expectedDisposition==='non_route');
  const acceptedKnown=known.filter((row)=>row.admitted.length===1);
  const exactKnown=known.filter((row)=>row.admitted.length===1&&row.uniqueRoute===row.expectedRoute);
  const falseActivated=nonRoute.filter((row)=>row.admitted.length===1);
  const bySubtype={};
  for(const subtype of expectedSubtypes){
    const subset=nonRoute.filter((row)=>row.subtype===subtype);
    bySubtype[subtype]={n:subset.length,falseRouteActivation:subset.length?ratio(subset.filter((row)=>row.admitted.length===1).length,subset.length):null};
  }
  const observedRates=Object.values(bySubtype).filter((row)=>row.n>0).map((row)=>row.falseRouteActivation);
  const acceptedRouteAccuracy=ratio(exactKnown.length,acceptedKnown.length);
  const overallFalse=ratio(falseActivated.length,nonRoute.length);
  const maxSubtype=observedRates.length?Math.max(...observedRates):0;
  const checks={
    acceptedRouteAccuracy:acceptedRouteAccuracy>=contract.globalThresholdSearch.frozenFeasibilityConstraints.minimumAcceptedRouteAccuracy,
    overallNonRouteFalseActivation:overallFalse<=contract.globalThresholdSearch.frozenFeasibilityConstraints.maximumOverallNonRouteFalseActivation,
    observedSubtypeFalseActivation:Object.values(bySubtype).filter((row)=>row.n>0).every((row)=>row.falseRouteActivation<=contract.globalThresholdSearch.frozenFeasibilityConstraints.maximumObservedSubtypeFalseActivation)
  };
  return {threshold,knownRetention:ratio(acceptedKnown.length,known.length),knownExactRoute:ratio(exactKnown.length,known.length),acceptedRouteAccuracy,overallNonRouteFalseActivation:overallFalse,maxObservedSubtypeFalseActivation:maxSubtype,checks,feasible:Object.values(checks).every(Boolean)};
};

const attempts=thresholds.map(evaluate);
const feasible=attempts.filter((row)=>row.feasible);
feasible.sort((a,b)=>{
  if(a.knownRetention!==b.knownRetention)return b.knownRetention-a.knownRetention;
  if(a.overallNonRouteFalseActivation!==b.overallNonRouteFalseActivation)return a.overallNonRouteFalseActivation-b.overallNonRouteFalseActivation;
  if(a.maxObservedSubtypeFalseActivation!==b.maxObservedSubtypeFalseActivation)return a.maxObservedSubtypeFalseActivation-b.maxObservedSubtypeFalseActivation;
  return b.threshold-a.threshold;
});
const expectedSelected=feasible[0]||null;
assert(report.thresholdSearch?.feasibleThresholds===feasible.length,'feasible threshold count drift');

if(expectedSelected){
  assert(report.status==='feasible_global_threshold_selected','report status should be feasible_global_threshold_selected');
  assert(report.selected&&report.selected.threshold===expectedSelected.threshold,'selected threshold is not the frozen-objective optimum');
  assert(report.selected.knownRetention===expectedSelected.knownRetention,'selected known retention drift');
  assert(report.selected.knownExactRoute===expectedSelected.knownExactRoute,'selected known exact-route drift');
  assert(report.selected.acceptedRouteAccuracy===expectedSelected.acceptedRouteAccuracy,'selected accepted-route accuracy drift');
  assert(report.selected.overallNonRouteFalseActivation===expectedSelected.overallNonRouteFalseActivation,'selected non-route false activation drift');
  assert(report.selected.maxObservedSubtypeFalseActivation===expectedSelected.maxObservedSubtypeFalseActivation,'selected subtype false activation drift');
  assert(fs.existsSync(path.join(root,thresholdLockPath)),'feasible calibration missing threshold lock');
  const lock=readJson(thresholdLockPath);
  assert(lock.status==='global_threshold_locked_after_weights','threshold lock status drift');
  assert(lock.weightsModel?.sha256===sha256(modelPath),'threshold lock weights model provenance mismatch');
  assert(lock.weightsLock?.sha256===sha256(modelLockPath),'threshold lock weights lock provenance mismatch');
  assert(lock.calibrationReport?.sha256===sha256(reportPath),'threshold lock calibration report SHA mismatch');
  assert(lock.calibrationMembership?.gitBlobSha===contract.thresholdCalibrationMembership.gitBlobSha,'threshold lock calibration membership drift');
  assert(lock.routeCount===22&&lock.vectorSize===512,'threshold lock architecture drift');
  assert(lock.canonicalTextsPerEncoderCall===1&&lock.calibrationEncoderCalls===125,'threshold lock execution drift');
  assert(lock.scoreAll22Heads===true&&lock.routeSpecificThresholds===false,'threshold lock candidate/threshold policy drift');
  assert(lock.globalThreshold===expectedSelected.threshold&&lock.thresholdSelected===true,'threshold lock selected value drift');
}else{
  assert(report.status==='no_feasible_global_threshold','report status should be no_feasible_global_threshold');
  assert(report.selected===null,'no-feasible report unexpectedly contains selected threshold');
  assert(!fs.existsSync(path.join(root,thresholdLockPath)),'no-feasible calibration must not leave a threshold lock');
}

console.log('Fallback Identity v0.2 threshold calibration verification PASS.');
console.log(JSON.stringify({status:report.status,thresholdCandidatesTested:thresholds.length,feasibleThresholds:feasible.length,selected:expectedSelected},null,2));
