(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.12-dev';
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const freeze = (routeId, strength, evidence, rationale) => Object.freeze({ version:VERSION, routeId, strength, evidence:Object.freeze([...(evidence || [])]), rationale });

  function arbitrate(question, suppliedEvidence) {
    const extractor = GuiJia.liuyaoSemanticRouteEvidenceV02;
    const baseArbitration = GuiJia.liuyaoSemanticRouteArbitrationV011;
    if (!extractor?.extract) throw new Error('Route Semantic Evidence v0.2 未加载');
    if (!baseArbitration?.arbitrate) throw new Error('Route Arbitration v0.11 未加载');
    const e = suppliedEvidence || extractor.extract(question);
    if ((e.unsupportedTargets || []).length) return null;
    const base = baseArbitration.arbitrate(question, e);
    if (!base) return null;

    if (base.routeId === 'income_salary' && !has(e,'currentTargets','salary_income')) {
      return freeze(base.routeId, 'support', [...base.evidence, 'topic-only:salary'], 'salary-topic-without-current-income-target');
    }
    if (base.routeId === 'income_bonus' && !has(e,'currentTargets','bonus_income')) {
      return freeze(base.routeId, 'support', [...base.evidence, 'topic-only:bonus'], 'bonus-topic-without-current-income-target');
    }
    if (base.routeId === 'commercial_transaction' && !has(e,'currentTargets','commercial_transaction')) {
      return freeze(base.routeId, 'support', [...base.evidence, 'topic-only:commercial_transaction'], 'transaction-topic-without-current-outcome-target');
    }
    return freeze(base.routeId, base.strength, base.evidence, base.rationale);
  }

  GuiJia.liuyaoSemanticRouteArbitrationV012 = Object.freeze({ version:VERSION, arbitrate });
})(typeof window !== 'undefined' ? window : globalThis);
