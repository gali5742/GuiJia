(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1';
  const VECTOR_SIZE = 512;
  const MODEL_VERSION = '0.13-candidate-v0.4-semantic-act-eligibility-v0.1-model-v0.1';
  const MODEL_STATUS = 'locked_after_fresh_calibration';
  const POSITIVE_LABEL = 'eligible_divination_outcome_or_decision';
  const NEGATIVE_LABEL = 'ineligible_information_or_procedure';

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
  const validateArtifact = (artifact) => {
    if (!artifact || artifact.version !== MODEL_VERSION || artifact.status !== MODEL_STATUS) {
      throw new Error('Locked Semantic Act Eligibility v0.1 model required');
    }
    if (artifact.positiveLabel !== POSITIVE_LABEL || artifact.negativeLabel !== NEGATIVE_LABEL) {
      throw new Error('Semantic Act Eligibility label contract drift');
    }
    if (artifact.vectorSize !== VECTOR_SIZE || !Array.isArray(artifact.model?.weights) || artifact.model.weights.length !== VECTOR_SIZE || !Number.isFinite(artifact.model?.bias)) {
      throw new Error('Semantic Act Eligibility model shape invalid');
    }
    if (!Number.isFinite(artifact.threshold) || artifact.threshold < 0 || artifact.threshold > 1) {
      throw new Error('Semantic Act Eligibility global threshold missing/invalid');
    }
    return artifact;
  };

  function probability(artifactInput, vector) {
    const artifact = validateArtifact(artifactInput);
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Semantic Act Eligibility vector size must be ${VECTOR_SIZE}`);
    return sigmoid(dot(artifact.model.weights, vector) + artifact.model.bias);
  }

  function decide({ artifact:artifactInput, vector } = {}) {
    const artifact = validateArtifact(artifactInput);
    const p = probability(artifact, vector);
    const eligible = p >= artifact.threshold;
    return Object.freeze({
      version:VERSION,
      status:eligible ? 'eligible' : 'ineligible',
      label:eligible ? POSITIVE_LABEL : NEGATIVE_LABEL,
      probability:p,
      threshold:artifact.threshold,
      routeId:null,
      reasonCode:eligible ? 'semantic_act_eligible' : 'semantic_act_ineligible_information_or_procedure'
    });
  }

  GuiJia.liuyaoSemanticActEligibilityV01 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    positiveLabel:POSITIVE_LABEL,
    negativeLabel:NEGATIVE_LABEL,
    selectsRoute:false,
    probability,
    decide
  });
})(typeof window !== 'undefined' ? window : globalThis);
