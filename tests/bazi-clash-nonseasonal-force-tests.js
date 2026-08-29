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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const forceApi = GuiJia.baziClashNonseasonalForce;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganZhi:gan + zhi,
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

function dimension(record, key = 'non-seasonal-relative-force') {
    return (record?.comparisonDimensions || []).find((item) => item.key === key);
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('生产加载路径包含 Clash Nonseasonal Force 模块与 Guard 020', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(source.includes('./js/bazi-clash-nonseasonal-force.js'), '生产页面没有非季节力量模块加载路径');
    assert(forceApi?.installed === true, '非季节力量模块未安装');
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-020'), '缺少 Guard 020');
});

test('固定验证盘无 root clash 时 Nonseasonal Force dependency 为 resolved/not-applicable', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(model.strengthSynthesis.clashPreconditionRecords.length === 0, '固定盘不应生成 root clash record');
    assert(deps['SD-CLASH-NONSEASONAL-RELATIVE-FORCE']?.status === 'resolved', '无 root clash 时非季节力量 dependency 应 resolved');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终 Assessment');
});

test('子午冲：其余两支只命中寅卯巳未戌组时，非季节维度支持午方', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','寅','卯']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.counterpartSide.zhi === '子');
    const force = dimension(record);
    const seasonal = dimension(record, 'seasonal-command-position');
    assert(record && force, '应生成午根对子冲的非季节维度');
    assert(force.status === 'resolved', `支类上下文应解析：${force.status}`);
    assert(force.preference === 'root-side', `寅卯上下文应支持午方：${force.preference}`);
    assert(force.reasonCode === 'wu-side-source-listed-support-context', `reasonCode 异常：${force.reasonCode}`);
    assert(force.observations.wuSupportSignals.map((item) => item.zhi).sort().join('') === '卯寅', '应只记录寅卯为午方支类信号');
    assert(force.observations.wuCounterSignals.length === 0, '不应存在反向支类信号');
    assert(seasonal.preference === 'counterpart-side', '月支子仍应只在季节维度支持子方');
    assert(record.comparison.status === 'insufficient', '季节与非季节方向相反且 rescue 维未解时仍必须 insufficient');
    assert(record.comparison.outcome === null, '不得越过未解析必要维度输出整体胜负');
});

test('子午冲：其余两支只命中申酉亥子丑辰组时，非季节维度支持子方', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','申','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.counterpartSide.zhi === '子');
    const force = dimension(record);
    assert(force?.status === 'resolved', '申酉上下文应解析非季节维度');
    assert(force.preference === 'counterpart-side', `申酉上下文应支持子方：${force?.preference}`);
    assert(force.reasonCode === 'zi-side-source-listed-counter-context', `reasonCode 异常：${force?.reasonCode}`);
    assert(force.observations.wuCounterSignals.map((item) => item.zhi).sort().join('') === '申酉', '应记录申酉为反向支类信号');
});

test('子午冲：两组支类同时出现时保持 unresolved，不做多数或权重仲裁', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','寅','申']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.counterpartSide.zhi === '子');
    const force = dimension(record);
    assert(force?.status === 'unresolved', '相反支类并存必须 unresolved');
    assert(force.preference === null, '相反支类并存不得输出 preference');
    assert(force.reasonCode === 'mixed-source-listed-branch-context', `应进入 mixed context：${force?.reasonCode}`);
});

test('午位于冲方时，同一原文支类规则仍只支持午这一侧，不绑定 root/counterpart 标签', () => {
    const model = outputFor(['甲','丙','癸','己'], ['子','午','寅','卯']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '子' && item.counterpartSide.zhi === '午');
    const force = dimension(record);
    assert(record && force, '癸根子与午冲应生成 record');
    assert(force.status === 'resolved', '寅卯上下文应解析');
    assert(force.preference === 'counterpart-side', `午在冲方时应支持 counterpart-side：${force.preference}`);
});

test('卯酉等原典五行有无例式只保存 source hint，element-presence scope 未定前不生成 preference', () => {
    const model = outputFor(['甲','乙','乙','己'], ['酉','卯','巳','亥']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '卯' && item.counterpartSide.zhi === '酉');
    const force = dimension(record);
    assert(record && force, '卯根参与卯酉冲应生成非季节维度');
    assert(force.status === 'unresolved', '卯酉五行有无 scope 未定前必须 unresolved');
    assert(force.preference === null, 'scope 未定不得输出 preference');
    assert(force.reasonCode === 'source-example-element-scope-unresolved', `reasonCode 异常：${force.reasonCode}`);
    assert(force.observations.targetZhi === '卯', 'source hint 目标应为卯');
    assert(force.observations.requiredPresentElements.join('') === '火', '应保存“有火”条件');
    assert(force.observations.requiredAbsentElements.join('') === '土', '应保存“无土”条件');
});

test('丑未四库冲继续留在独立规则域，不套子午支类模式', () => {
    const model = outputFor(['甲','壬','丁','己'], ['未','丑','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '未' && item.counterpartSide.zhi === '丑');
    const force = dimension(record);
    assert(force?.status === 'unresolved', '四库冲应继续 unresolved');
    assert(force?.reasonCode === 'storage-clash-special-handling', `四库冲 reasonCode 异常：${force?.reasonCode}`);
});

test('resolved 非季节 claim 只引用真实 Root Effect 与 Structure，dependency 显式接入 Relative State', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','寅','卯']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午');
    const claim = model.strengthSynthesis.claims.find((item) => item.claimKey === `root.six-clash.${record.structureRef}.nonseasonal-force`);
    const deps = dependencyMap(model.strengthSynthesis);
    const structureIds = new Set(model.structures.map((item) => item.id));
    const effectIds = new Set(model.strengthEffects.effects.map((item) => item.id));
    assert(claim?.status === 'resolved', '应生成 nonseasonal force claim');
    assert(claim.sourceRefs.length === 1 && structureIds.has(claim.sourceRefs[0]), 'claim 未引用真实 Structure');
    assert(claim.sourceEffectIds.length > 0 && claim.sourceEffectIds.every((id) => effectIds.has(id)), 'claim 未引用真实 Root Effect');
    assert(deps['SD-CLASH-NONSEASONAL-RELATIVE-FORCE']?.status === 'resolved', '当前唯一 root clash 的非季节维度应 resolved');
    assert(deps['SD-CLASH-RELATIVE-STATE-COMPARISON']?.dependsOnDependencyIds?.includes('SD-CLASH-NONSEASONAL-RELATIVE-FORCE'), 'Relative State 未显式依赖非季节力量层');
    assert(model.strengthSynthesis.sufficiency.status === 'insufficient', 'support/rescue 等未解析时整体仍应 insufficient');
});

test('非季节力量层不引入 score/weight/points 或命中数量优势', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','寅','卯']).semanticModel;
    const serialized = JSON.stringify({
        records:model.strengthSynthesis.clashPreconditionRecords,
        rules:model.strengthSynthesis.clashNonseasonalForceRuleIds
    });
    ['score','weight','points','supportCount','counterCount','rankValue','numericRank'].forEach((term) => {
        assert(!serialized.includes(term), `非季节力量层不应出现数值聚合字段：${term}`);
    });
});

test('复制分析上下文不泄漏 Nonseasonal Force 内部字段', () => {
    const result = makeResult(['甲','壬','丁','己'], ['午','子','寅','卯']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'non-seasonal-relative-force',
        'SD-CLASH-NONSEASONAL-RELATIVE-FORCE',
        'SC-CLASH-NONSEASONAL-FORCE',
        'wu-side-source-listed-support-context',
        'elementPresenceScope',
        'clashNonseasonalForceRuleIds'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Nonseasonal Force 内部字段：${term}`));
});

console.log(`\nBaZi clash nonseasonal force: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
