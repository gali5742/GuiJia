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
function load(tamperCase = null, options = {}) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context; context.globalThis = context; vm.createContext(context);
    const run = (file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
    ['js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-strength-effects.js'].forEach(run);
    for (const entry of entries) {
        if (tamperCase && entry.file === 'js/bazi-contextual-force-party-visible-motif-e2e-calibration-audit.js') {
            // Rejection-only injection: same motif authority cannot match a different source case.
            const api = context.GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource;
            const id = options.motifId || api.MOTIF_IDS.OPPOSITION;
            const cases = api.CASES_BY_MOTIF[id].map((item) => item.calibrationEligible ? tamperCase({ ...item }) : item);
            context.GuiJia.baziContextualForcePartyVisibleMotifE2ECalibrationSource = {
                ...api, CASES_BY_MOTIF:{ ...api.CASES_BY_MOTIF, [id]:cases }
            };
        }
        run(entry.file);
        if (options.omitMediationPattern && entry.file === 'js/bazi-visible-stem-function-realization-source.js') {
            // Registry omission fixture preserves the R8 any-positive / incomplete-family regression.
            const api = context.GuiJia.baziVisibleStemFunctionRealizationSource;
            context.GuiJia.baziVisibleStemFunctionRealizationSource = Object.freeze({ ...api,
                DIRECT_SOURCE_PATTERNS:Object.freeze(api.DIRECT_SOURCE_PATTERNS.filter((p) => p.id !== 'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001')) });
        }
        assert(context.GuiJia[entry.key], `bootstrap dependency missing: ${entry.key}`);
    }
    ['js/bazi-assessment.js','js/bazi-interpretation.js'].forEach(run);
    return context.GuiJia;
}
const g = load();
const POSITIVE = '壬申|丙午|庚午|庚辰';
const NEGATIVE = '丁卯|甲辰|辛亥|癸巳';
const OPPOSITION = 'CF-PRE-MOTIF-FOOD-GOD-OPPOSES-KILLER-001';
function outputFor(chartKey, instance = g) {
    const bazi = instance.baziCore;
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
    return instance.baziInterpretation.buildBaziInterpretation({ dayGan, dayGanWuXing:dayElement, pillars,
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
    const partial = outputFor(POSITIVE, load(null, { omitMediationPattern:true })).semanticModel.strengthSynthesis;
    const audit = partial.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    assert(audit.oppositionCalibrationResolved && !audit.mediationCalibrationResolved && !audit.allTargetMotifsResolved, 'partial source coverage collapsed');
    assert(audit.motifRecords.opposition.existingPositiveDirectPatternIds.join(',') === 'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001', 'case-pattern binding missing');
    const pair = partial.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-ACTOR-PAIR-OPPOSITION-E2E-CALIBRATION');
    assert(pair?.status === 'resolved' && pair.sourcePatternIds.length === 1, 'actor-pair calibration lost through later collective wrappers');
    assert(partial.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-OPPOSITION-E2E-CALIBRATION').status === 'unresolved', 'broader legacy path coverage unlocked');
    const frontier = partial.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit;
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
const MEDIATION_CHART = '癸酉|甲子|丁卯|丙午';
const MEDIATION_MOTIF = 'CF-PRE-MOTIF-KILLER-MEDIATES-THROUGH-SEAL-001';
const MEDIATION_PATTERN = 'DTS-VISIBLE-REALIZATION-GUI-GENERATES-JIA-001';
const mediationOutput = outputFor(MEDIATION_CHART);
const mediation = mediationOutput.semanticModel.strengthSynthesis;
test('actual mediation source traverses full realization → R7 → R5 → R4 without positive injection', () => {
    const record = sourceRecord(mediation, MEDIATION_PATTERN);
    assert(record?.sourceActorKey === 'visible:0:癸' && record?.targetActorKey === 'visible:1:甲', 'source pair missing');
    assert(record.functionType === 'generation' && record.realizationState === 'realized-in-source-context', 'realization lost');
    const result = matcher(mediation).results.find((r) => r.match.relationRecordId === record.id);
    assert(result?.match.motifId === MEDIATION_MOTIF, 'registered mediation authority missing');
    assert(result.normalized.normalizationState === 'resolved-source-backed-effect-authorization-input', 'actual R5 failed');
    assert(result.execution.effectType === 'anchor-mediation' && result.execution.realized, 'actual R4 failed');
    assert(result.normalized.authorization.authorityIds.includes(MEDIATION_MOTIF), 'authority provenance missing');
    assert(result.normalized.relationIdentity.id === record.id, 'relation identity changed');
    assert(record.sourceCitation.includes('通关') && record.sourceProvenance.revisionId === 2600158, 'source locator/version missing');
    assert(record.sourceContext.includes('天干地支皆') && record.endpointBinding.includes('独立 branch scope'), 'scope rationale missing');
});
test('heavenly-stem clause creates one visible pair without expanding the branch clause or final power', () => {
    assert(mediation.visibleStemFunctionRealizationSourceRecords.length === 1, 'branch clause became extra source edges');
    const results = matcher(mediation).results.filter((r) => r.execution.realized);
    assert(results.length === 1, 'mediation statement expanded into multiple effects');
    const { normalized, execution } = results[0];
    assert(normalized.sourceEndpoint.scope === 'visible-stem' && normalized.targetEndpoint.scope === 'visible-stem', 'cross-scope substitution');
    assert(normalized.sourceEndpoint.cardinality === 1 && normalized.targetEndpoint.cardinality === 1, 'actor pair became group');
    assert(execution.memberEffects.length === 0 && execution.membershipMutation === null && execution.numericWeight === null, 'membership/force introduced');
    assert(mediation.sufficiency.status === 'insufficient' && mediationOutput.semanticModel.assessmentLayer.state === 'contract-only', 'source narrative unlocked final assessment');
});
test('both registered raw motifs have individual calibration while four global blockers remain', () => {
    const audit = mediation.contextualForcePartyVisibleMotifE2ECalibrationSourceAudit;
    assert(audit.oppositionCalibrationResolved && audit.mediationCalibrationResolved && audit.allTargetMotifsResolved, 'raw calibration incomplete');
    assert(audit.motifRecords.mediation.existingPositiveDirectPatternIds.join(',') === MEDIATION_PATTERN, 'mediation source identity mismatch');
    const deps = mediation.dependencies;
    for (const id of ['SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-ACTOR-PAIR-OPPOSITION-E2E-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-ACTOR-PAIR-MEDIATION-E2E-CALIBRATION',
        'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-ACTOR-PAIR-KNOWN-MOTIF-E2E-CALIBRATION']) {
        assert(deps.find((d) => d.id === id)?.status === 'resolved', `narrow calibration lost: ${id}`);
    }
    const frontier = mediation.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit;
    assert(frontier.actorToActorAllRawVisibleMotifsCalibrated && frontier.blockersToGlobalResolver.find((b) => b.id === 'CF-EASC-B01').resolved, 'B01 narrow evidence not recognized');
    assert(frontier.unresolvedGlobalResolverBlockerCount === 4, 'extra global blockers released');
    assert(frontier.unresolvedGlobalResolverBlockers.map((b) => b.id).join(',') === 'CF-EASC-B02,CF-EASC-B03,CF-EASC-B04,CF-EASC-B05', 'remaining scopes changed');
    assert(deps.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER').status === 'unresolved', 'raw calibration became global resolver');
    assert(deps.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-VISIBLE-EDGE-KNOWN-MOTIF-END-TO-END-CALIBRATION').status === 'unresolved', 'legacy collective/path calibration released');
});
test('changed mediation chart branch cannot reuse source-specific generation outcome', () => {
    const changed = outputFor('癸酉|甲子|丁卯|丙戌').semanticModel.strengthSynthesis;
    assert(changed.visibleStemFunctionRealizationSourceRecords.length === 0, 'exact chart generalized');
    assert(matcher(changed).results.every((r) => !r.execution.realized), 'role/function shape acquired automatic mediation');
});
test('visible/hidden same-stem source candidate remains a provenance boundary', () => {
    const candidate = g.baziContextualForcePartyVisibleMotifE2ECalibrationSource.BOUNDARY_CASES.find((c) => c.id === 'CF-VMEC-MED-BOUNDARY-01');
    assert(candidate?.sourceExplicitOutcome && !candidate.targetSpecificActorResolved && !candidate.calibrationEligible, 'scope ambiguity erased');
    const unresolved = outputFor(candidate.chartKey).semanticModel.strengthSynthesis;
    assert(unresolved.visibleStemFunctionRealizationSourceRecords.length === 0, '甲木之根 assertion chosen as visible target');
    assert(matcher(unresolved).results.every((r) => !r.execution.realized), 'ambiguous candidate executed');
});
test('caller cannot turn positive mediation realization into a negative or reverse relation', () => {
    const record = sourceRecord(mediation, MEDIATION_PATTERN);
    const result = g.baziContextualForcePartyRegisteredMotifAuthorizationMatcherProfile.evaluateInput({
        edge:{ ...record, realizationState:'not-realized-in-source-context' },
        inventory:mediation.contextualForcePartyMembershipInventory,
        chartKey:MEDIATION_CHART, affiliationRecords:[]
    });
    assert(result.match.blockerReasons.includes('direct-source-pattern-binding-mismatch'), 'forged outcome passed source-pattern gate');
    assert(result.execution.executionState === 'unresolved-generic-relation-effect' && !result.execution.realized && result.execution.reverseEffect == null, 'forged realization executed');
});
for (const [name, tamper] of [
    ['chart', (c) => ({ ...c, chartKey:'癸酉|甲子|丁卯|丙戌' })],
    ['hidden target', (c) => ({ ...c, targetActorKeys:['hidden:1:甲'] })],
    ['multiple sources', (c) => ({ ...c, sourceActorKeys:['visible:0:癸','visible:3:丙'] })],
    ['other positive pattern ID', (c) => ({ ...c, realizationPatternId:'DTS-VISIBLE-REALIZATION-REN-RESTRAINS-BING-001' })]
]) {
    test(`mediation calibration refuses mismatched ${name} while opposition stays calibrated`, () => {
        const altered = load(tamper, { motifId:MEDIATION_MOTIF });
        const audit = altered.baziContextualForcePartyVisibleMotifE2ECalibrationAudit.buildAudit();
        assert(audit.oppositionCalibrationResolved && !audit.mediationCalibrationResolved && !audit.allTargetMotifsResolved, 'unrelated source evidence satisfied mediation');
    });
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
