(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.13-candidate-v0.8';
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const purposeTerms = /(?:流程|手续|步骤|申请条件|所需材料|办理材料|证件|税率|费率|收费标准|条款|会计|记账|核算|计算公式|操作教程|术语|定义|法律责任|权益|登记材料)/;
  const informationRequest = /(?:怎么|如何|怎样|哪些|什么|多少|解释|介绍|列出|规定|要求|标准|含义|区别)/;
  const prediction = /(?:能不能|能否|会不会|是否|有没有希望|有望|顺利|成不成|要不要|该不该|值不值得|适不适合|合不合适|好不好|会有|能有|会在|能在|何时能|什么时候能)/;
  const targetFor = Object.freeze({investment_profit:'profit',investment_liquidation:'liquidation',investment_suitability:'suitability',investment_price_trend:'price_trend',income_salary:'salary_income',income_bonus:'bonus_income',commercial_transaction:'commercial_transaction',receive_item:'receipt',item_purchase:'purchase',debt_collection:'debt_collection'});
  function inspect(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV03;
    const baseApi = GuiJia.liuyaoSemanticRouteArbitrationV012;
    if (!extractor?.extract || !baseApi?.arbitrate) throw new Error('Frozen Evidence v0.3 and Arbitration v0.12 required');
    const e = suppliedEvidence || extractor.extract(question), text = String(question || '').replace(/\s+/g, '');
    const base = baseApi.arbitrate(question, e);
    const denied = reason => Object.freeze({candidateRoute:base?.routeId || null,authorized:false,reason,selection:null});
    if (!base) return denied('no_base_candidate');
    if ((e.unsupportedTargets || []).length) return denied('unsupported_target');
    if ((purposeTerms.test(text) && informationRequest.test(text)) || /(?:是什么意思|有何区别|有什么区别|如何区分|哪个指标|不问结果|并非预测)/.test(text)) return denied('information_or_procedure_purpose');
    if (/(?:借入还是借出|借来还是借给|借钱还是还钱|收回还是还出|收款还是还款|赚钱还是看价格|恋爱还是结婚|结婚还是婚后)/.test(text)) return denied('ambiguous_current_target');
    const route = base.routeId, mapped = targetFor[route];
    let permitted = mapped ? has(e,'currentTargets',mapped) : false;
    if (['borrow_money','lend_money','debt_repayment'].includes(route)) {
      const direction = {borrow_money:'funds_inward',lend_money:'funds_outward',debt_repayment:'debtor_outward'}[route];
      const directions = (e.directions || []).filter(d=>['funds_inward','funds_outward','debtor_outward','creditor_inward'].includes(d));
      permitted = directions.length === 1 && directions[0] === direction && prediction.test(text);
      if (route === 'debt_repayment') permitted = permitted && /(?:还清|还完|结清|还掉|清偿|偿还|还款)/.test(text);
    }
    if (route === 'relationship_development') permitted = has(e,'relations','romantic_development') && prediction.test(text) && /(?:表白|在一起|确定关系|恋爱|感情|关系|发展)/.test(text);
    if (route === 'marriage_match') permitted = has(e,'relations','marriage_target') && prediction.test(text) && /(?:结婚|领证|婚事|亲事|成为夫妻|结为夫妻)/.test(text);
    if (route === 'marital_relationship') permitted = has(e,'relations','existing_marriage') && prediction.test(text) && /(?:感情|夫妻关系|婚姻|相处|和睦|修复|维持|融洽|离婚|破裂)/.test(text);
    if (route === 'partnership') permitted = has(e,'relations','partnership') && prediction.test(text) && /(?:合作|合伙|共同经营|一起经营|搭档)/.test(text) && /(?:成|顺|稳定|赚钱|盈利|发展|长久|维持|合适|愉快)/.test(text);
    if (route === 'inventory_purchase') permitted = has(e,'events','inventory_acquisition') && prediction.test(text) && /(?:顺利|完成|到齐|到位|入库|进仓|合适|值得|补货|进货)/.test(text);
    if (route === 'inventory_sale') permitted = has(e,'events','inventory_disposal') && prediction.test(text) && /(?:卖完|卖掉|售出|出掉|出清|清掉|清库存|消化|处理)/.test(text);
    if (route === 'investment_position_decision') permitted = has(e,'events','investment_position') && /(?:要不要|该不该|应该|是否|合不合适)/.test(text);
    if (route === 'business_operation') permitted = has(e,'events','business_operation') && prediction.test(text) && /(?:经营|生意|门店|店铺|小店|小铺子|小买卖|摊位|摊子|工作室|业务)/.test(text);
    if (route === 'financial_fortune') permitted = has(e,'domains','finance') && prediction.test(text) && /(?:整体|总体|财运|收支|手头|财务)/.test(text);
    if (!permitted) return denied('no_route_specific_current_target_permission');
    // This layer can only restrict an existing candidate; it never invents a
    // route, upgrades support to strong, or grants Act/Sufficiency permission.
    const selection = Object.freeze({version:VERSION,routeId:route,strength:base.strength,evidence:Object.freeze([...base.evidence,'route-specific-current-target-permission']),rationale:'authorized-current-route-target'});
    return Object.freeze({candidateRoute:route,authorized:true,reason:'authorized_current_route_target',selection});
  }
  function arbitrate(question, suppliedEvidence) { return inspect(question,suppliedEvidence).selection; }
  GuiJia.liuyaoSemanticRouteArbitrationV013 = Object.freeze({version:VERSION,inspect,arbitrate});
})(typeof window !== 'undefined' ? window : globalThis);
