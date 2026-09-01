(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';
  const VECTOR_SIZE = 512;

  const sigmoid = (value) => {
    if (value >= 0) return 1 / (1 + Math.exp(-value));
    const exp = Math.exp(value);
    return exp / (1 + exp);
  };
  const dot = (weights, vector) => {
    let total = 0;
    for (let index = 0; index < VECTOR_SIZE; index += 1) total += weights[index] * vector[index];
    return total;
  };
  const getArtifact = (artifact) => {
    if (!artifact || artifact.status !== 'frozen' || artifact.version !== '0.13-fallback-identity-v0.1-model-v0.1') {
      throw new Error('Frozen Fallback Identity v0.1 artifact required');
    }
    if (!artifact.calibration || !Number.isFinite(artifact.calibration.threshold)) throw new Error('Frozen Fallback Identity global threshold missing');
    return artifact;
  };
  const getHead = (artifact, routeId) => {
    const head = artifact.model?.heads?.[routeId];
    if (!head || !Array.isArray(head.weights) || head.weights.length !== VECTOR_SIZE || !Number.isFinite(head.bias)) {
      throw new Error(`Invalid Fallback Identity head: ${routeId}`);
    }
    if (Object.prototype.hasOwnProperty.call(head, 'threshold')) throw new Error(`Route-specific Fallback Identity threshold forbidden: ${routeId}`);
    return head;
  };

  function probability(artifactInput, routeId, vector) {
    const artifact = getArtifact(artifactInput);
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Fallback Identity vector size must be ${VECTOR_SIZE}`);
    const head = getHead(artifact, routeId);
    return sigmoid(dot(head.weights, vector) + head.bias);
  }

  function scoreHeadCandidates({ artifact:artifactInput, head, vector } = {}) {
    const artifact = getArtifact(artifactInput);
    if (!head?.top1?.id || !head?.top2?.id) throw new Error('Router Top1/Top2 required for Fallback Identity scoring');
    if (head.top1.id === head.top2.id) throw new Error('Router Top1/Top2 must be distinct');
    const probabilities = Object.freeze({
      [head.top1.id]:probability(artifact, head.top1.id, vector),
      [head.top2.id]:probability(artifact, head.top2.id, vector)
    });
    return Object.freeze({
      version:VERSION,
      threshold:artifact.calibration.threshold,
      probabilities
    });
  }

  GuiJia.liuyaoSemanticFallbackIdentityScorerV01 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    probability,
    scoreHeadCandidates
  });
})(typeof window !== 'undefined' ? window : globalThis);
