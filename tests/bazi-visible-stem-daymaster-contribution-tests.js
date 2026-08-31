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
    'js/bazi-visible-stem-daymaster-contribution.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemDaymasterContribution;

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

test('Daymaster Contribution v0.1 把贡献单位固定为日主相关 edge，而不是 actor-global effectiveness', () => {
    assert(api?.installed === true, 'Daymaster Contribution 模块未安装');
    assert(api.VISIBLE_STEM_DAYMASTER_CONTRIBUTION_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.daymasterRelatedEdgesOnly === true, '必须只消费 day-master-related edge');
    assert(api.CONTRACT.crossVisibleEdgesDoNotBecomeDirectStrengthContributions === true, 'cross-visible edge 不得直接重复成为强弱贡献');
    assert(api.CONTRACT.strengthMeaningPreservedFromDirectedFunction === true, '必须保留 Directed Function strengthMeaning');
    assert(api.CONTRACT.actorGlobalEffectivenessNotRequired === true, '不应再要求 actor-global effectiveness 作为必要中间态');
    assert(api.CONTRACT.visibleEffectivenessCompatibilityGateUsesContributionCoverage === true, '旧 Visible Effectiveness gate 应转由 contribution coverage 满足');
    assert(api.CONTRACT.numericAggregation === false && api.CONTRACT.majorityVoting === false && api.CONTRACT.priorityAggregation === false, '不得引入数值、多数或优先级聚合');
});

test('固定验证盘：support/restraint/drain 三条日主相关贡献全部因 realization 未解而保持 unresolved', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const records = synthesis.visibleStemDaymasterContributionRecords || [];
    assert(records.length === 3, `固定盘应有三个 daymaster contribution record：${records.length}`);
    assert(records.every((item) => item.resolutionStatus === 'unresolved-function-realization'), '固定盘三条 relation realization 都未解');
    assert(records.every((item) => item.contributionState === 'unresolved-daymaster-contribution'), '不得从 relation presence 直接生成 contribution');
    const meanings = new Set(records.map((item) => item.strengthMeaning));
    assert(meanings.has('support') && meanings.has('restraint') && meanings.has('drain'), '应保留 support/restraint/drain 三个正交 strengthMeaning');
    assert(records.every((item) => item.actorGlobalEffectiveState === null), '不得生成 actor-global state');
});

test('DTS exact-source：乙→丁的我生 function 转成真实 drain contribution，并保留“outlet 受制”限定', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const ding = (synthesis.visibleStemDaymasterContributionRecords || []).find((item) => item.visibleActorKey === 'visible:0:丁');
    assert(ding, '丁 daymaster contribution 缺失');
    assert(ding.relationFromDayMaster === '我生', `丁相对乙日主应为我生：${ding.relationFromDayMaster}`);
    assert(ding.flow === 'outbound-from-daymaster', '乙→丁应为 outbound-from-daymaster');
    assert(ding.strengthMeaning === 'drain', '我生应保持 drain strengthMeaning');
    assert(ding.functionRealizationState === 'realized-in-source-context', '乙→丁 direct-source edge 应已兑现');
    assert(ding.profileInterpretationState === 'outlet-function-realized-under-restraint-in-source-context', '应带入丁 profile 的受制限定');
    assert(ding.resolutionStatus === 'resolved-realized-daymaster-contribution', `丁 contribution 应 resolved：${ding.resolutionStatus}`);
    assert(ding.contributionState === 'realized-daymaster-contribution-in-source-context', '丁应形成 source-scoped realized contribution');
    assert(ding.contributionInterpretation === 'realized-drain-through-restrained-outlet-in-source-context', '不能把受制 outlet 简化成裸 drain');
    assert(ding.actorGlobalEffectiveState === null && ding.genericVisibleEffectiveState === null, '仍不得把丁改写为 effective');
});

test('DTS exact-source：cross-visible 癸→丁虽已兑现，但不额外制造一条日主 restraint contribution', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const contributions = synthesis.visibleStemDaymasterContributionRecords || [];
    const realizations = synthesis.visibleStemFunctionRealizationRecords || [];
    assert(realizations.some((item) => item.relationScope === 'cross-visible-actor' && item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁' && item.realizationState === 'realized-in-source-context'), '前提：癸→丁 cross-visible restraint 应存在并已兑现');
    assert(contributions.length === 3, `三个非日主明干应各保留一条日主 relation contribution，而不是把 cross edge 另计：${contributions.length}`);
    assert(!contributions.some((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁'), 'cross-visible 癸→丁不得直接进入 daymaster contribution inventory');
});

test('DTS exact-source：癸与己的日主 contribution 仍未解，单条丁已解析不能让 coverage 变 resolved', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const records = synthesis.visibleStemDaymasterContributionRecords || [];
    const gui = records.find((item) => item.visibleActorKey === 'visible:1:癸');
    const ji = records.find((item) => item.visibleActorKey === 'visible:3:己');
    assert(gui?.resolutionStatus === 'unresolved-function-realization', '癸→乙 support realization 仍应未解');
    assert(ji?.resolutionStatus === 'unresolved-function-realization', '乙→己 distribution realization 仍应未解');
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-MODEL']?.status === 'resolved', 'Contribution model contract 可 resolved');
    assert(deps['SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE']?.status === 'unresolved', '部分 contribution resolved 不得让 coverage resolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', '兼容 gate 必须跟随 contribution coverage 保持 unresolved');
});

test('synthetic：正向 realized edge 若 actor profile context 未解析，只能停在 realized-edge/profile-unresolved', () => {
    const realizationRecord = {
        id:'R1',
        relationScope:'daymaster-related',
        upstreamDirectedFunctionRecordId:'D1',
        relationFromDayMaster:'生我',
        flow:'inbound-to-daymaster',
        functionType:'generation',
        strengthMeaning:'support',
        directed:true,
        sourceActorKey:'visible:0:甲',
        targetActorKey:'daymaster:2:丙',
        participantActorKeys:['visible:0:甲','daymaster:2:丙'],
        peerParticipantActorKeys:[],
        sourcePatternId:'P1',
        realizationState:'realized-in-source-context',
        resolutionStatus:'resolved-source-function-realized'
    };
    const synthesis = {
        visibleStemActorProfileInterpretationRecords:[{
            id:'PI1', actorKey:'visible:0:甲', interpretationState:null,
            resolutionStatus:'unresolved-no-profile-interpretation-rule'
        }]
    };
    const record = api.buildContributionRecord(realizationRecord, synthesis, 0);
    assert(record.functionRealizationState === 'realized-in-source-context', '上游 realized 事实必须保留');
    assert(record.resolutionStatus === 'unresolved-realized-edge-profile-context', 'profile context 未解时 contribution 不得完整 resolved');
    assert(record.contributionState === 'unresolved-daymaster-contribution', '不得忽略 profile context 直接生成 realized contribution');
});

test('synthetic：明确 not-realized 的日主 edge 只解析这条 contribution 未形成，不需要生成 actor ineffective', () => {
    const realizationRecord = {
        id:'R1',
        relationScope:'daymaster-related',
        relationFromDayMaster:'克我',
        flow:'inbound-to-daymaster',
        functionType:'restraint',
        strengthMeaning:'restraint',
        directed:true,
        sourceActorKey:'visible:0:庚',
        targetActorKey:'daymaster:2:甲',
        participantActorKeys:['visible:0:庚','daymaster:2:甲'],
        peerParticipantActorKeys:[],
        sourcePatternId:'P1',
        realizationState:'not-realized-in-source-context',
        resolutionStatus:'resolved-source-function-not-realized'
    };
    const record = api.buildContributionRecord(realizationRecord, {}, 0);
    assert(record.resolutionStatus === 'resolved-not-realized-daymaster-contribution', 'specific contribution absence 可 resolved');
    assert(record.contributionState === 'not-realized-daymaster-contribution-in-source-context', '应只记录 restraint contribution 未形成');
    assert(record.actorGlobalEffectiveState === null, '不得把庚写成 ineffective');
});

test('compatibility：SD-VISIBLE-EFFECTIVENESS 保留旧 ID，但语义改为 contribution coverage，不再要求 actor-global 二值化', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const dep = dependencyMap(synthesis)['SD-VISIBLE-EFFECTIVENESS'];
    assert(dep, '兼容 Visible Effectiveness dependency 缺失');
    assert(dep.scope === 'visible-stem-daymaster-contribution-coverage', `scope 应改为 contribution coverage：${dep.scope}`);
    assert(dep.actorGlobalEffectivenessRequired === false, '兼容 gate 不应再要求 actor-global effectiveness');
    assert(dep.compatibilityMeaning === 'visible-stem-daymaster-contribution-coverage', '应显式记录兼容语义');
    assert(dep.dependsOnDependencyIds.includes('SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION-COVERAGE'), '兼容 gate 必须依赖新 coverage');
});

test('Daymaster Contribution 仍不使 Strength Synthesis 或 Assessment 越级启动', () => {
    const { output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 仍应 not-evaluated');
    assert((output.semanticModel.assessmentLayer.records || []).length === 0, '不得产生 active Assessment record');
});

test('Daymaster Contribution 不引入 score/weight/priority/global state，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const contract = synthesis.visibleStemDaymasterContributionContract;
    const serialized = JSON.stringify({ records:synthesis.visibleStemDaymasterContributionRecords, contract });
    ['score','weight','points','"strong"','"weak"','"balanced"','priorityOrder','priorityRule','"priority":'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert(contract.majorityVoting === false && contract.priorityAggregation === false && contract.orderOverwrite === false, '合同必须关闭多数/优先级/顺序覆盖');
    assert((synthesis.visibleStemDaymasterContributionRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), '不得生成 global visible state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemDaymasterContribution','daymaster-contribution','realized-drain-through-restrained-outlet-in-source-context','SD-VISIBLE-STEM-DAYMASTER-CONTRIBUTION'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Actor Profile Interpretation 后加载 Daymaster Contribution', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-actor-profile-interpretation.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-daymaster-contribution.js?v=13.44.0'), '生产加载链缺少 Daymaster Contribution');
});

console.log(`\nBaZi visible stem daymaster contribution: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
