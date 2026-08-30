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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemFunctionReachability;

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

test('Function Reachability v0.2 固定 actor × target × function，并分离 participant provenance 与 function source', () => {
    assert(api?.installed === true, 'Function Reachability 模块未安装');
    assert(api.VISIBLE_STEM_FUNCTION_REACHABILITY_VERSION === '0.2', '版本异常');
    assert(api.CONTRACT.targetSpecific === true, '功能效力必须 target-specific');
    assert(api.CONTRACT.actorGlobalEffectiveState === false, '不得建立 actor global switch');
    assert(api.CONTRACT.participantProvenanceSeparatedFromFunctionSource === true, 'participant provenance 必须与 function source 分离');
    assert(api.CONTRACT.sourceDistanceLanguageCreatesNumericThreshold === false, '不得把远隔数值化');
    assert(api.CONTRACT.sourceDistanceLanguageCreatesUniversalAdjacencyRule === false, '不得制造邻柱万能规则');
});

test('Structured chart key 只从 Strength Evidence 机器字段重建，不解析 F01 展示文本', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const model = output.semanticModel;
    assert(api.buildStructuredChartKey(model) === '癸丑|己未|丙寅|辛卯', `chartKey 异常：${api.buildStructuredChartKey(model)}`);
    const mutated = { ...model, facts:(model.facts || []).map((item) => item.id === 'F01' ? { ...item, text:'故意改坏的展示文本' } : item) };
    assert(api.buildStructuredChartKey(mutated) === '癸丑|己未|丙寅|辛卯', '不得依赖 F01 中文文本重建 chart key');
});

test('癸丑 己未 丙寅 辛卯：辛生癸只解析为 target-specific unavailable', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionReachabilityRecords || [];
    const record = records.find((item) => item.sourcePatternId === 'DTS-VISIBLE-FUNCTION-XIN-GENERATES-GUI-001');
    assert(record, '辛生癸 exact source pattern 未命中');
    assert(record.actorKey === 'visible:3:辛' && record.targetKey === 'visible:0:癸', '辛→癸 actor/target provenance 异常');
    assert(record.functionType === 'generation', '应记录相生功能');
    assert(record.reachabilityState === 'unavailable-in-source-context', '应记录 source-context unavailable');
    assert(record.actorGlobalEffectiveState === null, '不得写 actor global ineffective');
    assert(record.distanceThreshold === null, '不得产生柱距阈值');
});

test('癸丑 己未 丙寅 辛卯：己生辛同样只解析具体 target function', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionReachabilityRecords || [];
    const record = records.find((item) => item.sourcePatternId === 'DTS-VISIBLE-FUNCTION-JI-GENERATES-XIN-001');
    assert(record, '己生辛 exact source pattern 未命中');
    assert(record.actorKey === 'visible:1:己' && record.targetKey === 'visible:3:辛', '己→辛 actor/target provenance 异常');
    assert(record.reachabilityState === 'unavailable-in-source-context', '己→辛应记录 source-context unavailable');
    assert(record.actorGlobalEffectiveState === null, '不得写 actor global ineffective');
});

test('Exact source case 不得泛化成相同天干或柱距规则', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','辰','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemFunctionReachabilityRecords || [];
    assert(records.length === 0, '仅改日支后不得继续命中 exact source pattern');
    assert(output.semanticModel.strengthSynthesis.visibleStemFunctionReachabilityContract.sourceDistanceLanguageCreatesNumericThreshold === false, '不得形成固定距离公式');
});

test('Direct source record 保留 participant provenance，但不再冒充 cross-actor function sourceEffect', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const records = synthesis.visibleStemFunctionReachabilityRecords || [];
    const deps = dependencyMap(synthesis);
    assert(records.length === 2, `应有两条 direct source function record：${records.length}`);
    records.forEach((record) => {
        assert(record.participantEffectIds.length === 2, `${record.id} 应保留 actor+target 两条 participant effect provenance`);
        assert(record.participantEffectIds.every(Boolean), `${record.id} participant effect provenance 不得为空`);
        assert(record.sourceEffectIds.length === 0, `${record.id} 不得把 participant Effect 冒充 function sourceEffect`);
        assert(record.sourceRefs.length === 0, `${record.id} 不得把 participant sourceRefs 冒充 function sourceRefs`);
    });
    assert((deps['SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS']?.participantEffectIds || []).length >= 2, 'source semantics dependency 应独立保存 participantEffectIds');
    assert((deps['SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS']?.sourceEffectIds || []).length === 0, 'source semantics dependency 不得伪造 function sourceEffectIds');
});

test('Function source semantics 可解析，但 day-master-related realization 继续 unresolved', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS']?.status === 'resolved', 'source semantics 应已解析');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY']?.status === 'unresolved', 'day-master-related function realization 必须 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY'), 'Visible Effectiveness 应显式依赖 day-master-related realization');
    assert(synthesis.sufficiency.status === 'insufficient', '最终 Synthesis 仍应 insufficient');
});

test('固定验证盘不命中 source case，但仍明确缺少与日主相关的 function resolver', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert((synthesis.visibleStemFunctionReachabilityRecords || []).length === 0, '固定验证盘不得制造 source case');
    assert(deps['SD-VISIBLE-STEM-FUNCTION-REACHABILITY-SOURCE-SEMANTICS']?.status === 'resolved', '未命中 source case 时 source semantics 为 not-applicable/resolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY']?.status === 'unresolved', '三个明干与日主相关的具体作用仍无 resolver');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Strength 不得启动');
});

test('Function Reachability 不泄漏内部字段，不引入分数或最终强弱', () => {
    const { result, output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemFunctionReachabilityRecords,
        contract:synthesis.visibleStemFunctionReachabilityContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'visibleStemFunctionReachability',
        'participantEffectIds',
        'unavailable-in-source-context',
        'SD-VISIBLE-STEM-DAYMASTER-FUNCTION-REACHABILITY',
        'DTS-VISIBLE-FUNCTION-XIN-GENERATES-GUI-001'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`));
});

test('生产加载链在 Functional Availability 后加载 Function Reachability', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-functional-availability.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-function-reachability.js?v=13.44.0'), '生产加载链缺少 Function Reachability');
});

console.log(`\nBaZi visible stem function reachability: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);