import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = {
  training:'data/liuyao-semantic-fallback-identity-v0.1-training.json',
  calibration:'data/liuyao-semantic-fallback-identity-v0.1-calibration.json'
};
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const write = (relative, data) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const training = read(files.training);
const calibration = read(files.calibration);
if (training.status !== 'presealed_training_data' || training.sealed !== false) {
  throw new Error('Fallback Identity pre-seal patch may only touch presealed training data');
}
if (calibration.status !== 'presealed_calibration_data' || calibration.sealed !== false) {
  throw new Error('Fallback Identity pre-seal patch may only touch presealed calibration data');
}

const patches = [
  {
    corpus:'calibration',
    expectedRoute:'partnership',
    from:'和他搭着把这个小店撑起来行不行',
    to:'我和他继续搭着做这门事以后合不合',
    purpose:'correct deterministic candidate-path contamination before seal or encoder scoring'
  },
  {
    corpus:'training',
    expectedRoute:null,
    from:'这次驾照考试能不能一次通过',
    to:'下次驾驶考试我有没有机会顺利合格',
    purpose:'remove exact overlap with prior LiuYao corpus before seal or encoder scoring'
  },
  {
    corpus:'calibration',
    expectedRoute:null,
    from:'我是不是应该继续坚持下去',
    to:'眼下这件事我还要不要再撑一阵',
    purpose:'remove exact overlap with prior LiuYao corpus before seal or encoder scoring'
  }
];

for (const patch of patches) {
  const data = patch.corpus === 'training' ? training : calibration;
  const row = (data.rows || []).find((item) => item.text === patch.from && item.expectedRoute === patch.expectedRoute);
  if (!row) throw new Error(`Target pre-seal fixture not found: ${patch.corpus}/${patch.from}`);
  row.text = patch.to;
}
training.presealPatches = patches.filter((patch) => patch.corpus === 'training').map((patch) => ({ version:'v0.2', ...patch }));
calibration.presealPatches = patches.filter((patch) => patch.corpus === 'calibration').map((patch) => ({ version:'v0.2', ...patch }));
write(files.training, training);
write(files.calibration, calibration);
console.log(`Applied Fallback Identity v0.1 pre-seal corrections: ${patches.length} rows`);
