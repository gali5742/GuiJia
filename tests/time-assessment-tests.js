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
['js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js'].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});
const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const assessmentApi = context.GuiJia.liuyaoTimeAssessment;

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
function assess(events) { return assessmentApi.assessNodeEvents(events); }
function assertKinds(value, expected, label) {
    assert(JSON.stringify(value.activeKinds) === JSON.stringify(expected), `${label} activeKinds 错误：${JSON.stringify(value.activeKinds)}`);
}

test('六合触发 + 目标日克制聚合为触发伴随受制，不制造生扶', () => {
    const value = assess([
        event('TARGET_HARMONY', { direction:'supportive' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary', direction:'adverse' })
    ]);
    assertKinds(value, ['trigger','constraint'], '六合+克制');
    assert(value.summary.text === '触发伴随受制', `摘要错误：${value.summary.text}`);
    assert(!value.summary.text.includes('生扶'), '六合错误制造生扶摘要');
});

test('目标日泄力独立于受制', () => {
    const value = assess([event('TARGET_DAY_DRAIN', { tier:'context', direction:'adverse' })]);
    assertKinds(value, ['outflow'], '泄力');
    assert(value.summary.text === '主要观察爻有泄力', `摘要错误：${value.summary.text}`);
    assert(!value.summary.text.includes('受制'), '泄力被错误归为受制');
});

test('观察爻克目标日独立映射耗力', () => {
    const value = assess([event('TARGET_CONTROLS_DAY', { tier:'context', direction:'mixed' })]);
    assertKinds(value, ['exertion'], '耗力');
    assert(value.summary.text === '主要观察爻有耗力', `摘要错误：${value.summary.text}`);
});

test('触发、生扶、受制、泄力可同时保留，不压成正负单轴', () => {
    const value = assess([
        event('TARGET_VALUE'),
        event('TARGET_DAY_SUPPORT', { tier:'secondary' }),
        event('TARGET_STATIC_CLASH_BREAK'),
        event('TARGET_DAY_DRAIN', { tier:'context' })
    ]);
    assertKinds(value, ['trigger','support','constraint','outflow'], '四维并存');
    assert(value.summary.text.includes('生扶') && value.summary.text.includes('受制') && value.summary.text.includes('泄力'), `摘要未保留全部实质维度：${value.summary.text}`);
});

test('比和保持独立维度，不自动折算为生扶', () => {
    const value = assess([
        event('TARGET_VALUE'),
        event('TARGET_DAY_PEER', { tier:'secondary', direction:'supportive' })
    ]);
    assertKinds(value, ['trigger','peer'], '触发+比和');
    assert(value.summary.text === '触发并见比和', `摘要错误：${value.summary.text}`);
    assert(!value.activeKinds.includes('support'), '比和错误折算生扶');
});

test('旧 direction/effect 标签变化不影响新 Node Assessment', () => {
    const a = event('TARGET_HARMONY', { direction:'supportive' });
    const b = event('TARGET_HARMONY', { direction:'adverse' });
    const av = assess([a]);
    const bv = assess([b]);
    assert(JSON.stringify(av.activeKinds) === JSON.stringify(bv.activeKinds), 'legacy direction 改变了 activeKinds');
    assert(av.summary.text === bv.summary.text, 'legacy direction 改变了摘要');
});

test('相同 Effect 原因按语义来源去重', () => {
    const e = event('TARGET_DAY_SUPPORT', { tier:'secondary' });
    const value = assess([e, { ...e }]);
    assert(value.dimensions.support.reasonCount === 1, `重复原因未去重：${value.dimensions.support.reasonCount}`);
});

test('Node Assessment schema 不泄漏 legacy 聚合标签', () => {
    const value = assess([
        event('TARGET_HARMONY', { direction:'supportive' }),
        event('TARGET_DAY_DRAIN', { direction:'adverse' }),
        event('TARGET_CONTROLS_DAY', { direction:'mixed' })
    ]);
    const errors = assessmentApi.validateNodeAssessment(value);
    assert(errors.length === 0, `Node Assessment schema 无效：${JSON.stringify(errors)}`);
    const text = JSON.stringify(value);
    ['supportive','adverse','mixed','preferred','caution','restraining'].forEach((token) => assert(!text.includes(token), `Node Assessment 泄漏 legacy token：${token}`));
});

test('summary kinds 覆盖所有 active kinds', () => {
    const value = assess([
        event('TARGET_VALUE'),
        event('MOVING_VALUE_2', { subject:'moving-line', roleCode:'SOURCE' }),
        event('TARGET_DAY_PEER', { tier:'secondary' }),
        event('TARGET_DAY_CONTROL', { tier:'secondary' }),
        event('TARGET_DAY_DRAIN', { tier:'context' }),
        event('TARGET_CONTROLS_DAY', { tier:'context' })
    ]);
    assertKinds(value, ['trigger','support','peer','constraint','outflow','exertion'], '六维全集');
    value.activeKinds.forEach((kind) => assert(value.summary.kinds.includes(kind), `summary kinds 漏 ${kind}`));
    ['生扶','比和','受制','泄力','耗力'].forEach((label) => assert(value.summary.text.includes(label), `summary text 漏 ${label}: ${value.summary.text}`));
});

console.log(`\nTimeAssessment tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
