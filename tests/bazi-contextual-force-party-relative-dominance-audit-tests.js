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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyRelativeDominanceSource;
const auditApi = GuiJia.baziContextualForcePartyRelativeDominanceAudit;

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

test('Relative Dominance Source Audit v0.1 独立拆分 source registry 与 audit execution', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 模块未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.CONTRACT.sourceAuditOnly === true, '必须保持 source-audit-only');
});

test('“强众／强寡”证明 quantity 与 force 是两个独立限定轴', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E05');
    assert(evidence?.sourcePhrase.includes('强众') && evidence.sourcePhrase.includes('强寡'), '缺强众/强寡直证');
    assert(finding('quantity-and-force-are-separate-axes')?.value === true, 'quantity/force 分轴 finding 异常');
    assert(sourceApi.CONTRACT.quantityAndForceSeparate === true, 'contract 必须分轴');
});

test('“官星虽寡，得财星扶则强”阻断寡=弱与单条 augmentation=胜出', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E06');
    assert(evidence?.sourcePhrase.includes('官星虽寡') && evidence.sourcePhrase.includes('得财星扶则强'), '缺少数侧转强直证');
    assert(finding('minority-can-be-qualitatively-strong')?.value === true, 'minority strong finding 异常');
    assert(sourceApi.CONTRACT.memberCountIsNotDominance === true, 'member count 不得等于 dominance');
    assert(sourceApi.CONTRACT.realizedEffectPresenceIsNotDominance === true, '单条 realized effect 不得等于 dominance');
});

test('得时/失时与得势/失势继续分层，季节只作为比较上下文', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E01');
    assert(evidence?.sourcePhrase.includes('得时') && evidence.sourcePhrase.includes('得势'), '缺 time/force 分离原句');
    assert(finding('seasonal-standing-is-context-not-dominance')?.value === true, 'season finding 异常');
    assert(sourceApi.CONTRACT.seasonalStandingSeparate === true, 'season 必须独立');
});

test('“宅舍／基业／力轻力重”要求保留 foundation quality，不允许等值计数', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E03');
    assert(evidence?.sourcePhrase.includes('宅舍') && evidence.sourcePhrase.includes('力轻') && evidence.sourcePhrase.includes('力重'), '缺 foundation/force 直证');
    assert(finding('foundation-quality-must-remain-distinct')?.value === true, 'foundation finding 异常');
    assert(sourceApi.CONTRACT.numericWeights === false && sourceApi.CONTRACT.scalarForceScore === false, '不得数值化 foundation');
});

test('支干内外明暗扩大 scope，但冲拱刑合仍作为独立 interaction context', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E04');
    assert(evidence?.sourcePhrase.includes('支干内外明暗') && evidence.sourcePhrase.includes('冲起'), '缺 visible/hidden + interaction 直证');
    assert(finding('visible-hidden-scope-is-not-equal-weight')?.value === true, 'visible/hidden finding 异常');
    assert(finding('interaction-context-must-remain-distinct')?.value === true, 'interaction finding 异常');
});

test('全局生克扶抑与位置要求阻断 relation-effect record count 作为力量总分', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RD-E02');
    assert(evidence?.sourcePhrase.includes('紧贴某干') && evidence.sourcePhrase.includes('生克扶抑'), '缺 whole-chart directed context');
    assert(finding('relation-effect-count-equals-dominance')?.value === false, 'relation count 应 rejected');
    assert(sourceApi.CONTRACT.relationEffectCountIsNotDominance === true, 'contract 应阻断 relation count');
});

test('Source Audit 只冻结输入语义，不生成 side profile、comparison rule 或 dominance', () => {
    const audit = auditApi.buildAudit();
    assert(audit.status === 'source-audited-resolver-unresolved', 'audit status 异常');
    assert(audit.qualitativeSideForceProfile === null, 'side profile 不得提前出现');
    assert(audit.crossAxisPriorityRule === null && audit.compensationRule === null, 'comparison rule 不得提前出现');
    assert(audit.automaticRelativeDominanceResolver === null && audit.partyConfiguration === null, '不得越级生成 dominance/configuration');
});

test('固定验证盘：Source Audit resolved，但 Side Force Profile 与 Comparison Rule unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-SOURCE-AUDIT']?.status === 'resolved', 'source audit dependency 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE']?.status === 'unresolved', 'side force profile 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE']?.status === 'unresolved', 'comparison rule 必须 unresolved');
    assert(synthesis.contextualForcePartyRelativeDominanceSourceAudit?.status === 'source-audited-resolver-unresolved', 'synthesis 缺 source audit');
});

test('Relative Dominance Resolver 显式依赖 Side Force Profile 与 Comparison Rule', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    const dominance = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'];
    assert(dominance?.status === 'unresolved', 'dominance 必须 unresolved');
    assert(dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE'), '缺 side profile dependency');
    assert(dominance.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE'), '缺 comparison dependency');
});

test('Relation Effect generic coverage 仍是 dominance 上游 blocker，不因 Source Audit 被消除', () => {
    const deps = dependencyMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'relation effect generalization 应继续 unresolved');
    const sideProfile = deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE'];
    assert(sideProfile?.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'), 'side profile 应保留 relation generalization blocker');
});

test('固定验证盘不因 member/anchor inventory 完整而生成 relative dominance 或 Party Configuration', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-INVENTORY-COVERAGE']?.status === 'resolved', 'membership inventory 应保持 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'relative dominance 不得启动');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'Party Configuration 不得启动');
});

test('已实现 Relation Effect 只能作为 side profile 输入，不得被记录数量多数表决', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const relationView = synthesis.contextualForcePartyRelationEffectView;
    assert(relationView && Array.isArray(relationView.records), '缺 Relation Effect view');
    assert(sourceApi.CONTRACT.majorityVoting === false && sourceApi.CONTRACT.priorityAggregation === false, 'majority/priority 必须关闭');
    assert(sourceApi.CONTRACT.universalCrossAxisPriorityDefined === false, '不得有 universal priority');
});

test('Party Configuration 继续依赖 relative dominance，不生成党盛／势孤等项目结论', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    const party = deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE'];
    assert(party?.status === 'unresolved', 'party rule 必须 unresolved');
    assert(party.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'), 'party rule 缺 dominance dependency');
    assert(party.automaticClassifier === null, 'party classifier 不得出现');
});

test('Source Audit resolved 不改变 Qianli many/few、Strength Synthesis 与 Assessment 关闭态', () => {
    const model = outputFor().semanticModel;
    const deps = dependencyMap(model.strengthSynthesis);
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support quantity 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain quantity 仍应 unresolved');
    assert(model.strengthSynthesis.sufficiency?.status !== 'sufficient', 'Strength Synthesis 不得 sufficient');
    assert(model.assessmentLayer?.state === 'contract-only' && model.assessments?.length === 0, 'Assessment 必须保持关闭');
});

test('Source/Audit contract 不引入 score、weight、threshold、majority、priority、ranking 或最终强弱', () => {
    const serialized = JSON.stringify({ contract:sourceApi.CONTRACT, audit:auditApi.buildAudit() });
    assert(!/thresholdValue|scalarPartyScore|majorityResult|strengthLevel|classificationResult|priorityResult|rankingResult/.test(serialized), '出现禁止聚合字段');
    assert(sourceApi.CONTRACT.numericAggregation === false && sourceApi.CONTRACT.numericWeights === false, 'numeric guard 异常');
    assert(sourceApi.CONTRACT.majorityVoting === false && sourceApi.CONTRACT.priorityAggregation === false, 'majority/priority guard 异常');
    assert(sourceApi.CONTRACT.finalStrengthMapping === false && sourceApi.CONTRACT.finalAssessmentMapping === false, 'final mapping 必须关闭');
});

test('生产 loader 链应为 Relation Effect → Relative Dominance Audit → Source registry', () => {
    const relationText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-relation-effect.js'), 'utf8');
    const auditText = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-relative-dominance-audit.js'), 'utf8');
    assert(relationText.includes('bazi-contextual-force-party-relative-dominance-audit.js'), 'Relation Effect 未加载 Relative Dominance Audit');
    assert(auditText.includes('bazi-contextual-force-party-relative-dominance-source.js'), 'Audit 未加载 source registry');
});

console.log(`\nContextual Force Party Relative Dominance Source Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
