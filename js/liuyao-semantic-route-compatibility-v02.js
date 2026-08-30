(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const has = (e, group, value) => Array.isArray(e?.[group]) && e[group].includes(value);
  const wrap = (routeId, status, positives, contradictions) => Object.freeze({
    version:VERSION,
    routeId,
    status,
    positiveEvidence:Object.freeze([...(positives || [])]),
    contradictionEvidence:Object.freeze([...(contradictions || [])])
  });

  function evaluate(routeId, evidence) {
    const baseCompatibility = GuiJia.liuyaoSemanticRouteCompatibilityV01;
    if (!baseCompatibility?.evaluate) throw new Error('Route Compatibility v0.1 未加载');
    const e = evidence || {};
    const base = baseCompatibility.evaluate(routeId, e);
    if (base.status === 'contradicted') return wrap(routeId, 'contradicted', base.positiveEvidence, base.contradictionEvidence);

    if (routeId === 'income_salary') {
      if (has(e,'unsupportedTargets','salary_administration')) return wrap(routeId,'contradicted',[],['unsupported_target:salary_administration']);
      return has(e,'currentTargets','salary_income') ? wrap(routeId,'confirmed',['current_target:salary_income'],[]) : wrap(routeId,'compatible',[],[]);
    }
    if (routeId === 'income_bonus') {
      if (has(e,'unsupportedTargets','bonus_policy')) return wrap(routeId,'contradicted',[],['unsupported_target:bonus_policy']);
      return has(e,'currentTargets','bonus_income') ? wrap(routeId,'confirmed',['current_target:bonus_income'],[]) : wrap(routeId,'compatible',[],[]);
    }
    if (routeId === 'commercial_transaction') {
      if (has(e,'unsupportedTargets','contract_clause_review')) return wrap(routeId,'contradicted',[],['unsupported_target:contract_clause_review']);
      return has(e,'currentTargets','commercial_transaction') ? wrap(routeId,'confirmed',['current_target:commercial_transaction'],[]) : wrap(routeId,'compatible',[],[]);
    }
    return wrap(routeId, base.status, base.positiveEvidence, base.contradictionEvidence);
  }

  const routeIds = Object.freeze([...(GuiJia.liuyaoSemanticRouteCompatibilityV01?.routeIds || [])]);
  GuiJia.liuyaoSemanticRouteCompatibilityV02 = Object.freeze({ version:VERSION, routeIds, evaluate });
})(typeof window !== 'undefined' ? window : globalThis);
