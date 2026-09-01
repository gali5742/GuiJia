import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.3-calibration.json');
const patchFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.3-calibration-preseal-patch.json');
const calibration = JSON.parse(fs.readFileSync(calibrationFile, 'utf8'));
if (calibration.status !== 'presealed_fresh_scope_calibration' || calibration.sealed !== false) throw new Error('v0.5 Scope calibration must be presealed before wording patch');

const changes = [
  {
    id:'SC3-004',
    from:'仓库下一轮补货月底前能不能到齐',
    to:'仓库下一轮这批货月底前能不能全部入库',
    reason:'preserve declared strong inventory_purchase path using frozen inventory-acquisition plus inventory-object evidence; no model or threshold scoring has occurred'
  }
];
for (const change of changes) {
  const row = calibration.rows.find((item) => item.id === change.id);
  if (!row) throw new Error(`missing calibration row ${change.id}`);
  if (row.text !== change.from) throw new Error(`preseal patch source drift for ${change.id}: ${row.text}`);
  row.text = change.to;
}
fs.writeFileSync(calibrationFile, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
const patch = {
  version:'0.13-scope-finalization-v0.3-calibration-preseal-patch-v0.1',
  status:'recorded_before_seal_and_before_scope_scoring',
  candidate:'v0.5',
  modelOrThresholdScoredBeforePatch:false,
  semanticRuntimeModified:false,
  verifierWeakened:false,
  changes
};
fs.writeFileSync(patchFile, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
console.log(`Applied ${changes.length} Candidate v0.5 Scope pre-seal wording patch(es).`);
