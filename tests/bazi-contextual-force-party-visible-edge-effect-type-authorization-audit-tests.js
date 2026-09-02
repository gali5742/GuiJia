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
    'js/bazi-branch-element-relation-inventory.js',
    'js/bazi-contextual-force-party-relation-effect-generalization-source.js','js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js','js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource;
const auditApi = GuiJia.baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit;

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

test('Visible-Edge Effect-Type Authorization Source/Audit v0.1 独立安装', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
});

test('source audit 确认 effect type 是 pattern-specific authorization，不是五行 shape 字典', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.realizationAloneAuthorizesEffectType === false, 'realization 不得单独授权 effect type');
    assert(contract.functionShapeAloneAuthorizesEffectType === false, 'function shape 不得单独授权 effect type');
    assert(contract.genericVisibleEdgeEffectTypeResolverDefined === false, '不得提前定义 generic resolver');
});

test('direct-source registry 已具有正向 cross-visible realization capability', () => {
    assert(sourceApi.CONTRACT.positiveCrossVisibleRealizationCapability === true, '应存在 positive cross-visible realization pattern');
    assert(sourceApi.POSITIVE_DIRECT_CROSS_VISIBLE_PATTERNS.length > 0, 'positive pattern inventory 为空');
});

test('丁丑 癸卯 乙卯 己卯 的癸→丁 restraint 确认为 realized，但当前 Party motif 不授权 effect type', () => {
    const synthesis = synthesisFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const audit = synthesis.contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit;
    const record = (audit.records || []).find((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁' && item.functionType === 'restraint');
    assert(record, '缺癸→丁 cross-visible audit record');
    assert(record.realizationState === 'realized-in-source-context', '癸→丁应为 source-realized');
    assert(record.authorizationState === 'realized-no-current-effect-type-authorization', '应保持 realized-but-unmapped');
    assert(record.effectTypeAuthorized === false, '不得伪造 effect type authorization');
    assert(record.currentRegistryNoMatchIsSemanticRejection === false, 'registry no-match 不得解释为永远无 effect');
});

test('source matrix 明确记录 positive realized-but-unmapped pattern', () => {
    const record = sourceApi.POSITIVE_UNMAPPED_DIRECT_PATTERNS.find((item) => item.patternId === 'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-001');
    assert(record, '应存在癸克丁 positive unmapped source pattern');
    assert(record.sourceTenGod === '偏印' && record.targetTenGod === '食神', '十神角色解析异常');
    assert(record.matchedMotifIds.length === 0, '该 pattern 不应命中现有 Party motif');
});

test('当前 raw opposition / mediation motif 尚无 positive direct-source end-to-end calibration', () => {
    assert(sourceApi.RAW_VISIBLE_MOTIFS.length === 2, 'raw visible motif 数量异常');
    assert(sourceApi.POSITIVE_AUTHORIZED_DIRECT_PATTERNS.length === 0, '当前不应已有 positive authorized direct calibration');
    assert(sourceApi.CONTRACT.positiveAuthorizedDirectPatternObserved === false, 'calibration flag 应为 false');
});

test('generic visible mapping blocker 被细化为 authorization audit + calibration blocker', () => {
    const deps = depMap(synthesisFor());
    const auditDep = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-EFFECT-TYPE-AUTHORIZATION-AUDIT'];
    const calibration = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION'];
    const generic = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING'];
    assert(auditDep?.status === 'resolved', 'authorization audit 应 resolved');
    assert(calibration?.status === 'unresolved', 'known motif calibration 应 unresolved');
    assert(generic?.status === 'unresolved', 'generic visible mapping 必须继续 unresolved');
    assert(generic.dependsOnDependencyIds.includes(auditDep.id), 'generic mapping 缺 authorization audit 依赖');
    assert(generic.dependsOnDependencyIds.includes(calibration.id), 'generic mapping 缺 calibration 依赖');
});

test('Cross-Actor Generalization、Relative Dominance、Substrate Quality 继续关闭', () => {
    const deps = depMap(synthesisFor());
    [
        'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得提前 resolved`));
});

test('Strength Synthesis 与 Assessment 继续关闭', () => {
    const output = outputFor();
    assert(output.semanticModel.strengthSynthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
});

test('生产 loader 保持同步顺序：Generalization Audit → Visible-Edge Authorization Audit', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const general = './js/bazi-contextual-force-party-relation-effect-generalization-audit.js?v=13.44.0';
    const visible = './js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js?v=13.44.0';
    assert(source.includes(general) && source.includes(visible), '生产 loader 缺新 audit');
    assert(source.indexOf(general) < source.indexOf(visible), 'Visible-Edge audit 必须在 Generalization audit 之后加载');
});

console.log(`\nVisible-Edge Effect-Type Authorization Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
