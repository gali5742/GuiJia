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
    'js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js','js/liuyao-time-review.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));
const reviewApi = context.GuiJia.liuyaoTimeReview;

const legacyNode = (dateText, summary, assessment = '', facts = []) => ({ dateText, dayGanZhi:'庚申', title:dateText, effectSummary:summary, assessment:{text:assessment,code:'mixed'}, facts });
const candidateNode = (dateText, summary, assessment = '', facts = [], kinds = []) => ({ dateText, dayGanZhi:'庚申', title:dateText, effectSummary:summary, assessment:{text:assessment,code:'mixed'}, facts, effectKinds:kinds });

test('同一首选日期识别为 same', () => {
    const diff = reviewApi.compareComparison(
        {status:'preferred',preferredDates:['2026/8/11'],summary:'旧'},
        {status:'preferred',preferredDates:['2026/8/11'],summary:'新'}
    );
    assert(diff.same && diff.kind === 'same', JSON.stringify(diff));
});


test('并列日期集合相同但顺序不同仍视为 same', () => {
    const diff = reviewApi.compareComparison(
        {status:'tie',preferredDates:['2026/8/14','2026/8/15'],summary:'旧'},
        {status:'tie',preferredDates:['2026/8/15','2026/8/14'],summary:'新'}
    );
    assert(diff.same && diff.kind === 'same', JSON.stringify(diff));
});

test('首选日期变化识别为 preferred-date-changed', () => {
    const diff = reviewApi.compareComparison(
        {status:'preferred',preferredDates:['2026/8/11'],summary:'旧'},
        {status:'preferred',preferredDates:['2026/8/14'],summary:'新'}
    );
    assert(!diff.same && diff.kind === 'preferred-date-changed', JSON.stringify(diff));
});

test('旧并列转新单一首选单独分类', () => {
    const diff = reviewApi.compareComparison(
        {status:'tie',preferredDates:['2026/8/11','2026/8/14'],summary:'旧'},
        {status:'preferred',preferredDates:['2026/8/14'],summary:'新'}
    );
    assert(diff.kind === 'tie-to-preferred', JSON.stringify(diff));
});

test('日期集合变化保留 legacy-only / candidate-only，不伪装成文案差异', () => {
    const nodes = reviewApi.compareNodes(
        [legacyNode('2026/8/11','旧A'), legacyNode('2026/8/12','旧B')],
        [candidateNode('2026/8/12','新B'), candidateNode('2026/8/14','新C')]
    );
    assert(nodes.find((item) => item.dateText === '2026/8/11')?.selection === 'legacy-only', JSON.stringify(nodes));
    assert(nodes.find((item) => item.dateText === '2026/8/14')?.selection === 'candidate-only', JSON.stringify(nodes));
    assert(nodes.find((item) => item.dateText === '2026/8/12')?.selection === 'both', JSON.stringify(nodes));
});

test('对照文本同时输出旧摘要与新摘要，但不依赖正式复制上下文', () => {
    const focus = {
        kind:'range', mode:'date-selection',
        comparison:{status:'preferred',preferredDates:['2026/8/11'],summary:'旧选11'},
        keyNodes:[legacyNode('2026/8/11','触发偏向生扶','优先观察：旧','观察A'.split('|'))],
        candidateOutput:{
            comparison:{status:'preferred',preferredDates:['2026/8/14'],summary:'新选14'},
            keyNodes:[candidateNode('2026/8/14','触发伴随受制','谨慎观察：新',['目标日克制：证据'],['trigger','constraint'])]
        }
    };
    const review = reviewApi.buildQuestionTimeReview(focus);
    const text = reviewApi.formatQuestionTimeReview(review);
    assert(text.includes('旧比较：旧选11') && text.includes('新比较：新选14'), text);
    assert(text.includes('触发偏向生扶') && text.includes('触发伴随受制'), text);
    assert(reviewApi.validateQuestionTimeReview(review).length === 0, JSON.stringify(review));
});


test('beta.1 正式切换后 Time Review 从 legacyShadow 对照 production top-level', () => {
    const focus = {
        kind:'range', outputModel:'time-v2',
        comparison:{status:'preferred',preferredDates:['2026/8/14'],summary:'新'},
        keyNodes:[candidateNode('2026/8/14','新摘要')],
        legacyShadow:{
            comparison:{status:'preferred',preferredDates:['2026/8/11'],summary:'旧'},
            keyNodes:[legacyNode('2026/8/11','旧摘要')]
        },
        candidateOutput:{comparison:{status:'preferred',preferredDates:['2026/8/14'],summary:'新'},keyNodes:[]}
    };
    const review = reviewApi.buildQuestionTimeReview(focus);
    assert(review.comparison.kind === 'preferred-date-changed', `beta shadow 比较差异识别失败：${JSON.stringify(review)}`);
    assert(review.nodes.some((item) => item.selection === 'legacy-only') && review.nodes.some((item) => item.selection === 'candidate-only'), `beta shadow 节点集合未正确对照：${JSON.stringify(review.nodes)}`);
});
console.log(`\nTimeReview tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
