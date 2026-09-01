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
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyBranchSubstrateQualitySource;
const auditApi = GuiJia.baziContextualForcePartyBranchSubstrateQualityAudit;

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

test('Branch Substrate Quality v0.1 独立拆分 source registry 与 audit execution', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 两层必须安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.EVIDENCE.length === 12, `来源证据数量异常：${sourceApi.EVIDENCE.length}`);
    assert(sourceApi.INPUT_FAMILIES.length === 6, `input family 数量异常：${sourceApi.INPUT_FAMILIES.length}`);
    assert(sourceApi.FINDINGS.length === 15, `finding 数量异常：${sourceApi.FINDINGS.length}`);
});

test('来源 provenance 保留《玉井奥诀》、任氏注与《子平真诠》的不同角色', () => {
    assert(sourceApi.SOURCES.yujing.sourceRole === 'embedded-earlier-text-with-compiled-commentary', '玉井来源角色异常');
    assert(sourceApi.SOURCES.ditian.sourceRole === 'classic-with-ren-commentary', '滴天髓阐微来源角色异常');
    assert(sourceApi.SOURCES.ziping.sourceRole === 'primary-text', '子平真诠来源角色异常');
});

test('Source contract 将 substrate quality 冻结为 target-contextual，而非 branch-global state', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.substrateQualityIsTargetContextual === true, '质量必须 target-contextual');
    assert(contract.branchGlobalQualityStateDefined === false, '不得定义 branch-global quality state');
    assert(contract.branchPresenceIsQuality === false, 'branch presence 不得等于 quality');
});

test('六类 source-supported input family 完整保留且没有统一权重', () => {
    const keys = sourceApi.INPUT_FAMILIES.map((item) => item.key);
    ['covering-stem-context','branch-interaction-context','seasonal-command-and-life-state-context','branch-network-and-party-context','positional-role-context','directed-capacity-context']
        .forEach((key) => assert(keys.includes(key), `缺 input family ${key}`));
    assert(sourceApi.CONTRACT.numericWeights === false, '不得定义 numeric weights');
    assert(sourceApi.CONTRACT.universalCrossAxisPriorityDefined === false, '不得定义 universal priority');
    assert(sourceApi.CONTRACT.universalCompensationRuleDefined === false, '不得定义 compensation rule');
});

test('来源明确阻断单一季节轴、关系条数与党成员数量直接解决 quality', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.seasonalStateAloneResolvesQuality === false, 'seasonal 单轴不得解决 quality');
    assert(contract.relationCountResolvesQuality === false, 'relation count 不得解决 quality');
    assert(contract.partyMemberCountResolvesQuality === false, 'party member count 不得解决 quality');
});

test('固定验证盘 surface-branch counter anchors 建立 quality candidate，而不生成结果', () => {
    const audit = outputFor().semanticModel.strengthSynthesis.contextualForcePartyBranchSubstrateQualitySourceAudit;
    assert(audit.branchCandidates.length > 0, '应存在 branch quality candidates');
    audit.branchCandidates.forEach((record) => {
        assert(record.substrateRole === 'foundation-substrate', '必须承接 non-stem substrate role');
        assert(record.qualityScope === 'target-contextual-foundation-substrate-quality', 'quality scope 异常');
        assert(record.substrateQuality === null, '不得提前生成 substrate quality');
        assert(record.scalarQuality === null, '不得生成 scalar quality');
        assert(record.numericScore === null, '不得生成 numeric score');
    });
});

test('每个 branch candidate 都保留六类上下文要求而不折叠', () => {
    const audit = outputFor().semanticModel.strengthSynthesis.contextualForcePartyBranchSubstrateQualitySourceAudit;
    audit.branchCandidates.forEach((record) => {
        assert(record.inputFamilyKeys.length === 6, '每个 candidate 应保留六类 input family');
        assert(record.coveringStemContext.required === true, '缺覆干上下文');
        assert(record.branchInteractionContext.required === true, '缺支间交互上下文');
        assert(record.seasonalContext.required === true, '缺季节上下文');
        assert(record.branchNetworkPartyContext.required === true, '缺党势/网络上下文');
        assert(record.positionalRoleContext.required === true, '缺位置角色上下文');
        assert(record.directedCapacityContext.required === true, '缺定向作用能力上下文');
    });
});

test('Branch Substrate Quality Source Audit dependency resolved，只代表输入模型已审计', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT']?.status === 'resolved', 'source audit dependency 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-TARGET-CONTEXT-MODEL']?.status === 'resolved', 'target context model 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-INPUT-FAMILY-MODEL']?.status === 'resolved', 'input family model 应 resolved');
});

test('固定验证盘 cross-axis comparison rule 继续 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE'];
    assert(dep?.status === 'unresolved', 'cross-axis comparison 不得提前 resolved');
    assert(dep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'), '应保留 Relation Effect generalization dependency');
    assert(dep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'), '应保留 Relative Dominance dependency');
});

test('旧 Surface Branch Substrate Quality Resolver 被精确加依赖，但仍不变绿', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    const dep = deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'];
    assert(dep?.status === 'unresolved', 'substrate quality resolver 必须继续 unresolved');
    assert(dep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-SOURCE-AUDIT'), '缺 source audit dependency');
    assert(dep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-BRANCH-SUBSTRATE-QUALITY-CROSS-AXIS-COMPARISON-RULE'), '缺 cross-axis blocker');
    assert((dep.resolvedByClaimIds || []).length === 0, '不得伪造 resolved claim');
});

test('Hidden Manifestation 与 Relation Effect Generalization 仍保持独立 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-ACTOR-MANIFESTATION-CONTEXT-RESOLVER']?.status === 'unresolved', 'hidden manifestation 不得被本阶段解决');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'relation effect generalization 必须独立保留');
});

test('Foundation Coverage 与 Side Force Profile 继续 unresolved', () => {
    const deps = depMap(outputFor().semanticModel.strengthSynthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTER-FOUNDATION-CONTEXT-COVERAGE']?.status === 'unresolved', 'foundation coverage 仍应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SIDE-FORCE-PROFILE']?.status === 'unresolved', 'Side Force Profile 仍应 unresolved');
});

test('Relative Dominance、Party Configuration、many/few、Strength 与 Assessment 均不启动', () => {
    const output = outputFor();
    const synthesis = output.semanticModel.strengthSynthesis;
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'relative dominance 仍应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'Party Configuration 仍应 unresolved');
    assert(deps['SD-QIANLI-SUPPORT-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'support many/few 仍应 unresolved');
    assert(deps['SD-QIANLI-RESTRAINT-DRAIN-QUANTITY-CLASSIFICATION']?.status === 'unresolved', 'restraint/drain many/few 仍应 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength Synthesis 应继续 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应继续 contract-only');
    assert((output.semanticModel.assessmentLayer?.assessments || []).length === 0, 'Assessment 不得产生结论');
});

test('Source/Audit contract 与 runtime 不引入 score/weight/threshold/majority/ranking/classificationResult', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit:synthesis.contextualForcePartyBranchSubstrateQualitySourceAudit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','qualityScore','positionWeight'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(sourceApi.CONTRACT.numericAggregation === false, 'numericAggregation 必须 false');
    assert(sourceApi.CONTRACT.priorityAggregation === false, 'priorityAggregation 必须 false');
    assert(sourceApi.CONTRACT.relativeDominanceMapping === false, 'relativeDominanceMapping 必须 false');
});

test('生产 loader 顺序为 Non-Stem Foundation Audit → Branch Substrate Quality Audit → 独立 source registry', () => {
    const nonStemAudit = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-nonstem-foundation-audit.js'), 'utf8');
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-branch-substrate-quality-audit.js'), 'utf8');
    assert(nonStemAudit.includes('./js/bazi-contextual-force-party-branch-substrate-quality-audit.js?v=13.44.0'), 'Non-Stem Audit 尾部缺 Branch Quality audit loader');
    assert(auditSource.includes('./js/bazi-contextual-force-party-branch-substrate-quality-source.js?v=13.44.0'), 'Branch Quality Audit 缺独立 source loader');
});

console.log(`\nContextual Force Party Branch Substrate Quality Source Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
