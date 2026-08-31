#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const context = { console, Date, Math, JSON, Intl, Set };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js/liuyao-lost-property-pretraining-v01.js'), 'utf8'),
    context,
    { filename:'js/liuyao-lost-property-pretraining-v01.js' }
);

const api = context.GuiJia.liuyaoLostPropertyPretrainingV01;
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function test(name, fn) {
    try {
        fn();
        passed += 1;
        console.log(`✓ ${name}`);
    } catch (error) {
        failed += 1;
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
    }
}

function intent(overrides = {}) {
    const base = {
        version:'lost-property-design-v0.1',
        status:'resolved',
        event:{ type:'lost_property' },
        lossState:'confirmed_lost',
        goals:[{ type:'recovery' }],
        lostObject:{
            text:'现金',
            entityType:'cash',
            animacy:'inanimate',
            specificity:'specific',
            traditionalObjectClass:'generic_property'
        }
    };
    return {
        ...base,
        ...overrides,
        lostObject:overrides.lostObject ? { ...base.lostObject, ...overrides.lostObject } : base.lostObject
    };
}

function codes(result) {
    return result.evidence.map((item) => item.code);
}

test('LP1 module is explicitly isolated and unreachable', () => {
    assert(api.version === '0.1', `version=${api.version}`);
    assert(api.status === 'design_only_unreachable', `status=${api.status}`);
    assert(api.currentRuntimeReachable === false, 'module must not claim current runtime reachability');
});

test('LP2 confirmed generic property resolves to 妻财 only when traditional class is explicit', () => {
    const resolved = api.resolveLostObject(intent().lostObject);
    assert(resolved.status === 'resolved', `status=${resolved.status}`);
    assert(resolved.selector?.value === '妻财', `selector=${JSON.stringify(resolved.selector)}`);
});

test('LP3 document credential resolves to 父母', () => {
    const resolved = api.resolveLostObject(intent({ lostObject:{ entityType:'credential', traditionalObjectClass:'document_credential' } }).lostObject);
    assert(resolved.status === 'resolved' && resolved.selector?.value === '父母', JSON.stringify(resolved));
});

test('LP4 vehicle and clothing resolve to 父母', () => {
    for (const traditionalObjectClass of ['vehicle','clothing']) {
        const resolved = api.resolveLostObject(intent({ lostObject:{ entityType:traditionalObjectClass, traditionalObjectClass } }).lostObject);
        assert(resolved.status === 'resolved' && resolved.selector?.value === '父母', `${traditionalObjectClass}: ${JSON.stringify(resolved)}`);
    }
});

test('LP5 phone stays conflicted and must not fall back to 妻财', () => {
    const resolved = api.resolveLostObject(intent({ lostObject:{ text:'手机', entityType:'phone', traditionalObjectClass:'' } }).lostObject);
    assert(resolved.status === 'conflicted', `status=${resolved.status}`);
    assert(resolved.selector === null, `selector=${JSON.stringify(resolved.selector)}`);
});

test('LP6 unresolved modern objects never use generic fallback', () => {
    for (const entityType of ['key','ring','computer','bank_card','usb','disk','cloud_data','unknown']) {
        const resolved = api.resolveLostObject(intent({ lostObject:{ entityType, traditionalObjectClass:'' } }).lostObject);
        assert(resolved.status === 'unresolved', `${entityType}: status=${resolved.status}`);
        assert(resolved.selector === null, `${entityType}: selector=${JSON.stringify(resolved.selector)}`);
    }
});

test('LP7 animate object fails semantic sufficiency', () => {
    const result = api.checkSufficiency(intent({ lostObject:{ text:'猫', entityType:'pet', animacy:'animate', traditionalObjectClass:'' } }));
    assert(result.semanticStatus === 'insufficient', `semantic=${result.semanticStatus}`);
    assert(result.readyForTraditionalObservation === false, 'animate object must not be ready');
});

test('LP8 recovery + location are compatible goals within one event', () => {
    const result = api.validateIntentContract(intent({ goals:[{ type:'location' }, { type:'recovery' }] }));
    assert(result.status === 'sufficient', `status=${result.status}`);
    assert(result.compatibleGoals.length === 2, JSON.stringify(result.compatibleGoals));
});

test('LP9 semantic sufficiency may succeed while traditional phone mapping is conflicted', () => {
    const result = api.checkSufficiency(intent({
        goals:[{ type:'recovery' }, { type:'location' }],
        lostObject:{ text:'手机', entityType:'phone', traditionalObjectClass:'' }
    }));
    assert(result.semanticStatus === 'sufficient', `semantic=${result.semanticStatus}`);
    assert(result.traditionalObjectStatus === 'conflicted', `traditional=${result.traditionalObjectStatus}`);
    assert(result.readyForTraditionalObservation === false, 'conflicted traditional mapping must stop observation');
});

test('LP10 resolved object produces primary + 世 role + optional 官鬼 domain subjects', () => {
    const plan = api.buildDraftObservationPlan(intent());
    assert(plan.status === 'resolved', `status=${plan.status}`);
    assert(plan.currentRuntimeReachable === false, 'draft plan must remain unreachable');
    assert(plan.subjects.length === 3, `subjects=${plan.subjects.length}`);
    assert(plan.subjects[0].source === 'primary' && plan.subjects[0].selector.value === '妻财', JSON.stringify(plan.subjects[0]));
    assert(plan.subjects[1].source === 'role' && plan.subjects[1].selector.type === 'shi' && plan.subjects[1].required === true, JSON.stringify(plan.subjects[1]));
    assert(plan.subjects[2].source === 'domain' && plan.subjects[2].selector.value === '官鬼' && plan.subjects[2].required === false, JSON.stringify(plan.subjects[2]));
});

test('LP11 unresolved/conflicted object blocks draft observation plan', () => {
    const plan = api.buildDraftObservationPlan(intent({ lostObject:{ entityType:'phone', text:'手机', traditionalObjectClass:'' } }));
    assert(plan.status === 'unresolved', `status=${plan.status}`);
    assert(plan.subjects.length === 0, `subjects=${plan.subjects.length}`);
});

test('LP12 movement is displacement evidence, not an unrecoverable verdict', () => {
    const result = api.buildRecoveryEvidence({ moving:true, innerOuter:'outer' });
    const movement = result.evidence.find((item) => item.code === 'LP_REC_MOVEMENT');
    assert(Boolean(movement), 'missing movement evidence');
    assert(movement.polarity === 'neutral', `polarity=${movement.polarity}`);
    assert(result.finalRecoverability === null, `final=${result.finalRecoverability}`);
    assert(result.scoring === null, `scoring=${result.scoring}`);
});

test('LP13 tomb/fushen/joined stay hidden-contained evidence rather than failure flags', () => {
    const result = api.buildRecoveryEvidence({ inTomb:true, hiddenFushen:true, joined:true });
    const cs = codes(result);
    for (const code of ['LP_REC_IN_TOMB','LP_REC_HIDDEN_FUSHEN','LP_REC_JOINED']) assert(cs.includes(code), `missing ${code}`);
    assert(result.evidence.filter((item) => ['LP_REC_IN_TOMB','LP_REC_HIDDEN_FUSHEN','LP_REC_JOINED'].includes(item.code)).every((item) => item.polarity === 'neutral'), 'hidden states must be conditional/neutral evidence');
});

test('LP14 void state is strong negative recovery evidence', () => {
    const result = api.buildRecoveryEvidence({ voidState:'transformed_void' });
    const ev = result.evidence.find((item) => item.code === 'LP_REC_VOID_NEGATIVE');
    assert(ev?.polarity === 'strong_negative', JSON.stringify(ev));
});

test('LP15 positive relation to 世 is blocked by key void state', () => {
    const clear = api.buildRecoveryEvidence({ relationToShi:'combines', voidState:'none' });
    assert(codes(clear).includes('LP_REC_POSITIVE_TO_SHI'), 'non-void combine should be positive evidence');
    const voided = api.buildRecoveryEvidence({ relationToShi:'combines', voidState:'self_void' });
    assert(!codes(voided).includes('LP_REC_POSITIVE_TO_SHI'), 'voided combine must not emit positive relation evidence');
});

test('LP16 财化鬼 and 鬼化财 remain asymmetric transformation evidence', () => {
    const toGhost = api.buildRecoveryEvidence({ baseRelation:'妻财', transformsToRelation:'官鬼' });
    assert(toGhost.evidence.find((item) => item.code === 'LP_REC_WEALTH_TO_GHOST')?.polarity === 'strong_negative', '财化鬼 missing/incorrect');
    const toWealth = api.buildRecoveryEvidence({ baseRelation:'官鬼', transformsToRelation:'妻财' });
    assert(toWealth.evidence.find((item) => item.code === 'LP_REC_GHOST_TO_WEALTH')?.polarity === 'positive', '鬼化财 missing/incorrect');
});

test('LP17 location output is multi-channel symbolic evidence with no exact coordinates or distance', () => {
    const result = api.buildLocationEvidence({
        innerOuter:'inner',
        linePosition:2,
        element:'木',
        branchDirection:'east',
        trigramEnvironment:'震',
        inTomb:true,
        joined:true,
        hiddenFushen:true
    });
    assert(result.evidence.length >= 7, `evidence=${result.evidence.length}`);
    assert(result.exactCoordinates === null, `coordinates=${result.exactCoordinates}`);
    assert(result.exactDistance === null, `distance=${result.exactDistance}`);
});

test('LP18 semantic contract contains no traditional LiuYao selection fields', () => {
    const semanticIntent = intent({ lostObject:{ text:'手机', entityType:'phone', traditionalObjectClass:undefined } });
    delete semanticIntent.lostObject.traditionalObjectClass;
    const serialized = JSON.stringify(semanticIntent);
    for (const forbidden of ['妻财','官鬼','父母','兄弟','子孙','useGod','sixRelative']) {
        assert(!serialized.includes(forbidden), `semantic contract must not contain ${forbidden}`);
    }
});

console.log(`\nLost-property isolated pretraining regression: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
