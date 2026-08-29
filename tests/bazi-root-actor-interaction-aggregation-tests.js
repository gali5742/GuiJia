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
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const aggregationApi = GuiJia.baziRootActorInteractionAggregation;

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

function syntheticSemanticModel(structures) {
    return { structures };
}

function syntheticRootState(overrides = {}) {
    return {
        id:'RS-TEST',
        actorKey:'branch:1:hidden:戊',
        rootRole:'exact-root',
        pillarIndex:1,
        position:'month',
        zhi:'巳',
        gan:'戊',
        presence:'present',
        relatedStructureRefs:[],
        sourceEffectIds:['FX-ROOT-EXACT'],
        ...overrides
    };
}

function syntheticInteraction(overrides = {}) {
    return {
        id:'RCIE-TEST',
        rootStateId:'RS-TEST',
        actorKey:'branch:1:hidden:戊',
        structureRef:'S-CLASH',
        resolutionStatus:'resolved-interaction-semantics',
        standingState:null,
        removalState:null,
        harmState:'unharmed',
        activationState:'stimulated-by-clash',
        ...overrides
    };
}

test('生产加载链包含 Root Actor Interaction Aggregation 独立模块', () => {
    const interactionSource = fs.readFileSync(path.join(ROOT, 'js/bazi-root-clash-interaction-effect.js'), 'utf8');
    assert(interactionSource.includes('./js/bazi-root-actor-interaction-aggregation.js?v=13.44.0'), 'Interaction Effect 未接入 actor aggregation 浏览器加载链');
    assert(aggregationApi?.installed === true, 'Root Actor Interaction Aggregation 模块未安装');
    assert(aggregationApi.ROOT_ACTOR_INTERACTION_AGGREGATION_VERSION === '0.1', `Aggregation 版本异常：${aggregationApi.ROOT_ACTOR_INTERACTION_AGGREGATION_VERSION}`);
});

test('固定验证盘没有 root actor 时，Coverage / Aggregation / Baseline 均为 not-applicable resolved', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert((model.strengthSynthesis.rootActorInteractionAggregationRecords || []).length === 0, '固定验证盘无根 actor 不应制造 aggregation record');
    assert(deps['SD-ROOT-ACTOR-INTERACTION-COVERAGE']?.status === 'resolved', '无 root actor 时 coverage 应 resolved/not-applicable');
    assert(deps['SD-ROOT-ACTOR-INTERACTION-AGGREGATION']?.status === 'resolved', '无 root actor 时 aggregation 应 resolved/not-applicable');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'resolved', '无 root actor 时 baseline 应 resolved/not-applicable');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Assessment 仍不得启动');
});

test('root actor 没有关联 Structure 时只标记 aggregation not-applicable，不能自动判 effective', () => {
    const records = aggregationApi.buildActorAggregationRecords(
        syntheticSemanticModel([]),
        { rootActorStates:[syntheticRootState()] }
    );
    const record = records[0];
    assert(record.coverageStatus === 'no-related-structures', `无关系时 coverage 异常：${record.coverageStatus}`);
    assert(record.aggregationStatus === 'not-applicable-no-interactions', `无关系时 aggregation 异常：${record.aggregationStatus}`);
    assert(record.baselineEffectivenessStatus === 'unresolved', '无关系时 baseline effectiveness 必须 unresolved');
    assert(record.actorEffectiveState === null, '无关系不得自动写 actor effective');
});

test('单一已解析六冲可形成 complete interaction coverage，但仍缺 actor-state mapping rule', () => {
    const semanticModel = syntheticSemanticModel([{ id:'S-CLASH', code:'BRANCH_SIX_CLASH' }]);
    const records = aggregationApi.buildActorAggregationRecords(semanticModel, {
        rootActorStates:[syntheticRootState({ relatedStructureRefs:['S-CLASH'] })],
        rootClashInteractionEffectRecords:[syntheticInteraction()]
    });
    const record = records[0];
    assert(record.coverageStatus === 'complete', `单一已解析 clash 应 complete：${record.coverageStatus}`);
    assert(record.aggregationStatus === 'unresolved-actor-state-rule', `单一 interaction 后应等待 actor-state rule：${record.aggregationStatus}`);
    assert(record.resolvedInteractionRecordIds.includes('RCIE-TEST'), '应保留 resolved interaction provenance');
    assert(record.actorEffectiveState === null, '完整单一 interaction 输入也不得直接写 actor state');
});

test('同一 root actor 同时有已解析六冲和未解析六合时，Coverage 必须 partial 并保留六合 blocker', () => {
    const semanticModel = syntheticSemanticModel([
        { id:'S-CLASH', code:'BRANCH_SIX_CLASH' },
        { id:'S-HARMONY', code:'BRANCH_SIX_HARMONY' }
    ]);
    const records = aggregationApi.buildActorAggregationRecords(semanticModel, {
        rootActorStates:[syntheticRootState({ relatedStructureRefs:['S-CLASH','S-HARMONY'] })],
        rootClashInteractionEffectRecords:[syntheticInteraction()]
    });
    const record = records[0];
    assert(record.coverageStatus === 'partial', `有一条未覆盖 Structure 时应 partial：${record.coverageStatus}`);
    assert(record.aggregationStatus === 'blocked-incomplete-coverage', `Coverage 不完整时应阻断 aggregation：${record.aggregationStatus}`);
    assert(record.unresolvedStructureRefs.includes('S-HARMONY'), '未解析六合必须作为 blocker 保留');
    const harmony = record.interactionInputs.find((item) => item.structureRef === 'S-HARMONY');
    assert(harmony?.coverageStatus === 'unresolved-no-interaction-resolver', '六合不得借六冲 resolver 代解');
});

test('同一 root actor 有多个已解析 interaction 时只进入 multi-interaction arbitration blocker，不做多数或顺序覆盖', () => {
    const semanticModel = syntheticSemanticModel([
        { id:'S-CLASH-A', code:'BRANCH_SIX_CLASH' },
        { id:'S-CLASH-B', code:'BRANCH_SIX_CLASH' }
    ]);
    const records = aggregationApi.buildActorAggregationRecords(semanticModel, {
        rootActorStates:[syntheticRootState({ relatedStructureRefs:['S-CLASH-A','S-CLASH-B'] })],
        rootClashInteractionEffectRecords:[
            syntheticInteraction({ id:'RCIE-A', structureRef:'S-CLASH-A', standingState:'cannot-stand', removalState:'removable-by-clash', harmState:null, activationState:null }),
            syntheticInteraction({ id:'RCIE-B', structureRef:'S-CLASH-B', harmState:'unharmed', activationState:'stimulated-by-clash' })
        ]
    });
    const record = records[0];
    assert(record.coverageStatus === 'complete', '两个 interaction 都 resolved 时 coverage 应 complete');
    assert(record.aggregationStatus === 'unresolved-multi-interaction-arbitration', `多个 interaction 应等待仲裁：${record.aggregationStatus}`);
    assert(record.actorEffectiveState === null, '相反方向 interaction 并存也不得直接生成 actor state');
    const serialized = JSON.stringify(record);
    ['majority','score','weight','points','priorityWinner'].forEach((term) => assert(!serialized.includes(`\"${term}\"`), `不得引入自动仲裁字段 ${term}`));
});

test('真实 SP-05：已解析巳亥 interaction 进入对应 root actor 输入，但 actor global state 仍保持 null', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const records = model.strengthSynthesis.rootActorInteractionAggregationRecords || [];
    const withResolvedClash = records.find((record) => record.interactionInputs.some((item) =>
        item.coverageStatus === 'resolved-interaction'
        && item.harmState === 'unharmed'
        && item.activationState === 'stimulated-by-clash'
    ));
    assert(withResolvedClash, 'SP-05 已解析巳亥 interaction 应进入 actor aggregation 输入');
    assert(withResolvedClash.actorEffectiveState === null, 'SP-05 不得由单一巳亥 interaction 回写 actor global state');
    assert((model.strengthSynthesis.rootActorStates || []).every((item) => item.effectiveState === null), '原 rootActorStates 也必须保持 null');
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-ROOT-EFFECTIVENESS']?.status === 'unresolved', '存在 root actor 时 Root Effectiveness 仍应 unresolved');
    assert(deps['SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS']?.status === 'unresolved', 'Baseline Effectiveness 仍需独立规则');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '不得启动最终 Strength Assessment');
});

test('Root Effectiveness 显式依赖 Coverage / Aggregation / Baseline 三层', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    const root = deps['SD-ROOT-EFFECTIVENESS'];
    ['SD-ROOT-ACTOR-INTERACTION-COVERAGE','SD-ROOT-ACTOR-INTERACTION-AGGREGATION','SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'].forEach((id) => {
        assert(root?.dependsOnDependencyIds?.includes(id), `Root Effectiveness 未显式依赖 ${id}`);
    });
    const clashMapping = deps['SD-ROOT-SIX-CLASH-SOURCE-OUTCOME-MAPPING'];
    assert(clashMapping?.dependsOnDependencyIds?.includes('SD-ROOT-ACTOR-INTERACTION-AGGREGATION'), '六冲 actor mapping 应转交 actor aggregation');
    assert(clashMapping?.dependsOnDependencyIds?.includes('SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS'), '六冲 actor mapping 还必须等待 baseline effectiveness');
});

test('Actor coverage claims 只回指真实 Structure，不伪造 source profile ref', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const structureIds = new Set(model.structures.map((item) => item.id));
    const claims = model.strengthSynthesis.claims.filter((item) => item.ruleId === aggregationApi.ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID);
    assert(claims.length > 1, '应至少存在 contract claim 与 actor coverage claims');
    claims.filter((item) => item.id.startsWith('SC-ROOT-ACTOR-INTERACTION-COVERAGE-')).forEach((claim) => {
        assert(claim.sourceRefs.every((id) => structureIds.has(id)), `actor coverage claim 出现非真实 Structure ref：${claim.sourceRefs.join(',')}`);
        assert(claim.value.actorEffectiveState === null, 'coverage claim 不得附 actor effectiveState');
    });
});

test('Aggregation contract 不引入分数、权重、关系数量裁决或最终强弱', () => {
    const model = outputFor(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00').semanticModel;
    const serialized = JSON.stringify({
        contract:model.strengthSynthesis.rootActorInteractionAggregationContract,
        records:model.strengthSynthesis.rootActorInteractionAggregationRecords,
        claims:model.strengthSynthesis.claims.filter((item) => item.ruleId === aggregationApi.ROOT_ACTOR_INTERACTION_AGGREGATION_RULE_ID)
    });
    ['score','weight','points','supportSide','restraintSide','strong','weak','balanced'].forEach((term) => {
        assert(!serialized.includes(`\"${term}\"`), `Aggregation 不得引入 ${term}`);
    });
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', '最终 Assessment 必须保持 not-evaluated');
});

test('复制分析上下文不泄漏 Root Actor Interaction Aggregation 内部字段', () => {
    const result = makeResult(['乙','辛','戊','甲'], ['亥','巳','申','寅'], '2026-05-14 12:00:00');
    const output = interpretation.buildBaziInterpretation(result);
    const copied = interpretation.buildBaziContextText(result, output);
    [
        'rootActorInteractionAggregationRecords',
        'rootActorInteractionAggregationContract',
        'SD-ROOT-ACTOR-INTERACTION-COVERAGE',
        'SD-ROOT-ACTOR-INTERACTION-AGGREGATION',
        'SD-ROOT-ACTOR-BASELINE-EFFECTIVENESS',
        'SC-ROOT-ACTOR-INTERACTION-AGGREGATION-CONTRACT',
        'no-related-structures',
        'blocked-incomplete-coverage',
        'unresolved-multi-interaction-arbitration',
        'baselineEffectivenessStatus'
    ].forEach((term) => assert(!copied.includes(term), `复制上下文泄漏 Actor Aggregation 内部字段：${term}`));
});

console.log(`\nBaZi root actor interaction aggregation: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
