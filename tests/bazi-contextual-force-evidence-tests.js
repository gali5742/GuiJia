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
    'js/bazi-contextual-force-evidence.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForceEvidenceSource;
const api = GuiJia.baziContextualForceEvidence;

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

function profileFor(gans, zhis) {
    return outputFor(gans, zhis).semanticModel.strengthSynthesis.contextualForceEvidenceProfile;
}

test('Contextual Force Evidence v0.1 将来源合同与执行层独立拆分', () => {
    assert(sourceApi?.installed === true, 'contextual force source 未安装');
    assert(api?.installed === true, 'contextual force execution 未安装');
    assert(sourceApi.VERSION === '0.1' && api.VERSION === '0.1', '版本异常');
    assert(Object.keys(sourceApi.SOURCES).length === 6, '来源数量异常');
    assert(sourceApi.EVIDENCE.length === 12, '证据数量异常');
    assert(sourceApi.AXES.length === 9, '证据轴数量异常');
});

test('来源支持 capacity 语义方向，但没有自动 capacity interpretation rule', () => {
    const finding = sourceApi.FINDINGS.find((item) => item.key === 'capacity-semantic-direction');
    assert(finding?.status === 'supported', 'capacity semantic direction 应有支持');
    assert(finding?.value === 'relative-load-bearing', 'capacity 方向应为 relative-load-bearing');
    assert(sourceApi.CONTRACT.capacitySemanticDirectionSupported === true, 'contract 应确认 capacity semantic direction');
    assert(sourceApi.CONTRACT.capacityInterpretationRuleDefined === false, '不得已有 capacity rule');
    assert(sourceApi.CONTRACT.strengthClassificationRuleDefined === false, '不得已有 strength classifier');
});

test('固定验证盘形成九轴 Contextual Force profile，但不形成总力量结论', () => {
    const profile = profileFor();
    assert(Object.keys(profile.axes || {}).length === 9, '应形成九个独立 axis');
    assert(profile.partyConfiguration === null, '不得生成 partyConfiguration');
    assert(profile.forceClassification === null, '不得生成 forceClassification');
    assert(profile.capacityInterpretation === null, '不得生成 capacityInterpretation');
    assert(profile.numericScore === null && profile.scalarForce === null, '不得生成 scalar/numeric force');
    assert(profile.assessmentConclusion === null, '不得生成 Assessment conclusion');
});

test('月令只形成 seasonalStanding 独立轴，不等于 Contextual Force', () => {
    const axis = profileFor().axes.seasonalStanding;
    assert(axis.axisId === 'seasonalStanding', 'seasonal axis id 异常');
    assert(axis.status === 'mapped-resolved-source-standing', '固定盘 seasonal standing 应可映射');
    assert(axis.value === '失令', `固定盘丁火子月应映射失令，实际 ${axis.value}`);
    assert(axis.numericValue === null, '季节不得数值化');
    assert(axis.boundary.includes('不等于整体'), '必须保留 season != total force 边界');
});

test('根基轴保存 presence，但不把 presence 折成 root effectiveness', () => {
    const axis = profileFor().axes.rootFoundation;
    assert(axis.exactRoot.presence === 'absent', '固定盘不应有丁火本干通根');
    assert(axis.sameElementRoot.presence === 'absent', '固定盘不应有同五行异干得地');
    assert(axis.rootEffectivenessClassification === null, '不得由无/有根直接生成 effectiveness classification');
    assert(axis.rootQualityNumericValue === null, '根轻重不得数值化');
});

test('扶助轴把表层候选、藏干 modifier 与项目 contribution 分开保存', () => {
    const axis = profileFor().axes.alliedSupport;
    assert(Array.isArray(axis.sourceSurfaceCandidates) && axis.sourceSurfaceCandidates.length >= 1, '固定盘应有表层扶助候选');
    assert(Array.isArray(axis.hiddenModifierCandidates) && axis.hiddenModifierCandidates.length >= 1, '固定盘应有藏干扶助 modifier 候选');
    assert(Array.isArray(axis.projectContributionRecords) && axis.projectContributionRecords.length >= 1, '应回链 daymaster contribution records');
    assert(axis.projectContributionRecords.every((item) => item.strengthMeaning === 'support'), 'alliedSupport 只能挂 support contribution');
    assert(axis.partyConfiguration === null, '三类 inventory 不得自动合成党势');
    assert(axis.numericValue === null, '扶助不得计分');
});

test('克、泄、被分继续保持三个独立 force axis', () => {
    const axes = profileFor().axes;
    assert(axes.incomingRestraint.projectContributionRecords.length === 1, '固定盘应有一条 visible restraint contribution record');
    assert(axes.outboundDrain.projectContributionRecords.length === 1, '固定盘应有一条 visible drain contribution record');
    assert(axes.incomingRestraint.projectContributionRecords.every((item) => item.strengthMeaning === 'restraint'), 'incomingRestraint 不得混入 drain/distribution');
    assert(axes.outboundDrain.projectContributionRecords.every((item) => item.strengthMeaning === 'drain'), 'outboundDrain 不得混入 restraint/distribution');
    assert(axes.outboundDistribution.projectContributionRecords.every((item) => item.strengthMeaning === 'distribution'), 'outboundDistribution 不得混入 restraint/drain');
    assert(axes.incomingRestraint.sourceSurfaceCandidates.every((item) => api.relationMatchesMeaning(item, 'restraint')), '克制 surface candidates 必须方向一致');
    assert(axes.outboundDrain.sourceSurfaceCandidates.every((item) => api.relationMatchesMeaning(item, 'drain')), '泄力 surface candidates 必须方向一致');
    assert(axes.outboundDistribution.sourceSurfaceCandidates.every((item) => api.relationMatchesMeaning(item, 'distribution')), '被分 surface candidates 必须方向一致');
    assert(sourceApi.CONTRACT.restraintDrainDistributionSeparate === true, 'contract 必须锁定克泄被分分轴');
});

test('年日时支气保持逐支 context，不从十二长生直接汇总得气／无气', () => {
    const axis = profileFor().axes.branchQiContext;
    assert(axis.status === 'mapped-unaggregated', 'branch qi 应保持未聚合');
    assert(axis.observedStates.length === 3, `应观察年日时三支，实际 ${axis.observedStates.length}`);
    assert(axis.aggregateClassification === null, '不得直接生成支得气/无气');
    assert(axis.numericValue === null, '支气不得数值化');
});

test('hidden modifier 只保存定性人元记录，不转换本气中气余气权重', () => {
    const axis = profileFor().axes.hiddenModifier;
    assert(axis.records.length > 0, '应存在 hidden modifier inventory');
    assert(axis.numericConversion === null, '藏干层级不得数字换算');
    assert(sourceApi.CONTRACT.hiddenModifierSeparate === true, 'hidden modifier 必须是独立轴');
});

test('Structure 存在不能直接成为 interaction force modifier', () => {
    const axis = profileFor().axes.interactionModifier;
    assert(axis.status === 'adapter-unresolved', 'interaction adapter 应继续 unresolved');
    assert(axis.structureRefs.length > 0, '固定盘应保留真实 Structure provenance');
    assert(axis.realizedModifierRecords.length === 0, '不得从 Structure presence 自动制造 realized modifier');
    assert(axis.numericValue === null, 'interaction 不得计分');
});

test('Evidence Model resolved，但 profile/党势/generalization/capacity interpretation 继续阻断', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-QUANTITY-CONTEXTUAL-FORCE-EVIDENCE-MODEL']?.status === 'resolved', 'Evidence Model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PROFILE-COVERAGE']?.status === 'unresolved', 'profile coverage 应受 interaction adapter 阻断');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party configuration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-CAPACITY-SEMANTIC-DIRECTION']?.status === 'resolved', 'capacity semantic direction 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-CAPACITY-INTERPRETATION-RULE']?.status === 'unresolved', 'capacity interpretation 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-RULE']?.status === 'unresolved', 'many/few generalization 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'quantity classification 必须 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support classifier 必须 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain classifier 必须 unresolved');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 必须保持 not-evaluated');
});

test('DTS exact-source 纵有已兑现 drain，也不能越级形成 party/many-few/capacity', () => {
    const model = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel;
    const synthesis = model.strengthSynthesis;
    const profile = synthesis.contextualForceEvidenceProfile;
    assert(profile.axes.outboundDrain.projectContributionRecords.some((item) => item.contributionState === 'realized-daymaster-contribution-in-source-context'), 'DTS exact chart 应保留已兑现 drain contribution');
    assert(profile.partyConfiguration === null, 'realized drain 不得生成 partyConfiguration');
    assert(profile.capacityInterpretation === null, 'realized drain 不得生成 capacity interpretation');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, '不得生成多/少帮扶');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, '不得生成多/少克泄');
});

test('Contextual Force Evidence 不引入分数、阈值、比例或强弱结果', () => {
    const profile = profileFor();
    assert(profile.numericScore === null, 'numericScore 必须为空');
    assert(profile.scalarForce === null, 'scalarForce 必须为空');
    Object.values(profile.axes).forEach((axis) => {
        assert(axis.numericValue === undefined || axis.numericValue === null, `${axis.axisId} 不得带 numericValue`);
    });
    assert(sourceApi.CONTRACT.numericAggregation === false, '不得 numeric aggregation');
    assert(sourceApi.CONTRACT.numericWeights === false, '不得 numeric weights');
    assert(sourceApi.CONTRACT.majorityVoting === false, '不得 majority voting');
    assert(sourceApi.CONTRACT.equalItemCounting === false, '不得 equal item count');
    assert(sourceApi.CONTRACT.scalarCollapse === false, '不得 scalar collapse');
    assert(sourceApi.CONTRACT.finalAssessmentMapping === false, '不得 final Assessment mapping');
});

test('生产 loader 链为 Cross-Literature Research → Contextual Force，并由执行层加载独立 source contract', () => {
    const crossLit = fs.readFileSync(path.join(ROOT, 'js/bazi-qianli-quantity-cross-literature-research.js'), 'utf8');
    const execution = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-evidence.js'), 'utf8');
    assert(crossLit.includes('bazi-contextual-force-evidence.js'), 'Cross-Literature Research 未加载 Contextual Force');
    assert(execution.includes('bazi-contextual-force-evidence-source.js'), 'Contextual Force execution 未加载 source contract');
});

console.log(`\nContextual Force Evidence v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
