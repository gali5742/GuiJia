#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const ROOT=path.resolve(__dirname,'..');
let passed=0;let failed=0;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const test=(name,fn)=>{try{fn();passed+=1;console.log(`✓ ${name}`);}catch(error){failed+=1;console.error(`✗ ${name}`);console.error(`  ${error.message}`);}};
const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number,Float32Array,Float64Array};
context.window=context;context.globalThis=context;vm.createContext(context);
[
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-fallback-identity-scorer-v02.js',
  'js/liuyao-semantic-fallback-identity-v02.js',
  'js/liuyao-semantic-route-selection-v05.js'
].forEach((relative)=>vm.runInContext(fs.readFileSync(path.join(ROOT,relative),'utf8'),context,{filename:relative}));

const G=context.GuiJia;
const scorer=G.liuyaoSemanticFallbackIdentityScorerV02;
const fallback=G.liuyaoSemanticFallbackIdentityV02;
const selection=G.liuyaoSemanticRouteSelectionV05;
const ROUTES=[...fallback.routeIds];
const THRESHOLD=0.7393900568553358;
const probs=(overrides={})=>Object.fromEntries(ROUTES.map((routeId)=>[routeId,Object.prototype.hasOwnProperty.call(overrides,routeId)?overrides[routeId]:0.1]));
const zeroWeights=()=>Array(512).fill(0);
const fakeModel=()=>({
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-model-v0.1',
  status:'weights_locked_before_threshold_calibration',
  globalThreshold:null,
  thresholdSelected:false,
  algorithm:{routeOrder:[...ROUTES]},
  heads:Object.fromEntries(ROUTES.map((routeId,index)=>[routeId,{routeId,weights:zeroWeights(),bias:index===7?2:-2}]))
});
const fakeThresholdLock=()=>({
  status:'global_threshold_locked_after_weights',thresholdSelected:true,globalThreshold:THRESHOLD,
  routeCount:22,vectorSize:512,scoreAll22Heads:true,routeSpecificThresholds:false
});

test('R13V4-FB-1 scorer evaluates exactly all 22 heads without Router Top1/Top2 input',()=>{
  const result=scorer.scoreAll({artifact:fakeModel(),thresholdLock:fakeThresholdLock(),vector:new Float32Array(512)});
  assert(result.candidateUniverse==='all_current_22_routes',JSON.stringify(result));
  assert(Object.keys(result.probabilities).length===22,`count=${Object.keys(result.probabilities).length}`);
  ROUTES.forEach((routeId)=>assert(Number.isFinite(result.probabilities[routeId]),`missing ${routeId}`));
  assert(result.probabilities[ROUTES[7]]>result.probabilities[ROUTES[0]],JSON.stringify(result.probabilities));
});

test('R13V4-FB-2 admission gate refuses partial candidate universes',()=>{
  let threw=false;
  try{fallback.decide({probabilities:{borrow_money:0.9},threshold:THRESHOLD});}catch(error){threw=/exactly all current 22 routes/.test(error.message);}
  assert(threw,'partial probability map was accepted');
});

test('R13V4-FB-3 exactly one admitted route is selected regardless of Router membership',()=>{
  const result=fallback.decide({probabilities:probs({marital_relationship:0.91}),threshold:THRESHOLD});
  assert(result.status==='selected'&&result.routeId==='marital_relationship',JSON.stringify(result));
  assert(result.reasonCode==='fallback_identity_all22_unique_admission',JSON.stringify(result));
});

test('R13V4-FB-4 zero admissions abstain',()=>{
  const result=fallback.decide({probabilities:probs(),threshold:THRESHOLD});
  assert(result.status==='route_unresolved'&&result.reasonCode==='fallback_identity_all22_reject_all',JSON.stringify(result));
});

test('R13V4-FB-5 multiple admissions abstain without Router rank or margin tie-break',()=>{
  const result=fallback.decide({probabilities:probs({borrow_money:0.91,lend_money:0.92}),threshold:THRESHOLD});
  assert(result.status==='route_unresolved'&&result.reasonCode==='fallback_identity_all22_multiple_admissions',JSON.stringify(result));
  assert(result.routeId===null,JSON.stringify(result));
});

test('R13V4-FB-6 Selection v0.5 accepts unique Fallback route outside Router Top2',()=>{
  const decision=fallback.decide({probabilities:probs({marital_relationship:0.91}),threshold:THRESHOLD});
  const result=selection.decide({
    arbitration:null,
    head:{top1:{id:'borrow_money',score:0.07},top2:{id:'lend_money',score:0.069}},
    evidence:{},routeabilityDisposition:'route_known',fallbackIdentityDecision:decision
  });
  assert(result.status==='selected'&&result.routeId==='marital_relationship',JSON.stringify(result));
  assert(result.reasonCode==='fallback_identity_all22_unique_admission',JSON.stringify(result));
  const selected=result.candidates.find((candidate)=>candidate.routeId==='marital_relationship');
  assert(selected&&selected.provenance.includes('fallback_identity_all22'),JSON.stringify(result.candidates));
  assert(selected.headRank===null,JSON.stringify(selected));
});

test('R13V4-FB-7 strong Arbitration remains higher priority than all-22 Fallback',()=>{
  const decision=fallback.decide({probabilities:probs({marital_relationship:0.91}),threshold:THRESHOLD});
  const result=selection.decide({
    arbitration:{routeId:'business_operation',strength:'strong'},
    head:{top1:{id:'business_operation',score:0.07},top2:{id:'financial_fortune',score:0.069}},
    evidence:{events:['business_operation'],unsupportedTargets:[]},routeabilityDisposition:'route_known',fallbackIdentityDecision:decision
  });
  assert(result.status==='selected'&&result.routeId==='business_operation',JSON.stringify(result));
  assert(/^strong_arbitration_/.test(result.reasonCode),JSON.stringify(result));
});

test('R13V4-FB-8 support Arbitration cannot silently degrade into unrelated Fallback selection',()=>{
  const decision=fallback.decide({probabilities:probs({marital_relationship:0.91}),threshold:THRESHOLD});
  const result=selection.decide({
    arbitration:{routeId:'business_operation',strength:'support'},
    head:{top1:{id:'marital_relationship',score:0.07},top2:{id:'business_operation',score:0.069}},
    evidence:{events:['business_operation'],unsupportedTargets:[]},routeabilityDisposition:'route_known',fallbackIdentityDecision:decision
  });
  assert(result.status==='selected'&&result.routeId==='business_operation',JSON.stringify(result));
});

test('R13V4-FB-9 Compatibility can veto a uniquely admitted Fallback route',()=>{
  const decision=fallback.decide({probabilities:probs({investment_liquidation:0.91}),threshold:THRESHOLD});
  const result=selection.decide({
    arbitration:null,
    head:{top1:{id:'borrow_money',score:0.07},top2:{id:'lend_money',score:0.069}},
    evidence:{domains:['investment'],events:['investment_liquidation'],unsupportedTargets:['rule_or_procedure_information']},
    routeabilityDisposition:'route_known',fallbackIdentityDecision:decision
  });
  assert(result.status==='route_unresolved'&&result.reasonCode==='fallback_identity_selected_candidate_contradicted',JSON.stringify(result));
});

test('R13V4-FB-10 new runtime modules remain modern-semantic only',()=>{
  const source=[
    'js/liuyao-semantic-fallback-identity-scorer-v02.js',
    'js/liuyao-semantic-fallback-identity-v02.js',
    'js/liuyao-semantic-route-selection-v05.js'
  ].map((relative)=>fs.readFileSync(path.join(ROOT,relative),'utf8')).join('\n');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term)=>assert(!source.includes(term),`traditional field leaked: ${term}`));
});

console.log(`\nLiuYao v0.13-v0.4 Fallback all-22 runtime contract: ${passed} passed, ${failed} failed`);
if(failed)process.exit(1);
