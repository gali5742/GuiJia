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
const g = context.GuiJia,api = g.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile;
const contract = g.baziContextualForcePartySourceSealDamageEffectScopeAuditContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '戊辰|乙卯|辛丑|丁酉';
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

test('R28 reuses the complete R27 natal source and adds an independent scope review',() => {
    const i = input(),u = g.baziContextualForcePartySourceSealObstructionContrastProfile;
    assert(api.validateSourceInput(i).valid && JSON.stringify(i.sourceInput) === JSON.stringify(u.inputForCase()),'source rewritten');
    assert(contract.SOURCE_CASE.id === 'CF-SSOC-CASE-01' && contract.EFFECT_SCOPE_REVIEW.reviewedOn === '2026-10-12'
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 1 && contract.CONTRACT.newCompleteSourceCaseCount === 0,'chart counted twice');
    assert(i.effectScopeReview.sourceClauseSpan === '即日支之丑土，亦被卯木所坏' && !contract.CONTRACT.newEffectAuthorityCount,'new license invented');
});
test('actual upstream consumer preserves R27 normalization R3 and unmapped R4 execution',() => {
    const r = evaluate(),u = g.baziContextualForcePartySourceSealObstructionContrastProfile.evaluateSource(input().sourceInput,actualContext());
    assert(r.status === STATES.RESOLVED && JSON.stringify(r.upstreamResult) === JSON.stringify(u),'upstream result fabricated');
    const p = r.path;
    assert(p.normalizedInput.validation.valid && p.targetResolution.unitResolutions[0].targetReference.actorKey === 'surface-branch:2:丑','target unresolved');
    assert(p.relationRealized && p.execution.executionState === 'realized-relation-currently-unmapped'
        && JSON.stringify(p.execution) === JSON.stringify(kernel.executeRelationEffect(p.executionInput)),'damage lost or typed');
    assert(r.upstreamResult.paths[0].execution.executionState === 'not-realized-generic-relation-effect'
        && r.upstreamResult.configuration.execution.executionState === 'generic-relation-effect-not-applicable','other R27 scopes changed');
});
test('recipient identity consumes actual support evidence and rebuilt membership profile',() => {
    const r = evaluate(),a = r.recipient,key = 'surface-branch:2:丑';
    const evidence = actualContext().inventory.evidenceRecords.filter((e) => e.actorKey === key);
    assert(JSON.stringify(a.evidenceRecords) === JSON.stringify(evidence),'recipient evidence fabricated');
    assert(JSON.stringify(a.actorProfile) === JSON.stringify(g.baziContextualForcePartyMembershipProfile.buildActorProfiles(evidence)[0]),'profile not rebuilt');
    assert(a.actorProfile.membershipClass === 'daymaster-side-seed-candidate' && a.actorProfile.counterAnchorIds.length === 0
        && actualContext().inventory.daymasterSideActorKeys.includes(key) && !actualContext().inventory.counterAnchorActorKeys.includes(key),'recipient side projected');
    assert(a.realizedMember === null && a.contributionEffectiveness === null && a.supportLoss === null,'candidate became effective member');
});
test('whole Chou mixed roles remain contextual rather than a hidden seal endpoint',() => {
    const r = evaluate(),a = r.recipient;
    assert(a.scope === 'surface-branch' && a.wholeBranchTenGod === null
        && a.hiddenRoleContext.map((h) => h.tenGod).join() === '偏印,食神,比肩','pure seal invented');
    assert(a.actorKey === r.path.execution.targetEndpoint.actorKey && a.actorKey === 'surface-branch:2:丑'
        && !r.memberEdges.length && !r.relationEffects.length,'hidden or member effects created');
});
test('legacy killer and exact officer opposition scope comparisons preserve registered identities',() => {
    const r = evaluate(),[legacy,exact] = r.oppositionScopeComparisons;
    const m = g.baziContextualForcePartyRelationEffectContract.MOTIFS.find((m) => m.id === legacy.authorityId);
    const o = g.baziContextualForcePartySourceBranchOfficerOppositionContract;
    assert(m.targetTenGods[0] === legacy.targetRole && legacy.targetRole === '七杀'
        && legacy.sourceEvidenceIds.join() === m.sourceRegistryEvidenceIds.join(),'legacy scope changed');
    assert(exact.authorityId === o.EFFECT_AUTHORITY.id && exact.targetActorKey === o.EFFECT_AUTHORITY.targetActorKey
        && exact.chartKey === o.SOURCE_CASE.chartKey && exact.outcomeSpan === '去官' && exact.targetRole === '正官','R22 scope changed');
    assert([legacy,exact].every((c) => c.registeredAuthorityScopeVerified && !c.sameSourcePath && !c.licenseTransferAuthorized),'license transferred');
});
test('missing recipient-relative damage semantics is not no effect or a universal type ban',() => {
    const r = evaluate(),gap = r.effectScopeGap;
    assert(gap.status === 'independent-recipient-relative-damage-semantics-unlicensed'
        && gap.requiresIndependentRecipientRelativeDamageSemantics && gap.newEffectType === null,'gap hidden');
    assert(!gap.absenceProvesNoEffect && !gap.genericRecipientGateEstablished && !gap.recipientClassDefinesEffectType
        && !contract.EFFECT_SCOPE_REVIEW.existingOppositionUniversallyProhibited,'generic gate or no-effect inference');
    assert(!gap.wholeBranchPureSeal && !gap.allSupportAbsent && !gap.branchMediationFailureInferred,'recipient audit generated unsupported consequence');
    assert(gap.sourceEvidenceIds.includes('CF-SSOC-REALIZATION-02') && gap.sourceIdentityAuthorityId === 'CF-SSOC-IDENTITY-02','source authority lost');
    assert(r.effectType === null && r.effectTypeAuthority === null && !r.executionAuthorized && r.numericScore === null && r.relativeDominance === null,'gap became license');
});
for (const [name,mutate] of [
    ['source damage wording',(i) => { i.sourceInput.sourceCase.sourceText = i.sourceInput.sourceCase.sourceText.replace('所坏','生助'); }],
    ['damage failure',(i) => { i.sourceInput.relationReviews[1].realizationAuthority.state = 'not-realized-in-source-context'; }],
    ['generic restraint',(i) => { i.effectScopeReview.functionType = 'restraint'; }],
    ['hidden seal target',(i) => { i.effectScopeReview.targetActorKey = 'hidden:2:丑:己:0'; }],
    ['reverse source',(i) => { i.effectScopeReview.sourceActorKey = 'surface-branch:2:丑'; }],
    ['counter recipient',(i) => { i.effectScopeReview.expectedRecipientEvidence.membershipClass = 'counter-side-anchor-candidate'; }],
    ['pure seal',(i) => { i.effectScopeReview.wholeBranchPureSeal = true; }],
    ['existing R22 authority',(i) => { i.effectScopeReview.effectTypeAuthority = 'CF-SBOO-EFFECT-01'; }],
    ['new type',(i) => { i.effectScopeReview.newEffectType = 'support-damage'; }],
    ['global type prohibition',(i) => { i.effectScopeReview.existingOppositionUniversallyProhibited = true; }],
    ['candidate type rule',(i) => { i.effectScopeReview.recipientSideDefinesEffectType = true; }],
    ['support absence',(i) => { i.effectScopeReview.allSupportAbsent = true; }],
    ['negative mediation',(i) => { i.effectScopeReview.branchMediationFailureInferred = true; }],
    ['kernel target gate',(i) => { i.effectScopeReview.genericKernelRecipientGateEstablished = true; }],
    ['comparison identity',(i) => { i.effectScopeReview.oppositionComparisons[1].targetActorKey = 'surface-branch:2:丑'; }],
    ['comparison missing',(i) => { i.effectScopeReview.oppositionComparisons.pop(); }],
    ['caller review valid',(i) => { i.valid = true; }],
    ['caller positive execution',(i) => { i.executionAuthorized = true; }]
]) test(`canonical independent review refuses ${name}`,() => {
    const i = copy(input());mutate(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && r.path === null && r.recipient === null && r.effectScopeGap === null,'mutated review accepted');
});
for (const [name,mutate] of [
    ['recipient profile counter anchor',(c) => { c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:2:丑').counterAnchorIds = ['counter-anchor:surface-branch:2:丑']; }],
    ['recipient profile active member',(c) => { c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:2:丑').realizedMember = true; }],
    ['recipient profile evidence mismatch',(c) => { c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:2:丑').evidenceRecordIds = ['forged']; }],
    ['recipient profile qualifier mismatch',(c) => { c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:2:丑').contributionQualifiers = [{ id:'forged' }]; }],
    ['recipient evidence incoming restraint',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').sourceAxisId = 'incomingRestraint'; }],
    ['recipient evidence counter role',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').membershipClass = 'counter-side-anchor-candidate'; }],
    ['recipient evidence anchor id',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').counterAnchorId = 'forged'; }],
    ['recipient evidence hidden ten god',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').tenGod = '偏印'; }],
    ['recipient evidence numeric weight',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').numericWeight = 1; }],
    ['recipient evidence duplicate',(c) => { c.inventory.evidenceRecords.push(copy(c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑'))); }],
    ['missing seed index',(c) => { delete c.inventory.daymasterSideActorKeys; }],
    ['missing counter index',(c) => { delete c.inventory.counterAnchorActorKeys; }],
    ['duplicate seed index',(c) => { c.inventory.daymasterSideActorKeys.push('surface-branch:2:丑'); }],
    ['false counter index',(c) => { c.inventory.counterAnchorActorKeys.push('surface-branch:2:丑'); }],
    ['missing target',(c) => { c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:2:丑'); }],
    ['missing source',(c) => { c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:1:卯'); }]
]) test(`actual inventory audit refuses ${name}`,() => {
    const c = copy(actualContext());mutate(c);const r = api.evaluateSource(input(),c);
    assert(r.status === STATES.UNRESOLVED && r.recipient === null && r.path === null && r.effectScopeGap === null,'untrusted classification accepted');
});
test('forging both membership profile and evidence cannot establish a counter recipient',() => {
    const c = copy(actualContext()),key = 'surface-branch:2:丑';
    const e = c.inventory.evidenceRecords.find((e) => e.actorKey === key);
    e.membershipClass = 'counter-side-anchor-candidate';e.sourceAxisId = 'incomingRestraint';e.evidenceRole = 'direct-restraint-counter-anchor';e.counterAnchorId = `counter-anchor:${key}`;
    c.inventory.actorProfiles = c.inventory.actorProfiles.map((p) => p.actorKey === key ? copy(g.baziContextualForcePartyMembershipProfile.buildActorProfiles([e])[0]) : p);
    c.inventory.daymasterSideActorKeys = c.inventory.daymasterSideActorKeys.filter((k) => k !== key);c.inventory.counterAnchorActorKeys.push(key);
    assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'consistent forged recipient accepted');
});
test('caller positive path and recipient hints cannot override recomputed consumers',() => {
    const c = { ...actualContext(),upstreamResult:{ status:'resolved' },path:{ execution:{ realized:true,effectType:'anchor-opposition' } },
        recipient:{ membershipClass:'counter-side-anchor-candidate' },effectType:'anchor-opposition',effectTypeAuthority:'CF-SBOO-EFFECT-01' };
    const r = api.evaluateSource(input(),c);
    assert(r.status === STATES.RESOLVED && r.path.execution.effectType === null
        && r.recipient.actorProfile.membershipClass === 'daymaster-side-seed-candidate','caller hint used');
});
test('malformed source and inventory fail closed without throwing',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid source accepted');
    for (const c of [null,{}, { chartKey:CHART },{ chartKey:CHART,inventory:{} }]) assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing context accepted');
    for (const field of ['actorProfiles','evidenceRecords','daymasterSideActorKeys','counterAnchorActorKeys']) for (const bad of [null,{},[null],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'malformed inventory accepted');
    }
});
test('no recipient or license transfers to prior or adjacent natal charts',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,'壬午|己酉|甲申|甲子','癸酉|甲子|丁卯|丙午']) {
        const r = api.evaluateSource(input(),contextFor(chartKey));
        assert(r.status === STATES.NOT_APPLICABLE && r.path === null && r.recipient === null,'chart transfer');
    }
});
test('R5 families and vocabulary stay finite and unlicensed damage has no normalization',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 6 && c.ACTOR_TO_ACTOR_MOTIFS.length === 3
        && c.CONTRACT.currentEndpointShapes.length === 3 && evaluate().effectScopeGap.currentRelationTypes.join() === c.CONTRACT.allowedRelationTypes.join(),'vocabulary widened');
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'damage borrowed family');
    }
});
test('registered positive branch opposition and mediation remain executable in their exact cases',() => {
    const s = outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','R22 opposition changed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartySourceBranchMediationCalibration.result.execution.effectType === 'anchor-mediation'
        && m.contextualForcePartySourceBranchRestraintNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R24/R26 changed');
});
test('finite audit coverage and actual runtime recipient coverage are distinct',() => {
    const a = synthesis.contextualForcePartySourceSealDamageEffectScopeAudit,empty = api.buildProfile();
    assert(a.finiteSourceReviewComplete && a.auditedRuntimeRecipientCount === 1 && a.realizedUnmappedRuntimePathCount === 1,'matching coverage missing');
    assert(empty.finiteSourceReviewComplete && empty.auditedRuntimeRecipientCount === 0 && empty.realizedUnmappedRuntimePathCount === 0,'static review counted runtime');
    assert(a.reviewedOppositionAuthorityScopeCount === 2 && a.newEffectAuthorityCount === 0 && a.positiveEffectCount === 0
        && !a.broaderEffectTypeMappingComplete,'finite scope inflated');
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.kind === 'source-coverage' && d.status === 'resolved' && d.scope === contract.CONTRACT.reviewScope,'dependency widened');
});
test('global blockers membership and final strength retain their boundary',() => {
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global resolution inferred');
    assert(evaluate().recipient.actorProfile.realizedMember === null && evaluate().recipient.actorProfile.numericWeight === null,'member or force manufactured');
});
test('review inputs remain immutable and output is deeply frozen regardless of key order',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && JSON.stringify([i,c]) === before && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.recipient.actorProfile.counterAnchorIds) && Object.isFrozen(r.effectScopeGap.sourceEvidenceIds)
        && Object.isFrozen(r.upstreamResult.paths[1].executionInput.authorization),'result mutable');
});
test('integration is inert without R27 and idempotent with upstream synthesis',() => {
    const ext = g.baziContextualForcePartySourceSealDamageEffectScopeAudit,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1
        && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Seal Damage Effect Scope Audit tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
