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
const extension = extensions['contextual-force-party-curated-relation-source-semantic-annotation-audit-v02'];
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

test('Curated Relation Source Semantic Annotation v0.2 安装、8-case registry 与 finite coverage validator 全部通过', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit extension 未安装');
    assert(sourceApi.VERSION === '0.2', 'source version 应为0.2');
    const validation = sourceApi.validateRegistry();
    assert(validation.valid === true && validation.issueCount === 0, 'annotation registry 应通过 validator');
    assert(sourceApi.ANNOTATIONS.length === 8, 'Relation Target finite audit corpus 应有8个 annotation records');
    const coverage = sourceApi.validateFiniteTargetAuditCorpusCoverage();
    assert(coverage.complete === true, '8-case finite target audit corpus 应完整覆盖');
    assert(coverage.expectedCaseCount === 8 && coverage.annotatedCaseCount === 8, 'finite coverage count 应为8/8');
    assert(coverage.missingCaseIds.length === 0 && coverage.extraCaseIds.length === 0, 'finite coverage 不应有 missing/extra case');
});

test('CASE-01 一个 source statement 可以包含多个 relation unit，并保留代词回指', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-01');
    assert(item?.relationUnits.length === 2, 'CASE-01 应拆为两个 relation units');
    const anaphoric = item.relationUnits.find((unit) => unit.id === 'CF-CRSA-ANN-01-R02');
    assert(anaphoric?.target.mentionMode === 'anaphoric', '官助之 target 应标 anaphoric');
    assert(anaphoric.target.span === '之' && anaphoric.target.antecedentSpan === '杀', '应保留“之→杀” antecedent provenance');
});

test('CASE-02 Mixed statement 的 configuration context 与 role-class relation 分层保存', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-02');
    assert(item?.contextSpans.some((span) => span.text === '杀重身轻' && span.semanticLevelHint === 'configuration'), '缺 configuration context');
    const relation = item.relationUnits[0];
    assert(relation.relationClauseSpan === '财星党杀', 'relation clause 异常');
    assert(relation.predicateSpan === '党', 'predicate span 异常');
    assert(relation.target.span === '杀' && relation.target.semanticLevelHint === 'role-class', 'target 应为 role-class evidence hint');
    assert(relation.target.semanticLevelHintExecutable === false, 'source hint 不得 executable');
});

test('CASE-03 “身杀两停”与“食神制杀”补入统一 annotation，且“两停”不是 actor cardinality', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.upstreamCaseId === 'CF-RTLC-CASE-03');
    assert(item?.annotationDisposition === 'relation-target-present', 'CASE-03 应有 relation target');
    assert(item.contextSpans.length === 1 && item.contextSpans[0].text === '身杀两停', '应保存身杀两停 context');
    assert(item.contextSpans[0].role === 'configuration-context' && item.contextSpans[0].semanticLevelHint === 'configuration', '两停应为 configuration evidence');
    const relation = item.relationUnits[0];
    assert(relation.relationClauseSpan === '食神制杀' && relation.sourceRoleClass === '食神', '应保存食神制杀 relation');
    assert(relation.target.semanticLevelHint === 'role-class' && relation.target.chartBindingRequired === false, '理论句 target 应为非 executable role-class');
});

test('CASE-04 Actor-set annotation 只保存 candidate/cardinality/scope evidence，不创建 group identity', () => {
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

test('CASE-05 “两杀”补齐为 visible actor-set evidence，但 annotation 自身仍不执行 group/effect', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.upstreamCaseId === 'CF-RTLC-CASE-05');
    const relation = item?.relationUnits[0];
    const target = relation?.target;
    assert(item?.chartKey === '壬申|丙午|庚午|丙戌', 'CASE-05 chartKey 异常');
    assert(item.contextSpans.some((span) => span.text === '两杀当权临旺' && span.semanticLevelHint === 'actor-set'), '缺“两杀” actor-set evidence');
    assert(target?.semanticLevelHint === 'actor-set', 'CASE-05 target 应为 actor-set hint');
    assert(target.chartBindingEvidence.sourceActorKeys.join('|') === 'visible:0:壬', 'source actor 应为年干壬');
    assert(target.chartBindingEvidence.targetCandidateKeys.join('|') === 'visible:1:丙|visible:3:丙', 'target candidates 应为两个 visible 丙');
    assert(target.chartBindingEvidence.explicitCardinality === 2 && target.chartBindingEvidence.scope === 'visible-stem', 'cardinality/scope 应对齐');
    assert(target.chartBindingEvidence.bindingResolved === false && target.chartBindingEvidence.executableGroupIdentity === false, 'annotation 不得执行 group identity');
});

test('CASE-06 “四食相制”允许 antecedent-linked target，并继续保持 hidden actor binding unresolved', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.id === 'CF-CRSA-ANN-04');
    const target = item?.relationUnits[0]?.target;
    assert(target?.span === null && target.mentionMode === 'antecedent-linked', 'target 应为 antecedent-linked');
    assert(target.antecedentSpan === '独杀', '应回指独杀');
    assert(target.chartBindingEvidence.scope === 'hidden-branch', '应保留 hidden-branch scope');
    assert(target.chartBindingEvidence.stableActorKey === null && target.chartBindingEvidence.bindingResolved === false, '不得伪造 hidden actorKey');
});

test('CASE-07 configuration-state annotation 合法保持零 relation unit，不人工制造 actor target', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.upstreamCaseId === 'CF-RTLC-CASE-07');
    assert(item?.annotationDisposition === 'configuration-state-only', 'CASE-07 应为 configuration-state-only');
    assert(item.sourcePredicateType === 'configuration-state', 'source predicate 应保留 configuration-state');
    assert(item.relationUnits.length === 0, 'CASE-07 不应伪造 relation unit');
    ['杀重','杀微','杀势猖狂','支全杀局','制杀太过'].forEach((text) => assert(item.contextSpans.some((span) => span.text === text && span.semanticLevelHint === 'configuration'), `缺 configuration span: ${text}`));
});

test('CASE-08 instance-description annotation 合法保持 no-relation-target，不强制四选一', () => {
    const item = sourceApi.ANNOTATIONS.find((record) => record.upstreamCaseId === 'CF-RTLC-CASE-08');
    assert(item?.annotationDisposition === 'no-relation-target', 'CASE-08 应显式 no-relation-target');
    assert(item.sourcePredicateType === 'instance-description', 'source predicate 应保留 instance-description');
    assert(item.relationUnits.length === 0, 'CASE-08 不应伪造 relation unit');
    assert(item.contextSpans.some((span) => span.text === '独杀乘权' && span.semanticLevelHint === 'single-actor'), '缺 singular instance evidence');
    assert(item.contextSpans.some((span) => span.text === '众杀有制' && span.semanticLevelHint === 'actor-set'), '缺 plural instance evidence');
    assert(item.blockerReasons.includes('no-relation-target-span'), '应保留 no-target blocker provenance');
});

test('finite 8-case coverage resolved 不等于 broader relation source registry coverage complete', () => {
    const c = sourceApi.CONTRACT;
    assert(c.curatedSourceAnnotationPreferredForAuditedFiniteCorpus === true, '应优先 curated annotation');
    assert(c.runtimeClassicalChineseParserRequiredForAuditedCorpus === false, 'audited corpus 不应强制 runtime parser');
    assert(c.runtimeClassicalChineseParserDefined === false, '不得声称 parser 已实现');
    assert(c.finiteTargetAuditCorpusCoverageComplete === true, '8-case finite target audit coverage 应完成');
    assert(c.finiteTargetAuditCorpusCoverageScope === 'relation-target-semantic-level-contract-audit-cases-only', 'finite coverage scope 必须受限');
    assert(c.annotationCoverageComplete === false && c.broaderRelationSourceRegistryCoverageComplete === false, '不得声称 broader corpus 已覆盖');
    assert(c.zeroRelationUnitAnnotationsSupported === true, '应允许 zero-relation-unit annotations');
});

test('finite coverage validator 对缺 case 的 registry 必须返回 incomplete', () => {
    const partial = sourceApi.ANNOTATIONS.filter((record) => record.upstreamCaseId !== 'CF-RTLC-CASE-08');
    const coverage = sourceApi.validateFiniteTargetAuditCorpusCoverage(partial);
    assert(coverage.complete === false, '缺一个 case 时 coverage 不得 complete');
    assert(coverage.missingCaseIds.length === 1 && coverage.missingCaseIds[0] === 'CF-RTLC-CASE-08', '应准确报告缺失 CASE-08');
});

test('Synthesis 只把 finite target-audit coverage 标为 resolved；broader coverage/coreference/global target resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT']?.status === 'resolved', 'annotation contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE']?.status === 'resolved', 'finite target audit coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE']?.status === 'unresolved', 'broader coverage 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING']?.status === 'unresolved', 'coreference binding 应 unresolved');
    [
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SPAN-IDENTITY',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SOURCE-CONTEXT-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-PREDICATE-TYPE-CLASSIFICATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-MIXED-STATEMENT-SPAN-SEGMENTATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得由 annotation v0.2 提前 resolved`));
    const broader = deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'];
    assert(broader.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE'), 'broader coverage 应承接 finite coverage');
    const resolver = deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER'];
    assert(resolver.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-FINITE-TARGET-AUDIT-CORPUS-COVERAGE'), 'resolver 应记录 finite coverage 已闭合');
    assert(resolver.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'), 'resolver 仍应依赖 broader coverage');
    assert(resolver.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-COREFERENCE-ANTECEDENT-BINDING'), 'resolver 仍应依赖 coreference binding');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Curated annotation v0.2 不引入 numeric/scalar/threshold/ranking/member-edge execution', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit;
    assert(audit?.numericScore === null && audit?.scalarForce === null, 'numeric/scalar output 应保持 null');
    assert(audit.targetSemanticLevelHintExecutable === false, 'target-level hint 不得 executable');
    assert(audit.finiteTargetAuditCorpusCoverageComplete === true && audit.broaderRelationSourceRegistryCoverageComplete === false, 'coverage scope 不得混淆');
    const c = sourceApi.CONTRACT;
    assert(c.chartBindingEvidenceIsExecutableBinding === false && c.actorSetCandidateEvidenceCreatesGroupIdentity === false, 'candidate evidence 不得升级为 binding/group');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应显式关闭');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','memberScore','classificationScore','numericWeight','thresholdValue','majorityResult','rankingResult','finalStrength','memberEdges'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序仍为 Relation Target Contract Source/Audit → Curated Annotation Source/Audit', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const auditSource = fs.readFileSync(path.join(ROOT, 'js/bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-relation-target-semantic-level-contract-source.js',
        'bazi-contextual-force-party-relation-target-semantic-level-contract-audit.js',
        'bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js',
        'bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    assert(!auditSource.includes('document.write'), 'Curated Annotation Audit 不应持有隐式 source loader');
    assert(auditSource.includes('bazi-contextual-force-party-curated-relation-source-semantic-annotation-source.js'), 'Audit 应保留 bootstrap prerequisite provenance');
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\nCurated Relation Source Semantic Annotation Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);