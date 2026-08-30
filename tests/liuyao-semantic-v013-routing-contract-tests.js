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
function load() {
  const context = { console, Date, Math, JSON, Intl, Set, Map };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  [
    'js/liuyao-semantic-route-evidence-v01.js',
    'js/liuyao-semantic-route-arbitration-v011.js',
    'js/liuyao-semantic-route-compatibility-v01.js',
    'js/liuyao-semantic-route-selection-v01.js'
  ].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
  return context.GuiJia;
}
const GuiJia = load();
const arbitration = GuiJia.liuyaoSemanticRouteArbitrationV011;
const compatibility = GuiJia.liuyaoSemanticRouteCompatibilityV01;
const selection = GuiJia.liuyaoSemanticRouteSelectionV01;
const blank = (extra={}) => ({ text:'fixture', domains:[], events:[], objects:[], directions:[], relations:[], goals:[], background:[], currentTargets:[], ...extra });

test('V13-1 Compatibility 缺少正证据时保持 compatible，不再按 Identity 式失败', () => {
  const result = compatibility.evaluate('receive_item', blank({ events:['delivery'] }));
  assert(result.status === 'compatible', `expected compatible, got ${result.status}`);
  assert(result.positiveEvidence.length === 0 && result.contradictionEvidence.length === 0, 'missing evidence must remain unknown');
});

test('V13-2 明确资金方向可以形成 contradiction，而不是把所有缺失都当冲突', () => {
  const result = compatibility.evaluate('borrow_money', blank({ directions:['funds_outward'] }));
  assert(result.status === 'contradicted', `expected contradicted, got ${result.status}`);
  assert(result.contradictionEvidence.includes('direction:funds_outward'), 'missing explicit contradictory direction');
});

test('V13-3 Arbitration v0.11 不允许 position event 在竞争 profit goal 存在时升为 strong', () => {
  const evidence = blank({ domains:['investment'], events:['investment_position'], goals:['profit'] });
  const result = arbitration.arbitrate('fixture', evidence);
  assert(result?.routeId === 'investment_profit', `expected investment_profit, got ${result?.routeId}`);
  assert(result.strength === 'support', `expected support, got ${result.strength}`);
});

test('V13-4 只有 position event 且没有竞争目标时也只给 support，不把 missing current target 当否定', () => {
  const evidence = blank({ domains:['investment'], events:['investment_position'] });
  const result = arbitration.arbitrate('fixture', evidence);
  assert(result?.routeId === 'investment_position_decision' && result.strength === 'support', JSON.stringify(result));
});

test('V13-5 support 正证据可以纠正错误 Head Top1', () => {
  const evidence = blank({ domains:['investment'], events:['investment_position'], goals:['profit'] });
  const arb = arbitration.arbitrate('fixture', evidence);
  const result = selection.decide({
    arbitration:arb,
    head:{ top1:{id:'investment_position_decision',score:0.44}, top2:{id:'investment_profit',score:0.40} },
    evidence
  });
  assert(result.status === 'selected' && result.routeId === 'investment_profit', JSON.stringify(result));
  assert(result.reasonCode === 'unique_confirmed_candidate', `unexpected reason ${result.reasonCode}`);
});

test('V13-6 Head Top1 缺正证据但未被冲突、Top2 被明确冲突时允许 fallback retention', () => {
  const evidence = blank({ events:['delivery'], background:['past_purchase'] });
  const result = selection.decide({
    head:{ top1:{id:'receive_item',score:0.47}, top2:{id:'item_purchase',score:0.31} },
    evidence
  });
  assert(result.status === 'selected' && result.routeId === 'receive_item', JSON.stringify(result));
  assert(result.reasonCode === 'fallback_top1_only_compatible', `unexpected reason ${result.reasonCode}`);
});

test('V13-7 Head Top1 被明确当前目标冲突时，confirmed Top2 可以纠错', () => {
  const evidence = blank({ domains:['investment'], goals:['price_trend'], currentTargets:['price_trend'] });
  const result = selection.decide({
    head:{ top1:{id:'investment_profit',score:0.46}, top2:{id:'investment_price_trend',score:0.43} },
    evidence
  });
  assert(result.status === 'selected' && result.routeId === 'investment_price_trend', JSON.stringify(result));
});

test('V13-8 多个独立 confirmed 候选没有强仲裁时必须 unresolved', () => {
  const evidence = blank({ events:['business_operation'], relations:['partnership'] });
  const result = selection.decide({
    head:{ top1:{id:'business_operation',score:0.42}, top2:{id:'partnership',score:0.39} },
    evidence
  });
  assert(result.status === 'route_unresolved' && result.reasonCode === 'multiple_confirmed_candidates', JSON.stringify(result));
});

test('V13-9 strong Arbitration 只要没有明确 contradiction 即可优先，不要求 Compatibility 重复证明', () => {
  const evidence = blank();
  const result = selection.decide({
    arbitration:{ routeId:'debt_collection', strength:'strong' },
    head:{ top1:{id:'financial_fortune',score:0.4}, top2:{id:'debt_collection',score:0.3} },
    evidence
  });
  assert(result.status === 'selected' && result.routeId === 'debt_collection', JSON.stringify(result));
  assert(result.reasonCode === 'strong_arbitration_compatible', `unexpected reason ${result.reasonCode}`);
});

test('V13-10 Candidate Set 合并相同 route 的 support 与 Head provenance', () => {
  const candidates = selection.buildCandidateSet(
    { routeId:'investment_profit', strength:'support' },
    { top1:{id:'investment_position_decision',score:0.5}, top2:{id:'investment_profit',score:0.4} }
  );
  const profit = candidates.find((row) => row.routeId === 'investment_profit');
  assert(candidates.length === 2, `expected 2 unique candidates, got ${candidates.length}`);
  assert(profit.provenance.includes('arbitration_support') && profit.provenance.includes('head_top2'), JSON.stringify(profit));
});

test('V13-11 Compatibility inventory 固定覆盖 22 route', () => {
  assert(compatibility.routeIds.length === 22, `route count ${compatibility.routeIds.length}`);
  assert(new Set(compatibility.routeIds).size === 22, 'duplicate route id');
});

test('V13-12 新现代语义层不出现传统取用字段', () => {
  const source = [
    'js/liuyao-semantic-route-arbitration-v011.js',
    'js/liuyao-semantic-route-compatibility-v01.js',
    'js/liuyao-semantic-route-selection-v01.js'
  ].map((relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')).join('\n');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => assert(!source.includes(term), `modern routing layer leaked ${term}`));
});

console.log(`\nLiuYao v0.13 routing contracts: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
