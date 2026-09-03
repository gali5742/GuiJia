(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.5-execution-v0.1';
  const FROZEN_THRESHOLD = 0.7678148573595883;
  const BASE_MODEL_SHA256 = '5ff8a892463c1953c6f3fb86fced25c992b55aeb5e07e9e88de97acf5d06354d';
  const THRESHOLD_ARTIFACT_SHA256 = '20f80cf0e4437e4d52db992b25af1c58e310a3ef9538f72a95afb4c3eda7c039';

  function decide({ probability, threshold=FROZEN_THRESHOLD, arbitration=null, evidence=null } = {}) {
    if (!Number.isFinite(probability) || !Number.isFinite(threshold)) {
      throw new Error('Routeability v0.5 execution probability/threshold required');
    }
    if (Math.abs(threshold - FROZEN_THRESHOLD) > Number.EPSILON) {
      throw new Error(`Routeability v0.5 execution threshold drift: ${threshold}`);
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
        reasonCode:'frozen_v02_execution_score_accept',
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
      reasonCode:'frozen_v02_execution_score_reject',
      probability,
      threshold:FROZEN_THRESHOLD,
      unsupportedTargets:Object.freeze([])
    });
  }

  GuiJia.liuyaoSemanticRouteabilityV05ExecutionV01 = Object.freeze({
    version:VERSION,
    baseModel:'routeability_v0.2_execution_v0.1',
    baseModelSha256:BASE_MODEL_SHA256,
    thresholdPolicy:'routeability_v0.3_execution_v0.1_locked_threshold',
    thresholdArtifactSha256:THRESHOLD_ARTIFACT_SHA256,
    threshold:FROZEN_THRESHOLD,
    fallbackBelowThresholdRescue:false,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
