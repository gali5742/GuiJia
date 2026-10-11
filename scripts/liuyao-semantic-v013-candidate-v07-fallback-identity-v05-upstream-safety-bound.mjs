// Post-audit diagnostic proof only. No new gate, synthetic model scores,
// encoder calls, weight training, or changes to the frozen calibration policy.
import {policy,validateUpstream,subtypes,roleGroups} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
export function upstreamSafetyLowerBound(rows,routes) {
  if(!rows.length||new Set(rows.map(r=>r.id)).size!==rows.length)throw new Error('Complete unique raw rows required');
  rows.forEach(r=>validateUpstream(r,routes));
  const non=rows.filter(r=>r.expectedRoute===null);
  const fixed=r=>r.upstream.semanticAct.eligible&&r.upstream.routeSufficiency.accepted&&!r.upstream.unsupportedTargets.length&&Boolean(r.upstream.arbitration);
  const measure=rs=>({n:rs.length,fixedArbitrationActivations:rs.filter(fixed).length,minimumPossibleFalseActivation:rs.length?rs.filter(fixed).length/rs.length:null,status:rs.length?'observed':'not_estimable'});
  const nonRoute=measure(non),bySubtype=Object.fromEntries(subtypes.map(s=>[s,measure(non.filter(r=>r.subtype===s))])),byRoleSafetyGroup=Object.fromEntries(roleGroups.map(s=>[s,measure(non.filter(r=>r.roleSafetyGroup===s))]));
  const violations=[];
  const check=(gate,group,m)=>{if(m.minimumPossibleFalseActivation!==null&&m.minimumPossibleFalseActivation>policy[gate])violations.push({gate,group,n:m.n,fixedArbitrationActivations:m.fixedArbitrationActivations,lowerBound:m.minimumPossibleFalseActivation,maximum:policy[gate]});};
  check('maximumRawPathFalseActivation','all_non_route',nonRoute);
  for(const [s,m]of Object.entries(bySubtype))check('maximumEachRawSubtypePathFalseActivation',s,m);
  for(const [s,m]of Object.entries(byRoleSafetyGroup))check('maximumEachRawRolePathFalseActivation',s,m);
  return {status:violations.length?'frozen_raw_path_safety_proven_infeasible_before_weight_training':'no_upstream_lower_bound_violation_proven',policyBindingRole:'unchanged frozen policy; post-audit proof of necessary safety condition, not a replacement exposure or threshold gate',nonRoute,bySubtype,byRoleSafetyGroup,violations,anyFallbackWeightsAndThresholdCanSatisfyFrozenRawPathSafety:violations.length?false:null,proof:'For each raw non-route row, the frozen safety policy counts permitted unsupported-free Arbitration as a possible selection independently of all Fallback weights and thresholds. Fallback adds only nonnegative selections on other rows. Therefore full-raw path false activation is at least the counted Arbitration fraction. Router conflict, Scope and Finalization receive no safety credit under the frozen policy.',fixedNonRouteArbitration:non.filter(fixed).map(r=>({id:r.id,subtype:r.subtype,roleSafetyGroup:r.roleSafetyGroup??null,selectedRoute:r.upstream.arbitration.routeId,strength:r.upstream.arbitration.strength})),encoderInvocations:0,fallbackWeightsRead:false,fallbackProbabilitiesScored:false,thresholdSearchPerformed:false,integratedRuntimeEvaluated:false,exposureResultOverridden:false,numericGatesChanged:false,sameVersionDataRepairAllowed:false};
}
