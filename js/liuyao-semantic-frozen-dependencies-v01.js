import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const ARTIFACT_URL = new URL('../data/liuyao-semantic-frozen-dependencies-v0.1.json', import.meta.url);
let artifact = null;
let extractor = null;

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / Math.max(total, 1e-12));
};
const tensorToVector = (tensor, expectedSize) => {
  const dims = tensor?.dims || [];
  const hidden = dims[dims.length - 1] || expectedSize;
  if (hidden !== expectedSize) throw new Error(`Frozen encoder vector size mismatch: ${hidden} != ${expectedSize}`);
  const raw = tensor?.data || [];
  const vector = new Float32Array(expectedSize);
  for (let i = 0; i < expectedSize; i += 1) vector[i] = Number(raw[i] || 0);
  return vector;
};

const validateArtifact = (value) => {
  if (value?.version !== '0.1' || value?.status !== 'frozen' || value?.scope !== 'liuyao_semantic_v013_dependencies') throw new Error('Frozen dependency manifest contract mismatch');
  if (value.encoder?.vectorSize !== 512 || value.encoder?.dtype !== 'q8' || value.encoder?.pooling !== 'mean' || value.encoder?.normalize !== true) throw new Error('Frozen encoder contract mismatch');
  if (!value.encoder?.revision || value.router?.routeOrder?.length !== 22) throw new Error('Frozen router inventory/revision missing');
  if (value.router?.routeHead?.weights?.length !== 22 || value.router.routeHead.weights.some((row) => row.length !== 512)) throw new Error('Frozen router weight shape mismatch');
  if (value.router?.routeHead?.biases?.length !== 22) throw new Error('Frozen router bias shape mismatch');
  if (value.scopeGate?.gate?.weights?.length !== 512 || !Number.isFinite(value.scopeGate?.gate?.bias) || !Number.isFinite(value.scopeGate?.originalThreshold)) throw new Error('Frozen scope gate shape mismatch');
  if (value.semanticStackPolicy?.hardVetoCutoff !== 0.4196) throw new Error('Frozen hard-veto cutoff mismatch');
  return value;
};

export async function loadFrozenSemanticDependencies() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load frozen semantic dependencies: HTTP ${response.status}`);
  artifact = validateArtifact(await response.json());
  return artifact;
}

export async function loadFrozenEncoder(progressCallback) {
  const frozen = await loadFrozenSemanticDependencies();
  if (!extractor) {
    extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
      dtype:frozen.encoder.dtype,
      revision:frozen.encoder.revision,
      progress_callback:progressCallback
    });
  }
  return frozen.encoder;
}

export async function embedFrozenText(text) {
  const frozen = await loadFrozenSemanticDependencies();
  await loadFrozenEncoder();
  const output = await extractor(String(text || ''), { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
  return tensorToVector(output, frozen.encoder.vectorSize);
}

export async function classifyFrozenRouterVector(vector) {
  const frozen = await loadFrozenSemanticDependencies();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Frozen router vector size mismatch');
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] })).sort((a, b) => b.score - a.score);
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score, scores };
}

export async function scoreFrozenScopeVector(vector) {
  const frozen = await loadFrozenSemanticDependencies();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Frozen scope vector size mismatch');
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias);
  return {
    probability,
    originalThreshold:frozen.scopeGate.originalThreshold,
    originalAccepted:probability >= frozen.scopeGate.originalThreshold,
    hardVetoCutoff:frozen.semanticStackPolicy.hardVetoCutoff,
    hardVeto:probability < frozen.semanticStackPolicy.hardVetoCutoff
  };
}

export const semanticFrozenDependenciesV01 = Object.freeze({
  version:'0.1',
  loadFrozenSemanticDependencies,
  loadFrozenEncoder,
  embedFrozenText,
  classifyFrozenRouterVector,
  scoreFrozenScopeVector
});
