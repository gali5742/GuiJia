import {execFileSync} from 'node:child_process';
import {root,read,json,binding,hashBytes,equal,assert,exists,checkedBinding,verify,prefix} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
import {upstreamApi,embedder,reachabilitySummary} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-lib.mjs';
import {exposure,policy,validateUpstream} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
export {upstreamApi,embedder,reachabilitySummary};
export const executionPath=`${prefix}-upstream-execution-contract-v0.1.json`;
export const exposurePath=`${prefix}-exposure-report-v0.1.json`;
export const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export const committed=p=>assert(git(['rev-parse',`HEAD:${p}`])===binding(p).gitBlobSha,`Uncommitted audit input: ${p}`);
export function preflight({checkCI=true,requireCommitted=true}={}) {
  assert(process.env.NODE_OPTIONS?.includes('liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'),'Evaluation read guard must be preloaded');
  const data=verify({requireSeal:true,requireCommitted}),e=json(executionPath);
  assert(e.status==='frozen_upstream_audit_only_before_first_candidate_v07_encoder_scoring'&&e.encoderInvocationsBeforeFreeze===0&&e.fallbackWeightTrainingAllowed===false,'Audit execution boundary drift');
  for(const b of e.bindings){checkedBinding(b);if(requireCommitted)committed(b.path);}
  if(requireCommitted)committed(executionPath);
  assert(equal(e.exposurePolicy,policy),'Frozen exposure policy drift');
  const ci=e.dataCI;
  // The isolated CI wrapper and the bot seal are siblings; both derive from the
  // same frozen authoring source. The wrapper is never merged into development.
  assert(git(['rev-parse',`${ci.headSha}^`])===e.dataSourceCommit,'Data CI wrapper source mismatch');
  git(['merge-base','--is-ancestor',e.dataSourceCommit,e.dataSealCommit]);
  git(['merge-base','--is-ancestor',e.dataSealCommit,'HEAD']);
  assert(git(['diff','--name-only',e.dataSourceCommit,ci.headSha])===ci.workflowPath,'Data CI wrapper changed non-entry inputs');
  const workflow=git(['show',`${e.dataSourceCommit}:${data.implementation.workflowPath}`]);
  const start=workflow.indexOf('\non:\n'),end=workflow.indexOf('\npermissions:',start);
  assert(start>0&&end>start,'Data CI workflow structure mismatch');
  assert(git(['show',`${ci.headSha}:${ci.workflowPath}`])===workflow.slice(0,start)+'\non:\n  workflow_dispatch:\n'+workflow.slice(end),'Data CI entry derivation mismatch');
  for(const b of data.implementation.bindings)assert(git(['rev-parse',`${e.dataSourceCommit}:${b.path}`])===b.gitBlobSha,'Authoring source differed from successful data CI');
  for(const key of ['augmentation','training','calibration','audit','dataLock']){const p=data.c.outputs[key];assert(git(['rev-parse',`${e.dataSealCommit}:${p}`])===binding(p).gitBlobSha,`Original data seal drift: ${p}`);}
  if(checkCI) {
    const run=JSON.parse(execFileSync('gh',['api',`repos/gali5742/GuiJia/actions/runs/${ci.runId}`],{cwd:root,encoding:'utf8'}));
    assert(run.status==='completed'&&run.conclusion==='success'&&run.head_sha===ci.headSha&&run.path===ci.workflowPath,'Successful actual data CI not proven');
  }
  const enc=data.c.encoderExecution;
  assert(enc.modelId==='Xenova/bge-small-zh-v1.5'&&enc.revision==='75c43b069aac4d136ba6bc1122f995fedcfd2781'&&enc.transformersJsVersion==='4.2.0'&&enc.dtype==='q8'&&enc.vectorSize===512&&enc.pooling==='mean'&&enc.normalize===true&&enc.canonicalTextsPerEncoderCall===1&&!enc.encoderRetraining,'Frozen encoder drift');
  for(const p of [data.c.outputs.model,data.c.outputs.weightsLock,data.c.outputs.report,data.c.outputs.thresholdLock])assert(!exists(p),'Audit-only phase must precede all new fallback weights and calibration');
  return {...data,e};
}
export function verifyRows(rows,sources,routes,api) {
  assert(Array.isArray(rows)&&rows.length===sources.length&&rows.length>0&&new Set(rows.map(r=>r.id)).size===rows.length,'Complete ordered unique raw cache required');
  rows.forEach((row,i)=>{
    const src=sources[i];
    assert(equal(Object.keys(row),['id','expectedRoute','subtype','roleSafetyGroup','textSha256','vector','upstream']),'Cache schema drift');
    assert(row.id===src.id&&row.expectedRoute===src.expectedRoute&&row.subtype===src.subtype&&row.roleSafetyGroup===(src.roleSafetyGroup||null)&&row.textSha256===hashBytes(src.text),`Raw membership drift: ${row.id}`);
    assert(Array.isArray(row.vector)&&row.vector.length===512&&row.vector.every(Number.isFinite),'Single-text finite 512-vector required');
    validateUpstream(row,routes);
    assert(equal(row.upstream,api(src,row.vector)),`Frozen upstream replay drift: ${row.id}`);
  });
}
export function makeExposure(rows,routes) {
  const result=exposure(rows,routes),violations=[];
  for(const [route,n]of Object.entries(result.byRoute))if(n<policy.minimumConditionalKnownPerRoute)violations.push({gate:'minimumConditionalKnownPerRoute',route,observed:n,required:policy.minimumConditionalKnownPerRoute});
  for(const [gate,n]of [['minimumConditionalNonRoute',result.conditionalNonRoute],['minimumConditionalUnresolved',result.bySubtype.route_unresolved]])if(n<policy[gate])violations.push({gate,observed:n,required:policy[gate]});
  for(const [role,n]of Object.entries(result.byRoleSafetyGroup))if(n<policy.minimumConditionalRoleGroup)violations.push({gate:'minimumConditionalRoleGroup',role,observed:n,required:policy.minimumConditionalRoleGroup});
  return {version:'0.13-candidate-v0.7-fallback-identity-v0.5-exposure-v0.1',status:result.status,eligibleToTrain:result.eligibleToTrain,policy,result,violations,weightsTrained:false,fallbackScoresRead:false,thresholdSelected:false,sameVersionReplenishmentAllowed:false,nextAction:result.eligibleToTrain?'freeze_separate_training_execution_and_commit_membership_before_any_weights':'stop_before_weight_training_preserve_failure_no_same_version_data_or_upstream_repair'};
}
export function makeLock(c,r) {
  return {version:'0.13-candidate-v0.7-fallback-identity-v0.5-upstream-membership-lock-v0.1',status:'upstream_membership_and_exposure_committed_before_any_fallback_weights',reportBinding:binding(c.outputs.reachability),exposureBinding:binding(exposurePath),dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),rawCalibrationIds:r.rows.map(x=>x.id),conditionalIds:r.rows.filter(x=>x.upstream.reachesFallback).map(x=>x.id),vectorSha256:hashBytes(JSON.stringify(r.rows.map(x=>({id:x.id,vector:x.vector})))),eligibleToTrain:exposure(r.rows,c.routes).eligibleToTrain,fallbackWeightsRead:false,fallbackProbabilitiesScored:false,rawMembershipRetainedEntirely:true};
}
export function verifyAudit({requireCommitted=false}={}) {
  const {c,d,e}=preflight({checkCI:false,requireCommitted}),r=json(c.outputs.reachability),api=upstreamApi(c);
  assert(r.status==='upstream_audit_complete_no_fallback_scoring'&&r.rows.length===c.calibration.rawRows&&r.execution.encoderInvocations===308&&r.execution.canonicalTextsPerEncoderCall===1&&r.execution.fallbackWeightsRead===false&&r.execution.fallbackProbabilitiesScored===false&&r.execution.encoderRetrained===false,'Audit execution boundary drift');
  assert(equal(r.dataLockBinding,binding(c.outputs.dataLock))&&equal(r.executionBinding,binding(executionPath))&&equal(r.encoderExecution,c.encoderExecution),'Audit input binding drift');
  assert(git(['rev-parse',`${r.execution.inputCommit}:${executionPath}`])===binding(executionPath).gitBlobSha,'Encoder started before execution contract was committed');
  git(['merge-base','--is-ancestor',r.execution.inputCommit,'HEAD']);
  for(const b of e.bindings)assert(git(['rev-parse',`${r.execution.inputCommit}:${b.path}`])===b.gitBlobSha,'Audit source input drift');
  verifyRows(r.rows,d.calibration.rows,c.routes,api);
  assert(equal(r.summary,reachabilitySummary(r.rows,c.routes)),'Audit summary drift');
  assert(equal(json(exposurePath),makeExposure(r.rows,c.routes)),'Exposure policy replay drift');
  assert(equal(json(c.outputs.reachabilityLock),makeLock(c,r)),'Cache and conditional membership lock drift');
  assert(r.governance.independentEvaluationRead===false&&r.governance.sealedBlindEvaluationRead===false&&r.governance.reservedResearchRead===false&&r.governance.postHocRepair===false,'Audit governance drift');
  if(requireCommitted)for(const p of [c.outputs.reachability,exposurePath,c.outputs.reachabilityLock])committed(p);
  return {c,r,exposure:json(exposurePath)};
}
