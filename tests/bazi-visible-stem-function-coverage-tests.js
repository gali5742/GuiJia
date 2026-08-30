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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemFunctionCoverage;

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

function coverageRecord(synthesis, actorKey) {
    return (synthesis.visibleStemFunctionCoverageRecords || []).find((item) => item.actorKey === actorKey);
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('Function Coverage v0.1 只建立 actor participation inventory', () => {
    assert(api?.installed === true, 'Function Coverage 模块未安装');
    assert(api.VISIBLE_STEM_FUNCTION_COVERAGE_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.actorCentric === true, '应为 actor-centric inventory');
    assert(api.CONTRACT.inventoryOnly === true, 'Coverage 不得做 realization');
    assert(api.CONTRACT.actorGlobalEffectiveState === false, '不得建立 actor global switch');
    assert(api.CONTRACT.bearingContextIsConditionNotFunctionResult === true, 'bearing 只能作为条件');
    assert(api.CONTRACT.priorityAggregation === false, '不得启用 priority aggregation');
});

test('固定验证盘：peer/source/target participation role 均保持真实方向', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const peer = coverageRecord(synthesis, 'visible:0:丁');
    const inbound = coverageRecord(synthesis, 'visible:1:壬');
    const outboundTarget = coverageRecord(synthesis, 'visible:3:己');

    assert(peer?.dayMasterRelation?.participationRole === 'peer', '年干丁应保存 peer participation');
    assert(peer.dayMasterRelation.sourceActorKey === null && peer.dayMasterRelation.targetActorKey === null, 'peer 不得出现伪 source/target');
    assert(inbound?.dayMasterRelation?.participationRole === 'source', '月干壬在克我中应是 source');
    assert(inbound.dayMasterRelation.sourceActorKey === 'visible:1:壬' && inbound.dayMasterRelation.targetActorKey === 'daymaster:2:丁', '壬→丁方向错误');
    assert(outboundTarget?.dayMasterRelation?.participationRole === 'target', '时干己在我生中应是 target');
    assert(outboundTarget.dayMasterRelation.sourceActorKey === 'daymaster:2:丁' && outboundTarget.dayMasterRelation.targetActorKey === 'visible:3:己', '不得因 actor-centric 汇总反写成己→丁');
});

test('DTS exact source：同一 visible stem 可同时保存 cross-actor source 与 target participation', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const xin = coverageRecord(synthesis, 'visible:3:辛');
    assert(xin, '辛 coverage 缺失');
    assert(xin.crossActorParticipations.some((item) => item.participationRole === 'source' && item.counterpartyActorKey === 'visible:0:癸'), '辛→癸 source participation 缺失');
    assert(xin.crossActorParticipations.some((item) => item.participationRole === 'target' && item.counterpartyActorKey === 'visible:1:己'), '己→辛 target participation 缺失');
    assert(xin.crossActorParticipations.every((item) => item.reachabilityState === 'unavailable-in-source-context'), 'source case reachability 应原样保留');
});

test('Stem Bearing Functional Availability 只作为 actor bearing context 收入 Coverage', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const ding = coverageRecord(synthesis, 'visible:1:丁');
    assert(ding, '丁 coverage 缺失');
    assert(ding.bearingContexts.some((item) => item.functionalAvailabilityState === 'bearing-supported'), '丁卯+亥 source bearing-supported 应进入 coverage');
    assert(ding.genericVisibleEffectiveState === null, 'bearing-supported 不得升级为 global effective');
    assert(ding.aggregationStatus === 'not-aggregated', 'Coverage 阶段不得做 actor aggregation');
});

test('Coverage inventory 可 resolved，但 Visible Effectiveness 与最终 Strength 继续 unresolved', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY']?.status === 'resolved', '已知上游 participation inventory 应可 resolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 不得被 Coverage 解决');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY'), 'Visible Effectiveness 应显式依赖 Coverage');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Coverage 不引入数量表决、分数或全局有效性', () => {
    const { result, output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemFunctionCoverageRecords,
        contract:synthesis.visibleStemFunctionCoverageContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','majority','"priority":','priorityOrder','priorityRule'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemFunctionCoverageRecords || []).every((item) => item.genericVisibleEffectiveState === null && item.aggregationStatus === 'not-aggregated'), 'Coverage 不得生成 global state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemFunctionCoverage','SD-VISIBLE-STEM-FUNCTION-COVERAGE-INVENTORY','crossActorParticipations'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Directed Function 后加载 Function Coverage', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-directed-function.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-function-coverage.js?v=13.44.0'), '生产加载链缺少 Function Coverage');
});

console.log(`\nBaZi visible stem function coverage: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);