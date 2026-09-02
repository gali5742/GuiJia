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
    context.window = context; context.globalThis = context; vm.createContext(context);
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
    'js/bazi-branch-element-relation-inventory.js','js/bazi-contextual-force-party-relation-effect-generalization-source.js','js/bazi-contextual-force-party-relation-effect-generalization-audit.js',
    'js/bazi-contextual-force-party-visible-edge-effect-type-authorization-source.js','js/bazi-contextual-force-party-visible-edge-effect-type-authorization-audit.js',
    'js/bazi-contextual-force-party-visible-motif-e2e-calibration-source.js','js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
    'js/bazi-contextual-force-party-collective-target-semantics-source.js','js/bazi-contextual-force-party-collective-target-semantics-audit.js',
    'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js','js/bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js',
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const auditApi = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractAudit;

function makeResult(gans = ['丁','壬','丁','己'], zhis = ['丑','子','亥','酉']) {
    const dayGan = gans[2], dayElement = bazi.getWuXing(dayGan);
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
const outputFor = (gans, zhis) => interpretation.buildBaziInterpretation(makeResult(gans, zhis));
const synthesisFor = (gans, zhis) => outputFor(gans, zhis).semanticModel.strengthSynthesis;
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Relation Target Level Source/Contract Audit v0.1 安装且只定义 evidence contract', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    assert(sourceApi.CONTRACT.targetSemanticLevelResolverDefined === false, '不得提前定义 resolver');
    assert(sourceApi.CONTRACT.resolverUnitIsRelationTargetSpan === true, 'resolver unit 应为 relation-target span');
    assert(sourceApi.CONTRACT.sentenceLevelSingleLabelRejected === true, '必须拒绝 sentence-level 单标签');
    assert(sourceApi.CONTRACT.unresolvedOutcomeSupported === true, '证据不足必须允许 unresolved');
});

test('理论句“一杀而食伤并见”证明 lexical singular 不等于 single actor', () => {
    const item = sourceApi.AUDIT_CASES.find((record) => record.id === 'CF-RTLC-CASE-01');
    assert(item?.lexicalMarkers.includes('一杀'), '缺一杀 marker');
    assert(item.sourceContextType === 'theory-general', '应为 theory-general');
    assert(item.predicateType === 'generalized-relation-rule', '应为 generalized rule');
    assert(item.expectedTargetLevel === 'role-class', '理论句 target 应为 role-class');
    assert(item.lexicalShortcutRejected === true, '必须拒绝 lexical shortcut');
    assert(sourceApi.CONTRACT.singularLexicalMarkerEqualsSingleActor === false, '一/独不得自动 single actor');
});

test('“杀重身轻，财星党杀”同句同时含 configuration condition 与 role-class target', () => {
    const item = sourceApi.AUDIT_CASES.find((record) => record.id === 'CF-RTLC-CASE-02');
    assert(item?.mixedSemanticStatement === true, '应标记 mixed statement');
    assert(item.contextSemanticLevel === 'configuration', '条件应为 configuration');
    assert(item.expectedTargetLevel === 'role-class', '党杀 relation target 应为 role-class');
    assert(item.targetSpan.includes('党杀'), '应保留 target span');
    assert(sourceApi.CONTRACT.mixedStatementSpanSegmentationRequired === true, '必须先做 span segmentation');
});

test('“身杀两停，则以食神制杀”不因“两停”把整句判成 configuration', () => {
    const item = sourceApi.AUDIT_CASES.find((record) => record.id === 'CF-RTLC-CASE-03');
    assert(item?.contextSemanticLevel === 'configuration', '身杀两停应作为 configuration context');
    assert(item.expectedTargetLevel === 'role-class', '制杀 target 应为 role-class');
    assert(item.predicateType === 'generalized-relation-rule', 'relation clause 应保持 generalized rule');
});

test('chart-case actor set 需要 collective/cardinality 与 chart candidate inventory 同时成立', () => {
    const cases = sourceApi.AUDIT_CASES.filter((item) => ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].includes(item.id));
    assert(cases.length === 2, '缺 actor-set audit cases');
    cases.forEach((item) => {
        assert(item.expectedTargetLevel === 'actor-set', `${item.id} 应为 actor-set`);
        assert(item.sourceContextType === 'chart-case', `${item.id} 应为 chart-case`);
        assert(item.explicitCardinality === 2, `${item.id} 应保留 cardinality=2`);
        assert(item.chartLocalCandidateKeys.length === 2, `${item.id} candidate set 应为2`);
        assert(item.groupOutcomeExpandsToMemberEdges === false, `${item.id} 不得展开 member edges`);
    });
    const gate = sourceApi.LEVEL_GATE_CONTRACTS['actor-set'];
    assert(gate.requiredGates.includes('cardinality-binding'), 'actor-set gate 缺 cardinality');
    assert(gate.requiredGates.includes('scope-provenance'), 'actor-set gate 缺 scope');
});

test('chart-case“独杀”仍可能落在 hidden scope，词面 singularity 不提供 stable actorKey', () => {
    const item = sourceApi.AUDIT_CASES.find((record) => record.id === 'CF-RTLC-CASE-06');
    assert(item?.expectedTargetLevel === 'single-actor', '来源 denotation 应为 singular');
    assert(item.candidateScope === 'hidden-branch', '应保留 hidden/branch scope');
    assert(item.stableActorKey === null && item.bindingResolved === false, '不得伪造 actorKey binding');
    assert(item.blockerReasons.includes('singular-language-does-not-provide-stable-machine-actor-key'), '缺 actor binding blocker');
});

test('instance description 不是 relation-target resolver 的强制四选一输入', () => {
    const item = sourceApi.AUDIT_CASES.find((record) => record.id === 'CF-RTLC-CASE-08');
    assert(item?.predicateType === 'instance-description', '应为 instance description');
    assert(item.targetSpan === null, '不应伪造 relation target span');
    assert(item.expectedTargetLevel === null, '不应强迫四选一');
    assert(item.resolutionState === 'insufficient-binding-provenance', '应保留 insufficient state');
});

test('机器依赖把 resolver 拆为 source contract + span/context/predicate/segmentation/binding gates', () => {
    const synthesis = synthesisFor(), deps = depMap(synthesis);
    const sourceContract = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT'];
    assert(sourceContract?.status === 'resolved', 'source contract audit 应 resolved');
    const unresolved = [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING'
    ];
    unresolved.forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 应 unresolved`));
    const resolver = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'];
    assert(resolver?.status === 'unresolved', 'target-level resolver 仍应 unresolved');
    unresolved.forEach((id) => assert(resolver.dependsOnDependencyIds.includes(id), `resolver 缺 ${id}`));
});

test('group identity / collective execution / calibration / generic mapping 与 Strength 下游继续关闭', () => {
    const output = outputFor(), synthesis = output.semanticModel.strengthSynthesis, deps = depMap(synthesis);
    [
        'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        'SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY',
        'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION',
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
        'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得 resolved`));
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength 应 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应 contract-only');
});

test('Source/Contract Audit 不引入 numeric/scalar/threshold/ranking 或 realization mutation', () => {
    const synthesis = synthesisFor();
    const audit = synthesis.contextualForcePartyRelationTargetSemanticLevelContractSourceAudit;
    assert(audit?.targetSemanticLevelResolverDefined === false, '不得提前实现 resolver');
    assert(sourceApi.CONTRACT.groupOutcomeExpandsToMemberEdges === false, '不得展开 member edges');
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit });
    ['forceScore','memberScore','classificationScore','numericWeight','thresholdValue','majorityResult','rankingResult','scalarForce','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
    assert(GuiJia.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.length === 3, 'realization registry 不应增加');
});

test('生产 loader 顺序为 Collective Target Semantics → Relation Target Level Contract Audit', () => {
    const loader = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const collective = loader.indexOf('bazi-contextual-force-party-collective-target-semantics-audit.js');
    const contractAudit = loader.indexOf('bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js');
    assert(collective >= 0 && contractAudit > collective, 'loader 顺序异常');
    assert(!loader.includes('DOMContentLoaded'), '不得引入异步 DOMContentLoaded loader');
});

console.log(`\nRelation Target Semantic Level Contract Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
