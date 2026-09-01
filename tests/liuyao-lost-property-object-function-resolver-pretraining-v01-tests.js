'use strict';
const assert = require('assert');
require('../js/liuyao-lost-property-object-function-resolver-pretraining-v01.js');
const m = globalThis.GuiJia.liuyaoLostPropertyObjectFunctionResolverPretrainingV01;
let passed = 0;
const test = (name, fn) => { try { fn(); passed++; } catch (e) { console.error('FAIL:', name); throw e; } };
const obj = (entityType, primaryFunction, extra={}) => ({
  entityType, primaryFunction, secondaryFunctions:[], animacy:'inanimate', specificity:'specific', physicality:'physical', valueRole:'ordinary_use', ...extra
});

test('design only unreachable',()=>{assert.equal(m.status,'design_only_unreachable');assert.equal(m.currentRuntimeReachable,false);});
test('generic property resolves wealth',()=>{const r=m.resolveTraditionalObject(obj('generic_property','general_possession'));assert.equal(r.status,'resolved');assert.equal(r.selector.value,'妻财');});
test('document credential resolves parent',()=>{const r=m.resolveTraditionalObject(obj('document_credential','document_or_credential'));assert.equal(r.selector.value,'父母');});
test('vehicle resolves parent',()=>{const r=m.resolveTraditionalObject(obj('vehicle','vehicle_or_transport'));assert.equal(r.selector.value,'父母');});
test('clothing resolves parent',()=>{const r=m.resolveTraditionalObject(obj('clothing','clothing_or_wearable'));assert.equal(r.selector.value,'父母');});
test('phone communication remains conflicted',()=>{const r=m.resolveTraditionalObject(obj('phone','communication_device'));assert.equal(r.status,'conflicted');assert.deepEqual(new Set(r.traditionalClassCandidates.map(x=>x.selector.value)),new Set(['父母','妻财']));});
test('phone general possession cannot override known conflict',()=>{const r=m.resolveTraditionalObject(obj('phone','general_possession'));assert.equal(r.status,'conflicted');});
test('key access token unresolved school specific',()=>{const r=m.resolveTraditionalObject(obj('key','access_or_control_token'));assert.equal(r.status,'unresolved');assert.equal(r.provenanceStatus,'school_specific');});
test('ring daily wearable school-specific parent candidate',()=>{const r=m.resolveTraditionalObject(obj('ring','clothing_or_wearable'));assert.equal(r.status,'unresolved');assert.equal(r.traditionalClassCandidates[0].selector.value,'父母');});
test('ring store of value school-specific wealth candidate',()=>{const r=m.resolveTraditionalObject(obj('ring','store_of_value',{valueRole:'store_of_value'}));assert.equal(r.status,'unresolved');assert.ok(r.traditionalClassCandidates.some(x=>x.selector.value==='妻财'));});
test('ring multi-function never auto-picks',()=>{const r=m.resolveTraditionalObject(obj('ring','clothing_or_wearable',{secondaryFunctions:['store_of_value'],valueRole:'store_of_value'}));assert.equal(r.status,'unresolved');assert.equal(r.selector,null);assert.equal(r.traditionalClassCandidates.length,2);});
test('bank card unresolved',()=>{const r=m.resolveTraditionalObject(obj('bank_card','payment_or_account_access'));assert.equal(r.status,'unresolved');assert.equal(r.provenanceStatus,'insufficient_evidence');});
test('computer work tool unresolved',()=>{const r=m.resolveTraditionalObject(obj('computer','work_tool',{secondaryFunctions:['information_carrier']}));assert.equal(r.status,'unresolved');});
test('usb info carrier unresolved',()=>{const r=m.resolveTraditionalObject(obj('usb','information_carrier'));assert.equal(r.status,'unresolved');});
test('disk info carrier unresolved',()=>{const r=m.resolveTraditionalObject(obj('disk','information_carrier'));assert.equal(r.status,'unresolved');});
test('cloud data unresolved',()=>{const r=m.resolveTraditionalObject(obj('cloud_data','information_carrier',{physicality:'digital'}));assert.equal(r.status,'unresolved');});
test('unknown entity cannot become generic property from function alone',()=>{const r=m.resolveTraditionalObject(obj('unknown','general_possession'));assert.equal(r.status,'unresolved');assert.equal(r.selector,null);});
test('unsupported modern entity with general possession does not fallback',()=>{const r=m.resolveTraditionalObject(obj('camera','general_possession'));assert.equal(r.status,'unresolved');assert.equal(r.selector,null);});
test('semantic sufficient traditional unresolved is legal partial state',()=>{const i={event:{type:'lost_property'},semantics:{lossState:'confirmed_lost'},lostObject:obj('computer','work_tool')};const c=m.buildCompatibilityWithLostProperty(i);assert.equal(c.semanticStatus,'sufficient');assert.equal(c.traditionalObjectStatus,'unresolved');assert.equal(c.legalPartialState,true);assert.equal(c.readyForTraditionalObservation,false);});
test('semantic sufficient traditional conflicted is legal partial state',()=>{const i={event:{type:'lost_property'},semantics:{lossState:'confirmed_lost'},lostObject:obj('phone','communication_device')};const c=m.buildCompatibilityWithLostProperty(i);assert.equal(c.traditionalObjectStatus,'conflicted');assert.equal(c.legalPartialState,true);});
test('stable mapping preserves provenance',()=>{const r=m.resolveTraditionalObject(obj('document_credential','document_or_credential'));assert.equal(r.provenanceStatus,'stable_consensus');assert.ok(r.evidenceRefs.length);});
test('function list de-duplicates',()=>{const x=obj('computer','work_tool',{secondaryFunctions:['work_tool','information_carrier']});assert.deepEqual(m.normalizeFunctions(x),['work_tool','information_carrier']);});
test('no final recovery/location assessment',()=>{const i={event:{type:'lost_property'},semantics:{lossState:'confirmed_lost'},lostObject:obj('generic_property','general_possession')};const c=m.buildCompatibilityWithLostProperty(i);assert.equal(c.finalRecoveryAssessment,null);assert.equal(c.finalLocationAssessment,null);});
test('semantic context has no traditional leak',()=>assert.deepEqual(m.findTraditionalSemanticLeaks(obj('phone','communication_device')),[]));
console.log(`Lost property object function resolver regression: ${passed} passed, 0 failed`);
