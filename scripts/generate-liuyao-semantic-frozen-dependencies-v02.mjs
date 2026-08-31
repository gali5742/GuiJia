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
const LEGACY_HARD_VETO_CUTOFF = 0.4196;
const EXECUTION_CONTRACT = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const ROUTER_SOURCE = 'js/liuyao-semantic-router-poc-v081.js';
const SCOPE_SOURCE = 'js/liuyao-semantic-scope-gate-v01.js';
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
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (relative) => sha256Text(read(relative));
const sourceRecord = (relative) => ({ path:relative, sha256:sha256File(relative) });
const assertReplace = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`runtime-equivalent patch anchor missing: ${label}`);
  return source.replace(before, after);
};

function patchCommon(source, progressName) {
  let patched = assertReplace(
    source,
    "import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';",
    "import { pipeline, env } from '@huggingface/transformers';",
    `${progressName} transformers import`
  );
  patched = assertReplace(
    patched,
    "const MODEL_DTYPE = 'q8';",
    `const MODEL_DTYPE = 'q8';\nconst MODEL_REVISION = '${MODEL_REVISION}';`,
    `${progressName} model revision constant`
  );
  patched = assertReplace(
    patched,
    'const embedTexts = async (texts, { chunkSize=24, onProgress } = {}) => {',
    'const embedTexts = async (texts, { chunkSize=1, onProgress } = {}) => {',
    `${progressName} canonical single-text embedding`
  );
  return patched;
}

function patchRouterSource(source) {
  let patched = patchCommon(source, 'router');
  patched = assertReplace(
    patched,
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:progressCallback })",
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, revision:MODEL_REVISION, progress_callback:progressCallback })",
    'router pinned pipeline'
  );
  const marker = 'export const semanticRouterPocV081 = {';
  const expose = `export const __freezeSnapshotV081 = () => {\n  if (!routeHead) throw new Error('route head not trained');\n  return {\n    routeIds:[...routeIds],\n    routeHead:{\n      weights:routeHead.weights.map((row) => Array.from(row, Number)),\n      biases:Array.from(routeHead.biases, Number),\n      classCounts:{ ...routeHead.classCounts },\n      classWeights:{ ...routeHead.classWeights }\n    }\n  };\n};\n\n`;
  return assertReplace(patched, marker, expose + marker, 'router snapshot export');
}

function patchScopeSource(source) {
  let patched = patchCommon(source, 'scope');
  patched = assertReplace(
    patched,
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, progress_callback:onProgress })",
    "pipeline('feature-extraction', MODEL_ID, { dtype:MODEL_DTYPE, revision:MODEL_REVISION, progress_callback:onProgress })",
    'scope pinned pipeline'
  );
  const marker = 'export const semanticScopeGateV01 = Object.freeze({';
  const expose = `export const __freezeSnapshotScopeV01 = () => {\n  if (!gate) throw new Error('scope gate not trained');\n  return { weights:Array.from(gate.weights, Number), bias:Number(gate.bias), threshold:Number(threshold) };\n};\n\n`;
  return assertReplace(patched, marker, expose + marker, 'scope snapshot export');
}

const tmpRouter = path.join(root, 'js/.liuyao-semantic-router-poc-v081.single-freeze-tmp.mjs');
const tmpScope = path.join(root, 'js/.liuyao-semantic-scope-gate-v01.single-freeze-tmp.mjs');

try {
  fs.writeFileSync(tmpRouter, patchRouterSource(read(ROUTER_SOURCE)), 'utf8');
  fs.writeFileSync(tmpScope, patchScopeSource(read(SCOPE_SOURCE)), 'utf8');

  console.log('Training Router v0.8.1 under canonical single-text embeddings...');
  const routerModule = await import(`${pathToFileURL(tmpRouter).href}?single=${Date.now()}`);
  await routerModule.semanticRouterPocV081.loadModel();
  const routerTraining = await routerModule.semanticRouterPocV081.train();
  const router = routerModule.__freezeSnapshotV081();

  console.log('Training Scope Gate v0.1 under canonical single-text embeddings...');
  const scopeModule = await import(`${pathToFileURL(tmpScope).href}?single=${Date.now()}`);
  await scopeModule.semanticScopeGateV01.loadModel();
  const scopeTraining = await scopeModule.semanticScopeGateV01.train();
  const scope = scopeModule.__freezeSnapshotScopeV01();

  if (router.routeIds.length !== 22) throw new Error(`router route count ${router.routeIds.length} != 22`);
  if (router.routeHead.weights.length !== 22 || router.routeHead.weights.some((row) => row.length !== 512)) throw new Error('router weight shape mismatch');
  if (router.routeHead.biases.length !== 22) throw new Error('router bias shape mismatch');
  if (scope.weights.length !== 512 || !Number.isFinite(scope.bias) || !Number.isFinite(scope.threshold)) throw new Error('scope shape/value mismatch');

  const artifact = {
    version:'0.2',
    status:'frozen_representation_corrected',
    scope:'liuyao_semantic_v013_dependencies',
    representationCorrection:{
      reason:'runtime_single_text_embedding_must_match_training_calibration_and_eval',
      executionContract:sourceRecord(EXECUTION_CONTRACT),
      textsPerEncoderCall:1,
      legacyArtifact:'data/liuyao-semantic-frozen-dependencies-v0.1.json',
      legacyArtifactMutated:false,
      freshGeneralizationClaim:false
    },
    contract:{
      historicalAlgorithmsModified:false,
      onlyEmbeddingExecutionModified:true,
      runtimePolicy:'load_frozen_only',
      forbiddenRuntimeOperations:['router.train','scopeGate.train','calibrateScope']
    },
    encoder:{
      modelId:MODEL_ID,
      revision:MODEL_REVISION,
      transformersJsVersion:TRANSFORMERS_VERSION,
      dtype:'q8',
      vectorSize:512,
      pooling:'mean',
      normalize:true,
      textsPerEncoderCall:1
    },
    router:{
      version:'0.8.1-single-embedding',
      source:sourceRecord(ROUTER_SOURCE),
      trainingSources:ROUTER_TRAINING.map(sourceRecord),
      routeOrder:router.routeIds,
      routeHead:router.routeHead,
      generationValidation:{
        routeCount:routerTraining.routeCount,
        validationCount:routerTraining.validationCount,
        validationMetrics:routerTraining.validationMetrics,
        evidenceStatus:'development_reprocessed_not_fresh'
      }
    },
    scopeGate:{
      version:'0.1-single-embedding',
      source:sourceRecord(SCOPE_SOURCE),
      trainingSources:SCOPE_TRAINING.map(sourceRecord),
      gate:{ weights:scope.weights, bias:scope.bias },
      originalThreshold:scope.threshold,
      generationCalibration:{ ...scopeTraining.calibration, evidenceStatus:'development_reprocessed_not_fresh' }
    },
    semanticStackPolicy:{
      legacyHardVetoCutoff:LEGACY_HARD_VETO_CUTOFF,
      legacyHardVetoTransferStatus:'requires_candidate_revalidation_before_use'
    },
    generator:{
      script:sourceRecord('scripts/generate-liuyao-semantic-frozen-dependencies-v02.mjs'),
      nodeVersion:process.version
    }
  };

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.writeFileSync(OUT, serialized, 'utf8');
  const artifactSha256 = sha256Text(serialized);
  const lock = {
    version:'0.2',
    status:'locked_representation_corrected',
    artifact:'data/liuyao-semantic-frozen-dependencies-v0.2.json',
    artifactSha256,
    encoderRevision:MODEL_REVISION,
    textsPerEncoderCall:1,
    executionContractSha256:sha256File(EXECUTION_CONTRACT),
    legacyHardVetoCutoff:LEGACY_HARD_VETO_CUTOFF,
    legacyHardVetoTransferStatus:'requires_candidate_revalidation_before_use'
  };
  fs.writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  console.log(`Representation-corrected dependency artifact SHA-256: ${artifactSha256}`);
} finally {
  for (const file of [tmpRouter, tmpScope]) {
    try { fs.unlinkSync(file); } catch {}
  }
}
