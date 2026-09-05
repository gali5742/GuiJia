#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) {
    try { fn(); passed += 1; console.log(`✓ ${name}`); }
    catch (error) { failed += 1; console.error(`✗ ${name}`); console.error(`  ${error.message}`); }
}
function runFile(context, file) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
}

const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
context.GuiJia = {
    common:Object.freeze({ formatNaturalCount:(value) => String(value) }),
    baziContextualForcePartyCollectiveTargetSemanticsSource:Object.freeze({
        TARGET_SEMANTIC_LEVELS:Object.freeze({
            SINGLE_ACTOR:'single-actor',
            ACTOR_SET:'actor-set',
            ROLE_CLASS:'role-class',
            CONFIGURATION:'configuration'
        })
    })
};
const extensions = {};
context.GuiJia.baziStrengthSynthesis = Object.freeze({
    registerExtension:(name, extension) => { extensions[name] = extension; },
    detectConflicts:() => Object.freeze([]),
    buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
        status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
    })
});
vm.createContext(context);
runFile(context, 'js/bazi-core.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js');
runFile(context, 'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js');
runFile(context, 'js/bazi-contextual-force-party-hidden-single-target-binding-contract.js');
runFile(context, 'js/bazi-contextual-force-party-hidden-single-target-binding-profile.js');
runFile(context, 'js/bazi-contextual-force-party-hidden-single-target-binding.js');

const GuiJia = context.GuiJia;
const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource;
const contractApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingContract;
const profileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile;
const runtimeApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBinding;
const extension = extensions['contextual-force-party-hidden-single-target-binding-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const case06 = targetSource.AUDIT_CASES.find((item) => item.id === 'CF-RTLC-CASE-06');
const ann04 = annotationSource.ANNOTATIONS.find((item) => item.id === 'CF-CRSA-ANN-04');
const registry = contractApi.SOURCE_REGISTRY['CF-RTLC-CASE-06'];

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit:Object.freeze({ installed:true, finiteTargetAuditCorpusCoverageComplete:true }),
    claims:Object.freeze([]),
    dependencies:BASE_DEPENDENCIES,
    conflicts:Object.freeze([]),
    activeRuleIds:Object.freeze([]),
    boundaries:Object.freeze([]),
    sufficiency:Object.freeze({ status:'insufficient' })
});

function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
}

test('Hidden Single Target Binding v0.1 安装，且 registry 只登记 CASE-06', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(Object.keys(contractApi.SOURCE_REGISTRY).length === 1, 'v0.1 只能登记一个 source case');
    assert(contractApi.SOURCE_REGISTRY['CF-RTLC-CASE-06'], 'CASE-06 registry 缺失');
    assert(contractApi.CONTRACT.unregisteredCaseAutoBinding === false, '未登记 case 不得自动绑定');
    assert(contractApi.CONTRACT.runtimeClassicalChineseParserRequired === false, '不得要求 runtime 古汉语 parser');
    assert(contractApi.CONTRACT.runtimeLexicalPositionParserRequired === false, '不得要求 lexical position parser');
});

test('CASE-06 hour 亥 hidden inventory 使用统一 actorKey，并保留壬七杀 / 甲偏印', () => {
    const candidates = profileApi.buildHiddenCandidates(case06, registry);
    assert(candidates.length === 2, '亥应有两个 hidden candidates');
    assert(candidates[0].actorKey === 'hidden:3:亥:壬:0', '壬 actorKey 异常');
    assert(candidates[0].gan === '壬' && candidates[0].tenGod === '七杀' && candidates[0].level === '本气', '壬 hidden semantics 异常');
    assert(candidates[1].actorKey === 'hidden:3:亥:甲:1', '甲 actorKey 异常');
    assert(candidates[1].gan === '甲' && candidates[1].tenGod === '偏印' && candidates[1].level === '中气', '甲 hidden semantics 异常');
    assert(candidates.every((item) => item.scope === 'hidden-branch' && item.pillarIndex === 3), 'candidate scope/pillar 应锁定 hour hidden branch');
});

test('CASE-06 validator 同时要求时柱位置、七杀 role、cardinality 与 antecedent provenance', () => {
    const validation = profileApi.validateBindingCandidate(case06, ann04, registry);
    assert(validation.valid === true && validation.issues.length === 0, 'CASE-06 binding validator 应通过');
    assert(validation.positionEvidenceObserved === true, '应观察到“时逢独杀”位置 provenance');
    assert(validation.roleMatchedCandidates.length === 1, '七杀 role filter 应只剩一个 candidate');
    assert(validation.roleMatchedCandidates[0].actorKey === 'hidden:3:亥:壬:0', '唯一七杀 actorKey 异常');
    assert(ann04.relationUnits[0].target.mentionMode === 'antecedent-linked', 'CASE-06 target 应为 antecedent-linked');
    assert(ann04.relationUnits[0].target.antecedentSpan === '独杀', 'CASE-06 antecedent 应为独杀');
});

test('CASE-06 source-scoped binding 精确解析为 hidden:3:亥:壬:0，不创建 effect/member', () => {
    const binding = profileApi.buildBinding(registry);
    assert(binding.status === 'resolved-source-scoped-hidden-single-target', 'CASE-06 应 source-scoped resolved');
    assert(binding.stableActorKey === 'hidden:3:亥:壬:0', 'stableActorKey 异常');
    assert(binding.targetRoleClass === '七杀' && binding.targetSemanticLevel === 'single-actor', 'target semantics 异常');
    assert(binding.targetAntecedentSpan === '独杀', 'binding 应保留 antecedent provenance');
    assert(binding.sourcePositionWording === '时逢独杀' && binding.pillar === 'hour' && binding.pillarIndex === 3, 'source position provenance 异常');
    assert(binding.runtimeLexicalPositionParserUsed === false, '不得使用 runtime lexical parser');
    assert(binding.relationEffect === null && binding.membershipMutation === null && binding.relativeDominance === null && binding.numericWeight === null, 'binding 不得偷渡 effect/membership/dominance/weight');
});

test('错柱位必须被拒绝，不能从全盘同十神候选兜底', () => {
    const wrong = { ...registry, pillar:'day', pillarIndex:2 };
    const validation = profileApi.validateBindingCandidate(case06, ann04, wrong);
    assert(validation.valid === false, '错柱位不得通过');
    assert(validation.issues.includes('role-matched-candidate-cardinality-mismatch'), '错柱位应因目标柱无唯一七杀而失败');
});

test('错 role / cardinality / antecedent 均必须被拒绝', () => {
    const wrongRole = profileApi.validateBindingCandidate(case06, ann04, { ...registry, targetRoleClass:'偏印' });
    assert(wrongRole.valid === false && wrongRole.issues.includes('target-role-class-mismatch'), '错 target role 应失败');

    const wrongCardinality = profileApi.validateBindingCandidate(case06, ann04, { ...registry, expectedCardinality:2 });
    assert(wrongCardinality.valid === false && wrongCardinality.issues.includes('invalid-expected-cardinality'), 'cardinality!=1 应失败');

    const wrongAntecedent = profileApi.validateBindingCandidate(case06, ann04, { ...registry, targetAntecedentSpan:'官' });
    assert(wrongAntecedent.valid === false && wrongAntecedent.issues.includes('target-antecedent-mismatch'), '错 antecedent 应失败');
});

test('未登记 case 不得自动套用 hidden binding 规则', () => {
    const unregistered = profileApi.buildBinding({
        ...registry,
        sourceCaseId:'CF-RTLC-CASE-05',
        annotationId:'CF-CRSA-ANN-06'
    });
    assert(unregistered.status === 'unresolved-hidden-single-target', '未登记/不匹配 case 必须 unresolved');
    assert(unregistered.stableActorKey === null, '未登记 case 不得产生 actorKey');
    assert(contractApi.CONTRACT.sourceScopedBindingCreatesGenericRule === false, 'source-scoped binding 不得形成 generic rule');
});

test('profile coverage 只表示 registry CASE-06 已闭合，不声明 global hidden resolver', () => {
    const profile = profileApi.buildProfile();
    assert(profile.bindings.length === 1 && profile.resolvedBindings.length === 1 && profile.unresolvedBindings.length === 0, 'v0.1 registry 应1/1 resolved');
    assert(profile.resolvedBindings[0].stableActorKey === 'hidden:3:亥:壬:0', 'profile resolved actorKey 异常');
    assert(profile.globalHiddenTargetResolver === null, '不得声明 global hidden resolver');
    assert(profile.relationEffects.length === 0 && profile.memberEdges.length === 0, 'profile 不得产生 relation/member edges');
    assert(profile.relativeDominance === null && profile.numericScore === null, '不得产生 dominance/score');
});

test('Synthesis 只解决 hidden binding contract/source coverage；global candidate/coreference/cardinality/target resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-CONTRACT']?.status === 'resolved', 'hidden binding contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE']?.status === 'resolved', 'hidden binding source coverage 应 resolved');
    [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE',
        'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得由 CASE-06 局部 binding 提前 resolved`));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE'), 'global candidate binder 应记录局部 coverage 已闭合');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE'), 'coreference dependency 应记录 CASE-06 局部 consumer');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Contract/runtime 不引入 score、threshold、ranking、final Strength 或 relation execution', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyHiddenSingleTargetBinding;
    const c = contractApi.CONTRACT;
    assert(audit?.numericScore === null && audit?.scalarForce === null && audit?.relativeDominance === null, 'audit numeric/dominance 应保持 null');
    assert(audit.bindingCreatesRelationEffect === false && audit.bindingCreatesMembership === false, 'binding 不得创建 effect/membership');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应全部关闭');
    const profile = audit.profile;
    assert((profile.memberEdges || []).length === 0, 'memberEdges guardrail 必须为空');
    assert((profile.relationEffects || []).length === 0, 'relationEffects guardrail 必须为空');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','bindingScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序应为 Curated Annotation → Hidden Binding → Actor Group → Collective Effect', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js',
        'bazi-contextual-force-party-hidden-single-target-binding-contract.js',
        'bazi-contextual-force-party-hidden-single-target-binding-profile.js',
        'bazi-contextual-force-party-hidden-single-target-binding.js',
        'bazi-contextual-force-party-actor-group-identity-contract.js',
        'bazi-contextual-force-party-actor-group-identity-profile.js',
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-collective-relation-effect-contract.js',
        'bazi-contextual-force-party-collective-relation-effect-profile.js',
        'bazi-contextual-force-party-collective-relation-effect.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const file = suffix
            ? `js/bazi-contextual-force-party-hidden-single-target-binding-${suffix}.js`
            : 'js/bazi-contextual-force-party-hidden-single-target-binding.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\nHidden Single Target Binding tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);