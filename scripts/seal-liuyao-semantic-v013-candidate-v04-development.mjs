import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const developmentPath = 'data/liuyao-semantic-v013-candidate-v04-development.json';
const lockPath = 'data/liuyao-semantic-v013-candidate-v04-development.lock.json';
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json';
const designPath = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const dataContractPath = 'data/liuyao-semantic-v013-candidate-v04-data-contract-v0.1.json';
const generatorPath = 'scripts/generate-liuyao-semantic-v013-candidate-v04-development.mjs';
const verifierPath = 'scripts/verify-liuyao-semantic-v013-candidate-v04-development.mjs';

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const gitBlobSha = (buffer) => crypto.createHash('sha1')
  .update(Buffer.from(`blob ${buffer.length}\0`))
  .update(buffer)
  .digest('hex');

execFileSync(process.execPath, [path.join(root, verifierPath)], { cwd:root, stdio:'inherit' });

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath));
const developmentBuffer = read(developmentPath);
const runtimeBuffer = read(runtimeLockPath);
const designBuffer = read(designPath);
const dataContractBuffer = read(dataContractPath);
const generatorBuffer = read(generatorPath);
const verifierBuffer = read(verifierPath);
const development = JSON.parse(developmentBuffer.toString('utf8'));

const lock = {
  version:'0.13-candidate-v0.4-development-lock-v0.1',
  status:'locked_before_first_development_encoder_scoring',
  scope:'liuyao_semantic_decision_stack_v0.13_candidate_v0.4_fresh_development',
  dataset:{
    path:developmentPath,
    sha256:sha256(developmentBuffer),
    gitBlobSha:gitBlobSha(developmentBuffer),
    bytes:developmentBuffer.length,
    rows:development.rows.length,
    counts:development.counts
  },
  frozenRuntime:{
    path:runtimeLockPath,
    sha256:sha256(runtimeBuffer),
    gitBlobSha:gitBlobSha(runtimeBuffer),
    version:'0.13-candidate-v0.4-runtime-lock-v0.1',
    fallbackGlobalThreshold:0.5549057227178391,
    semanticActThreshold:0.5045675974201208,
    routeabilityThreshold:0.7678148573595883,
    routeInventoryCount:22
  },
  governingDesign:{ path:designPath, sha256:sha256(designBuffer), gitBlobSha:gitBlobSha(designBuffer) },
  governingDataContract:{ path:dataContractPath, sha256:sha256(dataContractBuffer), gitBlobSha:gitBlobSha(dataContractBuffer) },
  generation:{ generatorPath, generatorSha256:sha256(generatorBuffer), verifierPath, verifierSha256:sha256(verifierBuffer), encoderScoringPerformedBeforeSeal:false },
  isolation:{
    exactAndNearDuplicateAuditRequired:true,
    v04TrainingCalibrationOverlapForbidden:true,
    candidateV03DevelopmentOverlapForbidden:true,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    traditionalLiuYaoFeaturesUsed:false
  },
  immutability:{
    datasetMutationAfterSealForbidden:true,
    wordingMutationAfterScoringForbidden:true,
    rowAddRemoveAfterSealForbidden:true,
    thresholdOrModelTuningFromThisCohortForbidden:true,
    failureMustBePreservedAsImmutableEvidence:true
  },
  nextAction:'run_first_frozen_candidate_v04_development_scoring_without_mutating_dataset_or_runtime'
};

const expected = `${JSON.stringify(lock, null, 2)}\n`;
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  if (!fs.existsSync(path.join(root, lockPath))) throw new Error(`Missing sealed development lock: ${lockPath}`);
  const actual = fs.readFileSync(path.join(root, lockPath), 'utf8');
  if (actual !== expected) throw new Error('Candidate v0.4 development lock does not match the current sealed dataset/runtime/governance assets');
  console.log(JSON.stringify({ ok:true, mode:'check', lockPath, datasetSha256:lock.dataset.sha256 }, null, 2));
} else {
  fs.writeFileSync(path.join(root, lockPath), expected);
  console.log(JSON.stringify({ ok:true, mode:'seal', lockPath, datasetSha256:lock.dataset.sha256 }, null, 2));
}
