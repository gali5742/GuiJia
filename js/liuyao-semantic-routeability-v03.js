(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.3-dev';

  function decide({ probability, threshold, arbitration=null, evidence=null } = {}) {
    if (!Number.isFinite(probability) || !Number.isFinite(threshold)) throw new Error('Routeability v0.3 probability/threshold required');
    const unsupportedTargets = Array.isArray(evidence?.unsupportedTargets) ? evidence.unsupportedTargets : [];
    if (unsupportedTargets.length) {
      return Object.freeze({ version:VERSION, disposition:'non_route', reasonCode:'explicit_unsupported_target', probability, threshold, unsupportedTargets:Object.freeze([...unsupportedTargets]) });
    }
    if (probability >= threshold) {
      return Object.freeze({ version:VERSION, disposition:'route_known', reasonCode:'frozen_v02_score_accept', probability, threshold, unsupportedTargets:Object.freeze([]) });
    }
    if (arbitration?.strength === 'strong' && arbitration.routeId) {
      const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV02;
      if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.2 未加载');
      const checked = compatibility.evaluate(arbitration.routeId, evidence || {});
      if (checked.status === 'confirmed') {
        return Object.freeze({ version:VERSION, disposition:'route_known', reasonCode:'confirmed_strong_rescue', probability, threshold, rescuedRoute:arbitration.routeId, unsupportedTargets:Object.freeze([]) });
      }
    }
    return Object.freeze({ version:VERSION, disposition:'non_route', reasonCode:'frozen_v02_score_reject', probability, threshold, unsupportedTargets:Object.freeze([]) });
  }

  GuiJia.liuyaoSemanticRouteabilityV03 = Object.freeze({ version:VERSION, baseModel:'frozen_v0.2', decide });
})(typeof window !== 'undefined' ? window : globalThis);
