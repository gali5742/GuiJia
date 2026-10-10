import {json,binding,write,equal,assert,exists} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const prefix='data/liuyao-semantic-v013-candidate-v06-fallback-identity-v04';
const output=`${prefix}-responsibility-review-v0.1.json`;
const source=`${prefix}-calibration-report.json`, audit=`${prefix}-reachability-audit-v0.1.json`;
export function diagnose() {
  // Explicit allowlist: no corpus, model, vector feature, encoder or wording is loaded.
  const r=json(source),a=json(audit);
  assert(r.status==='calibration_failed_no_feasible_global_threshold'&&r.result.selectedThreshold===null&&r.result.feasibleRegimes===0,'Preserved failure required');
  assert(r.rows.every(x=>!Object.hasOwn(x,'text'))&&a.rows.every(x=>!Object.hasOwn(x,'text')),'Metadata-only inputs required');
  // This exact raw diagnostic already appears in the published Phase B report.
  // Do not search conditional thresholds or declare feasibility under a new policy.
  const threshold=0.6347075635992827;
  const regime=r.result.regimes.find(x=>x.threshold===threshold);
  assert(regime&&regime.known.correct===72&&regime.nonRoute.accepted===21,'Published diagnostic drift');
  const byFirstStage={},falseActivations=[],conditionalIds=[],arbitrationNonRoute=[];
  r.rows.forEach((x,i)=>{
    const u=a.rows[i];
    assert(x.id===u.id&&x.expectedRoute===u.expectedRoute&&x.reachesFallback===u.upstream.reachesFallback,'Audit membership mismatch');
    const q=u.upstream;
    if(q.reachesFallback)conditionalIds.push(x.id);
    if(!x.expectedRoute&&q.arbitration)arbitrationNonRoute.push({id:x.id,routeId:q.arbitration.routeId,strength:q.arbitration.strength,semanticActEligible:q.semanticAct.eligible,sufficiencyAccepted:q.routeSufficiency.accepted});
    if(x.expectedRoute)return;
    const admitted=Object.keys(x.probabilities).filter(k=>x.probabilities[k]>=threshold);
    if(admitted.length!==1)return;
    const stage=!q.semanticAct.eligible?'semantic_act_blocked':!q.routeSufficiency.accepted?'sufficiency_blocked':q.unsupportedTargets.length?'unsupported_target_blocked':q.arbitration?'arbitration_selected':!q.routeability.accepted?'routeability_blocked':'reaches_fallback';
    byFirstStage[stage]=(byFirstStage[stage]||0)+1;
    falseActivations.push({id:x.id,subtype:x.subtype,roleSafetyGroup:x.roleSafetyGroup,standaloneSelectedRoute:admitted[0],firstStage:stage});
  });
  assert(falseActivations.length===21&&conditionalIds.length===41,'Published cohort drift');
  return {
    version:'0.13-candidate-v0.6-fallback-identity-v0.4-responsibility-review-v0.1',
    status:'read_only_architecture_review_preserved_component_failure',
    bindings:[source,audit,`${prefix}-reachability.lock.json`,`${prefix}-data.lock.json`].map(binding),
    rawRows:r.rows.length,conditionalRows:conditionalIds.length,conditionalKnown:a.summary.known.reachesFallback,conditionalNonRoute:a.summary.nonRoute.reachesFallback,
    zeroConditionalExposureRoutes:a.summary.zeroExposureRoutes,
    publishedRawDiagnostic:{threshold,role:'published_raw_regime_only_never_adopted',known:regime.known,nonRoute:regime.nonRoute,nonRouteActivationByFirstStage:byFirstStage,rows:falseActivations},
    upstreamNonRouteArbitration:arbitrationNonRoute,
    findings:[
      '18 of 21 standalone non-route activations are blocked by Act/Sufficiency before Fallback; one takes the Arbitration branch.',
      'Both conditionally reachable non-route rows activate at the published raw diagnostic, including credit direction ambiguity; changing metric scope alone does not establish safety.',
      'Three heads have no conditional known exposure; this cohort cannot support all22 conditional calibration.',
      'One procedural non-route reaches strong Arbitration; a Fallback-only metric cannot cover this upstream path risk.',
      'Training loss and rank statistics do not prove convergence, linear incapacity or independent generalization.'
    ],
    governance:{encoderInvocations:0,newHeadScoring:false,conditionalThresholdSearch:false,thresholdSelected:false,oldFailureStatusChanged:false,questionWordingReadByThisScript:false,calibrationVectorsUsed:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false},
    nextAction:'freeze_new_candidate_v07_fallback_v05_conditional_identity_plus_all_raw_path_safety_contract_before_fresh_authoring'
  };
}
const report=diagnose();
if(exists(output))assert(equal(json(output),report),'Immutable review drift');
else {assert(!process.argv.includes('--verify'),'Review missing');write(output,report);}
console.log(JSON.stringify({status:report.status,rawRows:report.rawRows,conditionalRows:report.conditionalRows,nonRouteActivationByFirstStage:report.publishedRawDiagnostic.nonRouteActivationByFirstStage,encoderInvocations:0}));
