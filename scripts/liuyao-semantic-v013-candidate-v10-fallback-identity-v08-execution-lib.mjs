import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {root,read,json,binding,hashBytes,equal,assert,exists,checkedBinding,verify,prefix,git,committed} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
import {upstreamApi as legacyUpstreamApi,embedder,reachabilitySummary,modelApi} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-lib.mjs';
import {exposure,policy,validateUpstream} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
import {upstreamSafetyLowerBound} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-safety-bound.mjs';
export {embedder,reachabilitySummary,modelApi};
export const executionPath=`${prefix}-execution-contract-v0.1.json`;
export function preflight({checkCI=true}={}) {
  const data=verify(),e=json(executionPath);committed(executionPath);
  assert(e.status==='frozen_audit_only_after_data_ci_before_first_v10_encoder_scoring'&&e.encoderInvocationsBeforeFreeze===0&&e.fallbackWeightTrainingAllowed===false,'Audit execution boundary drift');
  for(const b of e.bindings){checkedBinding(b);committed(b.path);}
  assert(equal(e.numericPolicy,policy),'Frozen numeric policy drift');
  const ci=e.dataCI;
  assert(git(['rev-parse',`${ci.headSha}^`])===e.dataSourceCommit,'CI source mismatch');
  git(['merge-base','--is-ancestor',e.dataSourceCommit,e.dataSealCommit]);git(['merge-base','--is-ancestor',e.dataSealCommit,'HEAD']);
  assert(git(['diff','--name-only',e.dataSourceCommit,ci.headSha])===ci.workflowPath,'Data wrapper touched non-entry source');
  const text=git(['show',`${e.dataSourceCommit}:${data.i.workflowPath}`]),start=text.indexOf('\non:\n'),end=text.indexOf('\npermissions:',start);
  assert(start>0&&end>start&&git(['show',`${ci.headSha}:${ci.workflowPath}`])===text.slice(0,start)+'\non:\n  workflow_dispatch:\n'+text.slice(end),'Data CI workflow derivation drift');
  for(const b of data.i.bindings)assert(git(['rev-parse',`${e.dataSourceCommit}:${b.path}`])===b.gitBlobSha,'Successful data CI input drift');
  for(const key of ['training','calibration','trainingSupplement','audit','dataLock']){const p=data.c.outputs[key];assert(git(['rev-parse',`${e.dataSealCommit}:${p}`])===binding(p).gitBlobSha,'Original data seal drift');}
  if(checkCI){const run=JSON.parse(execFileSync('gh',['api',`repos/gali5742/GuiJia/actions/runs/${ci.runId}`],{cwd:root,encoding:'utf8'}));assert(run.status==='completed'&&run.conclusion==='success'&&run.head_sha===ci.headSha&&run.path===ci.workflowPath,'Actual successful data CI not proven');}
  const enc=data.c.encoderExecution;
  assert(enc.modelId==='Xenova/bge-small-zh-v1.5'&&enc.revision==='75c43b069aac4d136ba6bc1122f995fedcfd2781'&&enc.transformersJsVersion==='4.2.0'&&enc.dtype==='q8'&&enc.vectorSize===512&&enc.pooling==='mean'&&enc.normalize&&enc.canonicalTextsPerEncoderCall===1&&!enc.encoderRetraining,'Encoder drift');
  return {...data,e};
}
export function upstreamApi(c) {
  const old=legacyUpstreamApi(c),ctx={};ctx.window=ctx;vm.createContext(ctx);
  for(const b of c.upstream.bindings.filter(b=>b.path.startsWith('js/')))vm.runInContext(read(b.path).toString(),ctx,{filename:b.path});
  vm.runInContext(read(c.upstream.newArbitrationPath).toString(),ctx,{filename:c.upstream.newArbitrationPath});
  return (src,vector)=>{
    const u=old(src,vector),permitted=u.semanticAct.eligible&&u.routeSufficiency.accepted;
    const info=permitted?ctx.GuiJia.liuyaoSemanticRouteArbitrationV014.inspect(src.text,ctx.GuiJia.liuyaoSemanticRouteEvidenceV03.extract(src.text)):null;
    const arb=info?.selection,previous=permitted?ctx.GuiJia.liuyaoSemanticRouteArbitrationV013.inspect(src.text,ctx.GuiJia.liuyaoSemanticRouteEvidenceV03.extract(src.text)).selection:null;
    return {...u,legacyArbitration:u.arbitration,previousArbitration:previous?{routeId:previous.routeId,strength:previous.strength,reasonCode:previous.rationale}:null,arbitration:arb?{routeId:arb.routeId,strength:arb.strength,reasonCode:arb.rationale}:null,arbitrationPermission:info?{candidateRoute:info.candidateRoute,authorized:info.authorized,reason:info.reason,activeTargets:[...info.activeTargets],explicitFocus:info.explicitFocus,negatedClausesRemoved:info.negatedClausesRemoved}:null,reachesFallback:permitted&&!u.unsupportedTargets.length&&!arb&&u.routeability.accepted};
  };
}
export function pretrainingGates(rows,routes) {
  const coverage=exposure(rows,routes),safetyLowerBound=upstreamSafetyLowerBound(rows,routes);
  const safetyNecessaryConditionPassed=safetyLowerBound.violations.length===0&&safetyLowerBound.nonRoute.n>0&&Object.values(safetyLowerBound.bySubtype).every(x=>x.n>0)&&Object.values(safetyLowerBound.byRoleSafetyGroup).every(x=>x.n>0);
  const eligibleToTrain=coverage.eligibleToTrain&&safetyNecessaryConditionPassed;
  return {version:'0.13-candidate-v0.10-pretraining-gates-v0.1',status:eligibleToTrain?'pretraining_gates_passed':'pretraining_gates_failed_before_weight_training',eligibleToTrain,coverage,safetyLowerBound,safetyNecessaryConditionPassed,numericPolicy:policy,weightTrainingPerformed:false,thresholdSearchPerformed:false,sameVersionRepairAllowed:false,integratedPassClaimed:false,nextAction:eligibleToTrain?'commit_membership_then_freeze_separate_training_contract_before_weights':'preserve_failure_stop_before_weights_no_same_version_repair'};
}
export function makeLock(c,r) {
  return {version:'0.13-candidate-v0.10-reachability-lock-v0.1',status:'complete_raw_cache_conditional_membership_and_pretraining_gates_sealed_before_weights',cacheBinding:binding(c.outputs.reachability),exposureBinding:binding(c.outputs.exposure),executionBinding:binding(executionPath),dataLockBinding:binding(c.outputs.dataLock),rawIds:r.rows.map(x=>x.id),conditionalIds:r.rows.filter(x=>x.upstream.reachesFallback).map(x=>x.id),vectorSha256:hashBytes(JSON.stringify(r.rows.map(x=>({id:x.id,vector:x.vector})))),eligibleToTrain:pretrainingGates(r.rows,c.routes).eligibleToTrain,fallbackWeightsRead:false,fallbackScoresRead:false};
}
export function verifyAudit({requireCommitted=true}={}) {
  const {c,d,e}=preflight({checkCI:false}),r=json(c.outputs.reachability),api=upstreamApi(c);
  assert(r.rows.length===396&&r.execution.encoderInvocations===396&&r.execution.canonicalTextsPerEncoderCall===1&&!r.execution.encoderRetrained&&!r.execution.fallbackWeightsRead&&!r.execution.fallbackProbabilitiesScored,'Audit execution drift');
  assert(equal(r.dataLockBinding,binding(c.outputs.dataLock))&&equal(r.executionBinding,binding(executionPath)),'Audit bindings drift');
  git(['merge-base','--is-ancestor',r.execution.inputCommit,'HEAD']);
  assert(git(['rev-parse',`${r.execution.inputCommit}:${executionPath}`])===binding(executionPath).gitBlobSha,'Execution not committed before encoding');
  for(const b of e.bindings)assert(git(['rev-parse',`${r.execution.inputCommit}:${b.path}`])===b.gitBlobSha,'Encoder source input drift');
  r.rows.forEach((row,n)=>{const src=d.calibration.rows[n];assert(row.id===src.id&&row.expectedRoute===src.expectedRoute&&row.subtype===src.subtype&&row.roleSafetyGroup===(src.roleSafetyGroup||null)&&row.textSha256===hashBytes(src.text),'Raw membership drift');assert(Array.isArray(row.vector)&&row.vector.length===512&&row.vector.every(Number.isFinite),'Finite raw vectors required');validateUpstream(row,c.routes);assert(equal(row.upstream,api(src,row.vector)),`Upstream replay drift: ${row.id}`);});
  assert(equal(r.summary,reachabilitySummary(r.rows,c.routes)),'Upstream summary drift');
  assert(equal(json(c.outputs.exposure),pretrainingGates(r.rows,c.routes)),'Frozen gate replay drift');
  assert(equal(json(c.outputs.reachabilityLock),makeLock(c,r)),'Membership/cache lock drift');
  assert(!r.governance.independentEvaluationRead&&!r.governance.sealedBlindEvaluationRead&&!r.governance.reservedResearchRead&&!r.governance.postHocRepair,'Audit governance drift');
  if(requireCommitted)for(const p of [c.outputs.reachability,c.outputs.exposure,c.outputs.reachabilityLock])committed(p);
  return {c,d,r,gates:json(c.outputs.exposure)};
}
