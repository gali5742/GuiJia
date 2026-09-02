(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-frozen-training-contract';
  const VECTOR_SIZE = 512;
  const ELIGIBLE = 'eligible_divination_outcome_or_decision';
  const INELIGIBLE = 'ineligible_information_or_procedure';
  const LABELS = Object.freeze([ELIGIBLE, INELIGIBLE]);
  const DEFAULT_HYPERPARAMETERS = Object.freeze({
    epochs:360,
    learningRate:0.42,
    l2:0.0015
  });

  const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, '');
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
  const validateLabel = (label) => {
    if (!LABELS.includes(label)) throw new Error(`Unknown Semantic Act label: ${label}`);
    return label;
  };
  const validateHyperparameters = (options = {}) => {
    const merged = {
      epochs:options.epochs ?? DEFAULT_HYPERPARAMETERS.epochs,
      learningRate:options.learningRate ?? DEFAULT_HYPERPARAMETERS.learningRate,
      l2:options.l2 ?? DEFAULT_HYPERPARAMETERS.l2
    };
    if (
      merged.epochs !== DEFAULT_HYPERPARAMETERS.epochs ||
      merged.learningRate !== DEFAULT_HYPERPARAMETERS.learningRate ||
      merged.l2 !== DEFAULT_HYPERPARAMETERS.l2
    ) throw new Error('Semantic Act v0.1 training hyperparameter drift');
    return merged;
  };

  function deduplicateRows(rows) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Semantic Act training rows required');
    const byText = new Map();
    for (const raw of rows) {
      const text = String(raw?.text || '').trim();
      const normalized = normalizeText(text);
      if (!normalized) throw new Error('Semantic Act training text required');
      const label = validateLabel(raw?.label);
      const existing = byText.get(normalized);
      if (existing && existing.label !== label) throw new Error(`Conflicting Semantic Act labels for normalized text: ${text}`);
      if (!existing) byText.set(normalized, Object.freeze({ ...raw, text, label }));
    }
    return Object.freeze([...byText.values()]);
  }

  function train(rows, vectors, options = {}) {
    const hyperparameters = validateHyperparameters(options);
    const cleanRows = deduplicateRows(rows);
    if (!Array.isArray(vectors) || vectors.length !== cleanRows.length || cleanRows.length !== rows.length) {
      throw new Error('Semantic Act vectors must be assembled after deterministic text deduplication');
    }
    for (const vector of vectors) if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Semantic Act vector size must be ${VECTOR_SIZE}`);

    const positiveCount = cleanRows.filter((row) => row.label === ELIGIBLE).length;
    const negativeCount = cleanRows.filter((row) => row.label === INELIGIBLE).length;
    if (!positiveCount || !negativeCount) throw new Error('Semantic Act training requires both labels');
    const positiveWeight = 0.5 / positiveCount;
    const negativeWeight = 0.5 / negativeCount;
    const weights = new Float32Array(VECTOR_SIZE);
    const gradient = new Float64Array(VECTOR_SIZE);
    let bias = 0;

    for (let epoch = 0; epoch < hyperparameters.epochs; epoch += 1) {
      gradient.fill(0);
      let gradBias = 0;
      for (let rowIndex = 0; rowIndex < cleanRows.length; rowIndex += 1) {
        const target = cleanRows[rowIndex].label === ELIGIBLE ? 1 : 0;
        const sampleWeight = target ? positiveWeight : negativeWeight;
        const error = (sigmoid(dot(weights, vectors[rowIndex]) + bias) - target) * sampleWeight;
        gradBias += error;
        for (let dimension = 0; dimension < VECTOR_SIZE; dimension += 1) {
          gradient[dimension] += error * vectors[rowIndex][dimension];
        }
      }
      const learningRate = hyperparameters.learningRate / (1 + epoch * 0.01);
      for (let dimension = 0; dimension < VECTOR_SIZE; dimension += 1) {
        weights[dimension] -= learningRate * (gradient[dimension] + hyperparameters.l2 * weights[dimension]);
      }
      bias -= learningRate * gradBias;
    }

    return Object.freeze({
      version:VERSION,
      vectorSize:VECTOR_SIZE,
      labels:LABELS,
      positiveLabel:ELIGIBLE,
      weights,
      bias,
      positiveCount,
      negativeCount,
      hyperparameters:DEFAULT_HYPERPARAMETERS
    });
  }

  function probability(model, vector) {
    if (!model?.weights || model.weights.length !== VECTOR_SIZE || !Number.isFinite(model.bias)) throw new Error('Invalid Semantic Act model');
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Semantic Act vector size must be ${VECTOR_SIZE}`);
    return sigmoid(dot(model.weights, vector) + model.bias);
  }

  GuiJia.liuyaoSemanticActEligibilityModelV01 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    labels:LABELS,
    positiveLabel:ELIGIBLE,
    negativeLabel:INELIGIBLE,
    hyperparameters:DEFAULT_HYPERPARAMETERS,
    classBalancing:Object.freeze({ positiveTotalWeight:0.5, negativeTotalWeight:0.5 }),
    biasRegularized:false,
    weightRegularization:'l2',
    normalizeText,
    deduplicateRows,
    train,
    probability
  });
})(typeof window !== 'undefined' ? window : globalThis);
