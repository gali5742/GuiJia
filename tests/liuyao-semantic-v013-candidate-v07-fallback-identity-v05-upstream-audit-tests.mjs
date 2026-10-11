import test from 'node:test';
import assert from 'node:assert/strict';
import {hashBytes} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
import {verifyRows,makeExposure} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-upstream-audit-lib.mjs';
const routes=['a','b'],u=()=>({semanticAct:{eligible:true},routeSufficiency:{accepted:true},routeability:{accepted:true},unsupportedTargets:[],arbitration:null,reachesFallback:true});
const sources=[{id:'synthetic-1',text:'synthetic known question',expectedRoute:'a',subtype:'known',roleSafetyGroup:null},{id:'synthetic-2',text:'synthetic unresolved question',expectedRoute:null,subtype:'route_unresolved',roleSafetyGroup:'credit_direction'}];
const cache=()=>sources.map(s=>({id:s.id,expectedRoute:s.expectedRoute,subtype:s.subtype,roleSafetyGroup:s.roleSafetyGroup,textSha256:hashBytes(s.text),vector:Array(512).fill(0),upstream:u()}));
test('complete cached raw members replay upstream without encoding',()=>assert.doesNotThrow(()=>verifyRows(cache(),sources,routes,u)));
test('missing or reordered raw rows cannot alter conditional denominator',()=>{
  assert.throws(()=>verifyRows(cache().slice(0,1),sources,routes,u),/ordered unique/);
  assert.throws(()=>verifyRows(cache().reverse(),sources,routes,u),/membership/);
});
test('cache labels and text digests remain bound to sealed members',()=>{
  for(const [key,value]of [['expectedRoute','b'],['textSha256','bad'],['roleSafetyGroup','debt_direction']]){const rows=cache();rows[0][key]=value;assert.throws(()=>verifyRows(rows,sources,routes,u),/membership/);}
});
test('nonfinite or wrongly shaped vectors cannot enter frozen upstream',()=>{
  for(const vector of [Array(511).fill(0),[NaN,...Array(511).fill(0)]]){const rows=cache();rows[0].vector=vector;assert.throws(()=>verifyRows(rows,sources,routes,u),/512-vector/);}
});
test('upstream eligibility cannot be changed while retaining a valid reachability flag',()=>{
  const rows=cache();rows[0].upstream.semanticAct.eligible=false;rows[0].upstream.reachesFallback=false;
  assert.throws(()=>verifyRows(rows,sources,routes,u),/replay drift/);
});
test('permitted Arbitration never also enters fallback',()=>{
  const rows=cache();rows[0].upstream.arbitration={routeId:'a',strength:'strong'};
  assert.throws(()=>verifyRows(rows,sources,routes,u),/reachability inconsistent/);
});
test('coverage failure explicitly prevents weights and same-version replenishment',()=>{
  const report=makeExposure(cache(),routes);assert.equal(report.status,'exposure_failed_before_weight_training');assert.equal(report.eligibleToTrain,false);assert.equal(report.weightsTrained,false);assert.equal(report.sameVersionReplenishmentAllowed,false);
  assert.ok(report.violations.some(v=>v.route==='b'&&v.observed===0&&v.required===2));assert.ok(report.violations.some(v=>v.role==='debt_direction'));assert.equal(report.result.rawIds.length,2);
});
test('valid exposure retains upstream-blocked raw members without adding them to conditional data',()=>{
  const rows=[];let id=0;
  for(const route of routes)for(let i=0;i<2;i++)rows.push({...cache()[0],id:`pass-${id++}`,expectedRoute:route});
  for(let i=0;i<8;i++)rows.push({...cache()[1],id:`pass-${id++}`,roleSafetyGroup:i<2?'credit_direction':i<4?'debt_direction':null});
  rows.push({...cache()[1],id:'blocked',upstream:{...u(),semanticAct:{eligible:false},reachesFallback:false}});
  const report=makeExposure(rows,routes);assert.equal(report.eligibleToTrain,true);assert.equal(report.result.rawIds.length,13);assert.equal(report.result.conditionalIds.length,12);assert.equal(report.violations.length,0);assert.equal(report.weightsTrained,false);
});
