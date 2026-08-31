#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
};

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-routeability-v05.js',
  'js/liuyao-semantic-fallback-identity-v01.js',
  'js/liuyao-semantic-route-selection-v04.js'
].forEach((relative) => vm.runInContext(
  fs.readFileSync(path.join(ROOT, relative), 'utf8'),
  context,
  { filename:relative }
));

const G = context.GuiJia;
const evidence = G.liuyaoSemanticRouteEvidenceV03;
const compatibility = G.liuyaoSemanticRouteCompatibilityV03;
const routeability = G.liuyaoSemanticRouteabilityV05;
const fallbackIdentity = G.liuyaoSemanticFallbackIdentityV01;
const selection = G.liuyaoSemanticRouteSelectionV04;
const THRESHOLD = 0.7675678218564946;

test('R13V3-1 explicit procedure-information target is unsupported', () => {
  const result = evidence.extract('这只基金的赎回规则几点前提交才算当天申请');
  assert(result.unsupportedTargets.includes('rule_or_procedure_information'), JSON.stringify(result));
});

test('R13V3-2 explicit fee/tax information target is unsupported', () => {
  const result = evidence.extract('证券账户的交易佣金现在是多少');
  assert(result.unsupportedTargets.includes('fee_or_tax_information'), JSON.stringify(result));
});

test('R13V3-3 explicit accounting information target is unsupported', () => {
  const result = evidence.extract('工资条上的社保扣款为什么是这个数');
  assert(result.unsupportedTargets.includes('administrative_or_accounting_information') || result.unsupportedTargets.includes('salary_administration'), JSON.stringify(result));
});

test('R13V3-4 fee mention does not erase an explicit supported profit target', () => {
  const result = evidence.extract('扣完手续费以后这笔基金还能不能盈利');
  assert(result.currentTargets.includes('profit'), JSON.stringify(result));
  assert(!result.unsupportedTargets.includes('fee_or_tax_information'), JSON.stringify(result));
});

test('R13V3-5 current debt-collection target outranks historical lending direction', () => {
  const result = compatibility.evaluate('debt_collection', {
    directions:['creditor_inward','funds_outward'],
    currentTargets:['debt_collection'],
    background:['historical_lending'],
    unsupportedTargets:[]
  });
  assert(result.status === 'confirmed', JSON.stringify(result));
  assert(result.contradictionEvidence.length === 0, JSON.stringify(result));
});

test('R13V3-6 current debt-collection override does not erase a real conflicting direction', () => {
  const result = compatibility.evaluate('debt_collection', {
    directions:['creditor_inward','funds_outward','debtor_outward'],
    currentTargets:['debt_collection'],
    background:['historical_lending'],
    unsupportedTargets:[]
  });
  assert(result.status === 'contradicted', JSON.stringify(result));
  assert(result.contradictionEvidence.includes('direction:debtor_outward'), JSON.stringify(result));
});

test('R13V3-7 topic-only transaction/salary/bonus evidence confirms candidate identity after unsupported filtering', () => {
  const rows = [
    ['commercial_transaction',{ events:['commercial_transaction'], unsupportedTargets:[] }],
    ['income_salary',{ events:['salary_income'], unsupportedTargets:[] }],
    ['income_bonus',{ events:['bonus_income'], unsupportedTargets:[] }]
  ];
  rows.forEach(([routeId, e]) => {
    const result = compatibility.evaluate(routeId, e);
    assert(result.status === 'confirmed', `${routeId}: ${JSON.stringify(result)}`);
  });
});

test('R13V3-8 generic unsupported target contradicts any current-22 candidate', () => {
  const result = compatibility.evaluate('investment_liquidation', {
    domains:['investment'],
    events:['investment_liquidation'],
    unsupportedTargets:['rule_or_procedure_information']
  });
  assert(result.status === 'contradicted', JSON.stringify(result));
});

test('R13V3-9 unsupported target beats a high Routeability score', () => {
  const result = routeability.decide({
    probability:0.99,
    arbitration:{ routeId:'investment_liquidation', strength:'support' },
    evidence:{ unsupportedTargets:['rule_or_procedure_information'] }
  });
  assert(result.disposition === 'non_route', JSON.stringify(result));
  assert(result.reasonCode === 'explicit_unsupported_target', JSON.stringify(result));
});

test('R13V3-10 Routeability v0.5 refuses threshold drift', () => {
  let threw = false;
  try {
    routeability.decide({ probability:0.8, threshold:0.7, evidence:{} });
  } catch (error) {
    threw = /threshold drift/.test(error.message);
  }
  assert(threw, 'Routeability v0.5 accepted a retuned threshold');
  assert(routeability.threshold === THRESHOLD, `threshold=${routeability.threshold}`);
});

test('R13V3-11 confirmed support may rescue below threshold but pure fallback may not', () => {
  const support = routeability.decide({
    probability:0.74,
    arbitration:{ routeId:'income_bonus', strength:'support' },
    evidence:{ events:['bonus_income'], unsupportedTargets:[] }
  });
  assert(support.disposition === 'route_known' && support.reasonCode === 'confirmed_support_rescue', JSON.stringify(support));

  const fallback = routeability.decide({ probability:0.74, arbitration:null, evidence:{} });
  assert(fallback.disposition === 'non_route' && fallback.reasonCode === 'frozen_v02_score_reject', JSON.stringify(fallback));
});

test('R13V3-12 Fallback Identity supports reject-all, unique admission, and both-admitted unresolved', () => {
  const head = { top1:{ id:'borrow_money', score:0.06 }, top2:{ id:'lend_money', score:0.059 } };
  const rejected = fallbackIdentity.decide({ head, probabilities:{ borrow_money:0.42, lend_money:0.40 }, threshold:0.6 });
  assert(rejected.status === 'route_unresolved' && rejected.reasonCode === 'fallback_identity_reject_all', JSON.stringify(rejected));

  const unique = fallbackIdentity.decide({ head, probabilities:{ borrow_money:0.44, lend_money:0.72 }, threshold:0.6 });
  assert(unique.status === 'selected' && unique.routeId === 'lend_money', JSON.stringify(unique));

  const both = fallbackIdentity.decide({ head, probabilities:{ borrow_money:0.71, lend_money:0.72 }, threshold:0.6 });
  assert(both.status === 'route_unresolved' && both.reasonCode === 'fallback_identity_multiple_admissions', JSON.stringify(both));
});

test('R13V3-13 pure Head fallback is impossible without Fallback Identity decision', () => {
  const result = selection.decide({
    arbitration:null,
    head:{ top1:{ id:'business_operation', score:0.06 }, top2:{ id:'financial_fortune', score:0.058 } },
    evidence:{},
    routeabilityDisposition:'route_known'
  });
  assert(result.status === 'route_unresolved', JSON.stringify(result));
  assert(result.reasonCode === 'fallback_identity_required', JSON.stringify(result));
});

test('R13V3-14 Fallback Identity may select Router Top2 without raw Top1 priority', () => {
  const head = { top1:{ id:'lend_money', score:0.061 }, top2:{ id:'borrow_money', score:0.060 } };
  const gate = fallbackIdentity.decide({
    head,
    probabilities:{ lend_money:0.41, borrow_money:0.73 },
    threshold:0.6
  });
  const result = selection.decide({
    arbitration:null,
    head,
    evidence:{},
    routeabilityDisposition:'route_known',
    fallbackIdentityDecision:gate
  });
  assert(result.status === 'selected' && result.routeId === 'borrow_money', JSON.stringify(result));
  assert(result.reasonCode === 'fallback_identity_unique_admission', JSON.stringify(result));
});

test('R13V3-15 support Arbitration remains preferred without invoking pure Head identity fallback', () => {
  const result = selection.decide({
    arbitration:{ routeId:'business_operation', strength:'support' },
    head:{ top1:{ id:'marital_relationship', score:0.061 }, top2:{ id:'business_operation', score:0.058 } },
    evidence:{ events:['business_operation'], unsupportedTargets:[] },
    routeabilityDisposition:'route_known',
    fallbackIdentityDecision:null
  });
  assert(result.status === 'selected' && result.routeId === 'business_operation', JSON.stringify(result));
});

test('R13V3-16 new v0.3 deterministic modules remain modern-semantic only', () => {
  const source = [
    'js/liuyao-semantic-route-evidence-v03.js',
    'js/liuyao-semantic-route-compatibility-v03.js',
    'js/liuyao-semantic-routeability-v05.js',
    'js/liuyao-semantic-fallback-identity-v01.js',
    'js/liuyao-semantic-route-selection-v04.js'
  ].map((relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')).join('\n');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => {
    assert(!source.includes(term), `traditional field leaked: ${term}`);
  });
});

console.log(`\nLiuYao v0.13-v0.3 deterministic contract: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
