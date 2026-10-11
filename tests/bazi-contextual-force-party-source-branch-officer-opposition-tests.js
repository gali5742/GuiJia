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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBranchOfficerOppositionProfile;
const contract = g.baziContextualForcePartySourceBranchOfficerOppositionContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '壬午|己酉|甲申|甲子',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const evaluate = () => api.evaluateEffect(input(),actualContext());
const COMPARISON = '壬辰|己酉|甲申|甲子',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });
test('exact primary natal case preserves complete chart and review provenance',() => {
    const s = contract.SOURCE_CASE;
    assert(api.validateSourceInput(input()).valid && s.chartKey === CHART && s.gans.join('') === '壬己甲甲' && s.zhis.join('') === '午酉申子','chart mismatch');
    assert(s.sourceUrl.includes('wikisource.org') && s.retrievedOn === '2026-10-11' && s.revisionId === null
        && s.sourceText.includes('喜其午火紧制酉金') && !s.sourceText.includes('甲第'),'natal provenance lost');
});
test('identity realization and effect are separately registered authorities',() => {
    const r = evaluate().validation.record;
    assert(r.identityAuthorityId === 'CF-SBOO-IDENTITY-01' && r.realizationAuthorityId === 'CF-SBOO-REALIZATION-01'
        && r.effectAuthorityId === 'CF-SBOO-EFFECT-01' && new Set(r.sourceRegistryEvidenceIds).size === 5,'independent provenance lost');
    assert(contract.EFFECT_AUTHORITY.reviewedEffectInference && contract.EFFECT_AUTHORITY.outcomeSpan === '去官'
        && contract.EFFECT_AUTHORITY.attributionBasis.includes('酉') && !contract.REALIZATION_AUTHORITY.proximityIsGenericRealizationRule,'authority from generic rule');
});
test('actual target normalizer validator and R3 resolve the named You branch',() => {
    const r = evaluate().validation.identityResult,n = r.normalizedInput;
    assert(n.validation.valid && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(n).valid,'target validator bypassed');
    assert(JSON.stringify(r.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(n)),'R3 fabricated');
    const u = r.targetResolution.unitResolutions[0];
    assert(u.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && u.targetReference.actorKey === 'surface-branch:1:酉'
        && u.targetReference.scope === 'surface-branch' && n.relationUnits.length === 1,'target wrong');
});
test('actual R5 and R4 execute only the registered Wu to You opposition',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.relationRealizationResolved && r.effectAuthorizationResolved && r.executionAuthorized,'positive chain failed');
    assert(JSON.stringify(r.normalizedAuthorization) === JSON.stringify(normalizer.normalizeExactBranchPair(input(),actualContext()))
        && JSON.stringify(r.executionInput) === JSON.stringify(normalizer.toExecutionInput(r.normalizedAuthorization))
        && JSON.stringify(r.execution) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'consumer result fabricated');
    assert(r.execution.effectType === 'anchor-opposition' && r.execution.executionState === 'realized-generic-relation-effect'
        && r.execution.relationIdentity.functionType === 'restraint' && r.relationEffects.length === 1,'execution not exact');
});
test('R5 carries branch scopes and all independent source evidence',() => {
    const n = evaluate().normalizedAuthorization,p = n.provenance;
    assert(n.sourceFamily === 'actor-to-actor-exact-source-branch-case' && p.sourceContractId === api.CONTRACT.id && p.sourceRuleId === api.RULE_ID,'wrong source family');
    assert(n.sourceEndpoint.actorKey === 'surface-branch:0:午' && n.targetEndpoint.actorKey === 'surface-branch:1:酉'
        && n.sourceEndpoint.scope === 'surface-branch' && n.targetEndpoint.scope === 'surface-branch'
        && n.sourceEndpoint.cardinality === 1 && n.targetEndpoint.cardinality === 1,'branch identity changed');
    assert(n.authorization.authorityIds.join() === 'CF-SBOO-EFFECT-01' && n.authorization.sourceEvidenceIds.length === 5
        && p.identityAuthorityId === 'CF-SBOO-IDENTITY-01' && p.realizationAuthorityId === 'CF-SBOO-REALIZATION-01'
        && p.sourceProvenance.chartKey === CHART && p.sourceWording === contract.SOURCE_CASE.sourceText,'provenance dropped');
});
test('named whole branches are not replaced by hidden Ding or Xin',() => {
    assert(actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'hidden:0:午:丁:0')
        && actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'hidden:1:酉:辛:0'),'hidden refusal premises missing');
    assert(evaluate().relationEffects.every((r) => r.sourceEndpoint.actorKey.startsWith('surface-branch:')
        && r.targetEndpoint.actorKey.startsWith('surface-branch:')),'hidden actor substitution');
    assert(contract.IDENTITY_AUTHORITY.sourceRoleBasis.includes('丁 and 己') && !contract.IDENTITY_AUTHORITY.branchExpandsToHiddenActors,'whole source given one Ten God');
});
test('missing hidden actors cannot select or remove a named whole branch',() => {
    const c = copy(actualContext());c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => !p.actorKey.startsWith('hidden:'));
    c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => !p.actorKey.startsWith('hidden:'));
    assert(api.evaluateEffect(input(),c).executionAuthorized,'source named branch incorrectly depended on hidden selection');
});
test('deferred Zi transforms Shen does not inherit any effect or relation edge',() => {
    const r = evaluate(),d = r.deferredPath;
    assert(d.sourceSpan === '子水化其申金' && !d.inheritsOppositionAuthority && !d.mediationAuthorized
        && !d.killerAugmentationFromLeavingAuthorized && !d.memberEffects.length,'other clause inherited authority');
    assert(r.validation.identityResult.normalizedInput.relationUnits.length === 1 && r.relationEffects.length === 1
        && r.relationEffects[0].targetEndpoint.actorKey !== 'surface-branch:2:申','leave killer turned augmentation');
});
test('qualitative opposition does not remove the target or assign generic ineffectiveness or strength',() => {
    const r = evaluate();
    assert(!r.targetRemovedFromInventory && r.targetGenericIneffectiveState === null && r.membershipMutation === null
        && !r.memberEdges.length && r.numericScore === null && r.relativeDominance === null && r.runtimeWinnerPathId === null,'opposition inflated');
    assert(actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'surface-branch:1:酉')
        && !contract.EFFECT_AUTHORITY.finalStrengthMapping && !contract.EFFECT_AUTHORITY.targetGenericIneffectiveStateAuthorized,'inventory or strength changed');
});
test('neighbor comparison is context only without positive or negative authority',() => {
    const c = contract.COMPARISON_CASE;
    assert(c.chartKey === COMPARISON && c.sourceText.includes('合者有去有不去') && !c.inheritsPositiveAuthority
        && !c.negativeRealizationAuthorized && !c.effectTypeAuthorized,'comparison upgraded');
    assert(!api.validateSourceInput(c).valid && !api.validateSourceInput(api.inputForCase(c.id)).valid,'comparison exposed as registered input');
    const p = outputFor(COMPARISON).semanticModel.strengthSynthesis.contextualForcePartySourceBranchOfficerOpposition;
    assert(p.comparisonCurrentChart && p.result.status === STATES.NOT_APPLICABLE && p.resolvedRuntimeEffectCount === 0,'no Wu inferred failure');
});
for (const [name,change] of [
    ['source text',(i) => { i.sourceCase.sourceText = '午火制官'; }],
    ['complete chart',(i) => { i.sourceCase.chartKey = COMPARISON; }],
    ['day identity',(i) => { i.sourceCase.gans[2] = '乙'; }],
    ['source evidence',(i) => { i.sourceCase.sourceEvidenceIds = []; }],
    ['annotation target',(i) => { i.annotation.relationUnits[0].target.span = '申金'; }],
    ['annotation outcome',(i) => { i.annotation.relationUnits[0].outcomeSpans = []; }],
    ['source hidden substitution',(i) => { i.identityAuthority.sourceActorKey = 'hidden:0:午:丁:0'; }],
    ['target hidden substitution',(i) => { i.identityAuthority.targetActorKey = 'hidden:1:酉:辛:0'; }],
    ['source position',(i) => { i.identityAuthority.sourceActorKey = 'surface-branch:3:午'; }],
    ['group expansion',(i) => { i.identityAuthority.targetCardinality = 2; }],
    ['role shortcut',(i) => { i.identityAuthority.targetRoleClass = '七杀'; }],
    ['identity license',(i) => { delete i.identityAuthority; }],
    ['realization license',(i) => { delete i.realizationAuthority; }],
    ['effect license',(i) => { delete i.effectAuthority; }],
    ['failed realization',(i) => { i.realizationAuthority.realizationState = 'not-realized-in-source-context'; }],
    ['unreviewed effect type',(i) => { i.effectAuthority.relationType = 'anchor-augmentation'; }],
    ['counterfeit effect id',(i) => { i.effectAuthority.id = 'caller-approved'; }],
    ['mediated clause transfer',(i) => { i.deferredPath.mediationAuthorized = true; }],
    ['precomputed valid flag',(i) => { i.valid = true; }],
    ['caller outcome',(i) => { i.execution = evaluate().execution; }]
]) test(`canonical source review rejects ${name} in both upstream and R5`,() => {
    const i = copy(input());change(i);
    const r = api.evaluateEffect(i,actualContext()),n = normalizer.normalizeExactBranchPair(i,actualContext());
    assert(r.status === STATES.INVALID && !r.relationEffects.length && n.normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED
        && normalizer.toExecutionInput(n) === null,'mutated input licensed');
});
test('invalid unknown and incomplete inputs fail closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) {
        assert(api.evaluateEffect(i,actualContext()).status === STATES.INVALID && !normalizer.toExecutionInput(normalizer.normalizeExactBranchPair(i,actualContext())),'invalid executed');
    }
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,valid:true,targetResolution:evaluate().validation.identityResult.targetResolution }]) {
        assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'incomplete context executed');
    }
});
for (const actorKey of ['surface-branch:0:午','surface-branch:1:酉']) {
    test(`missing or duplicated actual ${actorKey} blocks authorization`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED && normalizer.toExecutionInput(normalizer.normalizeExactBranchPair(input(),c)) === null,'inventory authority bypassed');
        }
    });
    test(`actual ${actorKey} evidence must match branch scope position and element`,() => {
        for (const [field,value] of [['sourceScope','hidden-branch'],['pillarIndex',3],['position','hour'],['zhi','申'],['wuxing','水']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((p) => p.actorKey === actorKey)[field] = value;
            assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'conflicting branch evidence accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => p.actorKey !== actorKey);
        assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'missing evidence reconstructed');
    });
}
test('malformed sparse inventory refuses before R3 and R5',() => {
    for (const field of ['actorProfiles','evidenceRecords']) {
        for (const bad of [null,{},[null],[undefined],new Array(1)]) {
            const c = copy(actualContext());c.inventory[field] = bad;
            assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'malformed inventory accepted');
        }
    }
});
test('exact branch authority never transfers to other complete source charts',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,POSITIVE,'壬寅|己酉|庚午|丙戌','戊子|戊午|戊戌|戊午','癸酉|甲子|丁卯|丙午']) {
        assert(api.evaluateEffect(input(),contextFor(chartKey)).status === STATES.NOT_APPLICABLE
            && normalizer.toExecutionInput(normalizer.normalizeExactBranchPair(input(),contextFor(chartKey))) === null,'cross-case transfer');
    }
});
test('separate exact R15 and R22 families refuse each others inputs',() => {
    const old = g.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile;
    assert(normalizer.normalizeExactActorPair(old.inputForCase(),contextFor(POSITIVE)).normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED,'R15 regressed');
    assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED
        && normalizer.normalizeExactBranchPair(old.inputForCase(),contextFor(POSITIVE)).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'validator family crossover');
});
test('R5 requires the registered late-bound validator identity and implementation',() => {
    const key = 'baziContextualForcePartySourceBranchOfficerOppositionProfile',saved = g[key];
    for (const replacement of [undefined,{ ...saved,RULE_ID:'wrong' },{ ...saved,CONTRACT:{ id:'wrong' } },{ ...saved,validateEffectInput:null }]) {
        try { g[key] = replacement;assert(normalizer.normalizeExactBranchPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'missing validator bypassed'); }
        finally { g[key] = saved; }
    }
});
test('R5 actually invokes the source validator again with current inventory',() => {
    const key = 'baziContextualForcePartySourceBranchOfficerOppositionProfile',saved = g[key];let calls = 0;
    try {
        g[key] = { ...saved,validateEffectInput:(i,c) => { calls++;return saved.validateEffectInput(i,c); } };
        normalizer.normalizeExactBranchPair(input(),actualContext());assert(calls === 1,'validator not called');
    } finally { g[key] = saved; }
});
test('input order is immaterial and consumers deeply freeze results without mutating callers',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateEffect(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.execution.sourceEndpoint) && Object.isFrozen(r.validation.identityResult.normalizedInput.relationUnits[0])
        && Object.isFrozen(r.normalizedAuthorization.provenance.sourceProvenance),'output mutable');
});
test('finite review coverage and runtime counters are independent',() => {
    const p = synthesis.contextualForcePartySourceBranchOfficerOpposition;
    assert(p.finiteSourceEffectCoverageComplete && p.sourceCaseCount === 1 && p.positiveSourceCaseCount === 1 && p.comparisonCaseCount === 1
        && p.newEffectAuthorityCount === 1 && p.resolvedRuntimeEffectCount === 1,'coverage count inflated');
    const q = api.buildProfile();
    assert(q.finiteSourceEffectCoverageComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeEffectCount === 0
        && !q.broaderSourceCoverageComplete && !q.genericBranchRestraintEffectMappingDefined,'static validation became runtime success');
});
test('R5 retains the registered opposition family and original endpoint shapes and motifs',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.values(c.SOURCE_FAMILY_REGISTRY).filter((f) => f.sourceRuleId === api.RULE_ID).length === 1 && c.CONTRACT.currentEndpointShapes.length === 3
        && c.ACTOR_TO_ACTOR_MOTIFS.length === 3 && typeof normalizer.normalizeRegisteredExactPair === 'undefined','generic adapter or shape expanded');
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => [CHART,COMPARISON].includes(p.chartKey)),'legacy registry expanded');
});
test('R20 still preserves two realized unmapped paths and a joint outcome without licenses',() => {
    const r = outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization;
    assert(r.realizedUnmappedRuntimePathCount === 2 && r.result.jointOutcomeReview.jointEffectAuthority === null
        && !r.result.jointOutcomeReview.perPathEffectAuthorities.length,'R20 silently mapped');
});
test('R21 failed restraint barrier and ambiguous clash remain distinct',() => {
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1
        && r.nonActionableRuntimeConfigurationCount === 1 && r.newEffectAuthorityCount === 0,'R21 barrier licensed');
    const q = outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(q.unresolvedRuntimeTargetCount === 1 && q.positiveEffectCount === 0,'R21 control resolved');
});
test('R16 R17 R18 remain closed for original failed peer and transformation results',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 regressed');
    const r = s.contextualForcePartyTransformedSourceBladeIdentityAudit.result;
    assert(r.bladeCandidates.length === 2 && r.targetIdentity.actorKey === null && r.targetIdentity.cardinality === null,'R17 selected target');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 materialized');
});
test('R15 R9 and CASE06 preserve prior positive results',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    assert(outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
});
test('finite source dependency resolves without resolving R11 B02-B05 or final assessment',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === api.CONTRACT.reviewScope,'dependency broadened');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global sufficiency inflated');
});
test('integration is inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceBranchOfficerOpposition,base = {};
    assert(ext.extendSynthesis({},base) === base,'missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Branch Officer Opposition tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
