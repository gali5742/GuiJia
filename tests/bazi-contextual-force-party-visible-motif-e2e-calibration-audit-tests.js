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
function synthesisFor(gans, zhis) { return outputFor(gans, zhis).semanticModel.strengthSynthesis; }
function depMap(synthesis) { return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item])); }
function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Visible Motif E2E Calibration Source/Audit v0.1 独立安装', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.CONTRACT.mutatesVisibleStemRealizationRegistry === false, '不得修改 realization registry');
});

test('opposition 四个《官杀·食神制杀格》命例均不能伪造 target-specific calibration', () => {
    const cases = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.OPPOSITION];
    assert(cases.length === 4, '应审计四个食神制杀命例');
    cases.forEach((item) => {
        assert(item.sourceExplicitOutcome === true, `${item.id} 应有明确制杀 outcome`);
        assert(item.sourceActorKeys.length === 1, `${item.id} 食神 source 应唯一`);
        assert(item.targetActorKeys.length > 1, `${item.id} 应存在多个七杀 target`);
        assert(item.calibrationEligible === false, `${item.id} 不得进入 exact-source calibration`);
        assert(item.blockerReasons.includes('multiple-visible-killer-targets'), `${item.id} 缺多 target blocker`);
    });
});

test('庚申 庚辰 甲戌 丙寅保留“丙食神制两庚杀”的群体语义，不拆 edge', () => {
    const item = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.OPPOSITION].find((record) => record.chartKey === '庚申|庚辰|甲戌|丙寅');
    assert(item, '缺目标命例');
    assert(item.sourceActorTenGods[0] === '食神', '丙应为甲日主食神');
    assert(item.targetActorTenGods.every((role) => role === '七杀'), '两庚都应为七杀');
    assert(item.targetActorKeys.includes('visible:0:庚') && item.targetActorKeys.includes('visible:1:庚'), '应保留两个庚 actor');
    assert(item.targetSpecificActorResolved === false, '不得选一个庚作为唯一 target');
});

test('mediation 命例明确区分 cross-scope、source ambiguity 与 missing explicit pair outcome', () => {
    const cases = sourceApi.CASES_BY_MOTIF[sourceApi.MOTIF_IDS.MEDIATION];
    assert(cases.length === 5, '应审计五个杀重用印命例');
    const branchTarget = cases.find((item) => item.chartKey === '戊子|甲寅|戊午|甲寅');
    const visiblePairNoOutcome = cases.find((item) => item.chartKey === '己亥|丙寅|戊子|甲寅');
    const multiSource = cases.find((item) => item.chartKey === '戊午|丙辰|庚寅|丙戌');
    assert(branchTarget?.blockerReasons.includes('mediator-is-non-visible-branch-scope'), '坐下午印应为 cross-scope blocker');
    assert(visiblePairNoOutcome?.targetSpecificActorResolved === true, '己亥命例 visible pair identity 应唯一');
    assert(visiblePairNoOutcome?.sourceExplicitOutcome === false, '己亥命例不得补写甲→丙 realization');
    assert(visiblePairNoOutcome?.sourceActorTenGods[0] === '七杀' && visiblePairNoOutcome?.targetActorTenGods[0] === '偏印', 'visible pair 十神角色异常');
    assert(multiSource?.blockerReasons.includes('multiple-visible-killer-sources'), '两丙杀应保留 multi-source blocker');
});

test('source contract 拒绝 group split、cross-scope substitution 与 elemental fill-in', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.groupTargetSplitAuthorized === false, '不得拆 group target');
    assert(contract.crossScopeAsRawVisibleCalibration === false, '不得跨 scope 冒充 raw visible');
    assert(contract.elementalShapeFillsMissingOutcome === false, '不得由生克关系补 explicit outcome');
    assert(contract.oppositionCalibrationStatus.startsWith('unresolved-'), 'opposition 应 unresolved');
    assert(contract.mediationCalibrationStatus.startsWith('unresolved-'), 'mediation 应 unresolved');
});

test('机器 audit 将 known motif calibration 拆为 opposition / mediation 两个独立 blocker', () => {
    const synthesis = synthesisFor();
    const audit = synthesis.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    const deps = depMap(synthesis);
    assert(audit?.oppositionCalibrationResolved === false, 'opposition 不得 resolved');
    assert(audit?.mediationCalibrationResolved === false, 'mediation 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT']?.status === 'resolved', 'source audit dependency 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION']?.status === 'unresolved', 'opposition calibration 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION']?.status === 'unresolved', 'mediation calibration 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION']?.status === 'unresolved', 'total calibration 应 unresolved');
});

test('总 calibration dependency 必须同时依赖两个 motif blocker，不做至少一个通过即可的折中', () => {
    const deps = depMap(synthesisFor());
    const total = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION'];
    assert(total.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION'), '缺 opposition dependency');
    assert(total.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION'), '缺 mediation dependency');
});

test('本阶段不向 Direct Source Function Realization registry 注入 synthetic calibration pattern', () => {
    const ids = GuiJia.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.map((item) => item.id);
    assert(ids.length === 3, 'direct source realization registry 数量不应变化');
    assert(ids.includes('DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001'), '既有正向 realized pattern 应保留');
    assert(!ids.some((id) => /FOOD|KILLER|SEAL|CALIBRATION/.test(id)), '不得注入 synthetic motif calibration pattern');
});

test('已有丁丑 癸卯 乙卯 己卯 realized-but-unmapped edge 保持原状', () => {
    const synthesis = synthesisFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const auth = synthesis.contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit;
    const target = auth.records.find((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁' && item.functionType === 'restraint');
    assert(target?.realizationState === 'realized-in-source-context', '癸→丁 应为 positive realized edge');
    assert(target?.authorizationState === 'realized-no-current-effect-type-authorization', '癸→丁 仍应 realized-but-unmapped');
});

test('Generic Visible Mapping 与 Cross-Actor Generalization 继续 unresolved', () => {
    const deps = depMap(synthesisFor());
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING']?.status === 'unresolved', 'generic visible mapping 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'cross-actor generalization 不得 resolved');
});

test('Relative Dominance、Branch Substrate Quality、Strength Synthesis、Assessment 继续关闭', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'relative dominance 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER']?.status === 'unresolved', 'branch substrate quality 不得 resolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应 contract-only');
});

test('Audit 不引入 score、weight、threshold、majority、ranking 或 actor-global effectiveness', () => {
    const audit = synthesisFor().contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','priorityScore'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(audit.numericScore === null && audit.scalarForce === null && audit.actorGlobalEffectiveness === null, '不得生成 scalar/global effectiveness');
});

test('生产 loader 保持 parser-synchronous，并在 Visible-Edge Authorization 后接 Calibration Audit', () => {
    const branchText = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const authText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js'), 'utf8');
    const calibrationText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js'), 'utf8');
    assert(branchText.includes('bazi-contextual-force-party-relation-effect-generalization-audit.js'), 'Branch loader 应保留 Generalization Audit');
    assert(authText.includes('bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js'), 'Authorization Audit 应同步接 Calibration Audit');
    assert(calibrationText.includes('document.write') && calibrationText.includes('bazi-contextual-force-party-visible-motif-e2e-calibration-source.js'), 'Calibration Audit 应同步加载 source');
    assert(!/DOMContentLoaded/.test(authText + calibrationText), '不得引入 DOMContentLoaded async loader');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
