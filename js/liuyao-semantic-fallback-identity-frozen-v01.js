const ARTIFACT_URL = new URL('../data/liuyao-semantic-fallback-identity-v0.1.json', import.meta.url);
let artifact = null;

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));

const validate = (value) => {
  if (value?.version !== '0.1' || value?.status !== 'frozen' || value?.scope !== 'liuyao_semantic_fallback_identity_v0.1') {
    throw new Error('Frozen Fallback Identity v0.1 contract mismatch');
  }
  if (value.encoder?.vectorSize !== 512 || value.encoder?.revision !== '75c43b069aac4d136ba6bc1122f995fedcfd2781') {
    throw new Error('Frozen Fallback Identity encoder mismatch');
  }
  if (!Array.isArray(value.routeOrder) || value.routeOrder.length !== 22) throw new Error('Frozen Fallback Identity route inventory mismatch');
  if (value.calibration?.thresholdPolicy !== 'one_global_threshold_for_all_22_heads' || !Number.isFinite(value.calibration?.threshold)) {
    throw new Error('Frozen Fallback Identity threshold contract mismatch');
  }
  if (value.calibration?.routeSpecificThresholds !== false) throw new Error('Frozen Fallback Identity route-specific threshold drift');
  for (const routeId of value.routeOrder) {
    const head = value.model?.heads?.[routeId];
    if (!head?.weights || head.weights.length !== 512 || !Number.isFinite(head.bias)) throw new Error(`Frozen Fallback Identity head mismatch: ${routeId}`);
  }
  return value;
};

export async function loadFrozenFallbackIdentityV01() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load frozen Fallback Identity v0.1: HTTP ${response.status}`);
  artifact = validate(await response.json());
  return artifact;
}

export async function scoreFrozenFallbackIdentityRoute(vector, routeId) {
  const frozen = await loadFrozenFallbackIdentityV01();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Frozen Fallback Identity vector size mismatch');
  const head = frozen.model.heads?.[routeId];
  if (!head) throw new Error(`Frozen Fallback Identity route not found: ${routeId}`);
  const probability = sigmoid(dot(head.weights, vector) + head.bias);
  return Object.freeze({
    routeId,
    probability,
    threshold:frozen.calibration.threshold,
    admitted:probability >= frozen.calibration.threshold
  });
}

export async function scoreFrozenFallbackIdentityCandidates(vector, routeIds) {
  const frozen = await loadFrozenFallbackIdentityV01();
  const unique = [...new Set(routeIds || [])];
  const result = {};
  for (const routeId of unique) {
    if (!frozen.routeOrder.includes(routeId)) throw new Error(`Frozen Fallback Identity route not in inventory: ${routeId}`);
    result[routeId] = (await scoreFrozenFallbackIdentityRoute(vector, routeId)).probability;
  }
  return Object.freeze(result);
}

export const semanticFallbackIdentityFrozenV01 = Object.freeze({
  version:'0.1',
  loadFrozenFallbackIdentityV01,
  scoreFrozenFallbackIdentityRoute,
  scoreFrozenFallbackIdentityCandidates
});
