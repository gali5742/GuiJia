import { strict as assert } from 'node:assert';
import { calibrate } from '../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-execution-lib.mjs';
const labels = ['route_semantics_sufficient','route_semantics_insufficient'];
const gates = {maximumInsufficientFalsePass:0.05,minimumSufficientRetention:0.90};
const rows = (positive,negative) => [...positive.map(probability => ({label:labels[0],probability})),...negative.map(probability => ({label:labels[1],probability}))];
let passed = 0;
const test = (name, run) => {run(); passed++; console.log(`PASS ${name}`);};
test('globally separable cohort locks a stable interval midpoint', () => {
  const result = calibrate(rows([0.8,0.9],[0.1,0.2]),gates,labels);
  assert.equal(result.status,'calibration_passed'); assert.equal(result.selectedThreshold,0.5);
  assert.equal(result.selectedMetrics.sufficientRetention,1); assert.equal(result.selectedMetrics.insufficientFalsePass,0);
});
test('insufficient safety gate cannot be traded for recall', () => {
  const result = calibrate(rows([0.2,0.9],[0.8,0.85]),gates,labels);
  assert.equal(result.status,'calibration_failed_no_feasible_global_threshold');assert.equal(result.selectedThreshold,null);
});
test('ties between opposite labels are not separable using >=', () => {
  assert.equal(calibrate(rows([0.5],[0.5]),gates,labels).feasibleRegimes,0);
});
test('retention is maximized within safety, before false-pass tie breaking', () => {
  const result = calibrate(rows(Array(20).fill(0.8),[...Array(19).fill(0.1),0.9]),gates,labels);
  assert.equal(result.selectedMetrics.sufficientRetention,1);assert.equal(result.selectedMetrics.insufficientFalsePass,0.05);
});
test('NaN cannot create a passing calibration', () => {
  assert.throws(() => calibrate(rows([NaN],[0.2]),gates,labels),/Invalid calibration/);
});
test('calibration without both labels is rejected', () => {
  assert.throws(() => calibrate(rows([0.8],[]),gates,labels),/Both calibration labels/);
});
console.log(`${passed} passed, 0 failed; synthetic probability fixtures only; encoder calls: 0.`);
