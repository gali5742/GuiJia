#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor/lunar.js'));
const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
const entries = [...bootstrap.matchAll(/Object\.freeze\(\{\s*globalKey:'([^']+)',\s*src:'([^']+)'\s*\}\)/g)]
    .map((m) => ({ key:m[1], file:m[2].replace(/^\.\//, '').replace(/\?.*$/, '') }));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let passed = 0, failed = 0;
const test = (name, fn) => {
    try { fn(); passed++; console.log(`✓ ${name}`); }
    catch (error) { failed++; console.error(`✗ ${name}\n  ${error.stack}`); }
};
const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
context.window = context; context.globalThis = context; vm.createContext(context);
const run = (file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
['js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-strength-effects.js'].forEach(run);
for (const entry of entries) { run(entry.file); assert(context.GuiJia[entry.key], `bootstrap dependency missing: ${entry.key}`); }
['js/bazi-assessment.js','js/bazi-interpretation.js'].forEach(run);
const g = context.GuiJia;
const api = g.baziContextualForcePartySourceInstanceTargetCalibrationProfile;
const matcher = g.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
const { STATES } = api;
const copy = (value) => JSON.parse(JSON.stringify(value));
const input = () => api.inputForCase();

// Synthetic condition fixtures, not classical chart cases or effect calibration evidence.
const WEALTH_FIRST = '癸卯|乙卯|己巳|辛未';
const FOOD_FIRST = '丙午|辛卯|己巳|癸酉';
function outputFor(chartKey) {
    const bazi = g.baziCore;
    const chars = chartKey.split('|').map((part) => Array.from(part));
    const gans = chars.map((p) => p[0]), zhis = chars.map((p) => p[1]);
    const dayGan = gans[2], dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level,
            wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return g.baziInterpretation.buildBaziInterpretation({ dayGan, dayGanWuXing:dayElement, pillars,
        internalRelations, monthSeason, dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', solarStr:'测试时间', ruleSummary:'测试口径' });
}

const contract = g.baziContextualForcePartySourceInstanceTargetCalibrationContract;
const CHART = contract.SOURCE_CASE.chartKey;
const sourceOutput = outputFor(CHART);
const sourceModel = sourceOutput.semanticModel, synthesis = sourceModel.strengthSynthesis;
const actualContext = () => ({ chartKey:CHART, inventory:synthesis.contextualForcePartyMembershipInventory });
const evaluate = () => api.evaluateInstance(input(), actualContext());
test('complete new source case and independent annotation/identity authority validate', () => {
    assert(api.validateSourceInput(input()).valid && contract.SOURCE_CASE.gans.join(',') === '壬,丁,丁,癸', 'source provenance invalid');
    assert(contract.SOURCE_CASE.sourceTier === 'classical-semantic-authority' && contract.SOURCE_CASE.retrievedOn === '2026-10-11', 'source provenance missing');
    assert(contract.SOURCE_CASE.revisionId === null, 'unverified revision borrowed');
});
test('actual chart inventory resolves the source-mentioned hour Gui killer identity', () => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.binding.targetEndpoint.actorKey === 'visible:3:癸'
        && r.binding.targetEndpoint.scope === 'visible-stem' && r.binding.targetEndpoint.cardinality === 1, 'hour target unresolved');
    assert(r.binding.sourceEndpoint.actorKey === 'visible:0:壬' && r.binding.sourceRoleClass === '正官', 'source officer identity lost');
});
test('existing normalized-unit adapter and normalized-record validator consume the reviewed binding', () => {
    const n = evaluate().normalizedInput;
    assert(n.validation.valid && n.normalizationState === 'normalized-source-scoped-input', 'normalization failed');
    assert(g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(n).valid, 'existing contract bypassed');
    const unit = n.relationUnits[0];
    assert(unit.bindingRequired && unit.identityProvenance.state === 'resolved-source-scoped-actor-identity'
        && unit.identityProvenance.identityAuthorityId === 'CF-SITC-IDENTITY-01', 'independent identity authority lost');
});
test('actual generic target kernel selects single actor rather than role class or group', () => {
    const unit = evaluate().targetResolution.unitResolutions[0];
    assert(unit.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && unit.semanticLevel === 'single-actor'
        && unit.targetReference.actorKey === 'visible:3:癸' && unit.targetReference.targetRoleClass === '七杀', 'generic kernel target mismatch');
});
test('hour target mention and independent source officer spans retain exact provenance', () => {
    const n = evaluate().normalizedInput, unit = n.relationUnits[0];
    assert(unit.targetMention.span === '杀' && unit.targetMention.antecedentSpan === '时杀'
        && unit.sourceRoleSpan === '壬水官星' && unit.predicateSpan === '助', 'source roles collapsed');
    assert(n.provenance.sourceText === contract.SOURCE_CASE.sourceText && n.provenance.locator === contract.SOURCE_CASE.locator, 'source excerpt/locator lost');
});
test('normalized input contains no target-level hint or effect mapping', () => {
    const n = evaluate().normalizedInput;
    const forbidden = g.baziContextualForcePartyRelationTargetNormalizedInputContract.FORBIDDEN_DECISION_FIELDS;
    assert(forbidden.every((key) => !Object.hasOwn(n,key) && !Object.hasOwn(n.relationUnits[0],key)), 'resolver decision injected');
    assert(n.relationUnits[0].relationSemanticHint === null && n.relationEffect === null, '助 became effect type');
});
test('source scoped instance ID includes complete chart and own path identity', () => {
    const b = evaluate().binding;
    assert(b.instanceId === `${CHART}::CF-SITC-PATH-01` && b.sourceCaseScoped && b.authorityScope === 'exact-source-case-target-identity-only', 'source identity broadened');
});
test('resolved endpoint identity leaves realization and effect authorization unresolved', () => {
    const r = evaluate();
    assert(!r.relationRealizationResolved && r.realizationState === 'unresolved' && !r.effectAuthorizationResolved && !r.executionAuthorized
        && !r.relationEffects.length && !r.memberEdges.length && r.runtimeWinnerPathId === null, 'identity became effect');
});
test('actual R4 kernel cannot execute solely from the resolved target identity', () => {
    const r = evaluate(), out = g.baziContextualForcePartyGenericRelationEffectExecutionProfile.executeRelationEffect({
        id:'CF-SITC-PATH-01',sourceEndpoint:r.binding.sourceEndpoint,targetResolution:r.targetResolution.unitResolutions[0],
        relationIdentity:{ id:'CF-SITC-PATH-01',functionType:'peer',directed:true },realizationState:r.realizationState,
        authorization:{ state:'unresolved',sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[] }
    });
    assert(!out.realized && out.effectType === null && out.executionState === 'unresolved-generic-relation-effect', 'R4 executed identity-only input');
});
test('new source identity case adds no direct realization pattern', () => {
    assert(!g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART), 'realization registry extended');
});
test('same stems in a changed branch context cannot inherit identity calibration', () => {
    const r = api.evaluateInstance(input(), { ...actualContext(), chartKey:'壬申|丁未|丁未|癸亥' });
    assert(r.status === STATES.NOT_APPLICABLE && !r.binding && !r.targetResolution, 'changed branch inherited authority');
});
test('same roles at different positions cannot inherit target identity', () => {
    const r = api.evaluateInstance(input(), { ...actualContext(), chartKey:'癸卯|丁未|丁未|壬申' });
    assert(r.status === STATES.NOT_APPLICABLE && !r.binding, 'position transfer accepted');
});
test('missing or malformed chart cannot produce authoritative binding', () => {
    for (const chartKey of [null, { chart:CHART }, 'bad']) {
        const r = api.evaluateInstance(input(), { ...actualContext(), chartKey });
        assert(r.status !== STATES.RESOLVED && !r.binding, 'malformed chart bound');
        if (chartKey && typeof chartKey === 'object') assert(!Object.isFrozen(chartKey), 'caller chart frozen');
    }
});
test('missing/invalid actual inventory keeps target unresolved', () => {
    for (const inventory of [null,{},[],{ actorProfiles:[null],evidenceRecords:[] }]) {
        const r = api.evaluateInstance(input(),{ chartKey:CHART,inventory });
        assert(r.status === STATES.UNRESOLVED && !r.binding, 'missing actual inventory replaced');
    }
});
const inventoryTamper = (name, edit) => test(name, () => {
    const context = copy(actualContext()); edit(context.inventory);
    const r = api.evaluateInstance(input(),context);
    assert(r.status === STATES.UNRESOLVED && !r.binding && !r.targetResolution, 'forged inventory accepted');
});
inventoryTamper('duplicate target actor cannot resolve by first selection', (i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'visible:3:癸'))); });
inventoryTamper('missing target actor cannot be reconstructed from chart alone', (i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:3:癸'); });
inventoryTamper('missing source officer cannot become a hidden or group source', (i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:0:壬'); });
inventoryTamper('wrong target ten god cannot reuse valid chart key', (i) => { i.evidenceRecords.filter((r) => r.actorKey === 'visible:3:癸').forEach((r) => { r.tenGod = '正官'; }); });
inventoryTamper('conflicting endpoint ten gods cannot resolve by any matching role', (i) => { i.evidenceRecords.push({ actorKey:'visible:3:癸',tenGod:'正官' }); });
inventoryTamper('missing source role evidence cannot reuse actor profile', (i) => { i.evidenceRecords = i.evidenceRecords.filter((r) => r.actorKey !== 'visible:0:壬'); });
const tamper = (name, edit) => test(name, () => {
    const supplied = copy(input()); edit(supplied);
    const r = api.evaluateInstance(supplied,actualContext());
    assert(r.status === STATES.INVALID && !r.sourceValidation.valid && !r.binding && r.sourceCaseId === null, 'forged source authority accepted');
    assert(!Object.isFrozen(supplied), 'caller source data frozen');
});
tamper('caller cannot replace source chart while retaining authority', (i) => { i.sourceCase.chartKey = WEALTH_FIRST; });
tamper('caller cannot replace the hour position wording', (i) => { i.identityAuthority.targetPositionSpan = '月杀'; });
tamper('caller cannot change target scope to hidden', (i) => { i.identityAuthority.targetScope = 'hidden-branch'; });
tamper('caller cannot replace hour Gui with officer Ren target', (i) => { i.identityAuthority.targetActorKey = 'visible:0:壬'; });
tamper('caller cannot turn source-scoped singular target into a group', (i) => { i.identityAuthority.targetCardinality = 2; });
tamper('caller cannot drop target antecedent', (i) => { i.annotation.relationUnits[0].target.antecedentSpan = null; });
tamper('caller cannot alter original source excerpt', (i) => { i.sourceCase.sourceText = '官星助杀'; });
tamper('caller cannot reuse R11 path ID as identity authority', (i) => { i.identityAuthority.sourcePathId = 'CF-CRP-REC-01-P01'; });
tamper('caller cannot authorize transfer to R11 paths', (i) => { i.identityAuthority.transferablePathIds = ['CF-CRP-REC-01-P01']; });
tamper('caller cannot inject realization/effect authorization', (i) => { i.identityAuthority.relationRealizationAuthorized = true; i.identityAuthority.effectTypeAuthorized = true; });
tamper('caller cannot add unrelated CASE06 binding as extra authority', (i) => { i.hiddenBinding = { sourceCaseId:'CF-RTLC-CASE-06' }; });
test('unknown source IDs and malformed input shapes fail closed', () => {
    for (const i of [null,[],42,{},api.inputForCase('CF-CRP-REC-01')]) assert(api.evaluateInstance(i,actualContext()).status === STATES.INVALID, 'unregistered source accepted');
});
test('actual source case inputs remain unchanged and output identity/provenance is deeply immutable', () => {
    const supplied = copy(input()), ctx = copy(actualContext()), before = JSON.stringify([supplied,ctx]);
    const r = api.evaluateInstance(supplied,ctx);
    assert(JSON.stringify([supplied,ctx]) === before && !Object.isFrozen(ctx.inventory.actorProfiles), 'caller data mutated');
    assert(Object.isFrozen(r.binding.targetEndpoint) && Object.isFrozen(r.normalizedInput.provenance.gans)
        && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance.targetCandidateKeys), 'mutable binding output');
});
test('complete source chart reaches new runtime identity profile through full research synthesis', () => {
    const p = synthesis.contextualForcePartySourceInstanceTargetCalibration;
    assert(p.finiteSourceIdentityCoverageComplete && p.resolvedRuntimeTargetCount === 1 && p.result.status === STATES.RESOLVED, 'full runtime binding missing');
    assert(p.sourceCaseCount === 1 && p.targetIdentityCalibrationIntroduced && !p.positiveEffectCalibrationIntroduced, 'identity/effect calibration conflated');
});
test('R11 order-chart targets stay unresolved despite new identity calibration', () => {
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceInstanceTargetCalibration.resolvedRuntimeTargetCount === 0
        && s.contextualForcePartySourceInstanceTargetCalibration.result.status === STATES.NOT_APPLICABLE, 'R14 identity transferred');
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.length === 2
        && s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null), 'R13 role target bound');
});
test('existing CASE06 hidden target authority remains independent and unchanged', () => {
    const hidden = g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings;
    assert(hidden.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'), 'existing hidden calibration regressed');
    const s = outputFor('辛卯|戊戌|丙辰|己亥').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceInstanceTargetCalibration.result.status === STATES.NOT_APPLICABLE, 'hidden case adopted visible authority');
});
test('narrow source identity dependency resolves without releasing B02-B05 or final assessment', () => {
    const deps = Object.fromEntries(synthesis.dependencies.map((d) => [d.id,d]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-INSTANCE-TARGET-CALIBRATION'].status === 'resolved', 'narrow source capability unresolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4, 'global blockers released');
    assert(synthesis.sufficiency.status === 'insufficient' && sourceModel.assessmentLayer.state === 'contract-only', 'final output unlocked');
    assert(!synthesis.contextualForcePartySourceInstanceTargetCalibration.genericTargetIdentityResolverDefined, 'generic scope claimed');
});
test('source coverage capability remains separate from current chart applicability', () => {
    const p = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartySourceInstanceTargetCalibration;
    assert(p.finiteSourceIdentityCoverageComplete && p.resolvedRuntimeTargetCount === 0 && p.transferredR11TargetCount === 0, 'coverage/runtime conflated');
});
test('R9 actual mediation stays intact with no new effect from R14', () => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'), 'R9 effect regressed');
    assert(!s.contextualForcePartySourceInstanceTargetCalibration.relationEffects.length, 'new source identity executed');
});
test('missing upstream extension is inert and omitted chart remains unresolved', () => {
    const base = {};
    assert(g.baziContextualForcePartySourceInstanceTargetCalibration.extendSynthesis({},base) === base, 'missing upstream fabricated');
    assert(api.buildProfile().result.status === STATES.UNRESOLVED, 'missing chart source-bound');
});
console.log(`\nSource Instance Target Calibration tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
