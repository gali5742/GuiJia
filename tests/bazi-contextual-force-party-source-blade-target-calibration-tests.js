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
const g = context.GuiJia,api = g.baziContextualForcePartySourceBladeTargetCalibrationProfile;
const contract = g.baziContextualForcePartySourceBladeTargetCalibrationContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '戊子|戊午|丙辰|戊戌',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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

const DAY_CHART = '戊申|癸亥|丙午|壬辰',YEAR_CHART = '戊午|癸亥|丙戌|壬辰',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });
test('three newly registered complete primary charts retain natal provenance and retrieval uncertainty',() => {
    assert(contract.SOURCE_CASES.map((s) => s.chartKey).join(',') === [CHART,DAY_CHART,YEAR_CHART].join(','),'source charts lost');
    for (const s of contract.SOURCE_CASES) {
        assert(api.validateSourceInput(api.inputForCase(s.id)).valid && s.retrievedOn === '2026-10-11' && s.revisionId === null
            && s.sourceUrl.includes('wikisource.org') && s.chartKey === s.gans.map((gan,i) => gan + s.zhis[i]).join('|'),'source metadata invalid');
        assert(!s.sourceText.includes('运走') && !s.sourceText.includes('科甲'),'fortune/outcome data imported');
    }
});
test('separate exact blade definition review is scoped to the three new charts',() => {
    const d = contract.DEFINITION_SOURCE;
    assert(d.id === 'CF-SBTC-DEF-01' && d.sourceText === '如丙日主，以午为羊刃，干透丁火为露刃。'
        && d.applicationScope.includes('CF-SBTC-CASE-01-02-03') && !d.sourceMentionsResolveCaseTargetCardinality,'definition scope incorrect');
    assert(g.baziContextualForcePartyTransformedSourceBladeIdentityAuditContract.DEFINITION_SOURCE.applicationScope.includes('CF-SOKNR-CASE-01'),'R17 definition broadened');
});
test('explicit month antecedent resolves actual surface branch identity',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.bladeIdentity.endpoint.actorKey === 'surface-branch:1:午'
        && r.bladeIdentity.endpoint.scope === 'surface-branch' && r.bladeIdentity.endpoint.cardinality === 1,'month branch not bound');
    assert(r.bladeIdentity.observationSpan === '丙日午提，刃强当令' && r.inventoryValidation.valid,'source scope lost');
});
test('two distinct source clauses retain separate source branches and one target',() => {
    const n = evaluate().normalizedInput;
    assert(n.relationUnits.map((u) => u.relationClauseSpan).join(',') === '子冲之,辰泄之','clauses conflated');
    assert(n.relationUnits.map((u) => u.identityProvenance.sourceActorKeys[0]).join(',') === 'surface-branch:0:子,surface-branch:2:辰','source positions lost');
    assert(n.relationUnits.every((u) => u.identityProvenance.actorKey === 'surface-branch:1:午'
        && u.targetMention.antecedentSpan === '丙日午提，刃强当令' && u.targetMention.span === '之'),'pronoun target lost');
});
test('actual normalized contract and R3 resolve both single-actor target units',() => {
    const r = evaluate(),nc = g.baziContextualForcePartyRelationTargetNormalizedInputContract;
    assert(r.normalizedInput.validation.valid && nc.validateNormalizedRecord(r.normalizedInput).valid,'normalizer bypassed');
    assert(JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(r.normalizedInput)) === JSON.stringify(r.targetResolution),'R3 result fabricated');
    assert(r.targetResolution.unitResolutions.length === 2 && r.targetResolution.unitResolutions.every((u) =>
        u.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && u.targetReference.actorKey === 'surface-branch:1:午'),'R3 target mismatch');
});
test('actual R4 receives actionable target but cannot infer realization or effect from clauses',() => {
    const r = evaluate();
    for (let i = 0;i < r.targetResolution.unitResolutions.length;i++) {
        const v = kernel.executeRelationEffect({ id:`SYNTHETIC-REFUSAL-${i}`,
            sourceEndpoint:{ type:'actor',actorKey:r.normalizedInput.relationUnits[i].identityProvenance.sourceActorKeys[0],scope:'surface-branch',cardinality:1 },
            targetResolution:r.targetResolution.unitResolutions[i],relationIdentity:{ id:contract.ANNOTATION.relationUnits[i].sourcePathId,functionType:null,directed:true },
            realizationState:'unresolved-realization',authorization:{ state:'unresolved-effect-type-authorization',sourceBacked:false,relationTypes:[],authorityIds:[],sourceEvidenceIds:[] } });
        assert(v.executionState === 'unresolved-generic-relation-effect' && v.effectType === null,'target identity became effect license');
    }
    assert(!r.relationRealizationResolved && !r.effectAuthorizationResolved && !r.executionAuthorized,'identity authority expanded');
});
test('joint weak outcome remains context without two per-path effect licenses',() => {
    const n = evaluate().normalizedInput;
    assert(contract.ANNOTATION.jointOutcomeSpan === '弱可知矣' && !contract.ANNOTATION.jointOutcomeAuthorizesPerPathEffects
        && n.contextSpans.some((s) => s.role === 'joint-outcome-context' && s.text === '弱可知矣')
        && n.relationUnits.every((u) => !u.outcomeSpans.length),'joint outcome distributed to individual effects');
});
test('day blade case is a reviewed location without a fabricated blade-target relation',() => {
    const r = api.evaluateSource(api.inputForCase('CF-SBTC-CASE-02'),contextFor(DAY_CHART));
    assert(r.status === STATES.OBSERVED && r.bladeIdentity.endpoint.actorKey === 'surface-branch:2:午'
        && r.bladeIdentity.observationSpan.includes('日主虽坐旺刃'),'day blade not observed');
    assert(r.normalizedInput === null && r.targetResolution === null && r.relationTargetPathCount === 0,'location forced into target relation');
});
test('year blade case is a reviewed location without a fabricated blade-target relation',() => {
    const r = api.evaluateSource(api.inputForCase('CF-SBTC-CASE-03'),contextFor(YEAR_CHART));
    assert(r.status === STATES.OBSERVED && r.bladeIdentity.endpoint.actorKey === 'surface-branch:0:午'
        && r.bladeIdentity.observationSpan === '更喜年逢刃助','year blade not observed');
    assert(r.normalizedInput === null && r.targetResolution === null && !r.executionAuthorized,'year context gained target/effect');
});
test('month day and year location evidence creates no global month priority',() => {
    assert(contract.IDENTITY_AUTHORITIES.map((a) => a.bladePillarIndex).join(',') === '1,2,0' && !contract.CONTRACT.genericMonthBladePriority
        && !contract.CONTRACT.genericUniqueBladeSelector,'generalized target priority created');
    assert(contract.IDENTITY_AUTHORITIES.every((a) => !a.transferablePathIds.length && !a.relationRealizationAuthorized
        && !a.effectTypeAuthorized && !a.transformedResultMaterializationAuthorized),'authority transferred');
});
const tamper = (name,edit,id = 'CF-SBTC-CASE-01') => test(name,() => {
    const i = copy(api.inputForCase(id));edit(i);
    const r = api.evaluateSource(i,contextFor(i.sourceCase.chartKey));
    assert(r.status === STATES.INVALID && !r.sourceValidation.valid && r.bladeIdentity === null && r.targetResolution === null,'forged source review accepted');
    assert(!Object.isFrozen(i),'caller frozen');
});
tamper('source excerpt cannot lose month antecedent',(i) => { i.sourceCase.sourceText = '子冲之，辰泄之'; });
tamper('complete source chart cannot be replaced with original two-Wu chart',(i) => { i.sourceCase.chartKey = ORIGINAL; });
tamper('definition cannot replace Wu branch with hidden Ding',(i) => { i.definitionSource.candidateZhi = '丁'; });
tamper('source retrieval metadata cannot change',(i) => { i.sourceCase.revisionId = 'invented'; });
tamper('target cannot become hidden Ding',(i) => { i.identityAuthority.bladeActorKey = 'hidden:1:午:丁:0'; });
tamper('target cannot become a group',(i) => { i.identityAuthority.bladeCardinality = 2;i.identityAuthority.bladeScope = 'actor-group'; });
tamper('source branch cannot become hidden Gui',(i) => { i.annotation.relationUnits[0].sourceActorKey = 'hidden:0:子:癸:0'; });
tamper('pronoun cannot point to original day master',(i) => { i.annotation.relationUnits[0].target.antecedentSpan = '丙日'; });
tamper('source clause cannot add effect semantic hint',(i) => { i.annotation.relationUnits[0].relationSemanticHint = 'anchor-opposition'; });
tamper('caller validation flag cannot authorize altered input',(i) => { i.validation = { valid:true }; });
tamper('known cue cannot transfer identity to R17',(i) => { i.identityAuthority.transferablePathIds = ['CF-TSBI-ALT-PATH-01']; });
tamper('blade identity cannot authorize transformed result materialization',(i) => { i.identityAuthority.transformedResultMaterializationAuthorized = true; });
tamper('sparse transferable authority list cannot pass exact validation',(i) => { i.identityAuthority.transferablePathIds = new Array(1); });
tamper('day context cannot borrow month annotation',(i) => { i.annotation = copy(contract.ANNOTATION); },'CF-SBTC-CASE-02');
tamper('year context cannot be relabeled as target relation',(i) => { i.sourceCase.mode = 'relation-target'; },'CF-SBTC-CASE-03');
test('unknown malformed and missing current context fail closed',() => {
    for (const i of [null,[],42,{},api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'unknown source accepted');
    for (const ctx of [null,{}, { chartKey:42 },{ chartKey:CHART },{ chartKey:CHART,inventory:{} },
        { chartKey:CHART,inventory:{ actorProfiles:[null],evidenceRecords:[] } }]) {
        const r = api.evaluateSource(input(),ctx);
        assert(r.status === STATES.UNRESOLVED && r.bladeIdentity === null,'missing context repaired');
    }
});
const badInventory = (name,edit) => test(name,() => {
    const ctx = copy(actualContext());edit(ctx.inventory);
    const r = api.evaluateSource(input(),ctx);
    assert(r.status === STATES.UNRESOLVED && r.bladeIdentity === null && r.targetResolution === null,'bad actual branch inventory resolved');
});
badInventory('missing month branch cannot reuse hidden Ding',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:1:午'); });
badInventory('duplicate branch profiles cannot select first',(i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'surface-branch:1:午'))); });
badInventory('missing source Zi cannot bind relation from quoted spelling',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'surface-branch:0:子'); });
badInventory('missing Chen evidence cannot reconstruct source position',(i) => { i.evidenceRecords = i.evidenceRecords.filter((p) => p.actorKey !== 'surface-branch:2:辰'); });
badInventory('wrong branch position cannot borrow correct key',(i) => { i.evidenceRecords.filter((p) => p.actorKey === 'surface-branch:1:午').forEach((p) => { p.pillarIndex = 2; }); });
badInventory('wrong branch scope cannot reuse hidden-actor evidence',(i) => { i.evidenceRecords.filter((p) => p.actorKey === 'surface-branch:1:午').forEach((p) => { p.sourceScope = 'hidden-branch'; }); });
badInventory('conflicting element evidence blocks reviewed branch identity',(i) => { i.evidenceRecords.filter((p) => p.actorKey === 'surface-branch:2:辰').forEach((p) => { p.wuxing = '水'; }); });
test('changed nearby or swapped chart cannot reuse blade identity authority',() => {
    for (const chartKey of [ORIGINAL,NEIGHBOR,DAY_CHART,YEAR_CHART,'戊午|戊子|丙辰|戊戌','戊子|戊午|丙午|戊戌']) {
        const r = api.evaluateSource(input(),{ ...actualContext(),chartKey });
        assert(r.status === STATES.NOT_APPLICABLE && r.bladeIdentity === null && r.targetResolution === null,'source identity transferred');
    }
});
test('mutable caller source inventory stays unchanged and outputs deeply freeze identities',() => {
    const i = copy(input()),ctx = copy(actualContext()),before = JSON.stringify([i,ctx]),r = api.evaluateSource(i,ctx);
    assert(JSON.stringify([i,ctx]) === before && !Object.isFrozen(i) && !Object.isFrozen(ctx.inventory),'caller changed');
    assert(Object.isFrozen(r.bladeIdentity.endpoint) && Object.isFrozen(r.normalizedInput.provenance.gans)
        && Object.isFrozen(r.normalizedInput.relationUnits[0].identityProvenance.sourceActorKeys),'mutable output');
});
test('runtime counts one target endpoint and two source relation paths',() => {
    const p = synthesis.contextualForcePartySourceBladeTargetCalibration;
    assert(p.finiteSourceIdentityCoverageComplete && p.sourceCaseCount === 3 && p.newlyRegisteredCompleteSourceCaseCount === 3
        && p.resolvedRuntimeTargetCount === 1 && p.resolvedRuntimeTargetPathCount === 2 && p.observedRuntimeBladeLocationCount === 1,'runtime counts inflated');
    assert(p.relationTargetSourceCaseCount === 1 && p.locationContextSourceCaseCount === 2 && p.newEffectAuthorityCount === 0
        && p.newMaterializationAuthorityCount === 0 && !p.relationEffects.length && p.numericScore === null,'coverage/effect conflated');
});
test('day and year observation views preserve zero relation target path counts',() => {
    for (const chartKey of [DAY_CHART,YEAR_CHART]) {
        const p = outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartySourceBladeTargetCalibration;
        assert(p.observedRuntimeBladeLocationCount === 1 && p.resolvedRuntimeTargetCount === 0 && p.resolvedRuntimeTargetPathCount === 0,'location became relation-target count');
    }
});
test('original ambiguous two-Wu case gains neither selected target nor materialization authority',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis,p = s.contextualForcePartySourceBladeTargetCalibration;
    assert(p.results.every((r) => r.status === STATES.NOT_APPLICABLE) && p.transferredR17TargetCount === 0,'month blade authority transferred');
    const r = s.contextualForcePartyTransformedSourceBladeIdentityAudit.result;
    assert(r.bladeCandidates.length === 2 && r.targetIdentity.cardinality === null && r.targetIdentity.actorKey === null
        && r.execution.executionState === 'unresolved-generic-relation-effect','R17 target selected');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length === 0,'R18 materialization released');
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 regressed');
});
test('R15 R9 and CASE06 retain existing executable results',() => {
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
});
test('old motifs direct realization R11 targets and global blockers remain unchanged',() => {
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => contract.SOURCE_CASES.some((s) => s.chartKey === p.chartKey)),'old registry changed');
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 target transferred');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4,'B02-B05 released');
});
test('only narrow source coverage resolves and final assessment remains insufficient',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === contract.CONTRACT.calibrationScope,'source scope wrong');
    assert(synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final assessment released');
});
test('absent upstream is inert and extension remains idempotent',() => {
    const ext = g.baziContextualForcePartySourceBladeTargetCalibration,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().results.every((r) => r.status === STATES.UNRESOLVED),'missing chart fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate extension records');
});
console.log(`\nSource Blade Target Calibration tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
