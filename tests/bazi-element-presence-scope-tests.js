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
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
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
    'js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js',
    'js/bazi-root-six-relations.js',
    'js/bazi-clash-preconditions.js',
    'js/bazi-clash-seasonal-position.js',
    'js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const scopeApi = GuiJia.baziElementPresenceScope;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
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
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return {
        dayGan,
        dayGanWuXing:dayElement,
        pillars,
        internalRelations,
        monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[],
        lunarStr:'测试农历',
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis) {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis));
}

function forceDimension(record) {
    return (record?.comparisonDimensions || []).find((item) => item.key === 'non-seasonal-relative-force');
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('Research bootstrap 显式声明 Element Presence Scope 模块，Guard 021 保持', () => {
    const bootstrapSource = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    assert(bootstrapSource.includes('./js/bazi-element-presence-scope.js'), 'Research bootstrap 未声明 Element Presence Scope 模块');
    assert(scopeApi?.installed === true, 'Element Presence Scope 模块未安装');
    assert(scopeApi.ELEMENT_PRESENCE_SCOPE_KEY === 'explicit-pillar-surface', 'scope key 异常');
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-021'), '缺少 Guard 021');
});

test('固定验证盘 scope dependency 已解析，但最终 Assessment 仍 not-evaluated', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-CLASH-ELEMENT-PRESENCE-SCOPE']?.status === 'resolved', 'scope dependency 应 resolved');
    assert(model.strengthSynthesis.elementPresenceScopeContract?.hiddenStemsIncluded === false, 'scope 不应包含藏干');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终 Assessment');
});

test('任氏“戊辰 辛酉 丙午 癸巳，五行无木”口径：辰藏乙不单独算表层有木', () => {
    const model = outputFor(['戊','辛','丙','癸'], ['辰','酉','午','巳']).semanticModel;
    const snapshot = scopeApi.buildExplicitPillarSurfaceSnapshot(model);
    const wood = scopeApi.inspectElementPresence(snapshot, '木');
    assert(snapshot.complete === true, '表层快照应完整');
    assert(wood.present === false, '辰藏乙不应单独把四柱判成表层有木');
    assert(wood.matches.length === 0, '不应产生木表层 match');
});

test('任氏“癸未 乙卯 甲戌 乙亥，四柱无金、五行无火”口径：戌藏辛、未戌藏丁均不单独计入', () => {
    const model = outputFor(['癸','乙','甲','乙'], ['未','卯','戌','亥']).semanticModel;
    const snapshot = scopeApi.buildExplicitPillarSurfaceSnapshot(model);
    const metal = scopeApi.inspectElementPresence(snapshot, '金');
    const fire = scopeApi.inspectElementPresence(snapshot, '火');
    assert(metal.present === false, '戌藏辛不应单独算表层有金');
    assert(fire.present === false, '未戌藏丁不应单独算表层有火');
});

test('明支本五行可以满足“有”：无甲乙明干但见寅时，表层木 presence 为 true', () => {
    const model = outputFor(['庚','辛','壬','癸'], ['子','丑','寅','亥']).semanticModel;
    const snapshot = scopeApi.buildExplicitPillarSurfaceSnapshot(model);
    const wood = scopeApi.inspectElementPresence(snapshot, '木');
    assert(wood.present === true, '明支寅应满足表层有木');
    assert(wood.matches.some((item) => item.source === 'visible-branch' && item.symbol === '寅'), '应记录寅这一明支 match');
    assert(!wood.matches.some((item) => item.source === 'visible-stem'), '本例不应存在木明干 match');
});

test('卯酉冲：卯旺提纲、表层有火而无土时，元素例式可解析 non-seasonal-relative-force', () => {
    const model = outputFor(['甲','乙','乙','丙'], ['亥','卯','酉','巳']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '卯' && item.counterpartSide.zhi === '酉');
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(record && force && signal, '应生成卯酉元素例式 signal');
    assert(signal.status === 'resolved', `元素例式应 resolved：${signal?.status}`);
    assert(signal.preference === 'root-side', `卯方应获 preference：${signal?.preference}`);
    assert(force.status === 'resolved', `non-seasonal-relative-force 应 resolved：${force?.status}`);
    assert(force.preference === 'root-side', `维度应支持卯根方：${force?.preference}`);
    assert(signal.presentChecks[0].element === '火' && signal.presentChecks[0].present === true, '应确认表层有火');
    assert(signal.absentChecks[0].element === '土' && signal.absentChecks[0].present === false, '应确认表层无土');
    assert(record.comparison.status === 'insufficient', 'support/rescue 维未解时整体仍应 insufficient');
});

test('卯酉冲：表层见土时只表示例式未触发，不得反推酉方 preference', () => {
    const model = outputFor(['甲','乙','乙','丙'], ['亥','卯','酉','辰']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '卯' && item.counterpartSide.zhi === '酉');
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(signal?.status === 'not-matched', `见土后例式应 not-matched：${signal?.status}`);
    assert(force?.status === 'unresolved', '例式未满足时维度应保持 unresolved');
    assert(force?.preference === null, '例式未满足不得反推酉方 preference');
    assert(force?.reasonCode === 'source-example-surface-conditions-not-met', `reasonCode 异常：${force?.reasonCode}`);
});

test('寅申冲：寅藏丙但表层无火时，“四柱有火”不成立', () => {
    const model = outputFor(['庚','甲','甲','辛'], ['子','寅','申','亥']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '寅' && item.counterpartSide.zhi === '申');
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(record && signal, '应生成寅申元素例式 signal');
    assert(signal.presentChecks[0].element === '火', '应检查“四柱有火”');
    assert(signal.presentChecks[0].present === false, '寅藏丙不得让表层有火成立');
    assert(signal.status === 'not-matched', '只有寅藏丙时例式不应触发');
    assert(force.status === 'unresolved' && force.preference === null, '维度应保持 unresolved');
});

test('寅申冲：另见明支午时，“四柱有火”可由明支满足', () => {
    const model = outputFor(['庚','甲','甲','辛'], ['子','寅','申','午']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '寅' && item.counterpartSide.zhi === '申');
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(signal?.status === 'resolved', `明支午应使例式 resolved：${signal?.status}`);
    assert(signal.presentChecks[0].matches.some((item) => item.source === 'visible-branch' && item.symbol === '午'), '应由明支午满足有火');
    assert(force?.status === 'resolved' && force.preference === 'root-side', '寅方 non-seasonal force 应 resolved');
});

test('子午冲：既有支类 dimension 未携 hint 时，仍回查 source registry 解析“午旺提纲、无金而有木”', () => {
    const model = outputFor(['甲','丙','丁','乙'], ['午','午','子','午']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) =>
        item.rootSide.zhi === '午' && item.rootSide.isMonthBranch === true && item.counterpartSide.zhi === '子'
    );
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(record && force && signal, '月支午根对子冲应生成元素例式 signal');
    assert(signal.hint?.targetZhi === '午', '应从 source registry 回查午子例式');
    assert(signal.status === 'resolved', `无金有木例式应 resolved：${signal?.status}`);
    assert(signal.preference === 'root-side', `午方应获 preference：${signal?.preference}`);
    assert(signal.presentChecks[0].element === '木' && signal.presentChecks[0].present === true, '应确认表层有木');
    assert(signal.absentChecks[0].element === '金' && signal.absentChecks[0].present === false, '应确认表层无金');
    assert(force.status === 'resolved' && force.preference === 'root-side', '子午 non-seasonal force 应由元素例式解析午方');
    assert(record.comparison.status === 'insufficient', 'support/rescue 未解析时整体比较仍应 insufficient');
});

test('元素例式要求目标本身为月支提纲；非月支即使表层条件满足也不触发', () => {
    const model = outputFor(['甲','丙','乙','丙'], ['卯','巳','酉','亥']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '卯' && item.counterpartSide.zhi === '酉');
    const force = forceDimension(record);
    const signal = force?.observations?.elementPresenceSignal;
    assert(record && signal, '应生成卯酉 signal');
    assert(signal.targetIsMonthBranch === false, '卯不应是月支');
    assert(signal.status === 'not-matched', '非月支目标不得触发“旺提纲”例式');
    assert(signal.reasonCode === 'target-not-month-command', `reasonCode 异常：${signal.reasonCode}`);
    assert(force.preference === null, '不得输出 preference');
});

test('Scope resolved claim 与新 non-seasonal claim 保持真实 Structure / Root Effect provenance', () => {
    const model = outputFor(['甲','乙','乙','丙'], ['亥','卯','酉','巳']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '卯' && item.counterpartSide.zhi === '酉');
    const claim = model.strengthSynthesis.claims.find((item) => item.claimKey === `root.six-clash.${record.structureRef}.nonseasonal-force`);
    const scopeClaim = model.strengthSynthesis.claims.find((item) => item.claimKey === 'root.six-clash.element-presence-scope');
    const structureIds = new Set(model.structures.map((item) => item.id));
    const effectIds = new Set(model.strengthEffects.effects.map((item) => item.id));
    assert(scopeClaim?.status === 'resolved', 'scope contract claim 应 resolved');
    assert(scopeClaim.value.hiddenStemsIncluded === false, 'scope claim 应排除藏干');
    assert(claim?.status === 'resolved', '卯酉例式应生成 nonseasonal claim');
    assert(claim.sourceRefs.length === 1 && structureIds.has(claim.sourceRefs[0]), 'claim 未引用真实 Structure');
    assert(claim.sourceEffectIds.length > 0 && claim.sourceEffectIds.every((id) => effectIds.has(id)), 'claim 未引用真实 Root Effect');
});

test('复制分析上下文不泄漏 Element Presence Scope 内部字段', () => {
    const result = makeResult(['甲','乙','乙','丙'], ['亥','卯','酉','巳']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'explicit-pillar-surface',
        'SD-CLASH-ELEMENT-PRESENCE-SCOPE',
        'SC-ELEMENT-PRESENCE-SCOPE-CONTRACT',
        'elementPresenceSignal',
        'source-example-surface-element-context',
        'elementPresenceScopeRuleIds'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Element Presence Scope 内部字段：${term}`));
});

console.log(`\nBaZi element presence scope: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
