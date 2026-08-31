import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relative = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.json';
const fullPath = path.join(root, relative);
const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
if (data.status !== 'presealed_independent_eval' || data.sealed !== false) throw new Error('pre-seal patch may only touch presealed data');
const replacements = {
  'V013-I2-001':'代理商这张采购订单本周能不能谈成',
  'V013-I2-012':'最近缺一笔周转钱能不能拿到',
  'V013-I2-019':'这笔贷款年底前能不能还清',
  'V013-I2-162':'对方后面大概会持什么态度',
  'V013-I2-177':'这份薪酬明细里的个人所得税扣款有没有算错'
};
for (const row of data.rows || []) {
  if (Object.hasOwn(replacements, row.id)) row.text = replacements[row.id];
}
for (const id of Object.keys(replacements)) {
  const row = (data.rows || []).find((item) => item.id === id);
  if (!row || row.text !== replacements[id]) throw new Error(`failed to patch ${id}`);
}
data.presealPatches = Object.freeze([
  { version:'v0.3', purpose:'path-contract and exact-overlap correction before any seal or model evaluation', rowIds:Object.keys(replacements) }
]);
fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Applied Candidate v0.2 independent pre-seal patch: ${Object.keys(replacements).length} rows`);
