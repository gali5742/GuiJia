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
const g = context.GuiJia,api = g.baziQualitativeComparisonEvidenceProfile;
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

const classical = '甲辰|丁卯|甲子|戊辰', first = '壬申|丙午|庚午|庚辰', second = '壬午|丙午|庚申|戊寅';
const modelFor = (key = classical) => outputFor(key).semanticModel;
const view = (key = classical) => modelFor(key).strengthSynthesis.qualitativeComparisonEvidence;
const compare = (model, left, right, base = model.strengthSynthesis) => api.compareRoots(model, base, left, right);
const mao = 'hidden:1:卯:乙:0', chen0 = 'hidden:0:辰:乙:1', chen3 = 'hidden:3:辰:乙:1';

test('the actual classical chart executes only the source root-category order', () => {
    const model = modelFor(), result = compare(model, mao, chen0);
    assert(result.status === 'source-baseline-category-ordered' && result.heavierBaselineActorKey === mao, 'reviewed root categories not ordered');
    assert(result.left.category === 'source-heavy-root-category' && result.right.category === 'source-light-root-category', 'source categories lost');
    assert(result.left.rootRole === 'same-element-root' && result.right.hiddenLevel === '中气'
        && result.right.sourceRole === 'source-listed-remainder-foundation', 'source remainder overwrote hidden level or exact-root identity');
    assert(result.left.relatedStructureRefs.length > 0 && result.left.actualEffectiveness === null && result.actualForceWinner === null, 'structure presence became actual root force');
    assert(Object.isFrozen(result) && Object.isFrozen(result.left), 'baseline comparison is mutable');
});

test('comparison order is directional and identical category does not imply equal force', () => {
    const model = modelFor();
    assert(compare(model, chen0, mao).heavierBaselineActorKey === mao, 'argument order picked winner');
    const sameCategory = compare(model, chen0, chen3);
    assert(sameCategory.status === 'same-source-category-no-force-equivalence' && sameCategory.heavierBaselineActorKey === null
        && sameCategory.actualForceWinner === null, 'two light roots declared equally effective');
    assert(compare(model, mao, mao).status === 'same-actor-no-comparison', 'same root compared with itself');
});

test('the finite 甲 examples support exact and same-element roots without extending to ten-stem growth tables', () => {
    // Conditional structural fixtures, not newly discovered classical natal charts.
    const cases = [
        ['甲寅|丁卯|甲辰|己未', 'hidden:0:寅:甲:0', 'hidden:3:未:乙:2'],
        ['乙亥|丁卯|甲辰|己未', 'hidden:0:亥:甲:1', 'hidden:3:未:乙:2']
    ];
    for (const [key, heavy, light] of cases) {
        const result = compare(modelFor(key), heavy, light);
        assert(result.status === 'source-baseline-category-ordered' && result.heavierBaselineActorKey === heavy
            && result.left.rootRole === 'exact-root', 'source-listed growth/root examples failed');
    }
    const model = modelFor('壬申|丙午|庚午|庚辰');
    const root = model.strengthSynthesis.rootActorStates[0];
    assert(compare(model, root.actorKey, root.actorKey).status === 'baseline-comparison-unresolved', '庚 source table was inferred');
});

test('unlisted or fabricated whole-branch endpoints cannot acquire a root category', () => {
    const model = modelFor();
    for (const bad of ['surface-branch:1:卯', 'hidden:1:卯:甲:0', 'hidden:0:辰:乙:2', 'visible:1:丁']) {
        assert(compare(model, bad, mao).status === 'baseline-comparison-unresolved', 'fabricated root accepted');
    }
});

test('missing, duplicate, wrong-level and contradictory root records fail closed', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    const root = base.rootActorStates.find((item) => item.actorKey === mao);
    for (const roots of [base.rootActorStates.filter((item) => item !== root), [...base.rootActorStates, root],
        base.rootActorStates.map((item) => item === root ? { ...item, rootRole: 'exact-root' } : item),
        base.rootActorStates.map((item) => item === root ? { ...item, level: '余气' } : item),
        base.rootActorStates.map((item) => item === root ? { ...item, pillarIndex: 0 } : item)]) {
        assert(compare(model, mao, chen0, { ...base, rootActorStates: roots }).status === 'baseline-comparison-unresolved', 'malformed root record accepted');
    }
});

test('hidden actor evidence is required independently of root-presence labels', () => {
    const model = modelFor(), base = model.strengthSynthesis, inventory = base.contextualForcePartyMembershipInventory;
    const evidence = inventory.evidenceRecords.find((item) => item.actorKey === mao && item.sourceScope === 'hidden-modifier');
    for (const changed of [
        { ...inventory, actorProfiles: inventory.actorProfiles.filter((item) => item.actorKey !== mao) },
        { ...inventory, actorProfiles: [...inventory.actorProfiles, inventory.actorProfiles.find((item) => item.actorKey === mao)] },
        { ...inventory, evidenceRecords: inventory.evidenceRecords.filter((item) => item !== evidence) },
        { ...inventory, evidenceRecords: [...inventory.evidenceRecords, { ...evidence, gan: '甲' }] },
        { ...inventory, evidenceRecords: inventory.evidenceRecords.map((item) => item === evidence ? { ...item, sourceScope: 'surface-branch' } : item) }
    ]) assert(compare(model, mao, chen0, { ...base, contextualForcePartyMembershipInventory: changed }).status === 'baseline-comparison-unresolved', 'root presence bypassed hidden identity');
});

test('actual root effectiveness is retained but never converted by baseline ordering', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    const changed = { ...base, rootActorStates: base.rootActorStates.map((item) => item.actorKey === mao
        ? { ...item, effectiveState: 'ineffective', resolutionStatus: 'synthetic-test-only' } : item) };
    const result = compare(model, mao, chen0, changed);
    assert(result.heavierBaselineActorKey === mao && result.left.actualEffectiveness === 'ineffective'
        && result.actualForceWinner === null, 'baseline label overwrote actual-effect state');
});

test('missing or inconsistent daymaster evidence cannot establish a baseline category', () => {
    const model = modelFor(), base = model.strengthSynthesis;
    for (const master of [null, { ...model.strengthEvidence.dayMaster, wuxing: '火' }]) {
        const changed = { ...model, strengthEvidence: { ...model.strengthEvidence, dayMaster: master } };
        assert(compare(changed, mao, chen0, base).status === 'baseline-comparison-unresolved', 'daymaster identity inferred');
    }
});

test('named comparison assembles independently scoped evidence and preserves its authored target', () => {
    const result = view(first).namedComparison;
    assert(result.daymasterActorKey === 'daymaster:2:庚' && result.counterActorKey === 'visible:1:丙', 'named anchor pair lost');
    assert(result.branchContributionReferences.length === 1 && result.contributionReferences.length === 3
        && result.localForceQualifiers.length === 1, 'verified evidence scopes missing');
    assert(result.sourceCalibration.authoredValue.relation === 'source-asserted-shen-sha-liang-ting'
        && result.sourceCalibration.purpose === 'calibration-target-only', 'authored pair comparison lost');
    assert(result.status === 'insufficient-comparison-evidence' && result.computedComparison === null && result.forceWinner === null,
        'authored target or available support became computed comparison');
    for (const key of ['daymaster-contribution-coverage-incomplete','named-counter-to-daymaster-realization-unresolved',
        'counter-seasonal-standing-unresolved','counter-foundation-and-profile-coverage-unresolved','source-backed-cross-axis-comparison-rule-missing']) {
        assert(result.blockers.includes(key), `required comparison gap lost: ${key}`);
    }
});

test('the second chart does not inherit the preceding chart verdict or reverse ineffective force', () => {
    const result = view(second).namedComparison;
    assert(result.sourceCalibration === null && result.branchContributionReferences.length === 0
        && result.localForceQualifiers[0].qualifier === 'source-asserted-ineffective', 'preceding chart evidence transferred');
    assert(result.localForceQualifiers[0].sourceRealization === 'unresolved' && result.forceWinner === null, 'ineffective force picked side');
});

test('cached branch, force and authored comparison outputs cannot bypass current evidence', () => {
    const model = modelFor(first), base = model.strengthSynthesis, inventory = base.contextualForcePartyMembershipInventory;
    const result = api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: {
        ...inventory, actorProfiles: inventory.actorProfiles.filter((item) => item.actorKey !== 'surface-branch:3:辰')
    } }).namedComparison;
    assert(result.branchContributionReferences.length === 0 && result.sourceCalibration === null
        && result.localForceQualifiers.length === 1, 'cached verified output overrode missing branch evidence');
});

test('unrelated contribution anchors are excluded and reported rather than folded into the named side', () => {
    const model = modelFor(first), base = model.strengthSynthesis;
    const forged = { ...base.visibleStemDaymasterContributionRecords[0], id: 'TEST-UNRELATED', peerParticipantActorKeys: ['visible:3:庚','daymaster:2:辛'] };
    const result = api.buildProfile(model, { ...base, visibleStemDaymasterContributionRecords: [...base.visibleStemDaymasterContributionRecords, forged] }).namedComparison;
    assert(!result.contributionReferences.some((item) => item.id === forged.id) && result.excludedContributionIds.includes(forged.id)
        && result.blockers.includes('contribution-anchor-identity-mismatch'), 'unrelated anchor merged');
});

test('local realization disagreement survives into comparison blockers', () => {
    const model = modelFor(first), base = model.strengthSynthesis;
    const result = api.buildProfile(model, { ...base, visibleStemFunctionRealizationRecords: base.visibleStemFunctionRealizationRecords.map((item) =>
        item.sourceActorKey === 'visible:0:壬' && item.targetActorKey === 'visible:1:丙'
            ? { ...item, realizationState: 'not-realized-in-source-context' } : item) }).namedComparison;
    assert(result.blockers.includes('local-force-runtime-disagreement') && result.computedComparison === null, 'local disagreement silently averaged');
});

test('contrary resolved counter-to-daymaster outcomes remain a comparison conflict', () => {
    const model = modelFor(first), base = model.strengthSynthesis;
    const incoming = base.visibleStemFunctionRealizationRecords.find((item) => item.sourceActorKey === 'visible:1:丙' && item.targetActorKey === 'daymaster:2:庚');
    const result = api.buildProfile(model, { ...base, visibleStemFunctionRealizationRecords: [
        ...base.visibleStemFunctionRealizationRecords.filter((item) => item !== incoming),
        { ...incoming, realizationState: 'realized-in-source-context' },
        { ...incoming, id: 'TEST-CONTRARY', realizationState: 'not-realized-in-source-context' }
    ] }).namedComparison;
    assert(result.blockers.includes('named-counter-to-daymaster-realization-conflict') && result.forceWinner === null, 'resolved outcomes were treated as complete consistent evidence');
});

test('apparently resolved contribution records still cannot invent a cross-axis rule', () => {
    const model = modelFor(first), base = model.strengthSynthesis;
    const result = api.buildProfile(model, { ...base, visibleStemDaymasterContributionRecords: base.visibleStemDaymasterContributionRecords.map((item) =>
        ({ ...item, resolutionStatus: 'resolved-realized-daymaster-contribution', contributionState: 'realized-daymaster-contribution-in-source-context' })) }).namedComparison;
    assert(!result.blockers.includes('daymaster-contribution-coverage-incomplete')
        && result.blockers.includes('source-backed-cross-axis-comparison-rule-missing') && result.computedComparison === null,
        'input coverage supplied missing comparison law');
});

test('unknown charts preserve baseline review without a named comparison or whole-chart mapping', () => {
    assert(view(classical).namedComparison === null && view('甲辰|丁卯|甲子|戊未').namedComparison === null, 'named chart comparison generalized');
    const empty = api.buildProfile({}, {});
    assert(empty.chartKey === null && empty.namedComparison === null && !empty.baselineRoots.length, 'empty evidence completed');
});

test('the comparison extension preserves upstream strength, root states and typed effects', () => {
    for (const key of [classical, first, second, '戊辰|乙卯|辛丑|丁酉']) {
        const model = modelFor(key), base = model.strengthSynthesis, before = JSON.stringify(base);
        const extended = g.baziQualitativeComparisonEvidence.extendSynthesis(model, base);
        assert(extended.sufficiency === base.sufficiency && extended.dependencies === base.dependencies
            && extended.rootActorStates === base.rootActorStates && extended.visibleStemDaymasterContributionRecords === base.visibleStemDaymasterContributionRecords,
            'comparison extension changed upstream evidence');
        assert(JSON.stringify(base) === before && base.sufficiency.status === 'insufficient' && model.assessmentLayer.state === 'contract-only', 'final mapping enabled');
        assert(extended.qualitativeComparisonEvidence.relativeDominance === null && extended.qualitativeComparisonEvidence.finalStrength === null, 'baseline became global classification');
    }
    assert(modelFor('戊辰|乙卯|辛丑|丁酉').strengthSynthesis.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage', 'R29 authority changed');
});

console.log(`\nQualitative Comparison Evidence tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);

