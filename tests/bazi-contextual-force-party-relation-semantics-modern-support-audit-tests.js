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
runFile(context, 'js/bazi-contextual-force-party-relation-semantics-modern-support-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-semantics-modern-support-audit.js');

const GuiJia = context.GuiJia;
const sourceApi = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource;
const auditApi = GuiJia.baziContextualForcePartyRelationSemanticsModernSupportAudit;
const extension = extensions['contextual-force-party-relation-semantics-modern-support-audit-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-CONTRACT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCuratedRelationSourceSemanticAnnotationAudit:Object.freeze({ installed:true }),
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

test('Modern Support Source/Audit v0.1 安装并区分四种 source tier', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit extension 未安装');
    assert(Object.keys(sourceApi.SOURCE_TIERS).length === 4, 'source tier 应为4类');
    assert(sourceApi.SOURCES.weiQianli.sourceTier === 'modern-independent-corroboration', '韦千里 tier 异常');
    assert(sourceApi.SOURCES.xuLewu.independentCorroboration === true, '徐乐吾应为独立横证');
    assert(sourceApi.SOURCES.liangXiangrun.sourceTier === 'modern-school-specific-calibration', '梁湘润应降级为学派校准');
    assert(sourceApi.SOURCES.yuanShushan.sourceTier === 'transmission-reception-evidence', '袁树珊应为传承证据');
});

test('韦千里横证 actor-set/cardinality 与 position-sensitive relation semantics', () => {
    const e1 = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E01');
    const e2 = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E02');
    const e3 = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E03');
    assert(e1.supports.includes('actor-set-semantics'), '缺 actor-set support');
    assert(e2.supports.includes('position-provenance') && e2.supports.includes('relation-path-alternatives'), '贴近规则应支持 position/path');
    assert(e3.supports.includes('cardinality-provenance'), '缺 cardinality provenance');
});

test('徐乐吾换位命例冻结 competing relation paths，而不是 role inventory 直接执行', () => {
    const direct = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E04');
    const alternate = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E05');
    assert(direct.sourceExtract.includes('时上食以制之'), '缺直接制杀路径');
    assert(alternate.sourceExtract.includes('食神生财') && alternate.sourceExtract.includes('财生煞'), '缺替代路径');
    const finding = sourceApi.FINDINGS.find((item) => item.id === 'CF-RSMS-F04');
    assert(finding.status === 'rejected' && finding.value === false, 'same role inventory 不得等于 same execution');
});

test('梁湘润具体位置规则只作 school-specific calibration，不得普遍化', () => {
    const e6 = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E06');
    assert(e6.sourceTier === 'modern-school-specific-calibration', '梁氏证据 tier 异常');
    assert(e6.universalRuleAuthorization === false, '梁氏具体位置规则不得授权 universal rule');
    assert(sourceApi.CONTRACT.modernSchoolSpecificCalibrationCanDefineUniversalRule === false, 'contract 必须禁止学派规则普遍化');
});

test('袁树珊转录前说只作 transmission evidence，不制造独立横证数量', () => {
    const e8 = sourceApi.EVIDENCE.find((item) => item.id === 'CF-RSMS-E08');
    assert(e8.sourceExtract.startsWith('沈孝瞻曰'), '应明确保存被转录作者 provenance');
    assert(e8.independentCorroboration === false, '不得计作独立横证');
    assert(sourceApi.CONTRACT.transmissionReceptionEvidenceCountsAsIndependentCorroboration === false, 'contract 必须拒绝伪重复来源');
});

test('Cross-literature schema audit resolved，但 position 与 competing path resolver 新增为 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT']?.status === 'resolved', 'modern support audit 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE']?.status === 'unresolved', 'position provenance 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']?.status === 'unresolved', 'competing path 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING']?.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE'), 'candidate binding 应消费 position provenance');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应保持 insufficient');
});

test('Competing Relation Path blocker 接入 known motif calibration / generic mapping / generalization', () => {
    const deps = depMap(extendBase());
    const blocker = 'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION';
    [
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATION-EFFECT-GENERIC-VISIBLE-EDGE-MAPPING',
        'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION'
    ].forEach((id) => {
        assert(deps[id]?.status === 'unresolved', `${id} 不得 resolved`);
        assert(deps[id].dependsOnDependencyIds.includes(blocker), `${id} 应依赖 competing path`);
    });
});

test('现代横证不打开 Actor Group / Collective Effect / Relative Dominance', () => {
    const deps = depMap(extendBase());
    [
        'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT',
        'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER'
    ].forEach((id) => assert(deps[id]?.status === 'unresolved', `${id} 不得因 modern support 变绿`));
});

test('Modern Support Audit 不引入 numeric/scalar/threshold/ranking 或 executable edge', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyRelationSemanticsModernSupportAudit;
    assert(audit.numericScore === null && audit.scalarForce === null, 'numeric/scalar output 应为 null');
    const c = sourceApi.CONTRACT;
    assert(c.modernIndependentCorroborationCanOverrideClassicalSemantics === false, '现代资料不得覆盖古典 authority');
    assert(c.collectiveOutcomeExpandsToMemberEdges === false, '不得展开 member edges');
    assert(c.relationPositionProvenanceResolverDefined === false && c.competingRelationPathResolverDefined === false, '不得提前实现 resolver');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应关闭');
    const keys = collectKeys({ contract:c, audit });
    ['forceScore','memberScore','classificationScore','numericWeight','thresholdValue','majorityResult','rankingResult','finalStrength','memberEdges','realizedEdge'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('生产 loader 顺序为 Curated Annotation → Modern Support Audit，保持 parser-synchronous', () => {
    const loader = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const annotationAudit = loader.indexOf('bazi-contextual-force-party-curated-relation-source-semantic-annotation-audit.js');
    const modernAudit = loader.indexOf('bazi-contextual-force-party-relation-semantics-modern-support-audit.js');
    assert(annotationAudit >= 0 && modernAudit > annotationAudit, 'loader 顺序异常');
    assert(!loader.includes('DOMContentLoaded'), '不得引入异步 DOMContentLoaded loader');
});

console.log(`\nRelation Semantics Modern Support Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
