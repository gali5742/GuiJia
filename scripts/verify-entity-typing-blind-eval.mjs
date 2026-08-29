import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trainingPath = path.join(root, 'data', 'liuyao-entity-typing-training-v0.1.json');
const blindPath = path.join(root, 'data', 'liuyao-entity-typing-blind-eval-v0.1.json');
const semanticBlindPath = path.join(root, 'data', 'liuyao-semantic-route-blind-eval-v0.2.json');

const training = JSON.parse(fs.readFileSync(trainingPath, 'utf8'));
const blind = JSON.parse(fs.readFileSync(blindPath, 'utf8'));
const semanticBlind = JSON.parse(fs.readFileSync(semanticBlindPath, 'utf8'));
const labels = ['investment_asset','purchasable_item','delivery_subject','unknown'];
const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const fail = (message) => { throw new Error(message); };

const flattenStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(normalize(value));
  else if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, out));
  return out;
};

if (blind.version !== '0.1') fail(`unexpected blind version: ${blind.version}`);
if (blind.sealed !== true) fail('entity typing blind eval must be sealed=true');
const actualLabels = Object.keys(blind.labels || {}).sort();
if (JSON.stringify(actualLabels) !== JSON.stringify([...labels].sort())) fail(`blind labels mismatch: ${actualLabels.join(', ')}`);

const trainingContexts = new Set();
for (const label of labels) {
  const group = training.labels?.[label];
  if (!group) fail(`missing training label ${label}`);
  for (const split of ['train','validation']) {
    for (const sample of group[split] || []) trainingContexts.add(normalize(sample.context));
  }
}

const semanticBlindStrings = new Set(flattenStrings(semanticBlind));
const seenContexts = new Map();
let total = 0;
for (const label of labels) {
  const rows = blind.labels[label];
  if (!Array.isArray(rows)) fail(`blind ${label} must be an array`);
  if (rows.length !== 40) fail(`blind ${label} must contain 40 samples, got ${rows.length}`);
  for (const sample of rows) {
    if (!sample || typeof sample.entity !== 'string' || typeof sample.context !== 'string') fail(`${label} contains malformed sample`);
    const entity = normalize(sample.entity);
    const context = normalize(sample.context);
    if (!entity || !context) fail(`${label} contains empty entity/context`);
    if (seenContexts.has(context)) fail(`duplicate blind context: ${context} (${seenContexts.get(context)} vs ${label})`);
    seenContexts.set(context, label);
    if (trainingContexts.has(context)) fail(`blind context overlaps entity typing train/validation: ${context}`);
    if (semanticBlindStrings.has(context)) fail(`blind context overlaps sealed semantic router Blind Eval v0.2: ${context}`);
    total += 1;
  }
}

if (total !== 160) fail(`blind total must be 160, got ${total}`);

console.log('Entity typing sealed Blind Eval verification passed');
console.log(`- total: ${total}`);
console.log('- per label: 40');
console.log('- train/validation exact context overlaps: 0');
console.log('- semantic router Blind Eval exact context overlaps: 0');
