import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const fail = (message) => { throw new Error(message); };
const assert = (condition,message) => { if (!condition) fail(message); };
const normalize = (text) => String(text||'').trim().replace(/\s+/g,'');

const data = read('data/liuyao-semantic-decision-stack-v0.10-development.json');
const inventory = read('data/liuyao-semantic-route-inventory-v0.2.json');
const base = read('data/liuyao-semantic-route-training-v0.1.json');
const augmentation = read('data/liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = read('data/liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = read('data/liuyao-semantic-route-training-v0.4-expansion.json');
const targeted22 = read('data/liuyao-semantic-route-training-v0.5-targeted-22.json');
const legacyDev = read('data/liuyao-semantic-route-eval-v0.1.json');
const blind = read('data/liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = read('data/liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');
const candidate = read('data/liuyao-semantic-router-candidate-eval-v0.1.json');
const v09 = read('data/liuyao-semantic-router-decision-v0.9-development.json');
const v09Patch = read('data/liuyao-semantic-router-decision-v0.9-development-patch.json');
const scope = read('data/liuyao-semantic-scope-gate-v0.1-development.json');
const scopePatch = read('data/liuyao-semantic-scope-gate-v0.1-preuse-patch.json');
const sufficiencySource = fs.readFileSync(path.join(root,'js/liuyao-semantic-sufficiency.js'),'utf8');

assert(data.version === '0.10-development' && data.status === 'development_preuse','v0.10 data metadata mismatch');
assert(data.scope === 'liuyao_current_22_semantic_decision_stack','v0.10 scope mismatch');
assert(data.policy?.modifyV081 === false && data.policy?.modifyScopeGateV01 === false,'frozen component policy mismatch');
assert(data.policy?.reuseScopeGateValidationAsScoreSet === false && data.policy?.reuseV09ValidationAsScoreSet === false,'old development validation reuse must be forbidden');
assert(data.policy?.outsideCurrent22ExcludedFromIdentifiabilityTraining === true,'outside-current-22 must be excluded from identifiability training');
assert(data.policy?.sufficiencyUsesOracleModernSemanticFixtures === true,'Sufficiency fixture policy must be explicit');

const routeIds = (inventory.routes||[]).map((row)=>row.routeId);
assert(routeIds.length===22,'inventory must contain 22 routes');
assert(JSON.stringify(Object.keys(data.identifiability?.route_identifiable||{}))===JSON.stringify(routeIds),'identifiability route order/coverage must match inventory');
assert(JSON.stringify(Object.keys(data.stack_validation?.routes||{}))===JSON.stringify(routeIds),'stack route order/coverage must match inventory');

const seen = new Map();
const remember = (text,bucket) => {
  assert(typeof text==='string' && text.trim(),`empty v0.10 text in ${bucket}`);
  const key=normalize(text);
  assert(!seen.has(key),`duplicate v0.10 text in ${bucket} and ${seen.get(key)}: ${text}`);
  seen.set(key,bucket);
};
const idCounts={train:0,calibration:0,validation:0};
let routeKnownInsufficientTrain=0;
for(const routeId of routeIds){
  const spec=data.identifiability.route_identifiable[routeId];
  const expected={train:2,calibration:1,validation:1};
  for(const [split,count] of Object.entries(expected)){
    assert((spec?.[split]||[]).length===count,`${routeId} ${split} ident count mismatch`);
    for(const sample of spec[split]||[]){
      assert(['sufficient','semantic_insufficient'].includes(sample.downstreamSufficiency),`${routeId} ${split} invalid downstreamSufficiency`);
      remember(sample.text,`identifiable:${split}:${routeId}`);
      if(split==='train'&&sample.downstreamSufficiency==='semantic_insufficient') routeKnownInsufficientTrain+=1;
      idCounts[split]+=1;
    }
  }
}
assert(routeKnownInsufficientTrain===22,`expected one route-known-insufficient train positive per route, got ${routeKnownInsufficientTrain}`);

const unresolvedCats=Object.keys(data.identifiability?.route_unresolved||{});
assert(unresolvedCats.length===11,`identifiability unresolved category count ${unresolvedCats.length} != 11`);
for(const category of unresolvedCats){
  const spec=data.identifiability.route_unresolved[category];
  const expected={train:4,calibration:2,validation:2};
  for(const [split,count] of Object.entries(expected)){
    assert((spec?.[split]||[]).length===count,`${category} ${split} unresolved count mismatch`);
    for(const text of spec[split]||[]){remember(text,`unresolved:${split}:${category}`);idCounts[split]+=1;}
  }
}
assert(idCounts.train===88&&idCounts.calibration===44&&idCounts.validation===44,`identifiability split totals mismatch: ${JSON.stringify(idCounts)}`);

const scopeOutside=data.scope_policy_calibration?.outside_current_22||[];
assert(scopeOutside.length===22,'scope policy outside calibration must contain 22 rows');
for(const text of scopeOutside) remember(text,'scope-policy:outside-calibration');

const slotIds=new Set();
let stackKnown=0;
for(const routeId of routeIds){
  const spec=data.stack_validation.routes[routeId];
  assert((spec?.sufficient||[]).length===2,`${routeId} stack sufficient count != 2`);
  assert(spec?.insufficient,`${routeId} missing stack insufficient sample`);
  for(const sample of spec.sufficient||[]){
    remember(sample.text,`stack:sufficient:${routeId}`);stackKnown+=1;
    assert(sample.goalType&&sample.goalType!=='unknown',`${routeId} sufficient fixture needs explicit goal`);
    for(const slot of sample.slots||[]) slotIds.add(slot);
  }
  const ins=spec.insufficient;
  remember(ins.text,`stack:insufficient:${routeId}`);stackKnown+=1;
  assert(ins.expectedSufficiencyStatus==='semantic_insufficient',`${routeId} insufficient expected status mismatch`);
  for(const slot of ins.slots||[]) slotIds.add(slot);
}
assert(stackKnown===66,`stack known count ${stackKnown} != 66`);
for(const slot of slotIds) assert(sufficiencySource.includes(`${slot}:`)||sufficiencySource.includes(`'${slot}'`)||sufficiencySource.includes(`\"${slot}\"`),`stack fixture references unknown SemanticSlot ${slot}`);

const stackOutside=data.stack_validation?.outside_current_22||[];
const stackUnresolved=data.stack_validation?.route_unresolved||[];
assert(stackOutside.length===22&&stackUnresolved.length===22,'stack reject classes must be 22/22');
for(const text of stackOutside) remember(text,'stack:outside');
for(const text of stackUnresolved) remember(text,'stack:unresolved');
assert(seen.size===308,`v0.10 unique total ${seen.size} != 308`);
assert(data.counts?.total_unique_texts===308&&data.counts?.stack_validation===110,'declared v0.10 totals mismatch');

const forbiddenTraditional=/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;
for(const key of seen.keys()) assert(!forbiddenTraditional.test(key),`v0.10 data leaks traditional LiuYao terminology: ${key}`);

const prior=new Map();
const rememberPrior=(text,bucket)=>{if(typeof text!=='string'||!text.trim())return;const key=normalize(text);if(!prior.has(key))prior.set(key,bucket);};
const addRouteCorpus=(sourceName,source)=>{
  for(const [routeId,spec] of Object.entries(source.routes||{})){
    for(const text of spec.train||[]) rememberPrior(text,`${sourceName}:train:${routeId}`);
    for(const text of spec.validation||[]) rememberPrior(text,`${sourceName}:validation:${routeId}`);
  }
  for(const split of ['train','validation']) for(const sample of source.hardNegatives?.[split]||[]) rememberPrior(sample.text,`${sourceName}:hard:${split}`);
};
addRouteCorpus('v0.1',base);addRouteCorpus('v0.2-augmentation',augmentation);addRouteCorpus('v0.3-targeted',targeted);addRouteCorpus('v0.4-expansion',expansion);addRouteCorpus('v0.5-targeted22',targeted22);
for(const [label,texts] of Object.entries(legacyDev.samples||{})) for(const text of texts||[]) rememberPrior(text,`legacy-dev:${label}`);
for(const [label,texts] of Object.entries(blind.samples||{})) for(const raw of texts||[]) rememberPrior(blindPatch.replacements?.[raw]||raw,`legacy-blind:${label}`);
for(const [routeId,spec] of Object.entries(candidate.routes||{})) for(const raw of spec.samples||[]) rememberPrior(typeof raw==='string'?raw:raw.text,`candidate:${routeId}`);
for(const text of candidate.rejection?.out_of_scope||[]) rememberPrior(text,'candidate:outside');
for(const text of candidate.rejection?.underspecified||[]) rememberPrior(text,'candidate:underspecified');
const effectiveV09=(text)=>v09Patch.replacements?.[text]||text;
for(const [routeId,spec] of Object.entries(v09.routes||{})) for(const split of ['train','calibration','validation']) for(const row of spec[split]||[]) rememberPrior(effectiveV09(row.text),`v0.9:${split}:${routeId}`);
for(const split of ['train','calibration','validation']) for(const kind of ['out_of_scope','underspecified']) for(const text of v09.rejection?.[split]?.[kind]||[]) rememberPrior(effectiveV09(text),`v0.9:${split}:${kind}`);
const effectiveScope=(text)=>scopePatch.replacements?.[text]||text;
for(const [routeId,spec] of Object.entries(scope.supported||{})) for(const split of ['train','calibration','validation']) for(const text of spec[split]||[]) rememberPrior(effectiveScope(text),`scope-v0.1:${split}:${routeId}`);
for(const [category,spec] of Object.entries(scope.outside_current_22||{})) for(const split of ['train','calibration','validation']) for(const text of spec[split]||[]) rememberPrior(effectiveScope(text),`scope-v0.1:${split}:${category}`);
for(const text of scope.diagnostic_unresolved||[]) rememberPrior(effectiveScope(text),'scope-v0.1:diagnostic');

const leaks=[];
for(const [key,bucket] of seen.entries()) if(prior.has(key)) leaks.push(`${bucket} duplicates ${prior.get(key)}: ${key}`);
if(leaks.length) fail(`v0.10 exact overlap(s):\n- ${leaks.join('\n- ')}`);

console.log('LiuYao Semantic Decision Stack v0.10 development data verification passed.');
console.log('- 176 Route Identifiability rows: 88 train / 44 calibration / 44 validation');
console.log('- 22 additional outside-current-22 rows for stack-only Scope hard-reject calibration');
console.log('- 110 independent Stack Validation rows: 66 known / 22 outside / 22 route-unresolved');
console.log('- 22 route-known-insufficient positives retained in Identifiability training');
console.log('- zero exact overlap with prior Router, Blind, sealed Candidate, v0.9, and Scope Gate v0.1 effective corpora');
