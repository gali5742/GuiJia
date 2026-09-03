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
runFile(context, 'js/bazi-contextual-force-party-relation-position-provenance-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-position-provenance-audit.js');

const GuiJia = context.GuiJia;
const sourceApi = GuiJia.baziContextualForcePartyRelationPositionProvenanceSource;
const auditApi = GuiJia.baziContextualForcePartyRelationPositionProvenanceAudit;
const extension = extensions['contextual-force-party-relation-position-provenance-audit-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION', status:'unresolved', dependsOnDependencyIds:['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE'], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-TARGET-SEMANTIC-LEVEL-RESOLVER', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyRelationSemanticsModernSupportAudit:Object.freeze({ installed:true }),
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

test('Relation Position Provenance v0.1 source/audit 安装且 registry validator 通过', () => {
    assert(sourceApi?.installed && auditApi?.installed && typeof extension === 'function', 'source/audit extension 未安装');
    const validation = sourceApi.validateRegistry();
    assert(validation.valid === true && validation.issueCount === 0, 'position provenance registry 应通过 validator');
    assert(sourceApi.RECORDS.length === 5, '应保留5个代表性 records');
});

test('合同同时支持绝对柱位、先后、贴近、隔间越与易位', () => {
    const kinds = new Set(sourceApi.RECORDS.flatMap((item) => item.assertions.map((entry) => entry.kind)));
    [
        'absolute-placement',
        'source-asserted-order',
        'source-asserted-proximity',
        'source-asserted-separation',
        'source-asserted-intervening',
        'counterfactual-swap'
    ].forEach((kind) => assert(kinds.has(kind), `缺 ${kind}`));
});

test('“贴近”是 source assertion，不得等同 raw pillar distance', () => {
    const entry = sourceApi.RECORDS.find((item) => item.id === 'CF-RPP-REC-03')?.assertions[0];
    assert(entry?.kind === 'source-asserted-proximity', '韦千里记录应为 proximity assertion');
    assert(entry.sourceAsserted === true, '贴近应保留 source assertion provenance');
    assert(entry.machineDerivedFromPillarDistance === false, '贴近不得由 pillar distance 自动推导');
    assert(sourceApi.CONTRACT.rawPillarGeometryEqualsSemanticProximity === false, '合同必须拒绝 raw geometry = semantic proximity');
    assert(sourceApi.CONTRACT.rawPillarDistanceDefinesRelation === false, 'pillar distance 不得定义 relation');
});

test('“越／隔／间”保留 intervening/separation semantics，而非任意 index-between actor', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-RPP-REC-02');
    const kinds = new Set(record?.assertions.map((item) => item.kind));
    assert(kinds.has('source-asserted-intervening') && kinds.has('source-asserted-separation'), '缺越／隔语义');
    assert(sourceApi.CONTRACT.everyBetweenIndexActorEqualsSourceInterveningActor === false, '不得把所有 index-between actor 当隔神');
    record.assertions.forEach((entry) => assert(entry.machineDerivedFromPillarDistance === false, '隔／越不得 distance-derived'));
});

test('程潜命例可保存 absolute placement + cross-scope provenance，但争议解释不升级为 execution', () => {
    const record = sourceApi.RECORDS.find((item) => item.id === 'CF-RPP-REC-04');
    assert(record?.chartKey === '壬午 癸卯 己巳 辛未', '程潜 chartKey 异常');
    assert(record.interpretationContested === true, '应标记 interpretation contested');
    const entry = record.assertions[0];
    const food = entry.participants.find((item) => item.id === 'food');
    const killer = entry.participants.find((item) => item.id === 'killer');
    assert(food?.pillarLabels[0] === 'hour' && food.candidateActorKeys[0] === 'visible:3:辛', '时上食神 placement 异常');
    assert(killer?.scope === 'surface-branch' && killer.pillarLabels[0] === 'month', '七杀应保留 month surface-branch scope');
    assert(killer.bindingResolved === false, '跨 scope target 不得因来源解释直接 binding resolved');
    assert(entry.executableRelationAuthorization === false && record.executableRelationAuthorization === false, 'provenance 不得授权 execution');
});

test('易位用 counterfactual placement 保存，不创建替代命盘 executable edges', () => {
    const entry = sourceApi.RECORDS.find((item) => item.id === 'CF-RPP-REC-05')?.assertions[0];
    assert(entry?.kind === 'counterfactual-swap' && entry.counterfactual, '应有 counterfactual swap');
    assert(entry.counterfactual.originalPlacements.length === 2 && entry.counterfactual.alternativePlacements.length === 2, '易位应保存原始/替代 placement');
    assert(entry.executableRelationAuthorization === false, '易位不能自动授权替代 relation execution');
});

test('Synthesis 只 resolved position contract，coverage / consumer / competing path 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT']?.status === 'resolved', 'position contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE']?.status === 'unresolved', 'position coverage 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE']?.status === 'unresolved', 'position consumer 总依赖应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']?.status === 'unresolved', 'competing path 应 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-CHART-LOCAL-TARGET-CANDIDATE-BINDING']?.status === 'unresolved', 'candidate binding 不得提前 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE']?.dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE'), 'curated annotation coverage 应纳入 position coverage');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Position provenance audit 不引入距离评分、优先级、阈值或最终 Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyRelationPositionProvenanceAudit;
    assert(audit?.numericScore === null && audit?.scalarForce === null, 'numeric/scalar output 应保持 null');
    assert(audit.positionProvenanceAuthorizesExecution === false, 'position 不得授权 execution');
    const c = sourceApi.CONTRACT;
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应显式关闭');
    const keys = collectKeys({ contract:c, audit, records:sourceApi.RECORDS });
    ['distanceScore','proximityScore','positionWeight','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength','memberEdges'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('生产 loader 顺序为 Modern Support → Position Provenance，且保持 parser-synchronous', () => {
    const loader = fs.readFileSync(path.join(ROOT, 'js/bazi-branch-element-relation-inventory.js'), 'utf8');
    const modern = loader.indexOf('bazi-contextual-force-party-relation-semantics-modern-support-audit.js');
    const position = loader.indexOf('bazi-contextual-force-party-relation-position-provenance-audit.js');
    assert(modern >= 0 && position > modern, 'loader 顺序异常');
    assert(!loader.includes('DOMContentLoaded'), '不得引入异步 DOMContentLoaded loader');
});

console.log(`\nRelation Position Provenance Audit tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
