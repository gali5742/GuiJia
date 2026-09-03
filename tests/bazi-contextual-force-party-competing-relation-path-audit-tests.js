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
const extensions = {};
context.GuiJia = {
    baziStrengthSynthesis:Object.freeze({
        registerExtension:(name, extension) => { extensions[name] = extension; },
        detectConflicts:() => Object.freeze([]),
        buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
            status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
        })
    })
};
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-competing-relation-path-source.js');
runFile(context, 'js/bazi-contextual-force-party-competing-relation-path-audit.js');

const GuiJia = context.GuiJia;
const sourceApi = GuiJia.baziContextualForcePartyCompetingRelationPathSource;
const auditApi = GuiJia.baziContextualForcePartyCompetingRelationPathAudit;
const extension = extensions['contextual-force-party-competing-relation-path-audit-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT', status:'resolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT','SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyRelationPositionProvenanceAudit:Object.freeze({ installed:true }),
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

test('Competing Relation Path v0.1 source/audit 安装且 registry validator 通过', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit extension 未安装');
    const validation = sourceApi.validateRegistry();
    assert(validation.valid === true && validation.issueCount === 0, 'competing path registry 应通过 validator');
    assert(sourceApi.RECORDS.length === 4, '应保留4个代表性 source records');
});

test('合同把 coexistence / condition / ordering 分成正交维度', () => {
    const c = sourceApi.CONTRACT;
    assert(c.coexistenceConditionOrderingAreOrthogonal === true, '三轴应正交');
    assert(c.singleStatusEnumRejected === true, '必须拒绝单一 status enum');
    assert(c.coexistenceModes.includes('source-permits-coexistence'), '缺 coexistence mode');
    assert(c.coexistenceModes.includes('source-requires-exclusive-selection'), '缺 exclusive-selection mode');
    assert(c.conditionModes.includes('source-conditional'), '缺 conditional mode');
    assert(c.orderingModes.includes('source-ordered'), '缺 ordered mode');
});

test('《子平真诠》财先食后保存为“条件化 + 有序共存”，不是 winner/loser', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-CRP-REC-01');
    const assertion = record?.relationAssertions[0];
    assert(assertion?.coexistenceMode === sourceApi.COEXISTENCE_MODES.SOURCE_PERMITS_COEXISTENCE, '应允许两 path 共存');
    assert(assertion.conditionMode === sourceApi.CONDITION_MODES.SOURCE_CONDITIONAL, '应保留来源条件');
    assert(assertion.orderingMode === sourceApi.ORDERING_MODES.SOURCE_ORDERED, '应保留来源先后');
    assert(assertion.orderedPathIds.length === 2, '应有两个有序 path');
    assert(assertion.runtimeWinnerPathId === null && assertion.executableSelection === false, '不得生成 runtime winner');
});

test('《子平真诠》食先财后保留 compound source relation，不自动拆成 direct/member edges', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-CRP-REC-02');
    const compound = record?.pathCandidates.find((item) => item.pathKind === sourceApi.PATH_KINDS.COMPOUND_SOURCE_RELATION);
    assert(compound?.semanticLabel === 'wealth-turns-food-and-parties-killer', 'compound source semantics 异常');
    assert(compound.intermediateRoleClasses.includes('食神'), '应保留食神 intermediate provenance');
    assert(compound.memberEdgeExpansion === false && compound.executable === false, 'compound path 不得拆成 executable edges');
    assert(sourceApi.CONTRACT.compoundSourceRelationExpandsToDirectEdges === false, '合同必须拒绝自动拆边');
});

test('韦千里“贴近”案例保存 source-directed exclusive selection，但不计算距离或 winner', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-CRP-REC-03');
    const assertion = record?.relationAssertions[0];
    assert(assertion?.coexistenceMode === sourceApi.COEXISTENCE_MODES.SOURCE_REQUIRES_EXCLUSIVE_SELECTION, '应为 source exclusive selection');
    assert(assertion.conditionMode === sourceApi.CONDITION_MODES.SOURCE_CONDITIONAL, '应按来源条件区分');
    assert(record.conditions.every((item) => item.kind === sourceApi.CONDITION_KINDS.POSITION_PROXIMITY), '应为 proximity 条件');
    assert(record.conditions.every((item) => item.runtimeResolved === false && item.numericThreshold === null), '不得把 proximity 转成 runtime 数值条件');
    assert(assertion.runtimeWinnerPathId === null, '不得生成 winner');
});

test('“较为有力”只成为 condition provenance，不偷渡 Relative Dominance 或数值阈值', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-CRP-REC-04');
    const condition = record?.conditions[0];
    assert(condition?.kind === sourceApi.CONDITION_KINDS.RELATIVE_RELATION_CAPACITY, '应标记 relative relation capacity 条件');
    assert(condition.sourceWording.includes('较为有力'), '应保存来源原始条件措辞');
    assert(condition.runtimeResolved === false && condition.numericThreshold === null, 'relative capacity condition 必须 unresolved/no threshold');
    assert(sourceApi.CONTRACT.unresolvedConditionMustRemainUnresolved === true, '合同必须要求 unresolved 保持 unresolved');
});

test('Synthesis 只 resolved source contract；coverage 和 runtime resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT']?.status === 'resolved', 'source contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE']?.status === 'unresolved', 'path coverage 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']?.status === 'unresolved', 'runtime resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-SOURCE-CONTRACT'), 'resolver 应依赖 source contract');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-COVERAGE'), 'resolver 应依赖 coverage');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('新增 dependency graph 保持无环', () => {
    const synthesis = extendBase();
    assert(hasDependencyCycle(synthesis.dependencies) === false, 'Competing Relation Path dependency graph 不得形成环');
});

test('Contract / audit 不引入 priority score、winner、threshold 或 final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCompetingRelationPathAudit;
    assert(audit?.numericScore === null && audit?.scalarForce === null, 'numeric/scalar output 应保持 null');
    assert(audit.runtimeResolverDefined === false, 'runtime resolver 不得提前定义');
    const c = sourceApi.CONTRACT;
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应显式关闭');
    const keys = collectKeys({ contract:c, audit, records:sourceApi.RECORDS });
    ['distanceScore','priorityScore','pathScore','winnerScore','thresholdValue','majorityResult','rankingResult','finalStrength','memberEdges'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('生产 loader 顺序为 Position Provenance → Competing Relation Path，保持 parser-synchronous', () => {
    const loader = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const position = loader.indexOf('bazi-contextual-force-party-relation-position-provenance-audit.js');
    const competing = loader.indexOf('bazi-contextual-force-party-competing-relation-path-audit.js');
    assert(position >= 0 && competing > position, 'loader 顺序异常');
    assert(!loader.includes('DOMContentLoaded'), '不得引入异步 DOMContentLoaded loader');
});

console.log(`\nCompeting Relation Path Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
