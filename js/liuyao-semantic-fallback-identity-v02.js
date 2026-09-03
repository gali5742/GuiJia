(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const ROUTE_IDS = Object.freeze([
    'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
    'borrow_money','lend_money','debt_collection','debt_repayment','partnership','investment_profit',
    'investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
    'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match',
    'marital_relationship'
  ]);

  const freezeCandidate = (routeId, probability, threshold) => Object.freeze({
    routeId,
    probability,
    threshold,
    admitted:probability >= threshold
  });

  function decide({ probabilities=null, threshold } = {}) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      throw new Error('Fallback Identity v0.2 admission threshold must be within [0,1]');
    }
    if (!probabilities || typeof probabilities !== 'object') {
      throw new Error('Fallback Identity v0.2 all-22 probabilities required');
    }
    const keys = Object.keys(probabilities);
    if (keys.length !== ROUTE_IDS.length || ROUTE_IDS.some((routeId) => !Object.prototype.hasOwnProperty.call(probabilities, routeId))) {
      throw new Error('Fallback Identity v0.2 requires probabilities for exactly all current 22 routes');
    }
    const candidates = Object.freeze(ROUTE_IDS.map((routeId) => {
      const probability = probabilities[routeId];
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new Error(`Fallback Identity v0.2 missing/invalid probability for ${routeId}`);
      }
      return freezeCandidate(routeId, probability, threshold);
    }));
    const admitted = candidates.filter((candidate) => candidate.admitted);
    if (admitted.length === 1) {
      return Object.freeze({
        version:VERSION,
        candidateUniverse:'all_current_22_routes',
        status:'selected',
        routeId:admitted[0].routeId,
        reasonCode:'fallback_identity_all22_unique_admission',
        candidates
      });
    }
    return Object.freeze({
      version:VERSION,
      candidateUniverse:'all_current_22_routes',
      status:'route_unresolved',
      routeId:null,
      reasonCode:admitted.length === 0
        ? 'fallback_identity_all22_reject_all'
        : 'fallback_identity_all22_multiple_admissions',
      candidates
    });
  }

  GuiJia.liuyaoSemanticFallbackIdentityV02 = Object.freeze({
    version:VERSION,
    modelContract:'22_independent_binary_logistic_heads_all22_scored',
    routeIds:ROUTE_IDS,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
