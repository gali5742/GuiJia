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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyNonStemFoundationSource;
const auditApi = GuiJia.baziContextualForcePartyNonStemFoundationAudit;

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

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Non-Stem Foundation v0.1 独立拆分 source registry 与 audit execution', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 两层必须安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.EVIDENCE.length === 7, `来源证据数量异常：${sourceApi.EVIDENCE.length}`);
    assert(sourceApi.FINDINGS.length === 13, `finding 数量异常：${sourceApi.FINDINGS.length}`);
});

test('来源 provenance 区分《子平真诠》原典、《玉井奥诀》所录早期文本与任氏注', () => {
    assert(sourceApi.SOURCES.ziping.sourceRole === 'primary-text', '子平真诠应标 primary-text');
    assert(sourceApi.SOURCES.yujing.sourceRole === 'embedded-earlier-text-with-compiled-commentary', '玉井来源角色异常');
    assert(sourceApi.SOURCES.ditian.sourceRole === 'classic-with-ren-commentary', '滴天髓阐微来源角色异常');
});

test('Source contract 冻结“支为 foundation substrate”，明确拒绝 surface branch 套 stem root resolver', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.nonStemRoleSemanticsResolved === true, 'non-stem role semantics 应 resolved');
    assert(contract.surfaceBranchIsFoundationSubstrate === true, 'surface branch 应为 foundation substrate');
    assert(contract.surfaceBranchStemRootResolverApplicable === false, 'surface branch 不得套 stem root resolver');
    assert(contract.branchPresenceIsSubstrateQuality === false, 'branch presence 不得等于 substrate quality');
});

test('Source contract 将 hidden containment 与 self-root / manifestation 分开', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.hiddenActorIsLatentContainedContent === true, 'hidden actor 应为 latent contained content');
    assert(contract.hiddenActorStemRootResolverApplicable === false, 'hidden actor 不得套 stem root resolver');
    assert(contract.hiddenContainmentIsSelfRoot === false, 'containment 不得等于 self-root');
    assert(contract.hiddenPresenceIsManifestation === false, 'hidden presence 不得等于 manifestation');
    assert(contract.containmentDoubleCountAllowed === false, '不得重复计 containment');
});

test('固定验证盘 surface-branch counter anchors 被解析为 substrate role，而不是 self-root actor', () => {
    const audit = outputFor().semanticModel.strengthSynthesis.contextualForcePartyNonStemFoundationSourceAudit;
    assert(audit.surfaceBranchRecords.length > 0, '固定盘应存在 surface-branch counter anchors');
    audit.surfaceBranchRecords.forEach((record) => {
        assert(record.semanticRole === 'foundation-substrate', 'branch semanticRole 异常');
        assert(record.stemRootResolverApplicable === false, 'branch 不得套 stem root resolver');
        assert(record.selfRootPresence === null, 'branch 不得伪造 self-root presence');
        assert(record.substrateRoleResolved === true, 'branch substrate role 应 resolved');
        assert(record.substrateQuality === null, 'branch substrate quality 必须继续为空');
    });
});

test('固定验证盘 hidden counter actors 被解析为 latent content，不把“藏于本支”重复记为 root', () => {
    const audit = outputFor().semanticModel.strengthSynthesis.contextualForcePartyNonStemFoundationSourceAudit;
    assert(audit.hiddenActorRecords.length > 0, '固定盘应存在 hidden counter actors');
    audit.hiddenActorRecords.forEach((record) => {
        assert(record.semanticRole === 'latent-contained-content', 'hidden semanticRole 异常');
        assert(record.stemRootResolverApplicable === false, 'hidden 不得套 stem root resolver');
        assert(record.containmentIsSelfRoot === false, 'hidden containment 不得等于 self-root');
        assert(record.containmentRelationPreserved === true, '应保留 containment identity');
        assert(record.manifestationState === null, '不得伪造 manifestation state');
    });
});

test('“支为干之生地”被建模为 directed foundation relation，不压成 branch-global root label', () => {
    const findings = sourceApi.FINDINGS;
    const directed = findings.find((item) => item.key === 'foundation-relation-is-directed-stem-to-branch');
    const multi = findings.find((item) => item.key === 'same-branch-may-support-multiple-stem-foundation-relations');
    assert(directed?.status === 'supported' && directed.value === true, '缺 directed foundation finding');
    assert(multi?.status === 'supported' && multi.value === true, '缺 multi-stem branch foundation finding');
});

test('现有 Counter Context blocker 不被 source audit 伪装成 resolver：branch/hidden foundation 仍 unresolved', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const branch = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.sourceScopes.includes('surface-branch'));
    const hidden = synthesis.contextualForcePartyCounterContextView.records.find((record) => record.actorIdentity.sourceScopes.includes('hidden-modifier'));
    assert(branch?.foundationContext.status === 'unresolved-surface-branch-foundation-scope', 'branch foundation blocker 不应被直接删除');
    assert(hidden?.foundationContext.status === 'unresolved-hidden-actor-foundation-scope', 'hidden foundation blocker 不应被直接删除');
});

test('Non-Stem Foundation Source Audit dependency resolved，但只代表角色语义已厘清', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'];
    assert(dep?.status === 'resolved', 'source audit dependency 应 resolved');
    assert(dep.resolvedByClaimIds.includes('SC-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'), 'source audit 缺 resolved claim');
});

test('固定验证盘 branch substrate quality resolver 保持 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'];
    assert(dep?.status === 'unresolved', 'branch substrate quality resolver 不得提前 resolved');
    assert((dep.resolvedByClaimIds || []).length === 0, 'branch quality resolver 不得伪造 resolved claim');
});

test('固定验证盘 hidden manifestation context resolver 保持 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-MANIFESTATION-CONTEXT-RESOLVER'];
    assert(dep?.status === 'unresolved', 'hidden manifestation resolver 不得提前 resolved');
    assert((dep.resolvedByClaimIds || []).length === 0, 'hidden manifestation resolver 不得伪造 resolved claim');
});

test('Foundation coverage blocker 被语义化收窄为 substrate quality / manifestation，而不是 generic non-stem root', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    const coverage = deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE'];
    assert(coverage?.status === 'unresolved', 'foundation coverage 仍应 unresolved');
    assert(coverage.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-NONSTEM-FOUNDATION-SOURCE-AUDIT'), 'coverage 缺 source audit dependency');
    assert(coverage.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'), 'coverage 缺 branch substrate quality blocker');
    assert(coverage.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-MANIFESTATION-CONTEXT-RESOLVER'), 'coverage 缺 hidden manifestation blocker');
});

test('Side Force Profile 与 Relation Effect Generalization 继续各自 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE']?.status === 'unresolved', 'Side Force Profile 不得因 source audit 变绿');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'Relation Effect generalization 必须独立保留');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-QUALITATIVE-FORCE-COMPARISON-RULE']?.status === 'unresolved', 'comparison rule 仍应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'relative dominance 仍应 unresolved');
});

test('Source Audit 不生成 Party Configuration、many/few、Strength 或 Assessment', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'Party Configuration 仍应 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support many/few 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain many/few 仍应 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
    assert((output.semanticModel.assessmentLayer?.assessments || []).length === 0, 'Assessment 不得产生结论');
});

test('Source/Audit contract 与 runtime 不引入 score/weight/threshold/majority/ranking/root self-count', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit:synthesis.contextualForcePartyNonStemFoundationSourceAudit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','rootCount','selfRootCount'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(sourceApi.CONTRACT.numericWeights === false, 'numericWeights 必须 false');
    assert(sourceApi.CONTRACT.numericAggregation === false, 'numericAggregation 必须 false');
    assert(sourceApi.CONTRACT.relativeDominanceMapping === false, 'relativeDominanceMapping 必须 false');
});

test('生产 loader 顺序为 Counter Context → Non-Stem Foundation Audit，source registry 由 audit 独立加载', () => {
    const counterSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-counter-context.js'), 'utf8');
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-nonstem-foundation-audit.js'), 'utf8');
    assert(counterSource.includes('./js/bazi-contextual-force-party-nonstem-foundation-audit.js?v=13.44.0'), 'Counter Context 尾部缺 audit loader');
    assert(auditSource.includes('./js/bazi-contextual-force-party-nonstem-foundation-source.js?v=13.44.0'), 'Audit 缺独立 source loader');
});

console.log(`\nContextual Force Party Non-Stem Foundation Source Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
