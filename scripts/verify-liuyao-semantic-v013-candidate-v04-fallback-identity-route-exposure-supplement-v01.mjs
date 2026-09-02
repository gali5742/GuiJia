import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.join(root,'data');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha=(relative)=>{const b=read(relative);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const normalize=(value)=>String(value||'').trim().replace(/\s+/g,'').replace(/[，。！？、；：,.!?;:]/g,'');
const grams=(value,n=3)=>{const text=normalize(value);const set=new Set();if(text.length<n){if(text)set.add(text);return set;}for(let i=0;i<=text.length-n;i+=1)set.add(text.slice(i,i+n));return set;};
const jaccard=(a,b)=>{const A=grams(a),B=grams(b);let intersection=0;for(const token of A)if(B.has(token))intersection+=1;const union=A.size+B.size-intersection;return union?intersection/union:0;};

const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-route-exposure-supplement-schema-v0.1.json';
const supplementPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.lock.json';
const generatorPath='scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v01.mjs';
const schema=readJson(schemaPath);
const supplement=readJson(supplementPath);

assert(schema.status==='frozen_after_calibration_v04_aggregate_reachability_failure_before_supplement_generation','supplement schema not frozen');
assert(sha256(schema.immutableBase.calibrationPath)===schema.immutableBase.calibrationSha256,'immutable v0.4 calibration drift');
assert(gitBlobSha(schema.immutableBase.reachabilityReportPath)===schema.immutableBase.reachabilityReportGitBlobSha,'immutable v0.4 reachability report provenance drift');
assert(schema.allowedAggregateEvidence.baseSafetyGatesPassed===true,'base v0.4 safety gates not preserved');
assert(schema.allowedAggregateEvidence.routesWithFallbackExposure===19,'base covered route count drift');
assert(JSON.stringify(schema.allowedAggregateEvidence.routesWithZeroFallbackExposure)===JSON.stringify(['investment_price_trend','marital_relationship','relationship_development']),'aggregate zero-route set drift');
assert(schema.oneShotPolicy.secondSamplingRoundAllowed===false&&schema.oneShotPolicy.sameSupplementVersionRetryWithEditedText===false,'one-shot policy drift');
assert(supplement.version==='0.13-candidate-v0.4-fallback-identity-v0.2-route-exposure-supplement-v0.1','supplement version drift');
assert(['presealed_route_exposure_supplement','sealed_route_exposure_supplement'].includes(supplement.status),`unexpected supplement status ${supplement.status}`);
assert(supplement.sealed===(supplement.status==='sealed_route_exposure_supplement'),'supplement sealed/status mismatch');
assert(supplement.schema===schemaPath,'supplement schema pointer drift');
assert(supplement.rows?.length===120,`supplement rows ${supplement.rows?.length} !=120`);
for(const [field,expected] of Object.entries({oneShotSupplement:true,encoderScoringObserved:false,fallbackIdentityTrainingPerformed:false,fallbackIdentityProbabilityUsed:false,fallbackThresholdSelected:false,v04CalibrationTextReadForGeneration:false,v04ReachabilityRowResultsRead:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV03FailureRowsRead:false,aggregateZeroRouteIdsOnly:true}))assert(supplement.policy?.[field]===expected,`supplement policy drift ${field}`);

const routes=['investment_price_trend','marital_relationship','relationship_development'];
for(const routeId of routes){
  const rows=supplement.rows.filter((row)=>row.expectedRoute===routeId);
  assert(rows.length===40,`${routeId} supplement count ${rows.length} !=40`);
  assert(new Set(rows.map((row)=>row.wordingPattern)).size===40,`${routeId} wording patterns not unique`);
}

const exact=new Map();
for(const row of supplement.rows){
  const text=normalize(row.text);
  assert(text.length>=8,`too-short supplement row ${row.id}`);
  assert(!exact.has(text),`fresh exact duplicate ${row.id}/${exact.get(text)}: ${row.text}`);
  exact.set(text,row.id);
  assert(row.identityLabel==='route_identity_positive',`label drift ${row.id}`);
  assert(row.subtype==='fallback_stage_route_exposure_supplement',`subtype drift ${row.id}`);
  assert(routes.includes(row.expectedRoute),`unexpected route ${row.id}/${row.expectedRoute}`);
  assert(typeof row.semanticAxis==='string'&&row.semanticAxis,`missing axis ${row.id}`);
  assert(typeof row.confusableFamily==='string'&&row.confusableFamily,`missing family ${row.id}`);
  assert(typeof row.wordingPattern==='string'&&row.wordingPattern,`missing wording pattern ${row.id}`);
  for(const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'])assert(!text.includes(term),`traditional LiuYao term leaked ${row.id}/${term}`);
  for(const term of ['疾病','病情','健康占','手术结果','疗效','药效','康复','诊断结果','检查结果'])assert(!text.includes(term),`health-policy term leaked ${row.id}/${term}`);
}

const internalNear=[];
for(let i=0;i<supplement.rows.length;i+=1)for(let j=i+1;j<supplement.rows.length;j+=1){const similarity=jaccard(supplement.rows[i].text,supplement.rows[j].text);if(similarity>=0.82)internalNear.push({a:supplement.rows[i].id,b:supplement.rows[j].id,similarity,aText:supplement.rows[i].text,bText:supplement.rows[j].text});}
assert(internalNear.length===0,`fresh supplement internal near duplicates >=0.82 (${internalNear.length}): ${JSON.stringify(internalNear.slice(0,20))}`);

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js'])vm.runInContext(read(relative).toString('utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract&&arbitration?.arbitrate,'deterministic path modules failed to load');
const deterministicFailures=[];
for(const row of supplement.rows){
  const evidence=extractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const unsupported=[...(evidence.unsupportedTargets||[])];
  if(unsupported.length||arb!=null)deterministicFailures.push({id:row.id,route:row.expectedRoute,text:row.text,unsupported,arbitration:arb});
}
assert(deterministicFailures.length===0,`supplement deterministic Fallback-stage eligibility failures (${deterministicFailures.length}): ${JSON.stringify(deterministicFailures.slice(0,30))}`);

// Contamination audit may read non-protected historical train/calibration text, including sealed v0.4, but never reachability reports/results or protected evaluations.
const explicitSources=new Set([
  path.basename(schema.immutableBase.calibrationPath),
  'liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-training.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json',
  'liuyao-semantic-v013-candidate-v03-development.json'
]);
for(const name of fs.readdirSync(dataDir)){
  if(!name.startsWith('liuyao-')||!name.endsWith('.json'))continue;
  if(/(independent|blind|diagnostic|report|literature|research|next-topic|reachability-audit)/i.test(name))continue;
  if(/(training|calibration)/i.test(name))explicitSources.add(name);
}
explicitSources.delete(path.basename(supplementPath));explicitSources.delete(path.basename(lockPath));
const priorStrings=[];
const collect=(value,source)=>{if(typeof value==='string'){const text=normalize(value);if(text.length>=4&&/[\u3400-\u9fff]/.test(text))priorStrings.push({text,raw:value,source});return;}if(Array.isArray(value)){for(const item of value)collect(item,source);return;}if(value&&typeof value==='object')for(const item of Object.values(value))collect(item,source);};
for(const name of [...explicitSources].sort()){const full=path.join(dataDir,name);if(fs.existsSync(full))collect(JSON.parse(fs.readFileSync(full,'utf8')),name);}
const priorExact=new Map();for(const item of priorStrings)if(!priorExact.has(item.text))priorExact.set(item.text,item.source);
const overlaps=[];const nearOverlaps=[];
for(const row of supplement.rows){const n=normalize(row.text);if(priorExact.has(n))overlaps.push({id:row.id,text:row.text,source:priorExact.get(n)});for(const item of priorStrings){const similarity=jaccard(row.text,item.raw);if(similarity>=0.84){nearOverlaps.push({id:row.id,text:row.text,source:item.source,sourceText:item.raw,similarity});break;}}}
assert(overlaps.length===0,`historical exact overlaps (${overlaps.length}): ${JSON.stringify(overlaps.slice(0,20))}`);
assert(nearOverlaps.length===0,`historical near overlaps >=0.84 (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0,20))}`);

const generator=read(generatorPath).toString('utf8');
assert(!/@huggingface\/transformers|pipeline\s*\(/.test(generator),'supplement generator contains encoder/model invocation');
assert(!/(?:readJson|readFileSync)\s*\([^\n;]*(?:calibration-v0\.4|reachability-audit|independent|sealed-blind|candidate-v03-development-failure)/i.test(generator),'supplement generator performs forbidden base/protected/failure-data read');

if(supplement.sealed){
  assert(fs.existsSync(path.join(root,lockPath)),'sealed supplement lock missing');
  const lock=readJson(lockPath);
  assert(lock.status==='locked','supplement lock not locked');
  assert(lock.supplementSha256===sha256(supplementPath),'supplement SHA drift');
  assert(lock.schemaSha256===sha256(schemaPath),'supplement schema SHA drift');
  assert(lock.immutableBaseCalibrationSha256===schema.immutableBase.calibrationSha256,'immutable base SHA drift in lock');
  assert(lock.encoderScoringBeforeSeal===false&&lock.fallbackIdentityTrainingPerformed===false&&lock.fallbackIdentityProbabilityUsed===false&&lock.fallbackThresholdSelected===false,'supplement lock model-boundary drift');
}

console.log('One-shot Fallback route-exposure supplement verified without encoder scoring.');
console.log('- rows: 120 = 40 each for the three aggregate zero-exposure routes');
console.log('- deterministic Fallback-stage eligibility failures: 0');
console.log('- fresh internal exact/near duplicates: 0');
console.log(`- historical isolation sources read: ${explicitSources.size}; exact overlap: 0; near overlap: 0`);
console.log('- reachability reports / protected evaluation content not read for text comparison');
