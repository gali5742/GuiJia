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
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-contract.js');
runFile(context, 'js/bazi-contextual-force-party-curated-target-resolver-profile.js');

const GuiJia = context.GuiJia;
const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const annotationSource = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource;
const contractApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputContract;
const profileApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInputProfile;
const runtimeApi = GuiJia.baziContextualForcePartyRelationTargetNormalizedInput;
const actorGroupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile;
const hiddenBindingProfileApi = GuiJia.baziContextualForcePartyHiddenSingleTargetBindingProfile;
const legacyProfileApi = GuiJia.baziContextualForcePartyCuratedTargetResolverProfile;
const extension = extensions['contextual-force-party-relation-target-normalized-input-v01'];
const recordMap = (profile) => Object.fromEntries((profile.records || []).map((item) => [item.sourceCaseId, item]));
const resolutionMap = (profile) => Object.fromEntries((profile.resolutions || []).map((item) => [item.sourceCaseId, item]));
const annotationMap = Object.fromEntries((annotationSource.ANNOTATIONS || []).map((item) => [item.upstreamCaseId, item]));
const caseMap = Object.fromEntries((targetSource.AUDIT_CASES || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-HIDDEN-SINGLE-TARGET-BINDING-SOURCE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'], resolvedByClaimIds:[] })
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

test('Normalized Input v0.1 安装，只定义 provenance input，不定义 generic resolver', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'normalized contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(contractApi.CONTRACT.adapterScope === 'curated-finite-relation-target-evidence-normalization-only', 'adapter scope 异常');
    assert(contractApi.CONTRACT.genericTargetLevelResolverDefined === false, '不得提前定义 generic resolver');
    assert(contractApi.CONTRACT.runtimeClassicalChineseParser === false && contractApi.CONTRACT.runtimeLexicalShortcutResolver === false, '不得引入 runtime 古汉语/lexical shortcut parser');
});

test('8-case normalized profile 完整：7 normalized + 1 not-applicable + 0 unresolved', () => {
    const profile = profileApi.buildProfile();
    assert(profile.coverageComplete === true, 'normalized finite adapter coverage 应 complete');
    assert(profile.records.length === 8, '应有8个 normalized records');
    assert(profile.normalizedRecords.length === 7, '应有7个 normalized applicable/config records');
    assert(profile.notApplicableRecords.length === 1, '应有1个 not-applicable record');
    assert(profile.unresolvedRecords.length === 0, '不应有 unresolved record');
    assert(profile.genericTargetLevelResolver === null, '不得声明 generic resolver');
});

test('Normalized record 不泄漏 expectedTargetLevel / semanticLevelHint / legacy resolution decision', () => {
    const keys = collectKeys(profileApi.buildProfile().records);
    contractApi.FORBIDDEN_DECISION_FIELDS.forEach((key) => assert(!keys.has(key), `normalized input 不应包含 ${key}`));
});

test('CASE-01/02/03 保留 theory-general role provenance，且不创建 chart identity', () => {
    const map = recordMap(profileApi.buildProfile());
    ['CF-RTLC-CASE-01','CF-RTLC-CASE-02','CF-RTLC-CASE-03'].forEach((id) => {
        const item = map[id];
        assert(item.normalizationState === 'normalized-source-scoped-input', `${id} 应 normalized`);
        assert(item.sourceContextType === 'theory-general' && item.sourcePredicateType === 'generalized-relation-rule', `${id} context/predicate 异常`);
        assert(item.relationUnits.length > 0, `${id} 应保留 relation unit`);
        item.relationUnits.forEach((unit) => {
            assert(unit.targetMention.targetRoleClass === '七杀', `${id} 应保留七杀 target role`);
            assert(unit.identityProvenance.state === 'identity-not-required', `${id} 不应创建 chart identity`);
            assert(unit.identityProvenance.actorKey === null && unit.identityProvenance.groupId === null, `${id} 不应产生 actor/group id`);
        });
    });
});

test('CASE-04/05 normalized identity provenance 与现有 finite actor-group resolution 无损对齐', () => {
    const normalized = recordMap(profileApi.buildProfile());
    const legacy = resolutionMap(legacyProfileApi.buildProfile());
    ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].forEach((id) => {
        const unit = normalized[id].relationUnits[0];
        const old = legacy[id];
        assert(unit.identityProvenance.state === 'resolved-source-scoped-actor-group-identity', `${id} group identity 应 resolved`);
        assert(unit.identityProvenance.endpointType === 'actor-group', `${id} endpoint type 应 actor-group`);
        assert(unit.identityProvenance.groupId === old.targetReference.groupId, `${id} groupId 应与 finite resolver 相同`);
        assert(unit.identityProvenance.memberActorKeys.join('|') === old.targetReference.memberActorKeys.join('|'), `${id} members 应无损`);
        assert(unit.identityProvenance.cardinality === old.targetReference.cardinality && unit.identityProvenance.scope === old.targetReference.scope, `${id} cardinality/scope 应无损`);
    });
});

test('CASE-06 normalized identity provenance 与现有 hidden single target resolution 无损对齐', () => {
    const normalized = recordMap(profileApi.buildProfile())['CF-RTLC-CASE-06'];
    const legacy = resolutionMap(legacyProfileApi.buildProfile())['CF-RTLC-CASE-06'];
    const unit = normalized.relationUnits[0];
    assert(unit.targetMention.span === null && unit.targetMention.antecedentSpan === '独杀', 'CASE-06 antecedent provenance 应保留');
    assert(unit.identityProvenance.state === 'resolved-source-scoped-actor-identity', 'CASE-06 actor identity 应 resolved');
    assert(unit.identityProvenance.endpointType === 'actor', 'CASE-06 endpoint type 应 actor');
    assert(unit.identityProvenance.actorKey === legacy.targetReference.actorKey, 'CASE-06 actorKey 应与 finite resolver 相同');
    assert(unit.identityProvenance.scope === legacy.targetReference.scope, 'CASE-06 scope 应无损');
});

test('CASE-07 configuration 与 CASE-08 no-target provenance 可无损保留且不物化 endpoint', () => {
    const normalized = recordMap(profileApi.buildProfile());
    const legacy = resolutionMap(legacyProfileApi.buildProfile());
    const c7 = normalized['CF-RTLC-CASE-07'];
    assert(c7.annotationDisposition === 'configuration-state-only' && c7.relationUnits.length === 0, 'CASE-07 应 configuration-only');
    assert(c7.configurationSpans.join('|') === legacy['CF-RTLC-CASE-07'].targetReference.configurationSpans.join('|'), 'CASE-07 configuration spans 应无损');
    const c8 = normalized['CF-RTLC-CASE-08'];
    assert(c8.normalizationState === 'normalized-not-applicable-no-relation-target', 'CASE-08 应合法 not-applicable');
    assert(c8.annotationDisposition === 'no-relation-target' && c8.relationUnits.length === 0, 'CASE-08 不应制造 relation target');
    assert(legacy['CF-RTLC-CASE-08'].targetReference === null, 'legacy CASE-08 也应无 target');
});

test('缺 Actor Group Identity 时 CASE-04/05 normalized input 必须 unresolved', () => {
    const hidden = hiddenBindingProfileApi.buildProfile().resolvedBindings;
    ['CF-RTLC-CASE-04','CF-RTLC-CASE-05'].forEach((id) => {
        const item = profileApi.normalizeCase(caseMap[id], annotationMap[id], [], hidden);
        assert(item.normalizationState === 'unresolved-normalized-input', `${id} 缺 group identity 时必须 unresolved`);
        assert(item.blockerReasons.some((reason) => reason.includes('required-target-identity-unresolved')), `${id} blocker 应指向 required identity`);
    });
});

test('缺 Hidden Single Target Binding 时 CASE-06 normalized input 必须 unresolved', () => {
    const groups = actorGroupProfileApi.buildProfile().resolvedGroups;
    const item = profileApi.normalizeCase(caseMap['CF-RTLC-CASE-06'], annotationMap['CF-RTLC-CASE-06'], groups, []);
    assert(item.normalizationState === 'unresolved-normalized-input', 'CASE-06 缺 hidden identity 时必须 unresolved');
    assert(item.blockerReasons.some((reason) => reason.includes('required-target-identity-unresolved')), 'CASE-06 blocker 应指向 required identity');
});

test('缺 source context / predicate / target span provenance 时不得 fallback 到 lexical shortcut', () => {
    const groups = actorGroupProfileApi.buildProfile().resolvedGroups;
    const hidden = hiddenBindingProfileApi.buildProfile().resolvedBindings;
    const source = caseMap['CF-RTLC-CASE-01'];
    const ann = annotationMap['CF-RTLC-CASE-01'];

    const noContext = profileApi.normalizeCase({ ...source, sourceContextType:null }, { ...ann, sourceContextType:null }, groups, hidden);
    assert(noContext.normalizationState === 'unresolved-normalized-input' && noContext.blockerReasons.includes('source-context-type-missing'), '缺 source context 必须 unresolved');

    const noPredicate = profileApi.normalizeCase({ ...source, predicateType:null }, { ...ann, sourcePredicateType:null }, groups, hidden);
    assert(noPredicate.normalizationState === 'unresolved-normalized-input' && noPredicate.blockerReasons.includes('source-predicate-type-missing'), '缺 predicate 必须 unresolved');

    const brokenUnit = { ...ann.relationUnits[0], target:{ ...ann.relationUnits[0].target, span:null, antecedentSpan:null } };
    const noSpan = profileApi.normalizeCase(source, { ...ann, relationUnits:[brokenUnit] }, groups, hidden);
    assert(noSpan.normalizationState === 'unresolved-normalized-input', '缺 target span/antecedent 必须 unresolved');
    assert(noSpan.blockerReasons.some((reason) => reason.includes('target-span-provenance-missing')), '缺 target span 应有 provenance blocker');
});

test('Synthesis 只解析 normalized contract/finite adapter coverage，global Target-Level Resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-INPUT-CONTRACT']?.status === 'resolved', 'normalized input contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-FINITE-ADAPTER-COVERAGE']?.status === 'resolved', 'finite adapter coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER']?.status === 'unresolved', 'global target resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-NORMALIZED-FINITE-ADAPTER-COVERAGE'), 'global resolver 应依赖 normalized finite coverage');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'), 'global resolver 仍应依赖 broader annotation coverage');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Normalized Input 不执行 relation/member/dominance/numeric/final Strength', () => {
    const audit = runtimeApi.buildAudit();
    assert(audit.relationEffectExecution === false && audit.membershipMutation === false, '不得执行 relation/membership');
    assert(audit.relativeDominance === null && audit.numericScore === null && audit.scalarForce === null, 'dominance/numeric 应为空');
    assert(audit.profile.relationEffects.length === 0 && audit.profile.memberEdges.length === 0, 'effect/member edges 必须为空');
    assert(contractApi.CONTRACT.finalStrengthMapping === false, '不得 final Strength mapping');
});

test('研究 bootstrap 顺序应为 Hidden Binding → Actor Group → Normalized Input → Curated Resolver', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-hidden-single-target-binding.js',
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-relation-target-normalized-input-contract.js',
        'bazi-contextual-force-party-relation-target-normalized-input-profile.js',
        'bazi-contextual-force-party-relation-target-normalized-input.js',
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
            ? `js/bazi-contextual-force-party-relation-target-normalized-input-${suffix}.js`
            : 'js/bazi-contextual-force-party-relation-target-normalized-input.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
});

console.log(`\nRelation Target Normalized Input tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
