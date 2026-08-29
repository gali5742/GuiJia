import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainPath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.1.json');
const evalPath = path.join(root, 'data', 'liuyao-semantic-route-eval-v0.1.json');

const fail = (message) => { throw new Error(message); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const training = readJson(trainPath);
const evaluation = readJson(evalPath);

if (training.version !== '0.1') fail(`Unexpected training version: ${training.version}`);
if (evaluation.version !== '0.1' || evaluation.status !== 'frozen') fail('Eval v0.1 must remain frozen.');

const routeIds = Object.keys(training.routes || {});
const evalIds = Object.keys(evaluation.samples || {}).filter((id) => id !== '__other__');
if (routeIds.length !== 15) fail(`Expected 15 supervised routes, got ${routeIds.length}.`);
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
  const route = training.routes[routeId];
  if (!Array.isArray(route.train) || route.train.length < 10) fail(`${routeId} needs at least 10 train positives.`);
  if (!Array.isArray(route.validation) || route.validation.length < 3) fail(`${routeId} needs at least 3 validation positives.`);
  for (const text of route.train) { remember(text, `train:${routeId}`); trainPositive += 1; }
  for (const text of route.validation) { remember(text, `validation:${routeId}`); validationPositive += 1; }
}

const validateNegative = (sample, bucket) => {
  if (!sample || typeof sample !== 'object') fail(`Invalid hard negative in ${bucket}.`);
  remember(sample.text, bucket);
  if (!Array.isArray(sample.targets) || sample.targets.length === 0) fail(`Hard negative missing targets: ${sample.text}`);
  for (const target of sample.targets) {
    if (target !== '*' && !routeIds.includes(target)) fail(`Unknown hard-negative target ${target}: ${sample.text}`);
  }
};

for (const sample of training.hardNegatives?.train || []) validateNegative(sample, 'train:hard-negative');
for (const sample of training.hardNegatives?.validation || []) validateNegative(sample, 'validation:hard-negative');

let evalCount = 0;
for (const [label, texts] of Object.entries(evaluation.samples || {})) {
  if (!Array.isArray(texts) || texts.length === 0) fail(`Eval label ${label} has no samples.`);
  for (const text of texts) { remember(text, `eval:${label}`); evalCount += 1; }
}
if (evalCount !== 125) fail(`Frozen Eval must contain exactly 125 samples, got ${evalCount}.`);
if ((evaluation.samples.__other__ || []).length !== 16) fail('Frozen Eval must retain 16 __other__ samples.');

console.log('Semantic route data verification passed.');
console.log(`- ${routeIds.length} supervised routes`);
console.log(`- ${trainPositive} train positives`);
console.log(`- ${validationPositive} validation positives`);
console.log(`- ${(training.hardNegatives?.train || []).length} train hard negatives`);
console.log(`- ${(training.hardNegatives?.validation || []).length} validation hard negatives`);
console.log(`- ${evalCount} frozen Eval samples; zero exact overlap`);
