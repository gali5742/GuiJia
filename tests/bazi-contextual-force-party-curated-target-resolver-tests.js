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
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-contract.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-profile.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver.js');

const GuiJia = context.GuiJia;
const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const contractApi = GuiJia.baziContextualForcePartyCuratedTargetResolverContract;
const profileApi = GuiJia.baziContextualForcePartyCuratedTargetResolverProfile;
const runtimeApi = GuiJia.baziContextualForcePartyCuratedTargetResolver;
const actorGroupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile;
const hiddenBindingProfileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile;
const extension = extensions['contextual-force-party-curated-target-resolver-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
const resolutionMap = (profile) => Object.fromEntries((profile.resolutions || []).map((item) => [item.sourceCaseId, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyActorGroupIdentity:Object.freeze({ installed:true }),
    contextualForcePartyHiddenSingleTargetBinding:Object.freeze({ installed:true }),
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

test('Curated Finite Target Resolver v0.1 安装，scope 严格限定 Relation Target 8-case corpus', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(contractApi.FINITE_CASE_IDS.length === 8, 'finite case registry 应为8条');
    assert(contractApi.CONTRACT.resolverScope === 'relation-target-semantic-level-contract-eight-case-audit-corpus-only', 'resolver scope 异常');
    assert(contractApi.CONTRACT.finiteResolutionCreatesGlobalResolver === false, 'finite resolver 不得升级 global resolver');
    assert(contractApi.CONTRACT.runtimeClassicalChineseParserRequired === false, '不得要求 runtime 古汉语 parser');
});

test('CASE-01/02/03 deterministic resolution 为 role-class，不创建 chart actor', () => {
    const map = resolutionMap(profileApi.buildProfile());
    ['CF-RTLC-CASE-01','CF-RTLC-CASE-02','CF-RTLC-CASE-03'].forEach((id) => {
        const item = map[id];
        assert(item?.resolutionState === 'resolved-source-scoped-role-class', `${id} 应 resolved role-class`);
        assert(item.semanticLevel === 'role-class' && item.targetReferenceType === 'role-class', `${id} target reference type 异常`);
        assert(item.targetReference.roleClasses.includes('七杀'), `${id} 应包含七杀 role class`);
        assert(!('actorKey' in item.targetReference) && !('groupId' in item.targetReference), `${id} 不得产生 chart actor/group identity`);
    });
});

test('CASE-04/05 deterministic resolution 消费 Actor Group Identity，而不是 annotation hint 直出', () => {
    const profile = profileApi.buildProfile();
    const map = resolutionMap(profile);
    const groupMap = Object.fromEntries(actorGroupProfileApi.buildProfile().resolvedGroups.map((item) => [item.sourceCaseId, item]));
    ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].forEach((id) => {
        const item = map[id];
        const group = groupMap[id];
        assert(item?.resolutionState === 'resolved-source-scoped-actor-set', `${id} 应 resolved actor-set`);
        assert(item.semanticLevel === 'actor-set' && item.targetReferenceType === 'actor-group', `${id} target reference type 异常`);
        assert(item.targetReference.groupId === group.groupId, `${id} 必须复用 Actor Group Identity groupId`);
        assert(item.targetReference.memberActorKeys.join('|') === group.memberActorKeys.join('|'), `${id} member identity 应复用 group profile`);
        assert(item.targetReference.cardinality === 2 && item.targetReference.scope === 'visible-stem', `${id} cardinality/scope 异常`);
    });
});

test('CASE-06 deterministic resolution 消费 Hidden Single Target Binding → hidden:3:亥:壬:0', () => {
    const item = resolutionMap(profileApi.buildProfile())['CF-RTLC-CASE-06'];
    assert(item?.resolutionState === 'resolved-source-scoped-single-actor', 'CASE-06 应 resolved single-actor');
    assert(item.semanticLevel === 'single-actor' && item.targetReferenceType === 'actor-key', 'CASE-06 reference type 异常');
    assert(item.targetReference.actorKey === 'hidden:3:亥:壬:0', 'CASE-06 actorKey 异常');
    assert(item.targetReference.scope === 'hidden-branch' && item.targetReference.targetRoleClass === '七杀', 'CASE-06 scope/role 异常');
    assert(item.targetReference.antecedentSpan === '独杀', 'CASE-06 应保留 antecedent provenance');
});

test('CASE-07 deterministic resolution 为 configuration-state，不物化 actor/group', () => {
    const item = resolutionMap(profileApi.buildProfile())['CF-RTLC-CASE-07'];
    assert(item?.resolutionState === 'resolved-source-scoped-configuration', 'CASE-07 应 resolved configuration');
    assert(item.semanticLevel === 'configuration' && item.targetReferenceType === 'configuration-state', 'CASE-07 reference type 异常');
    assert(item.targetReference.configurationSpans.includes('杀重') && item.targetReference.configurationSpans.includes('制杀太过'), 'CASE-07 configuration spans 不完整');
    assert(!('actorKey' in item.targetReference) && !('groupId' in item.targetReference), 'configuration 不得物化 actor/group');
});

test('CASE-08 是合法 no-relation-target / not-applicable，不计 unresolved', () => {
    const profile = profileApi.buildProfile();
    const item = resolutionMap(profile)['CF-RTLC-CASE-08'];
    assert(item?.resolutionState === 'not-applicable-no-relation-target', 'CASE-08 应 not-applicable');
    assert(item.semanticLevel === null && item.targetReferenceType === 'none' && item.targetReference === null, 'CASE-08 不应产生 target');
    assert(profile.unresolvedResolutions.length === 0, '合法 not-applicable 不得计入 unresolved');
    assert(contractApi.CONTRACT.noRelationTargetIsNotUnresolved === true, '合同应固定 no-target != unresolved');
});

test('8-case profile 完整：8 resolutions / 7 applicable / 0 unresolved', () => {
    const profile = profileApi.buildProfile();
    assert(profile.coverageComplete === true, 'finite resolver coverage 应 complete');
    assert(profile.resolutions.length === 8, '应有8个 case resolutions');
    assert(profile.applicableResolutions.length === 7, '应有7个 applicable target/config resolutions');
    assert(profile.unresolvedResolutions.length === 0, 'finite corpus 不应有 unresolved');
    assert(profile.globalResolver === null, '不得声明 global resolver');
});

test('断开 Actor Group Identity 后 CASE-04/05 必须 unresolved，annotation actor-set hint 不能直接执行', () => {
    const cases = targetSource.AUDIT_CASES.filter((item) => ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].includes(item.id));
    cases.forEach((sourceCase) => {
        const item = profileApi.resolveCase(sourceCase, [], hiddenBindingProfileApi.buildProfile().resolvedBindings);
        assert(item.resolutionState === 'unresolved-curated-target', `${sourceCase.id} 缺 group identity 时必须 unresolved`);
        assert(item.blockerReasons.includes('actor-set-group-identity-unresolved'), `${sourceCase.id} blocker 应指向 group identity`);
    });
});

test('断开 Hidden Single Target Binding 后 CASE-06 必须 unresolved，single-actor hint 不能直接执行', () => {
    const sourceCase = targetSource.AUDIT_CASES.find((item) => item.id === 'CF-RTLC-CASE-06');
    const item = profileApi.resolveCase(sourceCase, actorGroupProfileApi.buildProfile().resolvedGroups, []);
    assert(item.resolutionState === 'unresolved-curated-target', 'CASE-06 缺 hidden binding 时必须 unresolved');
    assert(item.blockerReasons.includes('single-actor-identity-unresolved'), 'CASE-06 blocker 应指向 single actor identity');
});

test('Synthesis resolves finite resolver contract/coverage，但 global Target-Level Resolver 与 broader coverage 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-RESOLVER-CONTRACT']?.status === 'resolved', 'finite resolver contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-AUDIT-CORPUS-RESOLUTION']?.status === 'resolved', 'finite resolver coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER']?.status === 'unresolved', 'global target resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE']?.status === 'unresolved', 'broader annotation coverage 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-FINITE-TARGET-AUDIT-CORPUS-RESOLUTION'), 'global resolver 应记录 finite corpus 已闭合');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'), 'global resolver 仍应依赖 broader coverage');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Finite resolver 不引入 relation effect/member edges/score/threshold/ranking/final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCuratedTargetResolver;
    const c = contractApi.CONTRACT;
    assert(audit?.relationEffectExecution === false && audit?.membershipMutation === false, 'resolver 不得执行 relation/membership');
    assert(audit?.numericScore === null && audit?.scalarForce === null && audit?.relativeDominance === null, 'numeric/dominance 应 null');
    assert((audit.profile.relationEffects || []).length === 0 && (audit.profile.memberEdges || []).length === 0, 'effect/member edge guardrails 必须为空');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应全部关闭');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','targetScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序应为 Hidden Binding → Actor Group → Curated Target Resolver → Collective Effect', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-hidden-single-target-binding.js',
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-curated-target-resolver-contract.js',
        'bazi-contextual-force-party-curated-target-resolver-profile.js',
        'bazi-contextual-force-party-curated-target-resolver.js',
        'bazi-contextual-force-party-collective-relation-effect-contract.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const file = suffix
            ? `js/bazi-contextual-force-party-curated-target-resolver-${suffix}.js`
            : 'js/bazi-contextual-force-party-curated-target-resolver.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\nCurated Finite Target Resolver tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);