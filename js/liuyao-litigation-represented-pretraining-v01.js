(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION='0.1';
  const STATUS='design_only_unreachable';
  const issue=(code,extra={})=>({code,...extra});
  const selector=(type,value)=>({type,...(value?{value}:{})});
  const obs=(source,semanticDuty,sel,required,ruleRef,extra={})=>({source,semanticDuty,selector:sel,required:Boolean(required),ruleRef,...extra});
  const RELATION_SELECTOR=Object.freeze({
    self:selector('shi'), parent:selector('six_relative','父母'), child:selector('six_relative','子孙'),
    wife:selector('six_relative','妻财'), husband:selector('six_relative','官鬼'), sibling:selector('six_relative','兄弟')
  });
  const SUPPORTED_DUTIES=Object.freeze(['litigation_outcome','dispute_resolution_outcome','dispute_counterparty_action','proceeding_acceptance']);
  const FORBIDDEN=Object.freeze(['父母','官鬼','妻财','兄弟','子孙','世爻','应爻','用神','sixRelative','useGod']);
  const leaks=(intent)=>{const s=JSON.stringify(intent||{});return FORBIDDEN.filter(t=>s.includes(t));};

  const resolveParticipant=(intent)=>{
    const relation=intent?.disputeSubject?.relationToQuerent||'unknown';
    const mode=intent?.disputeSubject?.representationMode||'unknown';
    if(relation==='self'&&mode==='self') return {status:'resolved_self',relation,mode,selector:selector('shi'),counterpartySelector:selector('ying'),issues:[]};
    if(RELATION_SELECTOR[relation]&&relation!=='self') return {
      status:'partial_represented',relation,mode,selector:RELATION_SELECTOR[relation],counterpartySelector:null,
      issues:[issue('represented_counterparty_selector_unresolved'),...(mode==='unknown'?[issue('proxy_control_mode_unknown')]:[])]
    };
    if(relation==='friend_or_peer') return {status:'unresolved',relation,mode,selector:null,counterpartySelector:null,issues:[issue('friend_peer_relation_provisional_not_auto')]};
    return {status:'unresolved',relation,mode,selector:null,counterpartySelector:null,issues:[issue('represented_relation_unresolved',{relation})]};
  };

  const validate=(intent)=>{
    if(!intent||intent.event?.type!=='litigation_dispute') return {status:'insufficient',issues:[issue('event_not_litigation_dispute')]};
    const issues=[]; const found=leaks(intent); if(found.length) issues.push(issue('traditional_semantic_leak',{terms:found}));
    const duty=intent?.semantics?.disputeDuty||'unknown'; if(!SUPPORTED_DUTIES.includes(duty)) issues.push(issue('unsupported_dispute_duty',{duty}));
    const participant=resolveParticipant(intent); if(participant.status==='unresolved') issues.push(...participant.issues);
    return {status:issues.length?'insufficient':'sufficient',duty,participant,issues};
  };

  const build=(intent)=>{
    const v=validate(intent); if(v.status!=='sufficient') return {version:VERSION,status:'unresolved',subjects:[],unresolvedReasons:v.issues,ruleRefs:[]};
    const p=v.participant,duty=v.duty;
    if(p.status==='resolved_self') return {version:VERSION,status:'delegate_existing_self_rule',subjects:[],unresolvedReasons:[],ruleRefs:[]};
    if(duty==='litigation_outcome'){
      const subjects=[obs('primary','formal_proceeding_or_adjudication',selector('six_relative','官鬼'),true,'TR-LD-001-A'),obs('role','represented_litigant',p.selector,true,'PRR-DISPUTE-PARTICIPANT')];
      return {version:VERSION,status:'partial_design',subjects,unresolvedReasons:[...p.issues,issue('bilateral_self_counterparty_structure_unresolved'),issue('virtual_shi_ying_remap_forbidden')],ruleRefs:['TR-LD-001-A','PRR-DISPUTE-PARTICIPANT']};
    }
    if(duty==='dispute_resolution_outcome'){
      const subjects=[obs('primary','active_dispute_or_proceeding',selector('six_relative','官鬼'),true,'TR-LD-001-B'),obs('role','represented_litigant',p.selector,true,'PRR-DISPUTE-PARTICIPANT'),obs('domain','settlement_or_dissipation_support',selector('six_relative','子孙'),false,'TR-LD-001-B')];
      return {version:VERSION,status:'partial_design',subjects,unresolvedReasons:[...p.issues,issue('represented_counterparty_required_for_bilateral_resolution'),issue('virtual_shi_ying_remap_forbidden')],ruleRefs:['TR-LD-001-B','PRR-DISPUTE-PARTICIPANT']};
    }
    if(duty==='dispute_counterparty_action'){
      return {version:VERSION,status:'unresolved',subjects:[obs('role','represented_litigant',p.selector,true,'PRR-DISPUTE-PARTICIPANT')],unresolvedReasons:[...p.issues,issue('counterparty_action_primary_unresolved_relative_to_represented_party'),issue('virtual_ying_remap_forbidden')],ruleRefs:['PRR-DISPUTE-PARTICIPANT']};
    }
    if(duty==='proceeding_acceptance'){
      const subjects=[obs('primary','institutional_proceeding_acceptance',selector('six_relative','官鬼'),true,'TR-LD-002-A'),obs('domain','filing_document',selector('six_relative','父母'),true,'TR-LD-002-A'),obs('role','represented_case_subject',p.selector,true,'PRR-DISPUTE-PARTICIPANT')];
      const filingActor=intent?.disputeParticipants?.filingActorRelation||'unknown';
      return {version:VERSION,status:'partial_design',subjects,unresolvedReasons:[...p.issues,...(filingActor==='unknown'?[issue('filing_actor_unresolved')]:[])],ruleRefs:['TR-LD-002-A','PRR-DISPUTE-PARTICIPANT']};
    }
    return {version:VERSION,status:'unresolved',subjects:[],unresolvedReasons:[issue('unreachable_duty_dispatch')],ruleRefs:[]};
  };

  GuiJia.liuyaoLitigationRepresentedPretraining=Object.freeze({version:VERSION,status:STATUS,currentRuntimeReachable:false,inputPolicy:'structured_modern_facts_only',resolveParticipant,validateIntentContract:validate,buildDraftObservationPlan:build,findTraditionalSemanticLeaks:leaks});
})(typeof window!=='undefined'?window:globalThis);
