const ARTIFACT_URL = new URL('../data/liuyao-semantic-routeability-v0.2.json', import.meta.url);
let artifact = null;

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));

const validate = (value) => {
  if (value?.version !== '0.2' || value?.status !== 'frozen' || value?.scope !== 'liuyao_semantic_routeability_v02') throw new Error('Frozen Routeability v0.2 contract mismatch');
  if (value.encoder?.vectorSize !== 512 || value.encoder?.revision !== '75c43b069aac4d136ba6bc1122f995fedcfd2781') throw new Error('Frozen Routeability encoder mismatch');
  if (value.model?.weights?.length !== 512 || !Number.isFinite(value.model?.bias)) throw new Error('Frozen Routeability model shape mismatch');
  if (!Number.isFinite(value.calibration?.threshold) || value.calibration?.falseActivation > 0.05 + 1e-12) throw new Error('Frozen Routeability calibration mismatch');
  return value;
};

export async function loadFrozenRouteabilityV02() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load frozen Routeability v0.2: HTTP ${response.status}`);
  artifact = validate(await response.json());
  return artifact;
}

export async function scoreFrozenRouteabilityVector(vector) {
  const frozen = await loadFrozenRouteabilityV02();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Frozen Routeability vector size mismatch');
  const probability = sigmoid(dot(frozen.model.weights, vector) + frozen.model.bias);
  return Object.freeze({
    probability,
    threshold:frozen.calibration.threshold,
    disposition:probability >= frozen.calibration.threshold ? 'route_known' : 'non_route'
  });
}

export const semanticRouteabilityFrozenV02 = Object.freeze({
  version:'0.2',
  loadFrozenRouteabilityV02,
  scoreFrozenRouteabilityVector
});
