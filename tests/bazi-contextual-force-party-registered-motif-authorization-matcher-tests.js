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
const prefix = 'js/bazi-contextual-force-party-registered-motif-authorization-matcher';
let passed = 0;
let failed = 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const test = (name, fn) => {
    try { fn(); passed++; console.log(`✓ ${name}`); }
    catch (error) { failed++; console.error(`✗ ${name}\n  ${error.stack}`); }
};
function load(syntheticPatterns = null, duplicateMotif = false, staleNormalization = false) {
    const context = { console, setTimeout, clearTimeout, Date, Math, JSON, Intl, Solar };
    context.window = context;
    context.globalThis = context;
    vm.createContext(context);
    const run = (file) => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename:file });
    ['js/common.js','js/bazi-core.js','js/bazi-strength-evidence.js','js/bazi-strength-effects.js'].forEach(run);
    for (const entry of entries) {
        if (entry.file === `${prefix}-profile.js`) {
            // Test-only registry injection exercises mechanics, never source calibration or production promotion.
            if (syntheticPatterns) {
                const api = context.GuiJia.baziVisibleStemFunctionRealizationSource;
                context.GuiJia.baziVisibleStemFunctionRealizationSource = Object.freeze({ ...api, DIRECT_SOURCE_PATTERNS:Object.freeze(syntheticPatterns) });
            }
            if (duplicateMotif) {
                const api = context.GuiJia.baziContextualForcePartyRelationEffectContract;
                context.GuiJia.baziContextualForcePartyRelationEffectContract = Object.freeze({ ...api, MOTIFS:Object.freeze([...api.MOTIFS, { ...api.MOTIFS[1], id:'TEST-DUPLICATE-AUTHORITY' }]) });
            }
            if (staleNormalization) {
                const api = context.GuiJia.baziContextualForcePartyRelationEffectContract;
                context.GuiJia.baziContextualForcePartyRelationEffectContract = Object.freeze({ ...api,
                    MOTIFS:Object.freeze(api.MOTIFS.map((motif, index) => index === 1 ? { ...motif, id:'TEST-NOT-IN-R5-REGISTRY' } : motif)) });
            }
        }
        run(entry.file);
        assert(context.GuiJia[entry.key]?.installed !== false && context.GuiJia[entry.key], `bootstrap dependency missing: ${entry.key}`);
    }
    ['js/bazi-assessment.js','js/bazi-interpretation.js'].forEach(run);
    return context.GuiJia;
}
const real = load();
const apiFor = (g) => g.baziContextualForcePartyRegisteredMotifAuthorizationMatcherProfile;
const patterns = [
    { id:'TEST-ONLY-OPPOSITION', chartKey:'癸亥|丁酉|丁丑|己酉', sourceActorKey:'visible:3:己', targetActorKey:'visible:0:癸', functionType:'restraint' },
    { id:'TEST-ONLY-MEDIATION', chartKey:'癸亥|甲寅|丁丑|己酉', sourceActorKey:'visible:0:癸', targetActorKey:'visible:1:甲', functionType:'generation' },
    { id:'TEST-ONLY-AUGMENTATION', chartKey:'庚申|癸亥|丁丑|己酉', sourceActorKey:'visible:0:庚', targetActorKey:'visible:1:癸', functionType:'generation' }
].map((item) => Object.freeze({ ...item, relationScope:'cross-visible-actor', realizationState:'realized-in-source-context', scope:'exact-source-case-only', sourceTerm:'TEST ONLY, no textual authority' }));
const synthetic = load(patterns);
function inventoryFor(g, chartKey) {
    const pillars = chartKey.split('|');
    const dayGan = Array.from(pillars[2])[0];
    const actors = [0,1,3].map((index) => {
        const gan = Array.from(pillars[index])[0];
        const tenGod = g.baziCore.shiShenMap[dayGan][gan];
        const membershipClass = ['正官','七杀'].includes(tenGod) ? 'counter-side-anchor-candidate'
            : ['正印','偏印','比肩','劫财'].includes(tenGod) ? 'daymaster-side-seed-candidate' : 'context-dependent-unassigned';
        return { actorKey:`visible:${index}:${gan}`, tenGod, membershipClass };
    });
    return {
        actorProfiles:actors.map((a) => ({ actorKey:a.actorKey, membershipClasses:[a.membershipClass], counterAnchorIds:[`counter-anchor:${a.actorKey}`] })),
        evidenceRecords:actors.map((a) => ({ actorKey:a.actorKey, tenGod:a.tenGod }))
    };
}
function inputFor(g, pattern) {
    const edge = { ...pattern, id:`EDGE:${pattern.id}`, directed:true, sourcePatternId:pattern.id,
        sourceEvidenceRuleId:g.baziVisibleStemFunctionRealizationSource.VISIBLE_STEM_FUNCTION_REALIZATION_SOURCE_RULE_ID,
        sourceEvidenceKind:'direct-source-relation-outcome' };
    return { edge, inventory:inventoryFor(g, pattern.chartKey), chartKey:pattern.chartKey, affiliationRecords:[] };
}
const base = inputFor(synthetic, patterns[0]);
const evaluate = (input) => apiFor(synthetic).evaluateInput(input);
test('full ordered research closure installs R7 without defining global semantics', () => {
    assert(real.baziContextualForcePartyRegisteredMotifAuthorizationMatcher?.installed, 'R7 runtime missing');
    const contract = apiFor(real).CONTRACT;
    assert(contract.registeredMotifIds.length === 3 && contract.genericEffectTypeAuthorizationResolverDefined === false, 'registry/global boundary lost');
    assert(real.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.length === 5, 'research source registry was changed by synthetic tests');
});
test('research extension host preserves legacy wrappers, registration order and idempotency', () => {
    const context = { GuiJia:{ baziStrengthSynthesis:{ buildStrengthSynthesis:() => ({ trace:['base'] }) } } };
    context.globalThis = context;
    vm.createContext(context);
    const source = fs.readFileSync(path.join(ROOT, 'js/bazi-research-synthesis-extensions.js'), 'utf8');
    vm.runInContext(source, context);
    const host = context.GuiJia.baziResearchSynthesisExtensions;
    const append = (name) => (_, base) => ({ ...base, trace:[...base.trace, name] });
    assert(host.registerExtension('first', append('first')) === true, 'first registration failed');
    const current = context.GuiJia.baziStrengthSynthesis;
    context.GuiJia.baziStrengthSynthesis = { ...current, buildStrengthSynthesis:(model) => append('legacy')(model, current.buildStrengthSynthesis(model)) };
    assert(host.registerExtension('last', append('last')) === true, 'last registration failed');
    assert(host.registerExtension('first', append('duplicate')) === false, 'duplicate registered');
    vm.runInContext(source, context);
    assert(context.GuiJia.baziStrengthSynthesis.buildStrengthSynthesis().trace.join(',') === 'base,first,legacy,last', 'wrappers dropped or repeated');
    assert(host.registeredNames().join(',') === 'first,last', 'host state reset');
    let invalidRejected = false;
    try { host.registerExtension('invalid', null); } catch (_) { invalidRejected = true; }
    assert(invalidRejected, 'invalid extension accepted');
});
for (const [index, effect] of [[0,'anchor-opposition'],[1,'anchor-mediation']]) {
    test(`TEST-ONLY ${effect} traverses matcher → actual R5 → actual R4`, () => {
        const result = evaluate(inputFor(synthetic, patterns[index]));
        assert(result.match.matchState === 'matched-registered-source-backed-motif', 'known motif not matched');
        assert(result.normalized.normalizationState === 'resolved-source-backed-effect-authorization-input', 'R5 normalization failed');
        assert(result.execution.realized && result.execution.effectType === effect, 'R4 effect mismatch');
        assert(result.execution.membershipMutation === null && result.execution.numericWeight === null, 'effect leaked into membership/force');
        assert(result.normalized.relationIdentity.id === result.match.relationRecordId, 'relation identity changed');
        assert(result.match.positiveSourceCalibrationIntroduced === false, 'synthetic result promoted source calibration');
    });
}
test('augmentation requires and reuses the original validated affiliation identity', () => {
    const input = inputFor(synthetic, patterns[2]);
    assert(evaluate(input).match.matchState === 'unresolved-registered-motif-authorization', 'missing affiliation accepted');
    const profile = synthetic.baziContextualForcePartyAffiliationProfile;
    const motif = profile.MOTIFS.find((m) => profile.matchesMotif(input.edge, m, input.inventory));
    const record = profile.makeAffiliationRecord(input.edge, motif, input.inventory, 0);
    input.affiliationRecords = [record];
    const result = evaluate(input);
    assert(result.execution.effectType === 'anchor-augmentation' && result.execution.realized, 'augmentation failed');
    assert(result.match.sourceRecord.sourceIdentityId === record.id && result.match.sourceRecord.reusesAffiliationIdentity, 'affiliation identity duplicated');
    const damaged = { ...record, affiliated:false };
    assert(evaluate({ ...input, affiliationRecords:[damaged] }).match.matchState === 'unresolved-registered-motif-authorization', 'affiliation contradiction accepted');
    assert(evaluate({ ...input, affiliationRecords:[{ ...record, sourceRegistryEvidenceIds:[] }] }).match.matchState === 'unresolved-registered-motif-authorization', 'missing affiliation source evidence accepted');
});
test('registered exact realized relation without motif stays realized-unmapped', () => {
    const pattern = real.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS[1];
    const result = apiFor(real).evaluateInput(inputFor(real, pattern));
    assert(result.match.matchState === 'no-current-registered-motif-match', 'unexpected authorization');
    assert(result.execution.executionState === 'realized-relation-currently-unmapped', 'unmapped was collapsed or discarded');
});
test('registered negative realization creates no reverse effect', () => {
    const pattern = real.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS[2];
    const result = apiFor(real).evaluateInput(inputFor(real, pattern));
    assert(result.execution.executionState === 'not-realized-generic-relation-effect' && result.execution.reverseEffect === null, 'negative relation reversed');
});
test('TEST-ONLY matched negative motif also traverses R5 without a positive or reverse effect', () => {
    const negative = { ...patterns[0], realizationState:'not-realized-in-source-context' };
    const g = load([negative]);
    const result = apiFor(g).evaluateInput(inputFor(g, negative));
    assert(result.match.matchState === 'matched-registered-source-backed-motif' && result.normalized, 'negative motif lost authorization/normalization');
    assert(result.execution.executionState === 'not-realized-generic-relation-effect' && result.execution.reverseEffect === null, 'matched negative relation executed');
});
const mutations = [
    ['missing direction', (i) => { delete i.edge.directed; }],
    ['reversed direction', (i) => { [i.edge.sourceActorKey,i.edge.targetActorKey] = [i.edge.targetActorKey,i.edge.sourceActorKey]; }],
    ['unknown pattern', (i) => { i.edge.sourcePatternId = 'UNKNOWN'; }],
    ['missing source rule', (i) => { delete i.edge.sourceEvidenceRuleId; }],
    ['wrong function', (i) => { i.edge.functionType = 'generation'; }],
    ['unresolved realization', (i) => { i.edge.realizationState = 'unresolved'; }],
    ['forged negative realization', (i) => { i.edge.realizationState = 'not-realized-in-source-context'; }],
    ['group endpoint', (i) => { i.edge.targetActorKey = 'group:killers'; }],
    ['hidden endpoint', (i) => { i.edge.targetActorKey = 'hidden:0:癸'; }],
    ['chart context mismatch', (i) => { i.chartKey = '癸亥|丁酉|丁卯|己酉'; }],
    ['missing relation identity', (i) => { delete i.edge.id; }],
    ['conflicting role evidence', (i) => { i.inventory.evidenceRecords.push({ actorKey:i.edge.sourceActorKey, tenGod:'伤官' }); }],
    ['duplicate actor identity', (i) => { i.inventory.actorProfiles.push({ ...i.inventory.actorProfiles[0] }); }],
    ['membership contradiction', (i) => { i.inventory.actorProfiles.find((a) => a.actorKey === i.edge.targetActorKey).membershipClasses = ['daymaster-side-seed-candidate']; }]
];
for (const [name, mutate] of mutations) {
    test(`${name} fails closed without positive or negative execution`, () => {
        const input = JSON.parse(JSON.stringify(base));
        mutate(input);
        const result = evaluate(input);
        assert(result.match.matchState === 'unresolved-registered-motif-authorization', 'bad provenance accepted');
        assert(result.execution.executionState === 'unresolved-generic-relation-effect' && !result.execution.realized, 'bad input executed');
    });
}
test('source wording and caller case id cannot alter authorization', () => {
    const changed = { ...base, edge:{ ...base.edge, sourceTerm:'完全不同的叙述', sourceCaseId:'arbitrary-case' } };
    assert(evaluate(changed).execution.effectType === evaluate(base).execution.effectType, 'wording/case id drove effect type');
    assert(evaluate(changed).normalized.provenance.sourceWording === '完全不同的叙述', 'wording provenance lost');
});
test('multiple registry authorities fail closed instead of selecting first', () => {
    const g = load(patterns, true);
    const result = apiFor(g).evaluateInput(inputFor(g, patterns[0]));
    assert(result.match.blockerReasons.includes('registered-motif-authority-conflict'), 'conflicting authorities selected');
});
test('R5 normalization rejection cannot be bypassed by matcher fallback', () => {
    const g = load(patterns, false, true);
    const result = apiFor(g).evaluateInput(inputFor(g, patterns[0]));
    assert(result.match.matchState === 'matched-registered-source-backed-motif', 'test must reach normalization after matching');
    assert(result.normalized.normalizationState === 'unresolved-effect-authorization-input', 'stale R5 registry did not reject');
    assert(result.execution.executionState === 'unresolved-generic-relation-effect' && !result.execution.realized, 'normalization failure bypassed');
});
test('duplicate direct-source pattern identity fails closed', () => {
    const g = load([...patterns, patterns[0]]);
    assert(apiFor(g).evaluateInput(inputFor(g, patterns[0])).match.blockerReasons.includes('unique-registered-direct-source-pattern-required'), 'duplicate pattern accepted');
});
function makeResult(g, chartKey) {
    const parts = chartKey.split('|').map((part) => Array.from(part));
    const gans = parts.map((part) => part[0]);
    const zhis = parts.map((part) => part[1]);
    const bazi = g.baziCore;
    const dayGan = gans[2];
    const dayElement = bazi.getWuXing(dayGan);
    const pillars = gans.map((gan, index) => ({
        title:['年柱','月柱','日柱','时柱'][index], gan, zhi:zhis[index], ganZhi:gan + zhis[index],
        shishenGan:index === 2 ? '日主' : bazi.shiShenMap[dayGan][gan],
        cangGan:bazi.cangGanMap[zhis[index]].map(([hiddenGan, level]) => ({ gan:hiddenGan, level, wuxing:bazi.getWuXing(hiddenGan), shishen:bazi.shiShenMap[dayGan][hiddenGan] }))
    }));
    const internalRelations = bazi.calculateInternalChartRelations(gans, zhis);
    const monthSeason = bazi.buildMonthSeason(zhis[1], dayElement);
    return { dayGan, dayGanWuXing:dayElement, pillars, internalRelations, monthSeason,
        dayMasterEvidence:bazi.buildDayMasterEvidence(pillars, monthSeason, internalRelations, dayGan),
        matchedLiterature:[], lunarStr:'测试农历', solarStr:'测试时间', ruleSummary:'测试口径' };
}
test('real source chart traverses the full synthesis chain without unlocking R6 blockers', () => {
    const output = real.baziInterpretation.buildBaziInterpretation(makeResult(real, '丁丑|癸卯|乙卯|己卯'));
    const synthesis = output.semanticModel.strengthSynthesis;
    const audit = synthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher;
    assert(audit && audit.evaluatedRelationCount === 2 && audit.unmappedRelationCount === 2, 'real relations missing');
    assert(audit.results.some((r) => r.execution.executionState === 'realized-relation-currently-unmapped'), 'real positive unmapped missing');
    assert(audit.results.some((r) => r.execution.executionState === 'not-realized-generic-relation-effect'), 'real negative missing');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 5, 'R6 blockers falsely resolved');
    assert(synthesis.sufficiency.status === 'insufficient', 'final assessment unlocked');
    assert(synthesis.dependencies.find((d) => d.id === 'SD-CONTEXTUAL-FORCE-PARTY-GENERIC-EFFECT-TYPE-AUTHORIZATION-RESOLVER').status === 'unresolved', 'global resolver unlocked');
});
test('known ambiguous motif cases remain without positive actor-pair calibration', () => {
    const cases = real.baziContextualForcePartyVisibleMotifE2ECalibrationSource;
    assert(cases.OPPOSITION_CASES.length === 4 && cases.MEDIATION_CASES.length === 5, 'finite source corpus changed');
    for (const item of [...cases.OPPOSITION_CASES, ...cases.MEDIATION_CASES]) {
        assert(item.calibrationEligible === false, 'ambiguous source case promoted');
        const output = real.baziInterpretation.buildBaziInterpretation(makeResult(real, item.gans.map((gan, index) => gan + item.zhis[index]).join('|')));
        const audit = output.semanticModel.strengthSynthesis.contextualForcePartyRegisteredMotifAuthorizationMatcher;
        assert(audit.results.every((r) => !r.execution.realized), `unexpected actor-pair positive: ${item.id}`);
    }
});
test('extension is inert without upstream R6 and does not alter upstream effect records', () => {
    const runtime = real.baziContextualForcePartyRegisteredMotifAuthorizationMatcher;
    const empty = { state:'evaluated' };
    assert(runtime.extendSynthesis({}, empty) === empty, 'upstream boundary lost');
    const upstream = { state:'evaluated', contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit:{},
        contextualForcePartyRelationEffectView:{ records:[] }, contextualForcePartyCollectiveRelationEffectRecords:[],
        contextualForcePartyCollectiveMediationEffectRecords:[], dependencies:[], claims:[], activeRuleIds:[] };
    const result = runtime.extendSynthesis({}, upstream);
    assert(result.contextualForcePartyRelationEffectView === upstream.contextualForcePartyRelationEffectView, 'upstream effects overwritten');
    assert(result.contextualForcePartyRegisteredMotifAuthorizationMatcher.status === 'registered-motif-matcher-not-applicable', 'empty input promoted to coverage');
});
test('matcher is read-only with respect to supplied source records and inventory', () => {
    const input = JSON.parse(JSON.stringify(base));
    const before = JSON.stringify(input);
    evaluate(input);
    assert(JSON.stringify(input) === before, 'source input mutated');
});
if (failed) process.exit(1);
console.log(`\n${passed} passed`);
