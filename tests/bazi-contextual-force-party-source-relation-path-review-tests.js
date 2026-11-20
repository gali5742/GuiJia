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
const g = context.GuiJia,api = g.baziContextualForcePartySourceRelationPathReviewProfile;
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

const review = (chartKey) => outputFor(chartKey).semanticModel.strengthSynthesis.contextualForcePartySourceRelationPathReview;
const blockedChart = '丁未|壬子|庚戌|丙戌';
const mixedChart = '癸丑|己未|丙寅|辛卯';

test('the same exact-case evaluator separates local prevention, source position, and realized-unmapped damage', () => {
    const blocked = review(blockedChart);
    const mixed = review(mixedChart);
    assert(blocked.sourceCorpusValidated && mixed.sourceCorpusValidated, 'curated source spans failed validation');
    assert(blocked.exactPaths.map((path) => path.outcome).join() === 'not-realized,not-realized', JSON.stringify(blocked.exactPaths));
    assert(mixed.exactPaths.map((path) => path.outcome).join() === 'realized-unmapped,not-realized,not-realized', JSON.stringify(mixed.exactPaths));
    const [support, restraint] = blocked.exactPaths;
    assert(support.sourceActorKey === 'surface-branch:1:子' && support.targetReference.actorKey === 'visible:1:壬', 'whole-branch source was replaced by a hidden stem');
    assert(!support.sourceAttribution.conditioningActorsNamed && !support.verifiedContextActorKeys.length, 'unnamed dry-earth context became an actor');
    assert(restraint.sourceActorKey === 'visible:1:壬' && restraint.targetReference.actorKey === 'visible:3:丙'
        && restraint.verifiedContextActorKeys.join() === 'visible:0:丁', 'the combination context or directed restraint was reversed');
    assert(restraint.sourceAttribution.kind === 'source-asserted-prevention' && restraint.sourceAttribution.span === '丁壬一合', 'explicit attribution was lost');
    assert(mixed.exactPaths.every((path) => path.sourceAttribution.kind === 'source-position-wording'), 'position was upgraded to a causal rule');
    assert(mixed.exactPaths.map((path) => path.targetReference.actorKey).join() === 'visible:0:癸,visible:0:癸,visible:3:辛', 'source antecedents were lost');
    assert([...blocked.exactPaths, ...mixed.exactPaths].every((path) => path.execution.effectType === null
        && path.execution.authorizationIds.length === 0 && !path.execution.reverseEffect), 'an unauthorized typed or reverse effect leaked');
    assert(!blocked.relationEffects.length && !mixed.relationEffects.length && blocked.runtimeWinnerPathId === null && mixed.runtimeWinnerPathId === null,
        'pair outcomes were promoted to a winner or effects');
});

test('missing verified participants withhold only the affected path and preserve its independent target', () => {
    const model = outputFor(blockedChart).semanticModel;
    const base = model.strengthSynthesis;
    const without = (key) => {
        const inventory = base.contextualForcePartyMembershipInventory;
        return api.buildProfile(model, { ...base, contextualForcePartyMembershipInventory: {
            ...inventory, actorProfiles: inventory.actorProfiles.filter((actor) => actor.actorKey !== key)
        } });
    };
    const missingContext = without('visible:0:丁');
    assert(missingContext.exactPaths[0].outcome === 'not-realized', 'missing 丁 invalidated an unrelated path');
    const restraint = missingContext.exactPaths[1];
    assert(restraint.targetReference.actorKey === 'visible:3:丙' && restraint.outcome === 'realization-unresolved'
        && restraint.execution === null, 'missing context was treated as a negative pair');
    const missingSource = without('visible:1:壬').exactPaths[1];
    assert(missingSource.targetReference.actorKey === 'visible:3:丙' && missingSource.outcome === 'identity-unresolved'
        && missingSource.execution === null, 'target was erased or source inferred');
});

test('a related chart cannot inherit an exact source outcome from matching visible stems alone', () => {
    const result = review('丁未|壬子|庚辰|丙戌');
    assert(result.exactSourceCaseId === null && result.exactPaths.length === 0, 'exact case outcome transferred');
});

test('both source order variants preserve their two paths, order policy and unresolved targets', () => {
    const cases = [['癸卯|乙卯|己巳|辛未', '01'], ['丙午|辛卯|己巳|癸酉', '02']];
    for (const [chartKey, suffix] of cases) {
        const result = review(chartKey);
        const match = result.orderReviews.find((entry) => entry.linkId === 'CF-SPPCM-LINK-' + suffix);
        assert(match.paths.length === 2 && match.sourcePathPolicy.coexistenceMode === 'source-permits-coexistence', 'matched order discarded a path');
        assert(match.sourcePathPolicy.orderedPathIds.length === 2 && match.sourcePathPolicy.orderedPathIds.every((id) =>
            match.paths.some((path) => path.pathId === id)), 'source-declared order was lost');
        assert(match.paths.every((path) => path.outcome === 'identity-unresolved' && path.targetReference === null), 'role became a chart target');
        assert(result.runtimeWinnerPathId === null && !result.relationEffects.length, 'coexistence minted a winner');
        assert(match.paths.map((path) => path.intermediateParticipants.length).sort().join() === (suffix === '02' ? '0,1' : '0,0'),
            'compound intermediate was lost or materialized into a new path');
    }
});

test('duplicate visible stems and proximity alternatives do not produce candidates or a winner', () => {
    const ambiguous = review('癸卯|辛卯|己巳|辛未');
    assert(ambiguous.orderReviews.filter((entry) => entry.linkId.endsWith('01') || entry.linkId.endsWith('02'))
        .every((entry) => !entry.paths.length && entry.conditionState.includes('unresolved')), 'duplicate visible stems were selected');
    const adjacent = review('壬午|己酉|甲申|甲子');
    const proximity = adjacent.orderReviews.filter((entry) => entry.linkId.endsWith('03') || entry.linkId.endsWith('04'));
    assert(proximity.length === 2 && proximity.every((entry) => entry.conditionState.includes('unresolved') && !entry.paths.length),
        'proximity was replaced by adjacency');
    assert(adjacent.runtimeWinnerPathId === null, 'unresolved proximity was turned into a winner');
});

test('the actual R31 hidden target and its clause-level negation remain a partial path', () => {
    const result = review('癸亥|甲子|戊戌|癸丑');
    const hidden = result.hiddenPath;
    assert(hidden.targetReference.actorKey === 'hidden:2:戌:丁:2' && hidden.outcome === 'identity-unresolved', 'hidden target was promoted to a complete negative pair');
    assert(hidden.sourceAssertion.sourceActorKey === null && hidden.wealthCandidates.length === 7, 'wealth candidates selected a source');
    assert(hidden.sourceAssertion.evidenceSpan === '财虽旺，不能破印' && result.exactPaths.length === 0, 'clause-level evidence was lost or reused as an exact pair');
});

test('the full research synthesis preserves independent authorization and global blockers', () => {
    const model = outputFor('戊辰|乙卯|辛丑|丁酉').semanticModel;
    const base = model.strengthSynthesis;
    assert(base.contextualForcePartySourceRecipientSealDamageCalibration.result.execution.effectType === 'recipient-seal-damage',
        'R29 typed effect was altered');
    assert(base.contextualForcePartySourceRelationPathReview.newEffectAuthorityCount === 0
        && base.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && base.sufficiency.status === 'insufficient' && model.assessmentLayer.state === 'contract-only', 'finite evidence closed a global blocker');
});

console.log(`\nSource Relation Path Review tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
