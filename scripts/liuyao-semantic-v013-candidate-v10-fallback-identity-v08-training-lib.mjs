import {execFileSync} from 'node:child_process';
import {root,json,binding,checkedBinding,committed,hashBytes,assert,equal,exists,git,prefix} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
import {verifyAudit,executionPath,modelApi,embedder} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-execution-lib.mjs';
import {evaluate,admit} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
export {modelApi,embedder};
export const trainingPath=`${prefix}-training-execution-contract-v0.1.json`;
export function preflightTraining({checkCI=true}={}) {
  const data=verifyAudit(),t=json(trainingPath);committed(trainingPath);
  assert(t.status==='frozen_after_upstream_gates_and_membership_commit_before_weights'&&data.gates.eligibleToTrain&&t.oldWeightsReusable===false&&t.calibrationMayTrainWeights===false,'Training permission boundary drift');
  for(const b of t.bindings){checkedBinding(b);committed(b.path);}
  git(['merge-base','--is-ancestor',t.reachabilitySealCommit,'HEAD']);
  assert(git(['rev-parse',`${t.upstreamCI.headSha}^`])===t.upstreamSourceCommit&&git(['diff','--name-only',t.upstreamSourceCommit,t.upstreamCI.headSha])===t.upstreamCI.workflowPath,'Successful upstream CI source drift');
  git(['merge-base','--is-ancestor',t.upstreamSourceCommit,t.reachabilitySealCommit]);
  for(const p of [data.c.outputs.reachability,data.c.outputs.exposure,data.c.outputs.reachabilityLock])assert(git(['rev-parse',`${t.reachabilitySealCommit}:${p}`])===binding(p).gitBlobSha,'Committed pretraining membership drift');
  if(checkCI){const run=JSON.parse(execFileSync('gh',['api',`repos/gali5742/GuiJia/actions/runs/${t.upstreamCI.runId}`],{cwd:root,encoding:'utf8'}));assert(run.status==='completed'&&run.conclusion==='success'&&run.head_sha===t.upstreamCI.headSha&&run.path===t.upstreamCI.workflowPath,'Actual upstream permission CI not successful');}
  return {...data,t};
}
export function weightsLock(c,m) {
  return {version:'0.13-candidate-v0.10-fallback-v0.8-weights-lock-v0.1',status:'weights_locked_before_any_fallback_calibration_scores',modelBinding:binding(c.outputs.model),trainingExecutionBinding:binding(trainingPath),dataLockBinding:binding(c.outputs.dataLock),reachabilityLockBinding:binding(c.outputs.reachabilityLock),parametersSha256:hashBytes(JSON.stringify(m.heads)),trainingRows:2028,headCount:22,thresholdSelected:false,calibrationProbabilitiesScored:false,legacyWeightsReused:false};
}
export function verifyWeights({requireCommitted=false}={}) {
  const data=preflightTraining({checkCI:false}),{c}=data,m=json(c.outputs.model),api=modelApi(c);
  assert(m.status==='weights_locked_before_any_fallback_calibration_scores'&&m.vectorSize===512&&equal(m.routeIds,c.routes)&&equal(Object.keys(m.heads),c.routes)&&equal(m.hyperparameters,c.algorithm.hyperparameters),'All22 weights shape drift');
  assert(!Object.hasOwn(m,'threshold')&&m.execution.trainingEncoderInvocations===2028&&m.execution.canonicalTextsPerEncoderCall===1&&!m.execution.legacyWeightsReused&&!m.execution.calibrationVectorsUsedForTraining&&!m.execution.calibrationProbabilitiesScored&&m.execution.zeroInitialization,'Training input/scoring boundary drift');
  for(const [key,p]of Object.entries({dataLockBinding:c.outputs.dataLock,trainingExecutionBinding:trainingPath,reachabilityLockBinding:c.outputs.reachabilityLock}))assert(equal(m[key],binding(p)),'Weight input binding drift');
  git(['merge-base','--is-ancestor',m.trainingCommit,'HEAD']);
  for(const p of [trainingPath,c.outputs.reachabilityLock,c.outputs.dataLock])assert(git(['rev-parse',`${m.trainingCommit}:${p}`])===binding(p).gitBlobSha,'Weights started before permission and membership were committed');
  for(const route of c.routes){const h=m.heads[route],pos=data.d.training.rows.filter(r=>r.expectedRoute===route).length;assert(h.routeId===route&&h.weights.length===512&&h.weights.every(Number.isFinite)&&Number.isFinite(h.bias)&&h.positiveCount===pos&&h.negativeCount===2028-pos&&Number.isFinite(h.weightedTrainingLoss)&&h.weightedTrainingLoss>=0,'Invalid trained head');assert(h.negativeCoefficientTotal===data.d.training.rows.reduce((n,r)=>n+(r.expectedRoute===route?0:api.negativeMultiplier(route,r.expectedRoute)),0),'Frozen negative weighting drift');}
  assert(equal(json(c.outputs.weightsLock),weightsLock(c,m)),'Weights lock replay drift');
  if(requireCommitted){committed(c.outputs.model);committed(c.outputs.weightsLock);}
  return {...data,m};
}
const maximumObservedSubtype=m=>Math.max(...Object.values(m.conditional.bySubtype).filter(x=>x.n>0).map(x=>x.falseActivation));
export function calibrate(rows,routes) {
  assert(rows.length>0,'Raw calibration required');rows.forEach(r=>admit(r.probabilities,.5,routes));
  const values=[...new Set([0,.5,1,...rows.flatMap(r=>routes.map(route=>r.probabilities[route]))])].sort((a,b)=>a-b);
  const candidates=[...new Set([...values,...values.slice(1).map((v,n)=>(v+values[n])/2)])].sort((a,b)=>a-b);
  const regimes=new Map();
  for(const threshold of candidates){const signature=hashBytes(rows.map(r=>admit(r.probabilities,threshold,routes).admitted.join(',')).join('|'));regimes.set(signature,threshold);}
  const compact=[],feasible=[];
  for(const [signature,threshold]of regimes){const m=evaluate(rows,threshold,routes);if(m.feasible)feasible.push(m);const admissions=rows.map(r=>admit(r.probabilities,threshold,routes));compact.push({threshold,signature,conditionalKnownCorrect:m.conditional.known.correct,conditionalKnownAccepted:m.conditional.known.accepted,conditionalNonRouteActivated:m.conditional.nonRoute.activated,conditionalSubtypeActivated:Object.values(m.conditional.bySubtype).map(x=>x.activated),conditionalRoleActivated:Object.values(m.conditional.byRoleSafetyGroup).map(x=>x.activated),rawNonRouteActivated:m.rawPathSafety.nonRoute.activated,rawSubtypeActivated:Object.values(m.rawPathSafety.bySubtype).map(x=>x.activated),rawRoleActivated:Object.values(m.rawPathSafety.byRoleSafetyGroup).map(x=>x.activated),componentFeasible:m.componentFeasible,rawPathSafe:m.rawPathSafe,feasible:m.feasible,zeroAdmission:admissions.filter(x=>!x.admitted.length).length,multipleAdmission:admissions.filter(x=>x.admitted.length>1).length});}
  feasible.sort((a,b)=>b.conditional.known.exactRetention-a.conditional.known.exactRetention||a.conditional.nonRoute.falseActivation-b.conditional.nonRoute.falseActivation||maximumObservedSubtype(a)-maximumObservedSubtype(b)||b.threshold-a.threshold);
  const best=feasible[0]||null;
  return {status:best?'calibration_passed':'calibration_failed_no_feasible_global_threshold',candidatesEvaluated:candidates.length,regimesEvaluated:regimes.size,feasibleRegimes:feasible.length,selectedThreshold:best?.threshold??null,selectedMetrics:best,maximumConditionalKnownCorrect:Math.max(...compact.map(x=>x.conditionalKnownCorrect)),regimes:compact,regimeEncoding:'compact_activation_counts_in_frozen_subtype_and_role_order; full_metrics_at_selected_threshold_only; allraw_signatures_retained'};
}
export function thresholdLock(c,report) {
  return {version:'0.13-candidate-v0.10-fallback-v0.8-threshold-lock-v0.1',status:'component_locked_after_conditional_identity_and_full_raw_path_safety',threshold:report.result.selectedThreshold,oneGlobalThresholdOnly:true,all22HeadsMandatory:true,modelBinding:binding(c.outputs.model),weightsLockBinding:binding(c.outputs.weightsLock),calibrationReportBinding:binding(c.outputs.report),trainingExecutionBinding:binding(trainingPath),dataLockBinding:binding(c.outputs.dataLock),reachabilityLockBinding:binding(c.outputs.reachabilityLock),independentEvaluationRead:false,sealedBlindEvaluationRead:false,integratedDevelopmentPassClaimed:false};
}
export function verifyCalibration({requireCommitted=false}={}) {
  const data=verifyWeights({requireCommitted:true}),{c,r,m}=data,report=json(c.outputs.report),api=modelApi(c);
  assert(report.execution.newEncoderInvocations===0&&report.execution.cachedUpstreamVectors===396&&report.execution.rawCalibrationRowsRetained===396&&report.execution.weightsCommittedBeforeFallbackProbabilityScoring&&report.execution.calibrationRowsUsedForTraining===0,'Calibration boundary drift');
  for(const [key,p]of Object.entries({modelBinding:c.outputs.model,weightsLockBinding:c.outputs.weightsLock,dataLockBinding:c.outputs.dataLock,trainingExecutionBinding:trainingPath,reachabilityLockBinding:c.outputs.reachabilityLock}))assert(equal(report[key],binding(p)),'Calibration input binding drift');
  git(['merge-base','--is-ancestor',report.weightCommit,'HEAD']);
  for(const p of [c.outputs.model,c.outputs.weightsLock])assert(git(['rev-parse',`${report.weightCommit}:${p}`])===binding(p).gitBlobSha,'Scores predated committed weights');
  assert(report.rows.length===396,'Full raw membership required');
  report.rows.forEach((row,n)=>{const src=r.rows[n];assert(row.id===src.id&&row.expectedRoute===src.expectedRoute&&row.subtype===src.subtype&&row.roleSafetyGroup===src.roleSafetyGroup&&equal(row.upstream,src.upstream),'Calibration membership drift');assert(equal(row.probabilities,api.scoreAll(m,src.vector)),'All22 probability replay drift');});
  assert(equal(report.result,calibrate(report.rows,c.routes))&&report.status===report.result.status,'Frozen threshold policy replay drift');
  assert(!report.governance.postHocRepair&&!report.governance.independentEvaluationRead&&!report.governance.sealedBlindEvaluationRead&&!report.governance.integratedPassClaimed,'Calibration governance drift');
  if(report.status==='calibration_passed')assert(equal(json(c.outputs.thresholdLock),thresholdLock(c,report)),'Threshold lock drift');else assert(!exists(c.outputs.thresholdLock),'Failed calibration cannot lock threshold');
  if(requireCommitted){committed(c.outputs.report);if(report.status==='calibration_passed')committed(c.outputs.thresholdLock);}
  return {...data,report};
}
