'use strict';
const assert=require('assert');
require('../js/liuyao-travel-pretraining-v01.js');
require('../js/liuyao-travel-evidence-binding-pretraining-v01.js');
require('../js/liuyao-domain-assessment-pretraining-v01.js');
require('../js/liuyao-domain-comparator-pretraining-v01.js');
require('../js/liuyao-travel-execution-assessment-pretraining-v01.js');
require('../js/liuyao-travel-execution-comparator-pretraining-v01.js');
require('../js/liuyao-travel-safety-assessment-pretraining-v01.js');
require('../js/liuyao-travel-safety-comparator-pretraining-v01.js');
const travel=global.GuiJia.liuyaoTravelPretrainingV01;
const binding=global.GuiJia.liuyaoTravelEvidenceBindingPretrainingV01;
const execution=global.GuiJia.liuyaoTravelExecutionAssessmentPretrainingV01;
const executionComparator=global.GuiJia.liuyaoTravelExecutionComparatorPretrainingV01;
const safety=global.GuiJia.liuyaoTravelSafetyAssessmentPretrainingV01;
const safetyComparator=global.GuiJia.liuyaoTravelSafetyComparatorPretrainingV01;
const sharedAssessment=global.GuiJia.liuyaoDomainAssessmentPretrainingV01;
const sharedComparator=global.GuiJia.liuyaoDomainComparatorPretrainingV01;
let n=0;
const t=(name,fn)=>{try{fn();n++}catch(e){console.error('FAIL',name,e);process.exitCode=1}};
const intent=(duty)=>({
  event:{type:'travel'},
  goals:[{type:'outcome'}],
  semantics:{travelDuty:duty,currentTargetAspect:duty==='travel_safety'?'traveler_safety':'traveler_journey'},
  travelerSubject:{relationToQuerent:'self'},
  journeyTarget:{specificity:'specific'},
  destinationContext:{specificity:'specific',relevance:'explicit'},
  transportContext:{specificity:'specific_service',relevance:'explicit'}
});
const chain=(duty,alternativeId,facts)=>{
  const i=intent(duty);
  const plan=travel.buildDraftObservationPlan(i);
  const raw=travel.buildTravelEvidence(i,facts);
  const bound=binding.bindTravelEvidence(raw,alternativeId,{expectedDuty:duty});
  const assessed=duty==='travel_safety'
    ? safety.evaluateTravelSafety(bound.packet)
    : execution.evaluateTravelExecution(bound.packet);
  return {intent:i,plan,raw,bound,assessed};
};
t('TDS1 shared registries remain empty',()=>{assert.equal(sharedAssessment.ACTIVE_EVALUATORS.length,0);assert.equal(sharedComparator.ACTIVE_COMPARATORS.length,0);});
t('TDS2 execution and safety plans share traveler but not duty',()=>{const e=chain('travel_execution','A',{travelerVitality:'supported'});const s=chain('travel_safety','A',{travelerVitality:'supported'});assert.equal(e.plan.subjects[0].semanticDuty,'traveler');assert.equal(s.plan.subjects[0].semanticDuty,'traveler_safety_subject');});
t('TDS3 same traveler vitality can support both distinct contracts',()=>{const e=chain('travel_execution','A',{travelerVitality:'supported'});const s=chain('travel_safety','A',{travelerVitality:'supported'});assert.equal(e.assessed.assessmentStatus,'supportive_evidence');assert.equal(s.assessed.assessmentStatus,'supportive_evidence');assert.notEqual(e.assessed.contractFamily,s.assessed.contractFamily);assert.notEqual(e.assessed.dimensionId,s.assessed.dimensionId);});
t('TDS4 transport disruption is execution adverse but safety insufficient',()=>{const e=chain('travel_execution','A',{transportDisrupted:true});const s=chain('travel_safety','A',{transportDisrupted:true});assert.equal(e.assessed.assessmentStatus,'adverse_evidence');assert.equal(s.assessed.assessmentStatus,'insufficient_evidence');});
t('TDS5 traveler void is execution adverse but safety insufficient',()=>{const e=chain('travel_execution','A',{travelerVoid:true});const s=chain('travel_safety','A',{travelerVoid:true});assert.equal(e.assessed.assessmentStatus,'adverse_evidence');assert.equal(s.assessed.assessmentStatus,'insufficient_evidence');});
t('TDS6 safety support is safety supportive but execution insufficient',()=>{const e=chain('travel_execution','A',{safetySupport:true});const s=chain('travel_safety','A',{safetySupport:true});assert.equal(e.assessed.assessmentStatus,'insufficient_evidence');assert.equal(s.assessed.assessmentStatus,'supportive_evidence');});
t('TDS7 hazard pressure is safety adverse but execution insufficient',()=>{const e=chain('travel_execution','A',{hazardPressure:true});const s=chain('travel_safety','A',{hazardPressure:true});assert.equal(e.assessed.assessmentStatus,'insufficient_evidence');assert.equal(s.assessed.assessmentStatus,'adverse_evidence');});
t('TDS8 route obstruction is admitted by both but under different semantics',()=>{const e=chain('travel_execution','A',{routeObstruction:true});const s=chain('travel_safety','A',{routeObstruction:true});assert.equal(e.assessed.assessmentStatus,'adverse_evidence');assert.equal(s.assessed.assessmentStatus,'adverse_evidence');assert.notEqual(e.assessed.semanticMeaning,s.assessed.semanticMeaning);});
t('TDS9 safety comparator runs end to end on safety family only',()=>{const a=chain('travel_safety','A',{safetySupport:true});const b=chain('travel_safety','B',{hazardPressure:true});assert.equal(safetyComparator.compareTravelSafety(a.assessed,b.assessed).relation,'left_preferred_on_dimension');});
t('TDS10 execution comparator runs end to end on execution family only',()=>{const a=chain('travel_execution','A',{travelerVitality:'supported'});const b=chain('travel_execution','B',{transportDisrupted:true});assert.equal(executionComparator.compareTravelExecution(a.assessed,b.assessed).relation,'left_preferred_on_dimension');});
t('TDS11 execution assessment cannot be compared by safety comparator',()=>{const e=chain('travel_execution','A',{travelerVitality:'supported'});const s=chain('travel_safety','B',{hazardPressure:true});assert.equal(safetyComparator.compareTravelSafety(e.assessed,s.assessed).comparisonStatus,'incomparable');});
t('TDS12 safety assessment cannot be compared by execution comparator',()=>{const s=chain('travel_safety','A',{safetySupport:true});const e=chain('travel_execution','B',{transportDisrupted:true});assert.equal(executionComparator.compareTravelExecution(s.assessed,e.assessed).comparisonStatus,'incomparable');});
t('TDS13 generic binding preserves original duty',()=>{const s=chain('travel_safety','A',{safetySupport:true});assert.equal(s.bound.packet.duty,'travel_safety');const e=chain('travel_execution','A',{travelerVitality:'supported'});assert.equal(e.bound.packet.duty,'travel_execution');});
t('TDS14 synthetic refs stay non-formal across duties',()=>{for(const duty of ['travel_execution','travel_safety']){const c=chain(duty,'A',{});assert.equal(c.bound.packet.bindingMeta.formalEligible,false);assert.equal(c.bound.packet.bindingMeta.syntheticRefsForbiddenForFormalExpansion,true);}});
t('TDS15 no cross-duty stage emits overall recommendation',()=>{const e=chain('travel_execution','A',{travelerVitality:'supported'});const s=chain('travel_safety','B',{hazardPressure:true});for(const obj of [e.raw,e.assessed,s.raw,s.assessed])for(const k of ['winner','scalarScore','probability','overallRecommendation'])assert.equal(Object.prototype.hasOwnProperty.call(obj,k),false);});
t('TDS16 same alternative id does not merge assessment semantics',()=>{const e=chain('travel_execution','trip-A',{travelerVitality:'supported'});const s=chain('travel_safety','trip-A',{travelerVitality:'supported'});assert.equal(e.assessed.alternativeId,'trip-A');assert.equal(s.assessed.alternativeId,'trip-A');assert.notEqual(e.assessed.assessmentRef,s.assessed.assessmentRef);});
if(!process.exitCode)console.log(`Travel duty separation E2E: ${n} passed, 0 failed`);
