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
    'js/liuyao-time-facts.js','js/liuyao-time-effects.js','js/liuyao-time-assessment.js',
    'js/liuyao-time-evidence.js','js/liuyao-time-relevance.js','js/liuyao-time-output.js','js/liuyao-time-selection.js'
].forEach((relative) => vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative }));

const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const assessments = context.GuiJia.liuyaoTimeAssessment;
const evidenceApi = context.GuiJia.liuyaoTimeEvidence;
const outputApi = context.GuiJia.liuyaoTimeOutput;
const selectionApi = context.GuiJia.liuyaoTimeSelection;

function event(code, options = {}) {
    const legacy = {
        code,
        label:options.label || code,
        text:options.text || `${options.label || code}正文`,
        subject:options.subject || 'main-observer',
        tier:options.tier || 'primary',
        score:options.score || 100,
        roleCode:options.roleCode || '',
        direction:'mixed',
        factMeta:options.factMeta || {}
    };
    legacy.fact = facts.factFromLegacyEvent(legacy);
    legacy.timeEffects = effects.mapTimeFactToEffects(legacy.fact);
    return legacy;
}
function candidate(events) {
    const assessment = assessments.assessNodeEvents(events);
    const evidence = evidenceApi.selectNodeEvidence(events, assessment, 3);
    return outputApi.buildCandidateNodeOutput(assessment, evidence);
}

test('单一生扶触发采用自然摘要“触发中见生扶”', () => {
    const output = candidate([
        event('TARGET_VALUE', { label:'观察爻逢值' }),
        event('TARGET_DAY_SUPPORT', { label:'目标日生扶', tier:'secondary' })
    ]);
    assert(output.summary.text === '触发中见生扶', `摘要未收束：${output.summary.text}`);
});

test('单一比和触发采用自然摘要“触发中见比和”', () => {
    const output = candidate([
        event('TARGET_VALUE', { label:'观察爻逢值' }),
        event('TARGET_DAY_PEER', { label:'目标日比和', tier:'secondary' })
    ]);
    assert(output.summary.text === '触发中见比和', `摘要未收束：${output.summary.text}`);
});

test('泄力证据前台标签落在观察爻，不写成目标日泄力', () => {
    const output = candidate([event('TARGET_DAY_DRAIN', { label:'目标日泄力', tier:'secondary' })]);
    assert(output.evidence[0].label === '观察爻泄力', `泄力标签主体错误：${output.evidence[0].label}`);
    assert(!output.facts[0].startsWith('目标日泄力'), `用户事实仍保留旧主体：${output.facts[0]}`);
});

test('耗力证据统一写作“观察爻耗力”', () => {
    const output = candidate([event('TARGET_CONTROLS_DAY', { label:'观察爻克目标日', tier:'secondary' })]);
    assert(output.evidence[0].label === '观察爻耗力', `耗力标签未收束：${output.evidence[0].label}`);
});

test('日期判断不重复“目标日生扶（生扶）”这类同义括注', () => {
    const output = candidate([event('TARGET_DAY_SUPPORT', { label:'目标日生扶', tier:'secondary' })]);
    assert(output.dateAssessment.text === '偏有利：目标日生扶。', `日期文案仍重复：${output.dateAssessment.text}`);
    assert(!/生扶（生扶）/.test(output.dateAssessment.text), '仍出现同义括注');
});

test('触发事实若另含受制，只补充真正缺失的“受制”维度', () => {
    const output = candidate([event('TARGET_STATIC_CLASH_BREAK', { label:'静爻逢冲·日破' })]);
    assert(output.dateAssessment.text.includes('静爻逢冲·日破（受制）'), `日破证据未补足受制语义：${output.dateAssessment.text}`);
    assert(!output.dateAssessment.text.includes('（触发、受制）'), `触发括注冗余：${output.dateAssessment.text}`);
});

test('候选证据顺序优先让主要观察爻事实靠前', () => {
    const output = candidate([
        event('MOVING_VALUE_2', { label:'生扶动爻逢值', subject:'moving-line', roleCode:'SOURCE', tier:'primary', score:110 }),
        event('TARGET_DAY_CONTROL', { label:'目标日克制', subject:'main-observer', tier:'secondary', score:60 })
    ]);
    assert(output.evidence[0].subject === 'main-observer', `主要观察爻证据没有优先：${output.evidence.map((x) => x.label).join(' / ')}`);
});

test('日期选择次级前沿存在多个日期时不再只展示其中一个', () => {
    const profile = (flags) => ({ flags:{ trigger:false,support:false,peer:false,constraint:false,outflow:false,exertion:false,...flags }, structuralRelevance:{ dimensions:Object.fromEntries(['trigger','support','peer','constraint','outflow','exertion'].map((k) => [k,{rank:0,level:'none'}])) } });
    const node = (dateText, flags, sortTime) => ({ dateText, dayGanZhi:'测试', sortTime, candidateOutput:{ dateAssessment:profile(flags) } });
    const comparison = selectionApi.buildDateSelectionComparison([
        node('2026/8/11', { support:true, peer:true }, 1),
        node('2026/8/12', { support:true }, 2),
        node('2026/8/13', { peer:true }, 3)
    ]);
    assert(comparison.status === 'preferred', `第一前沿应为单一日期：${comparison.summary}`);
    assert(comparison.summary.includes('2026/8/12') && comparison.summary.includes('2026/8/13'), `次级前沿没有完整展示：${comparison.summary}`);
});

console.log(`\nTimeWording tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
