import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainBasePath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.1.json');
const trainAugPath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.2-augmentation.json');
const trainTargetedPath = path.join(root, 'data', 'liuyao-semantic-route-training-v0.3-targeted.json');
const evalPath = path.join(root, 'data', 'liuyao-semantic-route-eval-v0.1.json');
const blindPath = path.join(root, 'data', 'liuyao-semantic-route-blind-eval-v0.2.json');

const fail = (message) => { throw new Error(message); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const base = readJson(trainBasePath);
const augmentation = readJson(trainAugPath);
const targeted = readJson(trainTargetedPath);
const evaluation = readJson(evalPath);
const blind = readJson(blindPath);

if (base.version !== '0.1') fail(`Unexpected base training version: ${base.version}`);
if (augmentation.version !== '0.2') fail(`Unexpected augmentation version: ${augmentation.version}`);
if (augmentation.base !== path.basename(trainBasePath)) fail(`Augmentation base mismatch: ${augmentation.base}`);
if (targeted.version !== '0.3-targeted') fail(`Unexpected targeted refinement version: ${targeted.version}`);
if (!Array.isArray(targeted.base) || !targeted.base.includes(path.basename(trainBasePath)) || !targeted.base.includes(path.basename(trainAugPath))) fail('Targeted refinement base list mismatch.');
if (evaluation.version !== '0.1' || evaluation.status !== 'frozen') fail('Development benchmark v0.1 file must remain content-frozen.');
if (blind.version !== '0.2' || blind.status !== 'sealed') fail('Blind Eval v0.2 must remain sealed.');

const routeIds = Object.keys(base.routes || {});
const augmentationIds = Object.keys(augmentation.routes || {});
const evalIds = Object.keys(evaluation.samples || {}).filter((id) => id !== '__other__');
const blindIds = Object.keys(blind.samples || {}).filter((id) => !id.startsWith('__'));
const targetedIds = Object.keys(targeted.routes || {});
const expectedTargetedIds = [
  'financial_fortune','income_salary','business_operation','investment_profit',
  'borrow_money','relationship_development','marital_relationship','marriage_match'
];
if (routeIds.length !== 15) fail(`Expected 15 supervised routes, got ${routeIds.length}.`);
if (routeIds.join('|') !== augmentationIds.join('|')) fail('Base and augmentation route order/IDs differ.');
if (routeIds.join('|') !== evalIds.join('|')) fail('Training and development benchmark route order/IDs differ.');
if (routeIds.join('|') !== blindIds.join('|')) fail('Training and Blind Eval route order/IDs differ.');
if (targetedIds.join('|') !== expectedTargetedIds.join('|')) fail(`Unexpected targeted route IDs/order: ${targetedIds.join('|')}`);

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
let targetedTrainPositive = 0;
let targetedValidationPositive = 0;
for (const routeId of routeIds) {
  const baseRoute = base.routes[routeId];
  const augRoute = augmentation.routes[routeId];
  const targetedRoute = targeted.routes?.[routeId];
  if (!Array.isArray(baseRoute.train) || baseRoute.train.length !== 12) fail(`${routeId} base train must stay at 12 positives.`);
  if (!Array.isArray(baseRoute.validation) || baseRoute.validation.length !== 3) fail(`${routeId} base validation must stay at 3 positives.`);
  if (!Array.isArray(augRoute.train) || augRoute.train.length !== 13) fail(`${routeId} augmentation must add exactly 13 train positives.`);
  if (!Array.isArray(augRoute.validation) || augRoute.validation.length !== 5) fail(`${routeId} augmentation must add exactly 5 validation positives.`);

  for (const text of baseRoute.train) { remember(text, `base-train:${routeId}`); trainPositive += 1; }
  for (const text of augRoute.train) { remember(text, `aug-train:${routeId}`); trainPositive += 1; }
  for (const text of baseRoute.validation) { remember(text, `base-validation:${routeId}`); validationPositive += 1; }
  for (const text of augRoute.validation) { remember(text, `aug-validation:${routeId}`); validationPositive += 1; }

  if (targetedRoute) {
    if (!Array.isArray(targetedRoute.train) || targetedRoute.train.length !== 6) fail(`${routeId} targeted refinement must add exactly 6 train positives.`);
    if (!Array.isArray(targetedRoute.validation) || targetedRoute.validation.length !== 4) fail(`${routeId} targeted refinement must add exactly 4 validation positives.`);
    for (const text of targetedRoute.train) { remember(text, `targeted-train:${routeId}`); trainPositive += 1; targetedTrainPositive += 1; }
    for (const text of targetedRoute.validation) { remember(text, `targeted-validation:${routeId}`); validationPositive += 1; targetedValidationPositive += 1; }
  }
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
const targetedTrainNegatives = targeted.hardNegatives?.train || [];
const targetedValidationNegatives = targeted.hardNegatives?.validation || [];
for (const sample of baseTrainNegatives) validateNegative(sample, 'base-train:hard-negative');
for (const sample of augTrainNegatives) validateNegative(sample, 'aug-train:hard-negative');
for (const sample of targetedTrainNegatives) validateNegative(sample, 'targeted-train:hard-negative');
for (const sample of baseValidationNegatives) validateNegative(sample, 'base-validation:hard-negative');
for (const sample of augValidationNegatives) validateNegative(sample, 'aug-validation:hard-negative');
for (const sample of targetedValidationNegatives) validateNegative(sample, 'targeted-validation:hard-negative');

if (targetedTrainNegatives.length !== 0 || targetedValidationNegatives.length !== 0) fail('PoC v0.6 targeted refinement must not alter hard negatives.');
if (targetedTrainPositive !== 48) fail(`PoC v0.6 must add exactly 48 targeted train positives, got ${targetedTrainPositive}.`);
if (targetedValidationPositive !== 32) fail(`PoC v0.6 must add exactly 32 targeted validation positives, got ${targetedValidationPositive}.`);
if (trainPositive !== 423) fail(`PoC v0.6 requires exactly 423 train positives, got ${trainPositive}.`);
if (validationPositive !== 152) fail(`PoC v0.6 requires exactly 152 validation positives, got ${validationPositive}.`);
if (baseTrainNegatives.length + augTrainNegatives.length !== 121) fail('PoC v0.6 must retain exactly 121 train hard negatives from v0.5.');
if (baseValidationNegatives.length + augValidationNegatives.length !== 50) fail('PoC v0.6 must retain exactly 50 validation hard negatives from v0.5.');

let evalCount = 0;
for (const [label, texts] of Object.entries(evaluation.samples || {})) {
  if (!Array.isArray(texts) || texts.length === 0) fail(`Benchmark label ${label} has no samples.`);
  for (const text of texts) { remember(text, `development-benchmark:${label}`); evalCount += 1; }
}
if (evalCount !== 125) fail(`Development benchmark must contain exactly 125 samples, got ${evalCount}.`);
if ((evaluation.samples.__other__ || []).length !== 16) fail('Development benchmark must retain 16 __other__ samples.');

let blindKnownCount = 0;
for (const routeId of routeIds) {
  const texts = blind.samples?.[routeId];
  if (!Array.isArray(texts) || texts.length !== 12) fail(`Blind Eval ${routeId} must contain exactly 12 known samples.`);
  for (const text of texts) { remember(text, `blind-known:${routeId}`); blindKnownCount += 1; }
}
const blindOut = blind.samples?.__out_of_scope__ || [];
const blindUnder = blind.samples?.__underspecified__ || [];
if (!Array.isArray(blindOut) || blindOut.length !== 121) fail(`Blind Eval must contain exactly 121 out_of_scope samples, got ${blindOut.length}.`);
if (!Array.isArray(blindUnder) || blindUnder.length !== 60) fail(`Blind Eval must contain exactly 60 underspecified samples, got ${blindUnder.length}.`);
for (const text of blindOut) remember(text, 'blind:out_of_scope');
for (const text of blindUnder) remember(text, 'blind:underspecified');
const blindCount = blindKnownCount + blindOut.length + blindUnder.length;
if (blindKnownCount !== 180 || blindCount !== 361) fail(`Blind Eval count mismatch: known=${blindKnownCount}, total=${blindCount}.`);

console.log('Semantic route data verification passed (architecture frozen + sealed Blind Eval v0.2).');
console.log(`- ${routeIds.length} supervised routes`);
console.log(`- ${trainPositive} train positives (${targetedTrainPositive} targeted additions)`);
console.log(`- ${validationPositive} validation positives (${targetedValidationPositive} targeted additions)`);
console.log(`- ${baseTrainNegatives.length + augTrainNegatives.length} train hard negatives unchanged from v0.5`);
console.log(`- ${baseValidationNegatives.length + augValidationNegatives.length} validation hard negatives unchanged from v0.5`);
console.log(`- ${evalCount} development benchmark samples`);
console.log(`- ${blindCount} sealed Blind Eval v0.2 samples (${blindKnownCount} known / ${blindOut.length} out_of_scope / ${blindUnder.length} underspecified)`);
console.log('- zero exact overlap across train, validation, development benchmark, and Blind Eval');
