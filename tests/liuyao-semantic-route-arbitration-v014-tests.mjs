import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {read} from '../scripts/liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const p of ['route-evidence-v01','route-evidence-v02','route-evidence-v03','route-arbitration-v011','route-arbitration-v012','route-arbitration-v013','route-arbitration-v014'])vm.runInContext(read(`js/liuyao-semantic-${p}.js`).toString(),ctx);
const api=ctx.GuiJia.liuyaoSemanticRouteArbitrationV014;
test('all22 legitimate outcome fixtures retain authorization after scope restrictions',()=>{
  const pairs=[['我向朋友借钱能不能顺利拿到？','borrow_money'],['同事向我借钱，我该不该借给他？','lend_money'],['我欠的信用卡债务能否还清？','debt_repayment'],['客户欠我的货款能不能收回？','debt_collection'],['我与妻子的感情能否恢复和睦？','marital_relationship'],['我们能否顺利领证结婚？','marriage_match'],['向暧昧对象表白能否正式在一起？','relationship_development'],['和搭档合伙开店会不会顺利赚钱？','partnership'],['基金会不会有收益？','investment_profit'],['基金赎回能不能顺利到账？','investment_liquidation'],['这只股票适不适合我投资？','investment_suitability'],['这只股票未来会不会涨？','investment_price_trend'],['持有的基金要不要减仓？','investment_position_decision'],['店铺补货能不能顺利入库？','inventory_purchase'],['库存能否全部卖完？','inventory_sale'],['本月工资能否增加？','income_salary'],['绩效奖金会不会发下来？','income_bonus'],['这笔交易能不能谈成？','commercial_transaction'],['快递包裹能不能收到？','receive_item'],['这台电脑值不值得买下？','item_purchase'],['门店经营会不会扭亏？','business_operation'],['我的整体财运会不会改善？','financial_fortune']];
  for(const [q,r]of pairs)assert.equal(api.arbitrate(q)?.routeId,r,q);
});
test('explicitly unknown debt role rejects a superficially positive repayment goal',()=>{
  for(const q of ['信用卡欠款能否结清，尚未指定欠款人的身份？','贷款能否还完，不知道究竟谁来付款？','债务是否能偿还，债务人还没有说明？'])assert.equal(api.arbitrate(q),null,q);
});
test('generic repayment without a current self role cannot select',()=>assert.equal(api.arbitrate('贷款能否顺利结清？'),null));
test('confirmed current money roles retain selection',()=>{
  const pairs=[['我向家人借款能不能成功？','borrow_money'],['邻居向我借款，我该不该借给他？','lend_money'],['我名下贷款是否能还清？','debt_repayment'],['客户欠我的应收款能不能追回？','debt_collection']];
  for(const [q,r]of pairs)assert.equal(api.arbitrate(q)?.routeId,r,q);
});
test('purchase and receipt outcomes together require a primary current target',()=>assert.equal(api.arbitrate('电脑值不值得买下，以及包裹能否收到？'),null));
test('salary and bonus outcomes together remain unresolved',()=>assert.equal(api.arbitrate('工资能否增加，奖金会不会到账？'),null));
test('primary focus cannot be replaced by a background candidate',()=>assert.equal(api.arbitrate('我与丈夫在讨论薪水，只问工资能不能涨？')?.routeId,undefined));
test('a negated current target is never a positive authorization',()=>assert.equal(api.arbitrate('不问基金会不会盈利？'),null));
test('unrelated negated target with explicit focus retains the positive goal',()=>assert.equal(api.arbitrate('不问薪水变化，只问股票会不会有收益？')?.routeId,'investment_profit'));
test('background fees do not create another route target',()=>assert.equal(api.arbitrate('基金扣完手续费会不会盈利？')?.routeId,'investment_profit'));
test('explicit collection can supersede historical outward lending',()=>assert.equal(api.arbitrate('我借给邻居的钱能不能追回？')?.routeId,'debt_collection'));
test('selected route and strength remain a restriction of frozen v0.13',()=>{
  const q='我们能否领证结婚？',prior=ctx.GuiJia.liuyaoSemanticRouteArbitrationV013.arbitrate(q),selected=api.arbitrate(q);assert.equal(selected.routeId,prior.routeId);assert.equal(selected.strength,prior.strength);assert.ok(Object.isFrozen(selected));
});
