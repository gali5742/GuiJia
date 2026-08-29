#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl, Promise, Set, TypeError };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/question-time.js',
    'js/liuyao-intent.js',
    'js/liuyao-commercial-event-resolver.js',
    'js/liuyao-participant-resolver.js',
    'js/liuyao-semantic-parser.js',
    'js/liuyao-rule-registry.js',
    'js/liuyao-observation-plan.js'
].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});

const parser = context.GuiJia.liuyaoSemanticParser;
const planner = context.GuiJia.liuyaoObservationPlan;
let passed = 0;
let failed = 0;

const BASE_ROWS = [
    { position:1, relation:'父母', isShi:true, isYing:false, moving:false },
    { position:2, relation:'妻财', isShi:false, isYing:false, moving:false },
    { position:3, relation:'官鬼', isShi:false, isYing:false, moving:false },
    { position:4, relation:'兄弟', isShi:false, isYing:true, moving:false },
    { position:5, relation:'子孙', isShi:false, isYing:false, moving:false },
    { position:6, relation:'兄弟', isShi:false, isYing:false, moving:false }
];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

test('ST1 commercial resolver 在完整 semantic stack 中仍可到达 TR-001-B', () => {
    const result = planner.analyzeQuestionToPlan('这笔商业买卖和客户能不能成交？', BASE_ROWS);
    assert(result.intent?.event?.type === 'transaction', `event=${result.intent?.event?.type}`);
    assert(result.intent?.semantics?.transactionPurpose === 'commercial_trade', `purpose=${result.intent?.semantics?.transactionPurpose}`);
    assert(result.selection?.baseRuleRefs?.[0] === 'TR-001-B', `rule=${result.selection?.baseRuleRefs?.[0]}`);
    assert(result.plan?.status === 'resolved', `plan=${result.plan?.status}`);
});

test('ST2 participant resolver 在商业扩展之后仍保留恋爱双方语义', () => {
    const result = planner.analyzeQuestionToPlan('我是男生，和一个女性朋友能不能发展为恋爱关系？', BASE_ROWS);
    assert(result.intent?.event?.type === 'relationship_development', `event=${result.intent?.event?.type}`);
    assert(result.intent?.semantics?.querentSex === 'male', `querentSex=${result.intent?.semantics?.querentSex}`);
    assert(result.intent?.semantics?.counterpartSex === 'female', `counterpartSex=${result.intent?.semantics?.counterpartSex}`);
    assert(result.intent?.participants?.some((item) => item.role === 'romantic_counterpart' && item.specificity === 'specific'), '缺 romantic_counterpart');
    assert(result.selection?.baseRuleRefs?.[0] === 'MR-001-A', `rule=${result.selection?.baseRuleRefs?.[0]}`);
});

test('ST3 semantic parser 仍能修正显式股票趋势，不受商业扩展干扰', () => {
    const parsed = parser.parseQuestionSync('这只股票现在跌了，下周还会不会涨');
    assert(parsed.intent?.event?.type === 'investment', `event=${parsed.intent?.event?.type}`);
    assert(parsed.intent?.semantics?.investmentGoal === 'price_trend', `goal=${parsed.intent?.semantics?.investmentGoal}`);
});

test('ST4 借入与借出方向在完整 stack 中保持分离', () => {
    const borrow = parser.parseQuestionSync('我向朋友借钱能不能借到？').intent;
    const lend = parser.parseQuestionSync('我把钱借给朋友合不合适？').intent;
    assert(borrow.event?.type === 'borrow_money', `borrow=${borrow.event?.type}`);
    assert(lend.event?.type === 'lend_money', `lend=${lend.event?.type}`);
});

test('ST5 新商业事件与独立感情目标并列时仍阻断 multiple_goals', () => {
    const parsed = parser.parseQuestionSync('我把钱借给朋友，而且我和这个女生能不能在一起？');
    assert(parsed.intent?.status === 'blocked', `status=${parsed.intent?.status}`);
    assert(parsed.intent?.blockReason === 'multiple_goals', `reason=${parsed.intent?.blockReason}`);
});

console.log(`\nSemantic stack composition regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
