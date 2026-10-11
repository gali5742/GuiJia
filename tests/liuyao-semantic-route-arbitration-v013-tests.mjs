import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {read} from '../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const p of ['route-evidence-v01','route-evidence-v02','route-evidence-v03','route-arbitration-v011','route-arbitration-v012','route-arbitration-v013'])vm.runInContext(read(`js/liuyao-semantic-${p}.js`).toString(),ctx);
const api=ctx.GuiJia.liuyaoSemanticRouteArbitrationV013;
test('information questions cannot select despite legacy structural signals',()=>{
  for(const q of ['我申请经营贷需要哪些办理材料？','夫妻的共同财产权益如何解释？','基金价格的计算公式是什么？','合伙登记材料有哪些要求？','库存入库会计应该怎样记账？','薪水发放的流程怎么规定？'])assert.equal(api.arbitrate(q),null,q);
});
test('route-directed outcomes retain legitimate structural selection',()=>{
  const pairs=[['我向朋友借钱能不能顺利拿到？','borrow_money'],['同事向我借钱，我该不该借给他？','lend_money'],['我欠的信用卡债务能否还清？','debt_repayment'],['客户欠我的货款能不能收回？','debt_collection'],['我与妻子的感情能否恢复和睦？','marital_relationship'],['我们能否顺利领证结婚？','marriage_match'],['向暧昧对象表白能否正式在一起？','relationship_development'],['和搭档合伙开店会不会顺利赚钱？','partnership'],['基金会不会有收益？','investment_profit'],['基金赎回能不能顺利到账？','investment_liquidation'],['这只股票适不适合我投资？','investment_suitability'],['这只股票未来会不会涨？','investment_price_trend'],['持有的基金要不要减仓？','investment_position_decision'],['店铺补货能不能顺利入库？','inventory_purchase'],['库存能否全部卖完？','inventory_sale'],['本月工资能否增加？','income_salary'],['绩效奖金会不会发下来？','income_bonus'],['这笔交易能不能谈成？','commercial_transaction'],['快递包裹能不能收到？','receive_item'],['这台电脑值不值得买下？','item_purchase'],['门店经营会不会扭亏？','business_operation'],['我的整体财运会不会改善？','financial_fortune']];
  for(const [q,route]of pairs)assert.equal(api.arbitrate(q)?.routeId,route,q);
});
test('mere topics and background relations do not directly select',()=>{
  for(const q of ['说说夫妻共同财产这个话题','我在整理基金价格资料','讲讲合伙人的职责','讨论薪水这个概念','电脑产品介绍','有人提起欠款，我想再聊聊'])assert.equal(api.arbitrate(q),null,q);
});
test('direction uncertainty and conflicting structural directions remain unresolved',()=>{
  assert.equal(api.arbitrate('借入还是借出更好，我还没弄清角色？'),null);
  assert.equal(api.arbitrate('我向朋友借钱又借给同事，能不能顺利？'),null);
});
test('supported investment outcome with fee background is retained',()=>assert.equal(api.arbitrate('基金扣完手续费能不能盈利？')?.routeId,'investment_profit'));
test('current collection target may supersede historical outward lending',()=>assert.equal(api.arbitrate('我借给朋友的钱现在能不能收回？')?.routeId,'debt_collection'));
test('authorization preserves legacy route and strength; supplied unsupported evidence rejects',()=>{
  const q='门店经营会不会盈利？',e=ctx.GuiJia.liuyaoSemanticRouteEvidenceV03.extract(q),base=ctx.GuiJia.liuyaoSemanticRouteArbitrationV012.arbitrate(q,e),selected=api.arbitrate(q,e);
  assert.equal(selected.routeId,base.routeId);assert.equal(selected.strength,base.strength);assert.ok(Object.isFrozen(selected));
  assert.equal(api.arbitrate(q,{...e,unsupportedTargets:['explicit_unsupported']}),null);
});
