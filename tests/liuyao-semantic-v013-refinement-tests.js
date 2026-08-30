#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let passed = 0; let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => { try { fn(); passed += 1; console.log(`✓ ${name}`); } catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); } };
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
[
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-selection-v02.js',
  'js/liuyao-semantic-routeability-v03.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
const G = context.GuiJia;
const evidence = G.liuyaoSemanticRouteEvidenceV02;
const arbitration = G.liuyaoSemanticRouteArbitrationV012;
const compatibility = G.liuyaoSemanticRouteCompatibilityV02;
const selection = G.liuyaoSemanticRouteSelectionV02;
const routeability = G.liuyaoSemanticRouteabilityV03;

test('R13-1 工资单扣税属于明确 unsupported target，不是工资收入当前目标', () => {
  const e = evidence.extract('这份工资单的扣税数字算对了吗');
  assert(e.unsupportedTargets.includes('salary_administration'), JSON.stringify(e));
  assert(!e.currentTargets.includes('salary_income'), JSON.stringify(e));
  assert(arbitration.arbitrate('fixture', e) === null, 'unsupported salary administration must not arbitrate');
  assert(compatibility.evaluate('income_salary', e).status === 'contradicted', 'salary route must be contradicted');
});

test('R13-2 奖金制度公平属于 unsupported target，不是奖金收入当前目标', () => {
  const e = evidence.extract('公司的奖金制度设计公平吗');
  assert(e.unsupportedTargets.includes('bonus_policy'), JSON.stringify(e));
  assert(arbitration.arbitrate('fixture', e) === null, 'bonus policy must not arbitrate');
});

test('R13-3 合同违约条款审查不再成为商业交易 strong', () => {
  const e = evidence.extract('这个商业合同的违约条款有没有问题');
  assert(e.unsupportedTargets.includes('contract_clause_review'), JSON.stringify(e));
  assert(arbitration.arbitrate('fixture', e) === null, 'contract review must not arbitrate');
  assert(compatibility.evaluate('commercial_transaction', e).status === 'contradicted', 'transaction route must be contradicted');
});

test('R13-4 真正工资结果保持 strong + confirmed', () => {
  const e = evidence.extract('今年我的固定工资会不会上调');
  const a = arbitration.arbitrate('fixture', e);
  assert(e.currentTargets.includes('salary_income'), JSON.stringify(e));
  assert(a?.routeId === 'income_salary' && a.strength === 'strong', JSON.stringify(a));
  assert(compatibility.evaluate('income_salary', e).status === 'confirmed', 'salary target must confirm');
});

test('R13-5 真正奖金到账保持 strong + confirmed', () => {
  const e = evidence.extract('今年的绩效奖金能不能发下来');
  const a = arbitration.arbitrate('fixture', e);
  assert(e.currentTargets.includes('bonus_income'), JSON.stringify(e));
  assert(a?.routeId === 'income_bonus' && a.strength === 'strong', JSON.stringify(a));
});

test('R13-6 “这一单敲定”补成商业交易当前目标', () => {
  const e = evidence.extract('和对方这一单最后能不能敲定');
  const a = arbitration.arbitrate('fixture', e);
  assert(e.currentTargets.includes('commercial_transaction'), JSON.stringify(e));
  assert(a?.routeId === 'commercial_transaction' && a.strength === 'strong', JSON.stringify(a));
});

test('R13-7 小买卖经营语义提供 support，可纠正接近的错误 Head', () => {
  const text = '自己这个小买卖以后能不能撑起来';
  const e = evidence.extract(text);
  const a = arbitration.arbitrate(text, e);
  assert(e.events.includes('business_operation'), JSON.stringify(e));
  assert(a?.routeId === 'business_operation' && a.strength === 'support', JSON.stringify(a));
  const result = selection.decide({ arbitration:a, head:{ top1:{id:'inventory_sale',score:0.054}, top2:{id:'business_operation',score:0.053} }, evidence:e, routeabilityDisposition:'route_known' });
  assert(result.status === 'selected' && result.routeId === 'business_operation', JSON.stringify(result));
});

test('R13-8 泛化周转资金流入补成 borrow strong', () => {
  const text = '最近有没有人愿意先给我一笔钱周转';
  const e = evidence.extract(text);
  const a = arbitration.arbitrate(text, e);
  assert(e.directions.includes('funds_inward'), JSON.stringify(e));
  assert(a?.routeId === 'borrow_money' && a.strength === 'strong', JSON.stringify(a));
});

test('R13-9 v0.3 明确 unsupported target 优先于高模型分', () => {
  const e = evidence.extract('公司的奖金制度设计公平吗');
  const result = routeability.decide({ probability:0.95, threshold:0.77, arbitration:null, evidence:e });
  assert(result.disposition === 'non_route' && result.reasonCode === 'explicit_unsupported_target', JSON.stringify(result));
});

test('R13-10 v0.3 只允许 confirmed strong rescue', () => {
  const e = evidence.extract('这台投影仪现在值不值得买');
  const a = arbitration.arbitrate('fixture', e);
  const result = routeability.decide({ probability:0.73, threshold:0.77, arbitration:a, evidence:e });
  assert(result.disposition === 'route_known' && result.reasonCode === 'confirmed_strong_rescue', JSON.stringify(result));
});

test('R13-11 support 不得绕过 Routeability 低分拒绝', () => {
  const e = evidence.extract('这项投资目前利润起伏很大，我想问这一块');
  const a = arbitration.arbitrate('fixture', e);
  assert(a?.strength === 'support', JSON.stringify(a));
  const result = routeability.decide({ probability:0.73, threshold:0.77, arbitration:a, evidence:e });
  assert(result.disposition === 'non_route', JSON.stringify(result));
});

test('R13-12 refined modern semantic files remain free of traditional LiuYao routing fields', () => {
  const source = ['js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-compatibility-v02.js','js/liuyao-semantic-route-selection-v02.js','js/liuyao-semantic-routeability-v03.js'].map((relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8')).join('\n');
  ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'].forEach((term) => assert(!source.includes(term), `traditional field leaked: ${term}`));
});
console.log(`\nLiuYao v0.13 semantic refinement: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
