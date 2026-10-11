#!/usr/bin/env node
'use strict';
const fs = require('fs'),path = require('path'),vm = require('vm');
const ROOT = path.resolve(__dirname,'..');
const { Solar } = require(path.join(ROOT,'vendor/lunar.js'));
const bootstrap = fs.readFileSync(path.join(ROOT,'js/bazi-research-bootstrap.js'),'utf8');
const entries = [...bootstrap.matchAll(/Object\.freeze\(\{\s*globalKey:'([^']+)',\s*src:'([^']+)'\s*\}\)/g)]
    .map((m) => ({ key:m[1],file:m[2].replace(/^\.\//,'').replace(/\?.*$/,'') }));
const assert = (c,m) => { if (!c) throw new Error(m); };
let passed = 0,failed = 0;
const test = (name,fn) => { try { fn();passed++;console.log(`✓ ${name}`); }
    catch (e) { failed++;console.error(`✗ ${name}\n  ${e.stack}`); } };
const context = { console,setTimeout,clearTimeout,Date,Math,JSON,Intl,Solar };
context.window = context;context.globalThis = context;vm.createContext(context);
const run = (file) => vm.runInContext(fs.readFileSync(path.join(ROOT,file),'utf8'),context,{ filename:file });
['js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-strength-effects.js'].forEach(run);
for (const entry of entries) { run(entry.file);assert(context.GuiJia[entry.key],`missing bootstrap dependency ${entry.key}`); }
['js/bazi-assessment.js','js/bazi-interpretation.js'].forEach(run);
const g = context.GuiJia,api = g.baziContextualForcePartySourceBladeRelationRealizationProfile;
const contract = g.baziContextualForcePartySourceBladeRelationRealizationContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '戊子|戊午|丙辰|戊戌',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
const WEALTH_FIRST = '癸卯|乙卯|己巳|辛未'; // Synthetic refusal fixture, not classical evidence.
function outputFor(chartKey) {
    const b = g.baziCore,chars = chartKey.split('|').map((p) => Array.from(p));
    const gans = chars.map((p) => p[0]),zhis = chars.map((p) => p[1]),dayGan = gans[2],dayElement = b.getWuXing(dayGan);
    const pillars = gans.map((gan,index) => ({ title:['年柱','月柱','日柱','时柱'][index],gan,zhi:zhis[index],ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : b.shiShenMap[dayGan][gan],
        cangGan:b.cangGanMap[zhis[index]].map(([hiddenGan,level]) => ({ gan:hiddenGan,level,wuxing:b.getWuXing(hiddenGan),shishen:b.shiShenMap[dayGan][hiddenGan] })) }));
    const internalRelations = b.calculateInternalChartRelations(gans,zhis),monthSeason = b.buildMonthSeason(zhis[1],dayElement);
    return g.baziInterpretation.buildBaziInterpretation({ dayGan,dayGanWuXing:dayElement,pillars,internalRelations,monthSeason,
        dayMasterEvidence:b.buildDayMasterEvidence(pillars,monthSeason,internalRelations,dayGan),matchedLiterature:[],
        lunarStr:'测试农历',solarStr:'测试时间',ruleSummary:'测试口径' });
}
const source = outputFor(CHART),synthesis = source.semanticModel.strengthSynthesis;
const actualContext = () => ({ chartKey:CHART,inventory:synthesis.contextualForcePartyMembershipInventory });
const evaluate = () => api.evaluateSource(input(),actualContext());

test('actual source review resolves two directed realizations without effects',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.relationIdentityResolved && r.relationRealizationResolved && r.paths.length === 2,'realizations missing');
    assert(!r.executionAuthorized && !r.effectAuthorizationResolved && !r.relationEffects.length && !r.memberEdges.length,'effect invented');
});
test('exact complete natal source and independent corroboration keep provenance',() => {
    const i = input();
    assert(api.validateSourceInput(i).valid && contract.SOURCE_CASE.chartKey === CHART,'case review missing');
    assert(contract.FUNCTION_CONTEXT.sourceText.includes('得丑辰为泄') && contract.FUNCTION_CONTEXT.retrievedOn === '2026-10-11'
        && contract.FUNCTION_CONTEXT.revisionId === null && !contract.FUNCTION_CONTEXT.effectTypeAuthority,'function context misrepresented');
    assert(i.relationReviews.every((r) => r.realizationAuthority.evidenceSpan === r.relationClauseSpan
        && r.realizationAuthority.sourceEvidenceIds.includes('CF-SBRR-CONTEXT-01') && !r.realizationAuthority.effectTypeAuthorized),'authority scope expanded');
});
test('clash preserves source-clause direction without a reciprocal edge',() => {
    const p = evaluate().paths[0];
    assert(p.execution.sourceEndpoint.actorKey === 'surface-branch:0:子' && p.execution.targetEndpoint.actorKey === 'surface-branch:1:午'
        && p.execution.relationIdentity.functionType === 'source-asserted-branch-clash' && p.execution.relationIdentity.directed,'clash direction wrong');
    assert(p.execution.relationIdentity.underlyingGenerationDirection === null && evaluate().paths.length === 2,'reciprocal edge invented');
});
test('drainage direction differs from its recorded underlying generation direction',() => {
    const p = evaluate().paths[1],r = p.execution.relationIdentity;
    assert(p.execution.sourceEndpoint.actorKey === 'surface-branch:2:辰' && p.execution.targetEndpoint.actorKey === 'surface-branch:1:午'
        && r.functionType === 'source-asserted-branch-drainage' && r.directionSemantics === 'clause-named-drainer-to-drained-blade','drainage flipped');
    assert(r.underlyingGenerationDirection.fromActorKey === 'surface-branch:1:午'
        && r.underlyingGenerationDirection.toActorKey === 'surface-branch:2:辰','underlying element direction lost');
    assert(g.baziCore.getWuXing('午') === '火' && g.baziCore.getWuXing('辰') === '土','actual branch elements inconsistent');
});
test('actual upstream normalizer and R3 resolutions are consumed unchanged by actual R4',() => {
    const r = evaluate(),u = g.baziContextualForcePartySourceBladeTargetCalibrationProfile.evaluateSource(input().upstreamInput,actualContext());
    assert(JSON.stringify(r.upstreamResult) === JSON.stringify(u),'upstream output invented');
    for (let i = 0;i < 2;i++) {
        assert(JSON.stringify(r.paths[i].executionInput.targetResolution) === JSON.stringify(u.targetResolution.unitResolutions[i]),'R3 unit not used');
        assert(JSON.stringify(r.paths[i].execution) === JSON.stringify(kernel.executeRelationEffect(r.paths[i].executionInput)),'R4 result invented');
    }
});
test('realized-unmapped explicitly differs from nonrealization and licensed positive effects',() => {
    for (const p of evaluate().paths) {
        assert(p.relationRealized && p.execution.realizationState === 'realized-in-source-context'
            && p.execution.executionState === 'realized-relation-currently-unmapped' && p.execution.decisionRuleId === 'GREE-R05-REALIZED-UNMAPPED','unknown erased');
        assert(!p.execution.realized && p.execution.effectType === null && !p.execution.authorizationIds.length
            && p.execution.currentRegistryNoMatchIsSemanticRejection === false,'kernel effect flag mistaken for source realization');
    }
});
test('joint blade outcome remains separate from adjacent daymaster context',() => {
    const o = evaluate().jointOutcomeReview;
    assert(o.jointOutcomeSpan === '弱可知矣' && o.contributingPathIds.join(',') === 'CF-SBTC-PATH-01,CF-SBTC-PATH-02','joint provenance lost');
    assert(o.jointOutcomeTargetRole === 'source-blade-context' && o.adjacentContextSpan === '天干三戊，窃日主之精华；'
        && o.adjacentContextMode === 'distinct-daymaster-drainage-context-not-modeled','subjects conflated');
    assert(!o.perPathEffectAuthorities.length && o.jointEffectAuthority === null && !o.mapsToFinalDaymasterStrength && !o.providesNumericForce,'joint outcome became license');
});
test('R19 identity authority remains distinct from R20 realization authority',() => {
    const u = evaluate().upstreamResult;
    assert(!u.relationRealizationResolved && !u.effectAuthorizationResolved && !u.bladeIdentity.relationRealizationAuthorized
        && !u.bladeIdentity.effectTypeAuthorized,'upstream authority mutated');
    assert(evaluate().paths.every((p) => p.executionInput.authorization.state === 'realized-edge-currently-unmapped'
        && !p.executionInput.authorization.sourceBacked && !p.executionInput.authorization.relationTypes.length),'effect license constructed');
});

const refusals = [
    ['changed clause',(i) => { i.relationReviews[0].relationClauseSpan = '子不冲之'; }],
    ['changed complete chart',(i) => { i.upstreamInput.sourceCase.chartKey = '戊子|戊午|丙辰|己戌'; }],
    ['rewritten source wording',(i) => { i.upstreamInput.sourceCase.sourceText = '冲刃必为 opposition'; }],
    ['hidden source alias',(i) => { i.relationReviews[0].sourceActorKey = 'hidden:0:子:癸:0'; }],
    ['hidden target alias',(i) => { i.relationReviews[1].targetActorKey = 'hidden:1:午:丁:0'; }],
    ['different blade position',(i) => { i.relationReviews[1].targetActorKey = 'surface-branch:2:午'; }],
    ['group target',(i) => { i.relationReviews[0].endpointCardinality = 2; }],
    ['reversed drainage',(i) => { i.relationReviews[1].sourceActorKey = 'surface-branch:1:午'; }],
    ['generic generation alias',(i) => { i.relationReviews[1].relationIdentity.functionType = 'generation'; }],
    ['reciprocal clash claim',(i) => { i.relationReviews[0].relationIdentity.directed = false; }],
    ['synthetic realization authority',(i) => { i.relationReviews[0].realizationAuthority.id = 'UNREGISTERED'; }],
    ['missing realization evidence',(i) => { i.relationReviews[1].realizationAuthority.sourceEvidenceIds = []; }],
    ['negative state substitution',(i) => { i.relationReviews[0].realizationAuthority.state = 'not-realized-in-source-context'; }],
    ['per-path opposition license',(i) => { i.outcomeReview.perPathEffectAuthorities = ['anchor-opposition']; }],
    ['joint effect license',(i) => { i.outcomeReview.jointEffectAuthority = 'SYNTHETIC'; }],
    ['final weak classification',(i) => { i.outcomeReview.mapsToFinalDaymasterStrength = true; }],
    ['numeric strength',(i) => { i.outcomeReview.providesNumericForce = true; }],
    ['function context effect authority',(i) => { i.functionContext.effectTypeAuthority = true; }],
    ['injected effect hint',(i) => { i.effectType = 'anchor-opposition'; }],
    ['truncated paths',(i) => { i.relationReviews.pop(); }],
    ['sparse paths',(i) => { delete i.relationReviews[1]; }],
    ['duplicate paths',(i) => { i.relationReviews[1] = copy(i.relationReviews[0]); }]
];
for (const [name,change] of refusals) test(`${name} fails closed before execution`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && !r.paths.length && !r.relationRealizationResolved && !r.executionAuthorized,'forged review accepted');
});
for (const value of [null,undefined,{},[]]) test(`invalid input ${String(value)} is inert`,() => {
    const r = api.evaluateSource(value,actualContext());assert(r.status === STATES.INVALID && !r.paths.length,'invalid input executed');
});
test('unknown and location-only cases receive no realization reviews',() => {
    assert(api.inputForCase('unknown') === null && api.inputForCase('CF-SBTC-CASE-02') === null && api.inputForCase('CF-SBTC-CASE-03') === null,'case review transferred');
    for (const chartKey of ['戊申|癸亥|丙午|壬辰','戊午|癸亥|丙戌|壬辰',NEIGHBOR]) {
        const r = api.evaluateSource(input(),{ chartKey,inventory:actualContext().inventory });
        assert(r.status === STATES.NOT_APPLICABLE && !r.paths.length && !r.relationRealizationResolved,'foreign chart realized');
    }
});
test('missing chart or actual inventory cannot be replaced by reviewed text',() => {
    for (const c of [{},{ chartKey:CHART },{ inventory:actualContext().inventory }]) {
        const r = api.evaluateSource(input(),c);assert(r.status === STATES.UNRESOLVED && !r.paths.length,'missing context bypassed');
    }
});
for (const actorKey of ['surface-branch:0:子','surface-branch:1:午','surface-branch:2:辰']) {
    test(`missing actual ${actorKey} refuses both runtime paths`,() => {
        const c = copy(actualContext());c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'source review reconstructed missing actor');
    });
}
test('duplicate actor and conflicting inventory evidence fail closed',() => {
    const c = copy(actualContext()),p = c.inventory.actorProfiles.find((v) => v.actorKey === 'surface-branch:1:午');
    c.inventory.actorProfiles.push(copy(p));assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'duplicate accepted');
    const d = copy(actualContext()),e = d.inventory.evidenceRecords.find((v) => v.actorKey === 'surface-branch:2:辰');
    e.wuxing = '火';assert(api.evaluateSource(input(),d).status === STATES.UNRESOLVED,'conflicting element accepted');
});
test('precomputed resolver injection cannot bypass actual upstream validation',() => {
    const c = { chartKey:CHART,targetResolution:evaluate().upstreamResult.targetResolution,paths:evaluate().paths };
    assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'injected result consumed');
});
test('canonical key reordering is accepted without caller mutation or freezing',() => {
    const i = copy(input()),reordered = Object.fromEntries(Object.entries(i).reverse()),c = copy(actualContext());
    const before = JSON.stringify([i,c]),r = api.evaluateSource(reordered,c);
    assert(r.status === STATES.RESOLVED && JSON.stringify([i,c]) === before && !Object.isFrozen(i) && !Object.isFrozen(c),'input mutated');
    assert(Object.isFrozen(r.paths[1].executionInput.relationIdentity.underlyingGenerationDirection),'result not deeply frozen');
});
test('runtime profile reports two unmapped paths and no positive or joint effects',() => {
    const p = synthesis.contextualForcePartySourceBladeRelationRealization;
    assert(p.finiteSourceReviewComplete && p.sourceCaseCount === 1 && p.reviewedRelationCount === 2
        && p.resolvedRuntimeRelationCount === 2 && p.realizedUnmappedRuntimePathCount === 2,'runtime counts incorrect');
    assert(p.positiveEffectCount === 0 && p.newEffectAuthorityCount === 0 && p.jointEffectAuthorityCount === 0 && !p.broadSourceCoverageComplete,'coverage inflated');
});
test('R16 nonrealization R17 ambiguity and R18 materialization gates remain unchanged',() => {
    const s = outputFor('癸巳|戊午|丙午|壬辰').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBladeRelationRealization.result.status === STATES.NOT_APPLICABLE,'cross-case realization transferred');
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 regressed');
    const r = s.contextualForcePartyTransformedSourceBladeIdentityAudit.result;
    assert(r.bladeCandidates.length === 2 && r.targetIdentity.cardinality === null && r.execution.executionState === 'unresolved-generic-relation-effect','R17 selected blade');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 gate released');
});
test('R15 augmentation R9 mediation and CASE06 retain authorized behavior',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    assert(outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
});
test('original motif and direct realization registries and R11 B02-B05 remain closed',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'generic registry expanded');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 ambiguity resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4,'global blockers released');
});
test('narrow source dependency is resolved while final assessment remains insufficient',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID),claim = synthesis.claims.find((c) => c.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.scope === contract.CONTRACT.reviewScope && d.sourceRegistryEvidenceIds.includes('CF-SBRR-REALIZATION-02'),'dependency provenance wrong');
    assert(claim.value.positiveEffectCount === 0 && synthesis.sufficiency.status === 'insufficient'
        && source.semanticModel.assessmentLayer.state === 'contract-only','research readiness overclaimed');
});
test('no chart remains unresolved and integration is inert or idempotent as appropriate',() => {
    const ext = g.baziContextualForcePartySourceBladeRelationRealization,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().result.status === STATES.UNRESOLVED,'absent upstream not inert');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate extension');
});
console.log(`\nSource Blade Relation Realization tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
