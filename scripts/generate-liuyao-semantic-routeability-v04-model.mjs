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
const ratio = (n,d) => d ? n/d : 0;
const EXECUTION = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const execution = readJson(EXECUTION);
const development = readJson('data/liuyao-semantic-routeability-v0.2-development.json');
const calibration = readJson('data/liuyao-semantic-routeability-v0.3-calibration.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);
if (execution.canonicalInvocation?.textsPerEncoderCall !== 1) throw new Error('canonical embedding execution contract missing');
if (development.version !== '0.2' || development.status !== 'development_data') throw new Error('Routeability v0.2 development data missing');
if (calibration.version !== '0.3-calibration-v0.1' || calibration.rows?.length !== 223) throw new Error('Routeability v0.3 calibration missing');
if (routeIds.length !== 22) throw new Error(`route inventory ${routeIds.length} != 22`);

const frozenDependencies = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.json');
const encoder = frozenDependencies.encoder;
if (encoder.textsPerEncoderCall !== 1) throw new Error('corrected frozen encoder contract missing');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number, Date, Intl, Set, Map };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-routeability-v02.js',
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js','js/liuyao-semantic-route-compatibility-v02.js','js/liuyao-semantic-route-compatibility-v03.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const G = context.GuiJia;
const algorithm = G.liuyaoSemanticRouteabilityV02;
const evidenceApi = G.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = G.liuyaoSemanticRouteArbitrationV012;
const compatibilityApi = G.liuyaoSemanticRouteCompatibilityV03;
if (!algorithm?.train || !algorithm?.probability || !evidenceApi?.extract || !arbitrationApi?.arbitrate || !compatibilityApi?.evaluate) throw new Error('Routeability corrected modules failed to load');

const trainingFiles = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json'
];
const expansionPatch = readJson('data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json');
const trainMap = new Map();
const addTrain = (row) => {
  const key = normalize(row.text);
  if (!key) return;
  const existing = trainMap.get(key);
  if (existing && existing.routeabilityLabel !== row.routeabilityLabel) throw new Error(`conflicting Routeability label: ${row.text}`);
  if (!existing) trainMap.set(key, row);
};
for (const file of trainingFiles) {
  const source = readJson(file);
  for (const routeId of routeIds) {
    for (const text of source.routes?.[routeId]?.train || []) addTrain({ text, routeabilityLabel:'route_known', subtype:'historical_route_train', routeId, source:file });
  }
  for (const sample of source.hardNegatives?.train || []) {
    let expectedRoute = sample.expectedRoute || null;
    if (!expectedRoute && file.endsWith('v0.4-expansion.json')) expectedRoute = expansionPatch.train?.[sample.text] || null;
    if (expectedRoute && routeIds.includes(expectedRoute)) addTrain({ text:sample.text, routeabilityLabel:'route_known', subtype:'historical_contrastive_known', routeId:expectedRoute, source:file });
    else addTrain({ text:sample.text, routeabilityLabel:'non_route', subtype:'historical_hard_negative', source:file });
  }
}
for (const row of development.knownInsufficient) addTrain({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' });
for (const row of development.trainingNonRoute) addTrain({ ...row, source:'data/liuyao-semantic-routeability-v0.2-development.json' });
const trainingRows = [...trainMap.values()];
const trainingText = new Set(trainingRows.map((row) => normalize(row.text)));
for (const row of calibration.rows) if (trainingText.has(normalize(row.text))) throw new Error(`Routeability corrected calibration overlaps training: ${row.text}`);

console.log(`Corrected Routeability training rows: ${trainingRows.length}`);
console.log(`Representation-correction calibration rows: ${calibration.rows.length}`);
env.allowLocalModels = false; env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', encoder.modelId, { dtype:encoder.dtype, revision:encoder.revision });
const tensorToVector = (tensor) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1];
  if (hidden !== encoder.vectorSize) throw new Error(`embedding size ${hidden} != ${encoder.vectorSize}`);
  const vector = new Float32Array(hidden);
  for (let i = 0; i < hidden; i += 1) vector[i] = Number(tensor.data[i]);
  return vector;
};
const embedSingle = async (texts, label) => {
  const vectors = [];
  for (let index = 0; index < texts.length; index += 1) {
    const output = await extractor(texts[index], { pooling:encoder.pooling, normalize:encoder.normalize });
    vectors.push(tensorToVector(output));
    if ((index + 1) % 50 === 0 || index + 1 === texts.length) console.log(`${label} ${index + 1}/${texts.length}`);
  }
  return vectors;
};
const trainingVectors = await embedSingle(trainingRows.map((row) => row.text), 'train embedded');
const model = algorithm.train(trainingRows, trainingVectors);
const calibrationVectors = await embedSingle(calibration.rows.map((row) => row.text), 'calibration embedded');

const scored = calibration.rows.map((row, index) => {
  const probability = algorithm.probability(model, calibrationVectors[index]);
  const evidence = evidenceApi.extract(row.text);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  return { ...row, probability, evidence, arbitration };
});
const decideAt = (row, threshold) => {
  if ((row.evidence?.unsupportedTargets || []).length) return { disposition:'non_route', reasonCode:'explicit_unsupported_target' };
  if (row.probability >= threshold) return { disposition:'route_known', reasonCode:'corrected_model_score_accept' };
  if (row.arbitration?.routeId && (row.arbitration.strength === 'strong' || row.arbitration.strength === 'support')) {
    const checked = compatibilityApi.evaluate(row.arbitration.routeId, row.evidence || {});
    if (checked.status === 'confirmed') return { disposition:'route_known', reasonCode:`confirmed_${row.arbitration.strength}_rescue` };
  }
  return { disposition:'non_route', reasonCode:'corrected_model_score_reject' };
};
const thresholds = [...new Set(scored.map((row) => row.probability)), 1.0000001].filter((v)=>v>0).sort((a,b)=>a-b);
const evaluate = (threshold) => {
  const decisions = scored.map((row) => ({ row, decision:decideAt(row, threshold) }));
  const known = decisions.filter(({row}) => row.routeabilityLabel === 'route_known');
  const nonRoute = decisions.filter(({row}) => row.routeabilityLabel === 'non_route');
  const knownAccepted = known.filter(({decision}) => decision.disposition === 'route_known').length;
  const falseActivated = nonRoute.filter(({decision}) => decision.disposition === 'route_known').length;
  const bySubtype = {};
  for (const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']) {
    const subset = nonRoute.filter(({row}) => row.subtype === subtype);
    const activated = subset.filter(({decision}) => decision.disposition === 'route_known').length;
    bySubtype[subtype] = { n:subset.length, falseActivation:ratio(activated, subset.length), safety:1-ratio(activated, subset.length) };
  }
  const byPath = {};
  for (const pathId of ['support_arbitration','fallback_head']) {
    const subset = known.filter(({row}) => row.candidatePath === pathId);
    const accepted = subset.filter(({decision}) => decision.disposition === 'route_known').length;
    byPath[pathId] = { n:subset.length, recall:ratio(accepted, subset.length) };
  }
  return {
    threshold,
    knownRecall:ratio(knownAccepted, known.length),
    falseActivation:ratio(falseActivated, nonRoute.length),
    maxSubtypeFalseActivation:Math.max(...Object.values(bySubtype).map((item) => item.falseActivation)),
    bySubtype,
    byPath
  };
};
const eligible = thresholds.map(evaluate).filter((item) => item.falseActivation <= 0.05 + 1e-12 && item.maxSubtypeFalseActivation <= 0.05 + 1e-12);
if (!eligible.length) throw new Error('No corrected Routeability threshold satisfies overall/subtype 5% safety caps');
eligible.sort((a,b) => b.knownRecall-a.knownRecall || a.maxSubtypeFalseActivation-b.maxSubtypeFalseActivation || a.falseActivation-b.falseActivation || b.threshold-a.threshold);
const chosen = eligible[0];

const sources = [
  ...trainingFiles.map((path) => ({ path, role:'historical_router_train_split', sha256:sha256File(path) })),
  { path:'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json', role:'historical_train_label_patch', sha256:sha256File('data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json') },
  { path:'data/liuyao-semantic-routeability-v0.2-development.json', role:'existing_routeability_training_augmentation', sha256:sha256File('data/liuyao-semantic-routeability-v0.2-development.json') },
  { path:'data/liuyao-semantic-routeability-v0.3-calibration.json', role:'representation_correction_calibration_not_fresh_evidence', sha256:sha256File('data/liuyao-semantic-routeability-v0.3-calibration.json') },
  { path:EXECUTION, role:'embedding_execution_contract', sha256:sha256File(EXECUTION) },
  { path:'data/liuyao-semantic-frozen-dependencies-v0.2.json', role:'corrected_encoder_contract', sha256:sha256File('data/liuyao-semantic-frozen-dependencies-v0.2.json') }
];
const artifact = {
  version:'0.4',
  status:'frozen_representation_corrected',
  scope:'liuyao_semantic_routeability_v04',
  representationCorrection:{
    legacyModel:'data/liuyao-semantic-routeability-v0.2.json',
    legacyModelMutated:false,
    embeddingExecutionContract:{ path:EXECUTION, sha256:sha256File(EXECUTION) },
    textsPerEncoderCall:1,
    freshGeneralizationClaim:false
  },
  encoder:{ ...encoder },
  training:{ total:trainingRows.length, routeKnown:trainingRows.filter((row)=>row.routeabilityLabel==='route_known').length, nonRoute:trainingRows.filter((row)=>row.routeabilityLabel==='non_route').length },
  model:{ weights:Array.from(model.weights), bias:model.bias },
  policy:{
    explicitUnsupportedTarget:'non_route',
    modelScoreAtOrAboveThreshold:'route_known',
    belowThresholdConfirmedStrongOrSupportArbitration:'route_known',
    belowThresholdPureFallback:'non_route',
    maxFalseActivationOverall:0.05,
    maxFalseActivationPerSubtype:0.05
  },
  calibration:{
    evidenceStatus:'representation_correction_reprocessed_not_fresh',
    total:scored.length,
    routeKnown:scored.filter((row)=>row.routeabilityLabel==='route_known').length,
    nonRoute:scored.filter((row)=>row.routeabilityLabel==='non_route').length,
    threshold:chosen.threshold,
    knownRecall:chosen.knownRecall,
    falseActivation:chosen.falseActivation,
    nonRouteSafety:1-chosen.falseActivation,
    maxSubtypeFalseActivation:chosen.maxSubtypeFalseActivation,
    byPath:chosen.byPath,
    bySubtype:chosen.bySubtype
  },
  sources
};
const artifactPath = 'data/liuyao-semantic-routeability-v0.4.json';
fs.writeFileSync(path.join(root, artifactPath), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
const artifactSha256 = sha256File(artifactPath);
const lock = {
  version:'0.4-lock',
  status:'locked_representation_corrected',
  artifactPath,
  artifactSha256,
  threshold:chosen.threshold,
  textsPerEncoderCall:1,
  executionContractSha256:sha256File(EXECUTION),
  calibrationEvidenceStatus:'representation_correction_reprocessed_not_fresh'
};
fs.writeFileSync(path.join(root, 'data/liuyao-semantic-routeability-v0.4.lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Corrected Routeability v0.4 threshold=${chosen.threshold}`);
console.log(`known recall=${chosen.knownRecall}; false activation=${chosen.falseActivation}; max subtype=${chosen.maxSubtypeFalseActivation}`);
console.log(`support recall=${chosen.byPath.support_arbitration.recall}; fallback recall=${chosen.byPath.fallback_head.recall}`);
console.log(`artifact SHA-256=${artifactSha256}`);
