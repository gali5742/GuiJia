import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const file = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.json';
const lockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json';
const fullPath = path.join(root, file);
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

const data = readJson(file);
const candidateLock = readJson(lockFile);
assert(candidateLock.status === 'locked', 'candidate lock must remain locked');
assert(candidateLock.candidateSha256 === '6503446eb9c9e606ed3de53de5a9e98c1a77362d7a491b2a113f6f31ced059a9', `unexpected candidate ${candidateLock.candidateSha256}`);
assert(data.version === '0.13-independent-eval-v0.1', `unexpected version ${data.version}`);
assert(['presealed_independent_eval','sealed_independent_eval'].includes(data.status), `unexpected status ${data.status}`);
assert(data.sealed === (data.status === 'sealed_independent_eval'), 'sealed/status mismatch');
assert(data.scope === 'liuyao_semantic_decision_stack_v0.13', 'scope drift');
assert(data.createdAfterCandidateLock === true, 'independent eval must be post-lock');
assert(data.candidate?.lockPath === lockFile, 'candidate lock path drift');
assert(data.candidate?.candidateSha256 === candidateLock.candidateSha256, 'candidate SHA mismatch');
assert(data.policy?.useForTraining === false, 'independent eval must never train candidate');
assert(data.policy?.useForCalibration === false, 'independent eval must never calibrate candidate');
assert(data.policy?.modifyLockedCandidateFromThisEval === false, 'independent eval may not mutate locked candidate');
assert(data.policy?.reuseAsFutureBlind === false, 'independent eval may not be recycled as future blind');
assert(data.policy?.healthDiseaseSamplesExcluded === true, 'health policy boundary missing');
assert(data.policy?.traditionalLiuYaoFieldsForbidden === true, 'traditional terminology boundary missing');

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
assert(Array.isArray(data.rows) && data.rows.length === 198, `rows=${data.rows?.length}`);

const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = new Set((inventory.routes || []).map((row) => row.routeId));
assert(routeIds.size === 22, `route inventory size ${routeIds.size}`);

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const extractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(extractor?.extract && arbitration?.arbitrate, 'failed to load locked modern semantic path modules');

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','诊断结果','检查结果'];
const seenIds = new Set();
const seenTexts = new Map();
const pathActual = { strong_arbitration:0, support_arbitration:0, fallback_head:0 };
const subtypeActual = { outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
const pathMismatches = [];

for (const row of data.rows) {
  assert(/^V013-I-\d{3}$/.test(row.id), `invalid id ${row.id}`);
  assert(!seenIds.has(row.id), `duplicate id ${row.id}`);
  seenIds.add(row.id);
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short text ${row.id}`);
  assert(!seenTexts.has(text), `internal exact duplicate ${row.id} / ${seenTexts.get(text)}: ${row.text}`);
  seenTexts.set(text, row.id);
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional terminology leaked ${row.id}: ${term}`);
  for (const term of healthTerms) assert(!text.includes(term), `health-policy sample leaked ${row.id}: ${term}`);

  if (row.expectedDisposition === 'route_known') {
    assert(routeIds.has(row.expectedRoute), `${row.id} unknown expectedRoute ${row.expectedRoute}`);
    assert(['strong_arbitration','support_arbitration','fallback_head'].includes(row.expectedCandidatePath), `${row.id} invalid candidate path`);
    pathActual[row.expectedCandidatePath] += 1;
    const evidence = extractor.extract(row.text);
    const result = arbitration.arbitrate(row.text, evidence);
    const matches = row.expectedCandidatePath === 'strong_arbitration'
      ? result?.strength === 'strong' && result.routeId === row.expectedRoute
      : row.expectedCandidatePath === 'support_arbitration'
        ? result?.strength === 'support' && result.routeId === row.expectedRoute
        : result == null;
    if (!matches) pathMismatches.push({ id:row.id, path:row.expectedCandidatePath, expectedRoute:row.expectedRoute, actual:result, text:row.text });
  } else {
    assert(row.expectedDisposition === 'non_route', `${row.id} invalid disposition ${row.expectedDisposition}`);
    assert(row.expectedRoute == null && row.expectedCandidatePath == null, `${row.id} non-route must not have route/path`);
    assert(Object.hasOwn(subtypeActual, row.nonRouteSubtype), `${row.id} invalid non-route subtype ${row.nonRouteSubtype}`);
    subtypeActual[row.nonRouteSubtype] += 1;
  }
}
assert(pathMismatches.length === 0, `path-contract mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,20).map((item) => `${item.id} ${item.path}/${item.expectedRoute} actual=${JSON.stringify(item.actual)} text=${item.text}`).join(' | ')}`);
for (const [key, expected] of Object.entries({ strong_arbitration:44, support_arbitration:44, fallback_head:44 })) assert(pathActual[key] === expected, `actual path count ${key}=${pathActual[key]} expected ${expected}`);
for (const [key, expected] of Object.entries({ outside_current_22:22, route_unresolved:22, near_domain_not_current_route:22 })) assert(subtypeActual[key] === expected, `actual subtype count ${key}=${subtypeActual[key]} expected ${expected}`);

// Independent evaluation is stricter than development/calibration isolation: audit every prior LiuYao JSON corpus.
const priorFiles = fs.readdirSync(dataDir).filter((name) => name.endsWith('.json') && name.startsWith('liuyao-') && ![
  path.basename(file),
  'liuyao-semantic-decision-stack-v0.13-independent-eval.lock.json'
].includes(name));
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
assert(overlaps.length === 0, `exact overlap with prior corpora (${overlaps.length}): ${overlaps.slice(0,20).map((item) => `${item.row.id}:${item.row.text} -> ${item.prior}`).join(' | ')}`);

const sha256 = createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
console.log('LiuYao Semantic Decision Stack v0.13 post-lock independent eval verified.');
console.log(`- status: ${data.status}; sealed=${data.sealed}`);
console.log('- rows: 198 (132 route-known / 66 non-route)');
console.log('- known paths: 44 strong / 44 support / 44 fallback');
console.log('- non-route subtypes: 22 outside / 22 unresolved / 22 near-domain');
console.log(`- locked candidate: ${candidateLock.candidateSha256}`);
console.log(`- exact-overlap prior LiuYao JSON files audited: ${priorFiles.length}`);
console.log('- health-policy and traditional-terminology leakage: 0');
console.log(`- data SHA-256: ${sha256}`);
