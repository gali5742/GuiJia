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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const preconditionsApi = GuiJia.baziClashPreconditions;

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

test('生产加载路径包含 Clash Preconditions 模块与 Guard 018-019', () => {
    const assessmentSource = fs.readFileSync(path.join(ROOT, 'js/bazi-assessment.js'), 'utf8');
    assert(assessmentSource.includes('./js/bazi-clash-preconditions.js'), '生产页面没有 Clash Preconditions 加载路径');
    const guards = new Map(GuiJia.baziAssessment.assessmentGuardRegistry.rules.map((item) => [item.id, item.statement]));
    assert(guards.has('BAZI-ASSESS-GUARD-018'), '缺少 Guard 018');
    assert(guards.has('BAZI-ASSESS-GUARD-019'), '缺少 Guard 019');
});

test('固定验证盘没有 root clash 时 Clash Relative State 为 not-applicable/resolved', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(Array.isArray(synthesis.clashPreconditionRecords), '缺 clashPreconditionRecords');
    assert(synthesis.clashPreconditionRecords.length === 0, '固定盘不应生成 root clash precondition');
    assert(deps['SD-CLASH-RELATIVE-STATE-COMPARISON']?.status === 'resolved', '无 root clash 时 comparison dependency 应 resolved/not-applicable');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得推进最终 Assessment');
});

test('冬月子午冲记录午火死、子水旺，但比较仍必须 insufficient', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午');
    assert(record, '应生成午根的 clash precondition');
    assert(record.rootSide.season === '冬', `季节应为冬：${record.rootSide.season}`);
    assert(record.rootSide.seasonalFiveState === '死', `午火冬月应记录为死：${record.rootSide.seasonalFiveState}`);
    assert(record.counterpartSide.zhi === '子', `对冲方应为子：${record.counterpartSide.zhi}`);
    assert(record.counterpartSide.seasonalFiveState === '旺', `子水冬月应记录为旺：${record.counterpartSide.seasonalFiveState}`);
    assert(record.rootSide.isMonthBranch === false, '年支午不应标记为月支');
    assert(record.counterpartSide.isMonthBranch === true, '月支子应标记为月支');
    assert(record.comparison.status === 'insufficient', '死/旺单轴不得直接形成比较结论');
    assert(record.comparison.outcome === null, '死/旺单轴不得输出对冲胜负');
    assert(record.preconditions.every((item) => item.status === 'unresolved'), '六冲必要前提当前都应 unresolved');
});

test('夏月子午冲记录午火旺、子水囚，也不能自动判午根占优', () => {
    const model = outputFor(['甲','壬','丁','己'], ['子','午','亥','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午' && item.rootSide.isMonthBranch);
    assert(record, '月支午中的丁根应生成 clash precondition');
    assert(record.rootSide.season === '夏', `季节应为夏：${record.rootSide.season}`);
    assert(record.rootSide.seasonalFiveState === '旺', `午火夏月应记录为旺：${record.rootSide.seasonalFiveState}`);
    assert(record.counterpartSide.zhi === '子', `对冲方应为子：${record.counterpartSide.zhi}`);
    assert(record.counterpartSide.seasonalFiveState === '囚', `子水夏月应记录为囚：${record.counterpartSide.seasonalFiveState}`);
    assert(record.comparison.status === 'insufficient', '旺/囚单轴仍不得自动形成比较结论');
    assert(record.comparison.outcome === null, '不得自动输出 root-side-dominant');
});

test('Branch Structure provenance 记录真实参与柱位，不依赖中文文本反推对冲方', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const clash = model.structures.find((item) => item.code === 'BRANCH_SIX_CLASH');
    const context = model.strengthEffects.branchStructureContexts.find((item) => item.structureRef === clash?.id);
    assert(clash && context, '缺六冲 Structure provenance');
    const participants = context.participants.map((item) => `${item.pillarIndex}:${item.zhi}`).sort().join(',');
    assert(participants === '0:午,1:子', `六冲参与柱位异常：${participants}`);
    const record = model.strengthSynthesis.clashPreconditionRecords[0];
    assert(record.structureRef === clash.id, 'precondition 未引用真实 Structure ID');
    assert(record.sourceEffectIds.length > 0, 'precondition 未保留 Root Effect provenance');
});

test('其他 Structure 只作为上下文引用，不按数量转成扶助或制化', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','未','酉']).semanticModel;
    const record = model.strengthSynthesis.clashPreconditionRecords.find((item) => item.rootSide.zhi === '午');
    assert(record, '应生成午根 clash precondition');
    const contextPrecondition = record.preconditions.find((item) => item.key === 'support-restraint-rescue-context');
    assert(contextPrecondition, '缺 support/restraint/rescue context');
    assert(Array.isArray(contextPrecondition.observations.rootAdditionalStructureRefs), '根方其他 Structure 应保留 refs');
    assert(contextPrecondition.status === 'unresolved', '其他 Structure 存在不得自动解析成扶助/制化');
    const serialized = JSON.stringify(contextPrecondition);
    ['score','weight','points'].forEach((term) => assert(!serialized.includes(term), `上下文不应出现数值聚合字段：${term}`));
});

test('非补偿比较：必要维度未解析时必须 insufficient', () => {
    const result = preconditionsApi.compareSemanticDimensions([
        { id:'D1', required:true, status:'resolved', preference:'root-side' },
        { id:'D2', required:true, status:'unresolved', preference:null }
    ]);
    assert(result.status === 'insufficient', `未解析维度应 insufficient：${result.status}`);
    assert(result.outcome === null, '未解析维度时不得输出相对支配');
    assert(result.blockingDimensionIds.includes('D2'), '应指出阻断维度 D2');
});

test('非补偿比较：双方各有已解析优势时必须 incomparable，不能多数表决', () => {
    const result = preconditionsApi.compareSemanticDimensions([
        { id:'D1', required:true, status:'resolved', preference:'root-side' },
        { id:'D2', required:true, status:'resolved', preference:'root-side' },
        { id:'D3', required:true, status:'resolved', preference:'counterpart-side' }
    ]);
    assert(result.status === 'resolved', '全部必要维度已解析时应进入 resolved comparison');
    assert(result.outcome === 'incomparable', `2:1 也不得多数表决：${result.outcome}`);
});

test('非补偿比较：只有无反向证据且至少一维明确占优时才形成语义支配', () => {
    const root = preconditionsApi.compareSemanticDimensions([
        { id:'D1', required:true, status:'resolved', preference:'root-side' },
        { id:'D2', required:true, status:'resolved', preference:'equivalent' }
    ]);
    const counterpart = preconditionsApi.compareSemanticDimensions([
        { id:'D1', required:true, status:'resolved', preference:'counterpart-side' },
        { id:'D2', required:true, status:'resolved', preference:'equivalent' }
    ]);
    assert(root.outcome === 'root-side-dominant', `根方支配结果异常：${root.outcome}`);
    assert(counterpart.outcome === 'counterpart-side-dominant', `冲方支配结果异常：${counterpart.outcome}`);
    [root, counterpart].forEach((item) => {
        const serialized = JSON.stringify(item);
        ['score','weight','points'].forEach((term) => assert(!serialized.includes(term), `comparison 不应出现数值字段：${term}`));
    });
});

test('六冲效力 dependency 显式依赖 Clash Relative State comparison', () => {
    const model = outputFor(['甲','壬','丁','己'], ['午','子','亥','酉']).semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    const clashEffect = deps['SD-ROOT-SIX-CLASH-EFFECTIVENESS'];
    const comparison = deps['SD-CLASH-RELATIVE-STATE-COMPARISON'];
    assert(clashEffect?.dependsOnDependencyIds?.includes('SD-CLASH-RELATIVE-STATE-COMPARISON'), '六冲根效力未显式依赖相对状态比较');
    assert(comparison?.status === 'unresolved', '有 root clash 时 relative state comparison 应 unresolved');
    assert(model.strengthSynthesis.sufficiency.status === 'insufficient', '必要依赖未解析时整体仍应 insufficient');
});

test('复制分析上下文不泄漏 Clash Preconditions 内部字段', () => {
    const result = makeResult(['甲','壬','丁','己'], ['午','子','亥','酉']);
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'clashPreconditionRecords',
        'branchStructureContexts',
        'SD-CLASH-RELATIVE-STATE-COMPARISON',
        'root-side-dominant',
        'counterpart-side-dominant',
        'observed-unranked',
        'BAZI-STRENGTH-CLASH-PRECONDITION-CONTRACT-001'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Clash Preconditions 内部字段：${term}`));
});

console.log(`\nBaZi clash preconditions: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
