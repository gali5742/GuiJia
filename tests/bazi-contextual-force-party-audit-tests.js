#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor', 'lunar.js'));
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

function loadScripts(relativeFiles) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    relativeFiles.forEach((relative) => {
        const filename = path.join(ROOT, relative);
        vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    });
    return context.GuiJia;
}

const GuiJia = loadScripts([
    'js/common.js',
    'js/bazi-core.js',
    'js/bazi-strength-evidence.js',
    'js/bazi-month-command.js',
    'js/bazi-strength-effects.js',
    'js/bazi-strength-synthesis.js',
    'js/bazi-root-effect-state.js',
    'js/bazi-root-six-relations.js',
    'js/bazi-clash-preconditions.js',
    'js/bazi-clash-seasonal-position.js',
    'js/bazi-clash-nonseasonal-force.js',
    'js/bazi-element-presence-scope.js',
    'js/bazi-clash-rescue-context.js',
    'js/bazi-root-clash-source-outcome.js',
    'js/bazi-root-clash-interaction-effect.js',
    'js/bazi-root-actor-interaction-aggregation.js',
    'js/bazi-root-baseline-effectiveness.js',
    'js/bazi-stem-bearing-effect.js',
    'js/bazi-visible-stem-functional-availability.js',
    'js/bazi-visible-stem-function-reachability.js',
    'js/bazi-visible-stem-directed-function.js',
    'js/bazi-visible-stem-function-coverage.js',
    'js/bazi-visible-stem-function-realization.js',
    'js/bazi-visible-stem-function-realization-source.js',
    'js/bazi-visible-stem-actor-interaction-aggregation.js',
    'js/bazi-visible-stem-actor-function-composition.js',
    'js/bazi-visible-stem-actor-profile-interpretation.js',
    'js/bazi-visible-stem-daymaster-contribution.js',
    'js/bazi-qianli-strength-composition-source.js',
    'js/bazi-qianli-strength-composition.js',
    'js/bazi-qianli-quantity-classification-source.js',
    'js/bazi-qianli-quantity-classification-audit.js',
    'js/bazi-qianli-quantity-semantic-bridge-source.js',
    'js/bazi-qianli-quantity-semantic-bridge.js',
    'js/bazi-qianli-quantity-case-calibration-source.js',
    'js/bazi-qianli-quantity-case-calibration.js',
    'js/bazi-qianli-quantity-cross-literature-source.js',
    'js/bazi-qianli-quantity-cross-literature-research.js',
    'js/bazi-contextual-force-evidence-source.js',
    'js/bazi-contextual-force-evidence-profile.js',
    'js/bazi-contextual-force-evidence.js',
    'js/bazi-contextual-force-interaction-adapter-contract.js',
    'js/bazi-contextual-force-interaction-adapter-profile.js',
    'js/bazi-contextual-force-interaction-adapter.js',
    'js/bazi-contextual-force-party-source.js',
    'js/bazi-contextual-force-party-audit.js',
    'js/bazi-assessment.js',
    'js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartySource;
const auditApi = GuiJia.baziContextualForcePartyAudit;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index],
        gan,
        zhi:zhis[index],
        ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({
            gan:hiddenGan,
            level,
            wuxing:bazi.getWuXing(hiddenGan),
            shishen:bazi.shiShenMap[dayGan][hiddenGan]
        }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return {
        dayGan,
        dayGanWuXing:dayElement,
        pillars,
        internalRelations,
        monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[],
        lunarStr:'测试农历',
        solarStr:'测试时间',
        ruleSummary:'测试口径'
    };
}

function outputFor(gans, zhis) {
    return interpretation.buildBaziInterpretation(makeResult(gans, zhis));
}

function dependencyMap(synthesis) {
    return Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
}

function finding(key) {
    return sourceApi.FINDINGS.find((item) => item.key === key);
}

test('Party Source Audit v0.1 独立拆分 source registry 与 execution', () => {
    assert(sourceApi?.installed === true, 'party source 未安装');
    assert(auditApi?.installed === true, 'party audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.CONTRACT.sourceAuditOnly === true, '必须 source-audit-only');
    assert(sourceApi.CONTRACT.semanticModelCandidate === 'side-relative-qualitative-party-configuration', 'semantic model candidate 异常');
});

test('来源 provenance 明确区分原典、编纂注文、任氏阐释与徐乐吾后注', () => {
    const roles = Object.fromEntries(Object.values(sourceApi.SOURCES).map((item) => [item.id, item.sourceRole]));
    assert(roles['CF-PARTY-SRC-MLYY'] === 'primary-text', '命理约言 provenance 异常');
    assert(roles['CF-PARTY-SRC-YJAJ'] === 'embedded-earlier-text-with-compiled-commentary', '玉井奥诀 provenance 异常');
    assert(roles['CF-PARTY-SRC-DTS'] === 'classic-with-original-and-ren-commentary', '滴天髓 provenance 异常');
    assert(roles['CF-PARTY-SRC-ZPZQ-ORIG'] === 'primary-text', '子平真诠原文 provenance 异常');
    assert(roles['CF-PARTY-SRC-XU-ZPZQ'] === 'later-commentary', '徐乐吾必须标 later commentary');
});

test('得时／失时与得势／失势保持分层，party 不得替代季节轴', () => {
    assert(finding('time-versus-party-force')?.value === 'separate-but-interacting', 'time/force distinction 未解析');
    assert(finding('party-equals-seasonal-standing')?.value === false, 'party 不得等于 seasonal standing');
    assert(finding('party-equals-de-shi')?.value === false, 'party 不得等于得势');
    assert(sourceApi.CONTRACT.partySeparateFromSeasonalStanding === true, 'contract 未锁 time/party separation');
    assert(sourceApi.CONTRACT.partySeparateFromDeShi === true, 'contract 未锁 party/deShi separation');
});

test('“势孤克众”阻止把势孤简化为同党少', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E02');
    assert(evidence.sourcePhrase.includes('势孤克众'), '缺少势孤克众来源');
    assert(finding('shi-gu-equals-few-allies-only')?.value === false, '势孤不得简化为 few allies');
    assert(sourceApi.CONTRACT.opposingSideContextRequired === true, '必须保留 opposing side context');
});

test('“党盛为强”只保留 strength semantic link，不产生 raw-count classifier', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E04');
    assert(evidence.sourcePhrase === '地支至切，党盛为强', '党盛来源异常');
    assert(finding('party-equals-raw-count')?.value === false, 'party raw count 必须 rejected');
    assert(sourceApi.CONTRACT.numericThresholdDefined === false, '不得定义 numeric threshold');
    assert(sourceApi.CONTRACT.scalarPartyScoreDefined === false, '不得定义 scalar party score');
});

test('玉井注文要求宅舍、基业、轻重与冲拱刑合，拒绝等值成员计数', () => {
    const foundation = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E05');
    const interaction = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E06');
    assert(foundation.sourcePhrase.includes('力轻') && foundation.sourcePhrase.includes('力重'), '缺少轻重证据');
    assert(interaction.sourcePhrase.includes('冲起') && interaction.sourcePhrase.includes('合起'), '缺少交互证据');
    assert(sourceApi.CONTRACT.qualitativeForceHierarchyRequired === true, '必须保留 qualitative hierarchy');
    assert(sourceApi.CONTRACT.interactionContextRequired === true, '必须保留 interaction context');
});

test('玉井注文的“支干内外明暗”扩大候选 scope，但仍不定义 membership resolver', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E07');
    assert(evidence.sourcePhrase.includes('支干内外明暗'), '缺少 visible/hidden scope 来源');
    assert(finding('party-membership-scope')?.status === 'partially-supported-no-universal-resolver', 'membership finding 状态异常');
    assert(sourceApi.CONTRACT.visibleHiddenContextMayMatter === true, '明暗 context 应 may matter');
    assert(sourceApi.CONTRACT.partyMembershipResolverDefined === false, '不得提前定义 membership resolver');
});

test('滴天髓众寡把 party 语义固定为 side-relative relation，而非 daymaster-global enum', () => {
    const original = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E08');
    const ren = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E09');
    assert(original.sourcePhrase.includes('敌寡') && original.sourcePhrase.includes('敌众'), '缺少 opposing-side 原文');
    assert(ren.sourcePhrase.includes('日主之党众') && ren.sourcePhrase.includes('敌官星之寡'), '缺少任氏两侧示例');
    assert(finding('party-configuration-semantic-shape')?.value === 'side-relative-qualitative-configuration', 'party semantic shape 异常');
    assert(sourceApi.CONTRACT.sideRelative === true, 'contract 必须 side-relative');
});

test('“官星虽寡，得财星扶则强”直接阻止寡=弱、多=强', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E10');
    assert(evidence.sourcePhrase.includes('虽寡') && evidence.sourcePhrase.includes('扶则强'), '缺少 minority-can-be-strong 来源');
    assert(evidence.supports.includes('many-few-not-strength'), '未登记 many/few != strength');
    assert(sourceApi.CONTRACT.alliedSupportContextRequired === true, 'support quality context 必须保留');
});

test('徐乐吾“党众为强、助寡为弱”明确降级为 later commentary，不冒充沈孝瞻原文', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E12');
    const membership = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E13');
    assert(evidence.sourceId === 'CF-PARTY-SRC-XU-ZPZQ', 'formalization 必须归徐注');
    assert(membership.sourceId === 'CF-PARTY-SRC-XU-ZPZQ', 'membership example 必须归徐注');
    assert(finding('later-commentary-provenance-separation')?.value === true, '后注 provenance separation 必须 required');
    assert(sourceApi.CONTRACT.xuCommentaryKeptAsLaterCommentary === true, 'contract 必须锁 later commentary');
});

test('Source Audit 可 resolved，执行层只解 semantic model，不解 party classifier', () => {
    const synthesis = outputFor().semanticModel.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-AUDIT']?.status === 'resolved', 'source audit 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SEMANTIC-MODEL']?.status === 'resolved', 'semantic model 应 research-level resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-MEMBERSHIP-RESOLVER']?.status === 'unresolved', 'membership resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'dominance resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CONFIGURATION-RULE']?.status === 'unresolved', 'party config rule 必须 unresolved');
});

test('固定验证盘九轴 coverage 已 complete，但 Audit 不生成 partyConfiguration', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    assert(synthesis.contextualForceEvidenceProfile.status === 'mapped-complete-no-force-conclusion', '固定盘九轴应 complete');
    assert(synthesis.contextualForcePartyAuditView.status === 'source-audit-resolved-executable-party-rule-open', 'audit view 状态异常');
    assert(synthesis.contextualForcePartyAuditView.partyMembership === null, '不得生成 membership');
    assert(synthesis.contextualForcePartyAuditView.relativeDominance === null, '不得生成 dominance');
    assert(synthesis.contextualForcePartyAuditView.partyConfiguration === null, '不得生成 party configuration');
    assert(synthesis.contextualForceEvidenceProfile.partyConfiguration === null, 'profile partyConfiguration 必须仍 null');
});

test('DTS exact-source 纵有 realized interaction，也不得越级成为党盛／势孤', () => {
    const synthesis = outputFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']).semanticModel.strengthSynthesis;
    assert(synthesis.contextualForceInteractionAdapterView.realizedModifierRecords.length > 0, 'DTS exact case 应存在已解析 interaction modifier');
    assert(synthesis.contextualForcePartyAuditView.partyConfiguration === null, 'interaction realized 不得越级生成 party');
    assert(synthesis.contextualForceEvidenceProfile.partyConfiguration === null, 'profile 不得 party classified');
});

test('神峰个案只保留 case calibration authority，不形成 universal party threshold', () => {
    const evidence = sourceApi.EVIDENCE.find((item) => item.id === 'CF-PARTY-E14');
    assert(evidence.chartKey === '甲辰|丙子|己未|戊辰', '神峰 case key 异常');
    assert(evidence.supports.includes('case-not-general-rule'), '神峰 case 必须限制 generalization authority');
    assert(sourceApi.CONTRACT.numericThresholdDefined === false, '个案不得生成阈值');
});

test('Party semantic model 不改变 Qianli many/few 与 Strength/Assessment blocker', () => {
    const model = outputFor().semanticModel;
    const synthesis = model.strengthSynthesis;
    const deps = dependencyMap(synthesis);
    assert(deps['SD-QIANLI-QUANTITY-GENERALIZATION-RULE']?.status === 'unresolved', 'Qianli generalization 必须 unresolved');
    assert(deps['SD-QIANLI-QUANTITY-CLASSIFICATION-RULE']?.status === 'unresolved', 'quantity classification 必须 unresolved');
    assert(synthesis.qianliStrengthCompositionInputProfile.supportQuantity.value === null, 'support many/few 不得产生');
    assert(synthesis.qianliStrengthCompositionInputProfile.restraintDrainQuantity.value === null, 'restraint/drain many/few 不得产生');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength Synthesis 必须 insufficient');
    assert(model.assessmentLayer.domains.dayMasterStrength.status === 'not-evaluated', 'Assessment 必须 not-evaluated');
});

test('Party Audit contract 不引入数字、标量、自动强弱或 capacity mapping', () => {
    const contract = sourceApi.CONTRACT;
    assert(contract.numericThresholdDefined === false, '不得 numeric threshold');
    assert(contract.numericWeightsDefined === false, '不得 numeric weights');
    assert(contract.scalarPartyScoreDefined === false, '不得 scalar score');
    assert(contract.manyFewMappingDefined === false, '不得 many/few mapping');
    assert(contract.strengthMappingDefined === false, '不得 strength mapping');
    assert(contract.capacityMappingDefined === false, '不得 capacity mapping');
    assert(contract.finalAssessmentMapping === false, '不得 final assessment mapping');
});

test('生产 loader 链为 Interaction Adapter → Party Audit → Party Source', () => {
    const adapter = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-interaction-adapter.js'), 'utf8');
    const audit = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-audit.js'), 'utf8');
    assert(adapter.includes('bazi-contextual-force-party-audit.js'), 'Interaction Adapter 未加载 Party Audit');
    assert(audit.includes('bazi-contextual-force-party-source.js'), 'Party Audit 未加载独立 source registry');
});

console.log(`\nContextual Force Party Source Audit v0.1: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
