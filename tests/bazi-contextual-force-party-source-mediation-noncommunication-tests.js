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
const g = context.GuiJia,api = g.baziContextualForcePartySourceMediationNoncommunicationProfile;
const contract = g.baziContextualForcePartySourceMediationNoncommunicationContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '己巳|丁卯|辛卯|乙未',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const COMPARISON = '戊辰|乙卯|辛丑|丁酉',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });

test('new complete primary chart has independent natal provenance and no fortune columns',() => {
    const s = contract.SOURCE_CASE;
    assert(s.chartKey === CHART && s.gans.join() === '己,丁,辛,乙' && s.zhis.join() === '巳,卯,卯,未','chart transcribed incorrectly');
    assert(s.retrievedOn === '2026-10-12' && s.revisionId === null && s.sourceUrl.includes('wikisource.org')
        && s.sourceText.endsWith('而无辅主之意，') && !s.sourceText.includes('亥运'),'natal provenance lost');
    assert(api.validateSourceInput(input()).valid && contract.CONTRACT.newCompleteSourceCaseCount === 1
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 0,'new chart counted as existing evidence');
});
test('source pillar and role review resolves month Ding killer to year Ji seal',() => {
    const a = contract.IDENTITY_AUTHORITY,b = g.baziCore;
    assert(a.sourceActorKey === 'visible:1:丁' && a.targetActorKey === 'visible:0:己' && a.endpointScope === 'visible-stem'
        && b.shiShenMap['辛']['丁'] === '七杀' && b.shiShenMap['辛']['己'] === '偏印','wrong pillar role identity');
    assert(a.sourceNamingSpan === '月杀' && a.targetNamingSpan === '年印' && !a.literalDirectedGenerationAsserted
        && a.directionBasis.includes('symmetrically'),'review inference hidden');
});
test('actual normalized contract and R3 consume one visible year seal',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.normalizedInput.validation.valid
        && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(r.normalizedInput).valid,'normalized validator bypassed');
    assert(JSON.stringify(r.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput)),'R3 fabricated');
    const t = r.targetResolution.unitResolutions[0];
    assert(t.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && t.targetReference.actorKey === 'visible:0:己'
        && t.targetReference.scope === 'visible-stem' && r.normalizedInput.relationUnits.length === 1,'target branch or group substituted');
});
test('actual R4 preserves explicit noncommunication with no positive or reverse effect',() => {
    const r = evaluate();
    assert(r.relationIdentityResolved && r.relationRealizationResolved && r.relationRealized === false,'negative source knowledge lost');
    assert(JSON.stringify(r.execution) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'R4 fabricated');
    assert(r.execution.executionState === 'not-realized-generic-relation-effect' && r.execution.realizationState === 'not-realized-in-source-context'
        && r.execution.decisionRuleId === 'GREE-R04-NOT-REALIZED' && r.execution.effectType === null && r.execution.reverseEffect === null,'failure inverted');
    assert(!r.executionAuthorized && !r.effectAuthorizationResolved && !r.relationEffects.length && !r.reverseEdges.length,'negative granted positive authorization');
});
test('noncommunication does not assert that elemental generation failed',() => {
    const r = evaluate(),a = contract.REALIZATION_AUTHORITY;
    assert(g.baziCore.getWuXing('丁') === '火' && g.baziCore.getWuXing('己') === '土','generation premise missing');
    assert(a.functionType === 'source-asserted-killer-seal-communication' && !a.generationNonrealizationInferred
        && r.execution.relationIdentity.functionType === a.functionType && !contract.CONTRACT.genericGenerationNonrealizationMapping,'generation denied');
    assert(a.evidenceSpan === '年印，月杀，未得相通' && a.reviewedBasis.includes('adjacency/distance/roles'),'exact source review replaced by geometry');
});
test('nonrealization evidence is not an R5 effect license',() => {
    const r = evaluate(),a = r.executionInput.authorization;
    assert(a.state === 'effect-authorization-not-applicable' && !a.sourceBacked && !a.relationTypes.length && !a.authorityIds.length
        && a.sourceEvidenceIds.includes('CF-SMNC-REALIZATION-01') && a.sourceEvidenceIds.includes('CF-SMNC-EXCLUDED-01'),'evidence granted type authority');
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 6 && !Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === api.RULE_ID),'R5 family added');
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'borrowed another family');
    }
});
test('hidden hour Ding and Ji cannot replace explicitly named visible endpoints',() => {
    const inv = actualContext().inventory;
    assert(inv.actorProfiles.some((p) => p.actorKey === 'hidden:3:未:己:0')
        && inv.actorProfiles.some((p) => p.actorKey === 'hidden:3:未:丁:1'),'hidden substitution premise missing');
    const r = evaluate();
    assert(r.execution.sourceEndpoint.actorKey === 'visible:1:丁' && r.execution.targetEndpoint.actorKey === 'visible:0:己'
        && r.execution.identityShape === 'actor-to-actor' && !contract.IDENTITY_AUTHORITY.branchOrHiddenSubstitutionAuthorized,'hidden substitution');
});
test('unreviewed branch actors are independent of the reviewed visible path',() => {
    const c = copy(actualContext()),retain = (p) => p.actorKey.startsWith('visible:');
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(retain);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(retain);
    assert(api.evaluateSource(input(),c).status === STATES.RESOLVED,'branch outcome required for visible path');
});
test('two Mao candidates are retained as context without member selection or transformed actor',() => {
    const x = evaluate().excludedContext;
    assert(x.branchFormationSpan === '时支未土，又会卯化木' && x.branchMaoCandidateKeys.join() === 'surface-branch:1:卯,surface-branch:2:卯','candidate context changed');
    assert(!x.memberEdges.length && !x.transformationResultMaterializationAuthorized && !evaluate().memberEdges.length
        && evaluate().normalizedInput.configurationSpans.length === 0,'unreviewed configuration became executable');
});
test('asserted killer support is preserved without a new effect or denial of all relations',() => {
    const x = evaluate().excludedContext;
    assert(x.assertedKillerSupportSpan === '只有生杀之情，而无辅主之意' && x.assertedSupportPreservedAsContext
        && x.independentSupportIdentityOrEffectAuthority === null && !x.allRelationsAbsentFromNoncommunication,'support assertion erased or licensed');
    assert(x.positiveEffectAuthority === null && !x.r5SourceFamilyRegistered && !x.reverseEdges.length,'alternate support became reverse effect');
});
test('R24 is an independent branch positive contrast rather than a controlled counterfactual',() => {
    const p = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartySourceBranchMediationCalibration;
    assert(p.resolvedRuntimeEffectCount === 1 && p.result.execution.effectType === 'anchor-mediation'
        && p.result.execution.sourceEndpoint.actorKey === 'surface-branch:1:子' && p.result.execution.targetEndpoint.actorKey === 'surface-branch:2:卯','R24 regressed');
    const x = evaluate().excludedContext;
    assert(x.comparisonCaseId === 'CF-SBMC-CASE-01' && !x.controlledCounterfactual && !x.positiveAuthorityInherited
        && !x.branchMediationFailedFromVisiblePath && !x.causalPositionRuleDerived && !contract.CONTRACT.branchNegativeCalibrationEstablished,'cross-scope causal rule fabricated');
});
for (const [name,change] of [
    ['source text',(i) => { i.sourceCase.sourceText = '年印，月杀，相通'; }],
    ['chart',(i) => { i.sourceCase.chartKey = COMPARISON; }],
    ['day',(i) => { i.sourceCase.gans[2] = '庚'; }],
    ['retrieval provenance',(i) => { i.sourceCase.retrievedOn = '2026-10-11'; }],
    ['fortune included',(i) => { i.sourceCase.sourceText += '至亥运会木生杀而亡'; }],
    ['annotation target',(i) => { i.annotation.relationUnits[0].target.span = '未土'; }],
    ['hidden source',(i) => { i.identityAuthority.sourceActorKey = 'hidden:3:未:丁:1'; }],
    ['hidden target',(i) => { i.identityAuthority.targetActorKey = 'hidden:3:未:己:0'; }],
    ['reverse path',(i) => { i.identityAuthority.sourceActorKey = 'visible:0:己'; }],
    ['branch target',(i) => { i.identityAuthority.targetActorKey = 'surface-branch:3:未'; }],
    ['missing identity',(i) => { delete i.identityAuthority; }],
    ['missing realization',(i) => { delete i.realizationAuthority; }],
    ['missing excluded context',(i) => { delete i.excludedContext; }],
    ['realization positive',(i) => { i.realizationAuthority.state = 'realized-in-source-context'; }],
    ['generation denial',(i) => { i.realizationAuthority.functionType = 'generation'; }],
    ['member selection',(i) => { i.excludedContext.branchMaoCandidateKeys = ['surface-branch:1:卯']; }],
    ['transformation actor',(i) => { i.excludedContext.transformationResultMaterializationAuthorized = true; }],
    ['positive authority',(i) => { i.excludedContext.positiveEffectAuthority = 'CF-SBMC-EFFECT-01'; }],
    ['controlled cause',(i) => { i.excludedContext.controlledCounterfactual = true; }],
    ['caller valid flag',(i) => { i.valid = true; }],
    ['caller execution',(i) => { i.execution = evaluate().execution; }]
]) test(`independent source validation refuses ${name}`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && r.execution === null && !r.relationRealizationResolved,'tampered authority accepted');
});
test('invalid unknown and incomplete inputs stay closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid input accepted');
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,targetResolution:evaluate().targetResolution }]) {
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'incomplete context accepted');
    }
});
for (const actorKey of ['visible:1:丁','visible:0:己']) {
    test(`missing or duplicate ${actorKey} blocks actual identity`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'actor identity fabricated');
        }
    });
    test(`wrong scope pillar element or role for ${actorKey} stays unresolved`,() => {
        for (const [field,value] of [['sourceScope','hidden-stem'],['pillarIndex',3],['position','hour'],['gan','甲'],['wuxing','水'],['tenGod','正官']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((r) => r.actorKey === actorKey)[field] = value;
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'bad evidence accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((r) => r.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing evidence accepted');
    });
}
test('malformed and sparse inventory stays unresolved',() => {
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],[undefined],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'malformed inventory accepted');
    }
});
test('other charts including a neighboring source case cannot inherit noncommunication',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,POSITIVE,NEIGHBOR,'癸酉|甲子|丁卯|丙午','壬午|己酉|甲申|甲子']) {
        const r = api.evaluateSource(input(),contextFor(chartKey));
        assert(r.status === STATES.NOT_APPLICABLE && r.relationRealized === null && r.execution === null,'source negative transferred');
    }
});
test('caller target effect or realization hints do not override source review',() => {
    const r = api.evaluateSource(input(),{ ...actualContext(),effectType:'anchor-mediation',realizationState:'realized-in-source-context',
        targetResolution:{ actorKey:'surface-branch:3:未' },executionAuthorized:true });
    assert(r.execution.executionState === 'not-realized-generic-relation-effect' && r.execution.effectType === null,'caller granted effect');
});
test('static source coverage runtime knowledge and positive counts remain separate',() => {
    const p = synthesis.contextualForcePartySourceMediationNoncommunication,q = api.buildProfile();
    assert(p.finiteSourceReviewComplete && p.newCompleteSourceCaseCount === 1 && p.reusedCompleteSourceCaseCount === 0
        && p.resolvedRuntimeRelationCount === 1 && p.resolvedRuntimeNonrealizationCount === 1,'review/runtime counts conflated');
    assert(p.positiveEffectCount === 0 && p.newEffectAuthorityCount === 0 && !p.branchNegativeCalibrationEstablished
        && !p.broaderSourceCoverageComplete,'coverage inflated');
    assert(q.finiteSourceReviewComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeRelationCount === 0
        && q.resolvedRuntimeNonrealizationCount === 0,'static review fabricated runtime');
});
test('negative communication creates no numeric global party or strength result',() => {
    const r = evaluate();
    assert(r.membershipMutation === null && r.numericScore === null && r.relativeDominance === null
        && !r.transformedResultMaterializationAuthorized && r.execution.actorGlobalParty === null
        && r.execution.actorGlobalEffectiveness === null && r.execution.numericWeight === null,'failure created global force');
});
test('R23 R22 retain realized-unmapped clause and independent opposition',() => {
    const s = outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchKillerDirectionAudit.result.execution.executionState === 'realized-relation-currently-unmapped'
        && s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','earlier branch outcomes changed');
});
test('R9 and R15 retain independently authorized visible positive effects',() => {
    const r9 = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results
        .find((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation');
    assert(r9.execution.sourceEndpoint.actorKey === 'visible:0:癸' && r9.execution.targetEndpoint.actorKey === 'visible:1:甲','R9 scope changed');
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
});
test('R20 R21 retain unmapped failed nonactionable and ambiguous paths',() => {
    assert(outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization.realizedUnmappedRuntimePathCount === 2,'R20 licensed');
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1 && r.nonActionableRuntimeConfigurationCount === 1,'R21 state changed');
    assert(outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast.unresolvedRuntimeTargetCount === 1,'ambiguous target selected');
});
test('R16 R17 R18 result actor and blade targets remain closed',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 changed');
    assert(s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.bladeCandidates.length === 2
        && s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.targetIdentity.actorKey === null,'R17 selected target');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && !g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length,'result materialized');
});
test('finite source dependency leaves R11 four global blockers and final strength open',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === contract.CONTRACT.reviewScope,'dependency widened');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global strength inferred');
});
test('legacy effect vocabulary direct realization patterns and endpoint shapes stay unchanged',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(c.CONTRACT.currentEndpointShapes.length === 3 && c.ACTOR_TO_ACTOR_MOTIFS.length === 3
        && g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3,'generic vocabulary widened');
    assert(!g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'direct pattern added');
});
test('canonical key order frozen nested outputs and caller immutability',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.excludedContext.branchMaoCandidateKeys) && Object.isFrozen(r.executionInput.realizationProvenance)
        && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance),'output mutable');
});
test('integration is inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceMediationNoncommunication,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Mediation Noncommunication tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
