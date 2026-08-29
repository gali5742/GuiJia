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

function loadScripts(relativeFiles) {
    const context = { console, Date, Math, JSON, Intl };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    relativeFiles.forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js',
    'js/bazi-core.js',
    'js/bazi-strength-evidence.js',
    'js/bazi-strength-effects.js',
    'js/bazi-month-command-actor-state.js'
]);

const bazi = GuiJia.baziCore;
const api = GuiJia.baziMonthCommandActorState;

function makeResult(gans, zhis) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan,
            level,
            wuxing:bazi.getWuXing(hiddenGan),
            shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    return {
        dayGan,
        dayGanWuXing:dayElement,
        pillars,
        internalRelations,
        monthSeason:bazi.buildMonthSeason(zhis[1], dayElement)
    };
}

function semanticFor(result, sourceProfiles = []) {
    const catalog = bazi.buildBaziStructureCatalog(result.internalRelations || []);
    return {
        structures:catalog.map((relation) => ({ id:relation._semanticRef || relation.id, code:relation.code })),
        monthCommand:{ sourceProfiles }
    };
}

function dtsCommand(sourceCommandGan) {
    return {
        sourceId:`DTS-CW-${sourceCommandGan}-COMMAND-TEST`,
        sourceCommandGan,
        resolutionStatus:'resolved-source-command'
    };
}

test('Month Command Actor State v0.1 建立“司令 actor 可成为 interaction target”合同', () => {
    assert(api?.installed === true, 'Month Command Actor State 模块未安装');
    assert(api.MONTH_COMMAND_ACTOR_STATE_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.commandPresenceIsInvulnerability === false, '不得把司令解释为不可受伤');
    assert(api.CONTRACT.monthBranchCanSubstituteCommandFact === false, '月份不得替代司令事实');
    assert(api.CONTRACT.sourceInjuredMapsToGenericEffectiveness === false, 'source-injured 不得自动映射 generic effectiveness');
    assert(api.SOURCE_PATTERNS.length === 2, '应只收辰戌／丑未两条直证模式');
});

test('辰月见辰戌冲但没有同源乙木司令 observation 时，只建立 unresolved vulnerability record', () => {
    const result = makeResult(['甲','戊','丁','庚'], ['子','辰','卯','戌']);
    const state = api.buildMonthCommandActorState(result, semanticFor(result));
    assert(state.records.length === 1, `应识别一条辰戌司令 vulnerability：${state.records.length}`);
    const record = state.records[0];
    assert(record.patternId === 'DTS-CHEN-XU-YI-COMMAND-VULNERABILITY-001', 'pattern 异常');
    assert(record.resolutionStatus === 'unresolved-command-input', `缺司令输入必须 unresolved：${record.resolutionStatus}`);
    assert(record.sourceInteractionState === null && record.sourceUsabilityOutcome === null, '不得提前生成受伤／不足用');
});

test('辰戌冲只有在同源乙木司令输入已解析时，才记录“受伤／不足用” source outcome', () => {
    const result = makeResult(['甲','戊','丁','庚'], ['子','辰','卯','戌']);
    const state = api.buildMonthCommandActorState(result, semanticFor(result, [dtsCommand('乙')]));
    const record = state.records[0];
    assert(record.resolutionStatus === 'resolved-source-vulnerability', `应解析 vulnerability：${record.resolutionStatus}`);
    assert(record.sourceInteractionState === 'source-injured', '应保存原典受伤状态');
    assert(record.sourceUsabilityOutcome === '不足用', '应保存原典不足用结果');
    assert(record.attackerActor.zhi === '戌' && record.attackerActor.hiddenGan === '辛', '应回指戌中辛金 actor');
    assert(record.attackerActor.sourceHiddenGanVerified === true, '戌中辛必须能由藏干基础表核验');
    assert(record.genericEffectiveness === null && record.canonicalCommandStateChange === null, '不得升级 generic 效力或删除司令');
});

test('其他来源即使声称乙木司令，也不能自动补齐《滴天髓阐微》辰戌模式', () => {
    const result = makeResult(['甲','戊','丁','庚'], ['子','辰','卯','戌']);
    const foreign = { sourceId:'SMTH-TEST', sourceCommandGan:'乙', resolutionStatus:'resolved-source-command' };
    const record = api.buildMonthCommandActorState(result, semanticFor(result, [foreign])).records[0];
    assert(record.resolutionStatus === 'unresolved-command-input', '跨来源不得自动补齐司令条件');
    assert(record.sourceInteractionState === null, '跨来源不得生成受伤');
});

test('未月丑未冲在同源丁火司令输入下，对应丑中癸水伤丁的第二条直证模式', () => {
    const result = makeResult(['甲','己','丙','癸'], ['子','未','卯','丑']);
    const state = api.buildMonthCommandActorState(result, semanticFor(result, [dtsCommand('丁')]));
    assert(state.records.length === 1, '应识别丑未模式');
    const record = state.records[0];
    assert(record.patternId === 'DTS-WEI-CHOU-DING-COMMAND-VULNERABILITY-001', '未月 pattern 异常');
    assert(record.resolutionStatus === 'resolved-source-vulnerability', '丁司令输入应解析 vulnerability');
    assert(record.attackerActor.zhi === '丑' && record.attackerActor.hiddenGan === '癸', '应回指丑中癸水 actor');
    assert(record.sourceInteractionState === 'source-injured' && record.sourceUsabilityOutcome === '不足用', '原典结果异常');
});

test('只有辰月或未月但没有对应四库六冲时，Actor State 为 not-applicable', () => {
    const result = makeResult(['甲','戊','丁','庚'], ['子','辰','卯','申']);
    const state = api.buildMonthCommandActorState(result, semanticFor(result, [dtsCommand('乙')]));
    assert(state.state === 'not-applicable', `无对应冲时应 not-applicable：${state.state}`);
    assert(state.records.length === 0, '无对应冲不得制造 vulnerability record');
});

test('Month Command Actor State 不引入权重、分数、generic weakened/ineffective 或最终身强弱', () => {
    const result = makeResult(['甲','戊','丁','庚'], ['子','辰','卯','戌']);
    const serialized = JSON.stringify(api.buildMonthCommandActorState(result, semanticFor(result, [dtsCommand('乙')])));
    ['score','weight','points','root-preserved','root-weakened','root-ineffective'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert(!serialized.includes('"strong"') && !serialized.includes('"weak"') && !serialized.includes('"balanced"'), '不得输出最终强弱');
});

test('生产 Month Command 加载链包含独立 Month Command Actor State 模块', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-month-command.js'), 'utf8');
    assert(source.includes('./js/bazi-month-command-actor-state.js?v=13.44.0'), '生产加载链未接入独立 Actor State 模块');
});

console.log(`\nBaZi month command actor state: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
