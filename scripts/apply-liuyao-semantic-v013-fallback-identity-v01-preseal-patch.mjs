import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relative = 'data/liuyao-semantic-fallback-identity-v0.1-calibration.json';
const fullPath = path.join(root, relative);
const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
if (data.status !== 'presealed_calibration_data' || data.sealed !== false) {
  throw new Error('Fallback Identity pre-seal patch may only touch presealed calibration data');
}

const from = '和他搭着把这个小店撑起来行不行';
const to = '我和他继续搭着做这门事以后合不合';
const row = (data.rows || []).find((item) => item.text === from && item.expectedRoute === 'partnership');
if (!row) throw new Error('Target partnership calibration fixture not found');
row.text = to;
data.presealPatches = [
  ...(data.presealPatches || []),
  {
    version:'v0.1',
    purpose:'correct deterministic candidate-path contamination before seal or encoder scoring',
    expectedRoute:'partnership',
    from,
    to
  }
];
fs.writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('Applied Fallback Identity v0.1 pre-seal path correction: 1 calibration row');
