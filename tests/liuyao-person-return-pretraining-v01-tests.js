'use strict';
const assert = require('assert');
require('../js/liuyao-person-return-pretraining-v01.js');
const m = globalThis.GuiJia.liuyaoPersonReturnPretrainingV01;
let passed = 0;
const test = (name, fn) => { try { fn(); passed += 1; } catch (e) { console.error('FAIL:', name); throw e; } };

const base = (duty, relation='parent') => ({
  event:{ type:'person_return' },
  goals:[{ type:duty === 'person_return_timing' ? 'timing' : duty === 'person_return_progress' ? 'state' : 'outcome' }],
  semantics:{
    personReturnDuty:duty,
    currentTargetAspect:{person_return_outcome:'return_outcome',person_return_progress:'return_progress',person_return_timing:'return_timing'}[duty],
    knownAwayContext:true,
    missingOrDisappearance:false,
    healthOrSafetyTarget:false,
    communicationTarget:false
  },
  personSubject:{ relationToQuerent:relation, specificity:'specific' },
  expectedState:{person_return_outcome:'person_returns',person_return_progress:'return_in_progress',person_return_timing:'return_time_resolved'}[duty]
});

test('design-only unreachable', () => { assert.equal(m.status,'design_only_unreachable'); assert.equal(m.currentRuntimeReachable,false); });
test('parent resolves father/mother', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'parent'}).selector.value,'父母'));
test('child resolves children', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'child'}).selector.value,'子孙'));
test('wife resolves wealth', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'wife'}).selector.value,'妻财'));
test('husband resolves ghost', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'husband'}).selector.value,'官鬼'));
test('friend resolves sibling', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'friend'}).selector.value,'兄弟'));
test('other non kin resolves ying', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'other_non_kin'}).selector.type,'ying'));
test('unknown relation abstains', () => assert.equal(m.resolvePersonSubject({relationToQuerent:'unknown'}).status,'unresolved'));
test('self return cross-routes to travel', () => assert.equal(m.validateIntentContract(base('person_return_outcome','self')).status,'cross_route'));
test('missing person blocked', () => { const x=base('person_return_outcome'); x.semantics.missingOrDisappearance=true; assert.equal(m.validateIntentContract(x).status,'blocked'); });
test('health safety target cross-routes', () => { const x=base('person_return_outcome'); x.semantics.healthOrSafetyTarget=true; assert.equal(m.validateIntentContract(x).status,'cross_route'); });
test('news/contact deferred', () => { const x=base('person_return_outcome'); x.semantics.communicationTarget=true; assert.equal(m.validateIntentContract(x).status,'deferred'); });
test('known away context required', () => { const x=base('person_return_outcome'); x.semantics.knownAwayContext=false; assert.equal(m.validateIntentContract(x).status,'insufficient'); });
test('outcome plan primary returning person', () => { const p=m.buildDraftObservationPlan(base('person_return_outcome')); assert.equal(p.status,'resolved_design'); assert.equal(p.subjects[0].semanticDuty,'returning_person'); assert.equal(p.subjects[0].required,true); });
test('home-side shi is optional context', () => { const p=m.buildDraftObservationPlan(base('person_return_outcome')); assert.equal(p.subjects[1].selector.type,'shi'); assert.equal(p.subjects[1].required,false); });
test('progress uses same person primary', () => { const p=m.buildDraftObservationPlan(base('person_return_progress','child')); assert.equal(p.subjects[0].selector.value,'子孙'); });
test('timing uses same person primary', () => { const p=m.buildDraftObservationPlan(base('person_return_timing','friend')); assert.equal(p.subjects[0].selector.value,'兄弟'); });
test('timing cannot silently add outcome goal', () => { const x=base('person_return_timing'); x.goals.push({type:'outcome'}); assert.equal(m.validateIntentContract(x).status,'insufficient'); });
test('outcome cannot silently add timing goal', () => { const x=base('person_return_outcome'); x.goals.push({type:'timing'}); assert.equal(m.validateIntentContract(x).status,'insufficient'); });
test('outcome evidence has no boolean', () => { const e=m.buildReturnOutcomeEvidence(base('person_return_outcome'),{movementDirection:'toward_home'}); assert.equal(e.finalAssessment,null); assert.equal(e.scoring,null); assert.ok(e.evidence.some(x=>x.type==='movement_direction')); });
test('progress evidence has no GPS/current state finalization', () => { const e=m.buildReturnProgressEvidence(base('person_return_progress'),{routePosition:'road'}); assert.equal(e.progressState,null); assert.ok(e.evidence.some(x=>x.value==='in_transit')); });
test('timing produces triggers only', () => { const e=m.buildReturnTimingTriggers(base('person_return_timing'),{void:true,inTomb:true}); assert.equal(e.exactDate,null); assert.equal(e.exactDateCalculationPerformed,false); assert.deepEqual(e.triggers.map(x=>x.type),['await_void_resolution','await_tomb_release']); });
test('timing does not run on outcome duty', () => assert.equal(m.buildReturnTimingTriggers(base('person_return_outcome'),{void:true}).status,'not_applicable'));
test('outcome does not run on timing duty', () => assert.equal(m.buildReturnOutcomeEvidence(base('person_return_timing'),{personMoving:true}).status,'not_applicable'));
test('semantic contract has no traditional leak', () => assert.deepEqual(m.findTraditionalSemanticLeaks(base('person_return_outcome')),[]));

console.log(`Person return pretraining regression: ${passed} passed, 0 failed`);
