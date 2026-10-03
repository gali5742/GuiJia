import { strict as assert } from 'node:assert';
import { audit, contract, generate, normalize } from '../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';

const c = contract();
const fresh = () => generate(c);
let passed = 0;
const test = (name, run) => { run(); passed++; console.log(`PASS ${name}`); };
test('punctuation, width and whitespace cannot evade exact duplicate comparison', () => {
  assert.equal(normalize(' 借款，Ａ？ '), normalize('借款A'));
});
test('authored corpora satisfy frozen label/style/current22 coverage and contamination policy', () => {
  const report = audit(c,fresh());
  assert.equal(report.counts.training.rows,132);
  assert.equal(report.counts.calibration.rows,88);
  assert.equal(report.contrastPairs,110);
  assert.equal(report.protectedIsolation.independentEvaluationRead,false);
});
test('label corruption is rejected before sealing', () => {
  const data = fresh(); data.training.rows[0].label = c.labels[1];
  assert.throws(() => audit(c,data), /Label distribution drift|Missing coverage/);
});
test('duplicate text disguised by punctuation is rejected', () => {
  const data = fresh(); data.training.rows[2].text = ` ${data.training.rows[0].text}！！！`;
  assert.throws(() => audit(c,data), /Duplicate row/);
});
test('cross-split sentence copy with small prefix alteration is rejected', () => {
  const data = fresh(); data.calibration.rows[0].text = `问：${data.training.rows[0].text}`;
  assert.throws(() => audit(c,data), /Cross-split near-copy/);
});
test('unknown route coverage is rejected', () => {
  const data = fresh(); data.training.rows[0].routeCoverage = ['new_route'];
  assert.throws(() => audit(c,data), /Unknown coverage/);
});
test('traditional LiuYao terms cannot enter semantic text', () => {
  const data = fresh(); data.training.rows[0].text += '请看用神';
  assert.throws(() => audit(c,data), /Traditional terminology/);
});
test('protected corpus paths are rejected before any content read', () => {
  const protectedContract = structuredClone(c);
  protectedContract.contaminationPolicy.historyAuditOnly = [{path:'data/nonexistent-independent-evaluation.json'}];
  assert.throws(() => audit(protectedContract,fresh()), /Protected source must not be opened/);
});
test('unbound historical source is rejected before text audit', () => {
  const alteredContract = structuredClone(c);
  alteredContract.contaminationPolicy.historyAuditOnly[0].sha256 = 'wrong';
  assert.throws(() => audit(alteredContract,fresh()), /Contamination-source binding drift/);
});
console.log(`${passed} passed, 0 failed; encoder calls: 0; no model training.`);
