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
const g = context.GuiJia,api = g.baziContextualForcePartySourceOfficerKillerNonrealizationProfile;
const contract = g.baziContextualForcePartySourceOfficerKillerNonrealizationContract;
const positive = g.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '癸巳|戊午|丙午|壬辰',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const evaluate = () => api.evaluateNonrealization(input(),actualContext());

test('independent full negative source case freezes natal excerpt chart locator and retrieval metadata',() => {
    const s = contract.SOURCE_CASE;
    assert(api.validateSourceInput(input()).valid && s.chartKey === CHART && s.retrievedOn === '2026-10-11'
        && s.revisionId === null && s.locator.includes('任氏自造'),'negative source provenance invalid');
    assert(s.sourceText.includes('此则戊癸合而必化，不但不能助杀') && !s.sourceText.includes('兼之运走'),'negative natal context lost');
});
test('year Gui source is reviewed from Si context and visible combination despite hidden Chen Gui',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.binding.sourceEndpoint.actorKey === 'visible:0:癸','source not original officer');
    assert(synthesis.contextualForcePartyMembershipInventory.actorProfiles.some((p) => p.actorKey.startsWith('hidden:3:辰:癸:')),'hidden homonym fixture absent');
    assert(r.binding.sourceScopeBasis.includes('not-hidden-chen-gui'),'hidden source ambiguity concealed');
});
test('named Ren and complete chart support reviewed single visible hour killer endpoint',() => {
    const b = evaluate().binding;
    assert(b.targetEndpoint.actorKey === 'visible:3:壬' && b.targetEndpoint.scope === 'visible-stem' && b.targetEndpoint.cardinality === 1,'wrong target');
    assert(b.targetNamingSpan === '壬水虽通根身库' && b.reviewedEndpointInference,'named endpoint review lost');
});
test('existing target normalized input validator and actual R3 single actor kernel consume identity',() => {
    const r = evaluate();
    assert(r.normalizedInput.validation.valid && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(r.normalizedInput).valid,'target normalizer bypassed');
    assert(r.targetResolution.unitResolutions[0].decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR'
        && r.targetResolution.unitResolutions[0].targetReference.actorKey === 'visible:3:壬','R3 target mismatch');
    assert(r.normalizedInput.relationUnits[0].targetMention.antecedentSpan === null,'following Ren span falsely called antecedent');
});
test('actual R4 executes explicit not-realized with no effect type authority',() => {
    const r = evaluate();
    assert(r.relationRealizationResolved && r.realizationState === 'not-realized-in-source-context'
        && r.execution.decisionRuleId === 'GREE-R04-NOT-REALIZED' && r.execution.executionState === 'not-realized-generic-relation-effect','negative execution missing');
    assert(JSON.stringify(kernel.executeRelationEffect(r.executionInput)) === JSON.stringify(r.execution),'reported output differs from actual kernel');
    assert(!r.execution.realized && r.execution.effectType === null && !r.effectAuthorizationResolved,'negative became effect authorization');
});
test('negative source is not unresolved or realized-unmapped',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.execution.executionState !== 'unresolved-generic-relation-effect'
        && r.execution.executionState !== 'realized-relation-currently-unmapped','explicit denial erased');
});
test('nonrealization provenance retains separate source annotation identity and authority',() => {
    const p = evaluate().executionInput.realizationProvenance;
    assert(p.sourceCaseId === 'CF-SOKNR-CASE-01' && p.annotationId === 'CF-SOKNR-ANN-01'
        && p.identityAuthorityId === 'CF-SOKNR-IDENTITY-01' && p.realizationAuthorityId === 'CF-SOKNR-REALIZATION-01','authority identities conflated');
    assert(p.sourceProvenance.sourceText === contract.SOURCE_CASE.sourceText && p.reviewedBasis && p.assertionSpan === '不但不能助杀','negative interpretation lost');
});
test('negative actor pair preserves peer direction and chart-scoped original path identity',() => {
    const r = evaluate();
    assert(r.execution.relationIdentity.functionType === 'peer' && r.execution.relationIdentity.directed
        && r.execution.relationIdentity.id === `${CHART}::CF-SOKNR-PATH-01`,'relation identity lost');
    assert(r.execution.sourceEndpoint.actorKey === 'visible:0:癸' && r.execution.targetEndpoint.actorKey === 'visible:3:壬','direction reversed');
});
test('no positive R5 license is fabricated for a negative case',() => {
    const a = evaluate().executionInput.authorization;
    assert(a.state === 'effect-authorization-not-applicable' && !a.sourceBacked && !a.relationTypes.length && !a.authorityIds.length,'invented negative effect license');
    assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'negative input borrowed R15 augmentation license');
});
test('alternate transformation and blade wording is retained without reverse or opposition execution',() => {
    const r = evaluate();
    assert(r.excludedAlternateOutcome.span === '抑且化火为劫，反助阳刃猖狂' && !r.excludedAlternateOutcome.executionAuthorized,'alternate outcome lost or executed');
    assert(r.execution.reverseEffect === null && r.reverseEffect === null && r.transformedActorIdentity === null
        && r.alternateBladeEffect === null && !r.relationEffects.length && !r.memberEdges.length,'negative fabricated reverse/transformed effect');
});
test('compound combination remains source condition without manufacturing Wu or fire execution endpoints',() => {
    const r = evaluate();
    assert(r.executionInput.realizationProvenance.conditionSpan === '此则戊癸合而必化' && r.normalizedInput.contextSpans.some((s) => s.text === '此则戊癸合而必化'),'compound source condition missing');
    assert(r.execution.sourceEndpoint.actorKey !== 'visible:1:戊' && r.execution.targetEndpoint.actorKey !== 'visible:2:丙','compound condition expanded');
});
test('original source transcription oddities are preserved instead of silently repaired',() => {
    assert(contract.SOURCE_CASE.sourceText.includes('巳乃南方之火火') && contract.COMPARISON_CASE.sourceText.includes('不抗呼壬水'),'source wording silently corrected');
});
test('neighbor Chou case is actual contextual comparison but has no assistance or effect authority',() => {
    const c = contract.COMPARISON_CASE;
    assert(c.chartKey === NEIGHBOR && c.disposition === 'contextual-comparison-only' && !c.assistanceRealizationReviewed
        && !c.effectTypeAuthorized && !c.nonOppositionImpliesAugmentation,'comparison became positive evidence');
    const p = outputFor(NEIGHBOR).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerNonrealization;
    assert(p.result.status === STATES.NOT_APPLICABLE && p.resolvedRuntimeNonrealizationCount === 0,'neighbor inherited negative');
});
test('one branch difference is not a transferable runtime combination condition',() => {
    const r = api.evaluateNonrealization(input(),{ ...actualContext(),chartKey:NEIGHBOR });
    assert(r.status === STATES.NOT_APPLICABLE && !r.binding && !r.execution,'source comparison became branch matcher');
    assert(!contract.REALIZATION_AUTHORITY.genericCombinationRuleDefined && !contract.CONTRACT.genericCombinationResolverDefined,'generic combination rule introduced');
});
test('swapped positions or nearby branches cannot reuse negative authority',() => {
    for (const chartKey of ['壬辰|戊午|丙午|癸巳','癸巳|戊午|丙午|壬午',POSITIVE,WEALTH_FIRST]) {
        const r = api.evaluateNonrealization(input(),{ ...actualContext(),chartKey });
        assert(r.status === STATES.NOT_APPLICABLE && !r.binding && !r.execution,'negative authority transferred');
    }
});
const tamper = (name,edit) => test(name,() => {
    const i = copy(input());edit(i);
    const r = api.evaluateNonrealization(i,actualContext());
    assert(r.status === STATES.INVALID && !r.sourceValidation.valid && !r.binding && !r.execution && !r.relationEffects.length,'forged negative accepted');
    assert(!Object.isFrozen(i),'caller input frozen');
});
tamper('negation cannot be dropped from source excerpt',(i) => { i.sourceCase.sourceText = i.sourceCase.sourceText.replace('不能助杀','助杀'); });
tamper('same named stems cannot replace full natal source context',(i) => { i.sourceCase.sourceText = '癸壬不能助杀'; });
tamper('comparison Chou chart cannot replace negative Si chart',(i) => { i.sourceCase.chartKey = NEIGHBOR;i.sourceCase.zhis[0] = '丑'; });
tamper('R15 source ID cannot lend positive identity or authority',(i) => { i.sourceCase.id = 'CF-SITC-CASE-01'; });
tamper('negative predicate cannot be replaced with non-opposition',(i) => { i.realizationAuthority.assertionSpan = '不抗呼壬水'; });
tamper('source-conditioned nonrealization cannot turn into realized',(i) => { i.realizationAuthority.realizationState = 'realized-in-source-context'; });
tamper('missing source nonrealization authority cannot be inferred from combination',(i) => { delete i.realizationAuthority; });
tamper('missing source identity cannot be inferred from source-case ID',(i) => { delete i.identityAuthority; });
tamper('source hidden Chen Gui cannot replace reviewed visible year Gui',(i) => { i.identityAuthority.sourceActorKey = 'hidden:3:辰:癸:2';i.identityAuthority.sourceScope = 'hidden-branch'; });
tamper('target cannot switch to hidden or group scope',(i) => { i.identityAuthority.targetScope = 'hidden-branch';i.identityAuthority.targetCardinality = 2; });
tamper('officer-killer relation direction cannot reverse',(i) => { i.realizationAuthority.sourceActorKey = 'visible:3:壬';i.realizationAuthority.targetActorKey = 'visible:0:癸'; });
tamper('compound condition cannot become food-to-killer source actor',(i) => { i.identityAuthority.sourceActorKey = 'visible:1:戊'; });
tamper('alternate blade wording cannot replace denied assistance path',(i) => { i.realizationAuthority.assertionSpan = i.realizationAuthority.excludedAlternateOutcomeSpan; });
tamper('R11 path cannot reuse negative relation authority',(i) => { i.realizationAuthority.sourcePathId = 'CF-CRP-REC-01-P01'; });
tamper('caller cannot add positive augmentation authorization',(i) => { i.effectAuthority = { relationType:'anchor-augmentation',sourceBacked:true }; });
tamper('caller cannot force reverse effect',(i) => { i.realizationAuthority.negativeCreatesReverseEffect = true; });
tamper('caller validated flag is not source authority',(i) => { i.validation = { valid:true }; });
tamper('sparse transfer lists cannot broaden finite source coverage',(i) => { i.realizationAuthority.transferablePathIds = new Array(1); });
test('malformed unknown and comparison-only inputs fail closed',() => {
    for (const i of [null,[],42,{},contract.COMPARISON_CASE,api.inputForCase('CF-SOKNR-COMPARE-01')]) {
        assert(api.evaluateNonrealization(i,actualContext()).status === STATES.INVALID,'unknown/comparison source accepted');
    }
});
test('missing malformed current chart or actual inventory cannot fabricate a negative result',() => {
    for (const ctx of [null,{}, { chartKey:{ chart:CHART } },{ chartKey:CHART },{ chartKey:CHART,inventory:{} },
        { chartKey:CHART,inventory:{ actorProfiles:[null],evidenceRecords:[] } }]) {
        const r = api.evaluateNonrealization(input(),ctx);
        assert(r.status === STATES.UNRESOLVED && !r.execution,'missing chart/inventory treated as not-realized');
    }
});
const tamperInventory = (name,edit) => test(name,() => {
    const ctx = copy(actualContext());edit(ctx.inventory);
    const r = api.evaluateNonrealization(input(),ctx);
    assert(r.status === STATES.UNRESOLVED && !r.binding && !r.execution,'forged inventory used');
});
tamperInventory('duplicate target profiles cannot resolve by first selection',(i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'visible:3:壬'))); });
tamperInventory('missing visible source is not replaced by hidden homonym',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:0:癸'); });
tamperInventory('missing target is not reconstructed from named stem text',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:3:壬'); });
tamperInventory('wrong source role evidence cannot reuse complete chart',(i) => { i.evidenceRecords.filter((r) => r.actorKey === 'visible:0:癸').forEach((r) => { r.tenGod = '七杀'; }); });
tamperInventory('conflicting target role evidence blocks explicit nonrealization',(i) => { i.evidenceRecords.push({ actorKey:'visible:3:壬',tenGod:'正官' }); });
tamperInventory('missing role evidence cannot reuse existing actor profile',(i) => { i.evidenceRecords = i.evidenceRecords.filter((r) => r.actorKey !== 'visible:3:壬'); });
test('callers stay unchanged and binding target normalization provenance and output are deeply immutable',() => {
    const i = copy(input()),ctx = copy(actualContext()),before = JSON.stringify([i,ctx]),r = api.evaluateNonrealization(i,ctx);
    assert(JSON.stringify([i,ctx]) === before && !Object.isFrozen(i) && !Object.isFrozen(ctx.inventory),'caller changed');
    assert(Object.isFrozen(r.executionInput.realizationProvenance.sourceProvenance.gans) && Object.isFrozen(r.execution.authorizationIds)
        && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance.targetCandidateKeys),'output mutable');
});
test('full research runtime exposes one negative execution with zero positive or downstream effects',() => {
    const p = synthesis.contextualForcePartySourceOfficerKillerNonrealization;
    assert(p.finiteNegativeSourceCoverageComplete && p.negativeSourceCaseCount === 1 && p.resolvedRuntimeNonrealizationCount === 1
        && p.result.status === STATES.RESOLVED && !p.result.positiveEffectExecutionAuthorized,'runtime negative missing');
    assert(p.positiveEffectSourceCaseCount === 0 && !p.relationEffects.length && p.numericScore === null && p.relativeDominance === null,'negative expanded');
});
test('independent positive and negative source evidence stays separate from comparison-only case',() => {
    const p = synthesis.contextualForcePartySourceOfficerKillerNonrealization.independentSourceOutcomeCoverage;
    assert(p.realizedSourceCaseIds.join(',') === 'CF-SITC-CASE-01' && p.notRealizedSourceCaseIds.join(',') === 'CF-SOKNR-CASE-01'
        && p.comparisonOnlySourceCaseIds.join(',') === 'CF-SOKNR-COMPARE-01','source state coverage conflated');
    assert(synthesis.contextualForcePartySourceOfficerKillerEffectCalibration.resolvedRuntimeEffectCount === 0,'R15 positive transferred');
});
test('R15 actual augmentation still executes while R16 is not applicable to that chart',() => {
    const s = outputFor(POSITIVE).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerEffectCalibration.resolvedRuntimeEffectCount === 1
        && s.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.status === STATES.NOT_APPLICABLE,'R16 overrode positive');
    const r = positive.evaluateEffect(positive.inputForCase(),actualContext());
    assert(r.status === positive.STATES.NOT_APPLICABLE,'positive authority inherited negative');
});
test('neighbor receives neither new positive augmentation nor negative execution',() => {
    const s = outputFor(NEIGHBOR).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerEffectCalibration.resolvedRuntimeEffectCount === 0
        && s.contextualForcePartySourceOfficerKillerNonrealization.resolvedRuntimeNonrealizationCount === 0,'neighbor granted new relation outcome');
});
test('old motif and realization registries remain unchanged',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3,'generic motif added');
    assert(!g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'old direct registry changed');
});
test('R11 targets and B02-B05 remain unresolved while only narrow negative source dependency resolves',() => {
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 identity transferred');
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.transferredR11TargetCount === 0,'transfer claimed');
    const d = synthesis.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-NONREALIZATION');
    assert(d.status === 'resolved' && d.scope === contract.CONTRACT.calibrationScope,'narrow dependency wrong');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4,'global resolver released');
    assert(synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final assessment released');
});
test('R9 mediation and CASE06 hidden target authority stay intact',() => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
});
test('absent upstream remains inert and extension is idempotent',() => {
    const ext = g.baziContextualForcePartySourceOfficerKillerNonrealization,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().result.status === STATES.UNRESOLVED,'missing input fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1,'duplicate integration records');
});
console.log(`\nSource Officer Killer Nonrealization tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
