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
    'js/bazi-visible-stem-actor-interaction-aggregation.js',
    'js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemActorProfileInterpretation;

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

test('Actor Profile Interpretation v0.1 只允许 ready + exact-source profile 进入解释', () => {
    assert(api?.installed === true, 'Actor Profile Interpretation 模块未安装');
    assert(api.VISIBLE_STEM_ACTOR_PROFILE_INTERPRETATION_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.requiresReadyProfileBeforeInterpretation === true, '必须先满足 profile readiness');
    assert(api.CONTRACT.exactSourcePatternsOnly === true, '只能使用 exact-source profile pattern');
    assert(api.CONTRACT.interpretedProfileDoesNotMeanActorEffective === true, 'interpreted profile 不得等同 actor effective');
    assert(api.CONTRACT.profileInterpretationDoesNotResolveVisibleEffectiveness === true, '本层不得解决 Visible Effectiveness');
    assert(api.CONTRACT.numericAggregation === false && api.CONTRACT.majorityVoting === false && api.CONTRACT.priorityAggregation === false, '不得引入数值/多数/优先级聚合');
});

test('DTS exact-source：丁 profile 解析为“泄秀作用已兑现，同时受到直接克制”', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const ding = (synthesis.visibleStemActorProfileInterpretationRecords || []).find((item) => item.actorKey === 'visible:0:丁');
    assert(ding, '丁 actor profile interpretation 缺失');
    assert(ding.inputReadinessStatus === 'ready-for-actor-profile-interpretation', '丁 profile 应先 ready');
    assert(ding.resolutionStatus === 'resolved-exact-source-profile-interpretation', `丁 interpretation 应 resolved：${ding.resolutionStatus}`);
    assert(ding.interpretationState === 'outlet-function-realized-under-restraint-in-source-context', '丁 profile 组合语义异常');
    assert(ding.sourcePatternId === 'DTS-ACTOR-PROFILE-DING-OUTLET-RESTRAINED-001', '应命中唯一 exact-source profile pattern');
    assert(ding.matchedEdgeContexts.length === 2, '应精确消费乙→丁、癸→丁两条已兑现 edge');
    assert(ding.matchedEdgeContexts.every((item) => item.realizationState === 'realized-in-source-context'), '两条匹配 edge 都必须来自上游 realized state');
    assert(ding.actorGlobalEffectiveState === null && ding.genericVisibleEffectiveState === null, 'profile interpretation 不得升级为 global effective state');
});

test('DTS exact-source：丁的解释不能让同盘癸、己绕过未解 edge，coverage 继续 unresolved', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const records = synthesis.visibleStemActorProfileInterpretationRecords || [];
    const gui = records.find((item) => item.actorKey === 'visible:1:癸');
    const ji = records.find((item) => item.actorKey === 'visible:3:己');
    assert(gui?.resolutionStatus === 'blocked-upstream-profile-readiness', '癸仍有未解 day-master edge，必须阻断');
    assert(ji?.resolutionStatus === 'blocked-upstream-profile-readiness', '己仍有未解 day-master edge，必须阻断');
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-MODEL']?.status === 'resolved', 'interpretation model contract 可 resolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-COVERAGE']?.status === 'unresolved', '部分 actor 已解释不得让全局 coverage resolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION']?.status === 'unresolved', 'Composition Interpretation coarse gate 必须继续 unresolved');
});

test('固定验证盘：所有 actor profile 未 ready，不得产生任何 source-scoped interpretation', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const records = output.semanticModel.strengthSynthesis.visibleStemActorProfileInterpretationRecords || [];
    assert(records.length === 3, '固定盘应有三个 actor interpretation record');
    assert(records.every((item) => item.resolutionStatus === 'blocked-upstream-profile-readiness'), '固定盘全部应被 upstream readiness 阻断');
    assert(records.every((item) => item.interpretationState === null && item.sourcePatternId === null), '不得凭普通五行关系生成 profile semantics');
});

test('相似命局不命中 exact source：只改一柱即不得迁移丁 profile interpretation', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','未']);
    const ding = (output.semanticModel.strengthSynthesis.visibleStemActorProfileInterpretationRecords || []).find((item) => item.actorKey === 'visible:0:丁');
    assert(ding, '相似盘丁 record 缺失');
    assert(ding.resolutionStatus !== 'resolved-exact-source-profile-interpretation', '一柱不同不得继续命中 exact-source interpretation');
    assert(ding.interpretationState === null, '相似盘不得继承原命例组合语义');
});

test('即使 profile 形状相同，没有上游 sourcePatternId 也不得按角色/五行形状兜底匹配', () => {
    const profile = {
        id:'P1',
        actorKey:'visible:0:丁',
        actorGan:'丁',
        readinessStatus:'ready-for-actor-profile-interpretation',
        functionEntries:[
            {
                relationIdentity:'r1', edgeContextIdentity:'e1', participationRole:'target', functionType:'generation',
                realizationState:'realized-in-source-context', sourcePatternIds:[]
            },
            {
                relationIdentity:'r2', edgeContextIdentity:'e2', participationRole:'target', functionType:'restraint',
                realizationState:'realized-in-source-context', sourcePatternIds:[]
            }
        ]
    };
    const record = api.buildInterpretationRecord(profile, 0);
    assert(record.resolutionStatus === 'unresolved-no-profile-interpretation-rule', '没有 sourcePatternId 时只能 unresolved-no-rule');
    assert(record.interpretationState === null && record.sourcePatternId === null, '不得按 profile 形状发明命例解释');
});

test('只命中一条 required edge 仍不得解释完整 profile motif', () => {
    const profile = {
        id:'P1',
        actorKey:'visible:0:丁',
        actorGan:'丁',
        readinessStatus:'ready-for-actor-profile-interpretation',
        functionEntries:[
            {
                relationIdentity:'r1', edgeContextIdentity:'e1', participationRole:'target', functionType:'generation',
                realizationState:'realized-in-source-context', sourcePatternIds:['DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001']
            }
        ]
    };
    const record = api.buildInterpretationRecord(profile, 0);
    assert(record.resolutionStatus === 'unresolved-no-profile-interpretation-rule', '缺少癸→丁 restraint edge 时不得命中组合解释');
});

test('Source Basis 与匹配 provenance 保持原命例术语，不伪造 F/D/S sourceRefs', () => {
    assert(api.SOURCE_BASIS.length === 1, 'v0.1 应只有一条 profile source basis');
    const basis = api.SOURCE_BASIS[0];
    assert(basis.chart === '丁丑 癸卯 乙卯 己卯', 'source basis 命例异常');
    assert(basis.terms.includes('最喜丁火独发，泄其精英'), '缺少泄秀原词');
    assert(basis.terms.includes('惜癸水克丁，仍伤秀气'), '缺少克丁原词');

    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const claim = (synthesis.claims || []).find((item) => item.claimKey === 'visibleStem.visible:0:丁.actor-profile-interpretation');
    assert(claim?.status === 'resolved', '丁 profile interpretation claim 应 resolved');
    assert((claim.sourceRefs || []).length === 0 && (claim.sourceEffectIds || []).length === 0, 'source pattern 不得冒充 F/D/S 或 Intermediate Effect provenance');
    const ding = (synthesis.visibleStemActorProfileInterpretationRecords || []).find((item) => item.actorKey === 'visible:0:丁');
    assert(ding.matchedEdgeContexts.map((item) => item.sourcePatternId).includes('DTS-VISIBLE-REALIZATION-YI-GENERATES-DING-001'), '应回指乙→丁 source pattern');
    assert(ding.matchedEdgeContexts.map((item) => item.sourcePatternId).includes('DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001'), '应回指癸→丁 source pattern');
});

test('Actor Profile Interpretation 不解决 Visible Effectiveness、Strength Synthesis 或 Assessment', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION-COVERAGE'), 'Visible Effectiveness 应显式接入 profile interpretation coverage');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
    assert((output.semanticModel.assessmentLayer.records || []).length === 0, 'Assessment 仍不得产生 active record');
});

test('Interpretation 层不引入 score/weight/priority/global state，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const contract = synthesis.visibleStemActorProfileInterpretationContract;
    const serialized = JSON.stringify({ records:synthesis.visibleStemActorProfileInterpretationRecords, contract });
    ['score','weight','points','"strong"','"weak"','"balanced"','priorityOrder','priorityRule','"priority":'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert(contract.majorityVoting === false && contract.priorityAggregation === false && contract.orderOverwrite === false, '合同必须关闭多数/优先级/顺序覆盖');
    assert((synthesis.visibleStemActorProfileInterpretationRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), '不得生成 global visible state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemActorProfileInterpretation','actor-profile-interpretation','outlet-function-realized-under-restraint-in-source-context','SD-VISIBLE-STEM-ACTOR-PROFILE-INTERPRETATION'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Actor Function Composition 后加载 Actor Profile Interpretation', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-actor-function-composition.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-actor-profile-interpretation.js?v=13.44.0'), '生产加载链缺少 Actor Profile Interpretation');
});

console.log(`\nBaZi visible stem actor profile interpretation: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
