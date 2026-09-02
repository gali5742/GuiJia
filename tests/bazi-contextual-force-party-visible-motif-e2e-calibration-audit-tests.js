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
    context.window = context; context.globalThis = context; vm.createContext(context);
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
    'js/bazi-contextual-force-party-nonstem-foundation-source.js','js/bazi-contextual-force-party-nonstem-foundation-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-source.js','js/bazi-contextual-force-party-branch-substrate-quality-audit.js',
    'js/bazi-branch-element-relation-inventory.js','js/bazi-contextual-force-party-relation-effect-generalization-source.js','js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js','js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js',
    'js/bazi-contextual-force-party-visible-motif-e2e-calibration-source.js','js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource;
const auditApi = GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationAudit;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2], dayElement = bazi.getWuXing(dayGan);
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
const outputFor = (gans, zhis) => interpretation.buildBaziInterpretation(makeResult(gans, zhis));
const synthesisFor = (gans, zhis) => outputFor(gans, zhis).semanticModel.strengthSynthesis;
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Visible Motif E2E Calibration Source/Audit v0.1 安装且不修改 realization registry', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.CONTRACT.mutatesVisibleStemRealizationRegistry === false, '不得修改 realization registry');
    assert(GuiJia.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.length === 3, 'direct realization patterns 不应增加');
});

test('opposition 四个完整命例都有制杀语义，但全部缺唯一 visible target', () => {
    const cases = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.OPPOSITION];
    assert(cases.length === 4, '应审计四个食神制杀命例');
    cases.forEach((item) => {
        assert(item.sourceExplicitOutcome === true, `${item.id} 应有 explicit outcome`);
        assert(item.sourceActorKeys.length === 1, `${item.id} source 食神应唯一`);
        assert(item.targetActorKeys.length > 1, `${item.id} 应有多个 visible killer target`);
        assert(item.blockerReasons.includes('multiple-visible-killer-targets'), `${item.id} 缺 target ambiguity blocker`);
        assert(item.calibrationEligible === false, `${item.id} 不得校准`);
    });
});

test('庚申 庚辰 甲戌 丙寅不把“制杀扶身”拆成两个 synthetic target edges', () => {
    const item = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.OPPOSITION].find((record) => record.chartKey === '庚申|庚辰|甲戌|丙寅');
    assert(item?.sourceActorTenGods[0] === '食神', '丙应为食神');
    assert(item?.targetActorTenGods.every((role) => role === '七杀'), '两庚均应为七杀');
    assert(item.targetActorKeys.includes('visible:0:庚') && item.targetActorKeys.includes('visible:1:庚'), '必须保留两个庚 actor');
    assert(item.targetSpecificActorResolved === false, '不得任选一个 target');
});

test('mediation 分别保留 cross-scope、multi-source 与 missing explicit pair outcome blocker', () => {
    const cases = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.MEDIATION];
    assert(cases.length === 5, '应审计五个杀重用印命例');
    const branchTarget = cases.find((item) => item.chartKey === '戊子|甲寅|戊午|甲寅');
    const visiblePair = cases.find((item) => item.chartKey === '己亥|丙寅|戊子|甲寅');
    const multiSource = cases.find((item) => item.chartKey === '戊午|丙辰|庚寅|丙戌');
    assert(branchTarget?.blockerReasons.includes('mediator-is-non-visible-branch-scope'), '午印应保留 cross-scope blocker');
    assert(visiblePair?.targetSpecificActorResolved === true && visiblePair?.sourceExplicitOutcome === false, '唯一 visible 甲→丙 pair 仍缺 explicit outcome');
    assert(visiblePair?.sourceActorTenGods[0] === '七杀' && visiblePair?.targetActorTenGods[0] === '偏印', '甲杀→丙印角色异常');
    assert(multiSource?.blockerReasons.includes('multiple-visible-killer-sources'), '两丙杀应保留 source ambiguity');
});

test('contract 拒绝 group split、cross-scope substitution 与 elemental fill-in', () => {
    const c = sourceApi.CONTRACT;
    assert(c.groupTargetSplitAuthorized === false, '不得拆 group target');
    assert(c.crossScopeAsRawVisibleCalibration === false, '不得跨 scope 冒充 raw visible');
    assert(c.elementalShapeFillsMissingOutcome === false, '不得由五行补 realization');
    assert(c.oppositionCalibrationStatus.startsWith('unresolved-') && c.mediationCalibrationStatus.startsWith('unresolved-'), '两 motif 应保持 unresolved');
});

test('机器依赖拆为 source audit + opposition + mediation + total calibration', () => {
    const synthesis = synthesisFor(), deps = depMap(synthesis);
    const audit = synthesis.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    assert(audit?.oppositionCalibrationResolved === false && audit?.mediationCalibrationResolved === false, '两 motif 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT']?.status === 'resolved', 'source audit 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION']?.status === 'unresolved', 'opposition 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION']?.status === 'unresolved', 'mediation 应 unresolved');
    const total = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION'];
    assert(total?.status === 'unresolved', 'total calibration 应 unresolved');
    assert(total.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION'), 'total 缺 opposition');
    assert(total.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION'), 'total 缺 mediation');
});

test('既有丁丑 癸卯 乙卯 己卯 positive realized-but-unmapped edge 不变', () => {
    const synthesis = synthesisFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const target = synthesis.contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit.records
        .find((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁' && item.functionType === 'restraint');
    assert(target?.realizationState === 'realized-in-source-context', '癸→丁 应 realized');
    assert(target?.authorizationState === 'realized-no-current-effect-type-authorization', '癸→丁 应继续 unmapped');
});

test('Generic mapping、generalization、dominance、substrate、Strength、Assessment 全部继续关闭', () => {
    const output = outputFor(), synthesis = output.semanticModel.strengthSynthesis, deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING']?.status === 'unresolved', 'generic mapping 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'generalization 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'dominance 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER']?.status === 'unresolved', 'substrate 不得 resolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength 应 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应 contract-only');
});

test('Audit 不引入 score、threshold、majority、ranking 或 actor-global effectiveness', () => {
    const audit = synthesisFor().contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','priorityScore'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(audit.numericScore === null && audit.scalarForce === null && audit.actorGlobalEffectiveness === null, '不得生成 scalar/global effectiveness');
});

test('生产 loader 保持 Branch → Generalization → Authorization → Calibration 的 parser-synchronous 顺序', () => {
    const branchText = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const calibrationText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js'), 'utf8');
    const generalIndex = branchText.indexOf('bazi-contextual-force-party-relation-effect-generalization-audit.js');
    const authIndex = branchText.indexOf('bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js');
    const calibrationIndex = branchText.indexOf('bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js');
    assert(generalIndex >= 0 && authIndex > generalIndex && calibrationIndex > authIndex, 'production loader 顺序异常');
    assert(calibrationText.includes('document.write') && calibrationText.includes('bazi-contextual-force-party-visible-motif-e2e-calibration-source.js'), 'Calibration Audit 应同步加载 source');
    assert(!/DOMContentLoaded/.test(branchText + calibrationText), '不得引入 DOMContentLoaded async loader');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
