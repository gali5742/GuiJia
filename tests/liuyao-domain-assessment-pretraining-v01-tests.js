'use strict';
const assert=require('assert');
require('../js/liuyao-domain-assessment-pretraining-v01.js');
const api=global.GuiJia.liuyaoDomainAssessmentPretrainingV01;
let n=0;
const t=(name,fn)=>{try{fn();n++}catch(e){console.error('FAIL',name,e);process.exitCode=1}};
const req=(overrides={})=>({
  eventType:'travel',
  duty:'travel_execution',
  dimensionId:'target_outcome',
  semanticMeaning:'journey_execution_outcome',
  contractFamily:'travel_execution_assessment',
  assessmentRef:'travel_execution_assessment_v0.1',
  assessmentVersion:'0.1',
  evidenceRefs:['EV-1'],
  evidenceResolutionStatus:'resolved',
  ...overrides
});
const env=(overrides={})=>({
  assessmentRef:'travel_execution_assessment_v0.1',
  assessmentVersion:'0.1',
  contractFamily:'travel_execution_assessment',
  eventType:'travel',
  duty:'travel_execution',
  dimensionId:'target_outcome',
  semanticMeaning:'journey_execution_outcome',
  resolutionStatus:'resolved',
  assessmentStatus:'supportive_evidence',
  evidenceRefs:['EV-1'],
  reasonRefs:['AR-TV-1'],
  ...overrides
});
t('DA1 design only',()=>assert.equal(api.currentRuntimeReachable,false));
t('DA2 zero active evaluators',()=>assert.equal(api.ACTIVE_EVALUATORS.length,0));
t('DA3 readiness rejects shared evaluator',()=>{const r=api.buildAssessmentReadiness();assert.equal(r.sharedEvaluator,false);assert.equal(r.fallbackPolarityMappingEnabled,false);assert.equal(r.evidenceCountingEnabled,false);});
t('DA4 valid envelope accepted',()=>assert.equal(api.validateAssessmentEnvelope(env()).status,'valid'));
t('DA5 semantic meaning required',()=>{const x=env();delete x.semanticMeaning;assert(api.validateAssessmentEnvelope(x).issues.some(i=>i.code==='semanticMeaning_required'));});
t('DA6 contract family required',()=>{const x=env();delete x.contractFamily;assert(api.validateAssessmentEnvelope(x).issues.some(i=>i.code==='contractFamily_required'));});
t('DA7 probability forbidden',()=>assert.equal(api.validateAssessmentEnvelope(env({probability:0.9})).status,'invalid'));
t('DA8 scalar score forbidden',()=>assert.equal(api.validateAssessmentEnvelope(env({scalarScore:9})).status,'invalid'));
t('DA9 winner forbidden',()=>assert.equal(api.validateAssessmentEnvelope(env({winner:'A'})).status,'invalid'));
t('DA10 recommendation forbidden',()=>assert.equal(api.validateAssessmentEnvelope(env({overallRecommendation:'A'})).status,'invalid'));
t('DA11 resolved cannot be not assessed',()=>assert.equal(api.validateAssessmentEnvelope(env({assessmentStatus:'not_assessed'})).status,'invalid'));
t('DA12 unresolved cannot claim supportive',()=>assert.equal(api.validateAssessmentEnvelope(env({resolutionStatus:'unresolved'})).status,'invalid'));
t('DA13 not applicable requires not assessed',()=>assert.equal(api.validateAssessmentEnvelope(env({resolutionStatus:'not_applicable'})).status,'invalid'));
t('DA14 evaluator request valid',()=>assert.equal(api.validateEvaluatorRequest(req()).status,'valid'));
t('DA15 evaluator request semantic meaning explicit',()=>{const x=req();delete x.semanticMeaning;assert.equal(api.validateEvaluatorRequest(x).status,'invalid');});
t('DA16 resolved evidence no evaluator abstains',()=>{const r=api.assessWithRegisteredEvaluator(req(),{evidence:[{polarity:'positive'}]});assert.equal(r.resolutionStatus,'unresolved');assert.equal(r.assessmentStatus,'not_assessed');assert.equal(r.reasonRefs[0],'evaluator_not_registered');});
t('DA17 positive polarity is not auto supportive',()=>{const r=api.assessWithRegisteredEvaluator(req(),{evidence:[{polarity:'positive'},{polarity:'positive'}]});assert.equal(r.assessmentStatus,'not_assessed');});
t('DA18 negative polarity is not auto adverse',()=>{const r=api.assessWithRegisteredEvaluator(req(),{evidence:[{polarity:'negative'}]});assert.equal(r.assessmentStatus,'not_assessed');});
t('DA19 litigation-specific polarity is not globally interpreted',()=>{const r=api.assessWithRegisteredEvaluator(req({eventType:'litigation_dispute',duty:'litigation_outcome',semanticMeaning:'formal_proceeding_outcome',contractFamily:'litigation_outcome_assessment',assessmentRef:'litigation_outcome_assessment_v0.1'}),{evidence:[{polarity:'counterparty_weakness'}]});assert.equal(r.assessmentStatus,'not_assessed');assert.equal(r.reasonRefs[0],'evaluator_not_registered');});
t('DA20 evidence count does not change abstention',()=>{const one=api.assessWithRegisteredEvaluator(req({evidenceRefs:['E1']}),{});const many=api.assessWithRegisteredEvaluator(req({evidenceRefs:['E1','E2','E3','E4']}),{});assert.equal(one.assessmentStatus,'not_assessed');assert.equal(many.assessmentStatus,'not_assessed');});
t('DA21 evidence refs preserved without interpretation',()=>{const r=api.assessWithRegisteredEvaluator(req({evidenceRefs:['E1','E2']}),{});assert.deepEqual(r.evidenceRefs,['E1','E2']);});
t('DA22 partial evidence stays partial',()=>{const r=api.assessWithRegisteredEvaluator(req({evidenceResolutionStatus:'partial'}),{});assert.equal(r.resolutionStatus,'partial');assert.equal(r.assessmentStatus,'insufficient_evidence');assert.equal(r.reasonRefs[0],'evidence_partial');});
t('DA23 unresolved evidence stays unresolved',()=>{const r=api.assessWithRegisteredEvaluator(req({evidenceResolutionStatus:'unresolved'}),{});assert.equal(r.resolutionStatus,'unresolved');assert.equal(r.assessmentStatus,'not_assessed');assert.equal(r.reasonRefs[0],'evidence_unresolved');});
t('DA24 not applicable stays not applicable',()=>{const r=api.assessWithRegisteredEvaluator(req({evidenceResolutionStatus:'not_applicable'}),{});assert.equal(r.resolutionStatus,'not_applicable');assert.equal(r.assessmentStatus,'not_assessed');});
t('DA25 invalid request returns auditable abstention',()=>{const x=req();delete x.duty;const r=api.assessWithRegisteredEvaluator(x,{});assert.equal(r.resolutionStatus,'unresolved');assert.equal(r.reasonRefs[0],'invalid_evaluator_request');assert(r.unresolvedIssues.some(i=>i.code==='duty_required'));});
t('DA26 malformed evidence refs rejected',()=>assert.equal(api.validateEvaluatorRequest(req({evidenceRefs:['E1','']})).status,'invalid'));
t('DA27 resolved insufficient evidence is valid',()=>assert.equal(api.validateAssessmentEnvelope(env({assessmentStatus:'insufficient_evidence',reasonRefs:['no_directional_evidence']})).status,'valid'));
if(!process.exitCode)console.log(`Domain assessment envelope regression: ${n} passed, 0 failed`);
