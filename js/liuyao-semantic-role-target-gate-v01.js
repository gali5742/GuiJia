(function (global) {
  'use strict';
  const G=global.GuiJia=global.GuiJia||{},base=G.liuyaoSemanticFallbackIdentityModelV02;
  if(!base)throw new Error('Frozen all22 inventory required');
  const intents=['new_credit','existing_debt','business_operation','investment_return','unspecified'];
  const sources=['user_confirmed','manual_annotation','unverified'];
  const roles=['self_receives','self_provides','self_creditor','self_debtor','unknown'];
  const mappings={borrow_money:['new_credit','self_receives'],lend_money:['new_credit','self_provides'],debt_collection:['existing_debt','self_creditor'],debt_repayment:['existing_debt','self_debtor'],business_operation:['business_operation','unknown'],investment_profit:['investment_return','unknown']};
  const labels={borrow_money:'我向别人借钱，能否借到？',lend_money:'我把钱借给别人，是否合适？',debt_collection:'别人欠我钱，能否收回？',debt_repayment:'我欠别人钱，能否还清？',business_operation:'自己的生意经营会怎样？',investment_profit:'投入的资本有没有收益？'};
  const ensure=(ok,msg)=>{if(!ok)throw new Error(msg);},copy=x=>JSON.parse(JSON.stringify(x));
  const unknown=value=>({value,source:'unverified',evidence:[]});
  function makePacket(questionId,questionText){return {questionId,questionText,revision:0,goalInventorySource:'unverified',goals:[],primaryGoalId:null,answers:[]};}
  function validate(packet) {
    ensure(packet&&typeof packet.questionId==='string'&&packet.questionId.length&&typeof packet.questionText==='string'&&packet.questionText.trim().length,'Question identity/text required');
    ensure(Number.isInteger(packet.revision)&&packet.revision>=0&&sources.includes(packet.goalInventorySource)&&Array.isArray(packet.goals)&&Array.isArray(packet.answers),'Packet schema required');
    ensure(new Set(packet.goals.map(g=>g.id)).size===packet.goals.length,'Unique goal IDs required');
    ensure(packet.primaryGoalId===null||packet.goals.some(g=>g.id===packet.primaryGoalId),'Primary goal must exist');
    for(const g of packet.goals){ensure(typeof g.id==='string'&&g.id.length&&!['unsure','outside_scope','other_subject'].includes(g.id)&&typeof g.label==='string'&&g.label.trim().length,'Goal identity/label required');for(const [f,allowed]of [[g.intent,intents],[g.role,roles]])ensure(f&&allowed.includes(f.value)&&sources.includes(f.source)&&Array.isArray(f.evidence),'Typed intent/role fact required');}
  }
  function supported(packet,fact) {
    if(!fact||fact.source==='unverified')return false;
    const spans=fact.evidence.length>0&&fact.evidence.every(s=>Number.isInteger(s.start)&&Number.isInteger(s.end)&&s.start>=0&&s.start<s.end&&s.end<=packet.questionText.length);
    const answer=fact.source==='user_confirmed'&&packet.answers.some(a=>a.id===fact.confirmationId&&a.source==='user_confirmed'&&Array.isArray(a.confirmedValues)&&a.confirmedValues.includes(fact.value));
    return spans||answer;
  }
  const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
  function denied(reason,extra={}) {return freeze({status:'abstain',reason,confirmedRoute:null,selectedRoute:null,permissions:{roleAndTargetConfirmed:false,mayRunArbitration:false,mayRunFallback:false,maySelectRoute:false},...extra});}
  function ask(packet,kind,goal=null) {
    const binding=JSON.stringify(packet),id=`${packet.questionId}:${packet.revision}:${kind}:${goal?.id||'scope'}`;
    if(packet.answers.some(a=>a.kind===kind&&a.goalId===(goal?.id||null)&&a.optionId==='unsure'))return denied('clarification_remains_unspecified');
    let text,options;
    if(kind==='primary_question'){text='这次你主要想问哪一件事？';options=[...Object.entries(labels).map(([id,text])=>({id,text})),{id:'outside_scope',text:'这次问的是其他事情'}];}
    if(kind==='primary_goal'){text='你提到了不止一件事，这次先看哪一件？';options=packet.goals.map(g=>({id:g.id,text:g.label}));}
    if(kind==='credit_direction'){text='这笔新借款的方向是怎样的？';options=[{id:'self_receives',text:'我向别人借钱'},{id:'self_provides',text:'我把钱借给别人'}];}
    if(kind==='debt_role'){text='这笔已有的欠款是谁欠谁？';options=[{id:'self_creditor',text:'别人欠我，我要收回'},{id:'self_debtor',text:'我欠别人，我要归还'}];}
    if(['credit_direction','debt_role'].includes(kind))options.push({id:'other_subject',text:'涉及的是别人的钱，不能按我来确认'});
    options.push({id:'unsure',text:'暂时还不能确定'});
    return freeze({status:'clarify',reason:kind,confirmedRoute:null,selectedRoute:null,permissions:{roleAndTargetConfirmed:false,mayRunArbitration:false,mayRunFallback:false,maySelectRoute:false},clarification:{id,kind,goalId:goal?.id||null,text,options,binding}});
  }
  function assess(packet) {
    validate(packet);
    if(packet.answers.some(a=>a.optionId==='other_subject'||(a.kind==='primary_question'&&a.optionId==='outside_scope')))return denied('outside_prototype_scope');
    if(packet.goalInventorySource==='unverified'||!packet.goals.length)return ask(packet,'primary_question');
    if(packet.goals.length>1&&packet.primaryGoalId===null)return ask(packet,'primary_goal');
    const goal=packet.goals.find(g=>g.id===packet.primaryGoalId)||packet.goals[0];
    if(!supported(packet,goal.intent)||goal.intent.value==='unspecified')return ask(packet,'primary_question');
    let route;
    if(goal.intent.value==='new_credit'){if(!supported(packet,goal.role)||!['self_receives','self_provides'].includes(goal.role.value))return ask(packet,'credit_direction',goal);route=goal.role.value==='self_receives'?'borrow_money':'lend_money';}
    if(goal.intent.value==='existing_debt'){if(!supported(packet,goal.role)||!['self_creditor','self_debtor'].includes(goal.role.value))return ask(packet,'debt_role',goal);route=goal.role.value==='self_creditor'?'debt_collection':'debt_repayment';}
    if(goal.intent.value==='business_operation')route='business_operation';
    if(goal.intent.value==='investment_return')route='investment_profit';
    return freeze({status:'ready',reason:'confirmed_single_target_and_required_role',primaryGoalId:goal.id,confirmedRoute:route,selectedRoute:null,permissions:{roleAndTargetConfirmed:true,mayRunArbitration:false,mayRunFallback:false,maySelectRoute:false}});
  }
  function applyAnswer(packet,clarification,optionId) {
    const assessment=assess(packet);ensure(assessment.status==='clarify'&&clarification&&clarification.id===assessment.clarification.id&&clarification.binding===JSON.stringify(packet)&&clarification.kind===assessment.clarification.kind&&clarification.goalId===assessment.clarification.goalId,'Stale or mismatched clarification answer');
    ensure(assessment.clarification.options.some(o=>o.id===optionId),'Unknown clarification choice');
    const next=copy(packet),record={id:clarification.id,kind:clarification.kind,goalId:clarification.goalId,optionId,source:'user_confirmed',confirmedValues:[]};next.revision++;
    const fact=value=>({value,source:'user_confirmed',evidence:[],confirmationId:record.id});
    if(!['unsure','outside_scope','other_subject'].includes(optionId)) {
      if(clarification.kind==='primary_question'){const [intent,role]=mappings[optionId],id=`confirmed-goal-${next.revision}`;next.goals.push({id,label:labels[optionId],intent:fact(intent),role:fact(role)});next.primaryGoalId=id;next.goalInventorySource='user_confirmed';record.confirmedValues=[intent,role];}
      if(clarification.kind==='primary_goal'){next.primaryGoalId=optionId;}
      if(['credit_direction','debt_role'].includes(clarification.kind)){next.goals.find(g=>g.id===clarification.goalId).role=fact(optionId);record.confirmedValues=[optionId];}
    }
    next.answers.push(record);validate(next);return next;
  }
  function authorize(packet,upstream,candidate) {
    const assessment=assess(packet);if(assessment.status!=='ready')return assessment;
    ensure(upstream&&typeof upstream.semanticAct?.eligible==='boolean'&&typeof upstream.routeSufficiency?.accepted==='boolean'&&typeof upstream.routeability?.accepted==='boolean'&&Array.isArray(upstream.unsupportedTargets),'Frozen upstream flags required');
    const permitted=upstream.semanticAct.eligible&&upstream.routeSufficiency.accepted&&!upstream.unsupportedTargets.length;
    const permissions={roleAndTargetConfirmed:true,mayRunArbitration:permitted,mayRunFallback:permitted&&!upstream.arbitration&&upstream.routeability.accepted,maySelectRoute:false};
    const stop=reason=>freeze({...assessment,status:'abstain',reason,permissions});
    if(!permitted)return stop('blocked_by_frozen_upstream');
    ensure(candidate&&['Arbitration','Fallback'].includes(candidate.source),'Candidate branch required');let route;
    if(candidate.source==='Arbitration'){const arb=upstream.arbitration;if(!arb||!base.routeIds.includes(arb.routeId)||!['strong','support'].includes(arb.strength))return stop('no_valid_frozen_arbitration_candidate');route=arb.routeId;}
    if(candidate.source==='Fallback') {
      if(!permissions.mayRunFallback)return stop('fallback_not_reachable');
      const p=candidate.probabilities,t=candidate.threshold;
      ensure(Number.isFinite(t)&&t>=0&&t<=1&&p&&Object.keys(p).length===22&&base.routeIds.every(r=>Object.hasOwn(p,r)&&Number.isFinite(p[r])&&p[r]>=0&&p[r]<=1),'All22 scores and one global supplied threshold required');
      const admitted=base.routeIds.filter(r=>p[r]>=t);if(admitted.length!==1)return stop(admitted.length?'multiple_fallback_admissions':'no_fallback_admission');route=admitted[0];
    }
    if(route!==assessment.confirmedRoute)return stop('candidate_conflicts_with_confirmed_role_or_target');
    return freeze({...assessment,status:'authorized',reason:'candidate_matches_confirmed_role_and_target',candidateSource:candidate.source,selectedRoute:route,permissions:{...permissions,maySelectRoute:true}});
  }
  G.liuyaoSemanticRoleTargetGateV01=Object.freeze({version:'0.1-standalone-confirmed-role-and-target-prototype',makePacket,assess,applyAnswer,authorize,supportedRoutes:Object.freeze(Object.keys(mappings)),rawLanguageExtractionImplemented:false,productionIntegrated:false});
})(typeof window!=='undefined'?window:globalThis);
