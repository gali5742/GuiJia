import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {admit,exposure,evaluate} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-calibration-policy.mjs';
const routes=['a','b'];
const upstream=()=>({semanticAct:{eligible:true},routeSufficiency:{accepted:true},unsupportedTargets:[],arbitration:null,routeability:{accepted:true},reachesFallback:true});
function cohort() {
  const rows=[];
  for(const r of routes)for(let i=0;i<2;i++)rows.push({id:`${r}${i}`,expectedRoute:r,subtype:'known',roleSafetyGroup:null,upstream:upstream(),probabilities:{a:r==='a'?.9:.1,b:r==='b'?.9:.1}});
  for(let i=0;i<8;i++)rows.push({id:`n${i}`,expectedRoute:null,subtype:'route_unresolved',roleSafetyGroup:i<4?'credit_direction':'debt_direction',upstream:upstream(),probabilities:{a:.1,b:.1}});
  for(const subtype of ['near_domain_not_current_route','outside_current_22'])for(let i=0;i<2;i++)rows.push({id:`${subtype}${i}`,expectedRoute:null,subtype,roleSafetyGroup:null,upstream:{...upstream(),semanticAct:{eligible:false},reachesFallback:false},probabilities:{a:.9,b:.1}});
  return rows;
}
test('upstream-blocked standalone activations remain in raw stress but do not reach the conditional component',()=>{
  const m=evaluate(cohort(),.8,routes);
  assert.equal(m.feasible,true);assert.equal(m.conditional.known.exactRetention,1);
  assert.equal(m.rawStandaloneStress.nonRoute.activated,4);assert.equal(m.rawPathSafety.nonRoute.activated,0);
  assert.deepEqual(m.coverage.unobservedConditionalSubtypes,['near_domain_not_current_route','outside_current_22']);
  assert.equal(m.conditional.bySubtype.outside_current_22.status,'not_estimable');
  assert.equal(m.integratedDevelopmentPassClaimed,false);
});
test('non-route Arbitration blocks feasibility even when Fallback conditional metrics pass',()=>{
  const rows=cohort(),r=rows.find(x=>x.subtype==='near_domain_not_current_route');
  r.upstream={...upstream(),arbitration:{routeId:'a',strength:'strong'},reachesFallback:false};
  const m=evaluate(rows,.8,routes);
  assert.equal(m.componentFeasible,true);assert.equal(m.rawPathSafety.bySubtype.near_domain_not_current_route.falseActivation,.5);assert.equal(m.rawPathSafe,false);assert.equal(m.feasible,false);
});
test('reachable direction ambiguity cannot disappear into a full-raw denominator',()=>{
  const rows=cohort();rows.find(x=>x.id==='n0').probabilities={a:.9,b:.1};
  const m=evaluate(rows,.8,routes);
  assert.equal(m.conditional.byRoleSafetyGroup.credit_direction.falseActivation,.25);assert.equal(m.componentFeasible,false);assert.equal(m.feasible,false);
});
test('each route and both ambiguity groups require exposure before weights',()=>{
  let rows=cohort();rows.find(x=>x.id==='a0').upstream={...upstream(),routeability:{accepted:false},reachesFallback:false};
  assert.equal(exposure(rows,routes).eligibleToTrain,false);
  rows=cohort();for(const r of rows.filter(x=>x.roleSafetyGroup==='debt_direction'))r.upstream={...upstream(),routeSufficiency:{accepted:false},reachesFallback:false};
  assert.equal(exposure(rows,routes).eligibleToTrain,false);
});
test('all-head global admission includes equality and leaves zero/multiple unresolved',()=>{
  assert.equal(admit({a:.8,b:.1},.8,routes).selectedRoute,'a');
  assert.equal(admit({a:.8,b:.8},.8,routes).selectedRoute,null);
  assert.equal(admit({a:.1,b:.1},.8,routes).selectedRoute,null);
  for(const probabilities of [{a:.9},{a:.9,b:NaN},{a:.9,b:1.1},{a:.9,b:.1,c:.2}])assert.throws(()=>admit(probabilities,.8,routes));
});
test('Sufficiency rejection prevents Arbitration rescue and inconsistent membership',()=>{
  const rows=cohort();rows[0].upstream.routeSufficiency.accepted=false;
  assert.throws(()=>exposure(rows,routes),/reachability inconsistent/);
  rows[0].upstream.reachesFallback=false;rows[0].upstream.arbitration={routeId:'a',strength:'strong'};
  assert.throws(()=>exposure(rows,routes),/bypassed Arbitration/);
});
test('raw subtype and role denominators cannot be empty safety passes',()=>{
  const m=evaluate(cohort().filter(x=>x.subtype!=='outside_current_22'),.8,routes);
  assert.equal(m.componentFeasible,true);assert.equal(m.rawPathSafety.bySubtype.outside_current_22.falseActivation,null);assert.equal(m.rawPathSafe,false);
});
test('duplicate IDs, invalid labels and unrecognized Arbitration strength fail closed',()=>{
  const rows=cohort();assert.throws(()=>exposure([...rows,rows[0]],routes));
  rows[0].expectedRoute='unknown';assert.throws(()=>exposure(rows,routes));
  rows[0].expectedRoute='a';rows[0].upstream.arbitration={routeId:'a',strength:'weak'};rows[0].upstream.reachesFallback=false;
  assert.throws(()=>exposure(rows,routes));
});
test('new safety policy is insensitive to question wording, cached vectors and Router diagnostics',()=>{
  const rows=cohort(),before=evaluate(rows,.8,routes);
  for(const r of rows){r.text='synthetic unused string';r.vector=[999];r.router={top1:'b'};r.traditional={forbidden:true};}
  assert.deepEqual(evaluate(rows,.8,routes),before);
});
test('preloaded guard rejects protected synchronous, asynchronous and stream reads before I/O',()=>{
  const guard=fileURLToPath(new URL('../scripts/liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs',import.meta.url));
  const probe=fileURLToPath(new URL('../data/nonexistent-blind-guard-probe.json',import.meta.url));
  const code=`const fs=require('node:fs');const p=${JSON.stringify(probe)};const assert=require('node:assert/strict');const blocked=e=>e.code==='GUIJIA_EVALUATION_READ_FORBIDDEN';for(const fn of [()=>fs.readFileSync(p),()=>fs.openSync(p,'r'),()=>fs.createReadStream(p)])assert.throws(fn,blocked);Promise.all([assert.rejects(fs.promises.readFile(p),blocked),assert.rejects(fs.promises.open(p,'r'),blocked)]).catch(()=>process.exitCode=1);`;
  const result=spawnSync(process.execPath,['--require',guard,'-e',code],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});
