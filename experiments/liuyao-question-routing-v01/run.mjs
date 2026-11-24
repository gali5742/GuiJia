import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {embedder} from '../../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
import {decide, fit, probabilities, summarize} from './model.mjs';

const root = 'experiments/liuyao-question-routing-v01';
const output = 'semantic-routing-output';
const load = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
const file = {
  members: [root + '/members.json', '26ac61b60257a96e050848c6646fa0c7754c19c6'],
  train: ['data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-training.json', '78b792a615c048b7bb804997628f8cb0e4fe703e'],
  cache: ['data/liuyao-semantic-v013-candidate-v11-optimization-diagnostic-training-cache-v0.2.json', 'a993805795c9f33d79a2bc33639da6a3593272de'],
  old: ['data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-model.json', 'b8e67967619e0842e66e3e1f9e005380d7b69b67'],
  encoder: ['data/liuyao-semantic-embedding-execution-contract-v0.1.json', 'f8ecd4edac2d69b1dd6519e7fd7ca041222ee0a5']
};
function bound(key) {
  const [path, blob] = file[key];
  assert.equal(execFileSync('git', ['hash-object', path], {encoding: 'utf8'}).trim(), blob, path);
  return load(path);
}
const save = (name, value) => writeFileSync(output + '/' + name + '.json', JSON.stringify(value) + '\n');
const members = bound('members');
const old = bound('old');
const labels = [...old.routeIds, 'unresolved'];
assert.equal(labels.length, 23);
const encoder = {...bound('encoder').encoder};
async function makeEncoder() {
  return embedder({encoderExecution: encoder});
}
function audit() {
  const original = bound('train').rows;
  assert.equal(original.length, 2028);
  assert.equal(members.train.length, 64);
  assert.equal(members.dev.length, 76);
  const all = [...members.train, ...members.dev];
  assert.equal(new Set(all.map(r => r.id)).size, 140);
  for (const group of ['single_direct','single_background','multi_cross','multi_same']) {
    assert.equal(members.train.filter(r => r.group === group && r.multi === group.startsWith('multi')).length, 16);
  }
  for (const group of ['direct','background']) {
    const rows = members.dev.filter(r => r.group === group);
    assert.equal(rows.length, 22);
    assert.deepEqual(rows.map(r => r.route).sort(), [...old.routeIds].sort());
  }
  for (const [group, size] of [['multi_cross',10],['multi_same',10],['unsupported',12]]) {
    const rows = members.dev.filter(r => r.group === group);
    assert.equal(rows.length, size);
    assert(rows.every(r => r.route === null && r.multi === group.startsWith('multi')));
  }
  const repr = row => {
    const text = row.text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]/gu, '');
    const chars = Array.from(text);
    assert(chars.length >= 3);
    return {id: row.id, text, grams: new Set(chars.slice(2).map((_, i) => chars.slice(i, i + 3).join('')))};
  };
  const fresh = all.map(repr), history = original.map(repr);
  let pairs = 0, maximum = 0;
  function compare(a, b) {
    let common = 0;
    for (const token of a.grams) if (b.grams.has(token)) common++;
    const similarity = common / (a.grams.size + b.grams.size - common);
    assert(a.text !== b.text && similarity < 0.82, 'Duplicate pair ' + a.id + '/' + b.id);
    maximum = Math.max(maximum, similarity);
    pairs++;
  }
  fresh.forEach((a, i) => {
    fresh.slice(0, i).forEach(b => compare(a, b));
    history.forEach(b => compare(a, b));
  });
  console.log(JSON.stringify({stage: 'membership', fresh: fresh.length, historical: history.length, pairs, maximum}));
}
async function train() {
  const original = bound('train').rows;
  const vectors = bound('cache').rows;
  assert.equal(original.length, 2028);
  assert.equal(vectors.length, original.length);
  const routes = original.map((row, i) => {
    const cached = vectors[i];
    assert(row.split === 'training' && row.id === cached.id && cached.expectedRoute === row.expectedRoute);
    assert(hash(row.text) === cached.textSha256 && cached.vector.length === 512 && cached.vector.every(Number.isFinite));
    return {label: row.expectedRoute ?? 'unresolved', vector: cached.vector};
  });
  const encode = await makeEncoder(), countRows = [];
  for (const row of members.train) {
    countRows.push({label: row.multi ? 'multi' : 'single', vector: await encode(row.text)});
  }
  const weights = {source: sha, routes: fit(routes, labels), count: fit(countRows, ['single', 'multi'])};
  save('weights', weights);
  console.log(JSON.stringify({stage:'training', source:sha, routeRows: routes.length, countRows: countRows.length,
    weightsSha256:hash(readFileSync(output + '/weights.json'))}));
}
async function evaluate() {
  const weights = load(output + '/weights.json');
  assert.equal(weights.source, sha);
  const encode = await makeEncoder();
  function route(x) {
    const p = probabilities(weights.routes, x), best = p.indexOf(Math.max(...p));
    return p[best] >= 0.70 && labels[best] !== 'unresolved' ? labels[best] : null;
  }
  function legacy(x) {
    const admitted = old.routeIds.filter(id => {
      const head = old.heads[id];
      let score = head.bias;
      for (let j = 0; j < 512; j++) score += head.weights[j] * x[j];
      return score >= 0;
    });
    return admitted.length === 1 ? admitted[0] : null;
  }
  const results = {legacy: [], routeOnly: [], gated: []};
  for (const row of members.dev) {
    const x = await encode(row.text);
    for (const [variant, rows] of Object.entries(results)) {
      let calls = 0;
      const prediction = decide(x, variant === 'gated' ? weights.count : null, v => {
        calls++;
        return variant === 'legacy' ? legacy(v) : route(v);
      });
      assert.equal(calls, prediction.state === 'multi_stop' ? 0 : 1);
      rows.push({id:row.id, group:row.group, multi:row.multi, expected:row.route, ...prediction, calls});
    }
  }
  const summary = Object.fromEntries(Object.entries(results).map(([k,v]) => [k,summarize(v)]));
  const {gated,routeOnly} = summary;
  const supported = gated.multiRouted < routeOnly.multiRouted && gated.correct >= routeOnly.correct && gated.downstreamAfterStop === 0;
  const report = {source:sha, weightsSha256:hash(readFileSync(output + '/weights.json')), supported, summary, results};
  save('result', report);
  console.log('DEVELOPMENT_SUMMARY ' + JSON.stringify({supported, summary}));
}
mkdirSync(output, {recursive:true});
switch (process.argv[2]) {
  case 'audit': audit(); break;
  case 'train': await train(); break;
  case 'evaluate': await evaluate(); break;
  default: throw Error('Expected audit, train or evaluate');
}
