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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const contractApi = GuiJia.baziContextualForcePartyRelationEffectContract;
const profileApi = GuiJia.baziContextualForcePartyRelationEffectProfile;
const relationApi = GuiJia.baziContextualForcePartyRelationEffect;
const TYPES = contractApi.RELATION_TYPES;
const STATES = contractApi.EFFECT_STATES;

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

function syntheticInventory() {
    const actors = [
        { actorKey:'visible:0:庚', tenGod:'偏财', membershipClasses:['context-dependent-unassigned'], counterAnchorIds:[] },
        { actorKey:'visible:1:壬', tenGod:'七杀', membershipClasses:['counter-side-anchor-candidate'], counterAnchorIds:['counter-anchor:visible:1:壬'] },
        { actorKey:'visible:3:己', tenGod:'食神', membershipClasses:['context-dependent-unassigned'], counterAnchorIds:[] },
        { actorKey:'visible:0:甲', tenGod:'正印', membershipClasses:['daymaster-side-seed-candidate'], counterAnchorIds:[] }
    ];
    return {
        actorProfiles:actors.map(({ actorKey, membershipClasses, counterAnchorIds }) => ({ actorKey, membershipClasses, counterAnchorIds })),
        evidenceRecords:actors.map(({ actorKey, tenGod }) => ({ actorKey, tenGod }))
    };
}
function edge({ id='EDGE-1', sourceActorKey, targetActorKey, functionType, realizationState='realized-in-source-context', sourcePatternId='DTS-SYNTHETIC-SOURCE-001', relationScope='cross-visible-actor' }) {
    return { id, relationScope, directed:true, sourcePatternId, sourceActorKey, targetActorKey, functionType, realizationState };
}
function syntheticAffiliationRecord(overrides = {}) {
    return {
        id:'CF-PA-SYN-01', relationRecordId:'EDGE-AUG-1', sourcePatternId:'DTS-SYNTHETIC-AUG-001',
        sourceActorKey:'visible:0:庚', targetActorKey:'visible:1:壬', targetAnchorId:'counter-anchor:visible:1:壬',
        functionType:'generation', realizationState:'realized-in-source-context', affiliationState:'affiliated-to-anchor-in-source-context',
        affiliated:true, blocked:false, ...overrides
    };
}
function syntheticSynthesis({ affiliationRecords = [], edges = [] } = {}) {
    return {
        contextualForcePartyMembershipInventory:syntheticInventory(),
        contextualForcePartyAffiliationView:{ records:affiliationRecords },
        visibleStemFunctionRealizationRecords:edges
    };
}

test('Party Relation Effect v0.1 独立拆分 contract、profile mapper 与 synthesis execution', () => {
    assert(contractApi?.installed && profileApi?.installed && relationApi?.installed, '三层模块未安装');
    assert(contractApi.VERSION === '0.1' && relationApi.VERSION === '0.1', '版本异常');
    assert(contractApi.CONTRACT.existingEdgeRequired === true && contractApi.CONTRACT.sourcePatternRequired === true, 'existing/source gate 缺失');
});

test('Contract 只登记 augmentation / opposition / mediation 三类 relation effect', () => {
    const relationTypes = contractApi.MOTIFS.map((item) => item.relationType);
    assert(relationTypes.length === 3, 'motif 数量异常');
    assert(relationTypes.includes(TYPES.ANCHOR_AUGMENTATION), '缺 augmentation');
    assert(relationTypes.includes(TYPES.ANCHOR_OPPOSITION), '缺 opposition');
    assert(relationTypes.includes(TYPES.ANCHOR_MEDIATION), '缺 mediation');
});

test('augmentation 复用既有 Affiliation relation identity，不复制第二份 membership/force unit', () => {
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ affiliationRecords:[syntheticAffiliationRecord()] }));
    assert(view.records.length === 1, 'augmentation 应只有一条 effect record');
    const record = view.records[0];
    assert(record.relationType === TYPES.ANCHOR_AUGMENTATION, '类型错误');
    assert(record.sourceIdentityType === 'party-affiliation-record' && record.sourceIdentityId === 'CF-PA-SYN-01', '未复用 affiliation identity');
    assert(record.relationRecordId === 'EDGE-AUG-1', 'relation identity 丢失');
    assert(record.reusesAffiliationIdentity === true && record.independentForceUnit === false, '不得复制力量单位');
    assert(record.relationEffectState === STATES.REALIZED, 'realized affiliation 应成为 realized augmentation');
});

test('augmentation not-realized 只记录未通过该 edge 增强，不产生反向 effect', () => {
    const record = profileApi.buildRelationEffectView(syntheticSynthesis({ affiliationRecords:[syntheticAffiliationRecord({ affiliated:false, blocked:false, realizationState:'not-realized-in-source-context', affiliationState:'not-affiliated-through-this-edge' })] })).records[0];
    assert(record.relationEffectState === STATES.NOT_REALIZED && record.realized === false, '状态错误');
    assert(record.membershipMutation === null && record.relativeDominanceEffect === null, '不得生成反向或 dominance effect');
});

test('augmentation unresolved 保持 blocker，不生成 positive effect', () => {
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ affiliationRecords:[syntheticAffiliationRecord({ affiliated:false, blocked:true, realizationState:'unresolved', affiliationState:'unresolved-affiliation-through-edge' })] }));
    assert(view.blockerRecords.length === 1, '应形成 blocker');
    assert(view.records[0].relationEffectState === STATES.UNRESOLVED && view.records[0].realized === false, 'unresolved 不得 realized');
});

test('source-backed realized 食神→七杀 restraint 只形成 anchor opposition', () => {
    const e = edge({ id:'EDGE-OPP-1', sourceActorKey:'visible:3:己', targetActorKey:'visible:1:壬', functionType:'restraint' });
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[e] }));
    assert(view.records.length === 1, '应识别一条 opposition');
    const record = view.records[0];
    assert(record.relationType === TYPES.ANCHOR_OPPOSITION && record.anchorActorKey === 'visible:1:壬', 'anchor opposition 方向错误');
    assert(record.opposingActorKey === 'visible:3:己', 'opposing actor 错误');
    assert(record.relationEffectState === STATES.REALIZED, 'realized edge 应形成 realized opposition');
    assert(record.membershipMutation === null && record.actorGlobalParty === null, 'opposition 不得改 membership');
    assert(record.daymasterBenefit === null, '不能仅由 restraint edge 泛化扶身 outcome');
});

test('食神→七杀 not-realized 不反向变成扶杀或 membership', () => {
    const e = edge({ id:'EDGE-OPP-2', sourceActorKey:'visible:3:己', targetActorKey:'visible:1:壬', functionType:'restraint', realizationState:'not-realized-in-source-context' });
    const record = profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[e] })).records[0];
    assert(record.relationEffectState === STATES.NOT_REALIZED, 'not-realized 状态错误');
    assert(record.realized === false && record.membershipMutation === null && record.relativeDominanceEffect === null, '不得生成反向关系');
});

test('source-backed realized 七杀→印 generation 只形成 mediation，并保留杀→印方向', () => {
    const e = edge({ id:'EDGE-MED-1', sourceActorKey:'visible:1:壬', targetActorKey:'visible:0:甲', functionType:'generation' });
    const record = profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[e] })).records[0];
    assert(record.relationType === TYPES.ANCHOR_MEDIATION, '应为 mediation');
    assert(record.anchorActorKey === 'visible:1:壬' && record.mediatorActorKey === 'visible:0:甲', 'anchor/mediator 错误');
    assert(record.sourceActorKey === 'visible:1:壬' && record.targetActorKey === 'visible:0:甲', '不得反写 edge direction');
    assert(record.relationEffectState === STATES.REALIZED, 'realized mediation 状态错误');
    assert(record.membershipMutation === null && record.actorGlobalParty === null, 'mediation 不得 party switch');
});

test('七杀→印 not-realized 不反写为印→杀', () => {
    const e = edge({ id:'EDGE-MED-2', sourceActorKey:'visible:1:壬', targetActorKey:'visible:0:甲', functionType:'generation', realizationState:'not-realized-in-source-context' });
    const record = profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[e] })).records[0];
    assert(record.relationEffectState === STATES.NOT_REALIZED, 'not-realized 状态错误');
    assert(record.sourceActorKey === 'visible:1:壬' && record.targetActorKey === 'visible:0:甲', '方向被改写');
    assert(record.realized === false, 'not-realized 不得形成 effect');
});

test('没有 sourcePatternId 的普通十神/五行 edge 必须被忽略', () => {
    const opposition = edge({ sourceActorKey:'visible:3:己', targetActorKey:'visible:1:壬', functionType:'restraint', sourcePatternId:null });
    const mediation = edge({ id:'EDGE-NO-SOURCE-2', sourceActorKey:'visible:1:壬', targetActorKey:'visible:0:甲', functionType:'generation', sourcePatternId:null });
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[opposition, mediation] }));
    assert(view.records.length === 0 && view.status === 'known-relation-effect-motifs-not-applicable', '不得靠 shape 自造 relation effect');
});

test('daymaster-related edge 即使十神与 function shape 相同也不得进入 cross-actor effect', () => {
    const e = edge({ sourceActorKey:'visible:3:己', targetActorKey:'visible:1:壬', functionType:'restraint', relationScope:'daymaster-related' });
    assert(profileApi.buildRelationEffectView(syntheticSynthesis({ edges:[e] })).records.length === 0, 'daymaster edge 不得进入');
});

test('membership role 不匹配时不得靠十神 shape 兜底', () => {
    const synthesis = syntheticSynthesis({ edges:[edge({ sourceActorKey:'visible:3:己', targetActorKey:'visible:1:壬', functionType:'restraint' })] });
    synthesis.contextualForcePartyMembershipInventory.actorProfiles = synthesis.contextualForcePartyMembershipInventory.actorProfiles.map((item) =>
        item.actorKey === 'visible:1:壬' ? { ...item, membershipClasses:['context-dependent-unassigned'], counterAnchorIds:[] } : item
    );
    assert(profileApi.buildRelationEffectView(synthesis).records.length === 0, 'target 非 counter anchor 不得映射 opposition');
});

test('同一 augmentation raw edge 与 Affiliation record 并存时只由 Affiliation identity 生成一次', () => {
    const raw = edge({ id:'EDGE-AUG-1', sourceActorKey:'visible:0:庚', targetActorKey:'visible:1:壬', functionType:'generation' });
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ affiliationRecords:[syntheticAffiliationRecord()], edges:[raw] }));
    assert(view.records.length === 1, 'augmentation 不得 raw + affiliation 双生成');
    assert(view.records[0].sourceIdentityType === 'party-affiliation-record', '应以 affiliation record 为 authority');
});

test('固定验证盘 Relation Effect model/known coverage resolved，但 generalization 继续 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(synthesis.contextualForcePartyRelationEffectView?.status === 'known-relation-effect-motifs-not-applicable', '固定盘应 not-applicable');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL']?.status === 'resolved', 'model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-KNOWN-MOTIF-COVERAGE']?.status === 'resolved', 'known coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'generalization 必须 unresolved');
});

test('DTS 既有 cross-visible realized/not-realized edge 不匹配三类 motif 时不得误生成 effect', () => {
    const synthesis = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel.strengthSynthesis;
    assert((synthesis.visibleStemFunctionRealizationRecords || []).some((item) => item.relationScope === 'cross-visible-actor' && item.sourcePatternId), 'DTS 应有 source-backed cross-visible edge');
    assert(synthesis.contextualForcePartyRelationEffectView?.records.length === 0, '不匹配 motif 不得生成 relation effect');
});

test('旧 generic affiliation blocker 收窄为 augmentation-affiliation generalization，仍保持 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION'];
    assert(dep?.status === 'unresolved', 'generic affiliation 仍应 unresolved');
    assert(dep.scope === 'contextual-force-party-anchor-augmentation-affiliation-generalization', 'scope 未收窄');
    assert(dep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'), '应依赖 relation-effect generalization');
});

test('Relative Dominance 与 Party Configuration 改为显式消费 Relation Effect，但仍 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dominance = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'];
    const party = deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'];
    assert(dominance?.status === 'unresolved' && dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL'), 'dominance 未接 relation effect');
    assert(party?.status === 'unresolved' && party.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'), 'party config 未接 generalization');
});

test('Relation Effect 完成不改变 many/few、Strength Synthesis 与 Assessment 关闭态', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support quantity 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain quantity 仍应 unresolved');
    assert(model.strengthSynthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only' && model.assessments?.length === 0, 'Assessment 必须保持关闭');
});

test('Contract/View 不引入 score、weight、threshold、majority、priority、active member count 或最终强弱', () => {
    const view = profileApi.buildRelationEffectView(syntheticSynthesis({ affiliationRecords:[syntheticAffiliationRecord()] }));
    const serialized = JSON.stringify({ contract:contractApi.CONTRACT, view });
    assert(!/thresholdValue|scalarPartyScore|majorityResult|strengthLevel|classificationResult|priorityResult/.test(serialized), '出现禁止聚合字段');
    assert(contractApi.CONTRACT.numericAggregation === false && contractApi.CONTRACT.numericWeights === false, 'numeric guard 异常');
    assert(contractApi.CONTRACT.majorityVoting === false && contractApi.CONTRACT.priorityAggregation === false, 'majority/priority guard 异常');
    assert(view.activeMemberCount === null && view.numericScore === null && view.scalarForce === null, 'view 不得生成数值/成员计数');
    assert(contractApi.CONTRACT.finalStrengthMapping === false, 'final strength mapping 必须关闭');
});

test('生产 loader 链为 Expansion Audit → Relation Effect execution → contract/profile', () => {
    const auditText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-affiliation-expansion-audit.js'), 'utf8');
    const executionText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-relation-effect.js'), 'utf8');
    assert(auditText.includes('bazi-contextual-force-party-relation-effect.js?v=13.44.0'), 'Expansion Audit 未加载 Relation Effect');
    assert(executionText.includes('bazi-contextual-force-party-relation-effect-contract.js?v=13.44.0'), 'execution 未加载 contract');
    assert(executionText.includes('bazi-contextual-force-party-relation-effect-profile.js?v=13.44.0'), 'execution 未加载 profile');
});

console.log(`\nContextual Force Party Cross-Actor Relation Effect v0.1: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
