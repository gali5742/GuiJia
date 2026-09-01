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
    fs.readFileSync(path.join(ROOT, 'js/liuyao-travel-pretraining-v01.js'), 'utf8'),
    context,
    { filename:'js/liuyao-travel-pretraining-v01.js' }
);

const api = context.GuiJia.liuyaoTravelPretrainingV01;
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
    event:{ type:'travel' },
    goals:[{ type:'outcome' }],
    travelerSubject:{ relationToQuerent:'self', specificity:'specific' },
    journeyTarget:{ specificity:'context_bounded', temporalScope:'specific_trip' },
    destinationContext:{ specificity:'none', relevance:'not_indicated' },
    transportContext:{ mode:'unknown', specificity:'none', relevance:'not_indicated' },
    semantics:{
        travelDuty:duty,
        currentTargetAspect:aspect,
        disruptionContext:{ type:'none' },
        tripPurposeContext:'travel_itself'
    },
    ...extra
});

test('TV1 design-only unreachable', () => {
    assert(api.status === 'design_only_unreachable', `status=${api.status}`);
    assert(api.currentRuntimeReachable === false, 'must remain unreachable');
});

test('TV2 self traveler resolves to shi', () => {
    const resolution = api.resolveTravelerSubject(base('travel_execution','traveler_journey'));
    assert(resolution.status === 'resolved' && resolution.selector.type === 'shi', 'self should resolve to shi');
});

test('TV3 parent traveler resolves to parents', () => {
    const intent = base('travel_safety','traveler_safety', { travelerSubject:{ relationToQuerent:'parent', specificity:'specific' } });
    assert(api.resolveTravelerSubject(intent).selector.value === '父母', 'parent mapping');
});

test('TV4 child traveler resolves to children', () => {
    const intent = base('travel_safety','traveler_safety', { travelerSubject:{ relationToQuerent:'child', specificity:'specific' } });
    assert(api.resolveTravelerSubject(intent).selector.value === '子孙', 'child mapping');
});

test('TV5 unknown traveler abstains', () => {
    const intent = base('travel_safety','traveler_safety', { travelerSubject:{ relationToQuerent:'other', specificity:'specific' } });
    assert(api.validateIntentContract(intent).status === 'insufficient', 'unknown traveler should stop');
});

test('TV6 execution primary is traveler', () => {
    const plan = api.buildDraftObservationPlan(base('travel_execution','traveler_journey'));
    assert(plan.status === 'resolved' && plan.subjects[0].selector.type === 'shi', 'traveler should be primary');
});

test('TV7 destination adds ying only when relevant', () => {
    const intent = base('travel_execution','traveler_journey', { destinationContext:{ text:'大阪', specificity:'specific', relevance:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects.some((subject) => subject.selector.type === 'ying'), 'destination ying missing');
});

test('TV8 no destination does not force ying', () => {
    const plan = api.buildDraftObservationPlan(base('travel_execution','traveler_journey'));
    assert(!plan.subjects.some((subject) => subject.selector.type === 'ying'), 'ying must not be forced');
});

test('TV9 explicit transport adds parent domain', () => {
    const intent = base('travel_execution','traveler_journey', { transportContext:{ mode:'flight', specificity:'specific_service', relevance:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects.some((subject) => subject.source === 'domain' && subject.selector.value === '父母'), 'transport domain missing');
    assert(plan.subjects[0].selector.type === 'shi', 'transport must not steal primary');
});

test('TV10 flight keyword alone does not make parent primary', () => {
    const intent = base('travel_execution','traveler_journey', { transportContext:{ mode:'flight', specificity:'specific_service', relevance:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects[0].selector.type === 'shi', 'flight mention stole primary');
});

test('TV11 safety primary remains traveler', () => {
    const plan = api.buildDraftObservationPlan(base('travel_safety','traveler_safety'));
    assert(plan.subjects[0].selector.type === 'shi', 'safety primary');
    assert(plan.subjects.some((subject) => subject.selector.value === '子孙'), 'safety support missing');
    assert(plan.subjects.some((subject) => subject.selector.value === '官鬼'), 'hazard observation missing');
});

test('TV12 journey disruption primary remains traveler', () => {
    const intent = base('travel_disruption_journey','traveler_journey', { transportContext:{ mode:'train', specificity:'specific_service', relevance:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects[0].selector.type === 'shi', 'journey disruption primary');
});

test('TV13 transport disruption primary is parents', () => {
    const intent = base('travel_disruption_transport','transport_operation', { transportContext:{ mode:'flight', specificity:'specific_service', relevance:'explicit' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.status === 'resolved' && plan.subjects[0].selector.value === '父母' && plan.subjects[0].source === 'primary', 'transport primary');
});

test('TV14 generic transport insufficient', () => {
    const intent = base('travel_disruption_transport','transport_operation', { transportContext:{ mode:'flight', specificity:'generic', relevance:'explicit' } });
    assert(api.validateIntentContract(intent).status === 'insufficient', 'generic transport must stop');
});

test('TV15 wrong target aspect blocked', () => {
    const intent = base('travel_execution','transport_operation');
    assert(api.validateIntentContract(intent).status === 'insufficient', 'aspect mismatch must stop');
});

test('TV16 weather target blocked', () => {
    const intent = base('travel_execution','destination_weather');
    const result = api.validateIntentContract(intent);
    assert(result.issues.some((item) => item.code === 'weather_target_outside_travel'), 'weather boundary');
});

test('TV17 purpose outcome blocked', () => {
    const intent = base('travel_execution','trip_purpose_outcome');
    const result = api.validateIntentContract(intent);
    assert(result.issues.some((item) => item.code === 'trip_purpose_target_outside_travel'), 'purpose boundary');
});

test('TV18 delivery target blocked', () => {
    const intent = base('travel_execution','delivery_item');
    const result = api.validateIntentContract(intent);
    assert(result.issues.some((item) => item.code === 'delivery_target_outside_travel'), 'delivery boundary');
});

test('TV19 return-of-other deferred', () => {
    const intent = base('travel_return_or_arrival_of_other','traveler_journey');
    const result = api.validateIntentContract(intent);
    assert(result.issues.some((item) => item.code === 'travel_duty_deferred'), 'return duty should defer');
});

test('TV20 evidence has no final boolean', () => {
    const evidence = api.buildTravelEvidence(base('travel_safety','traveler_safety'), { travelerVitality:'supported', hazardPressure:true });
    assert(evidence.evidence.length === 2 && evidence.finalAssessment === null, 'no final boolean');
});

test('TV21 traveler void is evidence only', () => {
    const evidence = api.buildTravelEvidence(base('travel_execution','traveler_journey'), { travelerVoid:true });
    assert(evidence.evidence[0].type === 'traveler_void' && evidence.finalAssessment === null, 'void should stay evidence');
});

test('TV22 weather causal can stay transport target', () => {
    const intent = base('travel_disruption_transport','transport_operation', {
        transportContext:{ mode:'flight', specificity:'specific_service', relevance:'explicit' },
        semantics:{
            travelDuty:'travel_disruption_transport',
            currentTargetAspect:'transport_operation',
            disruptionContext:{ type:'weather_causal' },
            tripPurposeContext:'travel_itself'
        }
    });
    assert(api.validateIntentContract(intent).status === 'sufficient', 'weather causal context should remain travel');
});

test('TV23 spouse mapping stays traveler role', () => {
    const intent = base('travel_safety','traveler_safety', { travelerSubject:{ relationToQuerent:'wife', specificity:'specific' } });
    const plan = api.buildDraftObservationPlan(intent);
    assert(plan.subjects[0].selector.value === '妻财' && plan.subjects[0].semanticDuty === 'traveler_safety_subject', 'wife traveler mapping');
});

test('TV24 semantic intent has no traditional leak', () => {
    const intent = base('travel_execution','traveler_journey', { destinationContext:{ text:'大阪', specificity:'specific', relevance:'explicit' } });
    assert(api.findTraditionalSemanticLeaks(intent).length === 0, 'traditional selector leaked into intent');
});

console.log(`\nTravel pretraining regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
