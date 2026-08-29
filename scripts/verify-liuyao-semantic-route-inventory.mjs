import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const fail = (message) => { throw new Error(message); };
const unique = (items) => [...new Set(items)];
const sameSet = (left, right) => JSON.stringify(unique(left).sort()) === JSON.stringify(unique(right).sort());

const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const frozenWeights = readJson('data/semantic-router-weights-v0.1.json');

if (inventory.version !== '0.2' || inventory.status !== 'draft_inventory' || inventory.scope !== 'liuyao_only') {
  fail('Semantic Router v0.2 route inventory metadata mismatch');
}
if (inventory.inheritsFrozenRouterVersion !== '0.1') fail('v0.2 inventory must explicitly inherit frozen Router v0.1');
if (!Array.isArray(inventory.routes) || inventory.routes.length !== inventory.routeCount || inventory.routeCount !== 22) {
  fail(`Semantic Router v0.2 routeCount mismatch: declared=${inventory.routeCount} actual=${inventory.routes?.length}`);
}

const routeIds = inventory.routes.map((row) => row.routeId);
if (unique(routeIds).length !== routeIds.length) fail('Semantic Router v0.2 inventory contains duplicate routeId');
for (const row of inventory.routes) {
  if (!row.routeId || !row.domain || !row.eventType) fail(`Incomplete route inventory row: ${JSON.stringify(row)}`);
  if (typeof row.currentV01Route !== 'boolean') fail(`${row.routeId} missing currentV01Route boolean`);
  if (!Array.isArray(row.ruleRefs)) fail(`${row.routeId} ruleRefs must be an array`);
}

const inheritedRoutes = inventory.routes.filter((row) => row.currentV01Route).map((row) => row.routeId);
if (!sameSet(inheritedRoutes, frozenWeights.routeIds || [])) {
  fail(`currentV01Route set does not exactly match frozen Router v0.1 routeIds`);
}
const newRoutes = inventory.routes.filter((row) => !row.currentV01Route).map((row) => row.routeId);
if (!sameSet(newRoutes, inventory.newRoutesSinceV01 || [])) {
  fail('newRoutesSinceV01 must exactly match routes with currentV01Route=false');
}
if (newRoutes.length !== 7) fail(`Expected 7 new routes since v0.1, got ${newRoutes.length}`);

const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of ['js/liuyao-intent.js', 'js/liuyao-commercial-event-resolver.js', 'js/liuyao-rule-registry.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
}
const registry = context.GuiJia?.liuyaoRuleRegistry;
if (!registry?.observationRules || !registry?.augmentationRules) fail('Unable to load LiuYao Rule Registry');

const registryRuleIds = registry.observationRules.map((rule) => rule.id);
const inventoryRuleRefs = inventory.routes.flatMap((row) => row.ruleRefs || []);
const unknownRuleRefs = unique(inventoryRuleRefs.filter((id) => !registryRuleIds.includes(id)));
if (unknownRuleRefs.length) fail(`Unknown observation rule refs in route inventory: ${unknownRuleRefs.join(', ')}`);
const missingRuleRefs = registryRuleIds.filter((id) => !inventoryRuleRefs.includes(id));
if (missingRuleRefs.length) fail(`Rule Registry entries missing from route inventory: ${missingRuleRefs.join(', ')}`);
for (const id of registryRuleIds) {
  const count = inventoryRuleRefs.filter((ref) => ref === id).length;
  if (count !== 1) fail(`Observation rule ${id} must be owned by exactly one route, got ${count}`);
}

for (const row of inventory.routes) {
  for (const ruleRef of row.ruleRefs) {
    const rule = registry.observationRules.find((item) => item.id === ruleRef);
    const eventTypes = rule?.appliesTo?.eventTypes || [];
    if (!eventTypes.includes(row.eventType)) {
      fail(`${row.routeId} eventType=${row.eventType} does not match ${ruleRef} eventTypes=${eventTypes.join('|')}`);
    }
  }
}

const registryAugIds = registry.augmentationRules.map((rule) => rule.id);
const inventoryAugRefs = inventory.routes.flatMap((row) => row.augmentationRuleRefs || []);
if (!sameSet(inventoryAugRefs, registryAugIds)) {
  fail('Route inventory augmentationRuleRefs do not exactly cover current augmentation rules');
}
for (const id of registryAugIds) {
  const count = inventoryAugRefs.filter((ref) => ref === id).length;
  if (count !== 1) fail(`Augmentation rule ${id} must be referenced exactly once, got ${count}`);
}

const noRuleRoutes = inventory.routes.filter((row) => row.ruleRefs.length === 0).map((row) => row.routeId);
if (!sameSet(noRuleRoutes, ['debt_repayment', 'item_purchase'])) {
  fail(`Only debt_repayment and item_purchase may currently have no confirmed rule: ${noRuleRoutes.join(', ')}`);
}
for (const routeId of noRuleRoutes) {
  const row = inventory.routes.find((item) => item.routeId === routeId);
  if (row.ruleStatus !== 'no_confirmed_rule') fail(`${routeId} must declare ruleStatus=no_confirmed_rule`);
}

const provisionalRoutes = inventory.routes.filter((row) => row.ruleStatus === 'provisional_only');
if (!sameSet(provisionalRoutes.map((row) => row.routeId), ['investment_position_decision', 'income_bonus'])) {
  fail('provisional_only route inventory mismatch');
}
for (const row of provisionalRoutes) {
  if (row.ruleRefs.length !== 1) fail(`${row.routeId} provisional route must reference exactly one rule`);
  const rule = registry.observationRules.find((item) => item.id === row.ruleRefs[0]);
  if (rule?.automationStatus !== 'provisional') fail(`${row.routeId}/${row.ruleRefs[0]} is not provisional in Rule Registry`);
}
for (const row of inventory.routes.filter((item) => item.ruleRefs.length && item.ruleStatus !== 'provisional_only')) {
  const provisional = row.ruleRefs.filter((id) => registry.observationRules.find((rule) => rule.id === id)?.automationStatus === 'provisional');
  if (provisional.length) fail(`${row.routeId} references provisional rule(s) without ruleStatus=provisional_only: ${provisional.join(', ')}`);
}

const forbiddenKeys = new Set(['sixRelative','six_relative','useGod','use_god','yao','yaoTarget','yao_target','shiYing','shi_ying','selector','semanticDuty']);
const walk = (value, pathLabel = '$') => {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, `${pathLabel}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) fail(`Traditional mapping key leaked into route inventory at ${pathLabel}.${key}`);
    walk(child, `${pathLabel}.${key}`);
  }
};
walk(inventory.routes);

console.log('LiuYao Semantic Router v0.2 route inventory verification passed');
console.log(`- ${inventory.routeCount} total modern-language routes`);
console.log(`- ${inheritedRoutes.length} inherited frozen v0.1 routes`);
console.log(`- ${newRoutes.length} new candidate routes`);
console.log(`- ${registryRuleIds.length} observation rules mapped exactly once`);
console.log(`- ${registryAugIds.length} augmentation rule(s) mapped exactly once`);
