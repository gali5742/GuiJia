import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '').replace(/[，。！？、；：,.!?;:]/g, '');
const grams = (value, n=3) => {
  const text = normalize(value); const set = new Set();
  if (text.length < n) { if (text) set.add(text); return set; }
  for (let i=0;i<=text.length-n;i+=1) set.add(text.slice(i,i+n));
  return set;
};
const jaccard = (a,b) => {
  const A=grams(a), B=grams(b); let intersection=0;
  for (const token of A) if (B.has(token)) intersection += 1;
  const union=A.size+B.size-intersection;
  return union ? intersection/union : 0;
};

const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.3.json';
const calibrationPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.lock.json';
const inventory=readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const schema=readJson(schemaPath);
const calibration=readJson(calibrationPath);
const routeIds=inventory.routes.map((row)=>row.routeId);
const routeSet=new Set(routeIds);

assert(schema.status==='frozen_after_v02_sealed_reachability_failure_before_new_calibration_generation','schema v0.3 not frozen');
assert(schema.carriedTrainingAugmentation.sha256==='ef15c664855d2a75ff988f7296d8b15a2da4f951c39fcd645f6e883b1b0f50d6','carried training SHA drift');
assert(sha256(schema.carriedTrainingAugmentation.path)===schema.carriedTrainingAugmentation.sha256,'carried training file drift');
assert(sha256(schema.supersededCalibration.path)===schema.supersededCalibration.sha256,'superseded calibration drift');
assert(routeIds.length===22,'route inventory !=22');
assert(calibration.version==='0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.3','calibration version drift');
assert(['presealed_fallback_stage_calibration','sealed_fallback_stage_calibration'].includes(calibration.status),`calibration status ${calibration.status}`);
assert(calibration.sealed===(calibration.status==='sealed_fallback_stage_calibration'),'sealed/status mismatch');
assert(calibration.schema===schemaPath,'calibration schema pointer drift');
assert(calibration.rows?.length===264,`rows ${calibration.rows?.length} !=264`);
assert(calibration.policy?.encoderScoringObserved===false,'encoder scoring observed before/inside calibration seal');
assert(calibration.policy?.semanticActProbabilityUsedForGeneration===false,'Semantic Act probability used for generation');
assert(calibration.policy?.routeabilityProbabilityUsedForGeneration===false,'Routeability probability used for generation');
assert(calibration.policy?.fallbackIdentityProbabilityUsed===false,'Fallback probability used before training');
assert(calibration.policy?.sourceReachabilityFailureResultsRowsRead===false,'failed audit results rows were read');
assert(calibration.policy?.independentEvaluationRead===false && calibration.policy?.sealedBlindEvaluationRead===false,'protected evaluation read');

const rows=calibration.rows;
const count=(predicate)=>rows.filter(predicate).length;
assert(count((r)=>r.identityLabel==='route_identity_positive')===132,'known count !=132');
assert(count((r)=>r.identityLabel==='non_route')===132,'non-route count !=132');
assert(count((r)=>r.subtype==='near_domain_not_current_route')===88,'near-domain count !=88');
assert(count((r)=>r.subtype==='outside_current_22')===22,'outside-current22 count !=22');
assert(count((r)=>r.subtype==='route_unresolved')===22,'route-unresolved count !=22');
for(const routeId of routeIds){
  const routeRows=rows.filter((r)=>r.expectedRoute===routeId);
  assert(routeRows.length===6,`${routeId} known count ${routeRows.length} !=6`);
  assert(new Set(routeRows.map((r)=>r.wordingPattern)).size>=3,`${routeId} wording diversity <3`);
}

const exact=new Map();
for(const row of rows){
  const text=normalize(row.text);
  assert(text.length>=4,`too-short row ${row.id}`);
  assert(!exact.has(text),`fresh exact duplicate ${row.id}/${exact.get(text)}`);
  exact.set(text,row.id);
  assert(typeof row.semanticAxis==='string'&&row.semanticAxis,`missing semanticAxis ${row.id}`);
  assert(typeof row.confusableFamily==='string'&&row.confusableFamily,`missing confusableFamily ${row.id}`);
  assert(typeof row.wordingPattern==='string'&&row.wordingPattern,`missing wordingPattern ${row.id}`);
  if(row.identityLabel==='route_identity_positive'){
    assert(routeSet.has(row.expectedRoute),`unknown expectedRoute ${row.id}/${row.expectedRoute}`);
    assert(row.subtype==='fallback_stage_known',`known subtype drift ${row.id}`);
  } else {
    assert(row.expectedRoute==null,`non-route has expectedRoute ${row.id}`);
  }
  for(const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神']) assert(!text.includes(term),`traditional LiuYao term leaked ${row.id}/${term}`);
  for(const term of ['疾病','病情','健康占','手术结果','疗效','药效','康复','诊断结果','检查结果']) assert(!text.includes(term),`health-policy term leaked ${row.id}/${term}`);
}

const freshNear=[];
for(let i=0;i<rows.length;i+=1) for(let j=i+1;j<rows.length;j+=1){
  const similarity=jaccard(rows[i].text,rows[j].text);
  if(similarity>=0.82) freshNear.push({a:rows[i].id,b:rows[j].id,similarity,aText:rows[i].text,bText:rows[j].text});
}
assert(freshNear.length===0,`fresh calibration near duplicates >=0.82 (${freshNear.length}): ${JSON.stringify(freshNear.slice(0,12))}`);

// Deterministic stage eligibility only: no encoder/model probabilities.
const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};
context.window=context; context.globalThis=context; vm.createContext(context);
for(const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract&&arbitration?.arbitrate,'deterministic modules failed to load');
const deterministicFailures=[];
for(const row of rows){
  const evidence=extractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const unsupported=evidence.unsupportedTargets||[];
  const requiresNoUnsupported=row.identityLabel==='route_identity_positive'||row.subtype==='near_domain_not_current_route';
  if((requiresNoUnsupported&&unsupported.length)||arb!=null){
    deterministicFailures.push({id:row.id,label:row.identityLabel,subtype:row.subtype,route:row.expectedRoute,text:row.text,unsupported,arbitration:arb});
  }
}
assert(deterministicFailures.length===0,`deterministic Fallback-stage eligibility failures (${deterministicFailures.length}): ${JSON.stringify(deterministicFailures.slice(0,20))}`);

// Exact/near contamination audit against explicitly permitted non-protected sources only.
const explicitSources=new Set([
  path.basename(schema.carriedTrainingAugmentation.path),
  path.basename(schema.supersededCalibration.path),
  'liuyao-semantic-v013-candidate-v04-semantic-act-training.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json',
  'liuyao-semantic-v013-candidate-v03-development.json'
]);
for(const name of fs.readdirSync(dataDir)){
  if(!name.startsWith('liuyao-')||!name.endsWith('.json')) continue;
  if(/(independent|blind|diagnostic|report|literature|research|next-topic|reachability-audit)/i.test(name)) continue;
  if(/(training|calibration)/i.test(name)) explicitSources.add(name);
}
explicitSources.delete(path.basename(calibrationPath));
explicitSources.delete(path.basename(lockPath));
const priorStrings=[];
const collect=(value,source)=>{
  if(typeof value==='string'){
    const text=normalize(value);
    if(text.length>=4&&/[\u3400-\u9fff]/.test(text)) priorStrings.push({text,raw:value,source});
    return;
  }
  if(Array.isArray(value)){for(const item of value) collect(item,source);return;}
  if(value&&typeof value==='object') for(const item of Object.values(value)) collect(item,source);
};
for(const name of [...explicitSources].sort()){
  const full=path.join(dataDir,name);
  if(fs.existsSync(full)) collect(JSON.parse(fs.readFileSync(full,'utf8')),name);
}
const priorExact=new Map();
for(const item of priorStrings) if(!priorExact.has(item.text)) priorExact.set(item.text,item.source);
const overlaps=[]; const nearOverlaps=[];
for(const row of rows){
  const n=normalize(row.text);
  if(priorExact.has(n)) overlaps.push({id:row.id,text:row.text,source:priorExact.get(n)});
  for(const item of priorStrings){
    const similarity=jaccard(row.text,item.raw);
    if(similarity>=0.84){nearOverlaps.push({id:row.id,text:row.text,source:item.source,sourceText:item.raw,similarity});break;}
  }
}
assert(overlaps.length===0,`historical exact overlaps (${overlaps.length}): ${JSON.stringify(overlaps.slice(0,12))}`);
assert(nearOverlaps.length===0,`historical near overlaps >=0.84 (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0,12))}`);

const generatorPath='scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v03.mjs';
const generator=fs.readFileSync(path.join(root,generatorPath),'utf8');
assert(!/@huggingface\/transformers|pipeline\s*\(/.test(generator),'generator contains encoder/model invocation');
assert(!generator.includes('liuyao-semantic-v013-candidate-v04-fallback-identity-v02-reachability-audit-v0.1.json'),'generator reads/references forbidden row-level reachability report');
assert(!/candidate-v03-development-failure-diagnostic|independent|sealed-blind/i.test(generator),'generator contains protected evaluation/failure-data marker');

if(calibration.sealed){
  assert(fs.existsSync(path.join(root,lockPath)),'sealed calibration lock missing');
  const lock=readJson(lockPath);
  assert(lock.status==='locked','calibration v0.3 lock not locked');
  assert(lock.calibrationSha256===sha256(calibrationPath),'calibration SHA drift');
  assert(lock.schemaSha256===sha256(schemaPath),'schema SHA drift');
  assert(lock.carriedTrainingSha256===schema.carriedTrainingAugmentation.sha256,'carried training lock SHA drift');
}

console.log('Candidate v0.4 Fallback Identity v0.2 calibration v0.3 verified without encoder scoring.');
console.log('- rows: 264 = 132 known + 88 near-domain + 22 outside-current22 + 22 unresolved');
console.log('- known: 22/22 routes x 6; all known and near-domain deterministic Fallback-stage eligible');
console.log('- fresh exact/near duplicates: 0');
console.log(`- historical isolation sources read: ${explicitSources.size}; exact overlap: 0; near overlap >=0.84: 0`);
console.log('- protected independent/blind/diagnostic/reachability-result content not read');
