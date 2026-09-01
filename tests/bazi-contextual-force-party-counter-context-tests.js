#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
let passed = 0;
let failed = 0;

function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
function loadScripts(files) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    files.forEach((file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file }));
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-month-command.js','js/bazi-strength-effects.js','js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js','js/bazi-root-six-relations.js','js/bazi-clash-preconditions.js','js/bazi-clash-seasonal-position.js','js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js','js/bazi-clash-rescue-context.js','js/bazi-root-clash-source-outcome.js','js/bazi-root-clash-interaction-effect.js',
    'js/bazi-root-actor-interaction-aggregation.js','js/bazi-root-baseline-effectiveness.js','js/bazi-stem-bearing-effect.js','js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js','js/bazi-visible-stem-directed-function.js','js/bazi-visible-stem-function-coverage.js','js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js','js/bazi-visible-stem-actor-interaction-aggregation.js','js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js','js/bazi-visible-stem-daymaster-contribution.js','js/bazi-qianli-strength-composition-source.js','js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-source.js','js/bazi-qianli-quantity-classification-audit.js','js/bazi-qianli-quantity-semantic-bridge-source.js','js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration-source.js','js/bazi-qianli-quantity-case-calibration.js','js/bazi-qianli-quantity-cross-literature-source.js','js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-contextual-force-evidence-source.js','js/bazi-contextual-force-evidence-profile.js','js/bazi-contextual-force-evidence.js','js/bazi-contextual-force-interaction-adapter-contract.js',
    'js/bazi-contextual-force-interaction-adapter-profile.js','js/bazi-contextual-force-interaction-adapter.js','js/bazi-contextual-force-party-source.js','js/bazi-contextual-force-party-audit.js',
    'js/bazi-contextual-force-party-membership-contract.js','js/bazi-contextual-force-party-membership-profile.js','js/bazi-contextual-force-party-membership.js',
    'js/bazi-contextual-force-party-affiliation-contract.js','js/bazi-contextual-force-party-affiliation-profile.js','js/bazi-contextual-force-party-affiliation.js',
    'js/bazi-contextual-force-party-affiliation-expansion-source.js','js/bazi-contextual-force-party-affiliation-expansion-audit.js',
    'js/bazi-contextual-force-party-relation-effect-contract.js','js/bazi-contextual-force-party-relation-effect-profile.js','js/bazi-contextual-force-party-relation-effect.js',
    'js/bazi-contextual-force-party-relative-dominance-source.js','js/bazi-contextual-force-party-relative-dominance-audit.js',
    'js/bazi-contextual-force-party-side-force-profile-contract.js','js/bazi-contextual-force-party-side-force-profile-profile.js','js/bazi-contextual-force-party-side-force-profile.js',
    'js/bazi-contextual-force-party-counter-context-contract.js','js/bazi-contextual-force-party-counter-context-profile.js','js/bazi-contextual-force-party-counter-context.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartyCounterContextContract;
const profileApi = GuiJia.baziContextualForcePartyCounterContextProfile;
const executionApi = GuiJia.baziContextualForcePartyCounterContext;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return { dayGan, dayGanWuXing:dayElement, pillars, internalRelations, monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', solarStr:'测试时间', ruleSummary:'测试口径' };
}
function outputFor(gans, zhis) { return interpretation.buildBaziInterpretation(makeResult(gans, zhis)); }
function depMap(synthesis) { return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item])); }

test('Counter Context v0.1 独立拆分 contract、profile mapper 与 execution', () => {
    assert(contractApi?.installed && profileApi?.installed && executionApi?.installed, '三个模块必须安装');
    assert(contractApi.VERSION === '0.1' && executionApi.VERSION === '0.1', '版本异常');
});

test('来源合同把五行季节状态与最终强弱分开', () => {
    assert(contractApi.CONTRACT.seasonalStateAppliesToActorElement === true, '缺 actor-element seasonal 授权');
    assert(contractApi.CONTRACT.seasonalStateIsNotForceClassification === true, '季节状态不得直接等于 force classification');
    assert(contractApi.CONTRACT.relativeDominanceMapping === false, '不得生成 relative dominance');
});

test('来源合同只把非日主通根泛化到 visible stem，不越级到 branch/hidden actor', () => {
    assert(contractApi.CONTRACT.visibleStemFoundationGeneralizationAuthorized === true, 'visible stem foundation 应有授权');
    assert(contractApi.CONTRACT.surfaceBranchFoundationResolverDefined === false, 'surface branch foundation 不得伪造');
    assert(contractApi.CONTRACT.hiddenActorFoundationResolverDefined === false, 'hidden actor foundation 不得伪造');
});

test('固定验证盘：子月全部水 counter anchors 获得 actor-specific 旺，不复制日主失令值', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = synthesis.contextualForcePartyCounterContextView;
    const water = view.records.filter((item) => item.actorIdentity.wuxing === '水');
    assert(water.length > 0, '应存在水 counter anchors');
    assert(water.every((item) => item.seasonalContext.state === '旺'), '子月水 actor 应为旺');
    assert(water.every((item) => item.seasonalContext.status === 'resolved-actor-element-seasonal-state'), '水 actor seasonal 应 resolved');
    assert(water.every((item) => item.seasonalContext.state !== '失令'), '不得复制日主 seasonal value');
});

test('固定验证盘：counter seasonal coverage 已完整解析', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = synthesis.contextualForcePartyCounterContextView;
    const deps = depMap(synthesis);
    assert(view.seasonalCoverageComplete === true, '固定盘 seasonal coverage 应 complete');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-SEASONAL-CONTEXT-COVERAGE']?.status === 'resolved', 'seasonal coverage dependency 应 resolved');
});

test('辰月属于过渡月：v0.1 保持 seasonal unresolved，而不是粗略套春季表', () => {
    const synthesis = outputFor(['丁','壬','丁','己'], ['丑','辰','亥','酉']).semanticModel.strengthSynthesis;
    const view = synthesis.contextualForcePartyCounterContextView;
    assert(view.records.some((item) => item.seasonalContext.status === 'unresolved-transitional-month-day-scope'), '辰月必须保留过渡月 blocker');
    assert(view.seasonalCoverageComplete === false, '辰月 seasonal coverage 不应 complete');
});

test('固定验证盘：月干壬作为 visible counter stem 可独立解析通根 inventory', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const item = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.gan === '壬' && record.actorIdentity.sourceScopes.includes('surface-stem'));
    assert(item, '应找到月干壬 counter anchor');
    assert(item.foundationContext.status === 'resolved-visible-stem-foundation-inventory', '壬 foundation 应 resolved');
    assert(item.foundationContext.exactRootPresence === 'present', '亥中壬应形成 exact root presence');
    assert(item.foundationContext.exactRootRecords.some((record) => record.zhi === '亥' && record.gan === '壬'), '应保留亥中壬 provenance');
    assert(item.foundationContext.rootEffectivenessClassification === null, '通根 presence 不得升级为 effectiveness');
});

test('visible stem foundation 保留本气/中气/余气 level，但不生成数字权重', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const item = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.gan === '壬' && record.actorIdentity.sourceScopes.includes('surface-stem'));
    assert(item.foundationContext.exactRootRecords.some((record) => record.level), '应保留藏干 level');
    assert(item.foundationContext.exactRootRecords.every((record) => record.numericWeight === null), '不得生成 root numeric weight');
});

test('surface branch counter anchor 的 foundation 继续 unresolved，不把自身存在伪装成根', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const branch = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.sourceScopes.includes('surface-branch'));
    assert(branch, '应存在 surface branch counter anchor');
    assert(branch.foundationContext.status === 'unresolved-surface-branch-foundation-scope', 'surface branch foundation 应继续 unresolved');
    assert(branch.foundationContext.exactRootPresence === null, '不得伪造 root presence');
});

test('hidden counter actor 的 foundation 继续 unresolved，不把“藏于支中”自动等同通根', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const hidden = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.sourceScopes.includes('hidden-modifier'));
    assert(hidden, '应存在 hidden counter actor');
    assert(hidden.foundationContext.status === 'unresolved-hidden-actor-foundation-scope', 'hidden foundation 应继续 unresolved');
});

test('Side Force Profile 只移除已真实解析的 seasonal/foundation blocker', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const sideView = synthesis.contextualForcePartySideForceProfileView;
    const visibleStem = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.gan === '壬' && record.actorIdentity.sourceScopes.includes('surface-stem'));
    assert(!sideView.blockerRecords.some((item) => item.actorKey === visibleStem.anchorActorKey && String(item.id).startsWith('CF-SFP-B-SEASON-')), '壬 seasonal blocker 应移除');
    assert(!sideView.blockerRecords.some((item) => item.actorKey === visibleStem.anchorActorKey && String(item.id).startsWith('CF-SFP-B-FOUNDATION-')), '壬 foundation blocker 应移除');
    assert(sideView.blockerRecords.some((item) => String(item.id).startsWith('CF-SFP-B-FOUNDATION-')), '未授权 branch/hidden foundation blocker 必须继续存在');
});

test('固定验证盘 Side Force Profile coverage 仍 unresolved，Relation Effect generalization 也未被绕过', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE']?.status === 'unresolved', 'Side Force Profile coverage 仍应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'Relation Effect generalization 不得被绕过');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE']?.status === 'unresolved', 'comparison rule 仍应 unresolved');
});

test('Counter Context 完成不生成 relative dominance、Party Configuration、many/few 或 Assessment', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'relative dominance 仍应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party configuration 仍应 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'many/few 仍应 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
    assert((output.semanticModel.assessmentLayer?.assessments || []).length === 0, 'Assessment 不得产生结论');
});

test('合同和运行结果不引入 score/weight/threshold/majority/ranking', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const text = JSON.stringify({ contract:contractApi.CONTRACT, view:synthesis.contextualForcePartyCounterContextView });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult'].forEach((key) => assert(!text.includes(key), `不得出现 ${key}`));
    assert(synthesis.contextualForcePartyCounterContextView.records.every((item) => item.numericScore === null), 'record numericScore 必须为 null');
});

test('生产 loader 链应为 Side Force Profile → Counter Context execution → contract/profile', () => {
    const sideFile = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-side-force-profile.js'), 'utf8');
    const executionFile = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-counter-context.js'), 'utf8');
    assert(sideFile.includes('bazi-contextual-force-party-counter-context.js'), 'Side Force Profile 应加载 Counter Context execution');
    assert(executionFile.includes('bazi-contextual-force-party-counter-context-contract.js'), 'execution 应加载 contract');
    assert(executionFile.includes('bazi-contextual-force-party-counter-context-profile.js'), 'execution 应加载 profile mapper');
});

console.log(`\nContextual Force Party Counter Context v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
