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
[
    'js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js','js/liuyao-time-relevance.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));

const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const assessments = context.GuiJia.liuyaoTimeAssessment;
const relevance = context.GuiJia.liuyaoTimeRelevance;

function event(code, options = {}) {
    const legacy = {
        code,
        label:options.label || code,
        text:options.text || code,
        subject:options.subject || 'context',
        tier:options.tier || 'context',
        score:options.score || 0,
        roleCode:options.roleCode || '',
        direction:options.direction || 'mixed',
        factMeta:options.factMeta || {}
    };
    legacy.fact = facts.factFromLegacyEvent(legacy);
    legacy.timeEffects = effects.mapTimeFactToEffects(legacy.fact);
    return legacy;
}
function profile(events) { return relevance.buildStructuralRelevanceProfile(assessments.assessNodeEvents(events)); }

test('结构相关性层级固定为观察爻直接 > 观察爻之变 > 世应轴 > 关键关系爻 > 结构组合 > 背景结构', () => {
    const ranks = relevance.LEVEL_RANK;
    assert(ranks['observer-direct'] > ranks['observer-change'], '观察爻直接未高于观察爻之变');
    assert(ranks['observer-change'] > ranks.axis, '观察爻之变未高于世应轴');
    assert(ranks.axis > ranks['key-line'], '世应轴未高于关键关系爻');
    assert(ranks['key-line'] > ranks.formation, '关键关系爻未高于结构组合');
    assert(ranks.formation > ranks.context, '结构组合未高于背景结构');
});

test('主要观察爻自身的目标日生扶归为 observer-direct', () => {
    const p = profile([event('TARGET_DAY_SUPPORT', { subject:'main-observer', tier:'secondary' })]);
    assert(p.dimensions.support.level === 'observer-direct', `生扶相关性异常：${p.dimensions.support.level}`);
});

test('主要观察爻变爻的触发归为 observer-change', () => {
    const p = profile([event('TARGET_CHANGED_VALUE', { subject:'main-observer-change', tier:'secondary' })]);
    assert(p.dimensions.trigger.level === 'observer-change', `变爻触发相关性异常：${p.dimensions.trigger.level}`);
});

test('世应对轴触发归为 axis', () => {
    const p = profile([event('OPPOSITE_VALUE', { subject:'opposite', tier:'secondary', roleCode:'SOURCE' })]);
    assert(p.dimensions.trigger.level === 'axis', `世应轴触发相关性异常：${p.dimensions.trigger.level}`);
    assert(p.dimensions.support.level === 'axis', `世应轴生扶相关性异常：${p.dimensions.support.level}`);
});

test('普通关键动爻与三合结构分别归为 key-line / formation', () => {
    const key = profile([event('MOVING_VALUE_2', { subject:'moving-line', tier:'secondary', roleCode:'SOURCE' })]);
    const formation = profile([event('SANHE_PENDING_0', { subject:'sanhe', tier:'primary', factMeta:{ formationElement:'水', observerElement:'木' } })]);
    assert(key.dimensions.support.level === 'key-line', `关键动爻相关性异常：${key.dimensions.support.level}`);
    assert(formation.dimensions.trigger.level === 'formation', `三合触发相关性异常：${formation.dimensions.trigger.level}`);
});

test('同一维度存在多个来源时只取结构上最直接的一层作为最高相关性', () => {
    const p = profile([
        event('MOVING_VALUE_2', { subject:'moving-line', tier:'primary', roleCode:'SOURCE' }),
        event('TARGET_DAY_SUPPORT', { subject:'main-observer', tier:'secondary' })
    ]);
    assert(p.dimensions.support.level === 'observer-direct', `最高相关性未取观察爻直接作用：${p.dimensions.support.level}`);
    assert(p.dimensions.support.sourceCount === 2, `来源计数异常：${p.dimensions.support.sourceCount}`);
});

test('StructuralRelevance schema 与 Node Assessment 活跃维度一致', () => {
    const assessment = assessments.assessNodeEvents([
        event('TARGET_VALUE', { subject:'main-observer', tier:'primary' }),
        event('TARGET_DAY_DRAIN', { subject:'main-observer', tier:'context' })
    ]);
    const p = relevance.buildStructuralRelevanceProfile(assessment);
    const errors = relevance.validateStructuralRelevanceProfile(p, assessment);
    assert(errors.length === 0, `StructuralRelevance schema 无效：${JSON.stringify(errors)}`);
    assert(p.dimensions.trigger.active && p.dimensions.outflow.active, '活跃维度未继承 Assessment');
});

console.log(`\nTimeRelevance tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
