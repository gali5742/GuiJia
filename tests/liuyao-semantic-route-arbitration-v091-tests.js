const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { console };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'liuyao-semantic-route-arbitration-v091.js'), 'utf8'), context, { filename:'liuyao-semantic-route-arbitration-v091.js' });
const api = context.GuiJia?.liuyaoSemanticRouteArbitrationV091;
if (!api || api.version !== '0.9.1-dev') throw new Error('Semantic Route Arbitration v0.9.1 unavailable');

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

test('AR91-1 借入方向覆盖省略主语的“向家里借”', () => {
  expect('这次向家里借钱能不能拿到', 'borrow_money');
  expect('我想从朋友那里借一笔钱周转', 'borrow_money');
  expect('朋友来找我借钱，我准备借给他', 'lend_money');
});

test('AR91-2 应收账款明确属于债权回收，不落自身还债', () => {
  expect('我手里还有一笔应收账款没有结清', 'debt_collection');
  expect('客户还欠我的货款，这次能不能追回', 'debt_collection');
  expect('我的房贷年底前能不能还清', 'debt_repayment');
});

test('AR91-3 通用申请审批仍不得制造借款 route', () => {
  reject('护照申请什么时候能批下来');
  reject('学校的奖学金申请能不能批准');
  reject('研究计划申请这次能不能获批');
});

test('AR91-4 “成为夫妻”是婚配目标，不是既有婚姻', () => {
  expect('我和这个男生以后能不能成为夫妻', 'marriage_match');
  expect('我和对象今年能不能领证', 'marriage_match');
  expect('我和老婆最近关系不好，之后会不会缓和', 'marital_relationship');
});

test('AR91-5 普通朋友和父母关系不被强行改成恋爱或婚姻', () => {
  reject('我和普通朋友以后关系会不会更亲近');
  reject('我和父母最近的关系会不会缓和');
});

test('AR91-6 已投入资金并明确担心赚钱，仲裁为投资盈利', () => {
  expect('这个项目我已经投入资金，现在主要担心能不能赚钱', 'investment_profit');
  expect('我已经投了这只基金，想看最后有没有收益', 'investment_profit');
});

test('AR91-7 明确股票仓位全部清掉属于投资退出', () => {
  expect('我计划这周把股票仓位全部清掉', 'investment_liquidation');
  expect('这只基金全部赎回套现会不会顺利', 'investment_liquidation');
});

test('AR91-8 投资内部目标仍保持分离', () => {
  expect('这只ETF接下来价格会不会继续跌', 'investment_price_trend');
  expect('这笔基金仓位该继续持有还是卖掉', 'investment_position_decision');
  expect('我现在买这只黄金ETF合不合适', 'investment_suitability');
  expect('这笔债券投资年底能不能盈利', 'investment_profit');
});

test('AR91-9 泛化的“合适/继续/退出”没有领域时不制造投资 route', () => {
  reject('现在这么选是不是合适');
  reject('到底该继续还是退出');
});

test('AR91-10 工资、奖金、收货、购买维持既有分离', () => {
  expect('下一轮调薪我的基本工资能不能上涨', 'income_salary');
  expect('今年绩效奖金会不会增加', 'income_bonus');
  expect('我买的显示器已经发货，什么时候能送到', 'receive_item');
  expect('这台显示器现在值不值得买', 'item_purchase');
});

test('AR91-11 商业事件各 route 保持分离，租约/赔偿仍拒绝', () => {
  expect('这笔批发生意月底前能不能成交', 'commercial_transaction');
  expect('门店下周补货能不能顺利', 'inventory_purchase');
  expect('仓库尾货月底前能不能出清', 'inventory_sale');
  expect('我和合伙人共同经营这个店能不能赚钱', 'partnership');
  expect('我经营的工作室年底能不能盈利', 'business_operation');
  reject('这套房子的租约能不能顺利续签');
  reject('赔偿争议最后能不能谈妥');
});

test('AR91-12 仲裁结果只含现代 route/evidence', () => {
  const probes = [
    '我和这个男生以后能不能成为夫妻',
    '这次向家里借钱能不能拿到',
    '我计划这周把股票仓位全部清掉'
  ];
  for (const probe of probes) {
    const text = JSON.stringify(api.arbitrate(probe));
    if (/(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/.test(text)) throw new Error(`traditional LiuYao semantics leaked: ${probe}`);
  }
});

console.log(`\nSemantic route arbitration v0.9.1 regression: ${passed} passed, 0 failed`);
