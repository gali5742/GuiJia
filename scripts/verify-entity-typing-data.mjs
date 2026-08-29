import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typingPath = path.join(root, 'data', 'liuyao-entity-typing-training-v0.1.json');
const blindPath = path.join(root, 'data', 'liuyao-semantic-route-blind-eval-v0.2.json');

const typing = JSON.parse(fs.readFileSync(typingPath, 'utf8'));
const blind = JSON.parse(fs.readFileSync(blindPath, 'utf8'));
const expectedLabels = ['investment_asset','purchasable_item','delivery_subject','unknown'];

const fail = (message) => { throw new Error(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, ' ');
const flattenStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(normalize(value));
  else if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, out));
  return out;
};

if (typing.version !== '0.1') fail(`unexpected entity typing version: ${typing.version}`);
const labels = Object.keys(typing.labels || {}).sort();
if (JSON.stringify(labels) !== JSON.stringify([...expectedLabels].sort())) fail(`labels mismatch: ${labels.join(', ')}`);

const seen = new Map();
let trainCount = 0;
let validationCount = 0;
for (const label of expectedLabels) {
  const group = typing.labels[label];
  if (!group || !Array.isArray(group.train) || !Array.isArray(group.validation)) fail(`missing split for ${label}`);
  if (group.train.length !== 24) fail(`${label} train must be 24, got ${group.train.length}`);
  if (group.validation.length !== 8) fail(`${label} validation must be 8, got ${group.validation.length}`);
  for (const split of ['train','validation']) {
    for (const sample of group[split]) {
      if (!sample || typeof sample.entity !== 'string' || typeof sample.context !== 'string') fail(`${label}/${split} malformed sample`);
      const entity = normalize(sample.entity);
      const context = normalize(sample.context);
      if (!entity || !context) fail(`${label}/${split} empty entity/context`);
      if (!context.includes(entity) && !/[A-Za-z]/.test(entity)) fail(`${label}/${split} context should normally contain entity: ${entity} :: ${context}`);
      const key = context;
      if (seen.has(key)) fail(`duplicate context across entity typing data: ${context} (${seen.get(key)} vs ${label}/${split})`);
      seen.set(key, `${label}/${split}`);
      if (split === 'train') trainCount += 1; else validationCount += 1;
    }
  }
}

const blindStrings = new Set(flattenStrings(blind));
const overlaps = [...seen.keys()].filter((text) => blindStrings.has(text));
if (overlaps.length) fail(`entity typing data overlaps sealed Blind Eval v0.2:\n- ${overlaps.join('\n- ')}`);

console.log('Entity typing data verification passed');
console.log(`- train: ${trainCount}`);
console.log(`- validation: ${validationCount}`);
console.log(`- sealed Blind Eval exact overlaps: ${overlaps.length}`);
