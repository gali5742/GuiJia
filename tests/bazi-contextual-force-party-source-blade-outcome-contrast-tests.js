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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBladeOutcomeContrastProfile;
const contract = g.baziContextualForcePartySourceBladeOutcomeContrastContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '壬寅|己酉|庚午|丙戌',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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

const CONTROL = '戊子|戊午|戊戌|戊午',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });
const controlInput = () => api.inputForCase('CF-SBOC-CASE-02');
const control = () => api.evaluateSource(controlInput(),contextFor(CONTROL));
test('two complete primary charts retain independent natal source provenance',() => {
    assert(contract.SOURCE_CASES.map((s) => s.chartKey).join(',') === `${CHART},${CONTROL}`,'complete charts lost');
    for (const s of contract.SOURCE_CASES) {
        assert(api.validateSourceInput(api.inputForCase(s.id)).valid && s.retrievedOn === '2026-10-11' && s.revisionId === null
            && s.sourceUrl.includes('wikisource.org') && !s.sourceText.includes('运') && !s.sourceText.includes('科甲'),'natal provenance wrong');
    }
});
test('source You blade definition is restricted to the Geng case',() => {
    const d = contract.DEFINITION_SOURCE;
    assert(d.appliedDayGan === '庚' && d.candidateZhi === '酉' && d.sourceText === '秋之庚用酉刃，辛用申刃'
        && d.applicationScope === 'CF-SBOC-CASE-01-only' && !d.generalBladeSelectorAuthorized,'definition broadened');
    assert(controlInput().definitionSource === null && contract.SOURCE_CASES[1].mode === 'clash-outcome-control-not-blade-case'
        && !contract.RELATION_REVIEWS[2].targetIsBlade,'Wu-day 午 incorrectly made blade');
});
test('explicit failed restraint binds original visible Ren to hour Bing killer',() => {
    const p = evaluate().paths[0];
    assert(evaluate().status === STATES.RESOLVED && p.review.relationClauseSpan === '寅纳壬水，不能制杀','review missing');
    assert(p.execution.sourceEndpoint.actorKey === 'visible:0:壬' && p.execution.targetEndpoint.actorKey === 'visible:3:丙'
        && p.execution.relationIdentity.functionType === 'restraint','failed restraint endpoints wrong');
    assert(p.relationRealizationResolved && !p.relationRealized && p.execution.executionState === 'not-realized-generic-relation-effect'
        && p.execution.decisionRuleId === 'GREE-R04-NOT-REALIZED','explicit failure not consumed');
});
test('hidden Yin Bing cannot replace the explicitly contextualized visible hour killer',() => {
    assert(actualContext().inventory.actorProfiles.some((p) => p.actorKey === 'hidden:0:寅:丙:1'),'refusal premise missing');
    const i = copy(input());i.relationReviews[0].targetEndpoint.actorKey = 'hidden:0:寅:丙:1';
    assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'hidden killer substituted');
});
test('failed food-killer restraint receives no positive license or reverse effect',() => {
    const p = evaluate().paths[0];
    assert(p.review.sourceEndpoint.roleClass === '食神' && p.review.targetEndpoint.roleClass === '七杀','known roles missing');
    assert(!p.execution.realized && p.execution.effectType === null && p.execution.reverseEffect === null
        && !p.executionInput.authorization.authorityIds.length && p.executionInput.authorization.state === 'effect-authorization-not-applicable','failure became license');
    assert(p.executionInput.realizationProvenance.id === 'CF-SBOC-REALIZATION-01','realization provenance missing');
});
test('reviewed You barrier retains exact named Yin branch and clause direction',() => {
    const p = evaluate().paths[1];
    assert(p.execution.sourceEndpoint.actorKey === 'surface-branch:1:酉' && p.execution.targetEndpoint.actorKey === 'surface-branch:0:寅'
        && p.execution.relationIdentity.functionType === 'source-asserted-branch-barrier' && p.execution.relationIdentity.directed,'barrier endpoints wrong');
    assert(p.relationRealized && p.execution.executionState === 'realized-relation-currently-unmapped'
        && !p.execution.realized && p.execution.effectType === null && !p.effectTypeMapped,'barrier became opposition');
});
test('two exact actor targets use actual normalization R3 and R4',() => {
    const nc = g.baziContextualForcePartyRelationTargetNormalizedInputContract,r3 = g.baziContextualForcePartyGenericTargetLevelResolverProfile;
    for (const p of evaluate().paths) {
        assert(nc.validateNormalizedRecord(p.normalizedInput).valid && p.normalizedInput.validation.valid,'normalization bypassed');
        assert(JSON.stringify(p.targetResolution) === JSON.stringify(r3.resolveRecord(p.normalizedInput))
            && p.targetResolution.unitResolutions[0].decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR','R3 fabricated');
        assert(JSON.stringify(p.execution) === JSON.stringify(kernel.executeRelationEffect(p.executionInput)),'R4 fabricated');
    }
});
test('failed formation is a separate configuration result with no invented membership',() => {
    const c = evaluate().configuration;
    assert(c.review.sourceSpan === '使其不能会局' && c.review.antecedentSpan === '隔住寅木'
        && c.review.barrierPathId === 'CF-SBOC-PATH-02' && c.review.formationState === 'not-realized-in-source-context','configuration provenance lost');
    assert(!c.review.configurationMembershipAuthorized && !c.review.configurationMemberActorKeys.length
        && c.review.configurationActorEndpoint === null && !c.review.formationFailureIsActorNonrealization,'configuration turned into group');
    assert(c.review.blockedActorKey === 'surface-branch:0:寅' && !c.review.formationFailureIsOppositionLicense,'formation failure mislabeled');
});
test('actual R3 configuration consumption makes actual R4 legally non-actionable',() => {
    const c = evaluate().configuration,r3 = g.baziContextualForcePartyGenericTargetLevelResolverProfile;
    assert(c.normalizedInput.validation.valid && c.normalizedInput.annotationDisposition === 'configuration-state-only'
        && !c.normalizedInput.relationUnits.length,'configuration segmentation missing');
    assert(JSON.stringify(c.targetResolution) === JSON.stringify(r3.resolveRecord(c.normalizedInput))
        && c.targetResolution.decisionRuleId === 'GTLR-R02-CONFIGURATION','configuration kernel bypassed');
    assert(JSON.stringify(c.execution) === JSON.stringify(kernel.executeRelationEffect(c.executionInput))
        && c.execution.decisionRuleId === 'GREE-R01-NON-ACTIONABLE-TARGET' && c.execution.targetEndpoint === null
        && c.execution.executionState === 'generic-relation-effect-not-applicable','configuration became actor effect');
});
test('source configuration failure and barrier realization are orthogonal',() => {
    const r = evaluate();
    assert(r.paths[1].relationRealized && r.configuration.review.formationState === 'not-realized-in-source-context'
        && r.configuration.execution.executionState !== r.paths[0].execution.executionState,'different failures collapsed');
    assert(r.paths.length === 2 && !r.relationEffects.length && !r.memberEdges.length && r.reverseEffect === null,'extra effects invented');
});
test('clash control retains intensification rather than universally suppressive outcome',() => {
    const r = control(),p = r.paths[0];
    assert(r.status === STATES.AMBIGUOUS && p.review.outcomeSpan === '午发而愈烈' && p.review.reverseOutcomeSpan === '熬干滴水','source outcome erased');
    assert(p.sourceAssertedRealizationState === 'realized-in-source-context' && !p.relationRealizationResolved && p.relationRealized === null
        && p.execution.realizationState === 'unresolved-realization' && p.execution.authorizationState === 'unresolved-effect-type-authorization'
        && p.execution.executionState === 'unresolved-generic-relation-effect','source assertion licensed unknown instance');
    assert(p.execution.effectType === null && !p.executionAuthorized && !r.executionAuthorized && r.reverseEffect === null,'intensification became license');
});
test('both actual Wu candidates are preserved without choosing a target or group',() => {
    const p = control().paths[0],identity = p.normalizedInput.relationUnits[0].identityProvenance;
    assert(p.review.targetCandidates.map((e) => e.actorKey).join(',') === 'surface-branch:1:午,surface-branch:3:午','candidates lost');
    assert(identity.cardinality === null && identity.scope === null && identity.actorKey === null && identity.groupId === null
        && !identity.memberActorKeys.length && !p.targetIdentityResolved,'candidate count became membership or target');
    assert(!p.normalizedInput.validation.valid && p.targetResolution.resolutionState === 'unresolved-generic-target-record'
        && p.execution.targetEndpoint === null,'unknown target acted');
});
test('actual unknown identity consumes existing validator R3 and R4 refusals',() => {
    const p = control().paths[0],r3 = g.baziContextualForcePartyGenericTargetLevelResolverProfile;
    assert(JSON.stringify(p.targetResolution) === JSON.stringify(r3.resolveRecord(p.normalizedInput))
        && JSON.stringify(p.execution) === JSON.stringify(kernel.executeRelationEffect(p.executionInput)),'refusal fabricated');
    assert(p.targetResolution.blockerReasons.some((r) => r.includes('required-target-identity-unresolved')),'unknown identity reason missing');
});

const refusals = [
    ['rewritten primary text',(i) => { i.sourceCase.sourceText = '制杀成功'; }],
    ['changed chart',(i) => { i.sourceCase.chartKey = '壬寅|己酉|庚午|丁戌'; }],
    ['hidden Ren source',(i) => { i.relationReviews[0].sourceEndpoint.actorKey = 'hidden:0:寅:壬:0'; }],
    ['hidden killer scope',(i) => { i.relationReviews[0].targetEndpoint.scope = 'hidden-stem'; }],
    ['positive failed restraint',(i) => { i.relationReviews[0].realizationAuthority.state = 'realized-in-source-context'; }],
    ['synthetic authority',(i) => { i.relationReviews[1].realizationAuthority.id = 'UNKNOWN'; }],
    ['opposition barrier alias',(i) => { i.relationReviews[1].relationIdentity.functionType = 'anchor-opposition'; }],
    ['reversed blade barrier',(i) => { i.relationReviews[1].sourceEndpoint.actorKey = 'surface-branch:0:寅'; }],
    ['blade group expansion',(i) => { i.relationReviews[1].sourceEndpoint.cardinality = 2; }],
    ['target branch substitution',(i) => { i.relationReviews[1].targetEndpoint.actorKey = 'surface-branch:2:午'; }],
    ['branch-to-hidden substitution',(i) => { i.relationReviews[1].targetEndpoint.actorKey = 'hidden:0:寅:甲:0'; }],
    ['fabricated configuration members',(i) => { i.configurationReview.configurationMemberActorKeys = ['surface-branch:0:寅','surface-branch:2:午','surface-branch:3:戌']; }],
    ['configuration actor endpoint',(i) => { i.configurationReview.configurationActorEndpoint = { type:'actor-group',groupId:'fire' }; }],
    ['formation failure licenses opposition',(i) => { i.configurationReview.formationFailureIsOppositionLicense = true; }],
    ['target actor made nonrealized',(i) => { i.configurationReview.formationFailureIsActorNonrealization = true; }],
    ['definition transplanted',(i) => { i.definitionSource.appliedDayGan = '丙'; }],
    ['extra effect hint',(i) => { i.effectType = 'anchor-augmentation'; }],
    ['truncated reviews',(i) => { i.relationReviews.pop(); }],
    ['sparse reviews',(i) => { delete i.relationReviews[0]; }],
    ['duplicate reviews',(i) => { i.relationReviews[1] = copy(i.relationReviews[0]); }]
];
for (const [name,change] of refusals) test(`${name} refuses before runtime execution`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && !r.paths.length && r.configuration === null && !r.executionAuthorized,'unregistered review accepted');
});
for (const [name,change] of [
    ['month priority',(i) => { i.relationReviews[0].targetEndpoint = copy(i.relationReviews[0].targetCandidates[0]); }],
    ['hour priority',(i) => { i.relationReviews[0].targetEndpoint = copy(i.relationReviews[0].targetCandidates[1]); }],
    ['two-member group',(i) => { i.relationReviews[0].targetCardinality = 2; }],
    ['reverse effect',(i) => { i.relationReviews[0].reverseRelationAuthorized = true; }],
    ['manufactured blade role',(i) => { i.relationReviews[0].targetIsBlade = true; }],
    ['unbound instance realization',(i) => { i.relationReviews[0].realizationAuthority.instanceRealizationAuthorized = true; }],
    ['rewritten outcome',(i) => { i.relationReviews[0].outcomeSpan = '午被冲去'; }]
]) test(`clash control rejects ${name}`,() => {
    const i = copy(controlInput());change(i);assert(api.evaluateSource(i,contextFor(CONTROL)).status === STATES.INVALID,'ambiguous contrast released');
});
test('missing actual inventory or complete chart stays unresolved',() => {
    for (const c of [{},{ chartKey:CHART },{ inventory:actualContext().inventory },null]) {
        const r = api.evaluateSource(input(),c);assert(r.status === STATES.UNRESOLVED && !r.paths.length,'missing context executed');
    }
});
for (const actorKey of ['visible:0:壬','visible:3:丙','surface-branch:1:酉','surface-branch:0:寅']) {
    test(`missing actual ${actorKey} blocks exact source paths`,() => {
        const c = copy(actualContext());c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'review reconstructed missing actor');
    });
}
test('missing either control candidate cannot resolve the remaining branch by elimination',() => {
    for (const actorKey of ['surface-branch:1:午','surface-branch:3:午']) {
        const c = copy(contextFor(CONTROL));c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
        const r = api.evaluateSource(controlInput(),c);assert(r.status === STATES.UNRESOLVED && !r.paths.length,'candidate elimination authorized target');
    }
});
test('conflicting visible role branch position or duplicated actor refuses inventory',() => {
    for (const [key,change] of [['visible:0:壬',(r) => { r.tenGod = '正印'; }],['surface-branch:1:酉',(r) => { r.position = 'hour'; }]]) {
        const c = copy(actualContext());change(c.inventory.evidenceRecords.find((r) => r.actorKey === key));
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'conflicting inventory accepted');
    }
    const c = copy(actualContext());c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === 'visible:3:丙')));
    assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'duplicate actor accepted');
});
test('invalid input unknown cases and precomputed target injections are inert',() => {
    for (const i of [null,undefined,{},[]]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid review accepted');
    assert(api.inputForCase('unknown') === null,'unknown case invented');
    assert(api.evaluateSource(input(),{ chartKey:CHART,paths:evaluate().paths,targetResolution:evaluate().paths[0].targetResolution }).status === STATES.UNRESOLVED,'injected target consumed');
});
test('reviews and outcomes do not transfer to each other or previous source charts',() => {
    assert(api.evaluateSource(input(),contextFor(CONTROL)).status === STATES.NOT_APPLICABLE
        && api.evaluateSource(controlInput(),actualContext()).status === STATES.NOT_APPLICABLE,'cross-case transfer');
    for (const chartKey of [MONTH,ORIGINAL,POSITIVE]) {
        assert(api.evaluateSource(input(),contextFor(chartKey)).status === STATES.NOT_APPLICABLE
            && api.evaluateSource(controlInput(),contextFor(chartKey)).status === STATES.NOT_APPLICABLE,'old source reinterpreted');
    }
});
test('input key order is immaterial and runtime results deeply freeze without caller mutation',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && JSON.stringify([i,c]) === before && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.configuration.review) && Object.isFrozen(r.paths[1].executionInput.relationIdentity),'output mutable');
});
test('runtime counters separate failed restraint unmapped barrier and configuration',() => {
    const p = synthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(p.finiteSourceReviewComplete && p.sourceCaseCount === 2 && p.resolvedRuntimeNonrealizationCount === 1
        && p.realizedUnmappedRuntimePathCount === 1 && p.nonActionableRuntimeConfigurationCount === 1 && p.unresolvedRuntimeTargetCount === 0,'case counters wrong');
    const q = outputFor(CONTROL).semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(q.unresolvedRuntimeTargetCount === 1 && q.resolvedRuntimeNonrealizationCount === 0
        && q.realizedUnmappedRuntimePathCount === 0 && q.nonActionableRuntimeConfigurationCount === 0,'control counter wrong');
    assert(p.newEffectAuthorityCount === 0 && q.positiveEffectCount === 0 && !p.broaderSourceCoverageComplete,'finite coverage inflated');
});
test('R20 exact month relations and joint outcome remain unchanged',() => {
    const p = outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization;
    assert(p.realizedUnmappedRuntimePathCount === 2 && p.result.jointOutcomeReview.jointEffectAuthority === null
        && !p.result.jointOutcomeReview.perPathEffectAuthorities.length,'new contrast licensed R20');
});
test('R16 R17 and R18 remain closed for transformed result and two blade targets',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 regressed');
    const r = s.contextualForcePartyTransformedSourceBladeIdentityAudit.result;
    assert(r.bladeCandidates.length === 2 && r.targetIdentity.cardinality === null && r.targetIdentity.actorKey === null,'R17 blade selected');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 materialization released');
});
test('R15 R9 CASE06 and direct realization motifs remain unchanged',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    assert(outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => [CHART,CONTROL].includes(p.chartKey)),'generic registries expanded');
});
test('source coverage only resolves while R11 B02-B05 and final assessment remain blocked',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.scope === contract.CONTRACT.reviewScope && d.kind === 'source-coverage','dependency wrong');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 target selected');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','global sufficiency inflated');
});
test('extension is inert without upstream and idempotent with it',() => {
    const ext = g.baziContextualForcePartySourceBladeOutcomeContrast,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().results.every((r) => r.status === STATES.UNRESOLVED),'missing context fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate extension');
});
console.log(`\nSource Blade Outcome Contrast tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
