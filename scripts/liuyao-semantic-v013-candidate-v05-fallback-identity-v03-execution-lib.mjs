import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {root,read,json,binding,hashBytes,equal,assert,exists,verify,prefix,checkedBinding,subtypes} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
import {embedder} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
export {embedder};
export const executionPath=`${prefix}-execution-contract-v0.1.json`;
export const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export const committed=p=>assert(git(['rev-parse',`HEAD:${p}`])===binding(p).gitBlobSha,`Uncommitted scoring input: ${p}`);
export function preflight({checkCI=true,requireCommitted=true}={}) {
  const data=verify({requireSeal:true}),e=json(executionPath);
  assert(e.status==='frozen_after_data_ci_success_before_phase_b_encoder_scoring','Execution freeze missing');
  for(const b of e.bindings){checkedBinding(b);if(requireCommitted)committed(b.path);}
  if(requireCommitted)committed(executionPath);
  git(['merge-base','--is-ancestor',e.dataSealCommit,'HEAD']);
  git(['merge-base','--is-ancestor',e.dataCI.headSha,e.dataSealCommit]);
  assert(git(['rev-parse',`${e.dataSealCommit}:${data.c.outputs.dataLock}`])===binding(data.c.outputs.dataLock).gitBlobSha,'Original sealed membership drift');
  if(checkCI) {
    const run=JSON.parse(execFileSync('gh',['api',`repos/gali5742/GuiJia/actions/runs/${e.dataCI.runId}`],{cwd:root,encoding:'utf8'}));
    assert(run.status==='completed'&&run.conclusion==='success'&&run.head_sha===e.dataCI.headSha&&run.path===e.dataCI.workflowPath,'Successful data CI not proven');
  }
  const enc=data.c.encoderExecution;
  assert(enc.modelId==='Xenova/bge-small-zh-v1.5'&&enc.revision==='75c43b069aac4d136ba6bc1122f995fedcfd2781'&&enc.transformersJsVersion==='4.2.0'&&enc.dtype==='q8'&&enc.pooling==='mean'&&enc.normalize===true,'Frozen encoder drift');
  return {...data,e};
}
export function modelApi(c) {
  const ctx={console,Math,JSON,Set,Map,Array,Object,Number,Float32Array,Float64Array};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  vm.runInContext(read(c.algorithm.path).toString('utf8'),ctx,{filename:c.algorithm.path});
  const api=ctx.GuiJia.liuyaoSemanticFallbackIdentityModelV01;
  assert(equal(api.routeIds,c.routes)&&equal(api.hyperparameters,c.algorithm.hyperparameters),'All22 mature algorithm drift');
  return api;
}
const sigmoid=x=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
export const binaryProbability=(head,v)=>{assert(head.weights.length===512&&v.length===512&&Number.isFinite(head.bias),'Binary model shape drift');let x=0;for(let i=0;i<512;i++)x+=head.weights[i]*v[i];return sigmoid(x+head.bias);};
export function upstreamApi(c) {
  const ctx={console,Math,JSON,Set,Map,Array,Object,Number};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
  for(const b of c.upstream.bindings.filter(b=>b.path.startsWith('js/')))vm.runInContext(read(b.path).toString('utf8'),ctx,{filename:b.path});
  const act=json('data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.json');
  const suff=json('data/liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-model.json');
  const suffLock=json('data/liuyao-semantic-v013-candidate-v05-route-sufficiency-v01-threshold.lock.json');
  const ra=json('data/liuyao-semantic-routeability-v0.2-execution-v0.1.json');
  const raLock=json('data/liuyao-semantic-routeability-v0.3-execution-v0.1.json');
  assert(suffLock.threshold===c.upstream.routeSufficiencyThreshold && raLock.calibration.threshold===c.upstream.routeabilityThreshold,'Frozen upstream threshold drift');
  return (row,vector)=>{
    assert(vector.length===512&&vector.every(Number.isFinite),'Invalid upstream vector');
    const semanticActProbability=binaryProbability(act.model,vector),sufficiencyProbability=binaryProbability(suff.model,vector),routeabilityProbability=binaryProbability(ra.model,vector);
    const semanticActEligible=semanticActProbability>=act.threshold,sufficiencyAccepted=sufficiencyProbability>=suffLock.threshold,routeabilityAccepted=routeabilityProbability>=raLock.calibration.threshold;
    // Only permission-granting rows enter Evidence/Arbitration. No sufficiency bypass.
    const permitted=semanticActEligible&&sufficiencyAccepted;
    const evidence=permitted?ctx.GuiJia.liuyaoSemanticRouteEvidenceV03.extract(row.text):null;
    const unsupportedTargets=evidence?.unsupportedTargets||[];
    const arb=permitted?ctx.GuiJia.liuyaoSemanticRouteArbitrationV012.arbitrate(row.text,evidence):null;
    return {semanticAct:{probability:semanticActProbability,threshold:act.threshold,eligible:semanticActEligible},routeSufficiency:{probability:sufficiencyProbability,threshold:suffLock.threshold,accepted:sufficiencyAccepted},unsupportedTargets:[...unsupportedTargets],arbitration:arb?.routeId?{routeId:arb.routeId,strength:arb.strength,reasonCode:arb.reasonCode}:null,evidenceArbitrationExecuted:permitted,routeability:{probability:routeabilityProbability,threshold:raLock.calibration.threshold,accepted:routeabilityAccepted},reachesFallback:permitted&&!unsupportedTargets.length&&!arb?.routeId&&routeabilityAccepted};
  };
}
export function reachabilitySummary(rows,routes) {
  const summarize=rs=>({n:rs.length,semanticActEligible:rs.filter(r=>r.upstream.semanticAct.eligible).length,sufficiencyAccepted:rs.filter(r=>r.upstream.routeSufficiency.accepted).length,arbitrationSelected:rs.filter(r=>r.upstream.arbitration).length,routeabilityAccepted:rs.filter(r=>r.upstream.routeability.accepted).length,reachesFallback:rs.filter(r=>r.upstream.reachesFallback).length});
  return {all:summarize(rows),known:summarize(rows.filter(r=>r.expectedRoute)),nonRoute:summarize(rows.filter(r=>!r.expectedRoute)),byRoute:Object.fromEntries(routes.map(route=>[route,summarize(rows.filter(r=>r.expectedRoute===route))])),bySubtype:Object.fromEntries(subtypes.map(s=>[s,summarize(rows.filter(r=>r.subtype===s))])),zeroExposureRoutes:routes.filter(route=>!rows.some(r=>r.expectedRoute===route&&r.upstream.reachesFallback))};
}
export function reachabilityLock(c,r) {
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-reachability-lock-v0.1',status:'upstream_membership_committed_before_fallback_training',reportBinding:binding(c.outputs.reachability),dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),rawCalibrationIds:r.rows.map(x=>x.id),conditionalIds:r.rows.filter(x=>x.upstream.reachesFallback).map(x=>x.id),vectorSha256:hashBytes(JSON.stringify(r.rows.map(x=>({id:x.id,vector:x.vector})))),summary:r.summary,role:'diagnostic upstream exposure only; raw sealed calibration membership retained for threshold safety',fallbackWeightsRead:false,fallbackProbabilitiesScored:false};
}
export function verifyReachability({requireCommitted=false}={}) {
  const {c,d}=preflight({checkCI:false,requireCommitted}),r=json(c.outputs.reachability),api=upstreamApi(c);
  assert(r.status==='upstream_audit_complete_no_fallback_scoring'&&r.execution.encoderInvocations===132&&r.execution.fallbackProbabilitiesScored===false,'Upstream audit boundary drift');
  assert(equal(r.dataLockBinding,binding(c.outputs.dataLock))&&equal(r.executionBinding,binding(executionPath)),'Upstream input binding drift');
  assert(r.rows.length===132,'Upstream membership count drift');
  r.rows.forEach((row,i)=>{
    const src=d.calibration.rows[i];
    assert(row.id===src.id&&row.expectedRoute===src.expectedRoute&&row.subtype===src.subtype&&row.roleSafetyGroup===(src.roleSafetyGroup||null)&&row.textSha256===hashBytes(src.text),'Upstream membership drift');
    assert(equal(row.upstream,api(src,row.vector)),`Frozen upstream replay drift: ${row.id}`);
  });
  assert(equal(r.summary,reachabilitySummary(r.rows,c.routes)),'Upstream summary drift');
  assert(equal(json(c.outputs.reachabilityLock),reachabilityLock(c,r)),'Upstream membership lock drift');
  if(requireCommitted){committed(c.outputs.reachability);committed(c.outputs.reachabilityLock);}
  return {c,d,r};
}
export function weightsLock(c,m) {
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-weights-lock-v0.1',status:'weights_locked_before_fallback_threshold_scoring',modelBinding:binding(c.outputs.model),executionBinding:binding(executionPath),dataLockBinding:binding(c.outputs.dataLock),reachabilityLockBinding:binding(c.outputs.reachabilityLock),parametersSha256:hashBytes(JSON.stringify(m.heads)),trainingRows:1214,headCount:22,thresholdSelected:false,fallbackCalibrationProbabilitiesScored:false,legacyWeightsReused:false,nextAction:'commit_weights_then_score_frozen_raw_calibration_with_upstream_audit_vector_cache'};
}
export function verifyWeights({requireCommitted=false}={}) {
  const {c,d,r}=verifyReachability({requireCommitted}),m=json(c.outputs.model);
  assert(m.status==='weights_locked_before_fallback_threshold_scoring'&&m.vectorSize===512&&equal(m.routeIds,c.routes)&&equal(Object.keys(m.heads),c.routes),'All22 weight structure drift');
  assert(!Object.hasOwn(m,'threshold')&&!m.execution.calibrationProbabilitiesScored&&m.execution.trainingEncoderInvocations===1214&&m.execution.legacyWeightsReused===false&&m.execution.calibrationVectorsUsedForTraining===false,'Training boundary drift');
  assert(equal(m.dataLockBinding,binding(c.outputs.dataLock))&&equal(m.executionBinding,binding(executionPath))&&equal(m.reachabilityLockBinding,binding(c.outputs.reachabilityLock)),'Weight input binding drift');
  for(const route of c.routes) {
    const h=m.heads[route],n=d.training.rows.filter(x=>x.expectedRoute===route).length;
    assert(h.routeId===route&&h.weights.length===512&&h.weights.every(Number.isFinite)&&Number.isFinite(h.bias)&&h.positiveCount===n&&h.negativeCount===1214-n,`Head drift: ${route}`);
  }
  assert(equal(json(c.outputs.weightsLock),weightsLock(c,m)),'Weight lock drift');
  git(['merge-base','--is-ancestor',m.trainingCommit,'HEAD']);
  for(const p of [c.outputs.reachability,c.outputs.reachabilityLock])assert(git(['rev-parse',`${m.trainingCommit}:${p}`])===binding(p).gitBlobSha,'Upstream membership was not committed before training');
  if(requireCommitted){committed(c.outputs.model);committed(c.outputs.weightsLock);}
  return {c,d,r,m};
}
export function admit(probabilities,threshold,routes) {
  assert(Number.isFinite(threshold)&&threshold>=0&&threshold<=1,'Invalid threshold');
  assert(equal(Object.keys(probabilities),routes)&&routes.every(r=>Number.isFinite(probabilities[r])&&probabilities[r]>=0&&probabilities[r]<=1),'All22 scores mandatory');
  const admitted=routes.filter(r=>probabilities[r]>=threshold);
  return {admitted,selectedRoute:admitted.length===1?admitted[0]:null,status:admitted.length===1?'selected':'route_unresolved'};
}
export function metrics(rows,threshold,routes) {
  const decisions=rows.map(r=>admit(r.probabilities,threshold,routes));
  const measure=indices=>{const n=indices.length,accepted=indices.filter(i=>decisions[i].selectedRoute).length;return {n,accepted,falseActivation:n?accepted/n:null};};
  const known=rows.map((r,i)=>r.expectedRoute?i:-1).filter(i=>i>=0),non=rows.map((r,i)=>!r.expectedRoute?i:-1).filter(i=>i>=0);
  const acceptedKnown=known.filter(i=>decisions[i].selectedRoute).length,correctKnown=known.filter(i=>decisions[i].selectedRoute===rows[i].expectedRoute).length;
  const subtype=Object.fromEntries(subtypes.map(s=>[s,measure(non.filter(i=>rows[i].subtype===s))]));
  const role=Object.fromEntries(['credit_direction','debt_direction'].map(s=>[s,measure(non.filter(i=>rows[i].roleSafetyGroup===s))]));
  return {threshold,known:{n:known.length,accepted:acceptedKnown,correct:correctKnown,wrongAccepted:acceptedKnown-correctKnown,exactRetention:known.length?correctKnown/known.length:null,acceptedAccuracy:acceptedKnown?correctKnown/acceptedKnown:null},nonRoute:measure(non),bySubtype:subtype,byRoleSafetyGroup:role,zeroAdmission:decisions.filter(x=>x.admitted.length===0).length,multipleAdmission:decisions.filter(x=>x.admitted.length>1).length,signature:hashBytes(decisions.map(x=>x.admitted.join(',')).join('|'))};
}
export function feasible(m,g) {
  return m.known.exactRetention!==null&&m.known.exactRetention>=g.minimumKnownExact&&m.known.acceptedAccuracy!==null&&m.known.acceptedAccuracy>=g.minimumAcceptedKnownAccuracy&&m.nonRoute.falseActivation!==null&&m.nonRoute.falseActivation<=g.maximumNonRouteFalseActivation&&Object.values(m.bySubtype).every(x=>x.falseActivation!==null&&x.falseActivation<=g.maximumEachSubtypeFalseActivation)&&Object.values(m.byRoleSafetyGroup).every(x=>x.falseActivation!==null&&x.falseActivation<=g.maximumEachRoleSafetyGroupFalseActivation);
}
export function calibrate(rows,calibration,routes) {
  assert(rows.length>0,'Calibration rows required');rows.forEach(r=>admit(r.probabilities,.5,routes));
  const values=[...new Set([0,.5,1,...rows.flatMap(r=>routes.map(route=>r.probabilities[route]))])].sort((a,b)=>a-b);
  const candidates=[...new Set([...values,...values.slice(1).map((x,i)=>(x+values[i])/2)])].sort((a,b)=>a-b);
  const regimes=new Map();for(const t of candidates){const m=metrics(rows,t,routes);regimes.set(m.signature,m);}
  const maxSubtype=m=>Math.max(...Object.values(m.bySubtype).map(x=>x.falseActivation??1));
  const allowed=[...regimes.values()].filter(m=>feasible(m,calibration.gates)).sort((a,b)=>b.known.exactRetention-a.known.exactRetention||a.nonRoute.falseActivation-b.nonRoute.falseActivation||maxSubtype(a)-maxSubtype(b)||b.threshold-a.threshold);
  const best=allowed[0]||null;
  return {status:best?'calibration_passed':'calibration_failed_no_feasible_global_threshold',candidatesEvaluated:candidates.length,regimesEvaluated:regimes.size,feasibleRegimes:allowed.length,selectedThreshold:best?.threshold??null,selectedMetrics:best,regimes:[...regimes.values()]};
}
export function thresholdLock(c,report) {
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-threshold-lock-v0.1',status:'component_locked_after_frozen_raw_calibration',threshold:report.result.selectedThreshold,oneGlobalThresholdOnly:true,all22HeadsMandatory:true,modelBinding:binding(c.outputs.model),weightsLockBinding:binding(c.outputs.weightsLock),reportBinding:binding(c.outputs.report),dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),independentEvaluationRead:false,sealedBlindEvaluationRead:false,developmentPassClaimed:false,nextAction:'owner_phase_b_report_then_Selection_v06_and_integrated_runtime_Phase_C'};
}
export function verifyCalibration() {
  const {c,d,r,m}=verifyWeights(),report=json(c.outputs.report),api=modelApi(c);
  for(const [k,p]of Object.entries({modelBinding:c.outputs.model,weightsLockBinding:c.outputs.weightsLock,dataLockBinding:c.outputs.dataLock,executionBinding:executionPath,reachabilityLockBinding:c.outputs.reachabilityLock})) assert(equal(report[k],binding(p)),`Calibration binding drift: ${k}`);
  assert(report.rows.length===132&&report.execution.newEncoderInvocations===0&&report.execution.cachedUpstreamVectors===132&&report.execution.weightsCommittedBeforeFallbackProbabilityScoring,'Calibration execution drift');
  report.rows.forEach((row,i)=>{
    const src=d.calibration.rows[i];assert(row.id===src.id&&row.expectedRoute===src.expectedRoute&&row.subtype===src.subtype&&row.roleSafetyGroup===(src.roleSafetyGroup||null)&&row.reachesFallback===r.rows[i].upstream.reachesFallback,'Calibration membership drift');
    assert(equal(row.probabilities,api.scoreAll(m,r.rows[i].vector)),`All22 probability replay drift: ${row.id}`);
  });
  assert(equal(report.result,calibrate(report.rows,c.calibration,c.routes)),'Threshold policy replay drift');
  assert(equal(report.conditionalMetrics,report.result.selectedThreshold===null?null:metrics(report.rows.filter(x=>x.reachesFallback),report.result.selectedThreshold,c.routes)),'Conditional diagnostic drift');
  assert(report.status===report.result.status&&!report.governance.postHocRepair&&!report.governance.independentEvaluationRead&&!report.governance.sealedBlindEvaluationRead,'Calibration governance drift');
  git(['merge-base','--is-ancestor',report.weightCommit,'HEAD']);
  for(const p of [c.outputs.model,c.outputs.weightsLock])assert(git(['rev-parse',`${report.weightCommit}:${p}`])===binding(p).gitBlobSha,'Weight commit proof drift');
  if(report.status==='calibration_passed')assert(equal(json(c.outputs.thresholdLock),thresholdLock(c,report)),'Threshold lock drift');else assert(!exists(c.outputs.thresholdLock),'Failed calibration must not have threshold lock');
  return report;
}
