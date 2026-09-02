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
  const text = normalize(value);
  const set = new Set();
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

const design = readJson('data/liuyao-semantic-v013-candidate-v04-design-v0.1.json');
const contract = readJson('data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json');
const schema = readJson('data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json');
const semanticActLock = readJson('data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const trainingPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json';
const calibrationPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json';
const lockPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data.lock.json';
const training = readJson(trainingPath);
const calibration = readJson(calibrationPath);
const routeIds = inventory.routes.map((row) => row.routeId);
const routeSet = new Set(routeIds);

assert(design.status === 'design_frozen_before_v04_training_or_calibration', 'v0.4 design not frozen');
assert(contract.status === 'frozen_before_v04_data_generation', 'v0.4 data contract not frozen');
assert(schema.status === 'frozen_before_fallback_v02_data_generation', 'Fallback v0.2 data schema not frozen');
assert(semanticActLock.status === 'locked' && semanticActLock.threshold === 0.5045675974201208, 'Semantic Act v0.1 lock missing/drifted');
assert(routeIds.length === 22, `route inventory ${routeIds.length} != 22`);
assert(training.version === '0.13-candidate-v0.4-fallback-identity-v0.2-training-augmentation-v0.1', 'training version drift');
assert(calibration.version === '0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.1', 'calibration version drift');
assert(['presealed_training_augmentation','sealed_training_augmentation'].includes(training.status), `training status ${training.status}`);
assert(['presealed_calibration_data','sealed_calibration_data'].includes(calibration.status), `calibration status ${calibration.status}`);
assert(training.sealed === (training.status === 'sealed_training_augmentation'), 'training sealed/status mismatch');
assert(calibration.sealed === (calibration.status === 'sealed_calibration_data'), 'calibration sealed/status mismatch');
assert(training.rows?.length === 198, `training rows ${training.rows?.length} != 198`);
assert(calibration.rows?.length === 154, `calibration rows ${calibration.rows?.length} != 154`);

const count = (rows, predicate) => rows.filter(predicate).length;
assert(count(training.rows, (row) => row.identityLabel === 'route_identity_positive') === 132, 'training known != 132');
assert(count(training.rows, (row) => row.identityLabel === 'non_route') === 66, 'training nonroute != 66');
assert(count(calibration.rows, (row) => row.identityLabel === 'route_identity_positive') === 88, 'calibration known != 88');
assert(count(calibration.rows, (row) => row.identityLabel === 'non_route') === 66, 'calibration nonroute != 66');
for (const routeId of routeIds) {
  assert(count(training.rows, (row) => row.expectedRoute === routeId) === 6, `training ${routeId} != 6`);
  assert(count(calibration.rows, (row) => row.expectedRoute === routeId) === 4, `calibration ${routeId} != 4`);
  assert(new Set(training.rows.filter((row) => row.expectedRoute === routeId).map((row) => row.wordingPattern)).size >= 3, `training ${routeId} wording patterns < 3`);
  assert(new Set(calibration.rows.filter((row) => row.expectedRoute === routeId).map((row) => row.wordingPattern)).size >= 2, `calibration ${routeId} wording patterns < 2`);
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  assert(count(training.rows, (row) => row.subtype === subtype) === 22, `training ${subtype} != 22`);
  assert(count(calibration.rows, (row) => row.subtype === subtype) === 22, `calibration ${subtype} != 22`);
}

const all = [
  ...training.rows.map((row) => ({...row, corpus:'training'})),
  ...calibration.rows.map((row) => ({...row, corpus:'calibration'}))
];
const exact = new Map();
for (const row of all) {
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short row ${row.id}`);
  assert(!exact.has(text), `fresh exact duplicate ${row.id}/${exact.get(text)}: ${row.text}`);
  exact.set(text, row.id);
  assert(typeof row.confusableFamily === 'string' && row.confusableFamily, `missing family ${row.id}`);
  assert(typeof row.semanticAxis === 'string' && row.semanticAxis, `missing axis ${row.id}`);
  assert(typeof row.wordingPattern === 'string' && row.wordingPattern, `missing wording pattern ${row.id}`);
  if (row.identityLabel === 'route_identity_positive') {
    assert(routeSet.has(row.expectedRoute), `unknown route ${row.id}/${row.expectedRoute}`);
    assert(row.subtype === 'fallback_style_known', `known subtype drift ${row.id}`);
  } else {
    assert(row.identityLabel === 'non_route' && row.expectedRoute == null, `nonroute label drift ${row.id}`);
  }
  for (const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神']) assert(!text.includes(term), `traditional LiuYao term leaked ${row.id}/${term}`);
  for (const term of ['疾病','病情','健康占','手术结果','疗效','药效','康复','诊断结果','检查结果']) assert(!text.includes(term), `health-policy term leaked ${row.id}/${term}`);
}

// Fresh train/calibration must not be near copies of each other.
const trainCalNear = [];
for (const a of training.rows) for (const b of calibration.rows) {
  const similarity = jaccard(a.text,b.text);
  if (similarity >= 0.82) trainCalNear.push({a:a.id,b:b.id,similarity,aText:a.text,bText:b.text});
}
assert(trainCalNear.length === 0, `train/calibration near duplicates >=0.82 (${trainCalNear.length}): ${JSON.stringify(trainCalNear.slice(0,10))}`);

// Known fresh augmentation must really require Fallback at the deterministic Arbitration layer.
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window=context; context.globalThis=context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract && arbitration?.arbitrate,'failed to load Arbitration path modules');
const pathMismatches=[];
for (const row of all.filter((item)=>item.identityLabel==='route_identity_positive')) {
  const evidence=extractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  if ((evidence.unsupportedTargets||[]).length || arb != null) pathMismatches.push({id:row.id,route:row.expectedRoute,text:row.text,unsupported:evidence.unsupportedTargets,arbitration:arb});
}
assert(pathMismatches.length===0,`fresh known deterministic path mismatches (${pathMismatches.length}): ${JSON.stringify(pathMismatches.slice(0,20))}`);

// Read only explicitly permitted historical development/train/calibration text. Never open independent/blind/report/diagnostic/research files.
const protectedName = /(independent|blind|diagnostic|report|literature|research|next-topic)/i;
const currentNames = new Set([
  path.basename(trainingPath), path.basename(calibrationPath), path.basename(lockPath),
  'liuyao-semantic-v013-candidate-v04-semantic-act-training.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-data.lock.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json',
  'liuyao-semantic-v013-candidate-v04-semantic-act-v01-calibration-report.json'
]);
const candidates=fs.readdirSync(dataDir).filter((name)=>name.startsWith('liuyao-')&&name.endsWith('.json')&&!currentNames.has(name));
const protectedSkipped=candidates.filter((name)=>protectedName.test(name));
const permittedNames=candidates.filter((name)=>!protectedName.test(name) && (
  /training/i.test(name) || /calibration/i.test(name) || name==='liuyao-semantic-v013-candidate-v03-development.json'
));
const priorStrings=[];
const collect=(value,source)=>{
  if(typeof value==='string'){
    const text=normalize(value);
    if(text.length>=4 && /[\u3400-\u9fff]/.test(text)) priorStrings.push({text,raw:value,source});
    return;
  }
  if(Array.isArray(value)){ for(const item of value) collect(item,source); return; }
  if(value&&typeof value==='object') for(const item of Object.values(value)) collect(item,source);
};
for(const name of permittedNames) collect(JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8')),name);
// Semantic Act train/cal are explicitly readable contamination sources.
for(const name of ['liuyao-semantic-v013-candidate-v04-semantic-act-training.json','liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json']) {
  collect(JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8')),name);
}
const priorExact=new Map();
for(const item of priorStrings) if(!priorExact.has(item.text)) priorExact.set(item.text,item.source);
const overlaps=[]; const nearOverlaps=[];
for(const row of all){
  const n=normalize(row.text);
  if(priorExact.has(n)) overlaps.push({id:row.id,text:row.text,source:priorExact.get(n)});
  for(const item of priorStrings){
    const similarity=jaccard(row.text,item.raw);
    if(similarity>=0.84){ nearOverlaps.push({id:row.id,text:row.text,source:item.source,sourceText:item.raw,similarity}); break; }
  }
}
assert(overlaps.length===0,`historical exact overlaps (${overlaps.length}): ${JSON.stringify(overlaps.slice(0,10))}`);
assert(nearOverlaps.length===0,`historical near overlaps >=0.84 (${nearOverlaps.length}): ${JSON.stringify(nearOverlaps.slice(0,10))}`);

// Static generator-access audit: generation must not read protected evaluation/failure/research text.
const generatorSource=fs.readFileSync(path.join(root,'scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data.mjs'),'utf8');
for(const forbidden of ['candidate-v03-development','development-failure-diagnostic','independent','blind','literature','research']) {
  assert(!generatorSource.includes(`readJson('${forbidden}`) && !generatorSource.includes(`readFileSync('${forbidden}`), `generator protected read marker: ${forbidden}`);
}

if(training.sealed||calibration.sealed){
  assert(training.sealed&&calibration.sealed,'training/calibration must seal together');
  assert(fs.existsSync(path.join(root,lockPath)),'sealed data lock missing');
  const lock=readJson(lockPath);
  assert(lock.status==='locked','Fallback v0.2 data lock not locked');
  assert(lock.trainingSha256===sha256(trainingPath),'training SHA drift');
  assert(lock.calibrationSha256===sha256(calibrationPath),'calibration SHA drift');
  assert(lock.schemaSha256===sha256('data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.1.json'),'schema SHA drift');
}

console.log('Candidate v0.4 Fallback Identity v0.2 fresh corpora verified without encoder scoring.');
console.log('- training: 198 (132 known / 66 non-route); calibration: 154 (88 known / 66 non-route)');
console.log('- all 22 routes covered with semantic-axis/confusable-family metadata');
console.log('- known deterministic path: Arbitration=null and unsupportedTargets=0');
console.log('- train/calibration near duplicates >=0.82: 0');
console.log(`- permitted historical files read: ${permittedNames.length + 2}; protected files skipped without content read: ${protectedSkipped.length}`);
console.log('- historical exact overlap: 0; near overlap >=0.84: 0');
