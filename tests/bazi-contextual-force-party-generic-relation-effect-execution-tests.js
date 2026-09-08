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
const ENDPOINT_TYPES = Object.freeze({ ACTOR:'actor', ACTOR_GROUP:'actor-group' });
const IDENTITY_SHAPES = Object.freeze({ ACTOR_TO_ACTOR:'actor-to-actor', ACTOR_TO_GROUP:'actor-to-group', GROUP_TO_ACTOR:'group-to-actor', GROUP_TO_GROUP:'group-to-group' });
const TARGET_LEVELS = Object.freeze({ ROLE_CLASS:'role-class', ACTOR_SET:'actor-set', SINGLE_ACTOR:'single-actor', CONFIGURATION:'configuration' });
const TARGET_RESOLUTION_STATES = Object.freeze({
    RESOLVED_ROLE_CLASS:'resolved-generic-role-class',
    RESOLVED_ACTOR_SET:'resolved-generic-actor-set',
    RESOLVED_SINGLE_ACTOR:'resolved-generic-single-actor',
    RESOLVED_CONFIGURATION:'resolved-generic-configuration',
    RESOLVED_RELATION_TARGET_RECORD:'resolved-generic-relation-target-record',
    NOT_APPLICABLE_NO_RELATION_TARGET:'not-applicable-no-relation-target',
    UNRESOLVED_UNIT:'unresolved-generic-target-unit',
    UNRESOLVED_RECORD:'unresolved-generic-target-record'
});
const TARGET_REFERENCE_TYPES = Object.freeze({ ROLE_CLASS:'role-class', ACTOR_GROUP:'actor-group', ACTOR_KEY:'actor-key', CONFIGURATION_STATE:'configuration-state', NONE:'none' });
const RELATION_TYPES = Object.freeze({ ANCHOR_AUGMENTATION:'anchor-augmentation', ANCHOR_OPPOSITION:'anchor-opposition', ANCHOR_MEDIATION:'anchor-mediation' });

const extensions = {};
context.GuiJia = {
    baziContextualForcePartyRelationEndpointIdentityContract:Object.freeze({
        installed:true,
        ENDPOINT_TYPES,
        IDENTITY_SHAPES,
        CONTRACT:Object.freeze({ knownIdentityShapes:Object.freeze([IDENTITY_SHAPES.ACTOR_TO_ACTOR,IDENTITY_SHAPES.ACTOR_TO_GROUP,IDENTITY_SHAPES.GROUP_TO_ACTOR]) })
    }),
    baziContextualForcePartyGenericTargetLevelResolverContract:Object.freeze({
        installed:true,
        TARGET_LEVELS,
        RESOLUTION_STATES:TARGET_RESOLUTION_STATES,
        TARGET_REFERENCE_TYPES
    }),
    baziContextualForcePartyRelationEffectContract:Object.freeze({
        installed:true,
        RELATION_TYPES,
        CONTRACT:Object.freeze({ relationTypes:Object.freeze(Object.values(RELATION_TYPES)) })
    }),
    baziContextualForcePartyRelationEffectGeneralizationSource:Object.freeze({
        installed:true,
        REQUIRED_PROVENANCE_GATES:Object.freeze(['stable-source-and-target-actor-identity','relation-identity','source-pattern-or-equivalent-semantic-authority','realization-state','relation-effect-type-authorization'])
    })
};
context.GuiJia.baziStrengthSynthesis = Object.freeze({
    registerExtension:(name, extension) => { extensions[name] = extension; },
    detectConflicts:() => Object.freeze([]),
    buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({ status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient' })
});
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-generic-relation-effect-execution-contract.js');
runFile(context, 'js/bazi-contextual-force-party-generic-relation-effect-execution-profile.js');
runFile(context, 'js/bazi-contextual-force-party-generic-relation-effect-execution.js');

const GuiJia = context.GuiJia;
const contractApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionContract;
const profileApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const runtimeApi = GuiJia.baziContextualForcePartyGenericRelationEffectExecution;
const extension = extensions['contextual-force-party-generic-relation-effect-execution-v01'];

const singleTarget = (actorKey = 'visible:month:甲', scope = 'chart-case') => Object.freeze({
    resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_SINGLE_ACTOR,
    semanticLevel:TARGET_LEVELS.SINGLE_ACTOR,
    targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_KEY,
    targetReference:Object.freeze({ actorKey, scope })
});
const groupTarget = ({ groupId = 'group:killers', members = ['visible:month:庚','visible:hour:辛'], cardinality = members.length, scope = 'chart-case' } = {}) => Object.freeze({
    resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_ACTOR_SET,
    semanticLevel:TARGET_LEVELS.ACTOR_SET,
    targetReferenceType:TARGET_REFERENCE_TYPES.ACTOR_GROUP,
    targetReference:Object.freeze({ groupId, memberActorKeys:Object.freeze([...members]), cardinality, scope })
});
const sourceActor = (actorKey = 'visible:year:丙') => Object.freeze({ type:ENDPOINT_TYPES.ACTOR, actorKey, cardinality:1, scope:'chart-case', sourceScoped:true });
const sourceGroup = ({ groupId = 'group:sources', members = ['visible:year:丙','visible:day:丁'], cardinality = members.length, sourceScoped = true } = {}) => Object.freeze({ type:ENDPOINT_TYPES.ACTOR_GROUP, groupId, memberActorKeys:Object.freeze([...members]), cardinality, scope:'chart-case', sourceScoped });
const relation = (overrides = {}) => Object.freeze({ id:'relation:synthetic:1', functionType:'restraint', directed:true, ...overrides });
const authorized = (relationType = RELATION_TYPES.ANCHOR_OPPOSITION, overrides = {}) => Object.freeze({
    state:'authorized-source-backed-effect-type',
    relationTypes:Object.freeze([relationType]),
    authorityIds:Object.freeze(['motif:synthetic:1']),
    sourceEvidenceIds:Object.freeze(['source:evidence:1']),
    sourceBacked:true,
    ...overrides
});
const input = (overrides = {}) => Object.freeze({
    id:'input:synthetic:1',
    sourceEndpoint:sourceActor(),
    targetResolution:singleTarget(),
    relationIdentity:relation(),
    realizationState:'realized-in-source-context',
    authorization:authorized(),
    ...overrides
});

const execute = (overrides = {}) => profileApi.executeRelationEffect(input(overrides));

test('Generic Relation Effect Execution v0.1 安装，execution kernel 与 effect-type mapping 明确分层', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(contractApi.CONTRACT.genericExecutionKernelDefined === true, 'generic execution kernel 应已定义');
    assert(contractApi.CONTRACT.genericEffectTypeMappingDefined === false, 'generic effect-type mapping 不得提前标记完成');
    assert(contractApi.CONTRACT.relationIdentityAloneDefinesEffectType === false && contractApi.CONTRACT.realizationAloneDefinesEffectType === false, 'relation identity/realization 不得单独授权 effect type');
});

test('realized + 唯一 source-backed authorization 可执行 actor→actor effect', () => {
    const result = execute();
    assert(result.executionState === 'realized-generic-relation-effect' && result.realized === true, '应执行 realized effect');
    assert(result.effectType === RELATION_TYPES.ANCHOR_OPPOSITION, 'effect type 应来自 authorization');
    assert(result.identityShape === IDENTITY_SHAPES.ACTOR_TO_ACTOR, '应保留 actor→actor endpoint shape');
    assert(result.memberEffects.length === 0 && result.membershipMutation === null && result.numericWeight === null, '不得生成 member effect / membership / numeric weight');
});

test('function shape 本身不能决定 effect type；realized 但 current registry unmapped 必须保持 realized-unmapped', () => {
    ['generation','restraint','peer'].forEach((functionType) => {
        const result = execute({
            relationIdentity:relation({ functionType }),
            authorization:Object.freeze({ state:'realized-edge-currently-unmapped', relationTypes:Object.freeze([]), authorityIds:Object.freeze([]), sourceEvidenceIds:Object.freeze([]), sourceBacked:false })
        });
        assert(result.executionState === 'realized-relation-currently-unmapped', `${functionType} 未授权时应 realized-unmapped`);
        assert(result.effectType === null && result.currentRegistryNoMatchIsSemanticRejection === false, `${functionType} 不得自动映射 effect type`);
    });
});

test('缺 effect-type authorization 时 fail closed，不得用 relation identity/文本补全', () => {
    const result = execute({ authorization:Object.freeze({ state:'unresolved-effect-type-authorization' }), sourceText:'食神制杀' });
    assert(result.executionState === 'unresolved-generic-relation-effect', '缺 authorization 必须 unresolved');
    assert(result.blockerReasons.includes('effect-type-authorization-unresolved'), '应报告 authorization blocker');
});

test('一个 relation 同时被授权多个 effect type 时必须 unresolved', () => {
    const result = execute({ authorization:authorized(RELATION_TYPES.ANCHOR_OPPOSITION, { relationTypes:Object.freeze([RELATION_TYPES.ANCHOR_OPPOSITION,RELATION_TYPES.ANCHOR_MEDIATION]) }) });
    assert(result.executionState === 'unresolved-generic-relation-effect', '冲突 authorization 必须 unresolved');
    assert(result.blockerReasons.includes('multiple-effect-types-conflict'), '应报告 effect-type conflict');
});

test('authorization 必须显式 source-backed 且有 authority/evidence provenance', () => {
    const noSourceBack = execute({ authorization:authorized(RELATION_TYPES.ANCHOR_OPPOSITION, { sourceBacked:false }) });
    assert(noSourceBack.blockerReasons.includes('effect-type-authorization-not-source-backed'), '非 source-backed authorization 必须阻断');
    const noEvidence = execute({ authorization:authorized(RELATION_TYPES.ANCHOR_OPPOSITION, { sourceEvidenceIds:Object.freeze([]) }) });
    assert(noEvidence.blockerReasons.includes('effect-type-source-evidence-missing'), '缺 source evidence 必须阻断');
});

test('not-realized relation 只记录 not-realized，不生成 reverse effect', () => {
    const result = execute({ realizationState:'not-realized-in-source-context' });
    assert(result.executionState === 'not-realized-generic-relation-effect' && result.realized === false, '应为 not-realized');
    assert(result.effectType === null, '未兑现不应激活 positive effect type');
    assert(result.reverseEffect === null, '不得生成 reverse effect');
});

test('realization 未解时 relation effect 必须 unresolved', () => {
    const result = execute({ realizationState:'unresolved-realization' });
    assert(result.executionState === 'unresolved-generic-relation-effect', '未解 realization 必须 unresolved');
    assert(result.blockerReasons.includes('relation-realization-unresolved'), '应报告 realization blocker');
});

test('actor→group effect 保留 group endpoint，不自动拆成 member effects', () => {
    const result = execute({ targetResolution:groupTarget() });
    assert(result.executionState === 'realized-generic-relation-effect', 'actor→group 应可执行已授权 effect');
    assert(result.identityShape === IDENTITY_SHAPES.ACTOR_TO_GROUP, 'endpoint shape 应 actor→group');
    assert(result.targetEndpoint.groupId === 'group:killers' && result.targetEndpoint.cardinality === 2, '应保留完整 group identity');
    assert(result.memberEffects.length === 0, '不得自动展开 member effects');
});

test('group→actor effect 在 source group provenance 完整时可执行', () => {
    const result = execute({ sourceEndpoint:sourceGroup(), targetResolution:singleTarget('visible:month:壬') });
    assert(result.executionState === 'realized-generic-relation-effect', 'group→actor 应可执行');
    assert(result.identityShape === IDENTITY_SHAPES.GROUP_TO_ACTOR, 'endpoint shape 应 group→actor');
    assert(result.sourceEndpoint.groupId === 'group:sources' && result.memberEffects.length === 0, '应保留 source group，不拆成员');
});

test('group→group 仍未定义，必须 fail closed', () => {
    const result = execute({ sourceEndpoint:sourceGroup(), targetResolution:groupTarget() });
    assert(result.executionState === 'unresolved-generic-relation-effect', 'group→group 必须 unresolved');
    assert(result.blockerReasons.includes('relation-endpoint-shape-unsupported'), '应报告 unsupported endpoint shape');
});

test('actor-group endpoint 的 cardinality/membership/source-scoped provenance 缺失时不得执行', () => {
    const incompleteTarget = execute({ targetResolution:groupTarget({ members:['visible:month:庚'], cardinality:2 }) });
    assert(incompleteTarget.blockerReasons.includes('target-group-membership-incomplete'), 'target group membership 不完整应阻断');
    const unscopedSource = execute({ sourceEndpoint:sourceGroup({ sourceScoped:false }) });
    assert(unscopedSource.blockerReasons.includes('source-group-must-be-source-scoped'), 'source group 非 source-scoped 应阻断');
});

test('role-class / configuration / no-relation-target 不执行 chart-instance relation effect', () => {
    const role = execute({ targetResolution:Object.freeze({ resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_ROLE_CLASS, semanticLevel:TARGET_LEVELS.ROLE_CLASS, targetReferenceType:TARGET_REFERENCE_TYPES.ROLE_CLASS, targetReference:Object.freeze({ roleClasses:Object.freeze(['七杀']) }) }) });
    const configuration = execute({ targetResolution:Object.freeze({ resolutionState:TARGET_RESOLUTION_STATES.RESOLVED_CONFIGURATION, semanticLevel:TARGET_LEVELS.CONFIGURATION, targetReferenceType:TARGET_REFERENCE_TYPES.CONFIGURATION_STATE, targetReference:Object.freeze({ configurationSpans:Object.freeze(['某结构']) }) }) });
    const noTarget = execute({ targetResolution:Object.freeze({ resolutionState:TARGET_RESOLUTION_STATES.NOT_APPLICABLE_NO_RELATION_TARGET, semanticLevel:null, targetReferenceType:TARGET_REFERENCE_TYPES.NONE, targetReference:null }) });
    [role,configuration,noTarget].forEach((item) => assert(item.executionState === 'generic-relation-effect-not-applicable', '非 instance target 应 not-applicable'));
});

test('target-level unresolved 时 relation effect 继续 unresolved', () => {
    const result = execute({ targetResolution:Object.freeze({ resolutionState:TARGET_RESOLUTION_STATES.UNRESOLVED_UNIT, semanticLevel:null, targetReference:null }) });
    assert(result.executionState === 'unresolved-generic-relation-effect', 'unresolved target 必须阻断 effect');
    assert(result.blockerReasons.includes('target-resolution-unresolved'), '应报告 target-resolution blocker');
});

test('directed=false 的 peer/对称 relation 不得伪造 source→target effect', () => {
    const result = execute({ relationIdentity:relation({ functionType:'peer', directed:false }) });
    assert(result.executionState === 'unresolved-generic-relation-effect', '非 directed relation 必须 unresolved');
    assert(result.blockerReasons.includes('directed-relation-required'), '应报告 directed relation required');
});

test('case id / source text 改变不影响 generic execution decision', () => {
    const a = profileApi.executeRelationEffect(input({ id:'CASE-A', sourceText:'食神制杀' }));
    const b = profileApi.executeRelationEffect(input({ id:'TOTALLY-UNRELATED-ID', sourceText:'completely unrelated prose' }));
    assert(a.executionState === b.executionState && a.effectType === b.effectType && a.identityShape === b.identityShape, 'generic kernel 不应依赖 case id/source text');
});

test('Known motif adapter 可保持既有 realized/not-realized effect state 兼容', () => {
    const realizedInput = profileApi.adaptKnownRelationEffectRecord({
        id:'old:1', motifId:'motif:old:1', relationType:RELATION_TYPES.ANCHOR_OPPOSITION, sourceRegistryEvidenceIds:['e1'], sourceActorKey:'visible:year:丙', targetActorKey:'visible:month:庚', relationRecordId:'edge:1', functionType:'restraint', realizationState:'realized-in-source-context', relationEffectState:'realized-relation-effect-in-source-context', realized:true
    }, 0);
    const notRealizedInput = profileApi.adaptKnownRelationEffectRecord({
        id:'old:2', motifId:'motif:old:2', relationType:RELATION_TYPES.ANCHOR_MEDIATION, sourceRegistryEvidenceIds:['e2'], sourceActorKey:'visible:month:庚', targetActorKey:'visible:hour:壬', relationRecordId:'edge:2', functionType:'generation', realizationState:'not-realized-in-source-context', relationEffectState:'not-realized-relation-effect-through-edge', realized:false
    }, 1);
    assert(profileApi.compatibleWithExistingState(profileApi.executeRelationEffect(realizedInput), realizedInput) === true, 'realized old state 应兼容');
    assert(profileApi.compatibleWithExistingState(profileApi.executeRelationEffect(notRealizedInput), notRealizedInput) === true, 'not-realized old state 应兼容');
});

test('Synthesis 只解析 generic execution mechanics；Cross-Actor Relation Effect Generalization 仍 unresolved', () => {
    const base = {
        state:'available',
        contextualForcePartyGenericTargetLevelResolver:Object.freeze({ installed:true }),
        contextualForcePartyRelationEffectGeneralizationSourceAudit:Object.freeze({ installed:true }),
        contextualForcePartyRelationEffectView:Object.freeze({ records:Object.freeze([]) }),
        claims:Object.freeze([]),
        dependencies:Object.freeze([
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT', status:'resolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-ENDPOINT-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERALIZATION-SOURCE-AUDIT', status:'resolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-MODEL', status:'resolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-BRANCH-REALIZATION', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-STRUCTURE-ACTOR-PAIR-BRIDGE', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-HIDDEN-CROSS-SCOPE-REALIZATION', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) })
        ]),
        conflicts:Object.freeze([]),
        activeRuleIds:Object.freeze([]),
        boundaries:Object.freeze([]),
        sufficiency:Object.freeze({ status:'insufficient' })
    };
    const synthesis = extension({}, base);
    const deps = Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-GENERIC-RELATION-EFFECT-EXECUTION-CONTRACT']?.status === 'resolved', 'generic execution contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'overall relation-effect generalization 必须继续 unresolved');
    assert(synthesis.contextualForcePartyGenericRelationEffectExecution?.genericEffectTypeMappingDefined === false, '不得声称 generic effect-type mapping 完成');
    assert(synthesis.sufficiency.status === 'insufficient', 'Strength sufficiency 不得因本层开放');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
