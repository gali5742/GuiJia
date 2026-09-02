'use strict';
const assert=require('assert');
require('../js/liuyao-line-status-fact-adapter-pretraining-v01.js');
const api=global.GuiJia.liuyaoLineStatusFactAdapterPretrainingV01;
let n=0;
const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name,e);process.exitCode=1;}};
const line=(overrides={})=>({
  position:3,
  branch:'午',
  element:'火',
  relation:'兄弟',
  isShi:true,
  isYing:false,
  statusTags:[
    {code:'SEASON_STATE',text:'月令旺',type:'support'},
    {code:'MONTH_COMMAND',text:'临月建',type:'support'},
    {code:'DAY_CONTROL',text:'日辰克',type:'constraint'},
    {code:'VOID',text:'旬空',type:'void'}
  ],
  ...overrides
});

t('LSF1 design only unreachable',()=>{assert.equal(api.currentRuntimeReachable,false);assert.equal(api.registered,false);assert.equal(api.formalEligible,false);});
t('LSF2 valid snapshot accepted',()=>assert.equal(api.validateLineSnapshot(line()).status,'valid'));
t('LSF3 missing line object rejected',()=>assert.equal(api.validateLineSnapshot(null).status,'invalid'));
t('LSF4 position must be 1 to 6',()=>assert.equal(api.validateLineSnapshot(line({position:7})).status,'invalid'));
t('LSF5 branch required',()=>assert.equal(api.validateLineSnapshot(line({branch:''})).status,'invalid'));
t('LSF6 element required',()=>assert.equal(api.validateLineSnapshot(line({element:''})).status,'invalid'));
t('LSF7 status tags array required',()=>assert.equal(api.validateLineSnapshot(line({statusTags:null})).status,'invalid'));
t('LSF8 malformed status tag rejected',()=>assert.equal(api.validateLineSnapshot(line({statusTags:[null]})).status,'invalid'));
t('LSF9 duplicate status code rejected',()=>assert.equal(api.validateLineSnapshot(line({statusTags:[{code:'VOID',text:'旬空',type:'void'},{code:'VOID',text:'旬空',type:'void'}]})).status,'invalid'));
t('LSF10 build preserves one fact per status tag',()=>{const r=api.buildAtomicFacts(line());assert.equal(r.status,'resolved');assert.equal(r.facts.length,4);});
t('LSF11 fact ref stable by position and source code',()=>{const r=api.buildAtomicFacts(line());assert.equal(r.facts[0].factRef,'LINE-STATUS:3:SEASON_STATE');});
t('LSF12 source provenance explicit',()=>{const f=api.buildAtomicFacts(line()).facts[0];assert.equal(f.sourceLayer,'liuyao_line_status');assert.equal(f.sourceRef,'liuyao-core.buildLiuYaoLineStatus');});
t('LSF13 subject identity retained',()=>{const f=api.buildAtomicFacts(line()).facts[0];assert.equal(f.subjectRef.position,3);assert.equal(f.subjectRef.branch,'午');assert.equal(f.subjectRef.element,'火');assert.equal(f.subjectRef.isShi,true);});
t('LSF14 void is atomic void state fact',()=>{const r=api.buildAtomicFacts(line());const f=api.findFactByCode(r,'VOID');assert(f);assert.equal(f.family,'void_state');assert.equal(f.atomic,true);});
t('LSF15 static void is not relabeled TimeFact',()=>{const f=api.findFactByCode(api.buildAtomicFacts(line()),'VOID');assert.equal(f.sourceLayer,'liuyao_line_status');assert.notEqual(f.sourceLayer,'time_fact');});
t('LSF16 source tag type is preserved not converted to assessment',()=>{const f=api.findFactByCode(api.buildAtomicFacts(line()),'DAY_CONTROL');assert.equal(f.sourceTagType,'constraint');assert.equal(Object.prototype.hasOwnProperty.call(f,'polarity'),false);assert.equal(Object.prototype.hasOwnProperty.call(f,'assessmentStatus'),false);});
t('LSF17 no vitality aggregate emitted',()=>{const r=api.buildAtomicFacts(line());assert.equal(Object.prototype.hasOwnProperty.call(r,'travelerVitality'),false);assert.equal(Object.prototype.hasOwnProperty.call(r,'strength'),false);});
t('LSF18 unknown future status remains atomic other state',()=>{const r=api.buildAtomicFacts(line({statusTags:[{code:'FUTURE_STATUS',text:'future',type:'neutral'}]}));assert.equal(r.facts[0].family,'other_line_state');assert.equal(r.facts[0].sourceCode,'FUTURE_STATUS');});
t('LSF19 invalid snapshot emits no facts',()=>{const r=api.buildAtomicFacts(line({position:0}));assert.equal(r.status,'invalid');assert.deepEqual(r.facts,[]);});
t('LSF20 descriptor forbids recomputation and scoring',()=>{const d=api.describeAdapter();assert.equal(d.recomputesLineStatus,false);assert.equal(d.recomputesVoid,false);assert.equal(d.buildsVitalitySummary,false);assert.equal(d.scoringEnabled,false);assert.equal(d.assessmentEnabled,false);});
if(!process.exitCode)console.log(`Line status fact adapter regression: ${n} passed, 0 failed`);
