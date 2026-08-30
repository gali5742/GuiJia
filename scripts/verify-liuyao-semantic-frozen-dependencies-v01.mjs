import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = 'data/liuyao-semantic-frozen-dependencies-v0.1.json';
const lockPath = 'data/liuyao-semantic-frozen-dependencies-v0.1.lock.json';
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const serialized = read(artifactPath);
const artifact = JSON.parse(serialized);
const lock = JSON.parse(read(lockPath));
const loader = read('js/liuyao-semantic-frozen-dependencies-v01.js');

assert(artifact.version === '0.1' && artifact.status === 'frozen', 'frozen artifact version/status mismatch');
assert(artifact.scope === 'liuyao_semantic_v013_dependencies', 'frozen artifact scope mismatch');
assert(artifact.contract?.historicalImplementationsModified === false, 'historical implementation mutation must remain false');
assert(artifact.contract?.runtimePolicy === 'load_frozen_only', 'runtime policy must be load_frozen_only');
assert(artifact.encoder?.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model id mismatch');
assert(artifact.encoder?.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision mismatch');
assert(artifact.encoder?.transformersJsVersion === '4.2.0', 'Transformers.js version mismatch');
assert(artifact.encoder?.dtype === 'q8' && artifact.encoder?.vectorSize === 512, 'encoder dtype/vector mismatch');
assert(artifact.encoder?.pooling === 'mean' && artifact.encoder?.normalize === true, 'encoder pooling/normalize mismatch');
assert(artifact.router?.version === '0.8.1', 'router frozen version mismatch');
assert(artifact.router?.routeOrder?.length === 22, `frozen route count ${artifact.router?.routeOrder?.length} != 22`);
assert(new Set(artifact.router.routeOrder).size === 22, 'frozen route order contains duplicates');
assert(artifact.router?.routeHead?.weights?.length === 22, 'frozen router row count mismatch');
assert(artifact.router.routeHead.weights.every((row) => row.length === 512 && row.every(Number.isFinite)), 'frozen router weight shape/value mismatch');
assert(artifact.router.routeHead.biases?.length === 22 && artifact.router.routeHead.biases.every(Number.isFinite), 'frozen router bias mismatch');
assert(artifact.scopeGate?.version === '0.1-dev', 'scope frozen version mismatch');
assert(artifact.scopeGate?.gate?.weights?.length === 512 && artifact.scopeGate.gate.weights.every(Number.isFinite), 'scope frozen weights mismatch');
assert(Number.isFinite(artifact.scopeGate?.gate?.bias) && Number.isFinite(artifact.scopeGate?.originalThreshold), 'scope frozen bias/threshold mismatch');
assert(artifact.semanticStackPolicy?.hardVetoCutoff === 0.4196, 'hard veto cutoff must remain exactly 0.4196');

for (const record of [artifact.router.source, ...(artifact.router.trainingSources || []), artifact.scopeGate.source, ...(artifact.scopeGate.trainingSources || []), artifact.generator.script]) {
  assert(record?.path && /^[0-9a-f]{64}$/.test(record.sha256 || ''), `invalid source hash record: ${record?.path}`);
  assert(sha256Text(read(record.path)) === record.sha256, `frozen source drift: ${record.path}`);
}

assert(lock.version === '0.1' && lock.status === 'locked', 'frozen lock contract mismatch');
assert(lock.artifact === artifactPath, 'frozen lock artifact path mismatch');
assert(lock.artifactSha256 === sha256Text(serialized), 'frozen artifact SHA-256 mismatch');
assert(lock.encoderRevision === artifact.encoder.revision, 'lock encoder revision mismatch');
assert(lock.hardVetoCutoff === 0.4196, 'lock hard-veto mismatch');

for (const forbidden of ['router.train(', 'scopeGate.train(', 'calibrateScope(', '.train()']) {
  assert(!loader.includes(forbidden), `frozen runtime loader must not perform training/calibration: ${forbidden}`);
}
assert(loader.includes('revision:frozen.encoder.revision'), 'frozen runtime loader must pin encoder revision');
assert(loader.includes('loadFrozenSemanticDependencies'), 'frozen runtime loader missing load API');

console.log('LiuYao Semantic Frozen Dependency Manifest v0.1 verified.');
console.log(`- encoder revision: ${artifact.encoder.revision}`);
console.log(`- router: ${artifact.router.routeOrder.length} routes × ${artifact.router.routeHead.weights[0].length} dims`);
console.log(`- scope gate: ${artifact.scopeGate.gate.weights.length} dims; original threshold=${artifact.scopeGate.originalThreshold}`);
console.log(`- hard veto cutoff: ${artifact.semanticStackPolicy.hardVetoCutoff}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
