import test from 'node:test';
import assert from 'node:assert/strict';
import {upstreamSafetyLowerBound} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-safety-bound.mjs';
import {evaluate} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
const routes=['a','b'];
const row=(id,overrides={})=>({id,expectedRoute:null,subtype:'route_unresolved',roleSafetyGroup:null,upstream:{semanticAct:{eligible:true},routeSufficiency:{accepted:true},unsupportedTargets:[],arbitration:null,routeability:{accepted:true},reachesFallback:true,...overrides}});
test('unconditional Arbitration lower bound survives arbitrary Fallback admissions and thresholds',()=>{
  const rows=[row('arb',{arbitration:{routeId:'a',strength:'support'},reachesFallback:false}),row('fallback')],bound=upstreamSafetyLowerBound(rows,routes);
  assert.equal(bound.nonRoute.minimumPossibleFalseActivation,.5);assert.equal(bound.anyFallbackWeightsAndThresholdCanSatisfyFrozenRawPathSafety,false);
  for(const scores of [{a:0,b:0},{a:.9,b:.1},{a:1,b:1}])for(const threshold of [0,.1,.5,1]){
    const result=evaluate(rows.map(r=>({...r,probabilities:scores})),threshold,routes);
    assert.ok(result.rawPathSafety.nonRoute.falseActivation>=bound.nonRoute.minimumPossibleFalseActivation);
  }
});
test('Act, Sufficiency and unsupported blockers do not contribute to the lower bound',()=>{
  const rows=[row('act',{semanticAct:{eligible:false},reachesFallback:false}),row('suff',{routeSufficiency:{accepted:false},reachesFallback:false}),row('unsupported',{unsupportedTargets:['target'],reachesFallback:false})];
  assert.equal(upstreamSafetyLowerBound(rows,routes).nonRoute.fixedArbitrationActivations,0);
});
test('safe lower bound alone cannot claim trainability or calibration success',()=>{
  const bound=upstreamSafetyLowerBound([row('empty-arb')],routes);assert.equal(bound.anyFallbackWeightsAndThresholdCanSatisfyFrozenRawPathSafety,null);assert.equal(bound.thresholdSearchPerformed,false);
  assert.equal(bound.bySubtype.outside_current_22.minimumPossibleFalseActivation,null);assert.equal(bound.bySubtype.outside_current_22.status,'not_estimable');
});
test('subtype and direction denominators can independently prove frozen safety infeasible',()=>{
  const rows=Array.from({length:100},(_,i)=>({...row(`nr-${i}`),subtype:i<10?'route_unresolved':'outside_current_22',roleSafetyGroup:i<8?'debt_direction':null}));
  rows[0].upstream={...rows[0].upstream,arbitration:{routeId:'a',strength:'strong'},reachesFallback:false};
  const result=upstreamSafetyLowerBound(rows,routes);assert.equal(result.nonRoute.minimumPossibleFalseActivation,.01);assert.equal(result.bySubtype.route_unresolved.minimumPossibleFalseActivation,.1);assert.equal(result.byRoleSafetyGroup.debt_direction.minimumPossibleFalseActivation,.125);assert.equal(result.violations.length,2);
});
test('invalid upstream and duplicate membership cannot be used to manufacture a proof',()=>{
  assert.throws(()=>upstreamSafetyLowerBound([row('id'),row('id')],routes),/unique/);
  assert.throws(()=>upstreamSafetyLowerBound([row('id',{arbitration:{routeId:'a',strength:'strong'}})],routes),/reachability inconsistent/);
});
