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
const api = g.baziContextualForcePartySourcePathTargetAnnotationProfile;
const matcher = g.baziContextualForcePartySourcePositionPathConditionMatcherProfile;
const { STATES } = api;
const copy = (value) => JSON.parse(JSON.stringify(value));
const input = (record, suffix = 1) => api.inputForPath(`CF-CRP-REC-0${record}-P0${suffix}`);
const resolve = (record, suffix = 1) => api.resolvePath(input(record, suffix));
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

const source = g.baziContextualForcePartySourcePathTargetAnnotationContract;
test('six exact target annotations validate within three source records', () => {
    assert(source.ANNOTATIONS.length === 6 && new Set(source.ANNOTATIONS.map((a) => a.pathSourceRecordId)).size === 3, 'finite coverage wrong');
    for (const a of source.ANNOTATIONS) assert(api.validateAnnotationInput(api.inputForPath(a.sourcePathId)).valid, `invalid ${a.id}`);
});
test('actual normalization adapter and generic resolver resolve all six source role targets', () => {
    for (const a of source.ANNOTATIONS) {
        const r = api.resolvePath(api.inputForPath(a.sourcePathId));
        assert(r.status === STATES.ROLE_ONLY && r.normalizedInput.normalizationState === 'normalized-source-scoped-input', 'source role normalization failed');
        const unit = r.targetResolution.unitResolutions[0];
        assert(unit.decisionRuleId === 'GTLR-R03-THEORY-ROLE-CLASS' && unit.semanticLevel === 'role-class', 'generic kernel bypassed');
    }
});
test('wealth-to-killer 用 preserves explicit anaphoric link to 七煞', () => {
    const r = resolve(1), target = r.normalizedInput.relationUnits[0].targetMention;
    assert(target.span === '用' && target.antecedentSpan === '七煞' && target.mentionMode === 'anaphoric', '用 antecedent guessed or discarded');
    assert(r.targetResolution.unitResolutions[0].targetReference.roleClasses.join(',') === '七杀', 'target role lost');
});
test('killer and officer proximity source targets retain separate role identities', () => {
    const killer = resolve(3), officer = resolve(3,2);
    assert(killer.normalizedInput.relationUnits[0].targetMention.span === '杀' && officer.normalizedInput.relationUnits[0].targetMention.span === '官', 'mention identities collapsed');
    assert(killer.targetResolution.unitResolutions[0].targetReference.roleClasses[0] === '七杀'
        && officer.targetResolution.unitResolutions[0].targetReference.roleClasses[0] === '正官', 'role identities collapsed');
});
test('proximity source-role antecedent 阳日食神 is preserved independently of target mention', () => {
    const n = resolve(3).normalizedInput;
    assert(n.sourceProvenance.sourceRoleAntecedent === '阳日食神' && n.sourceProvenance.targetRoleEvidenceSpan === '七杀', 'source/target provenance mixed');
});
test('partial 己生卯月 example remains conditional theory rule without a chart-case key', () => {
    for (const r of [resolve(1), resolve(2)]) {
        const n = r.normalizedInput;
        assert(n.sourceContextType === 'theory-general' && n.sourcePredicateType === 'generalized-relation-rule' && n.chartKey === null, 'partial example promoted to chart case');
        assert(n.sourceProvenance.context.sourceRecordId === 'CF-CRP-REC-01' && n.sourceProvenance.context.monthZhi === '卯', 'shared conditional context lost');
    }
});
test('source-role normalization requires no actor identity while runtime identity remains required', () => {
    const r = resolve(1), unit = r.normalizedInput.relationUnits[0];
    assert(!unit.bindingRequired && unit.identityProvenance.state === 'identity-not-required' && unit.identityProvenance.actorKey === null, 'role unit gained chart identity');
    assert(!r.instanceIdentityAuthorized && !r.actionableTargetResolved && r.blockerReasons.includes('independent-source-target-identity-scope-and-cardinality-required'), 'role semantics unlocked runtime target');
});
test('normalized input carries provenance without target-level hints or legacy decisions', () => {
    const n = resolve(2,2).normalizedInput, forbidden = g.baziContextualForcePartyRelationTargetNormalizedInputContract.FORBIDDEN_DECISION_FIELDS;
    for (const object of [n,n.relationUnits[0],n.relationUnits[0].targetMention]) {
        assert(forbidden.every((key) => !Object.prototype.hasOwnProperty.call(object,key)), 'decision field injected into normalization');
    }
});
test('compound predicate and intermediate role stay provenance of one target unit', () => {
    const n = resolve(2,2).normalizedInput;
    assert(n.relationUnits.length === 1 && n.relationUnits[0].predicateSpan === '转食党'
        && n.sourceProvenance.intermediateRoleClasses.join(',') === '食神', 'compound flattened');
    assert(n.relationUnits[0].relationSemanticHint === null && n.relationEffect === null, 'predicate became effect authorization');
});
test('classical and modern corroboration source tiers, locators and excerpts stay distinct', () => {
    const a = resolve(1).normalizedInput.sourceProvenance, b = resolve(3).normalizedInput.sourceProvenance;
    assert(a.sourceTier === 'classical-semantic-authority' && b.sourceTier === 'modern-independent-corroboration', 'modern source promoted');
    assert(a.locator === input(1).pathSourceRecord.locator && a.sourceExtract === input(1).pathSourceRecord.sourceExtract, 'exact source lost');
});
test('no target annotation licenses actor/group identity, effect, winner or score', () => {
    for (const a of source.ANNOTATIONS) {
        const r = api.resolvePath(api.inputForPath(a.sourcePathId));
        assert(!r.instanceIdentityAuthorized && !r.targetActorKeys.length && r.targetScope === null && r.targetCardinality === null, 'endpoint guessed');
        assert(!r.executionAuthorized && !r.relationEffects.length && !r.memberEdges.length && r.runtimeWinnerPathId === null
            && r.numericScore === null && r.relativeDominance === null, 'role resolution became effect/selection');
    }
});
const tamper = (name, edit, record = 1, suffix = 1) => test(name, () => {
    const supplied = copy(input(record,suffix)); edit(supplied);
    const r = api.resolvePath(supplied);
    assert(r.status === STATES.INVALID && !r.validation.valid && r.sourcePathId === null && r.targetResolution === null, 'forged annotation accepted');
    assert(!Object.isFrozen(supplied), 'caller input frozen');
});
tamper('wrong target antecedent cannot borrow the same source path', (r) => { r.annotation.relationUnits[0].target.antecedentSpan = '正官'; });
tamper('dropping target antecedent cannot retain 用 role authorization', (r) => { r.annotation.relationUnits[0].target.antecedentSpan = null; });
tamper('caller cannot promote role annotation into a chart event', (r) => { r.annotation.sourceContextType = 'chart-case'; r.annotation.chartKey = WEALTH_FIRST; });
tamper('caller cannot grant hidden target scope from 卯月', (r) => { r.annotation.targetScope = 'hidden-branch'; });
tamper('caller cannot supply unique visible target identity', (r) => { r.annotation.targetActorKeys = ['visible:1:乙']; r.annotation.instanceIdentityAuthorized = true; });
tamper('caller cannot supply hidden target identity', (r) => { r.annotation.targetActorKeys = ['hidden:1:卯:乙:0']; });
tamper('caller cannot turn role annotation into a collective target', (r) => { r.annotation.targetCardinality = 2; r.annotation.targetActorKeys = ['visible:1:乙','hidden:1:卯:乙:0']; });
tamper('caller cannot add executable effect or target-level hint', (r) => { r.annotation.expectedTargetLevel = 'single-actor'; r.annotation.effectType = 'anchor-augmentation'; });
tamper('caller cannot replace path source wording while retaining annotation identity', (r) => { r.pathSourceRecord.sourceExtract = '财以助正官'; });
tamper('caller cannot promote modern corroboration source tier', (r) => { r.pathSourceRecord.sourceTier = 'classical-semantic-authority'; },3);
tamper('caller cannot replace source record or path identity', (r) => { r.annotation.sourcePathId = 'CF-CRP-REC-04-P01'; });
tamper('caller cannot change compound intermediate role', (r) => { r.annotation.relationUnits[0].intermediateRoleClasses = []; },2,2);
tamper('caller cannot reuse unrelated CASE06 hidden binding authority', (r) => { r.hiddenBinding = { sourceCaseId:'CF-RTLC-CASE-06', scope:'hidden-branch' }; });
test('missing/unknown/invalid annotation inputs fail closed', () => {
    for (const supplied of [null, [], 42, {}, api.inputForPath('CF-CRP-REC-04-P01')]) {
        const r = api.resolvePath(supplied);
        assert(r.status === STATES.INVALID && !r.targetResolution && !r.targetActorKeys.length, 'unknown source accepted');
    }
    assert(api.normalizePath(null).normalizationState === 'unresolved-normalized-input', 'missing source became no target');
});
test('source annotation input is unchanged and normalized provenance is deeply immutable', () => {
    const supplied = copy(input(2,2)), before = JSON.stringify(supplied), r = api.resolvePath(supplied);
    assert(JSON.stringify(supplied) === before && !Object.isFrozen(supplied.annotation.relationUnits), 'caller input mutated');
    assert(Object.isFrozen(r.normalizedInput.sourceProvenance.context) && Object.isFrozen(r.normalizedInput.sourceProvenance.intermediateRoleClasses)
        && Object.isFrozen(r.targetResolution.unitResolutions[0].targetReference.roleClasses), 'mutable result');
});
test('full research synthesis joins source role review to two R12 partial paths', () => {
    const out = outputFor(WEALTH_FIRST), s = out.semanticModel.strengthSynthesis, p = s.contextualForcePartySourcePathTargetAnnotation;
    assert(p.finiteSourceTargetAnnotationCoverageComplete && p.resolvedRoleTargetCount === 6 && p.runtimeValidation.valid && p.runtimePartialPathCount === 2, 'runtime join missing');
    assert(p.runtimePaths.every((r) => r.targetSemanticReview.sourcePathId === r.sourcePathId && r.targetSemanticReview.status === STATES.ROLE_ONLY
        && r.targetEndpoint.actorKey === null && r.targetIdentityReview.status === STATES.RUNTIME_UNRESOLVED), 'runtime role resolved as actor');
    assert(p.instanceIdentityAuthorityCount === 0 && p.runtimeCompleteTargetCount === 0, 'target authority invented');
});
test('full compound path keeps intermediate actor, source path ID and unresolved target', () => {
    const p = outputFor(FOOD_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths[1];
    assert(p.sourcePathId === 'CF-CRP-REC-02-P02' && p.intermediateParticipants[0].actorKey === 'visible:1:辛'
        && p.targetEndpoint.actorKey === null && !p.memberEdges.length, 'compound path rewritten');
});
test('static role review never creates unmatched/proximity path instances', () => {
    const s = outputFor('庚午|丙寅|甲辰|辛未').semanticModel.strengthSynthesis, p = s.contextualForcePartySourcePathTargetAnnotation;
    assert(p.resolvedRoleTargetCount === 6 && p.runtimePartialPathCount === 0 && p.runtimeValidation.valid, 'static role review enacted condition');
    assert(!p.actionableTargetResolved && p.runtimeWinnerPathId === null, 'exclusive proximity target chosen');
});
test('invalid R12 target endpoint/profile edits reject runtime join', () => {
    const model = outputFor(WEALTH_FIRST).semanticModel;
    for (const edit of [
        (s) => { s.contextualForcePartySourcePathParticipantBinding.pathInstances[0].targetEndpoint.actorKey = 'visible:1:乙'; },
        (s) => { s.contextualForcePartySourcePathParticipantBinding.pathInstances[0].sourcePathId = 'CF-CRP-REC-02-P01'; },
        (s) => { s.contextualForcePartySourcePathParticipantBinding.chartKey = FOOD_FIRST; },
        (s) => { s.contextualForcePartySourcePathParticipantBinding.finiteBindingCoverageComplete = false; }
    ]) {
        const supplied = copy(model.strengthSynthesis); edit(supplied);
        const p = api.buildProfile(model,supplied);
        assert(!p.runtimeValidation.valid && !p.runtimePaths.length && p.runtimeCompleteTargetCount === 0, 'forged runtime join accepted');
    }
});
test('missing or tampered R11 batch cannot be repaired via source role annotations', () => {
    const model = outputFor(WEALTH_FIRST).semanticModel, supplied = copy(model.strengthSynthesis);
    supplied.contextualForcePartySourcePositionPathConditionMatcher.results[0].status = matcher.STATES.NOT_SATISFIED;
    const p = api.buildProfile(model,supplied);
    assert(!p.runtimeValidation.valid && !p.runtimePaths.length && p.resolvedRoleTargetCount === 6, 'static role review repaired forged upstream');
    const empty = api.buildProfile();
    assert(empty.finiteSourceTargetAnnotationCoverageComplete && !empty.runtimeValidation.valid, 'source coverage conflated with runtime input');
});
test('role review remains chart independent while runtime instances require current chart provenance', () => {
    const first = outputFor(WEALTH_FIRST).semanticModel, second = outputFor(FOOD_FIRST).semanticModel;
    const supplied = copy(second.strengthSynthesis);
    supplied.contextualForcePartySourcePathParticipantBinding = copy(first.strengthSynthesis.contextualForcePartySourcePathParticipantBinding);
    const p = api.buildProfile(second,supplied);
    assert(p.finiteSourceTargetAnnotationCoverageComplete && !p.runtimeValidation.valid && !p.runtimePaths.length, 'cross-chart path reused');
});
test('synthesis narrow annotation capability keeps broader coverage and B02-B05 unresolved', () => {
    const out = outputFor(WEALTH_FIRST), s = out.semanticModel.strengthSynthesis, p = s.contextualForcePartySourcePathTargetAnnotation;
    const deps = Object.fromEntries(s.dependencies.map((d) => [d.id,d]));
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION'].status === 'resolved', 'narrow annotation capability missing');
    assert(deps['SD-CONTEXTUAL-FORCE-PARTY-CURATED-RELATION-SOURCE-SEMANTIC-ANNOTATION-COVERAGE'].status === 'unresolved', 'broader source coverage released');
    assert(s.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && !p.broaderSourceCoverageComplete && !p.targetIdentityResolverDefined, 'global resolver unlocked');
    assert(s.sufficiency.status === 'insufficient' && out.semanticModel.assessmentLayer.state === 'contract-only', 'final strength unlocked');
    const visiting = new Set(), visited = new Set();
    const walk = (id) => { assert(deps[id], `missing dependency ${id}`); assert(!visiting.has(id), `cycle ${id}`);
        if (visited.has(id)) return; visiting.add(id); (deps[id].dependsOnDependencyIds || []).forEach(walk); visiting.delete(id); visited.add(id); };
    walk('SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION');
});
test('invalid runtime profile makes narrow synthesis capability unresolved', () => {
    const model = outputFor(WEALTH_FIRST).semanticModel, base = copy(model.strengthSynthesis);
    base.contextualForcePartySourcePathParticipantBinding.pathInstances = [];
    const s = g.baziContextualForcePartySourcePathTargetAnnotation.extendSynthesis(model,base);
    assert(s.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-PATH-TARGET-ANNOTATION').status === 'unresolved'
        && !s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.length, 'invalid profile resolved capability');
});
test('missing upstream extension is inert and unsupported relative-capacity paths stay outside coverage', () => {
    const base = {}, p = api.buildProfile();
    assert(g.baziContextualForcePartySourcePathTargetAnnotation.extendSynthesis({},base) === base, 'upstream fabricated');
    assert(p.unsupportedSourcePathIds.join(',') === 'CF-CRP-REC-04-P01,CF-CRP-REC-04-P02', 'broader paths silently covered');
});
test('existing R9 realized mediation remains intact and creates no R13 runtime target', () => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathTargetAnnotation.resolvedRoleTargetCount === 6
        && !s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.length, 'unrelated chart target instantiated');
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'), 'R9 mediation regressed');
});
console.log(`\nSource Path Target Annotation tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
