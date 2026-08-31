import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-embedding-execution-contract-v0.1.json');
const audit = readJson('data/liuyao-semantic-embedding-batch-invariance-audit-v0.1.json');

assert(contract.version === '0.13-semantic-embedding-execution-v0.1', `embedding contract version ${contract.version}`);
assert(contract.status === 'frozen_after_batch_invariance_audit', `embedding contract status ${contract.status}`);
assert(contract.scope === 'liuyao_semantic_learned_stack', 'embedding contract scope drift');
assert(contract.encoder?.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift');
assert(contract.encoder?.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift');
assert(contract.encoder?.transformersJsVersion === '4.2.0', 'Transformers.js version drift');
assert(contract.encoder?.dtype === 'q8' && contract.encoder?.vectorSize === 512, 'encoder vector contract drift');
assert(contract.encoder?.pooling === 'mean' && contract.encoder?.normalize === true, 'encoder pooling contract drift');
assert(contract.canonicalInvocation?.textsPerEncoderCall === 1, 'canonical embedding must be single-text');
assert(contract.canonicalInvocation?.multiTextEncoderBatchAllowed === false, 'multi-text encoder batching must remain forbidden');
assert(contract.canonicalInvocation?.outerLoopOrConcurrencyAllowed === true, 'outer-loop execution should remain allowed');

assert(audit.version === '0.13-embedding-batch-invariance-audit-v0.1', 'batch-invariance audit missing');
assert(audit.status === 'diagnostic_only' && audit.sampleCount === 24, 'batch-invariance audit contract drift');
const b6 = audit.comparisons?.single_vs_batch6;
const b24 = audit.comparisons?.single_vs_batch24;
assert(b6?.routerTop1Changes > 0 || b6?.routeabilityDispositionChanges > 0 || b6?.routerTop2SetChanges > 0, 'batch6 audit no longer demonstrates semantic drift');
assert(b24?.routerTop2SetChanges > 0, 'batch24 audit no longer demonstrates candidate-set drift');
assert(b6?.maxIdentityProbabilityDelta > 0.01 && b24?.maxIdentityProbabilityDelta > 0.01, 'Identity probability drift evidence unexpectedly weak');

for (const legacy of [
  'data/liuyao-semantic-frozen-dependencies-v0.1.json',
  'data/liuyao-semantic-routeability-v0.2.json',
  'data/liuyao-semantic-fallback-identity-v0.1.json'
]) {
  assert(contract.legacyArtifacts?.[legacy]?.includes('legacy_batched'), `legacy batched artifact not declared: ${legacy}`);
}
assert(contract.migrationPolicy?.mutateLegacyArtifactInPlace === false, 'legacy artifact mutation must remain forbidden');
assert(contract.migrationPolicy?.correctedArtifactsRequireNewVersion === true, 'corrected artifacts must version-bump');
assert(contract.migrationPolicy?.oldBlindOrIndependentDataMayTrainCorrectedArtifacts === false, 'old blind/independent data must not train corrected artifacts');
assert(contract.migrationPolicy?.existingTrainingDataMayBeReembedded === true, 'existing train data must be allowed for representation correction');
assert(contract.migrationPolicy?.representationCorrectedCalibrationIsNotFreshGeneralizationEvidence === true, 'corrected calibration must not be misreported as fresh evidence');
assert(contract.migrationPolicy?.freshPostLockIndependentEvalRequired === true, 'fresh post-lock independent eval remains mandatory');

const routerSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-router-poc-v081.js'), 'utf8');
const scopeSource = fs.readFileSync(path.join(root, 'js/liuyao-semantic-scope-gate-v01.js'), 'utf8');
const routeabilityGenerator = fs.readFileSync(path.join(root, 'scripts/generate-liuyao-semantic-routeability-v02-model.mjs'), 'utf8');
const fallbackTrainer = fs.readFileSync(path.join(root, 'scripts/train-liuyao-semantic-v013-fallback-identity-v01.mjs'), 'utf8');
assert(routerSource.includes('chunkSize=24'), 'historical Router batched provenance changed unexpectedly');
assert(scopeSource.includes('chunkSize=24'), 'historical Scope batched provenance changed unexpectedly');
assert(routeabilityGenerator.includes('chunkSize=24'), 'historical Routeability batched provenance changed unexpectedly');
assert(fallbackTrainer.includes('chunkSize=24'), 'Fallback Identity v0.1 batched provenance changed unexpectedly');

console.log('LiuYao semantic embedding execution contract verified.');
console.log('- canonical learned-stack embedding: one text per encoder call');
console.log('- multi-text batches are empirically non-invariant and forbidden for corrected artifacts');
console.log('- Router/Scope/Routeability/Fallback v0.1/v0.2 legacy artifacts remain immutable historical baselines');
