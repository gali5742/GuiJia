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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartyMembershipContract;
const profileApi = GuiJia.baziContextualForcePartyMembershipProfile;
const membershipApi = GuiJia.baziContextualForcePartyMembership;
const CLASSES = contractApi.MEMBERSHIP_CLASSES;

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
function dependencyMap(synthesis) { return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item])); }
function fixedInventory() { return outputFor().semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory; }

test('Party Membership v0.1 独立拆分 contract、profile mapper 与 synthesis execution', () => {
    assert(contractApi?.installed && profileApi?.installed && membershipApi?.installed, '三层模块未完整安装');
    assert(contractApi.VERSION === '0.1' && profileApi.VERSION === '0.1' && membershipApi.VERSION === '0.1', '版本异常');
    assert(contractApi.CONTRACT.resolverScope === 'direct-seed-affiliation-only', 'resolver scope 异常');
});

test('合同明确 candidate 不等于 active member，并禁止把所有压力 actor 合成一个对立党', () => {
    const c = contractApi.CONTRACT;
    assert(c.membershipCandidateIsNotRealizedMember && c.allPressureActorsDoNotFormOneParty, 'candidate/member 或 pressure-party 边界未锁定');
    assert(c.drainDoesNotImplyCounterSide && c.distributionDoesNotImplyCounterSide, '泄/被分不得自动归 counter side');
});

test('固定验证盘 direct-seed inventory 完整，但不产生 active party membership', () => {
    const i = fixedInventory();
    assert(i.status === 'direct-seed-mapping-complete' && i.unresolvedActorKeys.length === 0, 'fixed inventory 应 complete');
    assert(i.partyConfiguration === null && i.activeMemberCount === null, '不得生成 party configuration/member count');
});

test('固定盘年干丁比肩只形成日主侧 seed candidate，realization 未解也不妨碍身份分类', () => {
    const a = fixedInventory().actorProfiles.find((x) => x.actorKey === 'visible:0:丁');
    assert(a?.membershipClasses.includes(CLASSES.DAYMASTER_SIDE), '丁应为 daymaster-side seed');
    assert(a.realizedMember === null, 'seed 不得直接 realized');
    assert(a.contributionQualifiers.some((x) => x.contributionState === 'unresolved-daymaster-contribution'), '应保留 contribution qualifier');
});

test('固定盘月干壬直接克日主，只建立独立 counter-side anchor candidate', () => {
    const a = fixedInventory().actorProfiles.find((x) => x.actorKey === 'visible:1:壬');
    assert(a?.membershipClasses.includes(CLASSES.COUNTER_SIDE_ANCHOR), '壬应为 counter anchor');
    assert(a.counterAnchorIds.includes('counter-anchor:visible:1:壬') && a.realizedMember === null, 'anchor identity/realization 异常');
});

test('固定盘时干己为我生，保持 context-dependent，不得因泄力自动归对立党', () => {
    const a = fixedInventory().actorProfiles.find((x) => x.actorKey === 'visible:3:己');
    assert(a?.membershipClasses.includes(CLASSES.CONTEXT_DEPENDENT), '己应 context-dependent');
    assert(!a.membershipClasses.includes(CLASSES.COUNTER_SIDE_ANCHOR), '泄力 actor 不得归 counter side');
});

test('固定盘子、亥表层水可作为直接 restraint counter anchors，但不因数量合并成一个党', () => {
    const i = fixedInventory();
    const zi = i.actorProfiles.find((x) => x.actorKey === 'surface-branch:1:子');
    const hai = i.actorProfiles.find((x) => x.actorKey === 'surface-branch:2:亥');
    assert(zi?.membershipClasses.includes(CLASSES.COUNTER_SIDE_ANCHOR) && hai?.membershipClasses.includes(CLASSES.COUNTER_SIDE_ANCHOR), '子亥应分别为 counter anchor');
    assert(zi.counterAnchorIds[0] !== hai.counterAnchorIds[0] && i.relativeDominance === null, '不得合并 anchor 或提前判 dominance');
});

test('固定盘亥中甲印作为 hidden support 进入日主侧 candidate，但不换算权重', () => {
    const a = fixedInventory().actorProfiles.find((x) => x.actorKey?.startsWith('hidden:2:亥:甲:'));
    assert(a?.membershipClasses.includes(CLASSES.DAYMASTER_SIDE), '亥中甲应为 daymaster-side candidate');
    assert(a.numericWeight === null, 'hidden candidate 不得有 numeric weight');
});

test('固定盘丑土泄、酉金被分均保持 context-dependent，不组成统一 pressure party', () => {
    const i = fixedInventory();
    const chou = i.actorProfiles.find((x) => x.actorKey === 'surface-branch:0:丑');
    const you = i.actorProfiles.find((x) => x.actorKey === 'surface-branch:3:酉');
    assert(chou?.membershipClasses.includes(CLASSES.CONTEXT_DEPENDENT) && you?.membershipClasses.includes(CLASSES.CONTEXT_DEPENDENT), '丑酉应 context-dependent');
    assert(!chou.counterAnchorIds.length && !you.counterAnchorIds.length, '泄/被分不得生成 counter anchor');
});

test('synthetic：同一 actor 同时是根基与扶助时合并 identity，不重复制造 member', () => {
    const profile = { axes:{
        rootFoundation:{ exactRoot:{ actorKeys:['hidden:0:寅:甲:0'] }, sameElementRoot:{ actorKeys:[] } },
        alliedSupport:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[{ id:'H1', actorKey:'hidden:0:寅:甲:0', scope:'hidden-modifier', relationToDayMaster:'peer-support' }], projectContributionRecords:[] },
        incomingRestraint:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[], projectContributionRecords:[] },
        outboundDrain:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[], projectContributionRecords:[] },
        outboundDistribution:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[], projectContributionRecords:[] }
    }};
    const a = profileApi.buildMembershipInventory({ contextualForceEvidenceProfile:profile }).actorProfiles.find((x) => x.actorKey === 'hidden:0:寅:甲:0');
    assert(a?.evidenceRecordIds.length === 2, '应保存 root + support 两条 evidence');
    assert(a.membershipClasses.length === 1 && a.membershipClasses[0] === CLASSES.DAYMASTER_SIDE, '同侧多语义不得重复 member identity');
});

test('synthetic：同一 actor 出现互斥 seed class 时显式 unresolved，不做 last-write-wins', () => {
    const profile = { axes:{
        rootFoundation:{ exactRoot:{ actorKeys:[] }, sameElementRoot:{ actorKeys:[] } },
        alliedSupport:{ sourceSurfaceCandidates:[{ id:'S1', actorKey:'visible:0:甲', scope:'surface-stem' }], hiddenModifierCandidates:[], projectContributionRecords:[] },
        incomingRestraint:{ sourceSurfaceCandidates:[{ id:'R1', actorKey:'visible:0:甲', scope:'surface-stem' }], hiddenModifierCandidates:[], projectContributionRecords:[] },
        outboundDrain:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[], projectContributionRecords:[] },
        outboundDistribution:{ sourceSurfaceCandidates:[], hiddenModifierCandidates:[], projectContributionRecords:[] }
    }};
    const i = profileApi.buildMembershipInventory({ contextualForceEvidenceProfile:profile });
    const a = i.actorProfiles.find((x) => x.actorKey === 'visible:0:甲');
    assert(a?.membershipClass === 'multi-role-unresolved', '互斥 seed class 必须 unresolved');
    assert(i.status === 'direct-seed-mapping-partial' && i.unresolvedActorKeys.includes('visible:0:甲'), 'coverage 应 partial');
});

test('Synthesis 中 Membership Resolver 与 inventory coverage 可 resolved，但跨 actor 扩党继续 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER']?.status === 'resolved', 'membership resolver 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE']?.status === 'resolved', 'inventory coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION']?.status === 'unresolved', 'cross-actor expansion 必须 unresolved');
});

test('Relative Dominance 与 Party Configuration 继续被跨 actor affiliation 阻断', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dominance = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'];
    assert(dominance?.status === 'unresolved' && dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'), 'relative dominance blocker 异常');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party configuration 必须 unresolved');
});

test('Membership 完成不改变 many/few、Strength Synthesis 与 Assessment 阻断', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support many/few 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain many/few 仍应 unresolved');
    assert(synthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only', 'Assessment layer 必须保持 contract-only');
    assert(Array.isArray(model.assessments) && model.assessments.length === 0, 'Assessment records 必须保持为空');
});

test('Membership contract / inventory 不引入 score、weight、threshold、majority 或最终强弱', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({ contract:synthesis.contextualForcePartyMembershipContract, inventory:synthesis.contextualForcePartyMembershipInventory });
    assert(!/"numericScore"\s*:\s*[^n]/.test(serialized), 'numericScore 不得有值');
    assert(!/thresholdValue|scalarPartyScore|majorityResult|strengthLevel|classificationResult/.test(serialized), '出现禁止聚合字段');
    assert(contractApi.CONTRACT.numericAggregation === false && contractApi.CONTRACT.majorityVoting === false && contractApi.CONTRACT.finalStrengthMapping === false, '聚合 guard 异常');
});

test('生产 loader 链为 Party Audit → Membership execution → contract/profile', () => {
    const auditText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-audit.js'), 'utf8');
    const executionText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-membership.js'), 'utf8');
    assert(auditText.includes('bazi-contextual-force-party-membership.js?v=13.44.0'), 'Party Audit 未加载 Membership execution');
    assert(executionText.includes('bazi-contextual-force-party-membership-contract.js?v=13.44.0'), 'execution 未加载 contract');
    assert(executionText.includes('bazi-contextual-force-party-membership-profile.js?v=13.44.0'), 'execution 未加载 profile');
});

console.log(`\nContextual Force Party Membership v0.1: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
