#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
  try { fn(); passed += 1; console.log(`✓ ${name}`); }
  catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
const context = { console, Date, Math, JSON, Intl, Float32Array, Float64Array };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/liuyao-semantic-routeability-v02.js'), 'utf8'), context, { filename:'js/liuyao-semantic-routeability-v02.js' });
const gate = context.GuiJia.liuyaoSemanticRouteabilityV02;
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/liuyao-semantic-routeability-v0.2-contract.json'), 'utf8'));

test('RT2-1 Routeability 只输出 route_known / non_route 两类', () => {
  assert(JSON.stringify(contract.labels) === JSON.stringify(['route_known','non_route']), JSON.stringify(contract.labels));
  assert(gate.evaluate(0.7,0.6).disposition === 'route_known', '0.7 should be route_known');
  assert(gate.evaluate(0.5,0.6).disposition === 'non_route', '0.5 should be non_route');
});

test('RT2-2 known_route_insufficient 仍属于 Routeability positive', () => {
  assert(contract.positivePolicy.route_known.includes('known_route_sufficient'), 'missing sufficient positive');
  assert(contract.positivePolicy.route_known.includes('known_route_insufficient'), 'missing insufficient positive');
});

test('RT2-3 policy-disallowed 不作为 learned Routeability 类别', () => {
  const negatives = contract.negativePolicy.non_route;
  assert(!negatives.some((item) => item.includes('health') || item.includes('disease')), 'policy category leaked into routeability labels');
  assert(contract.negativePolicy.note.includes('Policy Gate'), 'policy separation note missing');
});

test('RT2-4 校准必须先满足 false activation ≤ 5%，再最大化 known recall', () => {
  const rows = [
    ...[0.92,0.88,0.84,0.80,0.76,0.72,0.68,0.64,0.60,0.56].map((probability) => ({routeabilityLabel:'route_known',probability})),
    // 20 negatives allow at most one false activation at a 5% cap. The two highest negatives
    // deliberately bracket the 0.68 known row so the best feasible recall is exactly 7/10.
    ...[0.70,0.66,0.50,0.46,0.42,0.38,0.34,0.30,0.26,0.22,0.18,0.14,0.12,0.10,0.08,0.06,0.04,0.03,0.02,0.01].map((probability) => ({routeabilityLabel:'non_route',probability}))
  ];
  const calibrated = gate.calibrate(rows);
  assert(calibrated.falseActivation <= 0.05 + 1e-12, `false activation ${calibrated.falseActivation}`);
  assert(calibrated.knownRecall === 0.7, `expected max constrained recall 0.7, got ${calibrated.knownRecall}`);
  assert(calibrated.threshold > 0.66 && calibrated.threshold <= 0.68, `threshold ${calibrated.threshold} should admit the 0.68 known row while excluding the 0.66 second negative`);
});

test('RT2-5 不能把旧 Scope Gate balanced accuracy 作为校准目标', () => {
  assert(contract.calibration.objective === 'maximize_known_recall_subject_to_false_activation_cap', contract.calibration.objective);
  assert(contract.calibration.maxFalseActivation === 0.05, String(contract.calibration.maxFalseActivation));
  assert(contract.calibration.forbiddenObjectives.includes('reuse_scope_gate_threshold'), 'missing Scope threshold prohibition');
  assert(contract.calibration.forbiddenObjectives.includes('reuse_scope_gate_calibration_policy'), 'missing Scope calibration prohibition');
});

test('RT2-6 Fresh development evaluation 固定 198 条路径平衡合同', () => {
  const dev = contract.freshDevelopmentEvaluation;
  assert(dev.total === 198 && dev.known.total === 132 && dev.nonRoute.total === 66, JSON.stringify(dev));
  assert(Object.values(dev.known.byCandidatePath).every((n) => n === 44), 'known path counts must be 44 each');
  assert(Object.values(dev.nonRoute.bySubtype).every((n) => n === 22), 'non-route subtype counts must be 22 each');
});

test('RT2-7 v0.11/v0.12 sealed blind 明确禁止进入训练', () => {
  const forbidden = contract.dataIsolation.mustNotTrainOn.join('\n');
  assert(forbidden.includes('v0.11-sealed-blind') && forbidden.includes('v0.12-sealed-blind'), forbidden);
  assert(contract.dataIsolation.sameVersionBlindReuse === false, 'same-version blind reuse must be false');
});

test('RT2-8 Routeability 模块不依赖旧 Scope Gate 源码或阈值', () => {
  const source = fs.readFileSync(path.join(ROOT, 'js/liuyao-semantic-routeability-v02.js'), 'utf8');
  assert(!source.includes('semanticScopeGateV01'), 'Routeability imports Scope Gate');
  assert(!source.includes('0.4196'), 'Routeability reused hard veto cutoff');
  assert(!source.includes('balancedAccuracy'), 'Routeability reused balanced accuracy objective');
});

console.log(`\nLiuYao Routeability v0.2: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
