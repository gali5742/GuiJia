(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.3-dev';
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const wrap = (routeId, status, positives, contradictions) => Object.freeze({
    version:VERSION,
    routeId,
    status,
    positiveEvidence:Object.freeze([...(positives || [])]),
    contradictionEvidence:Object.freeze([...(contradictions || [])])
  });

  function evaluate(routeId, evidence) {
    const baseCompatibility = GuiJia.liuyaoSemanticRouteCompatibilityV02;
    if (!baseCompatibility?.evaluate) throw new Error('Route Compatibility v0.2 未加载');
    const e = evidence || {};
    const unsupportedTargets = Array.isArray(e.unsupportedTargets) ? e.unsupportedTargets : [];

    // Explicit modern informational/procedural targets are outside the current 22-route activation contract.
    if (unsupportedTargets.length) {
      return wrap(routeId, 'contradicted', [], unsupportedTargets.map((value) => `unsupported_target:${value}`));
    }

    const base = baseCompatibility.evaluate(routeId, e);

    // Current debt-collection intent outranks the historical fact that the money was previously lent out.
    if (
      routeId === 'debt_collection'
      && has(e,'currentTargets','debt_collection')
      && has(e,'directions','creditor_inward')
    ) {
      const contradictions = [...(base.contradictionEvidence || [])];
      const historicalOutward = has(e,'background','historical_lending') && has(e,'directions','funds_outward');
      const remaining = contradictions.filter((value) => !(historicalOutward && value === 'direction:funds_outward'));
      if (remaining.length === 0) {
        return wrap(routeId, 'confirmed', [
          ...(base.positiveEvidence || []),
          'current_target:debt_collection'
        ], []);
      }
      return wrap(routeId, 'contradicted', base.positiveEvidence, remaining);
    }

    if (base.status === 'contradicted') {
      return wrap(routeId, 'contradicted', base.positiveEvidence, base.contradictionEvidence);
    }

    // Topic-only Arbitration is valid positive route evidence once explicit unsupported targets have been excluded.
    if (routeId === 'commercial_transaction' && has(e,'events','commercial_transaction')) {
      return wrap(routeId, 'confirmed', ['event:commercial_transaction'], []);
    }
    if (routeId === 'income_salary' && has(e,'events','salary_income')) {
      return wrap(routeId, 'confirmed', ['event:salary_income'], []);
    }
    if (routeId === 'income_bonus' && has(e,'events','bonus_income')) {
      return wrap(routeId, 'confirmed', ['event:bonus_income'], []);
    }

    return wrap(routeId, base.status, base.positiveEvidence, base.contradictionEvidence);
  }

  const routeIds = Object.freeze([...(GuiJia.liuyaoSemanticRouteCompatibilityV02?.routeIds || [])]);
  GuiJia.liuyaoSemanticRouteCompatibilityV03 = Object.freeze({ version:VERSION, routeIds, evaluate });
})(typeof window !== 'undefined' ? window : globalThis);
