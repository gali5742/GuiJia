(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';

  function finalize({
    routeability=null,
    selection=null,
    scope=null,
    arbitration=null,
    evidence=null,
    fallbackAcceptanceDecision=null
  } = {}) {
    if (!routeability) throw new Error('Semantic Finalization v0.2 requires routeability result');

    const pureFallbackAccepted = !arbitration?.routeId
      && fallbackAcceptanceDecision?.status === 'selected'
      && fallbackAcceptanceDecision.routeId
      && selection?.status === 'selected'
      && selection.routeId === fallbackAcceptanceDecision.routeId;

    if (!selection || selection.status !== 'selected' || !selection.routeId) {
      if (routeability.reasonCode === 'explicit_unsupported_target') {
        return Object.freeze({
          version:VERSION,
          disposition:'non_route',
          routeId:null,
          reasonCode:'explicit_unsupported_target',
          scopeBypassed:false
        });
      }
      if (arbitration?.routeId && routeability.disposition !== 'route_known') {
        return Object.freeze({
          version:VERSION,
          disposition:'non_route',
          routeId:null,
          reasonCode:routeability.reasonCode || 'routeability_non_route',
          scopeBypassed:false
        });
      }
      return Object.freeze({
        version:VERSION,
        disposition:'route_unresolved',
        routeId:null,
        reasonCode:selection?.reasonCode || 'selection_unresolved',
        scopeBypassed:false
      });
    }

    // Arbitration paths still require corrected Routeability membership/rescue.
    // Pure fallback is separately governed by the fresh-calibrated Acceptance Gate.
    if (arbitration?.routeId && routeability.disposition !== 'route_known') {
      return Object.freeze({
        version:VERSION,
        disposition:'non_route',
        routeId:null,
        reasonCode:routeability.reasonCode || 'routeability_non_route',
        scopeBypassed:false
      });
    }
    if (!arbitration?.routeId && !pureFallbackAccepted) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_unresolved',
        routeId:null,
        reasonCode:'pure_fallback_acceptance_not_confirmed',
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
      const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV03;
      if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.3 未加载');
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

  GuiJia.liuyaoSemanticFinalizationV02 = Object.freeze({ version:VERSION, finalize });
})(typeof window !== 'undefined' ? window : globalThis);
