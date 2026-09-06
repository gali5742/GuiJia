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

const MEDIATION_MOTIF_ID = 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001';
const mediationCases = Object.freeze([
    Object.freeze({
        id:'CF-VMEC-MED-CASE-04',
        motifId:MEDIATION_MOTIF_ID,
        chartKey:'戊午|丙辰|庚寅|丙戌',
        sourceTerm:'干透两杀……所喜戊土原神透出，是以化杀。',
        sourceActorKeys:Object.freeze(['visible:1:丙','visible:3:丙']),
        targetActorKeys:Object.freeze(['visible:0:戊']),
        sourceActorTenGods:Object.freeze(['七杀','七杀']),
        targetActorTenGods:Object.freeze(['偏印']),
        functionType:'generation',
        sourceExplicitOutcome:true,
        targetSpecificActorResolved:false,
        calibrationEligible:false,
        blockerReasons:Object.freeze(['multiple-visible-killer-sources','source-does-not-select-one-source-actor'])
    })
]);

const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
const extensions = {};
context.GuiJia = {
    baziContextualForcePartyVisibleMotifE2ECalibrationSource:Object.freeze({
        installed:true,
        MOTIF_IDS:Object.freeze({ MEDIATION:MEDIATION_MOTIF_ID }),
        CASES_BY_MOTIF:Object.freeze({ [MEDIATION_MOTIF_ID]:mediationCases })
    }),
    baziContextualForcePartyCollectiveTargetSemanticsSource:Object.freeze({
        installed:true,
        TARGET_SEMANTIC_LEVELS:Object.freeze({ ACTOR_SET:'actor-set' })
    }),
    baziStrengthSynthesis:Object.freeze({
        registerExtension:(name, extension) => { extensions[name] = extension; },
        detectConflicts:() => Object.freeze([]),
        buildSufficiency:({ dependencies = [], conflicts = [] } = {}) => Object.freeze({
            status:dependencies.some((item) => item.status === 'unresolved') || conflicts.length ? 'insufficient' : 'sufficient'
        })
    })
};
vm.createContext(context);
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity.js');

const GuiJia = context.GuiJia;
const contractApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityContract;
const profileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile;
const runtimeApi = GuiJia.baziContextualForcePartySourceActorGroupIdentity;
const extension = extensions['contextual-force-party-source-actor-group-identity-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));
const registryEntry = contractApi.FINITE_SOURCE_GROUP_REGISTRY['CF-VMEC-MED-CASE-04'];
const sourceCase = mediationCases[0];

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-TARGET-SEMANTICS-SOURCE-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCollectiveTargetSemanticsAudit:Object.freeze({ installed:true }),
    assessmentLayer:Object.freeze({ state:'contract-only' }),
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

test('Source Actor Group Identity contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'source group 三层未完整安装');
    assert(typeof extension === 'function', 'source group Synthesis extension 未注册');
    assert(contractApi.CONTRACT.groupIdentitySide === 'relation-source', 'group identity side 必须是 relation-source');
    assert(contractApi.CONTRACT.sourceGroupEqualsTargetGroup === false, 'source group 不得等同 target group');
});

test('MED CASE-04 “干透两杀”解析为唯一 finite visible source group', () => {
    const profile = profileApi.buildProfile();
    assert(profile.groups.length === 1 && profile.resolvedGroups.length === 1 && profile.unresolvedGroups.length === 0, '应 1/1 source group resolved');
    const group = profile.resolvedGroups[0];
    assert(group.id === 'CF-SAGI-GROUP-01' && group.sourceCaseId === 'CF-VMEC-MED-CASE-04', 'source group identity 异常');
    assert(group.memberActorKeys.join('|') === 'visible:1:丙|visible:3:丙', 'source group members 异常');
    assert(group.sourceRoleClass === '七杀' && group.scope === 'visible-stem' && group.cardinality === 2, 'source group role/scope/cardinality 异常');
    assert(group.sourceMarkers.includes('干透两杀'), '应保留“两杀” source marker');
    assert(group.targetActorKeys.join('|') === 'visible:0:戊', '应保留 case target provenance，但不执行 relation');
});

test('source group identity resolved 不等于 mediation execution', () => {
    const group = profileApi.buildProfile().resolvedGroups[0];
    assert(group.relationExecution === null && group.mediationExecution === null, 'identity 不得直接执行 mediation');
    assert(group.memberSpecificRealizationSynthesized === false && group.memberEdges.length === 0, '不得拆 member-specific edges');
    assert(contractApi.CONTRACT.sourceGroupIdentityEqualsMediationExecution === false, '合同必须显式拒绝 identity=execution');
});

test('少一枚 source actor 时 cardinality hard fail', () => {
    const badCase = { ...sourceCase, sourceActorKeys:['visible:1:丙'], sourceActorTenGods:['七杀'] };
    const validation = profileApi.validateFiniteSourceGroupCandidate(badCase, registryEntry);
    assert(validation.valid === false && validation.issues.includes('source-cardinality-registry-mismatch'), '缺 member 必须 cardinality fail');
});

test('source member role 不一致时不得建组', () => {
    const badCase = { ...sourceCase, sourceActorTenGods:['七杀','正官'] };
    const validation = profileApi.validateFiniteSourceGroupCandidate(badCase, registryEntry);
    assert(validation.valid === false && validation.issues.includes('source-role-class-mismatch'), '异 role member 不得建 source group');
});

test('visible registry 混入 branch actor 时不得建组', () => {
    const badCase = { ...sourceCase, sourceActorKeys:['visible:1:丙','surface-branch:3:戌'] };
    const validation = profileApi.validateFiniteSourceGroupCandidate(badCase, registryEntry);
    assert(validation.valid === false && validation.issues.includes('source-group-scope-mismatch'), 'cross-scope member 不得借 visible contract 通过');
});

test('去掉“干透两杀”来源标记时不得依 member count 猜 group', () => {
    const badCase = { ...sourceCase, sourceTerm:'所喜戊土原神透出，是以化杀。' };
    const validation = profileApi.validateFiniteSourceGroupCandidate(badCase, registryEntry);
    assert(validation.valid === false && validation.issues.some((item) => item.startsWith('source-marker-missing:')), '无 source marker 不得仅凭两个 member 建组');
});

test('Synthesis 只解析 source-group contract/finite coverage；global group 与 mediation 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT']?.status === 'resolved', 'source group contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'source group finite coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY']?.status === 'unresolved', 'global source group resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION']?.status === 'unresolved', 'mediation calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'global relation effect 必须 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('source-group dependency graph 无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'source group dependency graph 不得形成环');
});

test('Source Group 不引入 score / threshold / dominance / final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartySourceActorGroupIdentity;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 应 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit });
    ['groupScore','memberScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序为 Visible Motif → Collective Semantics → Source Group → RTLC → Target Group', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
        'bazi-contextual-force-party-collective-target-semantics-audit.js',
        'bazi-contextual-force-party-source-actor-group-identity-contract.js',
        'bazi-contextual-force-party-source-actor-group-identity-profile.js',
        'bazi-contextual-force-party-source-actor-group-identity.js',
        'bazi-contextual-force-party-relation-target-semantic-level-contract-source.js',
        'bazi-contextual-force-party-actor-group-identity.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    [
        'js/bazi-contextual-force-party-source-actor-group-identity-contract.js',
        'js/bazi-contextual-force-party-source-actor-group-identity-profile.js',
        'js/bazi-contextual-force-party-source-actor-group-identity.js'
    ].forEach((filename) => {
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nSource Actor Group Identity v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
