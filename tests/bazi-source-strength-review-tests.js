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
const g = context.GuiJia,api = g.baziSourceStrengthReviewProfile;
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

const charts = g.baziSourceStrengthReviewSource.CASES.map((item) => item.chartKey);
const modelFor = (key) => outputFor(key).semanticModel;
const review = (key) => modelFor(key).strengthSynthesis.sourceStrengthReview;
const claim = (result, id) => result.assertions.find((item) => item.claimId === id);

test('four complete source charts bind their own claims through the research pipeline', () => {
    assert(api.validateCorpus(), 'source corpus is invalid');
    for (const key of charts) {
        const result = review(key);
        assert(result.state === 'reviewed-exact-source-case', JSON.stringify(result.assertions.filter((item) => !item.verifiedValue)));
        assert(result.assertions.every((item) => item.chartKey === key && item.evidence.every((ref) => ref.sourceUrl && ref.locator && ref.span)), 'source provenance lost');
        assert(Object.isFrozen(result) && Object.isFrozen(result.assertions[0].verifiedValue), 'review is mutable');
    }
});

test('direct daymaster support and cross-actor modifiers retain different targets and do not duplicate force', () => {
    const result = review(charts[0]);
    assert(result.directContributions.length === 2 && result.relationModifiers.length === 2, 'contribution roles collapsed');
    assert(result.directContributions.every((item) => item.subjectKeys[1] === 'daymaster:2:庚'), 'modifier became direct support');
    assert(claim(result, 'SSR-01-C2').subjectKeys[0] === 'surface-branch:3:辰', 'whole branch became hidden 戊');
    assert(claim(result, 'SSR-01-M2').subjectKeys.join() === 'visible:3:庚,visible:0:壬', 'peer support or source direction was substituted');
    assert(claim(result, 'SSR-01-M2').verifiedValue.realization === 'unresolved'
        && claim(result, 'SSR-01-M2').verifiedValue.availability === 'source-asserted-capable', '可生 became realized generation');
    assert(claim(result, 'SSR-01-M1').verifiedValue.force === 'source-asserted-effective', 'effective local restraint was lost');
    assert(result.numericForce === null && result.relationEffects.length === 0 && result.memberEdges.length === 0, 'source review minted force or authority');
});

test('ineffective restraint remains separate from explicit nonrealization on the same source chart', () => {
    const result = review(charts[1]);
    const ineffective = claim(result, 'SSR-02-M1').verifiedValue;
    const restraint = claim(result, 'SSR-02-M2');
    const generation = claim(result, 'SSR-02-M3');
    assert(ineffective.realization === 'unresolved' && ineffective.force === 'source-asserted-ineffective', '无力 became binary nonrealization');
    assert(restraint.subjectKeys.join() === generation.subjectKeys.join(), 'parallel functions no longer share the reviewed pair');
    assert(restraint.verifiedValue.realization === 'realized' && generation.verifiedValue.realization === 'not-realized', 'restraint and generation collapsed');
    assert(result.sourceConclusions.length === 0 && result.computedStrength === null, 'an unsuccessful life outcome or ineffective modifier became daymaster weakness');
});

test('the previous-chart antecedent is kept with its own actors and never copied to the current chart', () => {
    const first = review(charts[0]), second = review(charts[1]);
    assert(claim(first, 'SSR-01-M1').evidence.some((item) => item.referent === 'previous-chart' && item.excerptId === 'SSR-T02'), 'contrast antecedent lost');
    assert(second.assertions.every((item) => item.evidence.every((ref) => ref.referent === 'current-chart')), 'previous chart evidence leaked');
    assert(claim(first, 'SSR-01-M1').contextKeys.join() === 'surface-branch:0:申'
        && claim(second, 'SSR-02-M1').contextKeys.join() === 'surface-branch:0:午', 'root and seat contexts were transferred');
});

test('pair comparison, daymaster strength, season and quantity stay separate propositions', () => {
    const pair = review(charts[0]), weak = review(charts[2]), strong = review(charts[3]);
    assert(pair.sourceConclusions[0].verifiedValue.relation === 'source-asserted-shen-sha-liang-ting'
        && !('strength' in pair.sourceConclusions[0].verifiedValue), '两停 became global balanced');
    assert(claim(weak, 'SSR-03-S1').verifiedValue.state === 'source-asserted-jian-lu'
        && weak.sourceConclusions[0].verifiedValue.strength === 'weak', 'season overrode the authored weak judgment');
    assert(claim(strong, 'SSR-04-S1').verifiedValue.state === 'source-asserted-out-of-season'
        && strong.sourceConclusions[0].verifiedValue.strength === 'strong', 'season overrode the authored strong judgment');
    assert(claim(strong, 'SSR-04-Q1').verifiedValue.quantity === 'minority'
        && claim(strong, 'SSR-04-Q1').verifiedValue.memberKeys === null, 'quantity became membership or a count');
    assert([pair, weak, strong].every((item) => item.computedStrength === null && item.computedDominance === null), 'source judgment became runtime output');
});

test('unnamed seal damage and root endpoints do not inherit a visible or hidden actor', () => {
    const result = review(charts[2]);
    const observation = claim(result, 'SSR-03-O1');
    assert(!observation.subjectKeys.length && !observation.bindings.length && observation.verifiedValue.targetEndpoint === null, '独印 was automatically bound');
    assert(claim(result, 'SSR-03-F1').verifiedValue.rootEndpoints === 'unspecified', 'deep roots selected an endpoint');
    assert(result.relationModifiers.length === 0, 'role observation became executable seal damage');
});

test('missing participants invalidate dependent assertions while retaining independent evidence', () => {
    const model = modelFor(charts[0]), base = model.strengthSynthesis;
    const inventory = base.contextualForcePartyMembershipInventory;
    const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: {
        ...inventory, actorProfiles: inventory.actorProfiles.filter((item) => item.actorKey !== 'visible:3:庚')
    } });
    assert(result.state === 'reviewed-with-identity-gaps', 'missing peer ignored');
    assert(!claim(result, 'SSR-01-C1').verifiedValue && !claim(result, 'SSR-01-M2').verifiedValue
        && !claim(result, 'SSR-01-J1').verifiedValue, 'dependent source claims remained usable');
    assert(claim(result, 'SSR-01-M1').verifiedValue && claim(result, 'SSR-01-C2').verifiedValue, 'independent source claims were erased');
    assert(claim(result, 'SSR-01-J1').sourceValue.relation === 'source-asserted-shen-sha-liang-ting', 'authored assertion was erased');
});

test('wrong-scope evidence, conflicting evidence and duplicate actor identities fail closed', () => {
    const model = modelFor(charts[1]), base = model.strengthSynthesis;
    const original = base.contextualForcePartyMembershipInventory;
    const key = 'visible:0:壬';
    const variants = [
        { ...original, evidenceRecords: original.evidenceRecords.map((item) => item.actorKey === key ? { ...item, sourceScope: 'hidden-modifier' } : item) },
        { ...original, evidenceRecords: [...original.evidenceRecords, { ...original.evidenceRecords.find((item) => item.actorKey === key), gan: '癸' }] },
        { ...original, actorProfiles: [...original.actorProfiles, original.actorProfiles.find((item) => item.actorKey === key)] }
    ];
    for (const inventory of variants) {
        const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: inventory });
        assert(result.relationModifiers.every((item) => !item.verifiedValue), 'malformed identity accepted');
        assert(claim(result, 'SSR-02-F1').verifiedValue, 'independent day-seat evidence was erased');
    }
});

test('missing branch context blocks only that context and dependent conclusions', () => {
    const model = modelFor(charts[3]), base = model.strengthSynthesis;
    const inventory = base.contextualForcePartyMembershipInventory;
    const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: {
        ...inventory, evidenceRecords: inventory.evidenceRecords.filter((item) => item.actorKey !== 'surface-branch:3:寅')
    } });
    assert(!claim(result, 'SSR-04-F1').verifiedValue && !claim(result, 'SSR-04-J1').verifiedValue, 'missing configuration actor ignored');
    assert(claim(result, 'SSR-04-S1').verifiedValue && claim(result, 'SSR-04-Q1').verifiedValue, 'independent season or authored quantity lost');
});

test('nearby and unknown charts cannot inherit source conclusions or complete absent chart evidence', () => {
    for (const key of ['壬申|丙午|庚午|庚寅', '庚申|辛巳|丙戌|乙未', '甲子|丙寅|戊辰|庚申']) {
        const result = review(key);
        assert(result.state === 'no-exact-source-case' && !result.assertions.length && result.computedStrength === null, 'exact source conclusion transferred');
    }
    const result = api.buildProfile({}, {});
    assert(result.chartKey === null && !result.assertions.length && result.runtimeCoverage.synthesisStatus === 'unavailable', 'empty input was completed');
});

test('runtime alignment reuses existing realization and reports missing, unresolved and conflicting functions', () => {
    const model = modelFor(charts[0]), base = model.strengthSynthesis, result = base.sourceStrengthReview;
    const aligned = claim(result, 'SSR-01-M1').runtimeAlignment;
    assert(aligned.state === 'realization-agrees' && aligned.runtimeRecords.some((item) => item.sourcePatternId === 'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001'), 'existing source realization not reused');
    assert(claim(result, 'SSR-01-C1').runtimeAlignment.state === 'realization-agrees'
        && claim(result, 'SSR-01-C1').runtimeAlignment.directed === false, 'exact peer realization was lost or became directed');
    assert(claim(result, 'SSR-01-C2').runtimeAlignment.state === 'no-runtime-function', 'whole-branch contribution became a visible function');
    assert(claim(result, 'SSR-01-M2').runtimeAlignment.state === 'source-realization-unspecified', 'capability supplied realization');
    const existing = base.visibleStemFunctionRealizationRecords.find((item) => item.sourcePatternId === 'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001');
    const contrary = { ...existing, id: 'synthetic-conflict', realizationState: 'not-realized-in-source-context' };
    for (const runtimeRecords of [[contrary], [existing, contrary]]) {
        const conflicted = api.buildProfile(model, { ...base, visibleStemFunctionRealizationRecords: runtimeRecords });
        assert(claim(conflicted, 'SSR-01-M1').runtimeAlignment.state === 'realization-conflict', 'opposing runtime realization was silently overwritten');
        assert(claim(conflicted, 'SSR-01-M1').verifiedValue.realization === 'realized' && conflicted.computedStrength === null, 'conflict rewrote source or forced final output');
    }
    const reversed = api.buildProfile(model, { ...base, visibleStemFunctionRealizationRecords: [{ ...existing,
        sourceActorKey: existing.targetActorKey, targetActorKey: existing.sourceActorKey }] });
    assert(claim(reversed, 'SSR-01-M1').runtimeAlignment.state === 'no-runtime-function', 'reverse direction matched');
});

test('source review exposes actual runtime gaps without rewriting contributions or final assessment', () => {
    for (const key of [...charts, '戊辰|乙卯|辛丑|丁酉']) {
        const model = modelFor(key), base = model.strengthSynthesis;
        const result = base.sourceStrengthReview;
        const before = JSON.stringify(base);
        const extended = g.baziSourceStrengthReview.extendSynthesis(model, base);
        assert(extended.sufficiency === base.sufficiency && extended.dependencies === base.dependencies
            && extended.visibleStemDaymasterContributionRecords === base.visibleStemDaymasterContributionRecords, 'source review rewrote runtime coverage');
        assert(JSON.stringify(base) === before, 'upstream synthesis mutated');
        assert(result.runtimeCoverage.visibleContributionRecords.length === base.visibleStemDaymasterContributionRecords.length, 'runtime records missing');
        assert(JSON.stringify(result.runtimeCoverage.blockingDependencyIds) === JSON.stringify(base.sufficiency.blockingDependencyIds), 'runtime blockers lost');
        assert(result.runtimeCoverage.unresolvedVisibleContributionIds.length > 0, 'fixture no longer exercises unresolved runtime contributions');
        assert(base.sufficiency.status === 'insufficient' && model.assessmentLayer.state === 'contract-only', 'source labels enabled final classification');
        assert(base.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4, 'global authorizations expanded');
    }
    assert(modelFor('戊辰|乙卯|辛丑|丁酉').strengthSynthesis.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage', 'R29 authority changed');
});

test('exact peer support reaches the existing contribution contract through profile interpretation', () => {
    const base = modelFor(charts[0]).strengthSynthesis;
    const peer = base.visibleStemDaymasterContributionRecords.find((item) => item.functionType === 'peer-support');
    assert(peer.resolutionStatus === 'resolved-realized-daymaster-contribution'
        && peer.contributionState === 'realized-daymaster-contribution-in-source-context', 'verified support stopped before contribution');
    assert(peer.directed === false && peer.sourceActorKey === null && peer.targetActorKey === null
        && peer.peerParticipantActorKeys.join() === 'visible:3:庚,daymaster:2:庚', 'peer gained artificial direction');
    assert(peer.profileInterpretationState === 'peer-support-realized-with-separate-generation-capability-in-source-context', 'source profile qualifier lost');
    assert(base.visibleStemDaymasterContributionRecords.filter((item) => item.contributionState === 'realized-daymaster-contribution-in-source-context').length === 1, 'modifier or capability duplicated direct contribution');
    assert(base.visibleStemFunctionRealizationRecords.every((item) => !(item.sourceActorKey === 'visible:3:庚' && item.targetActorKey === 'visible:0:壬')), 'capability became an executable generation');
    assert(peer.actorGlobalEffectiveState === null && base.sufficiency.status === 'insufficient', 'local support became global force or sufficiency');
});

test('the contrasted same pair carries realized restraint and absent generation without resolving ineffective restraint', () => {
    const base = modelFor(charts[1]).strengthSynthesis;
    const pair = base.visibleStemFunctionRealizationRecords.filter((item) => item.sourceActorKey === 'visible:3:戊' && item.targetActorKey === 'visible:0:壬');
    assert(pair.length === 2 && pair.some((item) => item.functionType === 'restraint' && item.realizationState === 'realized-in-source-context')
        && pair.some((item) => item.functionType === 'generation' && item.realizationState === 'not-realized-in-source-context'), 'distinct same-pair functions lost');
    assert(pair.every((item) => item.relationScope === 'cross-visible-actor' && item.sourceProvenance.retrievedOn === '2026-11-25'), 'modifier provenance lost');
    assert(base.sourceStrengthReview.assertions.filter((item) => ['SSR-02-M2','SSR-02-M3'].includes(item.claimId))
        .every((item) => item.runtimeAlignment.state === 'realization-agrees'), 'review no longer matches registered contrast');
    assert(!base.visibleStemFunctionRealizationRecords.some((item) => item.sourceActorKey === 'visible:0:壬' && item.targetActorKey === 'visible:1:丙'), '无力 generated binary realization');
    assert(base.visibleStemDaymasterContributionRecords.every((item) => item.functionRealizationState === 'unresolved'), 'cross functions supplied direct contribution');
});

test('peer source resolution requires one intact unordered directed-function participant pair', () => {
    const model = modelFor(charts[0]), base = model.strengthSynthesis;
    const source = g.baziVisibleStemFunctionRealizationSource;
    const directed = base.visibleStemDirectedFunctionRecords;
    const peer = directed.find((item) => item.directed === false);
    const runWith = (items) => source.buildDirectSourceRecords(model, { ...base, visibleStemDirectedFunctionRecords: items })
        .filter((item) => item.directed === false);
    const others = directed.filter((item) => item !== peer);
    assert(runWith([...others, { ...peer, peerParticipants: [...peer.peerParticipants].reverse() }]).length === 1, 'unordered peer rejected');
    const malformed = [
        [], [...others, peer, peer],
        [...others, { ...peer, peerParticipants: [peer.peerParticipants[0], peer.peerParticipants[0]] }],
        [...others, { ...peer, peerParticipants: [...peer.peerParticipants, peer.peerParticipants[0]] }],
        [...others, { ...peer, directed: true }],
        [...others, { ...peer, sourceActor: peer.peerParticipants[0] }],
        [...others, { ...peer, strengthMeaning: 'restraint' }]
    ];
    assert(malformed.every((items) => runWith(items).length === 0), 'damaged peer function accepted');
    const noMaster = { ...model, strengthEvidence: { ...model.strengthEvidence, dayMaster: null } };
    assert(source.buildDirectSourceRecords(noMaster, base).length === 0, 'missing daymaster completed from source chart');
});

test('contrary peer outcomes survive refinement and block profile interpretation', () => {
    const model = modelFor(charts[0]), base = model.strengthSynthesis;
    const apiSource = g.baziVisibleStemFunctionRealizationSource;
    const existing = base.visibleStemFunctionRealizationRecords.find((item) => item.directed === false);
    const contrary = { ...existing, realizationState: 'not-realized-in-source-context', resolutionStatus: 'resolved-source-function-not-realized' };
    const altered = { ...base, visibleStemFunctionRealizationRecords: base.visibleStemFunctionRealizationRecords.map((item) => item === existing ? contrary : item) };
    const sourceRecords = apiSource.buildDirectSourceRecords(model, altered);
    const refined = apiSource.refineRealizationRecords(model, altered, sourceRecords);
    const pair = refined.filter((item) => item.directed === false);
    assert(pair.length === 2 && new Set(pair.map((item) => item.id)).size === 2, 'contrary evidence was replaced or duplicated IDs');
    const aggregated = g.baziVisibleStemActorInteractionAggregation.extendSynthesis(model, { ...base, visibleStemFunctionRealizationRecords: refined });
    const composed = g.baziVisibleStemActorFunctionComposition.extendSynthesis(model, aggregated);
    const interpreted = g.baziVisibleStemActorProfileInterpretation.extendSynthesis(model, composed);
    const profile = interpreted.visibleStemActorProfileInterpretationRecords.find((item) => item.actorKey === 'visible:3:庚');
    assert(profile.resolutionStatus === 'blocked-upstream-profile-readiness', 'conflicting peer support interpreted');
    const contributed = g.baziVisibleStemDaymasterContribution.extendSynthesis(model, interpreted);
    assert(contributed.visibleStemDaymasterContributionRecords.filter((item) => item.visibleActorKey === 'visible:3:庚')
        .every((item) => item.contributionState !== 'realized-daymaster-contribution-in-source-context'), 'conflicting profile authorized positive contribution');
});

test('extra known functions and wrong peer identity cannot inherit the exact profile interpretation', () => {
    const base = modelFor(charts[0]).strengthSynthesis;
    const apiProfile = g.baziVisibleStemActorProfileInterpretation;
    const profile = base.visibleStemActorFunctionProfileRecords.find((item) => item.actorKey === 'visible:3:庚');
    assert(apiProfile.buildInterpretationRecord(profile).resolutionStatus === 'resolved-exact-source-profile-interpretation', 'valid profile rejected');
    const entry = profile.functionEntries[0];
    for (const changed of [
        { ...profile, functionEntries: [...profile.functionEntries, { ...entry, functionType: 'generation' }] },
        { ...profile, readinessStatus: 'incomplete-realization-coverage' },
        { ...profile, functionEntries: [{ ...entry, peerParticipantActorKeys: ['visible:3:庚', 'daymaster:2:辛'] }] },
        { ...profile, functionEntries: [{ ...entry, directed: true }] },
        { ...profile, functionEntries: [{ ...entry, sourcePatternIds: [] }] }
    ]) assert(apiProfile.buildInterpretationRecord(changed).resolutionStatus !== 'resolved-exact-source-profile-interpretation', 'unsupported profile inherited interpretation');
});

test('near charts retain unresolved peer realization and no positive contribution', () => {
    const base = modelFor('壬申|丙午|庚午|庚寅').strengthSynthesis;
    const peer = base.visibleStemDaymasterContributionRecords.find((item) => item.functionType === 'peer-support');
    assert(peer.functionRealizationState === 'unresolved' && peer.contributionState === 'unresolved-daymaster-contribution', 'peer support generalized by stems');
});

console.log(`\nSource Strength Review tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);

