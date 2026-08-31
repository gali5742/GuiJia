const ARTIFACT_URL = new URL('../data/liuyao-semantic-fallback-acceptance-v0.1.json', import.meta.url);
let artifact = null;

const validate = (value) => {
  if (value?.version !== '0.13-fallback-acceptance-v0.1' || value?.status !== 'frozen_fresh_calibrated' || value?.scope !== 'liuyao_semantic_pure_fallback_acceptance') {
    throw new Error('Fallback Acceptance v0.1 artifact contract mismatch');
  }
  if (value.architecture?.ranker !== 'frozen_identity_v0.2_global_argmax_all_22_routes') {
    throw new Error('Fallback Acceptance ranker contract mismatch');
  }
  if (value.architecture?.gate !== 'routeability_probability_and_identity_top1_probability_two_global_threshold_conjunction') {
    throw new Error('Fallback Acceptance gate contract mismatch');
  }
  const thresholds = value.thresholds || {};
  if (!Number.isFinite(thresholds.routeabilityAcceptThreshold) || !Number.isFinite(thresholds.identityAcceptThreshold)) {
    throw new Error('Fallback Acceptance thresholds missing');
  }
  if (value.architecture?.routerTopKHardBoundary !== false || value.architecture?.marginThreshold != null || value.architecture?.routeSpecificThresholds !== false) {
    throw new Error('Fallback Acceptance architecture drift');
  }
  return value;
};

export async function loadFallbackAcceptanceV01() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load Fallback Acceptance v0.1: HTTP ${response.status}`);
  artifact = validate(await response.json());
  return artifact;
}

export async function decideFallbackAcceptanceV01({
  routeabilityProbability,
  identityTop1Route,
  identityTop1Probability,
  evidence=null,
  arbitration=null
} = {}) {
  const frozen = await loadFallbackAcceptanceV01();
  if (!Number.isFinite(routeabilityProbability) || !Number.isFinite(identityTop1Probability) || !identityTop1Route) {
    throw new Error('Fallback Acceptance scores and Identity Top1 route required');
  }
  const unsupportedTargets = Array.isArray(evidence?.unsupportedTargets) ? evidence.unsupportedTargets : [];
  if (unsupportedTargets.length || arbitration?.routeId) {
    return Object.freeze({
      version:'0.1-runtime',
      status:'not_applicable',
      routeId:null,
      reasonCode:unsupportedTargets.length ? 'explicit_unsupported_target' : 'arbitration_present',
      routeabilityProbability,
      identityTop1Probability
    });
  }
  const thresholds = frozen.thresholds;
  if (routeabilityProbability < thresholds.routeabilityAcceptThreshold) {
    return Object.freeze({
      version:'0.1-runtime',
      status:'route_unresolved',
      routeId:null,
      reasonCode:'fallback_routeability_below_accept_threshold',
      routeabilityProbability,
      identityTop1Probability
    });
  }
  if (identityTop1Probability < thresholds.identityAcceptThreshold) {
    return Object.freeze({
      version:'0.1-runtime',
      status:'route_unresolved',
      routeId:null,
      reasonCode:'fallback_identity_below_accept_threshold',
      routeabilityProbability,
      identityTop1Probability
    });
  }
  return Object.freeze({
    version:'0.1-runtime',
    status:'selected',
    routeId:identityTop1Route,
    reasonCode:'fallback_global_identity_accepted',
    routeabilityProbability,
    identityTop1Probability
  });
}

export const semanticFallbackAcceptanceFrozenV01 = Object.freeze({
  version:'0.1',
  loadFallbackAcceptanceV01,
  decideFallbackAcceptanceV01
});
