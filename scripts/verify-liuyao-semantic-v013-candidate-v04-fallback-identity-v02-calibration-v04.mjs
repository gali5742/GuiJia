import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.join(root,'data');
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const sha256=(relative)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const normalize=(value)=>String(value||'').trim().replace(/\s+/g,'').replace(/[，。！？、；：,.!?;:]/g,'');
const grams=(value,n=3)=>{const text=normalize(value);const set=new Set();if(text.length<n){if(text)set.add(text);return set;}for(let i=0;i<=text.length-n;i+=1)set.add(text.slice(i,i+n));return set;};
const jaccard=(a,b)=>{const A=grams(a),B=grams(b);let intersection=0;for(const token of A)if(B.has(token))intersection+=1;const union=A.size+B.size-intersection;return union?intersection/union:0;};

const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json';
const calibrationPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.lock.json';
const schema=readJson(schemaPath);
const calibration=readJson(calibrationPath);
const inventory=readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds=inventory.routes.map((row)=>row.routeId);
const routeSet=new Set(routeIds);

assert(schema.status==='frozen_after_v03_sealed_reachability_failure_before_new_calibration_generation','schema v0.4 not frozen');
assert(sha256(schema.carriedTrainingAugmentation.path)===schema.carriedTrainingAugmentation.sha256,'carried training drift');
assert(sha256(schema.supersededCalibration.path)===schema.supersededCalibration.sha256,'superseded v0.3 calibration drift');
assert(sha256(schema.supersededCalibration.reachabilityReportPath)===schema.supersededCalibration.reachabilityReportSha256,'v0.3 reachability report drift');
assert(calibration.version==='0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.4','calibration v0.4 version drift');
assert(['presealed_fallback_stage_calibration','sealed_fallback_stage_calibration'].includes(calibration.status),`unexpected status ${calibration.status}`);
assert(calibration.sealed===(calibration.status==='sealed_fallback_stage_calibration'),'sealed/status mismatch');
assert(calibration.schema===schemaPath,'schema pointer drift');
assert(calibration.rows?.length===704,`rows ${calibration.rows?.length} !=704`);
for(const [field,expected] of Object.entries({encoderScoringObserved:false,semanticActProbabilityUsedForGeneration:false,routeabilityProbabilityUsedForGeneration:false,fallbackIdentityProbabilityUsed:false,v03CalibrationTextReadForGeneration:false,v03ReachabilityRowResultsRead:false,candidateV03FailureRowsRead:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,routerTopKUsedForGeneration:false,aggregateFailureEvidenceOnly:true})) assert(calibration.policy?.[field]===expected,`policy drift ${field}`);

const rows=calibration.rows;
const count=(predicate)=>rows.filter(predicate).length;
assert(routeIds.length===22,'route inventory !=22');
assert(count((r)=>r.identityLabel==='route_identity_positive')===220,'known count !=220');
assert(count((r)=>r.identityLabel==='non_route')===484,'non-route count !=484');
assert(count((r)=>r.subtype==='near_domain_not_current_route')===440,'near-domain count !=440');
assert(count((r)=>r.subtype==='outside_current_22')===22,'outside count !=22');
assert(count((r)=>r.subtype==='route_unresolved')===22,'unresolved count !=22');
for(const routeId of routeIds){
  const routeRows=rows.filter((r)=>r.expectedRoute===routeId);
  assert(routeRows.length===10,`${routeId} known count ${routeRows.length} !=10`);
  assert(new Set(routeRows.map((r)=>r.wordingPattern)).size===10,`${routeId} known wording patterns not unique`);
  const pressureRows=rows.filter((r)=>r.subtype==='near_domain_not_current_route'&&r.pressureFamily===routeId);
  assert(pressureRows.length===20,`${routeId} near-domain count ${pressureRows.length} !=20`);
  assert(new Set(pressureRows.map((r)=>r.wordingPattern)).size===20,`${routeId} near-domain wording patterns not unique`);
}

const exact=new Map();
for(const row of rows){
  const text=normalize(row.text);
  assert(text.length>=4,`too-short row ${row.id}`);
  assert(!exact.has(text),`fresh exact duplicate ${row.id}/${exact.get(text)}: ${row.text}`);
  exact.set(text,row.id);
  assert(typeof row.semanticAxis==='string'&&row.semanticAxis,`missing axis ${row.id}`);
  assert(typeof row.confusableFamily==='string'&&row.confusableFamily,`missing family ${row.id}`);
  assert(typeof row.wordingPattern==='string'&&row.wordingPattern,`missing wording pattern ${row.id}`);
  if(row.identityLabel==='route_identity_positive'){
    assert(routeSet.has(row.expectedRoute),`unknown route ${row.id}/${row.expectedRoute}`);
    assert(row.subtype==='fallback_stage_known',`known subtype drift ${row.id}`);
  }else assert(row.expectedRoute==null,`non-route expectedRoute drift ${row.id}`);
  for(const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神']) assert(!text.includes(term),`traditional LiuYao term leaked ${row.id}/${term}`);
  for(const term of ['疾病','病情','健康占','手术结果','疗效','药效','康复','诊断结果','检查结果']) assert(!text.includes(term),`health-policy term leaked ${row.id}/${term}`);
}

const internalNear=[];
for(let i=0;i<rows.length;i+=1)for(let j=i+1;j<rows.length;j+=1){const similarity=jaccard(rows[i].text,rows[j].text);if(similarity>=schema.freshnessAndIsolation.freshInternalTrigramJaccardThreshold)internalNear.push({a:rows[i].id,b:rows[j].id,similarity,aText:rows[i].text,bText:rows[j].text});}
assert(internalNear.length===0,`fresh internal near duplicates >=${schema.freshnessAndIsolation.freshInternalTrigramJaccardThreshold} (${internalNear.length}): ${JSON.stringify(internalNear.slice(0,20))}`);

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js']) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract&&arbitration?.arbitrate,'deterministic path modules failed to load');
const deterministicFailures=[];
for(const row of rows){
  const evidence=extractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const unsupported=evidence.unsupportedTargets||[];
  const strict=row.identityLabel==='route_identity_positive'||row.subtype==='near_domain_not_current_route';
  if((strict&&unsupported.length)||arb!=null) deterministicFailures.push({id:row.id,label:row.identityLabel,route:row.expectedRoute,subtype:row.subtype,text:row.text,unsupported,arbitration:arb});
}
assert(deterministicFailures.length===0,`deterministic Fallback-stage eligibility failures (${deterministicFailures.length}): ${JSON.stringify(deterministicFailures.slice(0,30))}`);

// Contamination audit may read non-protected historical train/calibration text, including sealed v0.3, but never reachability reports/results.
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
explicitSources.delete(path.basename(calibrationPath));explicitSources.delete(path.basename(lockPath));
const priorStrings=[];
const collect=(value,source)=>{if(typeof value==='string'){const text=normalize(value);if(text.length>=4&&/[\u3400-\u9fff]/.test(text))priorStrings.push({text,raw:value,source});return;}if(Array.isArray(value)){for(const item of value)collect(item,source);return;}if(value&&typeof value==='object')for(const item of Object.values(value))collect(item,source);};
for(const name of [...explicitSources].sort()){const full=path.join(dataDir,name);if(fs.existsSync(full))collect(JSON.parse(fs.readFileSync(full,'utf8')),name);}
const priorExact=new Map();for(const item of priorStrings)if(!priorExact.has(item.text))priorExact.set(item.text,item.source);
const overlaps=[];const nearOverlaps=[];
for(const row of rows){const n=normalize(row.text);if(priorExact.has(n))overlaps.push({id:row.id,text:row.text,source:priorExact.get(n)});for(const item of priorStrings){const similarity=jaccard(row.text,item.raw);if(similarity>=schema.freshnessAndIsolation.historicalTrigramJaccardThreshold){nearOverlaps.push({id:row.id,text:row.text,source:item.source,sourceText:item.raw,similarity});break;}}}
assert(overlaps.length===0,`historical exact overlaps (${overlaps.length}): ${JSON.stringify(overlaps.slice(0,20))}`);
assert(nearOverlaps.length===0,`historical near overlaps >=${schema.freshnessAndIsolation.historicalTrigramJaccardThreshold} (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0,20))}`);

const generatorPath='scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs';
const generator=fs.readFileSync(path.join(root,generatorPath),'utf8');
assert(!/@huggingface\/transformers|pipeline\s*\(/.test(generator),'generator contains encoder/model invocation');
const protectedReadPattern=/(?:readJson|readFileSync)\s*\([^\n;]*(?:calibration-v0\.3|reachability-audit|candidate-v03-development-failure-diagnostic|independent|sealed-blind)/i;
assert(!protectedReadPattern.test(generator),'generator performs forbidden old-calibration/protected/failure-data read');

if(calibration.sealed){
  assert(fs.existsSync(path.join(root,lockPath)),'sealed v0.4 lock missing');
  const lock=readJson(lockPath);
  assert(lock.status==='locked','v0.4 lock not locked');
  assert(lock.calibrationSha256===sha256(calibrationPath),'v0.4 calibration SHA drift');
  assert(lock.schemaSha256===sha256(schemaPath),'v0.4 schema SHA drift');
  assert(lock.carriedTrainingSha256===schema.carriedTrainingAugmentation.sha256,'carried training SHA drift in lock');
}

console.log('Candidate v0.4 Fallback Identity v0.2 calibration v0.4 verified without encoder scoring.');
console.log('- rows: 704 = 220 known + 440 near-domain + 22 outside-current22 + 22 unresolved');
console.log('- known: 22/22 x10; near-domain: 22/22 families x20');
console.log('- deterministic Fallback-stage eligibility failures: 0');
console.log('- fresh internal exact/near duplicates: 0');
console.log(`- historical isolation sources read: ${explicitSources.size}; exact overlap: 0; near overlap: 0`);
console.log('- reachability reports / protected evaluation content not read');
