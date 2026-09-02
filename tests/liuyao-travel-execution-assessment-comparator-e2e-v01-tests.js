'use strict';
const assert=require('assert');
require('../js/liuyao-travel-pretraining-v01.js');
require('../js/liuyao-travel-execution-evidence-binding-pretraining-v01.js');
require('../js/liuyao-domain-assessment-pretraining-v01.js');
require('../js/liuyao-domain-comparator-pretraining-v01.js');
require('../js/liuyao-travel-execution-assessment-pretraining-v01.js');
require('../js/liuyao-travel-execution-comparator-pretraining-v01.js');
const travel=global.GuiJia.liuyaoTravelPretrainingV01;
const binding=global.GuiJia.liuyaoTravelExecutionEvidenceBindingPretrainingV01;
const sharedAssessment=global.GuiJia.liuyaoDomainAssessmentPretrainingV01;
const sharedComparator=global.GuiJia.liuyaoDomainComparatorPretrainingV01;
const assessment=global.GuiJia.liuyaoTravelExecutionAssessmentPretrainingV01;
const comparator=global.GuiJia.liuyaoTravelExecutionComparatorPretrainingV01;
let n=0;
const t=(name,fn)=>{try{fn();n++}catch(e){console.error('FAIL',name,e);process.exitCode=1}};
const intent=(overrides={})=>({
  event:{type:'travel'},
  goals:[{type:'outcome'}],
  semantics:{travelDuty:'travel_execution',currentTargetAspect:'traveler_journey'},
  travelerSubject:{relationToQuerent:'self'},
  journeyTarget:{specificity:'specific'},
  destinationContext:{specificity:'specific',relevance:'explicit'},
  transportContext:{specificity:'specific_service',relevance:'explicit'},
  ...overrides
});
const chain=(alternativeId,facts,options={})=>{
  const i=intent(options.intentOverrides||{});
  const plan=travel.buildDraftObservationPlan(i);
  const raw=travel.buildTravelEvidence(i,facts);
  const bound=binding.bindTravelExecutionEvidence(raw,alternativeId,options.bindingOptions||{});
  const assessed=bound.packet ? assessment.evaluateTravelExecution(bound.packet) : null;
  return {intent:i,plan,raw,bound,assessed};
};
t('E2E1 all components remain unreachable or unregistered',()=>{assert.equal(travel.currentRuntimeReachable,false);assert.equal(binding.currentRuntimeReachable,false);assert.equal(assessment.currentRuntimeReachable,false);assert.equal(assessment.registered,false);assert.equal(comparator.currentRuntimeReachable,false);assert.equal(comparator.registered,false);});
t('E2E2 shared registries remain empty',()=>{assert.equal(sharedAssessment.ACTIVE_EVALUATORS.length,0);assert.equal(sharedComparator.ACTIVE_COMPARATORS.length,0);});
t('E2E3 travel intent resolves observation plan',()=>{const c=chain('A',{travelerVitality:'supported'});assert.equal(c.plan.status,'resolved');assert(c.plan.subjects.some(s=>s.source==='primary'&&s.semanticDuty==='traveler'));});
t('E2E4 raw travel evidence has no fake ids before binding',()=>{const c=chain('A',{travelerVitality:'supported'});assert.equal(Object.prototype.hasOwnProperty.call(c.raw.evidence[0],'id'),false);assert.equal(c.bound.packet.evidence[0].id.startsWith('DESIGN-ONLY-TV-EXEC:'),true);});
t('E2E5 supportive raw facts become supportive only through reviewed evaluator',()=>{const c=chain('A',{travelerVitality:'supported'});assert.equal(c.raw.evidence[0].polarity,'positive');assert.equal(c.assessed.assessmentStatus,'supportive_evidence');assert.equal(c.assessed.alternativeId,'A');});
t('E2E6 adverse raw facts become adverse through reviewed evaluator',()=>{const c=chain('B',{travelerVoid:true,routeObstruction:true});assert.equal(c.assessed.assessmentStatus,'adverse_evidence');});
t('E2E7 supportive alternative beats adverse only on travel execution dimension',()=>{const a=chain('A',{travelerVitality:'supported'});const b=chain('B',{travelerVoid:true});const r=comparator.compareTravelExecution(a.assessed,b.assessed);assert.equal(r.dimensionId,'target_outcome');assert.equal(r.semanticMeaning,'journey_execution_outcome');assert.equal(r.relation,'left_preferred_on_dimension');});
t('E2E8 mixed alternative is not strictly ordered against supportive',()=>{const a=chain('A',{travelerVitality:'supported',travelerVoid:true});const b=chain('B',{travelerVitality:'supported'});const r=comparator.compareTravelExecution(a.assessed,b.assessed);assert.equal(a.assessed.assessmentStatus,'mixed_evidence');assert.equal(r.relation,'mixed_no_order');});
t('E2E9 safety evidence present in travel builder is ignored by execution evaluator',()=>{const c=chain('A',{safetySupport:true});assert(c.raw.evidence.some(e=>e.type==='safety_support'));assert.equal(c.assessed.assessmentStatus,'insufficient_evidence');assert.equal(c.assessed.evidenceRefs.length,0);});
t('E2E10 insufficient execution evidence blocks comparison',()=>{const a=chain('A',{safetySupport:true});const b=chain('B',{travelerVitality:'supported'});const r=comparator.compareTravelExecution(a.assessed,b.assessed);assert.equal(r.comparisonStatus,'incomparable');});
t('E2E11 explicit provenance refs can replace synthetic design refs',()=>{const c=chain('A',{travelerVitality:'supported'},{bindingOptions:{evidenceRefs:['TV-EV-A-001']}});assert.equal(c.bound.packet.bindingMeta.referenceMode,'explicit');assert.equal(c.assessed.evidenceRefs[0],'TV-EV-A-001');});
t('E2E12 partial evidence stays partial through assessment and comparator',()=>{const a=chain('A',{travelerVitality:'supported'},{bindingOptions:{resolutionStatus:'partial'}});const b=chain('B',{travelerVitality:'supported'});assert.equal(a.assessed.resolutionStatus,'partial');assert.equal(comparator.compareTravelExecution(a.assessed,b.assessed).comparisonStatus,'partial');});
t('E2E13 no stage emits winner scalar score probability or recommendation',()=>{const a=chain('A',{travelerVitality:'supported'});const b=chain('B',{travelerVoid:true});const r=comparator.compareTravelExecution(a.assessed,b.assessed);for(const obj of [a.raw,a.bound.packet,a.assessed,r])for(const k of ['winner','scalarScore','probability','overallRecommendation'])assert.equal(Object.prototype.hasOwnProperty.call(obj,k),false);});
t('E2E14 synthetic evidence refs remain explicitly non-formal',()=>{const c=chain('A',{travelerVitality:'supported'});assert.equal(c.bound.packet.bindingMeta.formalEligible,false);assert.equal(c.bound.packet.bindingMeta.syntheticRefsForbiddenForFormalExpansion,true);});
if(!process.exitCode)console.log(`Travel execution assessment/comparator E2E: ${n} passed, 0 failed`);
