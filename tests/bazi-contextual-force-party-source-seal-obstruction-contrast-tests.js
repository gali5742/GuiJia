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
const g = context.GuiJia,api = g.baziContextualForcePartySourceSealObstructionContrastProfile;
const contract = g.baziContextualForcePartySourceSealObstructionContrastContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '戊辰|乙卯|辛丑|丁酉',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const COMPARISON = '己巳|丁卯|辛卯|乙未',MONTH = '戊子|戊午|丙辰|戊戌',ORIGINAL = '癸巳|戊午|丙午|壬辰';
const contextFor = (chartKey) => ({ chartKey,inventory:outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartyMembershipInventory });

test('new complete primary chart retains natal wording and excludes fortune columns',() => {
    const s = contract.SOURCE_CASE;
    assert(s.chartKey === CHART && s.gans.join() === '戊,乙,辛,丁' && s.zhis.join() === '辰,卯,丑,酉'
        && s.retrievedOn === '2026-10-12' && s.revisionId === null && s.sourceUrl.includes('wikisource.org'),'primary provenance changed');
    assert(s.sourceText.endsWith('此局内无可通之理。') && !s.sourceText.includes('中运') && !s.sourceText.includes('庚申克去'),'luck included');
    assert(api.validateSourceInput(input()).valid && contract.CONTRACT.newCompleteSourceCaseCount === 1
        && contract.CONTRACT.reusedCompleteSourceCaseCount === 0,'primary source count wrong');
});
test('explicit hour killer and year seal roles bind the reviewed visible communication pair',() => {
    const r = contract.RELATION_REVIEWS[0],b = g.baziCore;
    assert(r.sourceEndpoint.actorKey === 'visible:3:丁' && r.targetEndpoint.actorKey === 'visible:0:戊'
        && b.shiShenMap['辛']['丁'] === '七杀' && b.shiShenMap['辛']['戊'] === '正印','visible identity wrong');
    assert(r.relationIdentity.functionType === 'source-asserted-killer-seal-communication'
        && r.realizationAuthority.evidenceSpan === '时杀紧克，年逢印绶，远隔不通'
        && !r.genericDistanceRule && r.identityBasis.includes('Reviewed communication'),'directed generation or generic distance invented');
});
test('passive source wording preserves Mao as source and day Chou as damaged target',() => {
    const r = contract.RELATION_REVIEWS[1];
    assert(r.sourceSpan === '卯木' && r.targetSpan === '日支之丑土' && r.predicateSpan === '所坏'
        && r.sourceEndpoint.actorKey === 'surface-branch:1:卯' && r.targetEndpoint.actorKey === 'surface-branch:2:丑','passive clause reversed');
    assert(r.relationIdentity.functionType === 'source-asserted-branch-seal-damage' && r.realizationAuthority.state === 'realized-in-source-context','damage treated as failure of damage');
});
test('actual normalized contract and R3 resolve the two distinct targets',() => {
    const r = evaluate();
    assert(r.status === STATES.RESOLVED && r.paths.length === 2,'paths missing');
    for (const [index,p] of r.paths.entries()) {
        assert(p.normalizedInput.validation.valid && g.baziContextualForcePartyRelationTargetNormalizedInputContract.validateNormalizedRecord(p.normalizedInput).valid,'normalized validator bypassed');
        assert(JSON.stringify(p.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(p.normalizedInput)),'R3 fabricated');
        const t = p.targetResolution.unitResolutions[0];
        assert(t.decisionRuleId === 'GTLR-R04-CHART-SINGLE-ACTOR' && t.targetReference.actorKey === contract.RELATION_REVIEWS[index].targetEndpoint.actorKey
            && p.normalizedInput.relationUnits.length === 1,'wrong target or extra relation');
    }
});
test('actual R4 retains failed communication and affirmative but unmapped branch damage',() => {
    const r = evaluate(),[a,b] = r.paths;
    for (const p of r.paths) assert(JSON.stringify(p.execution) === JSON.stringify(kernel.executeRelationEffect(p.executionInput)),'R4 fabricated');
    assert(a.execution.executionState === 'not-realized-generic-relation-effect' && a.relationRealizationResolved && a.relationRealized === false
        && a.execution.reverseEffect === null && a.execution.effectType === null,'noncommunication inverted');
    assert(b.execution.executionState === 'realized-relation-currently-unmapped' && b.relationRealizationResolved && b.relationRealized === true
        && !b.execution.realized && b.execution.effectType === null && !b.effectTypeMapped,'damage erased or automatically licensed');
    assert(!r.executionAuthorized && !r.relationEffects.length && !r.memberEdges.length && r.reverseEffect === null,'effect fabricated');
});
test('different realization states carry different authorization dispositions and independent evidence',() => {
    const [a,b] = evaluate().paths.map((p) => p.executionInput.authorization);
    assert(a.state === 'effect-authorization-not-applicable' && b.state === 'realized-edge-currently-unmapped','dispositions collapsed');
    assert(a.sourceEvidenceIds.includes('CF-SSOC-REALIZATION-01') && b.sourceEvidenceIds.includes('CF-SSOC-REALIZATION-02'),'provenance collapsed');
    assert([a,b].every((x) => !x.sourceBacked && !x.relationTypes.length && !x.authorityIds.length),'realization evidence became effect authority');
});
test('whole-chart no-communication normalizes to a non-actionable configuration',() => {
    const c = evaluate().configuration;
    assert(c.normalizedInput.validation.valid && c.normalizedInput.sourcePredicateType === 'configuration-state'
        && c.normalizedInput.annotationDisposition === 'configuration-state-only' && !c.normalizedInput.relationUnits.length,'configuration made relation');
    assert(JSON.stringify(c.targetResolution) === JSON.stringify(g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(c.normalizedInput)),'configuration R3 fabricated');
    assert(c.targetResolution.semanticLevel === 'configuration' && c.execution.executionState === 'generic-relation-effect-not-applicable'
        && c.execution.targetEndpoint === null && c.execution.effectType === null,'configuration became actor or failed pair');
    assert(JSON.stringify(c.execution) === JSON.stringify(kernel.executeRelationEffect(c.executionInput)),'configuration R4 fabricated');
});
test('no communication at configuration scope does not deny the source-asserted damage relation',() => {
    const r = evaluate(),c = r.configuration.review;
    assert(c.sourceSpan === '此局内无可通之理' && c.state === 'not-realized-in-source-context' && !c.allRelationsAbsent
        && !c.formationFailureIsActorNonrealization && r.paths[1].relationRealized === true,'global absence fabricated');
    assert(c.configurationActorEndpoint === null && !c.configurationMemberActorKeys.length && !c.compositionOrCausalRuleAuthorized,'configuration group or causal rule created');
});
test('Chou mixed hidden roles cannot classify the whole branch as a pure seal',() => {
    const b = g.baziCore,r = contract.RELATION_REVIEWS[1];
    assert(b.cangGanMap['丑'].map(([gan]) => b.shiShenMap['辛'][gan]).join() === '偏印,食神,比肩','mixed role premise missing');
    assert(r.sourceWholeBranchTenGod === null && r.targetWholeBranchTenGod === null && !r.hiddenRoleProjectionAuthorized
        && !r.branchExpandsToHiddenActors && r.targetRoleClass === 'source-named-seal-bearing-earth-branch','pure seal projection');
    assert(evaluate().paths[1].execution.targetEndpoint.actorKey === 'surface-branch:2:丑','hidden seal substituted');
});
test('bad seal or whole-chart failure does not materialize a killer-to-branch-seal negative edge',() => {
    const d = evaluate().deferredContext;
    assert(d.branchSealCandidateActorKey === 'surface-branch:2:丑' && d.branchMediationSourceEndpoint === null
        && !d.branchMediationPathIdentityResolved && d.branchMediationRealizationState === 'unresolved-relation-realization'
        && d.branchMediationEffectAuthority === null,'unreviewed cross-scope path bound');
    assert(!d.visibleKillerAutomaticallyBoundToBranchSeal && !d.branchDamageAutomaticallyNegatesKillerSealGeneration
        && !contract.CONTRACT.branchMediationNegativeCalibrationEstablished && !contract.CONFIGURATION_REVIEW.independentBranchMediationFailureAuthorized,'failure propagated');
    assert(evaluate().paths.length === 2 && !d.memberEdges.length && !d.reverseEdges.length,'extra edge created');
});
test('other source assertions remain context without an extra support denial or numeric outcome',() => {
    const d = evaluate().deferredContext;
    assert(d.sourceSpans.includes('戊土不能生化') && d.sourceSpans.includes('时杀紧克') && d.sourceSpans.includes('旺木克土坏印'),'source assertions erased');
    assert(!d.transformationResultMaterializationAuthorized && !d.sourcePartySwitchAuthorized && !d.fortuneOrBiographyIncluded
        && evaluate().numericScore === null && evaluate().relativeDominance === null,'context granted result actor or strength');
});
test('R5 cannot normalize an unlicensed damage input through existing positive families',() => {
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(c.SOURCE_FAMILY_REGISTRY).length === 7 && !Object.values(c.SOURCE_FAMILY_REGISTRY).some((f) => f.sourceRuleId === api.RULE_ID),'R5 family added');
    for (const fn of ['normalizeExactActorPair','normalizeExactBranchPair','normalizeExactBranchMediationPair']) {
        assert(normalizer.toExecutionInput(normalizer[fn](input(),actualContext())) === null,'borrowed unrelated license');
    }
});
test('unused branch and hidden actors are not prerequisites for the exact named paths',() => {
    const c = copy(actualContext()),keys = ['visible:3:丁','visible:0:戊','surface-branch:1:卯','surface-branch:2:丑'],keep = (p) => keys.includes(p.actorKey);
    c.inventory.actorProfiles = c.inventory.actorProfiles.filter(keep);c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter(keep);
    assert(api.evaluateSource(input(),c).status === STATES.RESOLVED,'unused actors required');
});
for (const [name,change] of [
    ['source text',(i) => { i.sourceCase.sourceText = i.sourceCase.sourceText.replace('远隔不通','近而相通'); }],
    ['chart',(i) => { i.sourceCase.chartKey = COMPARISON; }],
    ['day',(i) => { i.sourceCase.gans[2] = '庚'; }],
    ['fortune included',(i) => { i.sourceCase.sourceText += '交庚申克去木神'; }],
    ['visible hidden source',(i) => { i.relationReviews[0].sourceEndpoint.actorKey = 'hidden:3:酉:丁:0'; }],
    ['branch seal substitution',(i) => { i.relationReviews[0].targetEndpoint.actorKey = 'surface-branch:2:丑'; }],
    ['visible positive realization',(i) => { i.relationReviews[0].realizationAuthority.state = 'realized-in-source-context'; }],
    ['generation denial',(i) => { i.relationReviews[0].relationIdentity.functionType = 'generation'; }],
    ['passive direction reversal',(i) => { i.relationReviews[1].sourceEndpoint.actorKey = 'surface-branch:2:丑'; }],
    ['hidden branch source',(i) => { i.relationReviews[1].sourceEndpoint.actorKey = 'hidden:1:卯:乙:0'; }],
    ['hidden branch seal target',(i) => { i.relationReviews[1].targetEndpoint.actorKey = 'hidden:2:丑:己:0'; }],
    ['pure seal role',(i) => { i.relationReviews[1].targetWholeBranchTenGod = '偏印'; }],
    ['damage nonrealization',(i) => { i.relationReviews[1].realizationAuthority.state = 'not-realized-in-source-context'; }],
    ['generic restraint function',(i) => { i.relationReviews[1].relationIdentity.functionType = 'restraint'; }],
    ['damage opposition authority',(i) => { i.relationReviews[1].positiveEffectAuthority = 'CF-SBOO-EFFECT-01'; }],
    ['missing visible path',(i) => { i.relationReviews.shift(); }],
    ['missing branch path',(i) => { i.relationReviews.pop(); }],
    ['duplicate path',(i) => { i.relationReviews.push(copy(i.relationReviews[1])); }],
    ['configuration actor',(i) => { i.configurationReview.configurationActorEndpoint = 'surface-branch:2:丑'; }],
    ['configuration group',(i) => { i.configurationReview.configurationMemberActorKeys = ['surface-branch:1:卯','surface-branch:2:丑']; }],
    ['configuration all relation denial',(i) => { i.configurationReview.allRelationsAbsent = true; }],
    ['missing configuration',(i) => { delete i.configurationReview; }],
    ['missing deferred context',(i) => { delete i.deferredContext; }],
    ['cross-scope killer binding',(i) => { i.deferredContext.branchMediationSourceEndpoint = 'visible:3:丁'; }],
    ['failed generation propagation',(i) => { i.deferredContext.branchDamageAutomaticallyNegatesKillerSealGeneration = true; }],
    ['caller valid flag',(i) => { i.valid = true; }],
    ['caller execution',(i) => { i.execution = evaluate().paths[1].execution; }]
]) test(`independent canonical review refuses ${name}`,() => {
    const i = copy(input());change(i);const r = api.evaluateSource(i,actualContext());
    assert(r.status === STATES.INVALID && !r.paths.length && r.configuration === null && !r.relationEffects.length,'mutated review accepted');
});
test('invalid unknown and incomplete inputs remain closed',() => {
    for (const i of [null,undefined,{},[],api.inputForCase('unknown')]) assert(api.evaluateSource(i,actualContext()).status === STATES.INVALID,'invalid input accepted');
    for (const c of [null,{}, { chartKey:CHART },{ inventory:actualContext().inventory },{ chartKey:CHART,targetResolution:evaluate().paths[1].targetResolution }]) {
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'incomplete context accepted');
    }
});
for (const actorKey of ['visible:3:丁','visible:0:戊','surface-branch:1:卯','surface-branch:2:丑']) {
    test(`missing or duplicate ${actorKey} blocks actual endpoint consumption`,() => {
        for (const mode of ['missing','duplicate']) {
            const c = copy(actualContext());
            if (mode === 'missing') c.inventory.actorProfiles = c.inventory.actorProfiles.filter((p) => p.actorKey !== actorKey);
            else c.inventory.actorProfiles.push(copy(c.inventory.actorProfiles.find((p) => p.actorKey === actorKey)));
            const r = api.evaluateSource(input(),c);
            assert(r.status === STATES.UNRESOLVED && !r.paths.length && r.configuration === null,'missing identity fabricated');
        }
    });
    test(`wrong or missing ${actorKey} evidence remains unresolved`,() => {
        const visible = actorKey.startsWith('visible:');
        const fields = [['sourceScope','hidden-stem'],['position','hour-wrong'],['pillarIndex',1 - Number(actorKey.split(':')[1])],
            ['wuxing','invalid-element'],[visible ? 'gan' : 'zhi',visible ? '壬' : '午'],...(visible ? [['tenGod','偏财']] : [])];
        for (const [field,value] of fields) {
            const c = copy(actualContext());c.inventory.evidenceRecords.find((r) => r.actorKey === actorKey)[field] = value;
            assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'wrong evidence accepted');
        }
        const c = copy(actualContext());c.inventory.evidenceRecords = c.inventory.evidenceRecords.filter((r) => r.actorKey !== actorKey);
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'missing evidence accepted');
    });
}
test('malformed and sparse inventory cannot produce any reviewed path',() => {
    for (const field of ['actorProfiles','evidenceRecords']) for (const bad of [null,{},[null],[undefined],new Array(1)]) {
        const c = copy(actualContext());c.inventory[field] = bad;
        assert(api.evaluateSource(input(),c).status === STATES.UNRESOLVED,'bad inventory accepted');
    }
});
test('source outcomes do not transfer to adjacent or prior charts',() => {
    for (const chartKey of [COMPARISON,MONTH,ORIGINAL,POSITIVE,NEIGHBOR,'癸酉|甲子|丁卯|丙午','壬午|己酉|甲申|甲子']) {
        const r = api.evaluateSource(input(),contextFor(chartKey));
        assert(r.status === STATES.NOT_APPLICABLE && !r.paths.length && r.configuration === null,'cross-chart transfer');
    }
});
test('caller realization effect group or target hints cannot override actual chain',() => {
    const r = api.evaluateSource(input(),{ ...actualContext(),effectType:'anchor-opposition',realizationState:'not-realized-in-source-context',
        targetResolution:{ actorKey:'hidden:2:丑:己:0' },configurationActor:true,executionAuthorized:true });
    assert(r.paths[0].execution.executionState === 'not-realized-generic-relation-effect'
        && r.paths[1].execution.executionState === 'realized-relation-currently-unmapped'
        && r.configuration.execution.executionState === 'generic-relation-effect-not-applicable','caller supplied authority');
});
test('finite source coverage negative unmapped and configuration runtime counts remain separate',() => {
    const p = synthesis.contextualForcePartySourceSealObstructionContrast,q = api.buildProfile();
    assert(p.finiteSourceReviewComplete && p.newCompleteSourceCaseCount === 1 && p.reusedCompleteSourceCaseCount === 0
        && p.reviewedRelationCount === 2 && p.reviewedConfigurationCount === 1 && p.resolvedRuntimeNonrealizationCount === 1
        && p.realizedUnmappedRuntimePathCount === 1 && p.nonActionableRuntimeConfigurationCount === 1,'counts collapsed');
    assert(p.positiveEffectCount === 0 && p.newEffectAuthorityCount === 0 && !p.branchMediationNegativeCalibrationEstablished
        && !p.broaderSourceCoverageComplete,'coverage broadened');
    assert(q.finiteSourceReviewComplete && q.result.status === STATES.UNRESOLVED && q.resolvedRuntimeNonrealizationCount === 0
        && q.realizedUnmappedRuntimePathCount === 0 && q.nonActionableRuntimeConfigurationCount === 0,'static review fabricated runtime');
});
test('R24 R26 retain independent positive mediation negative restraint and clash context',() => {
    const s = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchMediationCalibration.result.execution.effectType === 'anchor-mediation'
        && s.contextualForcePartySourceBranchRestraintNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect'
        && !s.contextualForcePartySourceBranchRestraintNonrealization.result.excludedContext.clashNonrealizationInferred,'R24/R26 changed');
});
test('R25 visible communication remains independently negative',() => {
    const r = outputFor(COMPARISON).semanticModel.strengthSynthesis.contextualForcePartySourceMediationNoncommunication;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.result.execution.sourceEndpoint.actorKey === 'visible:1:丁'
        && r.result.execution.targetEndpoint.actorKey === 'visible:0:己','R25 transferred or changed');
});
test('R22 R23 preserve positive opposition and realized-unmapped branch direction',() => {
    const s = outputFor('壬午|己酉|甲申|甲子').semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceBranchOfficerOpposition.result.execution.effectType === 'anchor-opposition'
        && s.contextualForcePartySourceBranchKillerDirectionAudit.result.execution.executionState === 'realized-relation-currently-unmapped','R22/R23 changed');
});
test('R20 R21 retain prior failed unmapped non-actionable and ambiguous paths',() => {
    assert(outputFor(MONTH).semanticModel.strengthSynthesis.contextualForcePartySourceBladeRelationRealization.realizedUnmappedRuntimePathCount === 2,'R20 licensed');
    const r = outputFor('壬寅|己酉|庚午|丙戌').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast;
    assert(r.resolvedRuntimeNonrealizationCount === 1 && r.realizedUnmappedRuntimePathCount === 1 && r.nonActionableRuntimeConfigurationCount === 1,'R21 changed');
    assert(outputFor('戊子|戊午|戊戌|戊午').semanticModel.strengthSynthesis.contextualForcePartySourceBladeOutcomeContrast.unresolvedRuntimeTargetCount === 1,'two Wu selected');
});
test('R16 R17 R18 preserve failed actor relation ambiguous blade and empty result materialization',() => {
    const s = outputFor(ORIGINAL).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 changed');
    assert(s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.bladeCandidates.length === 2
        && s.contextualForcePartyTransformedSourceBladeIdentityAudit.result.targetIdentity.actorKey === null,'R17 selected');
    assert(s.contextualForcePartyTransformationResultIdentity.resolvedRuntimeSourceEndpointCount === 0
        && !g.baziContextualForcePartyTransformationResultIdentityContract.MATERIALIZATION_AUTHORITIES.length,'R18 materialized');
});
test('R9 R15 CASE06 and the generic vocabulary retain prior scope',() => {
    const r9 = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher.results
        .find((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation');
    assert(r9.execution.sourceEndpoint.actorKey === 'visible:0:癸' && r9.execution.targetEndpoint.actorKey === 'visible:1:甲','R9 scope changed');
    assert(outputFor(POSITIVE).semanticModel.strengthSynthesis.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 changed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 changed');
    const c = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(c.CONTRACT.currentEndpointShapes.length === 3 && c.ACTOR_TO_ACTOR_MOTIFS.length === 3
        && g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'generic vocabulary or direct patterns broadened');
});
test('finite source dependency leaves R11 four global blockers and final strength unresolved',() => {
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'source-coverage' && d.scope === contract.CONTRACT.reviewScope,'dependency widened');
    assert(outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 resolved');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final strength inferred');
});
test('key order frozen nested outputs and caller immutability are preserved',() => {
    const i = copy(input()),c = copy(actualContext()),before = JSON.stringify([i,c]);
    const r = api.evaluateSource(Object.fromEntries(Object.entries(i).reverse()),c);
    assert(r.status === STATES.RESOLVED && before === JSON.stringify([i,c]) && !Object.isFrozen(i) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(r.paths[1].review.realizationAuthority) && Object.isFrozen(r.deferredContext.sourceSpans)
        && Object.isFrozen(r.configuration.review.relatedSourcePathIds),'output mutable');
});
test('integration is inert without upstream and idempotent when installed',() => {
    const ext = g.baziContextualForcePartySourceSealObstructionContrast,base = {};
    assert(ext.extendSynthesis({},base) === base && ext.extendSynthesis({}, { state:'unavailable' }).state === 'unavailable','missing upstream fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'extension duplicated');
});
console.log(`\nSource Seal Obstruction Contrast tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
