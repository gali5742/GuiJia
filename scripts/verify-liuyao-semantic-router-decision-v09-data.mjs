import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };
const normalize = (text) => String(text || '').trim().replace(/\s+/g, '');

const dev = read('data/liuyao-semantic-router-decision-v0.9-development.json');
const devPatch = read('data/liuyao-semantic-router-decision-v0.9-development-patch.json');
const inventory = read('data/liuyao-semantic-route-inventory-v0.2.json');
const candidate = read('data/liuyao-semantic-router-candidate-eval-v0.1.json');
const base = read('data/liuyao-semantic-route-training-v0.1.json');
const augmentation = read('data/liuyao-semantic-route-training-v0.2-augmentation.json');
const targeted = read('data/liuyao-semantic-route-training-v0.3-targeted.json');
const expansion = read('data/liuyao-semantic-route-training-v0.4-expansion.json');
const targeted22 = read('data/liuyao-semantic-route-training-v0.5-targeted-22.json');
const development = read('data/liuyao-semantic-route-eval-v0.1.json');
const blind = read('data/liuyao-semantic-route-blind-eval-v0.2.json');
const blindPatch = read('data/liuyao-semantic-route-blind-eval-v0.2-seal-patch.json');

assert(dev.version === '0.9-dev-routeability-0.1' && dev.status === 'development', 'v0.9 decision development metadata mismatch');
assert(dev.scope === 'liuyao_only', 'v0.9 decision data must remain LiuYao-only');
assert(dev.policy?.reuseSealedCandidateEvalV01 === false, 'sealed Candidate Eval v0.1 must not be reused for v0.9 training/calibration/validation');
assert(dev.policy?.modifyV081 === false && dev.policy?.modifySufficiencyV02 === false && dev.policy?.modifyRuleRegistry === false, 'v0.9 development policy drifted');
assert(devPatch.version === '0.9-dev-wording-patch-0.1' && devPatch.status === 'development_preuse_patch', 'v0.9 development wording patch metadata mismatch');
assert(devPatch.base === 'liuyao-semantic-router-decision-v0.9-development.json', 'v0.9 development wording patch base mismatch');
const developmentReplacements = devPatch.replacements || {};
const applyDevelopmentPatch = (text) => developmentReplacements[text] || text;
for (const [from,to] of Object.entries(developmentReplacements)) {
  assert(typeof from === 'string' && from.trim(), 'v0.9 wording patch has empty source');
  assert(typeof to === 'string' && to.trim(), `v0.9 wording patch has empty replacement for ${from}`);
  assert(normalize(from) !== normalize(to), `v0.9 wording patch must actually change wording: ${from}`);
}

const routeIds = (inventory.routes || []).map((row) => row.routeId);
assert(routeIds.length === 22, `route inventory ${routeIds.length} != 22`);
assert(JSON.stringify(Object.keys(dev.routes || {})) === JSON.stringify(routeIds), 'v0.9 route order/coverage must match 22-route inventory');

const expectedPerRoute = { train:3, calibration:2, validation:3 };
const expectedReject = {
  train:{ out_of_scope:33, underspecified:33 },
  calibration:{ out_of_scope:22, underspecified:22 },
  validation:{ out_of_scope:33, underspecified:33 }
};
const seen = new Map();
const rawSources = new Map();
const remember = (rawText, bucket) => {
  assert(typeof rawText === 'string' && rawText.trim(), `empty text in ${bucket}`);
  rawSources.set(rawText, (rawSources.get(rawText) || 0) + 1);
  const text = applyDevelopmentPatch(rawText);
  const key = normalize(text);
  assert(key, `empty normalized text in ${bucket}`);
  assert(!seen.has(key), `duplicate effective v0.9 development text: ${text} in ${bucket} and ${seen.get(key)}`);
  seen.set(key, bucket);
};

let routeable = 0;
let statementCount = 0;
for (const routeId of routeIds) {
  const spec = dev.routes[routeId];
  for (const split of Object.keys(expectedPerRoute)) {
    const rows = spec?.[split] || [];
    assert(rows.length === expectedPerRoute[split], `${routeId} ${split} count ${rows.length} != ${expectedPerRoute[split]}`);
    for (const row of rows) {
      assert(row && typeof row === 'object', `${routeId} ${split} row must be object`);
      remember(row.text, `routeable:${split}:${routeId}`);
      if (row.form) {
        assert(row.form === 'route_known_statement', `${routeId} invalid form ${row.form}`);
        statementCount += 1;
      }
      routeable += 1;
    }
  }
}
assert(routeable === 176, `routeable total ${routeable} != 176`);
assert(statementCount === 44, `route-known statement count ${statementCount} != 44`);

let rejectCount = 0;
for (const split of Object.keys(expectedReject)) {
  for (const kind of ['out_of_scope','underspecified']) {
    const rows = dev.rejection?.[split]?.[kind] || [];
    assert(rows.length === expectedReject[split][kind], `${split} ${kind} count ${rows.length} != ${expectedReject[split][kind]}`);
    for (const text of rows) remember(text, `reject:${split}:${kind}`);
    rejectCount += rows.length;
  }
}
assert(rejectCount === 176, `reject total ${rejectCount} != 176`);
assert(seen.size === 352, `effective v0.9 development unique count ${seen.size} != 352`);
assert(dev.splitCounts?.total === 352, 'declared v0.9 total must remain 352');
for (const source of Object.keys(developmentReplacements)) assert(rawSources.get(source) === 1, `v0.9 wording patch source must occur exactly once: ${source}`);

const forbiddenTraditional = /(妻财|官鬼|父母爻|兄弟爻|子孙爻|世爻|应爻|用神|元神|忌神|仇神)/;
for (const key of seen.keys()) assert(!forbiddenTraditional.test(key), `v0.9 development text leaks traditional LiuYao terminology: ${key}`);

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
  for (const split of ['train','validation']) for (const sample of source.hardNegatives?.[split] || []) rememberPrior(sample.text, `${sourceName}:hard:${split}`);
};
addRouteCorpus('v0.1', base);
addRouteCorpus('v0.2-augmentation', augmentation);
addRouteCorpus('v0.3-targeted', targeted);
addRouteCorpus('v0.4-expansion', expansion);
addRouteCorpus('v0.5-targeted22', targeted22);
for (const [label, texts] of Object.entries(development.samples || {})) for (const text of texts || []) rememberPrior(text, `legacy-development:${label}`);
const replacements = blindPatch.replacements || {};
for (const [label, texts] of Object.entries(blind.samples || {})) for (const raw of texts || []) rememberPrior(replacements[raw] || raw, `legacy-blind:${label}`);
for (const [routeId, spec] of Object.entries(candidate.routes || {})) for (const raw of spec.samples || []) rememberPrior(typeof raw === 'string' ? raw : raw.text, `candidate-v0.1:${routeId}`);
for (const text of candidate.rejection?.out_of_scope || []) rememberPrior(text, 'candidate-v0.1:out_of_scope');
for (const text of candidate.rejection?.underspecified || []) rememberPrior(text, 'candidate-v0.1:underspecified');

const leaks = [];
for (const [key, bucket] of seen.entries()) {
  if (prior.has(key)) leaks.push(`${bucket} duplicates ${prior.get(key)}: ${key}`);
}
if (leaks.length) fail(`v0.9 development exact overlap(s):\n- ${leaks.join('\n- ')}`);

console.log('LiuYao Semantic Router Decision v0.9 development data verification passed.');
console.log('- 22 routes × (3 train / 2 calibration / 3 validation) = 176 routeable');
console.log('- 176 rejection rows: balanced out_of_scope / underspecified per split');
console.log(`- ${statementCount} route-known statement rows retained as routeable positives`);
console.log(`- ${Object.keys(developmentReplacements).length} pre-run wording-only overlap correction(s)`);
console.log('- zero exact overlap with prior Router train/validation/dev/blind and sealed Candidate Eval v0.1');