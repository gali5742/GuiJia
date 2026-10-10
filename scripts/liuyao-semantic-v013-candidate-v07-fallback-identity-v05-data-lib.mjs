import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
export {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize};
export const prefix='data/liuyao-semantic-v013-candidate-v07-fallback-identity-v05';
export const stem='liuyao-semantic-v013-candidate-v07-fallback-identity-v05';
export const contractPath=`${prefix}-data-contract-v0.1.json`;
export const implementationPath=`${prefix}-data-implementation-contract-v0.1.json`;
export const libraryPath=`scripts/${stem}-data-lib.mjs`;
export const toolPaths=['generate','verify','seal'].map(s=>`scripts/${s}-${stem}-data.mjs`);
export const subtypes=['route_unresolved','near_domain_not_current_route','outside_current_22'];
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
export const checkedBinding=b=>assert(equal(binding(b.path),b),`Frozen binding drift: ${b.path}`);
export function contract({requireCommitted=false}={}) {
  const c=json(contractPath),implementation=json(implementationPath);
  assert(c.status==='schema_counts_labels_splits_policy_frozen_before_fresh_authoring_and_encoder_scoring','Schema freeze required');
  assert(implementation.status==='frozen_literal_authoring_and_data_tooling_before_generation_seal_and_encoder','Data implementation freeze required');
  for(const b of implementation.bindings){checkedBinding(b);if(requireCommitted)assert(git(['rev-parse',`HEAD:${b.path}`])===b.gitBlobSha,`Uncommitted seal input: ${b.path}`);}
  if(requireCommitted)assert(git(['rev-parse',`HEAD:${implementationPath}`])===binding(implementationPath).gitBlobSha,'Implementation contract not committed');
  for(const b of [c.designBinding,c.responsibilityReviewBinding,c.training.historicalBinding,c.training.historicalSealBinding,c.governance.futureChecksMustPreloadEvaluationReadGuard])checkedBinding(b);
  assert(equal(c.routes,json('data/liuyao-semantic-route-inventory-v0.2.json').routes.map(x=>x.routeId))&&c.routes.length===22,'All22 inventory drift');
  assert(c.training.rows===1698&&c.training.known===1289&&c.training.nonRoute===409&&c.training.freshRows===242,'Training counts drift');
  assert(c.calibration.rawRows===308&&c.calibration.rawKnown===176&&c.calibration.rawNonRoute===132,'Raw calibration counts drift');
  assert(implementation.encoderInvocations===0&&!implementation.semanticPolicyChange&&!implementation.rawMembershipFilterAllowed,'Encoder-free full-raw data boundary drift');
  assert(c.sealPolicy.noEncoderBeforeDataCI&&c.sealPolicy.noMembershipReplenishmentAfterUpstreamAudit,'Seal/exposure boundary drift');
  assert(equal(c.rowSchema.modelInputFields,['text'])&&equal(c.rowSchema.modelTargetFields,['expectedRoute']),'Model feature/target boundary drift');
  return {c,implementation};
}
export function fresh(c) {
  const a=json(c.authoringPlan.path),result={};
  assert(a.generation==='individually_authored_literal_texts_no_template_expansion_no_model_feedback'&&a.contractPath===contractPath&&a.wordingCreatedBeforeContaminationAudit&&!a.encoderScoringObserved&&!a.independentEvaluationRead&&!a.sealedBlindEvaluationRead,'Literal authoring boundary drift');
  for(const split of ['training','calibration']) {
    const allocation=split==='training'?c.authoringPlan.allocatedTraining:c.authoringPlan.allocatedRawCalibration;
    const rows=a.rows[split];assert(Array.isArray(rows)&&rows.length===allocation.length,'Fresh allocation count drift');
    result[split]={version:`0.13-candidate-v0.7-fallback-identity-v0.5-fresh-${split}-v0.1`,sealed:false,status:`presealed_${split}`,contractBinding:binding(contractPath),authoringBinding:binding(c.authoringPlan.path),rows:rows.map((r,i)=>{
      assert(equal(Object.keys(r),[...Object.keys(allocation[i]),'text'])&&equal(Object.fromEntries(Object.entries(r).filter(([k])=>k!=='text')),allocation[i]),`Frozen allocation drift: ${allocation[i].id}`);
      assert(typeof r.text==='string'&&r.text.trim()===r.text&&normalize(r.text).length>=8,`Invalid literal: ${r.id}`);
      return {...r,split,source:c.authoringPlan.path};
    })};
  }
  return result;
}
export function historical(c) {
  const t=c.training,source=json(t.historicalBinding.path),seal=json(t.historicalSealBinding.path);
  assert(source.sealed&&source.status==='sealed_training'&&source.rows.length===t.historicalRows,'Prior train-only corpus must remain sealed');
  const sourceBinding=seal.bindings.find(b=>b.path===t.historicalBinding.path);
  assert(equal(sourceBinding,t.historicalBinding)&&seal.membership.training.length===t.historicalRows,'Prior training membership proof missing');
  const rows=source.rows.map((r,i)=>{
    const m=seal.membership.training[i];
    assert(r.split==='training'&&r.id===m.id&&r.expectedRoute===m.expectedRoute&&hashBytes(normalize(r.text))===m.normalizedTextSha256,'Prior training member drift');
    return {id:`V013-V07-FI-H-${String(i+1).padStart(4,'0')}`,expectedRoute:r.expectedRoute,subtype:r.expectedRoute?'historical_known':'historical_nonroute',roleSafetyGroup:r.roleSafetyGroup||null,style:'historical_training_only',text:r.text,split:'training',source:t.historicalBinding.path,originId:r.id,originSource:r.source};
  });
  assert(rows.filter(r=>r.expectedRoute!==null).length===t.historicalKnown&&rows.filter(r=>r.expectedRoute===null).length===t.historicalNonRoute,'Prior train-only distribution drift');
  return rows;
}
export function generate(c) {
  const f=fresh(c),h=historical(c);
  return {augmentation:f.training,training:{...f.training,version:'0.13-candidate-v0.7-fallback-identity-v0.5-training-v0.1',rows:[...h,...f.training.rows]},calibration:f.calibration};
}
export const sealCorpus=d=>({...d,sealed:true,status:`sealed_${d.rows[0].split}`,sealedBeforeFirstCandidateV07EncoderScoring:true});
const grams=text=>{const chars=Array.from(normalize(text));return new Set(chars.length<3?[chars.join('')]:chars.slice(0,-2).map((_,i)=>chars.slice(i,i+3).join('')));};
const similarity=(a,b)=>{let n=0;for(const token of a)if(b.has(token))n++;return n/(a.size+b.size-n||1);};
export function audit(c,d) {
  const counts={};
  for(const [split,rows] of Object.entries({augmentation:d.augmentation.rows,training:d.training.rows,calibration:d.calibration.rows})) {
    const ids=new Set(),texts=new Map();
    counts[split]={rows:rows.length,known:0,nonRoute:0,byRoute:Object.fromEntries(c.routes.map(r=>[r,0])),bySubtype:{},byRoleSafetyGroup:{credit_direction:0,debt_direction:0},byStyle:{}};
    for(const r of rows) {
      const n=normalize(r.text);
      assert(!ids.has(r.id)&&!texts.has(n),`Duplicate/label conflict: ${split}/${r.id}`);ids.add(r.id);texts.set(n,r.id);
      assert(r.split===(split==='calibration'?'calibration':'training')&&n.length>=8&&(r.expectedRoute===null||c.routes.includes(r.expectedRoute)),`Invalid row: ${r.id}`);
      if(r.expectedRoute!==null){counts[split].known++;counts[split].byRoute[r.expectedRoute]++;}else counts[split].nonRoute++;
      counts[split].bySubtype[r.subtype]=(counts[split].bySubtype[r.subtype]||0)+1;
      counts[split].byStyle[r.style]=(counts[split].byStyle[r.style]||0)+1;
      if(r.roleSafetyGroup){assert(Object.hasOwn(counts[split].byRoleSafetyGroup,r.roleSafetyGroup),`Invalid role group: ${r.id}`);counts[split].byRoleSafetyGroup[r.roleSafetyGroup]++;}
      if(r.source===c.authoringPlan.path)assert(!/(六亲|世爻|应爻|用神|官鬼|妻财|父母爻|兄弟爻|子孙爻|TR\/MR|病情|疾病占|诊断疾病)/.test(r.text),`Forbidden fresh semantic content: ${r.id}`);
    }
  }
  for(const [s,n,k,non] of [['training',1698,1289,409],['augmentation',242,176,66],['calibration',308,176,132]])assert(counts[s].rows===n&&counts[s].known===k&&counts[s].nonRoute===non,`Counts drift: ${s}`);
  for(const route of c.routes)assert(counts.augmentation.byRoute[route]===8&&counts.calibration.byRoute[route]===8,`All22 coverage drift: ${route}`);
  for(const s of subtypes)assert(counts.augmentation.bySubtype[s]===22&&counts.calibration.bySubtype[s]===44,`Subtype coverage drift: ${s}`);
  for(const role of ['credit_direction','debt_direction'])assert(counts.augmentation.byRoleSafetyGroup[role]===4&&counts.calibration.byRoleSafetyGroup[role]===8,`Role coverage drift: ${role}`);
  const repr=rows=>rows.map(r=>({id:r.id,n:normalize(r.text),g:grams(r.text)}));
  let crossSplitMaximum=0,crossSplitPairs=0,historicalMaximum=0,historicalComparisons=0;
  const tr=repr(d.training.rows),ca=repr(d.calibration.rows);
  for(const a of tr)for(const b of ca) {
    assert(a.n!==b.n,`Cross-split exact overlap: ${a.id}/${b.id}`);
    const sim=similarity(a.g,b.g);crossSplitMaximum=Math.max(crossSplitMaximum,sim);crossSplitPairs++;
    assert(sim<c.duplicatePolicy.maximumCrossSplitSimilarityExclusive,`Cross-split near-copy: ${a.id}/${b.id}; similarity=${sim}`);
  }
  // Explicit source allowlist; no directory walk or blind/independent comparison.
  // Historical strings never leave this comparator or enter the fresh authoring.
  const extract=(v,out=[])=>{
    if(typeof v==='string'&&/[\u3400-\u9fff]/.test(v)&&normalize(v).length>=8&&normalize(v).length<=200)out.push(v);
    else if(Array.isArray(v))v.forEach(x=>extract(x,out));
    else if(v&&typeof v==='object')for(const [key,x]of Object.entries(v))if(!/validation|independent|blind|evaluation/i.test(key))extract(x,out);
    return out;
  };
  const fr=repr([...d.augmentation.rows,...d.calibration.rows]),historyBindings=[];
  for(const source of c.contaminationPolicy.auditOnlySources) {
    assert(!new RegExp(c.contaminationPolicy.noReadNamePattern,'i').test(path.basename(source.path)),'Forbidden audit source');checkedBinding(source);
    const hist=[...new Set(extract(json(source.path)).map(normalize))].map(n=>({n,g:grams(n)}));
    historyBindings.push({...source,auditStrings:hist.length,mode:'automated_exact_trigram_comparator_only_no_wording_output_or_authoring_source'});
    for(const a of fr)for(const b of hist) {
      assert(a.n!==b.n,`Fresh historical overlap: ${a.id}; source=${source.path}`);
      const sim=similarity(a.g,b.g);historicalMaximum=Math.max(historicalMaximum,sim);historicalComparisons++;
      assert(sim<c.duplicatePolicy.maximumHistoricalSimilarityExclusive,`Fresh historical near-copy: ${a.id}; source=${source.path}; similarity=${sim}`);
    }
  }
  return {version:'0.13-candidate-v0.7-fallback-identity-v0.5-data-audit-v0.1',status:'pass_encoder_free_data_audit',contractBinding:binding(contractPath),authoringBinding:binding(c.authoringPlan.path),counts,duplicateAudit:{exactDuplicates:0,crossSplitNearDuplicates:0,freshHistoricalExactOverlap:0,freshHistoricalNearOverlap:0,crossSplitMaximum,historicalMaximum,crossSplitPairs,historicalComparisons},historyBindings,protectedIsolation:{independentEvaluationRead:false,sealedBlindEvaluationRead:false,reservedResearchRead:false,noDirectoryWalk:true,candidateV04DevelopmentRead:'automated_comparator_only_no_wording_output',historicalIncidentPreserved:c.governance.historicalBlindReadIncident},encoderInvocations:0,modelScoringOccurred:false,conditionalMembershipSelected:false};
}
export function makeLock(c,d,a) {
  const implementation=json(implementationPath);
  const inputs=[contractPath,'data/liuyao-semantic-v013-candidate-v07-design-v0.1.json','data/liuyao-semantic-v013-candidate-v07-design.lock.json',implementationPath,...implementation.bindings.map(b=>b.path),...['augmentation','training','calibration','audit'].map(k=>c.outputs[k])];
  return {version:'0.13-candidate-v0.7-fallback-identity-v0.5-data-lock-v0.1',status:'sealed_before_any_candidate_v07_encoder_scoring',bindings:[...new Set(inputs)].map(binding),counts:a.counts,duplicateAudit:a.duplicateAudit,membership:Object.fromEntries(['augmentation','training','calibration'].map(s=>[s,d[s].rows.map(r=>({id:r.id,expectedRoute:r.expectedRoute,subtype:r.subtype,roleSafetyGroup:r.roleSafetyGroup,style:r.style,split:r.split,source:r.source,textSha256:hashBytes(r.text),normalizedTextSha256:hashBytes(normalize(r.text))}))])),frozenCalibration:c.calibration,governance:{encoderInvocations:0,independentEvaluationRead:false,sealedBlindEvaluationRead:false,modelScoringOccurred:false,upstreamConditionalMembershipFrozen:false,newWeightTraining:false,oldFailureStatusChanged:false,implementationContractBinding:binding(implementationPath)},nextAction:'confirm_real_data_CI_success_and_seal_commit_then_freeze_new_execution_contract_before_upstream_exposure_audit'};
}
export function verify({requireSeal=false,requireCommitted=false}={}) {
  const {c,implementation}=contract({requireCommitted}),generated=generate(c),d=Object.fromEntries(['augmentation','training','calibration'].map(k=>[k,json(c.outputs[k])]));
  assert(new Set(Object.values(d).map(x=>x.sealed)).size===1,'Partial seal forbidden');
  for(const k of Object.keys(d))assert(equal(d[k],d[k].sealed?sealCorpus(generated[k]):generated[k]),`Generated corpus drift: ${k}`);
  const a=audit(c,d);
  if(requireSeal||d.training.sealed||exists(c.outputs.dataLock)) {
    assert(d.training.sealed,'Membership seal required');assert(equal(json(c.outputs.audit),a),'Audit drift');assert(equal(json(c.outputs.dataLock),makeLock(c,d,a)),'Complete membership lock drift');
  }
  return {c,implementation,d,a};
}
