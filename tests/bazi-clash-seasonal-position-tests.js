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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const seasonalApi = GuiJia.baziClashSeasonalPosition;

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

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function seasonalDimension(record) {
    return (record?.comparisonDimensions || []).find((item) => item.key === 'seasonal-command-position');
}

test('Research bootstrap 显式声明 Clash Seasonal Position 模块', () => {
    const bootstrapSource = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    assert(bootstrapSource.includes('./js/bazi-clash-seasonal-position.js'), 'Research bootstrap 未声明 Clash Seasonal Position 模块');
    assert(seasonalApi?.installed === true, '季节地位模块未安装');
});

test('固定验证盘无 root clash 时季节地位 dependency 为 resolved/not-applicable', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(model.strengthSynthesis.clashPreconditionRecords.length === 0, '固定盘不应生成 root clash record');
    assert(deps['SD-CLASH-SEASONAL-POSITION']?.status === 'resolved', '无 root clash 时季节地位 dependency 应 resolved');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终身强弱 Assessment');
});

test('冬月子午冲：月支子只在季节地位维度记为冲方占优', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.counterpartSide.zhi === '子');
    const dimension = seasonalDimension(record);
    assert(record && dimension, '应生成午根对子冲的季节地位维度');
    assert(record.rootSide.seasonalFiveState === '死', `午火冬月应记录死：${record.rootSide.seasonalFiveState}`);
    assert(record.counterpartSide.seasonalFiveState === '旺', `子水冬月应记录旺：${record.counterpartSide.seasonalFiveState}`);
    assert(record.counterpartSide.isMonthBranch === true, '子应为月支提纲');
    assert(dimension.status === 'resolved', `月支提纲季节维度应 resolved：${dimension.status}`);
    assert(dimension.preference === 'counterpart-side', `季节维度应支持冲方：${dimension.preference}`);
    assert(dimension.reasonCode === 'direct-month-command-holder', `解析原因异常：${dimension.reasonCode}`);
    assert(record.comparison.status === 'insufficient', '单一季节维度 resolved 后整体比较仍应 insufficient');
    assert(record.comparison.outcome === null, '不得由月支提纲直接输出六冲整体胜负');
    assert(record.comparison.blockingDimensionIds.length === 2, '其余两个必要维度应继续阻断整体比较');
});

test('夏月子午冲：月支午只在季节地位维度记为根方占优', () => {
    const model = outputFor(['甲','壬','丁','己'], ['子','午','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.rootSide.isMonthBranch);
    const dimension = seasonalDimension(record);
    assert(record && dimension, '月支午中的丁根应生成季节地位维度');
    assert(record.rootSide.seasonalFiveState === '旺', `午火夏月应记录旺：${record.rootSide.seasonalFiveState}`);
    assert(record.counterpartSide.seasonalFiveState === '囚', `子水夏月应记录囚：${record.counterpartSide.seasonalFiveState}`);
    assert(dimension.status === 'resolved', '月支午的季节地位维度应 resolved');
    assert(dimension.preference === 'root-side', `季节维度应支持根方：${dimension.preference}`);
    assert(record.comparison.status === 'insufficient', '季节维度 resolved 不得独自解决整体相对状态');
});

test('巳月午旺子囚但双方都不是月支时，不启用旺相休囚死通用排序', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','巳','亥','子']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.counterpartSide.zhi === '子');
    const dimension = seasonalDimension(record);
    assert(record && dimension, '应生成午子冲季节地位维度');
    assert(record.rootSide.seasonalFiveState === '旺', `巳月午火应记录旺：${record.rootSide.seasonalFiveState}`);
    assert(record.counterpartSide.seasonalFiveState === '囚', `巳月子水应记录囚：${record.counterpartSide.seasonalFiveState}`);
    assert(record.rootSide.isMonthBranch === false && record.counterpartSide.isMonthBranch === false, '午、子均不应是巳月月支');
    assert(dimension.status === 'unresolved', '非月支旺/囚差异不得直接解析季节 preference');
    assert(dimension.preference === null, '非月支五态差异不得输出 preference');
    assert(dimension.reasonCode === 'no-direct-month-command-holder', `应保持窄规则边界：${dimension.reasonCode}`);
});

test('丑未四库冲即使一方是月支，也不沿用普通月支提纲 preference', () => {
    const model = outputFor(['甲','壬','丁','己'], ['未','丑','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '未' && item.counterpartSide.zhi === '丑');
    const dimension = seasonalDimension(record);
    assert(record && dimension, '未中丁根参与丑未冲应生成季节地位维度');
    assert(record.counterpartSide.isMonthBranch === true, '丑应为月支');
    assert(dimension.status === 'unresolved', '四库冲不应套用普通月支提纲 preference');
    assert(dimension.preference === null, '四库冲季节维度当前不得输出 preference');
    assert(dimension.reasonCode === 'storage-clash-special-handling', `四库冲应进入特殊处理：${dimension.reasonCode}`);
});

test('季节地位 resolved claim 只引用真实 Root Effect 与 Structure', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午');
    const claim = model.strengthSynthesis.claims.find((item) => item.claimKey === `root.six-clash.${record.structureRef}.seasonal-position`);
    const structureIds = new Set(model.structures.map((item) => item.id));
    const effectIds = new Set(model.strengthEffects.effects.map((item) => item.id));
    assert(claim?.status === 'resolved', '应生成季节地位 resolved claim');
    assert(claim.value === 'counterpart-side', `claim preference 异常：${claim.value}`);
    assert(claim.sourceRefs.length === 1 && structureIds.has(claim.sourceRefs[0]), 'claim 未引用真实 Structure');
    assert(claim.sourceEffectIds.length > 0 && claim.sourceEffectIds.every((id) => effectIds.has(id)), 'claim 未引用真实 Root Effect');
});

test('Clash Relative State 显式依赖 Seasonal Position，但仍被非季节维度阻断', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    const seasonal = deps['SD-CLASH-SEASONAL-POSITION'];
    const comparison = deps['SD-CLASH-RELATIVE-STATE-COMPARISON'];
    assert(seasonal?.status === 'resolved', `当前 root clash 的季节维度应 resolved：${seasonal?.status}`);
    assert(comparison?.dependsOnDependencyIds?.includes('SD-CLASH-SEASONAL-POSITION'), 'Relative State 未显式依赖季节地位层');
    assert(comparison?.status === 'unresolved', '其他必要维度未解析时 Relative State 必须 unresolved');
    assert(model.strengthSynthesis.sufficiency.status === 'insufficient', '整体 Synthesis 仍应 insufficient');
});

test('季节地位层不引入 score/weight/points 或五态数字排名', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const serialized = JSON.stringify({
        records:model.strengthSynthesis.clashPreconditionRecords,
        rules:model.strengthSynthesis.clashSeasonalPositionRuleIds
    });
    ['score','weight','points','rankValue','numericRank'].forEach((term) => {
        assert(!serialized.includes(term), `季节地位层不应出现数值聚合字段：${term}`);
    });
});

test('复制分析上下文不泄漏 Seasonal Position 内部字段', () => {
    const result = makeResult(['甲','壬','丁','己'], ['午','子','亥','酉']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'seasonal-command-position',
        'SD-CLASH-SEASONAL-POSITION',
        'SC-CLASH-SEASONAL-POSITION',
        'direct-month-command-holder',
        'storage-clash-special-handling',
        'clashSeasonalPositionRuleIds'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Seasonal Position 内部字段：${term}`));
});

console.log(`\nBaZi clash seasonal position: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
