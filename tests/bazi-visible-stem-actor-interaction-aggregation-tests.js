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
    'js/bazi-visible-stem-actor-interaction-aggregation.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemActorInteractionAggregation;

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

test('Actor Interaction Aggregation v0.1 冻结 edge-preserving actor view', () => {
    assert(api?.installed === true, 'Actor Interaction Aggregation 模块未安装');
    assert(api.VISIBLE_STEM_ACTOR_INTERACTION_AGGREGATION_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.actorCentric === true, '必须 actor-centric');
    assert(api.CONTRACT.edgeIdentityBeforeAggregation === true, '必须先保存 edge identity');
    assert(api.CONTRACT.relationIdentitySeparateFromSourceContextIdentity === true, 'relation 与 source context identity 必须分层');
    assert(api.CONTRACT.preservesSourceTargetPeerParticipation === true, 'source/target/peer 必须保留');
    assert(api.CONTRACT.unresolvedEdgeIsNotFailure === true, 'unresolved edge 不得解释成失败');
    assert(api.CONTRACT.actorGlobalEffectiveState === false, '不得生成 actor global state');
    assert(api.CONTRACT.majorityVoting === false && api.CONTRACT.priorityAggregation === false && api.CONTRACT.orderOverwrite === false, '不得启用多数/优先级/顺序覆盖');
});

test('固定验证盘：三个明干各自保留真实 day-master participation，全部因 realization 未解而阻断 aggregation', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const records = output.semanticModel.strengthSynthesis.visibleStemActorInteractionAggregationRecords || [];
    assert(records.length === 3, `应有三个 visible actor aggregation record：${records.length}`);
    assert(records.every((item) => item.coverageStatus === 'unresolved'), '三个 day-master relation 均未解析，应保持 unresolved coverage');
    assert(records.every((item) => item.aggregationStatus === 'blocked-incomplete-realization-coverage'), 'coverage 未完成必须阻断 composition');
    assert(records.every((item) => item.actorGlobalEffectiveState === null), '不得生成 actor global state');

    const peer = records.find((item) => item.actorKey === 'visible:0:丁');
    assert(peer?.interactionInputs?.length === 1, '年干丁应有一个 peer edge');
    assert(peer.interactionInputs[0].participationRole === 'peer', '同我必须保持 peer participation');
    assert(peer.interactionInputs[0].sourceActorKey === null && peer.interactionInputs[0].targetActorKey === null, 'peer 不得伪造 source/target');

    const officer = records.find((item) => item.actorKey === 'visible:1:壬');
    assert(officer?.interactionInputs?.[0]?.participationRole === 'source', '克我明干应保持 source participation');
    const outputStem = records.find((item) => item.actorKey === 'visible:3:己');
    assert(outputStem?.interactionInputs?.[0]?.participationRole === 'target', '我生明干应保持 target participation');
});

test('DTS exact source：同一辛 actor 同时保留 cross-source、cross-target resolved failures 与 day-master unresolved', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const xin = (synthesis.visibleStemActorInteractionAggregationRecords || []).find((item) => item.actorKey === 'visible:3:辛');
    assert(xin, '辛 actor aggregation record 缺失');
    assert(xin.interactionInputs.length === 3, `辛应保留三个独立 edge context：${xin.interactionInputs.length}`);

    const crossSource = xin.interactionInputs.find((item) =>
        item.relationScope === 'cross-visible-actor'
        && item.participationRole === 'source'
        && item.counterpartyActorKeys.includes('visible:0:癸')
    );
    const crossTarget = xin.interactionInputs.find((item) =>
        item.relationScope === 'cross-visible-actor'
        && item.participationRole === 'target'
        && item.counterpartyActorKeys.includes('visible:1:己')
    );
    const dayMaster = xin.interactionInputs.find((item) => item.relationScope === 'daymaster-related');

    assert(crossSource, '辛→癸 cross-source edge 缺失');
    assert(crossSource.realizationState === 'not-realized-in-source-context', '辛→癸应保留 source-specific 未兑现');
    assert(crossSource.resolutionCoverageStatus === 'resolved', '辛→癸应是已解析 edge');
    assert(crossTarget, '己→辛 cross-target edge 缺失');
    assert(crossTarget.realizationState === 'not-realized-in-source-context', '己→辛应保留 source-specific 未兑现');
    assert(crossTarget.resolutionCoverageStatus === 'resolved', '己→辛应是已解析 edge');
    assert(dayMaster?.participationRole === 'target', '丙克辛中辛应为 target participation');
    assert(dayMaster.realizationState === 'unresolved', '辛与日主 edge 必须继续 unresolved');
    assert(xin.coverageStatus === 'partial', '两个 resolved + 一个 unresolved 应形成 partial coverage，而不是覆盖');
    assert(xin.actorGlobalEffectiveState === null, 'cross-edge failures 不得升级成辛 ineffective');
});

test('cross-visible target 同样进入自己的 actor view，不因另一个 actor 为 source 而丢失', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const records = output.semanticModel.strengthSynthesis.visibleStemActorInteractionAggregationRecords || [];
    const gui = records.find((item) => item.actorKey === 'visible:0:癸');
    assert(gui, '癸 actor aggregation record 缺失');
    const cross = gui.interactionInputs.find((item) => item.relationScope === 'cross-visible-actor' && item.functionType === 'generation');
    assert(cross, '癸应保存辛→癸 cross edge');
    assert(cross.participationRole === 'target', '癸在辛→癸中必须是 target');
    assert(cross.counterpartyActorKeys.includes('visible:3:辛'), 'counterparty 应为辛');
});

test('bearing context 与 function result 分层保存，不作为独立 interaction edge', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const ding = (synthesis.visibleStemActorInteractionAggregationRecords || []).find((item) => item.actorKey === 'visible:1:丁');
    assert(ding, '丁 actor aggregation record 缺失');
    assert(ding.bearingContexts.some((item) => item.functionalAvailabilityState === 'bearing-supported'), '丁应保留 bearing-supported context');
    assert(ding.interactionInputs.length === 1, 'bearing context 不得额外制造 function edge');
    assert(ding.interactionInputs[0].realizationState === 'unresolved', 'bearing-supported 不得解决 day-master function');
    assert(ding.actorGlobalEffectiveState === null, 'bearing-supported 不得生成 actor effective');
});

test('relation identity 与 source-context identity 分离：同关系不同 source context 不得合并', () => {
    const base = {
        relationScope:'cross-visible-actor',
        directed:true,
        sourceActorKey:'visible:0:甲',
        targetActorKey:'visible:1:丙',
        functionType:'generation',
        realizationState:'not-realized-in-source-context',
        resolutionStatus:'resolved-source-function-not-realized',
        contextConditionRecordIds:[]
    };
    const first = api.buildRawActorInput({ ...base, id:'R1', sourcePatternId:'P1' }, 'visible:0:甲');
    const second = api.buildRawActorInput({ ...base, id:'R2', sourcePatternId:'P2' }, 'visible:0:甲');
    const merged = api.mergeSameEdgeContextInputs([first, second]);
    assert(merged.length === 2, '不同 source context 不得被 relation identity 合并');
    assert(merged[0].relationIdentity === merged[1].relationIdentity, '两条应共享同一 relation identity');
    assert(merged[0].edgeContextIdentity !== merged[1].edgeContextIdentity, 'source context identity 必须不同');
});

test('同一 edge context 若出现互异 realization，不做 last-write-wins 而显式阻断', () => {
    const base = {
        relationScope:'cross-visible-actor',
        directed:true,
        sourceActorKey:'visible:0:甲',
        targetActorKey:'visible:1:丙',
        functionType:'generation',
        sourcePatternId:'P1',
        contextConditionRecordIds:[]
    };
    const first = api.buildRawActorInput({ ...base, id:'R1', realizationState:'unresolved', resolutionStatus:'unresolved-source-function-realization' }, 'visible:0:甲');
    const second = api.buildRawActorInput({ ...base, id:'R2', realizationState:'not-realized-in-source-context', resolutionStatus:'resolved-source-function-not-realized' }, 'visible:0:甲');
    const merged = api.mergeSameEdgeContextInputs([first, second]);
    assert(merged.length === 1, '同一 edge context 可无损归为一个 input');
    assert(merged[0].consistencyStatus === 'inconsistent-realization-state', '互异 realization 必须显式标记 inconsistent');
    assert(merged[0].resolutionCoverageStatus === 'inconsistent', '不得选择最后一个结果覆盖前值');
    assert(merged[0].realizationState === null, '冲突状态不得伪装成单一 realization');
});

test('Actor Aggregation Model 可 resolved，但 Coverage/Composition 继续阻断 Visible Effectiveness 与 Assessment', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-ACTOR-INTERACTION-MODEL']?.status === 'resolved', 'aggregation input contract 应 resolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-INTERACTION-COVERAGE']?.status === 'unresolved', 'day-master realization 未解时 actor coverage 应 unresolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION']?.status === 'unresolved', 'actor function composition 必须 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION'), 'Visible Effectiveness 应显式依赖 actor aggregation');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Actor Aggregation 不引入 score/weight/priority/global state，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemActorInteractionAggregationRecords,
        contract:synthesis.visibleStemActorInteractionAggregationContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','priorityOrder','priorityRule','"priority":'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemActorInteractionAggregationRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), '不得生成 global visible state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemActorInteractionAggregation','edgeContextIdentity','SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Function Realization 后加载 Actor Interaction Aggregation', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-function-realization.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-actor-interaction-aggregation.js?v=13.44.0'), '生产加载链缺少 Actor Interaction Aggregation');
});

console.log(`\nBaZi visible stem actor interaction aggregation: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
require('./bazi-visible-stem-actor-function-composition-tests.js');