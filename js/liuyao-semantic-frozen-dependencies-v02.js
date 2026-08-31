import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

env.allowLocalModels = false;
env.useBrowserCache = true;

const ARTIFACT_URL = new URL('../data/liuyao-semantic-frozen-dependencies-v0.2.json', import.meta.url);
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
  if (hidden !== expectedSize) throw new Error(`Corrected encoder vector size mismatch: ${hidden} != ${expectedSize}`);
  const raw = tensor?.data || [];
  const vector = new Float32Array(expectedSize);
  for (let i = 0; i < expectedSize; i += 1) vector[i] = Number(raw[i] || 0);
  return vector;
};

const validateArtifact = (value) => {
  if (value?.version !== '0.2' || value?.status !== 'frozen_representation_corrected' || value?.scope !== 'liuyao_semantic_v013_dependencies') {
    throw new Error('Corrected semantic dependency manifest contract mismatch');
  }
  if (value.encoder?.vectorSize !== 512 || value.encoder?.dtype !== 'q8' || value.encoder?.pooling !== 'mean' || value.encoder?.normalize !== true) {
    throw new Error('Corrected encoder contract mismatch');
  }
  if (value.encoder?.textsPerEncoderCall !== 1 || value.representationCorrection?.textsPerEncoderCall !== 1) {
    throw new Error('Corrected semantic dependencies must use canonical single-text embedding');
  }
  if (!value.encoder?.revision || value.router?.routeOrder?.length !== 22) throw new Error('Corrected router inventory/revision missing');
  if (value.router?.routeHead?.weights?.length !== 22 || value.router.routeHead.weights.some((row) => row.length !== 512)) throw new Error('Corrected router weight shape mismatch');
  if (value.router?.routeHead?.biases?.length !== 22) throw new Error('Corrected router bias shape mismatch');
  if (value.scopeGate?.gate?.weights?.length !== 512 || !Number.isFinite(value.scopeGate?.gate?.bias) || !Number.isFinite(value.scopeGate?.originalThreshold)) throw new Error('Corrected scope gate shape mismatch');
  if (value.semanticStackPolicy?.legacyHardVetoTransferStatus !== 'requires_candidate_revalidation_before_use') throw new Error('Legacy hard veto transfer status drift');
  return value;
};

export async function loadCorrectedSemanticDependenciesV02() {
  if (artifact) return artifact;
  const response = await fetch(ARTIFACT_URL, { cache:'no-cache' });
  if (!response.ok) throw new Error(`Unable to load corrected semantic dependencies: HTTP ${response.status}`);
  artifact = validateArtifact(await response.json());
  return artifact;
}

export async function loadCorrectedEncoderV02(progressCallback) {
  const frozen = await loadCorrectedSemanticDependenciesV02();
  if (!extractor) {
    extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
      dtype:frozen.encoder.dtype,
      revision:frozen.encoder.revision,
      progress_callback:progressCallback
    });
  }
  return frozen.encoder;
}

export async function embedCorrectedTextV02(text) {
  const frozen = await loadCorrectedSemanticDependenciesV02();
  await loadCorrectedEncoderV02();
  const output = await extractor(String(text || ''), { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
  return tensorToVector(output, frozen.encoder.vectorSize);
}

export async function classifyCorrectedRouterVectorV02(vector) {
  const frozen = await loadCorrectedSemanticDependenciesV02();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Corrected router vector size mismatch');
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] })).sort((a, b) => b.score - a.score);
  return Object.freeze({ top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score, scores });
}

export async function scoreCorrectedScopeVectorV02(vector) {
  const frozen = await loadCorrectedSemanticDependenciesV02();
  if (!vector || vector.length !== frozen.encoder.vectorSize) throw new Error('Corrected scope vector size mismatch');
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias);
  const legacyCutoff = frozen.semanticStackPolicy.legacyHardVetoCutoff;
  return Object.freeze({
    probability,
    originalThreshold:frozen.scopeGate.originalThreshold,
    originalAccepted:probability >= frozen.scopeGate.originalThreshold,
    legacyHardVetoCutoff:legacyCutoff,
    legacyHardVetoWouldFire:probability < legacyCutoff,
    legacyHardVetoUsable:false,
    legacyHardVetoTransferStatus:frozen.semanticStackPolicy.legacyHardVetoTransferStatus
  });
}

export const semanticFrozenDependenciesV02 = Object.freeze({
  version:'0.2',
  loadCorrectedSemanticDependenciesV02,
  loadCorrectedEncoderV02,
  embedCorrectedTextV02,
  classifyCorrectedRouterVectorV02,
  scoreCorrectedScopeVectorV02
});
