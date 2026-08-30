import './verify-liuyao-semantic-decision-stack-v012-sealed-blind-runtime.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.join(root,'data');
const targetName='liuyao-semantic-decision-stack-v0.12-sealed-blind-v0.1.json';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read(`data/${targetName}`);const inventory=read('data/liuyao-semantic-route-inventory-v0.2.json');
const fail=m=>{throw new Error(m)};const assert=(c,m)=>{if(!c)fail(m)};const norm=t=>String(t||'').trim().replace(/\s+/g,'');
assert(data.version==='0.1'&&data.status==='sealed'&&data.sealed===true,'v0.12 Blind seal mismatch');
assert(data.scope==='liuyao_semantic_decision_stack_v0.12_sealed_blind'&&data.baseStack==='Semantic Decision Stack v0.12','v0.12 Blind scope/base mismatch');
for(const key of ['modifyV012FromBlind','recalibrateFromBlind','reuseBlindAsTraining','rerunAfterTuningSameVersion'])assert(data.policy?.[key]===false,`${key} must be false`);
for(const key of ['routerIsFrozenV081','scopeGateAndHardVetoFrozen','sharedEvidenceIsV01','arbitrationIsV010','routeIdentityIsV02','sufficiencyIsFrozenV02','outsideVsUnresolvedDiagnosticOnly','sufficiencyUsesOracleModernSemanticFixtures','traditionalLiuYaoFieldsForbidden'])assert(data.policy?.[key]===true,`${key} must be true`);
const routeIds=inventory.routes.map(r=>r.routeId);assert(routeIds.length===22,'inventory route count mismatch');assert(JSON.stringify(Object.keys(data.routes||{}))===JSON.stringify(routeIds),'Blind route order/coverage mismatch');
const rows=[];let seq=1;const goalMap={o:'outcome',c:'choice',u:'unknown'};
for(const rid of routeIds){const spec=data.routes[rid];assert(Array.isArray(spec?.texts)&&spec.texts.length===8,`${rid}: expected 8 texts`);assert(typeof spec.goals==='string'&&spec.goals.length===8,`${rid}: goal code length`);assert(Array.isArray(spec.slots)&&spec.slots.length,`${rid}: slots missing`);for(let i=0;i<8;i++){const code=spec.goals[i];assert(goalMap[code],`${rid}: bad goal code ${code}`);const expectedSufficiencyStatus=i<6?'sufficient':'semantic_insufficient';assert(i<6?code!=='u':code==='u',`${rid}: 6+2 goal/sufficiency contract drift at ${i}`);rows.push({id:`B12-${String(seq++).padStart(3,'0')}`,text:spec.texts[i],bucket:`known:${rid}`,expectedSufficiencyStatus});}}
assert(data.outside_current_22?.length===60,'outside count mismatch');for(const text of data.outside_current_22)rows.push({id:`B12-${String(seq++).padStart(3,'0')}`,text,bucket:'outside'});
assert(data.route_unresolved?.length===40,'unresolved count mismatch');for(const text of data.route_unresolved)rows.push({id:`B12-${String(seq++).padStart(3,'0')}`,text,bucket:'unresolved'});
assert(data.adversarial?.length===24,'adversarial count mismatch');const advCounts={known:0,outside:0,unresolved:0};for(const a of data.adversarial){assert(['known','outside','unresolved'].includes(a.kind),`bad adversarial kind ${a.kind}`);advCounts[a.kind]++;if(a.kind==='known'){assert(routeIds.includes(a.route),'adversarial known route invalid');assert(goalMap[a.goal]&&a.goal!=='u','adversarial known goal invalid');assert(Array.isArray(a.slots)&&a.slots.length,'adversarial known slots missing');}rows.push({id:`B12-${String(seq++).padStart(3,'0')}`,text:a.text,bucket:`adversarial:${a.kind}`});}
assert(advCounts.known===8&&advCounts.outside===8&&advCounts.unresolved===8,'adversarial 8/8/8 mismatch');
assert(rows.length===300&&seq===301,'Blind total/id sequence mismatch');const c=data.counts||{};assert(c.route_known_regular===176&&c.outside_regular===60&&c.unresolved_regular===40&&c.adversarial===24&&c.total===300&&c.adversarial_known===8&&c.adversarial_outside===8&&c.adversarial_unresolved===8,'Blind counts metadata mismatch');
const seen=new Map();for(const row of rows){assert(typeof row.text==='string'&&row.text.trim(),`empty ${row.id}`);const k=norm(row.text);if(seen.has(k))fail(`internal duplicate ${row.id} / ${seen.get(k)}: ${row.text}`);seen.set(k,row.id);}assert(seen.size===300,'Blind unique total mismatch');
const traditional=/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;const health=/(疾病|生病|病情|手术|治疗|就医|医生|医院|健康状况|身体状况)/;for(const row of rows){assert(!traditional.test(row.text),`traditional terminology leak: ${row.id} ${row.text}`);assert(!health.test(row.text),`health/disease sample forbidden: ${row.id} ${row.text}`);}
const prior=new Map();const addPrior=(value,source)=>{if(typeof value!=='string')return;const k=norm(value);if(k.length<6||!/\p{Script=Han}/u.test(k))return;if(!prior.has(k))prior.set(k,source);};const walk=(value,source)=>{if(typeof value==='string'){addPrior(value,source);return;}if(Array.isArray(value)){value.forEach(v=>walk(v,source));return;}if(value&&typeof value==='object')Object.values(value).forEach(v=>walk(v,source));};
for(const name of fs.readdirSync(dataDir).filter(n=>n.startsWith('liuyao-')&&n.endsWith('.json')&&n!==targetName)){walk(JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8')),name);}
const overlaps=[];for(const row of rows){const k=norm(row.text);if(prior.has(k))overlaps.push(`${row.id} ${row.bucket} duplicates ${prior.get(k)}: ${row.text}`);}if(overlaps.length)fail(`v0.12 sealed Blind exact overlap(s):\n- ${overlaps.join('\n- ')}`);
console.log('LiuYao Semantic Decision Stack v0.12 Sealed Blind v0.1 verification passed.');
console.log('- sealed=true; 300 total: 176 regular known + 60 outside + 40 unresolved + 24 adversarial');
console.log('- 22 routes × 8 regular samples; each route 6 sufficient + 2 route-known insufficient');
console.log('- adversarial split: 8 known + 8 outside + 8 unresolved');
console.log('- no traditional LiuYao terminology or health/disease divination samples');
console.log('- zero exact question overlap with prior LiuYao JSON corpora');
