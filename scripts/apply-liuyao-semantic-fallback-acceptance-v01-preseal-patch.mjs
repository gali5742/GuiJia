import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relative = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json';
const file = path.join(root, relative);
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (data.status !== 'presealed_fresh_calibration' || data.sealed !== false) throw new Error('preseal wording patch may only run before calibration sealing');

const replacements = new Map([
  ['未来一年整体钱款周转能不能比现在从容些','未来一年我手头的余量能不能比现在多一些'],
  ['手里的股票继续拿一段时间最后有没有赚头','这个股票到年底最后有没有赚头'],
  ['这只基金现在参与进去对我合不合适','这只基金放在我现在的情况里是不是妥当'],
  ['这个股票现在进去是否适合我的情况','这只股票我眼下参与的话合不合宜'],
  ['这个基金接下来几个月会抬高还是回落','这个基金过几个月是往高处走还是低处走'],
  ['手里的股票后面一段是涨上去还是降下来','手里的股票后面一阵大概会朝哪边走'],
  ['我订的显示器后面几天能不能收到','我订的显示器大概还要几天到'],
  ['我跟这个人往后有没有可能真的变成恋人','我跟这个人往后会不会比现在更靠近一些'],
  ['这段关系最后有没有机会走到结婚那一步','这段关系以后有没有机会真正成为一家人'],
  ['我们两个人往后能不能把婚事办下来','我们两个人往后能不能正式过到一块'],
  ['我们结婚几年了，接下来两个人会不会更和顺','我和另一半共同生活几年了，接下来两个人会不会更和顺']
]);

let changed = 0;
for (const row of data.rows || []) {
  const replacement = replacements.get(row.text);
  if (!replacement) continue;
  row.text = replacement;
  changed += 1;
}
if (changed !== replacements.size) throw new Error(`preseal patch changed ${changed}/${replacements.size} rows`);
data.presealWordingPatch = {
  applied:true,
  reason:'Initial fresh fixture wording activated deterministic Evidence/Arbitration paths; wording was corrected before sealing or threshold use. Semantic modules and verifier were not changed.',
  replacementCount:changed,
  appliedBeforeFirstUse:true
};
fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Applied ${changed} preseal wording corrections to Fallback Acceptance calibration.`);
