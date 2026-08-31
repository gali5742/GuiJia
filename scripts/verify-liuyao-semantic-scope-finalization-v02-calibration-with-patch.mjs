import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patch = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.2-calibration-preseal-patch.json');
const hidden = `${patch}.current-fixture-source`;
const hadPatch = fs.existsSync(patch);
if (hadPatch) fs.renameSync(patch, hidden);
try {
  const result = spawnSync(process.execPath, ['scripts/verify-liuyao-semantic-scope-finalization-v02-calibration.mjs'], {
    cwd:root,
    stdio:'inherit'
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
} finally {
  if (hadPatch && fs.existsSync(hidden)) fs.renameSync(hidden, patch);
}
