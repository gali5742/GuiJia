import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'scripts/diagnose-liuyao-semantic-scope-finalization-v03-failure.mjs');
const tempFile = path.join(root, 'scripts/.tmp-diagnose-liuyao-semantic-scope-finalization-v04-failure.generated.mjs');
const reportFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.4-calibration-failure.json');

let source = fs.readFileSync(templateFile, 'utf8');
const replacements = [
  ["data/liuyao-semantic-v013-candidate-v05-design-v0.1.json", "data/liuyao-semantic-v013-candidate-v06-design-v0.1.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.json", "data/liuyao-semantic-scope-finalization-v0.4-calibration.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.lock.json", "data/liuyao-semantic-scope-finalization-v0.4-calibration.lock.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration-failure.json", "data/liuyao-semantic-scope-finalization-v0.4-calibration-failure.json"],
  ["'js/liuyao-semantic-route-evidence-v04.js',", "'js/liuyao-semantic-route-evidence-v04.js',\n  'js/liuyao-semantic-route-evidence-v05.js',"],
  ["'js/liuyao-semantic-route-arbitration-v013.js',", "'js/liuyao-semantic-route-arbitration-v013.js',\n  'js/liuyao-semantic-route-arbitration-v014.js',"],
  ["liuyaoSemanticRouteEvidenceV04", "liuyaoSemanticRouteEvidenceV05"],
  ["liuyaoSemanticRouteArbitrationV013", "liuyaoSemanticRouteArbitrationV014"],
  ["design_frozen_before_v05_calibration_data", "design_frozen_before_v06_calibration_data"],
  ["candidateV05Lockable", "candidateV06Lockable"],
  ["candidate_v0.5", "candidate_v0.6"],
  ["Candidate v0.5", "Candidate v0.6"],
  ["candidate v0.5", "candidate v0.6"],
  ["0.13-scope-finalization-v0.3-calibration-failure-v0.1", "0.13-scope-finalization-v0.4-calibration-failure-v0.1"],
  ["scope v0.5 failure diagnostic", "scope v0.6 failure diagnostic"]
];
for (const [from, to] of replacements) source = source.replaceAll(from, to);

for (const token of [
  'candidate-v05-design-v0.1.json',
  'scope-finalization-v0.3-calibration.json',
  'scope-finalization-v0.3-calibration-failure.json',
  'liuyaoSemanticRouteEvidenceV04;',
  'liuyaoSemanticRouteArbitrationV013;',
  'candidateV05Lockable',
  'candidate_v0.5',
  'design_frozen_before_v05_calibration_data'
]) {
  if (source.includes(token)) throw new Error(`Candidate v0.6 failure diagnostic adaptation left stale token: ${token}`);
}
for (const token of [
  'candidate-v06-design-v0.1.json',
  'scope-finalization-v0.4-calibration.json',
  'scope-finalization-v0.4-calibration-failure.json',
  'route-evidence-v05.js',
  'route-arbitration-v014.js',
  'liuyaoSemanticRouteEvidenceV05',
  'liuyaoSemanticRouteArbitrationV014',
  'candidateV06Lockable',
  'design_frozen_before_v06_calibration_data'
]) {
  if (!source.includes(token)) throw new Error(`Candidate v0.6 failure diagnostic adaptation missing token: ${token}`);
}

try {
  fs.writeFileSync(tempFile, source, 'utf8');
  execFileSync(process.execPath, [tempFile], { cwd: root, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempFile)) fs.rmSync(tempFile);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
if (report.status !== 'calibration_failed_no_safe_cutoff') throw new Error(`unexpected v0.6 failure report status: ${report.status}`);
if (report.candidateV06Lockable !== false) throw new Error('v0.6 failure report must be non-lockable');
if (report.safeThresholdCount !== 0 || report.feasibility?.allThree !== 0) {
  throw new Error(`v0.6 failure diagnostic found safe Scope cutoff(s): ${report.safeThresholdCount}`);
}
const oldRegression = report.originalV04FailureRegression;
delete report.originalV04FailureRegression;
report.priorV05FailureRegression = {
  expectedOldFailureThemes: ['requirements_list_information', 'required_material_information'],
  irreducibleRowsMatchingNewUnsupportedFamilies: oldRegression?.irreducibleRowsMatchingNewUnsupportedFamilies ?? null
};
report.conclusion = 'No global Scope hard-veto cutoff satisfies the frozen Candidate v0.6 safety constraints. Candidate v0.6 must not be locked or promoted from this calibration unless a new architecture version is designed.';
fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log('Candidate v0.6 no-safe-cutoff failure evidence verified as terminal for this calibration.');
