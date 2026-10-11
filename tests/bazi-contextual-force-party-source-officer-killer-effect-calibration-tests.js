#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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
const g = context.GuiJia,api = g.baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile;
const contract = g.baziContextualForcePartySourceOfficerKillerEffectCalibrationContract;
const identity = g.baziContextualForcePartySourceInstanceTargetCalibrationProfile;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '壬申|丁未|丁未|癸卯';
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

test('complete source keeps frozen excerpt locator retrieval date and unverified revision null',() => {
    const s = input().identityInput.sourceCase;
    assert(s.chartKey === CHART && s.sourceText.includes('不宜合也。幸而壬水坐申，合而不化')
        && s.retrievedOn === '2026-10-11' && s.revisionId === null,'source context lost');
    assert(api.validateSourceInput(input()).valid,'reviewed provenance rejected');
});
test('separate identity realization and effect authority IDs are preserved',() => {
    const p = evaluate().normalizedAuthorization.provenance;
    assert(p.identityAuthorityId === 'CF-SITC-IDENTITY-01' && p.realizationAuthorityId === 'CF-SOKEC-REALIZATION-01'
        && p.sourceAuthorityIds.join(',') === 'CF-SOKEC-EFFECT-01','independent authorities lost');
});
test('actual R14 identity gates and R3 kernel feed officer-to-hour-killer effect validation',() => {
    const r = evaluate();
    assert(r.validation.identityResult.targetResolution.unitResolutions[0].decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR','target kernel bypassed');
    assert(r.execution.sourceEndpoint.actorKey === 'visible:0:壬' && r.execution.targetEndpoint.actorKey === 'visible:3:癸','wrong actor pair');
});
test('registered exact case normalization through R5 feeds real R4 augmentation execution',() => {
    const r = evaluate(),n = r.normalizedAuthorization;
    assert(r.status === STATES.RESOLVED && n.normalizationState === normalizer.NORMALIZATION_STATES.RESOLVED
        && n.sourceFamily === 'actor-to-actor-exact-source-case','new R5 adapter unused');
    assert(r.execution.decisionRuleId === 'GREE-R06-REALIZED-AUTHORIZED' && r.execution.realized
        && r.execution.effectType === 'anchor-augmentation' && r.relationEffects.length === 1,'R4 execution failed');
    assert(JSON.stringify(kernel.executeRelationEffect(normalizer.toExecutionInput(n))) === JSON.stringify(r.execution),'reported execution differs from actual kernel');
});
test('peer relation shape is preserved without invoking wealth motif or affiliation authority',() => {
    const n = evaluate().normalizedAuthorization;
    assert(n.functionType === 'peer' && n.relationIdentity.directed && n.relationIdentity.id === `${CHART}::CF-SITC-PATH-01`,'peer/path identity lost');
    assert(n.provenance.sourceInputAuthority === null && n.provenance.sourceAuthorityKind === 'exact-source-case-actor-pair-outcome'
        && !n.authorization.authorityIds.some((id) => id.includes('MOTIF')),'wealth motif borrowed');
});
test('normalization preserves source contract record chart wording and reviewed basis',() => {
    const n = evaluate().normalizedAuthorization,p = n.provenance;
    assert(p.sourceContractId === contract.CONTRACT.id && p.sourceRuleId === api.RULE_ID && p.sourceRecordId === 'CF-SOKEC-RECORD-01'
        && p.chartKey === CHART && p.sourceWording === input().identityInput.sourceCase.sourceText && p.reviewedEffectBasis,'source provenance lost');
    assert(p.sourceEvidenceIds.includes('CF-SOKEC-REALIZATION-01') && p.sourceEvidenceIds.includes('CF-SITC-ANN-01'),'supporting evidence lost');
});
test('rootless target and combining warning do not negate explicit assistance in exact source context',() => {
    const r = evaluate();
    assert(r.relationRealizationResolved && r.execution.realizationState === 'realized-in-source-context','无根/不宜合 misread as non-realization');
    assert(!contract.REALIZATION_AUTHORITY.rootWeaknessIsNonRealization && !contract.REALIZATION_AUTHORITY.combinationIsAutomaticallyRealizationBlocker,'general shortcut claimed');
});
test('natal effect excludes future luck achievements and global 助 or peer translation',() => {
    assert(!contract.EFFECT_AUTHORITY.futureLuckOutcomesUsed && !contract.EFFECT_AUTHORITY.peerImpliesAugmentation
        && !contract.EFFECT_AUTHORITY.lexical助ImpliesAugmentation && contract.EFFECT_AUTHORITY.reviewedEffectInference,'effect interpretation hidden');
    assert(!input().identityInput.sourceCase.sourceText.includes('运走'),'fortune outcome used');
});
test('identity-only R14 output still cannot authorize any effect',() => {
    const r = identity.evaluateInstance(identity.inputForCase(),actualContext());
    assert(!r.effectAuthorizationResolved && !r.relationRealizationResolved && !r.executionAuthorized,'R14 authority mutated');
    assert(api.evaluateEffect({ identityInput:identity.inputForCase() },actualContext()).status === STATES.INVALID,'identity-only accepted');
});
test('old three-motif registry and direct realization registry stay unchanged',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3,'generic motif extended');
    assert(!g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'direct realization pattern borrowed');
});
test('legacy motif adapter rejects a peer augmentation record with no registered motif',() => {
    const record = evaluate().validation.record;
    assert(normalizer.normalizeActorToActor(record).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'peer gained motif authority');
});
test('R5 refuses caller validated-record flags instead of trusting source text',() => {
    const record = copy(evaluate().validation.record);record.validation = { valid:true };
    const n = normalizer.normalizeExactActorPair(record,actualContext());
    assert(n.normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED && !normalizer.toExecutionInput(n),'caller flags bypassed validator');
});
test('R5 late validator absence fails closed',() => {
    const key = 'baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile',saved = g[key];
    delete g[key];
    try { assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'missing validator executed'); }
    finally { g[key] = saved; }
});
test('R5 validator with wrong source contract identity cannot supply a trusted flag',() => {
    const key = 'baziContextualForcePartySourceOfficerKillerEffectCalibrationProfile',saved = g[key];
    const record = evaluate().validation.record;
    g[key] = { RULE_ID:api.RULE_ID,CONTRACT:{ id:'OTHER-CONTRACT' },validateEffectInput:() => ({ valid:true,record }) };
    try { assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'wrong validator trusted'); }
    finally { g[key] = saved; }
});
test('exact normalization IDs cannot collide with legacy positional record IDs',() => {
    const n = evaluate().normalizedAuthorization;
    assert(n.id === `CF-EANI-EXACT:${CHART}::CF-SOKEC-RECORD-01` && evaluate().executionInput.normalizedAuthorizationInputId === n.id,'source scoped normalization ID lost');
    assert(g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract.CONTRACT.currentEndpointShapes.length === 3,'duplicate shape counted as new endpoint shape');
});
test('realized peer without effect license retains unmapped state in R4',() => {
    const i = copy(evaluate().executionInput);
    i.authorization = { state:'realized-edge-currently-unmapped',sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[] };
    const r = kernel.executeRelationEffect(i);
    assert(r.executionState === 'realized-relation-currently-unmapped' && !r.realized && r.effectType === null,'unmapped erased or executed');
});
test('explicit not-realized kernel input produces no reverse effect (adversarial fixture only)',() => {
    const i = copy(evaluate().executionInput);i.realizationState = 'not-realized-in-source-context';
    const r = kernel.executeRelationEffect(i);
    assert(r.executionState === 'not-realized-generic-relation-effect' && !r.realized && r.effectType === null,'reverse effect fabricated');
    assert(contract.CONTRACT.negativeSourceCaseCount === 0,'synthetic refusal counted as source negative');
});
const tamper = (name,edit) => test(name,() => {
    const i = copy(input());edit(i);
    const r = api.evaluateEffect(i,actualContext()),n = normalizer.normalizeExactActorPair(i,actualContext());
    assert(r.status === STATES.INVALID && !r.execution && !r.relationEffects.length && !r.validation.record,'forged authority executed');
    assert(n.normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED && !n.authorization.sourceBacked,'R5 accepted forged authority');
    assert(!Object.isFrozen(i),'caller frozen');
});
tamper('altered source text cannot be reparsed from lexical 助',(i) => { i.identityInput.sourceCase.sourceText = '官星助杀'; });
tamper('dropping 不宜合/合而不化 context invalidates source evidence',(i) => { i.identityInput.sourceCase.sourceText = i.identityInput.sourceCase.sourceText.split('，不宜')[0]; });
tamper('negated source assertion cannot retain realization authority',(i) => { i.realizationAuthority.assertionSpan = '不但不能助杀'; });
tamper('changed complete source chart cannot retain authority',(i) => { i.identityInput.sourceCase.chartKey = WEALTH_FIRST; });
tamper('missing realization authority cannot be inferred from identity',(i) => { delete i.realizationAuthority; });
tamper('missing effect authority cannot be inferred from realization',(i) => { delete i.effectAuthority; });
tamper('opposition or mediation cannot reuse reviewed augmentation authority',(i) => { i.effectAuthority.relationType = 'anchor-opposition'; });
tamper('source path transfer to R11 is rejected',(i) => { i.effectAuthority.sourcePathId = 'CF-CRP-REC-01-P01'; });
tamper('broader path transfer list is rejected',(i) => { i.realizationAuthority.transferablePathIds = ['CF-CRP-REC-01-P01']; });
tamper('sparse transferable authority arrays are rejected',(i) => { i.effectAuthority.transferablePathIds = new Array(1); });
tamper('target cannot switch to officer or hidden scope',(i) => { i.effectAuthority.targetActorKey = 'visible:0:壬';i.effectAuthority.targetScope = 'hidden-branch'; });
tamper('source and target direction cannot reverse',(i) => { i.realizationAuthority.sourceActorKey = 'visible:3:癸';i.realizationAuthority.targetActorKey = 'visible:0:壬'; });
tamper('target cannot expand to actor group',(i) => { i.effectAuthority.targetCardinality = 2; });
tamper('generic generation mapping cannot replace peer identity',(i) => { i.realizationAuthority.functionType = 'generation'; });
tamper('caller validation flag cannot supplement registered input',(i) => { i.validation = { valid:true }; });
tamper('future luck outcome cannot become natal effect basis',(i) => { i.effectAuthority.outcomeSpan = '助起官杀';i.effectAuthority.futureLuckOutcomesUsed = true; });
test('malformed unknown and R11 source inputs fail closed',() => {
    for (const i of [null,[],42,{},api.inputForCase('CF-CRP-REC-01')]) assert(api.evaluateEffect(i,actualContext()).status === STATES.INVALID,'unknown source accepted');
});
test('same stems with changed branch and same roles at relocated positions are outside exact case',() => {
    for (const chartKey of ['壬申|丁未|丁未|癸亥','癸卯|丁未|丁未|壬申',WEALTH_FIRST]) {
        const r = api.evaluateEffect(input(),{ ...actualContext(),chartKey });
        assert(r.status === STATES.NOT_APPLICABLE && !r.execution && !r.relationEffects.length,'case authority transferred');
    }
});
test('missing current chart or actual inventory stays unresolved',() => {
    for (const ctx of [{},null,{ chartKey:CHART },{ chartKey:CHART,inventory:{} }]) {
        const r = api.evaluateEffect(input(),ctx);
        assert(r.status === STATES.UNRESOLVED && !r.execution,'missing evidence fabricated');
    }
});
const tamperInventory = (name,edit) => test(name,() => {
    const ctx = copy(actualContext());edit(ctx.inventory);
    const r = api.evaluateEffect(input(),ctx);
    assert(r.status === STATES.UNRESOLVED && !r.execution && !r.validation.record,'bad inventory produced effect');
});
tamperInventory('duplicate target actor cannot authorize effect',(i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'visible:3:癸'))); });
tamperInventory('missing officer actor cannot authorize effect',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:0:壬'); });
tamperInventory('contradictory target role evidence cannot authorize effect',(i) => { i.evidenceRecords.push({ actorKey:'visible:3:癸',tenGod:'正官' }); });
test('inputs remain unchanged while normalized provenance and effect output are deeply frozen',() => {
    const i = copy(input()),ctx = copy(actualContext()),before = JSON.stringify([i,ctx]),r = api.evaluateEffect(i,ctx);
    assert(JSON.stringify([i,ctx]) === before && !Object.isFrozen(i) && !Object.isFrozen(ctx.inventory),'caller data changed');
    assert(Object.isFrozen(r.normalizedAuthorization.provenance.sourceProvenance.gans) && Object.isFrozen(r.execution.authorizationIds)
        && Object.isFrozen(r.validation.record.sourceRegistryEvidenceIds),'output mutable');
});
test('full research synthesis exposes one exact effect with no membership dominance score or final release',() => {
    const p = synthesis.contextualForcePartySourceOfficerKillerEffectCalibration,r = p.result;
    assert(p.finiteSourceEffectCoverageComplete && p.resolvedRuntimeEffectCount === 1 && r.executionAuthorized,'runtime extension missing');
    assert(!r.memberEdges.length && r.numericScore === null && r.relativeDominance === null && r.runtimeWinnerPathId === null,'downstream semantics invented');
    assert(r.execution.actorGlobalParty === null && r.execution.actorGlobalEffectiveness === null && r.execution.membershipMutation === null,'global membership mutated');
    assert(synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final output unlocked');
});
test('R11 targets remain unresolved and independent source coverage is not runtime applicability',() => {
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis,p = s.contextualForcePartySourceOfficerKillerEffectCalibration;
    assert(p.finiteSourceEffectCoverageComplete && p.resolvedRuntimeEffectCount === 0 && p.result.status === STATES.NOT_APPLICABLE,'capability/applicability conflated');
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 role target bound');
    assert(p.transferredR11TargetCount === 0 && !p.genericPeerEffectMappingDefined,'authority broadened');
});
test('B02-B05 stay unresolved and new source dependency is narrowly scoped',() => {
    const d = synthesis.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-SOURCE-OFFICER-KILLER-EFFECT-CALIBRATION');
    assert(d.status === 'resolved' && d.scope === contract.CONTRACT.calibrationScope,'finite source dependency wrong');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4,'global resolver released');
});
test('R9 mediation and CASE06 hidden binding remain independent',() => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(s.contextualForcePartySourceOfficerKillerEffectCalibration.resolvedRuntimeEffectCount === 0,'source effect transferred');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'hidden identity regressed');
});
test('extension is inert without upstream and repeated extension does not duplicate claims',() => {
    const ext = g.baziContextualForcePartySourceOfficerKillerEffectCalibration,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().result.status === STATES.UNRESOLVED,'upstream evidence fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1,'duplicate extension records');
});
console.log(`\nSource Officer Killer Effect Calibration tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
