'use strict';
const assert=require('assert');
require('../js/liuyao-domain-assessment-pretraining-v01.js');
require('../js/liuyao-domain-comparator-pretraining-v01.js');
require('../js/liuyao-travel-execution-comparator-pretraining-v02.js');
const shared=global.GuiJia.liuyaoDomainComparatorPretrainingV01;
const api=global.GuiJia.liuyaoTravelExecutionComparatorPretrainingV02;
let n=0;
const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name,e);process.exitCode=1;}};
const a=(id,status='supportive_evidence',overrides={})=>({
  alternativeId:id,
  assessmentRef:'travel_execution_assessment_v0.2',
  assessmentVersion:'0.2',
  contractFamily:'travel_execution_assessment',
  eventType:'travel',
  duty:'travel_execution',
  dimensionId:'target_outcome',
  semanticMeaning:'journey_execution_outcome',
  resolutionStatus:'resolved',
  assessmentStatus:status,
  evidenceRefs:[`${id}-E1`],
  reasonRefs:[`${id}-R1`],
  ...overrides
});

t('TC2-1 isolated candidate not registered',()=>{assert.equal(api.currentRuntimeReachable,false);assert.equal(api.registered,false);});
t('TC2-2 shared comparator registry remains empty',()=>assert.equal(shared.ACTIVE_COMPARATORS.length,0));
t('TC2-3 descriptor accepts only assessment v02',()=>{const d=api.describeCandidate();assert.equal(d.assessmentRef,'travel_execution_assessment_v0.2');assert.deepEqual(d.compatibleAssessmentVersions,['0.2']);});
t('TC2-4 supportive beats adverse',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence'),a('B','adverse_evidence'));assert.equal(r.comparisonStatus,'comparable');assert.equal(r.relation,'left_preferred_on_dimension');});
t('TC2-5 adverse loses to supportive',()=>{const r=api.compareTravelExecution(a('A','adverse_evidence'),a('B','supportive_evidence'));assert.equal(r.relation,'right_preferred_on_dimension');});
t('TC2-6 mixed on left blocks strict order',()=>assert.equal(api.compareTravelExecution(a('A','mixed_evidence'),a('B','adverse_evidence')).relation,'mixed_no_order'));
t('TC2-7 mixed on right blocks strict order',()=>assert.equal(api.compareTravelExecution(a('A','supportive_evidence'),a('B','mixed_evidence')).relation,'mixed_no_order'));
t('TC2-8 supportive vs supportive indistinguishable',()=>assert.equal(api.compareTravelExecution(a('A'),a('B')).relation,'indistinguishable_on_dimension'));
t('TC2-9 adverse vs adverse indistinguishable',()=>assert.equal(api.compareTravelExecution(a('A','adverse_evidence'),a('B','adverse_evidence')).relation,'indistinguishable_on_dimension'));
t('TC2-10 insufficient evidence incomparable',()=>{const r=api.compareTravelExecution(a('A','insufficient_evidence'),a('B'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.relation,null);});
t('TC2-11 unresolved propagates',()=>{const r=api.compareTravelExecution(a('A','not_assessed',{resolutionStatus:'unresolved'}),a('B'));assert.equal(r.comparisonStatus,'unresolved');});
t('TC2-12 partial propagates',()=>{const r=api.compareTravelExecution(a('A','insufficient_evidence',{resolutionStatus:'partial'}),a('B'));assert.equal(r.comparisonStatus,'partial');});
t('TC2-13 not applicable incomparable',()=>{const r=api.compareTravelExecution(a('A','not_assessed',{resolutionStatus:'not_applicable'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');});
t('TC2-14 wrong dimension rejected',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{dimensionId:'risk'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');assert(r.issues.some(i=>i.code==='dimension_mismatch'));});
t('TC2-15 wrong semantic meaning rejected',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{semanticMeaning:'journey_safety'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');});
t('TC2-16 wrong contract family rejected',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{contractFamily:'other'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');});
t('TC2-17 v01 assessment ref rejected',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{assessmentRef:'travel_execution_assessment_v0.1',assessmentVersion:'0.1'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');assert(r.issues.some(i=>i.code==='assessment_ref_mismatch'));});
t('TC2-18 v01 version rejected even with v02 ref',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{assessmentVersion:'0.1'}),a('B'));assert.equal(r.comparisonStatus,'incomparable');assert(r.issues.some(i=>i.code==='assessment_version_incompatible'));});
t('TC2-19 evidence count never changes supportive tie',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{evidenceRefs:['A1','A2','A3']}),a('B','supportive_evidence',{evidenceRefs:['B1']}));assert.equal(r.relation,'indistinguishable_on_dimension');});
t('TC2-20 evidence count never breaks mixed',()=>{const r=api.compareTravelExecution(a('A','mixed_evidence',{evidenceRefs:['A1','A2','A3','A4']}),a('B','adverse_evidence',{evidenceRefs:['B1']}));assert.equal(r.relation,'mixed_no_order');});
t('TC2-21 raw evidence helper fields ignored',()=>{const r=api.compareTravelExecution(a('A','supportive_evidence',{calendarSupportCount:99}),a('B','supportive_evidence',{calendarSupportCount:1}));assert.equal(r.relation,'indistinguishable_on_dimension');});
t('TC2-22 no winner score or probability outputs',()=>{const r=api.compareTravelExecution(a('A'),a('B','adverse_evidence'));for(const k of ['winner','scalarScore','probability','overallRecommendation'])assert.equal(Object.prototype.hasOwnProperty.call(r,k),false);});
t('TC2-23 explicit bindings work for unbound assessments',()=>{const left=a('A');const right=a('B','adverse_evidence');delete left.alternativeId;delete right.alternativeId;const r=api.compareTravelExecution(left,right,{leftAlternativeId:'A',rightAlternativeId:'B'});assert.equal(r.relation,'left_preferred_on_dimension');});
t('TC2-24 binding mismatch rejected',()=>{const r=api.compareTravelExecution(a('A'),a('B'),{leftAlternativeId:'X'});assert.equal(r.comparisonStatus,'unresolved');});
t('TC2-25 descriptor confirms no raw evidence inspection',()=>{const d=api.describeCandidate();assert.equal(d.evidenceCountUsed,false);assert.equal(d.rawEvidenceTypesInspected,false);assert.equal(d.scalarScoreEnabled,false);});
if(!process.exitCode)console.log(`Travel execution comparator v02 regression: ${n} passed, 0 failed`);
