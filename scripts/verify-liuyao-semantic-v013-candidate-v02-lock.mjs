import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => createHash('sha256').update(read(relative)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const candidatePath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.json';
const lockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json';
const candidate = readJson(candidatePath);
const lock = readJson(lockPath);
const routeability = readJson('data/liuyao-semantic-routeability-v0.3.json');
const routeabilityLock = readJson('data/liuyao-semantic-routeability-v0.3.lock.json');
const frozenLock = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.lock.json');
const developmentReport = readJson('data/liuyao-semantic-v013-candidate-v02-development-report.json');
const safetySweep = readJson('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json');

assert(candidate.version === '0.13-candidate-v0.2' && candidate.status === 'frozen_candidate', 'unexpected candidate v0.2 metadata');
assert(lock.version === '0.13-candidate-v0.2-lock' && lock.status === 'locked', 'unexpected candidate v0.2 lock metadata');
assert(lock.candidatePath === candidatePath, 'candidate lock path mismatch');
assert(lock.candidateSha256 === sha256(candidatePath), 'candidate SHA drift');
assert(candidate.modernSemanticOnly === true, 'candidate must remain modern-semantic only');

assert(candidate.routeability?.policyVersion === 'v0.4', 'Routeability responsibility policy must be v0.4');
assert(candidate.routeability?.baseModelVersion === 'v0.2', 'Routeability model weights must remain v0.2');
assert(candidate.routeability?.baseModelSha256 === routeability.baseModel?.sha256, 'base Routeability model SHA mismatch');
assert(candidate.routeability?.threshold === routeability.calibration?.threshold, 'threshold changed after v0.3 calibration freeze');
assert(candidate.routeability?.thresholdArtifactSha256 === routeabilityLock.artifactSha256, 'threshold artifact mismatch');
assert(candidate.routeability?.thresholdRetunedForCandidateV02 === false, 'candidate v0.2 must not retune threshold');
assert(candidate.routeability?.belowThresholdConfirmedSupportRescue === true, 'confirmed support rescue missing');
assert(candidate.routeability?.compatibleOnlySupportRescue === false, 'compatible-only support rescue must stay disabled');

assert(candidate.selection?.version === 'v0.3', 'Selection v0.3 required');
assert(candidate.selection?.acceptedGateSupportPriority === true, 'support priority missing');
assert(candidate.selection?.supportPriorityMayOverrideOtherConfirmedCandidate === false, 'support priority must not override another confirmed candidate');
assert(candidate.finalization?.version === 'v0.1', 'Finalization v0.1 required');
assert(candidate.finalization?.scopeHardVeto === 0.4196, 'legacy Scope hard-veto cutoff changed');
assert(candidate.finalization?.confirmedStrongScopeBypass === true, 'confirmed strong Scope bypass missing');
assert(candidate.finalization?.supportScopeBypass === false, 'support must not bypass Scope');

assert(candidate.router?.dependencyArtifactSha256 === frozenLock.artifactSha256, 'frozen Router dependency SHA mismatch');
assert(lock.frozenDependencyArtifactSha256 === frozenLock.artifactSha256, 'lock frozen dependency SHA mismatch');
assert(lock.thresholdArtifactSha256 === routeabilityLock.artifactSha256, 'lock threshold artifact SHA mismatch');
assert(developmentReport.readyForCandidateLock === true, 'pre-lock development report not ready');
assert(lock.preLockDevelopmentReportSha256 === sha256('data/liuyao-semantic-v013-candidate-v02-development-report.json'), 'development report SHA mismatch');
assert(lock.responsibilitySafetySweepSha256 === sha256('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json'), 'safety sweep SHA mismatch');
for (const key of [
  'strongConfirmedScopeBypassNewActivations',
  'supportPriorityNewActivations',
  'belowThresholdSupportConfirmedNewActivations'
]) {
  assert(safetySweep.pooledSafety?.[key] === 0, `unsafe pre-lock responsibility result: ${key}`);
}

for (const source of candidate.runtimeSources || []) {
  assert(!source.path.includes('independent'), `independent evaluation leaked into runtime source list: ${source.path}`);
  assert(sha256(source.path) === source.sha256, `runtime source SHA drift: ${source.path}`);
}
for (const source of candidate.preLockEvidence || []) {
  assert(!source.path.includes('independent'), `old independent evaluation must not become candidate v0.2 pre-lock evidence: ${source.path}`);
  assert(sha256(source.path) === source.sha256, `pre-lock evidence SHA drift: ${source.path}`);
}

assert(candidate.evaluationPolicy?.candidateV01IndependentEvalIsNotIndependentEvidenceForCandidateV02 === true, 'old independent eval boundary missing');
assert(candidate.evaluationPolicy?.independentEvalMustBeFreshAfterThisLock === true, 'fresh post-lock independent eval required');
assert(candidate.evaluationPolicy?.independentEvalMayNotTrainCalibrateOrRetuneThisCandidate === true, 'post-lock no-retune policy missing');

const responsibilitySources = [
  'js/liuyao-semantic-routeability-v04.js',
  'js/liuyao-semantic-route-selection-v03.js',
  'js/liuyao-semantic-finalization-v01.js'
].map((relative) => read(relative).toString('utf8')).join('\n');
for (const term of ['妻财','官鬼','父母爻','兄弟爻','子孙爻','世爻','应爻','用神']) {
  assert(!responsibilitySources.includes(term), `traditional field leaked into modern semantic responsibility code: ${term}`);
}
for (const forbidden of ['.train(', 'calibrate(', 'fit(']) {
  assert(!responsibilitySources.includes(forbidden), `runtime responsibility code must not train/calibrate: ${forbidden}`);
}

console.log('LiuYao v0.13-v0.2 candidate lock verified.');
console.log(`- candidate SHA-256: ${lock.candidateSha256}`);
console.log(`- Routeability base model unchanged: ${candidate.routeability.baseModelSha256}`);
console.log(`- threshold unchanged: ${candidate.routeability.threshold}`);
console.log('- fresh post-lock independent evaluation required');
