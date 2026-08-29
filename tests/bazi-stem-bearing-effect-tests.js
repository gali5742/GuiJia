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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziStemBearingEffect;

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

function recordFor(collection, actorKey) {
    return (collection.records || []).find((item) => item.actorKey === actorKey);
}

test('Stem Bearing Effect v0.1 建立“同柱承载≠Root Role≠generic effective”合同', () => {
    assert(api?.installed === true, 'Stem Bearing Effect 模块未安装');
    assert(api.STEM_BEARING_EFFECT_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.samePillarBearingPair === true, '应明确 stem 与同柱支形成 bearing pair');
    assert(api.CONTRACT.projectRootRoleIndependent === true, 'Stem Bearing 必须与 project Root Role 分离');
    assert(api.CONTRACT.sourceBearingStateMapsToGenericVisibleEffectiveness === false, 'source bearing state 不得自动映射 generic visible effectiveness');
    assert(api.CONTRACT.sourceNotCarriedMapsToIneffective === false, '“虽有若无”不得自动映射 ineffective');
    assert(api.CONTRACT.sourceBearingFortifiedMapsToEffective === false, '“愈固”不得自动映射 effective');
});

test('Source Basis 同时保存“干以载之支为切”与三个 direct source outcome', () => {
    const terms = api.SOURCE_BASIS.map((item) => item.term).join('\n');
    assert(terms.includes('干以载之支为切，支以覆之干为切'), '缺少同柱承载总论');
    assert(terms.includes('丁火之根愈固'), '缺少亥生卯正例');
    assert(terms.includes('克败丁火之根'), '缺少卯酉冲反例');
    assert(terms.includes('地支不载，虽有若无'), '缺少甲申不载直证');
    assert(api.DIRECT_SOURCE_PATTERNS.length === 3, '应只收三条 direct source pattern');
});

test('普通命盘只建立 visible stem × 同柱支 bearing pair，不自动解释有效性', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const collection = output.semanticModel.stemBearingEffect;
    assert(collection.records.length === 3, `应对应年/月/时三个非日主明干：${collection.records.length}`);
    const year = recordFor(collection, 'visible:0:丁');
    const month = recordFor(collection, 'visible:1:壬');
    const hour = recordFor(collection, 'visible:3:己');
    assert(year?.bearingZhi === '丑' && month?.bearingZhi === '子' && hour?.bearingZhi === '酉', '同柱 branch pairing 异常');
    assert(collection.records.every((item) => item.resolutionStatus === 'unresolved-no-source-specific-resolver'), '普通盘不得套 exact source case');
    assert(collection.records.every((item) => item.sourceBearingState === null && item.genericVisibleEffectiveState === null), '普通盘不得生成 source/generic effective outcome');
});

test('己亥 丁卯 庚申 庚辰：丁卯 + 亥水生扶只解析 source-bearing-fortified', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const model = output.semanticModel;
    const record = recordFor(model.stemBearingEffect, 'visible:1:丁');
    assert(record?.sourcePatternId === 'DTS-STEM-BEARING-DING-MAO-HAI-SUPPORT-001', '正例 pattern 未命中');
    assert(record.resolutionStatus === 'resolved-source-bearing-outcome', '正例应解析 source outcome');
    assert(record.sourceBearingState === 'source-bearing-fortified-by-support', '正例 source state 异常');
    assert(record.bearingZhi === '卯' && record.supportActor?.zhi === '亥', '正例 actor provenance 异常');
    assert(record.genericVisibleEffectiveState === null, '“愈固”不得直接写 generic effective');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得因此启动最终 Strength');
});

test('己酉 丁卯 庚辰 甲申：卯酉冲只解析丁火 bearing damaged source outcome', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const model = output.semanticModel;
    const record = recordFor(model.stemBearingEffect, 'visible:1:丁');
    assert(record?.sourcePatternId === 'DTS-STEM-BEARING-DING-MAO-YOU-DAMAGE-001', '反例 damage pattern 未命中');
    assert(record.resolutionStatus === 'resolved-source-bearing-outcome', `反例 damage 应解析：${record?.resolutionStatus}`);
    assert(record.sourceBearingState === 'source-bearing-damaged-by-clash', '反例 damage state 异常');
    assert(record.structureRef, '卯酉冲必须保留 Structure provenance');
    assert(record.attackerActor?.zhi === '酉', '反例 attacker actor 应为酉');
    assert(record.genericVisibleEffectiveState === null, '“克败”不得直接写 generic ineffective');
});

test('己酉 丁卯 庚辰 甲申：甲申“地支不载，虽有若无”仍不是 ineffective', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const model = output.semanticModel;
    const record = recordFor(model.stemBearingEffect, 'visible:3:甲');
    assert(record?.sourcePatternId === 'DTS-STEM-BEARING-JIA-SHEN-NOT-CARRIED-001', '甲申 not-carried pattern 未命中');
    assert(record.sourceBearingState === 'source-not-carried-as-if-absent', '甲申 source state 异常');
    assert(record.bearingZhi === '申', '甲申 bearing branch 应为申');
    assert(record.genericVisibleEffectiveState === null, '“虽有若无”不得直接写 ineffective');
    const visibleEffect = (model.strengthEffects.effects || []).find((item) => item.actorKey === 'visible:3:甲');
    assert(visibleEffect?.status === 'presence-only', '原始 visible stem presence 不得被删除或覆写');
});

test('exact source pattern 不得泛化到只有丁卯或甲申的其他命盘', () => {
    const { output } = outputFor(['乙','丁','庚','甲'], ['亥','卯','午','申']);
    const collection = output.semanticModel.stemBearingEffect;
    const ding = recordFor(collection, 'visible:1:丁');
    const jia = recordFor(collection, 'visible:3:甲');
    assert(ding?.resolutionStatus === 'unresolved-no-source-specific-resolver', '只有丁卯不得泛化正例');
    assert(jia?.resolutionStatus === 'unresolved-no-source-specific-resolver', '只有甲申不得泛化“虽有若无”');
});

test('Stem Bearing 作为 SD-VISIBLE-EFFECTIVENESS 前置依赖，但不解决该依赖', () => {
    const { output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-STEM-BEARING-SOURCE-COVERAGE'], '缺少 Stem Bearing coverage dependency');
    assert(deps['SD-STEM-BEARING-EFFECT-MAPPING']?.status === 'unresolved', 'bearing → generic visible mapping 必须 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 不得被 source case 直接解决');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-STEM-BEARING-SOURCE-COVERAGE'), 'Visible Effectiveness 应依赖 bearing coverage');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-STEM-BEARING-EFFECT-MAPPING'), 'Visible Effectiveness 应依赖 bearing mapping');
    assert(synthesis.sufficiency.status === 'insufficient', '最终 Synthesis 仍应 insufficient');
});

test('Stem Bearing 不回写 project Root actor，也不引入分数/权重/最终强弱', () => {
    const { result, output } = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']);
    const model = output.semanticModel;
    const serialized = JSON.stringify({
        collection:model.stemBearingEffect,
        contract:model.strengthSynthesis.stemBearingEffectContract,
        records:model.strengthSynthesis.stemBearingEffectRecords
    });
    ['score','weight','points','"strong"','"weak"','"balanced"'].forEach((term) => {
        assert(!serialized.includes(term), `Stem Bearing 不得引入 ${term}`);
    });
    assert((model.strengthSynthesis.rootActorStates || []).every((item) => !String(item.actorKey || '').startsWith('visible:')), 'visible bearing actor 不得进入 rootActorStates');
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'stemBearingEffect',
        'source-bearing-fortified-by-support',
        'source-bearing-damaged-by-clash',
        'source-not-carried-as-if-absent',
        'SD-STEM-BEARING-SOURCE-COVERAGE',
        'SD-STEM-BEARING-EFFECT-MAPPING'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Stem Bearing 内部字段：${term}`));
});

console.log(`\nBaZi stem bearing effect: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
