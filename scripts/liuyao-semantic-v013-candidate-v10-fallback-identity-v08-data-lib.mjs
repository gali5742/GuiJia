import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
export {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize};
export const stem='liuyao-semantic-v013-candidate-v10-fallback-identity-v08',prefix=`data/${stem}`,contractPath=`${prefix}-data-contract-v0.1.json`,implementationPath=`${prefix}-data-implementation-contract-v0.1.json`;
export const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export const committed=p=>assert(git(['rev-parse',`HEAD:${p}`])===binding(p).gitBlobSha,`Uncommitted input: ${p}`);
export const checkedBinding=b=>assert(equal(binding(b.path),b),`Frozen binding drift: ${b.path}`);
export function contract({requireCommitted=false}={}) {
  assert(process.env.NODE_OPTIONS?.includes('liuyao-semantic-v013-candidate-v07-evaluation-read-guard.cjs'),'Preload evaluation read guard');
  const c=json(contractPath),i=json(implementationPath);
  assert(c.status==='schema_counts_labels_order_and_scope_frozen_before_literal_authoring'&&i.status==='frozen_data_implementation_before_generation_and_encoder','Data contract freeze required');
  for(const b of i.bindings){checkedBinding(b);if(requireCommitted)committed(b.path);}
  for(const b of json(c.designLockBinding.path).bindings)checkedBinding(b);
  checkedBinding(c.frozenArbitrationBinding);if(requireCommitted)committed(c.frozenArbitrationBinding.path);
  if(requireCommitted){committed(contractPath);committed(implementationPath);}
  assert(equal(c.routes,json('data/liuyao-semantic-route-inventory-v0.2.json').routes.map(r=>r.routeId))&&c.routes.length===22,'All22 inventory required');
  assert(c.training.rows===2028&&c.training.known===1553&&c.training.nonRoute===475&&c.training.sourceRows===1698&&c.training.freshSupplement.rows===330&&c.calibration.rows===396&&c.calibration.known===264&&c.calibration.nonRoute===132,'Frozen counts drift');
  assert(equal(c.modelInputFields,['text'])&&equal(c.modelTargetFields,['expectedRoute'])&&c.noEncoderBeforeDataCI&&c.noSameVersionRepairAfterAudit,'Data/execution boundary drift');
  return {c,i};
}
export function validateFresh(c,rows) {return validateAllocated(c,rows,c.allocatedRawCalibration,'calibration');}
export function validateSupplement(c,rows) {return validateAllocated(c,rows,c.allocatedTrainingSupplement,'training');}
function validateAllocated(c,rows,allocation,split) {
  assert(Array.isArray(rows)&&rows.length===allocation.length,'Full allocated raw membership required');
  return rows.map((r,n)=>{
    assert(equal(Object.keys(r),[...Object.keys(allocation[n]),'text'])&&equal(Object.fromEntries(Object.entries(r).filter(([k])=>k!=='text')),allocation[n]),`Frozen allocation drift: ${allocation[n].id}`);
    assert(typeof r.text==='string'&&r.text===r.text.trim()&&normalize(r.text).length>=8,'Fresh literal text required');
    assert(!/(六亲|世爻|应爻|用神|官鬼|妻财|父母爻|兄弟爻|子孙爻|TR\/MR|病情|疾病占|诊断疾病)/.test(r.text),`Traditional/reserved content forbidden: ${r.id}`);
    return {...r,split,source:c.authoringPath};
  });
}
export function generate(c) {
  const a=json(c.authoringPath),t=json(c.training.sourceBinding.path),oldLock=json(c.training.sourceLockBinding.path);
  checkedBinding(c.training.sourceBinding);checkedBinding(c.training.sourceLockBinding);
  assert(a.generation==='individually_authored_literal_texts_no_template_expansion_no_model_feedback'&&a.wordingCreatedBeforeContaminationAudit&&!a.encoderScoringObserved&&!a.oldFailureWordingUsed&&!a.independentEvaluationRead&&!a.sealedBlindEvaluationRead,'Fresh wording provenance drift');
  assert(t.sealed&&t.status==='sealed_training'&&t.rows.length===1698&&oldLock.membership.training.length===1698,'Sealed train-only source required');
  const reused=t.rows.map((r,n)=>{
    const m=oldLock.membership.training[n];assert(r.split==='training'&&r.id===m.id&&r.expectedRoute===m.expectedRoute&&hashBytes(r.text)===m.textSha256&&hashBytes(normalize(r.text))===m.normalizedTextSha256,'Historical train-only member drift');
    return {...r,id:`V013-V10-FI-T-${String(n+1).padStart(4,'0')}`,source:c.training.sourceBinding.path,originId:r.id,split:'training'};
  });
  const corpus=(split,rows)=>({version:`0.13-candidate-v0.10-fallback-identity-v0.7-${split}-v0.1`,status:`presealed_${split}`,sealed:false,contractBinding:binding(contractPath),rows});
  const supplemental=validateSupplement(c,a.trainingRows),training=[...reused,...supplemental];
  return {training:corpus('training',training),calibration:corpus('calibration',validateFresh(c,a.rows)),trainingSupplement:corpus('training',supplemental)};
}
export const sealed=d=>({...d,status:`sealed_${d.rows[0].split}`,sealed:true,sealedBeforeAnyCandidateV10EncoderScoring:true});
const grams=s=>{const a=Array.from(normalize(s));return new Set(a.slice(0,-2).map((_,n)=>a.slice(n,n+3).join('')));};
const sim=(a,b)=>{let n=0;for(const g of a)if(b.has(g))n++;return n/(a.size+b.size-n||1);};
const repr=r=>({id:r.id,n:normalize(r.text),g:grams(r.text)});
const compare=(a,b,limit,context)=>{assert(a.n!==b.n,`Exact overlap: ${a.id}/${b.id}; ${context}`);const score=sim(a.g,b.g);assert(score<limit,`Near overlap: ${a.id}/${b.id}; ${context}; similarity=${score}`);return score;};
export function checkPair(a,b,limit,context) {return compare(repr(a),repr(b),limit,context);}
export function audit(c,d) {
  const counts={};
  for(const [split,corpus]of Object.entries(d)) {
    const ids=new Set(),texts=new Set(),rows=corpus.rows;
    for(const r of rows){const n=normalize(r.text);assert(!ids.has(r.id)&&!texts.has(n),`Duplicate: ${split}/${r.id}`);ids.add(r.id);texts.add(n);assert(r.split===(split==='trainingSupplement'?'training':split)&&(r.expectedRoute===null||c.routes.includes(r.expectedRoute)),'Invalid split/target');}
    counts[split]={rows:rows.length,known:rows.filter(r=>r.expectedRoute!==null).length,nonRoute:rows.filter(r=>r.expectedRoute===null).length,byRoute:Object.fromEntries(c.routes.map(route=>[route,rows.filter(r=>r.expectedRoute===route).length]))};
  }
  assert(counts.training.rows===2028&&counts.training.known===1553&&counts.training.nonRoute===475&&counts.trainingSupplement.rows===330&&counts.trainingSupplement.known===264&&counts.trainingSupplement.nonRoute===66&&counts.calibration.rows===396&&counts.calibration.known===264&&counts.calibration.nonRoute===132,'Sealed counts drift');
  assert(Object.values(counts.trainingSupplement.byRoute).every(n=>n===12),'Fresh train all22 balance drift');
  assert(Object.values(counts.calibration.byRoute).every(n=>n===12),'Fresh all22 balance drift');
  const cal=d.calibration.rows;
  counts.calibration.bySubtype=Object.fromEntries(['route_unresolved','near_domain_not_current_route','outside_current_22'].map(s=>[s,cal.filter(r=>r.subtype===s).length]));
  counts.calibration.byRoleSafetyGroup=Object.fromEntries(['credit_direction','debt_direction'].map(s=>[s,cal.filter(r=>r.roleSafetyGroup===s).length]));
  assert(Object.values(counts.calibration.bySubtype).every(n=>n===44)&&Object.values(counts.calibration.byRoleSafetyGroup).every(n=>n===8),'Subtype/role balance drift');
  let crossSplitMaximum=0,crossSplitPairs=0,historicalMaximum=0,historicalComparisons=0;
  const tr=d.training.rows.map(repr),ca=cal.map(repr),fresh=[...d.trainingSupplement.rows,...cal].map(repr);
  let freshPairMaximum=0,freshPairs=0;
  for(let n=0;n<fresh.length;n++)for(let k=n+1;k<fresh.length;k++){freshPairMaximum=Math.max(freshPairMaximum,compare(fresh[n],fresh[k],c.duplicatePolicy.maximumCrossSplitSimilarityExclusive,'new literal authoring'));freshPairs++;}
  for(const a of tr)for(const b of ca){crossSplitMaximum=Math.max(crossSplitMaximum,compare(a,b,c.duplicatePolicy.maximumCrossSplitSimilarityExclusive,'train/raw'));crossSplitPairs++;}
  const extract=(v,out=[])=>{if(typeof v==='string'&&/[\u3400-\u9fff]/.test(v)&&normalize(v).length>=8&&normalize(v).length<=200)out.push(v);else if(Array.isArray(v))v.forEach(x=>extract(x,out));else if(v&&typeof v==='object')for(const [key,x]of Object.entries(v))if(!/validation|independent|blind|evaluation/i.test(key))extract(x,out);return out;};
  const historyBindings=[];
  for(const b of c.auditOnlySources){assert(!new RegExp(c.forbiddenNamePattern,'i').test(path.basename(b.path)),'Protected comparator input');checkedBinding(b);const texts=[...new Set(extract(json(b.path)).map(normalize))].map(text=>repr({id:'historical-wording-omitted',text}));historyBindings.push({...b,auditStrings:texts.length,mode:'automated_comparator_only_no_wording_output_or_authoring_source'});for(const a of fresh)for(const historical of texts){historicalMaximum=Math.max(historicalMaximum,compare(a,historical,c.duplicatePolicy.maximumHistoricalSimilarityExclusive,b.path));historicalComparisons++;}}
  return {version:'0.13-candidate-v0.10-data-audit-v0.1',status:'pass_encoder_free_full_raw_data_audit',contractBinding:binding(contractPath),counts,duplicateAudit:{exactDuplicates:0,crossSplitNearDuplicates:0,historicalExactOverlap:0,historicalNearOverlap:0,crossSplitMaximum,crossSplitPairs,historicalMaximum,historicalComparisons,freshPairMaximum,freshPairs},historyBindings,encoderInvocations:0,independentEvaluationRead:false,sealedBlindEvaluationRead:false,reservedResearchRead:false,noDirectoryWalk:true,priorIncidentBinding:c.priorIncidentBinding,conditionalMembershipSelected:false};
}
export function makeLock(c,d,a) {
  const i=json(implementationPath);
  return {version:'0.13-candidate-v0.10-data-lock-v0.1',status:'sealed_before_any_candidate_v10_encoder_scoring',bindings:[...new Set([contractPath,implementationPath,...i.bindings.map(b=>b.path),c.outputs.training,c.outputs.calibration,c.outputs.trainingSupplement,c.outputs.audit])].map(binding),counts:a.counts,duplicateAudit:a.duplicateAudit,membership:Object.fromEntries(Object.entries(d).map(([s,v])=>[s,v.rows.map(r=>({id:r.id,expectedRoute:r.expectedRoute,subtype:r.subtype,roleSafetyGroup:r.roleSafetyGroup||null,style:r.style,split:r.split,source:r.source,textSha256:hashBytes(r.text),normalizedTextSha256:hashBytes(normalize(r.text))}))])),governance:{encoderInvocations:0,conditionalMembershipSelected:false,weightsTrained:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,priorReadIncidentPreserved:true}};
}
export function verify({requireSeal=true,requireCommitted=true}={}) {
  const {c,i}=contract({requireCommitted}),generated=generate(c),d=Object.fromEntries(['training','calibration','trainingSupplement'].map(s=>[s,json(c.outputs[s])]));
  assert(d.training.sealed===d.calibration.sealed,'Partial seal forbidden');
  for(const s of ['training','calibration','trainingSupplement'])assert(equal(d[s],d[s].sealed?sealed(generated[s]):generated[s]),`Corpus drift: ${s}`);
  const a=audit(c,d);
  if(requireSeal||d.training.sealed){assert(d.training.sealed&&d.trainingSupplement.sealed,'Seal required');assert(equal(json(c.outputs.audit),a),'Audit replay drift');assert(equal(json(c.outputs.dataLock),makeLock(c,d,a)),'Ordered membership lock drift');if(requireCommitted)for(const p of [c.outputs.training,c.outputs.calibration,c.outputs.trainingSupplement,c.outputs.audit,c.outputs.dataLock])committed(p);}
  return {c,i,d,a};
}
