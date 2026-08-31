#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
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
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
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
    'js/bazi-month-command.js',
    'js/bazi-strength-effects.js',
    'js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js',
    'js/bazi-root-six-relations.js',
    'js/bazi-clash-preconditions.js',
    'js/bazi-clash-seasonal-position.js',
    'js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js',
    'js/bazi-clash-rescue-context.js',
    'js/bazi-root-clash-source-outcome.js',
    'js/bazi-root-clash-interaction-effect.js',
    'js/bazi-root-actor-interaction-aggregation.js',
    'js/bazi-root-baseline-effectiveness.js',
    'js/bazi-stem-bearing-effect.js',
    'js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js',
    'js/bazi-visible-stem-directed-function.js',
    'js/bazi-visible-stem-function-coverage.js',
    'js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemFunctionRealizationSource;

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
        solarStr:'测试时间',
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis) {
    const result = makeResult(gans, zhis);
    return { result, output:interpretation.buildBaziInterpretation(result) };
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('Direct Source Function Realization v0.1 只授权 exact-source edge outcome', () => {
    assert(api?.installed === true, 'Direct Source Function Realization 模块未安装');
    assert(api.VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.directSourceExactCaseOnly === true, '必须 exact-source-only');
    assert(api.CONTRACT.elementalRelationAloneDoesNotCreateEdge === true, '五行字面关系不得单独造 edge');
    assert(api.CONTRACT.bearingAloneDoesNotResolveEdge === true, 'bearing 不得单独解决 edge');
    assert(api.CONTRACT.genericReachabilityResolverIntroduced === false, '不得偷加通用 reachability resolver');
    assert(api.CONTRACT.genericRealizationResolverIntroduced === false, '不得偷加通用 realization resolver');
    assert(api.CONTRACT.actorGlobalEffectiveState === false, '不得建立 actor global state');
});

test('DTS exact chart key 可从现有 strength evidence / bearing inventory 无损重建', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    assert(api.buildStructuredChartKey(output.semanticModel, synthesis) === '丁丑|癸卯|乙卯|己卯', 'exact chart key 重建失败');
});

test('DTS exact source：乙→丁 generation 正向兑现，且只细化已有 day-master edge', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const sourceRecords = synthesis.visibleStemFunctionRealizationSourceRecords || [];
    assert(sourceRecords.length === 3, `应命中三条 direct-source outcome：${sourceRecords.length}`);
    const record = (synthesis.visibleStemFunctionRealizationRecords || []).find((item) =>
        item.sourceActorKey === 'daymaster:2:乙'
        && item.targetActorKey === 'visible:0:丁'
        && item.functionType === 'generation'
    );
    assert(record, '乙→丁 generation edge 缺失');
    assert(record.relationScope === 'daymaster-related', '乙→丁 应继续是 daymaster-related edge');
    assert(record.realizationState === 'realized-in-source-context', '乙→丁 应为 source-context realized');
    assert(record.resolutionStatus === 'resolved-direct-source-function-realized', '乙→丁 resolution status 异常');
    assert(record.sourcePatternId === 'DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001', '乙→丁 source pattern provenance 丢失');
    assert(record.actorGlobalEffectiveState === null, '乙→丁 realized 不得生成 actor global state');
});

test('DTS exact source：癸→丁 restraint 可作为原文明示的 cross-visible realized edge', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const record = (output.semanticModel.strengthSynthesis.visibleStemFunctionRealizationRecords || []).find((item) =>
        item.sourceActorKey === 'visible:1:癸'
        && item.targetActorKey === 'visible:0:丁'
        && item.functionType === 'restraint'
    );
    assert(record, '癸→丁 restraint edge 缺失');
    assert(record.relationScope === 'cross-visible-actor', '癸→丁 应为 cross-visible edge');
    assert(record.realizationState === 'realized-in-source-context', '癸→丁 应为 source-context realized');
    assert(record.sourcePatternId === 'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001', '癸→丁 source pattern provenance 丢失');
});

test('DTS exact source：己→癸 restraint 同层记录为 not-realized，不与正向 edge 混写', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const record = (output.semanticModel.strengthSynthesis.visibleStemFunctionRealizationRecords || []).find((item) =>
        item.sourceActorKey === 'visible:3:己'
        && item.targetActorKey === 'visible:1:癸'
        && item.functionType === 'restraint'
    );
    assert(record, '己→癸 restraint edge 缺失');
    assert(record.realizationState === 'not-realized-in-source-context', '己→癸 应为 source-context not-realized');
    assert(record.resolutionStatus === 'resolved-direct-source-function-not-realized', '己→癸 resolution status 异常');
    assert(record.sourcePatternId === 'DTS-VISIBLE-REALIZATION-JI-RESTRAINS-GUI-001', '己→癸 source pattern provenance 丢失');
});

test('Exact-source 不泛化到仅一柱不同的相似命局', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['亥','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    assert((synthesis.visibleStemFunctionRealizationSourceRecords || []).length === 0, '相似盘不得命中 exact-source pattern');
    assert(!(synthesis.visibleStemFunctionRealizationRecords || []).some((item) => item.realizationState === 'realized-in-source-context'), '相似盘不得得到正向 realized');
    assert(!(synthesis.visibleStemFunctionRealizationRecords || []).some((item) => item.sourcePatternId?.startsWith('DTS-VISIBLE-REALIZATION-')), '相似盘不得带入 direct-source pattern');
});

test('固定验证盘保持原状：无 source pattern 命中，三个 day-master edge 继续 unresolved', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    assert((synthesis.visibleStemFunctionRealizationSourceRecords || []).length === 0, '固定验证盘不应命中 direct-source pattern');
    const dayMasterRecords = (synthesis.visibleStemFunctionRealizationRecords || []).filter((item) => item.relationScope === 'daymaster-related');
    assert(dayMasterRecords.length === 3, '固定验证盘应保留三个 day-master edge');
    assert(dayMasterRecords.every((item) => item.realizationState === 'unresolved'), '固定验证盘 realization 不得被新 source resolver 改写');
});

test('旧 DTS 小儿命例保持两条 reachability-backed not-realized，不被新 source overlay 改写', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    assert((synthesis.visibleStemFunctionRealizationSourceRecords || []).length === 0, '旧 DTS 命例不应误命中新 source pattern');
    const cross = (synthesis.visibleStemFunctionRealizationRecords || []).filter((item) => item.relationScope === 'cross-visible-actor');
    assert(cross.length === 2, `旧 DTS cross edge 数异常：${cross.length}`);
    assert(cross.every((item) => item.realizationState === 'not-realized-in-source-context'), '旧 DTS 两条 edge 应继续 not-realized');
    assert(cross.every((item) => item.resolutionStatus === 'resolved-source-function-not-realized'), '旧 reachability-backed resolution status 不得被改写');
});

test('Source evidence 可 resolved，但 coverage / Visible Effectiveness / Assessment 仍按未解 edge 阻断', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REALIZATION-SOURCE-EVIDENCE']?.status === 'resolved', 'source evidence resolver 应 resolved');
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE']?.status === 'unresolved', '仍有 day-master edges 未解，coverage 必须 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Direct Source Realization 不引入 score/priority/global state，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemFunctionRealizationSourceRecords,
        contract:synthesis.visibleStemFunctionRealizationSourceContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','"priority":','priorityOrder','priorityRule'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemFunctionRealizationSourceRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), 'source realization 不得生成 global state');
    assert(synthesis.visibleStemFunctionRealizationSourceContract.majorityVoting === false, '必须明确禁止 majority voting');
    assert(synthesis.visibleStemFunctionRealizationSourceContract.priorityAggregation === false, '必须明确禁止 priority aggregation');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemFunctionRealizationSource','realized-in-source-context','DTS-VISIBLE-REALIZATION-'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在基础 Function Realization 后加载 Direct Source Realization', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-function-realization.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-function-realization-source.js?v=13.44.0'), '生产加载链缺少 Direct Source Realization');
    const sourceLayer = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-function-realization-source.js'), 'utf8');
    assert(sourceLayer.includes('./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0'), 'Direct Source Realization 后未继续加载 Actor Interaction Aggregation');
});

console.log(`\nBaZi visible stem direct-source function realization: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
require('./bazi-visible-stem-actor-interaction-aggregation-tests.js');
