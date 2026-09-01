import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const calibrationFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration.json';
const lockFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration.lock.json';
const patchFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration-preseal-patch.json';
const designFile = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const design = readJson(designFile);
const calibration = readJson(calibrationFile);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeSet = new Set(inventory.routes.map((row) => row.routeId));
assert(design.status === 'assembly_frozen_before_scope_revalidation_and_development', 'Candidate v0.4 assembly freeze missing');
assert(calibration.version === '0.13-scope-finalization-v0.2-calibration-v0.1', `calibration version ${calibration.version}`);
assert(['presealed_fresh_scope_calibration','sealed_fresh_scope_calibration'].includes(calibration.status), `calibration status ${calibration.status}`);
assert(calibration.sealed === (calibration.status === 'sealed_fresh_scope_calibration'), 'scope calibration sealed/status mismatch');
assert(calibration.scope === 'liuyao_semantic_candidate_v0.4_scope_finalization', 'scope calibration scope drift');
assert(calibration.createdAfterCandidateV04AssemblyFreeze === true, 'post-assembly creation marker missing');
assert(calibration.provenance?.designPath === designFile, 'design provenance path drift');
assert(calibration.policy?.useForTraining === false && calibration.policy?.useForScopeThresholdCalibration === true, 'scope calibration role drift');
assert(calibration.policy?.useAsDevelopmentEval === false && calibration.policy?.reuseAsIndependent === false && calibration.policy?.reuseAsBlind === false, 'scope calibration reuse policy drift');
assert(calibration.policy?.parameterToCalibrate === 'scope_hard_veto_cutoff' && calibration.policy?.parameterCount === 1, 'scope parameter contract drift');
assert(calibration.policy?.otherModelOrGateParametersMayChange === false && calibration.policy?.multiTextEncoderBatchForbidden === true, 'scope calibration mutation/representation policy drift');
assert(calibration.policy?.fallbackAcceptanceCalibrationExcluded === true && calibration.policy?.routeabilityCalibrationExcluded === true && calibration.policy?.sealedBlindAndIndependentExcluded === true, 'scope forbidden-source policy drift');

const counts = calibration.counts || {};
assert(calibration.rows?.length === 222 && counts.total === 222, 'scope calibration total != 222');
assert(counts.route_known === 132 && counts.non_route === 90, 'scope calibration known/nonroute counts drift');
assert(counts.strong_arbitration === 44 && counts.support_arbitration === 44 && counts.pure_fallback === 44, 'scope known-path counts drift');
assert(counts.outside_current_22 === 30 && counts.route_unresolved === 30 && counts.near_domain_not_current_route === 30, 'scope nonroute subtype counts drift');

const designCommit = calibration.provenance?.designFreezeCommit;
const generatorCommit = calibration.provenance?.generatorCommit;
assert(/^[0-9a-f]{40}$/.test(designCommit || ''), 'design freeze commit missing');
assert(/^[0-9a-f]{40}$/.test(generatorCommit || ''), 'generator commit missing');
assert(designCommit !== generatorCommit, 'design freeze must precede scope calibration generator');
try { execFileSync('git', ['merge-base','--is-ancestor',designCommit,generatorCommit], { cwd:root, stdio:'ignore' }); }
catch { throw new Error(`design freeze commit ${designCommit} is not ancestor of generator commit ${generatorCommit}`); }

const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','诊断结果','检查结果'];
const seen = new Set();
for (const row of calibration.rows) {
  const text = normalize(row.text);
  assert(text.length >= 4, `too-short scope calibration row: ${row.id}`);
  assert(!seen.has(text), `internal exact duplicate: ${row.text}`);
  seen.add(text);
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional term leaked: ${term} / ${row.text}`);
  for (const term of healthTerms) assert(!text.includes(term), `health-policy term leaked: ${term} / ${row.text}`);
  if (row.expectedDisposition === 'route_known') {
    assert(routeSet.has(row.expectedRoute), `unknown expected route ${row.expectedRoute}`);
    assert(['strong_arbitration','support_arbitration','pure_fallback'].includes(row.expectedCandidatePath), `unknown known path ${row.expectedCandidatePath}`);
    assert(row.subtype == null, `known subtype must be null: ${row.id}`);
  } else {
    assert(row.expectedDisposition === 'non_route' && row.expectedRoute == null && row.expectedCandidatePath == null, `invalid nonroute row ${row.id}`);
    assert(['outside_current_22','route_unresolved','near_domain_not_current_route'].includes(row.subtype), `unknown nonroute subtype ${row.subtype}`);
  }
}

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
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'failed to load Candidate v0.4 evidence/arbitration');
const pathMismatches = [];
for (const row of calibration.rows.filter((item) => item.expectedDisposition === 'route_known')) {
  const evidence = evidenceApi.extract(row.text);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  const actual = arbitration?.strength === 'strong' ? 'strong_arbitration' : arbitration?.strength === 'support' ? 'support_arbitration' : arbitration == null ? 'pure_fallback' : `other:${arbitration?.strength}`;
  const routeMatches = row.expectedCandidatePath === 'pure_fallback' ? arbitration == null : arbitration?.routeId === row.expectedRoute;
  if ((evidence.unsupportedTargets || []).length || actual !== row.expectedCandidatePath || !routeMatches) {
    pathMismatches.push({ id:row.id, expectedPath:row.expectedCandidatePath, expectedRoute:row.expectedRoute, actual, arbitration, unsupported:evidence.unsupportedTargets, text:row.text });
  }
}
assert(pathMismatches.length === 0, `scope calibration known path mismatches (${pathMismatches.length}): ${pathMismatches.slice(0,20).map((row)=>`${row.id}/${row.expectedRoute}/${row.expectedPath}:${row.text} actual=${row.actual} arb=${JSON.stringify(row.arbitration)} unsupported=${JSON.stringify(row.unsupported)}`).join(' | ')}`);

// The calibration artifact, its lock, and its own pre-seal wording provenance are the same corpus, not prior evidence.
const excluded = new Set([path.basename(calibrationFile), path.basename(lockFile), path.basename(patchFile)]);
const priorFiles = fs.readdirSync(dataDir).filter((name) => name.startsWith('liuyao-') && name.endsWith('.json') && !excluded.has(name));
const priorStrings = new Map();
const collect = (value, source) => {
  if (typeof value === 'string') {
    const text = normalize(value);
    if (text.length >= 4 && /[\u3400-\u9fff]/.test(text) && !priorStrings.has(text)) priorStrings.set(text, source);
    return;
  }
  if (Array.isArray(value)) { for (const item of value) collect(item, source); return; }
  if (value && typeof value === 'object') for (const item of Object.values(value)) collect(item, source);
};
for (const file of priorFiles) collect(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);
const overlaps = calibration.rows.map((row) => ({ row, source:priorStrings.get(normalize(row.text)) })).filter((item) => item.source);
assert(overlaps.length === 0, `fresh scope calibration exact overlap (${overlaps.length}): ${overlaps.slice(0,20).map((item)=>`${item.row.id}:${item.row.text}->${item.source}`).join(' | ')}`);

if (calibration.sealed) {
  assert(fs.existsSync(path.join(root, lockFile)), 'sealed scope calibration lock missing');
  const lock = readJson(lockFile);
  assert(lock.version === '0.13-scope-finalization-v0.2-calibration-lock-v0.1' && lock.status === 'locked', 'scope calibration lock contract drift');
  assert(lock.calibrationSha256 === sha256(calibrationFile), 'scope calibration SHA drift');
  assert(lock.designSha256 === sha256(designFile), 'Candidate v0.4 design SHA drift');
  assert(lock.designFreezeCommit === designCommit, 'Candidate v0.4 design commit lock drift');
}

console.log('LiuYao Candidate v0.4 fresh Scope calibration corpus verified.');
console.log('- 222 total: 132 known (44 strong / 44 support / 44 pure fallback) + 90 non-route');
console.log('- all known rows match declared Evidence/Arbitration path contracts');
console.log(`- prior LiuYao JSON corpora audited: ${priorFiles.length}; exact overlap: 0`);
console.log('- health-policy and traditional-term leakage: 0');
