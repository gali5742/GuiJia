import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const file = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const lockFile = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const data = readJson(file);
assert(data.version === '0.13-candidate-v0.3-development-v0.1', `development version drift: ${data.version}`);
assert(['generated_preseal','sealed_development_eval'].includes(data.status), `unexpected development status: ${data.status}`);
assert(data.scope === 'liuyao_semantic_decision_stack_v0.13_candidate_v0.3', 'development scope drift');
assert(data.createdAfterFallbackIdentityModelLock === true, 'development data must be created after Fallback Identity model lock');
assert(data.policy?.useForTraining === false, 'development data must never train');
assert(data.policy?.useForThresholdCalibration === false, 'development data must never calibrate threshold');
assert(data.policy?.useForIndependentEvaluation === false, 'development data must not be reused as independent');
assert(data.policy?.candidateV02IndependentReuse === false, 'Candidate v0.2 independent reuse forbidden');
assert(data.policy?.sameTextAsPriorCorporaForbidden === true, 'prior-corpus overlap policy drift');
assert(data.policy?.traditionalLiuYaoFeaturesForbidden === true, 'traditional feature boundary drift');
assert(data.policy?.healthDiseaseDivinationRowsForbidden === true, 'health/disease policy boundary drift');
if (data.status === 'generated_preseal') {
  assert(data.sealed === false, 'preseal development data unexpectedly marked sealed');
  assert(data.policy.sealedBeforeFirstDevelopmentEncoderScoring === false, 'preseal policy must remain false until seal step');
} else {
  assert(data.sealed === true, 'sealed development data missing sealed=true');
  assert(data.policy.sealedBeforeFirstDevelopmentEncoderScoring === true, 'sealed-before-scoring policy missing');
}

const modelLockPath = data.fallbackIdentityModelLock?.path;
assert(modelLockPath === 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json', `model-lock path drift: ${modelLockPath}`);
const modelLock = readJson(modelLockPath);
assert(modelLock.status === 'locked', 'Fallback Identity model lock is not locked');
assert(sha256File(modelLockPath) === data.fallbackIdentityModelLock.sha256, 'Fallback Identity model lock SHA drift');
assert(modelLock.artifactSha256 === data.fallbackIdentityModelLock.artifactSha256, 'Fallback Identity artifact binding drift');

const expectedCounts = {
  total:198,
  route_known:132,
  non_route:66,
  strong_arbitration:44,
  support_arbitration:44,
  fallback_head:44,
  outside_current_22:22,
  route_unresolved:22,
  near_domain_not_current_route:22
};
for (const [key, expected] of Object.entries(expectedCounts)) assert(data.counts?.[key] === expected, `count ${key}=${data.counts?.[key]} expected ${expected}`);
assert(Array.isArray(data.rows) && data.rows.length === expectedCounts.total, `development rows=${data.rows?.length}`);

const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = new Set((inventory.routes || []).map((row) => row.routeId));
assert(routeIds.size === 22, `route inventory size ${routeIds.size} != 22`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const extractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract && arbitration?.arbitrate, 'Candidate v0.3 path modules failed to load');

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','癌','住院'];
const seenIds = new Set();
const seenTexts = new Map();
const actualPathCounts = { strong_arbitration:0, support_arbitration:0, fallback_head:0 };
const actualSubtypeCounts = { outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
const pathMismatches = [];
const knownRouteCoverage = new Map();

for (const row of data.rows) {
  assert(/^V013-V03-D-\d{3}$/.test(row.id), `invalid development id ${row.id}`);
  assert(!seenIds.has(row.id), `duplicate development id ${row.id}`);
  seenIds.add(row.id);
  const normalized = normalize(row.text);
  assert(normalized.length >= 4, `too-short development text ${row.id}`);
  assert(!seenTexts.has(normalized), `internal normalized duplicate ${row.id}/${seenTexts.get(normalized)}: ${row.text}`);
  seenTexts.set(normalized, row.id);
  for (const term of traditionalTerms) assert(!normalized.includes(term), `traditional terminology leaked ${row.id}: ${term}`);
  for (const term of healthTerms) assert(!normalized.includes(term), `health/disease sample leaked ${row.id}: ${term}`);

  if (row.expectedDisposition === 'route_known') {
    assert(routeIds.has(row.expectedRoute), `${row.id} unknown expectedRoute ${row.expectedRoute}`);
    assert(['strong_arbitration','support_arbitration','fallback_head'].includes(row.expectedCandidatePath), `${row.id} invalid candidate path`);
    actualPathCounts[row.expectedCandidatePath] += 1;
    knownRouteCoverage.set(row.expectedRoute, (knownRouteCoverage.get(row.expectedRoute) || 0) + 1);
    const evidence = extractor.extract(row.text);
    assert((evidence.unsupportedTargets || []).length === 0, `${row.id} known row unexpectedly contains unsupported target: ${JSON.stringify(evidence.unsupportedTargets)}`);
    const result = arbitration.arbitrate(row.text, evidence);
    const matches = row.expectedCandidatePath === 'strong_arbitration'
      ? result?.strength === 'strong' && result.routeId === row.expectedRoute
      : row.expectedCandidatePath === 'support_arbitration'
        ? result?.strength === 'support' && result.routeId === row.expectedRoute
        : result == null;
    if (!matches) pathMismatches.push({ id:row.id, path:row.expectedCandidatePath, expectedRoute:row.expectedRoute, actual:result, evidence, text:row.text });
  } else {
    assert(row.expectedDisposition === 'non_route', `${row.id} invalid disposition ${row.expectedDisposition}`);
    assert(row.expectedRoute == null && row.expectedCandidatePath == null, `${row.id} non-route must not carry route/path`);
    assert(Object.hasOwn(actualSubtypeCounts, row.nonRouteSubtype), `${row.id} invalid non-route subtype ${row.nonRouteSubtype}`);
    actualSubtypeCounts[row.nonRouteSubtype] += 1;
  }
}
assert(pathMismatches.length === 0, `Candidate v0.3 path mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,20).map((item) => `${item.id} ${item.path}/${item.expectedRoute} actual=${JSON.stringify(item.actual)} text=${item.text}`).join(' | ')}`);
for (const [key, expected] of Object.entries({ strong_arbitration:44, support_arbitration:44, fallback_head:44 })) assert(actualPathCounts[key] === expected, `actual path count ${key}=${actualPathCounts[key]}`);
for (const [key, expected] of Object.entries({ outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 })) assert(actualSubtypeCounts[key] === expected, `actual subtype count ${key}=${actualSubtypeCounts[key]}`);
for (const routeId of routeIds) assert((knownRouteCoverage.get(routeId) || 0) >= 2, `development known-route coverage missing/too small for ${routeId}`);

const priorFiles = fs.readdirSync(dataDir).filter((name) => {
  if (!name.endsWith('.json')) return false;
  if (name === path.basename(file) || name === path.basename(lockFile)) return false;
  return name.startsWith('liuyao-semantic-route-training-') ||
    name.startsWith('liuyao-semantic-routeability-v0.2-development') ||
    name.startsWith('liuyao-semantic-routeability-v0.3-calibration') ||
    name.startsWith('liuyao-semantic-decision-stack-v0.11') ||
    name.startsWith('liuyao-semantic-decision-stack-v0.12') ||
    name.startsWith('liuyao-semantic-decision-stack-v0.13') ||
    name.startsWith('liuyao-semantic-fallback-identity-v0.1-training') ||
    name.startsWith('liuyao-semantic-fallback-identity-v0.1-calibration') ||
    name.includes('candidate-v01-independent') ||
    name.includes('candidate-v02-independent') ||
    name.includes('independent-eval');
});
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
for (const prior of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, prior), 'utf8')), prior);
const overlaps = data.rows.map((row) => ({ row, prior:priorStrings.get(normalize(row.text)) })).filter((item) => item.prior);
assert(overlaps.length === 0, `exact normalized overlap with prior corpora: ${overlaps.slice(0,12).map((item) => `${item.row.id}:${item.row.text} -> ${item.prior}`).join(' | ')}`);

if (data.status === 'sealed_development_eval') {
  const lock = readJson(lockFile);
  assert(lock.version === '0.13-candidate-v0.3-development-lock-v0.1', `development lock version drift: ${lock.version}`);
  assert(lock.status === 'locked', `development lock status drift: ${lock.status}`);
  assert(lock.artifact === file, 'development lock artifact path drift');
  assert(lock.artifactSha256 === sha256File(file), 'development artifact SHA drift');
  assert(lock.fallbackIdentityModelArtifactSha256 === modelLock.artifactSha256, 'development lock model binding drift');
  assert(lock.sealedBeforeFirstDevelopmentEncoderScoring === true, 'development lock must state sealed before first scoring');
}

console.log('Candidate v0.3 fresh development data verified.');
console.log('- rows: 198 (132 known / 66 non-route)');
console.log('- paths: 44 strong / 44 support / 44 fallback');
console.log('- non-route: 22 outside / 22 unresolved / 22 near-domain');
console.log(`- current22 routes covered: ${knownRouteCoverage.size}/22`);
console.log(`- prior corpus files audited for exact normalized overlap: ${priorFiles.length}`);
console.log(`- status: ${data.status}`);
console.log(`- SHA-256: ${sha256File(file)}`);
