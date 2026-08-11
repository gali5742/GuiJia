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
['js/liuyao-time-facts.js','js/liuyao-time-effects.js'].forEach((relative) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, relative), 'utf8'), context, { filename:relative });
});
const facts = context.GuiJia.liuyaoTimeFacts;
const effects = context.GuiJia.liuyaoTimeEffects;
const kinds = (effectSet) => [...effectSet.activeKinds].sort();
const assertKinds = (effectSet, expected, label) => {
    const actual = kinds(effectSet);
    const wanted = [...expected].sort();
    assert(JSON.stringify(actual) === JSON.stringify(wanted), `${label}: ${JSON.stringify(actual)} != ${JSON.stringify(wanted)}`);
};

function fromLegacy(event) {
    const fact = facts.factFromLegacyEvent(event);
    return { fact, effectSet:effects.mapTimeFactToEffects(fact) };
}

test('TimeEffect 暴露六维 schema', () => {
    assert(effects?.SCHEMA_VERSION === 1, 'TimeEffect schema version 缺失');
    assert(JSON.stringify([...effects.DIMENSIONS]) === JSON.stringify(['trigger','support','peer','constraint','outflow','exertion']), `六维定义异常：${JSON.stringify(effects.DIMENSIONS)}`);
    assert(effects.DIMENSION_LABELS.outflow === '泄力' && effects.DIMENSION_LABELS.exertion === '耗力', '泄力/耗力术语未锁定');
});

test('目标日五行关系一对一映射六维，不再折叠成正负方向', () => {
    const cases = {
        TARGET_DAY_SUPPORT:'support',
        TARGET_DAY_CONTROL:'constraint',
        TARGET_DAY_PEER:'peer',
        TARGET_DAY_DRAIN:'outflow',
        TARGET_CONTROLS_DAY:'exertion'
    };
    Object.entries(cases).forEach(([code, expected]) => {
        const { effectSet } = fromLegacy({ code, subject:'main-observer', direction:'supportive', effect:'activating' });
        assertKinds(effectSet, [expected], code);
    });
});

test('六合与普通六冲只产生触发，不自动制造生扶或受制', () => {
    const harmony = fromLegacy({ code:'TARGET_HARMONY', subject:'main-observer', direction:'supportive' }).effectSet;
    const movingClash = fromLegacy({ code:'TARGET_MOVING_CLASH', subject:'main-observer', direction:'mixed' }).effectSet;
    assertKinds(harmony, ['trigger'], '静爻六合');
    assertKinds(movingClash, ['trigger'], '动爻六冲');
});

test('日破与动爻合绊由明确结构规则追加受制维度', () => {
    const dayBreak = fromLegacy({ code:'TARGET_STATIC_CLASH_BREAK', subject:'main-observer', direction:'adverse' }).effectSet;
    const movingHarmony = fromLegacy({ code:'TARGET_MOVING_HARMONY', subject:'main-observer', direction:'adverse' }).effectSet;
    assertKinds(dayBreak, ['trigger','constraint'], '静爻日破');
    assertKinds(movingHarmony, ['trigger','constraint'], '动爻合绊');
});

test('关键爻逢值时，角色关系与触发可以并存', () => {
    const source = fromLegacy({ code:'MOVING_VALUE_2', subject:'moving-line', roleCode:'SOURCE' }).effectSet;
    const taboo = fromLegacy({ code:'MOVING_VALUE_2', subject:'moving-line', roleCode:'TABOO' }).effectSet;
    const enemy = fromLegacy({ code:'MOVING_VALUE_2', subject:'moving-line', roleCode:'ENEMY' }).effectSet;
    const peer = fromLegacy({ code:'MOVING_VALUE_2', subject:'moving-line', roleCode:'PEER' }).effectSet;
    assertKinds(source, ['trigger','support'], '生扶爻逢值');
    assertKinds(taboo, ['trigger','constraint'], '克制爻逢值');
    assertKinds(enemy, ['trigger','exertion'], '间接制约爻逢值');
    assertKinds(peer, ['trigger','peer'], '比和爻逢值');
});

test('关键爻出空并逢值保持 compound fact，同时映射触发和角色效力', () => {
    const { fact, effectSet } = fromLegacy({ code:'STATIC_6_VOID_OUT_VALUE', subject:'static-key-line', roleCode:'TABOO' });
    assert(fact.subsumes.includes('void-transition:out') && fact.subsumes.includes('branch-relation:value'), 'compound 子事实缺失');
    assertKinds(effectSet, ['trigger','constraint'], '克制爻出空并逢值');
});

test('间接制约爻出空/逢值按观察爻主动克制映射为耗力，不再落入受制', () => {
    const out = fromLegacy({ code:'CHANGED_1_VOID_OUT', subject:'changed-line', roleCode:'ENEMY' }).effectSet;
    const value = fromLegacy({ code:'CHANGED_VALUE_1', subject:'changed-line', roleCode:'ENEMY' }).effectSet;
    const after = fromLegacy({ code:'CHANGED_1_VOID_VALUE_AFTER_OUT', subject:'changed-line', roleCode:'ENEMY' }).effectSet;
    assertKinds(out, ['trigger','exertion'], '间接制约变爻出空');
    assertKinds(value, ['trigger','exertion'], '间接制约变爻逢值');
    assertKinds(after, ['trigger','exertion'], '间接制约变爻出空后逢值');
});

test('三合事实通过纯五行元数据映射，不读取 legacy direction', () => {
    const support = fromLegacy({
        code:'SANHE_PENDING_0', subject:'sanhe', direction:'adverse',
        factMeta:{ formationElement:'水', observerElement:'木' }
    }).effectSet;
    const outflow = fromLegacy({
        code:'SANHE_PENDING_0', subject:'sanhe', direction:'supportive',
        factMeta:{ formationElement:'火', observerElement:'木' }
    }).effectSet;
    assertKinds(support, ['trigger','support'], '水局生木');
    assertKinds(outflow, ['trigger','outflow'], '木生火局');
});

test('TimeEffect 不携带 supportive/adverse/mixed 等旧聚合标签', () => {
    const samples = [
        fromLegacy({ code:'TARGET_HARMONY', subject:'main-observer', direction:'supportive' }).effectSet,
        fromLegacy({ code:'TARGET_DAY_DRAIN', subject:'main-observer', direction:'adverse' }).effectSet,
        fromLegacy({ code:'MOVING_VALUE_3', subject:'moving-line', roleCode:'SOURCE', direction:'supportive' }).effectSet
    ];
    samples.forEach((effectSet) => {
        const errors = effects.validateTimeEffectSet(effectSet);
        assert(errors.length === 0, `TimeEffect 验证失败：${JSON.stringify(errors)} ${JSON.stringify(effectSet)}`);
        const text = JSON.stringify(effectSet);
        ['supportive','adverse','mixed','preferred','caution','restraining'].forEach((token) => assert(!text.includes(token), `TimeEffect 泄漏 legacy token：${token}`));
    });
});

test('每个合法 TimeFact 至少形成一个六维 Effect', () => {
    const codes = [
        'TARGET_VALUE','TARGET_HARMONY','TARGET_MOVING_CLASH','TARGET_STATIC_CLASH_BREAK',
        'TARGET_VOID_OUT','TARGET_VOID_FILL','TARGET_MONTH_BREAK_VALUE','TARGET_DAY_SUPPORT',
        'TARGET_DAY_CONTROL','TARGET_DAY_PEER','TARGET_DAY_DRAIN','TARGET_CONTROLS_DAY',
        'MOVING_VALUE_2','STATIC_6_VOID_OUT_VALUE','SANHE_DEFERRED_OUT_0_0'
    ];
    codes.forEach((code) => {
        const event = { code, subject:'context', roleCode:code.includes('MOVING_VALUE') ? 'SOURCE' : '' };
        if (code.startsWith('SANHE_')) event.factMeta = { formationElement:'金', observerElement:'水' };
        const { effectSet } = fromLegacy(event);
        assert(effectSet.activeKinds.length > 0, `${code} 未映射任何 Effect`);
        assert(effects.validateTimeEffectSet(effectSet).length === 0, `${code} Effect schema 无效`);
    });
});

console.log(`\nTimeEffect tests: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
