// Component policy only: no model loading, training, encoder or integrated runtime.
export const subtypes=['route_unresolved','near_domain_not_current_route','outside_current_22'];
export const roleGroups=['credit_direction','debt_direction'];
export const policy=Object.freeze({minimumKnownExact:.8,minimumAcceptedKnownAccuracy:.98,maximumNonRouteFalseActivation:.05,maximumEachObservedSubtypeFalseActivation:.05,maximumEachRoleSafetyGroupFalseActivation:.05,maximumRawPathFalseActivation:.05,maximumEachRawSubtypePathFalseActivation:.05,maximumEachRawRolePathFalseActivation:.05,minimumConditionalKnownPerRoute:2,minimumConditionalNonRoute:8,minimumConditionalUnresolved:8,minimumConditionalRoleGroup:2});
const ensure=(ok,message)=>{if(!ok)throw new Error(message);};
export function validateUpstream(row,routes) {
  const u=row.upstream;
  ensure(typeof u?.semanticAct?.eligible==='boolean'&&typeof u?.routeSufficiency?.accepted==='boolean'&&typeof u?.routeability?.accepted==='boolean'&&Array.isArray(u?.unsupportedTargets)&&typeof u?.reachesFallback==='boolean','Complete frozen upstream decision required');
  const permitted=u.semanticAct.eligible&&u.routeSufficiency.accepted;
  ensure(!u.arbitration||(permitted&&routes.includes(u.arbitration.routeId)&&['strong','support'].includes(u.arbitration.strength)),'Invalid or bypassed Arbitration');
  const reaches=permitted&&!u.unsupportedTargets.length&&!u.arbitration&&u.routeability.accepted;
  ensure(reaches===u.reachesFallback,'Frozen reachability inconsistent');
  ensure(row.expectedRoute===null||routes.includes(row.expectedRoute),'Invalid expected route');
  if(row.expectedRoute===null)ensure(subtypes.includes(row.subtype),'Non-route subtype required');
  ensure(row.roleSafetyGroup==null||roleGroups.includes(row.roleSafetyGroup),'Invalid safety group');
  return u;
}
export function admit(probabilities,threshold,routes) {
  ensure(Number.isFinite(threshold)&&threshold>=0&&threshold<=1,'Invalid global threshold');
  ensure(probabilities&&Object.keys(probabilities).length===routes.length&&routes.every(r=>Object.hasOwn(probabilities,r)&&Number.isFinite(probabilities[r])&&probabilities[r]>=0&&probabilities[r]<=1),'All heads must have finite probabilities');
  const admitted=routes.filter(r=>probabilities[r]>=threshold);
  return {admitted,selectedRoute:admitted.length===1?admitted[0]:null};
}
export function exposure(rows,routes) {
  ensure(rows.length>0&&new Set(rows.map(r=>r.id)).size===rows.length,'Nonempty unique raw membership required');
  rows.forEach(r=>validateUpstream(r,routes));
  const conditional=rows.filter(r=>r.upstream.reachesFallback), non=conditional.filter(r=>r.expectedRoute===null);
  const byRoute=Object.fromEntries(routes.map(route=>[route,conditional.filter(r=>r.expectedRoute===route).length]));
  const bySubtype=Object.fromEntries(subtypes.map(s=>[s,non.filter(r=>r.subtype===s).length]));
  const byRoleSafetyGroup=Object.fromEntries(roleGroups.map(s=>[s,non.filter(r=>r.roleSafetyGroup===s).length]));
  const eligible=Object.values(byRoute).every(n=>n>=policy.minimumConditionalKnownPerRoute)&&non.length>=policy.minimumConditionalNonRoute&&bySubtype.route_unresolved>=policy.minimumConditionalUnresolved&&Object.values(byRoleSafetyGroup).every(n=>n>=policy.minimumConditionalRoleGroup);
  return {status:eligible?'exposure_passed':'exposure_failed_before_weight_training',eligibleToTrain:eligible,rawIds:rows.map(r=>r.id),conditionalIds:conditional.map(r=>r.id),conditionalRows:conditional.length,conditionalNonRoute:non.length,byRoute,bySubtype,byRoleSafetyGroup,unobservedConditionalSubtypes:subtypes.filter(s=>bySubtype[s]===0)};
}
function statistics(rows,selected) {
  const known=rows.filter(r=>r.expectedRoute!==null),non=rows.filter(r=>r.expectedRoute===null);
  const accepted=known.filter(r=>selected(r)!==null).length,correct=known.filter(r=>selected(r)===r.expectedRoute).length;
  const measure=rs=>({n:rs.length,activated:rs.filter(r=>selected(r)!==null).length,falseActivation:rs.length?rs.filter(r=>selected(r)!==null).length/rs.length:null,status:rs.length?'observed':'not_estimable'});
  return {known:{n:known.length,accepted,correct,exactRetention:known.length?correct/known.length:null,acceptedAccuracy:accepted?correct/accepted:null},nonRoute:measure(non),bySubtype:Object.fromEntries(subtypes.map(s=>[s,measure(non.filter(r=>r.subtype===s))])),byRoleSafetyGroup:Object.fromEntries(roleGroups.map(s=>[s,measure(non.filter(r=>r.roleSafetyGroup===s))]))};
}
export function evaluate(rows,threshold,routes) {
  const coverage=exposure(rows,routes);
  const standalone=new Map(rows.map(r=>[r.id,admit(r.probabilities,threshold,routes)]));
  const rawStandaloneStress=statistics(rows,r=>standalone.get(r.id).selectedRoute);
  const conditional=statistics(rows.filter(r=>r.upstream.reachesFallback),r=>standalone.get(r.id).selectedRoute);
  // Conservative pre-Finalization potential selection. No Router-conflict or Scope
  // credit: either can suppress a route, so this counts both possible selection paths.
  const possible=r=>{
    const u=r.upstream;
    if(!u.semanticAct.eligible||!u.routeSufficiency.accepted||u.unsupportedTargets.length)return null;
    if(u.arbitration)return u.arbitration.routeId;
    return u.reachesFallback?standalone.get(r.id).selectedRoute:null;
  };
  const rawPathSafety=statistics(rows,possible);
  const observedSafe=(groups,max)=>Object.values(groups).every(x=>x.n===0||x.falseActivation<=max);
  const requiredSafe=(groups,max)=>Object.values(groups).every(x=>x.n>0&&x.falseActivation<=max);
  const componentFeasible=coverage.eligibleToTrain&&conditional.known.exactRetention>=policy.minimumKnownExact&&conditional.known.acceptedAccuracy!==null&&conditional.known.acceptedAccuracy>=policy.minimumAcceptedKnownAccuracy&&conditional.nonRoute.falseActivation<=policy.maximumNonRouteFalseActivation&&observedSafe(conditional.bySubtype,policy.maximumEachObservedSubtypeFalseActivation)&&requiredSafe(conditional.byRoleSafetyGroup,policy.maximumEachRoleSafetyGroupFalseActivation);
  const rawPathSafe=rawPathSafety.nonRoute.n>0&&rawPathSafety.nonRoute.falseActivation<=policy.maximumRawPathFalseActivation&&requiredSafe(rawPathSafety.bySubtype,policy.maximumEachRawSubtypePathFalseActivation)&&requiredSafe(rawPathSafety.byRoleSafetyGroup,policy.maximumEachRawRolePathFalseActivation);
  return {threshold,coverage,conditional,rawStandaloneStress,rawPathSafety,componentFeasible,rawPathSafe,feasible:componentFeasible&&rawPathSafe,integratedDevelopmentPassClaimed:false};
}
