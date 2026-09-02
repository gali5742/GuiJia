import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(readBytes(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(readBytes(relative)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const artifactPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const lockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const harnessPath = 'scripts/run-liuyao-semantic-frozen-dependencies-v02-node.mjs';
const generatorPath = 'scripts/generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs';
const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
const harness = artifact.correction?.nodeExecutionHarness;
const instrumentation = artifact.correction?.generatorInstrumentation;

assert(harness?.path === harnessPath, 'corrected dependency Node harness path drift');
assert(harness?.sha256 === sha256(harnessPath), 'corrected dependency Node harness SHA drift');
assert(harness?.mode === 'file_url_read_only_fetch_plus_node_cache_compatibility', 'corrected dependency Node harness mode drift');
assert(harness?.networkFetchBehaviorChanged === false, 'Node harness must not alter network fetch behavior');
assert(harness?.localFileContentTransformed === false, 'Node harness must not transform local training/calibration content');
assert(harness?.browserCacheSettingChangedForNodeOnly === true && harness?.browserCacheSettingFrom === true && harness?.browserCacheSettingTo === false, 'Node browser-cache compatibility provenance drift');
assert(artifact.correction?.underlyingGenerator?.path === generatorPath, 'underlying generator provenance missing');
assert(artifact.correction.underlyingGenerator.sha256 === sha256(generatorPath), 'underlying generator SHA drift');
assert(instrumentation?.baseGeneratorSha256 === sha256(generatorPath), 'generator instrumentation base SHA drift');
assert(instrumentation?.temporaryOnly === true, 'generator instrumentation must be temporary only');
assert(instrumentation?.modelOrDataLogicChanged === false, 'generator instrumentation must not alter model/data logic');
assert(Array.isArray(instrumentation?.permittedChanges) && instrumentation.permittedChanges.length === 1 && instrumentation.permittedChanges[0] === 'env.useBrowserCache_true_to_false_in_temporary_router_and_scope_modules', 'generator instrumentation permission drift');
assert(lock.nodeExecutionHarnessSha256 === sha256(harnessPath), 'corrected dependency lock Node harness SHA drift');
assert(lock.artifactSha256 === sha256(artifactPath), 'corrected dependency lock was not recomputed after harness provenance');

console.log('Corrected dependency Node execution harness verified.');
console.log(`- harness SHA-256: ${harness.sha256}`);
console.log('- local file mode: read-only file URL compatibility; no content transformation');
console.log('- browser cache: disabled only in temporary Node Router/Scope modules');
