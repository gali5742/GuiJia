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
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js',
    'js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
const api = context.GuiJia.liuyaoTimeSelection;

function profile(flags = {}, relevanceRanks = {}) {
    const kinds = ['trigger','support','peer','constraint','outflow','exertion'];
    return {
        flags:{ trigger:false, support:false, peer:false, constraint:false, outflow:false, exertion:false, ...flags },
        structuralRelevance:{
            dimensions:Object.fromEntries(kinds.map((kind) => [kind, { rank:Number(relevanceRanks[kind] || 0), level:'none' }]))
        }
    };
}
function node(dateText, flags, sortTime = 0, relevanceRanks = {}) {
    return {
        dateText,
        dayGanZhi:'测试',
        sortTime,
        candidateOutput:{ dateAssessment:profile(flags, relevanceRanks) }
    };
}


test('日期选择：受制是非补偿硬负担，存在无受制日期时不让 mixed 受制日自动压过它', () => {
    const mixedConstraint = node('2026/8/13', { support:true, constraint:true, exertion:true }, 3);
    const costOnly = node('2026/8/12', { outflow:true }, 2);
    const frontier = api.nondominatedFrontier([mixedConstraint, costOnly]);
    assert(frontier.length === 1 && frontier[0].dateText === '2026/8/12', `硬受制门槛未生效：${frontier.map((x) => x.dateText)}`);
});

test('日期选择：同一受制层内使用 Pareto 支配，不做生扶/泄力换算总分', () => {
    const cleanSupport = node('2026/8/11', { support:true }, 1);
    const supportOutflow = node('2026/8/12', { support:true, outflow:true }, 2);
    const neutral = node('2026/8/13', {}, 3);
    const frontier = api.nondominatedFrontier([cleanSupport, supportOutflow, neutral]);
    assert(frontier.length === 1 && frontier[0].dateText === '2026/8/11', `Pareto 支配异常：${frontier.map((x) => x.dateText)}`);
});

test('日期选择：不同助力种类伴随不同负担时保留真实权衡，不用 coarse benefit/cost 提前剪枝', () => {
    const supportOutflow = node('2026/8/11', { support:true, outflow:true }, 1);
    const peerClean = node('2026/8/12', { peer:true }, 2);
    const comparison = api.buildDateSelectionComparison([supportOutflow, peerClean]);
    assert(comparison.status === 'tie', `生扶+泄力与纯比和被粗粒度换算：${comparison.summary}`);
});

test('日期选择：有助亦有软负担与完全中性之间互有长短，不强行决胜', () => {
    const supportOutflow = node('2026/8/11', { support:true, outflow:true }, 1);
    const neutral = node('2026/8/12', {}, 2);
    const comparison = api.buildDateSelectionComparison([supportOutflow, neutral]);
    assert(comparison.status === 'tie', `收益/代价权衡被隐式总分化：${comparison.summary}`);
});

test('日期选择：生扶与比和不人为互换分值，纯生扶与纯比和可并列', () => {
    const support = node('2026/8/11', { support:true }, 1);
    const peer = node('2026/8/12', { peer:true }, 2);
    const comparison = api.buildDateSelectionComparison([support, peer]);
    assert(comparison.status === 'tie', `生扶/比和被隐式换算：${comparison.summary}`);
});

test('日期选择：泄力与耗力不人为规定高低，只有这两种软负担时可并列', () => {
    const outflow = node('2026/8/11', { outflow:true }, 1);
    const exertion = node('2026/8/12', { exertion:true }, 2);
    const comparison = api.buildDateSelectionComparison([outflow, exertion]);
    assert(comparison.status === 'tie', `泄力/耗力被隐式规定高低：${comparison.summary}`);
});

test('日期选择：如果所有候选都受制，则在受制层内部继续 Pareto 比较', () => {
    const constrainedSupport = node('2026/8/11', { constraint:true, support:true }, 1);
    const constrainedOnly = node('2026/8/12', { constraint:true }, 2);
    const comparison = api.buildDateSelectionComparison([constrainedSupport, constrainedOnly]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/11', `全受制场景未在同层继续比较：${comparison.summary}`);
});

test('日期选择：中性无负担日期支配仅有泄力/耗力的日期', () => {
    const neutral = node('2026/8/11', {}, 1);
    const outflow = node('2026/8/12', { outflow:true }, 2);
    const exertion = node('2026/8/13', { exertion:true }, 3);
    const frontier = api.nondominatedFrontier([neutral, outflow, exertion]);
    assert(frontier.length === 1 && frontier[0].dateText === '2026/8/11', `中性日期未支配纯软负担日期：${frontier.map((x) => x.dateText)}`);
});

test('日期选择：比较结果必须与非支配前沿完全一致', () => {
    const nodes = [
        node('2026/8/11', { support:true, outflow:true }, 1),
        node('2026/8/12', { peer:true }, 2),
        node('2026/8/13', { constraint:true, support:true }, 3)
    ];
    const comparison = api.buildDateSelectionComparison(nodes);
    const errors = api.validateSelectionComparison(comparison, nodes);
    assert(errors.length === 0, `Selection comparison schema/前沿不一致：${JSON.stringify(errors)}`);
});

test('日期选择：开发候选节点按 dominance fronts 取样，不再依赖旧 rank 排序', () => {
    const nodes = [
        node('2026/8/11', { support:true }, 1),
        node('2026/8/12', { outflow:true }, 2),
        node('2026/8/13', { constraint:true, support:true }, 3),
        node('2026/8/14', { constraint:true }, 4)
    ];
    const selected = api.selectCandidateNodesForReview(nodes, 4);
    assert(selected[0].dateText === '2026/8/11', `第一前沿错误：${selected.map((x) => x.dateText)}`);
    assert(selected.findIndex((x) => x.dateText === '2026/8/13') > selected.findIndex((x) => x.dateText === '2026/8/12'), '受制层没有排在无受制层之后');
});



test('结构相关性：实质效力相同的纯生扶日期，直接生扶优于外围关键爻生扶', () => {
    const direct = node('2026/8/11', { support:true }, 1, { support:6, trigger:6 });
    const keyLine = node('2026/8/12', { support:true }, 2, { support:3, trigger:3 });
    const comparison = api.buildDateSelectionComparison([direct, keyLine]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/11', `结构相关性未细化同质生扶日：${comparison.summary}`);
});

test('结构相关性：同样明确受制时，外围受制优于直接压到观察爻的受制', () => {
    const directConstraint = node('2026/8/11', { constraint:true }, 1, { constraint:6, trigger:6 });
    const keyConstraint = node('2026/8/12', { constraint:true }, 2, { constraint:3, trigger:3 });
    const comparison = api.buildDateSelectionComparison([directConstraint, keyConstraint]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/12', `直接受制未被视为更明确负担：${comparison.summary}`);
});

test('结构相关性：纯助力且实质效力相同时，直接触发可细化同质日期', () => {
    const directTrigger = node('2026/8/11', { support:true, trigger:true }, 1, { support:6, trigger:6 });
    const contextTrigger = node('2026/8/12', { support:true, trigger:true }, 2, { support:6, trigger:1 });
    const comparison = api.buildDateSelectionComparison([directTrigger, contextTrigger]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/11', `直接触发未细化纯助力日期：${comparison.summary}`);
});

test('结构相关性：不跨越生扶/比和不可比边界，即使一边结构更直接也继续并列', () => {
    const support = node('2026/8/11', { support:true }, 1, { support:6, trigger:6 });
    const peer = node('2026/8/12', { peer:true }, 2, { peer:1, trigger:1 });
    const comparison = api.buildDateSelectionComparison([support, peer]);
    assert(comparison.status === 'tie', `结构相关性越界替代了生扶/比和原则：${comparison.summary}`);
});

test('结构相关性：不把有助亦有泄力与完全中性通过相关性强行换算', () => {
    const mixed = node('2026/8/11', { support:true, outflow:true }, 1, { support:6, outflow:1, trigger:6 });
    const neutral = node('2026/8/12', {}, 2, {});
    const comparison = api.buildDateSelectionComparison([mixed, neutral]);
    assert(comparison.status === 'tie', `结构相关性重新引入了跨维度总分：${comparison.summary}`);
});


test('日期选择：六维 Pareto 中，生扶+比和支配只有生扶', () => {
    const supportPeer = node('2026/8/11', { support:true, peer:true }, 1);
    const supportOnly = node('2026/8/12', { support:true }, 2);
    const comparison = api.buildDateSelectionComparison([supportPeer, supportOnly]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/11', `额外比和维度未形成支配：${comparison.summary}`);
});

test('日期选择：六维 Pareto 中，只有泄力支配同时泄力+耗力', () => {
    const outflowOnly = node('2026/8/11', { outflow:true }, 1);
    const outflowExertion = node('2026/8/12', { outflow:true, exertion:true }, 2);
    const comparison = api.buildDateSelectionComparison([outflowOnly, outflowExertion]);
    assert(comparison.status === 'preferred' && comparison.preferredDates[0] === '2026/8/11', `少一个软负担未形成支配：${comparison.summary}`);
});

test('日期选择：多一个有利维度同时多一个软负担时不可补偿，保留并列', () => {
    const supportPeerExertion = node('2026/8/11', { support:true, peer:true, exertion:true }, 1);
    const supportOnly = node('2026/8/12', { support:true }, 2);
    const comparison = api.buildDateSelectionComparison([supportPeerExertion, supportOnly]);
    assert(comparison.status === 'tie', `真实多维权衡被强行排序：${comparison.summary}`);
});

test('日期选择：比较器显式标记六维非补偿 Pareto', () => {
    const comparison = api.buildDateSelectionComparison([
        node('2026/8/11', { support:true }, 1),
        node('2026/8/12', { outflow:true }, 2)
    ]);
    assert(comparison.selectionMode === 'six-dimensional-non-compensatory-pareto', `selectionMode 未冻结为六维模型：${comparison.selectionMode}`);
});

test('beta.2 并列日期实质效力与结构相关性相同，文案写条件接近', () => {
    const a = node('2026/8/14', { support:true }, 1, { support:6 });
    const b = node('2026/8/15', { support:true }, 2, { support:6 });
    const comparison = api.buildDateSelectionComparison([a,b]);
    assert(comparison.status === 'tie', `测试前提未并列：${comparison.summary}`);
    assert(comparison.tieReason === 'equivalent-conditions' && comparison.summary.includes('当前条件接近'), `同条件并列仍写各有侧重：${comparison.summary}`);
});

test('beta.2 真正不可比权衡仍写各有侧重', () => {
    const a = node('2026/8/14', { support:true }, 1);
    const b = node('2026/8/15', { peer:true }, 2);
    const comparison = api.buildDateSelectionComparison([a,b]);
    assert(comparison.status === 'tie', `测试前提未并列：${comparison.summary}`);
    assert(comparison.tieReason === 'tradeoff' && comparison.summary.includes('各有侧重'), `真实权衡被误写成条件接近：${comparison.summary}`);
});

console.log(`\nTimeSelection tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
