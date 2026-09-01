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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartyAffiliationContract;
const profileApi = GuiJia.baziContextualForcePartyAffiliationProfile;
const affiliationApi = GuiJia.baziContextualForcePartyAffiliation;
const STATES = contractApi.AFFILIATION_STATES;

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

function syntheticSynthesis(realizationState = 'realized-in-source-context', options = {}) {
    const sourceKey = options.sourceActorKey || 'visible:3:辛';
    const targetKey = options.targetActorKey || 'visible:1:丙';
    const sourceTenGod = options.sourceTenGod || '正财';
    const targetTenGod = options.targetTenGod || '正官';
    const sourceClass = options.sourceClass || 'context-dependent-unassigned';
    const targetClass = options.targetClass || 'counter-side-anchor-candidate';
    const relationScope = options.relationScope || 'cross-visible-actor';
    const functionType = options.functionType || 'generation';
    const sourcePatternId = options.hasOwnProperty('sourcePatternId') ? options.sourcePatternId : 'TEST-SOURCE-PATTERN-001';
    return {
        contextualForcePartyMembershipInventory:{
            actorProfiles:[
                { actorKey:sourceKey, membershipClasses:[sourceClass], counterAnchorIds:[] },
                { actorKey:targetKey, membershipClasses:[targetClass], counterAnchorIds:[`counter-anchor:${targetKey}`] }
            ],
            evidenceRecords:[
                { id:'PM-S', actorKey:sourceKey, tenGod:sourceTenGod },
                { id:'PM-T', actorKey:targetKey, tenGod:targetTenGod }
            ]
        },
        visibleStemFunctionRealizationRecords:[{
            id:'EDGE-001', relationScope, directed:true, sourcePatternId,
            sourceActorKey:sourceKey, targetActorKey:targetKey, functionType, realizationState
        }]
    };
}

test('Party Affiliation v0.1 独立拆分 contract、profile mapper 与 synthesis execution', () => {
    assert(contractApi?.installed && profileApi?.installed && affiliationApi?.installed, '三层模块未完整安装');
    assert(contractApi.VERSION === '0.1' && profileApi.VERSION === '0.1' && affiliationApi.VERSION === '0.1', '版本异常');
});

test('唯一 v0.1 motif 由“官星虽寡，得财星扶则强”授权，但 generic rule-family 明确未完成', () => {
    const motif = contractApi.MOTIFS[0];
    assert(contractApi.MOTIFS.length === 1, 'v0.1 应只有一个 motif');
    assert(motif.sourceEvidenceIds.includes('CF-PARTY-E10'), '缺少官星得财扶来源');
    assert(motif.sourceTenGods.includes('正财') && motif.sourceTenGods.includes('偏财'), '财星范围异常');
    assert(motif.targetTenGods.includes('正官') && motif.targetTenGods.includes('七杀'), '官杀范围异常');
    assert(contractApi.CONTRACT.genericRuleFamilyCoverageComplete === false, 'generic coverage 不得宣称完成');
});

test('固定验证盘没有 source-backed cross-visible 财生官 edge，known motif 为 not-applicable', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const view = synthesis.contextualForcePartyAffiliationView;
    assert(view.status === 'known-motif-not-applicable', 'fixed chart 应 not-applicable');
    assert(view.records.length === 0 && view.blockerRecords.length === 0, 'fixed chart 不应制造 affiliation edge');
});

test('固定验证盘 known motif coverage 可 resolved，但 generic contextual affiliation 继续 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-MODEL']?.status === 'resolved', 'affiliation model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE']?.status === 'resolved', 'known motif coverage 应 resolved/not-applicable');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION']?.status === 'unresolved', 'generic expansion 必须 unresolved');
});

test('DTS exact-source 虽有 cross-visible realized/not-realized edge，但不符合财生官 motif，不得误归党', () => {
    const synthesis = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel.strengthSynthesis;
    assert((synthesis.visibleStemFunctionRealizationRecords || []).some((item) => item.relationScope === 'cross-visible-actor'), 'DTS case 应存在 cross-visible edge');
    assert(synthesis.contextualForcePartyAffiliationView.records.length === 0, 'DTS unrelated edge 不得误匹配 motif');
});

test('synthetic：source-backed 已兑现 财→官 generation 只归附具体官星 anchor', () => {
    const view = profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context'));
    assert(view.records.length === 1 && view.affiliatedRecords.length === 1, '应生成一条 affiliation');
    const record = view.records[0];
    assert(record.affiliationState === STATES.AFFILIATED, 'realized edge 应 affiliated');
    assert(record.targetAnchorId === 'counter-anchor:visible:1:丙', 'anchor identity 异常');
    assert(record.sourcePatternId === 'TEST-SOURCE-PATTERN-001', '必须保留 source pattern');
    assert(record.actorGlobalParty === null && record.forceMagnitude === null, '不得升级为全局 party 或力量值');
});

test('synthetic：同一财星只对命中的 target anchor 归附，不传播到第二个官杀 anchor', () => {
    const synthesis = syntheticSynthesis('realized-in-source-context');
    synthesis.contextualForcePartyMembershipInventory.actorProfiles.push({ actorKey:'visible:0:丁', membershipClasses:['counter-side-anchor-candidate'], counterAnchorIds:['counter-anchor:visible:0:丁'] });
    synthesis.contextualForcePartyMembershipInventory.evidenceRecords.push({ id:'PM-T2', actorKey:'visible:0:丁', tenGod:'七杀' });
    const view = profileApi.buildAffiliationView(synthesis);
    assert(view.records.length === 1, '没有第二条 realized edge 时不得传播 affiliation');
    assert(!view.targetAnchorIds.includes('counter-anchor:visible:0:丁'), '不得传播到第二 anchor');
});

test('synthetic：明确未兑现 财→官 edge 只形成 non-affiliation-through-edge，不反向归队', () => {
    const view = profileApi.buildAffiliationView(syntheticSynthesis('not-realized-in-source-context'));
    assert(view.records.length === 1 && view.nonAffiliationRecords.length === 1, '应生成一条 non-affiliation');
    const record = view.records[0];
    assert(record.affiliationState === STATES.NOT_AFFILIATED_THROUGH_EDGE, '状态异常');
    assert(record.affiliated === false && record.blocked === false, 'not-realized 不应成为 blocker 或 affiliation');
    assert(record.actorGlobalParty === null, '不得反向赋予全局 party');
});

test('synthetic：已识别 财→官 edge 但 realization 未解时形成 blocker', () => {
    const view = profileApi.buildAffiliationView(syntheticSynthesis('unresolved'));
    assert(view.status === 'known-motif-coverage-partial', 'unresolved motif 应 partial');
    assert(view.blockerRecords.length === 1, '应有一个 blocker');
    assert(view.records[0].affiliationState === STATES.UNRESOLVED_THROUGH_EDGE, 'unresolved affiliation state 异常');
});

test('synthetic：没有 sourcePatternId 的普通五行 generation edge 必须被忽略', () => {
    const view = profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { sourcePatternId:null }));
    assert(view.records.length === 0, '无 source pattern 不得进入 affiliation');
});

test('synthetic：source 或 target 十神不匹配时不得靠 generation 关系兜底归党', () => {
    assert(profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { sourceTenGod:'食神' })).records.length === 0, '食神不得冒充财星');
    assert(profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { targetTenGod:'正印' })).records.length === 0, '印星不得冒充官杀 anchor');
});

test('synthetic：source 必须仍是 context-dependent，target 必须是 counter anchor', () => {
    assert(profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { sourceClass:'daymaster-side-seed-candidate' })).records.length === 0, '已属日主侧 seed 不应由本 motif 重归属');
    assert(profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { targetClass:'daymaster-side-seed-candidate' })).records.length === 0, 'target 非 counter anchor 不得匹配');
});

test('synthetic：daymaster-related edge 即使字段形状相同也不得进入 cross-actor affiliation', () => {
    const view = profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context', { relationScope:'daymaster-related' }));
    assert(view.records.length === 0, 'daymaster-related edge 已由 direct membership/contribution 处理，不得重复进入 affiliation');
});

test('Affiliation v0.1 不启用传递闭包、敌人的敌人或 active member count', () => {
    const contract = contractApi.CONTRACT;
    assert(contract.transitiveClosure === false && contract.enemyOfEnemyShortcut === false, '禁止传递/敌敌逻辑');
    const view = profileApi.buildAffiliationView(syntheticSynthesis('realized-in-source-context'));
    assert(view.activeMemberCount === null && view.numericScore === null, '不得生成 member count/score');
});

test('Relative Dominance 与 Party Configuration 继续依赖 generic affiliation blocker', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dominance = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'];
    const party = deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'];
    assert(dominance?.status === 'unresolved' && dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'), 'dominance blocker 异常');
    assert(party?.status === 'unresolved' && party.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'), 'party rule blocker 异常');
});

test('Affiliation 局部解析不改变 many/few、Strength Synthesis 与 Assessment 关闭态', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support many/few 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain many/few 仍应 unresolved');
    assert(model.strengthSynthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only' && model.assessments?.length === 0, 'Assessment 必须保持关闭');
});

test('Affiliation contract/view 不引入 score、weight、threshold、majority 或最终强弱', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const serialized = JSON.stringify({ contract:synthesis.contextualForcePartyAffiliationContract, view:synthesis.contextualForcePartyAffiliationView });
    assert(!/thresholdValue|scalarPartyScore|majorityResult|strengthLevel|classificationResult/.test(serialized), '出现禁止聚合字段');
    assert(contractApi.CONTRACT.numericAggregation === false && contractApi.CONTRACT.numericWeights === false, 'numeric guard 异常');
    assert(contractApi.CONTRACT.majorityVoting === false && contractApi.CONTRACT.finalStrengthMapping === false, 'majority/final guard 异常');
});

test('生产 loader 链为 Membership → Affiliation execution → contract/profile', () => {
    const membershipText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-membership.js'), 'utf8');
    const executionText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-affiliation.js'), 'utf8');
    assert(membershipText.includes('bazi-contextual-force-party-affiliation.js?v=13.44.0'), 'Membership 未加载 Affiliation execution');
    assert(executionText.includes('bazi-contextual-force-party-affiliation-contract.js?v=13.44.0'), 'execution 未加载 contract');
    assert(executionText.includes('bazi-contextual-force-party-affiliation-profile.js?v=13.44.0'), 'execution 未加载 profile');
});

console.log(`\nContextual Force Party Affiliation v0.1: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
