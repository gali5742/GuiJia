import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const normalize = (value) => String(value || '').trim().replace(/\s+/g, '');

const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const development = readJson('data/liuyao-semantic-routeability-v0.2-development.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);
const sources = [
  ['data/liuyao-semantic-route-training-v0.1.json','historical_train'],
  ['data/liuyao-semantic-route-training-v0.2-augmentation.json','historical_train'],
  ['data/liuyao-semantic-route-training-v0.3-targeted.json','historical_train'],
  ['data/liuyao-semantic-route-training-v0.4-expansion.json','historical_train'],
  ['data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json','historical_train_label_patch'],
  ['data/liuyao-semantic-route-training-v0.5-targeted-22.json','historical_train'],
  ['data/liuyao-semantic-route-inventory-v0.2.json','route_inventory'],
  ['data/liuyao-semantic-routeability-v0.2-development.json','fresh_train_and_calibration'],
  ['js/liuyao-semantic-routeability-v02.js','routeability_algorithm'],
  ['data/liuyao-semantic-frozen-dependencies-v0.1.lock.json','encoder_lock']
];

if (frozen.encoder?.revision !== '75c43b069aac4d136ba6bc1122f995fedcfd2781') throw new Error('Frozen encoder revision drift');
if (frozen.encoder?.vectorSize !== 512 || frozen.encoder?.dtype !== 'q8') throw new Error('Frozen encoder contract drift');
if (development.version !== '0.2' || development.status !== 'development_data') throw new Error('Routeability development data missing');
if (routeIds.length !== 22) throw new Error(`Route inventory count ${routeIds.length} != 22`);

const routeabilityContext = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number };
routeabilityContext.window = routeabilityContext;
routeabilityContext.globalThis = routeabilityContext;
vm.createContext(routeabilityContext);
vm.runInContext(fs.readFileSync(path.join(root, 'js/liuyao-semantic-routeability-v02.js'), 'utf8'), routeabilityContext, { filename:'js/liuyao-semantic-routeability-v02.js' });
const routeability = routeabilityContext.GuiJia?.liuyaoSemanticRouteabilityV02;
if (!routeability?.train || !routeability?.calibrate) throw new Error('Routeability v0.2 algorithm failed to load');

const trainingFiles = sources.filter(([,role]) => role === 'historical_train').map(([file]) => [file, readJson(file)]);
const expansionPatch = readJson('data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json');
const trainMap = new Map();
const addTrain = (row) => {
  const key = normalize(row.text);
  if (!key) return;
  const existing = trainMap.get(key);
  if (existing && existing.routeabilityLabel !== row.routeabilityLabel) throw new Error(`Conflicting Routeability train label: ${row.text}`);
  if (!existing) trainMap.set(key, row);
};

for (const [file, source] of trainingFiles) {
  for (const routeId of routeIds) {
    for (const text of source.routes?.[routeId]?.train || []) {
      addTrain({ text, routeabilityLabel:'route_known', subtype:'historical_route_train', routeId, source:file });
    }
  }
  for (const sample of source.hardNegatives?.train || []) {
    let expectedRoute = sample.expectedRoute || null;
    if (!expectedRoute && file.endsWith('v0.4-expansion.json')) expectedRoute = expansionPatch.train?.[sample.text] || null;
    if (expectedRoute && routeIds.includes(expectedRoute)) {
      addTrain({ text:sample.text, routeabilityLabel:'route_known', subtype:'historical_contrastive_known', routeId:expectedRoute, source:file });
    } else {
      addTrain({ text:sample.text, routeabilityLabel:'non_route', subtype:'historical_hard_negative', source:file });
    }
  }
}
for (const row of development.knownInsufficient) addTrain({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' });
for (const row of development.trainingNonRoute) addTrain({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' });
const trainingRows = [...trainMap.values()];

const calibrationRows = [
  ...development.calibrationKnown.map((row) => ({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' })),
  ...development.calibrationNonRoute.map((row) => ({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' }))
];
const trainingTexts = new Set(trainingRows.map((row) => normalize(row.text)));
for (const row of calibrationRows) {
  if (trainingTexts.has(normalize(row.text))) throw new Error(`Calibration overlaps training: ${row.text}`);
}

const countBy = (rows, key) => rows.reduce((acc, row) => {
  const value = row[key] || 'unspecified';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const trainingCounts = countBy(trainingRows, 'routeabilityLabel');
const calibrationCounts = countBy(calibrationRows, 'routeabilityLabel');
if (!trainingCounts.route_known || !trainingCounts.non_route) throw new Error('Training must contain both Routeability labels');
if (calibrationCounts.route_known !== 44 || calibrationCounts.non_route !== 66) throw new Error(`Fresh calibration counts drift: ${JSON.stringify(calibrationCounts)}`);

console.log(`Routeability training rows: ${trainingRows.length} (${trainingCounts.route_known} known / ${trainingCounts.non_route} non-route)`);
console.log(`Fresh calibration rows: ${calibrationRows.length} (44 known / 66 non-route)`);

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, {
  dtype:frozen.encoder.dtype,
  revision:frozen.encoder.revision
});

const tensorToVectors = (tensor, count) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`Embedding size ${hidden} != ${frozen.encoder.vectorSize}`);
  const raw = tensor.data;
  const vectors = [];
  for (let row = 0; row < count; row += 1) {
    const vector = new Float32Array(hidden);
    const offset = row * hidden;
    for (let i = 0; i < hidden; i += 1) vector[i] = Number(raw[offset + i]);
    vectors.push(vector);
  }
  return vectors;
};
const embed = async (texts, chunkSize=24) => {
  const vectors = [];
  for (let start = 0; start < texts.length; start += chunkSize) {
    const chunk = texts.slice(start, start + chunkSize);
    const output = await extractor(chunk, { pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
    vectors.push(...tensorToVectors(output, chunk.length));
    console.log(`embedded ${Math.min(start + chunk.length, texts.length)}/${texts.length}`);
  }
  return vectors;
};

const trainingVectors = await embed(trainingRows.map((row) => row.text));
const model = routeability.train(trainingRows, trainingVectors);
const calibrationVectors = await embed(calibrationRows.map((row) => row.text));
const enrichedCalibration = calibrationRows.map((row, index) => ({
  ...row,
  probability:routeability.probability(model, calibrationVectors[index])
}));
const calibration = routeability.calibrate(enrichedCalibration, { maxFalseActivation:0.05 });

const calibrationBySubtype = {};
for (const subtype of [...new Set(enrichedCalibration.map((row) => row.subtype))]) {
  const rows = enrichedCalibration.filter((row) => row.subtype === subtype);
  if (rows[0]?.routeabilityLabel === 'route_known') {
    calibrationBySubtype[subtype] = {
      n:rows.length,
      recall:rows.filter((row) => row.probability >= calibration.threshold).length / rows.length
    };
  } else {
    const falseActivation = rows.filter((row) => row.probability >= calibration.threshold).length / rows.length;
    calibrationBySubtype[subtype] = { n:rows.length, falseActivation, safety:1-falseActivation };
  }
}

const artifact = {
  version:'0.2',
  status:'frozen',
  scope:'liuyao_semantic_routeability_v02',
  contract:{
    labels:['route_known','non_route'],
    runtimePolicy:'load_frozen_only',
    calibrationObjective:'maximize_known_recall_subject_to_false_activation_cap',
    maxFalseActivation:0.05,
    validationUsedForTraining:false,
    blindUsedForTraining:false,
    scopeGateWeightsReused:false
  },
  encoder:{
    modelId:frozen.encoder.modelId,
    revision:frozen.encoder.revision,
    transformersJsVersion:'4.2.0',
    dtype:frozen.encoder.dtype,
    vectorSize:frozen.encoder.vectorSize,
    pooling:frozen.encoder.pooling,
    normalize:frozen.encoder.normalize
  },
  sources:sources.map(([file,role]) => ({ path:file, role, sha256:sha256File(file) })),
  training:{
    total:trainingRows.length,
    byLabel:trainingCounts,
    bySubtype:countBy(trainingRows,'subtype')
  },
  calibration:{
    total:calibrationRows.length,
    byLabel:calibrationCounts,
    bySubtype:calibrationBySubtype,
    threshold:calibration.threshold,
    knownRecall:calibration.knownRecall,
    falseActivation:calibration.falseActivation,
    nonRouteSafety:calibration.nonRouteSafety,
    maxFalseActivation:calibration.maxFalseActivation,
    objective:calibration.objective
  },
  model:{
    weights:Array.from(model.weights),
    bias:model.bias
  }
};

const artifactPath = 'data/liuyao-semantic-routeability-v0.2.json';
fs.writeFileSync(path.join(root, artifactPath), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
const artifactSha256 = sha256File(artifactPath);
const lock = {
  version:'0.2',
  status:'locked',
  artifact:artifactPath,
  artifactSha256,
  encoderRevision:artifact.encoder.revision,
  threshold:artifact.calibration.threshold,
  maxFalseActivation:0.05
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-routeability-v0.2.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Frozen Routeability v0.2 threshold=${artifact.calibration.threshold}`);
console.log(`known recall=${artifact.calibration.knownRecall}; false activation=${artifact.calibration.falseActivation}`);
console.log(`artifact SHA-256=${artifactSha256}`);
