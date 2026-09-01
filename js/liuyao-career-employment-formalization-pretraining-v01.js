(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1';
  const STATUS = 'design_only_unreachable';
  const TYPES = Object.freeze(new Set(['written_offer','employment_contract','appointment_document','onboarding_authorization','other_formalization']));
  const issue = (code, extra={}) => ({code,...extra});
  const bounded = (v) => ['specific','context_bounded'].includes(v);
  const subject = (source, semanticDuty, selector, required, ruleRef) => ({source,semanticDuty,selector,required:Boolean(required),ruleRef});
  const validateIntentContract = (intent) => {
    const issues=[];
    if (!intent || intent.event?.type !== 'career_position') return {status:'not_applicable',issues:[issue('event_not_career_position')]};
    if (intent?.semantics?.careerDuty !== 'employment_formalization_outcome') return {status:'not_applicable',issues:[issue('duty_not_employment_formalization_outcome')]};
    if (!Array.isArray(intent.goals) || !intent.goals.some(g=>g?.type==='outcome')) issues.push(issue('outcome_goal_required'));
    if (intent?.semantics?.currentTargetAspect !== 'formalization_document') issues.push(issue('formalization_document_target_required'));
    if (intent?.semantics?.formalizationContext !== 'explicit') issues.push(issue('explicit_formalization_context_required'));
    const self = (intent?.participants||[]).some(p=>p?.role==='career_subject'&&p?.relationToQuerent==='self');
    const represented = (intent?.participants||[]).some(p=>p?.role==='career_subject'&&p?.relationToQuerent&&p.relationToQuerent!=='self');
    if (represented) issues.push(issue('represented_career_subject_unsupported'));
    if (!self) issues.push(issue('self_career_subject_missing'));
    const target=intent?.formalizationTarget||{};
    if (!TYPES.has(target.type)) issues.push(issue('formalization_target_type_unresolved',{value:target.type||'unknown'}));
    if (!bounded(target.specificity)) issues.push(issue('formalization_target_unbounded',{value:target.specificity||'unknown'}));
    const careerBounded=bounded(intent?.careerTarget?.specificity);
    const employerBounded=bounded(intent?.employerContext?.specificity);
    if (!careerBounded && !employerBounded) issues.push(issue('bounded_employment_context_required'));
    if (intent?.semantics?.currentTargetAspect === 'compensation') issues.push(issue('cross_route_compensation_target'));
    if (intent?.semantics?.currentTargetAspect === 'delivery_item') issues.push(issue('cross_route_receive_item_target'));
    return {status:issues.length?'insufficient':'sufficient',issues};
  };
  const buildDraftObservationPlan = (intent) => {
    const validation=validateIntentContract(intent);
    if (validation.status!=='sufficient') return {version:VERSION,status:'unresolved',designOnly:true,currentRuntimeReachable:false,ruleRef:null,subjects:[],issues:validation.issues};
    const ruleRef='TR-CP-002-A';
    const subjects=[
      subject('primary','formal_employment_authorization_or_document',{type:'six_relative',value:'父母'},true,ruleRef),
      subject('domain','employment_or_position_being_formalized',{type:'six_relative',value:'官鬼'},true,ruleRef),
      subject('role','career_subject_self',{type:'shi'},true,ruleRef)
    ];
    if (bounded(intent?.employerContext?.specificity)) subjects.push(subject('domain','employer_organization',{type:'six_relative',value:'父母'},false,'AR-CP-001-EMPLOYER'));
    return {version:VERSION,status:'resolved_design',designOnly:true,currentRuntimeReachable:false,ruleRef,coRequiredPair:true,subjects,issues:[]};
  };
  const buildFormalizationEvidence = (intent,facts={}) => {
    const validation=validateIntentContract(intent); const evidence=[];
    if (validation.status!=='sufficient') return {evidence,pairState:'unavailable',finalAssessment:null,scoring:null};
    if (facts.documentSupport==='supported') evidence.push({type:'formalization_document_state',polarity:'positive'});
    if (facts.documentSupport==='weak') evidence.push({type:'formalization_document_state',polarity:'negative'});
    if (facts.positionSupport==='supported') evidence.push({type:'employment_position_state',polarity:'positive'});
    if (facts.positionSupport==='weak') evidence.push({type:'employment_position_state',polarity:'negative'});
    if (facts.documentToSelf==='supportive') evidence.push({type:'formalization_to_self_relation',polarity:'positive'});
    if (facts.documentToSelf==='obstructive') evidence.push({type:'formalization_to_self_relation',polarity:'negative'});
    const d=facts.documentSupport||'unknown', p=facts.positionSupport||'unknown';
    let pairState='mixed_or_unknown';
    if (d==='supported'&&p==='supported') pairState='both_supported';
    if (d==='supported'&&p==='weak') pairState='document_supported_position_weak';
    if (d==='weak'&&p==='supported') pairState='position_supported_document_weak';
    if (d==='weak'&&p==='weak') pairState='both_weak';
    evidence.push({type:'co_required_pair_state',value:pairState});
    return {evidence,pairState,finalAssessment:null,scoring:null};
  };
  const findTraditionalSemanticLeaks=(intent)=>{const s=JSON.stringify(intent||{});return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod'].filter(t=>s.includes(t));};
  GuiJia.liuyaoCareerEmploymentFormalizationPretrainingV01=Object.freeze({version:VERSION,status:STATUS,currentRuntimeReachable:false,validateIntentContract,buildDraftObservationPlan,buildFormalizationEvidence,findTraditionalSemanticLeaks});
})(typeof window!=='undefined'?window:globalThis);
