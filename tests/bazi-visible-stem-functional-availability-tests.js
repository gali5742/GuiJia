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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemFunctionalAvailability;

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

function recordFor(records, actorKey) {
    return (records || []).find((item) => item.actorKey === actorKey);
}

test('Functional Availability v0.1 明确“上下文功能可用性 ≠ actor global effectiveness”', () => {
    assert(api?.installed === true, 'Functional Availability 模块未安装');
    assert(api.VISIBLE_STEM_FUNCTIONAL_AVAILABILITY_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.functionalAvailabilityIsActorGlobalEffectiveness === false, 'functional availability 不得等同全局 effectiveness');
    assert(api.CONTRACT.functionallyUnavailableMeansStemAbsent === false, 'functionally unavailable 不得等同明干消失');
    assert(api.CONTRACT.bearingSupportedMeansEffective === false, 'bearing-supported 不得等同 effective');
    assert(api.CONTRACT.bearingImpairedMeansIneffective === false, 'bearing-impaired 不得等同 ineffective');
});

test('“虽有若无”同书旁证落到具体功能失败，而非全局删除 actor', () => {
    const terms = api.SOURCE_SEMANTIC_BASIS.map((item) => item.term).join('\n');
    assert(terms.includes('地支不载，虽有若无'), '缺少甲申 source term');
    assert(terms.includes('虽有若无，焉能生远隔之水'), '缺少辛金“焉能生远隔之水”旁证');
    const interpretationRule = api.SOURCE_STATE_INTERPRETATIONS['source-not-carried-as-if-absent'];
    assert(interpretationRule.functionalAvailabilityState === 'functionally-unavailable-in-context', '“虽有若无”应解释为上下文功能不可兑现');
    assert(interpretationRule.actorGlobalEffectiveState === null, '不得同时给 global ineffective');
});

test('己亥 丁卯 庚申 庚辰：愈固只转成 bearing-supported', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const record = recordFor(synthesis.visibleStemFunctionalAvailabilityRecords, 'visible:1:丁');
    assert(record?.resolutionStatus === 'resolved-functional-availability', '丁火 functional availability 应解析');
    assert(record.functionalAvailabilityState === 'bearing-supported', `应为 bearing-supported：${record?.functionalAvailabilityState}`);
    assert(record.genericVisibleEffectiveState === null, 'bearing-supported 不得写 effective');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得启动最终 Strength');
});

test('己酉 丁卯 庚辰 甲申：克败只转成 bearing-impaired', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const record = recordFor(synthesis.visibleStemFunctionalAvailabilityRecords, 'visible:1:丁');
    assert(record?.resolutionStatus === 'resolved-functional-availability', '丁火 damage functional availability 应解析');
    assert(record.functionalAvailabilityState === 'bearing-impaired', `应为 bearing-impaired：${record?.functionalAvailabilityState}`);
    assert(record.genericVisibleEffectiveState === null, 'bearing-impaired 不得写 ineffective');
});

test('己酉 丁卯 庚辰 甲申：甲申虽有若无只转成 functionally-unavailable-in-context', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const model = output.semanticModel;
    const synthesis = model.strengthSynthesis;
    const record = recordFor(synthesis.visibleStemFunctionalAvailabilityRecords, 'visible:3:甲');
    assert(record?.resolutionStatus === 'resolved-functional-availability', '甲申 functional availability 应解析');
    assert(record.functionalAvailabilityState === 'functionally-unavailable-in-context', `应为 contextual unavailable：${record?.functionalAvailabilityState}`);
    assert(record.functionalMeaning === 'intended-function-not-realized-in-this-context', '功能语义异常');
    assert(record.genericVisibleEffectiveState === null, '不得写 global ineffective');
    const visible = (model.strengthEffects.effects || []).find((item) => item.actorKey === 'visible:3:甲');
    assert(visible?.status === 'presence-only', '原始甲木 visible presence 必须保留');
});

test('普通明干没有 resolved Stem Bearing outcome 时，不生成 functional availability', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionalAvailabilityRecords || [];
    assert(records.length === 3, `应保留三个 visible stem record：${records.length}`);
    assert(records.every((item) => item.resolutionStatus === 'unresolved-source-bearing-outcome'), '无 direct source outcome 时必须 unresolved');
    assert(records.every((item) => item.functionalAvailabilityState === null), '不得从字面 bearing pair 补 functional state');
});

test('未知 source-bearing state 不允许兜底映射', () => {
    const record = api.buildFunctionalAvailabilityRecord({
        id:'SBE-X',
        actorKey:'visible:0:甲',
        visibleEffectId:'FX-X',
        pillarIndex:0,
        stemGan:'甲',
        bearingZhi:'寅',
        resolutionStatus:'resolved-source-bearing-outcome',
        sourceBearingState:'source-unknown-bearing-state',
        sourceRefs:[]
    });
    assert(record.resolutionStatus === 'unresolved-unsupported-source-bearing-state', '未知 source state 应保持 unresolved');
    assert(record.functionalAvailabilityState === null && record.genericVisibleEffectiveState === null, '未知 state 不得兜底');
});

test('Functional Interpretation 可解析，但 Effect Mapping 与 Visible Effectiveness 继续 unresolved', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION']?.status === 'unresolved', '整盘仍有其他未覆盖 visible stem，functional interpretation 全局应保持 unresolved');
    const resolvedClaims = (synthesis.claims || []).filter((item) => item.claimKey?.includes('bearing-functional-availability') && item.status === 'resolved');
    assert(resolvedClaims.length >= 2, '丁与甲两个 exact actor 应产生 resolved functional claims');
    assert(deps['SD-STEM-BEARING-EFFECT-MAPPING']?.status === 'unresolved', 'functional availability → global effectiveState 必须 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION'), 'Visible Effectiveness 应依赖 functional interpretation');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-STEM-BEARING-EFFECT-MAPPING'), 'Visible Effectiveness 应依赖 final bearing mapping');
    assert(synthesis.sufficiency.status === 'insufficient', '最终 Synthesis 仍 insufficient');
});

test('Functional Availability 不泄漏到复制上下文，也不引入分数/最终强弱', () => {
    const { result, output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemFunctionalAvailabilityRecords,
        contract:synthesis.visibleStemFunctionalAvailabilityContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','"effective"','"ineffective"'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'visibleStemFunctionalAvailabilityRecords',
        'bearing-supported',
        'bearing-impaired',
        'functionally-unavailable-in-context',
        'SD-STEM-BEARING-FUNCTIONAL-INTERPRETATION'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`));
});

test('生产加载链包含 Functional Availability 模块且位于 Stem Bearing 之后', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-root-clash-interaction-effect.js'), 'utf8');
    const stemIndex = source.indexOf('./js/bazi-stem-bearing-effect.js?v=13.44.0');
    const functionalIndex = source.indexOf('./js/bazi-visible-stem-functional-availability.js?v=13.44.0');
    assert(stemIndex >= 0, '生产链缺 Stem Bearing');
    assert(functionalIndex > stemIndex, 'Functional Availability 必须在 Stem Bearing 后加载');
});

console.log(`\nBaZi visible stem functional availability: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
