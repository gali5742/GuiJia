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
context.GuiJia = {};
const extensions = {};
context.GuiJia.baziStrengthSynthesis = Object.freeze({
    registerExtension:(name, extension) => { extensions[name] = extension; },
    detectConflicts:() => Object.freeze([]),
    buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
        status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
    })
});
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-relation-position-provenance-source.js');
runFile(context, 'js/bazi-contextual-force-party-competing-relation-path-source.js');
runFile(context, 'js/bazi-contextual-force-party-source-scoped-sequential-composition-contract.js');
runFile(context, 'js/bazi-contextual-force-party-source-scoped-sequential-composition-profile.js');
runFile(context, 'js/bazi-contextual-force-party-source-scoped-sequential-composition.js');

const GuiJia = context.GuiJia;
const positionSource = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource;
const competingSource = GuiJia.baziContextualForcePartyCompetingRelationPathSource;
const contractApi = GuiJia.baziContextualForcePartySourceScopedSequentialCompositionContract;
const profileApi = GuiJia.baziContextualForcePartySourceScopedSequentialCompositionProfile;
const runtimeApi = GuiJia.baziContextualForcePartySourceScopedSequentialComposition;
const extension = extensions['contextual-force-party-source-scoped-sequential-composition-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
const recordById = (id) => competingSource.RECORDS.find((item) => item.id === id);

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCompetingRelationPathAudit:Object.freeze({ installed:true }),
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

test('Source-Scoped Sequential Composition v0.1 安装且只登记 REC-01/02', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    const ids = Object.keys(contractApi.SOURCE_REGISTRY);
    assert(ids.length === 2 && ids.includes('CF-CRP-REC-01') && ids.includes('CF-CRP-REC-02'), 'v0.1 registry 只能登记 REC-01/02');
    assert(contractApi.CONTRACT.runtimeArbitraryChartOrderMatcherDefined === false, '不得声明 arbitrary chart order matcher');
    assert(contractApi.CONTRACT.runtimeWinnerSelection === false, '不得声明 runtime winner selector');
});

test('REC-01 财先食后保留 exact ordered coexistence：财助杀 → 食制杀', () => {
    const entry = contractApi.SOURCE_REGISTRY['CF-CRP-REC-01'];
    const composition = profileApi.buildComposition(entry);
    assert(composition.status === 'resolved-source-scoped-sequential-composition', 'REC-01 composition 应 resolved');
    assert(composition.sourceOrderWording === '癸先辛后', 'REC-01 order wording 异常');
    assert(composition.orderedPathIds.join('|') === 'CF-CRP-REC-01-P01|CF-CRP-REC-01-P02', 'REC-01 ordered path ids 异常');
    assert(composition.sequence[0].semanticLabel === 'wealth-augments-killer', 'REC-01 step1 应财助杀');
    assert(composition.sequence[1].semanticLabel === 'food-controls-killer', 'REC-01 step2 应食制杀');
    assert(composition.containsCompoundPath === false, 'REC-01 不应含 compound path');
    assert(composition.laterCompoundPathReframesComposition === false, 'REC-01 不应标 compound reframing');
});

test('REC-02 食先财后保留 compound path：食制杀 → 财转食党杀', () => {
    const entry = contractApi.SOURCE_REGISTRY['CF-CRP-REC-02'];
    const composition = profileApi.buildComposition(entry);
    assert(composition.status === 'resolved-source-scoped-sequential-composition', 'REC-02 composition 应 resolved');
    assert(composition.sourceOrderWording === '辛先而癸在时', 'REC-02 order wording 异常');
    assert(composition.sequence[0].semanticLabel === 'food-controls-killer', 'REC-02 step1 应食制杀');
    assert(composition.sequence[1].semanticLabel === 'wealth-turns-food-and-parties-killer', 'REC-02 step2 应财转食党杀');
    assert(composition.sequence[1].pathKind === 'compound-source-relation', 'REC-02 step2 必须保持 compound path');
    assert(composition.sequence[1].intermediateRoleClasses.includes('食神'), 'compound path 应保留食神 intermediate provenance');
    assert(composition.containsCompoundPath === true && composition.laterCompoundPathReframesComposition === true, 'REC-02 应保留 later compound reframing');
    assert(composition.sequence[1].memberEdgeExpansion === false, 'compound path 不得展开 direct/member edges');
});

test('REC-01/02 必须消费匹配的 Position Provenance order assertion，而非柱距推导', () => {
    ['CF-CRP-REC-01','CF-CRP-REC-02'].forEach((id) => {
        const entry = contractApi.SOURCE_REGISTRY[id];
        const record = recordById(id);
        const validation = profileApi.validateCompositionCandidate(record, entry);
        assert(validation.valid === true, `${id} validator 应通过`);
        assert(validation.positionAssertion?.kind === 'source-asserted-order', `${id} position evidence 应为 source order`);
        assert(validation.positionAssertion.machineDerivedFromPillarDistance === false, `${id} 不得由 pillar distance 推导`);
        assert(validation.positionAssertion.sourceWording === validation.condition.sourceWording, `${id} condition 与 position wording 必须一致`);
    });
});

test('反转 orderedPathIds 必须失败，不能把 source sequence 当无序集合', () => {
    const entry = contractApi.SOURCE_REGISTRY['CF-CRP-REC-01'];
    const source = recordById('CF-CRP-REC-01');
    const assertion = { ...source.relationAssertions[0], orderedPathIds:[...source.relationAssertions[0].orderedPathIds].reverse() };
    const tampered = { ...source, relationAssertions:[assertion] };
    const validation = profileApi.validateCompositionCandidate(tampered, entry);
    assert(validation.valid === false, '反转 sequence 不得通过');
    assert(validation.issues.includes('ordered-path-sequence-mismatch'), '应报 ordered-path-sequence-mismatch');
});

test('把 source-permits-coexistence 改成 exclusive selection 必须失败', () => {
    const entry = contractApi.SOURCE_REGISTRY['CF-CRP-REC-01'];
    const source = recordById('CF-CRP-REC-01');
    const assertion = { ...source.relationAssertions[0], coexistenceMode:'source-requires-exclusive-selection' };
    const tampered = { ...source, relationAssertions:[assertion] };
    const validation = profileApi.validateCompositionCandidate(tampered, entry);
    assert(validation.valid === false, 'exclusive selection 不得冒充 ordered coexistence');
    assert(validation.issues.includes('source-does-not-permit-coexistence'), '应报 coexistence mismatch');
});

test('错接 position evidence 必须失败，不能仅凭相似“先后”文字接受', () => {
    const entry = { ...contractApi.SOURCE_REGISTRY['CF-CRP-REC-01'], positionEvidenceId:'CF-RPP-REC-01-A02' };
    const validation = profileApi.validateCompositionCandidate(recordById('CF-CRP-REC-01'), entry);
    assert(validation.valid === false, '错 position evidence 不得通过');
    assert(validation.issues.includes('source-record-missing-position-evidence-link'), '应检查 record→position evidence link');
    assert(validation.issues.includes('position-condition-wording-mismatch'), '应检查 position/condition wording 对齐');
});

test('REC-02 later reframing 必须由最后一个 compound path 承担，不能只靠 registry flag', () => {
    const entry = contractApi.SOURCE_REGISTRY['CF-CRP-REC-02'];
    const source = recordById('CF-CRP-REC-02');
    const modifiedPaths = source.pathCandidates.map((item) => item.id === 'CF-CRP-REC-02-P02'
        ? { ...item, pathKind:'direct-role-relation', intermediateRoleClasses:[] }
        : item);
    const tampered = { ...source, pathCandidates:modifiedPaths };
    const validation = profileApi.validateCompositionCandidate(tampered, entry);
    assert(validation.valid === false, '没有 compound path 时不得声称 reframing');
    assert(validation.issues.includes('compound-path-presence-mismatch'), '应检查 compound presence');
    assert(validation.issues.includes('reframing-requires-later-compound-path'), '应检查 last path kind');
});

test('Profile 只闭合 2-record finite composition，不定义 arbitrary chart matcher / exclusive selector', () => {
    const profile = profileApi.buildProfile();
    assert(profile.finiteCoverageComplete === true, 'REC-01/02 finite coverage 应 complete');
    assert(profile.compositions.length === 2 && profile.resolvedCompositions.length === 2 && profile.unresolvedCompositions.length === 0, '应2/2 resolved');
    assert(profile.runtimeArbitraryChartOrderMatcher === null, '不得定义 arbitrary chart matcher');
    assert(profile.exclusivePathSelector === null, '不得定义 exclusive selector');
    assert(profile.relationEffects.length === 0 && profile.memberEdges.length === 0, 'profile 不得生成 effect/member edges');
});

test('Synthesis 只 resolves finite sequential composition；global competing-path resolution / coverage 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-CONTRACT']?.status === 'resolved', 'composition contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION-FINITE-COVERAGE']?.status === 'resolved', 'finite coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION']?.status === 'resolved', 'finite composition consumer 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE']?.status === 'unresolved', 'broader CRP coverage 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']?.status === 'unresolved', 'global CRP resolution 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SCOPED-SEQUENTIAL-COMPOSITION'), 'global CRP resolution 应记录 finite composition 已闭合');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Composition 不引入 execution/winner/member-edge/score/threshold/ranking/final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartySourceScopedSequentialComposition;
    const c = contractApi.CONTRACT;
    assert(audit?.pathExecutionAuthorized === false && audit?.memberEdgeExpansion === false, '不得授权 path execution/member expansion');
    assert(audit?.numericScore === null && audit?.scalarForce === null && audit?.relativeDominance === null, 'numeric/dominance 应保持 null');
    assert((audit.profile.relationEffects || []).length === 0 && (audit.profile.memberEdges || []).length === 0, 'effect/member edge guardrails 必须为空');
    assert(c.sourceOrderEqualsRuntimePriority === false && c.runtimeWinnerSelection === false && c.independentPathAggregation === false, 'source order 不得升级为 priority/winner/aggregation');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应全部关闭');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','compositionScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序应为 Competing Relation Path Source/Audit → Sequential Composition trio', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-competing-relation-path-source.js',
        'bazi-contextual-force-party-competing-relation-path-audit.js',
        'bazi-contextual-force-party-source-scoped-sequential-composition-contract.js',
        'bazi-contextual-force-party-source-scoped-sequential-composition-profile.js',
        'bazi-contextual-force-party-source-scoped-sequential-composition.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const file = suffix
            ? `js/bazi-contextual-force-party-source-scoped-sequential-composition-${suffix}.js`
            : 'js/bazi-contextual-force-party-source-scoped-sequential-composition.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\nSource-Scoped Sequential Composition tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
