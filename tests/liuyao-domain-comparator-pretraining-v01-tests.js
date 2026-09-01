'use strict';
const assert=require('assert');
require('../js/liuyao-domain-comparator-pretraining-v01.js');
const api=global.GuiJia.liuyaoDomainComparatorPretrainingV01;
let n=0;
const t=(x,f)=>{try{f();n++}catch(e){console.error('FAIL',x,e);process.exitCode=1}};
const a=(id,overrides={})=>({
  alternativeId:id,
  dimensionId:'target_outcome',
  semanticMeaning:'employment_target_outcome',
  resolutionStatus:'resolved',
  assessmentStatus:'supportive_evidence',
  contractFamily:'employment_outcome_assessment',
  contractRef:'employment_outcome_assessment_v0.1',
  contractVersion:'0.1',
  evidenceRefs:['EV-1'],
  ...overrides
});
t('DC1 design only',()=>assert.equal(api.currentRuntimeReachable,false));
t('DC2 zero active comparators',()=>assert.equal(api.ACTIVE_COMPARATORS.length,0));
t('DC3 readiness disables ordering',()=>{const r=api.buildComparatorReadiness();assert.equal(r.orderingEnabled,false);assert.equal(r.winnerEnabled,false);assert.equal(r.fallbackHeuristicEnabled,false);});
t('DC4 valid resolved assessment',()=>assert.equal(api.validateDimensionAssessment(a('A')).status,'valid'));
t('DC5 contract family explicit',()=>{const x=a('A');delete x.contractFamily;assert(api.validateDimensionAssessment(x).issues.some(i=>i.code==='contract_family_required'));});
t('DC6 semantic meaning explicit',()=>{const x=a('A');delete x.semanticMeaning;assert(api.validateDimensionAssessment(x).issues.some(i=>i.code==='semantic_meaning_required'));});
t('DC7 scalar score leakage invalid',()=>assert.equal(api.validateDimensionAssessment(a('A',{scalarScore:7})).status,'invalid'));
t('DC8 probability leakage invalid',()=>assert.equal(api.validateDimensionAssessment(a('A',{probability:0.8})).status,'invalid'));
t('DC9 winner leakage invalid',()=>assert.equal(api.validateDimensionAssessment(a('A',{winner:'A'})).status,'invalid'));
t('DC10 recommendation leakage invalid',()=>assert.equal(api.validateDimensionAssessment(a('A',{overallRecommendation:'A'})).status,'invalid'));
t('DC11 dimension mismatch incomparable',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{dimensionId:'stability'}));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.reason,'dimension_mismatch');assert.equal(r.relation,null);});
t('DC12 semantic meaning mismatch incomparable',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{semanticMeaning:'education_target_outcome'}));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.reason,'semantic_meaning_mismatch');});
t('DC13 contract family mismatch incomparable',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{contractFamily:'education_outcome_assessment'}));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.reason,'contract_family_mismatch');});
t('DC14 partial remains partial',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{resolutionStatus:'partial'}));assert.equal(r.comparisonStatus,'partial');assert.equal(r.reason,'resolution_partial');});
t('DC15 unresolved remains unresolved',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{resolutionStatus:'unresolved'}));assert.equal(r.comparisonStatus,'unresolved');assert.equal(r.reason,'resolution_unresolved');});
t('DC16 not applicable is not ranked',()=>{const r=api.compareDimensionAssessments(a('A'),a('B',{resolutionStatus:'not_applicable'}));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.reason,'dimension_not_applicable');});
t('DC17 resolved pair without comparator refuses',()=>{const r=api.compareDimensionAssessments(a('A'),a('B'));assert.equal(r.comparisonStatus,'incomparable');assert.equal(r.reason,'comparator_not_registered');assert.equal(r.relation,null);});
t('DC18 supportive vs adverse does not imply order',()=>{const r=api.compareDimensionAssessments(a('A',{assessmentStatus:'supportive_evidence'}),a('B',{assessmentStatus:'adverse_evidence'}));assert.equal(r.reason,'comparator_not_registered');assert.equal(r.relation,null);});
t('DC19 evidence count does not imply order',()=>{const r=api.compareDimensionAssessments(a('A',{evidenceRefs:['E1','E2','E3']}),a('B',{evidenceRefs:['E4']}));assert.equal(r.reason,'comparator_not_registered');assert.equal(r.relation,null);});
t('DC20 raw helper fields do not create fallback ranking',()=>{const r=api.compareDimensionAssessments(a('A',{lineScore:99,interpretationPriority:100,rawSupportCount:20}),a('B',{lineScore:1,interpretationPriority:1,rawSupportCount:0}));assert.equal(r.reason,'comparator_not_registered');assert.equal(r.relation,null);});
t('DC21 invalid assessment status rejected',()=>assert.equal(api.validateDimensionAssessment(a('A',{assessmentStatus:'preferred'})).status,'invalid'));
t('DC22 malformed evidence refs rejected',()=>assert.equal(api.validateDimensionAssessment(a('A',{evidenceRefs:['E1','']})).status,'invalid'));
t('DC23 missing required side yields unresolved contract error',()=>{const r=api.compareDimensionAssessments(a('A'),null);assert.equal(r.comparisonStatus,'unresolved');assert.equal(r.reason,'invalid_assessment_contract');});
t('DC24 legal exposure is not inferred by generic comparator',()=>{const x={dimensionId:'legal_exposure',semanticMeaning:'modern_legal_exposure',contractFamily:'legal_fact_assessment',contractRef:'legal_fact_assessment_v0.1'};const r=api.compareDimensionAssessments(a('A',x),a('B',x));assert.equal(r.reason,'comparator_not_registered');assert.equal(r.relation,null);});
if(!process.exitCode)console.log(`Domain comparator safe-refusal regression: ${n} passed, 0 failed`);
