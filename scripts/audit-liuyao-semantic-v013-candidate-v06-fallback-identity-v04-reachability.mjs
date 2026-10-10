import {preflight,embedder,upstreamApi,reachabilitySummary,reachabilityLock,verifyReachability,executionPath} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-execution-lib.mjs';
import {binding,hashBytes,exists,assert,write} from './liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-lib.mjs';
const {c,d}=preflight();
if(exists(c.outputs.reachability)){verifyReachability();console.log('Committed upstream audit replayed; no encoder rerun.');}
else {
  assert(!exists(c.outputs.model)&&!exists(c.outputs.reachabilityLock),'Upstream membership must freeze before Fallback weights');
  const embed=await embedder(c),api=upstreamApi(c),rows=[];
  for(const src of d.calibration.rows) {
    const v=await embed(src.text);rows.push({id:src.id,expectedRoute:src.expectedRoute,subtype:src.subtype,roleSafetyGroup:src.roleSafetyGroup||null,textSha256:hashBytes(src.text),vector:Array.from(v),upstream:api(src,v)});
    if(rows.length%22===0)console.log(`Upstream only: ${rows.length}/${c.calibration.rows} single-text calls; Fallback probabilities: 0`);
  }
  const r={version:'0.13-candidate-v0.6-fallback-identity-v0.4-reachability-audit-v0.1',status:'upstream_audit_complete_no_fallback_scoring',dataLockBinding:binding(c.outputs.dataLock),executionBinding:binding(executionPath),execution:{encoderInvocations:c.calibration.rows,canonicalTextsPerEncoderCall:1,fallbackWeightsRead:false,fallbackProbabilitiesScored:false,RouterLoaded:false,integratedRuntimeBuilt:false},rows,summary:reachabilitySummary(rows,c.routes),independentEvaluationRead:false,sealedBlindEvaluationRead:false};
  write(c.outputs.reachability,r);write(c.outputs.reachabilityLock,reachabilityLock(c,r));verifyReachability();console.log(JSON.stringify(r.summary));
}
