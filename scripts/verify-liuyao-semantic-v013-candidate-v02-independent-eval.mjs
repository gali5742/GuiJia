import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const file = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.json';
const candidateLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json';
const independentLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');

const data = readJson(file);
const candidateLock = readJson(candidateLockFile);
assert(candidateLock.status === 'locked', 'Candidate v0.2 lock must remain locked');
assert(candidateLock.candidateSha256 === '23368e0911f1164f6af5d7e72dd894ebfcc767524840e5bba796aaff6940f828', `unexpected Candidate v0.2 SHA ${candidateLock.candidateSha256}`);
assert(data.version === '0.13-candidate-v0.2-independent-eval-v0.1', `unexpected version ${data.version}`);
assert(['presealed_independent_eval','sealed_independent_eval'].includes(data.status), `unexpected status ${data.status}`);
assert(data.sealed === (data.status === 'sealed_independent_eval'), 'sealed/status mismatch');
assert(data.createdAfterCandidateLock === true, 'independent eval must be post-lock');
assert(data.candidate?.lockPath === candidateLockFile, 'candidate lock path mismatch');
assert(data.candidate?.candidateSha256 === candidateLock.candidateSha256, 'candidate SHA mismatch');
assert(data.policy?.useForTraining === false, 'independent eval cannot train');
assert(data.policy?.useForCalibration === false, 'independent eval cannot calibrate');
assert(data.policy?.modifyLockedCandidateFromThisEval === false, 'independent eval cannot mutate Candidate v0.2');
assert(data.policy?.reuseAsFutureBlind === false, 'independent eval cannot be recycled as future blind');
assert(data.policy?.priorCandidateV01IndependentExcluded === true, 'old independent exclusion missing');
assert(data.policy?.priorDevelopmentAndCalibrationExcluded === true, 'development/calibration exclusion missing');

const expectedCounts = {
  total:198, route_known:132, non_route:66,
  strong_arbitration:44, support_arbitration:44, fallback_head:44,
  outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(data.counts?.[key] === expected, `count ${key}=${data.counts?.[key]} expected=${expected}`);
}
assert(Array.isArray(data.rows) && data.rows.length === 198, `rows=${data.rows?.length}`);

const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = new Set((inventory.routes || []).map((row) => row.routeId));
assert(routeIds.size === 22, `route inventory size ${routeIds.size}`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-divination-policy-gate-v01.js',
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const policyGate = context.GuiJia?.liuyaoDivinationPolicyGateV01;
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(policyGate?.evaluate && evidenceExtractor?.extract && arbitration?.arbitrate, 'failed to load locked path/policy modules');

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const seenIds = new Set();
const seenTexts = new Map();
const pathActual = { strong_arbitration:0, support_arbitration:0, fallback_head:0 };
const subtypeActual = { outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
const pathMismatches = [];

for (const row of data.rows) {
  assert(/^V013-I2-\d{3}$/.test(row.id), `invalid id ${row.id}`);
  assert(!seenIds.has(row.id), `duplicate id ${row.id}`);
  seenIds.add(row.id);
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short text ${row.id}`);
  assert(!seenTexts.has(text), `internal exact duplicate ${row.id}/${seenTexts.get(text)}: ${row.text}`);
  seenTexts.set(text, row.id);
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional term leaked ${row.id}: ${term}`);
  const policy = policyGate.evaluate(row.text);
  assert(policy.allowed === true, `policy-disallowed row ${row.id}: ${row.text} (${policy.reasonCode})`);

  if (row.expectedDisposition === 'route_known') {
    assert(routeIds.has(row.expectedRoute), `${row.id} invalid expected route ${row.expectedRoute}`);
    assert(Object.hasOwn(pathActual, row.expectedCandidatePath), `${row.id} invalid candidate path ${row.expectedCandidatePath}`);
    pathActual[row.expectedCandidatePath] += 1;
    const evidence = evidenceExtractor.extract(row.text);
    const actual = arbitration.arbitrate(row.text, evidence);
    const matches = row.expectedCandidatePath === 'strong_arbitration'
      ? actual?.strength === 'strong' && actual.routeId === row.expectedRoute
      : row.expectedCandidatePath === 'support_arbitration'
        ? actual?.strength === 'support' && actual.routeId === row.expectedRoute
        : actual == null;
    if (!matches) pathMismatches.push({ id:row.id, path:row.expectedCandidatePath, expectedRoute:row.expectedRoute, actual, text:row.text });
  } else {
    assert(row.expectedDisposition === 'non_route', `${row.id} invalid disposition`);
    assert(row.expectedRoute == null && row.expectedCandidatePath == null, `${row.id} non-route has route/path`);
    assert(Object.hasOwn(subtypeActual, row.nonRouteSubtype), `${row.id} invalid subtype ${row.nonRouteSubtype}`);
    subtypeActual[row.nonRouteSubtype] += 1;
  }
}
assert(pathMismatches.length === 0, `path mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,25).map((row) => `${row.id} ${row.path}/${row.expectedRoute} actual=${JSON.stringify(row.actual)} text=${row.text}`).join(' | ')}`);
for (const [key, expected] of Object.entries({ strong_arbitration:44, support_arbitration:44, fallback_head:44 })) assert(pathActual[key] === expected, `path count ${key}=${pathActual[key]}`);
for (const [key, expected] of Object.entries({ outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 })) assert(subtypeActual[key] === expected, `subtype count ${key}=${subtypeActual[key]}`);

// Audit primary/semantic corpora only. Derived reports/diagnostics copy source text and are intentionally excluded.
const isCorpusFile = (name) => {
  if (!name.startsWith('liuyao-') || !name.endsWith('.json')) return false;
  if ([path.basename(file), path.basename(independentLockFile)].includes(name)) return false;
  if (/(?:report|diagnostic|decision|inventory|contract|lock|responsibility|coverage|patch)/.test(name)) return false;
  return /(?:training|validation|development|calibration|sealed-blind|blind-eval|independent-eval|route-eval|candidate-eval|scope-gate)/.test(name);
};
const priorFiles = fs.readdirSync(dataDir).filter(isCorpusFile);
const priorStrings = new Map();
const collect = (value, source) => {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized.length >= 4 && /[\u3400-\u9fff]/.test(normalized) && !priorStrings.has(normalized)) priorStrings.set(normalized, source);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, source)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, source));
};
for (const name of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8')), name);
const overlaps = data.rows.map((row) => ({ row, source:priorStrings.get(normalize(row.text)) })).filter((item) => item.source);
assert(overlaps.length === 0, `exact overlap with prior corpora (${overlaps.length}): ${overlaps.slice(0,25).map((item) => `${item.row.id}:${item.row.text}->${item.source}`).join(' | ')}`);

if (data.status === 'sealed_independent_eval') {
  const independentLock = readJson(independentLockFile);
  assert(independentLock.status === 'locked', 'sealed independent eval requires lock');
  assert(independentLock.candidateSha256 === candidateLock.candidateSha256, 'independent lock candidate SHA mismatch');
  assert(independentLock.dataSha256 === sha256(file), 'independent data SHA drift');
  assert(independentLock.candidateLockSha256 === sha256(candidateLockFile), 'candidate lock SHA drift');
}

console.log('LiuYao v0.13 Candidate v0.2 fresh post-lock independent eval verified.');
console.log(`- status: ${data.status}; sealed=${data.sealed}`);
console.log('- rows: 198 (44 strong / 44 support / 44 fallback / 66 non-route)');
console.log(`- primary prior corpora audited: ${priorFiles.length}; exact overlap: 0`);
console.log('- policy-disallowed and traditional-term leakage: 0');
console.log(`- Candidate v0.2: ${candidateLock.candidateSha256}`);
console.log(`- data SHA-256: ${sha256(file)}`);
