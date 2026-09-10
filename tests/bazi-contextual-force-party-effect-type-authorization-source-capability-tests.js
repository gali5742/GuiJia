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

const IDENTITY_SHAPES = Object.freeze({
    ACTOR_TO_ACTOR:'actor-to-actor',
    ACTOR_TO_GROUP:'actor-to-group',
    GROUP_TO_ACTOR:'group-to-actor',
    GROUP_TO_GROUP:'group-to-group'
});
const MOTIFS = Object.freeze([
    Object.freeze({ id:'motif:wealth-killer', relationType:'anchor-augmentation', functionType:'generation' }),
    Object.freeze({ id:'motif:food-killer', relationType:'anchor-opposition', functionType:'restraint' }),
    Object.freeze({ id:'motif:killer-seal', relationType:'anchor-mediation', functionType:'generation' })
]);
const extensions = {};
const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
context.GuiJia = {
    baziContextualForcePartyEffectAuthorizationNormalizedInputContract:Object.freeze({ installed:true, IDENTITY_SHAPES }),
    baziContextualForcePartyRelationEffectContract:Object.freeze({ installed:true, MOTIFS }),
    baziContextualForcePartyCollectiveRelationEffectContract:Object.freeze({
        installed:true,
        FINITE_COLLECTIVE_EFFECT_REGISTRY:Object.freeze({
            case04:Object.freeze({ id:'collective:opp:04' }),
            case05:Object.freeze({ id:'collective:opp:05' })
        })
    }),
    baziContextualForcePartyCollectiveMediationEffectContract:Object.freeze({
        installed:true,
        FINITE_COLLECTIVE_MEDIATION_REGISTRY:Object.freeze({ case04:Object.freeze({ id:'collective:med:04' }) })
    }),
    baziContextualForcePartyRelationEffectGeneralizationSource:Object.freeze({
        installed:true,
        EVIDENCE:Object.freeze([
            Object.freeze({ id:'CF-REG-E01' }), Object.freeze({ id:'CF-REG-E02' }), Object.freeze({ id:'CF-REG-E03' })
        ])
    }),
    baziContextualForcePartyVisibleEdgeEffectTypeAuthorizationSource:Object.freeze({
        installed:true,
        CONTRACT:Object.freeze({ positiveAuthorizedDirectPatternObserved:false }),
        EVIDENCE:Object.freeze([Object.freeze({ id:'CF-VEA-E01' }),Object.freeze({ id:'CF-VEA-E03' })])
    }),
    baziContextualForcePartyRelationSemanticsModernSupportSource:Object.freeze({
        installed:true,
        CONTRACT:Object.freeze({ relationPositionProvenanceResolverDefined:false, competingRelationPathResolverDefined:false }),
        EVIDENCE:Object.freeze([Object.freeze({ id:'CF-RSMS-E02' }),Object.freeze({ id:'CF-RSMS-E04' }),Object.freeze({ id:'CF-RSMS-E05' })])
    })
};
context.GuiJia.baziStrengthSynthesis = Object.freeze({
    registerExtension:(name, extension) => { extensions[name] = extension; },
    detectConflicts:() => Object.freeze([]),
    buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
        status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
    })
});
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-effect-type-authorization-source-capability-source.js');
runFile(context, 'js/bazi-contextual-force-party-effect-type-authorization-source-capability-audit.js');

const sourceApi = context.GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilitySource;
const auditApi = context.GuiJia.baziContextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit;
const extension = extensions['contextual-force-party-effect-type-authorization-source-capability-audit-v01'];

test('R6 Source Capability Audit 安装且不定义 generic resolver', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit/extension 未安装');
    assert(sourceApi.VERSION === '0.1', 'version 应为0.1');
    assert(sourceApi.CONTRACT.sourceCapabilityAuditOnly === true, '必须是 source capability audit only');
    assert(sourceApi.CONTRACT.genericEffectTypeAuthorizationResolverDefined === false, '不得提前定义 generic resolver');
    assert(sourceApi.CONTRACT.newTextualAuthorityIntroduced === false, '不得引入新文本 authority');
});

test('actor→actor 当前最高复用粒度为 registered source-backed motif family', () => {
    const frontier = sourceApi.ENDPOINT_FRONTIER[IDENTITY_SHAPES.ACTOR_TO_ACTOR];
    assert(frontier.state === sourceApi.CAPABILITY_STATES.SUPPORTED_WITH_GATES, 'actor→actor 应 supported-with-gates');
    assert(frontier.maximumCurrentAuthorizationLevel === sourceApi.GENERALIZATION_LEVELS.REGISTERED_MOTIF_FAMILY, '最高层级应为 registered motif family');
    assert(frontier.authorityIds.length === 3, '应保留3个已登记 motif authority');
    assert(frontier.positiveDirectCalibrationObserved === false, '当前 direct positive calibration 不应被伪造为已观察');
});

test('collective endpoint 仍 exact-source，group→group 未定义', () => {
    const a2g = sourceApi.ENDPOINT_FRONTIER[IDENTITY_SHAPES.ACTOR_TO_GROUP];
    const g2a = sourceApi.ENDPOINT_FRONTIER[IDENTITY_SHAPES.GROUP_TO_ACTOR];
    const g2g = sourceApi.ENDPOINT_FRONTIER[IDENTITY_SHAPES.GROUP_TO_GROUP];
    assert(a2g.state === sourceApi.CAPABILITY_STATES.EXACT_SOURCE_ONLY && a2g.authorityIds.length === 2, 'actor→group 应保留两条 exact-source authority');
    assert(g2a.state === sourceApi.CAPABILITY_STATES.EXACT_SOURCE_ONLY && g2a.authorityIds.length === 1, 'group→actor 应保留一条 exact-source authority');
    assert(g2g.state === sourceApi.CAPABILITY_STATES.NOT_DEFINED && g2g.maximumCurrentAuthorizationLevel === null, 'group→group 必须未定义');
});

test('function、endpoint、raw cardinality 不可成为 generic authorization shortcut', () => {
    const byKey = new Map(sourceApi.CAPABILITIES.map((item) => [item.key,item]));
    assert(byKey.get('function-shape-generic-map').state === sourceApi.CAPABILITY_STATES.REJECTED, 'function generic map 应拒绝');
    assert(byKey.get('endpoint-shape-generic-map').state === sourceApi.CAPABILITY_STATES.REJECTED, 'endpoint generic map 应拒绝');
    assert(byKey.get('raw-cardinality-or-member-count-authorizes-effect-type').state === sourceApi.CAPABILITY_STATES.REJECTED, 'raw cardinality shortcut 应拒绝');
    assert(byKey.get('ten-god-role-x-function-generic-map').state === sourceApi.CAPABILITY_STATES.NOT_DEFINED, 'role×function global map 不得宣称已定义');
});

test('authorization signature 强制保留 realization、source authority、position/path 与 group provenance', () => {
    const signature = sourceApi.REQUIRED_AUTHORIZATION_SIGNATURE;
    assert(signature.sourceAndTargetIdentity === true, '缺 endpoint identity gate');
    assert(signature.targetSpecificRealization === true, '缺 realization gate');
    assert(signature.sourceBackedEffectTypeAuthority === true, '缺 source authority gate');
    assert(signature.positionAndPathProvenanceWhenSourceSensitive === true, '缺 position/path gate');
    assert(signature.cardinalityAndGroupMembershipWhenGrouped === true, '缺 group provenance gate');
    assert(signature.sourceWordingAsDecisionFeature === false && signature.caseIdAsDecisionFeature === false && signature.rawCountAsDecisionFeature === false, 'wording/case/count 不得成为 decision feature');
});

test('global resolver blockers 被显式保留，不把 audit 偷换成 resolver readiness', () => {
    const blockers = sourceApi.BLOCKERS_TO_GLOBAL_RESOLVER;
    assert(blockers.length === 5, '应显式保留5类 blocker');
    assert(blockers.every((item) => item.resolved === false), '当前测试基线下所有 global blocker 都应 unresolved');
    const audit = auditApi.buildAudit({ contextualForcePartyEffectAuthorizationNormalizedInput:{ providedSourceRecordCoverageComplete:true } });
    assert(audit.narrowActorToActorMotifResolverCandidate === true, '应允许窄化 registered-motif matcher 作为后续候选');
    assert(audit.globalEffectTypeAuthorizationResolverDefined === false, 'global resolver 必须保持 false');
    assert(audit.unresolvedGlobalResolverBlockerCount === 5, 'blocker count 应为5');
});

test('synthesis 只解决 capability audit，并继续阻断 generic resolver/generalization', () => {
    const base = Object.freeze({
        state:'evaluated',
        contextualForcePartyEffectAuthorizationNormalizedInput:Object.freeze({ providedSourceRecordCoverageComplete:true }),
        claims:Object.freeze([]),
        dependencies:Object.freeze([
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER', status:'unresolved', dependsOnDependencyIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING', status:'unresolved', dependsOnDependencyIds:Object.freeze([]) }),
            Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:Object.freeze([]) })
        ]),
        boundaries:Object.freeze([]),
        activeRuleIds:Object.freeze([])
    });
    const result = extension({}, base);
    const dep = (id) => result.dependencies.find((item) => item.id === id);
    assert(result.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit?.status === 'source-capability-frontier-audited-global-resolver-unresolved', 'audit 状态不正确');
    assert(dep('SD-CONTEXTUAL-FORCE-PARTY-EFFECT-TYPE-AUTHORIZATION-SOURCE-CAPABILITY-AUDIT')?.status === 'resolved', 'capability audit dependency 应 resolved');
    assert(dep('SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER')?.status === 'unresolved', 'generic resolver 必须 unresolved');
    assert(dep('SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION')?.status === 'unresolved', 'generalization 必须 unresolved');
    assert(result.sufficiency.status === 'insufficient', 'Strength sufficiency 不得被 capability audit 解锁');
});

if (failed) {
    console.error(`\n${failed} failed, ${passed} passed`);
    process.exit(1);
}
console.log(`\n${passed} passed`);
