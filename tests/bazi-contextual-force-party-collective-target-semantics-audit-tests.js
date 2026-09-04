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
    'js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-contract.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter-profile.js','js/bazi-contextual-force-party-branch-substrate-quality-input-adapter.js',
    'js/bazi-assessment.js','js/bazi-interpretation.js'
]);

const bazi = GuiJia.baziCore;
const interpretation = GuiJia.baziInterpretation;
const sourceApi = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsSource;
const auditApi = GuiJia.baziContextualForcePartyCollectiveTargetSemanticsAudit;

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

test('Collective Target Semantics Source/Audit v0.1 安装并冻结四层 target semantics', () => {
    assert(sourceApi?.installed && auditApi?.installed, 'source/audit 未安装');
    assert(sourceApi.VERSION === '0.1' && auditApi.VERSION === '0.1', '版本异常');
    const levels = Object.values(sourceApi.TARGET_SEMANTIC_LEVELS);
    assert(levels.length === 4, 'target semantic levels 应为四层');
    ['single-actor','actor-set','role-class','configuration'].forEach((level) => assert(levels.includes(level), `缺 ${level}`));
    levels.forEach((level) => assert(sourceApi.LEVEL_SUMMARY[level]?.supported === true, `${level} 缺来源支持`));
});

test('来源明确对举“独杀”与“众杀”，collective semantics 不是单 actor 缺省值', () => {
    const single = sourceApi.SOURCE_EVIDENCE.find((item) => item.id === 'CF-CTS-E01');
    const plural = sourceApi.SOURCE_EVIDENCE.find((item) => item.id === 'CF-CTS-E02');
    assert(single?.semanticLevel === 'single-actor', '独杀应归 single actor 语义');
    assert(plural?.semanticLevel === 'actor-set', '众杀应归 actor set 语义');
    assert(sourceApi.CONTRACT.collectiveRoleInstanceLanguageSupported === true, 'collective semantics 应 supported');
    assert(sourceApi.CONTRACT.lexicalSingularEqualsActorKey === false, '独杀也不能直接等于 actorKey');
});

test('食神制杀命例明确支持 collective target，但禁止展开 member edges', () => {
    const groupCases = sourceApi.SOURCE_EVIDENCE.filter((item) => ['CF-CTS-E03','CF-CTS-E04','CF-CTS-E05'].includes(item.id));
    assert(groupCases.length === 3 && groupCases.every((item) => item.semanticLevel === 'actor-set'), 'opposition collective evidence 异常');
    assert(groupCases.some((item) => item.sourcePhrase.includes('群凶')), '缺群凶证据');
    assert(groupCases.some((item) => item.sourcePhrase.includes('庚金并透')), '缺并透证据');
    assert(groupCases.some((item) => item.sourcePhrase.includes('两杀')), '缺两杀证据');
    assert(sourceApi.CONTRACT.groupOutcomeExpandsToMemberEdges === false, 'group outcome 不得展开 member edges');
    assert(sourceApi.FINDINGS.find((item) => item.key === 'opposition-actor-specific-calibration-is-required-by-source')?.value === false, '来源不应强制 actor-specific opposition calibration');
});

test('role-class motif authorization 与 chart execution 保持分层', () => {
    const evidence = sourceApi.SOURCE_EVIDENCE.find((item) => item.id === 'CF-CTS-E06');
    assert(evidence?.semanticLevel === 'role-class', '食神制杀／印绶化杀理论句应归 role-class');
    assert(evidence.evidenceIds.includes('CF-PAE-E03') && evidence.evidenceIds.includes('CF-PAE-E05'), '应复用既有 source registry evidence');
    assert(sourceApi.CONTRACT.roleClassRuleCreatesChartEdge === false, 'role-class rule 不得直接创建 chart edge');
});

test('杀势／杀局／杀重／制杀太过归 configuration，不物化为 actor group 或 scalar', () => {
    const evidence = sourceApi.SOURCE_EVIDENCE.filter((item) => ['CF-CTS-E07','CF-CTS-E08'].includes(item.id));
    assert(evidence.every((item) => item.semanticLevel === 'configuration'), 'configuration evidence 分类异常');
    assert(sourceApi.CONTRACT.configurationEqualsActorGroup === false, 'configuration 不得等于 actor group');
    assert(sourceApi.CONTRACT.configurationEqualsNumericScore === false, 'configuration 不得等于 numeric score');
});

test('collective source semantics 可能跨 visible / branch-hidden scope', () => {
    const evidence = sourceApi.SOURCE_EVIDENCE.find((item) => item.id === 'CF-CTS-E09');
    assert(evidence?.semanticLevel === 'actor-set', '七杀皆来应保留 collective source semantics');
    assert(evidence.exampleCaseIds.includes('CF-VMEC-MED-CASE-01'), '应连接既有 mediation case provenance');
    assert(sourceApi.CONTRACT.collectiveSemanticsMayBeCrossScope === true, 'cross-scope collective semantics 应被承认');
    assert(sourceApi.CONTRACT.crossScopeRoleInstanceGroupIdentityDefined === false, 'cross-scope group identity 尚不能定义');
});

test('机器依赖拆为 target-level → group identity → cross-scope group → collective execution', () => {
    const synthesis = synthesisFor(), deps = depMap(synthesis);
    assert(synthesis.contextualForcePartyCollectiveTargetSemanticsSourceAudit?.status === 'source-audited-target-level-model-unresolved', '缺 collective audit');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT']?.status === 'resolved', 'source audit 应 resolved');
    const level = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'];
    const group = deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT'];
    const cross = deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY'];
    const execution = deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'];
    assert(level?.status === 'unresolved', 'target-level resolver 应 unresolved');
    assert(group?.status === 'unresolved' && group.dependsOnDependencyIds.includes(level.id), 'group identity dependency 异常');
    assert(cross?.status === 'unresolved' && cross.dependsOnDependencyIds.includes(group.id), 'cross-scope group dependency 异常');
    assert(execution?.status === 'unresolved' && execution.dependsOnDependencyIds.includes(cross.id), 'collective execution dependency 异常');
});

test('opposition calibration blocker 被重分类为 target-model scope mismatch', () => {
    const deps = depMap(synthesisFor());
    const opposition = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION'];
    assert(opposition?.status === 'unresolved', 'opposition 仍应 unresolved');
    assert(opposition.statement.includes('不再被解释为') && opposition.statement.includes('collective'), 'opposition statement 应明确 blocker 重分类');
    assert(opposition.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'), 'opposition 缺 target-level dependency');
    assert(opposition.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT'), 'opposition 缺 group identity dependency');
    assert(opposition.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'), 'opposition 缺 collective execution dependency');
});

test('known motif total calibration 与 generic visible mapping 继续 unresolved', () => {
    const synthesis = synthesisFor(), deps = depMap(synthesis);
    const total = deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION'];
    const generic = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING'];
    assert(total?.status === 'unresolved', 'known motif total calibration 不得 resolved');
    assert(total.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'), 'total calibration 应依赖 collective execution');
    assert(generic?.status === 'unresolved', 'generic visible mapping 不得 resolved');
    assert(generic.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'), 'generic mapping 缺 target-level dependency');
});

test('既有 realization registry 与 realized-but-unmapped proof case 不变', () => {
    assert(GuiJia.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.length === 3, '不得新增 realization pattern');
    const synthesis = synthesisFor(['丁','癸','乙','己'], ['丑','卯','卯','卯']);
    const target = synthesis.contextualForcePartyVisibleEdgeEffectTypeAuthorizationAudit.records
        .find((item) => item.sourceActorKey === 'visible:1:癸' && item.targetActorKey === 'visible:0:丁');
    assert(target?.realizationState === 'realized-in-source-context', '癸→丁 应继续 realized');
    assert(target?.authorizationState === 'realized-no-current-effect-type-authorization', '癸→丁 应继续 unmapped');
});

test('下游 Generalization / Dominance / Substrate / Strength / Assessment 继续关闭', () => {
    const output = outputFor(), synthesis = output.semanticModel.strengthSynthesis, deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'generalization 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER']?.status === 'unresolved', 'dominance 不得 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER']?.status === 'unresolved', 'substrate 不得 resolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength 应 insufficient');
    assert(output.semanticModel.assessmentLayer?.state === 'contract-only', 'Assessment 应 contract-only');
});

test('Audit 不引入 score、threshold、majority、ranking 或 actor-global effectiveness', () => {
    const audit = synthesisFor().contextualForcePartyCollectiveTargetSemanticsSourceAudit;
    const keys = collectKeys({ contract:sourceApi.CONTRACT, audit });
    ['thresholdValue','classificationResult','forceScore','memberScore','majorityResult','rankingResult','priorityScore'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
    assert(audit.numericScore === null && audit.scalarForce === null && audit.actorGlobalEffectiveness === null, '不得生成 scalar/global effectiveness');
});

test('研究 bootstrap 在 calibration 后显式加载 Collective Target Source/Audit', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-collective-target-semantics-audit.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-visible-motif-e2e-calibration-source.js',
        'bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
        'bazi-contextual-force-party-collective-target-semantics-source.js',
        'bazi-contextual-force-party-collective-target-semantics-audit.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    assert(!auditSource.includes('document.write'), 'Collective Target Audit 不应继续持有隐式 source loader');
    assert(auditSource.includes('bazi-contextual-force-party-collective-target-semantics-source.js'), 'Collective Target Audit 应保留 bootstrap prerequisite provenance');
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);