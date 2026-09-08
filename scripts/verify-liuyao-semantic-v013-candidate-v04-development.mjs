import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const developmentPath = 'data/liuyao-semantic-v013-candidate-v04-development.json';
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json';
const designPath = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const dataContractPath = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';

const EXPECTED_BLOBS = Object.freeze({
  [runtimeLockPath]:'32ffdfbd4c0364b22f4f49f450c861cb39a0624c',
  [designPath]:'cc2f830118a5ee4e6fc22cb4ddcc78427f286d18',
  [dataContractPath]:'0f5f4b863689dda83fada81aa2a5cad45647b73e'
});

const CURRENT_22 = Object.freeze([
  'financial_fortune','business_operation','commercial_transaction','inventory_purchase','inventory_sale',
  'borrow_money','lend_money','debt_collection','debt_repayment','partnership','investment_profit',
  'investment_liquidation','investment_suitability','investment_position_decision','investment_price_trend',
  'income_salary','income_bonus','receive_item','item_purchase','relationship_development','marriage_match',
  'marital_relationship'
]);

// Frozen non-blind contamination sources only. Independent/blind corpora are deliberately absent.
const ISOLATION_SOURCE_PATHS = Object.freeze([
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json',
  'data/liuyao-semantic-v013-candidate-v04-semantic-act-training.json',
  'data/liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json',
  'data/liuyao-semantic-v013-candidate-v03-development.json'
]);

const fail = (message) => { throw new Error(message); };
const gitBlobSha = (buffer) => crypto.createHash('sha1')
  .update(Buffer.from(`blob ${buffer.length}\0`))
  .update(buffer)
  .digest('hex');

const normalize = (value) => String(value || '')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[\s\p{P}\p{S}]+/gu, '');

const ngrams = (value, n=3) => {
  const text = normalize(value);
  const result = new Set();
  if (text.length < n) {
    if (text) result.add(text);
    return result;
  }
  for (let index = 0; index <= text.length - n; index += 1) result.add(text.slice(index, index + n));
  return result;
};

const jaccard = (left, right) => {
  const a = ngrams(left);
  const b = ngrams(right);
  if (!a.size && !b.size) return 1;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
};

const isNearDuplicate = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
  if (lengthRatio < 0.72) return false;
  if (Math.min(a.length, b.length) >= 10 && (a.includes(b) || b.includes(a)) && lengthRatio >= 0.82) return true;
  return jaccard(a, b) >= 0.72;
};

const collectChineseStrings = (value, output=[]) => {
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (normalized.length >= 6 && /\p{Script=Han}/u.test(value)) output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectChineseStrings(item, output);
    return output;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectChineseStrings(item, output);
  }
  return output;
};

for (const [relativePath, expectedSha] of Object.entries(EXPECTED_BLOBS)) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  const actualSha = gitBlobSha(buffer);
  if (actualSha !== expectedSha) fail(`${relativePath} blob drifted: expected ${expectedSha}, got ${actualSha}`);
}

const runtimeLock = JSON.parse(fs.readFileSync(path.join(root, runtimeLockPath), 'utf8'));
if (runtimeLock.status !== 'runtime_locked_before_fresh_development') fail('Candidate v0.4 runtime lock status drifted');
if (runtimeLock.execution?.fallbackGlobalThreshold !== 0.5549057227178391) fail('Frozen Fallback Identity v0.2 threshold drifted');
if (runtimeLock.execution?.semanticActThreshold !== 0.5045675974201208) fail('Frozen Semantic Act v0.1 threshold drifted');
if (runtimeLock.execution?.routeabilityThreshold !== 0.7678148573595883) fail('Frozen Routeability threshold drifted');
if (runtimeLock.execution?.routeInventoryCount !== 22) fail('Frozen route inventory count drifted');
if (runtimeLock.execution?.routerTop2FallbackRestriction !== false) fail('Router Top2 was reintroduced as a Fallback restriction');
if (runtimeLock.execution?.routeSpecificFallbackThresholds !== false) fail('Route-specific fallback thresholds are forbidden');

const dataset = JSON.parse(fs.readFileSync(path.join(root, developmentPath), 'utf8'));
if (dataset.version !== '0.13-candidate-v0.4-development-v0.1') fail(`Unexpected development version: ${dataset.version}`);
if (dataset.status !== 'sealed_fresh_development_cohort_before_first_encoder_scoring' || dataset.sealed !== true) fail('Fresh development cohort must be declared sealed before first scoring');
if (dataset.scope !== 'liuyao_semantic_decision_stack_v0.13_candidate_v0.4') fail('Unexpected development scope');
if (dataset.runtimeLockBinding?.gitBlobSha !== EXPECTED_BLOBS[runtimeLockPath]) fail('Development/runtime lock binding drifted');
if (dataset.designBinding?.gitBlobSha !== EXPECTED_BLOBS[designPath]) fail('Development/design binding drifted');
if (dataset.dataContractBinding?.gitBlobSha !== EXPECTED_BLOBS[dataContractPath]) fail('Development/data-contract binding drifted');

const requiredPolicy = {
  useForTraining:false,
  useForThresholdCalibration:false,
  useForIndependentEvaluation:false,
  sealedBeforeFirstDevelopmentEncoderScoring:true,
  postSealWordingMutationForbidden:true,
  sameTextAsV04TrainCalibrationForbidden:true,
  sameTextAsCandidateV03DevelopmentForbidden:true,
  nearDuplicateIsolationRequired:true,
  independentEvaluationReadBeforeSeal:false,
  sealedBlindEvaluationReadBeforeSeal:false,
  traditionalLiuYaoFeaturesForbidden:true,
  healthDiseaseDivinationRowsForbidden:true
};
for (const [key, expected] of Object.entries(requiredPolicy)) {
  if (dataset.policy?.[key] !== expected) fail(`Development policy ${key} must be ${expected}`);
}

if (!Array.isArray(dataset.rows) || dataset.rows.length !== 198) fail(`Expected 198 development rows, found ${dataset.rows?.length}`);
const expectedCounts = {
  total:198,
  route_known:132,
  non_route:66,
  strong_arbitration:44,
  support_arbitration:44,
  fallback_identity_all22:44,
  outside_current_22:22,
  route_unresolved:22,
  near_domain_not_current_route:22
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  if (dataset.counts?.[key] !== expected) fail(`Declared count ${key} must be ${expected}`);
}

const ids = new Set();
const normalizedTexts = new Map();
const actualCounts = { route_known:0, non_route:0, strong_arbitration:0, support_arbitration:0, fallback_identity_all22:0, outside_current_22:0, route_unresolved:0, near_domain_not_current_route:0 };
const fallbackByRoute = new Map(CURRENT_22.map((route) => [route, 0]));
const forbiddenTraditional = /(六亲|世爻|应爻|用神|妻财|官鬼|父母爻|兄弟爻|子孙爻)/u;
const forbiddenHealthDisease = /(疾病|病情|生病|看病|癌症|肿瘤|手术|症状|诊断|治疗|医院看病|健康状况)/u;

dataset.rows.forEach((row, index) => {
  const expectedId = `V013-V04-D-${String(index + 1).padStart(3, '0')}`;
  if (row.id !== expectedId) fail(`Row ${index + 1} id must be ${expectedId}, got ${row.id}`);
  if (ids.has(row.id)) fail(`Duplicate id: ${row.id}`);
  ids.add(row.id);
  if (typeof row.text !== 'string' || normalize(row.text).length < 6) fail(`${row.id} has invalid text`);
  const normalizedText = normalize(row.text);
  if (normalizedTexts.has(normalizedText)) fail(`${row.id} exact-normalized duplicate of ${normalizedTexts.get(normalizedText)}`);
  normalizedTexts.set(normalizedText, row.id);
  if (forbiddenTraditional.test(row.text)) fail(`${row.id} illegally uses traditional LiuYao features`);
  if (forbiddenHealthDisease.test(row.text)) fail(`${row.id} illegally introduces health/disease divination`);

  if (row.expectedDisposition === 'route_known') {
    actualCounts.route_known += 1;
    if (!CURRENT_22.includes(row.expectedRoute)) fail(`${row.id} uses route outside frozen current-22: ${row.expectedRoute}`);
    if (!['strong_arbitration','support_arbitration','fallback_identity_all22'].includes(row.expectedCandidatePath)) fail(`${row.id} has invalid known candidate path`);
    actualCounts[row.expectedCandidatePath] += 1;
    if (row.nonRouteSubtype != null) fail(`${row.id} known row must not declare nonRouteSubtype`);
    if (row.expectedCandidatePath === 'fallback_identity_all22') fallbackByRoute.set(row.expectedRoute, fallbackByRoute.get(row.expectedRoute) + 1);
  } else if (row.expectedDisposition === 'non_route') {
    actualCounts.non_route += 1;
    if (row.expectedRoute !== null || row.expectedCandidatePath !== null) fail(`${row.id} non-route row must have null route and candidate path`);
    if (!['outside_current_22','route_unresolved','near_domain_not_current_route'].includes(row.nonRouteSubtype)) fail(`${row.id} has invalid non-route subtype`);
    actualCounts[row.nonRouteSubtype] += 1;
  } else {
    fail(`${row.id} has invalid expectedDisposition ${row.expectedDisposition}`);
  }
});

for (const [key, expected] of Object.entries(expectedCounts)) {
  if (key === 'total') continue;
  if (actualCounts[key] !== expected) fail(`Actual count ${key} must be ${expected}, got ${actualCounts[key]}`);
}
for (const [route, count] of fallbackByRoute) {
  if (count !== 2) fail(`Pure Fallback coverage must contain exactly 2 rows for ${route}, got ${count}`);
}

const ownTexts = dataset.rows.map((row) => row.text);
for (let i = 0; i < ownTexts.length; i += 1) {
  for (let j = 0; j < i; j += 1) {
    if (isNearDuplicate(ownTexts[i], ownTexts[j])) fail(`Internal near-duplicate: ${dataset.rows[j].id} <> ${dataset.rows[i].id}`);
  }
}

let sourceStringsChecked = 0;
for (const sourcePath of ISOLATION_SOURCE_PATHS) {
  if (/(independent|blind)/iu.test(sourcePath)) fail(`Blind/independent source is forbidden in pre-seal isolation audit: ${sourcePath}`);
  const source = JSON.parse(fs.readFileSync(path.join(root, sourcePath), 'utf8'));
  const sourceStrings = collectChineseStrings(source);
  sourceStringsChecked += sourceStrings.length;
  for (const row of dataset.rows) {
    for (const sourceText of sourceStrings) {
      if (normalize(row.text) === normalize(sourceText)) fail(`${row.id} exact overlap with ${sourcePath}: ${sourceText}`);
      if (isNearDuplicate(row.text, sourceText)) fail(`${row.id} near-duplicate overlap with ${sourcePath}: ${sourceText}`);
    }
  }
}

console.log(JSON.stringify({
  ok:true,
  developmentPath,
  rows:dataset.rows.length,
  counts:actualCounts,
  fallbackRoutesCovered:[...fallbackByRoute.keys()].length,
  isolationSourcesChecked:ISOLATION_SOURCE_PATHS.length,
  sourceStringsChecked,
  runtimeLockGitBlobSha:EXPECTED_BLOBS[runtimeLockPath],
  encoderScoringPerformed:false,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false
}, null, 2));
