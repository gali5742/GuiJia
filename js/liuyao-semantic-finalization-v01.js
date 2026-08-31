(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';

  function finalize({ routeability=null, selection=null, scope=null, arbitration=null, evidence=null } = {}) {
    if (!routeability) throw new Error('Semantic Finalization v0.1 requires routeability result');

    if (routeability.disposition !== 'route_known') {
      return Object.freeze({
        version:VERSION,
        disposition:'non_route',
        routeId:null,
        reasonCode:routeability.reasonCode || 'routeability_non_route',
        scopeBypassed:false
      });
    }

    if (!selection || selection.status !== 'selected' || !selection.routeId) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_unresolved',
        routeId:null,
        reasonCode:selection?.reasonCode || 'selection_unresolved',
        scopeBypassed:false
      });
    }

    const hardVeto = Boolean(scope?.hardVeto);
    if (!hardVeto) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_known',
        routeId:selection.routeId,
        reasonCode:selection.reasonCode,
        scopeBypassed:false
      });
    }

    if (arbitration?.strength === 'strong' && arbitration.routeId === selection.routeId) {
      const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV02;
      if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.2 未加载');
      const checked = compatibility.evaluate(arbitration.routeId, evidence || {});
      if (checked.status === 'confirmed') {
        return Object.freeze({
          version:VERSION,
          disposition:'route_known',
          routeId:selection.routeId,
          reasonCode:'confirmed_strong_scope_bypass',
          scopeBypassed:true
        });
      }
    }

    return Object.freeze({
      version:VERSION,
      disposition:'non_route',
      routeId:null,
      reasonCode:'scope_hard_veto',
      scopeBypassed:false
    });
  }

  GuiJia.liuyaoSemanticFinalizationV01 = Object.freeze({ version:VERSION, finalize });
})(typeof window !== 'undefined' ? window : globalThis);
