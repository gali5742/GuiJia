(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.4-dev';

  function decide({ probability, threshold, arbitration=null, evidence=null } = {}) {
    if (!Number.isFinite(probability) || !Number.isFinite(threshold)) {
      throw new Error('Routeability v0.4 probability/threshold required');
    }

    const unsupportedTargets = Array.isArray(evidence?.unsupportedTargets)
      ? evidence.unsupportedTargets
      : [];
    if (unsupportedTargets.length) {
      return Object.freeze({
        version:VERSION,
        disposition:'non_route',
        reasonCode:'explicit_unsupported_target',
        probability,
        threshold,
        unsupportedTargets:Object.freeze([...unsupportedTargets])
      });
    }

    if (probability >= threshold) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_known',
        reasonCode:'frozen_v02_score_accept',
        probability,
        threshold,
        unsupportedTargets:Object.freeze([])
      });
    }

    if (arbitration?.routeId && (arbitration.strength === 'strong' || arbitration.strength === 'support')) {
      const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV02;
      if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.2 未加载');
      const checked = compatibility.evaluate(arbitration.routeId, evidence || {});
      if (checked.status === 'confirmed') {
        return Object.freeze({
          version:VERSION,
          disposition:'route_known',
          reasonCode:arbitration.strength === 'strong' ? 'confirmed_strong_rescue' : 'confirmed_support_rescue',
          probability,
          threshold,
          rescuedRoute:arbitration.routeId,
          rescueStrength:arbitration.strength,
          unsupportedTargets:Object.freeze([])
        });
      }
    }

    return Object.freeze({
      version:VERSION,
      disposition:'non_route',
      reasonCode:'frozen_v02_score_reject',
      probability,
      threshold,
      unsupportedTargets:Object.freeze([])
    });
  }

  GuiJia.liuyaoSemanticRouteabilityV04 = Object.freeze({
    version:VERSION,
    baseModel:'frozen_v0.2',
    thresholdPolicy:'frozen_v0.3_threshold',
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
