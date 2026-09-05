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
const extensions = {};
context.GuiJia = {
    baziContextualForcePartyAffiliationExpansionSource:Object.freeze({ installed:true }),
    baziContextualForcePartyVisibleMotifE2ECalibrationSource:Object.freeze({ installed:true }),
    baziStrengthSynthesis:Object.freeze({
        registerExtension:(name, extension) => { extensions[name] = extension; },
        detectConflicts:() => Object.freeze([]),
        buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
            status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
        })
    })
};
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-collective-target-semantics-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity.js');

const GuiJia = context.GuiJia;
const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const contractApi = GuiJia.baziContextualForcePartyActorGroupIdentityContract;
const profileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile;
const runtimeApi = GuiJia.baziContextualForcePartyActorGroupIdentity;
const extension = extensions['contextual-force-party-actor-group-identity-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT','SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER','SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT','SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY'], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit:Object.freeze({ installed:true }),
    assessmentLayer:Object.freeze({ state:'contract-only' }),
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

function hasDependencyCycle(dependencies = []) {
    const graph = new Map(dependencies.map((item) => [item.id, item.dependsOnDependencyIds || []]));
    const visiting = new Set();
    const visited = new Set();
    const visit = (id) => {
        if (visiting.has(id)) return true;
        if (visited.has(id) || !graph.has(id)) return false;
        visiting.add(id);
        for (const next of graph.get(id)) if (visit(next)) return true;
        visiting.delete(id);
        visited.add(id);
        return false;
    };
    return [...graph.keys()].some(visit);
}

test('Actor Group Identity v0.1 contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'Actor Group Identity 三层未完整安装');
    assert(typeof extension === 'function', 'Synthesis extension 未注册');
    assert(contractApi.CONTRACT.resolverScope === 'audited-finite-same-role-single-scope-chart-case-only', 'v0.1 resolver scope 异常');
});

test('庚申 庚辰 甲戌 丙寅：庚金并透解析为两个 visible 七杀的 source-scoped group', () => {
    const group = profileApi.buildProfile().resolvedGroups.find((item) => item.sourceCaseId === 'CF-RTLC-CASE-04');
    assert(group?.groupId === 'CF-AGI-GROUP-01', 'CASE-04 groupId 异常');
    assert(group.targetRoleClass === '七杀' && group.scope === 'visible-stem', 'CASE-04 role/scope 异常');
    assert(group.cardinality === 2, 'CASE-04 cardinality 应为2');
    assert(JSON.stringify([...group.memberActorKeys]) === JSON.stringify(['visible:0:庚','visible:1:庚']), 'CASE-04 member actor keys 异常');
    assert(group.membershipComplete === true && group.sourceCaseScopedIdentity === true, 'CASE-04 membership/source scope 应完整');
});

test('壬申 丙午 庚午 丙戌：两杀解析为两个 visible 丙七杀的 source-scoped group', () => {
    const group = profileApi.buildProfile().resolvedGroups.find((item) => item.sourceCaseId === 'CF-RTLC-CASE-05');
    assert(group?.groupId === 'CF-AGI-GROUP-02', 'CASE-05 groupId 异常');
    assert(group.targetRoleClass === '七杀' && group.cardinality === 2, 'CASE-05 role/cardinality 异常');
    assert(JSON.stringify([...group.memberActorKeys]) === JSON.stringify(['visible:1:丙','visible:3:丙']), 'CASE-05 member actor keys 异常');
});

test('cardinality 必须与唯一 member actor 数完全一致', () => {
    const sourceCase = { ...targetSource.AUDIT_CASES.find((item) => item.id === 'CF-RTLC-CASE-04'), explicitCardinality:3 };
    const registry = contractApi.FINITE_GROUP_SOURCE_REGISTRY['CF-RTLC-CASE-04'];
    const result = profileApi.buildFiniteGroup(sourceCase, registry);
    assert(result.status === contractApi.GROUP_STATES.UNRESOLVED, 'cardinality mismatch 必须 unresolved');
    assert(result.validation.issues.includes('cardinality-member-count-mismatch'), '应记录 cardinality/member mismatch');
});

test('重复 actorKey 不得伪装成 cardinality 完整 group', () => {
    const base = targetSource.AUDIT_CASES.find((item) => item.id === 'CF-RTLC-CASE-04');
    const sourceCase = { ...base, chartLocalCandidateKeys:['visible:0:庚','visible:0:庚'], explicitCardinality:2 };
    const registry = contractApi.FINITE_GROUP_SOURCE_REGISTRY['CF-RTLC-CASE-04'];
    const result = profileApi.buildFiniteGroup(sourceCase, registry);
    assert(result.status === contractApi.GROUP_STATES.UNRESOLVED, 'duplicate member 必须 unresolved');
    assert(result.validation.issues.includes('duplicate-member-actor-key'), '应记录 duplicate member');
});

test('mixed visible/hidden scope 不进入 v0.1 finite group', () => {
    const base = targetSource.AUDIT_CASES.find((item) => item.id === 'CF-RTLC-CASE-04');
    const sourceCase = { ...base, chartLocalCandidateKeys:['visible:0:庚','hidden:1:庚'], explicitCardinality:2 };
    const registry = contractApi.FINITE_GROUP_SOURCE_REGISTRY['CF-RTLC-CASE-04'];
    const result = profileApi.buildFiniteGroup(sourceCase, registry);
    assert(result.status === contractApi.GROUP_STATES.UNRESOLVED, 'mixed scope 必须 unresolved');
    assert(result.validation.issues.includes('group-members-must-have-one-known-scope'), '应记录 mixed-scope blocker');
});

test('独杀 hidden case 与跨 scope collective wording 不被 v0.1 自动组团', () => {
    const profile = profileApi.buildProfile();
    assert(!profile.sourceCaseIds.includes('CF-RTLC-CASE-06'), '独杀 hidden case 不应进入 finite group registry');
    assert(profile.crossScopeGroups.length === 0, 'v0.1 不应生成 cross-scope group');
    assert(contractApi.CONTRACT.crossScopeGroupIdentityDefined === false, 'cross-scope group resolver 必须保持未定义');
    assert(contractApi.CONTRACT.singularActorIdentityDefined === false, 'singular actor identity 不在本层解决');
});

test('Group identity 不生成 member edges、collective effect、score 或 dominance', () => {
    const profile = profileApi.buildProfile();
    profile.resolvedGroups.forEach((group) => {
        assert(group.groupOutcomeExpandsToMemberEdges === false, 'group outcome 不得展开 member edges');
        assert(group.memberEdges.length === 0 && group.relationExecution === null, 'group identity 不得执行 relation');
        assert(group.numericWeight === null && group.relativeDominance === null, 'group identity 不得产生 numeric/dominance');
    });
    const keys = collectKeys({ contract:contractApi.CONTRACT, profile });
    ['memberEdgeResults','effectScore','groupScore','dominanceScore','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('Synthesis 只解析 group contract 与 visible finite coverage，cross-scope/collective execution 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT']?.status === 'resolved', 'group identity contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'visible finite coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER']?.status === 'unresolved', 'global target-level resolver 必须继续 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY']?.status === 'unresolved', 'cross-scope group 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION']?.status === 'unresolved', 'collective execution 必须 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('Actor Group Identity dependency graph 保持无环', () => {
    const synthesis = extendBase();
    assert(hasDependencyCycle(synthesis.dependencies) === false, 'Actor Group Identity dependency graph 不得形成环');
});

test('研究 bootstrap 顺序为 Curated Annotation → Actor Group Identity → Modern Support', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js',
        'bazi-contextual-force-party-actor-group-identity-contract.js',
        'bazi-contextual-force-party-actor-group-identity-profile.js',
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-relation-semantics-modern-support-source.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const filename = suffix
            ? `js/bazi-contextual-force-party-actor-group-identity-${suffix}.js`
            : 'js/bazi-contextual-force-party-actor-group-identity.js';
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nActor Group Identity v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
