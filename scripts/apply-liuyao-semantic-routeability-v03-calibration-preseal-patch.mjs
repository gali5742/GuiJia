import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data/liuyao-semantic-routeability-v0.3-calibration.json');
const patchPath = path.join(root, 'data/liuyao-semantic-routeability-v0.3-calibration-preseal-patch.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
let applied = 0;
for (const change of patch.changes || []) {
  const matches = data.rows.filter((row) => row.text === change.from && row.routeId === change.expectedRoute && row.candidatePath === change.candidatePath);
  if (matches.length !== 1) throw new Error(`preseal patch expected exactly one match for: ${change.from}; got ${matches.length}`);
  matches[0].text = change.to;
  applied += 1;
}
if (applied !== (patch.changes || []).length) throw new Error('preseal patch application count mismatch');
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`Applied ${applied} pre-seal calibration wording correction(s).`);
