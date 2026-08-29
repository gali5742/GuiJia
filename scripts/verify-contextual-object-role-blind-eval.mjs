import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
const blind = read('liuyao-contextual-object-role-blind-eval-v0.2.json');
const roleBase = read('liuyao-contextual-object-role-training-v0.2.json');
const rolePatch = read('liuyao-contextual-object-role-training-v0.2-seal-patch.json');
const oldTyping = read('liuyao-entity-typing-training-v0.1.json');
const oldTypingBlind = read('liuyao-entity-typing-blind-eval-v0.1.json');
const semanticTrain = read('liuyao-semantic-route-training-v0.1.json');
const semanticAug = read('liuyao-semantic-route-training-v0.2-augmentation.json');
const semanticTargeted = read('liuyao-semantic-route-training-v0.3-targeted.json');
const semanticDev = read('liuyao-semantic-route-eval-v0.1.json');
const semanticBlind = read('liuyao-semantic-route-blind-eval-v0.2.json');

const labels = ['investment_target_role','purchase_target_role','delivery_target_role','no_supported_role'];
const allowedRoutes = new Set(['investment_profit','investment_suitability','investment_position_decision','investment_price_trend','item_purchase','receive_item']);
const normalize = (text) => String(text || '').trim().replace(/\s+/g, ' ');
const fail = (message) => { throw new Error(message); };
const flattenStrings = (value, out = []) => {
  if (typeof value === 'string') out.push(normalize(value));
  else if (Array.isArray(value)) value.forEach((item) => flattenStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => flattenStrings(item, out));
  return out;
};

if (blind.version !== '0.2') fail(`unexpected blind version: ${blind.version}`);
if (blind.sealed !== true) fail('contextual object role blind must remain sealed=true');
if (blind.task !== 'contextual_object_role_blind_eval') fail(`unexpected blind task: ${blind.task}`);
const actualLabels = Object.keys(blind.labels || {}).sort();
if (JSON.stringify(actualLabels) !== JSON.stringify([...labels].sort())) fail(`blind labels mismatch: ${actualLabels.join(', ')}`);

const blindContexts = new Set();
const entityRoles = new Map();
let total = 0;
for (const label of labels) {
  const rows = blind.labels[label];
  if (!Array.isArray(rows) || rows.length !== 40) fail(`${label} blind must contain exactly 40 rows, got ${rows?.length}`);
  for (const sample of rows) {
    const entity = normalize(sample?.entity);
    const context = normalize(sample?.context);
    const route = normalize(sample?.route);
    if (!entity || !context || !route) fail(`${label} has malformed sample`);
    if (!allowedRoutes.has(route)) fail(`${label} uses unsupported candidate route: ${route}`);
    if (!context.toLowerCase().includes(entity.toLowerCase())) fail(`${label} context must visibly contain its object candidate: ${entity} :: ${context}`);
    if (blindContexts.has(context)) fail(`duplicate blind context: ${context}`);
    blindContexts.add(context);
    if (!entityRoles.has(entity)) entityRoles.set(entity, new Set());
    entityRoles.get(entity).add(label);
    total += 1;
  }
}
if (total !== 160) fail(`blind total must be 160, got ${total}`);
const crossRoleEntities = [...entityRoles.values()].filter((set) => set.size >= 2).length;
if (crossRoleEntities < 30) fail(`expected >=30 cross-role entities, got ${crossRoleEntities}`);

const effectiveRole = JSON.parse(JSON.stringify(roleBase));
const replacements = new Map((rolePatch?.replacements || []).map((item) => [normalize(item.from), normalize(item.to)]));
for (const group of Object.values(effectiveRole.labels || {})) {
  for (const split of ['train','validation']) {
    for (const sample of group?.[split] || []) {
      const replacement = replacements.get(normalize(sample.context));
      if (replacement) sample.context = replacement;
    }
  }
}
const external = new Set([
  ...flattenStrings(effectiveRole),
  ...flattenStrings(oldTyping),
  ...flattenStrings(oldTypingBlind),
  ...flattenStrings(semanticTrain),
  ...flattenStrings(semanticAug),
  ...flattenStrings(semanticTargeted),
  ...flattenStrings(semanticDev),
  ...flattenStrings(semanticBlind)
]);
const overlaps = [...blindContexts].filter((context) => external.has(context));
if (overlaps.length) fail(`sealed contextual object role blind overlaps prior corpora:\n- ${overlaps.join('\n- ')}`);

console.log('Contextual object role blind eval verification passed');
console.log(`- sealed samples: ${total}`);
console.log(`- per role: 40`);
console.log(`- cross-role entities: ${crossRoleEntities}`);
console.log(`- exact overlaps with prior corpora: ${overlaps.length}`);
