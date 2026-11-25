// Post-hoc replay of sealed development decisions. This entry point only scores fixed weights.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {embedder} from '../../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
import {probabilities} from './model.mjs';

const root = 'experiments/liuyao-question-routing-v01';
function readBound(path, blob) {
  assert.equal(execFileSync('git', ['hash-object', path], {encoding:'utf8'}).trim(), blob);
  return JSON.parse(readFileSync(path, 'utf8'));
}
const dev = readBound(root + '/members.json', '26ac61b60257a96e050848c6646fa0c7754c19c6').dev;
const prior = readBound(root + '/outputs/result.json', '22cb13160054e3fcea00142a18f4c022d04e7691');
const weights = readBound(root + '/outputs/weights.json', '6b9f3ca550e231220cd5f74f005641d7c16b9940');
const old = readBound('data/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-model.json', 'b8e67967619e0842e66e3e1f9e005380d7b69b67');
const config = readBound('data/liuyao-semantic-embedding-execution-contract-v0.1.json', 'f8ecd4edac2d69b1dd6519e7fd7ca041222ee0a5');
assert.equal(createHash('sha256').update(readFileSync(root + '/outputs/weights.json')).digest('hex'), prior.weightsSha256);
assert.deepEqual(weights.routes.labels, [...old.routeIds, 'unresolved']);
assert.deepEqual(weights.count.labels, ['single','multi']);
const encode = await embedder({encoderExecution: config.encoder});
function rank(labels, scores, expected) {
  assert(scores.every(Number.isFinite));
  const ordered = labels.map((label, i) => ({label, score:scores[i]})).sort((a,b) => b.score - a.score);
  const routes = ordered.filter(x => x.label !== 'unresolved');
  const position = list => expected === null ? null : list.findIndex(x => x.label === expected) + 1;
  return {first:ordered[0], second:ordered[1], expectedRank:position(ordered), expectedScore:expected === null ? null : scores[labels.indexOf(expected)],
    firstRoute:routes[0].label, expectedRouteRank:position(routes)};
}
const rows = [];
assert.equal(dev.length, 76);
for (const [i,row] of dev.entries()) {
  const x = await encode(row.text);
  const scores = probabilities(weights.routes,x);
  const current = rank(weights.routes.labels, scores, row.route);
  const status = current.first.label === 'unresolved' ? 'unresolved_first' : current.first.score < 0.70 ? 'below_threshold' : 'selected';
  const selected = status === 'selected' ? current.first.label : null;
  const oldLogits = old.routeIds.map(id => {
    const head = old.heads[id];
    return head.weights.reduce((sum,w,j) => sum + w * x[j], head.bias);
  });
  const oldRank = rank(old.routeIds, oldLogits.map(v => 1 / (1 + Math.exp(-v))), row.route);
  const admitted = old.routeIds.filter((_,i) => oldLogits[i] >= 0);
  const legacySelected = admitted.length === 1 ? admitted[0] : null;
  const multiScore = probabilities(weights.count,x)[1];
  for (const [name,route,state] of [
    ['legacy',legacySelected,legacySelected ? 'selected' : 'unresolved'],
    ['routeOnly',selected,selected ? 'selected' : 'unresolved'],
    ['gated',multiScore >= 0.5 ? null : selected,multiScore >= 0.5 ? 'multi_stop' : selected ? 'selected' : 'unresolved']
  ]) {
    const saved = prior.results[name][i];
    assert.deepEqual([row.id,row.route,route,state],[saved.id,saved.expected,saved.route,saved.state]);
  }
  rows.push({id:row.id,group:row.group,expected:row.route,multiScore,
    current:{...current,status,selected},legacy:{...oldRank,admitted,selected:legacySelected}});
}
const report = {baseline:'87124b972b2ce037f72e820d0e472b9d5ab0d5a6',encoderCalls:rows.length,
  decisionMatches:3*rows.length,weightsSha256:prior.weightsSha256,rows};
writeFileSync('routing-rank-replay.json', JSON.stringify(report,null,2)+'\n');
for (const row of rows) console.log('RANK_ROW '+JSON.stringify(row));
console.log('REPLAY_VERIFIED '+report.decisionMatches);
