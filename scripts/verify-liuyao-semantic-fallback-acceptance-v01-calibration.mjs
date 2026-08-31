import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const calibrationFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json';
const lockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.lock.json';
const contractFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-contract.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition,message) => { if(!condition) throw new Error(message); };

const contract = readJson(contractFile);
const calibration = readJson(calibrationFile);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row)=>row.routeId);
const routeSet = new Set(routeIds);
assert(contract.status==='frozen_architecture_before_fresh_calibration','Fallback Acceptance architecture contract not frozen');
assert(calibration.version==='0.13-fallback-acceptance-v0.1-calibration-v0.1',`calibration version ${calibration.version}`);
assert(['presealed_fresh_calibration','sealed_fresh_calibration'].includes(calibration.status),`calibration status ${calibration.status}`);
assert(calibration.sealed === (calibration.status==='sealed_fresh_calibration'),'calibration sealed/status mismatch');
assert(calibration.scope==='liuyao_semantic_pure_fallback_acceptance','calibration scope drift');
assert(calibration.createdAfterContractFreeze===true,'post-contract creation marker missing');
assert(calibration.provenance?.contractPath===contractFile,'contract path provenance drift');
assert(calibration.provenance?.contractSha256===sha256(contractFile),'contract SHA provenance drift');
assert(calibration.policy?.useForTraining===false&&calibration.policy?.useForThresholdCalibration===true,'calibration role drift');
assert(calibration.policy?.useAsDevelopmentEval===false&&calibration.policy?.reuseAsIndependent===false&&calibration.policy?.reuseAsBlind===false,'calibration reuse policy drift');
assert(calibration.policy?.oldFallbackCalibrationExcluded===true&&calibration.policy?.routeabilityCalibrationExcluded===true&&calibration.policy?.sealedBlindAndIndependentExcluded===true,'forbidden-source policy drift');
assert(JSON.stringify(calibration.policy?.thresholdsToCalibrate)===JSON.stringify(['routeability_accept_threshold','identity_accept_threshold']),'threshold target drift');
assert(calibration.policy?.routeSpecificThresholdsForbidden===true&&calibration.policy?.multiTextEncoderBatchForbidden===true,'global/canonical calibration policy drift');
assert(routeIds.length===22,'route inventory count drift');
assert(calibration.rows?.length===178,'calibration total != 178');
assert(calibration.counts?.route_known===88&&calibration.counts?.non_route===90,'calibration label counts drift');
for(const routeId of routeIds) assert(calibration.rows.filter((row)=>row.expectedRoute===routeId).length===4,`${routeId} known count != 4`);
for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) assert(calibration.rows.filter((row)=>row.subtype===subtype).length===30,`${subtype} count != 30`);

const contractCommit = calibration.provenance?.contractFreezeCommit;
const generatorCommit = calibration.provenance?.generatorCommit;
assert(/^[0-9a-f]{40}$/.test(contractCommit||''),'contract freeze commit missing');
assert(/^[0-9a-f]{40}$/.test(generatorCommit||''),'generator commit missing');
assert(contractCommit!==generatorCommit,'contract must precede generator commit');
try {
  execFileSync('git',['merge-base','--is-ancestor',contractCommit,generatorCommit],{cwd:root,stdio:'ignore'});
} catch {
  throw new Error(`contract freeze commit ${contractCommit} is not an ancestor of generator commit ${generatorCommit}`);
}

const traditionalTerms=['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms=['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','诊断结果','检查结果'];
const seen=new Set();
for(const row of calibration.rows){
  const text=normalize(row.text);assert(text.length>=4,`too-short row: ${row.text}`);assert(!seen.has(text),`internal exact duplicate: ${row.text}`);seen.add(text);
  for(const term of traditionalTerms) assert(!text.includes(term),`traditional term leaked: ${term} / ${row.text}`);
  for(const term of healthTerms) assert(!text.includes(term),`health-policy term leaked: ${term} / ${row.text}`);
  if(row.label==='route_known'){
    assert(routeSet.has(row.expectedRoute),`unknown route ${row.expectedRoute}`);assert(row.subtype==='pure_fallback_known',`known subtype drift ${row.subtype}`);
  }else{
    assert(row.label==='non_route',`unknown label ${row.label}`);assert(row.expectedRoute==null,`non-route expectedRoute must be null: ${row.text}`);
    assert(['outside_current_22','route_unresolved','near_domain_not_current_route'].includes(row.subtype),`unknown non-route subtype ${row.subtype}`);
  }
}

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js']) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const extractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract&&arbitration?.arbitrate,'failed to load pure fallback semantic modules');
const knownPathMismatches=[];
const reachableNonRouteBySubtype={outside_current_22:0,route_unresolved:0,near_domain_not_current_route:0};
for(const row of calibration.rows){
  const evidence=extractor.extract(row.text),arb=arbitration.arbitrate(row.text,evidence),reachable=(evidence.unsupportedTargets||[]).length===0&&arb==null;
  if(row.label==='route_known'&&!reachable) knownPathMismatches.push({routeId:row.expectedRoute,text:row.text,unsupported:evidence.unsupportedTargets,arbitration:arb});
  if(row.label==='non_route'&&reachable) reachableNonRouteBySubtype[row.subtype]+=1;
}
assert(knownPathMismatches.length===0,`known pure-fallback path mismatches (${knownPathMismatches.length}): ${knownPathMismatches.slice(0,20).map((row)=>`${row.routeId}:${row.text} unsupported=${JSON.stringify(row.unsupported)} arb=${JSON.stringify(row.arbitration)}`).join(' | ')}`);
for(const subtype of Object.keys(reachableNonRouteBySubtype)) assert(reachableNonRouteBySubtype[subtype]>=10,`${subtype} has too few gate-reachable non-route rows: ${reachableNonRouteBySubtype[subtype]}`);

const excluded=new Set([path.basename(calibrationFile),path.basename(lockFile)]);
const priorFiles=fs.readdirSync(dataDir).filter((name)=>name.startsWith('liuyao-')&&name.endsWith('.json')&&!excluded.has(name));
const priorStrings=new Map();
const collect=(value,source)=>{
  if(typeof value==='string'){const text=normalize(value);if(text.length>=4&&/[\u3400-\u9fff]/.test(text)&&!priorStrings.has(text))priorStrings.set(text,source);return;}
  if(Array.isArray(value)){for(const item of value)collect(item,source);return;}
  if(value&&typeof value==='object')for(const item of Object.values(value))collect(item,source);
};
for(const file of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir,file),'utf8')),file);
const overlaps=calibration.rows.map((row)=>({row,source:priorStrings.get(normalize(row.text))})).filter((item)=>item.source);
assert(overlaps.length===0,`fresh calibration exact overlap (${overlaps.length}): ${overlaps.slice(0,20).map((item)=>`${item.row.text}->${item.source}`).join(' | ')}`);

if(calibration.sealed){
  assert(fs.existsSync(path.join(root,lockFile)),'sealed calibration lock missing');
  const lock=readJson(lockFile);
  assert(lock.version==='0.13-fallback-acceptance-v0.1-calibration-lock-v0.1'&&lock.status==='locked','calibration lock contract drift');
  assert(lock.calibrationSha256===sha256(calibrationFile),'calibration SHA drift');
  assert(lock.contractSha256===sha256(contractFile),'contract SHA drift');
  assert(lock.contractFreezeCommit===contractCommit,'contract commit lock drift');
}

console.log('LiuYao Fallback Acceptance v0.1 fresh calibration verified.');
console.log('- 178 total: 88 known (4 x 22) / 90 non-route (30 x 3)');
console.log('- all known rows: Evidence unsupportedTargets=0 and Arbitration=null');
console.log(`- gate-reachable non-route: outside=${reachableNonRouteBySubtype.outside_current_22}, unresolved=${reachableNonRouteBySubtype.route_unresolved}, near-domain=${reachableNonRouteBySubtype.near_domain_not_current_route}`);
console.log(`- prior LiuYao JSON corpora audited: ${priorFiles.length}; exact overlap: 0`);
console.log('- health-policy and traditional-term leakage: 0');
