(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.14-candidate-v0.9';
  const has = (e,g,v) => (e[g] || []).includes(v);
  const moneyRoutes = ['borrow_money','lend_money','debt_collection','debt_repayment'];
  const roleTerms = '(?:谁|哪(?:一)?方|何人|借方|贷方|借款人|欠款人|债务人|债权人|收款人|出资人|出资方|付款人|付款方|还款人|偿付者|资金提供方|资金接收方|角色|身份|流向|方向)';
  const missing = '(?:不清楚|不明|不确定|不知道|没(?:有)?(?:说清|定|确认|交代|确定|说明)|尚未|暂未|未(?:指定|确定|说明|明确|交代|确认|区分))';
  const unknownRole = new RegExp(`${roleTerms}[^，。；？！?]{0,20}${missing}|${missing}[^，。；？！?]{0,20}${roleTerms}`);
  const focusPattern = /只(?:想)?问|仅(?:想)?问|重点(?:是|问)|主要(?:想)?问|真正想知道(?:的)?(?:是)?|现在(?:想)?问(?:的)?是|只关心/gu;
  const negatedQuestion = /^(?:并)?(?:不是问|不问|不关心|不考虑|并非问|别判断|无需判断)/;
  function currentScope(question) {
    const text = String(question || '').replace(/\s+/g,''), matches = [...text.matchAll(focusPattern)];
    const last = matches[matches.length-1], focused = last ? text.slice(last.index+last[0].length) : text;
    const clauses = focused.split(/[，,。；;？！?！]/u).filter(Boolean);
    const active = clauses.filter(clause=>!negatedQuestion.test(clause));
    return {text:active.join('，'),explicitFocus:!!last,negatedClausesRemoved:clauses.length-active.length};
  }
  function currentTargets(e) {
    const targets = new Set(), add = (r,ok)=>{if(ok)targets.add(r);};
    for(const [r,target]of Object.entries({investment_profit:'profit',investment_liquidation:'liquidation',investment_suitability:'suitability',investment_price_trend:'price_trend'}))add(r,has(e,'domains','investment')&&has(e,'currentTargets',target));
    for(const [r,target]of Object.entries({income_salary:'salary_income',income_bonus:'bonus_income',commercial_transaction:'commercial_transaction',receive_item:'receipt',item_purchase:'purchase'}))add(r,has(e,'currentTargets',target)&&(r!=='receive_item'||has(e,'objects','delivery_item')));
    add('inventory_purchase',has(e,'events','inventory_acquisition'));
    add('inventory_sale',has(e,'events','inventory_disposal'));
    add('investment_position_decision',has(e,'events','investment_position'));
    if(has(e,'currentTargets','debt_collection'))targets.add('debt_collection');
    else for(const [r,d]of Object.entries({borrow_money:'funds_inward',lend_money:'funds_outward',debt_repayment:'debtor_outward'}))add(r,has(e,'directions',d));
    for(const [r,relation]of Object.entries({relationship_development:'romantic_development',marriage_match:'marriage_target',marital_relationship:'existing_marriage',partnership:'partnership'}))add(r,has(e,'relations',relation));
    return [...targets];
  }
  function hasMoneyRole(route,text) {
    if(route==='debt_collection')return /(?:欠我|欠我们|应收[^，。]{0,12}(?:我|本方)|(?:我|我们|本人|本方)[^，。]{0,16}(?:借出去|借给|债权|应收|收回|追回|要回))/.test(text);
    if(route==='debt_repayment')return /(?:我|我们|本人|本方|自己)[^，。]{0,16}(?:欠|还|清偿|偿还|负担|债务|欠款|贷款|信用卡)/.test(text);
    return /(?:我|我们|本人|本方|自己)/.test(text);
  }
  function inspect(question,suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV03, previous = GuiJia.liuyaoSemanticRouteArbitrationV013;
    if(!extractor?.extract||!previous?.inspect)throw new Error('Frozen Evidence v0.3 and Arbitration v0.13 required');
    const e=suppliedEvidence||extractor.extract(question), prior=previous.inspect(question,e), base=prior.selection, scope=currentScope(question);
    const activeEvidence=extractor.extract(scope.text),targets=currentTargets(activeEvidence);
    const denied=reason=>Object.freeze({candidateRoute:prior.candidateRoute,authorized:false,reason,activeTargets:Object.freeze(targets),explicitFocus:scope.explicitFocus,negatedClausesRemoved:scope.negatedClausesRemoved,selection:null});
    if(!base)return denied(prior.reason);
    if(moneyRoutes.includes(base.routeId)&&(unknownRole.test(scope.text)||!hasMoneyRole(base.routeId,scope.text)))return denied('missing_or_unconfirmed_current_money_role');
    if(!scope.text)return denied('no_positive_current_target');
    if(targets.length>1)return denied('multiple_active_current_route_targets');
    if(scope.explicitFocus||scope.negatedClausesRemoved){
      const current=previous.inspect(scope.text,activeEvidence).selection;
      if(!current||current.routeId!==base.routeId)return denied('base_candidate_conflicts_with_positive_current_focus');
    }
    const selection=Object.freeze({version:VERSION,routeId:base.routeId,strength:base.strength,evidence:Object.freeze([...base.evidence,'confirmed-current-role-and-target-scope']),rationale:'authorized-single-positive-current-target'});
    return Object.freeze({candidateRoute:base.routeId,authorized:true,reason:'authorized_single_positive_current_target',activeTargets:Object.freeze(targets),explicitFocus:scope.explicitFocus,negatedClausesRemoved:scope.negatedClausesRemoved,selection});
  }
  GuiJia.liuyaoSemanticRouteArbitrationV014=Object.freeze({version:VERSION,inspect,arbitrate:(q,e)=>inspect(q,e).selection});
})(typeof window!=='undefined'?window:globalThis);
