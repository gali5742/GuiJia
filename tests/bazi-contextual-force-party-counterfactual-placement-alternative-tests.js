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
runFile(context, 'js/bazi-contextual-force-party-relation-semantics-modern-support-source.js');
runFile(context, 'js/bazi-contextual-force-party-relation-position-provenance-source.js');
runFile(context, 'js/bazi-contextual-force-party-counterfactual-placement-alternative-contract.js');
runFile(context, 'js/bazi-contextual-force-party-counterfactual-placement-alternative-profile.js');
runFile(context, 'js/bazi-contextual-force-party-counterfactual-placement-alternative.js');

const GuiJia = context.GuiJia;
const contractApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeContract;
const profileApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternativeProfile;
const runtimeApi = GuiJia.baziContextualForcePartyCounterfactualPlacementAlternative;
const extension = extensions['contextual-force-party-counterfactual-placement-alternative-v01'];
const registry = contractApi.SOURCE_REGISTRY['CF-PCPA-REC-01'];
const depMap = (synthesis) => Object.fromEntries((synthesis.dependencies || []).map((item) => [item.id, item]));

const BASE_DEPENDENCIES = Object.freeze([
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-SEMANTICS-CROSS-LITERATURE-MODERN-SUPPORT-AUDIT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-CONTRACT', status:'resolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] }),
    Object.freeze({ id:'SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION', status:'unresolved', dependsOnDependencyIds:[], resolvedByClaimIds:[] })
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

test('Counterfactual Placement Alternative v0.1 安装且只登记程潜命例一条记录', () => {
    assert(contractApi?.installed && profileApi?.installed && runtimeApi?.installed && typeof extension === 'function', 'contract/profile/runtime extension 未安装');
    assert(contractApi.VERSION === '0.1', 'version 应为0.1');
    assert(Object.keys(contractApi.SOURCE_REGISTRY).length === 1, 'v0.1 只能登记一个 source record');
    assert(registry?.positionRecordId === 'CF-RPP-REC-04', '应绑定 Position Provenance REC-04');
    assert(contractApi.CONTRACT.sourceWordingDefinesCompleteAlternativeChart === false, '来源不得被解释为完整替代命盘');
    assert(contractApi.CONTRACT.placementClassEqualsExactPlacement === false, 'placement class 不得等同 exact placement');
});

test('程潜实际盘保留 visible:3:辛 时上食神 identity 与 contested provenance', () => {
    const validation = profileApi.validateAlternativeCandidate(registry);
    assert(validation.valid === true && validation.issues.length === 0, 'registry validator 应通过');
    assert(validation.positionRecord?.chartKey === '壬午 癸卯 己巳 辛未', 'chartKey 异常');
    assert(validation.positionRecord.interpretationContested === true, '必须保留 interpretation contested');
    assert(validation.participant?.candidateActorKeys.includes('visible:3:辛'), '应保留 visible:3:辛');
    assert(validation.participant?.pillarLabels.includes('hour') && validation.participant?.pillarIndexes.includes(3), '辛实际 placement 应为 hour/3');
    assert(validation.participant?.bindingResolved === true, '实际 visible 辛 identity 应已 resolved');
});

test('counterfactual “如辛在年月”只解析为 year/month placement class', () => {
    const item = profileApi.buildAlternative(registry);
    assert(item.status === 'resolved-source-scoped-counterfactual-placement-alternative', 'finite alternative 应 resolved');
    assert(item.counterfactualWording === '如辛在年月', 'counterfactual wording 异常');
    assert(item.alternativeKind === 'counterfactual-placement-class', '应为 placement class');
    const options = item.alternativePlacementOptions.map((entry) => `${entry.pillar}:${entry.pillarIndex}`).sort();
    assert(options.join('|') === 'month:1|year:0', '只应保留 year/month 两个位置选项');
    assert(item.actualInterpretationWording.includes('时上食以制之'), '应保留 actual interpretation wording');
    assert(item.alternativeInterpretationWording.includes('食神生财，财生煞之局'), '应保留 alternative interpretation wording');
});

test('counterfactual 端不得生成完整 alternate chart、exact actorKey 或 displaced actor resolution', () => {
    const item = profileApi.buildAlternative(registry);
    assert(item.alternativeChartComplete === false && item.alternativeChart === null, '不得构造完整 alternate chart');
    assert(item.exactAlternativeActorKeyDefined === false && item.exactAlternativeActorKey === null, '不得构造 exact alternative actorKey');
    assert(item.displacedActorResolutionDefined === false && item.displacedActorResolution === null, '不得猜被占位置原干去向');
    assert(item.runtimePlacementMatcherDefined === false && item.runtimePlacementMatcher === null, '不得声称 runtime placement matcher 已定义');
    assert(item.chartMutation === null, '不得生成 chart mutation');
});

test('Modern Support E04/E05 必须共同存在，且来源必须是徐乐吾', () => {
    const validation = profileApi.validateAlternativeCandidate(registry);
    assert(validation.modernEvidence.length === 2, '应消费两条 modern support evidence');
    const ids = validation.modernEvidence.map((item) => item.id).sort();
    assert(ids.join('|') === 'CF-RSMS-E04|CF-RSMS-E05', 'modern evidence pair 异常');
    validation.modernEvidence.forEach((item) => assert(item.sourceId === GuiJia.baziContextualForcePartyRelationSemanticsModernSupportSource.SOURCES.xuLewu.id, 'modern evidence 必须来自徐乐吾'));
});

test('擅自把“年月”缩成单一 year 或 month placement 必须失败', () => {
    const yearOnly = { ...registry, alternativePillarOptions:[{ pillar:'year', pillarIndex:0 }] };
    const monthOnly = { ...registry, alternativePillarOptions:[{ pillar:'month', pillarIndex:1 }] };
    [yearOnly,monthOnly].forEach((tampered) => {
        const validation = profileApi.validateAlternativeCandidate(tampered);
        assert(validation.valid === false, '单一 placement 不得通过');
        assert(validation.issues.includes('alternative-placement-options-must-be-year-month-class'), '应报 placement class mismatch');
    });
});

test('擅自声明完整替代命盘 / exact actorKey / displaced actor resolver 必须失败', () => {
    const tampered = {
        ...registry,
        alternativeChartComplete:true,
        displacedActorResolutionDefined:true,
        exactAlternativeActorKeyDefined:true,
        runtimePlacementMatcherDefined:true
    };
    const validation = profileApi.validateAlternativeCandidate(tampered);
    assert(validation.valid === false, '越界声明不得通过');
    ['alternative-chart-must-remain-incomplete','displaced-actor-resolution-must-remain-undefined','exact-alternative-actor-key-must-remain-undefined','runtime-placement-matcher-must-remain-undefined']
        .forEach((issue) => assert(validation.issues.includes(issue), `缺 ${issue}`));
});

test('缺失 E05 relation-path alternative provenance 时必须失败', () => {
    const tampered = { ...registry, modernEvidenceIds:['CF-RSMS-E04'] };
    const validation = profileApi.validateAlternativeCandidate(tampered);
    assert(validation.valid === false, '缺 E05 不得通过');
    assert(validation.issues.includes('required-modern-evidence-pair-missing'), '应报 required evidence pair missing');
});

test('Profile 只闭合一条 finite placement alternative，不定义 global matcher', () => {
    const profile = profileApi.buildProfile();
    assert(profile.finiteCoverageComplete === true, 'finite coverage 应 complete');
    assert(profile.alternatives.length === 1 && profile.resolvedAlternatives.length === 1 && profile.unresolvedAlternatives.length === 0, '应1/1 resolved');
    assert(profile.runtimePlacementMatcher === null, 'global/runtime matcher 必须 null');
    assert(profile.alternativeCharts.length === 0, '不得生成 alternate charts');
    assert(profile.relationEffects.length === 0 && profile.memberEdges.length === 0, '不得生成 effect/member edges');
});

test('Synthesis 只 resolves finite counterfactual provenance；Position/Competing Path 总 consumer 继续 unresolved', () => {
    const synthesis = extendBase();
    const deps = depMap(synthesis);
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-CONTRACT']?.status === 'resolved', 'contract 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE-FINITE-COVERAGE']?.status === 'resolved', 'finite coverage 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE']?.status === 'resolved', 'finite alternative consumer 应 resolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE']?.status === 'unresolved', 'position total consumer 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']?.status === 'unresolved', 'global CRP resolver 必须 unresolved');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION'].dependsOnDependencyIds.includes('SD-CONTEXTUAL-FORCE-PARTY-COUNTERFACTUAL-PLACEMENT-ALTERNATIVE'), 'CRP resolver 应记录新 provenance 已可消费');
    assert(synthesis.sufficiency?.status === 'insufficient', 'Strength sufficiency 应继续 insufficient');
});

test('Counterfactual placement 不引入 execution/path-selection/score/threshold/ranking/final Strength', () => {
    const synthesis = extendBase();
    const audit = synthesis.contextualForcePartyCounterfactualPlacementAlternative;
    const c = contractApi.CONTRACT;
    assert(audit?.positionProvenanceAuthorizesExecution === false && audit?.runtimePathSelectionDefined === false, '不得授权 execution/path selection');
    assert(audit?.numericScore === null && audit?.scalarForce === null && audit?.relativeDominance === null, 'numeric/dominance 应保持 null');
    assert((audit.profile.relationEffects || []).length === 0 && (audit.profile.memberEdges || []).length === 0, 'effect/member edge guardrails 必须为空');
    assert(c.numericAggregation === false && c.numericWeights === false && c.thresholding === false && c.majorityVoting === false && c.ranking === false && c.scalarCollapse === false && c.finalStrengthMapping === false, 'numeric guardrails 应全部关闭');
    const keys = collectKeys({ contract:c, audit });
    ['distanceScore','placementScore','priorityScore','thresholdValue','majorityResult','rankingResult','finalStrength'].forEach((key) => assert(!keys.has(key), `不应出现 ${key}`));
});

test('研究 bootstrap 顺序应为 Modern Support → Position Provenance → Counterfactual Alternative → Competing Path → Sequential Composition', () => {
    const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
    const ordered = [
        'bazi-contextual-force-party-relation-semantics-modern-support-audit.js',
        'bazi-contextual-force-party-relation-position-provenance-source.js',
        'bazi-contextual-force-party-relation-position-provenance-audit.js',
        'bazi-contextual-force-party-counterfactual-placement-alternative-contract.js',
        'bazi-contextual-force-party-counterfactual-placement-alternative-profile.js',
        'bazi-contextual-force-party-counterfactual-placement-alternative.js',
        'bazi-contextual-force-party-competing-relation-path-source.js',
        'bazi-contextual-force-party-competing-relation-path-audit.js',
        'bazi-contextual-force-party-source-scoped-sequential-composition-contract.js'
    ];
    let previous = -1;
    ordered.forEach((needle) => {
        const index = bootstrap.indexOf(needle);
        assert(index > previous, `bootstrap 顺序异常: ${needle}`);
        previous = index;
    });
    ['contract','profile',''].forEach((suffix) => {
        const file = suffix
            ? `js/bazi-contextual-force-party-counterfactual-placement-alternative-${suffix}.js`
            : 'js/bazi-contextual-force-party-counterfactual-placement-alternative.js';
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert(!source.includes('document.write'), `${file} 不得持有隐式 loader`);
    });
    assert(!bootstrap.includes('DOMContentLoaded'), 'research bootstrap 不得引入 DOMContentLoaded async loader');
});

console.log(`\nCounterfactual Placement Alternative tests: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
