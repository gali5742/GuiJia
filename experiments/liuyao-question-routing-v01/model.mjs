import assert from 'node:assert/strict';

const dimensions = 512;

function logits(model, vector) {
  return model.weights.map((weights, k) => {
    let sum = model.bias[k];
    for (let j = 0; j < dimensions; j++) sum += weights[j] * vector[j];
    return sum;
  });
}

export function probabilities(model, vector) {
  const scores = logits(model, vector);
  const max = Math.max(...scores);
  const exp = scores.map(value => Math.exp(value - max));
  const total = exp.reduce((a, b) => a + b, 0);
  return exp.map(value => value / total);
}

export function fit(rows, labels) {
  const weights = labels.map(() => new Float64Array(dimensions));
  const model = {labels, weights, bias: labels.map(() => 0)};
  const order = rows.map((_, i) => i);
  const targets = rows.map(row => labels.indexOf(row.label));
  assert(targets.every(k => k >= 0));
  let seed = 7541;
  for (let epoch = 0; epoch < 100; epoch++) {
    for (let i = order.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = Math.floor((seed / 4294967296) * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const rate = 0.15 / (1 + epoch / 30);
    for (const i of order) {
      const vector = rows[i].vector;
      const p = probabilities(model, vector);
      for (let k = 0; k < labels.length; k++) {
        const delta = (k === targets[i] ? 1 : 0) - p[k];
        model.bias[k] += rate * delta;
        for (let j = 0; j < dimensions; j++) {
          weights[k][j] += rate * (delta * vector[j] - 0.0001 * weights[k][j]);
        }
      }
    }
  }
  assert(model.bias.every(Number.isFinite) && weights.every(w => w.every(Number.isFinite)));
  return {...model, weights: weights.map(w => Array.from(w))};
}

export function decide(vector, countModel, selectRoute) {
  if (countModel && probabilities(countModel, vector)[1] >= 0.5) {
    return {state: 'multi_stop', route: null};
  }
  const route = selectRoute(vector);
  return {state: route === null ? 'unresolved' : 'selected', route};
}

export function summarize(rows) {
  const count = fn => rows.filter(fn).length;
  const answerable = rows.filter(r => r.expected !== null);
  const byRoute = {};
  for (const row of answerable) {
    const counts = byRoute[row.expected] ??= {total: 0, correct: 0, wrong: 0, unresolved: 0, multiStop: 0};
    counts.total++;
    if (row.route === row.expected) counts.correct++;
    else if (row.route !== null) counts.wrong++;
    else if (row.state === 'multi_stop') counts.multiStop++;
    else counts.unresolved++;
  }
  return {
    total: rows.length, answerable: answerable.length, correct: count(r => r.route !== null && r.route === r.expected),
    acceptedKnown: count(r => r.route !== null && r.expected !== null), acceptedAll: count(r => r.route !== null),
    multi: count(r => r.multi), multiStopped: count(r => r.multi && r.state === 'multi_stop'),
    multiRouted: count(r => r.multi && r.route !== null), single: count(r => !r.multi),
    singleMisstopped: count(r => !r.multi && r.state === 'multi_stop'),
    downstreamAfterStop: rows.filter(r => r.state === 'multi_stop').reduce((sum, r) => sum + r.calls, 0),
    unsupported: count(r => r.group === 'unsupported'), unsupportedRouted: count(r => r.group === 'unsupported' && r.route !== null),
    byGroup: Object.fromEntries([...new Set(rows.map(r => r.group))].map(group => {
      const g = rows.filter(r => r.group === group);
      return [group, {total: g.length, multiStop: g.filter(r => r.state === 'multi_stop').length,
        selected: g.filter(r => r.route !== null).length, correctRoute: g.filter(r => r.route !== null && r.route === r.expected).length}];
    })), byRoute
  };
}
