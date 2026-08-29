(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.10-dev';

  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const result = (routeId, strength, evidence, rationale) => Object.freeze({
    version:VERSION,
    routeId,
    strength,
    evidence:[...evidence],
    rationale
  });

  function arbitrate(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV01;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.1 未加载');
    const e = suppliedEvidence || extractor.extract(question);
    if (!e?.text) return null;

    // Current target wins over historical/background actions.
    if (has(e,'currentTargets','debt_collection') && has(e,'directions','creditor_inward')) {
      return result('debt_collection','strong',['creditor_inward','current_target:debt_collection'],'current-target-over-background');
    }

    // Money direction is structural modern semantics.
    if (has(e,'directions','debtor_outward')) return result('debt_repayment','strong',['debtor_outward'],'fund-direction');
    if (has(e,'directions','funds_inward')) return result('borrow_money','strong',['funds_inward'],'fund-direction');
    if (has(e,'directions','funds_outward')) return result('lend_money','strong',['funds_outward'],'fund-direction');
    if (has(e,'directions','creditor_inward')) return result('debt_collection','strong',['creditor_inward'],'creditor-direction');

    // Relationship stage is structural; existing marriage > marriage target > romantic development.
    if (has(e,'relations','existing_marriage')) return result('marital_relationship','strong',['existing_marriage'],'relationship-stage');
    if (has(e,'relations','marriage_target')) return result('marriage_match','strong',['marriage_target'],'relationship-stage');
    if (has(e,'relations','romantic_development')) return result('relationship_development','strong',['romantic_development'],'relationship-stage');

    // Investment: explicit current question target outranks contextual position/background wording.
    if (has(e,'domains','investment')) {
      if (has(e,'currentTargets','liquidation')) return result('investment_liquidation','strong',['investment','current_target:liquidation'],'current-target');
      if (has(e,'currentTargets','profit')) return result('investment_profit','strong',['investment','current_target:profit'],'current-target-over-position-background');
      if (has(e,'currentTargets','suitability')) return result('investment_suitability','strong',['investment','current_target:suitability'],'current-target');
      if (has(e,'currentTargets','price_trend')) return result('investment_price_trend','strong',['investment','current_target:price_trend'],'current-target');
      if (has(e,'events','investment_liquidation')) return result('investment_liquidation','strong',['investment','liquidation-event'],'explicit-investment-event');
      if (has(e,'events','investment_position')) return result('investment_position_decision','strong',['investment','position-event'],'explicit-investment-event');
      if (has(e,'goals','profit')) return result('investment_profit','support',['investment','profit-semantics'],'investment-support');
      if (has(e,'goals','suitability')) return result('investment_suitability','support',['investment','suitability-semantics'],'investment-support');
      if (has(e,'goals','price_trend')) return result('investment_price_trend','support',['investment','price-trend-semantics'],'investment-support');
    }

    // Delivery is a current fulfillment state; a historical purchase does not turn it back into purchase.
    if (has(e,'events','delivery') && has(e,'objects','delivery_item')) {
      return result('receive_item','strong',['delivery','delivery_item'],'delivery-over-past-purchase');
    }

    // Income labels are explicit modern semantic categories.
    if (has(e,'events','bonus_income')) return result('income_bonus','strong',['bonus_income'],'income-type');
    if (has(e,'events','salary_income')) return result('income_salary','strong',['salary_income'],'income-type');

    // Commercial structures: only structural events may override; generic finance/business cues are support only.
    if (has(e,'events','inventory_acquisition') && (has(e,'objects','inventory') || has(e,'domains','business') || has(e,'domains','commerce'))) {
      return result('inventory_purchase','strong',['inventory_acquisition'],'commercial-event');
    }
    if (has(e,'events','inventory_disposal') && has(e,'objects','inventory')) {
      return result('inventory_sale','strong',['inventory_disposal','inventory'],'commercial-event');
    }
    if (has(e,'relations','partnership')) return result('partnership','strong',['partnership'],'commercial-relation');
    if (has(e,'events','commercial_transaction')) return result('commercial_transaction','strong',['commercial_transaction'],'bounded-commercial-event');
    if (has(e,'events','business_operation')) return result('business_operation','support',['business_operation'],'business-support');
    if (has(e,'domains','finance')) return result('financial_fortune','support',['finance'],'finance-support');

    // Ordinary purchase comes after investment and delivery.
    if (has(e,'events','ordinary_purchase') && has(e,'objects','purchasable_item')) {
      return result('item_purchase','strong',['ordinary_purchase','purchasable_item'],'ordinary-purchase');
    }
    return null;
  }

  GuiJia.liuyaoSemanticRouteArbitrationV010 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
