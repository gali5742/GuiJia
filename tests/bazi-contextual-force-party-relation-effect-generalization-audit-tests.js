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
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-contextual-force-party-relation-effect-generalization-source.js','js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyRelationEffectGeneralizationSource;
const auditApi = GuiJia.baziContextualForcePartyRelationEffectGeneralizationAudit;

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

test('Relation Effect Generalization Source/Audit v0.1 独立安装', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
});

test('来源审计明确拒绝 relation presence = realized effect', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.relationPresenceIsNotRealization === true, 'presence/realization 边界缺失');
    assert(contract.genericGenerationToAugmentationDefined === false, '不得提前泛化 generation→augmentation');
    assert(contract.genericRestraintToOppositionDefined === false, '不得提前泛化 restraint→opposition');
    assert(contract.genericGenerationToMediationDefined === false, '不得提前泛化 generation→mediation');
    assert(contract.genericPeerEffectDefined === false, '不得为 peer 自造 generic effect');
});

test('固定盘 generalization audit 能读取已完成的 Branch Element Relation Inventory', () => {
    const audit = synthesisFor().contextualForcePartyRelationEffectGeneralizationSourceAudit;
    assert(audit?.status === 'source-and-machine-audited-generalization-resolver-unresolved', 'audit 状态异常');
    assert(audit.machineCoverage.surfaceBranchOrdinary.inventoryComplete === true, 'branch inventory 应完整');
    assert(audit.machineCoverage.surfaceBranchOrdinary.relationCount === 6, '四支应有 6 个 unordered pair');
    assert(audit.machineCoverage.surfaceBranchOrdinary.realizationLayerAvailable === false, 'branch relation 不得伪装有 realization layer');
});

test('固定盘子亥同属水，peer relation 保持无方向且无 realized effect', () => {
    const synthesis = synthesisFor();
    const inventory = synthesis.contextualForcePartyBranchSubstrateQualityInputAdapterView.branchElementRelationInventory;
    const peer = inventory.records.find((item) => item.relationKind === 'peer' && item.participantZhis.includes('子') && item.participantZhis.includes('亥'));
    assert(peer, '应存在子亥 peer relation');
    assert(peer.directional === false && peer.direction === null, 'peer 不得伪造方向');
    assert(peer.realizedEffect === null && peer.directedCapacity === null, 'peer identity 不得自动变 effect/capacity');
});

test('visible-stem realization 与 generic Party effect type mapping 保持两层', () => {
    const audit = synthesisFor().contextualForcePartyRelationEffectGeneralizationSourceAudit;
    const visible = audit.machineCoverage.crossVisible;
    assert(visible.realizationLayerAvailable === true, 'visible edge realization layer 应存在');
    assert(visible.genericRelationEffectTypeMappingDefined === false, 'realized edge 不得自动获得 generic relation-effect type');
});

test('generalization blocker 被拆为四个可追踪 provenance gap', () => {
    const deps = depMap(synthesisFor());
    const ids = [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-BRANCH-REALIZATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION'
    ];
    ids.forEach((id) => assert(deps[id], `缺 refined dependency: ${id}`));
    assert(deps[ids[0]].status === 'unresolved', 'generic visible mapping 应 unresolved');
    assert(deps[ids[1]].status === 'unresolved', '固定盘 branch realization 应 unresolved');
});

test('Structure bridge / hidden-cross-scope 根据真实 applicability 保守设状态', () => {
    const synthesis = synthesisFor();
    const audit = synthesis.contextualForcePartyRelationEffectGeneralizationSourceAudit;
    const deps = depMap(synthesis);
    const structureExpected = audit.machineCoverage.structureScopedInteraction.realizedModifierCount > 0 ? 'unresolved' : 'resolved';
    const hiddenExpected = audit.machineCoverage.hiddenAndCrossScope.hiddenActorCount > 0 ? 'unresolved' : 'resolved';
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE'].status === structureExpected, 'Structure bridge applicability 状态错误');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION'].status === hiddenExpected, 'hidden/cross-scope applicability 状态错误');
});

test('总 Generalization 继续 unresolved，并依赖所有 refined gaps', () => {
    const deps = depMap(synthesisFor());
    const general = deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'];
    assert(general?.status === 'unresolved', 'generic resolver 不得变绿');
    [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-BRANCH-REALIZATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION'
    ].forEach((id) => assert(general.dependsOnDependencyIds.includes(id), `generalization 缺依赖 ${id}`));
});

test('known source-backed motif authorization 不因 generalization audit 被撤销或重复计力', () => {
    const synthesis = synthesisFor();
    const view = synthesis.contextualForcePartyRelationEffectView;
    const audit = synthesis.contextualForcePartyRelationEffectGeneralizationSourceAudit;
    assert(audit.knownMotifAuthorizationPreserved === true, 'known motif authorization 应保留');
    assert(view.genericRelationEffectCoverageComplete === false, 'known motifs 仍不得冒充 generic coverage');
    (view.records || []).forEach((record) => assert(record.independentForceUnit === false, 'known relation effect 不得复制 force unit'));
});

test('Branch network、directed capacity、relative dominance 与 substrate quality 继续关闭', () => {
    const synthesis = synthesisFor();
    const deps = depMap(synthesis);
    [
        'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-NETWORK-PARTY-INPUT-COVERAGE',
        'SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-DIRECTED-CAPACITY-INPUT-COVERAGE',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得提前 resolved`));
});

test('Strength Synthesis 与 Assessment 仍保持关闭', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
    assert((output.semanticModel.assessmentLayer?.assessments || []).length === 0, '不得输出最终 Assessment');
});

test('Audit/runtime 不引入 score、weight、threshold、majority 或 generic effectiveness', () => {
    const audit = synthesisFor().contextualForcePartyRelationEffectGeneralizationSourceAudit;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','priorityScore'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(audit.numericScore === null && audit.scalarForce === null && audit.actorGlobalEffectiveness === null, '不得生成 scalar/global effectiveness');
});

test('生产 handoff 在 DOM ready 后顺序加载 generalization source → audit', () => {
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    assert(source.includes('DOMContentLoaded'), '缺 post-load handoff');
    assert(source.includes('./js/bazi-contextual-force-party-relation-effect-generalization-source.js?v=13.44.0'), '缺 source loader');
    assert(source.includes('./js/bazi-contextual-force-party-relation-effect-generalization-audit.js?v=13.44.0'), '缺 audit loader');
    assert(source.indexOf('relation-effect-generalization-source.js') < source.indexOf('relation-effect-generalization-audit.js'), 'source 必须先于 audit');
});

console.log(`\nRelation Effect Generalization Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
