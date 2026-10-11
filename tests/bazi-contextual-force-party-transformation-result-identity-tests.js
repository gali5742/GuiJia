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
const g = context.GuiJia,api = g.baziContextualForcePartyTransformationResultIdentityProfile;
const contract = g.baziContextualForcePartyTransformationResultIdentityContract;
const normalizer = g.baziContextualForcePartyEffectAuthorizationNormalizedInputProfile;
const kernel = g.baziContextualForcePartyGenericRelationEffectExecutionProfile;
const { STATES } = api;
const copy = (v) => JSON.parse(JSON.stringify(v));
const input = () => api.inputForCase();
const CHART = '癸巳|戊午|丙午|壬辰',NEIGHBOR = '癸丑|戊午|丙午|壬辰',POSITIVE = '壬申|丁未|丁未|癸卯';
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
const evaluate = () => api.evaluateIdentity(input(),actualContext());

const reviewed = g.baziContextualForcePartyTransformedSourceBladeIdentityAuditProfile;
// A complete proposal fixture exercises schema validity only. It is not a classical source or authority.
function proposal(record = input()) {
    return { id:'SYNTHETIC-MATERIALIZATION-PROPOSAL',sourceCaseId:record.sourceCaseId,chartKey:record.chartKey,
        operationId:record.operation.id,resultId:record.result.id,authorityId:'SYNTHETIC-UNREGISTERED-AUTHORITY',
        sourceEvidenceIds:[record.sourceCaseId,'SYNTHETIC-UNREGISTERED-AUTHORITY'],
        endpoint:{ type:'transformation-result',resultKey:contract.resultKeyFor(record),scope:'source-case-operation-result',cardinality:1 } };
}
test('actual R17 source review normalizes to a validated distinct operation and result input',() => {
    const n = api.normalizeSourceReview(reviewed.inputForCase()),r = n.identityRecord;
    assert(n.sourceValidation.valid && n.validation.valid && contract.validateIdentityInput(r).valid,'normalization bypassed');
    assert(r.contractId === contract.CONTRACT.id && r.schemaVersion === '0.1' && r.id === 'CF-TRIC-INPUT-01','wrong input schema');
    assert(r.operation.id === 'CF-TRIC-OPERATION-01' && r.result.id === 'CF-TSBI-RESULT-01'
        && r.operation.id !== r.result.id && r.result.operationId === r.operation.id && r.operation.resultId === r.result.id,'operation/result conflated');
});
test('full natal source provenance and original asserted spans survive normalization',() => {
    const r = input();
    assert(r.sourceProvenance.sourceText === reviewed.inputForCase().upstreamInput.sourceCase.sourceText
        && r.sourceProvenance.retrievedOn === '2026-10-11' && r.sourceProvenance.revisionId === null,'source provenance lost');
    assert(r.operation.assertion.span === '此则戊癸合而必化' && r.result.assertion.span === '化火为劫'
        && r.result.assertion.authorityId === 'CF-TSBI-TRANSFORM-01','assertion authority lost');
});
test('actual inventory supports operand identities and result provenance with no source endpoint',() => {
    const r = evaluate();
    assert(r.state === STATES.PROVENANCE_RESOLVED && r.operationIdentityResolved && r.resultProvenanceResolved
        && r.registeredSourceReviewMatched && r.inventoryValidation.valid,'provenance unresolved');
    assert(r.identityRecord.operation.inputEndpoints.map((e) => e.actorKey).join(',') === 'visible:1:戊,visible:0:癸','operand order/identity changed');
    assert(r.sourceEndpoint === null && !r.sourceEndpointResolved && !r.executionAuthorized,'provenance materialized');
});
test('source labels remain labels without demanding an invented natal stem or polarity',() => {
    const r = input().result;
    assert(r.labels.element === '火' && r.labels.role === '劫' && r.executableEndpoint === null
        && !Object.hasOwn(r,'stem') && !Object.hasOwn(r,'polarity'),'result became ordinary actor');
    assert(!contract.CONTRACT.ordinaryStemOrPolarityRequiredForProvenance && !contract.CONTRACT.resultSourceLabelsNormalizeTenGodClass,'unjustified result type requirement');
});
test('no materialization authority or inventory adapter is introduced by the contract',() => {
    const m = evaluate().materialization;
    assert(m.state === contract.MATERIALIZATION_STATES.MISSING && !m.registeredAuthority && !m.materializedResultInventoryVerified
        && !m.kernelEndpointSupported && m.executableEndpoint === null,'missing materialization released');
    assert(contract.MATERIALIZATION_AUTHORITIES.length === 0 && contract.CONTRACT.requiredMaterializationGates.length === 4,'authority added');
});
test('a complete materialization proposal is schema-valid but remains unregistered and unexecutable',() => {
    const record = input(),claim = proposal(record),r = api.evaluateIdentity(record,actualContext(),claim);
    assert(contract.validateMaterializationClaim(record,claim).valid && r.materialization.validation.valid,'complete proposal fixture invalid');
    assert(r.materialization.state === contract.MATERIALIZATION_STATES.UNREGISTERED && !r.materialization.registeredAuthority
        && !r.materialization.materializedResultInventoryVerified && !r.materialization.kernelEndpointSupported,'complete schema acted as authority');
    assert(r.state === STATES.PROVENANCE_RESOLVED && r.sourceEndpoint === null && !r.executionAuthorized,'unregistered proposal executed');
});
test('reserved result proposal type is not admitted to actual endpoint identity or R4 vocabulary',() => {
    const errors = kernel.validateEndpoint(proposal().endpoint,'source');
    assert(errors.includes('source-endpoint-type-unsupported')
        && !g.baziContextualForcePartyRelationEndpointIdentityContract.CONTRACT.endpointTypes.includes('transformation-result'),'kernel endpoint vocabulary expanded');
    const r = copy(g.baziContextualForcePartySourceOfficerKillerNonrealizationProfile.evaluateNonrealization(
        g.baziContextualForcePartySourceOfficerKillerNonrealizationProfile.inputForCase(),actualContext()).executionInput);
    r.sourceEndpoint = proposal().endpoint;r.realizationState = 'realized-in-source-context';
    assert(kernel.executeRelationEffect(r).executionState === 'unresolved-generic-relation-effect','R4 executed reserved proposal');
});
test('schema-valid source-label substitution remains unauthorized by registered review',() => {
    const r = copy(input());r.result.labels.role = '劫财';
    assert(contract.validateIdentityInput(r).valid,'schema should distinguish label shape from authority');
    const e = api.evaluateIdentity(r,actualContext());
    assert(e.state === STATES.UNRESOLVED && !e.registeredSourceReviewMatched && !e.resultProvenanceResolved,'schema validity authorized new label');
});
test('coherently changed source chart can pass schema but cannot inherit source authority',() => {
    const r = copy(input());r.chartKey = NEIGHBOR;r.sourceProvenance.chartKey = NEIGHBOR;
    assert(contract.validateIdentityInput(r).valid && api.evaluateIdentity(r,{ ...actualContext(),chartKey:NEIGHBOR }).state === STATES.UNRESOLVED,'unknown source chart authorized');
});
test('coherently changed operation and result IDs cannot borrow an existing source review',() => {
    const r = copy(input());r.operation.id = 'UNKNOWN-OPERATION';r.result.operationId = r.operation.id;
    r.result.id = 'UNKNOWN-RESULT';r.operation.resultId = r.result.id;
    assert(contract.validateIdentityInput(r).valid && api.evaluateIdentity(r,actualContext()).state === STATES.UNRESOLVED,'schema references acted as registered identity');
});
const malformed = (name,edit) => test(name,() => {
    const r = copy(input());edit(r);
    const v = contract.validateIdentityInput(r),e = api.evaluateIdentity(r,actualContext());
    assert(!v.valid && e.state === STATES.INVALID && !e.operationIdentityResolved && !e.sourceEndpointResolved,'malformed identity accepted');
});
malformed('schema version cannot silently change',(r) => { r.schemaVersion = '0.2'; });
malformed('source provenance cannot lose full chart identity',(r) => { r.sourceProvenance.chartKey = NEIGHBOR; });
malformed('numeric source text fails closed without throwing',(r) => { r.sourceProvenance.sourceText = 123; });
malformed('source revision uncertainty cannot be removed',(r) => { delete r.sourceProvenance.revisionId; });
malformed('source revision must be explicit unknown or a revision identity',(r) => { r.sourceProvenance.revisionId = { verified:true }; });
malformed('result cannot alias operation identity',(r) => { r.result.id = r.operation.id;r.operation.resultId = r.result.id; });
malformed('result cannot alias original operand key',(r) => { r.result.id = r.operation.inputEndpoints[0].actorKey;r.operation.resultId = r.result.id; });
malformed('operation result back-reference must match',(r) => { r.result.operationId = 'UNKNOWN'; });
malformed('original operand references cannot duplicate',(r) => { r.operation.inputEndpoints[1] = copy(r.operation.inputEndpoints[0]); });
malformed('original operand cannot become compound group',(r) => { r.operation.inputEndpoints[0].type = 'actor-group'; });
malformed('original operand cardinality cannot change',(r) => { r.operation.inputEndpoints[0].cardinality = 2; });
malformed('sparse operand lists cannot pass schema',(r) => { r.operation.inputEndpoints = new Array(2); });
malformed('source assertion cannot become computed realization',(r) => { r.operation.assertion.state = 'realized-in-source-context'; });
malformed('source assertion span must remain in source excerpt',(r) => { r.result.assertion.span = '新火独助月午'; });
malformed('source assertion cannot omit its authority evidence',(r) => { r.result.assertion.evidenceIds = [r.sourceCaseId]; });
malformed('source assertion cannot use sparse evidence',(r) => { r.operation.assertion.evidenceIds = new Array(2); });
malformed('ordinary source endpoint cannot be put inside provenance input',(r) => { r.result.executableEndpoint = { type:'actor',actorKey:'visible:1:戊' }; });
malformed('caller cannot add a source-backed flag',(r) => { r.sourceBacked = true; });
malformed('caller cannot add target or effect hints',(r) => { r.result.effectType = 'anchor-augmentation'; });
test('changed upstream review cannot normalize even with validation flag or trusted-looking IDs',() => {
    const i = copy(reviewed.inputForCase());i.transformationReview.resultActorKey = 'hidden:1:午:丁:0';i.validation = { valid:true };
    const n = api.normalizeSourceReview(i);
    assert(!n.sourceValidation.valid && n.identityRecord === null,'caller source review bypassed');
    assert(api.inputForCase('UNKNOWN') === null,'unknown case registered');
});
const malformedClaim = (name,edit) => test(name,() => {
    const claim = proposal();edit(claim);
    const r = api.evaluateIdentity(input(),actualContext(),claim);
    assert(!r.materialization.validation.valid && r.materialization.state === contract.MATERIALIZATION_STATES.INVALID
        && r.sourceEndpoint === null && !r.executionAuthorized && r.resultProvenanceResolved,'claim corrupted provenance or materialized');
});
malformedClaim('assertion review cannot double as materialization authority',(c) => { c.authorityId = 'CF-TSBI-TRANSFORM-01';c.sourceEvidenceIds = [c.sourceCaseId,c.authorityId]; });
malformedClaim('materialization cannot cross case or operation',(c) => { c.operationId = 'UNKNOWN'; });
malformedClaim('materialization result cannot change',(c) => { c.resultId = 'UNKNOWN'; });
malformedClaim('existing Wu cannot alias result endpoint',(c) => { c.endpoint.type = 'actor';c.endpoint.actorKey = 'visible:1:戊'; });
malformedClaim('existing hidden Ding cannot alias derived result key',(c) => { c.endpoint.resultKey = 'hidden:1:午:丁:0'; });
malformedClaim('ordinary group cannot alias transformation endpoint',(c) => { c.endpoint.type = 'actor-group'; });
malformedClaim('result proposal cannot acquire cardinality from candidate count',(c) => { c.endpoint.cardinality = 2; });
malformedClaim('result proposal needs declared cardinality',(c) => { delete c.endpoint.cardinality; });
malformedClaim('source evidence IDs cannot be a duplicate or sparse list',(c) => { c.sourceEvidenceIds = new Array(2); });
malformedClaim('caller materialization validation flags cannot grant authority',(c) => { c.validated = true;c.sourceBacked = true; });
test('R15 license and R16 denial cannot be registered as result materialization authority',() => {
    for (const authorityId of ['CF-SOKEC-EFFECT-01','CF-SOKNR-REALIZATION-01','CF-TSBI-BLADE-01']) {
        const c = proposal();c.authorityId = authorityId;c.sourceEvidenceIds = [c.sourceCaseId,authorityId];
        const m = api.inspectMaterialization(input(),c);
        assert(m.validation.valid && !m.registeredAuthority && m.executableEndpoint === null,'borrowed authority accepted');
    }
});
test('forged result inventory cannot replace registered materialization authority or kernel support',() => {
    const ctx = copy(actualContext()),c = proposal();ctx.inventory.actorProfiles.push({ actorKey:c.endpoint.resultKey });
    ctx.inventory.evidenceRecords.push({ actorKey:c.endpoint.resultKey,sourceBacked:true,materialized:true });
    const r = api.evaluateIdentity(input(),ctx,c);
    assert(!r.materialization.registeredAuthority && !r.materialization.materializedResultInventoryVerified && !r.sourceEndpointResolved,'forged materialized actor accepted');
});
test('malformed primitives missing chart and malformed inventories fail closed without throwing',() => {
    for (const r of [null,[],42,{}, { operation:null }]) {
        assert(!contract.validateIdentityInput(r).valid && !contract.validateMaterializationClaim(r,proposal()).valid
            && api.evaluateIdentity(r,actualContext()).state === STATES.INVALID,'malformed input accepted');
    }
    for (const ctx of [null,{}, { chartKey:42 },{ chartKey:CHART },{ chartKey:CHART,inventory:{} },
        { chartKey:CHART,inventory:{ actorProfiles:[null],evidenceRecords:[] } }]) {
        assert(api.evaluateIdentity(input(),ctx).state === STATES.UNRESOLVED,'missing actual operands supplied');
    }
});
test('inapplicable current chart does not gain operation or result runtime identity',() => {
    for (const chartKey of [NEIGHBOR,POSITIVE,'壬辰|戊午|丙午|癸巳']) {
        const r = api.evaluateIdentity(input(),{ ...actualContext(),chartKey });
        assert(r.state === STATES.NOT_APPLICABLE && !r.operationIdentityResolved && !r.resultProvenanceResolved,'identity transferred');
    }
});
const badInventory = (name,edit) => test(name,() => {
    const ctx = copy(actualContext());edit(ctx.inventory);
    const r = api.evaluateIdentity(input(),ctx);
    assert(r.state === STATES.UNRESOLVED && !r.resultProvenanceResolved && r.sourceEndpoint === null,'original operand evidence fabricated');
});
badInventory('missing visible Gui is not replaced by hidden homonym',(i) => { i.actorProfiles = i.actorProfiles.filter((p) => p.actorKey !== 'visible:0:癸'); });
badInventory('duplicate Wu cannot resolve by first selection',(i) => { i.actorProfiles.push(copy(i.actorProfiles.find((p) => p.actorKey === 'visible:1:戊'))); });
badInventory('missing original role evidence cannot reuse actor profile',(i) => { i.evidenceRecords = i.evidenceRecords.filter((p) => p.actorKey !== 'visible:1:戊'); });
badInventory('incorrect source role blocks reviewed operand identity',(i) => { i.evidenceRecords.filter((p) => p.actorKey === 'visible:0:癸').forEach((p) => { p.tenGod = '七杀'; }); });
badInventory('hidden scope cannot masquerade as original visible actor',(i) => { i.evidenceRecords.filter((p) => p.actorKey === 'visible:1:戊').forEach((p) => { p.sourceScope = 'hidden-branch'; }); });
test('source operation provenance is independent of unresolved blade target inventory',() => {
    const ctx = copy(actualContext());ctx.inventory.actorProfiles = ctx.inventory.actorProfiles.filter((p) => !p.actorKey.startsWith('surface-branch:'));
    ctx.inventory.evidenceRecords = ctx.inventory.evidenceRecords.filter((p) => !p.actorKey.startsWith('surface-branch:'));
    const r = api.evaluateIdentity(input(),ctx);
    assert(r.state === STATES.PROVENANCE_RESOLVED && r.resultProvenanceResolved && !r.sourceEndpointResolved,'target ambiguity erased original source provenance');
});
test('normalization validators and runtime evaluation preserve mutable callers and freeze outputs',() => {
    const i = copy(reviewed.inputForCase()),beforeI = JSON.stringify(i),n = api.normalizeSourceReview(i);
    const record = copy(n.identityRecord),ctx = copy(actualContext()),c = proposal(record),before = JSON.stringify([record,ctx,c]);
    const r = api.evaluateIdentity(record,ctx,c);
    assert(JSON.stringify(i) === beforeI && JSON.stringify([record,ctx,c]) === before && !Object.isFrozen(i)
        && !Object.isFrozen(record) && !Object.isFrozen(ctx.inventory) && !Object.isFrozen(c),'caller mutated');
    assert(Object.isFrozen(n.identityRecord.sourceProvenance.gans) && Object.isFrozen(r.identityRecord.operation.inputEndpoints[0])
        && Object.isFrozen(r.materialization.validation.issues),'output mutable');
});
test('research integration distinguishes schema readiness provenance and source endpoint readiness',() => {
    const p = synthesis.contextualForcePartyTransformationResultIdentity;
    assert(p.schemaContractDefined && p.resolvedRuntimeOperationCount === 1 && p.resolvedRuntimeResultProvenanceCount === 1
        && p.resolvedRuntimeSourceEndpointCount === 0 && p.registeredMaterializationAuthorityCount === 0,'readiness conflated');
    assert(p.newIndependentSourceCaseCount === 0 && !p.bladeTargetResolved && !p.relationEffects.length && !p.memberEdges.length
        && p.numericScore === null && p.relativeDominance === null,'scope expanded');
    const d = synthesis.dependencies.find((d) => d.ruleId === api.RULE_ID);
    assert(d.status === 'resolved' && d.kind === 'contract' && d.scope === contract.CONTRACT.scope,'narrow contract status incorrect');
});
test('static schema readiness remains separate from applicability on neighbor chart',() => {
    const p = outputFor(NEIGHBOR).semanticModel.strengthSynthesis.contextualForcePartyTransformationResultIdentity;
    assert(p.schemaContractDefined && p.result.state === STATES.NOT_APPLICABLE && p.resolvedRuntimeOperationCount === 0
        && p.resolvedRuntimeSourceEndpointCount === 0,'schema implies runtime identity');
});
test('R17 ambiguity and R16 original nonrealization remain intact',() => {
    const p = synthesis.contextualForcePartyTransformedSourceBladeIdentityAudit;
    assert(p.result.bladeCandidates.length === 2 && p.result.targetIdentity.cardinality === null
        && p.result.execution.executionState === 'unresolved-generic-relation-effect','R17 released');
    assert(synthesis.contextualForcePartySourceOfficerKillerNonrealization.result.execution.executionState === 'not-realized-generic-relation-effect','R16 denied relation changed');
    assert(normalizer.normalizeExactActorPair(input(),actualContext()).normalizationState === normalizer.NORMALIZATION_STATES.UNRESOLVED,'R5 gave alternate license');
});
test('R15 positive R9 mediation CASE06 and old registries retain behavior',() => {
    const s = outputFor(POSITIVE).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourceOfficerKillerEffectCalibration.result.execution.effectType === 'anchor-augmentation','R15 regressed');
    const m = outputFor('癸酉|甲子|丁卯|丙午').semanticModel.strengthSynthesis;
    assert(m.contextualForcePartyRegisteredMotifAuthorizationMatcher.results.some((r) => r.execution.realized && r.execution.effectType === 'anchor-mediation'),'R9 regressed');
    assert(g.baziContextualForcePartyHiddenSingleTargetBindingProfile.buildProfile().resolvedBindings.some((b) => b.stableActorKey === 'hidden:3:亥:壬:0'),'CASE06 regressed');
    assert(g.baziContextualForcePartyRelationEffectContract.MOTIFS.length === 3
        && !g.baziVisibleStemFunctionRealizationSource.DIRECT_SOURCE_PATTERNS.some((p) => p.chartKey === CHART),'old registries expanded');
});
test('R11 B02-B05 and final assessment remain unresolved',() => {
    const s = outputFor(WEALTH_FIRST).semanticModel.strengthSynthesis;
    assert(s.contextualForcePartySourcePathTargetAnnotation.runtimePaths.every((p) => p.targetEndpoint.actorKey === null),'R11 identity transferred');
    assert(synthesis.contextualForcePartyEffectTypeAuthorizationSourceCapabilityAudit.unresolvedGlobalResolverBlockerCount === 4
        && synthesis.sufficiency.status === 'insufficient' && source.semanticModel.assessmentLayer.state === 'contract-only','final or generic mapping released');
});
test('absent upstream stays inert and extension is idempotent',() => {
    const ext = g.baziContextualForcePartyTransformationResultIdentity,base = {};
    assert(ext.extendSynthesis({},base) === base && api.buildProfile().result.state === STATES.UNRESOLVED,'absent context fabricated');
    const twice = ext.extendSynthesis(source.semanticModel,synthesis);
    assert(twice.claims.filter((c) => c.ruleId === api.RULE_ID).length === 1 && twice.dependencies.filter((d) => d.ruleId === api.RULE_ID).length === 1
        && twice.boundaries.filter((b) => b === contract.CONTRACT.boundary).length === 1,'duplicate integration');
});
console.log(`\nTransformation Result Identity Contract tests: ${passed} passed, ${failed} failed.`);
if (failed) process.exit(1);
