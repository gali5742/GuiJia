import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(readBytes(relative).toString('utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(readBytes(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = readBytes(relative);
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contractPath = 'data/liuyao-semantic-fallback-identity-v0.1-training-contract.json';
const contract = readJson(contractPath);
const lockPath = contract.calibrationRuntimeLock?.path;
assert(lockPath === 'data/liuyao-semantic-fallback-identity-v0.1-calibration-runtime.lock.json', `calibration runtime lock path drift: ${lockPath}`);
assert(contract.calibrationRuntimeLock?.status === 'locked_before_first_encoder_scoring', 'contract runtime-lock status drift');
assert(contract.calibrationRuntimeLock?.requiredByTrainer === true, 'trainer must require calibration runtime lock');
assert(gitBlobSha(lockPath) === contract.calibrationRuntimeLock.gitBlobSha, 'calibration runtime lock Git blob SHA drift');

const lock = readJson(lockPath);
assert(lock.version === '0.13-fallback-identity-v0.1-calibration-runtime-lock-v0.1', `runtime lock version drift: ${lock.version}`);
assert(lock.status === 'locked_before_first_encoder_scoring', `runtime lock status drift: ${lock.status}`);
assert(lock.scope === 'liuyao_semantic_fallback_identity_v0.1', `runtime lock scope drift: ${lock.scope}`);

const requiredModules = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-routeability-v05.js',
  'js/liuyao-semantic-fallback-identity-v01.js',
  'js/liuyao-semantic-route-selection-v04.js',
  'js/liuyao-semantic-finalization-v01.js'
];
assert(Object.keys(lock.modules || {}).length === requiredModules.length, 'calibration runtime module count drift');
for (const relative of requiredModules) {
  assert(typeof lock.modules?.[relative] === 'string', `missing calibration runtime module binding: ${relative}`);
  assert(gitBlobSha(relative) === lock.modules[relative], `calibration runtime module drift: ${relative}`);
}

const frozenDependencies = lock.artifacts?.frozenDependencies;
assert(frozenDependencies?.path === 'data/liuyao-semantic-frozen-dependencies-v0.1.json', 'frozen dependency path drift');
assert(gitBlobSha(frozenDependencies.path) === frozenDependencies.gitBlobSha, 'frozen dependencies Git blob drift');
assert(sha256File(frozenDependencies.path) === frozenDependencies.sha256, 'frozen dependencies SHA-256 drift');
assert(frozenDependencies.sha256 === contract.encoder.artifactSha256, 'runtime frozen dependencies != training contract encoder artifact');

const routeabilityBase = lock.artifacts?.routeabilityBaseModel;
assert(routeabilityBase?.path === 'data/liuyao-semantic-routeability-v0.2.json', 'Routeability base model path drift');
assert(gitBlobSha(routeabilityBase.path) === routeabilityBase.gitBlobSha, 'Routeability base model Git blob drift');
assert(sha256File(routeabilityBase.path) === routeabilityBase.sha256, 'Routeability base model SHA-256 drift');

const thresholdSource = lock.artifacts?.routeabilityThresholdSource;
assert(thresholdSource?.path === 'data/liuyao-semantic-routeability-v0.3.json', 'Routeability threshold source path drift');
assert(gitBlobSha(thresholdSource.path) === thresholdSource.gitBlobSha, 'Routeability threshold source Git blob drift');
const routeabilityV03 = readJson(thresholdSource.path);
assert(routeabilityV03.status === 'frozen', 'Routeability v0.3 threshold source is not frozen');
assert(routeabilityV03.calibration?.threshold === thresholdSource.threshold, 'Routeability threshold-source value drift');
assert(thresholdSource.threshold === 0.7675678218564946, `Routeability frozen threshold drift: ${thresholdSource.threshold}`);
assert(routeabilityV03.baseModel?.sha256 === routeabilityBase.sha256, 'Routeability v0.3 base-model SHA drift');

const frozen = readJson(frozenDependencies.path);
assert(frozen.semanticStackPolicy?.hardVetoCutoff === 0.4196, `Scope hard-veto cutoff drift: ${frozen.semanticStackPolicy?.hardVetoCutoff}`);
assert(lock.invariants?.routeabilityThreshold === thresholdSource.threshold, 'runtime invariant Routeability threshold drift');
assert(lock.invariants?.scopeHardVetoCutoff === frozen.semanticStackPolicy.hardVetoCutoff, 'runtime invariant Scope cutoff drift');
assert(JSON.stringify(lock.invariants?.fallbackIdentityCandidateSource) === JSON.stringify(['router_top1','router_top2']), 'Fallback Identity candidate source drift');
assert(lock.invariants?.fallbackIdentityAppliesOnlyWhen === 'arbitration_null_and_routeability_route_known', 'Fallback Identity application boundary drift');
assert(lock.invariants?.oneGlobalFallbackThresholdOnly === true, 'one-global-threshold invariant drift');
assert(lock.invariants?.routeSpecificFallbackThresholdsForbidden === true, 'route-specific Fallback Identity thresholds unexpectedly allowed');
assert(lock.invariants?.routerMarginTuningForbidden === true, 'Router margin tuning unexpectedly allowed');
assert(lock.invariants?.routeabilityThresholdRetuneForbidden === true, 'Routeability threshold retune unexpectedly allowed');
assert(lock.invariants?.scopeCutoffRetuneForbidden === true, 'Scope cutoff retune unexpectedly allowed');
assert(lock.invariants?.traditionalLiuYaoFeaturesForbidden === true, 'traditional LiuYao feature boundary drift');

const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
const runtimeSource = requiredModules.map((relative) => readBytes(relative).toString('utf8')).join('\n');
for (const term of forbiddenTerms) assert(!runtimeSource.includes(term), `traditional feature leaked into calibration runtime: ${term}`);

console.log('Fallback Identity v0.1 calibration runtime lock verified.');
console.log(`- modules pinned: ${requiredModules.length}`);
console.log(`- Routeability threshold: ${thresholdSource.threshold}`);
console.log(`- Scope hard-veto cutoff: ${frozen.semanticStackPolicy.hardVetoCutoff}`);
console.log('- Fallback Identity candidates: Router Top1 + Top2 only');
console.log('- calibration: one global threshold only');
