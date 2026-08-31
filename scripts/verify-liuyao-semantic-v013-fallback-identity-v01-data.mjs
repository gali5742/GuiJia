import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const trainingFile = 'data/liuyao-semantic-fallback-identity-v0.1-training.json';
const calibrationFile = 'data/liuyao-semantic-fallback-identity-v0.1-calibration.json';
const lockFile = 'data/liuyao-semantic-fallback-identity-v0.1-data.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const design = readJson('data/liuyao-semantic-v013-candidate-v03-design-v0.1.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const training = readJson(trainingFile);
const calibration = readJson(calibrationFile);
const routeIds = (inventory.routes || []).map((row) => row.routeId);
const routeSet = new Set(routeIds);
assert(design.status === 'design_frozen_before_v03_data', 'v0.3 design freeze missing');
assert(routeIds.length === 22, `route inventory ${routeIds.length} != 22`);
assert(training.version === '0.13-fallback-identity-v0.1-training-v0.1', `training version ${training.version}`);
assert(calibration.version === '0.13-fallback-identity-v0.1-calibration-v0.1', `calibration version ${calibration.version}`);
assert(['presealed_training_data','sealed_training_data'].includes(training.status), `training status ${training.status}`);
assert(['presealed_calibration_data','sealed_calibration_data'].includes(calibration.status), `calibration status ${calibration.status}`);
assert(training.sealed === (training.status === 'sealed_training_data'), 'training sealed/status mismatch');
assert(calibration.sealed === (calibration.status === 'sealed_calibration_data'), 'calibration sealed/status mismatch');
assert(training.createdAfterDesignFreeze === true && calibration.createdAfterDesignFreeze === true, 'fresh-after-design marker missing');
assert(training.policy?.useForFallbackIdentityTraining === true && training.policy?.useForThresholdCalibration === false, 'training policy drift');
assert(calibration.policy?.useForFallbackIdentityTraining === false && calibration.policy?.useForThresholdCalibration === true, 'calibration policy drift');
assert(calibration.policy?.mayChooseOnlyOneGlobalFallbackThreshold === true, 'one-global-threshold contract missing');
assert(calibration.policy?.routeabilityThresholdMayChange === false && calibration.policy?.scopeHardVetoMayChange === false, 'upstream threshold drift allowed');
assert(calibration.policy?.routeSpecificThresholdsForbidden === true, 'route-specific fallback thresholds must remain forbidden');
assert(training.rows?.length === 154, `training rows ${training.rows?.length} != 154`);
assert(calibration.rows?.length === 132, `calibration rows ${calibration.rows?.length} != 132`);

const count = (rows, predicate) => rows.filter(predicate).length;
assert(count(training.rows, (row) => row.identityLabel === 'route_identity_positive') === 88, 'training known != 88');
assert(count(training.rows, (row) => row.identityLabel === 'non_route') === 66, 'training non-route != 66');
assert(count(calibration.rows, (row) => row.identityLabel === 'route_identity_positive') === 66, 'calibration known != 66');
assert(count(calibration.rows, (row) => row.identityLabel === 'non_route') === 66, 'calibration non-route != 66');
for (const routeId of routeIds) {
  assert(count(training.rows, (row) => row.expectedRoute === routeId) === 4, `training ${routeId} != 4`);
  assert(count(calibration.rows, (row) => row.expectedRoute === routeId) === 3, `calibration ${routeId} != 3`);
}
for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
  assert(count(training.rows, (row) => row.subtype === subtype) === 22, `training subtype ${subtype} != 22`);
  assert(count(calibration.rows, (row) => row.subtype === subtype) === 22, `calibration subtype ${subtype} != 22`);
}

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','诊断结果','检查结果'];
const allRows = [...training.rows.map((row) => ({...row, corpus:'training'})), ...calibration.rows.map((row) => ({...row, corpus:'calibration'}))];
const seen = new Map();
for (const row of allRows) {
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short row: ${row.text}`);
  assert(!seen.has(text), `fresh training/calibration exact duplicate: ${row.text}`);
  seen.set(text, row.corpus);
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional term leaked: ${term} / ${row.text}`);
  for (const term of healthTerms) assert(!text.includes(term), `health-policy term leaked: ${term} / ${row.text}`);
  if (row.identityLabel === 'route_identity_positive') {
    assert(routeSet.has(row.expectedRoute), `unknown expected route ${row.expectedRoute}`);
    assert(row.subtype === 'fallback_style_known', `known subtype drift ${row.subtype}`);
  } else {
    assert(row.identityLabel === 'non_route', `unknown identity label ${row.identityLabel}`);
    assert(row.expectedRoute == null, `non-route expectedRoute must be null: ${row.text}`);
  }
}

// Fresh known augmentation/calibration must actually belong to the Arbitration-null fallback path before any model scoring.
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
assert(extractor?.extract && arbitration?.arbitrate, 'failed to load v0.3 fallback path modules');
const pathMismatches = [];
for (const row of allRows.filter((item) => item.identityLabel === 'route_identity_positive')) {
  const extracted = extractor.extract(row.text);
  const arb = arbitration.arbitrate(row.text, extracted);
  if ((extracted.unsupportedTargets || []).length || arb != null) {
    pathMismatches.push({ corpus:row.corpus, routeId:row.expectedRoute, text:row.text, unsupported:extracted.unsupportedTargets, arbitration:arb });
  }
}
assert(pathMismatches.length === 0, `fallback known path mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,20).map((row) => `${row.corpus}/${row.routeId}:${row.text} unsupported=${JSON.stringify(row.unsupported)} arb=${JSON.stringify(row.arbitration)}`).join(' | ')}`);

// Exact overlap is forbidden with every earlier LiuYao JSON corpus, including all independent/blind/dev/calibration data.
const excluded = new Set([
  path.basename(trainingFile),
  path.basename(calibrationFile),
  path.basename(lockFile)
]);
const priorFiles = fs.readdirSync(dataDir).filter((name) => name.startsWith('liuyao-') && name.endsWith('.json') && !excluded.has(name));
const priorStrings = new Map();
const collect = (value, source) => {
  if (typeof value === 'string') {
    const text = normalize(value);
    if (text.length >= 4 && /[\u3400-\u9fff]/.test(text) && !priorStrings.has(text)) priorStrings.set(text, source);
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, source)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, source));
};
for (const file of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
const overlaps = allRows.map((row) => ({ row, source:priorStrings.get(normalize(row.text)) })).filter((item) => item.source);
assert(overlaps.length === 0, `fresh data exact overlap (${overlaps.length}): ${overlaps.slice(0,20).map((item) => `${item.row.corpus}:${item.row.text}->${item.source}`).join(' | ')}`);

if (training.sealed || calibration.sealed) {
  assert(training.sealed && calibration.sealed, 'training/calibration must seal together');
  assert(fs.existsSync(path.join(root, lockFile)), 'sealed data lock missing');
  const lock = readJson(lockFile);
  assert(lock.version === '0.13-fallback-identity-v0.1-data-lock-v0.1' && lock.status === 'locked', 'data lock contract drift');
  assert(lock.trainingSha256 === sha256(trainingFile), 'training SHA drift');
  assert(lock.calibrationSha256 === sha256(calibrationFile), 'calibration SHA drift');
  assert(lock.designSha256 === sha256('data/liuyao-semantic-v013-candidate-v03-design-v0.1.json'), 'design SHA drift');
}

console.log('LiuYao Fallback Identity v0.1 fresh data verified.');
console.log(`- training: ${training.rows.length} (88 known / 66 non-route)`);
console.log(`- calibration: ${calibration.rows.length} (66 known / 66 non-route)`);
console.log('- known path contract: Arbitration=null, unsupportedTargets=0');
console.log(`- prior LiuYao JSON corpora audited: ${priorFiles.length}; exact overlap: 0`);
console.log('- health-policy and traditional-term leakage: 0');
