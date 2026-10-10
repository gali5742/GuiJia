import test from 'node:test';
import strict from 'node:assert/strict';
import {contract} from '../scripts/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
import {admit,metrics,feasible,calibrate} from '../scripts/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-execution-lib.mjs';
const c=contract(),routes=c.routes;
const scores=(assign={})=>Object.fromEntries(routes.map(r=>[r,assign[r]??.01]));
const fixture=()=>[
  ...routes.flatMap(r=>Array.from({length:3},()=>({expectedRoute:r,subtype:'known',roleSafetyGroup:null,probabilities:scores({[r]:.9})}))),
  ...['route_unresolved','near_domain_not_current_route','outside_current_22'].flatMap(s=>Array.from({length:22},(_,i)=>({expectedRoute:null,subtype:s,roleSafetyGroup:s==='route_unresolved'&&i<8?(i<4?'credit_direction':'debt_direction'):null,probabilities:scores()})))
];
test('unique route outside any imagined Router Top2 is selectable',()=>strict.equal(admit(scores({marital_relationship:.8}),.7,routes).selectedRoute,'marital_relationship'));
test('at-threshold probability is admitted; zero admissions unresolved',()=>{strict.equal(admit(scores({borrow_money:.7}),.7,routes).selectedRoute,'borrow_money');strict.equal(admit(scores(),.7,routes).status,'route_unresolved');});
test('two admissions remain unresolved irrespective of rank/margin',()=>{const d=admit(scores({borrow_money:.99,lend_money:.8}),.7,routes);strict.equal(d.selectedRoute,null);strict.equal(d.admitted.length,2);});
test('all22 scores required; Router subset cannot be passed',()=>strict.throws(()=>admit({borrow_money:.8,lend_money:.1},.7,routes),/All22/));
test('predeclared feasible regime maximizes known exact retention',()=>{const r=calibrate(fixture(),c.calibration,routes);strict.equal(r.status,'calibration_passed');strict.equal(r.selectedMetrics.known.exactRetention,1);strict.equal(r.selectedMetrics.nonRoute.falseActivation,0);});
test('missing subtype or empty accepted cohort never implies safety pass',()=>{strict.equal(feasible(metrics(fixture(),1,routes),c.calibration.gates),false);strict.equal(feasible(metrics(fixture().filter(r=>r.subtype!=='outside_current_22'),.7,routes),c.calibration.gates),false);});
test('role ambiguity hard-negative gate catches aggregate-hidden leakage',()=>{
  const rows=fixture();rows[66].probabilities=scores({borrow_money:.9});const m=metrics(rows,.7,routes);
  strict.ok(m.nonRoute.falseActivation<=.05);strict.ok(m.bySubtype.route_unresolved.falseActivation<=.05);
  strict.equal(m.byRoleSafetyGroup.credit_direction.falseActivation,.25);strict.equal(feasible(m,c.calibration.gates),false);
});
test('no feasible threshold yields immutable failure without selected threshold',()=>{const rows=fixture();for(let i=0;i<8;i++)rows[i].probabilities=scores({marital_relationship:.99});const r=calibrate(rows,c.calibration,routes);strict.equal(r.status,'calibration_failed_no_feasible_global_threshold');strict.equal(r.selectedThreshold,null);strict.equal(r.feasibleRegimes,0);});
