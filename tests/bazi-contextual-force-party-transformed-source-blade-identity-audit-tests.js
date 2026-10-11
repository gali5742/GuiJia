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
const g = context.GuiJia,api = g.baziContextualForcePartyTransformedSourceBladeIdentityAuditProfile;
const contract = g.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract;
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
const evaluate = () => api.evaluateAudit(input(),actualContext());

test('same R16 natal case is audited without inventing a new positive source case',() => {
    const i = input(),p = synthesis.contextualForcePartyTransformedSourceBladeIdentityAudit;
    assert(api.validateSourceInput(i).valid && i.upstreamInput.sourceCase.chartKey === CHART && i.upstreamInput.sourceCase.id === 'CF-SOKNR-CASE-01','wrong source');
    assert(p.sourceCaseCount === 1 && p.newPositiveEffectSourceCaseCount === 0 && p.additionalDefinitionSourceCount === 1,'source acquisition overstated');
});
test('separate primary blade definition retains exact wording locator and metadata',() => {
    const d = contract.DEFINITION_SOURCE;
    assert(d.sourceText === '如丙日主，以午为羊刃，干透丁火为露刃。' && d.locator.includes('六亲论') && d.locator.includes('性情')
        && d.retrievedOn === '2026-10-11' && d.revisionId === null && d.sourceUrl.includes('wikisource.org'),'blade definition provenance lost');
    assert(d.originalCaseTerm === '阳刃' && d.definitionTerm === '羊刃' && d.reviewedTerminologyAlignment
        && !d.sourceMentionsResolveCaseTargetCardinality,'definition acquired unauthorized target meaning');
});
test('exact full chart verifies original visible month Wu and year Gui operands',() => {
    const r = evaluate();
    assert(r.status === STATES.AUDITED && r.originalOperands.map((o) => o.actorKey).join(',') === 'visible:1:戊,visible:0:癸','original operands missing');
    assert(r.originalOperands.map((o) => o.roleClass).join(',') === '食神,正官' && r.inventoryValidation.valid,'original roles incorrect');
    assert(synthesis.contextualForcePartyMembershipInventory.actorProfiles.some((p) => p.actorKey.startsWith('hidden:3:辰:癸:')),'hidden homonym test fixture missing');
});
test('transformation event and result retain distinct provenance identities',() => {
    const r = evaluate();
    assert(r.transformationEvent.id === 'CF-TSBI-TRANSFORM-01' && r.transformedResult.id === r.transformationEvent.resultNodeId
        && r.transformedResult.nodeKind === 'source-asserted-transformation-result','result identity conflated');
    assert(r.transformationEvent.eventSpan === '此则戊癸合而必化' && r.transformedResult.sourceSpan === '化火为劫'
        && r.transformationEvent.sourceAssertionState === 'asserted-in-exact-source-context','source assertion lost');
});
test('source fire and Jie labels do not manufacture a Ding stem polarity or ordinary actor',() => {
    const r = evaluate().transformedResult;
    assert(r.elementLabel === '火' && r.roleLabel === '劫' && r.normalizedTenGodClass === null,'source labels reclassified');
    assert(r.actorKey === null && r.endpointType === null && r.stem === null && r.polarity === null && r.cardinality === null,'transformed actor fabricated');
    assert(!r.inputActorsAreResult && r.sourceCaseScoped,'compound operands aliased to result');
});
test('two distinct branch candidates preserve month and day identity without a target group',() => {
    const r = evaluate();
    assert(r.bladeCandidates.map((c) => c.actorKey).join(',') === 'surface-branch:1:午,surface-branch:2:午','branch candidates conflated');
    assert(r.targetIdentity.candidateCount === 2 && r.targetIdentity.cardinality === null && r.targetIdentity.groupId === null
        && !r.targetIdentity.memberActorKeys.length && !r.targetIdentity.sourceSpecificMembershipComplete,'candidate count became group cardinality');
});
test('candidate identity cannot select month day hidden Ding or all fire actors',() => {
    const b = contract.BLADE_REVIEW,t = evaluate().targetIdentity;
    assert(!b.monthPriorityAuthorized && !b.dayPriorityAuthorized && !b.hiddenDingIsBranchBlade && !b.allFireActorsAreBladeTargets,'unauthorized priority');
    assert(t.actorKey === null && t.scope === null && t.endpointType === null && !t.selectedCandidateKeys.length,'target selected');
});
test('actual target normalizer retains candidate evidence and refuses required unbound identity',() => {
    const n = evaluate().normalizedInput,v = g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(n);
    assert(!n.validation.valid && !v.valid && n.validation.errors.some((e) => e.includes('required-target-identity-unresolved')),'normalizer bypassed');
    const u = n.relationUnits[0];
    assert(u.targetMention.span === '阳刃' && u.identityProvenance.targetCandidateKeys.length === 2,'unresolved evidence lost');
    assert(u.identityProvenance.cardinality === null && u.identityProvenance.actorKey === null,'unresolved identity invented');
});
test('actual R3 generic resolver keeps alternate target unresolved',() => {
    const r = evaluate(),actual = g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput);
    assert(JSON.stringify(actual) === JSON.stringify(r.targetResolution) && !r.targetResolution.unitResolutions.length,'R3 result fabricated');
    assert(r.targetResolution.semanticLevel === null && !r.bladeTargetEndpointResolved,'R3 target released');
});
test('actual R4 refuses alternate path while preserving source assertion separately',() => {
    const r = evaluate();
    assert(JSON.stringify(kernel.executeRelationEffect(r.executionInput)) === JSON.stringify(r.execution)
        && r.execution.executionState === 'unresolved-generic-relation-effect','R4 refusal bypassed');
    assert(r.sourceOutcomeAssertion.span === '抑且化火为劫，反助阳刃猖狂' && !r.sourceOutcomeAssertion.assertionIsExecutableRealization
        && !r.sourceOutcomeAssertion.negativeOfficerPathIsAlternateLicense,'assertion erased or licensed');
    assert(!r.executionAuthorized && !r.relationRealizationResolved && !r.effectAuthorizationResolved && !r.relationEffects.length,'alternate executed');
});
test('existing R4 endpoint vocabulary refuses a fabricated transformation result even with actionable target',() => {
    const negative = g.baziContextualForcePartySourceOfficerKillerNonrealizationProfile;
    const r = copy(negative.evaluateNonrealization(negative.inputForCase(),actualContext()).executionInput);
    r.sourceEndpoint = { type:'transformed-result',id:'CF-TSBI-RESULT-01' };
    r.realizationState = 'realized-in-source-context';
    const execution = kernel.executeRelationEffect(r);
    assert(execution.executionState === 'unresolved-generic-relation-effect'
        && execution.blockerReasons.includes('source-endpoint-type-unsupported'),'new endpoint type silently supported');
});
test('source assertion does not create generic transformation blade selection or effect mapping',() => {
    assert(!contract.CONTRACT.genericTransformationResolverDefined && !contract.CONTRACT.genericBladeTargetResolverDefined
        && !contract.CONTRACT.effectTypeAuthorityCreated && !contract.CONTRACT.ordinaryActorReclassification,'generic mapping fabricated');
    assert(evaluate().executionInput.relationIdentity.functionType === null && !evaluate().executionInput.authorization.sourceBacked,'lexical assistance became effect type');
});
const tamper = (name,edit) => test(name,() => {
    const i = copy(input());edit(i);
    const r = api.evaluateAudit(i,actualContext());
    assert(r.status === STATES.INVALID && !r.sourceValidation.valid && !r.originalOperands.length && !r.execution,'forged review accepted');
    assert(!Object.isFrozen(i),'caller frozen');
});
tamper('alternate outcome cannot lose original negative context',(i) => { i.upstreamInput.sourceCase.sourceText = '化火为劫，反助阳刃'; });
tamper('neighbor Chou chart cannot inherit this review',(i) => { i.upstreamInput.sourceCase.chartKey = NEIGHBOR; });
tamper('definition cannot silently change Bing or Wu',(i) => { i.definitionSource.candidateZhi = '巳'; });
tamper('definition metadata and original wording remain exact',(i) => { i.definitionSource.sourceText = '丙以午为刃'; });
tamper('blade definition cannot become collective cardinality authority',(i) => { i.definitionSource.sourceMentionsResolveCaseTargetCardinality = true; });
tamper('hidden Gui cannot replace original visible transformation operand',(i) => { i.transformationReview.inputOperands[1].actorKey = 'hidden:3:辰:癸:2'; });
tamper('original compound cannot become result actor group',(i) => { i.transformationReview.resultIsOperandGroup = true; });
tamper('ordinary Wu cannot alias transformed result',(i) => { i.transformationReview.resultActorKey = 'visible:1:戊'; });
tamper('existing hidden Ding cannot alias transformed result',(i) => { i.transformationReview.resultActorKey = 'hidden:1:午:丁:0'; });
tamper('Jie wording cannot invent normalized role or polarity',(i) => { i.transformationReview.normalizedResultTenGodClass = '劫财';i.transformationReview.resultPolarity = 'yin'; });
tamper('month priority cannot select ambiguous blade target',(i) => { i.bladeReview.monthPriorityAuthorized = true;i.bladeReview.targetActorKey = 'surface-branch:1:午'; });
tamper('day priority cannot select ambiguous blade target',(i) => { i.bladeReview.dayPriorityAuthorized = true; });
tamper('candidate count cannot create two-member group',(i) => { i.bladeReview.targetCardinality = 2;i.bladeReview.memberActorKeys = i.bladeReview.candidates.map((c) => c.actorKey); });
tamper('candidate evidence cannot become configuration-only target',(i) => { i.bladeReview.targetEndpointType = 'configuration'; });
tamper('all fire scope cannot add Si to blade candidates',(i) => { i.bladeReview.candidates.push({ actorKey:'surface-branch:0:巳',zhi:'巳' }); });
tamper('hidden Ding cannot replace branch candidate',(i) => { i.bladeReview.candidates[0].actorKey = 'hidden:1:午:丁:0'; });
tamper('candidate omission cannot make day target unique',(i) => { i.bladeReview.candidates.shift();i.bladeReview.candidateCount = 1; });
tamper('review cannot transfer identity to an R11 path',(i) => { i.bladeReview.transferablePathIds = ['CF-CRP-REC-01-P01']; });
tamper('predicate cannot add an augmentation hint',(i) => { i.annotation.relationUnits[0].relationSemanticHint = 'anchor-augmentation'; });
tamper('caller validation cannot authorize source review',(i) => { i.validation = { valid:true }; });
tamper('caller cannot add alternate effect authorization',(i) => { i.effectAuthorization = { sourceBacked:true,relationType:'anchor-augmentation' }; });
tamper('sparse transfer list cannot pass exact review',(i) => { i.transformationReview.transferablePathIds = new Array(1); });
test('unknown malformed and missing current chart inputs fail closed',() => {
    for (const i of [null,[],42,{},api.inputForCase('unknown')]) assert(api.evaluateAudit(i,actualContext()).status === STATES.INVALID,'unknown input accepted');
    for (const ctx of [null,{}, { chartKey:42 },{ chartKey:CHART },{ chartKey:CHART,inventory:{} },
        { chartKey:CHART,inventory:{ actorProfiles:[null],evidenceRecords:[] } }]) {
        const r = api.evaluateAudit(input(),ctx);
        assert(r.status === STATES.UNRESOLVED && !r.execution && !r.bladeCandidates.length,'missing current evidence replaced');
    }
});
const tamperInventory = (name,edit) => test(name,() => {
    const ctx = copy(actualContext());edit(ctx.inventory);
    const r = api.evaluateAudit(input(),ctx);
    assert(r.status === STATES.UNRESOLVED && !r.originalOperands.length && !r.bladeCandidates.length && !r.execution,'bad inventory resolved');
});
tamperInventory('missing Wu operand cannot reuse hidden homonyms',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:1:戊'); });
tamperInventory('missing Gui evidence cannot reuse profile alone',(i) => { i.evidenceRecords = i.evidenceRecords.filter((p) => p.actorKey !== 'visible:0:癸'); });
tamperInventory('duplicate blade profiles cannot select first',(i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'surface-branch:1:午'))); });
tamperInventory('missing month candidate cannot make day target unique',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:1:午'); });
tamperInventory('missing day evidence cannot reconstruct target from text',(i) => { i.evidenceRecords = i.evidenceRecords.filter((p) => p.actorKey !== 'surface-branch:2:午'); });
tamperInventory('conflicting original role blocks transformation operands',(i) => { i.evidenceRecords.filter((r) => r.actorKey === 'visible:1:戊').forEach((r) => { r.tenGod = '劫财'; }); });
tamperInventory('hidden scope cannot masquerade as visible original operand',(i) => { i.evidenceRecords.filter((r) => r.actorKey === 'visible:0:癸').forEach((r) => { r.sourceScope = 'hidden-branch'; }); });
tamperInventory('wrong blade position cannot borrow existing key',(i) => { i.evidenceRecords.filter((r) => r.actorKey === 'surface-branch:1:午').forEach((r) => { r.pillarIndex = 2; }); });
tamperInventory('wrong branch element cannot borrow blade identity',(i) => { i.evidenceRecords.filter((r) => r.actorKey === 'surface-branch:2:午').forEach((r) => { r.wuxing = '水'; }); });
test('caller input inventory stay unchanged and audit evidence is deeply frozen',() => {
    const i = copy(input()),ctx = copy(actualContext()),before = JSON.stringify([i,ctx]),r = api.evaluateAudit(i,ctx);
    assert(JSON.stringify([i,ctx]) === before && !Object.isFrozen(i) && !Object.isFrozen(ctx.inventory),'caller changed');
    assert(Object.isFrozen(r.originalOperands[0]) && Object.isFrozen(r.bladeCandidates) && Object.isFrozen(r.normalizedInput.provenance.gans)
        && Object.isFrozen(r.executionInput.authorization.authorityIds),'mutable audit');
});
test('current research view distinguishes complete annotation audit from unresolved runtime endpoints',() => {
    const p = synthesis.contextualForcePartyTransformedSourceBladeIdentityAudit;
    assert(p.finiteSourceAnnotationCoverageComplete && p.verifiedRuntimeOperandCount === 2 && p.verifiedRuntimeBladeCandidateCount === 2
        && p.resolvedRuntimeAlternatePathCount === 0 && !p.transformedSourceEndpointResolved && !p.bladeTargetEndpointResolved,'coverage misrepresented');
    assert(!p.relationEffects.length && !p.memberEdges.length && p.numericScore === null && p.relativeDominance === null,'downstream released');
});
test('neighbor and positive chart get no alternate-path identity despite static annotation coverage',() => {
    for (const chartKey of [NEIGHBOR,POSITIVE,'壬辰|戊午|丙午|癸巳']) {
        const r = api.evaluateAudit(input(),{ ...actualContext(),chartKey });
        assert(r.status === STATES.NOT_APPLICABLE && !r.execution && !r.originalOperands.length,'source authority transferred');
    }
    const p = outputFor(NEIGHBOR).semanticModel.strengthSynthesis.contextualForcePartyTransformedSourceBladeIdentityAudit;
    assert(p.finiteSourceAnnotationCoverageComplete && p.verifiedRuntimeBladeCandidateCount === 0,'static coverage falsely implies current applicability');
});
test('R16 original officer nonrealization stays distinct from alternate source assertion',() => {
    const p = synthesis.contextualForcePartySourceOfficerKillerNonrealization;
    assert(p.resolvedRuntimeNonrealizationCount === 1 && p.result.execution.executionState === 'not-realized-generic-relation-effect'
        && !p.result.relationEffects.length,'original negative regressed');
    assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'alternate borrowed R15 license');
});
test('R15 positive R9 mediation and CASE06 hidden binding still execute',() => {
    const s = outputFor(POSITIVE).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerEffectCalibration.resolvedRuntimeEffectCount === 1
        && s.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
});
test('R11 global blockers and final assessment remain unresolved',() => {
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 targets inherited');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4,'global blockers released');
    assert(synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final assessment released');
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.scope === contract.CONTRACT.auditScope && d.kind === 'source-coverage','audit dependency misrepresents runtime readiness');
});
test('old motifs direct realization registry and absent upstream remain unchanged',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'generic old registries extended');
    const ext = g.baziContextualForcePartyTransformedSourceBladeIdentityAudit,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().result.status === STATES.UNRESOLVED,'missing upstream not inert');
});
test('research extension is idempotent for claim dependency and boundary',() => {
    const twice = g.baziContextualForcePartyTransformedSourceBladeIdentityAudit.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate integration');
});
console.log(`\nTransformed Source Blade Identity Audit tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
