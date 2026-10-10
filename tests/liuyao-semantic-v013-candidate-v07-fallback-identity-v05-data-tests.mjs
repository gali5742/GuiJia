import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contract,generate,fresh,audit,normalize} from '../scripts/liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
const {c}=contract();
const generated=generate(c);
test('fresh allocation and train-only assembly have all frozen counts and route coverage',()=>{
  assert.equal(generated.training.rows.length,1698);assert.equal(generated.augmentation.rows.length,242);assert.equal(generated.calibration.rows.length,308);
  for(const route of c.routes)for(const split of ['augmentation','calibration'])assert.equal(generated[split].rows.filter(r=>r.expectedRoute===route).length,8);
  assert.equal(generated.training.rows.filter(r=>r.expectedRoute).length,1289);
  assert.equal(new Set(generated.training.rows.map(r=>normalize(r.text))).size,1698);
});
test('frozen labels, split order and role metadata cannot change during generation',()=>{
  const changed=structuredClone(c);changed.authoringPlan.allocatedRawCalibration[0].expectedRoute=c.routes[1];
  assert.throws(()=>fresh(changed),/Frozen allocation drift/);
  const reordered=structuredClone(c);reordered.authoringPlan.allocatedTraining.reverse();
  assert.throws(()=>fresh(reordered),/Frozen allocation drift/);
});
test('raw hard negatives cannot be removed before an upstream audit',()=>{
  const d=structuredClone(generated);d.calibration.rows.pop();
  assert.throws(()=>audit(c,d),/Counts drift/);
});
test('duplicate wording and conflicting labels fail without exposing the question',()=>{
  const d=structuredClone(generated);d.training.rows[1].text=d.training.rows[0].text;d.training.rows[1].expectedRoute=c.routes[1];
  assert.throws(()=>audit(c,d),e=>/Duplicate\/label conflict/.test(e.message)&&!e.message.includes(d.training.rows[0].text));
});
test('all22 route and credit/debt group counts are mandatory',()=>{
  const d=structuredClone(generated);d.calibration.rows[0].expectedRoute=c.routes[1];
  assert.throws(()=>audit(c,d),/All22 coverage drift/);
  const role=structuredClone(generated);role.calibration.rows.find(r=>r.roleSafetyGroup==='debt_direction').roleSafetyGroup=null;
  assert.throws(()=>audit(c,role),/Role coverage drift/);
});
test('fresh traditional terminology is rejected before any history comparison',()=>{
  const d=structuredClone(generated);d.augmentation.rows[0].text+='用神';
  assert.throws(()=>audit(c,d),/Forbidden fresh semantic content/);
});
test('cross-split exact and near copies fail with IDs rather than historical wording',()=>{
  const d=structuredClone(generated);d.calibration.rows[0].text=d.training.rows[0].text;
  assert.throws(()=>audit(c,d),e=>/Cross-split exact overlap/.test(e.message)&&!e.message.includes(d.training.rows[0].text));
  const near=structuredClone(generated);near.calibration.rows[0].text=near.training.rows[0].text+'呀';
  assert.throws(()=>audit(c,near),/Cross-split near-copy/);
});
test('a protected audit-source name is rejected before any attempted file read',()=>{
  const changed=structuredClone(c);changed.contaminationPolicy.auditOnlySources=[{path:'data/nonexistent-independent-eval.json'}];
  assert.throws(()=>audit(changed,generated),/Forbidden audit source/);
});
