import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainBasePath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.1.json');
const trainAugPath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.2-augmentation.json');
const evalPath = path.join(root, 'data', 'liuyao-semantic-route-eval-v0.1.json');

const fail = (message) => { throw new Error(message); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const base = readJson(trainBasePath);
const augmentation = readJson(trainAugPath);
const evaluation = readJson(evalPath);

if (base.version !== '0.1') fail(`Unexpected base training version: ${base.version}`);
if (augmentation.version !== '0.2') fail(`Unexpected augmentation version: ${augmentation.version}`);
if (augmentation.base !== path.basename(trainBasePath)) fail(`Augmentation base mismatch: ${augmentation.base}`);
if (evaluation.version !== '0.1' || evaluation.status !== 'frozen') fail('Eval v0.1 must remain frozen.');

const routeIds = Object.keys(base.routes || {});
const augmentationIds = Object.keys(augmentation.routes || {});
const evalIds = Object.keys(evaluation.samples || {}).filter((id) => id !== '__other__');
if (routeIds.length !== 15) fail(`Expected 15 supervised routes, got ${routeIds.length}.`);
if (routeIds.join('|') !== augmentationIds.join('|')) fail('Base and augmentation route order/IDs differ.');
if (routeIds.join('|') !== evalIds.join('|')) fail('Training and Eval route order/IDs differ.');

const seen = new Map();
const remember = (text, bucket) => {
  if (typeof text !== 'string' || !text.trim()) fail(`Empty/non-string sample in ${bucket}.`);
  const key = normalize(text);
  if (!key) fail(`Empty normalized sample in ${bucket}.`);
  if (seen.has(key)) fail(`Duplicate/leaked sample: “${text}” appears in ${bucket} and ${seen.get(key)}.`);
  seen.set(key, bucket);
};

let trainPositive = 0;
let validationPositive = 0;
for (const routeId of routeIds) {
  const baseRoute = base.routes[routeId];
  const augRoute = augmentation.routes[routeId];
  if (!Array.isArray(baseRoute.train) || baseRoute.train.length !== 12) fail(`${routeId} base train must stay at 12 positives.`);
  if (!Array.isArray(baseRoute.validation) || baseRoute.validation.length !== 3) fail(`${routeId} base validation must stay at 3 positives.`);
  if (!Array.isArray(augRoute.train) || augRoute.train.length !== 13) fail(`${routeId} augmentation must add exactly 13 train positives.`);
  if (!Array.isArray(augRoute.validation) || augRoute.validation.length !== 5) fail(`${routeId} augmentation must add exactly 5 validation positives.`);

  for (const text of baseRoute.train) { remember(text, `base-train:${routeId}`); trainPositive += 1; }
  for (const text of augRoute.train) { remember(text, `aug-train:${routeId}`); trainPositive += 1; }
  for (const text of baseRoute.validation) { remember(text, `base-validation:${routeId}`); validationPositive += 1; }
  for (const text of augRoute.validation) { remember(text, `aug-validation:${routeId}`); validationPositive += 1; }
}

const validateNegative = (sample, bucket) => {
  if (!sample || typeof sample !== 'object') fail(`Invalid hard negative in ${bucket}.`);
  remember(sample.text, bucket);
  if (!Array.isArray(sample.targets) || sample.targets.length === 0) fail(`Hard negative missing targets: ${sample.text}`);
  for (const target of sample.targets) {
    if (target !== '*' && !routeIds.includes(target)) fail(`Unknown hard-negative target ${target}: ${sample.text}`);
  }
};

const baseTrainNegatives = base.hardNegatives?.train || [];
const baseValidationNegatives = base.hardNegatives?.validation || [];
const augTrainNegatives = augmentation.hardNegatives?.train || [];
const augValidationNegatives = augmentation.hardNegatives?.validation || [];
for (const sample of baseTrainNegatives) validateNegative(sample, 'base-train:hard-negative');
for (const sample of augTrainNegatives) validateNegative(sample, 'aug-train:hard-negative');
for (const sample of baseValidationNegatives) validateNegative(sample, 'base-validation:hard-negative');
for (const sample of augValidationNegatives) validateNegative(sample, 'aug-validation:hard-negative');

if (trainPositive !== 375) fail(`PoC v0.4 requires exactly 375 train positives, got ${trainPositive}.`);
if (validationPositive !== 120) fail(`PoC v0.4 requires exactly 120 validation positives, got ${validationPositive}.`);
if (baseTrainNegatives.length + augTrainNegatives.length < 100) fail('PoC v0.4 needs at least 100 train hard negatives.');
if (baseValidationNegatives.length + augValidationNegatives.length < 40) fail('PoC v0.4 needs at least 40 validation hard negatives.');

let evalCount = 0;
for (const [label, texts] of Object.entries(evaluation.samples || {})) {
  if (!Array.isArray(texts) || texts.length === 0) fail(`Eval label ${label} has no samples.`);
  for (const text of texts) { remember(text, `eval:${label}`); evalCount += 1; }
}
if (evalCount !== 125) fail(`Frozen Eval must contain exactly 125 samples, got ${evalCount}.`);
if ((evaluation.samples.__other__ || []).length !== 16) fail('Frozen Eval must retain 16 __other__ samples.');

console.log('Semantic route data verification passed (PoC v0.4).');
console.log(`- ${routeIds.length} supervised routes`);
console.log(`- ${trainPositive} train positives (25/route)`);
console.log(`- ${validationPositive} validation positives (8/route)`);
console.log(`- ${baseTrainNegatives.length + augTrainNegatives.length} train hard negatives`);
console.log(`- ${baseValidationNegatives.length + augValidationNegatives.length} validation hard negatives`);
console.log(`- ${evalCount} frozen Eval samples; zero exact overlap across base/augmentation/validation/Eval`);
