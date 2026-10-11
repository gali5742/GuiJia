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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBranchRestraintNonrealizationProfile;
const contract = g.baziContextualForcePartySourceBranchRestraintNonrealizationContract;
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
const evaluate = () => api.evaluateSource(input(),actualContext());
const COMPARISON = '戊辰|乙卯|辛丑|丁酉',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });

test('R26 reuses the R24 primary case without duplicating chart or changing old provenance',() => {
    assert(contract.SOURCE_CASE === g.baziContextualForcePartySourceBranchMediationCalibrationContract.SOURCE_CASE
        && contract.SOURCE_CASE.chartKey === CHART && contract.SOURCE_CASE.retrievedOn === '2026-10-11','primary record changed');
    assert(contract.IDENTITY_AUTHORITY.reviewedOn === '2026-10-12' && api.validateSourceInput(input()).valid
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 1 && contract.CONTRACT.newCompleteSourceCaseCount === 0,'review source counts inflated');
});
test('independent reviewed scope binds unique water Zi to fire Wu without claiming literal branch names',() => {
    const a = contract.IDENTITY_AUTHORITY,b = g.baziCore,s = contract.SOURCE_CASE;
    assert(a.sourceActorKey === 'surface-branch:1:子' && a.targetActorKey === 'surface-branch:3:午'
        && a.sourceNamingSpan === '水' && a.targetNamingSpan === '火' && !a.literalBranchNamesInClause,'branch identity changed');
    assert(a.reviewedScopeBasis.includes('reviewed inference') && a.scopeSpan === '天干地支皆杀生印'
        && s.zhis.filter((z) => b.getWuXing(z) === '水').join() === '子'
        && s.zhis.filter((z) => b.getWuXing(z) === '火').join() === '午','scope inference unacknowledged');
});
test('actual normalized contract and R3 consume one whole fire branch target',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.normalizedInput.validation.valid
        && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(r.normalizedInput).valid,'normalized validator bypassed');
    assert(JSON.stringify(r.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput)),'R3 fabricated');
    const t = r.targetResolution.unitResolutions[0];
    assert(t.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && t.targetReference.actorKey === 'surface-branch:3:午'
        && t.targetReference.scope === 'surface-branch' && r.normalizedInput.relationUnits.length === 1,'wrong normalized target');
});
test('actual R4 consumes independently reviewed branch restraint nonrealization',() => {
    const r = evaluate();
    assert(r.relationIdentityResolved && r.relationRealizationResolved && r.relationRealized === false && r.sourceContextResolved,'negative source knowledge lost');
    assert(JSON.stringify(r.execution) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'R4 fabricated');
    assert(r.execution.executionState === 'not-realized-generic-relation-effect' && r.execution.realizationState === 'not-realized-in-source-context'
        && r.execution.relationIdentity.functionType === 'restraint' && r.execution.decisionRuleId === 'GREE-R04-NOT-REALIZED','wrong realization semantics');
    assert(r.execution.sourceEndpoint.actorKey === 'surface-branch:1:子' && r.execution.targetEndpoint.actorKey === 'surface-branch:3:午'
        && r.execution.effectType === null && r.execution.reverseEffect === null && !r.executionAuthorized,'failure reversed or licensed');
});
test('wood presence is separately validated context rather than a third endpoint or new group',() => {
    const r = evaluate(),c = r.contextReview;
    assert(c.contextActorKey === 'surface-branch:2:卯' && c.contextElement === '木' && c.actualContextActorRequired
        && r.executionInput.contextProvenance.id === 'CF-SBRN-CONTEXT-01','wood context lost');
    assert(!c.contextIsRelationEndpoint && !c.contextIsMaterializedActor && !c.groupOrCompoundEdgeAuthorized
        && r.execution.identityShape === 'actor-to-actor' && r.execution.sourceEndpoint.cardinality === 1
        && r.execution.targetEndpoint.cardinality === 1 && !r.memberEdges.length,'context became endpoint/group');
});
test('negative restraint does not negate the structural Zi Wu clash or map its benefit',() => {
    const r = evaluate(),x = r.excludedContext,b = g.baziCore;
    assert(b.calculateInternalChartRelations(contract.SOURCE_CASE.gans,contract.SOURCE_CASE.zhis)
        .some((e) => e.type === 'chong' && e.branches.join() === '子,午'),'structural clash missing');
    assert(x.clashSpan === '四冲反为四助' && !x.clashNonrealizationInferred && !x.clashBenefitMappedToPerPair
        && !x.allRelationsAbsentFromNonrealization,'restraint negated clash or licensed help');
    assert(r.execution.relationIdentity.functionType !== 'source-asserted-branch-clash' && r.normalizedInput.relationUnits.length === 1,'clash folded into restraint');
});
test('whole Wu branch retains mixed roles and cannot become hidden Ding or the visible day master',() => {
    const a = contract.IDENTITY_AUTHORITY,b = g.baziCore,r = evaluate();
    assert(b.cangGanMap['午'].map(([gan]) => b.shiShenMap['丁'][gan]).join() === '比肩,食神','mixed-role premise missing');
    assert(a.sourceWholeBranchTenGod === null && a.targetWholeBranchTenGod === null && !a.hiddenRoleProjectionAuthorized
        && !a.branchExpandsToHiddenActors && !a.visibleEndpointSubstitutionAuthorized,'role or hidden projection');
    assert(r.execution.targetEndpoint.actorKey !== 'visible:2:丁' && r.execution.targetEndpoint.actorKey !== 'hidden:3:午:丁:0','day-master substitution');
});
test('nonrealization evidence remains separate from type authorization and unchanged R5 registry',() => {
    const a = evaluate().executionInput.authorization,c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(a.state === 'effect-authorization-not-applicable' && !a.sourceBacked && !a.relationTypes.length && !a.authorityIds.length
        && a.sourceEvidenceIds.includes('CF-SBRN-REALIZATION-01') && a.sourceEvidenceIds.includes('CF-SBRN-CONTEXT-01'),'negative evidence became effect license');
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 6 && !Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === api.RULE_ID),'R5 broadened');
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'borrowed positive family');
    }
});
test('R24 positive branch mediation and R26 negative restraint coexist with distinct targets',() => {
    const p = synthesis.contextualForcePartySourceBranchMediationCalibration,r = evaluate();
    assert(p.resolvedRuntimeEffectCount === 1 && p.result.execution.effectType === 'anchor-mediation'
        && p.result.execution.sourceEndpoint.actorKey === r.execution.sourceEndpoint.actorKey
        && p.result.execution.targetEndpoint.actorKey === 'surface-branch:2:卯','positive mediation changed');
    assert(p.result.execution.relationIdentity.functionType === 'generation' && r.execution.relationIdentity.functionType === 'restraint'
        && !r.contextReview.positivePathNegated && !r.contextReview.exclusiveWinnerOrCausalPriorityDefined
        && !r.excludedContext.controlledCounterfactual,'different paths became a winner or controlled causal pair');
});
test('R24 positive authorization availability is not a prerequisite for R26 negative review',() => {
    const saved = g.baziContextualForcePartySourceBranchMediationCalibrationProfile;
    delete g.baziContextualForcePartySourceBranchMediationCalibrationProfile;
    try { assert(api.evaluateSource(input(),actualContext()).status === STATES.RESOLVED,'R24 effect execution required'); }
    finally { g.baziContextualForcePartySourceBranchMediationCalibrationProfile = saved; }
    assert(!contract.CONTEXT_REVIEW.positiveExecutionRequired && !contract.CONTEXT_REVIEW.positiveEffectAuthorityInherited,'positive license prerequisite');
});
test('missing Wu closes R26 while R24 stays independently executable',() => {
    const c = copy(actualContext()),keep = (p) => p.actorKey !== 'surface-branch:3:午';
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(keep);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(keep);
    assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing target invented');
    const p = g.baziContextualForcePartySourceBranchMediationCalibrationProfile;
    assert(p.evaluateEffect(p.inputForCase(),c).execution.effectType === 'anchor-mediation','R26 target became R24 prerequisite');
});
test('unused visible hidden and metal-branch actors are not prerequisites',() => {
    const c = copy(actualContext()),keys = ['surface-branch:1:子','surface-branch:2:卯','surface-branch:3:午'],keep = (p) => keys.includes(p.actorKey);
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(keep);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(keep);
    assert(api.evaluateSource(input(),c).status === STATES.RESOLVED,'unused actors required');
});
test('branch restraint negative calibration does not claim branch mediation failure',() => {
    const p = synthesis.contextualForcePartySourceBranchRestraintNonrealization;
    assert(p.branchRestraintNegativeCalibrationEstablished && !p.branchMediationNegativeCalibrationEstablished
        && !evaluate().excludedContext.mediationNonrealizationEstablished && !contract.CONTRACT.genericBranchNegationMapping,'negative scope broadened');
    const r25 = outputFor('己巳|丁卯|辛卯|乙未').semanticModel.strengthSynthesis.contextualForcePartySourceMediationNoncommunication;
    assert(r25.resolvedRuntimeNonrealizationCount === 1 && r25.result.execution.relationIdentity.functionType === 'source-asserted-killer-seal-communication'
        && !r25.branchNegativeCalibrationEstablished,'visible noncommunication reassigned to branches');
});
for (const [name,change] of [
    ['source wording',(i) => { i.sourceCase.sourceText = i.sourceCase.sourceText.replace('不克火','克火'); }],
    ['source branch scope',(i) => { i.sourceCase.sourceText = i.sourceCase.sourceText.replace('天干地支','天干'); }],
    ['chart',(i) => { i.sourceCase.chartKey = COMPARISON; }],
    ['day',(i) => { i.sourceCase.gans[2] = '丙'; }],
    ['extra fire branch',(i) => { i.sourceCase.zhis[0] = '巳'; }],
    ['source evidence',(i) => { i.sourceCase.sourceEvidenceIds = []; }],
    ['annotation target',(i) => { i.annotation.relationUnits[0].target.span = '木'; }],
    ['visible source',(i) => { i.identityAuthority.sourceActorKey = 'visible:0:癸'; }],
    ['hidden source',(i) => { i.identityAuthority.sourceActorKey = 'hidden:1:子:癸:0'; }],
    ['visible day-master target',(i) => { i.identityAuthority.targetActorKey = 'visible:2:丁'; }],
    ['hidden fire target',(i) => { i.identityAuthority.targetActorKey = 'hidden:3:午:丁:0'; }],
    ['reverse pair',(i) => { i.identityAuthority.sourceActorKey = 'surface-branch:3:午'; }],
    ['missing identity',(i) => { delete i.identityAuthority; }],
    ['missing realization',(i) => { delete i.realizationAuthority; }],
    ['missing wood context',(i) => { delete i.contextReview; }],
    ['missing excluded context',(i) => { delete i.excludedContext; }],
    ['wood context endpoint',(i) => { i.contextReview.contextIsRelationEndpoint = true; }],
    ['hidden wood context',(i) => { i.contextReview.contextActorKey = 'hidden:2:卯:乙:0'; }],
    ['positive realization',(i) => { i.realizationAuthority.state = 'realized-in-source-context'; }],
    ['clash negative',(i) => { i.realizationAuthority.functionType = 'source-asserted-branch-clash'; }],
    ['generation negative',(i) => { i.realizationAuthority.functionType = 'generation'; }],
    ['clash denial',(i) => { i.excludedContext.clashNonrealizationInferred = true; }],
    ['mediation denial',(i) => { i.excludedContext.mediationNonrealizationEstablished = true; }],
    ['positive authority',(i) => { i.excludedContext.positiveEffectAuthority = 'CF-SBMC-EFFECT-01'; }],
    ['causal winner',(i) => { i.contextReview.exclusiveWinnerOrCausalPriorityDefined = true; }],
    ['transformed actor',(i) => { i.excludedContext.transformationResultMaterializationAuthorized = true; }],
    ['caller valid flag',(i) => { i.valid = true; }],
    ['caller execution',(i) => { i.execution = evaluate().execution; }]
]) test(`independent source review refuses ${name}`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && r.execution === null && !r.relationRealizationResolved && !r.sourceContextResolved,'mutated review accepted');
});
test('unknown malformed and incomplete inputs fail closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid input accepted');
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,targetResolution:evaluate().targetResolution }]) {
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'incomplete context accepted');
    }
});
for (const actorKey of ['surface-branch:1:子','surface-branch:3:午','surface-branch:2:卯']) {
    test(`missing or duplicate actual actor ${actorKey} blocks negative realization`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            const r = api.evaluateSource(input(),c);
            assert(r.status === STATES.UNRESOLVED && r.relationRealized === null && r.execution === null,'missing actor became negative assertion');
        }
    });
    test(`wrong or missing actual evidence for ${actorKey} blocks negative realization`,() => {
        for (const [field,value] of [['sourceScope','hidden-stem'],['pillarIndex',0],['position','year'],['zhi','申'],['wuxing','金']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((r) => r.actorKey === actorKey)[field] = value;
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'wrong evidence accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((r) => r.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing evidence accepted');
    });
}
test('malformed and sparse inventory cannot supply branch or context identity',() => {
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],[undefined],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'bad inventory accepted');
    }
});
test('negative assertion does not transfer to other classical or synthetic charts',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,POSITIVE,NEIGHBOR,'己巳|丁卯|辛卯|乙未','壬午|己酉|甲申|甲子',WEALTH_FIRST]) {
        const r = api.evaluateSource(input(),contextFor(chartKey));
        assert(r.status === STATES.NOT_APPLICABLE && r.relationRealized === null && r.execution === null,'negative transferred');
    }
});
test('caller positive type realization target or winner hints cannot override reviewed negative',() => {
    const r = api.evaluateSource(input(),{ ...actualContext(),effectType:'anchor-opposition',realizationState:'realized-in-source-context',
        targetResolution:{ actorKey:'visible:2:丁' },winner:'mediation',executionAuthorized:true });
    assert(r.execution.executionState === 'not-realized-generic-relation-effect' && r.execution.effectType === null,'caller supplied authority');
});
test('finite source review runtime negative knowledge and effect counts stay separate',() => {
    const p = synthesis.contextualForcePartySourceBranchRestraintNonrealization,q = api.buildProfile();
    assert(p.finiteSourceReviewComplete && p.reusedCompleteSourceCaseCount === 1 && p.newCompleteSourceCaseCount === 0
        && p.resolvedRuntimeRelationCount === 1 && p.resolvedRuntimeNonrealizationCount === 1,'counts conflated');
    assert(p.positiveEffectCount === 0 && p.newEffectAuthorityCount === 0 && !p.broaderSourceCoverageComplete,'finite coverage became global');
    assert(q.finiteSourceReviewComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeRelationCount === 0
        && q.resolvedRuntimeNonrealizationCount === 0,'static review fabricated runtime');
});
test('negative restraint creates no global strength party force or numeric result',() => {
    const r = evaluate();
    assert(r.membershipMutation === null && r.numericScore === null && r.relativeDominance === null && !r.relationEffects.length
        && !r.transformedResultMaterializationAuthorized && r.execution.actorGlobalParty === null
        && r.execution.actorGlobalEffectiveness === null && r.execution.numericWeight === null,'global force invented');
});
test('R23 R22 preserve realized-unmapped direction and independent opposition',() => {
    const s = outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchKillerDirectionAudit.result.execution.executionState === 'realized-relation-currently-unmapped'
        && s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','prior branch outcomes changed');
});
test('R9 R15 and hidden CASE06 retain prior identity and positive execution',() => {
    const r9 = synthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.find((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation');
    assert(r9.execution.sourceEndpoint.actorKey === 'visible:0:癸' && r9.execution.targetEndpoint.actorKey === 'visible:1:甲','R9 visible scope changed');
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 changed');
});
test('R20 R21 retain unmapped failed nonactionable and ambiguous branch paths',() => {
    assert(outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization.realizedUnmappedRuntimePathCount === 2,'R20 licensed');
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1 && r.nonActionableRuntimeConfigurationCount === 1,'R21 state changed');
    assert(outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast.unresolvedRuntimeTargetCount === 1,'two Wu selected');
});
test('R16 R17 R18 retain negative identity and materialization boundaries',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 changed');
    assert(s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.bladeCandidates.length === 2
        && s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.targetIdentity.actorKey === null,'R17 selected target');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && !g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length,'result materialized');
});
test('finite source dependency leaves R11 four global blockers and final strength unresolved',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === contract.CONTRACT.reviewScope,'dependency widened');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final strength invented');
});
test('legacy motifs endpoint shapes and direct source realization patterns are unchanged',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(c.CONTRACT.currentEndpointShapes.length === 3 && c.ACTOR_TO_ACTOR_MOTIFS.length === 3
        && g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3,'generic vocabulary widened');
    assert(g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.filter((p) => p.chartKey === CHART).length === 1,'direct pattern added');
});
test('key order is irrelevant nested outputs are frozen and callers are unchanged',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.contextReview) && Object.isFrozen(r.executionInput.contextProvenance)
        && Object.isFrozen(r.excludedContext.otherSourceSpans) && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance),'output mutable');
});
test('integration is inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceBranchRestraintNonrealization,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Branch Restraint Nonrealization tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
