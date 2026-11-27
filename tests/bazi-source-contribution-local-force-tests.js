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
const g = context.GuiJia,api = g.baziSourceContributionLocalForceProfile;
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

const first = '壬申|丙午|庚午|庚辰', second = '壬午|丙午|庚申|戊寅';
const modelFor = (key = first) => outputFor(key).semanticModel;
const view = (key = first) => modelFor(key).strengthSynthesis.sourceContributionLocalForce;
const authority = (id = 'SCLF-BRANCH-SUPPORT-01') => api.inputForAuthority(id);
const clone = (value) => JSON.parse(JSON.stringify(value));
const evaluate = (input, model, base) => api.evaluateAuthority(input, model, base || model.strengthSynthesis);

test('whole 辰 contributes direct daymaster support under its own exact-source profile', () => {
    const result = view(), record = result.branchContributions[0];
    assert(result.branchContributions.length === 1 && record.sourceActorKey === 'surface-branch:3:辰'
        && record.targetActorKey === 'daymaster:2:庚' && record.sourceScope === 'surface-branch', 'whole branch identity changed');
    assert(record.functionRealizationState === 'realized-in-source-context' && record.strengthMeaning === 'support'
        && record.resolutionStatus === 'resolved-realized-daymaster-contribution', 'source-supported contribution not executed');
    const reviewed = result.results.find((item) => item.contributionRecord);
    assert(record.profileInterpretationId === reviewed.profileInterpretation.id
        && reviewed.profileInterpretation.sourceSpan.includes('辰土也'), 'independent profile authority lost');
    assert(Object.isFrozen(record) && Object.isFrozen(record.relationIdentity), 'contribution output is mutable');
    assert(record.actorGlobalEffectiveness === null && !result.relationEffects.length && !result.memberEdges.length, 'whole-branch support minted global state or typed effect');
});

test('visible support is indexed once by reference and branch support creates no hidden or mediation pair', () => {
    const model = modelFor(), base = model.strengthSynthesis, result = base.sourceContributionLocalForce;
    assert(result.visibleContributionReferences.length === base.visibleStemDaymasterContributionRecords.length, 'visible contribution index changed');
    assert(result.visibleContributionReferences.every((ref) => Object.keys(ref).sort().join() === 'contributionState,id,sourceField'
        && base.visibleStemDaymasterContributionRecords.some((item) => item.id === ref.id)), 'visible reference became copied evidence');
    assert(result.branchContributions.every((item) => !JSON.stringify(item).includes('hidden:')), 'hidden member expansion leaked');
    assert(result.results.every((item) => item.relationIdentity?.functionType !== 'mediation'), 'source profile invented a mediation pair');
    assert(base.visibleStemDaymasterContributionRecords.filter((item) => item.contributionState === 'realized-daymaster-contribution-in-source-context').length === 1,
        'whole-branch record overwrote visible support coverage');
});

test('local force binds the same directed restraint separately in the two exact charts', () => {
    const a = view().localForceQualifiers[0], b = view(second).localForceQualifiers[0];
    assert(a.qualifier === 'source-asserted-effective' && b.qualifier === 'source-asserted-ineffective', 'local force contrast lost');
    assert(a.relationIdentity.sourceActorKey === b.relationIdentity.sourceActorKey
        && a.relationIdentity.targetActorKey === b.relationIdentity.targetActorKey && a.relationIdentity.chartKey !== b.relationIdentity.chartKey,
        'same actor spelling erased chart context');
    assert(a.verifiedContextActorKeys.join() === 'surface-branch:0:申' && b.verifiedContextActorKeys.join() === 'surface-branch:0:午', 'seat context transferred');
    assert(a.applicationState === 'attached-to-matching-runtime-relation' && a.sourceRealization === 'realized', 'positive qualifier lost actual runtime alignment');
    assert(b.applicationState === 'source-only-realization-unresolved' && b.sourceRealization === 'unresolved'
        && b.runtimeRealization.state === 'no-runtime-function', 'ineffective force supplied binary realization');
    assert([a, b].every((item) => item.numericForce === null && item.actorGlobalEffectiveness === null && item.reverseEffect === null), 'force became a score or reverse effect');
});

test('authority IDs alone, changed endpoints, altered wording and copied case conclusions do not authorize contribution', () => {
    const model = modelFor();
    const input = authority();
    for (const changed of [null, {}, { id: input.id }, { ...input, sourceActorKey: 'hidden:3:辰:戊:0' },
        { ...input, targetActorKey: 'visible:3:庚' }, { ...input, profileSpan: '身杀两停' },
        { ...input, strengthMeaning: 'restraint' }, { ...input, realization: 'not-realized' }, { ...input, sourceValue: 'strong' }]) {
        const result = evaluate(changed, model);
        assert(result.status === 'invalid-source-authority' && !result.contributionRecord && !result.forceQualifierRecord, 'tampered authority accepted');
    }
    assert(evaluate(clone(input), model).contributionRecord, 'structured exact authority copy rejected');
});

test('force authority cannot be changed to generation, another chart or another force outcome', () => {
    const model = modelFor(), input = authority('SCLF-LOCAL-FORCE-01');
    for (const changed of [{ ...input, functionType: 'generation' }, { ...input, forceQualifier: 'source-asserted-ineffective' },
        { ...input, chartKey: second }, { ...input, contextActorKeys: ['surface-branch:2:申'] }, { ...input, claimId: 'SSR-01-J1' }]) {
        assert(evaluate(changed, model).status === 'invalid-source-authority', 'changed force authority accepted');
    }
});

test('missing whole-branch evidence blocks branch contribution while independent visible force survives', () => {
    const model = modelFor(), base = model.strengthSynthesis, inventory = base.contextualForcePartyMembershipInventory;
    for (const changed of [
        { ...inventory, actorProfiles: inventory.actorProfiles.filter((item) => item.actorKey !== 'surface-branch:3:辰') },
        { ...inventory, evidenceRecords: inventory.evidenceRecords.filter((item) => item.actorKey !== 'surface-branch:3:辰') }
    ]) {
        const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: changed });
        assert(!result.branchContributions.length && result.localForceQualifiers.length === 1, 'identity gaps leaked or erased unrelated force');
    }
});

test('wrong-scope, duplicate and contradictory whole-branch identity evidence cannot yield support', () => {
    const model = modelFor(), base = model.strengthSynthesis, inventory = base.contextualForcePartyMembershipInventory;
    const key = 'surface-branch:3:辰', row = inventory.evidenceRecords.find((item) => item.actorKey === key);
    for (const changed of [
        { ...inventory, actorProfiles: [...inventory.actorProfiles, inventory.actorProfiles.find((item) => item.actorKey === key)] },
        { ...inventory, evidenceRecords: inventory.evidenceRecords.map((item) => item.actorKey === key ? { ...item, sourceScope: 'hidden-modifier' } : item) },
        { ...inventory, evidenceRecords: [...inventory.evidenceRecords, { ...row, pillarIndex: 2 }] },
        { ...inventory, evidenceRecords: [...inventory.evidenceRecords, { ...row, wuxing: '火' }] }
    ]) assert(!evaluate(authority(), model, { ...base, contextualForcePartyMembershipInventory: changed }).contributionRecord, 'invalid branch evidence accepted');
});

test('missing daymaster evidence blocks support and cannot be replaced by a cached review', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    const damaged = { ...model, strengthEvidence: { ...model.strengthEvidence, dayMaster: null } };
    assert(!evaluate(authority(), damaged, base).contributionRecord, 'missing daymaster inferred from cached review');
    const inventory = base.contextualForcePartyMembershipInventory;
    const changed = { ...base, sourceStrengthReview: clone(base.sourceStrengthReview), contextualForcePartyMembershipInventory: {
        ...inventory, actorProfiles: inventory.actorProfiles.filter((item) => item.actorKey !== 'surface-branch:3:辰')
    } };
    assert(!evaluate(authority(), model, changed).contributionRecord, 'cached verified assertion bypassed actual identity review');
});

test('missing source seat context withholds the force qualifier without blocking unrelated branch support', () => {
    const model = modelFor(), base = model.strengthSynthesis, inventory = base.contextualForcePartyMembershipInventory;
    const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: {
        ...inventory, evidenceRecords: inventory.evidenceRecords.filter((item) => item.actorKey !== 'surface-branch:0:申')
    } });
    assert(result.branchContributions.length === 1 && !result.localForceQualifiers.length, 'seat context was inferred or erased unrelated support');
});

test('contrary branch realization blocks positive support rather than being overwritten', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    const contrary = { id: 'TEST-BRANCH-NEGATIVE', directed: true, relationScope: 'daymaster-related',
        sourceActorKey: 'surface-branch:3:辰', targetActorKey: 'daymaster:2:庚', functionType: 'generation', realizationState: 'not-realized-in-source-context' };
    const result = evaluate(authority(), model, { ...base,
        visibleStemFunctionRealizationRecords: [...base.visibleStemFunctionRealizationRecords, contrary] });
    assert(result.status === 'contribution-blocked' && !result.contributionRecord && result.sourceAssertion.verifiedValue.realization === 'realized',
        'source assertion or contrary runtime evidence was overwritten');
    const future = evaluate(authority(), model, { ...base,
        visibleStemFunctionRealizationRecords: [{ ...contrary, realizationState: 'future-resolved-state' }] });
    assert(future.status === 'contribution-blocked' && !future.contributionRecord, 'unknown future realization was accepted');
});

test('local qualifier disagreement preserves authored force while blocking runtime application', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    const input = authority('SCLF-LOCAL-FORCE-01');
    const existing = base.visibleStemFunctionRealizationRecords.find((item) => item.sourceActorKey === input.sourceActorKey && item.targetActorKey === input.targetActorKey);
    const contrary = { ...existing, id: 'TEST-FORCE-NEGATIVE', realizationState: 'not-realized-in-source-context' };
    for (const entries of [[contrary], [existing, contrary]]) {
        const result = evaluate(input, model, { ...base, visibleStemFunctionRealizationRecords: entries });
        assert(result.forceQualifierRecord.qualifier === 'source-asserted-effective'
            && result.forceQualifierRecord.applicationState.startsWith('blocked-'), 'force erased or used to override realization');
        assert(!result.contributionRecord, 'local force became direct contribution');
    }
});

test('wrong direction, wrong function and wrong scope cannot supply local realization alignment', () => {
    const model = modelFor(), base = model.strengthSynthesis, input = authority('SCLF-LOCAL-FORCE-01');
    const existing = base.visibleStemFunctionRealizationRecords.find((item) => item.sourceActorKey === input.sourceActorKey && item.targetActorKey === input.targetActorKey);
    for (const record of [{ ...existing, sourceActorKey: existing.targetActorKey, targetActorKey: existing.sourceActorKey },
        { ...existing, functionType: 'generation' }, { ...existing, relationScope: 'daymaster-related' }]) {
        const result = evaluate(input, model, { ...base, visibleStemFunctionRealizationRecords: [record] });
        assert(result.forceQualifierRecord.applicationState === 'source-only-realization-unresolved', 'wrong runtime function acquired qualifier');
    }
});

test('force qualifiers neither invent realization nor turn a negative function into reverse force', () => {
    const model = modelFor(second), base = model.strengthSynthesis;
    const before = JSON.stringify(base.visibleStemFunctionRealizationRecords);
    const result = api.buildProfile(model, base);
    assert(result.localForceQualifiers.length === 1 && result.branchContributions.length === 0, 'unregistered support inferred');
    assert(JSON.stringify(base.visibleStemFunctionRealizationRecords) === before, 'force qualifier rewrote runtime realization');
    assert(base.visibleStemFunctionRealizationRecords.filter((item) => item.sourceActorKey === 'visible:3:戊' && item.targetActorKey === 'visible:0:壬').length === 2,
        'existing distinct positive and negative functions lost');
});

test('near charts and other source verdicts cannot inherit branch contribution or local force', () => {
    for (const key of ['壬申|丙午|庚午|庚寅', '壬申|丙午|庚申|庚辰', '庚申|辛巳|丙辰|乙未', '癸丑|壬戌|丙午|庚寅']) {
        const result = view(key);
        assert(!result.branchContributions.length && !result.localForceQualifiers.length, 'outcome transferred across source charts');
    }
    assert(api.buildProfile({}, {}).results.every((item) => item.status === 'identity-unresolved'), 'empty chart was completed');
});

test('new results preserve all upstream contribution, party, sufficiency and assessment boundaries', () => {
    for (const key of [first, second, '戊辰|乙卯|辛丑|丁酉']) {
        const model = modelFor(key), base = model.strengthSynthesis, before = JSON.stringify(base);
        const result = g.baziSourceContributionLocalForce.extendSynthesis(model, base);
        assert(base.visibleStemDaymasterContributionRecords === result.visibleStemDaymasterContributionRecords
            && base.dependencies === result.dependencies && base.sufficiency === result.sufficiency, 'upstream strength coverage changed');
        assert(JSON.stringify(base) === before && model.assessmentLayer.state === 'contract-only'
            && result.sufficiency.status === 'insufficient', 'upstream mutated or final classification enabled');
        assert(result.sourceContributionLocalForce.relativeDominance === null && result.sourceContributionLocalForce.finalStrength === null
            && result.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4, 'finite evidence closed global mapping');
    }
    assert(modelFor('戊辰|乙卯|辛丑|丁酉').strengthSynthesis.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage', 'R29 authority altered');
    assert(g.baziSourceContributionLocalForce.extendSynthesis({}, { state: 'unavailable' }).state === 'unavailable', 'unavailable input was evaluated');
});

console.log(`\nSource Contribution and Local Force tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);

