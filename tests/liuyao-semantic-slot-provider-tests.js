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
    'js/liuyao-semantic-slot-provider.js'
]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const provider = context.GuiJia.liuyaoSemanticSlotProvider;
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
function resolvedIntent(event, semantics = {}, extras = {}) {
    return {
        version:'0.1', rawQuestion:extras.rawQuestion || '', status:'resolved', goals:[{ type:'outcome' }],
        event:{ type:event }, participants:extras.participants || [], confidence:extras.confidence ?? 0.92,
        ambiguities:[], semantics:{ ...semantics }, ...(extras.object ? { object:extras.object } : {})
    };
}
function hasSlot(result, id) {
    return result.resolvedSlots.some((slot) => slot.id === id);
}

test('SP1 Provider audit 覆盖全部 15 个 SemanticSlot', () => {
    assert(provider.version === '0.1', `version ${provider.version} != 0.1`);
    const schemaSlots = Object.keys(sufficiency.slotSchema).sort();
    const auditSlots = Object.keys(provider.providerAudit).sort();
    assert(JSON.stringify(schemaSlots) === JSON.stringify(auditSlots), 'providerAudit 必须与 slot schema 一一覆盖');
});

test('SP2 Participant Resolver 能提供 specific_counterpart，并记录 provenance', () => {
    const result = provider.resolveSemanticSlots({ routeId:'relationship_development', question:'我和这个女生以后有机会吗' });
    const slot = result.resolvedSlots.find((item) => item.id === 'specific_counterpart');
    assert(slot, '应解析 specific_counterpart');
    assert(slot.providerId === 'participant_resolver', `provider ${slot.providerId} != participant_resolver`);
    assert(slot.provenance?.providerId === 'participant_resolver', '应保留 provider provenance');
});

test('SP3 裸代词不得由 Participant Resolver 伪装成已解析特定对象', () => {
    const result = provider.resolveSemanticSlots({ routeId:'relationship_development', question:'她会答应我吗' });
    assert(!hasSlot(result, 'specific_counterpart'), '裸“她”不应满足 specific_counterpart');
});

test('SP4 structured Intent 的 salary 事实提供 employment_income_context', () => {
    const result = provider.resolveSemanticSlots({ routeId:'income_salary', intent:resolvedIntent('income', { incomeType:'salary' }) });
    assert(hasSlot(result, 'employment_income_context'), 'salary intent 应提供 employment_income_context');
});

test('SP5 structured Intent 的 bonus 事实提供 bonus_context', () => {
    const result = provider.resolveSemanticSlots({ routeId:'income_bonus', intent:resolvedIntent('income', { incomeType:'bonus' }) });
    assert(hasSlot(result, 'bonus_context'), 'bonus intent 应提供 bonus_context');
});

test('SP6 structured Intent 的 position 状态提供 position_context', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_position_decision', intent:resolvedIntent('investment', { investmentAction:'hold', investmentPosition:'holding' }) });
    assert(hasSlot(result, 'position_context'), '持仓状态应提供 position_context');
});

test('SP7 route=investment 本身不得自动制造 investment_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', intent:resolvedIntent('investment', { investmentGoal:'price_trend' }) });
    assert(!hasSlot(result, 'investment_target'), '仅有 investment event 不足以制造 investment_target');
});

test('SP8 object/entity 事实可通过 structured Intent 提供 investment_target', () => {
    const result = provider.resolveSemanticSlots({ routeId:'investment_price_trend', intent:resolvedIntent('investment', { investmentGoal:'price_trend' }, { object:{ text:'这只股票' } }) });
    const slot = result.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot?.value === '这只股票', '应保留 investment target value');
});

test('SP9 explicit context 只允许恢复当前 route 声明为 contextRecoverable 的 slot', () => {
    const result = provider.resolveSemanticSlots({
        routeId:'investment_price_trend',
        contextSlots:[
            { id:'investment_target', value:'前文股票', confidence:0.98 },
            { id:'bonus_context', value:'年终奖', confidence:0.99 }
        ]
    });
    assert(hasSlot(result, 'investment_target'), '允许恢复 investment_target');
    assert(!hasSlot(result, 'bonus_context'), '不应注入与 route 无关的 context slot');
    assert(result.ignoredClaims.some((item) => item.slotId === 'bonus_context' && item.reason === 'context_not_recoverable_for_route'), '应记录被拒 context slot');
});

test('SP10 ML provider 只是接口：高置信预测可进入，低置信预测被忽略', () => {
    const result = provider.resolveSemanticSlots({
        routeId:'item_purchase',
        mlPredictions:[
            { id:'purchase_object', value:'一台显示器', confidence:0.88, modelId:'fixture-heads-v0' },
            { id:'purchase_context', confidence:0.40, modelId:'fixture-heads-v0' }
        ]
    });
    assert(hasSlot(result, 'purchase_object'), '高置信 ML claim 应进入 resolver');
    assert(!hasSlot(result, 'purchase_context'), '低置信 ML claim 应被忽略');
    assert(result.ignoredClaims.some((item) => item.reason === 'below_confidence_floor'), '应记录低置信过滤');
});

test('SP11 当前问题的明确值覆盖陈旧上下文值，并记录 superseded', () => {
    const result = provider.resolveSemanticSlots({
        routeId:'investment_price_trend',
        intent:resolvedIntent('investment', { investmentGoal:'price_trend' }, { object:{ text:'基金A' } }),
        contextSlots:[{ id:'investment_target', value:'股票B', confidence:0.99 }]
    });
    const slot = result.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot?.value === '基金A', `当前问题应覆盖上下文，实际 ${slot?.value}`);
    assert(result.superseded.some((item) => item.slotId === 'investment_target'), '应记录 context superseded');
});

test('SP12 同一 question scope 出现两个冲突值时不静默选一个', () => {
    const merged = provider.mergeClaims([
        { id:'purchase_object', value:'电脑A', evidence:'A', providerId:'object_or_entity_resolver', sourceScope:'question', source:'question', confidence:0.9, provenance:{} },
        { id:'purchase_object', value:'电脑B', evidence:'B', providerId:'ml_multi_label', sourceScope:'question', source:'question', confidence:0.95, provenance:{} }
    ]);
    assert(!merged.resolvedSlots.some((slot) => slot.id === 'purchase_object'), '冲突 slot 不应被静默解析');
    assert(merged.conflicts.some((item) => item.slotId === 'purchase_object'), '应返回 provider conflict');
});

test('SP13 同值多来源应合并 supportingProviders，而不是制造冲突', () => {
    const merged = provider.mergeClaims([
        { id:'investment_target', value:'股票A', evidence:'A', providerId:'structured_intent', sourceScope:'question', source:'question', confidence:0.9, provenance:{} },
        { id:'investment_target', value:'股票A', evidence:'A2', providerId:'ml_multi_label', sourceScope:'question', source:'question', confidence:0.8, provenance:{} }
    ]);
    const slot = merged.resolvedSlots.find((item) => item.id === 'investment_target');
    assert(slot, '同值多来源应解析');
    assert(slot.supportingProviders.length === 2, '应保留两个 supporting provider');
    assert(merged.conflicts.length === 0, '同值不应冲突');
});

test('SP14 provider 解析后的 specific_counterpart 可直接驱动 sufficiency', () => {
    const result = provider.evaluateWithProviders({ routeId:'relationship_development', question:'我和这个女生以后有机会吗' });
    assert(result.status === 'sufficient', `实际 ${result.status}`);
});

test('SP15 裸“我们有机会吗”没有上游 context 时保持 semantic_insufficient', () => {
    const result = provider.evaluateWithProviders({ routeId:'relationship_development', question:'我们有机会吗' });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.missing.some((item) => item.slotId === 'specific_counterpart'), '应缺 specific_counterpart');
});

test('SP16 上游 context 可以恢复 specific_counterpart', () => {
    const result = provider.evaluateWithProviders({
        routeId:'relationship_development', question:'我们有机会吗',
        contextSlots:[{ id:'specific_counterpart', value:'前文：新认识的男生', evidence:'上一句', confidence:0.98 }]
    });
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    assert(result.slotResolution.contextSlots.some((slot) => slot.id === 'specific_counterpart'), '应由 context 恢复');
});

test('SP17 item_purchase 只有 purchase_context 而无对象时仍不足', () => {
    const intent = resolvedIntent('item_purchase', { purchaseGoal:'value' });
    const result = provider.evaluateWithProviders({ routeId:'item_purchase', intent });
    assert(result.status === 'semantic_insufficient', `实际 ${result.status}`);
    assert(result.missing.some((item) => item.slotId === 'purchase_object'), '应缺 purchase_object');
});

test('SP18 未来 object/ML provider 补齐购买对象后即可通过，不需改 requirement matrix', () => {
    const intent = resolvedIntent('item_purchase', { purchaseGoal:'value' });
    const result = provider.evaluateWithProviders({
        routeId:'item_purchase', intent,
        mlPredictions:[{ id:'purchase_object', value:'这台电脑', confidence:0.91, modelId:'future-object-head' }]
    });
    assert(result.status === 'sufficient', `实际 ${result.status}: ${JSON.stringify(result.missing)}`);
});

test('SP19 marital relationship 可由 spouse participant 提供 existing_marriage_context', () => {
    const intent = resolvedIntent('marital_relationship', {}, { participants:[{ role:'spouse', relationToQuerent:'spouse', specificity:'specific', text:'老婆' }] });
    const result = provider.evaluateWithProviders({ routeId:'marital_relationship', intent });
    assert(result.status === 'sufficient', `实际 ${result.status}`);
    assert(result.slotResolution.resolvedSlots.some((slot) => slot.id === 'existing_marriage_context'), '应存在 existing_marriage_context');
});

test('SP20 Provider 层不得出现传统六亲/世应字段', () => {
    const serialized = JSON.stringify({ audit:provider.providerAudit, result:provider.resolveSemanticSlots({ routeId:'financial_fortune', intent:resolvedIntent('financial_fortune', { fortuneScope:'short_or_bounded_fortune' }) }) });
    for (const forbidden of ['妻财','官鬼','父母','兄弟','子孙','世爻','应爻']) {
        assert(!serialized.includes(forbidden), `provider 层不得泄漏 ${forbidden}`);
    }
});

console.log(`\nSemantic slot provider regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
