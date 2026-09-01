import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'scripts/calibrate-liuyao-semantic-scope-finalization-v03.mjs');
const tempFile = path.join(root, 'scripts/.tmp-calibrate-liuyao-semantic-scope-finalization-v04.generated.mjs');

let source = fs.readFileSync(templateFile, 'utf8');
const replacements = [
  ["data/liuyao-semantic-v013-candidate-v05-design-v0.1.json", "data/liuyao-semantic-v013-candidate-v06-design-v0.1.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.json", "data/liuyao-semantic-scope-finalization-v0.4-calibration.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.lock.json", "data/liuyao-semantic-scope-finalization-v0.4-calibration.lock.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3.json", "data/liuyao-semantic-scope-finalization-v0.4.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3.lock.json", "data/liuyao-semantic-scope-finalization-v0.4.lock.json"],
  ["'js/liuyao-semantic-route-evidence-v04.js',", "'js/liuyao-semantic-route-evidence-v04.js',\n  'js/liuyao-semantic-route-evidence-v05.js',"],
  ["'js/liuyao-semantic-route-arbitration-v013.js',", "'js/liuyao-semantic-route-arbitration-v013.js',\n  'js/liuyao-semantic-route-arbitration-v014.js',"],
  ["liuyaoSemanticRouteEvidenceV04", "liuyaoSemanticRouteEvidenceV05"],
  ["liuyaoSemanticRouteArbitrationV013", "liuyaoSemanticRouteArbitrationV014"],
  ["design_frozen_before_v05_calibration_data", "design_frozen_before_v06_calibration_data"],
  ["candidateV05Design", "candidateV06Design"],
  ["candidateV05DesignSha256", "candidateV06DesignSha256"],
  ["candidate_v0.5", "candidate_v0.6"],
  ["Candidate v0.5", "Candidate v0.6"],
  ["candidate v0.5", "candidate v0.6"],
  ["0.13-scope-finalization-v0.3-lock-v0.1", "0.13-scope-finalization-v0.4-lock-v0.1"],
  ["0.13-scope-finalization-v0.3", "0.13-scope-finalization-v0.4"],
  ["Scope Finalization v0.3", "Scope Finalization v0.4"]
];
for (const [from, to] of replacements) source = source.replaceAll(from, to);

const forbidden = [
  'candidate-v05-design-v0.1.json',
  'scope-finalization-v0.3-calibration.json',
  'scope-finalization-v0.3-calibration.lock.json',
  'scope-finalization-v0.3.json',
  'scope-finalization-v0.3.lock.json',
  'liuyaoSemanticRouteEvidenceV04;',
  'liuyaoSemanticRouteArbitrationV013;',
  'design_frozen_before_v05_calibration_data',
  'candidateV05Design',
  'candidate_v0.5'
];
for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`Candidate v0.6 calibrator template adaptation left stale token: ${token}`);
}
for (const token of [
  'candidate-v06-design-v0.1.json',
  'scope-finalization-v0.4-calibration.json',
  'scope-finalization-v0.4-calibration.lock.json',
  'scope-finalization-v0.4.json',
  'scope-finalization-v0.4.lock.json',
  'route-evidence-v05.js',
  'route-arbitration-v014.js',
  'liuyaoSemanticRouteEvidenceV05',
  'liuyaoSemanticRouteArbitrationV014',
  'design_frozen_before_v06_calibration_data',
  'candidateV06Design'
]) {
  if (!source.includes(token)) throw new Error(`Candidate v0.6 calibrator template adaptation missing token: ${token}`);
}

try {
  fs.writeFileSync(tempFile, source, 'utf8');
  execFileSync(process.execPath, [tempFile], { cwd: root, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempFile)) fs.rmSync(tempFile);
}
