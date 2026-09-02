import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const trainingFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-training.json';
const calibrationFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-calibration.json';
const lockFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-data.lock.json';
const schemaFile = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-data-schema-v0.1.json';
const contractFile = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const normalize = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\s，。？！?、,.!;；：“”"‘’'：:（）()【】\[\]—\-]/g, '');
const grams = (text, n=3) => {
  const source = Array.from(normalize(text));
  const result = new Set();
  if (source.length < n) {
    if (source.length) result.add(source.join(''));
    return result;
  }
  for (let i = 0; i <= source.length - n; i += 1) result.add(source.slice(i, i+n).join(''));
  return result;
};
const jaccard = (a, b) => {
  const left = grams(a);
  const right = grams(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
};
const hasHan = (value) => /[\u3400-\u9fff]/.test(value);

const schema = readJson(schemaFile);
const contract = readJson(contractFile);
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const training = readJson(trainingFile);
const calibration = readJson(calibrationFile);
assert(schema.status === 'frozen_before_semantic_act_data_generation', 'Semantic Act schema freeze missing');
assert(contract.status === 'frozen_before_v04_data_generation', 'v0.4 data contract freeze missing');
assert(inventory.routeCount === 22 && inventory.routes?.length === 22, '22-route inventory drift');
assert(training.version === '0.13-candidate-v0.4-semantic-act-training-v0.1', `training version ${training.version}`);
assert(calibration.version === '0.13-candidate-v0.4-semantic-act-calibration-v0.1', `calibration version ${calibration.version}`);
assert(['presealed_training_data','sealed_training_data'].includes(training.status), `training status ${training.status}`);
assert(['presealed_calibration_data','sealed_calibration_data'].includes(calibration.status), `calibration status ${calibration.status}`);
assert(training.sealed === (training.status === 'sealed_training_data'), 'training sealed/status mismatch');
assert(calibration.sealed === (calibration.status === 'sealed_calibration_data'), 'calibration sealed/status mismatch');
assert(training.policy?.createdAfterDataContractFreeze === true && calibration.policy?.createdAfterDataContractFreeze === true, 'fresh-after-contract marker missing');
assert(training.policy?.generatedWithoutReadingCandidateV03FailureRows === true && calibration.policy?.generatedWithoutReadingCandidateV03FailureRows === true, 'failure-row no-read marker missing');
assert(training.policy?.independentEvaluationRead === false && calibration.policy?.independentEvaluationRead === false, 'independent read forbidden');
assert(training.policy?.sealedBlindEvaluationRead === false && calibration.policy?.sealedBlindEvaluationRead === false, 'sealed blind read forbidden');
assert(training.policy?.encoderScoringPerformed === false && calibration.policy?.encoderScoringPerformed === false, 'encoder scoring must not occur during data construction');
assert(training.policy?.useForSemanticActWeightTraining === true && training.policy?.useForSemanticActThresholdSelection === false, 'training use policy drift');
assert(calibration.policy?.useForSemanticActWeightTraining === false && calibration.policy?.useForSemanticActThresholdSelection === true, 'calibration use policy drift');
assert(calibration.policy?.mayChooseOnlyOneGlobalSemanticActThreshold === true, 'one global Semantic Act threshold contract missing');
assert(training.rows?.length === schema.splitPolicy.training.plannedRows, `training rows ${training.rows?.length}`);
assert(calibration.rows?.length === schema.splitPolicy.calibration.plannedRows, `calibration rows ${calibration.rows?.length}`);

const eligibleLabel = 'eligible_divination_outcome_or_decision';
const ineligibleLabel = 'ineligible_information_or_procedure';
const allRows = [
  ...training.rows.map((row) => ({...row, corpus:'training'})),
  ...calibration.rows.map((row) => ({...row, corpus:'calibration'}))
];
const count = (rows, predicate) => rows.filter(predicate).length;
assert(count(training.rows, (row) => row.label === eligibleLabel) === 66, 'training eligible != 66');
assert(count(training.rows, (row) => row.label === ineligibleLabel) === 66, 'training ineligible != 66');
assert(count(calibration.rows, (row) => row.label === eligibleLabel) === 33, 'calibration eligible != 33');
assert(count(calibration.rows, (row) => row.label === ineligibleLabel) === 33, 'calibration ineligible != 33');

const requiredFields = new Set(schema.rowSchema.required || []);
const eligibleFamilies = new Set(schema.eligibleActFamilies || []);
const ineligibleFamilies = new Set(schema.ineligibleActFamilies || []);
const routeSet = new Set(inventory.routes.map((row) => row.routeId));
const seenIds = new Set();
const seenTexts = new Map();
const coveredRoutes = new Set();
const contrast = new Map();
const traditionalTerms = ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神','六亲'];
const healthTerms = ['疾病','病情','生病','健康占','手术结果','疗效','药效','治好','康复','诊断结果','检查结果'];

for (const row of allRows) {
  for (const field of requiredFields) assert(row[field] != null, `missing ${field}: ${row.id}`);
  assert(!seenIds.has(row.id), `duplicate id ${row.id}`);
  seenIds.add(row.id);
  const text = normalize(row.text);
  assert(text.length >= 8, `too-short row ${row.id}: ${row.text}`);
  assert(!seenTexts.has(text), `exact duplicate current row ${row.id} / ${seenTexts.get(text)}`);
  seenTexts.set(text, row.id);
  assert(row.split === row.corpus, `split/corpus mismatch ${row.id}`);
  assert(row.provenance === 'fresh_v04_manual_semantic_act_contrast', `provenance drift ${row.id}`);
  if (row.label === eligibleLabel) assert(eligibleFamilies.has(row.actFamily), `eligible act family drift ${row.id}: ${row.actFamily}`);
  else {
    assert(row.label === ineligibleLabel, `unknown label ${row.id}: ${row.label}`);
    assert(ineligibleFamilies.has(row.actFamily), `ineligible act family drift ${row.id}: ${row.actFamily}`);
  }
  assert(Array.isArray(row.routeCoverage) && row.routeCoverage.length > 0, `route coverage missing ${row.id}`);
  for (const routeId of row.routeCoverage) {
    assert(routeSet.has(routeId), `unknown route coverage ${row.id}: ${routeId}`);
    coveredRoutes.add(routeId);
  }
  for (const term of traditionalTerms) assert(!text.includes(term), `traditional LiuYao term leaked ${row.id}: ${term}`);
  for (const term of healthTerms) assert(!text.includes(term), `health-policy term leaked ${row.id}: ${term}`);
  const key = `${row.corpus}:${row.contrastGroup}`;
  if (!contrast.has(key)) contrast.set(key, new Set());
  contrast.get(key).add(row.label);
}
assert(coveredRoutes.size === 22, `route coverage ${coveredRoutes.size}/22`);
for (const [key, labels] of contrast) assert(labels.size === 2 && labels.has(eligibleLabel) && labels.has(ineligibleLabel), `contrast pair missing both labels: ${key}`);
assert(contrast.size === 99, `contrast pairs ${contrast.size} != 99`);
for (const family of eligibleFamilies) assert(allRows.some((row) => row.actFamily === family), `eligible family uncovered: ${family}`);
for (const family of ineligibleFamilies) assert(allRows.some((row) => row.actFamily === family), `ineligible family uncovered: ${family}`);

// Cross-split near-copy check. Domain vocabulary may repeat; sentence-level near-copy may not.
const crossSplitThreshold = Number(schema.duplicatePolicy.currentTrainCalibrationMaximum);
const crossSplitNear = [];
for (const trainRow of training.rows) {
  for (const calRow of calibration.rows) {
    const score = jaccard(trainRow.text, calRow.text);
    if (score >= crossSplitThreshold) crossSplitNear.push({ train:trainRow.id, calibration:calRow.id, score, trainText:trainRow.text, calibrationText:calRow.text });
  }
}
assert(crossSplitNear.length === 0, `train/calibration near duplicates (${crossSplitNear.length}): ${JSON.stringify(crossSplitNear.slice(0,12))}`);

// Protected evaluation text is deliberately not opened. Filename filtering is part of the no-read guarantee.
const currentNames = new Set([
  path.basename(trainingFile), path.basename(calibrationFile), path.basename(lockFile),
  path.basename(schemaFile), path.basename(contractFile)
]);
const protectedName = /(independent|blind|diagnostic|diagnosis|report|literature|research|next-topic|next-five)/i;
const dataNames = fs.readdirSync(dataDir).filter((name) => name.startsWith('liuyao-') && name.endsWith('.json'));
const protectedSkipped = dataNames.filter((name) => protectedName.test(name));
const permittedHistory = dataNames.filter((name) => !currentNames.has(name) && !protectedName.test(name));
assert(protectedSkipped.some((name) => /independent/i.test(name)), 'expected independent files not recognized by protected filter');
assert(protectedSkipped.some((name) => /blind/i.test(name)), 'expected blind files not recognized by protected filter');

const historicalStrings = [];
const collect = (value, source) => {
  if (typeof value === 'string') {
    const text = normalize(value);
    if (text.length >= 8 && text.length <= 100 && hasHan(text)) historicalStrings.push({ text, source, grams:grams(text) });
    return;
  }
  if (Array.isArray(value)) { value.forEach((item) => collect(item, source)); return; }
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, source));
};
for (const file of permittedHistory) collect(JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')), file);

const historicalExact = new Map();
for (const item of historicalStrings) if (!historicalExact.has(item.text)) historicalExact.set(item.text, item.source);
const exactOverlap = allRows
  .map((row) => ({ row, source:historicalExact.get(normalize(row.text)) }))
  .filter((item) => item.source);
assert(exactOverlap.length === 0, `historical exact overlap (${exactOverlap.length}): ${exactOverlap.slice(0,12).map((item) => `${item.row.id}->${item.source}`).join(' | ')}`);

const historicalThreshold = Number(schema.duplicatePolicy.permittedHistoricalMaximum);
const nearOverlap = [];
for (const row of allRows) {
  const rowNorm = normalize(row.text);
  const rowGrams = grams(rowNorm);
  let best = null;
  for (const item of historicalStrings) {
    let intersection = 0;
    for (const token of rowGrams) if (item.grams.has(token)) intersection += 1;
    const union = rowGrams.size + item.grams.size - intersection;
    const score = union ? intersection / union : 0;
    if (!best || score > best.score) best = { score, source:item.source, historicalText:item.text };
  }
  if (best && best.score >= historicalThreshold) nearOverlap.push({ id:row.id, text:row.text, ...best });
}
assert(nearOverlap.length === 0, `historical near overlap (${nearOverlap.length}): ${JSON.stringify(nearOverlap.slice(0,12))}`);

if (training.sealed || calibration.sealed) {
  assert(training.sealed && calibration.sealed, 'training/calibration must seal together');
  assert(fs.existsSync(path.join(root, lockFile)), 'sealed Semantic Act data lock missing');
  const lock = readJson(lockFile);
  assert(lock.version === '0.13-candidate-v0.4-semantic-act-data-lock-v0.1' && lock.status === 'locked', 'Semantic Act lock contract drift');
  assert(lock.trainingSha256 === sha256(trainingFile), 'Semantic Act training SHA drift');
  assert(lock.calibrationSha256 === sha256(calibrationFile), 'Semantic Act calibration SHA drift');
  assert(lock.schemaSha256 === sha256(schemaFile), 'Semantic Act schema SHA drift');
  assert(lock.contractSha256 === sha256(contractFile), 'v0.4 data contract SHA drift');
  assert(lock.independentEvaluationRead === false && lock.sealedBlindEvaluationRead === false, 'protected eval no-read lock drift');
  assert(lock.encoderScoringBeforeSeal === false, 'encoder scoring before seal forbidden');
}

console.log('Candidate v0.4 Semantic Act v0.1 corpora verified.');
console.log(`- training: ${training.rows.length} (66 eligible / 66 ineligible)`);
console.log(`- calibration: ${calibration.rows.length} (33 eligible / 33 ineligible)`);
console.log(`- contrast pairs: ${contrast.size}; route coverage: ${coveredRoutes.size}/22`);
console.log(`- train/calibration near duplicates >= ${crossSplitThreshold}: 0`);
console.log(`- permitted historical corpora read: ${permittedHistory.length}; protected eval/blind/report/diagnostic files skipped without content read: ${protectedSkipped.length}`);
console.log(`- permitted historical exact overlap: 0; near overlap >= ${historicalThreshold}: 0`);
