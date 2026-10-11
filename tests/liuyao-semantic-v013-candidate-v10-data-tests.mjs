import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFresh,validateSupplement,checkPair} from '../scripts/liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
const allocation={id:'synthetic',expectedRoute:null,subtype:'route_unresolved',roleSafetyGroup:'credit_direction',style:'literal_negative'},c={allocatedRawCalibration:[allocation],authoringPath:'synthetic-authoring'},row={...allocation,text:'合成测试输入仅用于检查成员锁定'};
test('full frozen labels and role metadata survive fresh authoring',()=>assert.equal(validateFresh(c,[row])[0].roleSafetyGroup,'credit_direction'));
test('membership deletion and allocation relabeling fail before generation',()=>{
  assert.throws(()=>validateFresh(c,[]),/membership/);assert.throws(()=>validateFresh(c,[{...row,expectedRoute:'borrow_money'}]),/allocation/);assert.throws(()=>validateFresh(c,[{...row,roleSafetyGroup:null}]),/allocation/);
});
test('model-only features or template metadata cannot enter raw schema',()=>assert.throws(()=>validateFresh(c,[{...row,probability:.9}]),/allocation/));
test('traditional semantic features cannot enter fresh calibration',()=>assert.throws(()=>validateFresh(c,[{...row,text:'这份输入想把用神作为模型的额外提示'}]),/forbidden/));
test('automated contamination comparison rejects exact and punctuation overlaps',()=>{
  assert.throws(()=>checkPair({id:'a',text:'相同的示例文字用于验证重复检测'},{id:'b',text:'相同的示例文字，用于验证重复检测！'},.82,'synthetic'),/Exact overlap/);
});
test('near copies reject without exposing compared text in error',()=>{
  let error;try{checkPair({id:'a',text:'独立合成句子用来验证高相似度的判定结果甲'},{id:'b',text:'独立合成句子用来验证高相似度的判定结果乙'},.82,'synthetic');}catch(e){error=e;}
  assert.match(error.message,/Near overlap/);assert.ok(!error.message.includes('独立合成'));
});

test('training supplementation locks distinct allocation and training-only split',()=>{
  const train={...c,allocatedTrainingSupplement:[allocation]};assert.equal(validateSupplement(train,[row])[0].split,'training');assert.throws(()=>validateSupplement(train,[{...row,expectedRoute:'lend_money'}]),/allocation/);
});
