(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.11-dev';

  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const hasAny = (e, group, values) => values.some((value) => has(e, group, value));
  const result = (routeId, strength, evidence, rationale) => Object.freeze({
    version:VERSION,
    routeId,
    strength,
    evidence:Object.freeze([...evidence]),
    rationale
  });

  function arbitrate(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV01;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.1 未加载');
    const e = suppliedEvidence || extractor.extract(question);
    if (!e?.text) return null;

    // Positive current-target evidence may override historical/background actions.
    if (has(e,'currentTargets','debt_collection') && has(e,'directions','creditor_inward')) {
      return result('debt_collection','strong',['creditor_inward','current_target:debt_collection'],'current-target-over-background');
    }

    // Explicit money direction is a structural current semantic signal.
    if (has(e,'directions','debtor_outward')) return result('debt_repayment','strong',['debtor_outward'],'fund-direction');
    if (has(e,'directions','funds_inward')) return result('borrow_money','strong',['funds_inward'],'fund-direction');
    if (has(e,'directions','funds_outward')) return result('lend_money','strong',['funds_outward'],'fund-direction');
    if (has(e,'directions','creditor_inward')) return result('debt_collection','strong',['creditor_inward'],'creditor-direction');

    // Relationship stage is structural and mutually exclusive in current Evidence v0.1.
    if (has(e,'relations','existing_marriage')) return result('marital_relationship','strong',['existing_marriage'],'relationship-stage');
    if (has(e,'relations','marriage_target')) return result('marriage_match','strong',['marriage_target'],'relationship-stage');
    if (has(e,'relations','romantic_development')) return result('relationship_development','strong',['romantic_development'],'relationship-stage');

    if (has(e,'domains','investment')) {
      // Strong requires positive evidence that the semantic is the current question target.
      if (has(e,'currentTargets','liquidation')) return result('investment_liquidation','strong',['investment','current_target:liquidation'],'current-target');
      if (has(e,'currentTargets','profit')) return result('investment_profit','strong',['investment','current_target:profit'],'current-target-over-position-background');
      if (has(e,'currentTargets','suitability')) return result('investment_suitability','strong',['investment','current_target:suitability'],'current-target');
      if (has(e,'currentTargets','price_trend')) return result('investment_price_trend','strong',['investment','current_target:price_trend'],'current-target');

      // Missing current-target evidence is unknown, not negative evidence. Event-only signals stay support.
      // A competing positive goal prevents an event/background cue from becoming a strong current target.
      const competingInvestmentGoal = hasAny(e,'goals',['profit','suitability','price_trend']);
      if (has(e,'events','investment_liquidation') && !competingInvestmentGoal) {
        return result('investment_liquidation','support',['investment','liquidation-event'],'event-only-support');
      }
      if (has(e,'events','investment_position') && !competingInvestmentGoal) {
        return result('investment_position_decision','support',['investment','position-event'],'event-only-support');
      }
      if (has(e,'goals','profit')) return result('investment_profit','support',['investment','profit-semantics'],'investment-support');
      if (has(e,'goals','suitability')) return result('investment_suitability','support',['investment','suitability-semantics'],'investment-support');
      if (has(e,'goals','price_trend')) return result('investment_price_trend','support',['investment','price-trend-semantics'],'investment-support');
    }

    if (has(e,'events','delivery') && has(e,'objects','delivery_item')) {
      return result('receive_item','strong',['delivery','delivery_item'],'delivery-over-past-purchase');
    }

    if (has(e,'events','bonus_income')) return result('income_bonus','strong',['bonus_income'],'income-type');
    if (has(e,'events','salary_income')) return result('income_salary','strong',['salary_income'],'income-type');

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

    if (has(e,'events','ordinary_purchase') && has(e,'objects','purchasable_item')) {
      return result('item_purchase','strong',['ordinary_purchase','purchasable_item'],'ordinary-purchase');
    }
    return null;
  }

  GuiJia.liuyaoSemanticRouteArbitrationV011 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
