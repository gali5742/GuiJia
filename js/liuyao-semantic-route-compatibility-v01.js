(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';

  const ROUTES = Object.freeze([
    'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
    'borrow_money','lend_money','debt_collection','debt_repayment','partnership',
    'investment_profit','investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
    'income_salary','income_bonus','receive_item','item_purchase',
    'relationship_development','marriage_match','marital_relationship'
  ]);
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const hasAny = (e, group, values) => values.some((value) => has(e, group, value));
  const present = (e, group, values) => values.filter((value) => has(e, group, value));

  const MONEY_DIRECTIONS = Object.freeze({
    borrow_money:'funds_inward',
    lend_money:'funds_outward',
    debt_collection:'creditor_inward',
    debt_repayment:'debtor_outward'
  });
  const RELATION_STAGES = Object.freeze({
    relationship_development:'romantic_development',
    marriage_match:'marriage_target',
    marital_relationship:'existing_marriage'
  });
  const INVESTMENT_TARGETS = Object.freeze({
    investment_profit:'profit',
    investment_liquidation:'liquidation',
    investment_suitability:'suitability',
    investment_price_trend:'price_trend'
  });

  const result = (routeId, status, positiveEvidence, contradictionEvidence) => Object.freeze({
    version:VERSION,
    routeId,
    status,
    positiveEvidence:Object.freeze([...positiveEvidence]),
    contradictionEvidence:Object.freeze([...contradictionEvidence])
  });

  function positiveEvidence(routeId, e) {
    const out = [];
    const add = (label, condition) => { if (condition) out.push(label); };
    switch (routeId) {
      case 'financial_fortune':
        add('domain:finance', has(e,'domains','finance'));
        break;
      case 'business_operation':
        add('event:business_operation', has(e,'events','business_operation'));
        break;
      case 'commercial_transaction':
        add('event:commercial_transaction', has(e,'events','commercial_transaction'));
        break;
      case 'inventory_purchase':
        add('event:inventory_acquisition', has(e,'events','inventory_acquisition'));
        break;
      case 'inventory_sale':
        add('event:inventory_disposal', has(e,'events','inventory_disposal'));
        break;
      case 'borrow_money':
      case 'lend_money':
      case 'debt_collection':
      case 'debt_repayment':
        add(`direction:${MONEY_DIRECTIONS[routeId]}`, has(e,'directions',MONEY_DIRECTIONS[routeId]));
        break;
      case 'partnership':
        add('relation:partnership', has(e,'relations','partnership'));
        break;
      case 'investment_profit':
        add('current_target:profit', has(e,'currentTargets','profit'));
        add('goal:profit', has(e,'domains','investment') && has(e,'goals','profit'));
        break;
      case 'investment_liquidation':
        add('current_target:liquidation', has(e,'currentTargets','liquidation'));
        add('event:investment_liquidation', has(e,'domains','investment') && has(e,'events','investment_liquidation') && !hasAny(e,'goals',['profit','suitability','price_trend']));
        break;
      case 'investment_suitability':
        add('current_target:suitability', has(e,'currentTargets','suitability'));
        add('goal:suitability', has(e,'domains','investment') && has(e,'goals','suitability'));
        break;
      case 'investment_position_decision':
        add('event:investment_position', has(e,'domains','investment') && has(e,'events','investment_position') && !hasAny(e,'goals',['profit','suitability','price_trend']));
        break;
      case 'investment_price_trend':
        add('current_target:price_trend', has(e,'currentTargets','price_trend'));
        add('goal:price_trend', has(e,'domains','investment') && has(e,'goals','price_trend'));
        break;
      case 'income_salary':
        add('event:salary_income', has(e,'events','salary_income'));
        break;
      case 'income_bonus':
        add('event:bonus_income', has(e,'events','bonus_income'));
        break;
      case 'receive_item':
        add('current_target:receipt', has(e,'currentTargets','receipt') && has(e,'events','delivery'));
        add('event:delivery+object', has(e,'events','delivery') && has(e,'objects','delivery_item'));
        break;
      case 'item_purchase':
        add('current_target:purchase', has(e,'currentTargets','purchase') && has(e,'events','ordinary_purchase'));
        add('event:ordinary_purchase+object', has(e,'events','ordinary_purchase') && has(e,'objects','purchasable_item'));
        break;
      case 'relationship_development':
      case 'marriage_match':
      case 'marital_relationship':
        add(`relation:${RELATION_STAGES[routeId]}`, has(e,'relations',RELATION_STAGES[routeId]));
        break;
      default:
        break;
    }
    return out;
  }

  function contradictionEvidence(routeId, e) {
    const out = [];
    const add = (label, condition) => { if (condition) out.push(label); };

    if (Object.hasOwn(MONEY_DIRECTIONS, routeId)) {
      const expected = MONEY_DIRECTIONS[routeId];
      for (const actual of present(e,'directions',Object.values(MONEY_DIRECTIONS))) {
        if (actual !== expected) out.push(`direction:${actual}`);
      }
      return out;
    }

    if (Object.hasOwn(RELATION_STAGES, routeId)) {
      const expected = RELATION_STAGES[routeId];
      for (const actual of present(e,'relations',Object.values(RELATION_STAGES))) {
        if (actual !== expected) out.push(`relation:${actual}`);
      }
      return out;
    }

    if (routeId.startsWith('investment_')) {
      const expectedTarget = INVESTMENT_TARGETS[routeId] || 'position_decision';
      for (const actual of present(e,'currentTargets',['profit','liquidation','suitability','price_trend'])) {
        if (actual !== expectedTarget) out.push(`current_target:${actual}`);
      }
      if (routeId === 'investment_position_decision') {
        for (const actual of present(e,'goals',['profit','suitability','price_trend'])) out.push(`goal:${actual}`);
        add('event:investment_liquidation', has(e,'events','investment_liquidation'));
      } else if (routeId === 'investment_liquidation') {
        for (const actual of present(e,'goals',['profit','suitability','price_trend'])) out.push(`goal:${actual}`);
        add('event:investment_position', has(e,'events','investment_position') && !has(e,'currentTargets','liquidation'));
      } else {
        const goal = INVESTMENT_TARGETS[routeId];
        for (const actual of present(e,'goals',['profit','suitability','price_trend'])) {
          if (actual !== goal) out.push(`goal:${actual}`);
        }
      }
      return out;
    }

    if (routeId === 'income_salary') add('event:bonus_income', has(e,'events','bonus_income'));
    if (routeId === 'income_bonus') add('event:salary_income', has(e,'events','salary_income'));

    if (routeId === 'receive_item') {
      add('current_target:purchase', has(e,'currentTargets','purchase') && !has(e,'events','delivery'));
      add('event:ordinary_purchase', has(e,'events','ordinary_purchase') && !has(e,'events','delivery'));
    }
    if (routeId === 'item_purchase') {
      add('current_target:receipt', has(e,'currentTargets','receipt'));
      add('event:delivery', has(e,'events','delivery') && has(e,'background','past_purchase'));
    }

    const specificFinanceSignals = hasAny(e,'events',[
      'business_operation','commercial_transaction','inventory_acquisition','inventory_disposal',
      'salary_income','bonus_income','delivery','ordinary_purchase','investment_liquidation','investment_position'
    ]) || hasAny(e,'directions',Object.values(MONEY_DIRECTIONS)) || has(e,'domains','investment') || has(e,'relations','partnership');
    if (routeId === 'financial_fortune') add('specific_finance_semantics', specificFinanceSignals);

    const commercialEvents = {
      business_operation:'business_operation',
      commercial_transaction:'commercial_transaction',
      inventory_purchase:'inventory_acquisition',
      inventory_sale:'inventory_disposal'
    };
    if (Object.hasOwn(commercialEvents, routeId)) {
      const expected = commercialEvents[routeId];
      for (const actual of present(e,'events',Object.values(commercialEvents))) {
        if (actual !== expected && routeId !== 'business_operation') out.push(`event:${actual}`);
      }
    }

    return out;
  }

  function evaluate(routeId, evidence) {
    if (!ROUTES.includes(routeId)) throw new Error(`Unsupported route compatibility id: ${routeId}`);
    const positives = positiveEvidence(routeId, evidence || {});
    const contradictions = contradictionEvidence(routeId, evidence || {});
    if (contradictions.length) return result(routeId,'contradicted',positives,contradictions);
    if (positives.length) return result(routeId,'confirmed',positives,[]);
    return result(routeId,'compatible',[],[]);
  }

  GuiJia.liuyaoSemanticRouteCompatibilityV01 = Object.freeze({
    version:VERSION,
    routeIds:ROUTES,
    evaluate
  });
})(typeof window !== 'undefined' ? window : globalThis);
