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
['js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-evidence.js'].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});
const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const assessmentApi = context.GuiJia.liuyaoTimeAssessment;
const evidenceApi = context.GuiJia.liuyaoTimeEvidence;

function event(code, options = {}) {
    const legacy = {
        code,
        label:options.label || code,
        text:options.text || code,
        subject:options.subject || 'main-observer',
        tier:options.tier || 'primary',
        score:options.score || 100,
        roleCode:options.roleCode || '',
        direction:options.direction || 'mixed',
        factMeta:options.factMeta || {}
    };
    legacy.fact = facts.factFromLegacyEvent(legacy);
    legacy.timeEffects = effects.mapTimeFactToEffects(legacy.fact);
    return legacy;
}
function bundle(events, limit = 3) {
    const assessment = assessmentApi.assessNodeEvents(events);
    return { assessment, evidence:evidenceApi.selectNodeEvidence(events, assessment, limit) };
}

test('复合“出空并逢值”包含单独逢值证据，同一爻只保留复合事件', () => {
    const events = [
        event('MOVING_2_VOID_OUT_VALUE', { subject:'moving-line', roleCode:'SOURCE', label:'生扶动爻出空并逢值' }),
        event('MOVING_VALUE_2', { subject:'moving-line', roleCode:'SOURCE', label:'生扶动爻逢值', score:96 })
    ];
    const { assessment, evidence } = bundle(events);
    assert(evidence.uncoveredKinds.length === 0, `存在未覆盖维度：${JSON.stringify(evidence.uncoveredKinds)}`);
    assert(evidence.selected.some((item) => item.eventCode === 'MOVING_2_VOID_OUT_VALUE'), '未保留复合事件');
    assert(!evidence.selected.some((item) => item.eventCode === 'MOVING_VALUE_2'), '被包含的单独逢值仍被选入证据');
    assert(evidence.suppressed.some((item) => item.eventCode === 'MOVING_VALUE_2' && item.reason === 'subsumed-by-compound'), '未记录结构化包含抑制');
    assert(assessment.activeKinds.includes('trigger') && assessment.activeKinds.includes('support'), '测试向量未覆盖触发+生扶');
});


test('同一观察爻分散生成的“出空 + 逢值”在 Evidence 层合成为一个复合证据', () => {
    const events = [
        event('TARGET_VOID_OUT', { subject:'main-observer', label:'旬空出空', score:118 }),
        event('TARGET_VALUE', { subject:'main-observer', label:'观察爻逢值', score:105 })
    ];
    const { evidence } = bundle(events, 3);
    assert(evidence.selected.length === 1, `分散原子事实未合并：${evidence.selected.length}`);
    const item = evidence.selected[0];
    assert(item.semanticKeys.includes('void-transition:out') && item.semanticKeys.includes('branch-relation:value'), `复合证据缺少语义组件：${JSON.stringify(item.semanticKeys)}`);
    assert(item.memberEventCodes.includes('TARGET_VOID_OUT') && item.memberEventCodes.includes('TARGET_VALUE'), `复合证据未保留来源事件：${JSON.stringify(item.memberEventCodes)}`);
    assert(evidence.suppressed.filter((x) => x.reason === 'coalesced-into-compound').length === 2, '原子事件未标记为被复合证据吸收');
});

test('不同爻位的相同语义不得跨爻误去重', () => {
    const events = [
        event('MOVING_1_VOID_OUT_VALUE', { subject:'moving-line', roleCode:'SOURCE', label:'初爻出空并逢值' }),
        event('MOVING_VALUE_2', { subject:'moving-line', roleCode:'SOURCE', label:'二爻逢值', score:96 })
    ];
    const { evidence } = bundle(events, 3);
    assert(evidence.candidateCount === 2, `不同爻位被误合并：candidateCount=${evidence.candidateCount}`);
    assert(!evidence.suppressed.some((item) => item.eventCode === 'MOVING_VALUE_2'), '二爻被初爻复合事件误抑制');
});

test('Node Assessment 的每个六维效力都至少有一条可见证据', () => {
    const events = [
        event('TARGET_VALUE', { subject:'main-observer' }),
        event('MOVING_VALUE_2', { subject:'moving-line', roleCode:'SOURCE' }),
        event('TARGET_DAY_PEER', { subject:'main-observer', tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { subject:'main-observer', tier:'secondary' }),
        event('TARGET_DAY_DRAIN', { subject:'main-observer', tier:'context' }),
        event('TARGET_CONTROLS_DAY', { subject:'main-observer', tier:'context' })
    ];
    const { assessment, evidence } = bundle(events, 3);
    assert(assessment.activeKinds.length === 6, `测试未覆盖六维全集：${JSON.stringify(assessment.activeKinds)}`);
    assert(evidence.uncoveredKinds.length === 0, `证据缺口：${JSON.stringify(evidence.uncoveredKinds)}`);
    assessment.activeKinds.forEach((kind) => {
        assert(evidence.selected.some((item) => item.coversKinds.includes(kind)), `缺少 ${kind} 的可见证据`);
    });
});

test('三条展示上限不足以覆盖摘要时自动扩容，不允许丢失摘要证据', () => {
    const events = [
        event('TARGET_VALUE'),
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary' }),
        event('TARGET_DAY_DRAIN', { tier:'context' }),
        event('TARGET_CONTROLS_DAY', { tier:'context' })
    ];
    const { assessment, evidence } = bundle(events, 3);
    assert(assessment.activeKinds.length === 5, `测试向量维度异常：${JSON.stringify(assessment.activeKinds)}`);
    assert(evidence.selected.length >= 5, `为遵守固定三条上限而丢证据：${evidence.selected.length}`);
    assert(evidence.uncoveredKinds.length === 0, '自动扩容后仍有未覆盖维度');
});

test('同一实体、同一 Fact 语义的重复证据只保留优先级更高者', () => {
    const a = event('TARGET_DAY_SUPPORT', { score:80, tier:'secondary', label:'目标日生扶A' });
    const b = event('TARGET_DAY_SUPPORT', { score:60, tier:'context', label:'目标日生扶B' });
    const { evidence } = bundle([a,b]);
    assert(evidence.selected.length === 1, `语义重复未去重：${evidence.selected.length}`);
    assert(evidence.selected[0].label === '目标日生扶A', `未保留优先级更高证据：${evidence.selected[0].label}`);
    assert(evidence.suppressed.some((item) => item.reason === 'semantic-duplicate'), '未记录语义重复抑制');
});

test('主要观察爻自身证据优先于外围同类爻的一条多维证据', () => {
    const events = [
        event('TARGET_VALUE', { subject:'main-observer', label:'观察爻逢值', score:105 }),
        event('TARGET_DAY_PEER', { subject:'main-observer', tier:'secondary', label:'目标日比和', score:52 }),
        event('STATIC_6_MONTH_BREAK_VALUE', { subject:'static-key-line', roleCode:'PEER', label:'比和爻逢值·月破复核', score:110 })
    ];
    const { assessment, evidence } = bundle(events, 3);
    assert(assessment.activeKinds.includes('trigger') && assessment.activeKinds.includes('peer'), `测试向量未形成触发+比和：${JSON.stringify(assessment.activeKinds)}`);
    assert(evidence.selected.some((item) => item.eventCode === 'TARGET_VALUE'), `主要观察爻逢值被外围证据挤掉：${JSON.stringify(evidence.selected)}`);
    assert(evidence.selected.some((item) => item.eventCode === 'TARGET_DAY_PEER'), `主要观察爻比和证据未保留：${JSON.stringify(evidence.selected)}`);
    assert(evidence.uncoveredKinds.length === 0, `直接证据优先后出现覆盖缺口：${JSON.stringify(evidence.uncoveredKinds)}`);
});

test('Evidence bundle schema 校验要求摘要维度全部可追溯', () => {
    const events = [event('TARGET_HARMONY'), event('TARGET_DAY_CONTROL', { tier:'secondary' })];
    const { assessment, evidence } = bundle(events);
    const errors = evidenceApi.validateEvidenceBundle(evidence, assessment);
    assert(errors.length === 0, `Evidence bundle 无效：${JSON.stringify(errors)}`);
});

console.log(`\nTimeEvidence tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
