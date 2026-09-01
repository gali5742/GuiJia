(function(global){
'use strict';
const GuiJia=global.GuiJia=global.GuiJia||{};
const VERSION='0.1', STATUS='design_only_unreachable';
const issue=(code,extra={})=>({code,...extra});
const bounded=v=>['specific','context_bounded'].includes(v);
const subject=(source,semanticDuty,selector,required,ruleRef)=>({source,semanticDuty,selector,required:Boolean(required),ruleRef});
const validateIntentContract=(intent)=>{
 const issues=[];
 if(!intent||intent.event?.type!=='career_position') return {status:'not_applicable',issues:[issue('event_not_career_position')]};
 if(intent?.semantics?.careerDuty!=='employment_status_confirmation') return {status:'not_applicable',issues:[issue('duty_not_employment_status_confirmation')]};
 if(!Array.isArray(intent.goals)||!intent.goals.some(g=>g?.type==='outcome')) issues.push(issue('outcome_goal_required'));
 if(intent?.semantics?.currentTargetAspect!=='employment_status_transition') issues.push(issue('status_transition_target_required'));
 const self=(intent?.participants||[]).some(p=>p?.role==='career_subject'&&p?.relationToQuerent==='self');
 const represented=(intent?.participants||[]).some(p=>p?.role==='career_subject'&&p?.relationToQuerent&&p.relationToQuerent!=='self');
 if(represented) issues.push(issue('represented_career_subject_unsupported'));
 if(!self) issues.push(issue('self_career_subject_missing'));
 const career=intent?.careerTarget||{};
 if(career.temporalRole!=='current') issues.push(issue('current_employment_target_required'));
 if(!bounded(career.specificity)) issues.push(issue('career_target_unbounded'));
 const transition=intent?.statusTransitionContext||{};
 if(transition.type!=='provisional_to_confirmed') issues.push(issue('unsupported_status_transition',{value:transition.type||'unknown'}));
 if(!bounded(transition.specificity)) issues.push(issue('status_transition_context_unbounded'));
 return {status:issues.length?'insufficient':'sufficient',issues};
};
const buildDraftObservationPlan=(intent)=>{
 const v=validateIntentContract(intent); if(v.status!=='sufficient') return {version:VERSION,status:'unresolved',designOnly:true,currentRuntimeReachable:false,ruleRef:null,subjects:[],issues:v.issues};
 const ruleRef='TR-CP-003-A';
 const subjects=[
  subject('primary','current_employment_status',{type:'six_relative',value:'官鬼'},true,ruleRef),
  subject('role','incumbent_self',{type:'shi'},true,ruleRef)
 ];
 if(['explicit','context_supported'].includes(intent?.semantics?.formalizationContext)) subjects.push(subject('domain','formal_confirmation_process',{type:'six_relative',value:'父母'},false,'AR-CP-005-STATUS-FORMALIZATION'));
 return {version:VERSION,status:'resolved_design',designOnly:true,currentRuntimeReachable:false,traditionalMappingStatus:'provisional_modern_mapping',ruleRef,subjects,issues:[]};
};
const buildStatusEvidence=(intent,facts={})=>{
 const v=validateIntentContract(intent), evidence=[];
 if(v.status!=='sufficient') return {evidence,finalAssessment:null,scoring:null};
 if(facts.employmentSupport==='supported') evidence.push({type:'current_employment_state',polarity:'positive'});
 if(facts.employmentSupport==='weak') evidence.push({type:'current_employment_state',polarity:'negative'});
 if(facts.selfSupport==='supported') evidence.push({type:'self_capacity_state',polarity:'positive'});
 if(facts.selfSupport==='weak') evidence.push({type:'self_capacity_state',polarity:'negative'});
 if(facts.statusTransitionSupport==='supported') evidence.push({type:'status_transition_support',polarity:'positive'});
 if(facts.statusTransitionSupport==='weak') evidence.push({type:'status_transition_support',polarity:'negative'});
 if(facts.formalizationSupport==='supported') evidence.push({type:'formal_confirmation_process_state',polarity:'positive'});
 if(facts.formalizationSupport==='weak') evidence.push({type:'formal_confirmation_process_state',polarity:'negative'});
 return {evidence,finalAssessment:null,scoring:null};
};
const findTraditionalSemanticLeaks=intent=>{const s=JSON.stringify(intent||{});return ['官鬼','父母','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod'].filter(t=>s.includes(t));};
GuiJia.liuyaoCareerEmploymentStatusConfirmationPretrainingV01=Object.freeze({version:VERSION,status:STATUS,currentRuntimeReachable:false,traditionalMappingStatus:'provisional_modern_mapping',validateIntentContract,buildDraftObservationPlan,buildStatusEvidence,findTraditionalSemanticLeaks});
})(typeof window!=='undefined'?window:globalThis);
