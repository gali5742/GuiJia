import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const corpusFile = 'data/liuyao-semantic-scope-finalization-v0.4-calibration.json';
const lockFile = 'data/liuyao-semantic-scope-finalization-v0.4-calibration.lock.json';
const failureFile = 'data/liuyao-semantic-scope-finalization-v0.4-calibration-failure.json';
const corpus = readJson(corpusFile);
const lock = readJson(lockFile);
const failure = readJson(failureFile);
assert(corpus.sealed === true && corpus.status === 'sealed_fresh_scope_calibration', 'sealed Candidate v0.6 regression corpus required');
assert(lock.status === 'locked' && lock.calibrationSha256 === sha256(corpusFile), 'Candidate v0.6 regression corpus lock drift');
assert(failure.status === 'calibration_failed_no_safe_cutoff', 'Candidate v0.6 failure report required');

const sourceFiles = [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-evidence-v04.js','js/liuyao-semantic-route-evidence-v05.js',
  'js/liuyao-semantic-question-mode-v01.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js','js/liuyao-semantic-route-arbitration-v013.js','js/liuyao-semantic-route-arbitration-v014.js','js/liuyao-semantic-route-arbitration-v015.js'
];
const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV05;
const modeApi = context.GuiJia?.liuyaoSemanticQuestionModeV01;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV015;
assert(evidenceApi?.extract && modeApi?.classify && arbitrationApi?.arbitrate, 'Candidate v0.7 semantic APIs unavailable');

const actualPath = (arbitration) => arbitration?.strength === 'strong' ? 'strong_arbitration' : arbitration?.strength === 'support' ? 'support_arbitration' : arbitration == null ? 'pure_fallback' : `other:${arbitration?.strength}`;
const knownFailures = [];
for (const row of corpus.rows.filter((item) => item.expectedDisposition === 'route_known')) {
  const evidence = evidenceApi.extract(row.text);
  const mode = modeApi.classify(row.text, evidence);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  const pathName = actualPath(arbitration);
  if (mode.mode === 'information_request' || pathName !== row.expectedCandidatePath || (arbitration?.routeId && arbitration.routeId !== row.expectedRoute)) {
    knownFailures.push({ id:row.id, expectedRoute:row.expectedRoute, expectedPath:row.expectedCandidatePath, mode:mode.mode, actualRoute:arbitration?.routeId || null, actualPath:pathName, text:row.text });
  }
}
assert(knownFailures.length === 0, `Candidate v0.7 regressed sealed v0.6 known rows (${knownFailures.length}): ${knownFailures.slice(0,8).map((r)=>`${r.id}/${r.mode}/${r.actualPath}`).join(' | ')}`);

const priorIrreducibleIds = new Set((failure.irreducibleAtCutoffOne?.nonRouteRows || []).map((row) => row.id));
assert(priorIrreducibleIds.size === 5, `expected five v0.6 irreducible rows, got ${priorIrreducibleIds.size}`);
const irreducibleStillArbitrated = [];
for (const row of corpus.rows.filter((item) => priorIrreducibleIds.has(item.id))) {
  const evidence = evidenceApi.extract(row.text);
  const mode = modeApi.classify(row.text, evidence);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  if (mode.mode !== 'information_request' || arbitration != null) irreducibleStillArbitrated.push({ id:row.id, mode:mode.mode, routeId:arbitration?.routeId || null, text:row.text });
}
assert(irreducibleStillArbitrated.length === 0, `v0.6 irreducible informational rows still reach Arbitration: ${JSON.stringify(irreducibleStillArbitrated)}`);

console.log('LiuYao Candidate v0.7 semantic regression over sealed v0.6 corpus verified.');
console.log('- 132 known rows preserve their declared strong/support/pure-fallback semantic path and route identity');
console.log('- all 5 v0.6 irreducible informational strong activations are now information_request and stop before Arbitration');
console.log('- sealed v0.6 corpus remains regression-only and is not used for v0.7 threshold choice');
