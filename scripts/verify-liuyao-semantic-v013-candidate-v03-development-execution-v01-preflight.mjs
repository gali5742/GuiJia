import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson(contractPath);
assert(contract.version === '0.13-candidate-v0.3-development-execution-v0.1-contract-v0.1', `contract version drift: ${contract.version}`);
assert(contract.status === 'locked_before_first_corrected_development_encoder_scoring', `contract status drift: ${contract.status}`);
assert(contract.invariants?.routeCount === 22 && contract.invariants?.routeInventoryExpansionForbidden === true, 'route inventory expansion boundary drift');
assert(contract.invariants?.newThemeResearchImportForbidden === true, 'new-theme import boundary drift');
assert(contract.invariants?.traditionalLiuYaoFeaturesForbidden === true, 'traditional feature boundary drift');
assert(contract.invariants?.healthDiseaseDivinationRowsForbidden === true, 'health/disease boundary drift');
assert(contract.independentEvaluation?.readDuringDevelopment === false, 'contract permits independent evaluation read');
assert(contract.corpusIsolation?.independentOrBlindCorpusReadForbidden === true, 'contract permits independent/blind corpus overlap read');
assert(contract.freshDevelopment?.mustBeCommittedBeforeFirstEncoderScoring === true, 'development seal commit-before-score boundary missing');
const correction = contract.freshDevelopment.executionPresealCorrection;
assert(correction?.correctionsApplied === 2 && Array.isArray(correction.corrections) && correction.corrections.length === 2, 'execution preseal correction ledger count drift');
const correctionById = new Map(correction.corrections.map((item) => [item.targetId, item]));
const d089 = correctionById.get('V013-V03-D-089');
assert(d089?.expectedDisposition === 'route_known' && d089?.expectedRoute === 'financial_fortune' && d089?.expectedCandidatePath === 'fallback_head' && d089?.reason === 'deterministic_path_alignment', 'D-089 execution correction contract drift');
const d166 = correctionById.get('V013-V03-D-166');
assert(d166?.expectedDisposition === 'non_route' && d166?.expectedRoute == null && d166?.expectedCandidatePath == null && d166?.nonRouteSubtype === 'route_unresolved' && d166?.reason === 'exact_prior_calibration_overlap_removal', 'D-166 execution correction contract drift');
assert(correction.corrections.every((item) => item.encoderScoringObserved === false), 'execution preseal correction observed encoder scoring');
assert(correction.independentEvaluationRead === false, 'execution preseal correction read independent evaluation');
assert(correction.labelsChanged === false && correction.modelOrThresholdChanged === false && correction.verifierWeakened === false, 'execution preseal correction changes protected semantics');
assert(contract.freshDevelopment?.trainingEligible === false && contract.freshDevelopment?.thresholdCalibrationEligible === false, 'development data training/calibration eligibility drift');

const checkBlob = (entry, label) => {
  assert(entry?.path && entry?.gitBlobSha, `${label} contract entry incomplete`);
  assert(gitBlobSha(entry.path) === entry.gitBlobSha, `${label} Git blob drift: ${gitBlobSha(entry.path)} != ${entry.gitBlobSha}`);
  if (entry.sha256) assert(sha256(entry.path) === entry.sha256, `${label} SHA-256 drift`);
};
checkBlob(contract.historicalDesign, 'historical design');
checkBlob(contract.freshDevelopment.baseGenerator, 'fresh development base generator');
checkBlob(contract.freshDevelopment.presealPatch, 'fresh development preseal patch');
checkBlob(contract.freshDevelopment.executionPresealCorrection, 'fresh development execution preseal correction');
checkBlob(contract.correctedFrozenDependencies.artifact, 'corrected frozen dependencies');
checkBlob(contract.correctedFrozenDependencies.lock, 'corrected frozen dependencies lock');
checkBlob(contract.correctedFrozenDependencies.routeabilityBase, 'corrected Routeability base');
checkBlob(contract.correctedFrozenDependencies.routeabilityThresholdSource, 'corrected Routeability threshold source');
checkBlob(contract.correctedFallbackIdentity.model, 'corrected Fallback model');
checkBlob(contract.correctedFallbackIdentity.modelLock, 'corrected Fallback model lock');
checkBlob(contract.correctedFallbackIdentity.runtimeLock, 'corrected Fallback runtime lock');
checkBlob(contract.execution.embeddingContract, 'embedding execution contract');

const design = readJson(contract.historicalDesign.path);
const fallbackLock = readJson(contract.correctedFallbackIdentity.modelLock.path);
const runtimeLock = readJson(contract.correctedFallbackIdentity.runtimeLock.path);
const execution = readJson(contract.execution.embeddingContract.path);
const routeabilityThresholdArtifact = readJson(contract.correctedFrozenDependencies.routeabilityThresholdSource.path);
assert(design.evaluationPolicy?.freshV03DevelopmentRequired === true, 'historical design does not require fresh v0.3 development');
assert(design.evaluationPolicy?.candidateLockBeforeIndependent === true, 'historical design candidate-lock boundary drift');
const gates = design.evaluationPolicy?.promotionGates || {};
for (const [key, value] of Object.entries({
  minimumKnownExactRoute:0.8,
  minimumAcceptedRouteAccuracy:0.98,
  maximumOverallFalseRouteActivation:0.05,
  maximumFalseRouteActivationPerNonRouteSubtype:0.05,
  requireNoStructuralPathCollapse:true
})) assert(gates[key] === value && contract.promotionPolicy[key] === value, `promotion gate ${key} drift`);

assert(fallbackLock.status === 'locked', 'corrected Fallback model lock is not locked');
assert(fallbackLock.artifactSha256 === contract.correctedFallbackIdentity.model.sha256, 'Fallback artifact SHA binding drift');
assert(fallbackLock.globalThreshold === contract.thresholds.fallbackIdentityGlobal, 'Fallback threshold contract drift');
assert(fallbackLock.routeabilityThreshold === contract.thresholds.routeability, 'Routeability threshold contract drift');
assert(fallbackLock.scopeHardVetoCutoff === contract.thresholds.scopeHardVeto, 'Scope cutoff contract drift');
assert(fallbackLock.routeSpecificThresholds === false && contract.correctedFallbackIdentity.routeSpecificThresholds === false, 'route-specific Fallback thresholds enabled');
assert(routeabilityThresholdArtifact.calibration?.threshold === contract.thresholds.routeability, 'Routeability threshold artifact drift');
assert(execution.canonicalExecution?.textsPerEncoderCall === 1, 'embedding execution contract is not single-text');
assert(contract.execution.canonicalTextsPerEncoderCall === 1 && contract.execution.multiTextFeatureExtractionBatchForbidden === true, 'Phase C execution shape drift');
assert(contract.thresholds.retuningAllowedDuringDevelopment === false, 'Phase C permits threshold retuning');
assert(contract.historicalDesign.legacyThresholdValuesInherited === false, 'legacy design thresholds marked inherited');
assert(contract.thresholds.routeability !== design.plannedModules?.routeability?.threshold, 'legacy Routeability design threshold was inherited');
assert(contract.thresholds.scopeHardVeto !== design.plannedModules?.finalization?.scopeHardVeto, 'legacy Scope design cutoff was inherited');

for (const [relative, expectedBlob] of Object.entries(runtimeLock.modules || {})) {
  assert(gitBlobSha(relative) === expectedBlob, `frozen Candidate runtime module drift: ${relative}`);
}
assert(runtimeLock.invariants?.routeabilityThreshold === contract.thresholds.routeability, 'runtime-lock Routeability threshold mismatch');
assert(runtimeLock.invariants?.scopeHardVetoCutoff === contract.thresholds.scopeHardVeto, 'runtime-lock Scope cutoff mismatch');
assert(runtimeLock.execution?.canonicalTextsPerEncoderCall === 1, 'runtime lock is not single-text');
assert(contract.execution.temporaryRouteabilityThresholdInstrumentation.moduleGitBlobSha === runtimeLock.modules?.[contract.execution.temporaryRouteabilityThresholdInstrumentation.module], 'Routeability instrumentation module blob mismatch');
assert(contract.execution.temporaryRouteabilityThresholdInstrumentation.requiredExactReplacementCount === 1, 'Routeability threshold instrumentation replacement count drift');

console.log('Candidate v0.3 corrected development preflight verified before data generation/scoring.');
console.log(JSON.stringify({
  routeCount:contract.invariants.routeCount,
  rows:contract.freshDevelopment.expectedCounts.total,
  presealCorrections:correction.corrections.map((item) => ({ id:item.targetId, reason:item.reason })),
  routeabilityThreshold:contract.thresholds.routeability,
  scopeHardVetoCutoff:contract.thresholds.scopeHardVeto,
  fallbackIdentityGlobalThreshold:contract.thresholds.fallbackIdentityGlobal,
  canonicalTextsPerEncoderCall:contract.execution.canonicalTextsPerEncoderCall,
  independentEvaluationReadDuringDevelopment:contract.independentEvaluation.readDuringDevelopment,
  promotionPolicy:contract.promotionPolicy
}, null, 2));
