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
const g = context.GuiJia,api = g.baziContextualForcePartySourceRecipientSealDamageCalibrationProfile;
const contract = g.baziContextualForcePartySourceRecipientSealDamageCalibrationContract;
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
const evaluate = () => api.evaluateEffect(input(),actualContext());
const COMPARISON = '己巳|丁卯|辛卯|乙未',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });

test('one complete R27 natal source is reused with one independently reviewed R29 effect authority',() => {
    const i = input(),a = i.effectAuthority;
    assert(api.validateSourceInput(i).valid && contract.SOURCE_CASE.id === 'CF-SSOC-CASE-01'
        && contract.SOURCE_CASE.sourceText.endsWith('此局内无可通之理。'),'source identity changed');
    assert(a.id === 'CF-RSDC-EFFECT-01' && a.reviewedOn === '2026-10-12' && a.identityAuthorityId === 'CF-SSOC-IDENTITY-02'
        && a.realizationAuthorityId === 'CF-SSOC-REALIZATION-02' && a.priorEffectScopeReviewId === 'CF-SSDES-REVIEW-01','authority conflated');
    assert(contract.SOURCE_CASE.sourceText.includes(a.attributionContextSpan) && a.outcomeSpan === '即日支之丑土，亦被卯木所坏'
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 1 && contract.CONTRACT.newCompleteSourceCaseCount === 0,'new chart or fortune authority');
});
test('new execution type is independent of the three legacy anchor motifs',() => {
    const s = g.baziContextualForcePartyRecipientSealDamageEffectContract,c = g.baziContextualForcePartyGenericRelationEffectExecutionContract;
    assert(s.RELATION_TYPE === 'recipient-seal-damage' && c.VERSION === '0.2' && c.CONTRACT.allowedRelationTypes.length === 4,'typed extension missing');
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && Object.values(g.baziContextualForcePartyRelationEffectContract.RELATION_TYPES).length === 3,'anchor motifs extended');
    assert(!s.CONTRACT.genericDamageWordMapping && !s.CONTRACT.elementalRestraintMapping
        && !s.CONTRACT.recipientCandidateClassMapping && !s.CONTRACT.impliesActiveSupportLoss,'generic damage rule created');
});
test('actual R28 and R27 source identity realization and recipient consumption precede the new license',() => {
    const r = evaluate(),u = g.baziContextualForcePartySourceSealDamageEffectScopeAuditProfile.evaluateSource(input().sourceReview,actualContext());
    assert(r.status === STATES.RESOLVED && r.validation.valid && JSON.stringify(r.validation.recipientReview) === JSON.stringify(u),'upstream fabricated');
    assert(u.path.normalizedInput.validation.valid && u.path.targetResolution.unitResolutions[0].targetReference.actorKey === 'surface-branch:2:丑'
        && u.path.relationRealized && u.path.execution.executionState === 'realized-relation-currently-unmapped','identity/realization shortcut');
    assert(u.recipient.actorProfile.membershipClass === 'daymaster-side-seed-candidate' && u.recipient.actorProfile.realizedMember === null
        && u.recipient.hiddenRoleContext.map((r) => r.tenGod).join() === '偏印,食神,比肩','candidate or mixed scope altered');
});
test('dedicated seventh R5 source family revalidates canonical source and preserves bounded effect scope',() => {
    const r = evaluate(),c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 7 && c.CONTRACT.currentEndpointShapes.length === 3,'family or shape count wrong');
    assert(r.normalizedAuthorization.sourceFamily === c.SOURCE_FAMILIES.ACTOR_TO_ACTOR_EXACT_RECIPIENT_SEAL_DAMAGE
        && r.normalizedAuthorization.provenance.sourceRuleId === api.RULE_ID
        && r.normalizedAuthorization.provenance.sourceContractId === contract.CONTRACT.id,'family authority wrong');
    assert(JSON.stringify(r.normalizedAuthorization) === JSON.stringify(normalizer.normalizeExactRecipientSealDamagePair(input(),actualContext())),'R5 bypassed');
    assert(JSON.stringify(r.normalizedAuthorization.effectScope) === JSON.stringify(contract.EFFECT_SCOPE)
        && r.normalizedAuthorization.authorization.authorityIds.join() === 'CF-RSDC-EFFECT-01','scope or independent license lost');
    assert(r.normalizedAuthorization.provenance.sourceEvidenceIds.includes('CF-SSOC-IDENTITY-02')
        && r.normalizedAuthorization.provenance.sourceEvidenceIds.includes('CF-SSOC-REALIZATION-02'),'upstream evidence lost');
});
test('actual R4 executes qualitative damage on whole Mao to whole Chou only',() => {
    const r = evaluate(),e = r.execution;
    assert(JSON.stringify(r.executionInput) === JSON.stringify(normalizer.toExecutionInput(r.normalizedAuthorization))
        && JSON.stringify(e) === JSON.stringify(kernel.executeRelationEffect(r.executionInput)),'R4 fabricated');
    assert(e.realized && e.effectType === 'recipient-seal-damage' && e.sourceEndpoint.actorKey === 'surface-branch:1:卯'
        && e.targetEndpoint.actorKey === 'surface-branch:2:丑' && e.identityShape === 'actor-to-actor','endpoint or type wrong');
    assert(e.relationIdentity.functionType === 'source-asserted-branch-seal-damage'
        && JSON.stringify(e.effectScope) === JSON.stringify(contract.EFFECT_SCOPE)
        && e.effectScope.extent === 'qualitative-source-asserted-damage-only','scope expanded');
    assert(r.executionAuthorized && r.effectAuthorizationResolved && r.relationRealizationResolved
        && r.relationEffects.length === 1 && r.currentExactPathEffectGapResolved,'licensed execution missing');
});
test('prior unmapped audit snapshots and separate noncommunication remain intact',() => {
    const r = evaluate(),u = r.validation.recipientReview;
    assert(!r.upstreamAuditSnapshotsRewritten && u.effectScopeGap.authorizationKnowledgeScope === 'r28-reviewed-legacy-opposition-authorities-only'
        && u.path.execution.effectType === null,'earlier audit overwritten');
    assert(u.upstreamResult.paths[0].execution.executionState === 'not-realized-generic-relation-effect'
        && u.upstreamResult.configuration.execution.executionState === 'generic-relation-effect-not-applicable','failure distributed');
    assert(synthesis.contextualForcePartySourceSealObstructionContrast.realizedUnmappedRuntimePathCount === 1
        && synthesis.contextualForcePartySourceSealDamageEffectScopeAudit.realizedUnmappedRuntimePathCount === 1,'stage provenance lost');
});
test('qualitative named damage implies no active loss global ineffectiveness or hidden member effects',() => {
    const r = evaluate(),e = r.execution,a = contract.EFFECT_AUTHORITY;
    assert(!r.targetRemovedFromInventory && r.targetGenericIneffectiveState === null && !r.allHiddenRolesDamaged && r.supportLoss === null,'unsupported loss');
    assert(!a.activeMembershipEstablished && !a.otherPathNonrealizationAuthorized && !a.oppositionAuthorityInherited,'new authority exceeded scope');
    assert(!r.memberEdges.length && r.membershipMutation === null && !e.memberEffects.length && e.actorGlobalEffectiveness === null
        && e.numericWeight === null && r.numericScore === null && r.relativeDominance === null,'force or membership manufactured');
});
for (const [name,mutate] of [
    ['source text',(i) => { i.sourceReview.sourceInput.sourceCase.sourceText = '坏印'; }],
    ['different natal chart',(i) => { i.sourceReview.sourceInput.sourceCase.chartKey = COMPARISON; }],
    ['damage failure',(i) => { i.sourceReview.sourceInput.relationReviews[1].realizationAuthority.state = 'not-realized-in-source-context'; }],
    ['upstream effect override',(i) => { i.sourceReview.effectScopeReview.effectTypeAuthority = 'CF-RSDC-EFFECT-01'; }],
    ['upstream counter recipient',(i) => { i.sourceReview.effectScopeReview.expectedRecipientEvidence.membershipClass = 'counter-side-anchor-candidate'; }],
    ['borrowed R22 license',(i) => { i.effectAuthority.id = 'CF-SBOO-EFFECT-01'; }],
    ['borrowed opposition type',(i) => { i.effectAuthority.relationType = 'anchor-opposition'; }],
    ['identity authority',(i) => { i.effectAuthority.identityAuthorityId = 'CF-SSOC-IDENTITY-01'; }],
    ['realization authority',(i) => { i.effectAuthority.realizationAuthorityId = 'CF-SSOC-REALIZATION-01'; }],
    ['reverse source',(i) => { i.effectAuthority.sourceActorKey = 'surface-branch:2:丑'; }],
    ['hidden seal target',(i) => { i.effectAuthority.targetActorKey = 'hidden:2:丑:己:0'; }],
    ['another visible seal',(i) => { i.effectAuthority.targetActorKey = 'visible:0:戊'; }],
    ['generic restraint function',(i) => { i.effectAuthority.functionType = 'restraint'; }],
    ['luck outcome',(i) => { i.effectAuthority.outcomeSpan = '交庚申克去木神'; }],
    ['missing attribution context',(i) => { i.effectAuthority.attributionContextSpan = ''; }],
    ['all hidden roles',(i) => { i.effectAuthority.allHiddenRolesDamaged = true; }],
    ['active member',(i) => { i.effectAuthority.activeMembershipEstablished = true; }],
    ['support loss',(i) => { i.effectAuthority.supportLoss = 1; }],
    ['other path failure',(i) => { i.effectAuthority.otherPathNonrealizationAuthorized = true; }],
    ['removed target',(i) => { i.effectAuthority.targetRemovedFromInventory = true; }],
    ['aspect breadth',(i) => { i.effectAuthority.effectScope.sourceNamedAspect = 'all-hidden-functions'; }],
    ['scope recipient',(i) => { i.effectAuthority.effectScope.recipientActorKey = 'visible:0:戊'; }],
    ['missing semantic scope',(i) => { delete i.effectAuthority.effectScope; }],
    ['caller source valid',(i) => { i.valid = true; }]
]) test(`independent source validator refuses ${name}`,() => {
    const i = copy(input());mutate(i);const r = api.evaluateEffect(i,actualContext());
    assert(r.status === STATES.INVALID && !r.validation.valid && r.execution === null && !r.relationEffects.length,'invalid source licensed');
    assert(normalizer.toExecutionInput(normalizer.normalizeExactRecipientSealDamagePair(i,actualContext())) === null,'R5 accepted invalid source');
});
for (const [name,mutate] of [
    ['missing whole target',(c) => { c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:2:丑'); }],
    ['duplicate whole source',(c) => { c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:1:卯'))); }],
    ['wrong evidence scope',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').sourceScope = 'hidden-stem'; }],
    ['wrong recipient class',(c) => { c.inventory.actorProfiles.find((p) => p.actorKey === 'surface-branch:2:丑').membershipClass = 'counter-side-anchor-candidate'; }],
    ['missing recipient seed index',(c) => { delete c.inventory.daymasterSideActorKeys; }],
    ['numeric recipient evidence',(c) => { c.inventory.evidenceRecords.find((p) => p.actorKey === 'surface-branch:2:丑').numericWeight = 1; }]
]) test(`actual upstream inventory refuses ${name}`,() => {
    const c = copy(actualContext());mutate(c);const r = api.evaluateEffect(input(),c);
    assert(r.status === STATES.UNRESOLVED && r.execution === null && !r.executionAuthorized,'inventory shortcut');
    assert(normalizer.toExecutionInput(normalizer.normalizeExactRecipientSealDamagePair(input(),c)) === null,'R5 inventory shortcut');
});
test('caller path recipient execution and type hints do not authorize an effect independently',() => {
    const hints = { effectAuthority:'CF-SBOO-EFFECT-01',effectType:'anchor-opposition',recipient:{ realizedMember:true },
        recipientReview:evaluate().validation.recipientReview,targetResolution:evaluate().validation.identityResult.targetResolution };
    const r = api.evaluateEffect(input(),{ ...actualContext(),...hints });
    assert(r.status === STATES.RESOLVED && r.execution.effectType === 'recipient-seal-damage','caller hint selected type');
    assert(api.evaluateEffect(input(),{ chartKey:CHART,...hints }).execution === null,'supplied result bypassed inventory');
});
for (const [name,mutate] of [
    ['missing effect scope',(x) => { delete x.effectScope; }],
    ['wrong recipient',(x) => { x.effectScope.recipientActorKey = 'visible:0:戊'; }],
    ['hidden recipient scope',(x) => { x.effectScope.recipientScope = 'hidden-branch'; }],
    ['unknown semantic contract',(x) => { x.effectScope.semanticContractId = 'unknown'; }],
    ['all branch roles',(x) => { x.effectScope.sourceNamedAspect = 'all-hidden-roles'; }],
    ['global ineffectiveness',(x) => { x.effectScope.extent = 'actor-globally-ineffective'; }],
    ['numeric extra',(x) => { x.effectScope.numericLoss = 1; }],
    ['array scope',(x) => { x.effectScope = Object.assign([],x.effectScope); }],
    ['inherited scope',(x) => { const original = x.effectScope;x.effectScope = Object.create(original);for (const k of ['a','b','c','d','e']) x.effectScope[k] = true; }],
    ['hidden endpoint',(x) => { x.targetResolution.targetReference.scope = 'hidden-branch'; }],
    ['group source',(x) => { x.sourceEndpoint = { type:'actor-group',groupId:'g',scope:'source-case',sourceScoped:true,cardinality:1,memberActorKeys:['surface-branch:1:卯'] }; }]
]) test(`R4 new type refuses ${name}`,() => {
    const x = copy(evaluate().executionInput);mutate(x);const e = kernel.executeRelationEffect(x);
    assert(e.executionState === 'unresolved-generic-relation-effect' && !e.realized && e.effectType === null,'unbounded new type executed');
});
test('missing scope never turns an unlicensed or failed relation into no effect or reverse effect',() => {
    const x = copy(evaluate().executionInput);delete x.effectScope;
    x.authorization = { state:'realized-edge-currently-unmapped',sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[] };
    assert(kernel.executeRelationEffect(x).executionState === 'realized-relation-currently-unmapped','unmapped erased');
    x.realizationState = 'not-realized-in-source-context';const e = kernel.executeRelationEffect(x);
    assert(e.executionState === 'not-realized-generic-relation-effect' && e.reverseEffect === null,'failed reversed');
});
test('the dedicated family requires its registered validator at normalization time',() => {
    const key = 'baziContextualForcePartySourceRecipientSealDamageCalibrationProfile',saved = g[key];
    try {
        for (const replacement of [undefined,{ ...saved,RULE_ID:'different-rule' },{ ...saved,CONTRACT:{ id:'different-contract' } }]) {
            g[key] = replacement;
            const n = normalizer.normalizeExactRecipientSealDamagePair(input(),actualContext());
            assert(n.normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED && normalizer.toExecutionInput(n) === null,'unregistered validator used');
        }
    } finally { g[key] = saved; }
});
test('old R5 adapters cannot supply this independent recipient damage authority',() => {
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'authority borrowed through old family');
    }
    assert(typeof normalizer.normalizeRegisteredExactPair === 'undefined','arbitrary family selector exposed');
});
test('other charts and incomplete contexts cannot obtain the exact damage license',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,'壬午|己酉|甲申|甲子','癸酉|甲子|丁卯|丙午']) {
        const r = api.evaluateEffect(input(),contextFor(chartKey));
        assert(r.status === STATES.NOT_APPLICABLE && r.execution === null,'cross-chart license transfer');
    }
    for (const c of [null,{}, { chartKey:CHART },{ chartKey:CHART,inventory:{} }]) assert(api.evaluateEffect(input(),c).status === STATES.UNRESOLVED,'incomplete context licensed');
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateEffect(i,actualContext()).status === STATES.INVALID,'unknown input accepted');
});
test('legacy exact opposition mediation and failed restraint keep their types and scope',() => {
    const s = outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition','opposition changed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartySourceBranchMediationCalibration.result.execution.effectType === 'anchor-mediation'
        && m.contextualForcePartySourceBranchRestraintNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R24/R26 changed');
    assert(!Object.hasOwn(s.contextualForcePartySourceBranchOfficerOpposition.result.execution,'effectScope'),'legacy input burden added');
});
test('finite effect coverage stays distinct from runtime coverage and global source mapping',() => {
    const r = synthesis.contextualForcePartySourceRecipientSealDamageCalibration,empty = api.buildProfile();
    assert(r.finiteSourceEffectCoverageComplete && r.newEffectAuthorityCount === 1 && r.resolvedRuntimeEffectCount === 1
        && r.result.currentExactPathEffectGapResolved,'exact gap unresolved');
    assert(empty.finiteSourceEffectCoverageComplete && empty.resolvedRuntimeEffectCount === 0,'static license counted runtime');
    assert(!r.genericEffectTypeMappingDefined && !r.genericDamageMappingDefined && !r.broaderSourceCoverageComplete,'generic mapping claimed');
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.kind === 'source-coverage' && d.scope === contract.CONTRACT.reviewScope && d.status === 'resolved','dependency widened');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global strength resolved');
});
test('key order independent canonical validation leaves caller inputs mutable and outputs deeply frozen',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateEffect(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && JSON.stringify([i,c]) === before && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.execution.effectScope) && Object.isFrozen(r.normalizedAuthorization.effectScope)
        && Object.isFrozen(r.validation.recipientReview.recipient.actorProfile.counterAnchorIds),'outputs mutable');
});
test('integration is inert without upstream and idempotent with finite source coverage',() => {
    const ext = g.baziContextualForcePartySourceRecipientSealDamageCalibration,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Recipient Seal Damage Calibration tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
