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
const replaceExact = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`representation-correction patch anchor missing: ${label}`);
  return source.replace(before, after);
};

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

  if (router.routeIds.length !== 22 || router.routeHead.weights.length !== 22 || router.routeHead.weights.some((row)=>row.length!==512)) throw new Error('corrected router shape mismatch');
  if (scope.weights.length !== 512 || !Number.isFinite(scope.bias) || !Number.isFinite(scope.threshold)) throw new Error('corrected scope shape mismatch');

  const artifact = {
    version:'0.2',
    status:'frozen',
    scope:'liuyao_semantic_v013_dependencies_representation_corrected',
    correction:{
      type:'embedding_execution_only',
      canonicalTextsPerEncoderCall:1,
      executionContract:sourceRecord(EXECUTION_CONTRACT),
      legacyArtifact:{ path:LEGACY_ARTIFACT, sha256:sha256File(LEGACY_ARTIFACT), mutationAllowed:false },
      sameTrainingData:true,
      sameAlgorithms:true,
      sameHyperparameters:true,
      freshGeneralizationEvidence:false
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
      generationCalibration:{ ...scopeTraining.calibration, evidenceClass:'representation_correction_only' }
    },
    semanticStackPolicy:{
      hardVetoCutoff:null,
      hardVetoStatus:'requires_candidate_revalidation',
      legacyHardVetoCutoff:0.4196,
      legacyCutoffInherited:false
    },
    generator:sourceRecord('scripts/generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs')
  };
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  fs.writeFileSync(OUT, serialized, 'utf8');
  const artifactSha256 = sha256Text(serialized);
  const lock = {
    version:'0.2', status:'locked', artifact:'data/liuyao-semantic-frozen-dependencies-v0.2.json', artifactSha256,
    executionContractSha256:sha256File(EXECUTION_CONTRACT), encoderRevision:MODEL_REVISION, canonicalTextsPerEncoderCall:1,
    scopeHardVetoCutoff:null, scopeHardVetoStatus:'requires_candidate_revalidation', legacyHardVetoCutoff:0.4196
  };
  fs.writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  console.log(`Corrected frozen dependencies SHA-256: ${artifactSha256}`);
  console.log(`Corrected Scope original threshold: ${scope.threshold}`);
} finally {
  for (const file of [tmpRouter,tmpScope]) { try { fs.unlinkSync(file); } catch {} }
}
