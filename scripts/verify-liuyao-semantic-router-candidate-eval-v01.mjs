import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const candidate = readJson('data/liuyao-semantic-router-candidate-eval-v0.1.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const base = readJson('data/liuyao-semantic-route-training-v0.1.json');
const augmentation = readJson('data/liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = readJson('data/liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = readJson('data/liuyao-semantic-route-training-v0.4-expansion.json');
const targeted22 = readJson('data/liuyao-semantic-route-training-v0.5-targeted-22.json');
const development = readJson('data/liuyao-semantic-route-eval-v0.1.json');
const blind = readJson('data/liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = readJson('data/liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');

assert(candidate.version === '0.1', 'candidate eval version must be 0.1');
assert(candidate.status === 'sealed_candidate_eval' && candidate.sealed === true, 'candidate eval must remain sealed');
assert(candidate.scope === 'liuyao_only', 'candidate eval must remain LiuYao-only');
assert(candidate.modelCandidate === 'semantic-router-v0.8.1', 'candidate model id drifted');
assert(candidate.sampleCount === 300, `declared sampleCount ${candidate.sampleCount} != 300`);
assert(candidate.policy?.reuseCurrent301Validation === false, 'current 301 Validation must not be reused');
assert(candidate.policy?.reuseLegacyDevelopmentBenchmark === false, 'legacy development benchmark must not be reused');
assert(candidate.policy?.reuseLegacyBlind === false, 'legacy Blind must not be reused');
assert(candidate.policy?.tuneV081FromThisEval === false, 'v0.8.1 must not be tuned from candidate eval');

const routeRows = inventory.routes || [];
const routeIds = routeRows.map((row) => row.routeId);
assert(routeIds.length === 22, `route inventory ${routeIds.length} != 22`);
assert(JSON.stringify(Object.keys(candidate.routes || {})) === JSON.stringify(routeIds), 'candidate route order/coverage must exactly match 22-route inventory');

const expectedRouteCounts = {
  financial_fortune:5, business_operation:5, commercial_transaction:5, inventory_purchase:5, inventory_sale:5,
  borrow_money:5, lend_money:5, debt_collection:5, debt_repayment:5, partnership:5,
  investment_profit:8, investment_liquidation:8, investment_suitability:8, investment_position_decision:8, investment_price_trend:8,
  income_salary:15, income_bonus:15, receive_item:25, item_purchase:25,
  relationship_development:17, marriage_match:17, marital_relationship:16
};
const expectedDomainCounts = {
  wealth_finance:50,
  investment:40,
  employment_income:30,
  item_delivery:25,
  item_purchase:25,
  relationship_marriage:50
};

const context = { console, Date, Math, JSON, Intl };
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/liuyao-semantic-sufficiency.js'), 'utf8'), context, { filename:'js/liuyao-semantic-sufficiency.js' });
const sufficiency = context.GuiJia?.liuyaoSemanticSufficiency;
assert(sufficiency?.version === '0.2', 'Semantic Sufficiency v0.2 must be present');
const allowedSlots = new Set(Object.keys(sufficiency.slotSchema || {}));

const currentTexts = new Map();
const rememberCurrent = (text, bucket) => {
  assert(typeof text === 'string' && text.trim(), `empty candidate text in ${bucket}`);
  const key = normalize(text);
  assert(key, `empty normalized candidate text in ${bucket}`);
  assert(!currentTexts.has(key), `candidate duplicate: “${text}” in ${bucket} and ${currentTexts.get(key)}`);
  currentTexts.set(key, bucket);
};

let knownCount = 0;
const domainCounts = Object.fromEntries(Object.keys(expectedDomainCounts).map((id) => [id, 0]));
let insufficientCount = 0;
for (const inventoryRow of routeRows) {
  const routeId = inventoryRow.routeId;
  const spec = candidate.routes[routeId];
  assert(spec, `missing candidate route ${routeId}`);
  const samples = spec.samples || [];
  assert(samples.length === expectedRouteCounts[routeId], `${routeId} sample count ${samples.length} != ${expectedRouteCounts[routeId]}`);
  const expectedRule = inventoryRow.ruleStatus || 'confirmed';
  assert(spec.ruleAvailability === expectedRule, `${routeId} ruleAvailability ${spec.ruleAvailability} != inventory ${expectedRule}`);
  assert(Array.isArray(spec.slots), `${routeId} default slots must be an array`);
  for (const slot of spec.slots) assert(allowedSlots.has(slot), `${routeId} unknown default slot ${slot}`);
  for (const raw of samples) {
    const row = typeof raw === 'string' ? { text:raw } : raw;
    rememberCurrent(row.text, `known:${routeId}`);
    const slots = row.slots ?? spec.slots;
    assert(Array.isArray(slots), `${routeId} sample slots must be array: ${row.text}`);
    for (const slot of slots) assert(allowedSlots.has(slot), `${routeId} sample unknown slot ${slot}: ${row.text}`);
    const goalType = row.goalType ?? spec.goalType;
    assert(['outcome','timing','choice','state','unknown'].includes(goalType), `${routeId} invalid goal ${goalType}: ${row.text}`);
    const suffStatus = row.expectedSufficiencyStatus || 'sufficient';
    assert(['sufficient','semantic_insufficient'].includes(suffStatus), `${routeId} invalid sufficiency status ${suffStatus}`);
    if (suffStatus === 'semantic_insufficient') insufficientCount += 1;
    knownCount += 1;
    domainCounts[inventoryRow.domain] = (domainCounts[inventoryRow.domain] || 0) + 1;
  }
}
assert(knownCount === 220, `known-route count ${knownCount} != 220`);
for (const [domain, count] of Object.entries(expectedDomainCounts)) assert(domainCounts[domain] === count, `domain ${domain} count ${domainCounts[domain]} != ${count}`);
assert(insufficientCount >= 20, `candidate eval must include broad route-known insufficient cases, got ${insufficientCount}`);

const out = candidate.rejection?.out_of_scope || [];
const under = candidate.rejection?.underspecified || [];
assert(out.length === 60, `out_of_scope ${out.length} != 60`);
assert(under.length === 20, `underspecified ${under.length} != 20`);
for (const text of out) rememberCurrent(text, 'reject:out_of_scope');
for (const text of under) rememberCurrent(text, 'reject:underspecified');
assert(currentTexts.size === 300, `candidate total unique texts ${currentTexts.size} != 300`);

const forbiddenTraditional = /(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;
for (const [text] of [...currentTexts.entries()].map(([key,bucket]) => [key,bucket])) {
  assert(!forbiddenTraditional.test(text), `candidate text leaks traditional LiuYao terminology: ${text}`);
}

// Gather every prior Semantic Router development/evaluation text and ensure this fresh eval is exact-isolated.
const prior = new Map();
const rememberPrior = (text, bucket) => {
  if (typeof text !== 'string' || !text.trim()) return;
  const key = normalize(text);
  if (!prior.has(key)) prior.set(key, bucket);
};
const addRouteCorpus = (sourceName, source) => {
  for (const [routeId, spec] of Object.entries(source.routes || {})) {
    for (const text of spec.train || []) rememberPrior(text, `${sourceName}:train:${routeId}`);
    for (const text of spec.validation || []) rememberPrior(text, `${sourceName}:validation:${routeId}`);
  }
  for (const split of ['train','validation']) {
    for (const sample of source.hardNegatives?.[split] || []) rememberPrior(sample.text, `${sourceName}:hard:${split}`);
  }
};
addRouteCorpus('v0.1', base);
addRouteCorpus('v0.2-augmentation', augmentation);
addRouteCorpus('v0.3-targeted', targeted);
addRouteCorpus('v0.4-expansion', expansion);
addRouteCorpus('v0.5-targeted22', targeted22);
for (const [label, texts] of Object.entries(development.samples || {})) for (const text of texts || []) rememberPrior(text, `legacy-development:${label}`);
const replacements = blindPatch.replacements || {};
for (const [label, texts] of Object.entries(blind.samples || {})) for (const raw of texts || []) rememberPrior(replacements[raw] || raw, `legacy-blind:${label}`);

for (const [key, bucket] of currentTexts.entries()) {
  assert(!prior.has(key), `fresh candidate leak: ${bucket} duplicates ${prior.get(key)}: ${key}`);
}

console.log('LiuYao Semantic Router fresh candidate eval v0.1 verification passed.');
console.log(`- ${knownCount} route-known samples across 22 routes`);
console.log(`- domain quotas: ${Object.entries(domainCounts).map(([k,v]) => `${k}=${v}`).join(', ')}`);
console.log(`- route-known semantic_insufficient samples: ${insufficientCount}`);
console.log(`- ${out.length} out_of_scope / ${under.length} underspecified`);
console.log('- zero exact overlap with all prior Semantic Router train/validation/development/sealed Blind corpora');
