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

const RELATION_TYPES = Object.freeze({
    ANCHOR_AUGMENTATION:'anchor-augmentation',
    ANCHOR_OPPOSITION:'anchor-opposition',
    ANCHOR_MEDIATION:'anchor-mediation'
});
const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
const extensions = {};
context.GuiJia = {
    baziContextualForcePartyAffiliationExpansionSource:Object.freeze({ installed:true, RELATION_TYPES }),
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
runFile(context, 'js/bazi-contextual-force-party-relation-effect-contract.js');
runFile(context, 'js/bazi-contextual-force-party-collective-target-semantics-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect-contract.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect-profile.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect.js');

const GuiJia = context.GuiJia;
const singleContract = GuiJia.baziContextualForcePartyRelationEffectContract;
const groupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile;
const contractApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectContract;
const profileApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile;
const runtimeApi = GuiJia.baziContextualForcePartyCollectiveRelationEffect;
const extension = extensions['contextual-force-party-collective-relation-effect-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER','SD-CONTEXTUAL-FORCE-PARTY-CROSS-SCOPE-ROLE-INSTANCE-GROUP-IDENTITY'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyActorGroupIdentity:Object.freeze({ installed:true }),
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

test('Collective Relation Effect v0.1 contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'collective effect 三层未完整安装');
    assert(typeof extension === 'function', 'collective effect Synthesis extension 未注册');
    assert(contractApi.CONTRACT.relationIdentityType === 'actor-to-group', 'relation identity 必须是 actor-to-group');
});

test('庚金并透 case：丙食神对两庚七杀 group 形成 source-scoped collective opposition', () => {
    const record = profileApi.buildProfile().resolvedRecords.find((item) => item.sourceCaseId === 'CF-RTLC-CASE-04');
    assert(record?.sourceActorKey === 'visible:3:丙', 'CASE-04 source actor 异常');
    assert(record.targetGroupId === 'CF-AGI-GROUP-01' && record.targetCardinality === 2, 'CASE-04 target group 异常');
    assert(record.relationType === RELATION_TYPES.ANCHOR_OPPOSITION && record.functionType === 'restraint', 'CASE-04 effect type 异常');
    assert(record.realized === true && record.sourceOutcomeTerms.includes('制杀'), 'CASE-04 collective source outcome 应兑现');
});

test('两杀 case：壬食神对两丙七杀 group 形成 source-scoped collective opposition', () => {
    const record = profileApi.buildProfile().resolvedRecords.find((item) => item.sourceCaseId === 'CF-RTLC-CASE-05');
    assert(record?.sourceActorKey === 'visible:0:壬', 'CASE-05 source actor 异常');
    assert(record.targetGroupId === 'CF-AGI-GROUP-02' && record.targetCardinality === 2, 'CASE-05 target group 异常');
    assert(record.sourceTenGod === '食神' && record.targetRoleClass === '七杀', 'CASE-05 role semantics 异常');
});

test('source actor 必须与 target group 的同一 source-case provenance 对齐', () => {
    const entry = { ...contractApi.FINITE_COLLECTIVE_EFFECT_REGISTRY['CF-RTLC-CASE-04'], sourceActorKey:'visible:0:壬' };
    const group = groupProfileApi.buildProfile().resolvedGroups.find((item) => item.groupId === 'CF-AGI-GROUP-01');
    const record = profileApi.buildCollectiveEffectRecord(entry, group);
    assert(record.realized === false, '错配 source actor 不得执行 collective effect');
    assert(record.validation.issues.includes('source-actor-not-in-group-case-provenance'), '应记录 source actor provenance mismatch');
});

test('cross-scope target group 不得借 visible finite contract 执行', () => {
    const entry = contractApi.FINITE_COLLECTIVE_EFFECT_REGISTRY['CF-RTLC-CASE-04'];
    const baseGroup = groupProfileApi.buildProfile().resolvedGroups.find((item) => item.groupId === 'CF-AGI-GROUP-01');
    const group = { ...baseGroup, scope:'cross-scope' };
    const record = profileApi.buildCollectiveEffectRecord(entry, group);
    assert(record.realized === false, 'cross-scope group 必须 unresolved');
    assert(record.validation.issues.includes('cross-scope-group-not-authorized'), '应记录 cross-scope blocker');
});

test('collective opposition 永不展开 member edges，也不合成 member-specific realization', () => {
    profileApi.buildProfile().resolvedRecords.forEach((record) => {
        assert(record.memberEdgeExpansion === false && record.memberEdges.length === 0, '不得展开 member edges');
        assert(record.memberSpecificRealizationSynthesized === false, '不得合成 member-specific realization');
        assert(record.independentForceUnit === false, 'collective record 不得直接变成独立 force unit');
    });
});

test('“制杀扶身”只保存 source outcome qualifier，不创建日主受益 edge', () => {
    const record = profileApi.buildProfile().resolvedRecords.find((item) => item.sourceCaseId === 'CF-RTLC-CASE-04');
    assert(record.sourceOutcomeTerms.includes('扶身'), '应保留来源“扶身”限定词');
    assert(record.daymasterBenefit === null, '不得把“扶身”自动执行为 daymaster benefit');
});

test('single-actor Relation Effect 合同保持 target-specific/existing-edge，不因 collective execution 被放宽', () => {
    assert(singleContract.CONTRACT.targetSpecific === true, 'single-actor contract targetSpecific 不得改变');
    assert(singleContract.CONTRACT.existingEdgeRequired === true, 'single-actor contract existingEdgeRequired 不得改变');
    assert(contractApi.CONTRACT.singleActorRelationEffectContractMutation === false, 'collective contract 必须声明不修改 single-actor contract');
    assert(contractApi.CONTRACT.existingMemberSpecificFunctionEdgesRequired === false, 'group effect 不应伪装依赖 member-specific edges');
});

test('Synthesis 只解析 collective execution contract 与 visible finite coverage，global collective 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT']?.status === 'resolved', 'collective contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'visible finite collective coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION']?.status === 'unresolved', 'global collective execution 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION']?.status === 'unresolved', 'generic opposition calibration 必须继续 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('Collective effect 不引入 score、dominance、membership mutation 或 final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCollectiveRelationEffect;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 必须保持 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit, records:synthesis.contextualForcePartyCollectiveRelationEffectRecords });
    ['effectScore','groupScore','dominanceScore','majorityResult','rankingResult','finalStrength','daymasterBenefitEdge'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('Collective Relation Effect dependency graph 保持无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'collective effect dependency graph 不得形成环');
});

test('研究 bootstrap 顺序为 Actor Group Identity → Collective Relation Effect → Modern Support', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-collective-relation-effect-contract.js',
        'bazi-contextual-force-party-collective-relation-effect-profile.js',
        'bazi-contextual-force-party-collective-relation-effect.js',
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
            ? `js/bazi-contextual-force-party-collective-relation-effect-${suffix}.js`
            : 'js/bazi-contextual-force-party-collective-relation-effect.js';
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nCollective Relation Effect v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
