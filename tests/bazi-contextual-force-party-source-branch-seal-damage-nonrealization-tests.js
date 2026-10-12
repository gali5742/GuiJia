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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBranchSealDamageNonrealizationProfile;
const contract = g.baziContextualForcePartySourceBranchSealDamageNonrealizationContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '乙亥|辛巳|戊申|甲寅';
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
const COMPARISON = '己巳|丁卯|辛卯|乙未',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });

test('new complete natal source preserves printed timing and ends before middle-life fortune',() => {
    const s = contract.SOURCE_CASE;
    assert(api.validateSourceInput(input()).valid && s.chartKey === CHART && s.gans.join() === '乙,辛,戊,甲'
        && s.zhis.join() === '亥,巳,申,寅' && s.retrievedOn === '2026-10-13' && s.revisionId === null,'primary identity wrong');
    assert(s.sourceText.endsWith('则亥水受制而巳火不伤。') && !s.sourceText.includes('中年运途')
        && !s.sourceText.includes('至子运') && contract.CONTRACT.newCompleteSourceCaseCount === 1
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 0,'fortune or reused chart miscounted');
});
test('explicit Hai and Si naming binds year source and month seal-bearing fire target',() => {
    const a = contract.IDENTITY_AUTHORITY,r = evaluate();
    assert(a.literalBranchNamesInClause && a.sourceActorKey === 'surface-branch:0:亥' && a.targetActorKey === 'surface-branch:1:巳','literal pair wrong');
    assert(r.status === STATES.RESOLVED && r.relationIdentityResolved && r.relationRealizationResolved && r.relationRealized === false,'pair not resolved');
    assert(r.execution.sourceEndpoint.actorKey === a.sourceActorKey && r.execution.targetEndpoint.actorKey === a.targetActorKey,'pair reversed');
});
test('actual normalized contract and R3 resolve one source-scoped whole-branch target',() => {
    const r = evaluate();
    assert(r.normalizedInput.validation.valid && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(r.normalizedInput).valid,'normalizer validator bypassed');
    assert(JSON.stringify(r.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput)),'R3 fabricated');
    const target = r.targetResolution.unitResolutions[0];
    assert(target.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && target.targetReference.actorKey === 'surface-branch:1:巳'
        && r.normalizedInput.relationUnits.length === 1,'extra relation or wrong target');
});
test('actual R4 records not-realized damage without positive negative-as-reverse or typed effect',() => {
    const r = evaluate(),e = r.execution;
    assert(JSON.stringify(e) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'R4 fabricated');
    assert(e.executionState === 'not-realized-generic-relation-effect' && !e.realized && e.effectType === null
        && e.reverseEffect === null && e.relationIdentity.functionType === 'source-asserted-branch-seal-damage','wrong realization/type');
    assert(!r.executionAuthorized && !r.relationEffects.length && !r.reverseEdges.length && !r.memberEdges.length,'extra effect');
    assert(r.executionInput.authorization.state === 'effect-authorization-not-applicable'
        && !r.executionInput.authorization.sourceBacked && !r.executionInput.authorization.authorityIds.length,'negative became type license');
});
test('structural Si Hai clash remains present despite denied seal damage',() => {
    const r = evaluate(),x = r.excludedContext;
    assert(g.baziCore.calculateInternalChartRelations(contract.SOURCE_CASE.gans,contract.SOURCE_CASE.zhis)
        .some((e) => e.type === 'chong' && e.branches.includes('巳') && e.branches.includes('亥')),'structural clash missing');
    assert(x.clashSpan === '巳亥逢冲' && !x.clashNonrealizationInferred && !x.clashEffectTypeAuthorized
        && r.execution.relationIdentity.functionType !== 'source-asserted-branch-clash','clash erased or typed');
});
test('whole seal-bearing fire branch keeps mixed hidden roles and no hidden expansion',() => {
    const a = contract.IDENTITY_AUTHORITY,b = g.baziCore;
    assert(b.cangGanMap['巳'].map(([gan]) => b.shiShenMap['戊'][gan]).join() === '偏印,比肩,食神'
        && b.cangGanMap['亥'].map(([gan]) => b.shiShenMap['戊'][gan]).join() === '偏财,七杀','mixed roles missing');
    assert(a.sourceWholeBranchTenGod === null && a.targetWholeBranchTenGod === null && !a.hiddenRoleProjectionAuthorized
        && !a.branchExpandsToHiddenActors && !evaluate().excludedContext.hiddenMemberNonrealizationDistributed,'pure seal or hidden edge');
});
test('source timing and qi are provenance without calendar calculation or controller binding',() => {
    const c = evaluate().contextReview,x = evaluate().excludedContext;
    assert(c.timingSpan === '立夏后十天' && c.qiSpan === '戊土司令' && c.contextActorKey === null
        && !c.actualCalendarCalculated && !c.monthCommandOverrideAuthorized && !c.automaticTimingRule,'calendar rule inferred');
    assert(!c.dayVisibleWuAutomaticallyBoundToHai && x.sourceControlledSpan === '亥水受制'
        && x.additionalControllerEndpoint === null && !x.reverseDamageAuthorized,'visible controller or reversed edge inferred');
});
test('other printed source claims receive no inferred effect or generic no-damage result',() => {
    const x = evaluate().excludedContext;
    assert(x.otherSourceSpans.includes('天干乙辛去官星之混杀') && x.otherSourceSpans.includes('地支寅申，制杀之肆逞'),'source context lost');
    assert(!x.otherClauseEffectsAuthorized && !x.globalNoDamageOrNoEffectInferred && !x.branchMediationFailureInferred
        && !contract.CONTRACT.hiddenSealDamageNegativeCalibrationEstablished && !contract.CONTRACT.branchMediationNegativeCalibrationEstablished,'source scope distributed');
});
test('R29 earth-recipient positive license cannot normalize the R30 negative fire-recipient review',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 7 && c.CONTRACT.allowedRelationTypes.length === 4
        && !Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === api.RULE_ID),'R30 registered effect family');
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair','normalizeExactRecipientSealDamagePair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'positive license borrowed');
    }
    assert(!evaluate().excludedContext.r29EarthRecipientAuthorityInherited && !evaluate().effectAuthorizationResolved,'type inherited');
});
for (const [name,change] of [
    ['source wording',(i) => { i.sourceCase.sourceText = i.sourceCase.sourceText.replace('巳火不伤','巳火受伤'); }],
    ['fortune',(i) => { i.sourceCase.sourceText += '至子运扶起亥水'; }],
    ['chart',(i) => { i.sourceCase.chartKey = '戊辰|乙卯|辛丑|丁酉'; }],
    ['day master',(i) => { i.sourceCase.gans[2] = '己'; }],
    ['hidden source',(i) => { i.identityAuthority.sourceActorKey = 'hidden:0:亥:壬:0'; }],
    ['hidden seal target',(i) => { i.identityAuthority.targetActorKey = 'hidden:1:巳:丙:0'; }],
    ['visible target',(i) => { i.identityAuthority.targetActorKey = 'visible:2:戊'; }],
    ['reverse source',(i) => { i.identityAuthority.sourceActorKey = 'surface-branch:1:巳'; }],
    ['pure seal',(i) => { i.identityAuthority.targetWholeBranchTenGod = '偏印'; }],
    ['calendar calculated',(i) => { i.contextReview.actualCalendarCalculated = true; }],
    ['month command override',(i) => { i.contextReview.monthCommandOverrideAuthorized = true; }],
    ['day controller',(i) => { i.contextReview.contextActorKey = 'visible:2:戊'; }],
    ['generic timing rule',(i) => { i.contextReview.automaticTimingRule = true; }],
    ['positive damage',(i) => { i.realizationAuthority.state = 'realized-in-source-context'; }],
    ['clash negative',(i) => { i.realizationAuthority.functionType = 'source-asserted-branch-clash'; }],
    ['effect license',(i) => { i.realizationAuthority.effectTypeAuthorized = true; }],
    ['clash denial',(i) => { i.excludedContext.clashNonrealizationInferred = true; }],
    ['hidden distribution',(i) => { i.excludedContext.hiddenMemberNonrealizationDistributed = true; }],
    ['R29 positive license',(i) => { i.excludedContext.positiveEffectAuthority = 'CF-RSDC-EFFECT-01'; }],
    ['reverse damage',(i) => { i.excludedContext.reverseDamageAuthorized = true; }],
    ['negative mediation',(i) => { i.excludedContext.branchMediationFailureInferred = true; }],
    ['missing source context',(i) => { delete i.contextReview; }],
    ['caller valid',(i) => { i.valid = true; }]
]) test(`canonical independent review refuses ${name}`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && r.execution === null && !r.relationEffects.length,'mutated source review accepted');
});
for (const actorKey of ['surface-branch:0:亥','surface-branch:1:巳']) {
    test(`unique actual ${actorKey} profile and evidence are mandatory`,() => {
        for (const mode of ['missing-profile','duplicate-profile','missing-evidence']) {
            const c = copy(actualContext());
            if (mode === 'missing-profile') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            if (mode === 'duplicate-profile') c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            if (mode === 'missing-evidence') c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => p.actorKey !== actorKey);
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing/duplicate identity accepted');
        }
    });
    test(`scope position role or element evidence for ${actorKey} cannot be projected`,() => {
        for (const [field,value] of [['sourceScope','hidden-modifier'],['pillarIndex',3],['position','wrong'],['zhi','卯'],['wuxing','金'],['gan','丙'],['tenGod','偏印']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((p) => p.actorKey === actorKey)[field] = value;
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'projected branch evidence accepted');
        }
    });
}
test('unused visible hidden and remaining branch actors are not timing or identity prerequisites',() => {
    const c = copy(actualContext()),keys = ['surface-branch:0:亥','surface-branch:1:巳'];
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => keys.includes(p.actorKey));
    c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => keys.includes(p.actorKey));
    assert(api.evaluateSource(input(),c).status === STATES.RESOLVED,'extra controller/hidden actor required');
});
test('invalid incomplete and malformed inputs fail closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'unknown source accepted');
    for (const c of [null,{}, { chartKey:CHART },{ chartKey:CHART,inventory:{} }]) assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing context accepted');
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'malformed/sparse inventory accepted');
    }
});
test('caller timing controller target or positive execution hints cannot override source consumers',() => {
    const r = api.evaluateSource(input(),{ ...actualContext(),daysSinceLiXia:0,monthCommand:'壬',controllerActorKey:'visible:2:戊',
        targetResolution:{ valid:true },effectType:'recipient-seal-damage',executionAuthorized:true });
    assert(r.status === STATES.RESOLVED && r.execution.executionState === 'not-realized-generic-relation-effect'
        && r.contextReview.contextActorKey === null && !r.contextReview.actualCalendarCalculated,'caller hint used');
});
test('negative realization cannot transfer across charts or serve as a controlled counterfactual',() => {
    for (const key of ['戊辰|乙卯|辛丑|丁酉','癸亥|甲子|戊戌|癸丑',COMPARISON,MONTH,ORIGINAL,'癸酉|甲子|丁卯|丙午']) {
        const r = api.evaluateSource(input(),contextFor(key));
        assert(r.status === STATES.NOT_APPLICABLE && r.execution === null,'cross-chart negative transferred');
    }
    assert(evaluate().excludedContext.comparisonDisposition.includes('not-controlled-counterfactual'),'causal comparison implied');
});
test('R29 positive damage and R27 R28 prior unmapped snapshots remain independent',() => {
    const s = outputFor('戊辰|乙卯|辛丑|丁酉').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage'
        && s.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectScope.sourceNamedAspect === 'seal-bearing-earth-branch','R29 positive changed');
    assert(s.contextualForcePartySourceSealObstructionContrast.realizedUnmappedRuntimePathCount === 1
        && s.contextualForcePartySourceSealDamageEffectScopeAudit.realizedUnmappedRuntimePathCount === 1,'prior audits overwritten');
});
test('legacy positive opposition mediation and separate negative restraint retain scope',() => {
    assert(outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','R22 changed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartySourceBranchMediationCalibration.result.execution.effectType === 'anchor-mediation'
        && m.contextualForcePartySourceBranchRestraintNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R24/R26 changed');
});
test('finite source review actual negative runtime and global coverage remain distinct',() => {
    const a = synthesis.contextualForcePartySourceBranchSealDamageNonrealization,empty = api.buildProfile();
    assert(a.finiteSourceReviewComplete && a.newCompleteSourceCaseCount === 1 && a.resolvedRuntimeNonrealizationCount === 1
        && a.branchSealDamageNegativeCalibrationEstablished && a.newEffectAuthorityCount === 0 && a.positiveEffectCount === 0,'finite negative coverage wrong');
    assert(empty.finiteSourceReviewComplete && empty.resolvedRuntimeNonrealizationCount === 0 && !a.broaderSourceCoverageComplete,'static/runtime/global conflated');
    assert(!a.hiddenSealDamageNegativeCalibrationEstablished && !a.branchMediationNegativeCalibrationEstablished,'other negative gap closed');
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.kind === 'source-coverage' && d.status === 'resolved' && d.scope === contract.CONTRACT.reviewScope,'dependency widened');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global strength inferred');
});
test('negative damage does not produce numeric membership or global effectiveness output',() => {
    const r = evaluate();
    assert(r.numericScore === null && r.relativeDominance === null && r.membershipMutation === null
        && r.execution.actorGlobalEffectiveness === null && r.execution.numericWeight === null && !r.transformedResultMaterializationAuthorized,'global result manufactured');
});
test('canonical key order deep freezing and caller immutability remain intact',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.executionInput.realizationProvenance.sourceEvidenceIds)
        && Object.isFrozen(r.contextReview) && Object.isFrozen(r.excludedContext.otherSourceSpans),'result mutable');
});
test('integration is inert without upstream and idempotent with complete synthesis',() => {
    const ext = g.baziContextualForcePartySourceBranchSealDamageNonrealization,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','upstream invented');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Branch Seal Damage Nonrealization tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
