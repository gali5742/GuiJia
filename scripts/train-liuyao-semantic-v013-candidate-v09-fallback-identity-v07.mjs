import {exists,assert,binding,write,git} from './liuyao-semantic-v013-candidate-v09-fallback-identity-v07-data-lib.mjs';
import {preflightTraining,embedder,modelApi,weightsLock,verifyWeights,trainingPath} from './liuyao-semantic-v013-candidate-v09-fallback-identity-v07-training-lib.mjs';
const {c,d}=preflightTraining();
assert([c.outputs.model,c.outputs.weightsLock,c.outputs.report,c.outputs.thresholdLock].every(p=>!exists(p)),'Immutable weights/scored state already exists; no retraining');
const encode=await embedder(c),vectors=[];
for(const row of d.training.rows){vectors.push(await encode(row.text));if(vectors.length%100===0||vectors.length===1698)console.log(JSON.stringify({trainingEncoderInvocations:vectors.length,total:1698}));}
const api=modelApi(c),heads={};
for(const route of c.routes){const h=api.trainHead(route,d.training.rows,vectors,c.algorithm.hyperparameters);heads[route]={...h,weights:Array.from(h.weights)};console.log(JSON.stringify({trainedFromZero:route}));}
const m={version:'0.13-candidate-v0.9-fallback-identity-v0.7-weights-v0.1',status:'weights_locked_before_any_fallback_calibration_scores',vectorSize:512,routeIds:c.routes,hyperparameters:c.algorithm.hyperparameters,heads,dataLockBinding:binding(c.outputs.dataLock),trainingExecutionBinding:binding(trainingPath),reachabilityLockBinding:binding(c.outputs.reachabilityLock),trainingCommit:git(['rev-parse','HEAD']),execution:{trainingEncoderInvocations:1698,canonicalTextsPerEncoderCall:1,calibrationProbabilitiesScored:false,calibrationVectorsUsedForTraining:false,legacyWeightsReused:false,zeroInitialization:true,all22IndependentHeads:true}};
write(c.outputs.model,m);write(c.outputs.weightsLock,weightsLock(c,m));verifyWeights();console.log('All22 weights locked before calibration scores.');
