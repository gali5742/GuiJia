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
    'js/liuyao-contextual-object-role-adapter.js'
]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const provider = context.GuiJia.liuyaoSemanticSlotProvider;
const adapter = context.GuiJia.liuyaoContextualObjectRoleAdapter;
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

const prediction = (entity, role, accepted = true, extras = {}) => [{
    entity,
    role,
    type:role,
    confidence:extras.confidence ?? 0.81,
    score:extras.score ?? 0.81,
    margin:extras.margin ?? 0.22,
    threshold:extras.threshold ?? 0.45,
    accepted,
    modelId:'contextual-object-role-poc-v0.2'
}];
const objectCandidate = (text) => [{ text, evidence:text, strategy:'test_upstream_candidate', confidence:0.99 }];

test('OR1 adapter 只输出现代对象角色与 slot，不包含传统术数字段', () => {
    assert(adapter.version === '0.2', `version ${adapter.version} != 0.2`);
    assert(adapter.roleToSlot.investment_target_role === 'investment_target', 'investment role mapping missing');
    assert(adapter.roleToSlot.purchase_target_role === 'purchase_object', 'purchase role mapping missing');
    assert(adapter.roleToSlot.delivery_target_role === 'delivery_target', 'delivery role mapping missing');
    const serialized = JSON.stringify(adapter);
    for (const forbidden of ['妻财','官鬼','父母','兄弟','子孙','世爻','应爻']) {
        assert(!serialized.includes(forbidden), `不得出现 ${forbidden}`);
    }
});

test('OR2 裸专名在没有 role prediction 时仍不得制造 investment_target', () => {
    const result = provider.evaluateWithProviders({ routeId:'investment_price_trend', question:'英伟达下周还会涨吗' });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(!hasSlot(result, 'investment_target'), '不得由 route + 专名直接制造 slot');
});

test('OR3 accepted investment_target_role 可补 investment_target', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        objectRolePredictions:prediction('英伟达', 'investment_target_role')
    });
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    assert(hasSlot(result, 'investment_target', '英伟达'), '应补 investment_target');
    const slot = result.slotResolution.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot.providerId === 'contextual_object_role', `provider ${slot.providerId}`);
    assert(slot.provenance?.role === 'investment_target_role', '应保留 role provenance');
});

test('OR4 no_supported_role 不得补 slot', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下一次财报什么时候发布',
        objectRolePredictions:prediction('英伟达', 'no_supported_role', false, { confidence:0.71, score:0.71, margin:0.18, threshold:0 })
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(!hasSlot(result, 'investment_target'), 'no role 不应补 slot');
});

test('OR5 商品实体的非购买问题不得因为商品身份补 purchase_object', () => {
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question:'AcmeBook怎么更换硬盘',
        objectCandidates:objectCandidate('AcmeBook'),
        objectRolePredictions:prediction('AcmeBook', 'no_supported_role', false, { confidence:0.74, score:0.74, margin:0.31, threshold:0 })
    });
    assert(!hasSlot(result, 'purchase_object'), '非购买事件不应补 purchase_object');
});

test('OR6 purchase_target_role 只在 item_purchase route 下兼容', () => {
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question:'AcmeBook现在值不值得买',
        objectCandidates:objectCandidate('AcmeBook'),
        objectRolePredictions:prediction('AcmeBook', 'purchase_target_role', true, { confidence:0.62, score:0.62, margin:0.29, threshold:0.4 }),
        contextSlots:[{ id:'purchase_context', value:'购买适宜性', confidence:0.99 }]
    });
    assert(hasSlot(result, 'purchase_object', 'AcmeBook'), '应补 purchase_object');
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

test('OR7 delivery_target_role 只在 receive_item route 下兼容', () => {
    const result = provider.evaluateWithProviders({
        routeId:'receive_item', question:'PackageZ明天能送到吗',
        objectCandidates:objectCandidate('PackageZ'),
        objectRolePredictions:prediction('PackageZ', 'delivery_target_role', true, { confidence:0.58, score:0.58, margin:0.21, threshold:0.45 }),
        contextSlots:[{ id:'delivery_context', value:'交付', confidence:0.99 }]
    });
    assert(hasSlot(result, 'delivery_target', 'PackageZ'), '应补 delivery_target');
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

test('OR8 role 与 route 不兼容时不得强行改写', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        objectCandidates:objectCandidate('英伟达'),
        objectRolePredictions:prediction('英伟达', 'purchase_target_role')
    });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.slotResolution.ignoredClaims.some((item) => item.reason === 'role_incompatible_with_route'), '应记录不兼容');
});

test('OR9 accepted=false 时不得补 slot，即使 top role 看起来兼容', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        objectCandidates:objectCandidate('英伟达'),
        objectRolePredictions:prediction('英伟达', 'investment_target_role', false, { confidence:0.44, score:0.44, margin:0.01, threshold:0.4 })
    });
    assert(!hasSlot(result, 'investment_target'), '未接受的 role 不得补 slot');
    assert(result.slotResolution.ignoredClaims.some((item) => item.reason === 'role_not_accepted'), '应记录 role_not_accepted');
});

test('OR10 prediction 必须对应当前问题实际 candidate', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'英伟达下周还会涨吗',
        objectCandidates:objectCandidate('英伟达'),
        objectRolePredictions:prediction('特斯拉', 'investment_target_role')
    });
    assert(!hasSlot(result, 'investment_target'), '无关实体 prediction 不得绑定');
});

test('OR11 高精度 Object Resolver 已解决 slot 时 role provider 退让', () => {
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question:'这只股票下周还会涨吗',
        objectRolePredictions:prediction('这只股票', 'investment_target_role', true, { confidence:0.99, score:0.99, margin:0.65, threshold:0.4 })
    });
    const slot = result.slotResolution.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot?.providerId === 'object_or_entity_resolver', `应保留高精度 resolver，实际 ${slot?.providerId}`);
    assert(result.slotResolution.ignoredClaims.some((item) => item.providerId === 'contextual_object_role' && item.reason === 'slot_already_resolved'), 'role provider 应退让');
});

test('OR12 上游 objectCandidates 可为局部抽取器识别不到的上下文提供独立对象证据', () => {
    const question = '英伟达这轮回调后还有机会重新走强吗';
    const withoutCandidate = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question,
        objectRolePredictions:prediction('英伟达', 'investment_target_role', true, { confidence:0.67, score:0.67, margin:0.55, threshold:0.4 })
    });
    assert(!hasSlot(withoutCandidate, 'investment_target'), 'prediction 自己不得制造对象候选');

    const withCandidate = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question,
        objectCandidates:objectCandidate('英伟达'),
        objectRolePredictions:prediction('英伟达', 'investment_target_role', true, { confidence:0.67, score:0.67, margin:0.55, threshold:0.4 })
    });
    assert(hasSlot(withCandidate, 'investment_target', '英伟达'), '上游对象候选 + accepted role 应补 investment_target');
    assert(withCandidate.status === 'sufficient', `实际 ${withCandidate.status}`);
    assert(withCandidate.slotResolution.contextualObjectRoleCandidateSource === 'upstream_object_candidates', '应记录 candidate source');
});

test('OR13 上游 purchase candidate 可补 purchase_object，而 route/prediction 单独仍不够', () => {
    const question = 'MacBook Pro现在这个价格值不值得买';
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question,
        intent:{ version:'0.1', rawQuestion:question, status:'resolved', goals:[], event:{type:'item_purchase'}, participants:[], confidence:0.99, ambiguities:[], semantics:{} },
        objectCandidates:objectCandidate('MacBook Pro'),
        objectRolePredictions:prediction('MacBook Pro', 'purchase_target_role', true, { confidence:0.63, score:0.63, margin:0.50, threshold:0.31 })
    });
    assert(hasSlot(result, 'purchase_context'), '应保留 structured purchase_context');
    assert(hasSlot(result, 'purchase_object', 'MacBook Pro'), 'accepted purchase role 应补 purchase_object');
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

console.log(`\nContextual object role adapter regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
