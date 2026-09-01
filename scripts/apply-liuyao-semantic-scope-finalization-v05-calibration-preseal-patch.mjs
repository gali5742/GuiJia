import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.5-calibration.json');
const patchFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.5-calibration-preseal-patch.json');
const calibration = JSON.parse(fs.readFileSync(calibrationFile, 'utf8'));
if (calibration.status !== 'presealed_fresh_scope_calibration' || calibration.sealed !== false) throw new Error('Candidate v0.7 Scope calibration must be presealed before wording patch');

const changes = [
  {
    id:'SC5-091',
    from:'我手上这个小买卖以后还能不能继续做下去',
    to:'我手上这一摊以后还能不能继续撑下去',
    reason:'remove frozen business-support lexical anchor while preserving the intended business_operation pure-fallback semantic label'
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
  version:'0.13-scope-finalization-v0.5-calibration-preseal-patch-v0.1',
  status:'recorded_before_seal_and_before_scope_scoring',
  candidate:'v0.7',
  modelOrThresholdScoredBeforePatch:false,
  semanticRuntimeModified:false,
  questionModeModified:false,
  verifierWeakened:false,
  changeReasonClass:'fixture_wording_restored_to_declared_frozen_semantic_path',
  changes
};
fs.writeFileSync(patchFile, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');
console.log(`Applied ${changes.length} Candidate v0.7 Scope pre-seal wording patch(es).`);
