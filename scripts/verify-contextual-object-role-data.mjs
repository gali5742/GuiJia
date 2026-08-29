import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rolePath = path.join(root, 'data', 'liuyao-contextual-object-role-training-v0.2.json');
const oldTypingPath = path.join(root, 'data', 'liuyao-entity-typing-training-v0.1.json');
const oldBlindPath = path.join(root, 'data', 'liuyao-entity-typing-blind-eval-v0.1.json');
const semanticBlindPath = path.join(root, 'data', 'liuyao-semantic-route-blind-eval-v0.2.json');

const roleData = JSON.parse(fs.readFileSync(rolePath, 'utf8'));
const oldTyping = JSON.parse(fs.readFileSync(oldTypingPath, 'utf8'));
const oldBlind = JSON.parse(fs.readFileSync(oldBlindPath, 'utf8'));
const semanticBlind = JSON.parse(fs.readFileSync(semanticBlindPath, 'utf8'));
const expectedLabels = ['investment_target_role','purchase_target_role','delivery_target_role','no_supported_role'];

const fail = (message) => { throw new Error(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, ' ');
const flattenStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(normalize(value));
  else if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, out));
  return out;
};

if (roleData.version !== '0.2') fail(`unexpected contextual object role version: ${roleData.version}`);
if (roleData.task !== 'contextual_object_role') fail(`unexpected task: ${roleData.task}`);
const labels = Object.keys(roleData.labels || {}).sort();
if (JSON.stringify(labels) !== JSON.stringify([...expectedLabels].sort())) fail(`labels mismatch: ${labels.join(', ')}`);

const seen = new Map();
const entityLabels = new Map();
let trainCount = 0;
let validationCount = 0;
for (const label of expectedLabels) {
  const group = roleData.labels[label];
  if (!group || !Array.isArray(group.train) || !Array.isArray(group.validation)) fail(`missing split for ${label}`);
  if (group.train.length !== 32) fail(`${label} train must be 32, got ${group.train.length}`);
  if (group.validation.length !== 12) fail(`${label} validation must be 12, got ${group.validation.length}`);
  for (const split of ['train','validation']) {
    for (const sample of group[split]) {
      if (!sample || typeof sample.entity !== 'string' || typeof sample.context !== 'string') fail(`${label}/${split} malformed sample`);
      const entity = normalize(sample.entity);
      const context = normalize(sample.context);
      if (!entity || !context) fail(`${label}/${split} empty entity/context`);
      if (seen.has(context)) fail(`duplicate context across contextual object role data: ${context} (${seen.get(context)} vs ${label}/${split})`);
      seen.set(context, `${label}/${split}`);
      if (!entityLabels.has(entity)) entityLabels.set(entity, new Set());
      entityLabels.get(entity).add(label);
      if (split === 'train') trainCount += 1; else validationCount += 1;
    }
  }
}

const externalStrings = new Set([
  ...flattenStrings(oldTyping),
  ...flattenStrings(oldBlind),
  ...flattenStrings(semanticBlind)
]);
const overlaps = [...seen.keys()].filter((text) => externalStrings.has(text));
if (overlaps.length) fail(`contextual object role data has exact overlap with prior sealed/development corpora:\n- ${overlaps.join('\n- ')}`);

const multiRoleEntities = [...entityLabels.values()].filter((set) => set.size >= 2).length;
if (multiRoleEntities < 12) fail(`expected at least 12 entities to appear across multiple roles, got ${multiRoleEntities}`);

console.log('Contextual object role data verification passed');
console.log(`- train: ${trainCount}`);
console.log(`- validation: ${validationCount}`);
console.log(`- cross-role entities: ${multiRoleEntities}`);
console.log(`- exact overlaps with prior corpora: ${overlaps.length}`);
