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
    'js/liuyao-contextual-object-role-adapter.js',
    'js/liuyao-resolver-role-arbitration.js'
]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const provider = context.GuiJia.liuyaoSemanticSlotProvider;
const arbitration = context.GuiJia.liuyaoResolverRoleArbitration;
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
    return result.slotResolution.resolvedSlots.find((item) => item.id === id);
}
function objectCandidate(text) {
    return [{ text, evidence:text, strategy:'dev_upstream_candidate', confidence:0.99 }];
}
function prediction(entity, role, accepted = true, extras = {}) {
    return [{
        entity,
        role,
        type:role,
        confidence:extras.confidence ?? 0.82,
        score:extras.score ?? 0.82,
        margin:extras.margin ?? 0.26,
        threshold:extras.threshold ?? 0.4,
        accepted,
        modelId:'contextual-object-role-poc-v0.2'
    }];
}
function intent(event, semantics = {}, object = null) {
    return {
        version:'0.1', rawQuestion:'', status:'resolved', goals:[{ type:'outcome' }],
        event:{ type:event }, participants:[], confidence:0.98, ambiguities:[], semantics:{ ...semantics },
        ...(object ? { object } : {})
    };
}

test('RA1 arbitration v0.1 只作用于现代对象 slot', () => {
    assert(arbitration.version === '0.1', `version ${arbitration.version} != 0.1`);
    for (const slotId of ['investment_target','purchase_object','delivery_target']) {
        assert(provider.providerAudit[slotId]?.arbitration === 'resolver_role_v0.1', `${slotId} arbitration missing`);
    }
});

test('RA2 accepted investment role 可把过长 resolver 边界收窄到独立候选', () => {
    const question = 'Orion Motors股价值不值得继续持有';
    const result = provider.evaluateWithProviders({
        routeId:'investment_position_decision', question,
        objectCandidates:objectCandidate('Orion Motors'),
        objectRolePredictions:prediction('Orion Motors', 'investment_target_role')
    });
    const target = slot(result, 'investment_target');
    assert(target?.value === 'Orion Motors', `实际 ${target?.value || 'none'}`);
    assert(target?.providerId === 'contextual_object_role', `provider=${target?.providerId}`);
    assert(result.slotResolution.resolverRoleArbitrationDecisions.some((item) => item.action === 'refine_to_contextual_candidate'), '应记录边界收窄');
});

test('RA3 accepted purchase role 可修正“对象 + 用途说明”的过长边界', () => {
    const question = 'NovaPad作为旅行备用机值不值得买';
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question,
        intent:intent('item_purchase', { purchaseGoal:'value' }),
        objectCandidates:objectCandidate('NovaPad'),
        objectRolePredictions:prediction('NovaPad', 'purchase_target_role', true, { threshold:0.31 })
    });
    const target = slot(result, 'purchase_object');
    assert(target?.value === 'NovaPad', `实际 ${target?.value || 'none'}`);
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

test('RA4 accepted delivery role 可修正“对象 + 订单状态”的过长边界', () => {
    const question = 'Atlas Camera订单明天能不能送到';
    const result = provider.evaluateWithProviders({
        routeId:'receive_item', question,
        intent:intent('receive_item', { deliveryMode:'courier' }),
        objectCandidates:objectCandidate('Atlas Camera'),
        objectRolePredictions:prediction('Atlas Camera', 'delivery_target_role', true, { threshold:0.35 })
    });
    const target = slot(result, 'delivery_target');
    assert(target?.value === 'Atlas Camera', `实际 ${target?.value || 'none'}`);
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

test('RA5 explicit no_supported_role 不允许旧 resolver 绕过 role gate', () => {
    const question = 'NovaPad作为旅行备用机值不值得维修';
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question,
        intent:intent('item_purchase', { purchaseGoal:'value' }),
        objectCandidates:objectCandidate('NovaPad'),
        objectRolePredictions:prediction('NovaPad', 'no_supported_role', false, { confidence:0.73, score:0.73, threshold:0 })
    });
    assert(!slot(result, 'purchase_object'), `不应保留 purchase_object：${slot(result, 'purchase_object')?.value || ''}`);
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.slotResolution.resolverRoleArbitrationDecisions.some((item) => item.action === 'veto_object_resolver'), '应记录 resolver veto');
});

test('RA6 已 resolve 的 resolver 与 accepted candidate 完全分歧时转成显式冲突', () => {
    const question = '关于Nebula Tech，这只股票后面会不会涨';
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question,
        objectCandidates:objectCandidate('Nebula Tech'),
        objectRolePredictions:prediction('Nebula Tech', 'investment_target_role')
    });
    assert(!slot(result, 'investment_target'), '分歧时不得静默选择任一 target');
    assert(result.slotResolution.conflicts.some((item) => item.slotId === 'investment_target'), '应产生 investment_target conflict');
    assert(result.slotResolution.resolverRoleArbitrationDecisions.some((item) => item.action === 'emit_conflict'), '应记录仲裁冲突');
});

test('RA7 resolver 与 contextual candidate 完全一致时保留高精度 resolver', () => {
    const question = '这只股票后面会不会涨';
    const result = provider.evaluateWithProviders({
        routeId:'investment_price_trend', question,
        objectCandidates:objectCandidate('这只股票'),
        objectRolePredictions:prediction('这只股票', 'investment_target_role')
    });
    const target = slot(result, 'investment_target');
    assert(target?.providerId === 'object_or_entity_resolver', `provider=${target?.providerId}`);
    assert(result.slotResolution.resolverRoleArbitrationDecisions.some((item) => item.reason === 'exact_role_support'), '应记录 exact support');
});

test('RA8 structured Intent object 优先级高于 resolver-role 仲裁', () => {
    const question = 'NovaPad现在值不值得买';
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', question,
        intent:intent('item_purchase', { purchaseGoal:'value' }, { text:'NovaPad' }),
        objectCandidates:objectCandidate('另一台设备'),
        objectRolePredictions:prediction('另一台设备', 'purchase_target_role')
    });
    const target = slot(result, 'purchase_object');
    assert(target?.providerId === 'structured_intent', `provider=${target?.providerId}`);
    assert(target?.value === 'NovaPad', `value=${target?.value}`);
    assert(result.slotResolution.resolverRoleArbitrationStatus === 'structured_intent_priority', `status=${result.slotResolution.resolverRoleArbitrationStatus}`);
});

test('RA9 没有独立上游 candidate/prediction 时保持旧 resolver 行为', () => {
    const result = provider.evaluateWithProviders({ routeId:'investment_price_trend', question:'这只股票后面会不会涨' });
    const target = slot(result, 'investment_target');
    assert(target?.providerId === 'object_or_entity_resolver', `provider=${target?.providerId}`);
    assert(result.slotResolution.resolverRoleArbitrationStatus === 'inactive', `status=${result.slotResolution.resolverRoleArbitrationStatus}`);
});

console.log(`\nResolver-role arbitration regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
