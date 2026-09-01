(function(global){
'use strict';
const GuiJia=global.GuiJia=global.GuiJia||{};
const VERSION='0.1',STATUS='design_only_unreachable';
const issue=(code,extra={})=>({code,...extra});
const selector=(type,value)=>({type,...(value?{value}:{})});
const obs=(source,semanticDuty,sel,required,ruleRef,extra={})=>({source,semanticDuty,selector:sel,required:Boolean(required),ruleRef,...extra});
const REL=Object.freeze({parent:selector('six_relative','父母'),child:selector('six_relative','子孙'),wife:selector('six_relative','妻财'),husband:selector('six_relative','官鬼'),sibling:selector('six_relative','兄弟')});
const DUTIES=Object.freeze(['person_news_arrival','person_news_arrival_timing','person_contact_response','person_contact_response_timing']);
const FORBIDDEN=Object.freeze(['父母','官鬼','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']);
const leaks=(x)=>{const s=JSON.stringify(x||{});return FORBIDDEN.filter(t=>s.includes(t));};
const resolveActor=(intent)=>{
 const relation=intent?.contactActor?.relationToQuerent||intent?.sourcePerson?.relationToQuerent||'unknown';
 if(REL[relation]) return {status:'resolved_candidate',relation,selector:REL[relation],issues:[]};
 if(relation==='friend_or_peer') return {status:'partial',relation,selector:null,issues:[issue('friend_peer_contact_actor_not_automated')]};
 if(relation==='known_nonkin') return {status:'unresolved',relation,selector:null,issues:[issue('known_nonkin_not_default_ying')]};
 return {status:'unresolved',relation,selector:null,issues:[issue('contact_actor_relation_unresolved',{relation})]};
};
const validate=(intent)=>{
 if(!intent||intent.event?.type!=='person_contact') return {status:'insufficient',issues:[issue('event_not_person_contact')]};
 const issues=[];const l=leaks(intent);if(l.length)issues.push(issue('traditional_semantic_leak',{terms:l}));
 const duty=intent?.semantics?.contactDuty||'unknown';if(!DUTIES.includes(duty))issues.push(issue('unsupported_contact_duty',{duty}));
 const specificity=intent?.contactContext?.specificity||'unknown';if(!['specific','context_bounded'].includes(specificity))issues.push(issue('contact_event_not_bounded'));
 return {status:issues.length?'insufficient':'sufficient',duty,issues};
};
const timingTrigger=(kind,subjectDuty)=>({kind,subjectDuty,timeEnginePolicy:'consume_existing_time_facts_only',computeDate:false});
const build=(intent)=>{
 const v=validate(intent);if(v.status!=='sufficient')return{version:VERSION,status:'unresolved',subjects:[],timingTriggers:[],unresolvedReasons:v.issues,ruleRefs:[]};
 const duty=v.duty;const actor=resolveActor(intent);
 if(duty==='person_news_arrival'||duty==='person_news_arrival_timing'){
  const subjects=[obs('primary','news_or_message_artifact',selector('six_relative','父母'),true,'TR-PC-001')];
  if(actor.selector)subjects.push(obs('role','message_source_person',actor.selector,false,'PRR-CONTACT-ACTOR',{anchorStatus:actor.status==='resolved_candidate'?'candidate':'unresolved'}));
  const timing=duty.endsWith('_timing')?[timingTrigger('message_arrival_timing','news_or_message_artifact')]:[];
  return{version:VERSION,status:'resolved_provisional',subjects,timingTriggers:timing,unresolvedReasons:actor.status==='unresolved'?actor.issues:[],ruleRefs:['TR-PC-001',...(actor.selector?['PRR-CONTACT-ACTOR']:[])]};
 }
 if(duty==='person_contact_response'||duty==='person_contact_response_timing'){
  const subjects=[];
  if(actor.selector)subjects.push(obs('primary','contact_actor_action',actor.selector,true,'PRR-CONTACT-ACTOR',{evidenceTier:'provisional_relation_candidate'}));
  subjects.push(obs('domain','communication_artifact_or_channel',selector('six_relative','父母'),false,'RC-PC-002'));
  const timing=duty.endsWith('_timing')?[timingTrigger('contact_actor_action_timing','contact_actor_action')]:[];
  return{version:VERSION,status:'partial_design',subjects,timingTriggers:timing,unresolvedReasons:[...actor.issues,issue('contact_actor_base_rule_not_cross_source_mature')],ruleRefs:[...(actor.selector?['PRR-CONTACT-ACTOR']:[]),'RC-PC-002']};
 }
 return{version:VERSION,status:'unresolved',subjects:[],timingTriggers:[],unresolvedReasons:[issue('unreachable_duty_dispatch')],ruleRefs:[]};
};
GuiJia.liuyaoPersonContactPretraining=Object.freeze({version:VERSION,status:STATUS,currentRuntimeReachable:false,inputPolicy:'structured_modern_facts_only',resolveActor,validateIntentContract:validate,buildDraftObservationPlan:build,findTraditionalSemanticLeaks:leaks});
})(typeof window!=='undefined'?window:globalThis);
