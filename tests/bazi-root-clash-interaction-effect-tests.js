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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const outcomeApi = GuiJia.baziRootClashSourceOutcome;
const interactionApi = GuiJia.baziRootClashInteractionEffect;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉'], solarStr = '') {
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
        solarStr,
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis, solarStr = '') {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis, solarStr));
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function findInteraction(model, a, b) {
    const wanted = [a,b].sort().join('');
    return (model.strengthSynthesis.rootClashInteractionEffectRecords || []).find((item) =>
        [item.rootZhi, item.counterpartZhi].sort().join('') === wanted
    );
}

test('生产加载链包含 Root Clash Interaction Effect 独立模块', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-root-clash-source-outcome.js'), 'utf8');
    assert(source.includes('./js/bazi-root-clash-interaction-effect.js?v=13.44.0'), 'Source Outcome 未接入 interaction effect 浏览器加载链');
    assert(interactionApi?.installed === true, 'Root Clash Interaction Effect 模块未安装');
    assert(interactionApi.ROOT_CLASH_INTERACTION_EFFECT_VERSION === '0.1', `Interaction Effect 版本异常：${interactionApi.ROOT_CLASH_INTERACTION_EFFECT_VERSION}`);
});

test('“拔不能立／能去之”只解析为 interaction-level cannot-stand / removable-by-clash', () => {
    const record = interactionApi.buildInteractionEffectRecord({
        id:'RCSO-TEST-A',
        resolutionStatus:'resolved-source-outcome',
        sourceOutcomeKind:'source-uprooted-removed',
        sourceOutcomeTerm:'拔',
        rootStateId:'RS-TEST',
        actorKey:'branch:2:hidden:庚',
        structureRef:'S-TEST',
        rootZhi:'申',
        counterpartZhi:'寅',
        sourceEffectIds:['FX-TEST']
    });
    assert(record.resolutionStatus === 'resolved-interaction-semantics', `拔类结果应解析 interaction semantics：${record.resolutionStatus}`);
    assert(record.standingState === 'cannot-stand', `“拔不能立”应映射 cannot-stand：${record.standingState}`);
    assert(record.removalState === 'removable-by-clash', `“能去之”应映射 removable-by-clash：${record.removalState}`);
    assert(record.harmState === null && record.activationState === null, '拔类结果不得伪造无伤或反激语义');
    assert(record.genericEffectiveState === null && record.interactionToActorEffectiveState === 'unresolved', 'interaction semantics 不得直接变 actor ineffective');
});

test('“无伤／反激／发”只解析为 interaction-level unharmed / stimulated-by-clash', () => {
    const record = interactionApi.buildInteractionEffectRecord({
        id:'RCSO-TEST-B',
        resolutionStatus:'resolved-source-outcome',
        sourceOutcomeKind:'source-unharmed-stimulated',
        sourceOutcomeTerm:'发',
        sourceDamageTerm:'无伤',
        rootStateId:'RS-TEST',
        actorKey:'branch:1:hidden:戊',
        structureRef:'S-TEST',
        rootZhi:'巳',
        counterpartZhi:'亥',
        sourceEffectIds:['FX-TEST']
    });
    assert(record.resolutionStatus === 'resolved-interaction-semantics', `发类结果应解析 interaction semantics：${record.resolutionStatus}`);
    assert(record.harmState === 'unharmed', `“无伤”应映射 unharmed：${record.harmState}`);
    assert(record.activationState === 'stimulated-by-clash', `“反激／发”应映射 stimulated-by-clash：${record.activationState}`);
    assert(record.standingState === null && record.removalState === null, '发类结果不得伪造不能立／能去之语义');
    assert(record.genericEffectiveState === null && record.interactionToActorEffectiveState === 'unresolved', 'unharmed/stimulated 不得直接变 actor effective');
});

test('上游 Source Outcome 未解析时，Interaction Effect 不得提前产生任何结果字段', () => {
    const record = interactionApi.buildInteractionEffectRecord({
        id:'RCSO-TEST-C',
        resolutionStatus:'unresolved-relative-state',
        sourceOutcomeKind:null,
        rootStateId:'RS-TEST',
        structureRef:'S-TEST',
        rootZhi:'申',
        counterpartZhi:'寅'
    });
    assert(record.resolutionStatus === 'unresolved-source-outcome', `未解析 source outcome 不得进入 interaction semantics：${record.resolutionStatus}`);
    ['standingState','removalState','harmState','activationState','genericEffectiveState'].forEach((key) => {
        assert(record[key] === null, `未解析时 ${key} 必须为 null`);
    });
});

test('SP-05 exact 巳亥冲把“发／无伤”拆为交互语义，但不回写 rootActorStates', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const interaction = findInteraction(model, '巳', '亥');
    assert(interaction, 'SP-05 应生成巳亥 interaction effect record');
    assert(interaction.resolutionStatus === 'resolved-interaction-semantics', `SP-05 巳亥 interaction semantics 应 resolved：${interaction.resolutionStatus}`);
    assert(interaction.sourceOutcomeKind === 'source-unharmed-stimulated', `SP-05 source kind 异常：${interaction.sourceOutcomeKind}`);
    assert(interaction.harmState === 'unharmed' && interaction.activationState === 'stimulated-by-clash', 'SP-05 应保存无伤／反激语义');
    assert(interaction.genericEffectiveState === null, 'SP-05 interaction record 不得生成 generic effectiveState');
    assert(model.strengthSynthesis.rootActorStates.every((item) => item.effectiveState === null), 'Interaction Effect 不得回写 actor global effectiveState');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得启动最终 Strength Assessment');
});

test('固定验证盘无 root clash 时 Interaction Interpretation 为 not-applicable/resolved', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert((model.strengthSynthesis.rootClashInteractionEffectRecords || []).length === 0, '无 root clash 不得制造 interaction records');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION']?.status === 'resolved', '无 root clash 时 interaction interpretation 应 resolved/not-applicable');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING']?.status === 'resolved', '无 interaction semantics 时 generic mapping 应 not-applicable/resolved');
});

test('SP-05 同盘有未完成 root clash 时，单条可解释但聚合 Interpretation dependency 继续 unresolved', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    const records = model.strengthSynthesis.rootClashInteractionEffectRecords || [];
    assert(records.some((item) => item.resolutionStatus === 'resolved-interaction-semantics'), 'SP-05 至少一条 interaction semantics 应 resolved');
    assert(records.some((item) => item.resolutionStatus !== 'resolved-interaction-semantics'), 'SP-05 同盘应保留其他未完成 root clash');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION']?.status === 'unresolved', '聚合 Interpretation dependency 不得因一条完成就 resolved');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING']?.status === 'unresolved', 'actor global mapping 仍必须 unresolved');
    assert(deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING']?.dependsOnDependencyIds?.includes('SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION'), 'generic mapping 应显式依赖 interaction interpretation');
});

test('Interaction claim 只引用真实六冲 Structure，并依赖 Source Outcome', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const interaction = findInteraction(model, '巳', '亥');
    const claim = model.strengthSynthesis.claims.find((item) =>
        item.ruleId === interactionApi.ROOT_CLASH_INTERACTION_EFFECT_RULE_ID
        && item.value?.activationState === 'stimulated-by-clash'
    );
    const structureIds = new Set(model.structures.map((item) => item.id));
    assert(interaction && claim, '应生成 resolved interaction claim');
    assert(claim.sourceRefs.length === 1 && claim.sourceRefs[0] === interaction.structureRef, 'interaction claim 只应回指该六冲 Structure');
    assert(claim.sourceRefs.every((id) => structureIds.has(id)), 'interaction claim sourceRefs 必须是真实 Structure');
    assert(claim.dependencyIds.includes('SD-ROOT-SIX-CLASH-SOURCE-OUTCOME'), 'interaction claim 必须显式依赖 Source Outcome');
    assert(claim.value.genericEffectiveState === null, 'interaction claim 不得附 generic effectiveState');
});

test('Interaction Effect 不引入分数、权重或最终强弱，也不把原始根事实删除', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const serialized = JSON.stringify({
        contract:model.strengthSynthesis.rootClashInteractionEffectContract,
        records:model.strengthSynthesis.rootClashInteractionEffectRecords,
        claims:model.strengthSynthesis.claims.filter((item) => item.ruleId === interactionApi.ROOT_CLASH_INTERACTION_EFFECT_RULE_ID)
    });
    ['score','weight','points','strong','weak','balanced'].forEach((term) => {
        assert(!serialized.includes(`\"${term}\"`), `Interaction Effect 不得引入 ${term}`);
    });
    assert((model.strengthSynthesis.rootActorStates || []).every((item) => item.presence === 'present'), '六冲交互不得删除 root presence fact/state');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Assessment 必须保持 not-evaluated');
});

test('复制分析上下文不泄漏 Root Clash Interaction Effect 内部字段', () => {
    const result = makeResult(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00');
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'rootClashInteractionEffectRecords',
        'rootClashInteractionEffectContract',
        'SD-ROOT-SIX-CLASH-SOURCE-SEMANTIC-INTERPRETATION',
        'SC-ROOT-CLASH-INTERACTION-EFFECT-CONTRACT',
        'cannot-stand',
        'removable-by-clash',
        'unharmed',
        'stimulated-by-clash',
        'interactionToActorEffectiveState'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Interaction Effect 内部字段：${term}`));
});

console.log(`\nBaZi root clash interaction effect: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
