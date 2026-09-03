import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const writeJson=(relative,value)=>fs.writeFileSync(path.join(root,relative),`${JSON.stringify(value,null,2)}\n`,'utf8');
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha=(relative)=>{const b=read(relative);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const ratio=(n,d)=>d?n/d:0;

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-calibration-contract-v0.1.json';
const contract=readJson(contractPath);
assert(contract.status==='locked_before_first_v02_training_encoder_pass','Fallback Identity v0.2 training/calibration contract drift');
assert(contract.globalThresholdSearch?.runOnlyAfterModelWeightLock===true,'threshold calibration is not declared post-weight-lock only');
assert(contract.runtimeAdmissionContract?.candidateUniverse==='all_current_22_routes'&&contract.runtimeAdmissionContract?.scoreAll22Heads===true,'Fallback candidate universe is not all current 22 routes');
assert(contract.runtimeAdmissionContract?.oneGlobalThresholdOnly===true&&contract.runtimeAdmissionContract?.routeSpecificThresholdsForbidden===true,'global threshold policy drift');

const modelPath=contract.weightTrainingLifecycle.outputModelPath;
const modelLockPath=contract.weightTrainingLifecycle.outputModelLockPath;
const model=readJson(modelPath);
const modelLock=readJson(modelLockPath);
assert(model.status===contract.weightTrainingLifecycle.requiredModelStatus,'Fallback Identity v0.2 weights are not locked');
assert(modelLock.status===contract.weightTrainingLifecycle.requiredModelStatus,'Fallback Identity v0.2 model lock is not in weights-only state');
assert(modelLock.artifact===modelPath&&modelLock.artifactSha256===sha256(modelPath),'weights-only model artifact provenance mismatch');
assert(model.globalThreshold===null&&model.thresholdSelected===false&&model.calibrationProbabilitiesScored===false,'weights model was already calibrated');
assert(modelLock.globalThreshold===null&&modelLock.thresholdSelected===false&&modelLock.calibrationProbabilitiesScored===false,'weights lock was already calibrated');
assert(model.execution?.encoderCalls===contract.encoder.trainingEncoderCalls&&model.execution?.canonicalTextsPerEncoderCall===1,'weights model execution provenance drift');
assert(model.algorithm?.trainedFromScratch===true&&model.algorithm?.legacyV01WeightsReused===false,'weights model is not the locked from-scratch v0.2 model');

const manifestPath=contract.thresholdCalibrationMembership.manifestPath;
assert(gitBlobSha(manifestPath)===contract.thresholdCalibrationMembership.gitBlobSha,'threshold calibration membership git blob drift');
const manifest=readJson(manifestPath);
assert(manifest.status===contract.thresholdCalibrationMembership.status,'threshold calibration membership status drift');
assert(manifest.composition?.total===contract.thresholdCalibrationMembership.totalRows,'threshold calibration total count drift');
assert(manifest.composition?.known===contract.thresholdCalibrationMembership.knownRows,'threshold calibration known count drift');
assert(manifest.composition?.nonRoute===contract.thresholdCalibrationMembership.nonRouteRows,'threshold calibration non-route count drift');
assert(manifest.rows?.length===contract.thresholdCalibrationMembership.totalRows,'threshold calibration manifest rows missing');
assert(manifest.isolation?.normalizedTrainingOverlap===0&&manifest.isolation?.normalizedCalibrationDuplicates===0,'threshold calibration isolation drift');

assert(sha256(contract.encoder.executionContractPath)===contract.encoder.executionContractSha256,'encoder execution contract SHA256 drift');
assert(sha256(contract.algorithm.modulePath)===contract.algorithm.moduleSha256,'Fallback Identity probability module SHA256 drift');
const executionContract=readJson(contract.encoder.executionContractPath);
assert(executionContract.canonicalExecution?.textsPerEncoderCall===1,'encoder execution contract no longer requires single-text calls');
assert(contract.encoder.thresholdCalibrationEncoderCallsAfterWeightLock===manifest.rows.length,'threshold calibration encoder-call contract/count mismatch');

const routeIds=[...contract.algorithm.routeOrder];
assert(routeIds.length===22,'Fallback Identity route count drift');
assert(JSON.stringify(model.algorithm?.routeOrder)===JSON.stringify(routeIds),'weights model route order drift');
assert(Object.keys(model.heads||{}).length===routeIds.length,'weights model head count drift');
for(const routeId of routeIds){
  const head=model.heads?.[routeId];
  assert(head?.routeId===routeId&&Array.isArray(head.weights)&&head.weights.length===contract.encoder.vectorSize,`invalid locked head: ${routeId}`);
  assert(head.weights.every(Number.isFinite)&&Number.isFinite(head.bias),`non-finite locked head: ${routeId}`);
}

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number,Float32Array,Float64Array};
context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(read(contract.algorithm.modulePath).toString('utf8'),context,{filename:contract.algorithm.modulePath});
const identityModel=context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(identityModel?.probability,'Fallback Identity probability function unavailable');
assert(JSON.stringify([...identityModel.routeIds])===JSON.stringify(routeIds),'probability module route order drift');

const knownRows=manifest.rows.filter((row)=>row.expectedDisposition==='route_known');
const nonRouteRows=manifest.rows.filter((row)=>row.expectedDisposition==='non_route');
assert(knownRows.length===contract.thresholdCalibrationMembership.knownRows,'known calibration manifest count drift');
assert(nonRouteRows.length===contract.thresholdCalibrationMembership.nonRouteRows,'non-route calibration manifest count drift');
for(const routeId of routeIds){
  const count=knownRows.filter((row)=>row.expectedRoute===routeId).length;
  assert(count===contract.thresholdCalibrationMembership.byRoute[routeId],`calibration known route count drift: ${routeId}`);
}
for(const [subtype,count] of Object.entries(contract.thresholdCalibrationMembership.nonRouteBySubtype)){
  const actual=nonRouteRows.filter((row)=>row.subtype===subtype).length;
  assert(actual===count,`calibration non-route subtype count drift: ${subtype}`);
}

const canonicalQuestion=(value)=>String(value||'').trim();
for(const row of manifest.rows)assert(canonicalQuestion(row.text)===row.text,'calibration row is not trim-canonical');

env.allowLocalModels=false;
env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',contract.encoder.modelId,{
  dtype:contract.encoder.dtype,
  revision:contract.encoder.revision
});

let encoderCalls=0;
const scoredRows=[];
for(let index=0;index<manifest.rows.length;index+=1){
  const row=manifest.rows[index];
  const normalized=canonicalQuestion(row.text);
  // CRITICAL: exactly one locked calibration question per encoder invocation.
  const output=await extractor(normalized,{pooling:contract.encoder.pooling,normalize:contract.encoder.normalize});
  encoderCalls+=1;
  const dims=output?.dims||[];
  const hidden=dims[dims.length-1];
  assert(hidden===contract.encoder.vectorSize,`calibration embedding size ${hidden} != ${contract.encoder.vectorSize} at row ${index+1}`);
  const raw=output?.data;
  assert(raw&&raw.length>=contract.encoder.vectorSize,`calibration embedding data missing at row ${index+1}`);
  const vector=new Float32Array(contract.encoder.vectorSize);
  for(let dimension=0;dimension<contract.encoder.vectorSize;dimension+=1)vector[dimension]=Number(raw[dimension]);
  const probabilities={};
  for(const routeId of routeIds)probabilities[routeId]=identityModel.probability(model.heads[routeId],vector);
  scoredRows.push({
    id:row.id,
    expectedRoute:row.expectedRoute??null,
    expectedDisposition:row.expectedDisposition,
    subtype:row.subtype,
    source:row.source,
    probabilities
  });
  if((index+1)%25===0||index+1===manifest.rows.length)console.log(`Fallback Identity v0.2 threshold calibration embeddings ${index+1}/${manifest.rows.length}`);
}
assert(encoderCalls===contract.encoder.thresholdCalibrationEncoderCallsAfterWeightLock,`calibration encoder calls ${encoderCalls} != ${contract.encoder.thresholdCalibrationEncoderCallsAfterWeightLock}`);

const observed=[...new Set(scoredRows.flatMap((row)=>routeIds.map((routeId)=>row.probabilities[routeId])))].sort((a,b)=>a-b);
const thresholdSet=new Set([0,0.5,1]);
for(const value of observed)thresholdSet.add(value);
for(let index=0;index+1<observed.length;index+=1)thresholdSet.add((observed[index]+observed[index+1])/2);
const thresholdCandidates=[...thresholdSet].filter((value)=>Number.isFinite(value)&&value>=0&&value<=1).sort((a,b)=>a-b);

const expectedNonRouteSubtypes=Object.keys(contract.thresholdCalibrationMembership.nonRouteBySubtype);
const evaluateThreshold=(threshold)=>{
  const decisions=scoredRows.map((row)=>{
    const admitted=routeIds.filter((routeId)=>row.probabilities[routeId]>=threshold);
    return {...row,admitted,uniqueRoute:admitted.length===1?admitted[0]:null};
  });
  const known=decisions.filter((row)=>row.expectedDisposition==='route_known');
  const nonRoute=decisions.filter((row)=>row.expectedDisposition==='non_route');
  const acceptedKnown=known.filter((row)=>row.admitted.length===1);
  const exactKnown=known.filter((row)=>row.admitted.length===1&&row.uniqueRoute===row.expectedRoute);
  const falseActivatedNonRoute=nonRoute.filter((row)=>row.admitted.length===1);
  const byNonRouteSubtype={};
  for(const subtype of expectedNonRouteSubtypes){
    const subset=nonRoute.filter((row)=>row.subtype===subtype);
    byNonRouteSubtype[subtype]={
      n:subset.length,
      estimable:subset.length>0,
      falseRouteActivations:subset.filter((row)=>row.admitted.length===1).length,
      falseRouteActivation:subset.length?ratio(subset.filter((row)=>row.admitted.length===1).length,subset.length):null,
      zeroAdmissions:subset.filter((row)=>row.admitted.length===0).length,
      multipleAdmissions:subset.filter((row)=>row.admitted.length>=2).length
    };
  }
  const observedSubtypeRates=Object.values(byNonRouteSubtype).filter((row)=>row.n>0).map((row)=>row.falseRouteActivation);
  const acceptedRouteAccuracy=ratio(exactKnown.length,acceptedKnown.length);
  const overallNonRouteFalseActivation=ratio(falseActivatedNonRoute.length,nonRoute.length);
  const maxObservedSubtypeFalseActivation=observedSubtypeRates.length?Math.max(...observedSubtypeRates):0;
  const checks={
    acceptedRouteAccuracy:acceptedRouteAccuracy>=contract.globalThresholdSearch.frozenFeasibilityConstraints.minimumAcceptedRouteAccuracy,
    overallNonRouteFalseActivation:overallNonRouteFalseActivation<=contract.globalThresholdSearch.frozenFeasibilityConstraints.maximumOverallNonRouteFalseActivation,
    observedSubtypeFalseActivation:Object.values(byNonRouteSubtype).filter((row)=>row.n>0).every((row)=>row.falseRouteActivation<=contract.globalThresholdSearch.frozenFeasibilityConstraints.maximumObservedSubtypeFalseActivation)
  };
  return {
    threshold,
    knownRetention:ratio(acceptedKnown.length,known.length),
    knownExactRoute:ratio(exactKnown.length,known.length),
    acceptedRouteAccuracy,
    acceptedKnown:acceptedKnown.length,
    exactKnown:exactKnown.length,
    wrongUniqueKnown:acceptedKnown.length-exactKnown.length,
    knownZeroAdmissions:known.filter((row)=>row.admitted.length===0).length,
    knownMultipleAdmissions:known.filter((row)=>row.admitted.length>=2).length,
    overallNonRouteFalseActivation,
    nonRouteFalseActivations:falseActivatedNonRoute.length,
    nonRouteZeroAdmissions:nonRoute.filter((row)=>row.admitted.length===0).length,
    nonRouteMultipleAdmissions:nonRoute.filter((row)=>row.admitted.length>=2).length,
    maxObservedSubtypeFalseActivation,
    byNonRouteSubtype,
    checks,
    feasible:Object.values(checks).every(Boolean),
    decisions
  };
};

const attempts=thresholdCandidates.map(evaluateThreshold);
const feasible=attempts.filter((attempt)=>attempt.feasible);
const compareFeasible=(a,b)=>{
  if(a.knownRetention!==b.knownRetention)return b.knownRetention-a.knownRetention;
  if(a.overallNonRouteFalseActivation!==b.overallNonRouteFalseActivation)return a.overallNonRouteFalseActivation-b.overallNonRouteFalseActivation;
  if(a.maxObservedSubtypeFalseActivation!==b.maxObservedSubtypeFalseActivation)return a.maxObservedSubtypeFalseActivation-b.maxObservedSubtypeFalseActivation;
  return b.threshold-a.threshold;
};
feasible.sort(compareFeasible);
const selected=feasible[0]||null;

const summarizeAttempt=(attempt)=>({
  threshold:attempt.threshold,
  knownRetention:attempt.knownRetention,
  knownExactRoute:attempt.knownExactRoute,
  acceptedRouteAccuracy:attempt.acceptedRouteAccuracy,
  acceptedKnown:attempt.acceptedKnown,
  exactKnown:attempt.exactKnown,
  wrongUniqueKnown:attempt.wrongUniqueKnown,
  knownZeroAdmissions:attempt.knownZeroAdmissions,
  knownMultipleAdmissions:attempt.knownMultipleAdmissions,
  overallNonRouteFalseActivation:attempt.overallNonRouteFalseActivation,
  nonRouteFalseActivations:attempt.nonRouteFalseActivations,
  nonRouteZeroAdmissions:attempt.nonRouteZeroAdmissions,
  nonRouteMultipleAdmissions:attempt.nonRouteMultipleAdmissions,
  maxObservedSubtypeFalseActivation:attempt.maxObservedSubtypeFalseActivation,
  byNonRouteSubtype:attempt.byNonRouteSubtype,
  checks:attempt.checks,
  feasible:attempt.feasible
});

const byRouteAtSelected={};
if(selected){
  for(const routeId of routeIds){
    const subset=selected.decisions.filter((row)=>row.expectedDisposition==='route_known'&&row.expectedRoute===routeId);
    byRouteAtSelected[routeId]={
      n:subset.length,
      exactUnique:subset.filter((row)=>row.admitted.length===1&&row.uniqueRoute===routeId).length,
      wrongUnique:subset.filter((row)=>row.admitted.length===1&&row.uniqueRoute!==routeId).length,
      zeroAdmissions:subset.filter((row)=>row.admitted.length===0).length,
      multipleAdmissions:subset.filter((row)=>row.admitted.length>=2).length
    };
  }
}

const diagnosticAttempts=[...attempts].sort((a,b)=>{
  const failedA=Object.values(a.checks).filter((value)=>!value).length;
  const failedB=Object.values(b.checks).filter((value)=>!value).length;
  if(failedA!==failedB)return failedA-failedB;
  if(a.acceptedRouteAccuracy!==b.acceptedRouteAccuracy)return b.acceptedRouteAccuracy-a.acceptedRouteAccuracy;
  if(a.overallNonRouteFalseActivation!==b.overallNonRouteFalseActivation)return a.overallNonRouteFalseActivation-b.overallNonRouteFalseActivation;
  if(a.maxObservedSubtypeFalseActivation!==b.maxObservedSubtypeFalseActivation)return a.maxObservedSubtypeFalseActivation-b.maxObservedSubtypeFalseActivation;
  if(a.knownRetention!==b.knownRetention)return b.knownRetention-a.knownRetention;
  return b.threshold-a.threshold;
}).slice(0,20).map(summarizeAttempt);

const reportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-threshold-calibration-report-v0.1.json';
const thresholdLockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-threshold.lock.json';
const selectedSummary=selected?summarizeAttempt(selected):null;
const report={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-threshold-calibration-report-v0.1',
  status:selected?'feasible_global_threshold_selected':'no_feasible_global_threshold',
  scope:contract.scope,
  immutableInputs:{
    trainingCalibrationContract:{path:contractPath,sha256:sha256(contractPath)},
    weightsModel:{path:modelPath,sha256:sha256(modelPath)},
    weightsLock:{path:modelLockPath,sha256:sha256(modelLockPath),status:modelLock.status},
    calibrationMembership:{path:manifestPath,gitBlobSha:gitBlobSha(manifestPath)},
    encoderExecutionContract:{path:contract.encoder.executionContractPath,sha256:sha256(contract.encoder.executionContractPath)},
    probabilityModule:{path:contract.algorithm.modulePath,sha256:sha256(contract.algorithm.modulePath)}
  },
  policy:{
    weightsRetrained:false,
    weightsMutated:false,
    calibrationMayTrainWeights:false,
    scoreAll22Heads:true,
    routerCandidateRestrictionUsed:false,
    routeSpecificThresholdsUsed:false,
    oneGlobalThresholdOnly:true,
    zeroOrMultipleAdmissionAbstains:true,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false
  },
  execution:{
    rows:scoredRows.length,
    known:knownRows.length,
    nonRoute:nonRouteRows.length,
    canonicalTextsPerEncoderCall:1,
    encoderCalls,
    headScoresPerRow:routeIds.length,
    totalHeadProbabilities:scoredRows.length*routeIds.length
  },
  thresholdSearch:{
    observedDistinctProbabilities:observed.length,
    thresholdCandidatesTested:attempts.length,
    candidateConstruction:contract.globalThresholdSearch.candidateConstruction,
    feasibilityConstraints:contract.globalThresholdSearch.frozenFeasibilityConstraints,
    selectionObjective:contract.globalThresholdSearch.selectionObjectiveAmongFeasibleThresholds,
    feasibleThresholds:feasible.length
  },
  selected:selectedSummary,
  byRouteAtSelected,
  diagnosticTop20:diagnosticAttempts,
  statisticalCaveat:{
    conditionalNonRouteN:contract.smallSampleAndResidualRisk.conditionalNonRouteN,
    outsideCurrent22FallbackN:contract.smallSampleAndResidualRisk.outsideCurrent22FallbackN,
    outsideCurrent22ThresholdSafety:contract.smallSampleAndResidualRisk.outsideCurrent22ThresholdSafety,
    oneFalseActivationRate:1/contract.thresholdCalibrationMembership.nonRouteRows
  },
  rows:scoredRows
};
writeJson(reportPath,report);

if(selected){
  const thresholdLock={
    version:'0.13-candidate-v0.4-fallback-identity-v0.2-threshold-lock-v0.1',
    status:'global_threshold_locked_after_weights',
    scope:contract.scope,
    weightsModel:{path:modelPath,sha256:sha256(modelPath)},
    weightsLock:{path:modelLockPath,sha256:sha256(modelLockPath),status:modelLock.status},
    calibrationReport:{path:reportPath,sha256:sha256(reportPath)},
    calibrationMembership:{path:manifestPath,gitBlobSha:gitBlobSha(manifestPath),rows:manifest.rows.length},
    routeCount:routeIds.length,
    vectorSize:contract.encoder.vectorSize,
    canonicalTextsPerEncoderCall:1,
    calibrationEncoderCalls:encoderCalls,
    scoreAll22Heads:true,
    routeSpecificThresholds:false,
    globalThreshold:selected.threshold,
    thresholdSelected:true,
    selectedMetrics:selectedSummary,
    outsideCurrent22FallbackN:contract.smallSampleAndResidualRisk.outsideCurrent22FallbackN,
    outsideCurrent22ThresholdSafety:contract.smallSampleAndResidualRisk.outsideCurrent22ThresholdSafety,
    nextAction:'implement_and_freeze_fallback_identity_v02_all22_runtime_then_build_fresh_candidate_v04_development'
  };
  writeJson(thresholdLockPath,thresholdLock);
}else if(fs.existsSync(path.join(root,thresholdLockPath))){
  fs.unlinkSync(path.join(root,thresholdLockPath));
}

console.log('Fallback Identity v0.2 locked threshold calibration complete.');
console.log(JSON.stringify({status:report.status,encoderCalls,headScoresPerRow:routeIds.length,thresholdCandidatesTested:attempts.length,feasibleThresholds:feasible.length,selected:selectedSummary},null,2));
