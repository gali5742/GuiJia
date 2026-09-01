'use strict';
const assert = require('assert');
require('../js/liuyao-litigation-proceeding-acceptance-pretraining-v01.js');
const mod = globalThis.GuiJia.liuyaoLitigationProceedingAcceptancePretrainingV01;
let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log('PASS', name); };

const base = (target='institutional_acceptance') => ({
  event:{ type:'litigation_dispute' },
  goals:[{ type:'outcome' }],
  semantics:{ disputeDuty:'proceeding_acceptance', currentTargetAspect:'proceeding_acceptance' },
  disputeSubject:{ relationToQuerent:'self', specificity:'specific' },
  proceedingContext:{ type:'lawsuit', status:'filed', specificity:'context_bounded' },
  acceptanceContext:{ targetAspect:target, filingStage:'initial_filing', specificity:'context_bounded' },
  filingContext:{ relevance:'structurally_implied' }
});

test('design only unreachable', () => {
  assert.equal(mod.status, 'design_only_unreachable');
  assert.equal(mod.currentRuntimeReachable, false);
});

test('institutional acceptance sufficient', () => {
  assert.equal(mod.validateIntentContract(base()).status, 'sufficient');
});

test('institutional acceptance plan uses ghost primary and parent required domain', () => {
  const plan = mod.buildDraftObservationPlan(base());
  assert.equal(plan.ruleRef, 'TR-LD-002-A');
  assert.equal(plan.coRequiredPair, true);
  assert.deepEqual(plan.subjects[0].selector, { type:'six_relative', value:'官鬼' });
  assert.equal(plan.subjects[0].source, 'primary');
  assert.equal(plan.subjects[1].selector.value, '父母');
  assert.equal(plan.subjects[1].source, 'domain');
  assert.equal(plan.subjects[1].required, true);
});

test('filing document acceptance sufficient', () => {
  assert.equal(mod.validateIntentContract(base('filing_document_acceptance')).status, 'sufficient');
});

test('filing document acceptance plan reverses primary and required domain', () => {
  const plan = mod.buildDraftObservationPlan(base('filing_document_acceptance'));
  assert.equal(plan.ruleRef, 'TR-LD-002-B');
  assert.equal(plan.subjects[0].selector.value, '父母');
  assert.equal(plan.subjects[1].selector.value, '官鬼');
  assert.equal(plan.subjects[1].required, true);
});

test('self filing party role is required', () => {
  const plan = mod.buildDraftObservationPlan(base());
  const role = plan.subjects.find((s) => s.source === 'role');
  assert.deepEqual(role.selector, { type:'shi' });
  assert.equal(role.required, true);
});

test('represented dispute subject remains deferred by sufficiency', () => {
  const i = base(); i.disputeSubject.relationToQuerent = 'represented';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('unknown acceptance target unresolved', () => {
  const i = base(); i.acceptanceContext.targetAspect = 'unknown';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('evidence admission remains deferred', () => {
  const i = base('evidence_admission');
  assert.equal(mod.validateIntentContract(i).status, 'deferred');
  assert.equal(mod.buildDraftObservationPlan(i).status, 'deferred');
});

test('filing context required', () => {
  const i = base(); i.filingContext.relevance = 'unknown';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('explicit filing context accepted', () => {
  const i = base(); i.filingContext.relevance = 'explicit';
  assert.equal(mod.validateIntentContract(i).status, 'sufficient');
});

test('appeal filing accepted as semantic stage', () => {
  const i = base(); i.acceptanceContext.filingStage = 'appeal_filing';
  assert.equal(mod.validateIntentContract(i).status, 'sufficient');
});

test('arbitration filing accepted as semantic stage', () => {
  const i = base(); i.proceedingContext.type = 'arbitration'; i.acceptanceContext.filingStage = 'arbitration_filing';
  assert.equal(mod.validateIntentContract(i).status, 'sufficient');
});

test('unsupported filing stage blocked', () => {
  const i = base(); i.acceptanceContext.filingStage = 'evidence_submission';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('generic proceeding blocked', () => {
  const i = base(); i.proceedingContext.specificity = 'generic';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('wrong current target blocked', () => {
  const i = base(); i.semantics.currentTargetAspect = 'formal_proceeding_outcome';
  assert.equal(mod.validateIntentContract(i).status, 'insufficient');
});

test('litigation outcome duty not applicable', () => {
  const i = base(); i.semantics.disputeDuty = 'litigation_outcome';
  assert.equal(mod.validateIntentContract(i).status, 'not_applicable');
});

test('evidence layer never emits final assessment', () => {
  const r = mod.buildAcceptanceEvidence(base(), { documentSupport:'supported', authoritySupport:'supported' });
  assert.equal(r.pairState, 'both_supported');
  assert.equal(r.finalAssessment, null);
  assert.equal(r.scoring, null);
});

test('document strong authority weak preserved as composite evidence', () => {
  const r = mod.buildAcceptanceEvidence(base(), { documentSupport:'supported', authoritySupport:'weak' });
  assert.equal(r.pairState, 'document_supported_authority_weak');
});

test('authority strong document weak preserved as composite evidence', () => {
  const r = mod.buildAcceptanceEvidence(base(), { documentSupport:'weak', authoritySupport:'supported' });
  assert.equal(r.pairState, 'authority_supported_document_weak');
});

test('semantic intent has no traditional selector leakage', () => {
  assert.deepEqual(mod.findTraditionalSemanticLeaks(base()), []);
});

console.log(`Litigation proceeding acceptance regression: ${passed} passed, 0 failed`);
