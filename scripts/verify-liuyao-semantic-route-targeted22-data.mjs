import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8'));
const fail = (message) => { throw new Error(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const inventory = readJson('liuyao-semantic-route-inventory-v0.2.json');
const targeted22 = readJson('liuyao-semantic-route-training-v0.5-targeted-22.json');
const base = readJson('liuyao-semantic-route-training-v0.1.json');
const augmentation = readJson('liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = readJson('liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = readJson('liuyao-semantic-route-training-v0.4-expansion.json');
const development = readJson('liuyao-semantic-route-eval-v0.1.json');
const blind = readJson('liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = readJson('liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');

if (targeted22.version !== '0.5-targeted-22' || targeted22.status !== 'development') fail('Targeted-22 corpus metadata mismatch');
const expectedBase = [
  'liuyao-semantic-route-training-v0.1.json',
  'liuyao-semantic-route-training-v0.2-augmentation.json',
  'liuyao-semantic-route-training-v0.3-targeted.json',
  'liuyao-semantic-route-training-v0.4-expansion.json',
  'liuyao-semantic-route-training-v0.4-expansion-label-patch.json'
];
if (JSON.stringify([...(targeted22.base || [])].sort()) !== JSON.stringify([...expectedBase].sort())) fail('Targeted-22 base list mismatch');

const inventoryRouteIds = new Set((inventory.routes || []).map((row) => row.routeId));
const expectedRoutes = new Map([
  ['business_operation', [6, 3]],
  ['commercial_transaction', [6, 3]],
  ['partnership', [6, 3]],
  ['investment_liquidation', [8, 4]],
  ['investment_position_decision', [6, 3]],
  ['relationship_development', [8, 4]],
  ['marriage_match', [6, 3]]
]);
const actualRoutes = Object.keys(targeted22.routes || {});
if (actualRoutes.length !== expectedRoutes.size || actualRoutes.some((id) => !expectedRoutes.has(id))) fail(`Unexpected targeted-22 route set: ${actualRoutes.join(', ')}`);

const seen = new Map();
const remember = (text, bucket) => {
  if (typeof text !== 'string' || !text.trim()) fail(`Empty/non-string sample in ${bucket}`);
  const key = normalize(text);
  if (seen.has(key)) fail(`Duplicate targeted-22 sample “${text}” in ${bucket} and ${seen.get(key)}`);
  seen.set(key, bucket);
};
let trainPositive = 0;
let validationPositive = 0;
for (const [routeId, [expectedTrain, expectedValidation]] of expectedRoutes) {
  if (!inventoryRouteIds.has(routeId)) fail(`Targeted route not in inventory: ${routeId}`);
  const row = targeted22.routes?.[routeId];
  if (!row) fail(`Missing targeted route: ${routeId}`);
  if (!Array.isArray(row.train) || row.train.length !== expectedTrain) fail(`${routeId} train must contain ${expectedTrain} rows`);
  if (!Array.isArray(row.validation) || row.validation.length !== expectedValidation) fail(`${routeId} validation must contain ${expectedValidation} rows`);
  for (const text of row.train) { remember(text, `targeted22-train:${routeId}`); trainPositive += 1; }
  for (const text of row.validation) { remember(text, `targeted22-validation:${routeId}`); validationPositive += 1; }
}
if (trainPositive !== 46 || validationPositive !== 23) fail(`Targeted-22 positive totals mismatch: train=${trainPositive}, validation=${validationPositive}`);

const validateNegative = (sample, bucket) => {
  if (!sample || typeof sample !== 'object') fail(`Invalid hard negative in ${bucket}`);
  remember(sample.text, bucket);
  if (!Array.isArray(sample.targets) || !sample.targets.length) fail(`Hard negative missing targets: ${sample.text}`);
  for (const target of sample.targets) if (!inventoryRouteIds.has(target)) fail(`Unknown hard-negative target ${target}: ${sample.text}`);
};
const trainNegatives = targeted22.hardNegatives?.train || [];
const validationNegatives = targeted22.hardNegatives?.validation || [];
if (trainNegatives.length !== 18) fail(`Targeted-22 train hard negatives must contain 18 rows, got ${trainNegatives.length}`);
if (validationNegatives.length !== 6) fail(`Targeted-22 validation hard negatives must contain 6 rows, got ${validationNegatives.length}`);
for (const sample of trainNegatives) validateNegative(sample, 'targeted22-train:hard-negative');
for (const sample of validationNegatives) validateNegative(sample, 'targeted22-validation:hard-negative');

for (const routeId of ['relationship_development', 'inventory_sale', 'commercial_transaction', 'investment_liquidation', 'investment_position_decision']) {
  const targetedCount = [...trainNegatives, ...validationNegatives].filter((sample) => sample.targets.includes(routeId)).length;
  if (targetedCount < 6) fail(`${routeId} requires at least 6 targeted genuine negatives, got ${targetedCount}`);
}

const legacySeen = new Map();
const rememberLegacy = (text, bucket) => {
  const key = normalize(text);
  if (key && !legacySeen.has(key)) legacySeen.set(key, bucket);
};
const collectRoutes = (data, prefix) => {
  for (const [routeId, row] of Object.entries(data.routes || {})) {
    for (const text of row.train || []) rememberLegacy(text, `${prefix}-train:${routeId}`);
    for (const text of row.validation || []) rememberLegacy(text, `${prefix}-validation:${routeId}`);
  }
  for (const sample of data.hardNegatives?.train || []) rememberLegacy(sample.text, `${prefix}-train:hard-negative`);
  for (const sample of data.hardNegatives?.validation || []) rememberLegacy(sample.text, `${prefix}-validation:hard-negative`);
};
collectRoutes(base, 'base');
collectRoutes(augmentation, 'augmentation');
collectRoutes(targeted, 'targeted-v03');
collectRoutes(expansion, 'expansion-v04');
for (const [label, texts] of Object.entries(development.samples || {})) for (const text of texts || []) rememberLegacy(text, `development:${label}`);
const replacements = blindPatch.replacements || {};
for (const [label, texts] of Object.entries(blind.samples || {})) for (const raw of texts || []) rememberLegacy(replacements[raw] || raw, `sealed-blind:${label}`);

for (const [key, bucket] of seen) {
  if (legacySeen.has(key)) fail(`Targeted-22 sample overlaps earlier corpus: ${bucket} overlaps ${legacySeen.get(key)} => “${key}”`);
}

const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
for (const [key, bucket] of seen) for (const term of forbiddenTerms) if (key.includes(term)) fail(`Traditional LiuYao mapping leaked into modern semantic corpus: ${bucket} contains ${term}`);

console.log('LiuYao Semantic Router v0.5 targeted-22 corpus verification passed');
console.log(`- ${expectedRoutes.size} targeted routes`);
console.log(`- ${trainPositive} train positives / ${validationPositive} validation positives`);
console.log(`- ${trainNegatives.length} train genuine negatives / ${validationNegatives.length} validation genuine negatives`);
console.log('- zero exact overlap with earlier train/validation/development/sealed Blind corpora');
