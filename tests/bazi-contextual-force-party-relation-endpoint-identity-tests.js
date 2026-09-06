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
const EFFECT_STATE = 'realized-relation-effect-in-source-context';
const extensions = {};
const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
context.GuiJia = {
    baziContextualForcePartyRelationEffectContract:Object.freeze({
        installed:true,
        CONTRACT:Object.freeze({
            id:'BAZI-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-CONTRACT-001',
            relationTypes:Object.freeze(Object.values(RELATION_TYPES)),
            targetSpecific:true,
            existingEdgeRequired:true
        })
    }),
    baziContextualForcePartyCollectiveRelationEffectContract:Object.freeze({
        installed:true,
        RELATION_TYPE:RELATION_TYPES.ANCHOR_OPPOSITION,
        EFFECT_STATE,
        CONTRACT:Object.freeze({
            id:'BAZI-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-CONTRACT-001',
            relationIdentityType:'actor-to-group',
            allowedRelationTypes:Object.freeze([RELATION_TYPES.ANCHOR_OPPOSITION])
        })
    }),
    baziContextualForcePartyCollectiveMediationEffectContract:Object.freeze({
        installed:true,
        RELATION_TYPE:RELATION_TYPES.ANCHOR_MEDIATION,
        EFFECT_STATE,
        CONTRACT:Object.freeze({
            id:'BAZI-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-CONTRACT-001',
            relationIdentityType:'group-to-actor',
            allowedRelationTypes:Object.freeze([RELATION_TYPES.ANCHOR_MEDIATION])
        })
    }),
    baziStrengthSynthesis:Object.freeze({
        registerExtension:(name, extension) => { extensions[name] = extension; },
        detectConflicts:() => Object.freeze([]),
        buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
            status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
        })
    })
};
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-relation-endpoint-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-relation-endpoint-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-relation-endpoint-identity.js');

const GuiJia = context.GuiJia;
const contractApi = GuiJia.baziContextualForcePartyRelationEndpointIdentityContract;
const profileApi = GuiJia.baziContextualForcePartyRelationEndpointIdentityProfile;
const runtimeApi = GuiJia.baziContextualForcePartyRelationEndpointIdentity;
const extension = extensions['contextual-force-party-relation-endpoint-identity-v01'];
const SHAPES = contractApi.IDENTITY_SHAPES;
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const ACTOR_TO_ACTOR = Object.freeze({
    id:'REL-A2A-01',
    sourceActorKey:'visible:0:甲',
    targetActorKey:'visible:1:庚',
    relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
    relationEffectState:EFFECT_STATE
});
const ACTOR_TO_GROUP = Object.freeze({
    id:'REL-A2G-01',
    relationIdentityType:'actor-to-group',
    sourceActorKey:'visible:3:丙',
    targetGroupId:'CF-AGI-GROUP-01',
    relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
    relationEffectState:EFFECT_STATE,
    memberEdgeExpansion:false
});
const GROUP_TO_ACTOR = Object.freeze({
    id:'REL-G2A-01',
    relationIdentityType:'group-to-actor',
    sourceGroupId:'CF-SAGI-GROUP-01',
    targetActorKey:'visible:0:戊',
    relationType:RELATION_TYPES.ANCHOR_MEDIATION,
    relationEffectState:EFFECT_STATE,
    sourceMemberEdgeExpansion:false
});

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = (overrides = {}) => extension({}, {
    state:'available',
    contextualForcePartyRelationEffectView:Object.freeze({ records:Object.freeze([ACTOR_TO_ACTOR]) }),
    contextualForcePartyCollectiveRelationEffectRecords:Object.freeze([ACTOR_TO_GROUP]),
    contextualForcePartyCollectiveMediationEffectRecords:Object.freeze([GROUP_TO_ACTOR]),
    assessmentLayer:Object.freeze({ state:'contract-only' }),
    claims:Object.freeze([]),
    dependencies:BASE_DEPENDENCIES,
    conflicts:Object.freeze([]),
    activeRuleIds:Object.freeze([]),
    boundaries:Object.freeze([]),
    sufficiency:Object.freeze({ status:'insufficient' }),
    ...overrides
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

test('Relation Endpoint Identity contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'endpoint identity 三层未完整安装');
    assert(typeof extension === 'function', 'endpoint identity Synthesis extension 未注册');
});

test('contract 只定义 actor→actor / actor→group / group→actor，group→group 保持未定义', () => {
    assert(contractApi.CONTRACT.actorToActorDefined === true, 'actor→actor 应 defined');
    assert(contractApi.CONTRACT.actorToGroupDefined === true, 'actor→group 应 defined');
    assert(contractApi.CONTRACT.groupToActorDefined === true, 'group→actor 应 defined');
    assert(contractApi.CONTRACT.groupToGroupDefined === false, 'group→group 必须 undefined');
    assert(Object.keys(contractApi.KNOWN_SHAPE_REGISTRY).length === 3, 'known shape registry 应只有三类');
});

test('三类现有 relation record 均被正确分类', () => {
    assert(profileApi.classifyRecordShape(ACTOR_TO_ACTOR) === SHAPES.ACTOR_TO_ACTOR, 'actor→actor 分类错误');
    assert(profileApi.classifyRecordShape(ACTOR_TO_GROUP) === SHAPES.ACTOR_TO_GROUP, 'actor→group 分类错误');
    assert(profileApi.classifyRecordShape(GROUP_TO_ACTOR) === SHAPES.GROUP_TO_ACTOR, 'group→actor 分类错误');
});

test('group→group record 明确被拒绝', () => {
    const record = { id:'REL-G2G-01', sourceGroupId:'G1', targetGroupId:'G2', relationIdentityType:'group-to-group' };
    const validation = profileApi.validateRecordShape(record);
    assert(validation.valid === false, 'group→group 不得通过');
    assert(validation.issues.includes('group-to-group-shape-not-defined'), '应记录 group→group undefined');
});

test('声明 identity type 与 endpoint fields 不一致时 hard fail', () => {
    const record = { ...ACTOR_TO_GROUP, relationIdentityType:'group-to-actor' };
    const validation = profileApi.validateRecordShape(record, SHAPES.ACTOR_TO_GROUP);
    assert(validation.valid === false && validation.issues.includes('declared-relation-identity-type-mismatch'), '声明 shape mismatch 必须 fail');
});

test('endpoint shape 不决定 effect type 或 realization', () => {
    assert(contractApi.CONTRACT.endpointShapeDefinesEffectType === false, 'shape 不得定义 effect type');
    assert(contractApi.CONTRACT.endpointShapeDefinesRealization === false, 'shape 不得定义 realization');
    const alternateActorRelation = { ...ACTOR_TO_ACTOR, id:'REL-A2A-02', relationType:RELATION_TYPES.ANCHOR_MEDIATION };
    assert(profileApi.validateRecordShape(alternateActorRelation, SHAPES.ACTOR_TO_ACTOR).valid === true, 'endpoint validator 不应按 effect type 拒绝同 shape');
});

test('Profile 对三类 observed records 验证完整', () => {
    const profile = profileApi.buildProfile({
        contextualForcePartyRelationEffectView:{ records:[ACTOR_TO_ACTOR] },
        contextualForcePartyCollectiveRelationEffectRecords:[ACTOR_TO_GROUP],
        contextualForcePartyCollectiveMediationEffectRecords:[GROUP_TO_ACTOR]
    });
    assert(profile.contractShapeCoverageComplete === true, 'contract shape coverage 应 complete');
    assert(profile.observedRecordCount === 3 && profile.observedRecordsValid === true, '三条 observed records 应全 valid');
    assert(profile.blockerRecords.length === 0, '不应有 endpoint blocker');
});

test('group member edge expansion 会使 endpoint record validation 失败', () => {
    const bad = { ...ACTOR_TO_GROUP, memberEdgeExpansion:true };
    const validation = profileApi.validateRecordShape(bad, SHAPES.ACTOR_TO_GROUP);
    assert(validation.valid === false && validation.issues.includes('group-member-edge-expansion-detected'), 'member edge expansion 必须 fail');
});

test('Synthesis 解析 endpoint contract/coverage，但 generic mapping 与 generalization 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT']?.status === 'resolved', 'endpoint contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-KNOWN-SHAPE-COVERAGE']?.status === 'resolved', 'known shape coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING']?.status === 'unresolved', 'generic visible mapping 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'global generalization 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-KNOWN-SHAPE-COVERAGE'), 'generalization 应消费 endpoint coverage gate');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('Endpoint identity dependency graph 无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'endpoint identity dependency graph 不得成环');
});

test('Endpoint identity 不引入 score / threshold / dominance / final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyRelationEndpointIdentity;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 应 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit });
    ['endpointScore','relationScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序为两类 finite calibration → Endpoint Identity → Modern Support', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-source-set-mediation-e2e-calibration.js',
        'bazi-contextual-force-party-actor-set-opposition-e2e-calibration.js',
        'bazi-contextual-force-party-relation-endpoint-identity-contract.js',
        'bazi-contextual-force-party-relation-endpoint-identity-profile.js',
        'bazi-contextual-force-party-relation-endpoint-identity.js',
        'bazi-contextual-force-party-relation-semantics-modern-support-source.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    [
        'js/bazi-contextual-force-party-relation-endpoint-identity-contract.js',
        'js/bazi-contextual-force-party-relation-endpoint-identity-profile.js',
        'js/bazi-contextual-force-party-relation-endpoint-identity.js'
    ].forEach((filename) => {
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nRelation Endpoint Identity v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
