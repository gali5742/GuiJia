import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, 'data', relative), 'utf8'));
const fail = (message) => { throw new Error(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');
const sameSet = (left, right) => JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort());

const inventory = readJson('liuyao-semantic-route-inventory-v0.2.json');
const expansion = readJson('liuyao-semantic-route-training-v0.4-expansion.json');
const base = readJson('liuyao-semantic-route-training-v0.1.json');
const augmentation = readJson('liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = readJson('liuyao-semantic-route-training-v0.3-targeted.json');
const development = readJson('liuyao-semantic-route-eval-v0.1.json');
const blind = readJson('liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = readJson('liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');

if (expansion.version !== '0.4-expansion' || expansion.status !== 'development') fail('Expansion corpus metadata mismatch');
if (expansion.inventory !== 'liuyao-semantic-route-inventory-v0.2.json') fail('Expansion corpus inventory reference mismatch');
const expectedBase = [
  'liuyao-semantic-route-training-v0.1.json',
  'liuyao-semantic-route-training-v0.2-augmentation.json',
  'liuyao-semantic-route-training-v0.3-targeted.json'
];
if (!sameSet(expansion.base || [], expectedBase)) fail('Expansion corpus base list mismatch');

const inventoryRouteIds = inventory.routes.map((row) => row.routeId);
const expectedNewRoutes = inventory.routes.filter((row) => !row.currentV01Route).map((row) => row.routeId);
const expansionRouteIds = Object.keys(expansion.routes || {});
if (!sameSet(expansion.newRouteIds || [], expectedNewRoutes)) fail('Expansion newRouteIds do not match v0.2 inventory');
if (!sameSet(expansionRouteIds, expectedNewRoutes)) fail('Expansion route blocks do not exactly match v0.2 new routes');
if (expansionRouteIds.length !== 7) fail(`Expected 7 expansion routes, got ${expansionRouteIds.length}`);

const seenExpansion = new Map();
const rememberExpansion = (text, bucket) => {
  if (typeof text !== 'string' || !text.trim()) fail(`Empty/non-string sample in ${bucket}`);
  const key = normalize(text);
  if (!key) fail(`Empty normalized sample in ${bucket}`);
  if (seenExpansion.has(key)) fail(`Duplicate expansion sample “${text}” in ${bucket} and ${seenExpansion.get(key)}`);
  seenExpansion.set(key, bucket);
};

let trainPositive = 0;
let validationPositive = 0;
for (const routeId of expectedNewRoutes) {
  const row = expansion.routes?.[routeId];
  if (!row) fail(`Missing expansion route ${routeId}`);
  if (!Array.isArray(row.train) || row.train.length !== 25) fail(`${routeId} expansion train must contain exactly 25 positives`);
  if (!Array.isArray(row.validation) || row.validation.length !== 8) fail(`${routeId} expansion validation must contain exactly 8 positives`);
  for (const text of row.train) { rememberExpansion(text, `expansion-train:${routeId}`); trainPositive += 1; }
  for (const text of row.validation) { rememberExpansion(text, `expansion-validation:${routeId}`); validationPositive += 1; }
}
if (trainPositive !== 175 || validationPositive !== 56) fail(`Expansion positive count mismatch: train=${trainPositive} validation=${validationPositive}`);

const validateNegative = (sample, bucket) => {
  if (!sample || typeof sample !== 'object') fail(`Invalid hard negative in ${bucket}`);
  rememberExpansion(sample.text, bucket);
  if (!Array.isArray(sample.targets) || !sample.targets.length) fail(`Hard negative missing targets: ${sample.text}`);
  for (const target of sample.targets) {
    if (!inventoryRouteIds.includes(target)) fail(`Unknown hard-negative target ${target}: ${sample.text}`);
  }
};
const trainNegatives = expansion.hardNegatives?.train || [];
const validationNegatives = expansion.hardNegatives?.validation || [];
if (trainNegatives.length !== 35) fail(`Expansion train hard negatives must contain exactly 35 rows, got ${trainNegatives.length}`);
if (validationNegatives.length !== 14) fail(`Expansion validation hard negatives must contain exactly 14 rows, got ${validationNegatives.length}`);
for (const sample of trainNegatives) validateNegative(sample, 'expansion-train:hard-negative');
for (const sample of validationNegatives) validateNegative(sample, 'expansion-validation:hard-negative');
for (const routeId of expectedNewRoutes) {
  const targetedCount = [...trainNegatives, ...validationNegatives].filter((sample) => sample.targets.includes(routeId)).length;
  if (targetedCount < 5) fail(`${routeId} needs at least 5 targeted hard negatives across train/validation, got ${targetedCount}`);
}

const legacySeen = new Map();
const rememberLegacy = (text, bucket) => {
  const key = normalize(text);
  if (!key) return;
  if (!legacySeen.has(key)) legacySeen.set(key, bucket);
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
collectRoutes(targeted, 'targeted');
for (const [label, texts] of Object.entries(development.samples || {})) {
  for (const text of texts || []) rememberLegacy(text, `development:${label}`);
}
const replacements = blindPatch.replacements || {};
for (const [label, texts] of Object.entries(blind.samples || {})) {
  for (const raw of texts || []) rememberLegacy(replacements[raw] || raw, `sealed-blind:${label}`);
}

for (const [key, bucket] of seenExpansion.entries()) {
  if (legacySeen.has(key)) fail(`Expansion sample leaks/duplicates legacy corpus: ${bucket} overlaps ${legacySeen.get(key)} => “${key}”`);
}

const forbiddenTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神'];
for (const [key, bucket] of seenExpansion.entries()) {
  for (const term of forbiddenTerms) {
    if (key.includes(term)) fail(`Traditional LiuYao mapping leaked into modern semantic corpus: ${bucket} contains ${term}`);
  }
}

console.log('LiuYao Semantic Router v0.4 expansion corpus verification passed');
console.log(`- ${expectedNewRoutes.length} new routes`);
console.log(`- ${trainPositive} train positives / ${validationPositive} validation positives`);
console.log(`- ${trainNegatives.length} train hard negatives / ${validationNegatives.length} validation hard negatives`);
console.log('- zero exact overlap with legacy train/validation/development/sealed Blind corpora');
