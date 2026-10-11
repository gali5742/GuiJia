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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBranchKillerDirectionAuditProfile;
const contract = g.baziContextualForcePartySourceBranchKillerDirectionAuditContract;
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
const evaluate = () => api.evaluateSource(input(),actualContext());
const COMPARISON = '壬辰|己酉|甲申|甲子',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });
test('R23 reuses R22 primary provenance without registering another complete chart',() => {
    const s = contract.SOURCE_CASE;
    assert(s === g.baziContextualForcePartySourceBranchOfficerOppositionContract.SOURCE_CASE && s.chartKey === CHART
        && s.retrievedOn === '2026-10-11' && s.revisionId === null && s.sourceUrl.includes('wikisource.org'),'source duplicated or lost');
    assert(api.validateSourceInput(input()).valid && s.sourceText.includes('子水化其申金') && !s.sourceText.includes('甲第'),'natal scope lost');
    assert(contract.CONTRACT.reusedCompleteSourceCaseCount === 1 && contract.CONTRACT.newCompleteSourceCaseCount === 0,'source count inflated');
});
test('identity and realization authorities independently preserve named Zi to Shen',() => {
    const a = contract.IDENTITY_AUTHORITY,r = contract.REALIZATION_AUTHORITY;
    assert(a.sourceActorKey === 'surface-branch:3:子' && a.targetActorKey === 'surface-branch:2:申'
        && a.endpointScope === 'surface-branch' && a.endpointCardinality === 1,'wrong named branches');
    assert(r.id === 'CF-SBKDA-REALIZATION-01' && r.identityAuthorityId === a.id && r.evidenceSpan === '子水化其申金'
        && r.functionType === 'source-asserted-branch-hua' && r.state === 'realized-in-source-context' && !r.effectTypeAuthorized,'realization conflated with type');
});
test('actual normalized validator and R3 consume one surface branch target',() => {
    const r = evaluate();
    assert(r.normalizedInput.validation.valid
        && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(r.normalizedInput).valid,'validator bypassed');
    assert(JSON.stringify(r.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput)),'R3 fabricated');
    const u = r.targetResolution.unitResolutions[0];
    assert(u.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && u.targetReference.actorKey === 'surface-branch:2:申'
        && u.targetReference.scope === 'surface-branch' && r.normalizedInput.relationUnits.length === 1,'R3 actor wrong');
});
test('actual R4 preserves realized but unmapped instead of no relation or positive effect',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.relationIdentityResolved && r.relationRealizationResolved && r.relationRealized,'reviewed clause lost');
    assert(JSON.stringify(r.execution) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'R4 fabricated');
    assert(r.execution.executionState === 'realized-relation-currently-unmapped' && r.execution.realizationState === 'realized-in-source-context'
        && r.execution.effectType === null && !r.execution.realized && !r.executionAuthorized
        && !r.effectAuthorizationResolved && !r.relationEffects.length,'unknown became none or positive');
});
test('clause direction and structural generation direction remain separate',() => {
    const r = evaluate(),d = r.directionReview;
    assert(d.clauseDirection.fromActorKey === 'surface-branch:3:子' && d.clauseDirection.toActorKey === 'surface-branch:2:申','clause flipped');
    assert(d.underlyingGenerationDirection.fromActorKey === 'surface-branch:2:申'
        && d.underlyingGenerationDirection.toActorKey === 'surface-branch:3:子'
        && d.underlyingGenerationDirection.fromElement === '金' && d.underlyingGenerationDirection.toElement === '水','structural direction lost');
    assert(r.execution.sourceEndpoint.actorKey === d.clauseDirection.fromActorKey && r.execution.targetEndpoint.actorKey === d.clauseDirection.toActorKey
        && r.execution.relationIdentity.functionType === 'source-asserted-branch-hua','generation substituted into runtime');
});
test('structural metal to water context does not create another realized edge',() => {
    const r = evaluate(),d = r.directionReview;
    assert(d.underlyingGenerationDirection.scope === 'structural-element-direction-context-only'
        && !d.underlyingGenerationDirection.realizedExecutableEdgeAuthorized && !d.underlyingGenerationDirection.effectTypeAuthorized
        && !d.reverseGenerationEdgeCreated && !r.reverseEdges.length,'structural reverse executed');
    assert(!Object.hasOwn(r.executionInput,'underlyingGenerationDirection') && r.normalizedInput.relationUnits.length === 1,'second edge injected');
});
test('existing mediation motif retains killer to seal direction and exact previous meaning',() => {
    const m = contract.DIRECTION_REVIEW.existingMotif;
    assert(m === g.baziContextualForcePartyRelationEffectContract.MOTIFS.find((m) => m.id === 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001')
        && m.sourceTenGods.join() === '七杀' && m.targetTenGods.join() === '正印,偏印'
        && m.functionType === 'generation' && m.relationType === 'anchor-mediation','motif changed');
    assert(!contract.DIRECTION_REVIEW.clauseOrderMatchesExistingMotif && contract.DIRECTION_REVIEW.positiveEffectAuthority === null,'inverse licensed');
});
test('Shen mixed hidden roles cannot classify the whole target as a single killer',() => {
    const b = g.baziCore,roles = b.cangGanMap['申'].map(([gan]) => b.shiShenMap['甲'][gan]);
    assert(roles.join() === '七杀,偏印,偏财','mixed role premise missing');
    assert(contract.IDENTITY_AUTHORITY.sourceWholeBranchTenGod === null && contract.IDENTITY_AUTHORITY.targetWholeBranchTenGod === null
        && !contract.IDENTITY_AUTHORITY.hiddenRoleProjectionAuthorized && !contract.DIRECTION_REVIEW.branchRoleProjectionAuthorized,'whole branch got hidden role');
    assert(evaluate().normalizedInput.relationUnits[0].identityProvenance.targetRoleClass === 'source-identified-killer-bearing-branch','contextual role lost');
});
test('named branches cannot become hidden Gui Geng Ren or a hidden-member group',() => {
    assert(actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'hidden:3:子:癸:0')
        && actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'hidden:2:申:庚:0'),'hidden refusal premise missing');
    const r = evaluate();
    assert(r.execution.sourceEndpoint.type === 'actor' && r.execution.targetEndpoint.type === 'actor'
        && r.execution.sourceEndpoint.cardinality === 1 && r.execution.targetEndpoint.cardinality === 1
        && !r.memberEdges.length && !contract.IDENTITY_AUTHORITY.branchExpandsToHiddenActors,'hidden group expanded');
});
test('independent clause validation does not require R22 opposition endpoints or hidden actors',() => {
    const c = copy(actualContext());
    const retained = (p) => !p.actorKey.startsWith('hidden:') && !['surface-branch:0:午','surface-branch:1:酉'].includes(p.actorKey);
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(retained);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(retained);
    assert(g.baziContextualForcePartySourceBranchOfficerOppositionProfile.evaluateEffect(
        g.baziContextualForcePartySourceBranchOfficerOppositionProfile.inputForCase(),c).status !== 'resolved-exact-source-branch-officer-opposition','independence premise missing');
    assert(api.evaluateSource(input(),c).status === STATES.RESOLVED,'R22 outcome needed to authorize R23');
});
test('R4 authorization carries realization evidence but no effect license',() => {
    const i = evaluate().executionInput,a = i.authorization;
    assert(a.state === 'realized-edge-currently-unmapped' && !a.sourceBacked && !a.authorityIds.length && !a.relationTypes.length
        && a.sourceEvidenceIds.includes('CF-SBKDA-REALIZATION-01') && a.sourceEvidenceIds.includes('CF-SBKDA-DIRECTION-01'),'evidence became effect license');
    assert(i.realizationProvenance.identityAuthorityId === 'CF-SBKDA-IDENTITY-01' && i.sourceCaseId === 'CF-SBOO-CASE-01','independent provenance dropped');
});
test('Hua does not produce transformation result materialization membership or strength',() => {
    const r = evaluate();
    assert(!r.transformedResultMaterializationAuthorized && !contract.DIRECTION_REVIEW.transformationResultActorAuthorized
        && r.membershipMutation === null && !r.relationEffects.length && r.numericScore === null && r.relativeDominance === null,'Hua fabricated result or strength');
    assert(r.execution.actorGlobalParty === null && r.execution.actorGlobalEffectiveness === null && r.execution.numericWeight === null,'global actor property created');
});
test('all four direction effect and role blockers remain explicit',() => {
    const r = evaluate();
    assert(r.blockerReasons.length === 4 && r.blockerReasons.includes('no-independent-branch-pair-effect-type-authority')
        && r.blockerReasons.includes('whole-branch-to-hidden-role-projection-not-authorized'),'blockers missing');
    assert(r.directionReview.sourceContextSpan === '煞印相生' && !r.directionReview.sourceContextAutomaticallyDistributesEffect,'context distributed');
});
for (const [name,change] of [
    ['source text',(i) => { i.sourceCase.sourceText = '子水化杀'; }],
    ['chart',(i) => { i.sourceCase.chartKey = COMPARISON; }],
    ['day',(i) => { i.sourceCase.gans[2] = '乙'; }],
    ['source evidence',(i) => { i.sourceCase.sourceEvidenceIds = []; }],
    ['annotation target',(i) => { i.annotation.relationUnits[0].target.span = '酉金'; }],
    ['source hidden substitution',(i) => { i.identityAuthority.sourceActorKey = 'hidden:3:子:癸:0'; }],
    ['target hidden killer',(i) => { i.identityAuthority.targetActorKey = 'hidden:2:申:庚:0'; }],
    ['target hidden seal',(i) => { i.identityAuthority.targetActorKey = 'hidden:2:申:壬:1'; }],
    ['whole branch killer projection',(i) => { i.identityAuthority.targetWholeBranchTenGod = '七杀'; }],
    ['target group',(i) => { i.identityAuthority.endpointCardinality = 3; }],
    ['missing identity',(i) => { delete i.identityAuthority; }],
    ['missing realization',(i) => { delete i.realizationAuthority; }],
    ['missing direction review',(i) => { delete i.directionReview; }],
    ['failed realization',(i) => { i.realizationAuthority.state = 'not-realized-in-source-context'; }],
    ['generic generation',(i) => { i.realizationAuthority.functionType = 'generation'; }],
    ['flipped clause',(i) => { i.directionReview.clauseDirection.fromActorKey = 'surface-branch:2:申'; }],
    ['reversed executable generation',(i) => { i.directionReview.underlyingGenerationDirection.realizedExecutableEdgeAuthorized = true; }],
    ['mediation authority',(i) => { i.directionReview.positiveEffectAuthority = 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001'; }],
    ['motif rewriting',(i) => { i.directionReview.existingMotif.sourceTenGods = ['正印']; }],
    ['R5 family registration',(i) => { i.directionReview.r5SourceFamilyRegistered = true; }],
    ['caller valid flag',(i) => { i.valid = true; }],
    ['caller execution',(i) => { i.execution = evaluate().execution; }]
]) test(`canonical independent review refuses ${name}`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && !r.relationRealizationResolved && r.execution === null && !r.relationEffects.length,'mutated review accepted');
});
test('invalid unknown and incomplete inputs stay closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid accepted');
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,targetResolution:evaluate().targetResolution }]) {
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'injected target accepted');
    }
});
for (const actorKey of ['surface-branch:3:子','surface-branch:2:申']) {
    test(`missing or duplicated ${actorKey} blocks source review`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'inventory identity reconstructed');
        }
    });
    test(`actual ${actorKey} evidence must match scope position branch and element`,() => {
        for (const [field,value] of [['sourceScope','visible-stem'],['pillarIndex',0],['position','year'],['zhi','酉'],['wuxing','火']]) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((p) => p.actorKey === actorKey)[field] = value;
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'conflicting evidence accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((p) => p.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing evidence rebuilt');
    });
}
test('malformed and sparse inventory remains unresolved',() => {
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],[undefined],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'bad inventory accepted');
    }
});
test('source relation does not transfer to comparison or previous charts',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,POSITIVE,'壬寅|己酉|庚午|丙戌','戊子|戊午|戊戌|戊午','癸酉|甲子|丁卯|丙午']) {
        assert(api.evaluateSource(input(),contextFor(chartKey)).status === STATES.NOT_APPLICABLE,'cross-chart transfer');
    }
});
test('caller effect hints in context do not change actual clause outcome',() => {
    const c = { ...actualContext(),effectType:'anchor-mediation',executionAuthorized:true,authorization:{ sourceBacked:true },reverseGenerationEdge:true };
    assert(api.evaluateSource(input(),c).execution.executionState === 'realized-relation-currently-unmapped','caller hint supplied authority');
});
test('R5 does not register or normalize the unlicensed R23 input',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(!Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === api.RULE_ID) && !contract.DIRECTION_REVIEW.r5SourceFamilyRegistered
        && c.CONTRACT.currentEndpointShapes.length === 3 && c.ACTOR_TO_ACTOR_MOTIFS.length === 3,'family broadened');
    assert(normalizer.toExecutionInput(normalizer.normalizeExactBranchPair(input(),actualContext())) === null
        && normalizer.toExecutionInput(normalizer.normalizeExactActorPair(input(),actualContext())) === null,'borrowed R22 or R15 family');
});
test('R22 positive opposition and its historical deferred disposition remain intact',() => {
    const r = synthesis.contextualForcePartySourceBranchOfficerOpposition;
    assert(r.resolvedRuntimeEffectCount === 1 && r.result.execution.effectType === 'anchor-opposition'
        && r.result.execution.sourceEndpoint.actorKey === 'surface-branch:0:午' && r.result.execution.targetEndpoint.actorKey === 'surface-branch:1:酉','R22 regressed');
    assert(!r.result.deferredPath.mediationAuthorized && !r.result.deferredPath.killerAugmentationFromLeavingAuthorized,'old provenance mutated');
    const combined = [r.result.execution,evaluate().execution];
    assert(combined.filter((e) => e.effectType !== null).length === 1 && !synthesis.contextualForcePartySourceBranchKillerDirectionAudit.relationEffects.length,'unmapped counted as positive');
});
test('static review coverage runtime counts and positive effect counts are separate',() => {
    const p = synthesis.contextualForcePartySourceBranchKillerDirectionAudit,q = api.buildProfile();
    assert(p.finiteSourceReviewComplete && p.reusedCompleteSourceCaseCount === 1 && p.newCompleteSourceCaseCount === 0
        && p.reviewedRelationCount === 1 && p.resolvedRuntimeRelationCount === 1 && p.realizedUnmappedRuntimePathCount === 1,'runtime counts wrong');
    assert(p.newEffectAuthorityCount === 0 && p.positiveEffectCount === 0 && p.reverseExecutableEdgeCount === 0
        && !p.genericHuaEffectMappingDefined && !p.broaderSourceCoverageComplete,'finite review inflated');
    assert(q.finiteSourceReviewComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeRelationCount === 0 && q.realizedUnmappedRuntimePathCount === 0,'static became runtime');
});
test('R20 and R21 preserve earlier unmapped failed and ambiguous states',() => {
    const m = outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization;
    assert(m.realizedUnmappedRuntimePathCount === 2 && m.result.jointOutcomeReview.jointEffectAuthority === null,'R20 licensed');
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1 && r.nonActionableRuntimeConfigurationCount === 1,'R21 regressed');
    assert(outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast.unresolvedRuntimeTargetCount === 1,'clash target selected');
});
test('R16 R17 R18 remain closed for failed relation and result materialization',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 regressed');
    const r = s.contextualForcePartyTransformedSourceBladeIdentityAudit.result;
    assert(r.bladeCandidates.length === 2 && r.targetIdentity.actorKey === null && r.targetIdentity.cardinality === null,'R17 changed');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 materialized');
});
test('R15 R9 CASE06 and generic registries retain previous scope and direction',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    const r9 = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results
        .find((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation');
    assert(r9.execution.sourceEndpoint.actorKey === 'visible:0:癸' && r9.execution.targetEndpoint.actorKey === 'visible:1:甲','R9 flipped');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => [CHART,COMPARISON].includes(p.chartKey)),'registry expanded');
});
test('finite dependency resolves without unblocking R11 B02-B05 or final strength',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === api.CONTRACT.reviewScope,'dependency scope widened');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','strength inferred');
});
test('key order is irrelevant outputs are frozen and callers are not mutated',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.directionReview.underlyingGenerationDirection) && Object.isFrozen(r.executionInput.realizationProvenance)
        && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance),'output mutable');
});
test('integration is inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceBranchKillerDirectionAudit,base = {};
    assert(ext.extendSynthesis({},base) === base,'missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Branch Killer Direction Audit tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
