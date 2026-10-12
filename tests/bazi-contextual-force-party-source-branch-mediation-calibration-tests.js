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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBranchMediationCalibrationProfile;
const contract = g.baziContextualForcePartySourceBranchMediationCalibrationContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '癸酉|甲子|丁卯|丙午',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const R23_CHART = '壬午|己酉|甲申|甲子',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });
test('primary scope review reuses R9 chart and preserves exact source wording',() => {
    const s = contract.SOURCE_CASE;
    assert(s.chartKey === CHART && s.existingPrimaryCaseId === 'CF-VMEC-MED-CASE-06'
        && s.existingVisibleRealizationPatternId === 'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001','provenance link wrong');
    assert(s.retrievedOn === '2026-10-11' && s.revisionId === null && s.sourceUrl.includes('wikisource.org')
        && s.sourceText.includes('天干地支皆杀生印') && s.sourceText.includes('水见木不克火而生木')
        && s.sourceText.includes('金见水克木而生水') && !s.sourceText.includes('日主弱中变旺'),'natal text rewritten or widened');
    assert(s.provenanceReuseOnly && !s.visibleAuthorizationInherited && api.validateSourceInput(input()).valid,'visible authority inherited');
});
test('identity scope is explicitly reviewed rather than literal branch names or generic role selection',() => {
    const a = contract.IDENTITY_AUTHORITY;
    assert(!a.literalBranchNamesInClause && a.explicitBranchScopeSpan === '地支皆杀生印'
        && a.sourceActorKey === 'surface-branch:1:子' && a.targetActorKey === 'surface-branch:2:卯','scope/name inference mislabeled');
    assert(a.sourceRoleClass === '七杀' && a.targetRoleClass === '偏印'
        && !a.genericWholeBranchTenGodProjection && a.roleReviewScope === 'exact-source-branch-scope-and-complete-chart-only','role review generalized');
});
test('unique branch source and target roles are verified against complete Ding chart',() => {
    const b = g.baziCore,s = contract.SOURCE_CASE;
    assert(s.zhis.filter((zhi) => b.getWuXing(zhi) === '水').join() === '子'
        && s.zhis.filter((zhi) => b.getWuXing(zhi) === '木').join() === '卯','unique scope premise false');
    assert(b.cangGanMap['子'].length === 1 && b.cangGanMap['卯'].length === 1
        && b.shiShenMap['丁']['癸'] === '七杀' && b.shiShenMap['丁']['乙'] === '偏印','branch roles wrong');
});
test('independent identity realization and effect licenses all survive normalization',() => {
    const r = evaluate().validation.record,n = evaluate().normalizedAuthorization;
    assert(r.identityAuthorityId === 'CF-SBMC-IDENTITY-01' && r.realizationAuthorityId === 'CF-SBMC-REALIZATION-01'
        && r.effectAuthorityId === 'CF-SBMC-EFFECT-01' && r.sourceRegistryEvidenceIds.length === 5,'independent source authority lost');
    assert(n.authorization.authorityIds.join() === 'CF-SBMC-EFFECT-01' && n.authorization.sourceEvidenceIds.join() === r.sourceRegistryEvidenceIds.join()
        && !n.authorization.sourceEvidenceIds.some((id) => id.startsWith('CF-PAE-')),'visible motif evidence borrowed');
    assert(n.provenance.sourceRuleId === api.RULE_ID && n.provenance.sourceContractId === api.CONTRACT.id
        && n.provenance.identityAuthorityId === r.identityAuthorityId && n.provenance.realizationAuthorityId === r.realizationAuthorityId
        && n.provenance.sourceProvenance.existingPrimaryCaseId === contract.SOURCE_CASE.existingPrimaryCaseId,'source provenance lost');
});
test('actual normalization validator and R3 resolve exact day Mao branch',() => {
    const i = evaluate().validation.identityResult,n = i.normalizedInput;
    assert(n.validation.valid && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(n).valid,'normalization bypassed');
    assert(JSON.stringify(i.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(n)),'R3 fabricated');
    const u = i.targetResolution.unitResolutions[0];
    assert(u.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && u.targetReference.actorKey === 'surface-branch:2:卯'
        && u.targetReference.scope === 'surface-branch' && n.relationUnits.length === 1,'branch target wrong');
});
test('actual registered R5 and R4 execute only branch killer to seal mediation',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.relationRealizationResolved && r.effectAuthorizationResolved && r.executionAuthorized,'positive chain failed');
    assert(JSON.stringify(r.normalizedAuthorization) === JSON.stringify(normalizer.normalizeExactBranchMediationPair(input(),actualContext()))
        && JSON.stringify(r.executionInput) === JSON.stringify(normalizer.toExecutionInput(r.normalizedAuthorization))
        && JSON.stringify(r.execution) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'consumer result fabricated');
    assert(r.execution.effectType === 'anchor-mediation' && r.execution.executionState === 'realized-generic-relation-effect'
        && r.execution.relationIdentity.functionType === 'generation' && r.relationEffects.length === 1,'effect wrong');
    assert(r.execution.sourceEndpoint.actorKey === 'surface-branch:1:子' && r.execution.targetEndpoint.actorKey === 'surface-branch:2:卯'
        && r.execution.sourceEndpoint.scope === 'surface-branch' && r.execution.targetEndpoint.scope === 'surface-branch','direction changed');
});
test('visible R9 and branch R24 effects remain separately authorized and scoped',() => {
    const v = synthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.find((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation');
    const r = evaluate();
    assert(v.execution.sourceEndpoint.actorKey === 'visible:0:癸' && v.execution.targetEndpoint.actorKey === 'visible:1:甲','R9 wrong');
    assert(r.execution.targetEndpoint.actorKey !== v.execution.targetEndpoint.actorKey
        && r.normalizedAuthorization.sourceFamily === 'actor-to-actor-exact-source-branch-mediation'
        && !contract.EFFECT_AUTHORITY.visibleAuthorityInherited,'R9 substituted');
});
test('hidden Gui Yi and visible Jia never replace the reviewed branch endpoints',() => {
    for (const key of ['hidden:1:子:癸:0','hidden:2:卯:乙:0','visible:1:甲']) {
        assert(actualContext().inventory.actorProfiles.some((p) => p.actorKey === key),'refusal premise missing');
    }
    assert(evaluate().relationEffects.every((r) => r.sourceEndpoint.actorKey.startsWith('surface-branch:')
        && r.targetEndpoint.actorKey.startsWith('surface-branch:')) && !contract.IDENTITY_AUTHORITY.branchExpandsToHiddenActors,'substituted or expanded');
});
test('branch validation is independent of hidden actors and the R9 visible endpoints',() => {
    const c = copy(actualContext());
    const retained = (p) => !p.actorKey.startsWith('hidden:') && !['visible:0:癸','visible:1:甲'].includes(p.actorKey);
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(retained);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(retained);
    assert(api.evaluateEffect(input(),c).executionAuthorized,'visible R9 execution became prerequisite');
});
test('seal to killer reversal composition and other source clauses remain unlicensed',() => {
    const r = evaluate(),x = r.excludedContext;
    assert(!contract.EFFECT_AUTHORITY.reverseSealToKillerEdgeAuthorized && !contract.EFFECT_AUTHORITY.otherClauseEffectsAuthorized
        && !x.compositionAuthorized && !x.memberEffects.length && x.sourceSpans.includes('四冲反为四助'),'other relations licensed');
    assert(r.validation.identityResult.normalizedInput.relationUnits.length === 1 && r.relationEffects.length === 1
        && r.execution.sourceEndpoint.actorKey === contract.IDENTITY_AUTHORITY.sourceActorKey,'reverse or compound execution');
});
test('mediation does not create party switch target removal ineffectiveness or final strength',() => {
    const r = evaluate();
    assert(!contract.EFFECT_AUTHORITY.sourceKillerPartySwitchAuthorized && !contract.EFFECT_AUTHORITY.daymasterBenefitOrStrengthAuthorized
        && !r.targetRemovedFromInventory && r.targetGenericIneffectiveState === null && r.membershipMutation === null
        && !r.memberEdges.length && r.numericScore === null && r.relativeDominance === null && r.runtimeWinnerPathId === null,'effect inflated');
    assert(r.execution.actorGlobalParty === null && r.execution.actorGlobalEffectiveness === null && r.execution.numericWeight === null,'global actor property created');
});
for (const [name,change] of [
    ['source wording',(i) => { i.sourceCase.sourceText = '地支子水生卯木'; }],
    ['complete chart',(i) => { i.sourceCase.chartKey = R23_CHART; }],
    ['same shape altered chart',(i) => { i.sourceCase.zhis[3] = '未'; }],
    ['day',(i) => { i.sourceCase.gans[2] = '丙'; }],
    ['source evidence',(i) => { i.sourceCase.sourceEvidenceIds = []; }],
    ['visible authority inheritance',(i) => { i.sourceCase.visibleAuthorizationInherited = true; }],
    ['literal branch names claim',(i) => { i.identityAuthority.literalBranchNamesInClause = true; }],
    ['hidden source',(i) => { i.identityAuthority.sourceActorKey = 'hidden:1:子:癸:0'; }],
    ['hidden target',(i) => { i.identityAuthority.targetActorKey = 'hidden:2:卯:乙:0'; }],
    ['visible target',(i) => { i.identityAuthority.targetActorKey = 'visible:1:甲'; }],
    ['wrong seal role',(i) => { i.identityAuthority.targetRoleClass = '正印'; }],
    ['branch group',(i) => { i.identityAuthority.targetCardinality = 2; }],
    ['no identity review',(i) => { delete i.identityAuthority; }],
    ['no realization review',(i) => { delete i.realizationAuthority; }],
    ['no effect review',(i) => { delete i.effectAuthority; }],
    ['failed realization',(i) => { i.realizationAuthority.realizationState = 'not-realized-in-source-context'; }],
    ['generic scope split',(i) => { i.realizationAuthority.genericScopeSplitterAuthorized = true; }],
    ['unreviewed effect type',(i) => { i.effectAuthority.relationType = 'anchor-augmentation'; }],
    ['borrowed visible authority',(i) => { i.effectAuthority.id = 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001'; }],
    ['source party switch',(i) => { i.effectAuthority.sourceKillerPartySwitchAuthorized = true; }],
    ['R23 license transfer',(i) => { i.excludedContext.priorR23EffectAuthorityTransferred = true; }],
    ['caller valid flag',(i) => { i.valid = true; }]
]) test(`canonical source and R5 reject ${name}`,() => {
    const i = copy(input());change(i);
    assert(api.evaluateEffect(i,actualContext()).status === STATES.INVALID
        && normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(i,actualContext())) === null,'mutated authority accepted');
});
test('invalid inputs and incomplete contexts cannot use precomputed results',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateEffect(i,actualContext()).status === STATES.INVALID,'invalid source accepted');
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,valid:true,targetResolution:evaluate().validation.identityResult.targetResolution }]) {
        assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'incomplete context accepted');
    }
});
for (const actorKey of ['surface-branch:1:子','surface-branch:2:卯']) {
    test(`missing or duplicated ${actorKey} blocks normalization and execution`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED
                && normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(input(),c)) === null,'missing actor reconstructed');
        }
    });
    test(`actual ${actorKey} evidence must match scope position branch and element`,() => {
        for (const [field,value] of [['sourceScope','hidden-branch'],['pillarIndex',0],['position','year'],['zhi','申'],['wuxing','火']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((p) => p.actorKey === actorKey)[field] = value;
            assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'conflicting inventory accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => p.actorKey !== actorKey);
        assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'missing evidence reconstructed');
    });
}
test('malformed sparse inventory stays unresolved',() => {
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],[undefined],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'malformed inventory accepted');
    }
});
test('authorization cannot transfer even to a nearby chart with the same branch pair',() => {
    for (const chartKey of ['癸酉|甲子|丁卯|丙未',R23_CHART,MONTH,ORIGINAL,POSITIVE,'壬寅|己酉|庚午|丙戌']) {
        assert(api.evaluateEffect(input(),contextFor(chartKey)).status === STATES.NOT_APPLICABLE
            && normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(input(),contextFor(chartKey))) === null,'cross-chart license');
    }
});
test('finite R15 R22 and R24 source validators remain separate',() => {
    const r15 = g.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile,r22 = g.baziContextualForcePartySourceBranchOfficerOppositionProfile;
    for (const [i,c] of [[r15.inputForCase(),contextFor(POSITIVE)],[r22.inputForCase(),contextFor(R23_CHART)]]) {
        assert(normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(i,c)) === null,'other finite source borrowed');
    }
    assert(normalizer.toExecutionInput(normalizer.normalizeExactActorPair(input(),actualContext())) === null
        && normalizer.toExecutionInput(normalizer.normalizeExactBranchPair(input(),actualContext())) === null
        && normalizer.toExecutionInput(normalizer.normalizeActorToActor(evaluate().validation.record)) === null,'R24 borrowed old families');
});
test('R5 requires registered late-bound R24 validator rule contract and implementation',() => {
    const key = 'baziContextualForcePartySourceBranchMediationCalibrationProfile',saved = g[key];
    for (const replacement of [undefined,{ ...saved,RULE_ID:'wrong' },{ ...saved,CONTRACT:{ id:'wrong' } },{ ...saved,validateEffectInput:null }]) {
        try { g[key] = replacement;assert(normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(input(),actualContext())) === null,'validator bypassed'); }
        finally { g[key] = saved; }
    }
});
test('R5 revalidates actual source input and current inventory at call time',() => {
    const key = 'baziContextualForcePartySourceBranchMediationCalibrationProfile',saved = g[key];let calls = 0;
    try {
        g[key] = { ...saved,validateEffectInput:(i,c) => { calls++;return saved.validateEffectInput(i,c); } };
        assert(normalizer.normalizeExactBranchMediationPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED
            && calls === 1,'validator not invoked');
    } finally { g[key] = saved; }
});
test('R23 Zi to Shen remains realized unmapped with no reversed executable generation',() => {
    const s = outputFor(R23_CHART).semanticModel.strengthSynthesis,r = s.contextualForcePartySourceBranchKillerDirectionAudit;
    assert(r.realizedUnmappedRuntimePathCount === 1 && r.positiveEffectCount === 0 && r.reverseExecutableEdgeCount === 0
        && !r.result.directionReview.underlyingGenerationDirection.realizedExecutableEdgeAuthorized,'R23 silently licensed');
    const r23 = g.baziContextualForcePartySourceBranchKillerDirectionAuditProfile;
    assert(normalizer.toExecutionInput(normalizer.normalizeExactBranchMediationPair(r23.inputForCase(),contextFor(R23_CHART))) === null,'R23 inherited R24 family');
    assert(s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','R22 regressed');
});
test('R29 extension retains three legacy motifs and endpoint shapes alongside its fourth type',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 7 && c.CONTRACT.currentEndpointShapes.length === 3
        && c.ACTOR_TO_ACTOR_MOTIFS.length === 3 && c.CONTRACT.allowedRelationTypes.length === 4,'unexpected family shape motif or vocabulary extension');
    assert(typeof normalizer.normalizeRegisteredExactPair === 'undefined'
        && !Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === g.baziContextualForcePartySourceBranchKillerDirectionAuditProfile.RULE_ID),'generic family selector or R23 authority added');
});
test('static review coverage reused-source count and runtime effect count remain distinct',() => {
    const p = synthesis.contextualForcePartySourceBranchMediationCalibration,q = api.buildProfile();
    assert(p.finiteSourceEffectCoverageComplete && p.sourceCaseCount === 1 && p.reusedCompleteSourceCaseCount === 1 && p.newCompleteSourceCaseCount === 0
        && p.newEffectAuthorityCount === 1 && p.resolvedRuntimeEffectCount === 1,'source count or effect count inflated');
    assert(q.finiteSourceEffectCoverageComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeEffectCount === 0
        && !p.visibleAuthorityInherited && !p.genericBranchMediationMappingDefined && !p.broaderSourceCoverageComplete,'static or generic success fabricated');
});
test('R20 and R21 preserve prior realized-unmapped failed configuration and ambiguity boundaries',() => {
    const m = outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization;
    assert(m.realizedUnmappedRuntimePathCount === 2 && m.result.jointOutcomeReview.jointEffectAuthority === null,'R20 licensed');
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1 && r.nonActionableRuntimeConfigurationCount === 1,'R21 changed');
    assert(outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast.unresolvedRuntimeTargetCount === 1,'control resolved');
});
test('R15 R16 R17 R18 and CASE06 preserve previous semantics',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 changed');
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 changed');
    assert(s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.targetIdentity.actorKey === null
        && s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.bladeCandidates.length === 2,'R17 target chosen');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 materialized');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 changed');
});
test('legacy source patterns and known motifs are not expanded to branch scope',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3,'motifs expanded');
    const patterns = g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.filter((p) => p.chartKey === CHART);
    assert(patterns.length === 1 && patterns[0].id === 'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001'
        && patterns[0].sourceActorKey === 'visible:0:癸' && patterns[0].targetActorKey === 'visible:1:甲','direct registry expanded');
});
test('narrow source dependency resolves while R11 B02-B05 and final assessment stay open',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === api.CONTRACT.reviewScope,'dependency inflated');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final strength fabricated');
});
test('input order immaterial results deeply frozen and callers unmodified',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateEffect(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.normalizedAuthorization.provenance.sourceProvenance) && Object.isFrozen(r.execution.sourceEndpoint)
        && Object.isFrozen(r.excludedContext.sourceSpans),'result mutable');
});
test('integration inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceBranchMediationCalibration,base = {};
    assert(ext.extendSynthesis({},base) === base,'missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate integration');
});
console.log(`\nSource Branch Mediation Calibration tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
