(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.6-dev';

  function decide({ probability, modelThreshold, arbitration=null, evidence=null } = {}) {
    if (!Number.isFinite(probability) || !Number.isFinite(modelThreshold)) {
      throw new Error('Routeability v0.6 probability/modelThreshold required');
    }
    const unsupportedTargets = Array.isArray(evidence?.unsupportedTargets) ? evidence.unsupportedTargets : [];
    if (unsupportedTargets.length) {
      return Object.freeze({
        version:VERSION,
        disposition:'non_route',
        reasonCode:'explicit_unsupported_target',
        probability,
        modelThreshold,
        unsupportedTargets:Object.freeze([...unsupportedTargets])
      });
    }
    if (probability >= modelThreshold) {
      return Object.freeze({
        version:VERSION,
        disposition:'route_known',
        reasonCode:'corrected_model_score_accept',
        probability,
        modelThreshold,
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
          modelThreshold,
          rescuedRoute:arbitration.routeId,
          rescueStrength:arbitration.strength,
          unsupportedTargets:Object.freeze([])
        });
      }
    }
    return Object.freeze({
      version:VERSION,
      disposition:'non_route',
      reasonCode:'corrected_model_score_reject',
      probability,
      modelThreshold,
      unsupportedTargets:Object.freeze([])
    });
  }

  GuiJia.liuyaoSemanticRouteabilityV06 = Object.freeze({
    version:VERSION,
    thresholdSource:'corrected_routeability_v0.4_artifact',
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
