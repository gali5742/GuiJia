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
    'js/liuyao-object-entity-resolver.js',
    'js/liuyao-entity-typing-adapter.js'
]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const provider = context.GuiJia.liuyaoSemanticSlotProvider;
const adapter = context.GuiJia.liuyaoEntityTypingAdapter;
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
function hasSlot(result, id, value) {
    return result.slotResolution.resolvedSlots.some((slot) => slot.id === id && (!value || slot.value.includes(value)));
}

const investPrediction = (entity, confidence = 0.91, accepted = true, extras = {}) => [{
    entity,
    type:'investment_asset',
    confidence,
    score:extras.score ?? confidence,
    margin:extras.margin ?? 0.18,
    threshold:extras.threshold ?? 0.33,
    accepted,
    modelId:'entity-typing-poc-v0.1'
}];

test('ET1 adapter 只定义现代对象类型，不包含传统术数字段', () => {
    assert(adapter.version === '0.1', `version ${adapter.version} != 0.1`);
    assert(adapter.typeToSlot.investment_asset === 'investment_target', 'investment_asset mapping missing');
    assert(adapter.acceptancePolicy === 'provider_calibrated', '应使用 Entity Typing 自身校准决策');
    const serialized = JSON.stringify(adapter);
    for (const forbidden of ['妻财','官鬼','父母','兄弟','子孙','世爻','应爻']) {
        assert(!serialized.includes(forbidden), `不得出现 ${forbidden}`);
    }
});

test('ET2 裸公司专名在没有 entity typing 时仍不能制造 investment_target', () => {
    const result = provider.evaluateWithProviders({ routeId:'investment_price_trend', question:'英伟达下周还会涨吗' });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(!hasSlot(result, 'investment_target'), 'route + 裸专名不应直接成立');
});

test('ET3 高置信且 accepted 的 investment_asset 可将裸专名绑定为 investment_target', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        entityTypingPredictions:investPrediction('英伟达', 0.93)
    });
    assert(hasSlot(result, 'investment_target', '英伟达'), '应解析 investment_target');
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    const slot = result.slotResolution.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot.providerId === 'entity_typing', `provider ${slot.providerId} != entity_typing`);
    assert(slot.provenance?.type === 'investment_asset', '应保留 typing provenance');
    assert(slot.provenance?.acceptancePolicy === 'provider_calibrated', '应记录 provider-calibrated acceptance');
});

test('ET4 score 低于旧 0.65 但已通过自身 threshold + margin 时仍允许补 slot', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        entityTypingPredictions:investPrediction('英伟达', 0.635, true, { score:0.635, threshold:0.327, margin:0.499 })
    });
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    assert(hasSlot(result, 'investment_target', '英伟达'), '通过自身校准决策后不应再受固定 0.65 阈值阻断');
    assert(!result.slotResolution.ignoredClaims.some((item) => item.providerId === 'entity_typing' && item.reason === 'below_confidence_floor'), '不应再出现 below_confidence_floor');
});

test('ET5 Entity Typing 自身 accepted=false 时不得补齐 required slot', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下一次财报什么时候发布',
        entityTypingPredictions:investPrediction('英伟达下一次财报', 0.3155, false, { score:0.3155, threshold:0.327, margin:0.0018 })
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(!hasSlot(result, 'investment_target'), '未通过 typing 自身校准时不得补 slot');
    assert(result.slotResolution.ignoredClaims.some((item) => item.providerId === 'entity_typing' && item.reason === 'typing_not_accepted'), '应记录 typing_not_accepted');
});

test('ET6 类型不兼容时不得借 candidate route 强行改写类型', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        entityTypingPredictions:[{ entity:'英伟达', type:'purchasable_item', confidence:0.94, score:0.94, margin:0.5, threshold:0.35, accepted:true, modelId:'fixture' }]
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.slotResolution.ignoredClaims.some((item) => item.reason === 'type_incompatible_with_route'), '应记录类型不兼容');
});

test('ET7 unknown 类型保持 unresolved', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        entityTypingPredictions:[{ entity:'英伟达', type:'unknown', confidence:0.95, score:0.95, margin:0.2, threshold:0, accepted:true, modelId:'fixture' }]
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.slotResolution.ignoredClaims.some((item) => item.reason === 'typed_unknown'), '应记录 typed_unknown');
});

test('ET8 prediction 必须对应当前问题实际抽出的 candidate', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        entityTypingPredictions:investPrediction('特斯拉', 0.97)
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(!hasSlot(result, 'investment_target'), '无关 prediction 不得绑定');
});

test('ET9 高精度 Object Resolver 已有 slot 时 Entity Typing 不重复制造 claim', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'这只股票下周还会涨吗',
        entityTypingPredictions:[{ entity:'这只股票', type:'investment_asset', confidence:0.99, score:0.99, margin:0.6, threshold:0.33, accepted:true, modelId:'fixture' }]
    });
    const slot = result.slotResolution.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot?.providerId === 'object_or_entity_resolver', `应优先保留 object resolver，实际 ${slot?.providerId}`);
    assert(result.slotResolution.ignoredClaims.some((item) => item.providerId === 'entity_typing' && item.reason === 'slot_already_resolved'), 'typing 应退让');
});

test('ET10 item_purchase 只接受 accepted purchasable_item 类型作为 typing 补充', () => {
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question:'Acme One现在值不值得买',
        entityTypingPredictions:[{ entity:'Acme One', type:'purchasable_item', confidence:0.62, score:0.62, margin:0.31, threshold:0.35, accepted:true, modelId:'fixture' }],
        contextSlots:[{ id:'purchase_context', value:'购买适宜性', confidence:0.99 }]
    });
    assert(hasSlot(result, 'purchase_object', 'Acme One'), '应补 purchase_object');
});

test('ET11 receive_item 只接受 accepted delivery_subject 类型作为 typing 补充', () => {
    const result = provider.evaluateWithProviders({
        routeId:'receive_item', question:'PackageX明天能到吗',
        entityTypingPredictions:[{ entity:'PackageX', type:'delivery_subject', confidence:0.58, score:0.58, margin:0.24, threshold:0.45, accepted:true, modelId:'fixture' }],
        contextSlots:[{ id:'delivery_context', value:'交付', confidence:0.99 }]
    });
    assert(hasSlot(result, 'delivery_target', 'PackageX'), '应补 delivery_target');
});

console.log(`\nEntity typing adapter regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
