import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const weightsPath = path.join(root, 'data', 'semantic-router-weights-v0.1.json');
const fail = (message) => { throw new Error(message); };
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

if (!fs.existsSync(weightsPath)) fail('Missing data/semantic-router-weights-v0.1.json');
const artifact = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
if (artifact.version !== '0.1' || artifact.status !== 'frozen') fail('Semantic router weights must be frozen v0.1.');
if (artifact.architecture !== 'bge-multinomial-route-route-conditioned-logistic') fail(`Unexpected architecture: ${artifact.architecture}`);
if (artifact.encoder?.modelId !== 'Xenova/bge-small-zh-v1.5') fail('Unexpected encoder model.');
if (artifact.encoder?.dtype !== 'q8' || artifact.encoder?.vectorSize !== 512) fail('Unexpected encoder dtype/vector size.');
if (artifact.encoder?.pooling !== 'mean' || artifact.encoder?.normalize !== true) fail('Unexpected encoder pooling/normalization.');

const routeIds = artifact.routeIds || [];
if (routeIds.length !== 15 || new Set(routeIds).size !== 15) fail(`Expected 15 unique route IDs, got ${routeIds.length}.`);
const routeWeights = artifact.routeHead?.weights || [];
const routeBiases = artifact.routeHead?.biases || [];
if (routeWeights.length !== routeIds.length || routeBiases.length !== routeIds.length) fail('Route head dimensions do not match route IDs.');

const finiteArray = (values, expected, label) => {
  if (!Array.isArray(values) || values.length !== expected) fail(`${label} must contain ${expected} values.`);
  if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) fail(`${label} contains non-finite values.`);
};
for (let i = 0; i < routeWeights.length; i += 1) finiteArray(routeWeights[i], 512, `routeHead.weights[${i}]`);
finiteArray(routeBiases, routeIds.length, 'routeHead.biases');

for (const routeId of routeIds) {
  const gate = artifact.gates?.[routeId];
  if (!gate) fail(`Missing gate for ${routeId}.`);
  finiteArray(gate.weights, 512, `gates.${routeId}.weights`);
  if (!Number.isFinite(gate.bias) || !Number.isFinite(gate.positiveScale)) fail(`Invalid gate scalar for ${routeId}.`);
  if (!Number.isFinite(gate.threshold) || gate.threshold < 0 || gate.threshold > 1) fail(`Invalid threshold for ${routeId}: ${gate.threshold}`);
  for (const key of ['recall','falsePositiveRate','precision']) {
    const value = gate.calibration?.[key];
    if (!Number.isFinite(value) || value < 0 || value > 1) fail(`Invalid ${key} calibration for ${routeId}.`);
  }
}

const expectedCounts = { trainPositiveCount:423, trainOtherCount:121, validationPositiveCount:152, validationOtherCount:50 };
for (const [key, expected] of Object.entries(expectedCounts)) {
  if (artifact.training?.[key] !== expected) fail(`${key} must be ${expected}, got ${artifact.training?.[key]}.`);
}

for (const relative of artifact.training?.sourceFiles || []) {
  const sourcePath = path.join(root, relative);
  if (!fs.existsSync(sourcePath)) fail(`Missing training source ${relative}`);
  const actual = sha256(fs.readFileSync(sourcePath));
  const expected = artifact.training?.sourceHashes?.[relative];
  if (actual !== expected) fail(`Training source hash drift: ${relative}`);
}

console.log('Frozen semantic router weights verification passed.');
console.log(`- ${routeIds.length} routes`);
console.log('- 512-d route head and 15 route-conditioned gates');
console.log(`- train ${artifact.training.trainPositiveCount}+${artifact.training.trainOtherCount}; validation ${artifact.training.validationPositiveCount}+${artifact.training.validationOtherCount}`);
