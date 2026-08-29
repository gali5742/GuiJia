import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.join(root,'data');
const targetName='liuyao-semantic-decision-stack-v0.12-development.json';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read(`data/${targetName}`);const inventory=read('data/liuyao-semantic-route-inventory-v0.2.json');
const fail=m=>{throw new Error(m)};const assert=(c,m)=>{if(!c)fail(m)};const norm=t=>String(t||'').trim().replace(/\s+/g,'');
assert(data.version==='0.12-development'&&data.status==='development_preuse','v0.12 metadata mismatch');
for(const key of ['modifyV081','modifyScopeGateV01','modifyV011SealedBlind','modifySufficiencyV02','modifyRuleRegistry','reuseV011BlindAsScoreSet'])assert(data.policy?.[key]===false,`${key} must be false`);
assert(data.policy?.sharedEvidenceRequired===true&&data.policy?.currentTargetOverridesBackground===true&&data.policy?.supportArbitrationCannotOverrideHead===true&&data.policy?.routeIdentityUsesSharedEvidence===true,'v0.12 responsibility contract mismatch');
const routeIds=inventory.routes.map(r=>r.routeId);assert(routeIds.length===22,'inventory route count mismatch');assert(JSON.stringify(Object.keys(data.routes))===JSON.stringify(routeIds),'v0.12 route order/coverage mismatch');
const rows=[];for(const rid of routeIds){const samples=data.routes[rid]?.samples||[];assert(samples.length===3,`${rid}: expected 3 samples`);const sufficient=samples.filter(s=>s.expectedSufficiencyStatus==='sufficient');const insufficient=samples.filter(s=>s.expectedSufficiencyStatus==='semantic_insufficient');assert(sufficient.length===2&&insufficient.length===1,`${rid}: expected 2 sufficient + 1 insufficient`);for(const s of sufficient){assert(s.goalType&&s.goalType!=='unknown'&&Array.isArray(s.slots)&&s.slots.length,`${rid}: sufficient fixture incomplete`);rows.push({text:s.text,bucket:`known:${rid}`});}for(const s of insufficient){assert(s.goalType==='unknown'&&Array.isArray(s.slots)&&s.slots.length,`${rid}: insufficient fixture incomplete`);rows.push({text:s.text,bucket:`known:${rid}:insufficient`});}}
assert(data.outside_current_22?.length===22&&data.route_unresolved?.length===22,'v0.12 reject counts mismatch');data.outside_current_22.forEach(text=>rows.push({text,bucket:'outside'}));data.route_unresolved.forEach(text=>rows.push({text,bucket:'unresolved'}));assert(rows.length===110&&data.counts?.total===110&&data.counts?.known===66&&data.counts?.outside===22&&data.counts?.unresolved===22,'v0.12 counts mismatch');
const seen=new Map();for(const row of rows){assert(typeof row.text==='string'&&row.text.trim(),`empty ${row.bucket}`);const k=norm(row.text);if(seen.has(k))fail(`internal duplicate: ${row.bucket} / ${seen.get(k)}: ${row.text}`);seen.set(k,row.bucket);}assert(seen.size===110,'v0.12 unique total mismatch');
const traditional=/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;const health=/(疾病|生病|病情|手术|治疗|就医|医生|医院|健康状况|身体状况)/;for(const row of rows){assert(!traditional.test(row.text),`traditional terminology leak: ${row.text}`);assert(!health.test(row.text),`health/disease sample forbidden: ${row.text}`);}
const prior=new Map();const addPrior=(value,source)=>{if(typeof value!=='string')return;const k=norm(value);if(k.length<6||!/\p{Script=Han}/u.test(k))return;if(!prior.has(k))prior.set(k,source);};const walk=(value,source)=>{if(typeof value==='string'){addPrior(value,source);return;}if(Array.isArray(value)){value.forEach(v=>walk(v,source));return;}if(value&&typeof value==='object')Object.values(value).forEach(v=>walk(v,source));};
for(const name of fs.readdirSync(dataDir).filter(n=>n.startsWith('liuyao-')&&n.endsWith('.json')&&n!==targetName)){walk(JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8')),name);}
const overlaps=[];for(const row of rows){const k=norm(row.text);if(prior.has(k))overlaps.push(`${row.bucket} duplicates ${prior.get(k)}: ${row.text}`);}if(overlaps.length)fail(`v0.12 exact overlap(s):\n- ${overlaps.join('\n- ')}`);
console.log('LiuYao Semantic Decision Stack v0.12 development data verification passed.');
console.log('- 110 fresh rows: 66 known / 22 outside / 22 unresolved');
console.log('- 22 routes × 3: each 2 sufficient + 1 route-known insufficient');
console.log('- no traditional LiuYao terminology or health/disease divination samples');
console.log('- zero exact overlap with prior LiuYao JSON corpora, including v0.11 sealed blind');
