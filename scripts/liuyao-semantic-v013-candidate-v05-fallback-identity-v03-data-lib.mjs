import path from 'node:path';
import {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
export {root,read,json,serialize,exists,assert,hashBytes,binding,write,equal,normalize};
export const prefix = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03';
export const stem = 'liuyao-semantic-v013-candidate-v05-fallback-identity-v03';
export const contractPath = `${prefix}-data-contract-v0.1.json`;
export const libraryPath = `scripts/${stem}-data-lib.mjs`;
export const toolsPaths = ['generate','verify','seal'].map(x=>`scripts/${x}-${stem}-data.mjs`);
export const subtypes = ['route_unresolved','near_domain_not_current_route','outside_current_22'];
export function checkedBinding(expected) {
  assert(equal(binding(expected.path),expected),`Frozen binding drift: ${expected.path}`);
}
export function contract() {
  const c=json(contractPath);
  assert(c.status==='frozen_before_phase_b_encoder_scoring','Phase B contract freeze required');
  c.bindings.forEach(checkedBinding);
  assert(c.routes.length===22 && equal(c.routes,json(c.inventoryPath).routes.map(x=>x.routeId)),'Current22 inventory drift');
  assert(c.training.historicalRows===1016 && c.training.historicalKnown===805 && c.training.historicalNonRoute===211 && c.training.freshRows===198 && c.training.rows===1214,'Training contract drift');
  assert(c.calibration.rows===132 && c.calibration.known===66 && c.calibration.nonRoute===66,'Calibration contract drift');
  assert(c.calibration.membership==='all_raw_sealed_rows_without_upstream_filtering','Hard negatives may not be silently removed');
  assert(equal(c.algorithm.hyperparameters,{epochs:360,learningRate:0.42,l2:0.0015}) && c.algorithm.trainFromScratch && !c.algorithm.legacyWeightsReusable,'Algorithm drift');
  assert(c.calibration.gates.minimumKnownExact===0.80 && c.calibration.gates.minimumAcceptedKnownAccuracy===0.98 && c.calibration.gates.maximumNonRouteFalseActivation===0.05 && c.calibration.gates.maximumEachSubtypeFalseActivation===0.05,'Frozen gates drift');
  assert(c.calibration.oneGlobalThresholdOnly && !c.calibration.perRouteOrFamilyThresholds && c.calibration.commitWeightsBeforeFallbackProbabilityScoring,'Calibration boundary drift');
  assert(c.encoderExecution.canonicalTextsPerEncoderCall===1 && c.encoderExecution.vectorSize===512 && !c.encoderExecution.encoderRetraining,'Encoder drift');
  for(const k of ['independentEvaluationRead','sealedBlindEvaluationRead','candidateV04FailureWordingUsedForGeneration','phaseBEncoderScoringBeforeContract','traditionalFeaturesUsed']) assert(c.governance[k]===false,`Governance drift: ${k}`);
  return c;
}
export function fresh(c) {
  const a=json(c.authoringPath), out={};
  assert(a.generation==='individually_authored_literal_texts_no_template_expansion_no_model_feedback' && equal(a.knownGroups.map(x=>x.routeId),c.routes),'Fresh authoring drift');
  for(const split of ['training','calibration']) {
    const tag=split==='training'?'T':'C', rows=[];
    a.knownGroups.forEach((g,i)=>{
      assert(g[split].length===(split==='training'?6:3),'Fresh route coverage drift');
      g[split].forEach((text,j)=>rows.push({id:`V013-V05-FI-${tag}-K-${String(i+1).padStart(2,'0')}-${j+1}`,text,expectedRoute:g.routeId,subtype:'known',split,source:c.authoringPath,style:['strong','support','fallback'][j%3]}));
    });
    subtypes.forEach((subtype,i)=>{
      const texts=a.nonRouteGroups[subtype][split]; assert(texts.length===22,'Fresh nonroute coverage drift');
      texts.forEach((text,j)=>rows.push({id:`V013-V05-FI-${tag}-N-${i+1}-${String(j+1).padStart(2,'0')}`,text,expectedRoute:null,subtype,split,source:c.authoringPath,style:subtype,roleSafetyGroup:subtype==='route_unresolved'&&j<8?(j<4?'credit_direction':'debt_direction'):null}));
    });
    out[split]={version:`0.13-candidate-v0.5-fallback-identity-v0.3-fresh-${split}-v0.1`,sealed:false,status:`presealed_${split}`,contractBinding:binding(contractPath),rows};
  }
  return out;
}
export function historical(c) {
  const rows=[], patch=json(c.training.labelPatchPath), expansion=json(c.training.expansionPath);
  const textOf=x=>typeof x==='string'?x:String(x?.text||'').trim();
  assert(patch.base===path.basename(c.training.expansionPath),'Patch base drift');
  const mapping=Object.entries(patch.train);assert(mapping.length===29,'Patch mapping count drift');
  for(const [text,route] of mapping) assert(c.routes.includes(route)&&expansion.hardNegatives.train.filter(x=>textOf(x)===text).length===1,'Label patch must override exactly one training negative');
  function add(text,expectedRoute,source,originId=null) {
    assert(typeof text==='string'&&text.trim().length && (expectedRoute===null||c.routes.includes(expectedRoute)),`Historical schema drift: ${source}`);
    rows.push({id:`V013-V05-FI-H-${String(rows.length+1).padStart(4,'0')}`,text:text.trim(),expectedRoute,subtype:expectedRoute?'historical_known':'historical_nonroute',split:'training',source,originId});
  }
  for(const p of c.training.historicalRoutePaths) {
    const d=json(p);
    for(const route of c.routes) for(const text of d.routes?.[route]?.train||[]) add(text,route,p);
    for(const raw of d.hardNegatives?.train||[]) {
      const text=textOf(raw);let route=typeof raw==='object'?raw.expectedRoute||null:null;
      if(!route&&p===c.training.expansionPath) route=patch.train[text]||null;
      add(text,c.routes.includes(route)?route:null,p);
    }
  }
  const p=c.training.historicalAugmentationPath,d=json(p);
  assert(d.sealed && d.status==='sealed_training_augmentation' && d.policy.useForFallbackIdentityTraining && !d.policy.useForThresholdCalibration && d.policy.encoderScoringObserved===false && !d.policy.independentEvaluationRead && !d.policy.sealedBlindEvaluationRead && d.rows.length===198,'Historical augmentation eligibility drift');
  for(const r of d.rows) {
    assert((r.identityLabel==='route_identity_positive')===c.routes.includes(r.expectedRoute),'Historical target drift');
    add(r.text,c.routes.includes(r.expectedRoute)?r.expectedRoute:null,p,r.id);
  }
  // No evaluation or validation members enter this assembly. Never expose historical wording in errors.
  const seen=new Map();
  for(const r of rows) {
    const key=normalize(r.text), prior=seen.get(key);
    assert(!prior,`Historical duplicate/conflict: ${r.id}; source=${r.source}`);seen.set(key,r);
  }
  assert(rows.length===1016 && rows.filter(r=>r.expectedRoute).length===805,'Historic assembly count drift');
  return rows;
}
export function generate(c) {
  const f=fresh(c),h=historical(c);
  return {augmentation:f.training,training:{...f.training,version:'0.13-candidate-v0.5-fallback-identity-v0.3-training-v0.1',rows:[...h,...f.training.rows]},calibration:f.calibration};
}
export const sealCorpus = d=>({...d,sealed:true,status:`sealed_${d.rows[0].split}`,sealedBeforeFirstPhaseBEncoderScoring:true});
const grams=text=>{const chars=Array.from(normalize(text));return new Set(chars.length<3?[chars.join('')]:chars.slice(0,-2).map((_,i)=>chars.slice(i,i+3).join('')));};
const similarity=(a,b)=>{let n=0;for(const t of a)if(b.has(t))n++;return n/(a.size+b.size-n||1);};
export function audit(c,d) {
  const f=[...d.augmentation.rows,...d.calibration.rows],train=d.training.rows,cal=d.calibration.rows;
  const counts={};
  for(const [split,rows] of Object.entries({augmentation:d.augmentation.rows,training:train,calibration:cal})) {
    const ids=new Set(),texts=new Set();
    counts[split]={rows:rows.length,known:0,nonRoute:0,byRoute:Object.fromEntries(c.routes.map(r=>[r,0])),bySubtype:{}};
    for(const r of rows) {
      assert(!ids.has(r.id)&&!texts.has(normalize(r.text)),`Duplicate/conflict in ${split}: ${r.id}`);ids.add(r.id);texts.add(normalize(r.text));
      assert(r.split===(split==='calibration'?'calibration':'training') && normalize(r.text).length>=8 && (r.expectedRoute===null||c.routes.includes(r.expectedRoute)),`Invalid row: ${r.id}`);
      if(r.expectedRoute){counts[split].known++;counts[split].byRoute[r.expectedRoute]++;}else counts[split].nonRoute++;
      counts[split].bySubtype[r.subtype]=(counts[split].bySubtype[r.subtype]||0)+1;
      if(r.source===c.authoringPath) assert(!/(六亲|世爻|应爻|用神|官鬼|妻财|父母爻|兄弟爻|子孙爻|TR\/MR)/.test(r.text),`Traditional features: ${r.id}`);
    }
  }
  assert(counts.training.rows===1214&&counts.training.known===937&&counts.training.nonRoute===277,'Training counts drift');
  assert(counts.augmentation.rows===198&&counts.augmentation.known===132&&counts.augmentation.nonRoute===66,'Augmentation counts drift');
  assert(counts.calibration.rows===132&&counts.calibration.known===66&&counts.calibration.nonRoute===66,'Calibration counts drift');
  for(const route of c.routes) assert(counts.augmentation.byRoute[route]===6&&counts.calibration.byRoute[route]===3,'Fresh all22 coverage drift');
  for(const split of ['augmentation','calibration']) for(const s of subtypes)assert(counts[split].bySubtype[s]===22,'Fresh subtype count drift');
  const repr=rows=>rows.map(r=>({id:r.id,n:normalize(r.text),g:grams(r.text)}));
  let crossSplitMaximum=0,crossSplitPairs=0,historicalMaximum=0,historicalComparisons=0;
  for(const a of repr(train))for(const b of repr(cal)) {
    assert(a.n!==b.n,`Cross-split exact overlap: ${a.id}/${b.id}`);
    const sim=similarity(a.g,b.g);crossSplitMaximum=Math.max(crossSplitMaximum,sim);crossSplitPairs++;
    assert(sim<c.duplicatePolicy.maximumCrossSplitSimilarityExclusive,`Cross-split near-copy: ${a.id}/${b.id}; similarity=${sim}`);
  }
  const historyBindings=[];
  const extract=(v,out=[])=>{
    if(typeof v==='string'&&/[\u3400-\u9fff]/.test(v)&&normalize(v).length>=8&&normalize(v).length<=200)out.push(v);
    else if(Array.isArray(v))v.forEach(x=>extract(x,out));
    else if(v&&typeof v==='object')for(const [key,x]of Object.entries(v))if(!/validation|independent|blind|evaluation/i.test(key))extract(x,out);
    return out;
  };
  const fr=repr(f);
  for(const source of c.contaminationPolicy.auditOnlySources) {
    assert(!new RegExp(c.contaminationPolicy.noReadNamePattern,'i').test(path.basename(source.path)),'Forbidden audit source');checkedBinding(source);
    const hist=[...new Set(extract(json(source.path)).map(normalize))].map(n=>({n,g:grams(n)}));
    historyBindings.push({...source,auditStrings:hist.length,mode:'automated exact/trigram comparator only; wording never exposed to authoring or terminal'});
    for(const a of fr)for(const b of hist) {
      assert(a.n!==b.n,`Fresh historical exact overlap: ${a.id}; source=${source.path}`);
      const sim=similarity(a.g,b.g);historicalMaximum=Math.max(historicalMaximum,sim);historicalComparisons++;
      assert(sim<c.duplicatePolicy.maximumHistoricalSimilarityExclusive,`Fresh historical near-copy: ${a.id}; source=${source.path}; similarity=${sim}`);
    }
  }
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-data-audit-v0.1',status:'pass_encoder_free_data_audit',contractBinding:binding(contractPath),counts,duplicateAudit:{exactDuplicates:0,crossSplitNearDuplicates:0,freshHistoricalExactOverlap:0,freshHistoricalNearOverlap:0,crossSplitMaximum,historicalMaximum,crossSplitPairs,historicalComparisons},historyBindings,protectedIsolation:{independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV04DevelopmentRead:'automated comparator only; no wording exposure',candidateV04FailureWordingUsedForGeneration:false},phaseBEncoderScoringOccurred:false};
}
export function makeLock(c,d,a) {
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-data-lock-v0.1',status:'sealed_before_phase_b_encoder_scoring',bindings:[contractPath,c.authoringPath,...['augmentation','training','calibration','audit'].map(x=>c.outputs[x]),libraryPath,...toolsPaths].map(binding),counts:a.counts,duplicateAudit:a.duplicateAudit,membership:Object.fromEntries(['training','calibration'].map(s=>[s,d[s].rows.map(r=>({id:r.id,expectedRoute:r.expectedRoute,subtype:r.subtype,source:r.source,normalizedTextSha256:hashBytes(normalize(r.text))}))])),frozenCalibration:c.calibration,governance:c.governance,nextAction:'confirm_committed_data_seal_and_successful_ci_before_upstream_audit_then_commit_reachability_before_training'};
}
export function verify({requireSeal=false}={}) {
  const c=contract(),g=generate(c),d=Object.fromEntries(['augmentation','training','calibration'].map(k=>[k,json(c.outputs[k])]));
  assert(new Set(Object.values(d).map(x=>x.sealed)).size===1,'Partial seal forbidden');
  for(const k of Object.keys(d))assert(equal(d[k],d[k].sealed?sealCorpus(g[k]):g[k]),`Generated corpus drift: ${k}`);
  const a=audit(c,d);
  if(requireSeal||d.training.sealed||exists(c.outputs.dataLock)) {
    assert(d.training.sealed,'Membership seal required');assert(equal(json(c.outputs.audit),a),'Audit drift');assert(equal(json(c.outputs.dataLock),makeLock(c,d,a)),'Data lock drift');
  }
  return {c,d,a};
}
