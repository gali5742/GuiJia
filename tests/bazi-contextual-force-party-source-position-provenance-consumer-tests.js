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
const api = g.baziContextualForcePartySourcePositionProvenanceConsumerProfile;
const { STATES } = api;
const source = g.baziContextualForcePartyRelationPositionProvenanceSource;
const copy = (value) => JSON.parse(JSON.stringify(value));
const normalized = (id) => api.normalizeRecord(`CF-RPP-REC-0${id}`);
const CHENG = '壬午|癸卯|己巳|辛未';
const HE = '丙寅|戊戌|壬戌|辛丑';
const resolve = (id, chartKey) => api.resolveNormalizedRecord(normalized(id), chartKey);
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
const heOutput = outputFor(HE);
const heSynthesis = heOutput.semanticModel.strengthSynthesis;
const depMap = (s) => Object.fromEntries(s.dependencies.map((d) => [d.id, d]));
test('full bootstrap installs R10 and normalizes five records / eight units', () => {
    const profile = api.buildProfile();
    assert(profile.sourceInputCoverageComplete && profile.normalizedUnitCount === 8, 'finite normalization missing');
    assert(profile.sourcePatternCount === 3 && profile.resolvedSourceChartCount === 1 && profile.unresolvedSourceChartCount === 1, 'source-scoped states conflated');
});
test('normalization preserves source identity, wording, tier, chart and contested provenance', () => {
    const n = normalized(4), r = source.RECORDS.find((x) => x.id === n.sourceRecordId);
    assert(n.sourceContractId === source.CONTRACT.id && n.sourceRuleId === source.RULE_ID, 'authority identity lost');
    assert(n.provenance.sourceId === r.sourceId && n.provenance.sourceTier === r.sourceTier && n.provenance.locator === r.locator, 'source identity lost');
    assert(n.provenance.interpretationContested && n.provenance.sourceExtract === r.sourceExtract && n.units[0].sourceWording === r.assertions[0].sourceWording, 'source context lost');
});
test('opposite orders remain independent source patterns without runtime priority', () => {
    const r = resolve(1, HE);
    assert(r.status === STATES.PATTERN && r.units.length === 2, 'abstract order treated as actual');
    assert(r.units[0].semanticAssertion.orderedRefIds.join(',') === 'wealth,food', 'first order lost');
    assert(r.units[1].semanticAssertion.orderedRefIds.join(',') === 'food,wealth', 'alternative order lost');
    assert(r.units.every((u) => !u.participantBindings.length && !u.runtimeConditionResolved), 'role class bound by chart distance');
});
test('absence of Xin separation preserves negative polarity and creates no barrier actor', () => {
    const r = resolve(2, HE), u = r.units[1];
    assert(u.semanticAssertion.presence === 'absent' && u.semanticAssertion.qualifier === 'separation-absent', 'absence changed to positive barrier');
    assert(u.semanticAssertion.intermediateRefIds[0] === 'xin' && !u.participantBindings.length && !r.memberEdges.length, 'absent reference created intermediate actor');
});
test('intervening Jia remains a source-mentioned ref, not every between-index actor', () => {
    const u = resolve(2, HE).units[0];
    assert(u.semanticAssertion.intermediateRefIds.join(',') === 'jia' && u.semanticAssertion.presence === 'present', 'intervening reference changed');
    assert(!u.participantBindings.length && u.participants.length === 3, 'geometry expanded source assertion');
});
test('proximity alternatives are two conditional pairs, not one triple or simultaneous bindings', () => {
    const r = resolve(3, CHENG);
    assert(r.units.length === 2 && r.units.every((u) => u.participants.length === 2), 'proximity flattened');
    assert(r.units[0].participants[1].refId === 'killer' && r.units[1].participants[1].refId === 'officer', 'alternative targets lost');
    assert(r.units[0].semanticAssertion.alternativeGroupId === r.units[1].semanticAssertion.alternativeGroupId, 'alternative identity lost');
    assert(r.runtimeTargetActorKey === null && r.units.every((u) => !u.runtimeConditionResolved), 'proximity chose target');
});
test('Chengqian retains explicit visible wealth set / food but refuses surface killer binding', () => {
    const r = resolve(4, CHENG), bindings = r.units[0].participantBindings;
    assert(r.status === STATES.UNRESOLVED && r.provenance.interpretationContested, 'contested cross-scope record promoted');
    assert(bindings[0].actorKeys.join(',') === 'visible:0:壬,visible:1:癸' && bindings[1].actorKeys[0] === 'visible:3:辛', 'explicit placement not consumed');
    assert(bindings[2].scope === 'surface-branch' && !bindings[2].actorKeys.length, 'surface role guessed as hidden actor');
    assert(!r.relationEffects.length && !r.memberEdges.length && !r.executionAuthorized, 'descriptive set expanded into effects');
});
test('He actual placements resolve while alternative placements remain counterfactual', () => {
    const r = resolve(5, HE), u = r.units[0];
    assert(r.status === STATES.RESOLVED && u.semanticAssertion.mode === 'counterfactual-source-chart', 'swap provenance unresolved');
    assert(u.participantBindings.map((b) => b.actorKeys[0]).join(',') === 'visible:1:戊,visible:3:辛', 'original actor identity changed');
    assert(u.counterfactual.alternativePlacements.map((p) => p.pillar).join(',') === 'hour,month', 'counterfactual placements lost');
    assert(!r.executionAuthorized && !r.relationEffects.length && !u.runtimeConditionResolved, 'swap executed or chose a path');
});
test('missing exact chart refuses actor binding', () => {
    const r = resolve(5);
    assert(r.status === STATES.UNRESOLVED && !r.units.length && r.blockerReasons.includes('exact-source-chart-required'), 'implicit chart binding allowed');
});
test('changed branch refuses same-stem source case', () => {
    assert(resolve(5, '丙寅|戊戌|壬戌|辛未').status === STATES.UNRESOLVED, 'changed branch accepted');
});
test('actually swapped chart is not licensed by the counterfactual statement', () => {
    const r = resolve(5, '丙寅|辛丑|壬戌|戊戌');
    assert(r.status === STATES.UNRESOLVED && !r.units.length, 'alternative chart received actual position authority');
});
test('unknown source identity fails normalization closed', () => {
    assert(api.normalizeRecord('unknown').normalizationState === STATES.INVALID, 'unknown source accepted');
});
const tamperSource = (name, edit) => test(name, () => {
    const r = copy(source.RECORDS.find((x) => x.id === 'CF-RPP-REC-05'));
    edit(r);
    const n = api.normalizeRecord(r);
    assert(n.normalizationState === STATES.INVALID && !n.units.length, 'forged source accepted');
});
tamperSource('source ID substitution fails closed', (r) => { r.sourceId = 'CF-RPP-SRC-SXZ'; });
tamperSource('source tier substitution fails closed', (r) => { r.sourceTier = 'classical-semantic-authority'; });
tamperSource('source chart substitution fails closed', (r) => { r.chartKey = '丙寅 戊戌 壬戌 辛未'; });
tamperSource('forged source realization authority fails closed', (r) => { r.assertions[0].executableRelationAuthorization = true; });
const tamperNormalized = (name, id, chartKey, edit) => test(name, () => {
    const n = copy(normalized(id)); edit(n);
    const r = api.resolveNormalizedRecord(n, chartKey);
    assert(r.status === STATES.UNRESOLVED && !r.units.length && !r.executionAuthorized, 'forged normalized input accepted');
});
tamperNormalized('polarity tamper cannot turn absent separation into a barrier', 2, HE, (n) => { n.units[1].semanticAssertion.presence = 'present'; });
tamperNormalized('raw distance cannot substitute curated proximity', 3, CHENG, (n) => { n.units[0].semanticAssertion.distance = 1; });
tamperNormalized('forced participant binding cannot resolve branch scope', 4, CHENG, (n) => { n.units[0].participants[2].declaredBinding = true; n.units[0].participants[2].candidateActorKeys = ['hidden:1:乙']; });
tamperNormalized('counterfactual placement mutation fails closed', 5, HE, (n) => { n.units[0].counterfactual.alternativePlacements[0].pillar = 'year'; });
tamperNormalized('source wording cannot replace curated assertion identity', 5, HE, (n) => { n.units[0].sourceWording = '贴近'; });
tamperNormalized('extra effect authority fails closed', 5, HE, (n) => { n.effectType = 'anchor-opposition'; });
tamperNormalized('sparse extra participants cannot bypass exact normalized cardinality', 5, HE, (n) => { n.units[0].participants.length = 3; });
test('normalized nested provenance is immutable', () => {
    const n = normalized(5);
    assert(Object.isFrozen(n.units[0].counterfactual.originalPlacements[0]) && Object.isFrozen(n.units[0].participants[0].placements[0]), 'nested provenance mutable');
});
test('actual synthesis exposes only matching runtime source record and keeps global position/path unresolved', () => {
    const p = heSynthesis.contextualForcePartySourcePositionProvenanceConsumer;
    const deps = depMap(heSynthesis);
    assert(p.runtimeRecords.length === 1 && p.runtimeRecords[0].sourceRecordId === 'CF-RPP-REC-05', 'runtime source leakage');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PROVENANCE-CONSUMER'].status === 'resolved', 'narrow consumer dependency missing');
    for (const id of ['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE','SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE-COVERAGE','SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']) assert(deps[id].status === 'unresolved', `global dependency promoted: ${id}`);
    assert(!p.genericPositionResolverDefined && !p.corpusPositionCoverageComplete && heSynthesis.sufficiency.status === 'insufficient', 'global maturity promoted');
});
test('unrelated runtime chart gets no position authority; R9 effect calibration survives', () => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(!s.contextualForcePartySourcePositionProvenanceConsumer.runtimeRecords.length, 'unrelated chart bound by proximity');
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'), 'R9 calibration regressed');
    const blockers = s.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit;
    assert(blockers.unresolvedGlobalResolverBlockerCount === 4, 'R6 global blockers changed');
    assert(blockers.unresolvedGlobalResolverBlockers.map((b) => b.id).join(',') === 'CF-EASC-B02,CF-EASC-B03,CF-EASC-B04,CF-EASC-B05', 'remaining scopes changed');
});
test('provenance consumer creates no final assessment or numeric force', () => {
    const p = heSynthesis.contextualForcePartySourcePositionProvenanceConsumer;
    assert(p.numericScore === null && p.relativeDominance === null && !p.executionAuthorized && !p.relationEffects.length, 'numeric or effect output introduced');
    assert(heOutput.semanticModel.assessmentLayer.state === 'contract-only', 'final assessment unlocked');
});
console.log(`\nSource Position Provenance Consumer tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
