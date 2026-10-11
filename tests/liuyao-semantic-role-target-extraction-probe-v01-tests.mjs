import test from 'node:test';
import assert from 'node:assert/strict';
import {missingBag,projectEvidence,measure,loadApis,unverifiedPacket} from '../scripts/liuyao-semantic-role-target-extraction-probe-v01.mjs';
const goal=(intent,role='unknown')=>({intent,role});

test('duplicate intent multiplicity is retained in completeness measurements',()=>{
  assert.deepEqual(missingBag(['new_credit','new_credit'],['new_credit']),['new_credit']);
  const m=measure([goal('new_credit','self_receives'),goal('new_credit','self_provides')],[goal('new_credit','self_receives')]);
  assert.equal(m.exactFacts,false);assert.equal(m.exactIntents,false);assert.deepEqual(m.missingIntents,['new_credit']);
});
test('correct counts cannot disguise reversed participant roles',()=>{
  const m=measure([goal('existing_debt','self_debtor')],[goal('existing_debt','self_creditor')]);
  assert.equal(m.exactIntents,true);assert.equal(m.exactFacts,false);
  assert.deepEqual(m.contradictoryRoleFacts,['existing_debt:self_creditor']);
});
test('absence of a known role is an omission, not a contradictory assertion',()=>{
  const m=measure([goal('new_credit','self_receives')],[]);
  assert.deepEqual(m.missingFacts,['new_credit:self_receives']);assert.deepEqual(m.contradictoryRoleFacts,[]);
});
test('unknown direction never becomes a correct role because the intent matches',()=>{
  const m=measure([goal('new_credit')],[goal('new_credit','self_receives')]);
  assert.equal(m.exactIntents,true);assert.equal(m.exactFacts,false);assert.equal(m.unknownRoleAssertions.length,1);
});
test('third-party direction is not equivalent to the same questioner direction',()=>{
  const m=measure([goal('new_credit','other_subject')],[goal('new_credit','self_receives')]);
  assert.equal(m.thirdPartySelfAssertions.length,1);assert.equal(m.exactFacts,false);
});
test('background extras and active-goal omissions are counted separately',()=>{
  const m=measure([goal('business_operation')],[goal('business_operation'),goal('new_credit','self_receives')]);
  assert.deepEqual(m.missingIntents,[]);assert.deepEqual(m.extraIntents,['new_credit']);assert.equal(m.exactFacts,false);
});
test('projection cannot drop a second direction via else-if priority',()=>{
  const rules=[{field:'directions',tag:'in',goal:goal('new_credit','self_receives')},{field:'directions',tag:'out',goal:goal('new_credit','self_provides')}];
  assert.equal(projectEvidence({directions:['in','out']},rules).length,2);
});
test('profit without an investment domain does not automatically become capital return',()=>{
  const rules=[{field:'currentTargets',tag:'profit',requires:{field:'domains',tag:'investment'},goal:goal('investment_return')}];
  assert.equal(projectEvidence({currentTargets:['profit'],domains:['business']},rules).length,0);
});
test('changing goal order does not change exactness, but multiplicity does',()=>{
  const a=goal('business_operation'),b=goal('investment_return');
  assert.equal(measure([a,b],[b,a]).exactFacts,true);assert.equal(measure([a,a],[a]).exactFacts,false);
});
test('projected facts have no fabricated provenance and cannot authorize either branch',()=>{
  const {gate}=loadApis(),p=unverifiedPacket(gate,'fixture','此合成文本仅用于检查提取结果的权限。',[goal('new_credit','self_receives')]);
  assert.equal(p.goalInventorySource,'unverified');assert.deepEqual(p.goals[0].role.evidence,[]);
  const upstream={semanticAct:{eligible:true},routeSufficiency:{accepted:true},routeability:{accepted:true},unsupportedTargets:[],arbitration:{routeId:'borrow_money',strength:'strong'}};
  for(const source of ['Arbitration','Fallback']){
    const a=gate.authorize(p,upstream,{source});assert.equal(a.status,'clarify');assert.equal(a.selectedRoute,null);
    assert.equal(a.permissions.mayRunArbitration,false);assert.equal(a.permissions.mayRunFallback,false);
  }
});
