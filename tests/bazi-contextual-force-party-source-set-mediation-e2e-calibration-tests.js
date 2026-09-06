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
    Object.freeze({ id:'CF-VMEC-MED-CASE-01', motifId:MEDIATION_MOTIF_ID, chartKey:'戊子|甲寅|戊午|甲寅', sourceTerm:'众杀横行，一仁可化。', sourceActorKeys:Object.freeze(['visible:1:甲','visible:3:甲']), targetActorKeys:Object.freeze(['surface-branch:2:午']), sourceActorTenGods:Object.freeze(['七杀','七杀']), targetActorTenGods:Object.freeze([null]), functionType:'generation', sourceExplicitOutcome:true, targetSpecificActorResolved:false, calibrationEligible:false, blockerReasons:Object.freeze(['mediator-is-non-visible-branch-scope','multiple-visible-killer-sources']) }),
    Object.freeze({ id:'CF-VMEC-MED-CASE-02', motifId:MEDIATION_MOTIF_ID, chartKey:'己亥|丙寅|戊子|甲寅', sourceTerm:'财坐日下，反去生杀。', sourceActorKeys:Object.freeze(['visible:3:甲']), targetActorKeys:Object.freeze(['visible:1:丙']), sourceActorTenGods:Object.freeze(['七杀']), targetActorTenGods:Object.freeze(['偏印']), functionType:'generation', sourceExplicitOutcome:false, targetSpecificActorResolved:true, calibrationEligible:false, blockerReasons:Object.freeze(['visible-killer-and-seal-pair-present','source-does-not-explicitly-state-killer-to-visible-seal-realization']) }),
    Object.freeze({ id:'CF-VMEC-MED-CASE-03', motifId:MEDIATION_MOTIF_ID, chartKey:'戊辰|庚申|甲子|甲子', sourceTerm:'支全水局，化其肃杀之气。', sourceActorKeys:Object.freeze(['visible:1:庚']), targetActorKeys:Object.freeze(['surface-branch:2:子','surface-branch:3:子']), sourceActorTenGods:Object.freeze(['七杀']), targetActorTenGods:Object.freeze([null,null]), functionType:'generation', sourceExplicitOutcome:true, targetSpecificActorResolved:false, calibrationEligible:false, blockerReasons:Object.freeze(['mediator-is-non-visible-branch-scope','source-describes-branch-water-configuration']) }),
    Object.freeze({ id:'CF-VMEC-MED-CASE-04', motifId:MEDIATION_MOTIF_ID, chartKey:'戊午|丙辰|庚寅|丙戌', sourceTerm:'干透两杀……所喜戊土原神透出，是以化杀。', sourceActorKeys:Object.freeze(['visible:1:丙','visible:3:丙']), targetActorKeys:Object.freeze(['visible:0:戊']), sourceActorTenGods:Object.freeze(['七杀','七杀']), targetActorTenGods:Object.freeze(['偏印']), functionType:'generation', sourceExplicitOutcome:true, targetSpecificActorResolved:false, calibrationEligible:false, blockerReasons:Object.freeze(['multiple-visible-killer-sources','source-does-not-select-one-source-actor']) }),
    Object.freeze({ id:'CF-VMEC-MED-CASE-05', motifId:MEDIATION_MOTIF_ID, chartKey:'癸亥|癸亥|丁卯|癸卯', sourceTerm:'干透三癸……两印拱局。', sourceActorKeys:Object.freeze(['visible:0:癸','visible:1:癸','visible:3:癸']), targetActorKeys:Object.freeze(['surface-branch:2:卯','surface-branch:3:卯']), sourceActorTenGods:Object.freeze(['七杀','七杀','七杀']), targetActorTenGods:Object.freeze([null,null]), functionType:'generation', sourceExplicitOutcome:true, targetSpecificActorResolved:false, calibrationEligible:false, blockerReasons:Object.freeze(['mediator-is-non-visible-branch-scope','multiple-visible-killer-sources']) })
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
runFile(context, 'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration-contract.js');
runFile(context, 'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration-profile.js');
runFile(context, 'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration.js');

const GuiJia = context.GuiJia;
const sourceGroupProfileApi = GuiJia.baziContextualForcePartySourceActorGroupIdentityProfile;
const effectProfileApi = GuiJia.baziContextualForcePartyCollectiveMediationEffectProfile;
const contractApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationContract;
const profileApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibrationProfile;
const runtimeApi = GuiJia.baziContextualForcePartySourceSetMediationE2ECalibration;
const extension = extensions['contextual-force-party-source-set-mediation-e2e-calibration-v01'];
const registryEntry = contractApi.FINITE_CALIBRATION_REGISTRY['CF-VMEC-MED-CASE-04'];
const calibrationCase = mediationCases.find((item) => item.id === 'CF-VMEC-MED-CASE-04');
const sourceGroup = sourceGroupProfileApi.buildProfile().resolvedGroups[0];
const effect = effectProfileApi.buildProfile().resolvedRecords[0];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-EXECUTION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-MEDIATION-EFFECT-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCollectiveMediationEffect:Object.freeze({ installed:true }),
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

const validate = (entry = registryEntry, caseRecord = calibrationCase, groupRecord = sourceGroup, effectRecord = effect) =>
    profileApi.validateCalibrationCandidate(entry, caseRecord, groupRecord, effectRecord);

test('Source-Set Mediation E2E Calibration contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'source-set mediation 三层未完整安装');
    assert(typeof extension === 'function', 'source-set mediation Synthesis extension 未注册');
    assert(contractApi.CONTRACT.calibrationIdentityType === 'group-to-actor', 'calibration identity 必须是 group-to-actor');
});

test('MED CASE-04 source-set calibration 1/1 resolved', () => {
    const profile = profileApi.buildProfile();
    assert(profile.records.length === 1 && profile.resolvedRecords.length === 1 && profile.blockerRecords.length === 0, 'finite registry 应 1/1 resolved');
    const record = profile.resolvedRecords[0];
    assert(record.calibrationCaseId === 'CF-VMEC-MED-CASE-04', 'calibration case 异常');
    assert(record.sourceGroupId === 'CF-SAGI-GROUP-01', 'source group 异常');
    assert(record.collectiveMediationEffectId === 'CF-CME-SOURCE-01', 'collective mediation effect 异常');
    assert(record.sourceMemberActorKeys.join('|') === 'visible:1:丙|visible:3:丙', 'source members 异常');
    assert(record.targetActorKey === 'visible:0:戊' && record.targetTenGod === '偏印', 'target actor/role 异常');
    assert(record.relationType === RELATION_TYPES.ANCHOR_MEDIATION && record.functionType === 'generation', 'mediation relation/function 异常');
    assert(record.relationEffectState === 'realized-relation-effect-in-source-context', 'mediation effect state 异常');
});

test('source-set PASS 必须保留旧 actor-specific calibration FAIL', () => {
    const record = profileApi.buildProfile().resolvedRecords[0];
    assert(record.originalActorSpecificCalibration.calibrationEligible === false, '不得改写旧 calibrationEligible');
    assert(record.originalActorSpecificCalibration.targetSpecificActorResolved === false, '不得伪装 actor-specific target resolved');
    assert(record.originalActorSpecificCalibration.blockerReasons.includes('multiple-visible-killer-sources'), '必须保留 multi-source blocker');
});

test('source-set calibration 不展开 member-specific 杀→印 edges', () => {
    const record = profileApi.buildProfile().resolvedRecords[0];
    assert(record.sourceMemberSpecificRealizationSynthesized === false, '不得合成 member-specific realization');
    assert(record.sourceMemberEdgeExpansion === false && record.sourceMemberEdges.length === 0, '不得展开 source member edges');
    assert(record.reverseSealToKillerEdgeCreated === false, '不得反写印→杀');
    assert(record.visibleFunctionRealizationRegistryMutation === false, '不得修改 visible realization registry');
});

test('MED CASE-01/02/03/05 未登记，不能自动纳入', () => {
    const profile = profileApi.buildProfile();
    assert(profile.unregisteredMediationCaseIds.join('|') === 'CF-VMEC-MED-CASE-01|CF-VMEC-MED-CASE-02|CF-VMEC-MED-CASE-03|CF-VMEC-MED-CASE-05', '未登记 mediation cases 异常');
    assert(profile.mediationCaseFamilyCoverageComplete === false, 'mediation 全 corpus coverage 必须 unresolved');
});

test('source member set 错配时 calibration 必须失败', () => {
    const badGroup = { ...sourceGroup, memberActorKeys:['visible:1:丙'] };
    const validation = validate(registryEntry, calibrationCase, badGroup, effect);
    assert(validation.valid === false && validation.issues.includes('calibration-source-set-group-mismatch'), 'source set mismatch 必须 fail');
});

test('target actor 错配时 calibration 必须失败', () => {
    const badEffect = { ...effect, targetActorKey:'visible:2:庚' };
    const validation = validate(registryEntry, calibrationCase, sourceGroup, badEffect);
    assert(validation.valid === false && validation.issues.includes('target-actor-effect-mismatch'), 'target mismatch 必须 fail');
});

test('collective effect 一旦展开 source member edges，calibration 必须失败', () => {
    const badEffect = { ...effect, sourceMemberEdgeExpansion:true, sourceMemberEdges:[{ source:'visible:1:丙', target:'visible:0:戊' }] };
    const validation = validate(registryEntry, calibrationCase, sourceGroup, badEffect);
    assert(validation.valid === false && validation.issues.includes('source-member-edge-expansion-detected'), 'member-edge expansion 必须 hard fail');
});

test('Synthesis 只解析 source-set finite calibration；旧 mediation/total/global 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CONTRACT']?.status === 'resolved', 'source-set calibration contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'finite source-set coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-SET-MEDIATION-E2E-CALIBRATION-CORPUS-COVERAGE']?.status === 'unresolved', 'mediation corpus coverage 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-MEDIATION-E2E-CALIBRATION']?.status === 'unresolved', '旧 mediation calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION']?.status === 'unresolved', 'known motif total calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'global relation-effect generalization 必须 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('source-set mediation dependency graph 无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'source-set mediation dependency graph 不得形成环');
});

test('Source-set mediation 不引入 score / threshold / dominance / final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartySourceSetMediationE2ECalibration;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 应 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit });
    ['calibrationScore','groupScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序为 Collective Mediation Effect → Source-Set Calibration → RTLC', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-collective-mediation-effect.js',
        'bazi-contextual-force-party-source-set-mediation-e2e-calibration-contract.js',
        'bazi-contextual-force-party-source-set-mediation-e2e-calibration-profile.js',
        'bazi-contextual-force-party-source-set-mediation-e2e-calibration.js',
        'bazi-contextual-force-party-relation-target-semantic-level-contract-source.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    [
        'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration-contract.js',
        'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration-profile.js',
        'js/bazi-contextual-force-party-source-set-mediation-e2e-calibration.js'
    ].forEach((filename) => {
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nSource-Set Mediation E2E Calibration v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
