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
const g = context.GuiJia,api = g.baziContextualForcePartySourceHiddenSealTargetReviewProfile;
const contract = g.baziContextualForcePartySourceHiddenSealTargetReviewContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '癸亥|甲子|戊戌|癸丑';
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

test('binds the source-named day hidden Ding through normalization and R3', () => {
    const result = evaluate();
    const unit = result.targetResolution?.unitResolutions[0];
    assert(result.status === STATES.TARGET_RESOLVED, JSON.stringify(result.blockerReasons));
    assert(result.targetActorKey === 'hidden:2:戌:丁:2', 'unexpected hidden target');
    assert(unit?.targetReference.scope === 'hidden-branch' && unit?.targetReference.targetRoleClass === '正印',
        'hidden 正印 scope was lost');
    assert(unit.targetReference.antecedentSpan === '中藏丁火印绶', 'source antecedent was lost');
    assert(result.normalizedInput.relationUnits[0].identityProvenance.sourceActorKeys.length === 0, 'target binding invented a source');
    assert(JSON.stringify(result.targetResolution) === JSON.stringify(
        g.baziContextualForcePartyGenericTargetLevelResolverProfile.resolveRecord(result.normalizedInput)), 'actual R3 result differs');
});

test('keeps clause negation apart from unresolved pair realization and R4 effects', () => {
    const result = evaluate();
    const gate = result.executionGate;
    assert(result.sourceAssertion.evidenceSpan === '财虽旺，不能破印' && result.sourceAssertion.sourceIdentityResolved === false,
        'source review was lost or overbound');
    assert(result.sourceEndpoint === null && result.sourceActorKey === null && result.sourceGroupId === null && result.relationIdentity === null,
        'unbound clause materialized a relation');
    assert(result.relationRealized === null && !result.relationRealizationResolved, 'clause negation was assigned to a pair');
    assert(gate.executionState === kernel.EXECUTION_STATES.UNRESOLVED && gate.blockerReasons.includes('source-type-missing'),
        'R4 did not refuse a missing source endpoint');
    assert(gate.effectType === null && gate.authorizationIds.length === 0 && result.effectAuthority === null
        && !result.executionAuthorized && !result.relationEffects.length && !result.memberEdges.length, 'execution or edges leaked');
});

test('preserves all seven structural wealth candidates without treating the list as a group', () => {
    const result = evaluate();
    const keys = result.wealthCandidates.map((candidate) => candidate.actorKey).sort();
    const expected = ['visible:0:癸', 'visible:3:癸', 'surface-branch:0:亥', 'surface-branch:1:子',
        'hidden:0:亥:壬:0', 'hidden:1:子:癸:0', 'hidden:3:丑:癸:1'].sort();
    assert(result.sourceCandidateInventoryComplete && JSON.stringify(keys) === JSON.stringify(expected), 'structural candidate set differs');
    assert(result.wealthCandidates.filter((candidate) => candidate.sourceScope === 'surface-branch')
        .every((candidate) => candidate.tenGod === null), 'whole branch inherited a hidden wealth role');
    assert(result.sourceGroupId === null && result.sourceAssertion.sourceActorKey === null, 'candidate set became an endpoint');
});

test('candidate loss never selects the sole remaining apparent source', () => {
    const context = copy(actualContext());
    const allowed = ['hidden:2:戌:丁:2', 'visible:0:癸'];
    context.inventory.actorProfiles = context.inventory.actorProfiles.filter((profile) => allowed.includes(profile.actorKey));
    context.inventory.evidenceRecords = context.inventory.evidenceRecords.filter((record) => allowed.includes(record.actorKey));
    const result = api.evaluateSource(input(), { ...context, sourceActorKey: 'visible:0:癸' });
    assert(result.status === STATES.TARGET_RESOLVED && result.wealthCandidates.length === 1, 'source gap erased the independently resolved target');
    assert(!result.sourceCandidateInventoryComplete && result.sourceEndpoint === null && result.relationRealized === null,
        'incomplete inventory or caller input selected an actor');
    assert(result.blockerReasons.includes('wealth-candidate-inventory-incomplete'), 'missing inventory was not reported');
});

test('requires unique matching inventory evidence for the named hidden target', () => {
    const actorKey = 'hidden:2:戌:丁:2';
    const mutate = [
        (inventory) => { inventory.actorProfiles = inventory.actorProfiles.filter((record) => record.actorKey !== actorKey); },
        (inventory) => { inventory.actorProfiles.push(inventory.actorProfiles.find((record) => record.actorKey === actorKey)); },
        (inventory) => { inventory.evidenceRecords = inventory.evidenceRecords.filter((record) => record.actorKey !== actorKey); },
        (inventory) => { inventory.evidenceRecords.push(inventory.evidenceRecords.find((record) => record.actorKey === actorKey)); },
        (inventory) => { inventory.evidenceRecords.find((record) => record.actorKey === actorKey).tenGod = '偏印'; },
        (inventory) => { inventory.evidenceRecords.find((record) => record.actorKey === actorKey).sourceScope = 'surface-branch'; }
    ];
    for (const change of mutate) {
        const context = copy(actualContext());
        change(context.inventory);
        const result = api.evaluateSource(input(), context);
        assert(result.status === STATES.UNRESOLVED && result.targetActorKey === null && result.executionGate === null,
            'unverified hidden target escaped inventory validation');
    }
});

test('rejects changed source, endpoint and authorization claims', () => {
    const changes = [
        (review) => { review.sourceCase.sourceText = review.sourceCase.sourceText.replace('不能破印', '能破印'); },
        (review) => { review.targetReview.stableActorKey = 'surface-branch:2:戌'; },
        (review) => { review.assertionReview.sourceActorKey = 'visible:0:癸'; },
        (review) => { review.assertionReview.sourceGroupId = 'all-wealth'; },
        (review) => { review.assertionReview.state = 'not-realized-in-source-context'; }
    ];
    for (const change of changes) {
        const review = copy(input());
        change(review);
        const result = api.evaluateSource(review, actualContext());
        assert(result.status === STATES.INVALID && result.executionGate === null, 'changed review retained authority');
    }
});

test('limits the review to the registered chart and preserves R29 and R30 outcomes', () => {
    const positive = outputFor('戊辰|乙卯|辛丑|丁酉').semanticModel.strengthSynthesis;
    const negative = outputFor('乙亥|辛巳|戊申|甲寅').semanticModel.strengthSynthesis;
    assert(positive.contextualForcePartySourceHiddenSealTargetReview.result.status === STATES.NOT_APPLICABLE
        && negative.contextualForcePartySourceHiddenSealTargetReview.result.status === STATES.NOT_APPLICABLE, 'review transferred');
    assert(positive.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage',
        'R29 positive authority changed');
    assert(negative.contextualForcePartySourceBranchSealDamageNonrealization.result.execution.executionState === kernel.EXECUTION_STATES.NOT_REALIZED,
        'R30 negative realization changed');
});

test('integrates one hidden-target resolution without closing source, scope or strength blockers', () => {
    const view = synthesis.contextualForcePartySourceHiddenSealTargetReview;
    assert(view.finiteSourceReviewComplete && view.newCompleteSourceCaseCount === 1 && view.resolvedRuntimeHiddenTargetCount === 1
        && view.resolvedRuntimeNonrealizationCount === 0 && view.newEffectAuthorityCount === 0, 'coverage counters differ');
    assert(!contract.CONTRACT.hiddenSealDamageNegativeCalibrationEstablished && !contract.CONTRACT.genericHiddenTargetResolverDefined,
        'finite target review promoted to general or negative calibration');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only',
        'global research advanced beyond evidence');
    const family = g.baziContextualForcePartyEffectAuthorizationNormalizedInputContract;
    assert(Object.keys(family.SOURCE_FAMILY_REGISTRY).length === 7 && family.CONTRACT.allowedRelationTypes.length === 4,
        'authorization families or effect vocabulary changed');
    assert(normalizer.toExecutionInput(normalizer.normalizeExactRecipientSealDamagePair(input(), actualContext())) === null, 'R29 license transferred');
});

console.log(`\nSource Hidden Seal Target Review tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
