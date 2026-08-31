(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.5-dev';
  const FROZEN_THRESHOLD = 0.7675678218564946;

  function decide({ probability, threshold=FROZEN_THRESHOLD, arbitration=null, evidence=null } = {}) {
    if (!Number.isFinite(probability) || !Number.isFinite(threshold)) {
      throw new Error('Routeability v0.5 probability/threshold required');
    }
    if (Math.abs(threshold - FROZEN_THRESHOLD) > Number.EPSILON) {
      throw new Error(`Routeability v0.5 threshold drift: ${threshold}`);
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
        threshold:FROZEN_THRESHOLD,
        unsupportedTargets:Object.freeze([...unsupportedTargets])
      });
    }

    if (probability >= FROZEN_THRESHOLD) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_known',
        reasonCode:'frozen_v02_score_accept',
        probability,
        threshold:FROZEN_THRESHOLD,
        unsupportedTargets:Object.freeze([])
      });
    }

    if (arbitration?.routeId && (arbitration.strength === 'strong' || arbitration.strength === 'support')) {
      const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV03;
      if (!compatibility?.evaluate) throw new Error('Route Compatibility v0.3 未加载');
      const checked = compatibility.evaluate(arbitration.routeId, evidence || {});
      if (checked.status === 'confirmed') {
        return Object.freeze({
          version:VERSION,
          disposition:'route_known',
          reasonCode:arbitration.strength === 'strong' ? 'confirmed_strong_rescue' : 'confirmed_support_rescue',
          probability,
          threshold:FROZEN_THRESHOLD,
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
      threshold:FROZEN_THRESHOLD,
      unsupportedTargets:Object.freeze([])
    });
  }

  GuiJia.liuyaoSemanticRouteabilityV05 = Object.freeze({
    version:VERSION,
    baseModel:'frozen_v0.2',
    thresholdPolicy:'frozen_v0.3_threshold',
    threshold:FROZEN_THRESHOLD,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
