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
runFile(context, 'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js');
runFile(context, 'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js');
runFile(context, 'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js');

const GuiJia = context.GuiJia;
const sourceApi = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationSource;
const auditApi = GuiJia.baziContextualForcePartyCuratedRelationSourceSemanticAnnotationAudit;
const extension = extensions['contextual-force-party-curated-relation-source-semantic-annotation-audit-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER-SOURCE-CONTRACT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-CARDINALITY-SCOPE-BINDING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);
const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyRelationTargetSemanticLevelContractSourceAudit:Object.freeze({ installed:true }),
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

test('Curated Relation Source Semantic Annotation v0.1 安装且 registry validator 通过', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit extension 未安装');
    const validation = sourceApi.validateRegistry();
    assert(validation.valid === true && validation.issueCount === 0, 'annotation registry 应通过 validator');
    assert(sourceApi.ANNOTATIONS.length === 4, '首批应保留4个代表性 annotation records');
});

test('一个 source statement 可以包含多个 relation unit，并保留代词回指', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-01');
    assert(item?.relationUnits.length === 2, 'CASE-01 应拆为两个 relation units');
    const anaphoric = item.relationUnits.find((unit) => unit.id === 'CF-CRSA-ANN-01-R02');
    assert(anaphoric?.target.mentionMode === 'anaphoric', '官助之 target 应标 anaphoric');
    assert(anaphoric.target.span === '之' && anaphoric.target.antecedentSpan === '杀', '应保留“之→杀” antecedent provenance');
});

test('Mixed statement 的 configuration context 与 role-class relation 分层保存', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-02');
    assert(item?.contextSpans.some((span) => span.text === '杀重身轻' && span.semanticLevelHint === 'configuration'), '缺 configuration context');
    const relation = item.relationUnits[0];
    assert(relation.relationClauseSpan === '财星党杀', 'relation clause 异常');
    assert(relation.predicateSpan === '党', 'predicate span 异常');
    assert(relation.target.span === '杀' && relation.target.semanticLevelHint === 'role-class', 'target 应为 role-class evidence hint');
    assert(relation.target.semanticLevelHintExecutable === false, 'source hint 不得 executable');
});

test('Actor-set annotation 只保存 candidate/cardinality/scope evidence，不创建 group identity', () => {
    const relation = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-03')?.relationUnits[0];
    const target = relation?.target;
    assert(target?.semanticLevelHint === 'actor-set', '应保留 actor-set source hint');
    assert(target.bindingRequirements.includes('chart-local-candidate-binding'), '缺 chart candidate gate');
    assert(target.bindingRequirements.includes('cardinality-binding'), '缺 cardinality gate');
    assert(target.bindingRequirements.includes('scope-provenance'), '缺 scope gate');
    assert(target.chartBindingEvidence.targetCandidateKeys.length === 2, '应保留两个 visible 庚 candidate');
    assert(target.chartBindingEvidence.bindingResolved === false, 'annotation 不得宣称 executable binding');
    assert(target.chartBindingEvidence.executableGroupIdentity === false, 'annotation 不得创建 group identity');
});

test('“四食相制”允许 antecedent-linked target，并继续保持 hidden actor binding unresolved', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-04');
    const target = item?.relationUnits[0]?.target;
    assert(target?.span === null && target.mentionMode === 'antecedent-linked', 'target 应为 antecedent-linked');
    assert(target.antecedentSpan === '独杀', '应回指独杀');
    assert(target.chartBindingEvidence.scope === 'hidden-branch', '应保留 hidden-branch scope');
    assert(target.chartBindingEvidence.stableActorKey === null && target.chartBindingEvidence.bindingResolved === false, '不得伪造 hidden actorKey');
});

test('有限审定 source registry 不要求 runtime 古汉语 parser，但 corpus coverage 尚未完成', () => {
    const c = sourceApi.CONTRACT;
    assert(c.curatedSourceAnnotationPreferredForAuditedFiniteCorpus === true, '应优先 curated annotation');
    assert(c.runtimeClassicalChineseParserRequiredForAuditedCorpus === false, 'audited corpus 不应强制 runtime parser');
    assert(c.runtimeClassicalChineseParserDefined === false, '不得声称 parser 已实现');
    assert(c.annotationCoverageComplete === false, '不得声称全 corpus 已覆盖');
    assert(c.targetCoreferenceAntecedentProvenanceRequired === true, '必须保留 coreference/antecedent provenance');
});

test('Synthesis 新增 resolved annotation contract，但 coverage/coreference 与 target resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']?.status === 'resolved', 'annotation contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE']?.status === 'unresolved', 'coverage 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING']?.status === 'unresolved', 'coreference binding 应 unresolved');
    [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得提前 resolved`));
    const resolver = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'];
    assert(resolver.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'), 'resolver 应依赖 annotation coverage');
    assert(resolver.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING'), 'resolver 应依赖 coreference binding');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Curated annotation audit 不引入 numeric/scalar/threshold/ranking 或 member-edge execution', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit;
    assert(audit?.numericScore === null && audit?.scalarForce === null, 'numeric/scalar output 应保持 null');
    assert(audit.targetSemanticLevelHintExecutable === false, 'target-level hint 不得 executable');
    const c = sourceApi.CONTRACT;
    assert(c.chartBindingEvidenceIsExecutableBinding === false && c.actorSetCandidateEvidenceCreatesGroupIdentity === false, 'candidate evidence 不得升级为 binding/group');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应显式关闭');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','memberScore','classificationScore','numericWeight','thresholdValue','majorityResult','rankingResult','finalStrength','memberEdges'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('生产 loader 顺序为 Relation Target Contract → Curated Annotation Audit，且保持 parser-synchronous', () => {
    const loader = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const contractAudit = loader.indexOf('bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js');
    const annotationAudit = loader.indexOf('bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js');
    assert(contractAudit >= 0 && annotationAudit > contractAudit, 'loader 顺序异常');
    assert(!loader.includes('DOMContentLoaded'), '不得引入异步 DOMContentLoaded loader');
});

console.log(`\nCurated Relation Source Semantic Annotation Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
