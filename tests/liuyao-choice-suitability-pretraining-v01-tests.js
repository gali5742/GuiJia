'use strict';
const assert = require('assert');
require('../js/liuyao-choice-suitability-pretraining-v01.js');
const m = globalThis.GuiJia.liuyaoChoiceSuitabilityPretrainingV01;
let passed=0;
const test=(n,fn)=>{try{fn();passed++;}catch(e){console.error('FAIL:',n);throw e;}};
const careerChoice=()=>({
  currentTargetAspect:'choice_suitability',
  choiceForm:'compare_alternatives',
  decisionGoal:'compare_suitability',
  alternatives:[
    {id:'stay',label:'留在当前公司',semanticRole:'current_employment',specificity:'context_bounded',domainEventType:'career_position',targetSnapshot:{temporalRole:'current'}},
    {id:'go',label:'去A公司',semanticRole:'prospective_employment',specificity:'specific',domainEventType:'career_position',targetSnapshot:{temporalRole:'prospective'}}
  ],
  decisionDimensions:['target_outcome','stability','livelihood','risk']
});
const resolved=(id,subjects=1)=>({alternativeId:id,status:'resolved',observationPlan:{subjects:Array.from({length:subjects},(_,i)=>({semanticDuty:`d${i}`}))},dimensionEvidence:{target_outcome:[{type:'evidence'}]}});

test('design only unreachable',()=>{assert.equal(m.status,'design_only_unreachable');assert.equal(m.currentRuntimeReachable,false);});
test('requires at least two alternatives',()=>{const c=careerChoice();c.alternatives=c.alternatives.slice(0,1);assert.equal(m.validateChoiceContract(c).status,'insufficient');});
test('requires bounded alternatives',()=>{const c=careerChoice();c.alternatives[1].specificity='generic';assert.equal(m.validateChoiceContract(c).status,'insufficient');});
test('alternative ids must be unique',()=>{const c=careerChoice();c.alternatives[1].id='stay';assert.equal(m.validateChoiceContract(c).status,'insufficient');});
test('semantic alternatives cannot contain traditional selectors',()=>{const c=careerChoice();c.alternatives[0].useGod='世爻';assert.equal(m.validateChoiceContract(c).status,'insufficient');});
test('adapter requests contain no selector',()=>{const r=m.buildAlternativeAdapterRequests(careerChoice());assert.equal(r.status,'adapter_requests_ready');assert.equal(r.requests[0].traditionalSelector,null);});
test('alternatives are not auto-mapped shi ying',()=>{const r=m.buildAlternativeAdapterRequests(careerChoice());assert.deepEqual(m.findTraditionalSemanticLeaks(r.requests),[]);});
test('each alternative requires its theme adapter',()=>{const r=m.buildAlternativeAdapterRequests(careerChoice());assert.ok(r.requests.every(x=>x.adapterRequired));});
test('one alternative may have multi-subject plan',()=>{const c=careerChoice();const f=m.composeAlternativePlans(c,[resolved('stay',3),resolved('go',2)]);assert.equal(f.alternatives[0].observationPlan.subjects.length,3);assert.equal(f.status,'resolved_frame');});
test('partial adapter state is preserved',()=>{const c=careerChoice();const p={alternativeId:'go',status:'partial',observationPlan:{subjects:[]},issues:[{code:'institution_unresolved'}]};const f=m.composeAlternativePlans(c,[resolved('stay'),p]);assert.equal(f.status,'partial_frame');assert.equal(f.alternatives[1].adapterStatus,'partial');});
test('missing adapter does not invent plan',()=>{const c=careerChoice();const f=m.composeAlternativePlans(c,[resolved('stay')]);assert.equal(f.status,'partial_frame');assert.equal(f.alternatives[1].observationPlan,null);});
test('no overall winner without comparison policy',()=>{const c=careerChoice();const f=m.buildComparisonFrame(c,[resolved('stay'),resolved('go')]);assert.equal(f.overallRecommendation,null);assert.equal(f.scalarScore,null);});
test('even explicit preferences do not create hidden score in v01',()=>{const c=careerChoice();c.preferencePolicy={status:'explicit',priorities:['livelihood','stability']};const f=m.buildComparisonFrame(c,[resolved('stay'),resolved('go')]);assert.equal(f.overallRecommendation,null);assert.equal(f.scalarScore,null);assert.equal(f.comparisonPolicyStatus,'preferences_recorded_but_no_scalar_policy');});
test('outcome comparison also requires normalized theme assessment',()=>{const c=careerChoice();c.decisionGoal='compare_outcomes';const f=m.buildComparisonFrame(c,[resolved('stay'),resolved('go')]);assert.equal(f.comparisonPolicyStatus,'outcome_comparison_requires_normalized_theme_assessment');});
test('resignation suitability includes livelihood dimension',()=>{const x=m.buildDeferredThemeExamples().resignation_suitability;assert.ok(x.requiredDimensions.includes('livelihood'));});
test('career transition explicitly forbids shi old ying new',()=>{assert.equal(m.buildDeferredThemeExamples().career_transition_comparison.forbiddenMapping,'shi_old_ying_new');});
test('education choice can remain partial because institution resolver',()=>{assert.equal(m.buildDeferredThemeExamples().education_choice_comparison.institutionResolverMayBePartial,true);});
test('settlement suitability is accept or reject',()=>{assert.equal(m.buildDeferredThemeExamples().settlement_suitability.choiceForm,'accept_or_reject');});
test('litigation strategy is continue or stop',()=>{assert.equal(m.buildDeferredThemeExamples().litigation_strategy.choiceForm,'continue_or_stop');});
test('financial cost alone cannot become winner',()=>{const c=careerChoice();c.decisionDimensions=['financial_cost'];const f=m.buildComparisonFrame(c,[resolved('stay'),resolved('go')]);assert.equal(f.overallRecommendation,null);});
test('favorable target outcome alone cannot become best overall',()=>{const c=careerChoice();const go=resolved('go');go.dimensionEvidence={target_outcome:[{polarity:'positive'}]};const stay=resolved('stay');stay.dimensionEvidence={target_outcome:[{polarity:'negative'}]};const f=m.buildComparisonFrame(c,[stay,go]);assert.equal(f.overallRecommendation,null);});
test('choice contract itself has no traditional leak',()=>assert.deepEqual(m.findTraditionalSemanticLeaks(careerChoice()),[]));
console.log(`Choice suitability shared architecture regression: ${passed} passed, 0 failed`);
