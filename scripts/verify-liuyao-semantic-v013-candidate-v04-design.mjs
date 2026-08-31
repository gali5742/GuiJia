import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const design = readJson('data/liuyao-semantic-v013-candidate-v04-design-v0.1.json');
const acceptance = readJson('data/liuyao-semantic-fallback-acceptance-v0.1.json');
const acceptanceLock = readJson('data/liuyao-semantic-fallback-acceptance-v0.1.lock.json');
const corrected = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.4.json');
const identity = readJson('data/liuyao-semantic-fallback-identity-v0.2.json');

assert(design.version === '0.13-candidate-v0.4-design-v0.1', `design version ${design.version}`);
assert(design.status === 'assembly_frozen_before_scope_revalidation_and_development', `design status ${design.status}`);
assert(design.scope === 'liuyao_semantic_decision_stack_v0.13', 'design scope drift');
assert(design.supersedes?.design === 'data/liuyao-semantic-v013-candidate-v03-design-v0.1.json', 'v0.3 supersession record missing');
assert(design.supersedes?.candidateV03WasLocked === false && design.supersedes?.candidateV03PromotionClaim === false && design.supersedes?.candidateV03IndependentClaim === false, 'v0.3 evidence discipline drift');

const fixed = design.fixedComponents || {};
assert(fixed.policyGate?.path === 'js/liuyao-divination-policy-gate-v01.js', 'Policy Gate path drift');
assert(fixed.evidence?.path === 'js/liuyao-semantic-route-evidence-v03.js', 'Evidence path drift');
assert(fixed.arbitration?.path === 'js/liuyao-semantic-route-arbitration-v012.js', 'Arbitration path drift');
assert(fixed.compatibility?.path === 'js/liuyao-semantic-route-compatibility-v03.js', 'Compatibility path drift');
assert(fixed.embeddingRouterScope?.artifact === 'data/liuyao-semantic-frozen-dependencies-v0.2.json' && fixed.embeddingRouterScope?.textsPerEncoderCall === 1, 'corrected representation dependency drift');
assert(fixed.routeability?.model === 'data/liuyao-semantic-routeability-v0.4.json' && fixed.routeability?.policy === 'js/liuyao-semantic-routeability-v06.js', 'Routeability v0.4/v0.6 assembly drift');
assert(fixed.fallbackIdentityRanker?.artifact === 'data/liuyao-semantic-fallback-identity-v0.2.json' && fixed.fallbackIdentityRanker?.candidateUniverse === 'all_22_routes' && fixed.fallbackIdentityRanker?.routerTopKAsHardBoundary === false, 'Fallback Identity global-ranker contract drift');
assert(fixed.fallbackAcceptance?.artifact === 'data/liuyao-semantic-fallback-acceptance-v0.1.json' && fixed.fallbackAcceptance?.thresholdCount === 2 && fixed.fallbackAcceptance?.thresholdRetuneAllowedInV04 === false, 'Fallback Acceptance freeze drift');
assert(fixed.selection?.path === 'js/liuyao-semantic-route-selection-v05.js', 'Selection v0.5 path drift');
assert(fixed.finalization?.path === 'js/liuyao-semantic-finalization-v02.js', 'Finalization v0.2 path drift');

assert(corrected.status === 'frozen_representation_corrected' && corrected.encoder?.textsPerEncoderCall === 1, 'corrected Router/Scope artifact missing');
assert(routeability.status === 'frozen_representation_corrected' && routeability.encoder?.textsPerEncoderCall === 1, 'corrected Routeability artifact missing');
assert(identity.status === 'frozen_representation_corrected' && identity.encoder?.textsPerEncoderCall === 1 && identity.routeOrder?.length === 22, 'corrected Identity artifact missing');
assert(acceptance.status === 'frozen_fresh_calibrated', 'Fallback Acceptance not frozen');
assert(acceptanceLock.status === 'locked_fresh_calibrated' && acceptanceLock.artifactSha256 === sha256('data/liuyao-semantic-fallback-acceptance-v0.1.json'), 'Fallback Acceptance lock drift');
assert(acceptance.thresholds?.routeabilityAcceptThreshold === 0.7153315637462625 && acceptance.thresholds?.identityAcceptThreshold === 0.6247873002579858, 'frozen Acceptance thresholds changed after v0.4 assembly');
assert(acceptance.calibration?.independentGeneralizationClaim === false, 'calibration must not claim independent generalization');

const scope = design.scopeFinalizationStatus || {};
assert(scope.remainingFreeParameter === 'one_global_scope_hard_veto_cutoff', 'Scope must be the only remaining free parameter');
assert(scope.freshCalibrationRequired === true, 'fresh Scope calibration requirement missing');
assert(scope.legacyHardVetoCutoff === 0.4196 && scope.legacyHardVetoStatus === 'provenance_only_not_validated_for_candidate_v0.4', 'legacy Scope cutoff status drift');
assert(scope.representationCorrectedOriginalThreshold === 0.4781650996230466 && scope.representationCorrectedThresholdStatus === 'development_reprocessed_not_fresh', 'corrected Scope threshold evidence status drift');
for (const key of ['modelWeightsMayChange','fallbackAcceptanceThresholdsMayChange','routeabilityThresholdMayChange','identityWeightsMayChange','routerWeightsMayChange']) {
  assert(scope[key] === false, `${key} must remain false during Scope calibration`);
}

const sc = design.scopeCalibrationContract || {};
assert(sc.mustBeCreatedAfterThisAssemblyFreeze === true && sc.useForTraining === false && sc.useAsIndependent === false && sc.reuseAsBlind === false, 'Scope calibration evidence discipline drift');
assert(sc.parameterCount === 1 && sc.parameter === 'scope_hard_veto_cutoff', 'Scope calibration parameter count drift');
assert(sc.constraints?.minimumAcceptedRouteAccuracy === 0.98 && sc.constraints?.maximumOverallNonRouteFalseActivation === 0.05 && sc.constraints?.maximumFalseActivationPerNonRouteSubtype === 0.05, 'Scope calibration safety constraints drift');
for (const required of ['strong_arbitration','support_arbitration','pure_fallback_acceptance','outside_current_22','route_unresolved','near_domain_not_current_route','confirmed_strong_scope_bypass']) {
  assert(sc.mustExercise?.includes(required), `Scope calibration missing path: ${required}`);
}

const evaluation = design.evaluationPolicy || {};
assert(evaluation.candidateLockBeforeIndependent === true && evaluation.freshPostLockIndependentRequired === true && evaluation.sameVersionRetuneAfterIndependent === false && evaluation.priorIndependentMayNotBeReused === true, 'independent evaluation discipline drift');
assert(evaluation.promotionGates?.minimumKnownExactRoute === 0.8 && evaluation.promotionGates?.minimumAcceptedRouteAccuracy === 0.98, 'promotion accuracy gates drift');
assert(evaluation.promotionGates?.maximumOverallFalseRouteActivation === 0.05 && evaluation.promotionGates?.maximumFalseRouteActivationPerNonRouteSubtype === 0.05 && evaluation.promotionGates?.requireNoStructuralPathCollapse === true, 'promotion safety gates drift');
assert(design.traditionalBoundary?.semanticLayerMayChooseTraditionalLiuYaoObservationRole === false && design.traditionalBoundary?.traditionalRuleRegistryPreserved === true, 'traditional boundary drift');

console.log('LiuYao Candidate v0.4 assembly design verified.');
console.log('- Candidate v0.3 is superseded pre-lock; no promotion/independent claim is inherited');
console.log('- corrected Router/Scope, Routeability v0.4, Identity v0.2 and Acceptance v0.1 are fixed');
console.log('- Fallback Acceptance thresholds are frozen and may not be retuned in v0.4');
console.log('- only remaining free parameter: one global Scope hard-veto cutoff');
console.log('- fresh Scope calibration -> fresh pre-lock development -> Candidate lock -> fresh independent');
