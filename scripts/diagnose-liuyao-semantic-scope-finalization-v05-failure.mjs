import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'scripts/diagnose-liuyao-semantic-scope-finalization-v03-failure.mjs');
const tempFile = path.join(root, 'scripts/.tmp-diagnose-liuyao-semantic-scope-finalization-v05-failure.generated.mjs');
const reportFile = path.join(root, 'data/liuyao-semantic-scope-finalization-v0.5-calibration-failure.json');

let source = fs.readFileSync(templateFile, 'utf8');
const replacements = [
  ["data/liuyao-semantic-v013-candidate-v05-design-v0.1.json", "data/liuyao-semantic-v013-candidate-v07-design-v0.1.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration.lock.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration.lock.json"],
  ["data/liuyao-semantic-scope-finalization-v0.3-calibration-failure.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration-failure.json"],
  ["'js/liuyao-semantic-route-evidence-v04.js',", "'js/liuyao-semantic-route-evidence-v04.js',\n  'js/liuyao-semantic-route-evidence-v05.js',\n  'js/liuyao-semantic-question-mode-v01.js',"],
  ["'js/liuyao-semantic-route-arbitration-v013.js',", "'js/liuyao-semantic-route-arbitration-v013.js',\n  'js/liuyao-semantic-route-arbitration-v014.js',\n  'js/liuyao-semantic-route-arbitration-v015.js',"],
  ["liuyaoSemanticRouteEvidenceV04", "liuyaoSemanticRouteEvidenceV05"],
  ["liuyaoSemanticRouteArbitrationV013", "liuyaoSemanticRouteArbitrationV015"],
  ["design_frozen_before_v05_calibration_data", "design_frozen_before_v07_question_mode_implementation_and_calibration_data"],
  ["candidateV05Lockable", "candidateV07Lockable"],
  ["candidate_v0.5", "candidate_v0.7"],
  ["Candidate v0.5", "Candidate v0.7"],
  ["candidate v0.5", "candidate v0.7"],
  ["0.13-scope-finalization-v0.3-calibration-failure-v0.1", "0.13-scope-finalization-v0.5-calibration-failure-v0.1"],
  ["scope v0.5 failure diagnostic", "scope v0.7 failure diagnostic"]
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
  if (source.includes(token)) throw new Error(`Candidate v0.7 failure diagnostic adaptation left stale token: ${token}`);
}
for (const token of [
  'candidate-v07-design-v0.1.json',
  'scope-finalization-v0.5-calibration.json',
  'scope-finalization-v0.5-calibration-failure.json',
  'route-evidence-v05.js',
  'question-mode-v01.js',
  'route-arbitration-v014.js',
  'route-arbitration-v015.js',
  'liuyaoSemanticRouteEvidenceV05',
  'liuyaoSemanticRouteArbitrationV015',
  'candidateV07Lockable',
  'design_frozen_before_v07_question_mode_implementation_and_calibration_data'
]) {
  if (!source.includes(token)) throw new Error(`Candidate v0.7 failure diagnostic adaptation missing token: ${token}`);
}

try {
  fs.writeFileSync(tempFile, source, 'utf8');
  execFileSync(process.execPath, [tempFile], { cwd: root, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempFile)) fs.rmSync(tempFile);
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
if (report.status !== 'calibration_failed_no_safe_cutoff') throw new Error(`unexpected v0.7 failure report status: ${report.status}`);
if (report.candidateV07Lockable !== false) throw new Error('v0.7 failure report must be non-lockable');
if (report.safeThresholdCount !== 0 || report.feasibility?.allThree !== 0) {
  throw new Error(`v0.7 failure diagnostic found safe Scope cutoff(s): ${report.safeThresholdCount}`);
}
delete report.originalV04FailureRegression;
report.priorV06FailureRegression = {
  priorFailureClass:'generic_information_request_reaching_confirmed_strong_arbitration',
  repairedBy:'route_agnostic_question_mode_before_arbitration',
  sealedV06RegressionVerifiedSeparately:true
};
report.conclusion = 'No global Scope hard-veto cutoff satisfies the frozen Candidate v0.7 safety constraints. Candidate v0.7 must not be locked or promoted from this calibration unless a new architecture version is designed.';
fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log('Candidate v0.7 no-safe-cutoff failure evidence verified as terminal for this calibration.');
