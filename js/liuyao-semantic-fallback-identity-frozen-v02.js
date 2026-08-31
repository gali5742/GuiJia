const ARTIFACT_URL = new URL('../data/liuyao-semantic-fallback-identity-v0.2.json', import.meta.url);
let artifact = null;

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));

const validate = (value) => {
  if (value?.version !== '0.2' || value?.status !== 'frozen_representation_corrected' || value?.scope !== 'liuyao_semantic_fallback_identity_v0.2') {
    throw new Error('Corrected Fallback Identity v0.2 contract mismatch');
  }
  if (value.encoder?.vectorSize !== 512 || value.encoder?.textsPerEncoderCall !== 1) {
    throw new Error('Corrected Fallback Identity encoder contract mismatch');
  }
  if (!Array.isArray(value.routeOrder) || value.routeOrder.length !== 22) {
    throw new Error('Corrected Fallback Identity route inventory mismatch');
  }
  for (const routeId of value.routeOrder) {
    const head = value.model?.heads?.[routeId];
    if (!Array.isArray(head?.weights) || head.weights.length !== 512 || !Number.isFinite(head?.bias)) {
      throw new Error(`Corrected Fallback Identity head mismatch: ${routeId}`);
    }
  }
  return value;
};

export async function loadCorrectedFallbackIdentityV02() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load corrected Fallback Identity v0.2: HTTP ${response.status}`);
  artifact = validate(await response.json());
  return artifact;
}

export async function rankCorrectedFallbackIdentityVectorV02(vector) {
  const frozen = await loadCorrectedFallbackIdentityV02();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Corrected Fallback Identity vector size mismatch');
  const ranking = frozen.routeOrder.map((routeId) => {
    const head = frozen.model.heads[routeId];
    return Object.freeze({ routeId, probability:sigmoid(dot(head.weights, vector) + head.bias) });
  }).sort((a, b) => b.probability - a.probability || a.routeId.localeCompare(b.routeId));
  return Object.freeze({
    top1:ranking[0],
    top2:ranking[1],
    ranking:Object.freeze(ranking)
  });
}

export const semanticFallbackIdentityFrozenV02 = Object.freeze({
  version:'0.2',
  loadCorrectedFallbackIdentityV02,
  rankCorrectedFallbackIdentityVectorV02
});
