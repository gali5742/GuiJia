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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemFunctionRealization;

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

test('Function Realization v0.1 冻结 edge-specific、target-specific 边界', () => {
    assert(api?.installed === true, 'Function Realization 模块未安装');
    assert(api.VISIBLE_STEM_FUNCTION_REALIZATION_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.edgeCentric === true, 'Realization 必须 edge-centric');
    assert(api.CONTRACT.targetSpecific === true, 'Realization 必须 target-specific');
    assert(api.CONTRACT.functionalAvailabilityAloneDoesNotResolveFunction === true, 'bearing availability 不得单独解决 function');
    assert(api.CONTRACT.peerNeedsDedicatedResolver === true, 'peer 必须保留独立 resolver');
    assert(api.CONTRACT.actorGlobalEffectiveState === false, '不得建立 actor global state');
    assert(api.CONTRACT.priorityAggregation === false, '不得启用 priority aggregation');
});

test('固定验证盘：三个 day-master-related edge 全部保持 unresolved，peer 无 source/target', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionRealizationRecords || [];
    const dayMasterRecords = records.filter((item) => item.relationScope === 'daymaster-related');
    assert(dayMasterRecords.length === 3, `应有三个 day-master-related edge：${dayMasterRecords.length}`);
    assert(dayMasterRecords.every((item) => item.realizationState === 'unresolved'), '无 target-specific 证据时必须 unresolved');
    const peer = dayMasterRecords.find((item) => item.relationFromDayMaster === '同我');
    assert(peer?.directed === false, '同我必须保持 peer');
    assert(peer.sourceActorKey === null && peer.targetActorKey === null, 'peer 不得出现伪 source/target');
    assert(peer.resolutionStatus === 'unresolved-peer-realization', 'peer 应等待独立 realization resolver');
});

test('DTS exact source：两条 cross-visible edge 可解析为 source-context not-realized', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionRealizationRecords || [];
    const cross = records.filter((item) => item.relationScope === 'cross-visible-actor');
    assert(cross.length === 2, `应有两条 cross-visible realization：${cross.length}`);
    assert(cross.every((item) => item.realizationState === 'not-realized-in-source-context'), 'source unavailable 应映射为对应 edge 未兑现');
    assert(cross.every((item) => item.resolutionStatus === 'resolved-source-function-not-realized'), '两条 source edge 应 resolved');
    const xinToGui = cross.find((item) => item.sourceActorKey === 'visible:3:辛' && item.targetActorKey === 'visible:0:癸');
    assert(xinToGui?.functionType === 'generation', '辛→癸应保留 generation function');
    assert(xinToGui.sourcePatternId === 'DTS-VISIBLE-FUNCTION-XIN-GENERATES-GUI-001', '辛→癸 sourcePattern provenance 丢失');
});

test('Cross-actor 未兑现不得传播到同一 visible stem 的 day-master relation', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionRealizationRecords || [];
    const crossXin = records.find((item) => item.relationScope === 'cross-visible-actor' && item.sourceActorKey === 'visible:3:辛');
    const dayMasterXin = records.find((item) => item.relationScope === 'daymaster-related' && item.participantActorKeys.includes('visible:3:辛'));
    assert(crossXin?.realizationState === 'not-realized-in-source-context', '辛→癸 source edge 应未兑现');
    assert(dayMasterXin, '辛与日主的 relation edge 缺失');
    assert(dayMasterXin.realizationState === 'unresolved', '辛→癸未兑现不得传播成辛与日主 relation 已无效');
    assert(dayMasterXin.actorGlobalEffectiveState === null, '不得产生 actor global ineffective');
});

test('bearing-supported 只作为 context condition，不自动解决 day-master function', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const coverage = (synthesis.visibleStemFunctionCoverageRecords || []).find((item) => item.actorKey === 'visible:1:丁');
    assert(coverage?.bearingContexts?.some((item) => item.functionalAvailabilityState === 'bearing-supported'), '丁应有 bearing-supported context');
    const record = (synthesis.visibleStemFunctionRealizationRecords || []).find((item) => item.relationScope === 'daymaster-related' && item.participantActorKeys.includes('visible:1:丁'));
    assert(record, '丁与日主的 realization record 缺失');
    assert(record.contextConditionRecordIds.length > 0, 'bearing condition 应附着到 relation edge');
    assert(record.realizationState === 'unresolved', 'bearing-supported 不得自动变成 function realized');
});

test('Realization Model 可 resolved，但 Coverage 继续阻断 Visible Effectiveness / Assessment', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REALIZATION-MODEL']?.status === 'resolved', 'edge-specific realization contract 应 resolved');
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE']?.status === 'unresolved', '通用 day-master / peer realization 未完成，应 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE'), 'Visible Effectiveness 应依赖 realization coverage');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Function Realization 不引入 score/weight/priority/global effectiveState，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemFunctionRealizationRecords,
        contract:synthesis.visibleStemFunctionRealizationContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','majority','"priority":','priorityOrder','priorityRule'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemFunctionRealizationRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), 'Realization 不得生成 global visible state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemFunctionRealization','not-realized-in-source-context','SD-VISIBLE-STEM-FUNCTION-REALIZATION-COVERAGE'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Function Coverage 后加载 Function Realization', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-function-coverage.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-function-realization.js?v=13.44.0'), '生产加载链缺少 Function Realization');
});

console.log(`\nBaZi visible stem function realization: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);