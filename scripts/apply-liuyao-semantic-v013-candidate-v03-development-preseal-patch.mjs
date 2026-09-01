import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v03-development.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (data.version !== '0.13-candidate-v0.3-development-v0.1' || data.status !== 'generated_preseal' || data.sealed !== false) {
  throw new Error('Candidate v0.3 development preseal patch may run only on generated_preseal data');
}

const replacements = new Map(Object.entries({
  'V013-V03-D-004':'门店这轮进货月底前能不能全部到齐',
  'V013-V03-D-005':'仓库里的积压货到月底能不能全部卖掉',
  'V013-V03-D-015':'公司那笔应收账款本周能不能收回',
  'V013-V03-D-016':'我现在这笔消费贷今年能不能按计划还清',
  'V013-V03-D-020':'和这个搭档一起经营工作室以后会不会顺',
  'V013-V03-D-022':'这个投资项目三个月后会不会有利润',
  'V013-V03-D-038':'这款投影仪现在买合不合适',
  'V013-V03-D-050':'目前钱财方面的起伏让我比较在意，想问一下这一块',
  'V013-V03-D-051':'店里最近经营状况忽高忽低，我想占一下经营本身',
  'V013-V03-D-055':'餐馆这段时间经营状况起伏明显，想看看经营本身',
  'V013-V03-D-057':'客户这单订单最近谈了好几轮，我想占一下这桩交易',
  'V013-V03-D-059':'这笔采购合同最近反复磋商，我想单独占一下这单生意',
  'V013-V03-D-061':'客户这单交易最近变化很多，我想占这一件事',
  'V013-V03-D-062':'这笔商业交易来回谈了几次，我想看看这一块',
  'V013-V03-D-066':'我投的这只基金最近收益反复，想占一下收益本身',
  'V013-V03-D-067':'当前这笔投资的收益起伏让我在意，想看看这一项',
  'V013-V03-D-068':'这笔投资已经准备清仓，我想占一下这一步',
  'V013-V03-D-069':'股票仓位准备清仓，我想看看清掉持仓这件事',
  'V013-V03-D-071':'这笔投资已经准备清仓退出，我想占一下这个动作',
  'V013-V03-D-075':'这份ETF准备调整仓位，我还没拿定主意，想问一下这件事',
  'V013-V03-D-076':'目前这只股票正在考虑调整仓位，想单独占这一项',
  'V013-V03-D-077':'我在考虑调整这笔基金的持仓，想看看仓位这件事',
  'V013-V03-D-082':'这份投资标的最近价格波动明显，我想看看行情这一块',
  'V013-V03-D-083':'最近固定工资这一块让我比较在意，我想单独占一下薪资',
  'V013-V03-D-087':'公司这阵子在谈年终奖安排，我想看看自己的奖金这一项'
}));

const seen = new Set();
for (const row of data.rows || []) {
  if (!replacements.has(row.id)) continue;
  if (row.expectedDisposition !== 'route_known') throw new Error(`Preseal patch unexpectedly targets non-route row ${row.id}`);
  row.text = replacements.get(row.id);
  seen.add(row.id);
}
const missing = [...replacements.keys()].filter((id) => !seen.has(id));
if (missing.length) throw new Error(`Preseal patch target IDs missing: ${missing.join(', ')}`);

data.presealPatch = {
  version:'0.1',
  reason:'align freshly authored development wording with already-frozen Candidate v0.3 Evidence/Arbitration path contracts before sealing',
  rowsPatched:seen.size,
  verifierWeakened:false,
  modelOrThresholdChanged:false
};
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Applied Candidate v0.3 development preseal wording patch to ${seen.size} rows.`);
