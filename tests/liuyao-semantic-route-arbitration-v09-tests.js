const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { console };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'liuyao-semantic-route-arbitration-v09.js'), 'utf8'), context, { filename:'liuyao-semantic-route-arbitration-v09.js' });
const api = context.GuiJia?.liuyaoSemanticRouteArbitrationV09;
if (!api || api.version !== '0.9-dev') throw new Error('Semantic Route Arbitration v0.9 unavailable');

let passed = 0;
const test = (name, fn) => {
  try { fn(); console.log(`✓ ${name}`); passed += 1; }
  catch (error) { console.error(`✗ ${name}`); throw error; }
};
const expect = (text, routeId) => {
  const result = api.arbitrate(text);
  if ((result?.routeId || null) !== routeId) throw new Error(`${text} => ${result?.routeId || 'null'}, expected ${routeId}`);
};
const reject = (text) => {
  const result = api.arbitrate(text);
  if (result) throw new Error(`${text} should not be arbitrated, got ${result.routeId}`);
};

test('AR1 借入/出借按资金方向分开', () => {
  expect('我想从朋友那里借一笔钱周转', 'borrow_money');
  expect('朋友来找我借钱，我准备借给他', 'lend_money');
});
test('AR2 债权回收/自身还债按债权方向分开', () => {
  expect('客户还欠我的货款，这次能不能追回', 'debt_collection');
  expect('我的房贷年底前能不能还清', 'debt_repayment');
});
test('AR3 普通“申请/审批”不得制造借款语义', () => {
  reject('我的休假申请能不能通过审批');
  reject('这个项目申请会不会获批');
});
test('AR4 关系三类按恋爱目标/婚配目标/既有婚姻分开', () => {
  expect('我和这个人以后能不能发展成恋人', 'relationship_development');
  expect('我和对象今年能不能领证', 'marriage_match');
  expect('我和老婆最近关系不好，之后会不会缓和', 'marital_relationship');
});
test('AR5 普通朋友关系不得被恋爱仲裁', () => reject('我和普通朋友以后会不会更熟'));
test('AR6 投资标的+适宜性压过普通购买', () => {
  expect('我现在买这只黄金ETF合不合适', 'investment_suitability');
  expect('这只基金值不值得投资', 'investment_suitability');
});
test('AR7 投资内部五类目标保持分离', () => {
  expect('这只基金全部赎回套现会不会顺利', 'investment_liquidation');
  expect('这只ETF接下来价格会不会继续跌', 'investment_price_trend');
  expect('这笔基金仓位该继续持有还是卖掉', 'investment_position_decision');
  expect('这笔债券投资年底能不能盈利', 'investment_profit');
});
test('AR8 普通泛化“合适”不得制造投资适宜性', () => reject('现在这样做合不合适'));
test('AR9 工资与奖金分开', () => {
  expect('下一轮调薪我的基本工资能不能上涨', 'income_salary');
  expect('今年绩效奖金会不会增加', 'income_bonus');
});
test('AR10 收货与普通购买分开', () => {
  expect('我买的显示器已经发货，什么时候能送到', 'receive_item');
  expect('这台显示器现在值不值得买', 'item_purchase');
});
test('AR11 商业交易/进货/库存销售/合伙/经营分开', () => {
  expect('这笔批发生意月底前能不能成交', 'commercial_transaction');
  expect('门店下周补货能不能顺利', 'inventory_purchase');
  expect('仓库尾货月底前能不能出清', 'inventory_sale');
  expect('我和合伙人共同经营这个店能不能赚钱', 'partnership');
  expect('我经营的工作室年底能不能盈利', 'business_operation');
});
test('AR12 租约/赔偿谈判不得伪装成商业交易', () => {
  reject('这套房子的租约能不能顺利续签');
  reject('赔偿争议最后能不能谈妥');
});
test('AR13 仲裁层只返回现代 route/evidence', () => {
  const result = api.arbitrate('我和对象明年能不能结婚');
  const text = JSON.stringify(result);
  if (/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/.test(text)) throw new Error('traditional LiuYao semantics leaked');
});

console.log(`\nSemantic route arbitration v0.9 regression: ${passed} passed, 0 failed`);
