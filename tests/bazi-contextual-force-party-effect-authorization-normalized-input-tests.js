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
const EFFECT_STATES = Object.freeze({ REALIZED:'realized-relation-effect-in-source-context', NOT_REALIZED:'not-realized-relation-effect-through-edge', UNRESOLVED:'unresolved-relation-effect-through-edge' });

const KNOWN_MOTIF = Object.freeze({
    id:'MOTIF-AA-OPP',
    relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
    functionType:'restraint',
    inputAuthority:'existing-source-backed-function-realization-edge',
    sourceRegistryEvidenceIds:Object.freeze(['E-AA-1'])
});

const extensions = {};
const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
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
        RULE_ID:'RULE-AA',
        RELATION_TYPES,
        EFFECT_STATES,
        MOTIFS:Object.freeze([KNOWN_MOTIF]),
        CONTRACT:Object.freeze({ id:'CONTRACT-AA', relationTypes:Object.freeze(Object.values(RELATION_TYPES)) })
    }),
    baziContextualForcePartyRelationEffectGeneralizationSource:Object.freeze({
        installed:true,
        REQUIRED_PROVENANCE_GATES:Object.freeze(['relation-identity','realization-state','relation-effect-type-authorization'])
    }),
    baziContextualForcePartyCollectiveRelationEffectContract:Object.freeze({
        installed:true,
        RULE_ID:'RULE-AG',
        CONTRACT:Object.freeze({ id:'CONTRACT-AG', allowedRelationTypes:Object.freeze([RELATION_TYPES.ANCHOR_OPPOSITION]) })
    }),
    baziContextualForcePartyCollectiveMediationEffectContract:Object.freeze({
        installed:true,
        RULE_ID:'RULE-GA',
        CONTRACT:Object.freeze({ id:'CONTRACT-GA', allowedRelationTypes:Object.freeze([RELATION_TYPES.ANCHOR_MEDIATION]) })
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
runFile(context, 'js/bazi-contextual-force-party-effect-authorization-normalized-input-contract.js');
runFile(context, 'js/bazi-contextual-force-party-effect-authorization-normalized-input-profile.js');
runFile(context, 'js/bazi-contextual-force-party-effect-authorization-normalized-input.js');

const GuiJia = context.GuiJia;
const contractApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
const profileApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const runtimeApi = GuiJia.baziContextualForcePartyEffectAuthorizationNormalizedInput;
const executionProfile = GuiJia.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const extension = extensions['contextual-force-party-effect-authorization-normalized-input-v01'];

const actorToActorRecord = (overrides = {}) => Object.freeze({
    id:'SRC-AA-1',
    motifId:KNOWN_MOTIF.id,
    relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
    functionType:'restraint',
    inputAuthority:KNOWN_MOTIF.inputAuthority,
    sourceRegistryEvidenceIds:Object.freeze(['E-AA-1']),
    sourceActorKey:'visible:0:丙',
    targetActorKey:'visible:1:庚',
    relationRecordId:'EDGE-AA-1',
    realizationState:'realized-in-source-context',
    relationEffectState:EFFECT_STATES.REALIZED,
    realized:true,
    ...overrides
});
const actorToGroupRecord = (overrides = {}) => Object.freeze({
    id:'SRC-AG-1',
    status:'resolved-source-scoped-collective-relation-effect',
    sourceCaseId:'CASE-AG-1',
    relationType:RELATION_TYPES.ANCHOR_OPPOSITION,
    functionType:'restraint',
    sourceActorKey:'visible:0:丙',
    targetGroupId:'GROUP-TARGET-1',
    targetScope:'visible-stem',
    targetMemberActorKeys:Object.freeze(['visible:1:庚','visible:3:辛']),
    targetCardinality:2,
    targetMembershipComplete:true,
    sourceWording:'任意已由上游验证的原文，仅作为 provenance 保存。',
    sourceOutcomeTerms:Object.freeze(['制杀']),
    executionAuthority:'exact-source-case-collective-outcome',
    relationEffectState:EFFECT_STATES.REALIZED,
    realized:true,
    memberEdgeExpansion:false,
    memberEdges:Object.freeze([]),
    validation:Object.freeze({ valid:true, issues:Object.freeze([]) }),
    ...overrides
});
const groupToActorRecord = (overrides = {}) => Object.freeze({
    id:'SRC-GA-1',
    status:EFFECT_STATES.REALIZED,
    sourceCaseId:'CASE-GA-1',
    motifId:'MOTIF-GA-MED',
    relationType:RELATION_TYPES.ANCHOR_MEDIATION,
    functionType:'generation',
    sourceGroupId:'GROUP-SOURCE-1',
    sourceScope:'visible-stem',
    sourceMemberActorKeys:Object.freeze(['visible:1:丙','visible:3:丙']),
    sourceCardinality:2,
    targetActorKey:'visible:0:戊',
    targetScope:'visible-stem',
    sourceWording:'任意已由上游验证的化杀原文，仅作为 provenance 保存。',
    sourceOutcomeTerms:Object.freeze(['化杀']),
    executionAuthority:'exact-source-case-collective-source-outcome',
    relationEffectState:EFFECT_STATES.REALIZED,
    realized:true,
    sourceMemberEdgeExpansion:false,
    sourceMemberEdges:Object.freeze([]),
    validation:Object.freeze({ valid:true, issues:Object.freeze([]) }),
    ...overrides
});
const synthesis = (overrides = {}) => Object.freeze({
    state:'available',
    contextualForcePartyGenericRelationEffectExecution:Object.freeze({ genericExecutionKernelDefined:true }),
    contextualForcePartyRelationEffectView:Object.freeze({ records:Object.freeze([actorToActorRecord()]) }),
    contextualForcePartyCollectiveRelationEffectRecords:Object.freeze([actorToGroupRecord()]),
    contextualForcePartyCollectiveMediationEffectRecords:Object.freeze([groupToActorRecord()]),
    claims:Object.freeze([]),
    dependencies:Object.freeze([
        Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) }),
        Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:Object.freeze([]), resolvedByClaimIds:Object.freeze([]) })
    ]),
    activeRuleIds:Object.freeze([]),
    boundaries:Object.freeze([]),
    ...overrides
});

const byFamily = (profile, family) => profile.records.find((item) => item.sourceFamily === family);

test('R5 Normalized Input v0.1 安装，明确只做 provenance normalization，不定义 generic effect-type resolver', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(contractApi.CONTRACT.normalizedInputDefinesNewEffectType === false, 'normalization 不得定义新 effect type');
    assert(contractApi.CONTRACT.genericEffectTypeAuthorizationResolverDefined === false, 'generic authorization resolver 必须继续未定义');
    assert(contractApi.CONTRACT.sourceWordingIsDecisionFeature === false, 'source wording 不得成为 decision feature');
});

test('actor→actor / actor→group / group→actor 三类现有 authority 可规整到同一 schema', () => {
    const profile = profileApi.buildProfile(synthesis());
    assert(profile.sourceRecordCount === 3 && profile.resolvedRecords.length === 3 && profile.unresolvedRecords.length === 0, '三类 source record 应全部规整');
    assert(profile.providedSourceRecordCoverageComplete === true, 'provided source coverage 应 complete');
    assert(byFamily(profile, contractApi.SOURCE_FAMILIES.ACTOR_TO_ACTOR_KNOWN_MOTIF).identityShape === IDENTITY_SHAPES.ACTOR_TO_ACTOR, 'actor→actor shape 错误');
    assert(byFamily(profile, contractApi.SOURCE_FAMILIES.ACTOR_TO_GROUP_FINITE_OUTCOME).identityShape === IDENTITY_SHAPES.ACTOR_TO_GROUP, 'actor→group shape 错误');
    assert(byFamily(profile, contractApi.SOURCE_FAMILIES.GROUP_TO_ACTOR_FINITE_MEDIATION).identityShape === IDENTITY_SHAPES.GROUP_TO_ACTOR, 'group→actor shape 错误');
});

test('normalized record 保留 contract/rule/record/case/authority/evidence provenance', () => {
    const profile = profileApi.buildProfile(synthesis());
    const aa = byFamily(profile, contractApi.SOURCE_FAMILIES.ACTOR_TO_ACTOR_KNOWN_MOTIF);
    assert(aa.provenance.sourceContractId === 'CONTRACT-AA' && aa.provenance.sourceRuleId === 'RULE-AA', 'actor→actor contract/rule provenance 丢失');
    assert(aa.provenance.sourceRecordId === 'SRC-AA-1' && aa.provenance.sourceAuthorityIds.includes(KNOWN_MOTIF.id), 'actor→actor record/authority provenance 丢失');
    assert(aa.provenance.sourceEvidenceIds.includes('E-AA-1'), 'actor→actor evidence provenance 丢失');
    const ag = byFamily(profile, contractApi.SOURCE_FAMILIES.ACTOR_TO_GROUP_FINITE_OUTCOME);
    assert(ag.provenance.sourceCaseId === 'CASE-AG-1' && ag.provenance.sourceExecutionAuthority === 'exact-source-case-collective-outcome', 'actor→group case/authority provenance 丢失');
    const ga = byFamily(profile, contractApi.SOURCE_FAMILIES.GROUP_TO_ACTOR_FINITE_MEDIATION);
    assert(ga.provenance.sourceCaseId === 'CASE-GA-1' && ga.provenance.sourceAuthorityIds.includes('MOTIF-GA-MED'), 'group→actor case/motif provenance 丢失');
});

test('source wording 只保存不重解析；改变 wording 不改变已验证 source record 的 normalization decision', () => {
    const a = profileApi.normalizeActorToGroup(actorToGroupRecord({ sourceWording:'甲文本' }), 0);
    const b = profileApi.normalizeActorToGroup(actorToGroupRecord({ sourceWording:'完全不同且无关键词的文本' }), 0);
    assert(a.normalizationState === contractApi.NORMALIZATION_STATES.RESOLVED && b.normalizationState === contractApi.NORMALIZATION_STATES.RESOLVED, 'upstream validated record 不应在 normalization 层重新按文字判定');
    assert(a.relationType === b.relationType && a.authorization.relationTypes[0] === b.authorization.relationTypes[0], 'wording 不得改变 effect type');
    assert(a.provenance.sourceWording !== b.provenance.sourceWording, 'wording 应作为 provenance 原样保存');
});

test('actor→actor motif provenance 不一致时 fail closed，不能从 restraint shape 猜 opposition', () => {
    const result = profileApi.normalizeActorToActor(actorToActorRecord({ relationType:RELATION_TYPES.ANCHOR_MEDIATION }), 0);
    assert(result.normalizationState === contractApi.NORMALIZATION_STATES.UNRESOLVED, 'motif mismatch 必须 unresolved');
    assert(result.blockerReasons.includes('relation-type-source-motif-mismatch'), '应报告 motif relation type mismatch');
    assert(result.authorization.relationTypes.length === 0, '不得从 function shape 补 effect type');
});

test('actor→actor source evidence 必须与已登记 motif authority 一致', () => {
    const result = profileApi.normalizeActorToActor(actorToActorRecord({ sourceRegistryEvidenceIds:Object.freeze(['OTHER-EVIDENCE']) }), 0);
    assert(result.normalizationState === contractApi.NORMALIZATION_STATES.UNRESOLVED, 'evidence mismatch 必须 unresolved');
    assert(result.blockerReasons.includes('source-evidence-source-motif-mismatch'), '应报告 source evidence mismatch');
});

test('collective authority 必须来自已通过 upstream validator 的 exact source record', () => {
    const ag = profileApi.normalizeActorToGroup(actorToGroupRecord({ validation:Object.freeze({ valid:false }) }), 0);
    assert(ag.normalizationState === contractApi.NORMALIZATION_STATES.UNRESOLVED && ag.blockerReasons.includes('source-record-validation-not-passed'), 'actor→group upstream validation failure 必须阻断');
    const ga = profileApi.normalizeGroupToActor(groupToActorRecord({ executionAuthority:'other-authority' }), 0);
    assert(ga.normalizationState === contractApi.NORMALIZATION_STATES.UNRESOLVED && ga.blockerReasons.includes('collective-mediation-authority-mismatch'), 'group→actor authority mismatch 必须阻断');
});

test('actor-group identity 不完整或出现 member-edge expansion 时 normalization fail closed', () => {
    const incomplete = profileApi.normalizeActorToGroup(actorToGroupRecord({ targetCardinality:3 }), 0);
    assert(incomplete.blockerReasons.includes('target-group-membership-incomplete'), 'target group cardinality mismatch 应阻断');
    const expanded = profileApi.normalizeGroupToActor(groupToActorRecord({ sourceMemberEdgeExpansion:true }), 0);
    assert(expanded.blockerReasons.includes('source-member-edge-expansion-detected'), 'source group member expansion 应阻断');
});

test('三类 normalized authorization 均可直接进入 R4 execution kernel，并保持原 endpoint shape', () => {
    const profile = profileApi.buildProfile(synthesis());
    const executions = profile.resolvedRecords.map((record) => executionProfile.executeRelationEffect(profileApi.toExecutionInput(record)));
    assert(executions.every((item) => item.executionState === 'realized-generic-relation-effect'), '三类 normalized input 均应由 R4 执行');
    assert(executions.map((item) => item.identityShape).includes(IDENTITY_SHAPES.ACTOR_TO_ACTOR), '缺 actor→actor execution');
    assert(executions.map((item) => item.identityShape).includes(IDENTITY_SHAPES.ACTOR_TO_GROUP), '缺 actor→group execution');
    assert(executions.map((item) => item.identityShape).includes(IDENTITY_SHAPES.GROUP_TO_ACTOR), '缺 group→actor execution');
    assert(executions.every((item) => item.memberEffects.length === 0), '不得生成 member effects');
});

test('Normalized Input → R4 execution calibration 对现有三类 source effect state 0 mismatch', () => {
    const calibration = profileApi.buildExecutionCalibration(synthesis());
    assert(calibration.comparableCount === 3, '应有3条可比较 source effect state');
    assert(calibration.mismatchCount === 0 && calibration.compatible === true, 'execution compatibility 应0 mismatch');
    assert(calibration.endpointShapes.length === 3, '应覆盖三种 endpoint shape');
    assert(calibration.memberEffectCount === 0, 'calibration 不得产生 member effect');
});

test('任一 source record normalization unresolved 时 coverage 不得伪报 complete', () => {
    const profile = profileApi.buildProfile(synthesis({
        contextualForcePartyCollectiveRelationEffectRecords:Object.freeze([actorToGroupRecord({ validation:Object.freeze({ valid:false }) })])
    }));
    assert(profile.unresolvedRecords.length === 1, '应保留 unresolved normalized record');
    assert(profile.providedSourceRecordCoverageComplete === false, 'coverage 不得 complete');
});

test('R5 extension 只解决 normalized input；Generic Authorization Resolver 与总 Generalization 继续 unresolved', () => {
    const result = extension({}, synthesis());
    const normalized = result.dependencies.find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-EFFECT-AUTHORIZATION-NORMALIZED-INPUT-CURRENT-SOURCE-COVERAGE');
    const resolver = result.dependencies.find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER');
    const generalization = result.dependencies.find((item) => item.id === 'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION');
    assert(normalized?.status === 'resolved', 'current source normalization coverage 应 resolved');
    assert(resolver?.status === 'unresolved', 'generic authorization resolver 必须 unresolved');
    assert(generalization?.status === 'unresolved' && generalization.dependsOnDependencyIds.includes(resolver.id), 'generalization 必须继续依赖 unresolved resolver');
    assert(result.sufficiency?.status === 'insufficient', '整体 sufficiency 不得因 normalization 变成 sufficient');
});

if (failed) {
    console.error(`\n${failed} failed, ${passed} passed`);
    process.exit(1);
}
console.log(`\n${passed} passed`);
