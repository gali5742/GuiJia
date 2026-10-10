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
const api = g.baziContextualForcePartySourcePathParticipantBindingProfile;
const matcher = g.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
const { STATES } = api;
const copy = (value) => JSON.parse(JSON.stringify(value));
const input = (number) => matcher.inputForLink(`CF-SPPCM-LINK-0${number}`);
const evaluate = (number, chart) => matcher.evaluateCondition(input(number), chart);
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

const bind = (number, chart) => api.bindCondition(evaluate(number, chart), chart);
const batchFor = (chart) => [1,2,3,4].map((n) => evaluate(n, chart));
test('six path descriptors retain four distinct registered condition identities', () => {
    assert(api.DESCRIPTORS.length === 6 && new Set(api.DESCRIPTORS.map((d) => d.linkId)).size === 4, 'finite registry incomplete');
    assert(api.DESCRIPTORS.find((d) => d.sourcePathId === 'CF-CRP-REC-02-P02').intermediateRefIds.join(',') === 'food', 'declared intermediate lost');
});
test('wealth-first matched condition creates two partially bound source path instances', () => {
    const r = bind(1, WEALTH_FIRST);
    assert(r.status === STATES.PARTIAL && r.pathInstances.length === 2, 'matched paths missing');
    assert(r.pathInstances.map((p) => p.sourceEndpoint.actorKey).join(',') === 'visible:0:癸,visible:3:辛', 'source identity mismatch');
    assert(r.pathInstances.every((p) => p.sourceEndpoint.endpointType === 'actor' && p.sourceEndpoint.cardinality === 1), 'actor cardinality changed');
});
test('food-first paths bind food source and wealth source with declared food intermediate', () => {
    const r = bind(2, FOOD_FIRST), [direct, compound] = r.pathInstances;
    assert(direct.sourceEndpoint.actorKey === 'visible:1:辛' && compound.sourceEndpoint.actorKey === 'visible:3:癸', 'path source refs exchanged');
    assert(compound.intermediateParticipants.length === 1 && compound.intermediateParticipants[0].actorKey === 'visible:1:辛', 'intermediate identity missing');
});
test('compound path remains one chart-scoped identity without edge decomposition', () => {
    const p = bind(2, FOOD_FIRST).pathInstances[1];
    assert(p.sourcePathId === 'CF-CRP-REC-02-P02' && p.sourcePath.pathKind === 'compound-source-relation', 'compound flattened');
    assert(p.sourcePath.predicateWording === '转食党' && p.sourcePath.intermediateRoleClasses.join(',') === '食神', 'source semantics lost');
    assert(!p.memberEdgeExpansion && !p.memberEdges.length && !p.relationEffects.length && !p.executable, 'compound edges executed');
});
test('path instance identity includes the entire chart and separate condition/source path identities', () => {
    const a = bind(1, WEALTH_FIRST).pathInstances[0], b = bind(1, '癸酉|乙卯|己未|辛酉').pathInstances[0];
    assert(a.sourcePathId === b.sourcePathId && a.instanceId !== b.instanceId, 'cross-chart collision');
    assert(a.instanceId === `${WEALTH_FIRST}::CF-SPPCM-LINK-01::CF-CRP-REC-01-P01`, 'unstable path identity');
});
test('source coexistence and order remain provenance, without runtime winner', () => {
    const paths = bind(1, WEALTH_FIRST).pathInstances;
    assert(paths.every((p) => p.provenance.sourcePathPolicy.coexistenceMode === 'source-permits-coexistence'), 'coexistence lost');
    assert(paths[0].provenance.sourcePathPolicy.orderedPathIds.join(',') === paths.map((p) => p.sourcePathId).join(','), 'declared path order lost');
    assert(paths.every((p) => p.runtimeWinnerPathId === null), 'ordered source policy became winner');
});
test('both source namespaces retain contract, tier, locator and exact excerpt provenance', () => {
    const p = bind(2, FOOD_FIRST).pathInstances[1].provenance, original = input(2);
    assert(p.pathSource.sourceId === original.pathSourceRecord.sourceId && p.pathSource.sourceTier === original.pathSourceRecord.sourceTier
        && p.pathSource.locator === original.pathSourceRecord.locator && p.pathSource.sourceExtract === original.pathSourceRecord.sourceExtract, 'path source provenance lost');
    assert(p.positionSource.sourceContractId === original.normalizedPosition.sourceContractId
        && p.positionSource.sourceExtract === original.normalizedPosition.provenance.sourceExtract, 'position source namespace lost');
});
test('visible killer in wealth-first chart never supplies target authority by role uniqueness', () => {
    const paths = bind(1, WEALTH_FIRST).pathInstances;
    assert(paths.every((p) => p.targetEndpoint.roleClass === '七杀' && p.targetEndpoint.actorKey === null
        && p.targetEndpoint.scope === null && p.targetEndpoint.endpointType === null), 'visible 乙 guessed as target');
});
test('Mao hidden Yi never supplies target authority from month context alone', () => {
    const paths = bind(2, FOOD_FIRST).pathInstances;
    assert(paths.length === 2 && paths.every((p) => p.targetEndpoint.bindingState === 'unresolved-source-target-identity'
        && p.targetEndpoint.actorKey === null && p.targetEndpoint.cardinality === null), 'hidden 卯乙 target inferred');
});
test('partial binding never resolves realization or authorizes R4/R5 effects', () => {
    const r = bind(2, FOOD_FIRST);
    assert(!r.participantBindingComplete && !r.relationRealizationResolved && !r.executionAuthorized && !r.relationEffects.length, 'partial binding promoted');
    assert(r.pathInstances.every((p) => p.realizationState === 'unresolved' && !p.executionAuthorized && p.numericScore === null && p.relativeDominance === null), 'path outcome inferred');
});
test('false source condition produces no paths and no negative realization', () => {
    const r = bind(1, FOOD_FIRST);
    assert(r.validation.valid && r.status === STATES.NOT_SATISFIED && !r.pathInstances.length, 'false condition bound');
    assert(!r.relationRealizationResolved && !r.relationEffects.length && r.runtimeWinnerPathId === null, 'false condition reversed');
});
test('absolute hour requirement remains a binding gate', () => {
    assert(bind(2, '辛酉|癸卯|己巳|丙寅').status === STATES.NOT_SATISFIED, 'hour requirement relaxed');
});
test('out-of-context conditions remain distinct from false and unresolved', () => {
    const r = bind(1, '癸卯|乙卯|戊辰|辛未');
    assert(r.status === STATES.NOT_APPLICABLE && !r.pathInstances.length, 'context ignored');
});
test('ambiguous source-mentioned stem cannot choose a source or group', () => {
    const r = bind(1, '癸卯|辛卯|己巳|辛未');
    assert(r.status === STATES.UNRESOLVED && !r.pathInstances.length, 'duplicate selected');
});
test('hidden-only source participant cannot be promoted into a visible endpoint', () => {
    assert(!bind(1, '癸酉|乙卯|己巳|丙寅').pathInstances.length, 'hidden Xin promoted');
});
test('raw proximity does not instantiate either exclusive path', () => {
    for (const n of [3,4]) {
        const r = bind(n, '庚午|丙寅|甲辰|辛未');
        assert(r.status === STATES.UNRESOLVED && !r.pathInstances.length && r.runtimeWinnerPathId === null, 'nearest actor selected');
    }
});
test('missing chart remains unresolved and does not mutate caller chart object', () => {
    assert(api.bindCondition(evaluate(1, null)).status === STATES.UNRESOLVED, 'missing chart bound');
    const chart = { key:WEALTH_FIRST };
    const r = api.bindCondition(evaluate(1, WEALTH_FIRST), chart);
    assert(r.status === STATES.INVALID && !Object.isFrozen(chart), 'caller chart trusted or frozen');
});
test('condition result from another chart cannot bind against current chart', () => {
    const r = api.bindCondition(evaluate(1, WEALTH_FIRST), '癸酉|乙卯|己未|辛酉');
    assert(r.status === STATES.INVALID && !r.pathInstances.length && r.linkId === null, 'chart provenance reused');
});
test('invalid condition shapes and prototype link names fail closed', () => {
    for (const value of [null, [], 42, {}, { linkId:'__proto__' }]) {
        assert(api.bindCondition(value, WEALTH_FIRST).status === STATES.INVALID, 'invalid result accepted');
    }
});
const tamper = (name, edit, n = 1, chart = WEALTH_FIRST) => test(name, () => {
    const supplied = copy(evaluate(n, chart)); edit(supplied);
    const r = api.bindCondition(supplied, chart);
    assert(r.status === STATES.INVALID && !r.validation.valid && !r.pathInstances.length && r.linkId === null, 'forged result accepted');
    assert(!Object.isFrozen(supplied), 'invalid input frozen');
});
tamper('caller cannot forge a matched result from false condition', (r) => { r.status = matcher.STATES.MATCHED; r.conditionSatisfied = true; }, 1, FOOD_FIRST);
tamper('caller cannot change source actor identity', (r) => { r.positionParticipantBindings[0].actorKey = 'visible:1:癸'; });
tamper('caller cannot change source actor scope', (r) => { r.positionParticipantBindings[0].scope = 'hidden-stem'; });
tamper('caller cannot change source role', (r) => { r.positionParticipantBindings[0].roleClass = '七杀'; });
tamper('caller cannot change linked path identity', (r) => { r.linkedPaths[0].id = 'CF-CRP-REC-02-P01'; });
tamper('caller cannot add target binding authority', (r) => { r.targetEndpoint = { actorKey:'visible:1:乙' }; });
tamper('caller cannot drop compound intermediate role', (r) => { r.linkedPaths[1].intermediateRoleClasses = []; }, 2, FOOD_FIRST);
tamper('caller cannot expand compound path into executable edges', (r) => { r.linkedPaths[1].memberEdgeExpansion = true; }, 2, FOOD_FIRST);
tamper('caller cannot change inherited source context', (r) => { r.sourceContext.sourceRecordId = 'CF-CRP-REC-02'; }, 2, FOOD_FIRST);
tamper('caller cannot promote source path order to a runtime winner', (r) => { r.runtimeWinnerPathId = r.pathIds[0]; });
tamper('caller cannot discard normalized source wording evidence', (r) => { delete r.validation.unit.sourceWording; });
tamper('caller cannot reuse a different condition ID', (r) => { r.conditionId = 'CF-CRP-REC-02-C01'; });
test('complete exact batch binds matched paths only', () => {
    const batch = api.bindBatch(batchFor(WEALTH_FIRST), WEALTH_FIRST);
    assert(batch.validation.valid && batch.results.length === 4 && batch.pathInstances.length === 2, 'batch binding missing');
    assert(batch.results.filter((r) => r.status === STATES.PARTIAL).length === 1, 'unmatched condition instantiated');
});
test('missing, duplicate and extra batch results reject all paths', () => {
    const original = batchFor(WEALTH_FIRST);
    for (const fixture of [null, original.slice(1), [...original, original[0]], [original[0],original[0],original[2],original[3]]]) {
        const r = api.bindBatch(fixture, WEALTH_FIRST);
        assert(!r.validation.valid && !r.pathInstances.length && !r.results.length, 'batch repaired or partially bound');
    }
});
test('non-string batch identity fails closed without coercing caller objects or symbols', () => {
    for (const id of [Symbol('link'), { toString() { throw new Error('must not coerce'); } }]) {
        const fixture = batchFor(WEALTH_FIRST); fixture[0] = { linkId:id };
        assert(!api.bindBatch(fixture, WEALTH_FIRST).validation.valid, 'malformed identity accepted');
        assert(api.bindCondition(fixture[0], WEALTH_FIRST).status === STATES.INVALID, 'malformed identity coerced');
    }
});
test('tampered unmatched result invalidates whole batch without salvaging positive path', () => {
    const supplied = copy(batchFor(WEALTH_FIRST)); supplied[3].executionAuthorized = true;
    assert(!api.bindBatch(supplied, WEALTH_FIRST).validation.valid, 'unmatched forged provenance ignored');
});
test('batch input order does not assign path precedence', () => {
    const r = api.bindBatch(batchFor(FOOD_FIRST).reverse(), FOOD_FIRST);
    assert(r.validation.valid && r.pathInstances.map((p) => p.sourcePathId).join(',') === 'CF-CRP-REC-02-P01,CF-CRP-REC-02-P02', 'array order became policy');
});
test('no source clause satisfied gives no fallback path', () => {
    const chart = '辛酉|癸卯|己巳|丙寅', r = api.bindBatch(batchFor(chart), chart);
    assert(r.validation.valid && !r.pathInstances.length && r.results.filter((p) => p.status === STATES.NOT_SATISFIED).length === 2, 'fallback path inferred');
});
test('canonical input is unchanged and output provenance is deeply frozen', () => {
    const supplied = copy(evaluate(2, FOOD_FIRST)), before = JSON.stringify(supplied);
    const r = api.bindCondition(supplied, FOOD_FIRST), p = r.pathInstances[1];
    assert(JSON.stringify(supplied) === before && !Object.isFrozen(supplied.positionParticipantBindings), 'caller data mutated');
    assert(Object.isFrozen(p.intermediateParticipants[0]) && Object.isFrozen(p.sourcePath.intermediateRoleClasses)
        && Object.isFrozen(p.provenance.sourceContext) && Object.isFrozen(p.targetEndpoint), 'mutable output');
});
test('missing upstream extension is inert rather than creating a path capability', () => {
    const base = {};
    assert(g.baziContextualForcePartySourcePathParticipantBinding.extendSynthesis({}, base) === base, 'missing upstream synthesized');
    assert(!api.buildProfile().validation.valid && !api.buildProfile().finiteBindingCoverageComplete, 'missing batch accepted');
});
test('full research synthesis binds sources while keeping all targets and four global blockers unresolved', () => {
    const out = outputFor(WEALTH_FIRST), s = out.semanticModel.strengthSynthesis;
    const p = s.contextualForcePartySourcePathParticipantBinding;
    assert(p.finiteBindingCoverageComplete && p.partialPathInstanceCount === 2 && p.completeEndpointPathCount === 0, 'runtime profile missing');
    const deps = Object.fromEntries(s.dependencies.map((d) => [d.id,d]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING'].status === 'resolved', 'narrow capability unresolved');
    for (const id of ['SD-CONTEXTUAL-FORCE-PARTY-RELATION-POSITION-PROVENANCE','SD-CONTEXTUAL-FORCE-PARTY-COMPETING-RELATION-PATH-RESOLUTION']) assert(deps[id].status === 'unresolved', 'global dependency released');
    assert(s.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4, 'B02-B05 released');
    assert(s.sufficiency.status === 'insufficient' && out.semanticModel.assessmentLayer.state === 'contract-only', 'final assessment unlocked');
});
test('full compound chart reports only one declared intermediate binding', () => {
    const p = outputFor(FOOD_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathParticipantBinding;
    assert(p.partialPathInstanceCount === 2 && p.boundIntermediateParticipantCount === 1 && !p.relationEffects.length, 'compound runtime binding wrong');
});
test('synthesis rejects forged upstream batch and keeps its narrow capability unresolved', () => {
    const model = outputFor(WEALTH_FIRST).semanticModel;
    const base = copy(model.strengthSynthesis);
    base.contextualForcePartySourcePositionPathConditionMatcher.results[0].conditionSatisfied = false;
    const s = g.baziContextualForcePartySourcePathParticipantBinding.extendSynthesis(model, base);
    assert(!s.contextualForcePartySourcePathParticipantBinding.validation.valid
        && !s.contextualForcePartySourcePathParticipantBinding.pathInstances.length, 'forged runtime batch bound');
    assert(s.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-PARTICIPANT-BINDING').status === 'unresolved', 'forged capability resolved');
    assert(s.sufficiency.status === 'insufficient', 'forged batch unlocked synthesis');
});
test('actual R9 mediation survives without unrelated R12 path instances', () => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathParticipantBinding.finiteBindingCoverageComplete
        && !s.contextualForcePartySourcePathParticipantBinding.pathInstances.length, 'R12 matched unrelated source');
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'), 'R9 mediation regressed');
});
console.log(`\nSource Path Participant Binding tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
