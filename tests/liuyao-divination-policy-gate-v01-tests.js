const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { console };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'js/liuyao-divination-policy-gate-v01.js'), 'utf8'),
  context,
  { filename:'js/liuyao-divination-policy-gate-v01.js' }
);

const gate = context.GuiJia?.liuyaoDivinationPolicyGateV01;
if (!gate) throw new Error('failed to load LiuYao Divination Policy Gate v0.1');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const blocked = [
  '我最近身体怎么样？',
  '这个病能不能好？',
  '病情会不会恶化或复发？',
  '这次手术能不能顺利？',
  '药物治疗有没有效果？',
  '头疼会不会是某种病？',
  '这次医学检查结果会不会有问题？',
  '化验结果会不会异常？'
];
for (const text of blocked) {
  const result = gate.evaluate(text);
  assert(result.allowed === false, `health/disease divination must be blocked: ${text}`);
  assert(result.status === 'disallowed', `blocked status mismatch: ${text}`);
  assert(result.reasonCode === 'disallowed_health_or_disease_divination', `blocked reason mismatch: ${text}`);
}

const allowed = [
  '',
  '去医院面试能不能通过？',
  '健康保险理赔款什么时候到账？',
  '我因为生病申请的保险理赔什么时候能到账？',
  '医院这份工作适不适合我？',
  '这台医疗设备值不值得买？',
  '药品公司股票接下来会不会涨？',
  '这个体检套餐值不值得买？',
  '医生会不会录用我？',
  '手术排期什么时候能确定？',
  '体检报告什么时候能拿到？'
];
for (const text of allowed) {
  const result = gate.evaluate(text);
  assert(result.allowed === true, `non-health target must remain allowed: ${text}`);
  assert(result.status === 'allowed', `allowed status mismatch: ${text}`);
}

const traditionalKeys = ['route','target','useGod','shi','ying','sixRelation','wifeWealth','officialGhost'];
for (const text of [...blocked, ...allowed]) {
  const result = gate.evaluate(text);
  for (const key of traditionalKeys) assert(!Object.prototype.hasOwnProperty.call(result, key), `policy output must not expose traditional/routing field: ${key}`);
}

console.log('LiuYao Divination Policy Gate v0.1 tests passed.');
console.log(`- blocked health/disease targets: ${blocked.length}`);
console.log(`- allowed near-domain/non-health targets: ${allowed.length}`);
