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
    'js/bazi-qianli-strength-composition-source.js',
    'js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-source.js',
    'js/bazi-qianli-quantity-classification-audit.js',
    'js/bazi-qianli-quantity-semantic-bridge-source.js',
    'js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration-source.js',
    'js/bazi-qianli-quantity-case-calibration.js',
    'js/bazi-qianli-quantity-cross-literature-source.js',
    'js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-contextual-force-evidence-source.js',
    'js/bazi-contextual-force-evidence-profile.js',
    'js/bazi-contextual-force-evidence.js',
    'js/bazi-contextual-force-interaction-adapter-contract.js',
    'js/bazi-contextual-force-interaction-adapter.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForceInteractionAdapterContract;
const api = GuiJia.baziContextualForceInteractionAdapter;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
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
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis));
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

test('Interaction Force Adapter v0.1 独立冻结输入白名单与执行层', () => {
    assert(contractApi?.installed === true, 'adapter contract 未安装');
    assert(api?.installed === true, 'adapter execution 未安装');
    assert(contractApi.VERSION === '0.1' && api.VERSION === '0.1', 'adapter 版本异常');
    assert(contractApi.CONTRACT.whitelistOnly === true, '必须 whitelist-only');
    assert(contractApi.CONTRACT.structurePresenceCreatesModifier === false, 'Structure presence 不得制造 modifier');
    assert(contractApi.CONTRACT.daymasterRelatedFunctionEdgesExcludedFromInteractionAxis === true, 'daymaster edge 必须排除重复记录');
    assert(contractApi.CONTRACT.qualifierCreatesIndependentModifier === false, 'profile qualifier 不得独立计力');
});

test('固定验证盘：Structure 可存在，但 interaction axis 完整且不制造 modifier', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const axis = synthesis.contextualForceEvidenceProfile.axes.interactionModifier;
    assert(axis.structureRefs.length > 0, '固定盘应保留真实 Structure refs');
    assert(axis.status === 'mapped-resolved-source-interaction-modifiers', `interaction axis 应 resolved，实际 ${axis.status}`);
    assert(axis.realizedModifierRecords.length === 0, '普通 Structure presence 不得制造 modifier');
    assert(axis.resolvedNonRealizationRecords.length === 0, '固定盘不应伪造 non-realization');
    assert(axis.blockerRecords.length === 0, '普通 Structure 不应成为 adapter blocker');
    assert(axis.numericValue === null && axis.scalarForce === null, 'interaction axis 不得数值化');
});

test('固定验证盘：九轴 coverage 可 resolved，但党势与强弱仍不启动', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(synthesis.contextualForceEvidenceProfile.status === 'mapped-complete-no-force-conclusion', '九轴 evidence profile 应完成映射');
    assert(synthesis.contextualForceEvidenceProfile.unresolvedAxisIds.length === 0, '不应再有 unresolved axis');
    assert(deps['SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-MODEL']?.status === 'resolved', 'adapter model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-INTERACTION-ADAPTER-COVERAGE']?.status === 'resolved', 'adapter coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']?.status === 'resolved', 'profile coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party configuration 必须继续 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-RULE']?.status === 'unresolved', 'many/few generalization 必须继续 unresolved');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 仍应 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 必须保持 not-evaluated');
});

test('resolved root-clash interaction 只进入对应 root actor modifier，不压成全局有效性', () => {
    const view = api.buildAdapterView(
        { structures:[{ id:'S01' }] },
        { rootClashInteractionEffectRecords:[{
            id:'RCIE-01', actorKey:'root:2:午:丁', structureRef:'S01',
            resolutionStatus:'resolved-interaction-semantics', sourceOutcomeKind:'source-uprooted-removed',
            standingState:'cannot-stand', removalState:'removable-by-clash', harmState:null, activationState:null,
            sourceTerms:['拔不能立','能去之']
        }] }
    );
    assert(view.realizedModifierRecords.length === 1, '应形成一条 root clash modifier');
    const record = view.realizedModifierRecords[0];
    assert(record.family === 'root-clash-interaction-effect', 'family 异常');
    assert(record.targetActorKey === 'root:2:午:丁', '必须保留 target root actor');
    assert(record.structureRef === 'S01', '必须保留真实 Structure provenance');
    assert(record.semanticState.standingState === 'cannot-stand', 'standing semantic 丢失');
    assert(record.semanticState.removalState === 'removable-by-clash', 'removal semantic 丢失');
    assert(record.genericEffectiveState === null && record.actorGlobalEffectiveState === null, '不得生成 global effectiveness');
});

test('未解析的真实 root-clash interaction 会阻断 adapter coverage，而不是被忽略', () => {
    const view = api.buildAdapterView(
        { structures:[{ id:'S01' }] },
        { rootClashInteractionEffectRecords:[{
            id:'RCIE-01', actorKey:'root:2:午:丁', structureRef:'S01',
            resolutionStatus:'unresolved-source-outcome'
        }] }
    );
    assert(view.status === 'mapped-partial-unresolved-interaction-inputs', '已知真实交互未解析时应 partial');
    assert(view.blockerRecords.length === 1, '应保留 blocker');
    assert(view.realizedModifierRecords.length === 0, '不得猜测 modifier');
});

test('Stem Bearing exact clash：丁卯受卯酉冲损伤进入 modifier，甲申“不载”不重复塞进 interaction axis', () => {
    const model = outputFor(['己','丁','庚','甲'], ['酉','卯','辰','申']).semanticModel;
    const view = model.strengthSynthesis.contextualForceInteractionAdapterView;
    const bearing = view.realizedModifierRecords.filter((item) => item.family === 'stem-bearing-source-outcome');
    assert(bearing.some((item) => item.sourceBearingState === 'source-bearing-damaged-by-clash' && item.targetActorKey === 'visible:1:丁'), '丁卯 bearing damage 应进入 interaction modifier');
    assert(!bearing.some((item) => item.sourceBearingState === 'source-not-carried-as-if-absent'), '甲申不载不是 interaction modifier');
    assert(view.exclusions.resolvedNonInteractionBearingOutcomesExcluded >= 1, '应显式记录 non-interaction bearing exclusion');
});

test('Stem Bearing exact support：亥水生扶加固丁卯承载只形成 target-specific modifier', () => {
    const model = outputFor(['己','丁','庚','庚'], ['亥','卯','申','辰']).semanticModel;
    const records = model.strengthSynthesis.contextualForceInteractionAdapterView.realizedModifierRecords;
    const item = records.find((record) => record.sourceBearingState === 'source-bearing-fortified-by-support');
    assert(item, '应映射 source-bearing-fortified-by-support');
    assert(item.targetActorKey === 'visible:1:丁', '应只修正丁 actor bearing context');
    assert(item.genericEffectiveState === null, '愈固不得直接变 effective');
});

test('DTS exact-source：cross-visible 癸→丁已兑现进入 modifier，己→癸未兑现只进入 non-realization', () => {
    const model = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel;
    const view = model.strengthSynthesis.contextualForceInteractionAdapterView;
    const realized = view.realizedModifierRecords.filter((item) => item.family === 'cross-visible-function-realization');
    const nonRealized = view.resolvedNonRealizationRecords;
    assert(realized.some((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁' && item.functionType === 'restraint'), '癸→丁 restraint 应成为 realized interaction modifier');
    assert(nonRealized.some((item) => item.sourceActorKey === 'visible:3:己' && item.targetActorKey === 'visible:1:癸' && item.functionType === 'restraint'), '己→癸不能去应单列 non-realization');
    assert(!realized.some((item) => item.sourceActorKey === 'daymaster:2:乙'), '乙→丁 daymaster edge 不得在 interaction axis 重复');
});

test('DTS exact-source：Actor Profile Interpretation 只附着为 qualifier，不制造第二份 modifier', () => {
    const model = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel;
    const view = model.strengthSynthesis.contextualForceInteractionAdapterView;
    assert(view.qualifierRecords.some((item) => item.interpretationState === 'outlet-function-realized-under-restraint-in-source-context'), '应保留丁 outlet-under-restraint qualifier');
    const guiToDing = view.realizedModifierRecords.find((item) => item.sourcePatternId === 'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001');
    assert(guiToDing, '应找到癸→丁 modifier');
    assert(guiToDing.qualifierRecordIds.length === 1, 'profile qualifier 应附着于相关 edge');
    assert(view.qualifierRecords.every((item) => item.independentModifier === false), 'qualifier 不得独立计力');
});

test('明确未兑现的 cross-visible edge 不是反向力量，也不阻断 coverage', () => {
    const view = api.buildAdapterView({}, {
        visibleStemFunctionRealizationRecords:[{
            id:'X1', relationScope:'cross-visible-actor', sourceActorKey:'visible:0:甲', targetActorKey:'visible:1:戊',
            functionType:'restraint', realizationState:'not-realized-in-source-context', resolutionStatus:'resolved-direct-source-function-not-realized'
        }]
    });
    assert(view.resolvedNonRealizationRecords.length === 1, '应保存 non-realization');
    assert(view.realizedModifierRecords.length === 0, '未兑现不能成为 modifier');
    assert(view.blockerRecords.length === 0 && view.coverage.complete === true, '明确未兑现仍属于已解析 coverage');
});

test('已识别但 realization 未解的 cross-visible edge 会成为 blocker', () => {
    const view = api.buildAdapterView({}, {
        visibleStemFunctionRealizationRecords:[{
            id:'X1', relationScope:'cross-visible-actor', sourceActorKey:'visible:0:甲', targetActorKey:'visible:1:戊',
            functionType:'restraint', realizationState:'unresolved', resolutionStatus:'unresolved-source-function-realization'
        }]
    });
    assert(view.blockerRecords.length === 1, '未解 cross-visible edge 应阻断');
    assert(view.coverage.complete === false, 'coverage 不得 complete');
});

test('Interaction Adapter 不改变 daymaster contribution 的直接强弱方向边界', () => {
    const synthesis = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel.strengthSynthesis;
    const direct = synthesis.visibleStemDaymasterContributionRecords || [];
    assert(direct.filter((item) => item.strengthMeaning === 'drain').length === 1, '原有 drain contribution 数量不得被 cross-visible modifier 扩张');
    assert(!direct.some((item) => item.sourceActorKey === 'visible:1:癸' && item.strengthMeaning === 'restraint'), '癸→丁不得被改造成日主 direct restraint contribution');
});

test('九轴 profile coverage resolved 后，party/capacity/many-few 仍保持严格 blocker', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']?.status === 'resolved', 'profile evidence coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party rule 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-CAPACITY-INTERPRETATION-RULE']?.status === 'unresolved', 'capacity rule 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'quantity classifier 必须 unresolved');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '不得生成 support many/few');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '不得生成 restraint/drain many/few');
    assert(synthesis.contextualForceEvidenceProfile.partyConfiguration === null, '不得生成 party configuration');
    assert(synthesis.contextualForceEvidenceProfile.capacityInterpretation === null, '不得生成 capacity interpretation');
});

test('Adapter contract 与结果不引入数值、优先级、全局 effective 或最终强弱', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const view = synthesis.contextualForceInteractionAdapterView;
    assert(contractApi.CONTRACT.numericAggregation === false, '不得 numeric aggregation');
    assert(contractApi.CONTRACT.numericWeights === false, '不得 numeric weights');
    assert(contractApi.CONTRACT.majorityVoting === false, '不得 majority voting');
    assert(contractApi.CONTRACT.priorityAggregation === false, '不得 priority aggregation');
    assert(contractApi.CONTRACT.actorGlobalEffectiveState === false, '不得 actor global effective');
    assert(contractApi.CONTRACT.partyConfigurationMapping === false, '不得 party mapping');
    assert(contractApi.CONTRACT.finalStrengthMapping === false, '不得 final strength mapping');
    assert(view.numericValue === null && view.scalarForce === null, 'adapter view 不得带 scalar force');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 仍须 not-evaluated');
});

test('生产 loader 链为 Contextual Force Evidence → Adapter contract/execution', () => {
    const evidence = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-evidence.js'), 'utf8');
    const adapter = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-interaction-adapter.js'), 'utf8');
    assert(evidence.includes('bazi-contextual-force-interaction-adapter.js'), 'Contextual Force Evidence 未加载 adapter execution');
    assert(adapter.includes('bazi-contextual-force-interaction-adapter-contract.js'), 'adapter execution 未加载独立 contract');
});

console.log(`\nContextual Force Interaction Adapter v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
