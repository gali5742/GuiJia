#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
[
    'js/question-time.js',
    'js/liuyao-intent.js',
    'js/liuyao-commercial-event-resolver.js',
    'js/liuyao-rule-registry.js',
    'js/liuyao-observation-plan.js'
].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});

const intentApi = context.GuiJia.liuyaoIntent;
const planner = context.GuiJia.liuyaoObservationPlan;
const resolver = context.GuiJia.liuyaoCommercialEventResolver;
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
function analyze(question) {
    return planner.analyzeQuestionToPlan(question, BASE_ROWS, [], { mode:'normal' });
}
function expectRule(question, eventType, ruleId) {
    const result = analyze(question);
    assert(result.intent?.status === 'resolved', `${question} intent=${result.intent?.status}/${result.intent?.blockReason || ''}`);
    assert(result.intent?.event?.type === eventType, `${question} event=${result.intent?.event?.type} != ${eventType}`);
    assert(result.selection?.baseRuleRefs?.[0] === ruleId, `${question} rule=${result.selection?.baseRuleRefs?.[0] || 'none'} != ${ruleId}`);
    assert(result.plan?.status === 'resolved', `${question} plan=${result.plan?.status}`);
    return result;
}

test('CE1 resolver v0.1 只补五个已存在 TR 规则的商业/债权事件入口', () => {
    assert(resolver.version === '0.1', `version=${resolver.version}`);
    const samples = [
        ['这笔商业买卖和客户能不能成交','transaction'],
        ['这次给店里进货能不能顺利','inventory_purchase'],
        ['店里这批库存月底前能不能卖掉','inventory_sale'],
        ['我把这笔钱借给朋友合不合适','lend_money'],
        ['朋友欠我的钱月底前能不能要回来','debt_collection']
    ];
    for (const [question, expected] of samples) {
        assert(resolver.detectCommercialEvent(question) === expected, `${question} => ${resolver.detectCommercialEvent(question)} != ${expected}`);
    }
});

test('CE2 商业交易入口命中 TR-001-B，并保留 counterparty 与 commercial_trade', () => {
    const result = expectRule('这笔商业买卖和客户能不能成交？', 'transaction', 'TR-001-B');
    assert(result.intent.semantics.transactionPurpose === 'commercial_trade', `purpose=${result.intent.semantics.transactionPurpose}`);
    assert(result.intent.participants.some((item) => item.role === 'counterparty'), '缺 counterparty');
    assert(result.intent.expectedState === 'transaction_completed', `state=${result.intent.expectedState}`);
});

test('CE3 进货入口命中 TR-001-C', () => {
    expectRule('这次给店里进货能不能顺利？', 'inventory_purchase', 'TR-001-C');
});

test('CE4 库存销售入口命中 TR-001-D', () => {
    const result = expectRule('店里这批库存月底前能不能卖掉？', 'inventory_sale', 'TR-001-D');
    assert(result.intent.expectedState === 'inventory_sold', `state=${result.intent.expectedState}`);
});

test('CE5 我方出借入口命中 TR-001-F，并区分借入方向', () => {
    const result = expectRule('我把这笔钱借给朋友合不合适？', 'lend_money', 'TR-001-F');
    assert(result.intent.participants.some((item) => item.role === 'borrower' && item.relationToQuerent === 'friend'), '缺 borrower/friend');

    const borrow = intentApi.parseDivinationIntent('我向朋友借钱能不能借到？');
    assert(borrow.event?.type === 'borrow_money', `借入方向被误判为 ${borrow.event?.type}`);
});

test('CE6 讨债入口命中 TR-001-G', () => {
    const result = expectRule('朋友欠我的钱月底前能不能要回来？', 'debt_collection', 'TR-001-G');
    assert(result.intent.participants.some((item) => item.role === 'debtor' && item.relationToQuerent === 'friend'), '缺 debtor/friend');
    assert(result.intent.expectedState === 'debt_recovered', `state=${result.intent.expectedState}`);
});

test('CE7 投资语境里的“出货”不得误判成库存销售', () => {
    const intent = intentApi.parseDivinationIntent('这只股票现在是不是该出货？');
    assert(intent.event?.type === 'investment', `event=${intent.event?.type}`);
});

test('CE8 借款人还债仍保持 debt_repayment，不被讨债入口抢走', () => {
    const intent = intentApi.parseDivinationIntent('我今年能不能把房贷全部还清？');
    assert(intent.event?.type === 'debt_repayment', `event=${intent.event?.type}`);
});

test('CE9 明确的新商业事件与另一个独立目标并列时仍 hard-stop multiple_goals', () => {
    const intent = intentApi.parseDivinationIntent('我把这笔钱借给朋友，而且今年财运怎么样？');
    assert(intent.status === 'blocked' && intent.blockReason === 'multiple_goals', `${intent.status}/${intent.blockReason}`);
});

test('CE10 新扩展层不得产生传统术数字段', () => {
    const serialized = JSON.stringify(intentApi.parseDivinationIntent('这笔商业买卖和客户能不能成交？'));
    for (const forbidden of ['妻财','官鬼','父母','兄弟','子孙','世爻','应爻','useGod','sixRelative']) {
        assert(!serialized.includes(forbidden), `Intent 不得出现 ${forbidden}`);
    }
});

console.log(`\nCommercial event resolver regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
