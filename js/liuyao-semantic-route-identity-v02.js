(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const pass = (routeId, evidence) => Object.freeze({version:VERSION,routeId,passed:true,confidence:'strong',evidence:[...evidence],reasonCode:null});
  const fail = (routeId, reasonCode, evidence=[]) => Object.freeze({version:VERSION,routeId,passed:false,confidence:'none',evidence:[...evidence],reasonCode});

  function evaluate(routeId, question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV01;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.1 未加载');
    const e = suppliedEvidence || extractor.extract(question);
    if (!e?.text) return fail(routeId,'empty_question');

    switch (routeId) {
      case 'financial_fortune':
        return has(e,'domains','finance') ? pass(routeId,['finance']) : fail(routeId,'missing_finance_semantics');
      case 'business_operation':
        return has(e,'events','business_operation') ? pass(routeId,['business_operation']) : fail(routeId,'missing_business_operation_semantics');
      case 'commercial_transaction':
        return has(e,'events','commercial_transaction') ? pass(routeId,['commercial_transaction']) : fail(routeId,'missing_bounded_commercial_event');
      case 'inventory_purchase':
        return has(e,'events','inventory_acquisition') && (has(e,'objects','inventory') || has(e,'domains','business') || has(e,'domains','commerce'))
          ? pass(routeId,['inventory_acquisition']) : fail(routeId,'missing_inventory_acquisition_semantics');
      case 'inventory_sale':
        return has(e,'events','inventory_disposal') && has(e,'objects','inventory')
          ? pass(routeId,['inventory_disposal','inventory']) : fail(routeId,'missing_inventory_disposal_semantics');
      case 'borrow_money':
        return has(e,'directions','funds_inward') ? pass(routeId,['funds_inward']) : fail(routeId,'missing_funds_inward');
      case 'lend_money':
        return has(e,'directions','funds_outward') ? pass(routeId,['funds_outward']) : fail(routeId,'missing_funds_outward');
      case 'debt_collection':
        return has(e,'directions','creditor_inward') ? pass(routeId,['creditor_inward']) : fail(routeId,'missing_creditor_direction');
      case 'debt_repayment':
        return has(e,'directions','debtor_outward') ? pass(routeId,['debtor_outward']) : fail(routeId,'missing_debtor_direction');
      case 'partnership':
        return has(e,'relations','partnership') ? pass(routeId,['partnership']) : fail(routeId,'missing_partnership_semantics');
      case 'investment_profit':
        return has(e,'domains','investment') && has(e,'goals','profit') ? pass(routeId,['investment','profit']) : fail(routeId,!has(e,'domains','investment')?'missing_investment_semantics':'missing_profit_semantics');
      case 'investment_liquidation':
        return has(e,'domains','investment') && has(e,'events','investment_liquidation') ? pass(routeId,['investment','investment_liquidation']) : fail(routeId,!has(e,'domains','investment')?'missing_investment_semantics':'missing_liquidation_semantics');
      case 'investment_suitability':
        return has(e,'domains','investment') && has(e,'goals','suitability') ? pass(routeId,['investment','suitability']) : fail(routeId,!has(e,'domains','investment')?'missing_investment_semantics':'missing_suitability_semantics');
      case 'investment_position_decision':
        return has(e,'domains','investment') && has(e,'events','investment_position') ? pass(routeId,['investment','investment_position']) : fail(routeId,!has(e,'domains','investment')?'missing_investment_semantics':'missing_position_semantics');
      case 'investment_price_trend':
        return has(e,'domains','investment') && has(e,'goals','price_trend') ? pass(routeId,['investment','price_trend']) : fail(routeId,!has(e,'domains','investment')?'missing_investment_semantics':'missing_price_trend_semantics');
      case 'income_salary':
        return has(e,'events','salary_income') ? pass(routeId,['salary_income']) : fail(routeId,'missing_salary_semantics');
      case 'income_bonus':
        return has(e,'events','bonus_income') ? pass(routeId,['bonus_income']) : fail(routeId,'missing_bonus_semantics');
      case 'receive_item':
        return has(e,'events','delivery') && has(e,'objects','delivery_item') ? pass(routeId,['delivery','delivery_item']) : fail(routeId,!has(e,'events','delivery')?'missing_delivery_semantics':'missing_delivery_object_semantics');
      case 'item_purchase':
        return has(e,'events','ordinary_purchase') && has(e,'objects','purchasable_item') ? pass(routeId,['ordinary_purchase','purchasable_item']) : fail(routeId,!has(e,'events','ordinary_purchase')?'missing_purchase_semantics':'missing_purchase_object_semantics');
      case 'relationship_development':
        return has(e,'relations','romantic_development') ? pass(routeId,['romantic_development']) : fail(routeId,'missing_romantic_development_semantics');
      case 'marriage_match':
        return has(e,'relations','marriage_target') ? pass(routeId,['marriage_target']) : fail(routeId,'missing_marriage_target_semantics');
      case 'marital_relationship':
        return has(e,'relations','existing_marriage') ? pass(routeId,['existing_marriage']) : fail(routeId,'missing_existing_marriage_semantics');
      default:
        return fail(routeId,'unsupported_route_identity_contract');
    }
  }

  GuiJia.liuyaoSemanticRouteIdentityV02 = Object.freeze({version:VERSION,evaluate});
})(typeof window !== 'undefined' ? window : globalThis);
