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
const MOTIF_ID = 'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001';
const calibrationCases = Object.freeze([
    Object.freeze({
        id:'CF-VMEC-OPP-CASE-01', motifId:MOTIF_ID,
        chartKey:'戊辰|戊午|壬辰|甲辰',
        sourceTerm:'此造四柱皆杀……时透食神制杀。',
        sourceActorKeys:Object.freeze(['visible:3:甲']),
        targetActorKeys:Object.freeze(['visible:0:戊','visible:1:戊']),
        functionType:'restraint', sourceExplicitOutcome:true,
        targetSpecificActorResolved:false, calibrationEligible:false,
        blockerReasons:Object.freeze(['multiple-visible-killer-targets','source-does-not-select-one-target-actor'])
    }),
    Object.freeze({
        id:'CF-VMEC-OPP-CASE-02', motifId:MOTIF_ID,
        chartKey:'庚申|庚辰|甲戌|丙寅',
        sourceTerm:'庚金并透……更妙丙火独透，制杀扶身。',
        sourceActorKeys:Object.freeze(['visible:3:丙']),
        targetActorKeys:Object.freeze(['visible:0:庚','visible:1:庚']),
        functionType:'restraint', sourceExplicitOutcome:true,
        targetSpecificActorResolved:false, calibrationEligible:false,
        blockerReasons:Object.freeze(['multiple-visible-killer-targets','source-does-not-select-one-target-actor'])
    }),
    Object.freeze({
        id:'CF-VMEC-OPP-CASE-03', motifId:MOTIF_ID,
        chartKey:'壬子|壬子|丙戌|戊戌',
        sourceTerm:'年月两逢壬子……扶身抑杀。',
        sourceActorKeys:Object.freeze(['visible:3:戊']),
        targetActorKeys:Object.freeze(['visible:0:壬','visible:1:壬']),
        functionType:'restraint', sourceExplicitOutcome:true,
        targetSpecificActorResolved:false, calibrationEligible:false,
        blockerReasons:Object.freeze(['multiple-visible-killer-targets','source-does-not-select-one-target-actor'])
    }),
    Object.freeze({
        id:'CF-VMEC-OPP-CASE-04', motifId:MOTIF_ID,
        chartKey:'壬申|丙午|庚午|丙戌',
        sourceTerm:'两杀当权临旺……年干壬水临申，足以制杀。',
        sourceActorKeys:Object.freeze(['visible:0:壬']),
        targetActorKeys:Object.freeze(['visible:1:丙','visible:3:丙']),
        functionType:'restraint', sourceExplicitOutcome:true,
        targetSpecificActorResolved:false, calibrationEligible:false,
        blockerReasons:Object.freeze(['multiple-visible-killer-targets','source-does-not-select-one-target-actor'])
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
        MOTIF_IDS:Object.freeze({ OPPOSITION:MOTIF_ID, MEDIATION:'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001' }),
        CASES_BY_MOTIF:Object.freeze({ [MOTIF_ID]:calibrationCases })
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
runFile(context, 'js/bazi-contextual-force-party-collective-target-semantics-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-target-semantic-level-contract-source.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-contract.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity-profile.js');
runFile(context, 'js/bazi-contextual-force-party-actor-group-identity.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect-contract.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect-profile.js');
runFile(context, 'js/bazi-contextual-force-party-collective-relation-effect.js');
runFile(context, 'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration-contract.js');
runFile(context, 'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration-profile.js');
runFile(context, 'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration.js');

const GuiJia = context.GuiJia;
const targetSource = GuiJia.baziContextualForcePartyRelationTargetSemanticLevelContractSource;
const groupProfileApi = GuiJia.baziContextualForcePartyActorGroupIdentityProfile;
const effectProfileApi = GuiJia.baziContextualForcePartyCollectiveRelationEffectProfile;
const contractApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationContract;
const profileApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibrationProfile;
const runtimeApi = GuiJia.baziContextualForcePartyActorSetOppositionE2ECalibration;
const extension = extensions['contextual-force-party-actor-set-opposition-e2e-calibration-v01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-MOTIF-E2E-CALIBRATION-SOURCE-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-ACTOR-GROUP-IDENTITY-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-EXECUTION-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COLLECTIVE-RELATION-EFFECT-VISIBLE-FINITE-COVERAGE', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
]);

const extendBase = () => extension({}, {
    state:'available',
    contextualForcePartyCollectiveRelationEffect:Object.freeze({ installed:true }),
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

const targetCase = (id) => targetSource.AUDIT_CASES.find((item) => item.id === id);
const group = (id) => groupProfileApi.buildProfile().resolvedGroups.find((item) => item.groupId === id);
const effect = (id) => effectProfileApi.buildProfile().resolvedRecords.find((item) => item.id === id);
const calibrationCase = (id) => calibrationCases.find((item) => item.id === id);

test('Actor-Set Opposition E2E Calibration contract/profile/runtime 安装', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed, 'actor-set calibration 三层未完整安装');
    assert(typeof extension === 'function', 'actor-set calibration Synthesis extension 未注册');
    assert(contractApi.CONTRACT.calibrationIdentityType === 'actor-to-group', 'calibration identity 必须是 actor-to-group');
});

test('finite registry 完整：2 条 actor-set calibration 全部 resolved', () => {
    const profile = profileApi.buildProfile();
    assert(profile.records.length === 2 && profile.resolvedRecords.length === 2, 'finite registry 应 2/2 resolved');
    assert(profile.blockerRecords.length === 0 && profile.finiteRegistryCoverageComplete === true, 'finite registry coverage 应 complete');
});

test('VMEC CASE-02 → RTLC CASE-04 → GROUP-01 → CRE-01 端到端闭合', () => {
    const record = profileApi.buildProfile().resolvedRecords.find((item) => item.calibrationCaseId === 'CF-VMEC-OPP-CASE-02');
    assert(record?.sourceCaseId === 'CF-RTLC-CASE-04', 'CASE-02 source case 映射异常');
    assert(record.sourceActorKey === 'visible:3:丙', 'CASE-02 source actor 异常');
    assert(record.targetGroupId === 'CF-AGI-GROUP-01' && record.collectiveEffectId === 'CF-CRE-SOURCE-01', 'CASE-02 group/effect 映射异常');
    assert(record.targetMemberActorKeys.join('|') === 'visible:0:庚|visible:1:庚', 'CASE-02 target members 异常');
    assert(record.relationEffectState === 'realized-relation-effect-in-source-context' && record.relationType === RELATION_TYPES.ANCHOR_OPPOSITION, 'CASE-02 collective effect 未兑现');
});

test('VMEC CASE-04 → RTLC CASE-05 → GROUP-02 → CRE-02 端到端闭合', () => {
    const record = profileApi.buildProfile().resolvedRecords.find((item) => item.calibrationCaseId === 'CF-VMEC-OPP-CASE-04');
    assert(record?.sourceCaseId === 'CF-RTLC-CASE-05', 'CASE-04 source case 映射异常');
    assert(record.sourceActorKey === 'visible:0:壬', 'CASE-04 source actor 异常');
    assert(record.targetGroupId === 'CF-AGI-GROUP-02' && record.collectiveEffectId === 'CF-CRE-SOURCE-02', 'CASE-04 group/effect 映射异常');
    assert(record.targetMemberActorKeys.join('|') === 'visible:1:丙|visible:3:丙', 'CASE-04 target members 异常');
});

test('actor-set PASS 必须保留旧 actor-specific calibrationEligible=false 与 multi-target blocker', () => {
    profileApi.buildProfile().resolvedRecords.forEach((record) => {
        assert(record.originalActorSpecificCalibration.calibrationEligible === false, `${record.calibrationCaseId} 不得改写旧 calibrationEligible`);
        assert(record.originalActorSpecificCalibration.targetSpecificActorResolved === false, `${record.calibrationCaseId} 不得伪装 single-target resolved`);
        assert(record.originalActorSpecificCalibration.blockerReasons.includes('multiple-visible-killer-targets'), `${record.calibrationCaseId} 应保留 multi-target blocker`);
    });
});

test('actor-set calibration 不展开 member edges、不修改 visible realization registry', () => {
    profileApi.buildProfile().resolvedRecords.forEach((record) => {
        assert(record.memberEdgeExpansion === false && record.memberEdges.length === 0, '不得展开 member edges');
        assert(record.memberSpecificRealizationSynthesized === false, '不得合成 member-specific realization');
        assert(record.visibleFunctionRealizationRegistryMutation === false, '不得修改 visible realization registry');
    });
});

test('OPP CASE-01/03 未登记，不能因同样 multi-target wording 自动纳入', () => {
    const profile = profileApi.buildProfile();
    assert(profile.unregisteredOppositionCaseIds.join('|') === 'CF-VMEC-OPP-CASE-01|CF-VMEC-OPP-CASE-03', '未登记 opposition cases 应恰为 01/03');
    assert(profile.oppositionCaseFamilyCoverageComplete === false, 'opposition 全 corpus coverage 必须 unresolved');
});

test('错接 group 必须 unresolved，不能只靠“同为七杀 group”通过', () => {
    const entry = contractApi.FINITE_CALIBRATION_REGISTRY['CF-VMEC-OPP-CASE-02'];
    const badGroup = group('CF-AGI-GROUP-02');
    const validation = profileApi.validateCalibrationCandidate(
        entry,
        calibrationCase('CF-VMEC-OPP-CASE-02'),
        targetCase('CF-RTLC-CASE-04'),
        badGroup,
        effect('CF-CRE-SOURCE-01')
    );
    assert(validation.valid === false, '错 group 不得校准成功');
    assert(validation.issues.includes('group-registry-mismatch') || validation.issues.includes('chart-key-mismatch'), '应记录 group/chart provenance mismatch');
});

test('source actor 错配必须 unresolved', () => {
    const entry = contractApi.FINITE_CALIBRATION_REGISTRY['CF-VMEC-OPP-CASE-02'];
    const badCase = { ...calibrationCase('CF-VMEC-OPP-CASE-02'), sourceActorKeys:['visible:0:庚'] };
    const validation = profileApi.validateCalibrationCandidate(
        entry,
        badCase,
        targetCase('CF-RTLC-CASE-04'),
        group('CF-AGI-GROUP-01'),
        effect('CF-CRE-SOURCE-01')
    );
    assert(validation.valid === false, '错 source actor 不得校准成功');
    assert(validation.issues.includes('source-actor-target-case-mismatch') || validation.issues.includes('collective-effect-source-actor-mismatch'), '应记录 source actor mismatch');
});

test('一旦 collective effect 出现 member-edge expansion，calibration 必须拒绝', () => {
    const entry = contractApi.FINITE_CALIBRATION_REGISTRY['CF-VMEC-OPP-CASE-02'];
    const baseEffect = effect('CF-CRE-SOURCE-01');
    const badEffect = { ...baseEffect, memberEdgeExpansion:true, memberEdges:[{ source:'x', target:'y' }] };
    const validation = profileApi.validateCalibrationCandidate(
        entry,
        calibrationCase('CF-VMEC-OPP-CASE-02'),
        targetCase('CF-RTLC-CASE-04'),
        group('CF-AGI-GROUP-01'),
        badEffect
    );
    assert(validation.valid === false && validation.issues.includes('member-edge-expansion-detected'), 'member-edge expansion 必须 hard fail');
});

test('Synthesis 只解析 actor-set finite calibration；旧 actor-specific / total visible / global generalization 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CONTRACT']?.status === 'resolved', 'actor-set calibration contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-VISIBLE-FINITE-COVERAGE']?.status === 'resolved', 'finite actor-set calibration coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-ACTOR-SET-OPPOSITION-E2E-CALIBRATION-CORPUS-COVERAGE']?.status === 'unresolved', 'actor-set opposition corpus coverage 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION']?.status === 'unresolved', 'old actor-specific visible calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION']?.status === 'unresolved', 'visible motif total calibration 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CROSS-ACTOR-RELATION-EFFECT-GENERALIZATION']?.status === 'unresolved', 'global relation effect generalization 必须 unresolved');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
    assert(synthesis.assessmentLayer?.state === 'contract-only', 'Assessment 必须继续 contract-only');
});

test('actor-set calibration dependency graph 无环', () => {
    assert(hasDependencyCycle(extendBase().dependencies) === false, 'actor-set calibration dependency graph 不得形成环');
});

test('Actor-Set calibration 不引入 score / threshold / ranking / final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyActorSetOppositionE2ECalibration;
    assert(audit.numericScore === null && audit.scalarForce === null && audit.relativeDominance === null, 'numeric/dominance 应 null');
    const keys = collectKeys({ contract:contractApi.CONTRACT, audit });
    ['forceScore','calibrationScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序为 Visible Motif Audit → Actor Group → Collective Effect → Actor-Set Calibration → Modern Support', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js',
        'bazi-contextual-force-party-actor-group-identity.js',
        'bazi-contextual-force-party-collective-relation-effect.js',
        'bazi-contextual-force-party-actor-set-opposition-e2e-calibration-contract.js',
        'bazi-contextual-force-party-actor-set-opposition-e2e-calibration-profile.js',
        'bazi-contextual-force-party-actor-set-opposition-e2e-calibration.js',
        'bazi-contextual-force-party-relation-semantics-modern-support-source.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    [
        'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration-contract.js',
        'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration-profile.js',
        'js/bazi-contextual-force-party-actor-set-opposition-e2e-calibration.js'
    ].forEach((filename) => {
        const source = fs.readFileSync(path.join(ROOT, filename), 'utf8');
        assert(!source.includes('document.write'), `${filename} 不得持有隐式 loader`);
    });
});

console.log(`\nActor-Set Opposition E2E Calibration v0.1 tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);