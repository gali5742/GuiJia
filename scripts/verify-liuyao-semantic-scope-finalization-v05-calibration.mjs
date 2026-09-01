import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'scripts/verify-liuyao-semantic-scope-finalization-v04-calibration.mjs');
const tempFile = path.join(root, 'scripts/.tmp-verify-liuyao-semantic-scope-finalization-v05-calibration.generated.mjs');

let source = fs.readFileSync(templateFile, 'utf8');
const replacements = [
  ["data/liuyao-semantic-scope-finalization-v0.4-calibration.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration.json"],
  ["data/liuyao-semantic-scope-finalization-v0.4-calibration.lock.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration.lock.json"],
  ["data/liuyao-semantic-scope-finalization-v0.4-calibration-preseal-patch.json", "data/liuyao-semantic-scope-finalization-v0.5-calibration-preseal-patch.json"],
  ["data/liuyao-semantic-v013-candidate-v06-design-v0.1.json", "data/liuyao-semantic-v013-candidate-v07-design-v0.1.json"],
  ["design_frozen_before_v06_calibration_data", "design_frozen_before_v07_question_mode_implementation_and_calibration_data"],
  ["0.13-scope-finalization-v0.4-calibration-v0.1", "0.13-scope-finalization-v0.5-calibration-v0.1"],
  ["liuyao_semantic_candidate_v0.6_scope_finalization", "liuyao_semantic_candidate_v0.7_scope_finalization"],
  ["createdAfterCandidateV06DesignFreeze", "createdAfterCandidateV07DesignFreeze"],
  ["Candidate v0.6", "Candidate v0.7"],
  ["Candidate v0.6 calibration row id drift", "Candidate v0.7 calibration row id drift"],
  ["/^SC4-\\d{3}$/", "/^SC5-\\d{3}$/"],
  ["'js/liuyao-semantic-route-evidence-v05.js',", "'js/liuyao-semantic-route-evidence-v05.js',\n  'js/liuyao-semantic-question-mode-v01.js',"],
  ["'js/liuyao-semantic-route-arbitration-v014.js'", "'js/liuyao-semantic-route-arbitration-v014.js','js/liuyao-semantic-route-arbitration-v015.js'"],
  ["liuyaoSemanticRouteArbitrationV014", "liuyaoSemanticRouteArbitrationV015"],
  ["Evidence v0.5 / Arbitration v0.14", "Evidence v0.5 / Question Mode v0.1 / Arbitration v0.15"],
  ["fresh v0.6 scope calibration", "fresh v0.7 scope calibration"],
  ["sealed v0.6 scope calibration", "sealed v0.7 scope calibration"],
  ["v0.6 scope calibration", "v0.7 scope calibration"],
  ["0.13-scope-finalization-v0.4-calibration-lock-v0.1", "0.13-scope-finalization-v0.5-calibration-lock-v0.1"]
];
for (const [from, to] of replacements) source = source.replaceAll(from, to);

// Candidate v0.7 additionally excludes Candidate v0.6 Scope calibration from threshold choice.
source = source.replace(
  "assert(calibration.policy?.candidateV05ScopeCalibrationExcluded === true && calibration.policy?.candidateV04ScopeCalibrationExcluded === true, 'predecessor Scope calibration exclusions missing');",
  "assert(calibration.policy?.candidateV06ScopeCalibrationExcluded === true && calibration.policy?.candidateV05ScopeCalibrationExcluded === true && calibration.policy?.candidateV04ScopeCalibrationExcluded === true, 'predecessor Scope calibration exclusions missing');"
);

for (const token of [
  'scope-finalization-v0.4-calibration.json',
  'candidate-v06-design-v0.1.json',
  'liuyao_semantic_candidate_v0.6_scope_finalization',
  'createdAfterCandidateV06DesignFreeze',
  'liuyaoSemanticRouteArbitrationV014;'
]) {
  if (source.includes(token)) throw new Error(`Candidate v0.7 calibration verifier left stale token: ${token}`);
}
for (const token of [
  'scope-finalization-v0.5-calibration.json',
  'candidate-v07-design-v0.1.json',
  'liuyao_semantic_candidate_v0.7_scope_finalization',
  'createdAfterCandidateV07DesignFreeze',
  'question-mode-v01.js',
  'route-arbitration-v015.js',
  'liuyaoSemanticRouteArbitrationV015',
  'candidateV06ScopeCalibrationExcluded'
]) {
  if (!source.includes(token)) throw new Error(`Candidate v0.7 calibration verifier missing token: ${token}`);
}

try {
  fs.writeFileSync(tempFile, source, 'utf8');
  execFileSync(process.execPath, [tempFile], { cwd:root, stdio:'inherit' });
} finally {
  if (fs.existsSync(tempFile)) fs.rmSync(tempFile);
}
