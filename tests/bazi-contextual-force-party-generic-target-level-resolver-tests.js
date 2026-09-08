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
function collectKeys(value, keys = new Set()) {
    if (!value || typeof value !== 'object') return keys;
    Object.keys(value).forEach((key) => { keys.add(key); collectKeys(value[key], keys); });
    return keys;
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
runFile(context, 'js/bazi-contextual-force-party-relation-target-normalized-input-contract.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-normalized-input-profile.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-normalized-input.js');
runFile(context, 'js/bazi-contextual-force-party-generic-target-level-resolver-contract.js');
runFile(context, 'js/bazi-contextual-force-party-generic-target-level-resolver-profile.js');
runFile(context, 'js/bazi-contextual-force-party-generic-target-level-resolver.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-contract.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-profile.js');

const GuiJia = context.GuiJia;
const normalizedContractApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
const normalizedProfileApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
const contractApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolverContract;
const profileApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolverProfile;
const runtimeApi = GuiJia.baziContextualForcePartyGenericTargetLevelResolver;
const legacyProfileApi = GuiJia.baziContextualForcePartyCuratedTargetResolverProfile;
const normalizedExtension = extensions['contextual-force-party-relation-target-normalized-input-v01'];
const genericExtension = extensions['contextual-force-party-generic-target-level-resolver-v01'];
const resolutionMap = (profile) => Object.fromEntries((profile.resolutions || []).map((item) => [item.sourceCaseId, item]));
const normalizedMap = () => Object.fromEntries(normalizedProfileApi.buildProfile().records.map((item) => [item.sourceCaseId, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'], resolvedByClaimIds:[] })
]);

const buildBase = () => Object.freeze({
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
const extendBase = () => genericExtension({}, normalizedExtension({}, buildBase()));

const roleRecord = () => ({
    sourceCaseId:'SYN-ROLE-001', annotationId:'SYN-ANN-ROLE-001', sourceId:'SYN', sourceText:'synthetic role relation', chartKey:null,
    sourceContextType:'theory-general', sourcePredicateType:'generalized-relation-rule', annotationDisposition:'relation-target-present',
    contextSpans:[], configurationSpans:[], evidenceDimensions:[], sourceEvidenceIds:[], blockerReasons:[],
    relationUnits:[{
        id:'SYN-U-ROLE', relationClauseSpan:'role relation', sourceRoleSpan:'source', sourceRoleClass:'食神', predicateSpan:'制', predicateType:'generalized-relation-rule',
        targetMention:{ span:'target', mentionMode:'explicit', antecedentSpan:null, targetRoleClass:'七杀' },
        bindingRequired:false, bindingRequirements:[],
        identityProvenance:{ state:'identity-not-required', endpointType:null, actorKey:null, groupId:null, memberActorKeys:[], cardinality:null, scope:null, sourceCaseScoped:false },
        outcomeSpans:[]
    }]
});
const actorRecord = () => ({
    sourceCaseId:'SYN-ACTOR-001', annotationId:'SYN-ANN-ACTOR-001', sourceId:'SYN', sourceText:'synthetic chart actor relation', chartKey:'甲子|乙丑|丙寅|丁卯',
    sourceContextType:'chart-case', sourcePredicateType:'relation-event', annotationDisposition:'relation-target-present',
    contextSpans:[], configurationSpans:[], evidenceDimensions:[], sourceEvidenceIds:[], blockerReasons:[],
    relationUnits:[{
        id:'SYN-U-ACTOR', relationClauseSpan:'actor relation', sourceRoleSpan:'source', sourceRoleClass:'食神', predicateSpan:'制', predicateType:'relation-event',
        targetMention:{ span:null, mentionMode:'antecedent-linked', antecedentSpan:'独杀', targetRoleClass:'七杀' },
        bindingRequired:true, bindingRequirements:[],
        identityProvenance:{ state:'resolved-source-scoped-actor-identity', endpointType:'actor', actorKey:'hidden:3:卯:乙:0', groupId:null, memberActorKeys:[], cardinality:1, scope:'hidden-branch', targetRoleClass:'七杀', antecedentSpan:'独杀', sourceCaseScoped:true },
        outcomeSpans:[]
    }]
});
const groupRecord = () => ({
    sourceCaseId:'SYN-GROUP-001', annotationId:'SYN-ANN-GROUP-001', sourceId:'SYN', sourceText:'synthetic chart group relation', chartKey:'甲子|乙丑|丙寅|丁卯',
    sourceContextType:'chart-case', sourcePredicateType:'relation-event', annotationDisposition:'relation-target-present',
    contextSpans:[], configurationSpans:[], evidenceDimensions:[], sourceEvidenceIds:[], blockerReasons:[],
    relationUnits:[{
        id:'SYN-U-GROUP', relationClauseSpan:'group relation', sourceRoleSpan:'source', sourceRoleClass:'食神', predicateSpan:'制', predicateType:'relation-event',
        targetMention:{ span:'两杀', mentionMode:'explicit', antecedentSpan:null, targetRoleClass:'七杀' },
        bindingRequired:true, bindingRequirements:[],
        identityProvenance:{ state:'resolved-source-scoped-actor-group-identity', endpointType:'actor-group', actorKey:null, groupId:'synthetic-group', memberActorKeys:['visible:1:庚','visible:3:庚'], cardinality:2, scope:'visible-stem', targetRoleClass:'七杀', sourceCaseScoped:true },
        outcomeSpans:[]
    }]
});
const configurationRecord = () => ({
    sourceCaseId:'SYN-CONFIG-001', annotationId:'SYN-ANN-CONFIG-001', sourceId:'SYN', sourceText:'synthetic configuration', chartKey:null,
    sourceContextType:'theory-general', sourcePredicateType:'configuration-state', annotationDisposition:'configuration-state-only',
    contextSpans:[], configurationSpans:['杀重'], relationUnits:[], evidenceDimensions:[], sourceEvidenceIds:[], blockerReasons:[]
});
const noTargetRecord = () => ({
    sourceCaseId:'SYN-NONE-001', annotationId:'SYN-ANN-NONE-001', sourceId:'SYN', sourceText:'synthetic description', chartKey:null,
    sourceContextType:'theory-general', sourcePredicateType:'instance-description', annotationDisposition:'no-relation-target',
    contextSpans:[], configurationSpans:[], relationUnits:[], evidenceDimensions:[], sourceEvidenceIds:[], blockerReasons:[]
});

test('Generic Target-Level Resolver v0.1 安装，决策输入只定义 normalized provenance', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof genericExtension === 'function', 'generic resolver contract/profile/runtime 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    const c = contractApi.CONTRACT;
    assert(c.resolverInput === 'relation-target-normalized-provenance-input-v0.1' && c.resolverUnit === 'relation-target-unit', 'resolver input/unit 异常');
    assert(c.genericDecisionKernelDefined === true, 'generic decision kernel 应已定义');
    assert(c.sourceCaseIdIsDecisionFeature === false && c.sourceTextIsDecisionFeature === false && c.lexicalMarkersAreDecisionFeatures === false, 'case/text/lexical marker 不得成为决策特征');
    assert(c.expectedTargetLevelIsInput === false && c.semanticLevelHintIsInput === false && c.legacyResolutionIsInput === false, 'sealed expected/legacy decision 不得成为输入');
    assert(c.curatedFiniteResolverIsDependency === false, 'generic resolver 不得依赖旧 finite resolver');
    assert(c.broaderSourceCoverageProven === false && c.globalSourceCoverageResolved === false, '不得过度声明 broader/global coverage');
});

test('Generic resolver 实现文件不依赖 Curated Target Resolver，也不硬编码 finite case id', () => {
    ['js/bazi-contextual-force-party-generic-target-level-resolver-contract.js','js/bazi-contextual-force-party-generic-target-level-resolver-profile.js','js/bazi-contextual-force-party-generic-target-level-resolver.js'].forEach((file) => {
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('baziContextualForcePartyCuratedTargetResolver'), `${file} 不得依赖旧 finite resolver`);
        assert(!source.includes('CF-RTLC-CASE-'), `${file} 不得硬编码 finite case id`);
    });
});

test('当前 normalized 8-case 输入可由 generic kernel 得到 7 resolved + 1 not-applicable + 0 unresolved', () => {
    const profile = profileApi.buildProfile();
    assert(profile.resolutions.length === 8, '应消费8条 normalized input');
    assert(profile.resolvedResolutions.length === 7, '应有7条 resolved');
    assert(profile.notApplicableResolutions.length === 1, '应有1条合法 not-applicable');
    assert(profile.unresolvedResolutions.length === 0, '当前 finite normalized calibration 不应 unresolved');
    assert(profile.providedInputCoverageComplete === true, 'provided-input calibration 应 complete');
    assert(profile.broaderSourceCoverageProven === false && profile.globalSourceCoverageResolved === false, 'finite calibration 不得升级 broader/global coverage');
});

test('Generic kernel 与旧 finite resolver 在8-case输出层级保持兼容，但不消费旧输出', () => {
    const generic = resolutionMap(profileApi.buildProfile());
    const legacy = resolutionMap(legacyProfileApi.buildProfile());
    const expectedLevels = {
        'CF-RTLC-CASE-01':'role-class', 'CF-RTLC-CASE-02':'role-class', 'CF-RTLC-CASE-03':'role-class',
        'CF-RTLC-CASE-04':'actor-set', 'CF-RTLC-CASE-05':'actor-set', 'CF-RTLC-CASE-06':'single-actor',
        'CF-RTLC-CASE-07':'configuration'
    };
    Object.entries(expectedLevels).forEach(([id, level]) => {
        assert(generic[id]?.semanticLevel === level, `${id} generic level 应为 ${level}`);
        assert(legacy[id]?.semanticLevel === level, `${id} legacy level 应为 ${level}`);
    });
    assert(generic['CF-RTLC-CASE-08']?.resolutionState === 'not-applicable-no-relation-target', 'CASE-08 generic 应 not-applicable');
    assert(legacy['CF-RTLC-CASE-08']?.resolutionState === 'not-applicable-no-relation-target', 'CASE-08 legacy 应 not-applicable');
});

test('CASE-04/05/06 identity reference 与旧 finite output 无损一致', () => {
    const generic = resolutionMap(profileApi.buildProfile());
    const legacy = resolutionMap(legacyProfileApi.buildProfile());
    ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].forEach((id) => {
        const unit = generic[id].unitResolutions[0];
        assert(unit.targetReference.groupId === legacy[id].targetReference.groupId, `${id} groupId 应一致`);
        assert(unit.targetReference.memberActorKeys.join('|') === legacy[id].targetReference.memberActorKeys.join('|'), `${id} member keys 应一致`);
        assert(unit.targetReference.cardinality === legacy[id].targetReference.cardinality && unit.targetReference.scope === legacy[id].targetReference.scope, `${id} cardinality/scope 应一致`);
    });
    const unit6 = generic['CF-RTLC-CASE-06'].unitResolutions[0];
    assert(unit6.targetReference.actorKey === legacy['CF-RTLC-CASE-06'].targetReference.actorKey, 'CASE-06 actorKey 应一致');
    assert(unit6.targetReference.scope === legacy['CF-RTLC-CASE-06'].targetReference.scope, 'CASE-06 scope 应一致');
});

test('纯 synthetic normalized records 可在完全不同 case id / source text 下解析四种 target level 与 no-target', () => {
    const role = profileApi.resolveRecord(roleRecord());
    assert(role.semanticLevel === 'role-class' && role.unitResolutions[0].decisionRuleId === 'GTLR-R03-THEORY-ROLE-CLASS', 'synthetic role 应解析为 role-class');
    const actor = profileApi.resolveRecord(actorRecord());
    assert(actor.semanticLevel === 'single-actor' && actor.unitResolutions[0].targetReference.actorKey === 'hidden:3:卯:乙:0', 'synthetic actor 应解析为 single-actor');
    const group = profileApi.resolveRecord(groupRecord());
    assert(group.semanticLevel === 'actor-set' && group.unitResolutions[0].targetReference.groupId === 'synthetic-group', 'synthetic group 应解析为 actor-set');
    const config = profileApi.resolveRecord(configurationRecord());
    assert(config.semanticLevel === 'configuration' && config.targetReference.configurationSpans[0] === '杀重', 'synthetic config 应解析为 configuration');
    const none = profileApi.resolveRecord(noTargetRecord());
    assert(none.resolutionState === 'not-applicable-no-relation-target' && none.targetReference === null, 'synthetic no-target 应合法 not-applicable');
});

test('同一 normalized provenance 改写 sourceCaseId / annotationId / sourceText 不改变 target-level decision', () => {
    const source = normalizedMap()['CF-RTLC-CASE-04'];
    const renamed = {
        ...source,
        sourceCaseId:'RENAMED-NOT-A-FINITE-ID',
        annotationId:'RENAMED-ANN',
        sourceText:'完全不同的测试文字，不含“两杀”或“制杀”提示。'
    };
    const originalResolution = profileApi.resolveRecord(source);
    const renamedResolution = profileApi.resolveRecord(renamed);
    assert(originalResolution.semanticLevel === 'actor-set' && renamedResolution.semanticLevel === 'actor-set', 'case/text rename 不应改变 actor-set decision');
    assert(originalResolution.unitResolutions[0].targetReference.groupId === renamedResolution.unitResolutions[0].targetReference.groupId, 'case/text rename 不应改变 identity reference');
});

test('缺 chart provenance / source-scoped identity / group completeness 时 instance target 必须 fail closed', () => {
    const noChart = actorRecord();
    noChart.chartKey = null;
    const noChartResult = profileApi.resolveRecord(noChart);
    assert(noChartResult.resolutionState === 'unresolved-generic-target-record' && noChartResult.blockerReasons.includes('instance-target-requires-chart-key'), '缺 chartKey 必须 unresolved');

    const nonScoped = actorRecord();
    nonScoped.relationUnits[0].identityProvenance.sourceCaseScoped = false;
    const nonScopedResult = profileApi.resolveRecord(nonScoped);
    assert(nonScopedResult.resolutionState === 'unresolved-generic-target-record' && nonScopedResult.blockerReasons.includes('instance-target-identity-not-source-scoped'), '非 source-scoped identity 必须 unresolved');

    const incompleteGroup = groupRecord();
    incompleteGroup.relationUnits[0].identityProvenance.memberActorKeys = ['visible:1:庚'];
    const groupResult = profileApi.resolveRecord(incompleteGroup);
    assert(groupResult.resolutionState === 'unresolved-generic-target-record', 'group membership 不完整必须 unresolved');
    assert(groupResult.blockerReasons.some((reason) => reason.includes('actor-group-cardinality-member-mismatch') || reason.includes('actor-group-membership-incomplete')), 'group blocker 应指向 cardinality/member completeness');
});

test('chart-case 无 binding、theory-general relation-event、mixed-commentary 均不得 lexical fallback', () => {
    const chartUnbound = roleRecord();
    chartUnbound.sourceCaseId = 'SYN-TEXT-TWO-KILL';
    chartUnbound.sourceText = '两杀并见，独杀又现';
    chartUnbound.sourceContextType = 'chart-case';
    chartUnbound.chartKey = '甲子|乙丑|丙寅|丁卯';
    chartUnbound.sourcePredicateType = 'relation-event';
    chartUnbound.relationUnits[0].predicateType = 'relation-event';
    const chartResult = profileApi.resolveRecord(chartUnbound);
    assert(chartResult.resolutionState === 'unresolved-generic-target-record', 'chart-case 无 binding 不得凭词面解析 actor/set');

    const theoryEvent = roleRecord();
    theoryEvent.sourcePredicateType = 'relation-event';
    theoryEvent.relationUnits[0].predicateType = 'relation-event';
    const theoryResult = profileApi.resolveRecord(theoryEvent);
    assert(theoryResult.resolutionState === 'unresolved-generic-target-record', 'theory-general relation-event 不得自动 role-class');

    const mixed = roleRecord();
    mixed.sourceContextType = 'mixed-commentary';
    const mixedResult = profileApi.resolveRecord(mixed);
    assert(mixedResult.resolutionState === 'unresolved-generic-target-record' && mixedResult.blockerReasons.includes('mixed-commentary-requires-upstream-segmentation'), 'mixed commentary 必须先上游 segmentation');
});

test('resolver 输出不引入 expected label / relation effect / score / dominance / final Strength', () => {
    const profile = profileApi.buildProfile();
    const keys = collectKeys(profile);
    normalizedContractApi.FORBIDDEN_DECISION_FIELDS.filter((key) => ['expectedTargetLevel','semanticLevelHint'].includes(key)).forEach((key) => assert(!keys.has(key), `generic output 不应携带 sealed input field ${key}`));
    assert((profile.relationEffects || []).length === 0 && (profile.memberEdges || []).length === 0, 'resolver 不得执行 relation/member edge');
    assert(profile.relativeDominance === null && profile.numericScore === null && profile.scalarForce === null, 'dominance/numeric scalar 必须 null');
    ['forceScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不得出现 ${key}`));
});

test('Synthesis 解析 generic kernel contract/finite calibration，但 global source coverage 与 Strength 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-CONTRACT']?.status === 'resolved', 'normalized input contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT']?.status === 'resolved', 'generic resolver contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-FINITE-NORMALIZED-CALIBRATION']?.status === 'resolved', 'generic finite calibration 应 resolved');
    const globalDep = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'];
    assert(globalDep?.status === 'unresolved', 'broader/global Target-Level Resolver coverage 必须继续 unresolved');
    assert(globalDep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-GENERIC-TARGET-LEVEL-RESOLVER-CONTRACT'), 'global dependency 应记录 generic kernel 已完成');
    assert(globalDep.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'), 'global dependency 仍应依赖 broader source coverage');
    assert(synthesis.contextualForcePartyGenericTargetLevelResolver?.genericDecisionKernelDefined === true, 'synthesis 应暴露 generic kernel audit');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('research bootstrap 顺序为 Normalized Input → Generic Resolver → legacy finite resolver，generic modules 无隐式 loader', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-relation-target-normalized-input.js',
        'bazi-contextual-force-party-generic-target-level-resolver-contract.js',
        'bazi-contextual-force-party-generic-target-level-resolver-profile.js',
        'bazi-contextual-force-party-generic-target-level-resolver.js',
        'bazi-contextual-force-party-curated-target-resolver-contract.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const file = suffix
            ? `js/bazi-contextual-force-party-generic-target-level-resolver-${suffix}.js`
            : 'js/bazi-contextual-force-party-generic-target-level-resolver.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
});

console.log(`\nGeneric Target-Level Resolver tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
