import {binding,hashBytes,write,exists,assert} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
import {preflight,upstreamApi,embedder,reachabilitySummary,executionPath,exposurePath,git,makeExposure,makeLock,verifyAudit} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-audit-lib.mjs';
const {c,d}=preflight(),outputs=[c.outputs.reachability,exposurePath,c.outputs.reachabilityLock];
assert(outputs.every(p=>!exists(p)),'Immutable audit already exists; replay verification instead of re-encoding');
const encode=await embedder(c),api=upstreamApi(c),rows=[];
for(const src of d.calibration.rows) {
  const vector=Array.from(await encode(src.text));
  rows.push({id:src.id,expectedRoute:src.expectedRoute,subtype:src.subtype,roleSafetyGroup:src.roleSafetyGroup||null,textSha256:hashBytes(src.text),vector,upstream:api(src,vector)});
  if(rows.length%50===0)console.log(JSON.stringify({encoderInvocations:rows.length,total:308}));
}
const r={version:'0.13-candidate-v0.7-fallback-identity-v0.5-upstream-audit-v0.1',status:'upstream_audit_complete_no_fallback_scoring',dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),encoderExecution:c.encoderExecution,execution:{inputCommit:git(['rev-parse','HEAD']),runId:process.env.GITHUB_RUN_ID||null,encoderInvocations:rows.length,canonicalTextsPerEncoderCall:1,encoderRetrained:false,fallbackWeightsRead:false,fallbackProbabilitiesScored:false},rows,summary:reachabilitySummary(rows,c.routes),governance:{independentEvaluationRead:false,sealedBlindEvaluationRead:false,reservedResearchRead:false,postHocRepair:false,priorReadIncidentPreserved:true,scope:'this upstream audit phase only; prior frozen read incident remains documented'}};
write(c.outputs.reachability,r);write(exposurePath,makeExposure(rows,c.routes));write(c.outputs.reachabilityLock,makeLock(c,r));
const verified=verifyAudit();
console.log(JSON.stringify({status:verified.exposure.status,encoderInvocations:rows.length,conditionalRows:verified.exposure.result.conditionalRows,violations:verified.exposure.violations}));
