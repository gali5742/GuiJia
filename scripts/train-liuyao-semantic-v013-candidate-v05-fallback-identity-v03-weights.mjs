import {preflight,verifyReachability,verifyWeights,modelApi,embedder,weightsLock,executionPath,git} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-execution-lib.mjs';
import {binding,exists,assert,write} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
preflight();const {c,d}=verifyReachability({requireCommitted:true});
if(exists(c.outputs.model)){verifyWeights({requireCommitted:true});console.log('Locked weights verified; no retraining.');}
else {
  assert(!exists(c.outputs.weightsLock)&&!exists(c.outputs.report)&&!exists(c.outputs.thresholdLock),'Refusing partial or scored-state retraining');
  const embed=await embedder(c),vectors=[];
  for(const row of d.training.rows){vectors.push(await embed(row.text));if(vectors.length%100===0||vectors.length===1214)console.log(`Training single-text encoded ${vectors.length}/1214`);}
  const api=modelApi(c),heads={};
  for(const route of c.routes){const h=api.trainHead(route,d.training.rows,vectors,c.algorithm.hyperparameters);heads[route]={...h,weights:Array.from(h.weights)};console.log(`Trained from zero: ${route}`);}
  const m={version:'0.13-candidate-v0.5-fallback-identity-v0.3-weights-v0.1',status:'weights_locked_before_fallback_threshold_scoring',vectorSize:512,routeIds:c.routes,hyperparameters:c.algorithm.hyperparameters,heads,dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),reachabilityLockBinding:binding(c.outputs.reachabilityLock),trainingCommit:git(['rev-parse','HEAD']),execution:{trainingEncoderInvocations:1214,canonicalTextsPerEncoderCall:1,calibrationProbabilitiesScored:false,calibrationVectorsUsedForTraining:false,legacyWeightsReused:false,zeroInitialization:true,all22IndependentHeads:true}};
  write(c.outputs.model,m);write(c.outputs.weightsLock,weightsLock(c,m));verifyWeights();console.log('All22 new weights locked; no threshold selected.');
}
