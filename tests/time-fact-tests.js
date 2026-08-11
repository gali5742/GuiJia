#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
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

const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'liuyao-time-facts.js'), 'utf8'), context, { filename:'js/liuyao-time-facts.js' });
const facts = context.GuiJia.liuyaoTimeFacts;

test('TimeFact 模块暴露独立 schema', () => {
    assert(facts?.SCHEMA_VERSION === 1, 'TimeFact schema version 缺失');
    assert(typeof facts.factFromLegacyEvent === 'function', 'legacy fact bridge 缺失');
    assert(typeof facts.validateTimeFact === 'function', 'fact validator 缺失');
});

test('目标日五行关系映射为中性事实，不携带旧方向标签', () => {
    const cases = {
        TARGET_DAY_SUPPORT:'day-generates-observer',
        TARGET_DAY_CONTROL:'day-controls-observer',
        TARGET_DAY_PEER:'same-element',
        TARGET_DAY_DRAIN:'observer-generates-day',
        TARGET_CONTROLS_DAY:'observer-controls-day'
    };
    Object.entries(cases).forEach(([code, relation]) => {
        const fact = facts.factFromLegacyEvent({ code, subject:'main-observer', direction:'supportive', effect:'activating', tier:'primary', score:99 });
        assert(fact.family === 'element-relation', `${code} family 异常：${fact.family}`);
        assert(fact.relation === relation, `${code} relation 异常：${fact.relation}`);
        assert(facts.validateTimeFact(fact).length === 0, `${code} fact 污染：${facts.validateTimeFact(fact).join(',')}`);
        const text = JSON.stringify(fact);
        ['direction','effectLabel','supportive','adverse','mixed','score','tier'].forEach((token) => assert(!text.includes(token), `${code} TimeFact 泄漏旧效力字段：${token}`));
    });
});

test('间接制约角色在 TimeFact 中记录为观察爻克该爻的直接事实', () => {
    const fact = facts.factFromLegacyEvent({ code:'MOVING_VALUE_2', subject:'moving-line', roleCode:'ENEMY' });
    assert(fact.subjectRef.relativeElementRelation === 'observer-controls-line', `间接制约角色事实方向错误：${JSON.stringify(fact.subjectRef)}`);
    assert(facts.validateTimeFact(fact).length === 0, `ENEMY TimeFact 无效：${facts.validateTimeFact(fact).join(',')}`);
});

test('出空并逢值建模为 compound fact 并声明子事实', () => {
    const fact = facts.factFromLegacyEvent({ code:'STATIC_6_VOID_OUT_VALUE', subject:'static-key-line', roleCode:'TABOO' });
    assert(fact.family === 'compound', `compound family 异常：${fact.family}`);
    assert(fact.components.some((item) => item.family === 'void-transition' && item.relation === 'out'), '缺少出空 component');
    assert(fact.components.some((item) => item.family === 'branch-relation' && item.relation === 'value'), '缺少逢值 component');
    assert(fact.subsumes.includes('void-transition:out') && fact.subsumes.includes('branch-relation:value'), `subsumes 异常：${JSON.stringify(fact.subsumes)}`);
    assert(fact.subjectRef.relativeElementRelation === 'line-controls-observer', `角色关系未中性化：${JSON.stringify(fact.subjectRef)}`);
});

test('六合六冲逢值只记录地支关系事实', () => {
    const harmony = facts.factFromLegacyEvent({ code:'TARGET_HARMONY', subject:'main-observer', direction:'supportive' });
    const clash = facts.factFromLegacyEvent({ code:'TARGET_STATIC_CLASH_BREAK', subject:'main-observer', direction:'adverse' });
    const value = facts.factFromLegacyEvent({ code:'TARGET_VALUE', subject:'main-observer', direction:'supportive' });
    assert(harmony.relation === 'harmony', `六合 relation 异常：${harmony.relation}`);
    assert(clash.relation === 'clash', `六冲 relation 异常：${clash.relation}`);
    assert(value.relation === 'value', `逢值 relation 异常：${value.relation}`);
});

test('月破复核与三合结构均形成独立事实族', () => {
    const monthBreak = facts.factFromLegacyEvent({ code:'STATIC_MONTH_BREAK_VALUE_2', subject:'static-key-line' });
    const sanhe = facts.factFromLegacyEvent({ code:'SANHE_DEFERRED_OUT_0_0', subject:'sanhe' });
    assert(monthBreak.family === 'compound' && monthBreak.components.some((item) => item.family === 'month-break-review'), `月破事实异常：${JSON.stringify(monthBreak)}`);
    assert(sanhe.family === 'compound' && sanhe.components.some((item) => item.family === 'formation' && item.formation === 'sanhe'), `三合事实异常：${JSON.stringify(sanhe)}`);
});

test('旬空填实与冲空补足逢值／六冲事实组件', () => {
    const fill = facts.factFromLegacyEvent({ code:'STATIC_2_VOID_FILL', subject:'static-key-line' });
    const clash = facts.factFromLegacyEvent({ code:'MOVING_3_VOID_CLASH', subject:'moving-line' });
    assert(fill.family === 'compound' && fill.semanticKeys.includes('void-transition:fill') && fill.semanticKeys.includes('branch-relation:value'), `填实事实不完整：${JSON.stringify(fill)}`);
    assert(clash.family === 'compound' && clash.semanticKeys.includes('void-transition:clash-open') && clash.semanticKeys.includes('branch-relation:clash'), `冲空事实不完整：${JSON.stringify(clash)}`);
});

test('六爻时间代码不再使用“泄耗”用户术语', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js', 'liuyao-core.js'), 'utf8');
    assert(!source.includes('目标日泄耗') && !source.includes('形成泄耗') && !source.includes('对主要观察爻形成泄耗'), '六爻时间层仍残留“泄耗”术语');
    assert(source.includes('目标日泄力') && source.includes('形成泄力'), '六爻时间层未切换到“泄力”');
});

console.log(`\nTimeFact tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
