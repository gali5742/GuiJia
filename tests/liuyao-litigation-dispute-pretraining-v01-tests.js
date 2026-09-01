#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, JSON, Object, Set };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js/liuyao-litigation-dispute-pretraining-v01.js'), 'utf8'),
    context,
    { filename:'js/liuyao-litigation-dispute-pretraining-v01.js' }
);

const api = context.GuiJia.liuyaoLitigationDisputePretrainingV01;
let passed = 0;
let failed = 0;

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};
const test = (name, fn) => {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
};

const base = (duty, aspect, extra = {}) => ({
    event:{ type:'litigation_dispute' },
    goals:[{ type:'outcome' }],
    disputeSubject:{ relationToQuerent:'self', specificity:'specific' },
    proceedingContext:{
        type:'lawsuit',
        status:'ongoing',
        specificity:'context_bounded'
    },
    counterpartyContext:{ specificity:'context_bounded' },
    counterpartyAction:{ type:'unknown' },
    resolutionContext:{ type:'unknown' },
    documentContext:{ relevance:'not_indicated' },
    semantics:{
        disputeDuty:duty,
        currentTargetAspect:aspect
    },
    ...extra
});

test('LD1 design-only unreachable', () => {
    assert(api.status === 'design_only_unreachable', `status=${api.status}`);
    assert(api.currentRuntimeReachable === false, 'must remain unreachable');
});

test('LD2 litigation outcome contract can be sufficient', () => {
    assert(api.validateIntentContract(base('litigation_outcome','formal_proceeding_outcome')).status === 'sufficient', 'litigation outcome should pass');
});

test('LD3 litigation outcome plan uses proceeding primary plus both party roles', () => {
    const plan = api.buildDraftObservationPlan(base('litigation_outcome','formal_proceeding_outcome'));
    assert(plan.status === 'resolved', 'plan unresolved');
    assert(plan.subjects[0].selector.value === '官鬼' && plan.subjects[0].source === 'primary', 'proceeding primary missing');
    assert(plan.subjects.some((s) => s.selector.type === 'shi' && s.semanticDuty === 'self_party'), 'self role missing');
    assert(plan.subjects.some((s) => s.selector.type === 'ying' && s.semanticDuty === 'counterparty'), 'counterparty role missing');
});

test('LD4 document context adds parents as domain only', () => {
    const intent = base('litigation_outcome','formal_proceeding_outcome', {
        documentContext:{ relevance:'explicit' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    const doc = plan.subjects.find((s) => s.selector.value === '父母');
    assert(doc && doc.source === 'domain', 'document domain missing');
    assert(plan.subjects[0].selector.value === '官鬼', 'document stole primary');
});

test('LD5 no document context does not force parents', () => {
    const plan = api.buildDraftObservationPlan(base('litigation_outcome','formal_proceeding_outcome'));
    assert(!plan.subjects.some((s) => s.selector.value === '父母'), 'parents should not be forced');
});

test('LD6 resolution plan keeps proceeding primary and adds child domain', () => {
    const plan = api.buildDraftObservationPlan(base('dispute_resolution_outcome','dispute_resolution'));
    assert(plan.subjects[0].selector.value === '官鬼', 'active dispute primary missing');
    assert(plan.subjects.some((s) => s.selector.value === '子孙' && s.source === 'domain'), 'resolution support missing');
});

test('LD7 bounded pre-litigation dispute may use resolution duty', () => {
    const intent = base('dispute_resolution_outcome','dispute_resolution', {
        proceedingContext:{ type:'pre_litigation_bounded_dispute', status:'threatened', specificity:'context_bounded' }
    });
    assert(api.validateIntentContract(intent).status === 'sufficient', 'bounded pre-litigation resolution should pass');
});

test('LD8 counterparty action uses ying as primary', () => {
    const intent = base('dispute_counterparty_action','counterparty_action', {
        counterpartyAction:{ type:'continue_proceeding' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.status === 'resolved' && plan.subjects[0].selector.type === 'ying' && plan.subjects[0].source === 'primary', 'counterparty action primary');
});

test('LD9 counterparty settlement action adds child resolution context', () => {
    const intent = base('dispute_counterparty_action','counterparty_action', {
        counterpartyAction:{ type:'settle' }
    });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects.some((s) => s.selector.value === '子孙'), 'settlement context missing');
});

test('LD10 counterparty action requires bounded counterparty', () => {
    const intent = base('dispute_counterparty_action','counterparty_action', {
        counterpartyContext:{ specificity:'generic' },
        counterpartyAction:{ type:'respond' }
    });
    assert(api.validateIntentContract(intent).status === 'insufficient', 'generic counterparty should stop');
});

test('LD11 represented subject is deferred', () => {
    const intent = base('litigation_outcome','formal_proceeding_outcome', {
        disputeSubject:{ relationToQuerent:'represented', specificity:'specific' }
    });
    const result = api.validateIntentContract(intent);
    assert(result.issues.some((x) => x.code === 'represented_dispute_subject_deferred'), 'represented subject should defer');
});

test('LD12 proceeding acceptance is deferred', () => {
    const result = api.validateIntentContract(base('proceeding_acceptance','formal_proceeding_outcome'));
    assert(result.issues.some((x) => x.code === 'dispute_duty_deferred'), 'acceptance should defer');
});

test('LD13 settlement suitability is deferred', () => {
    const result = api.validateIntentContract(base('settlement_suitability','dispute_resolution'));
    assert(result.issues.some((x) => x.code === 'dispute_duty_deferred'), 'settlement suitability should defer');
});

test('LD14 litigation strategy is deferred', () => {
    const result = api.validateIntentContract(base('litigation_strategy','formal_proceeding_outcome'));
    assert(result.issues.some((x) => x.code === 'dispute_duty_deferred'), 'strategy should defer');
});

test('LD15 generic dispute state is deferred', () => {
    const result = api.validateIntentContract(base('generic_dispute_state','formal_proceeding_outcome'));
    assert(result.issues.some((x) => x.code === 'dispute_duty_deferred'), 'generic state should defer');
});

test('LD16 debt recovery target stays outside litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','debt_recovery'));
    assert(result.issues.some((x) => x.code === 'debt_recovery_outside_litigation'), 'debt boundary');
});

test('LD17 commercial performance target stays outside litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','commercial_performance'));
    assert(result.issues.some((x) => x.code === 'commercial_performance_outside_litigation'), 'commercial boundary');
});

test('LD18 relationship status target stays outside litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','relationship_status'));
    assert(result.issues.some((x) => x.code === 'relationship_status_outside_litigation'), 'relationship boundary');
});

test('LD19 employment status target stays outside litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','employment_status'));
    assert(result.issues.some((x) => x.code === 'employment_status_outside_litigation'), 'career boundary');
});

test('LD20 legal information target stays outside litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','legal_information_or_procedure'));
    assert(result.issues.some((x) => x.code === 'legal_information_or_procedure_outside_litigation'), 'information boundary');
});

test('LD21 compensation amount is not auto-litigation', () => {
    const result = api.validateIntentContract(base('litigation_outcome','compensation_amount'));
    assert(result.issues.some((x) => x.code === 'compensation_amount_outside_litigation'), 'compensation boundary');
});

test('LD22 arbitration is accepted as formal proceeding type', () => {
    const intent = base('litigation_outcome','formal_proceeding_outcome', {
        proceedingContext:{ type:'arbitration', status:'ongoing', specificity:'specific' }
    });
    assert(api.validateIntentContract(intent).status === 'sufficient', 'arbitration should be accepted');
});

test('LD23 evidence never returns final win/loss score', () => {
    const e = api.buildLitigationEvidence(
        base('litigation_outcome','formal_proceeding_outcome'),
        { selfVitality:'supported', counterpartyVitality:'weak', proceedingPressureOn:'counterparty' }
    );
    assert(e.evidence.length === 3, 'evidence count');
    assert(e.finalAssessment === null && e.scoring === null, 'must not score/finalize');
});

test('LD24 party void means withdrawal/retreat evidence, not automatic loss', () => {
    const e = api.buildLitigationEvidence(
        base('litigation_outcome','formal_proceeding_outcome'),
        { selfVoid:true, counterpartyVoid:true }
    );
    assert(e.evidence.some((x) => x.polarity === 'withdrawal_or_retreat_tendency'), 'self void semantics');
    assert(e.evidence.some((x) => x.polarity === 'counterparty_withdrawal_or_retreat_tendency'), 'counterparty void semantics');
    assert(e.finalAssessment === null, 'void must not finalize');
});

test('LD25 counterparty movement is activity evidence only', () => {
    const e = api.buildLitigationEvidence(
        base('dispute_counterparty_action','counterparty_action', { counterpartyAction:{ type:'respond' } }),
        { counterpartyMoving:true }
    );
    assert(e.evidence[0].type === 'counterparty_activity' && e.finalAssessment === null, 'movement semantics');
});

test('LD26 semantic intent has no traditional selector leak', () => {
    const intent = base('dispute_counterparty_action','counterparty_action', {
        counterpartyAction:{ type:'settle' },
        documentContext:{ relevance:'context_supported' }
    });
    assert(api.findTraditionalSemanticLeaks(intent).length === 0, 'traditional selector leaked into intent');
});

console.log(`\nLitigation dispute pretraining regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
