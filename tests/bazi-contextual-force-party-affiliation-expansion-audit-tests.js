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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyAffiliationExpansionSource;
const auditApi = GuiJia.baziContextualForcePartyAffiliationExpansionAudit;
const TYPES = sourceApi.RELATION_TYPES;

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
function finding(key) { return sourceApi.FINDINGS.find((item) => item.key === key); }

test('Affiliation Expansion Source Audit v0.2 独立拆分 source registry 与 audit execution', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 模块未安装');
    assert(sourceApi.VERSION === '0.2' && auditApi.VERSION === '0.2', '版本异常');
    assert(sourceApi.CONTRACT.sourceAuditOnly === true, '必须保持 source-audit-only');
});

test('来源 taxonomy 明确拆为 augmentation / opposition / mediation 三类', () => {
    assert(Object.values(TYPES).length === 3, 'relation type 数量异常');
    assert(TYPES.ANCHOR_AUGMENTATION === 'anchor-augmentation', 'augmentation 类型异常');
    assert(TYPES.ANCHOR_OPPOSITION === 'anchor-opposition', 'opposition 类型异常');
    assert(TYPES.ANCHOR_MEDIATION === 'anchor-mediation', 'mediation 类型异常');
});

test('“财星滋杀／财星党杀”支持 anchor augmentation，但不是 actor-global party', () => {
    const evidence = sourceApi.EVIDENCE.filter((item) => item.relationType === TYPES.ANCHOR_AUGMENTATION);
    assert(evidence.some((item) => item.sourcePhrase.includes('财星滋杀')), '缺财星滋杀证据');
    assert(evidence.some((item) => item.sourcePhrase.includes('财星党杀')), '缺财星党杀证据');
    assert(finding('wealth-to-officer-killer-affiliation-semantics')?.status === 'supported-with-context', 'augmentation finding 异常');
    assert(sourceApi.CONTRACT.actorGlobalPartyFromRelation === false, '不得升级全局 party');
});

test('“食神制杀”只授权 opposition，不授权日主侧 membership', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.sourcePhrase.includes('食神制杀'));
    assert(evidence?.relationType === TYPES.ANCHOR_OPPOSITION, '食神制杀应为 opposition');
    assert(finding('output-restrains-killer-equals-daymaster-membership')?.value === false, '不得把制杀等同 membership');
    assert(sourceApi.CONTRACT.oppositionIsNotAffiliation === true, 'contract 应明确 opposition != affiliation');
});

test('“制杀扶身”只说明 outcome 可扶身，不把 actor 身份改写成日主党', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.sourcePhrase.includes('制杀扶身'));
    assert(evidence?.relationType === TYPES.ANCHOR_OPPOSITION, '制杀扶身仍应归 opposition');
    assert(finding('opposition-benefit-equals-affiliation')?.value === false, 'benefit 不得等于 affiliation');
    assert(sourceApi.CONTRACT.benefitToDaymasterIsNotMembership === true, 'contract 缺 outcome/member 分离');
});

test('“印绶化杀”被建模为 mediation，不与制杀混同', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.sourcePhrase.includes('印绶化杀'));
    assert(evidence?.relationType === TYPES.ANCHOR_MEDIATION, '印绶化杀应为 mediation');
    assert(sourceApi.CONTRACT.mediationIsNotAffiliation === true, 'mediation 不得变 affiliation');
    assert(sourceApi.CONTRACT.mediationIsNotOpposition === true, 'mediation 不得变 opposition');
});

test('“杀印相生／七杀来生印”要求保留官杀→印的 directed edge', () => {
    const evidence = sourceApi.EVIDENCE.filter((item) => item.relationType === TYPES.ANCHOR_MEDIATION);
    assert(evidence.some((item) => item.sourcePhrase.includes('杀印相生')), '缺杀印相生证据');
    assert(evidence.some((item) => item.sourcePhrase.includes('七杀皆来生拱')), '缺七杀生印命例证据');
    assert(finding('anchor-mediation-preserves-edge-direction')?.value === true, '应要求保留 edge direction');
    assert(sourceApi.CONTRACT.edgeDirectionMustBePreserved === true, 'contract 缺方向 guard');
});

test('source audit 明确拒绝“敌人的敌人=我方成员”与传递闭包', () => {
    assert(finding('enemy-of-enemy-membership-shortcut')?.value === false, 'enemy-of-enemy 应 rejected');
    assert(sourceApi.CONTRACT.enemyOfEnemyShortcut === false, 'contract 应禁 enemy-of-enemy');
    assert(sourceApi.CONTRACT.transitiveClosure === false, 'contract 应禁 transitive closure');
});

test('Audit view 只输出 relation taxonomy，不产生 resolver、partyConfiguration 或数值', () => {
    const audit = auditApi.buildAudit();
    assert(audit.status === 'source-audited-generic-resolver-unresolved', 'audit status 异常');
    assert(audit.genericAffiliationExpansionResolver === null, 'generic resolver 不得出现');
    assert(audit.relativeDominanceResolver === null && audit.partyConfiguration === null, '不得越级生成 dominance/configuration');
    assert(audit.numericScore === null && audit.scalarForce === null, '不得数值化');
});

test('Audit view 对三类关系分别冻结不同 execution authorization', () => {
    const types = auditApi.buildAudit().relationTypes;
    assert(types.anchorAugmentation.executionAuthorization === 'existing-target-specific-realized-edge-required', 'augmentation gate 异常');
    assert(types.anchorOpposition.executionAuthorization === 'no-affiliation-mapping-authorized', 'opposition 不得授权 affiliation');
    assert(types.anchorMediation.executionAuthorization === 'no-affiliation-mapping-authorized', 'mediation 不得授权 affiliation');
});

test('固定验证盘 Relation Taxonomy resolved，但 generic affiliation expansion 继续 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY']?.status === 'resolved', 'taxonomy dependency 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONTEXTUAL-AFFILIATION-EXPANSION']?.status === 'unresolved', 'generic expansion 必须 unresolved');
    assert(synthesis.contextualForcePartyAffiliationExpansionSourceAudit?.status === 'source-audited-generic-resolver-unresolved', 'synthesis 缺 audit');
});

test('v0.2 source audit 不改变既有“财生官” known motif coverage', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(synthesis.contextualForcePartyAffiliationView?.status === 'known-motif-not-applicable', 'fixed chart affiliation view 应保持原状');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-KNOWN-MOTIF-COVERAGE']?.status === 'resolved', 'known motif coverage 应保持 resolved/not-applicable');
});

test('Relative Dominance 与 Party Configuration 显式依赖 relation taxonomy 但仍 unresolved', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dominance = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'];
    const party = deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'];
    assert(dominance?.status === 'unresolved' && dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY'), 'dominance dependency 异常');
    assert(party?.status === 'unresolved' && party.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-AFFILIATION-RELATION-TAXONOMY'), 'party dependency 异常');
});

test('Audit resolved 不改变 Qianli many/few、Strength Synthesis 与 Assessment 关闭态', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support quantity 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain quantity 仍应 unresolved');
    assert(model.strengthSynthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only' && model.assessments?.length === 0, 'Assessment 必须保持关闭');
});

test('Source/Audit contract 不引入 score、weight、threshold、majority、priority 或最终强弱', () => {
    const serialized = JSON.stringify({ contract:sourceApi.CONTRACT, audit:auditApi.buildAudit() });
    assert(!/thresholdValue|scalarPartyScore|majorityResult|strengthLevel|classificationResult|priorityResult/.test(serialized), '出现禁止聚合字段');
    assert(sourceApi.CONTRACT.numericAggregation === false && sourceApi.CONTRACT.numericWeights === false, 'numeric guard 异常');
    assert(sourceApi.CONTRACT.majorityVoting === false && sourceApi.CONTRACT.priorityAggregation === false, 'majority/priority guard 异常');
    assert(sourceApi.CONTRACT.finalStrengthMapping === false, 'final strength mapping 必须关闭');
});

test('生产 loader 链为 Affiliation → Expansion Audit → Source registry', () => {
    const affiliationText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-affiliation.js'), 'utf8');
    const auditText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-affiliation-expansion-audit.js'), 'utf8');
    assert(affiliationText.includes('bazi-contextual-force-party-affiliation-expansion-audit.js?v=13.44.0'), 'Affiliation 未加载 Expansion Audit');
    assert(auditText.includes('bazi-contextual-force-party-affiliation-expansion-source.js?v=13.44.0'), 'Audit 未加载 source registry');
});

console.log(`\nContextual Force Party Affiliation Expansion Source Audit v0.2: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
