import './verify-liuyao-semantic-embedding-execution-contract-v01.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'data/liuyao-semantic-frozen-dependencies-v0.2.json');
const LOCK = path.join(root, 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json');
const MODEL_REVISION = '75c43b069aac4d136ba6bc1122f995fedcfd2781';
const MODEL_ID = 'Xenova/bge-small-zh-v1.5';
const TRANSFORMERS_VERSION = '4.2.0';
const ROUTER_SOURCE = 'js/liuyao-semantic-router-poc-v081.js';
const SCOPE_SOURCE = 'js/liuyao-semantic-scope-gate-v01.js';
const EXECUTION_CONTRACT = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const LEGACY_ARTIFACT = 'data/liuyao-semantic-frozen-dependencies-v0.1.json';
const CORRECTED_ROUTEABILITY = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const CORRECTED_ROUTEABILITY_LOCK = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.lock.json';
const ROUTER_TRAINING = [
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  'data/liuyao-semantic-route-training-v0.4-expansion.json',
  'data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json',
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json',
  'data/liuyao-semantic-route-inventory-v0.2.json'
];
const SCOPE_TRAINING = [
  'data/liuyao-semantic-scope-gate-v0.1-development.json',
  'data/liuyao-semantic-scope-gate-v0.1-preuse-patch.json'
];

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (relative) => sha256Text(read(relative));
const sourceRecord = (relative) => ({ path:relative, sha256:sha256File(relative) });
const replaceExact = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`representation-correction patch anchor missing: ${label}`);
  return source.replace(before, after);
};
const ratio = (n, d) => d ? n / d : 0;

function patchCommon(source, kind) {
  let patched = replaceExact(
    source,
    "import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';",
    "import { pipeline, env } from '@huggingface/transformers';",
    `${kind} transformers import`
  );
  patched = replaceExact(
    patched,
    "const MODEL_DTYPE = 'q8';",
    `const MODEL_DTYPE = 'q8';\nconst MODEL_REVISION = '${MODEL_REVISION}';`,
    `${kind} model revision constant`
  );
  patched = replaceExact(
    patched,
    'const embedTexts = async (texts, { chunkSize=24, onProgress } = {}) => {',
    'const embedTexts = async (texts, { chunkSize=1, onProgress } = {}) => {',
    `${kind} canonical single-text embedding`
  );
  return patched;
}
function patchRouterSource(source) {
  let patched = patchCommon(source, 'router');
  patched = replaceExact(
    patched,
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:progressCallback })",
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, revision:MODEL_REVISION, progress_callback:progressCallback })",
    'router pinned pipeline'
  );
  const marker = 'export const semanticRouterPocV081 = {';
  const expose = `export const __freezeSnapshotV081 = () => {\n  if (!routeHead) throw new Error('route head not trained');\n  return {\n    routeIds:[...routeIds],\n    routeHead:{ weights:routeHead.weights.map((row)=>Array.from(row, Number)), biases:Array.from(routeHead.biases, Number), classCounts:{...routeHead.classCounts}, classWeights:{...routeHead.classWeights} }\n  };\n};\n\n`;
  return replaceExact(patched, marker, expose + marker, 'router freeze snapshot export');
}
function patchScopeSource(source) {
  let patched = patchCommon(source, 'scope');
  patched = replaceExact(
    patched,
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:onProgress })",
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, revision:MODEL_REVISION, progress_callback:onProgress })",
    'scope pinned pipeline'
  );
  const marker = 'export const semanticScopeGateV01 = Object.freeze({';
  const expose = `export const __freezeSnapshotScopeV01 = () => {\n  if (!gate) throw new Error('scope gate not trained');\n  return { weights:Array.from(gate.weights, Number), bias:Number(gate.bias), threshold:Number(threshold) };\n};\n\n`;
  return replaceExact(patched, marker, expose + marker, 'scope freeze snapshot export');
}

const calibrateScopeHardVeto = async (scopeApi) => {
  const rows = await scopeApi.flattenSplit('calibration');
  const scored = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const result = await scopeApi.classifyScope(row.text);
    scored.push({ ...row, probability:result.probability });
    if ((index + 1) % 25 === 0 || index + 1 === rows.length) console.log(`Scope hard-veto calibration scored ${index + 1}/${rows.length}`);
  }
  const supported = scored.filter((row) => row.supported);
  const outside = scored.filter((row) => !row.supported);
  if (!supported.length || !outside.length) throw new Error('Scope hard-veto calibration requires supported and outside rows');
  const values = [...new Set(scored.map((row) => row.probability))].sort((a, b) => a - b);
  const candidates = [...values];
  for (let i = 0; i + 1 < values.length; i += 1) candidates.push((values[i] + values[i + 1]) / 2);
  const evaluated = [...new Set(candidates.filter((value) => value > 0 && value < 1))].map((threshold) => {
    const supportedRecall = ratio(supported.filter((row) => row.probability >= threshold).length, supported.length);
    const outsideRejection = ratio(outside.filter((row) => row.probability < threshold).length, outside.length);
    return { threshold, supportedRecall, outsideRejection, outsideFalseAcceptance:1 - outsideRejection };
  });
  const eligible = evaluated.filter((row) => row.supportedRecall >= 1 - 1e-12);
  if (!eligible.length) throw new Error('No Scope hard-veto threshold preserves all frozen calibration supported rows');
  eligible.sort((a, b) => b.outsideRejection - a.outsideRejection || b.threshold - a.threshold);
  return {
    ...eligible[0],
    calibrationCount:scored.length,
    supportedCount:supported.length,
    outsideCount:outside.length,
    feasibleThresholdCount:eligible.length,
    selectionRule:'maximize_outside_rejection_subject_to_100_percent_supported_recall_then_highest_threshold',
    dataBoundary:'scope_gate_v0.1_frozen_calibration_split_only',
    candidateDevelopmentUsed:false,
    independentEvaluationUsed:false
  };
};

const tmpRouter = path.join(root, 'js/.liuyao-semantic-router-poc-v081.single-text-tmp.mjs');
const tmpScope = path.join(root, 'js/.liuyao-semantic-scope-gate-v01.single-text-tmp.mjs');
try {
  fs.writeFileSync(tmpRouter, patchRouterSource(read(ROUTER_SOURCE)), 'utf8');
  fs.writeFileSync(tmpScope, patchScopeSource(read(SCOPE_SOURCE)), 'utf8');

  console.log('Rebuilding Router v0.8.1 with canonical single-text encoder execution...');
  const routerModule = await import(`${pathToFileURL(tmpRouter).href}?single=${Date.now()}`);
  await routerModule.semanticRouterPocV081.loadModel();
  const routerTraining = await routerModule.semanticRouterPocV081.train();
  const router = routerModule.__freezeSnapshotV081();

  console.log('Rebuilding Scope Gate v0.1 with canonical single-text encoder execution...');
  const scopeModule = await import(`${pathToFileURL(tmpScope).href}?single=${Date.now()}`);
  await scopeModule.semanticScopeGateV01.loadModel();
  const scopeTraining = await scopeModule.semanticScopeGateV01.train();
  const scope = scopeModule.__freezeSnapshotScopeV01();
  const scopeHardVeto = await calibrateScopeHardVeto(scopeModule.semanticScopeGateV01);

  if (router.routeIds.length !== 22 || router.routeHead.weights.length !== 22 || router.routeHead.weights.some((row)=>row.length!==512)) throw new Error('corrected router shape mismatch');
  if (scope.weights.length !== 512 || !Number.isFinite(scope.bias) || !Number.isFinite(scope.threshold)) throw new Error('corrected scope shape mismatch');
  if (!Number.isFinite(scopeHardVeto.threshold) || scopeHardVeto.supportedRecall < 1 - 1e-12) throw new Error('corrected Scope hard-veto calibration invalid');

  const routeability = readJson(CORRECTED_ROUTEABILITY);
  const routeabilityLock = readJson(CORRECTED_ROUTEABILITY_LOCK);
  if (routeability.version !== '0.3-execution-v0.1' || routeability.status !== 'frozen') throw new Error('corrected Routeability v0.3 missing');
  if (routeability.executionCorrection?.canonicalTextsPerEncoderCall !== 1) throw new Error('corrected Routeability is not single-text');
  if (routeability.baseModel?.weightsReusedUnchanged !== true || routeability.baseModel?.path !== 'data/liuyao-semantic-routeability-v0.2-execution-v0.1.json') throw new Error('corrected Routeability base provenance invalid');
  if (routeabilityLock.artifactSha256 !== sha256File(CORRECTED_ROUTEABILITY)) throw new Error('corrected Routeability lock SHA drift');

  const artifact = {
    version:'0.2',
    status:'frozen',
    scope:'liuyao_semantic_v013_dependencies_representation_corrected',
    correction:{
      type:'embedding_execution_and_calibration_provenance_correction',
      canonicalTextsPerEncoderCall:1,
      executionContract:sourceRecord(EXECUTION_CONTRACT),
      legacyArtifact:{ path:LEGACY_ARTIFACT, sha256:sha256File(LEGACY_ARTIFACT), mutationAllowed:false },
      sameTrainingData:true,
      sameModelTrainingAlgorithms:true,
      sameModelHyperparameters:true,
      freshGeneralizationEvidence:false,
      candidateDevelopmentUsedForCorrection:false,
      independentEvaluationUsedForCorrection:false
    },
    encoder:{ modelId:MODEL_ID, revision:MODEL_REVISION, transformersJsVersion:TRANSFORMERS_VERSION, dtype:'q8', vectorSize:512, pooling:'mean', normalize:true },
    router:{
      version:'0.8.1-representation-corrected',
      source:sourceRecord(ROUTER_SOURCE),
      trainingSources:ROUTER_TRAINING.map(sourceRecord),
      routeOrder:router.routeIds,
      routeHead:router.routeHead,
      generationValidation:{ routeCount:routerTraining.routeCount, validationCount:routerTraining.validationCount, validationMetrics:routerTraining.validationMetrics, evidenceClass:'representation_correction_only' }
    },
    scopeGate:{
      version:'0.1-representation-corrected',
      source:sourceRecord(SCOPE_SOURCE),
      trainingSources:SCOPE_TRAINING.map(sourceRecord),
      gate:{ weights:scope.weights, bias:scope.bias },
      originalThreshold:scope.threshold,
      generationCalibration:{ ...scopeTraining.calibration, evidenceClass:'representation_correction_only' },
      hardVetoCalibration:scopeHardVeto
    },
    routeability:{
      version:routeability.version,
      artifact:sourceRecord(CORRECTED_ROUTEABILITY),
      lock:sourceRecord(CORRECTED_ROUTEABILITY_LOCK),
      threshold:routeability.calibration.threshold,
      calibration:{
        total:routeability.calibration.total,
        knownRecall:routeability.calibration.knownRecall,
        falseActivation:routeability.calibration.falseActivation,
        maxSubtypeFalseActivation:routeability.calibration.maxSubtypeFalseActivation
      },
      canonicalTextsPerEncoderCall:routeability.executionCorrection.canonicalTextsPerEncoderCall,
      correctedBaseModelPath:routeability.executionCorrection.correctedBaseModelPath
    },
    semanticStackPolicy:{
      hardVetoCutoff:scopeHardVeto.threshold,
      hardVetoStatus:'calibrated_on_frozen_scope_calibration_only',
      hardVetoSelectionRule:scopeHardVeto.selectionRule,
      hardVetoCalibrationDataBoundary:scopeHardVeto.dataBoundary,
      legacyHardVetoCutoff:0.4196,
      legacyCutoffInherited:false,
      legacyCutoffProvenance:'literal_policy_constant_without_recoverable_calibration_provenance'
    },
    generator:sourceRecord('scripts/generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs')
  };
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.writeFileSync(OUT, serialized, 'utf8');
  const artifactSha256 = sha256Text(serialized);
  const lock = {
    version:'0.2', status:'locked', artifact:'data/liuyao-semantic-frozen-dependencies-v0.2.json', artifactSha256,
    executionContractSha256:sha256File(EXECUTION_CONTRACT), encoderRevision:MODEL_REVISION, canonicalTextsPerEncoderCall:1,
    scopeHardVetoCutoff:scopeHardVeto.threshold,
    scopeHardVetoStatus:'calibrated_on_frozen_scope_calibration_only',
    routeabilityArtifactSha256:sha256File(CORRECTED_ROUTEABILITY),
    routeabilityThreshold:routeability.calibration.threshold,
    legacyHardVetoCutoff:0.4196,
    legacyHardVetoCutoffInherited:false
  };
  fs.writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  console.log(`Corrected frozen dependencies SHA-256: ${artifactSha256}`);
  console.log(`Corrected Scope internal threshold: ${scope.threshold}`);
  console.log(`Corrected Scope hard-veto cutoff: ${scopeHardVeto.threshold}`);
  console.log(`Corrected Routeability threshold: ${routeability.calibration.threshold}`);
} finally {
  for (const file of [tmpRouter,tmpScope]) { try { fs.unlinkSync(file); } catch {} }
}
