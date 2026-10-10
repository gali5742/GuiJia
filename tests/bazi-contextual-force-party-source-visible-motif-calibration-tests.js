#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const { Solar } = require(path.join(ROOT, 'vendor/lunar.js'));
const bootstrap = fs.readFileSync(path.join(ROOT, 'js/bazi-research-bootstrap.js'), 'utf8');
const entries = [...bootstrap.matchAll(/Object\.freeze\(\{\s*globalKey:'([^']+)',\s*src:'([^']+)'\s*\}\)/g)]
    .map((match) => ({ key:match[1], file:match[2].replace(/^\.\//, '').replace(/\?.*$/, '') }));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
let passed = 0;
let failed = 0;
const test = (name, fn) => {
    try { fn(); passed++; console.log(`✓ ${name}`); }
    catch (error) { failed++; console.error(`✗ ${name}\n  ${error.stack}`); }
};
function load(tamperCase = null) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context; context.globalThis = context; vm.createContext(context);
    const run = (file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
    ['js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-strength-effects.js'].forEach(run);
    for (const entry of entries) {
        if (tamperCase && entry.file === 'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js') {
            // Rejection-only injection: same motif authority cannot match a different source case.
            const api = context.GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource;
            const id = api.MOTIF_IDS.OPPOSITION;
            const cases = api.CASES_BY_MOTIF[id].map((item) => item.calibrationEligible ? tamperCase({ ...item }) : item);
            context.GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource = {
                ...api, CASES_BY_MOTIF:{ ...api.CASES_BY_MOTIF, [id]:cases }
            };
        }
        run(entry.file);
        assert(context.GuiJia[entry.key], `bootstrap dependency missing: ${entry.key}`);
    }
    ['js/bazi-assessment.js','js/bazi-interpretation.js'].forEach(run);
    return context.GuiJia;
}
const g = load();
const POSITIVE = '壬申|丙午|庚午|庚辰';
const NEGATIVE = '丁卯|甲辰|辛亥|癸巳';
const OPPOSITION = 'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001';
function outputFor(chartKey) {
    const bazi = g.baziCore;
    const chars = chartKey.split('|').map((part) => Array.from(part));
    const gans = chars.map((part) => part[0]), zhis = chars.map((part) => part[1]);
    const dayGan = gans[2], dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level,
            wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return g.baziInterpretation.buildBaziInterpretation({ dayGan, dayGanWuXing:dayElement, pillars,
        internalRelations, monthSeason, dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', solarStr:'测试时间', ruleSummary:'测试口径' });
}
const positiveOutput = outputFor(POSITIVE);
const positive = positiveOutput.semanticModel.strengthSynthesis;
const negative = outputFor(NEGATIVE).semanticModel.strengthSynthesis;
const matcher = (s) => s.contextualForcePartyRegisteredMotifAuthorizationMatcher;
const sourceRecord = (s, patternId) => s.visibleStemFunctionRealizationSourceRecords.find((r) => r.sourcePatternId === patternId);
test('actual source positive traverses full realization → R7 → R5 → R4 closure', () => {
    const record = sourceRecord(positive, 'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001');
    assert(record?.sourceActorKey === 'visible:0:壬' && record?.targetActorKey === 'visible:1:丙', 'source endpoints not preserved');
    const result = matcher(positive).results.find((r) => r.match.relationRecordId === record.id);
    assert(result?.match.motifId === OPPOSITION, 'registered opposition authority missing');
    assert(result.normalized?.normalizationState === 'resolved-source-backed-effect-authorization-input', 'actual R5 rejected');
    assert(result.execution.realized && result.execution.effectType === 'anchor-opposition', 'actual R4 did not execute');
    assert(result.normalized.relationIdentity.id === result.match.relationRecordId, 'relation identity changed');
    assert(result.normalized.authorization.authorityIds.includes(OPPOSITION), 'motif authority lost');
});
test('new source records retain chapter, textual context, endpoint rationale and revision', () => {
    for (const [s, id, chapter] of [[positive,'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001','干支总论'],
        [negative,'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-002','何知章']]) {
        const record = sourceRecord(s, id);
        assert(record.sourceCitation.includes(chapter), 'inherited wrong 八格 citation');
        assert(record.sourceContext && record.endpointBinding, 'context or binding omitted');
        assert(record.sourceProvenance.revisionId === 2600158 && record.sourceProvenance.sourceUrl.includes('wikisource'), 'source version missing');
    }
});
test('explicit negative keeps rebuttal context and creates no positive or reverse effect', () => {
    const record = sourceRecord(negative, 'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-002');
    assert(record.sourceTerm.includes('似乎') && record.sourceTerm.includes('不能克火'), 'provisional statement was detached from negation');
    const result = matcher(negative).results.find((r) => r.match.relationRecordId === record.id);
    assert(result.match.motifId === OPPOSITION && result.normalized, 'negative lost authorized motif identity');
    assert(result.execution.executionState === 'not-realized-generic-relation-effect', 'negative activated');
    assert(result.execution.reverseEffect === null && !result.execution.realized, 'negative reversed');
    assert(matcher(negative).results.every((r) => !r.execution.realized), '生木 wording introduced an automatic effect');
});
test('opposition calibration is partial family progress; mediation and global B01 stay unresolved', () => {
    const audit = positive.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    assert(audit.oppositionCalibrationResolved && !audit.mediationCalibrationResolved && !audit.allTargetMotifsResolved, 'partial source coverage collapsed');
    assert(audit.motifRecords.opposition.existingPositiveDirectPatternIds.join(',') === 'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001', 'case-pattern binding missing');
    const pair = positive.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-ACTOR-PAIR-OPPOSITION-E2E-CALIBRATION');
    assert(pair?.status === 'resolved' && pair.sourcePatternIds.length === 1, 'actor-pair calibration lost through later collective wrappers');
    assert(positive.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION').status === 'unresolved', 'broader legacy path coverage unlocked');
    const frontier = positive.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit;
    assert(frontier.actorToActorPositiveDirectCalibrationObserved && !frontier.actorToActorAllRawVisibleMotifsCalibrated, 'any/all conflated');
    assert(frontier.unresolvedGlobalResolverBlockerCount === 5, 'partial motif removed global blockers');
    assert(frontier.blockersToGlobalResolver.find((b) => b.id === 'CF-EASC-B01').resolved === false, 'one example resolved whole family');
});
test('exact opposition effect does not become branch mediation, actor power or final assessment', () => {
    const results = matcher(positive).results;
    assert(results.filter((r) => r.execution.realized).length === 1, 'unexpected positive effect');
    assert(results.every((r) => r.execution.effectType !== 'anchor-mediation'), '辰土之化 was flattened into visible mediation');
    const effect = results.find((r) => r.execution.realized).execution;
    assert(effect.numericWeight === null && effect.membershipMutation === null && effect.memberEffects.length === 0, 'force/membership introduced');
    assert(positive.sufficiency.status === 'insufficient' && positiveOutput.semanticModel.assessmentLayer.state === 'contract-only', 'final interpretation unlocked');
    const deps = positive.dependencies;
    for (const id of ['SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER',
        'SD-CONTEXTUAL-FORCE-PARTY-RELATIVE-DOMINANCE-RESOLVER','SD-CONTEXTUAL-FORCE-PARTY-SURFACE-BRANCH-SUBSTRATE-QUALITY-RESOLVER']) {
        assert(deps.find((d) => d.id === id)?.status === 'unresolved', `unlocked ${id}`);
    }
});
test('neighbor comparison weakness stays unresolved and receives no copied source pattern', () => {
    const chartKey = '壬午|丙午|庚申|戊寅';
    const synthesis = outputFor(chartKey).semanticModel.strengthSynthesis;
    assert(synthesis.visibleStemFunctionRealizationSourceRecords.length === 0, 'qualitative weakness promoted to realization');
    const candidate = g.baziContextualForcePartyVisibleMotifE2ECalibrationSource.BOUNDARY_CASES[0];
    assert(!candidate.calibrationEligible && candidate.blockerReasons.includes('qualitative-weakness-does-not-resolve-binary-realization'), 'weakness boundary lost');
});
test('same stem roles with changed branch context do not reuse exact-source outcome', () => {
    const synthesis = outputFor('壬申|丙午|庚午|庚戌').semanticModel.strengthSynthesis;
    assert(synthesis.visibleStemFunctionRealizationSourceRecords.length === 0, 'source outcome generalized to new chart');
    assert(matcher(synthesis).results.every((r) => !r.execution.realized), 'same role/function shape executed');
});
for (const [name, tamper] of [
    ['case chart', (c) => ({ ...c, chartKey:'壬午|丙午|庚申|戊寅' })],
    ['case endpoint', (c) => ({ ...c, targetActorKeys:['visible:3:庚'] })],
    ['case pattern identity', (c) => ({ ...c, realizationPatternId:'DTS-VISIBLE-REALIZATION-GUI-RESTRAINS-DING-002' })]
]) {
    test(`same motif with mismatched ${name} cannot satisfy source calibration`, () => {
        const altered = load(tamper);
        const audit = altered.baziContextualForcePartyVisibleMotifE2ECalibrationAudit.buildAudit();
        assert(audit.motifRecords.opposition.sourceCalibrationEligible, 'test must retain claimed source eligibility');
        assert(!audit.oppositionCalibrationResolved && audit.motifRecords.opposition.existingPositiveDirectPatternIds.length === 0, 'unrelated pattern accepted');
    });
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
