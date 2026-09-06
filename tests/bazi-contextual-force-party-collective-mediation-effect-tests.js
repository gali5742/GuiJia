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

const RELATION_TYPES = Object.freeze({
    ANCHOR_AUGMENTATION:'anchor-augmentation',
    ANCHOR_OPPOSITION:'anchor-opposition',
    ANCHOR_MEDIATION:'anchor-mediation'
});
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
    baziContextualForcePartyAffiliationExpansionSource:Object.freeze({ installed:true, RELATION_TYPES }),
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
runFile(context, 'js/bazi-contextual-force-party-relation-effect-contract.js');
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-source-actor-group-identity.js');
runFile(context, 'js/bazi-contextual-force-party-collective-mediation-effect-contract.js');
runFile(context, 'js/bazi-contextual-force-party-collective-mediation-effect-profile.js');
runFile(context, 'js/bazi-contextual-force-party-collective-mediation-effect.js');

const GuiJia = context.GuiJia;
const sourceGroupProfileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile;
const contractApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectContract;
const profileApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile;
const runtimeApi = GuiJia.baziContextualForcePartyCollectiveMediationEffect;
const extension = extensions['contextual-force-party-collective-mediation-effect-v01'];
const registryEntry = contractApi.FINITE_COLLECTIVE_MEDIATION_REGISTRY['CF-VMEC-MED-CASE-04'];
const sourceCase = mediationCases[0];
const sourceGroup = sourceGroupProfileApi.buildProfile().resolvedGroups[0];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartySourceActorGroupIdentity:Object.freeze({ installed:true }),
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

const validate = (entry = registryEntry, caseRecord = sourceCase, groupRecord = sourceGroup) =>
    profileApi.validateCollectiveMediationCandidate(entry, caseRecord, groupRecord);

test('Collective Mediation Effect contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'collective mediation 三层未完整安装');
    assert(typeof extension === 'function', 'collective mediation Synthesis extension 未注册');
    assert(contractApi.CONTRACT.relationIdentityType === 'group-to-actor', 'relation identity 必须是 group-to-actor');
    assert(contractApi.RELATION_TYPE === RELATION_TYPES.ANCHOR_MEDIATION, 'relation type 必须是 anchor-mediation');
});

test('MED CASE-04 形成唯一 source-scoped group→actor realized mediation', () => {
    const profile = profileApi.buildProfile();
    assert(profile.records.length === 1 && profile.resolvedRecords.length === 1 && profile.unresolvedRecords.length === 0, '应 1/1 collective mediation resolved');
    const record = profile.resolvedRecords[0];
    assert(record.id === 'CF-CME-SOURCE-01' && record.sourceCaseId === 'CF-VMEC-MED-CASE-04', 'effect identity 异常');
    assert(record.sourceGroupId === 'CF-SAGI-GROUP-01', 'source group identity 异常');
    assert(record.sourceMemberActorKeys.join('|') === 'visible:1:丙|visible:3:丙', 'source group members 异常');
    assert(record.targetActorKey === 'visible:0:戊' && record.targetTenGod === '偏印', 'target actor/role 异常');
    assert(record.relationType === RELATION_TYPES.ANCHOR_MEDIATION && record.functionType === 'generation', 'mediation relation/function 异常');
    assert(record.realized === true && record.relationEffectState === 'realized-relation-effect-in-source-context', 'collective mediation 应 realized');
    assert(record.sourceOutcomeTerms.includes('化杀'), '应保留来源“化杀” outcome');
});

test('group-level 化杀不展开两条 member-specific 杀→印 edge', () => {
    const record = profileApi.buildProfile().resolvedRecords[0];
    assert(record.sourceMemberSpecificRealizationSynthesized === false, '不得合成 member-specific realization');
    assert(record.sourceMemberEdgeExpansion === false && record.sourceMemberEdges.length === 0, '不得展开 source member edges');
    assert(record.reverseSealToKillerEdgeCreated === false, '不得反写印→杀 edge');
});

test('少一个 source member 时必须 hard fail', () => {
    const badGroup = { ...sourceGroup, memberActorKeys:['visible:1:丙'], cardinality:1 };
    const validation = validate(registryEntry, sourceCase, badGroup);
    assert(validation.valid === false && validation.issues.includes('source-member-set-mismatch'), '缺 source member 必须 fail');
});

test('错 target actor 时必须 hard fail', () => {
    const badEntry = { ...registryEntry, targetActorKey:'visible:2:庚' };
    const validation = validate(badEntry, sourceCase, sourceGroup);
    assert(validation.valid === false && validation.issues.includes('target-actor-registry-mismatch'), '错 target actor 必须 fail');
});

test('去掉“化杀”来源结果时不得仅凭 generation 形状执行', () => {
    const badCase = { ...sourceCase, sourceTerm:'干透两杀……所喜戊土原神透出。' };
    const validation = validate(registryEntry, badCase, sourceGroup);
    assert(validation.valid === false, '缺“化杀”结果不得执行');
    assert(validation.issues.includes('source-wording-mismatch') || validation.issues.some((item) => item.startsWith('source-marker-missing:')) || validation.issues.some((item) => item.startsWith('source-outcome-term-missing:')), '应记录 source outcome provenance failure');
});

test('source group 若已预先执行/展开 member edge，collective mediation 必须拒绝', () => {
    const badGroup = { ...sourceGroup, relationExecution:{ type:'generation' }, memberEdgeExpansion:true, memberEdges:[{ source:'visible:1:丙', target:'visible:0:戊' }] };
    const validation = validate(registryEntry, sourceCase, badGroup);
    assert(validation.valid === false, 'pre-executed source group 不得继续 collective mediation');
    assert(validation.issues.includes('source-group-preexecuted') || validation.issues.includes('source-group-member-edge-expansion-detected'), '应记录 preexecution/member-edge blocker');
});

test('actor→group opposition contract 与 group→actor mediation contract 保持方向分离', () => {
    assert(contractApi.CONTRACT.actorToGroupOppositionContractMutation === false, '不得修改 actor→group opposition contract');
    assert(contractApi.CONTRACT.sourceActorGroupContractMutation === false, 'effect contract 不得修改 source group contract');
    assert(contractApi.CONTRACT.singleActorRelationEffectContractMutation === false, '不得放宽 single-actor relation effect contract');
});

test('Synthesis 只解析 collective mediation finite contract/coverage；mediation calibration 与 global resolver 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT']?.status === 'resolved', 'collective mediation contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'collective mediation finite coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION']?.status === 'unresolved', 'global collective mediation 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION']?.status === 'unresolved', 'mediation E2E calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION']?.status === 'unresolved', 'known motif total calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'global relation-effect generalization 必须 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('Collective mediation dependency graph 无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'collective mediation dependency graph 不得形成环');
});

test('Collective mediation 不引入 score / threshold / dominance / final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCollectiveMediationEffect;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 应 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit });
    ['effectScore','groupScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序为 Source Group → Collective Mediation Effect → RTLC/Target Group', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-source-actor-group-identity.js',
        'bazi-contextual-force-party-collective-mediation-effect-contract.js',
        'bazi-contextual-force-party-collective-mediation-effect-profile.js',
        'bazi-contextual-force-party-collective-mediation-effect.js',
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
        'js/bazi-contextual-force-party-collective-mediation-effect-contract.js',
        'js/bazi-contextual-force-party-collective-mediation-effect-profile.js',
        'js/bazi-contextual-force-party-collective-mediation-effect.js'
    ].forEach((filename) => {
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nCollective Mediation Effect v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
