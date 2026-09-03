(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const VECTOR_SIZE = 512;
  const ROUTE_IDS = Object.freeze([
    'financial_fortune',
    'business_operation',
    'commercial_transaction',
    'inventory_purchase',
    'inventory_sale',
    'borrow_money',
    'lend_money',
    'debt_collection',
    'debt_repayment',
    'partnership',
    'investment_profit',
    'investment_liquidation',
    'investment_suitability',
    'investment_position_decision',
    'investment_price_trend',
    'income_salary',
    'income_bonus',
    'receive_item',
    'item_purchase',
    'relationship_development',
    'marriage_match',
    'marital_relationship'
  ]);

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
  const validateModel = (artifact) => {
    if (
      !artifact ||
      artifact.version !== '0.13-candidate-v0.4-fallback-identity-v0.2-model-v0.1' ||
      artifact.status !== 'weights_locked_before_threshold_calibration'
    ) {
      throw new Error('Weights-locked Fallback Identity v0.2 artifact required');
    }
    if (artifact.globalThreshold !== null || artifact.thresholdSelected !== false) {
      throw new Error('Fallback Identity v0.2 weights artifact must remain threshold-free');
    }
    if (!Array.isArray(artifact.algorithm?.routeOrder) || artifact.algorithm.routeOrder.length !== ROUTE_IDS.length) {
      throw new Error('Fallback Identity v0.2 route order missing');
    }
    if (artifact.algorithm.routeOrder.some((routeId, index) => routeId !== ROUTE_IDS[index])) {
      throw new Error('Fallback Identity v0.2 route order drift');
    }
    if (!artifact.heads || Object.keys(artifact.heads).length !== ROUTE_IDS.length) {
      throw new Error('Fallback Identity v0.2 must contain exactly 22 heads');
    }
    return artifact;
  };
  const validateThresholdLock = (lock) => {
    if (!lock || lock.status !== 'global_threshold_locked_after_weights' || lock.thresholdSelected !== true) {
      throw new Error('Locked Fallback Identity v0.2 global threshold required');
    }
    if (!Number.isFinite(lock.globalThreshold) || lock.globalThreshold < 0 || lock.globalThreshold > 1) {
      throw new Error('Fallback Identity v0.2 global threshold must be within [0,1]');
    }
    if (lock.routeCount !== ROUTE_IDS.length || lock.vectorSize !== VECTOR_SIZE || lock.scoreAll22Heads !== true) {
      throw new Error('Fallback Identity v0.2 threshold lock architecture drift');
    }
    if (lock.routeSpecificThresholds !== false) {
      throw new Error('Route-specific Fallback Identity v0.2 thresholds are forbidden');
    }
    return lock;
  };
  const getHead = (artifact, routeId) => {
    const head = artifact.heads?.[routeId];
    if (!head || head.routeId !== routeId || !Array.isArray(head.weights) || head.weights.length !== VECTOR_SIZE || !Number.isFinite(head.bias)) {
      throw new Error(`Invalid Fallback Identity v0.2 head: ${routeId}`);
    }
    if (Object.prototype.hasOwnProperty.call(head, 'threshold')) {
      throw new Error(`Route-specific Fallback Identity v0.2 threshold forbidden: ${routeId}`);
    }
    return head;
  };

  function probability(artifactInput, routeId, vector) {
    const artifact = validateModel(artifactInput);
    if (!ROUTE_IDS.includes(routeId)) throw new Error(`Unknown Fallback Identity v0.2 route: ${routeId}`);
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Fallback Identity v0.2 vector size must be ${VECTOR_SIZE}`);
    const head = getHead(artifact, routeId);
    return sigmoid(dot(head.weights, vector) + head.bias);
  }

  function scoreAll({ artifact:artifactInput, thresholdLock:thresholdLockInput, vector } = {}) {
    const artifact = validateModel(artifactInput);
    const thresholdLock = validateThresholdLock(thresholdLockInput);
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Fallback Identity v0.2 vector size must be ${VECTOR_SIZE}`);
    const probabilities = {};
    for (const routeId of ROUTE_IDS) probabilities[routeId] = probability(artifact, routeId, vector);
    return Object.freeze({
      version:VERSION,
      candidateUniverse:'all_current_22_routes',
      threshold:thresholdLock.globalThreshold,
      probabilities:Object.freeze(probabilities)
    });
  }

  GuiJia.liuyaoSemanticFallbackIdentityScorerV02 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    routeIds:ROUTE_IDS,
    probability,
    scoreAll
  });
})(typeof window !== 'undefined' ? window : globalThis);
