import vm from 'node:vm';
import {read,json,binding,write,hashBytes,assert,exists,git,committed,checkedBinding,equal} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
const contractPath='data/liuyao-semantic-optimization-probe-v0.1-contract.json';
const c=json(contractPath);committed(contractPath);
assert(process.env.NODE_OPTIONS?.includes('liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'),'Read guard required');
assert(c.status==='frozen_before_one_train_only_optimizer_probe'&&c.maximumFits===1&&c.encoderInvocations===0&&!c.calibrationInputsAllowed&&!c.productionModelAllowed&&c.fixedDiagnosticThreshold===.5,'Probe scope drift');
for(const b of c.bindings){checkedBinding(b);committed(b.path);}
const train=json(c.trainingBinding.path),cache=json(c.cacheBinding.path),lock=json(c.cacheLockBinding.path),old=json(c.oldControlBinding.path);
assert(train.sealed&&train.rows.length===2028&&cache.rows.length===2028&&lock.vectorsSha256===hashBytes(JSON.stringify(cache.rows.map(r=>({id:r.id,vector:r.vector})))),'Sealed cache drift');
for(let n=0;n<2028;n++){const r=train.rows[n],v=cache.rows[n];assert(r.split==='training'&&r.id===v.id&&r.expectedRoute===v.expectedRoute&&hashBytes(r.text)===v.textSha256&&v.vector.length===512&&v.vector.every(Number.isFinite),'Train-only ordered membership drift');}
assert(equal(old.cacheBinding,c.cacheBinding)&&equal(old.trainingBinding,c.trainingBinding)&&old.heads.length===22,'Old control must use the exact same cache');
const ctx={Float32Array,Float64Array,Uint8Array};ctx.window=ctx;vm.createContext(ctx);
for(const p of [c.oldAlgorithmBinding.path,c.objectiveBinding.path,c.newAlgorithmBinding.path])vm.runInContext(read(p).toString(),ctx,{filename:p});
const api=ctx.GuiJia.liuyaoSemanticFallbackIdentityModelV03,obj=ctx.GuiJia.liuyaoSemanticFallbackObjectiveV01;
assert(equal(c.routes,api.routeIds)&&equal(c.hyperparameters,api.hyperparameters),'Frozen all22 optimizer drift');
const vectors=cache.rows.map(r=>r.vector),oldHeads=Object.fromEntries(old.heads.map(h=>[h.route,{...h,routeId:h.route}]));
function metrics(heads) {
 const result={split:'training_only_in_sample_not_calibration',known:{n:0,top1Correct:0,top1Ties:0,fixedThresholdCorrect:0,fixedThresholdAccepted:0,zeroAdmission:0,multipleAdmission:0},nonRoute:{n:0,fixedThresholdActivated:0,multipleAdmission:0},byRoute:Object.fromEntries(c.routes.map(r=>[r,{n:0,top1Correct:0,fixedThresholdCorrect:0}])),confusions:[],fixedDiagnosticThreshold:.5,thresholdSelected:false};
 const pairs=new Map();let margins=0;
 for(let n=0;n<train.rows.length;n++){
  const r=train.rows[n],scores=api.scoreAll({heads},vectors[n]),ranked=c.routes.map(route=>({route,score:scores[route]})).sort((a,b)=>b.score-a.score),admitted=c.routes.filter(route=>scores[route]>=.5);
  if(r.expectedRoute===null){result.nonRoute.n++;if(admitted.length===1)result.nonRoute.fixedThresholdActivated++;if(admitted.length>1)result.nonRoute.multipleAdmission++;continue;}
  const k=result.known,d=result.byRoute[r.expectedRoute];k.n++;d.n++;const tie=ranked[0].score===ranked[1].score,correct=!tie&&ranked[0].route===r.expectedRoute;
  if(tie)k.top1Ties++;if(correct){k.top1Correct++;d.top1Correct++;}else {const key=r.expectedRoute+'|'+(tie?'tied_maximum':ranked[0].route);pairs.set(key,(pairs.get(key)||0)+1);}
  if(!admitted.length)k.zeroAdmission++;else if(admitted.length>1)k.multipleAdmission++;else {k.fixedThresholdAccepted++;if(admitted[0]===r.expectedRoute){k.fixedThresholdCorrect++;d.fixedThresholdCorrect++;}}
  margins+=scores[r.expectedRoute]-Math.max(...c.routes.filter(x=>x!==r.expectedRoute).map(x=>scores[x]));
 }
 const k=result.known;k.top1Accuracy=k.top1Correct/k.n;k.fixedThresholdExactRecall=k.fixedThresholdCorrect/k.n;k.fixedThresholdAcceptedPrecision=k.fixedThresholdAccepted?k.fixedThresholdCorrect/k.fixedThresholdAccepted:null;k.meanTrueRouteProbabilityMargin=margins/k.n;
 result.nonRoute.fixedThresholdFalseActivation=result.nonRoute.fixedThresholdActivated/result.nonRoute.n;
 result.confusions=[...pairs].map(([pair,count])=>{const [expectedRoute,predictedRoute]=pair.split('|');return {expectedRoute,predictedRoute,count};}).sort((a,b)=>b.count-a.count||a.expectedRoute.localeCompare(b.expectedRoute)||a.predictedRoute.localeCompare(b.predictedRoute));
 assert(k.n===1553&&result.nonRoute.n===475,'Train-only score denominator drift');return result;
}
function headObjectives(heads) {
 return c.routes.map(route=>{const h=heads[route],state=obj.evaluate(obj.prepare(route,train.rows,vectors),Float64Array.from([...h.weights,h.bias]));assert(Math.abs(state.weightedTrainingLoss-h.weightedTrainingLoss)<=c.lossReplayTolerance,'Fixed-cache loss replay drift');return {routeId:route,weightedTrainingLoss:state.weightedTrainingLoss,dataLoss:state.dataLoss,regularizationLoss:state.regularizationLoss,gradientInfinityNorm:state.gradientInfinityNorm,stationary:state.gradientInfinityNorm<=1e-7};});
}
function comparison(heads) {
 const oldObjectives=headObjectives(oldHeads),newObjectives=headObjectives(heads),oldMetrics=metrics(oldHeads),newMetrics=metrics(heads),mean=xs=>xs.reduce((s,x)=>s+x.weightedTrainingLoss,0)/xs.length;
 const oldMeanLoss=mean(oldObjectives),newMeanLoss=mean(newObjectives),convergedHeads=newObjectives.filter(h=>h.stationary).length;
 return {oldObjectives,newObjectives,oldMetrics,newMetrics,summary:{headCount:22,convergedHeads,oldMeanWeightedTrainingLoss:oldMeanLoss,newMeanWeightedTrainingLoss:newMeanLoss,relativeMeanLossReduction:(oldMeanLoss-newMeanLoss)/oldMeanLoss,knownTop1AccuracyDelta:newMetrics.known.top1Accuracy-oldMetrics.known.top1Accuracy,fixedThresholdExactRecallDelta:newMetrics.known.fixedThresholdExactRecall-oldMetrics.known.fixedThresholdExactRecall,newMaximumGradientInfinityNorm:Math.max(...newObjectives.map(x=>x.gradientInfinityNorm)),status:convergedHeads===22?'one_probe_completed_stationary_training_heads':'one_probe_completed_nonconvergence_stop',nextAction:'stop_optimizer_experiments_here; assess_train_only_evidence_before_any_separately_versioned_validation',trainingOnly:true,formalThresholdSelected:false,componentPass:false,generalizationImprovementProven:false}};
}
if(process.argv.includes('--verify')) {
 const report=json(c.reportPath);if(!process.argv.includes('--uncommitted-output'))committed(c.reportPath);
 assert(equal(report.contractBinding,binding(contractPath))&&equal(report.cacheBinding,c.cacheBinding),'Probe report input drift');
 git(['merge-base','--is-ancestor',report.sourceCommit,'HEAD']);assert(git(['rev-parse',`${report.sourceCommit}:${contractPath}`])===binding(contractPath).gitBlobSha,'Contract must predate fit');for(const b of c.bindings)assert(git(['rev-parse',`${report.sourceCommit}:${b.path}`])===b.gitBlobSha,'Fit input source drift');
 assert(equal(report.comparison,comparison(report.heads)),'Loss, gradient and training discrimination replay drift');
 assert(equal(report.governance,c.governance),'Probe governance drift');console.log(JSON.stringify({status:'probe_replayed_without_refitting_or_encoder',summary:report.comparison.summary}));
} else {
 assert(!exists(c.reportPath),'One immutable probe only; no retry or sweep');const heads={};
 for(const route of c.routes){const h=api.trainHead(route,train.rows,vectors,c.hyperparameters);heads[route]={...h,weights:Array.from(h.weights)};console.log(JSON.stringify({route,converged:h.optimization.converged,iterations:h.optimization.iterations,gradientInfinityNorm:h.optimization.gradientInfinityNorm}));}
 const result=comparison(heads);write(c.reportPath,{version:'0.1-train-only-bounded-optimizer-probe',status:result.summary.status,contractBinding:binding(contractPath),cacheBinding:c.cacheBinding,sourceCommit:git(['rev-parse','HEAD']),runtime:{nodeVersion:process.version,platform:process.platform,architecture:process.arch},heads,comparison:result,governance:c.governance});console.log(JSON.stringify(result.summary));
}
