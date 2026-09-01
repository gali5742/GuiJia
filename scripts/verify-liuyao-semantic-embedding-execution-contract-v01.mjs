import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readBytes = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(readBytes(relative).toString('utf8'));
const gitBlobSha = (relative) => {
  const bytes = readBytes(relative);
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-embedding-execution-contract-v0.1.json');
assert(contract.version === '0.13-semantic-embedding-execution-contract-v0.1', `execution contract version drift: ${contract.version}`);
assert(contract.status === 'locked_before_representation_correction', `execution contract status drift: ${contract.status}`);
assert(contract.canonicalExecution?.textsPerEncoderCall === 1, 'canonical encoder invocation must contain exactly one text');
assert(contract.canonicalExecution?.multiTextFeatureExtractionBatchForbidden === true, 'multi-text encoder batches must remain forbidden');
for (const phase of ['training','calibration','development','independent','browser_runtime']) {
  assert(contract.canonicalExecution.appliesTo?.includes(phase), `execution contract missing phase: ${phase}`);
}
assert(contract.encoder?.modelId === 'Xenova/bge-small-zh-v1.5', 'encoder model drift');
assert(contract.encoder?.revision === '75c43b069aac4d136ba6bc1122f995fedcfd2781', 'encoder revision drift');
assert(contract.encoder?.transformersJsVersion === '4.2.0', 'Transformers.js version drift');
assert(contract.encoder?.dtype === 'q8' && contract.encoder?.vectorSize === 512, 'encoder representation drift');
assert(contract.encoder?.pooling === 'mean' && contract.encoder?.normalize === true, 'encoder pooling/normalization drift');
assert(contract.encoder?.changeAllowedForRepresentationCorrection === false, 'representation correction must not change encoder');

const runtimePath = contract.productionEvidence.runtimePath;
assert(gitBlobSha(runtimePath) === contract.productionEvidence.runtimeGitBlobSha, 'production runtime blob drift');
const runtime = readBytes(runtimePath).toString('utf8');
assert(runtime.includes('const [vector] = await embedTexts([normalized]);'), 'normal production classify is no longer single-text');
assert(contract.productionEvidence.effectiveEncoderBatchSize === 1, 'production batch-size evidence drift');

assert(gitBlobSha(contract.executionAudit.path) === contract.executionAudit.gitBlobSha, 'embedding execution audit blob drift');
const audit = readJson(contract.executionAudit.path);
assert(audit.policy?.training === false && audit.policy?.calibration === false && audit.policy?.thresholdSelection === false, 'execution audit eligibility drift');
assert(audit.conclusion?.discreteDecisionDriftObserved === true, 'execution audit no longer records discrete decision drift');

assert(Array.isArray(contract.legacyArtifacts) && contract.legacyArtifacts.length === 4, 'legacy learned artifact inventory drift');
for (const item of contract.legacyArtifacts) {
  assert(item.status === 'legacy_batched_representation', `legacy status drift: ${item.path}`);
  assert(item.mutationAllowed === false, `legacy mutation unexpectedly allowed: ${item.path}`);
  assert(gitBlobSha(item.path) === item.gitBlobSha, `legacy artifact mutated: ${item.path}`);
}
assert(contract.representationCorrectionPolicy?.sameOriginalTrainingAndCalibrationCorporaMayBeReused === true, 'representation correction corpus policy drift');
assert(contract.representationCorrectionPolicy?.newSemanticFeaturesAllowed === false, 'new semantic features forbidden during representation correction');
assert(contract.representationCorrectionPolicy?.newEncoderAllowed === false, 'new encoder forbidden during representation correction');
assert(contract.representationCorrectionPolicy?.hyperparameterChangesAllowed === false, 'hyperparameter changes forbidden during representation correction');
assert(contract.representationCorrectionPolicy?.oldCalibrationMayBeReportedAsFreshGeneralizationEvidence === false, 'old calibration cannot become fresh evidence');
assert(contract.representationCorrectionPolicy?.oldDevelopmentOrIndependentMayBeUsedForTraining === false, 'development/independent training contamination');
assert(contract.scopeHardVeto?.legacyValue === 0.4196, 'legacy Scope hard-veto provenance drift');
assert(contract.scopeHardVeto?.inheritIntoCorrectedProbabilitySpace === false, 'legacy Scope cutoff may not be inherited');
assert(contract.scopeHardVeto?.correctedCandidateStatus === 'requires_candidate_revalidation', 'corrected Scope hard-veto must require revalidation');

console.log('LiuYao semantic embedding execution contract v0.1 verified.');
console.log('- canonical encoder invocation: exactly one normalized question');
console.log('- legacy batch24 artifacts: immutable historical baselines');
console.log('- representation correction: same algorithms/data/hyperparameters, execution only');
console.log('- legacy Scope hard-veto 0.4196: not inherited');
