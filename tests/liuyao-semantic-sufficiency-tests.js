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
vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js/liuyao-semantic-sufficiency.js'), 'utf8'),
    context,
    { filename:'js/liuyao-semantic-sufficiency.js' }
);

const sufficiency = context.GuiJia.liuyaoSemanticSufficiency;
let passed = 0;
let failed = 0;

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
function evaluate(routeId, question, contextSlots = []) {
    return sufficiency.evaluateQuestion(routeId, question, contextSlots);
}
function assertSufficient(routeId, question, contextSlots = []) {
    const result = evaluate(routeId, question, contextSlots);
    assert(result.status === 'sufficient', `${question} 应 sufficient，实际 ${result.status}: ${JSON.stringify(result.missing)}`);
    return result;
}
function assertInsufficient(routeId, question) {
    const result = evaluate(routeId, question);
    assert(result.status === 'semantic_insufficient', `${question} 应 semantic_insufficient，实际 ${result.status}`);
    assert(result.reasonCode === 'missing_required_semantics', `reasonCode ${result.reasonCode} != missing_required_semantics`);
    assert(result.missing.length > 0, 'semantic_insufficient 必须说明缺失语义');
    return result;
}

test('SS1 合同固定为 v0.1，覆盖当前 15 个现代语义 route', () => {
    assert(sufficiency.version === '0.1', `version ${sufficiency.version} != 0.1`);
    assert(Object.keys(sufficiency.routeRequirements).length === 15, 'route requirement matrix 应覆盖 15 类');
});

test('SS2 所有 requirement 引用的 slot 都必须在 SemanticSlot schema 中存在', () => {
    const schema = sufficiency.slotSchema;
    for (const [routeId, requirement] of Object.entries(sufficiency.routeRequirements)) {
        const refs = [
            ...requirement.requiredAll,
            ...requirement.optional,
            ...requirement.contextRecoverable,
            ...requirement.requiredAny.flatMap((group) => group.slots)
        ];
        refs.forEach((slotId) => assert(schema[slotId], `${routeId} 引用了未知 slot ${slotId}`));
    }
});

test('SS3 股票趋势：明确标的足够，裸“后面会不会涨”不足', () => {
    assertSufficient('investment_price_trend', '这只股票后面会不会涨');
    const result = assertInsufficient('investment_price_trend', '后面会不会涨');
    assert(result.missing.some((item) => item.slotId === 'investment_target'), '应缺 investment_target');
});

test('SS4 收货：明确物品+交付语境足够，裸“什么时候能收到”不足', () => {
    assertSufficient('receive_item', '我买的电脑什么时候能收到');
    const result = assertInsufficient('receive_item', '什么时候能收到');
    assert(result.questionSlots.some((slot) => slot.id === 'delivery_context'), '应识别 receive 语境');
    assert(result.missing.some((item) => item.slotId === 'delivery_target'), '应缺 delivery_target');
});

test('SS5 债务偿还：明确房贷足够，裸“今年能还完吗”不足', () => {
    assertSufficient('debt_repayment', '房贷今年能还完吗');
    const result = assertInsufficient('debt_repayment', '今年能还完吗');
    assert(result.missing.some((item) => item.slotId === 'debt_context'), '应缺 debt_context');
});

test('SS6 恋爱发展：明确对象足够，裸“我们有机会吗”不足', () => {
    assertSufficient('relationship_development', '我和这个女生有机会吗');
    const result = assertInsufficient('relationship_development', '我们有机会吗');
    assert(result.missing.some((item) => item.slotId === 'specific_counterpart'), '应缺 specific_counterpart');
});

test('SS7 上下文可恢复投资标的，不要求当前句重复名词', () => {
    const result = assertSufficient('investment_price_trend', '后面会不会涨', [
        { id:'investment_target', source:'context', evidence:'前文：这只股票' }
    ]);
    assert(result.usedContextSlots.some((slot) => slot.id === 'investment_target'), '应记录 context recovery');
});

test('SS8 上下文可恢复特定关系对象', () => {
    const result = assertSufficient('relationship_development', '我们有机会吗', [
        { id:'specific_counterpart', source:'context', evidence:'前文：新认识的男生' }
    ]);
    assert(result.usedContextSlots.some((slot) => slot.id === 'specific_counterpart'), '应使用前文特定对象');
});

test('SS9 婚配：“这门亲事”本身可以建立婚配目标', () => {
    const result = assertSufficient('marriage_match', '这门亲事能不能成');
    assert(result.resolvedSlots.some((slot) => slot.id === 'marriage_proposal_context'), '应识别 marriage_proposal_context');
});

test('SS10 既有婚姻必须有夫妻/配偶/婚姻证据', () => {
    assertSufficient('marital_relationship', '我和老婆最近还能和好吗');
    assertInsufficient('marital_relationship', '我们最近还能和好吗');
});

test('SS11 商品购买：明确物品足够，裸“这个值得买吗”不足', () => {
    assertSufficient('item_purchase', '这台电脑现在值得买吗');
    const result = assertInsufficient('item_purchase', '这个值得买吗');
    assert(result.missing.some((item) => item.slotId === 'purchase_object'), '应缺 purchase_object');
});

test('SS12 工资与总体收入保持语义职责分离', () => {
    assertSufficient('income_salary', '公司今年会不会给我涨工资');
    assertInsufficient('income_salary', '今年收入会不会增加');
    assertSufficient('financial_fortune', '今年整体收入会不会增加');
});

test('SS13 经营盈利必须有经营语境，不能只凭“最终有没有利润”', () => {
    assertSufficient('business_operation', '我开的店最终有没有利润');
    assertInsufficient('business_operation', '最终有没有利润');
});

test('SS14 投资适宜性必须有投资对象', () => {
    assertSufficient('investment_suitability', '这只基金现在适不适合买');
    assertInsufficient('investment_suitability', '现在入手合适吗');
});

test('SS15 持仓决策由明确持仓处置语境建立，不要求重复股票名称', () => {
    assertSufficient('investment_position_decision', '现在清仓好还是继续持有');
    assertInsufficient('investment_position_decision', '我现在该卖吗');
});

test('SS16 Slot validator 拒绝未知 slot', () => {
    const result = sufficiency.validateSlots([{ id:'wife_wealth', source:'question' }]);
    assert(!result.valid, '未知 slot 不应通过');
    assert(result.errors.some((item) => item.code === 'unknown_slot_id'), '应返回 unknown_slot_id');
});

test('SS17 未登记 route 不伪装成 semantic_insufficient', () => {
    const result = sufficiency.evaluateSemanticSufficiency('job_interview', [], []);
    assert(result.status === 'unsupported_route', `实际 ${result.status}`);
    assert(result.reasonCode === 'route_requirement_missing', '应区分 requirement 未登记与信息不足');
});

test('SS18 当前显式 extractor 只是合同 fixture 工具，不把裸代词当特定对象', () => {
    const slots = sufficiency.extractExplicitSlots('他会答应我吗');
    assert(!slots.some((slot) => slot.id === 'specific_counterpart'), '裸代词不得直接视为特定对象已解析');
});

console.log(`\nSemantic sufficiency regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
