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
const api = g.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
const { STATES } = api;
const copy = (value) => JSON.parse(JSON.stringify(value));
const input = (number) => api.inputForLink(`CF-SPPCM-LINK-0${number}`);
const evaluate = (number, chart) => api.evaluateCondition(input(number), chart);
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
test('four position/path links validate through actual R10 normalization in full bootstrap', () => {
    for (let n = 1; n <= 4; n++) assert(api.validateLinkInput(input(n)).valid, `invalid link ${n}`);
});
test('wealth-first condition matches unique source-mentioned stems within Ji/Mao context', () => {
    const r = evaluate(1, WEALTH_FIRST);
    assert(r.status === STATES.MATCHED && r.runtimeConditionResolved && r.conditionSatisfied === true, 'source order not matched');
    assert(r.positionParticipantBindings.map((b) => b.actorKey).join(',') === 'visible:0:癸,visible:3:辛', 'source-mentioned identities lost');
    assert(r.pathIds.join(',') === 'CF-CRP-REC-01-P01,CF-CRP-REC-01-P02' && r.sourcePathPolicy.coexistenceMode === 'source-permits-coexistence', 'source path identities/policy lost');
});
test('food-first condition consumes inherited source context and Gui at hour', () => {
    const r = evaluate(2, FOOD_FIRST);
    assert(r.status === STATES.MATCHED && r.conditionChecks.sourceAbsolutePlacementsSatisfied, 'source hour/order not matched');
    assert(r.sourceContext.sourceRecordId === 'CF-CRP-REC-01' && r.sourceContext.sourceSpan === '如己生卯月', 'comparison context lost');
    assert(r.positionParticipantBindings.find((b) => b.refId === 'wealth').pillar === 'hour', 'absolute placement lost');
});
test('compound source path remains one identity and never expands into member effects', () => {
    const r = evaluate(2, FOOD_FIRST), p = r.linkedPaths[1];
    assert(p.id === 'CF-CRP-REC-02-P02' && p.pathKind === 'compound-source-relation' && p.intermediateRoleClasses.join(',') === '食神', 'compound source path flattened');
    assert(r.linkedPaths.length === 2 && !p.executable && !p.memberEdgeExpansion && !r.memberEdges.length, 'compound path executed');
});
test('opposite order is known unsatisfied, never not-realized or reversed effect', () => {
    const r = evaluate(1, FOOD_FIRST);
    assert(r.status === STATES.NOT_SATISFIED && r.runtimeConditionResolved && r.conditionSatisfied === false, 'false order conflated with unresolved');
    assert(!r.relationRealizationResolved && !r.executionAuthorized && !r.relationEffects.length && r.runtimeWinnerPathId === null, 'condition failure became relation outcome');
});
test('food before wealth without Gui at hour fails the absolute source condition', () => {
    const r = evaluate(2, '辛酉|癸卯|己巳|丙寅');
    assert(r.status === STATES.NOT_SATISFIED && r.conditionChecks.sourceOrderSatisfied && !r.conditionChecks.sourceAbsolutePlacementsSatisfied, 'hour requirement bypassed');
});
test('wealth-first ordering does not require nearest adjacency', () => {
    assert(evaluate(1, WEALTH_FIRST).status === STATES.MATCHED, 'nonadjacent declared order rejected');
    assert(evaluate(1, '癸酉|辛卯|己巳|甲子').status === STATES.MATCHED, 'adjacent declared order rejected');
});
test('unconstrained branch changes do not turn the condition pattern into an exact-case effect', () => {
    const r = evaluate(1, '癸酉|乙卯|己未|辛酉');
    assert(r.status === STATES.MATCHED && !r.relationRealizationResolved && !r.executionAuthorized, 'registered pattern/effect boundary lost');
});
test('wrong day master is outside the registered context, not an evaluated false order', () => {
    const r = evaluate(1, '癸卯|乙卯|戊辰|辛未');
    assert(r.status === STATES.NOT_APPLICABLE && !r.runtimeConditionResolved && r.conditionSatisfied === null, 'day context ignored');
});
test('wrong month branch is outside both inherited source order conditions', () => {
    for (const n of [1,2]) assert(evaluate(n, '癸卯|丙辰|己巳|辛未').status === STATES.NOT_APPLICABLE, 'month context ignored');
});
test('duplicate visible Xin stays unresolved rather than choosing first or closest', () => {
    const r = evaluate(1, '癸卯|辛卯|己巳|辛未');
    assert(r.status === STATES.UNRESOLVED && !r.runtimeConditionResolved && !r.positionParticipantBindings.length, 'ambiguous food selected');
});
test('duplicate visible Gui stays unresolved rather than resolving a wealth group', () => {
    assert(evaluate(1, '癸卯|癸卯|己巳|辛未').status === STATES.UNRESOLVED, 'ambiguous wealth group guessed');
});
test('same wealth role with Ren cannot substitute the source-mentioned Gui', () => {
    assert(evaluate(1, '壬寅|乙卯|己巳|辛未').status === STATES.UNRESOLVED, 'role equivalence expanded source pattern');
});
test('hidden-only Xin cannot satisfy visible source order', () => {
    assert(evaluate(1, '癸酉|乙卯|己巳|丙寅').status === STATES.UNRESOLVED, 'hidden Xin promoted into visible identity');
});
test('missing or malformed chart stays unresolved', () => {
    for (const key of [null,'癸卯|乙卯|己巳','bad']) assert(evaluate(1, key).status === STATES.UNRESOLVED, 'malformed chart accepted');
});
test('invalid input shapes fail closed and do not freeze caller data', () => {
    for (const value of [null,[],42]) assert(api.evaluateCondition(value, WEALTH_FIRST).status === STATES.UNRESOLVED, 'invalid input shape accepted');
    const malformedChart = { value:WEALTH_FIRST };
    assert(api.evaluateCondition(input(1), malformedChart).status === STATES.UNRESOLVED && !Object.isFrozen(malformedChart), 'invalid chart mutated caller data');
});
test('nearest visible killer does not resolve proximity or exclusive selection', () => {
    const chart = '庚午|丙寅|甲辰|辛未';
    for (const n of [3,4]) {
        const r = evaluate(n, chart);
        assert(r.status === STATES.UNRESOLVED && !r.runtimeConditionResolved && r.runtimeWinnerPathId === null, 'raw distance resolved proximity');
        assert(r.sourcePathPolicy.coexistenceMode === 'source-requires-exclusive-selection', 'source exclusivity lost');
    }
});
test('yin day is outside the cited yang-day proximity context', () => {
    assert(evaluate(3, WEALTH_FIRST).status === STATES.NOT_APPLICABLE, 'yang-day qualifier discarded');
});
test('proximity pairs link to separate condition and path IDs', () => {
    const a = evaluate(3, '庚午|丙寅|甲辰|辛未'), b = evaluate(4, '庚午|丙寅|甲辰|辛未');
    assert(a.conditionId === 'CF-CRP-REC-03-C01' && b.conditionId === 'CF-CRP-REC-03-C02', 'condition identities collapsed');
    assert(a.pathIds[0] === 'CF-CRP-REC-03-P01' && b.pathIds[0] === 'CF-CRP-REC-03-P02', 'path identities collapsed');
});
const tamper = (name, edit, n = 1) => test(name, () => {
    const fixture = copy(input(n)); edit(fixture);
    const r = api.evaluateCondition(fixture, WEALTH_FIRST);
    assert(r.status === STATES.UNRESOLVED && !r.validation.valid && !r.pathIds.length && !r.executionAuthorized, 'forged input accepted');
});
tamper('wrong path ID cannot reuse a position assertion', (f) => { f.link.pathIds[0] = 'CF-CRP-REC-02-P01'; });
tamper('wrong condition ID cannot reuse source wording', (f) => { f.link.conditionId = 'CF-CRP-REC-02-C01'; });
tamper('wrong position unit cannot reuse source order', (f) => { f.link.positionUnitId = 'CF-RPP-REC-01-A02-U1'; });
tamper('caller cannot relax shared context', (f) => { f.link.context.dayGan = '戊'; });
tamper('caller cannot change path coexistence to a winner policy', (f) => { f.pathSourceRecord.relationAssertions[0].coexistenceMode = 'source-requires-exclusive-selection'; });
tamper('caller cannot pre-resolve source condition', (f) => { f.pathSourceRecord.conditions[0].runtimeResolved = true; });
tamper('caller cannot change source tier', (f) => { f.pathSourceRecord.sourceTier = 'modern-independent-corroboration'; });
tamper('caller cannot reorder normalized source participants', (f) => { f.normalizedPosition.units[0].semanticAssertion.orderedRefIds.reverse(); });
tamper('caller cannot drop normalized source provenance', (f) => { delete f.normalizedPosition.provenance.sourceExtract; });
tamper('caller cannot override proximity with a distance or outcome', (f) => { f.runtimeConditionResolved = true; f.distance = 1; }, 3);
test('unsupported capacity/intervening/counterfactual inputs remain outside finite coverage', () => {
    const p = api.buildProfile();
    assert(p.finiteLinkCoverageComplete && p.linkValidations.length === 4 && p.unsupportedSourceConditionIds[0] === 'CF-CRP-REC-04-C01', 'finite vs global coverage conflated');
    assert(p.unlinkedPositionUnitIds.length === 4 && !p.competingPathResolverDefined && !p.corpusCoverageComplete, 'unsupported source dimensions promoted');
    assert(api.evaluateCondition({}).status === STATES.UNRESOLVED, 'unknown path condition accepted');
});
test('results and linked compound provenance are deeply immutable', () => {
    const r = evaluate(2, FOOD_FIRST);
    assert(Object.isFrozen(r.linkedPaths[1].intermediateRoleClasses) && Object.isFrozen(r.positionParticipantBindings[0]) && Object.isFrozen(r.sourcePathPolicy.orderedPathIds), 'mutable result provenance');
});
test('full synthesis evaluates source conditions while retaining four global blockers', () => {
    const out = outputFor(WEALTH_FIRST), s = out.semanticModel.strengthSynthesis;
    const p = s.contextualForcePartySourcePositionPathConditionMatcher;
    assert(p.finiteLinkCoverageComplete && p.matchedConditionCount === 1 && p.notSatisfiedConditionCount === 1, 'runtime synthesis missing condition evaluation');
    const dependencies = Object.fromEntries(s.dependencies.map((d) => [d.id,d]));
    assert(dependencies['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-POSITION-PATH-CONDITION-MATCHER'].status === 'resolved', 'narrow matcher capability missing');
    for (const id of ['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE','SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']) assert(dependencies[id].status === 'unresolved', 'global dependency promoted');
    assert(s.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4, 'B02-B05 released');
    assert(s.sufficiency.status === 'insufficient' && out.semanticModel.assessmentLayer.state === 'contract-only', 'final output unlocked');
});
test('R9 mediation remains intact and gets no unrelated source condition match', () => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(!s.contextualForcePartySourcePositionPathConditionMatcher.matchedConditionCount, 'unrelated source context matched');
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'), 'R9 source calibration regressed');
});
test('a chart satisfying neither registered order clause gets no fallback path winner', () => {
    const s = outputFor('辛酉|癸卯|己巳|丙寅').semanticModel.strengthSynthesis;
    const p = s.contextualForcePartySourcePositionPathConditionMatcher;
    assert(p.matchedConditionCount === 0 && p.notSatisfiedConditionCount === 2, 'one registered clause forced to match');
    assert(p.results.every((r) => r.runtimeWinnerPathId === null && !r.executionAuthorized), 'fallback winner inferred');
});
console.log(`\nSource Position Path Condition Matcher tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
