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
    'js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const api = GuiJia.baziVisibleStemActorFunctionComposition;

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

test('Actor Function Composition v0.1 冻结正交 profile contract，不发明正向 realized state', () => {
    assert(api?.installed === true, 'Actor Function Composition 模块未安装');
    assert(api.VISIBLE_STEM_ACTOR_FUNCTION_COMPOSITION_VERSION === '0.1', '版本异常');
    assert(api.CONTRACT.actorProfileCentric === true, '必须 actor-profile-centric');
    assert(api.CONTRACT.orthogonalParticipationAndRealizationAxes === true, 'participation / realization 必须分轴');
    assert(api.CONTRACT.bucketViewsAreIndexesNotAdditionalEvidence === true, 'bucket 只能是索引视图');
    assert(api.CONTRACT.resolvedMeansConclusionAvailableNotFunctionRealized === true, 'resolved 不得等同 realized');
    assert(api.CONTRACT.positiveRealizationStateInvented === false, '不得发明正向 realization state');
    assert(api.CONTRACT.supportedResolvedRealizationStates.length === 1 && api.CONTRACT.supportedResolvedRealizationStates[0] === 'not-realized-in-source-context', 'v0.1 只能接受当前上游已存在的 resolved realization state');
    assert(api.CONTRACT.actorGlobalEffectiveState === false && api.CONTRACT.scalarCollapse === false, '不得压成 actor global state');
});

test('固定验证盘：三个明干都建立 profile，但 unresolved day-master edges 只形成 incomplete readiness', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const records = output.semanticModel.strengthSynthesis.visibleStemActorFunctionProfileRecords || [];
    assert(records.length === 3, `应有三个 actor function profile：${records.length}`);
    assert(records.every((item) => item.functionEntries.length === 1), '固定盘每个明干当前应各有一个 day-master-related edge');
    assert(records.every((item) => item.unresolvedFunctionEntries.length === 1), '三个 profile 都应保留 unresolved edge');
    assert(records.every((item) => item.readinessStatus === 'incomplete-realization-coverage'), 'realization coverage 未完成时 readiness 必须 incomplete');
    assert(records.every((item) => item.interpretationStatus === 'unresolved-actor-profile-interpretation'), 'profile interpretation 不得提前解析');
    assert(records.every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), '不得生成 global state');

    const peer = records.find((item) => item.actorKey === 'visible:0:丁');
    assert(peer?.peerFunctionEntries.length === 1, '年干丁应进入 peer view');
    assert(peer.sourceFunctionEntries.length === 0 && peer.targetFunctionEntries.length === 0, 'peer 不得伪装 source/target');
});

test('DTS exact source：辛 profile 同时保留 source + target，多条 resolved not-realized 与 day-master unresolved', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const xin = (output.semanticModel.strengthSynthesis.visibleStemActorFunctionProfileRecords || []).find((item) => item.actorKey === 'visible:3:辛');
    assert(xin, '辛 actor profile 缺失');
    assert(xin.functionEntries.length === 3, `辛应保留三个 edge：${xin.functionEntries.length}`);
    assert(xin.sourceFunctionEntries.length === 1, '辛应有一条 source edge（辛→癸）');
    assert(xin.targetFunctionEntries.length === 2, '辛应有两条 target edge（己→辛、丙→辛）');
    assert(xin.peerFunctionEntries.length === 0, '辛不应有 peer edge');
    assert(xin.resolvedFunctionEntries.length === 2, '两个 cross-visible exact-source edge 已有结论');
    assert(xin.notRealizedFunctionEntries.length === 2, '两个 resolved edge 都只能是 source-specific not-realized');
    assert(xin.unresolvedFunctionEntries.length === 1, '丙→辛 day-master edge 必须继续 unresolved');
    assert(xin.readinessStatus === 'incomplete-realization-coverage', 'resolved + unresolved 并存不得伪装 ready');
    assert(xin.participationKinds.includes('source') && xin.participationKinds.includes('target'), '同一 actor 必须允许 source/target 并存');
    assert(xin.actorGlobalEffectiveState === null, '两个 not-realized edge 也不得升级为辛 ineffective');
});

test('resolved bucket 只表示已有结论，不等于 function realized', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const xin = (output.semanticModel.strengthSynthesis.visibleStemActorFunctionProfileRecords || []).find((item) => item.actorKey === 'visible:3:辛');
    assert(xin.resolvedFunctionEntries.length === 2, '应有两个 resolved edge');
    assert(xin.resolvedFunctionEntries.every((item) => item.realizationState === 'not-realized-in-source-context'), '当前 resolved edge 全部只是未兑现结论');
    assert(!Object.prototype.hasOwnProperty.call(xin, 'realizedFunctionEntries'), 'v0.1 不应凭空建立正向 realized bucket');
});

test('bearing contexts 单独挂载，不进入 function bucket，也不解决 readiness', () => {
    const { output } = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']);
    const ding = (output.semanticModel.strengthSynthesis.visibleStemActorFunctionProfileRecords || []).find((item) => item.actorKey === 'visible:1:丁');
    assert(ding, '丁 actor profile 缺失');
    assert(ding.bearingContexts.some((item) => item.functionalAvailabilityState === 'bearing-supported'), '应保留 bearing-supported context');
    assert(ding.functionEntries.length === 1, 'bearing context 不得制造额外 function entry');
    assert(ding.unresolvedFunctionEntries.length === 1, 'bearing-supported 不得把 day-master function 变成 resolved');
    assert(ding.readinessStatus === 'incomplete-realization-coverage', 'bearing-supported 不得让 readiness 放行');
});

test('未来未知 resolved realization state 必须阻断，而不是默认解释为已兑现', () => {
    const profile = api.buildActorFunctionProfileRecord({
        id:'A1',
        actorKey:'visible:0:甲',
        actorGan:'甲',
        bearingContexts:[],
        interactionInputs:[{
            relationIdentity:'r1',
            edgeContextIdentity:'e1',
            participationRole:'source',
            counterpartyActorKeys:['visible:1:丙'],
            relationScope:'cross-visible-actor',
            directed:true,
            functionType:'generation',
            sourceActorKey:'visible:0:甲',
            targetActorKey:'visible:1:丙',
            peerParticipantActorKeys:[],
            realizationRecordIds:['R1'],
            realizationStates:['realized-in-source-context'],
            resolutionStatuses:['resolved-source-function-realized'],
            realizationState:'realized-in-source-context',
            resolutionCoverageStatus:'resolved',
            consistencyStatus:'consistent',
            sourcePatternIds:['P1'],
            reachabilityRecordIds:[],
            upstreamDirectedFunctionRecordIds:[],
            contextConditionRecordIds:[]
        }]
    }, 0);
    assert(profile.unsupportedResolvedStateEntries.length === 1, '未知 resolved state 必须进入 unsupported bucket');
    assert(profile.readinessStatus === 'blocked-unsupported-resolved-realization-state', '未知状态必须阻断 readiness');
    assert(profile.interpretationStatus === 'blocked-profile-input', '未知状态不得进入 interpretation');
    assert(profile.actorGlobalEffectiveState === null, '不得默认解释为 effective');
});

test('profile buckets 只是同一 edge evidence 的正交索引，不复制 relation identity', () => {
    const { output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const xin = (output.semanticModel.strengthSynthesis.visibleStemActorFunctionProfileRecords || []).find((item) => item.actorKey === 'visible:3:辛');
    const entryIds = xin.functionEntries.map((item) => item.edgeContextIdentity);
    assert(new Set(entryIds).size === xin.functionEntries.length, 'profile 主 entries 不得重复 edge context');
    assert(xin.sourceFunctionEntries[0].edgeContextIdentity === xin.functionEntries.find((item) => item.participationRole === 'source').edgeContextIdentity, 'role bucket 必须引用同一 edge identity');
    assert(xin.notRealizedFunctionEntries.every((item) => entryIds.includes(item.edgeContextIdentity)), 'state bucket 不得制造新 edge identity');
});

test('Composition Model/Profile Inventory 可 resolved，但 Readiness/Interpretation/Visible Effectiveness 继续阻断 Assessment', () => {
    const { output } = outputFor(['丁','壬','丁','己'], ['丑','子','亥','酉']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-MODEL']?.status === 'resolved', 'composition model contract 应 resolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-FUNCTION-PROFILE-INVENTORY']?.status === 'resolved', 'profile inventory 应可在 unresolved edge 存在时成立');
    assert(deps['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-READINESS']?.status === 'unresolved', 'realization 不完整时 readiness 必须 unresolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION']?.status === 'unresolved', 'actor profile interpretation 必须 unresolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION']?.status === 'unresolved', '旧 aggregation coarse gate 必须继续 unresolved');
    assert(deps['SD-VISIBLE-STEM-ACTOR-INTERACTION-AGGREGATION']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION'), '旧 aggregation gate 应显式接入新 interpretation blocker');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.status === 'unresolved', 'Visible Effectiveness 必须继续 unresolved');
    assert(deps['SD-VISIBLE-EFFECTIVENESS']?.dependsOnDependencyIds?.includes('SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION-INTERPRETATION'), 'Visible Effectiveness 应接入 profile interpretation');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(output.semanticModel.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 不得启动');
});

test('Composition 不引入 score/weight/priority/global state，也不泄漏到复制上下文', () => {
    const { result, output } = outputFor(['癸','己','丙','辛'], ['丑','未','寅','卯']);
    const synthesis = output.semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({
        records:synthesis.visibleStemActorFunctionProfileRecords,
        contract:synthesis.visibleStemActorFunctionCompositionContract
    });
    ['score','weight','points','"strong"','"weak"','"balanced"','majority','priorityOrder','priorityRule','"priority":'].forEach((term) => {
        assert(!serialized.includes(term), `不得出现 ${term}`);
    });
    assert((synthesis.visibleStemActorFunctionProfileRecords || []).every((item) => item.actorGlobalEffectiveState === null && item.genericVisibleEffectiveState === null), '不得生成 global visible state');

    const copied = interpretation.buildBaziContextText(result, output);
    ['visibleStemActorFunctionProfile','actor-function-composition','SD-VISIBLE-STEM-ACTOR-FUNCTION-COMPOSITION'].forEach((term) => {
        assert(!copied.includes(term), `复制上下文泄漏内部字段：${term}`);
    });
});

test('生产加载链在 Actor Interaction Aggregation 后加载 Actor Function Composition', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-visible-stem-actor-interaction-aggregation.js'), 'utf8');
    assert(source.includes('./js/bazi-visible-stem-actor-function-composition.js?v=13.44.0'), '生产加载链缺少 Actor Function Composition');
});

console.log(`\nBaZi visible stem actor function composition: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);