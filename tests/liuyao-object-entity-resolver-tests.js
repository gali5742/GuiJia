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
for (const file of [
    'js/liuyao-intent.js',
    'js/liuyao-participant-resolver.js',
    'js/liuyao-semantic-sufficiency.js',
    'js/liuyao-semantic-slot-provider.js',
    'js/liuyao-object-entity-resolver.js'
]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const resolver = context.GuiJia.liuyaoObjectEntityResolver;
const provider = context.GuiJia.liuyaoSemanticSlotProvider;
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
function slot(result, id) {
    return result.resolvedSlots.find((item) => item.id === id);
}
function evaluate(routeId, question, intent = null) {
    return provider.evaluateWithProviders({ routeId, question, ...(intent ? { intent } : {}) });
}
function resolvedIntent(event, semantics = {}, object = null) {
    return {
        version:'0.1', rawQuestion:'', status:'resolved', goals:[{ type:'outcome' }],
        event:{ type:event }, participants:[], confidence:0.92, ambiguities:[], semantics:{ ...semantics },
        ...(object ? { object } : {})
    };
}

test('OE1 Object/Entity Resolver v0.1 只绑定三个对象型 slot', () => {
    assert(resolver.version === '0.1', `version ${resolver.version} != 0.1`);
    const slots = [...new Set(Object.values(resolver.routeSlotMap))].sort();
    assert(JSON.stringify(slots) === JSON.stringify(['delivery_target','investment_target','purchase_object']), `unexpected slots ${slots.join(',')}`);
});

test('OE2 明确“这只股票”可提供 investment_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', question:'这只股票后面会不会涨' });
    const target = slot(result, 'investment_target');
    assert(target, '应解析 investment_target');
    assert(target.providerId === 'object_or_entity_resolver', `provider=${target.providerId}`);
    assert(/股票/.test(target.value), `value=${target.value}`);
});

test('OE3 裸“后面会不会涨”不能由 route 自行制造 investment_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', question:'后面会不会涨' });
    assert(!slot(result, 'investment_target'), '不应生成 investment_target');
});

test('OE4 没有类型证据的公司名保持保守，等待未来 entity typing', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', question:'英伟达下周还会涨吗' });
    assert(!slot(result, 'investment_target'), '仅公司名不应被当前高精度 resolver 自动认作 investment_target');
    assert(result.ignoredClaims.some((item) => item.reason === 'investment_type_not_confirmed'), '应记录 investment_type_not_confirmed');
});

test('OE5 ticker/code 可作为高精度 investment target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', question:'AAPL下周还会涨吗' });
    const target = slot(result, 'investment_target');
    assert(target?.value === 'AAPL', `实际 ${target?.value}`);
});

test('OE6 投资动作所支配的专名可提供 investment_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_profit', question:'我买入英伟达最后能不能赚钱' });
    const target = slot(result, 'investment_target');
    assert(target?.value === '英伟达', `实际 ${target?.value}`);
});

test('OE7 同一句出现两个投资对象时不静默挑一个', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', question:'这只股票和那只基金哪个会涨得更好' });
    assert(!slot(result, 'investment_target'), '多对象冲突不应解析成单一 target');
    assert(result.conflicts.some((item) => item.slotId === 'investment_target'), '应返回 investment_target conflict');
});

test('OE8 “我买的电脑什么时候能收到”可提供 delivery_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'receive_item', question:'我买的电脑什么时候能收到' });
    const target = slot(result, 'delivery_target');
    assert(target?.value === '电脑', `实际 ${target?.value}`);
});

test('OE9 裸“什么时候能收到”不制造 delivery_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'receive_item', question:'什么时候能收到' });
    assert(!slot(result, 'delivery_target'), '不应生成 delivery_target');
});

test('OE10 “我的订单明天能到吗”可提取显式订单 referent', () => {
    const result = provider.resolveSemanticSlots({ routeId:'receive_item', question:'我的订单明天能到吗' });
    const target = slot(result, 'delivery_target');
    assert(target?.value === '订单', `实际 ${target?.value}`);
});

test('OE11 “这台电脑值不值得买”可提供 purchase_object', () => {
    const result = provider.resolveSemanticSlots({ routeId:'item_purchase', question:'这台电脑值不值得买' });
    const target = slot(result, 'purchase_object');
    assert(target && /电脑/.test(target.value), `实际 ${target?.value}`);
});

test('OE12 裸“这个值得买吗”不能视为具体 purchase_object', () => {
    const result = provider.resolveSemanticSlots({ routeId:'item_purchase', question:'这个值得买吗' });
    assert(!slot(result, 'purchase_object'), '裸这个不应生成 purchase_object');
});

test('OE13 拉丁商品名可以作为显式 purchase_object', () => {
    const result = provider.resolveSemanticSlots({ routeId:'item_purchase', question:'MacBook Pro值不值得买' });
    const target = slot(result, 'purchase_object');
    assert(target?.value === 'MacBook Pro', `实际 ${target?.value}`);
});

test('OE14 structured Intent 已有对象时，不再用文本 resolver 制造第二个值', () => {
    const intent = resolvedIntent('item_purchase', { purchaseGoal:'value' }, { text:'这台电脑' });
    const result = provider.resolveSemanticSlots({ routeId:'item_purchase', question:'这台电脑值不值得买', intent });
    const target = slot(result, 'purchase_object');
    assert(target?.providerId === 'structured_intent', `provider=${target?.providerId}`);
    assert(!result.conflicts.some((item) => item.slotId === 'purchase_object'), '不应产生重复对象冲突');
});

test('OE15 Object resolver 只提供对象，不会凭对象补齐购买/交付动作语义', () => {
    const purchase = evaluate('item_purchase', '这本书值不值得看');
    assert(purchase.status === 'semantic_insufficient', `purchase 实际 ${purchase.status}`);
    assert(purchase.missing.some((item) => item.slotId === 'purchase_context'), '应仍缺 purchase_context');

    const delivery = evaluate('receive_item', '我的电脑明天怎么样');
    assert(delivery.status === 'semantic_insufficient', `delivery 实际 ${delivery.status}`);
    assert(delivery.missing.some((item) => item.slotId === 'delivery_context'), '应仍缺 delivery_context');
});

test('OE16 完整购买语义可由 structured context + object resolver 联合通过', () => {
    const intent = resolvedIntent('item_purchase', { purchaseGoal:'value' });
    const result = evaluate('item_purchase', '这台电脑值不值得买', intent);
    assert(result.status === 'sufficient', `实际 ${result.status}: ${JSON.stringify(result.missing)}`);
    assert(result.slotResolution.resolvedSlots.some((item) => item.id === 'purchase_object'), '应有 purchase_object');
});

test('OE17 完整收货语义可由 structured context + object resolver 联合通过', () => {
    const intent = resolvedIntent('receive_item', { deliveryMode:'courier' });
    const result = evaluate('receive_item', '我买的电脑什么时候能收到', intent);
    assert(result.status === 'sufficient', `实际 ${result.status}: ${JSON.stringify(result.missing)}`);
});

test('OE18 Provider audit 将三个对象型 slot 标为高精度已实现而非 interface-only', () => {
    for (const id of ['investment_target','delivery_target','purchase_object']) {
        assert(provider.providerAudit[id]?.current === 'implemented_high_precision', `${id} current=${provider.providerAudit[id]?.current}`);
    }
});

console.log(`\nObject/entity resolver regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
