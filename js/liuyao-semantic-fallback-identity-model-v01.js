(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-frozen-training-contract';
  const VECTOR_SIZE = 512;
  const DEFAULT_HYPERPARAMETERS = Object.freeze({
    epochs:360,
    learningRate:0.42,
    l2:0.0015
  });
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

  const validateHyperparameters = (options = {}) => {
    const merged = {
      epochs:options.epochs ?? DEFAULT_HYPERPARAMETERS.epochs,
      learningRate:options.learningRate ?? DEFAULT_HYPERPARAMETERS.learningRate,
      l2:options.l2 ?? DEFAULT_HYPERPARAMETERS.l2
    };
    if (!Number.isInteger(merged.epochs) || merged.epochs <= 0) throw new Error('Fallback Identity epochs must be a positive integer');
    if (!Number.isFinite(merged.learningRate) || merged.learningRate <= 0) throw new Error('Fallback Identity learningRate must be positive');
    if (!Number.isFinite(merged.l2) || merged.l2 < 0) throw new Error('Fallback Identity l2 must be non-negative');
    if (
      merged.epochs !== DEFAULT_HYPERPARAMETERS.epochs ||
      merged.learningRate !== DEFAULT_HYPERPARAMETERS.learningRate ||
      merged.l2 !== DEFAULT_HYPERPARAMETERS.l2
    ) {
      throw new Error('Fallback Identity v0.1 training hyperparameter drift');
    }
    return merged;
  };

  const validateExpectedRoute = (expectedRoute) => {
    if (expectedRoute === null || expectedRoute === undefined || expectedRoute === '__other__') return null;
    if (!ROUTE_IDS.includes(expectedRoute)) throw new Error(`Unknown Fallback Identity route label: ${expectedRoute}`);
    return expectedRoute;
  };

  function deduplicateRows(rows) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Fallback Identity training rows required');
    const byText = new Map();
    for (const raw of rows) {
      const text = String(raw?.text || '').trim();
      const normalized = normalizeText(text);
      if (!normalized) throw new Error('Fallback Identity training text required');
      const expectedRoute = validateExpectedRoute(raw.expectedRoute);
      const existing = byText.get(normalized);
      if (existing && existing.expectedRoute !== expectedRoute) {
        throw new Error(`Conflicting Fallback Identity route labels for normalized text: ${text}`);
      }
      if (!existing) {
        byText.set(normalized, Object.freeze({
          ...raw,
          text,
          expectedRoute
        }));
      }
    }
    return Object.freeze([...byText.values()]);
  }

  const validateVectors = (rows, vectors) => {
    if (!Array.isArray(vectors) || vectors.length !== rows.length) throw new Error('Fallback Identity training rows/vectors mismatch');
    for (const vector of vectors) {
      if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Fallback Identity vector size must be ${VECTOR_SIZE}`);
    }
  };

  function trainHead(routeId, rows, vectors, options = {}) {
    if (!ROUTE_IDS.includes(routeId)) throw new Error(`Unknown Fallback Identity head route: ${routeId}`);
    const hyperparameters = validateHyperparameters(options);
    const cleanRows = deduplicateRows(rows);
    validateVectors(cleanRows, vectors);
    if (cleanRows.length !== rows.length) throw new Error('Fallback Identity vectors must be assembled after deterministic text deduplication');

    let positiveCount = 0;
    let negativeCount = 0;
    for (const row of cleanRows) {
      if (row.expectedRoute === routeId) positiveCount += 1;
      else negativeCount += 1;
    }
    if (!positiveCount || !negativeCount) throw new Error(`Fallback Identity head ${routeId} requires positive and negative rows`);

    const positiveWeight = 0.5 / positiveCount;
    const negativeWeight = 0.5 / negativeCount;
    const weights = new Float32Array(VECTOR_SIZE);
    const gradient = new Float64Array(VECTOR_SIZE);
    let bias = 0;

    for (let epoch = 0; epoch < hyperparameters.epochs; epoch += 1) {
      gradient.fill(0);
      let gradBias = 0;
      for (let rowIndex = 0; rowIndex < cleanRows.length; rowIndex += 1) {
        const target = cleanRows[rowIndex].expectedRoute === routeId ? 1 : 0;
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
      routeId,
      weights,
      bias,
      positiveCount,
      negativeCount
    });
  }

  function trainAll(rows, vectors, options = {}) {
    const hyperparameters = validateHyperparameters(options);
    const cleanRows = deduplicateRows(rows);
    validateVectors(cleanRows, vectors);
    if (cleanRows.length !== rows.length) throw new Error('Fallback Identity vectors must be assembled after deterministic text deduplication');
    const heads = {};
    for (const routeId of ROUTE_IDS) heads[routeId] = trainHead(routeId, cleanRows, vectors, hyperparameters);
    return Object.freeze({
      version:VERSION,
      vectorSize:VECTOR_SIZE,
      routeIds:ROUTE_IDS,
      hyperparameters:DEFAULT_HYPERPARAMETERS,
      heads:Object.freeze(heads)
    });
  }

  function probability(head, vector) {
    if (!head || !ROUTE_IDS.includes(head.routeId) || !head.weights || head.weights.length !== VECTOR_SIZE || !Number.isFinite(head.bias)) {
      throw new Error('Invalid Fallback Identity head');
    }
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error(`Fallback Identity vector size must be ${VECTOR_SIZE}`);
    return sigmoid(dot(head.weights, vector) + head.bias);
  }

  function scoreAll(model, vector) {
    if (!model?.heads) throw new Error('Fallback Identity model required');
    const scores = {};
    for (const routeId of ROUTE_IDS) {
      if (!model.heads[routeId]) throw new Error(`Fallback Identity model missing head: ${routeId}`);
      scores[routeId] = probability(model.heads[routeId], vector);
    }
    if (Object.keys(model.heads).length !== ROUTE_IDS.length) throw new Error('Fallback Identity model contains extra heads');
    return Object.freeze(scores);
  }

  GuiJia.liuyaoSemanticFallbackIdentityModelV01 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    routeIds:ROUTE_IDS,
    hyperparameters:DEFAULT_HYPERPARAMETERS,
    classBalancing:Object.freeze({
      positiveTotalWeight:0.5,
      negativeTotalWeight:0.5
    }),
    biasRegularized:false,
    weightRegularization:'l2',
    normalizeText,
    deduplicateRows,
    trainHead,
    trainAll,
    probability,
    scoreAll
  });
})(typeof window !== 'undefined' ? window : globalThis);
