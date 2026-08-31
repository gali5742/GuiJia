const ARTIFACT_URL = new URL('../data/liuyao-semantic-routeability-v0.4.json', import.meta.url);
let artifact = null;

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));

const validate = (value) => {
  if (value?.version !== '0.4' || value?.status !== 'frozen_representation_corrected' || value?.scope !== 'liuyao_semantic_routeability_v04') {
    throw new Error('Corrected Routeability v0.4 contract mismatch');
  }
  if (value.encoder?.vectorSize !== 512 || value.encoder?.textsPerEncoderCall !== 1) throw new Error('Corrected Routeability encoder contract mismatch');
  if (!Array.isArray(value.model?.weights) || value.model.weights.length !== 512 || !Number.isFinite(value.model?.bias)) throw new Error('Corrected Routeability model shape mismatch');
  if (!Number.isFinite(value.calibration?.threshold)) throw new Error('Corrected Routeability threshold missing');
  if (value.calibration?.evidenceStatus !== 'representation_correction_reprocessed_not_fresh') throw new Error('Corrected Routeability calibration evidence status drift');
  return value;
};

export async function loadCorrectedRouteabilityV04() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load corrected Routeability v0.4: HTTP ${response.status}`);
  artifact = validate(await response.json());
  return artifact;
}

export async function scoreCorrectedRouteabilityVectorV04(vector) {
  const frozen = await loadCorrectedRouteabilityV04();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Corrected Routeability vector size mismatch');
  const probability = sigmoid(dot(frozen.model.weights, vector) + frozen.model.bias);
  return Object.freeze({ probability, threshold:frozen.calibration.threshold, modelAccepted:probability >= frozen.calibration.threshold });
}

export const semanticRouteabilityFrozenV04 = Object.freeze({
  version:'0.4',
  loadCorrectedRouteabilityV04,
  scoreCorrectedRouteabilityVectorV04
});
