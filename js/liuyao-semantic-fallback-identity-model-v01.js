(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.1-dev';
  const VECTOR_SIZE = 512;
  const DEFAULT_EPOCHS = 360;
  const DEFAULT_LEARNING_RATE = 0.42;
  const DEFAULT_L2 = 0.0015;

  const dot = (weights, vector) => {
    let total = 0;
    for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
    return total;
  };
  const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));

  function trainHead(rows, vectors, routeId, {
    epochs=DEFAULT_EPOCHS,
    learningRate=DEFAULT_LEARNING_RATE,
    l2=DEFAULT_L2
  } = {}) {
    if (!routeId) throw new Error('Fallback Identity routeId required');
    if (!Array.isArray(rows) || !rows.length || rows.length !== vectors?.length) {
      throw new Error('Fallback Identity training rows/vectors mismatch');
    }
    const positiveCount = rows.filter((row) => row.expectedRoute === routeId).length;
    const negativeCount = rows.length - positiveCount;
    if (!positiveCount || !negativeCount) throw new Error(`Fallback Identity ${routeId} requires both classes`);

    const positiveWeight = 0.5 / positiveCount;
    const negativeWeight = 0.5 / negativeCount;
    const weights = new Float32Array(VECTOR_SIZE);
    let bias = 0;
    const gradient = new Float64Array(VECTOR_SIZE);

    for (let epoch = 0; epoch < epochs; epoch += 1) {
      gradient.fill(0);
      let gradBias = 0;
      for (let i = 0; i < rows.length; i += 1) {
        const vector = vectors[i];
        if (!vector || vector.length !== VECTOR_SIZE) throw new Error('Fallback Identity vector size mismatch');
        const target = rows[i].expectedRoute === routeId ? 1 : 0;
        const sampleWeight = target ? positiveWeight : negativeWeight;
        const probability = sigmoid(dot(weights, vector) + bias);
        const error = (probability - target) * sampleWeight;
        gradBias += error;
        for (let j = 0; j < VECTOR_SIZE; j += 1) gradient[j] += error * vector[j];
      }
      const lr = learningRate / (1 + epoch * 0.01);
      for (let j = 0; j < VECTOR_SIZE; j += 1) {
        weights[j] -= lr * (gradient[j] + l2 * weights[j]);
      }
      bias -= lr * gradBias;
    }

    return Object.freeze({
      routeId,
      weights,
      bias,
      trainingCounts:Object.freeze({ positive:positiveCount, negative:negativeCount })
    });
  }

  function trainHeads(rows, vectors, routeIds, options={}) {
    if (!Array.isArray(routeIds) || !routeIds.length) throw new Error('Fallback Identity route inventory required');
    const heads = {};
    for (const routeId of routeIds) heads[routeId] = trainHead(rows, vectors, routeId, options);
    return Object.freeze(heads);
  }

  function probability(head, vector) {
    if (!head?.weights || head.weights.length !== VECTOR_SIZE || !Number.isFinite(head.bias)) {
      throw new Error('Invalid Fallback Identity head');
    }
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error('Fallback Identity vector size mismatch');
    return sigmoid(dot(head.weights, vector) + head.bias);
  }

  function scoreCandidates(heads, vector, routeIds) {
    const result = {};
    for (const routeId of routeIds || []) {
      const head = heads?.[routeId];
      if (!head) throw new Error(`Fallback Identity head missing: ${routeId}`);
      result[routeId] = probability(head, vector);
    }
    return Object.freeze(result);
  }

  GuiJia.liuyaoSemanticFallbackIdentityModelV01 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    defaults:Object.freeze({
      epochs:DEFAULT_EPOCHS,
      learningRate:DEFAULT_LEARNING_RATE,
      l2:DEFAULT_L2
    }),
    trainHead,
    trainHeads,
    probability,
    scoreCandidates
  });
})(typeof window !== 'undefined' ? window : globalThis);
