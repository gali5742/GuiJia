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
function intent(goalType = 'outcome', extras = {}) {
    return {
        version:'0.1',
        status:'resolved',
        goals:[{ type:goalType }],
        event:{ type:extras.event || 'unknown' },
        semantics:extras.semantics || {},
        participants:extras.participants || [],
        confidence:0.95
    };
}
function evaluate(routeId, question, goalType = 'outcome', contextSlots = []) {
    const questionSlots = sufficiency.extractExplicitSlots(question);
    return sufficiency.evaluateIntentSufficiency(routeId, intent(goalType), questionSlots, contextSlots);
}
function assertSufficient(routeId, question, goalType = 'outcome', contextSlots = []) {
    const result = evaluate(routeId, question, goalType, contextSlots);
    assert(result.status === 'sufficient', `${question} 应 sufficient，实际 ${result.status}: ${JSON.stringify(result.missing)}`);
    return result;
}
function assertInsufficient(routeId, question, goalType = 'outcome') {
    const result = evaluate(routeId, question, goalType);
    assert(result.status === 'semantic_insufficient', `${question} 应 semantic_insufficient，实际 ${result.status}`);
    assert(result.missing.length > 0, 'semantic_insufficient 必须说明缺失语义');
    return result;
}

test('SS1 合同升级为 v0.2，覆盖完整 22-route inventory', () => {
    assert(sufficiency.version === '0.2', `version ${sufficiency.version} != 0.2`);
    assert(Object.keys(sufficiency.routeRequirements).length === 22, 'route requirement matrix 应覆盖 22 类');
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
        assert(requirement.requiresDivinationGoal === true, `${routeId} 应启用通用 divination-goal contract`);
    }
});

test('SS3 股票趋势：明确标的足够，裸“后面会不会涨”不足', () => {
    assertSufficient('investment_price_trend', '这只股票后面会不会涨');
    const result = assertInsufficient('investment_price_trend', '后面会不会涨');
    assert(result.missing.some((item) => item.slotId === 'investment_target'), '应缺 investment_target');
});

test('SS4 收货：明确物品+交付语境足够，裸“什么时候能收到”不足', () => {
    assertSufficient('receive_item', '我买的电脑什么时候能收到', 'timing');
    const result = assertInsufficient('receive_item', '什么时候能收到', 'timing');
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

test('SS7 上下文可恢复投资标的', () => {
    const result = evaluate('investment_price_trend', '后面会不会涨', 'outcome', [
        { id:'investment_target', source:'context', evidence:'前文：这只股票' }
    ]);
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    assert(result.usedContextSlots.some((slot) => slot.id === 'investment_target'), '应记录 context recovery');
});

test('SS8 婚配：“这门亲事”本身可以建立婚配目标', () => {
    const result = assertSufficient('marriage_match', '这门亲事能不能成');
    assert(result.resolvedSlots.some((slot) => slot.id === 'marriage_proposal_context'), '应识别 marriage_proposal_context');
});

test('SS9 既有婚姻必须有夫妻/配偶/婚姻证据', () => {
    assertSufficient('marital_relationship', '我和老婆最近还能和好吗');
    assertInsufficient('marital_relationship', '我们最近还能和好吗');
});

test('SS10 商品购买：明确物品足够，裸“这个值得买吗”不足', () => {
    assertSufficient('item_purchase', '这台电脑现在值得买吗', 'choice');
    const result = assertInsufficient('item_purchase', '这个值得买吗', 'choice');
    assert(result.missing.some((item) => item.slotId === 'purchase_object'), '应缺 purchase_object');
});

test('SS11 工资与总体收入保持语义职责分离', () => {
    assertSufficient('income_salary', '公司今年会不会给我涨工资');
    assertInsufficient('income_salary', '今年收入会不会增加');
    assertSufficient('financial_fortune', '今年整体收入会不会增加');
});

test('SS12 商业交易要求 bounded transaction context', () => {
    assertSufficient('commercial_transaction', '这笔商业交易月底前能不能成交');
    const result = assertInsufficient('commercial_transaction', '这个生意以后能不能赚钱');
    assert(result.missing.some((item) => item.slotId === 'transaction_context'), '应缺 transaction_context');
});

test('SS13 经营进货与个人购买分离', () => {
    assertSufficient('inventory_purchase', '门店这次采购一批库存能不能顺利');
    const result = assertInsufficient('inventory_purchase', '我买这台电脑自己用合适吗', 'choice');
    assert(result.missing.some((item) => item.slotId === 'inventory_purchase_context'), '个人购买不应满足 inventory_purchase_context');
});

test('SS14 经营库存销售与个人二手转卖分离', () => {
    assertSufficient('inventory_sale', '店里这批库存月底前能不能卖完');
    const result = assertInsufficient('inventory_sale', '我自用的旧平板能不能卖掉');
    assert(result.missing.some((item) => item.slotId === 'inventory_sale_context'), '个人二手出售不应满足 inventory_sale_context');
});

test('SS15 出借要求资金方向由占问者向外', () => {
    assertSufficient('lend_money', '朋友向我借钱我现在借给他合适吗', 'choice');
    const result = assertInsufficient('lend_money', '我向朋友借钱这次能不能借到');
    assert(result.missing.some((item) => item.slotId === 'lending_context'), '借入不应满足 lending_context');
});

test('SS16 讨债要求债权回收语境', () => {
    assertSufficient('debt_collection', '以前借给同事的钱现在能不能收回来');
    const result = assertInsufficient('debt_collection', '我欠银行的贷款年底前能不能结清');
    assert(result.missing.some((item) => item.slotId === 'debt_collection_context'), '自己还债不应满足 debt_collection_context');
});

test('SS17 合伙要求共同经营关系', () => {
    assertSufficient('partnership', '我和朋友合伙经营这家店能不能赚钱');
    const result = assertInsufficient('partnership', '我独自经营这个工作室能不能赚钱');
    assert(result.missing.some((item) => item.slotId === 'partnership_context'), '独自经营不应满足 partnership_context');
});

test('SS18 liquidation 有明确持仓处置语境即可满足 route-specific slots', () => {
    const result = sufficiency.evaluateSemanticSufficiency(
        'investment_liquidation',
        sufficiency.extractExplicitSlots('这只基金我准备全部赎回套现'),
        []
    );
    assert(result.status === 'sufficient', `slot-only 合同实际 ${result.status}`);
    assert(result.goalCheck === 'not_evaluated', 'legacy slot-only API 不应伪造 goal check');
});

test('SS19 liquidation 纯陈述：route known，但 intent goal unknown 时必须 semantic_insufficient', () => {
    const result = evaluate('investment_liquidation', '这只基金我准备全部赎回套现', 'unknown');
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.reasonCode === 'missing_divination_goal', `reason ${result.reasonCode} != missing_divination_goal`);
    assert(result.missing.some((item) => item.semanticId === 'divination_goal'), '应缺 divination_goal');
});

test('SS20 liquidation 同一语义若明确提出 outcome 占问则 sufficient', () => {
    assertSufficient('investment_liquidation', '这只基金我准备全部赎回套现能不能完成');
});

test('SS21 generic divination goal 必须来自 DivinationIntent.goals', () => {
    const questionSlots = sufficiency.extractExplicitSlots('这笔商业交易月底前成交');
    const unknown = sufficiency.evaluateIntentSufficiency('commercial_transaction', intent('unknown'), questionSlots, []);
    assert(unknown.status === 'semantic_insufficient', 'unknown goal 应阻断');
    assert(unknown.goalCheck.source === 'DivinationIntent.goals', 'goal 来源必须是 DivinationIntent.goals');
    const outcome = sufficiency.evaluateIntentSufficiency('commercial_transaction', intent('outcome'), questionSlots, []);
    assert(outcome.status === 'sufficient', `outcome goal 实际 ${outcome.status}`);
});

test('SS22 route-specific 缺失与 divination-goal 缺失可以同时报告', () => {
    const result = evaluate('debt_collection', '这件事以后再说', 'unknown');
    assert(result.missing.some((item) => item.slotId === 'debt_collection_context'), '应缺债权回收语境');
    assert(result.missing.some((item) => item.semanticId === 'divination_goal'), '同时应缺占问目标');
    assert(result.reasonCode === 'missing_required_semantics', '多重缺失不应简化为 only goal missing');
});

test('SS23 Slot validator 拒绝未知 slot', () => {
    const result = sufficiency.validateSlots([{ id:'wife_wealth', source:'question' }]);
    assert(!result.valid, '未知 slot 不应通过');
    assert(result.errors.some((item) => item.code === 'unknown_slot_id'), '应返回 unknown_slot_id');
});

test('SS24 未登记 route 不伪装成 semantic_insufficient', () => {
    const result = sufficiency.evaluateIntentSufficiency('job_interview', intent('outcome'), [], []);
    assert(result.status === 'unsupported_route', `实际 ${result.status}`);
    assert(result.reasonCode === 'route_requirement_missing', '应区分 requirement 未登记与信息不足');
});

test('SS25 当前显式 extractor 不把裸代词当特定对象', () => {
    const slots = sufficiency.extractExplicitSlots('他会答应我吗');
    assert(!slots.some((slot) => slot.id === 'specific_counterpart'), '裸代词不得直接视为特定对象已解析');
});

console.log(`\nSemantic sufficiency regression v0.2: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);