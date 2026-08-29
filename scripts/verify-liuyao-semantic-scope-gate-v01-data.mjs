import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const scope = read('data/liuyao-semantic-scope-gate-v0.1-development.json');
const scopePatch = read('data/liuyao-semantic-scope-gate-v0.1-preuse-patch.json');
const inventory = read('data/liuyao-semantic-route-inventory-v0.2.json');
const base = read('data/liuyao-semantic-route-training-v0.1.json');
const augmentation = read('data/liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = read('data/liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = read('data/liuyao-semantic-route-training-v0.4-expansion.json');
const targeted22 = read('data/liuyao-semantic-route-training-v0.5-targeted-22.json');
const development = read('data/liuyao-semantic-route-eval-v0.1.json');
const blind = read('data/liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = read('data/liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');
const candidate = read('data/liuyao-semantic-router-candidate-eval-v0.1.json');
const v09 = read('data/liuyao-semantic-router-decision-v0.9-development.json');
const v09Patch = read('data/liuyao-semantic-router-decision-v0.9-development-patch.json');

assert(scope.version === '0.1-development' && scope.status === 'development_preuse', 'scope gate v0.1 metadata mismatch');
assert(scope.scope === 'liuyao_current_22_router_only', 'scope gate must remain current-22-router-only');
assert(scope.policy?.modifyV081 === false, 'scope gate must not modify frozen v0.8.1');
assert(scope.policy?.useRouterConfidenceFeatures === false, 'scope gate must use direct embeddings, not Router confidence features');
assert(scope.policy?.useUnresolvedAsNegativeTraining === false, 'unresolved rows must not train the scope gate');
assert(scope.policy?.outsideCurrent22DoesNotMeanUnsupportedByLiuYao === true, 'outside-current-22 must not be relabeled as globally unsupported LiuYao');
assert(scope.policy?.diagnosticUnresolvedExcludedFromMetrics === true, 'unresolved diagnostic rows must be excluded from scope metrics');
assert(scopePatch.version === '0.1-preuse-wording-patch' && scopePatch.status === 'development_preuse_patch', 'scope pre-use wording patch metadata mismatch');
assert(scopePatch.base === 'liuyao-semantic-scope-gate-v0.1-development.json', 'scope pre-use wording patch base mismatch');
const replacements = scopePatch.replacements || {};
const effectiveText = (text) => replacements[text] || text;
for (const [from,to] of Object.entries(replacements)) {
  assert(typeof from === 'string' && from.trim(), 'scope wording patch contains empty source');
  assert(typeof to === 'string' && to.trim(), `scope wording patch contains empty replacement for ${from}`);
  assert(normalize(from) !== normalize(to), `scope wording patch must change wording: ${from}`);
}

const routeIds = (inventory.routes || []).map((row) => row.routeId);
assert(routeIds.length === 22, `inventory route count ${routeIds.length} != 22`);
assert(JSON.stringify(Object.keys(scope.supported || {})) === JSON.stringify(routeIds), 'scope supported route coverage/order must match 22-route inventory');

const expectedRouteCounts = { train:3, calibration:1, validation:1 };
const expectedOutsideCounts = { train:6, calibration:2, validation:2 };
const seen = new Map();
const rawOccurrences = new Map();
const remember = (raw, bucket) => {
  assert(typeof raw === 'string' && raw.trim(), `empty scope text in ${bucket}`);
  rawOccurrences.set(raw, (rawOccurrences.get(raw) || 0) + 1);
  const text = effectiveText(raw);
  const key = normalize(text);
  assert(!seen.has(key), `duplicate effective scope text: ${text} in ${bucket} and ${seen.get(key)}`);
  seen.set(key, bucket);
};

const supportedCounts = {train:0,calibration:0,validation:0};
for (const routeId of routeIds) {
  const spec = scope.supported[routeId];
  for (const [split, expected] of Object.entries(expectedRouteCounts)) {
    const rows = spec?.[split] || [];
    assert(rows.length === expected, `${routeId} ${split} count ${rows.length} != ${expected}`);
    for (const text of rows) remember(text, `supported:${split}:${routeId}`);
    supportedCounts[split] += rows.length;
  }
}
assert(supportedCounts.train === 66 && supportedCounts.calibration === 22 && supportedCounts.validation === 22, 'supported split totals mismatch');

const outsideCategories = Object.keys(scope.outside_current_22 || {});
assert(outsideCategories.length === 11, `outside-current-22 category count ${outsideCategories.length} != 11`);
const outsideCounts = {train:0,calibration:0,validation:0};
for (const category of outsideCategories) {
  const spec = scope.outside_current_22[category];
  for (const [split, expected] of Object.entries(expectedOutsideCounts)) {
    const rows = spec?.[split] || [];
    assert(rows.length === expected, `${category} ${split} count ${rows.length} != ${expected}`);
    for (const text of rows) remember(text, `outside:${split}:${category}`);
    outsideCounts[split] += rows.length;
  }
}
assert(outsideCounts.train === 66 && outsideCounts.calibration === 22 && outsideCounts.validation === 22, 'outside-current-22 split totals mismatch');

const diagnostic = scope.diagnostic_unresolved || [];
assert(diagnostic.length === 30, `diagnostic unresolved count ${diagnostic.length} != 30`);
for (const text of diagnostic) remember(text, 'diagnostic:unresolved');
assert(seen.size === 250, `effective scope corpus unique total ${seen.size} != 250`);
assert(scope.counts?.total === 250 && scope.counts?.diagnostic_unresolved === 30, 'declared scope totals mismatch');
for (const source of Object.keys(replacements)) assert(rawOccurrences.get(source) === 1, `scope patch source must occur exactly once: ${source}`);

const forbiddenTraditional = /(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;
for (const key of seen.keys()) assert(!forbiddenTraditional.test(key), `scope data leaks traditional LiuYao terminology: ${key}`);

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
for (const [label, texts] of Object.entries(blind.samples || {})) for (const raw of texts || []) rememberPrior(blindPatch.replacements?.[raw] || raw, `legacy-blind:${label}`);
for (const [routeId, spec] of Object.entries(candidate.routes || {})) for (const raw of spec.samples || []) rememberPrior(typeof raw === 'string' ? raw : raw.text, `candidate-v0.1:${routeId}`);
for (const text of candidate.rejection?.out_of_scope || []) rememberPrior(text, 'candidate-v0.1:out_of_scope');
for (const text of candidate.rejection?.underspecified || []) rememberPrior(text, 'candidate-v0.1:underspecified');
const applyV09Patch = (text) => v09Patch.replacements?.[text] || text;
for (const [routeId, spec] of Object.entries(v09.routes || {})) {
  for (const split of ['train','calibration','validation']) for (const row of spec[split] || []) rememberPrior(applyV09Patch(row.text), `v0.9:${split}:${routeId}`);
}
for (const split of ['train','calibration','validation']) {
  for (const kind of ['out_of_scope','underspecified']) for (const text of v09.rejection?.[split]?.[kind] || []) rememberPrior(applyV09Patch(text), `v0.9:${split}:${kind}`);
}

const leaks = [];
for (const [key, bucket] of seen.entries()) if (prior.has(key)) leaks.push(`${bucket} duplicates ${prior.get(key)}: ${key}`);
if (leaks.length) fail(`scope gate v0.1 exact overlap(s):\n- ${leaks.join('\n- ')}`);

console.log('LiuYao current-22 Semantic Scope Gate v0.1 data verification passed.');
console.log('- 110 supported-current-22 rows: 66 train / 22 calibration / 22 validation');
console.log('- 110 clear outside-current-22 rows: 66 train / 22 calibration / 22 validation');
console.log('- 30 unresolved diagnostic rows excluded from binary training/calibration/metrics');
console.log(`- ${Object.keys(replacements).length} pre-use wording-only isolation correction(s)`);
console.log('- zero exact overlap with prior Router corpora, sealed Candidate v0.1, and effective v0.9 development data');
