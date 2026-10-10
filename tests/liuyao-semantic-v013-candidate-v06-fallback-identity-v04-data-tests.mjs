import test from 'node:test';
import strict from 'node:assert/strict';
import {contract,generate,audit,normalize,verify} from '../scripts/liuyao-semantic-v013-candidate-v06-fallback-identity-v04-data-lib.mjs';
const c=contract(),g=generate(c),copy=()=>structuredClone(g);
test('historical train-only assembly plus fresh all22 coverage has frozen counts',()=>{
  const a=audit(c,g);
  strict.equal(a.counts.training.rows,1456);strict.equal(a.counts.training.known,1113);
  strict.equal(a.counts.calibration.known,88);strict.equal(a.counts.calibration.nonRoute,66);
});
test('exact duplicates cannot be hidden by relabeling',()=>{
  const d=copy();d.augmentation.rows[1].text=d.augmentation.rows[0].text;
  strict.throws(()=>audit(c,d),/Duplicate\/conflict/);
});
test('normalization detects punctuation and compatibility character variants',()=>strict.equal(normalize(' Ａ钱， 借来！ '),normalize('a钱借来')));
test('calibration membership may not be reduced',()=>{const d=copy();d.calibration.rows.pop();strict.throws(()=>audit(c,d),/counts drift/);});
test('unknown route label rejected before scoring',()=>{const d=copy();d.calibration.rows[0].expectedRoute='new_route';strict.throws(()=>audit(c,d),/Invalid row/);});
test('current22 route coverage is mandatory',()=>{const d=copy();d.calibration.rows[0].expectedRoute=d.calibration.rows[4].expectedRoute;strict.throws(()=>audit(c,d),/coverage drift/);});
test('fresh wording may not contain traditional model features',()=>{const d=copy();d.calibration.rows[0].text+='用神世爻';strict.throws(()=>audit(c,d),/Traditional features/);});
test('no-read source names rejected before attempting open',()=>{const altered=structuredClone(c);altered.contaminationPolicy.auditOnlySources.unshift({path:'data/sealed-blind.json'});strict.throws(()=>audit(altered,g),/Forbidden audit source/);});
test('whole generated state verifies without encoder',()=>strict.equal(verify().a.phaseBEncoderScoringOccurred,false));
