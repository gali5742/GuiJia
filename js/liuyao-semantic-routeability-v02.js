(function (global) {
  'use strict';
  const GuiJia = global.GuiJia = global.GuiJia || {};
  const VERSION = '0.2-dev';
  const VECTOR_SIZE = 512;
  const MAX_FALSE_ACTIVATION = 0.05;

  const dot = (weights, vector) => {
    let total = 0;
    for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
    return total;
  };
  const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
  const safeRatio = (n, d) => d ? n / d : 0;

  function train(rows, vectors, { epochs=360, learningRate=0.42, l2=0.0015 } = {}) {
    if (!Array.isArray(rows) || rows.length !== vectors?.length || !rows.length) throw new Error('Routeability training rows/vectors mismatch');
    const weights = new Float32Array(VECTOR_SIZE);
    let bias = 0;
    const gradient = new Float64Array(VECTOR_SIZE);
    for (let epoch = 0; epoch < epochs; epoch += 1) {
      gradient.fill(0);
      let gradBias = 0;
      for (let i = 0; i < rows.length; i += 1) {
        if (!vectors[i] || vectors[i].length !== VECTOR_SIZE) throw new Error('Routeability vector size mismatch');
        const target = rows[i].routeabilityLabel === 'route_known' ? 1 : rows[i].routeabilityLabel === 'non_route' ? 0 : null;
        if (target === null) throw new Error(`Unknown Routeability label: ${rows[i].routeabilityLabel}`);
        const probability = sigmoid(dot(weights, vectors[i]) + bias);
        const error = probability - target;
        gradBias += error;
        for (let j = 0; j < VECTOR_SIZE; j += 1) gradient[j] += error * vectors[i][j];
      }
      const scale = 1 / rows.length;
      const lr = learningRate / (1 + epoch * 0.01);
      for (let j = 0; j < VECTOR_SIZE; j += 1) weights[j] -= lr * (gradient[j] * scale + l2 * weights[j]);
      bias -= lr * gradBias * scale;
    }
    return Object.freeze({ weights, bias });
  }

  function probability(model, vector) {
    if (!model?.weights || model.weights.length !== VECTOR_SIZE || !Number.isFinite(model.bias)) throw new Error('Invalid Routeability model');
    if (!vector || vector.length !== VECTOR_SIZE) throw new Error('Routeability vector size mismatch');
    return sigmoid(dot(model.weights, vector) + model.bias);
  }

  function statsAt(rows, threshold) {
    const known = rows.filter((row) => row.routeabilityLabel === 'route_known');
    const nonRoute = rows.filter((row) => row.routeabilityLabel === 'non_route');
    const knownRecall = safeRatio(known.filter((row) => row.probability >= threshold).length, known.length);
    const falseActivation = safeRatio(nonRoute.filter((row) => row.probability >= threshold).length, nonRoute.length);
    return Object.freeze({ threshold, knownRecall, falseActivation, nonRouteSafety:1-falseActivation });
  }

  function calibrate(rows, { maxFalseActivation=MAX_FALSE_ACTIVATION } = {}) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Routeability calibration rows required');
    if (!rows.every((row) => ['route_known','non_route'].includes(row.routeabilityLabel) && Number.isFinite(row.probability))) throw new Error('Routeability calibration row contract mismatch');
    if (!rows.some((row) => row.routeabilityLabel === 'route_known') || !rows.some((row) => row.routeabilityLabel === 'non_route')) throw new Error('Routeability calibration requires both labels');

    const values = [...new Set(rows.map((row) => row.probability))].sort((a,b) => a-b);
    const candidates = new Set([0.5, values[0] - 1e-9, values[values.length - 1] + 1e-9]);
    for (const value of values) candidates.add(value);
    for (let i = 0; i + 1 < values.length; i += 1) candidates.add((values[i] + values[i+1]) / 2);

    let best = null;
    for (const threshold of [...candidates].filter((value) => value > 0 && value < 1).sort((a,b)=>a-b)) {
      const current = statsAt(rows, threshold);
      if (current.falseActivation > maxFalseActivation + 1e-12) continue;
      if (!best || current.knownRecall > best.knownRecall + 1e-12 ||
        (Math.abs(current.knownRecall - best.knownRecall) <= 1e-12 && current.falseActivation < best.falseActivation - 1e-12) ||
        (Math.abs(current.knownRecall - best.knownRecall) <= 1e-12 && Math.abs(current.falseActivation - best.falseActivation) <= 1e-12 && current.threshold > best.threshold)) {
        best = current;
      }
    }
    if (!best) throw new Error('No Routeability threshold satisfies false-activation constraint');
    return Object.freeze({ ...best, maxFalseActivation, objective:'maximize_known_recall_subject_to_false_activation_cap' });
  }

  function evaluate(probabilityValue, threshold) {
    if (!Number.isFinite(probabilityValue) || !Number.isFinite(threshold)) throw new Error('Routeability probability/threshold required');
    return Object.freeze({
      version:VERSION,
      probability:probabilityValue,
      threshold,
      disposition:probabilityValue >= threshold ? 'route_known' : 'non_route'
    });
  }

  GuiJia.liuyaoSemanticRouteabilityV02 = Object.freeze({
    version:VERSION,
    vectorSize:VECTOR_SIZE,
    maxFalseActivation:MAX_FALSE_ACTIVATION,
    train,
    probability,
    statsAt,
    calibrate,
    evaluate
  });
})(typeof window !== 'undefined' ? window : globalThis);
