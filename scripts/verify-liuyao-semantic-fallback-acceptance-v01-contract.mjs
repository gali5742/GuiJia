import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson('data/liuyao-semantic-fallback-acceptance-v0.1-contract.json');
const execution = readJson('data/liuyao-semantic-embedding-execution-contract-v0.1.json');
const dependencies = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.lock.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.4.lock.json');
const identity = readJson('data/liuyao-semantic-fallback-identity-v0.2.lock.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');

assert(contract.version === '0.13-fallback-acceptance-v0.1-contract-v0.1', `contract version ${contract.version}`);
assert(contract.status === 'frozen_architecture_before_fresh_calibration', `contract status ${contract.status}`);
assert(contract.scope === 'liuyao_semantic_pure_fallback_acceptance', 'contract scope drift');
assert(execution.status === 'frozen_after_batch_invariance_audit', 'embedding execution contract missing');
assert(execution.canonicalInvocation?.textsPerEncoderCall === 1 && execution.canonicalInvocation?.multiTextEncoderBatchAllowed === false, 'canonical single-text execution drift');
assert(dependencies.status === 'locked_representation_corrected', 'corrected dependency lock missing');
assert(routeability.status === 'locked_representation_corrected', 'corrected Routeability lock missing');
assert(identity.status === 'locked_representation_corrected', 'corrected Identity lock missing');
assert(inventory.routes?.length === 22, `route inventory ${inventory.routes?.length} != 22`);

const applicability = contract.applicability || {};
assert(applicability.path === 'pure_fallback_only', 'gate must remain pure-fallback only');
assert((applicability.requirements || []).some((value) => value.includes('unsupportedTargets')), 'unsupported target requirement missing');
assert((applicability.requirements || []).some((value) => value.includes('Arbitration v0.12')), 'Arbitration=null requirement missing');
assert(applicability.explicitUnsupportedTarget === 'handled_before_this_gate', 'unsupported targets must stay upstream');
assert(applicability.strongOrSupportArbitration === 'handled_before_this_gate', 'strong/support Arbitration must stay upstream');

const ranker = contract.ranker || {};
assert(ranker.candidateUniverse === 'all_22_routes', 'Identity ranker must cover all 22 routes');
assert(ranker.selection === 'global_argmax_identity_probability', 'Identity selection must remain global argmax');
assert(ranker.routerTopKAsHardCandidateBoundary === false, 'Router TopK must not gate pure fallback Identity');
assert(ranker.routerMayOverrideIdentityTop1 === false, 'Router may not override Identity Top1');
assert(ranker.routeSpecificRankingParameters === false && ranker.weightsRetuned === false, 'ranker must remain frozen/global');

const gate = contract.gate || {};
assert(gate.type === 'two_global_threshold_conjunction', 'gate architecture drift');
assert(JSON.stringify(gate.features) === JSON.stringify(['corrected_routeability_probability','identity_global_top1_probability']), 'gate feature set drift');
assert(gate.marginThreshold === null && gate.routerConfidenceThreshold === null, 'diagnostic-only extra thresholds must not enter v0.1 gate');
assert(gate.routeSpecificThresholdsAllowed === false, 'route-specific gate thresholds forbidden');
assert(gate.onAccept === 'select_identity_global_top1_route', 'accept action drift');
assert(gate.onReject === 'fallback_unresolved' && gate.rejectDoesNotAssertOutOfScope === true, 'reject must abstain rather than assert out-of-scope');

const calibration = contract.freshCalibration || {};
assert(calibration.required === true && calibration.createdAfterContractFreeze === true, 'fresh post-contract calibration required');
assert(calibration.useForTraining === false && calibration.useAsDevelopmentEval === false && calibration.reuseAsIndependent === false && calibration.reuseAsBlind === false, 'calibration role drift');
assert(calibration.thresholdPolicy.includes('one global Routeability') && calibration.thresholdPolicy.includes('one global Identity'), 'two-global-threshold policy missing');
assert(calibration.constraints?.minimumAcceptedRouteAccuracy === 0.98, 'accepted accuracy gate drift');
assert(calibration.constraints?.maximumOverallNonRouteFalseActivation === 0.05, 'overall false activation gate drift');
assert(calibration.constraints?.maximumFalseActivationPerNonRouteSubtype === 0.05, 'subtype false activation gate drift');
const forbidden = new Set(calibration.forbiddenSources || []);
assert(forbidden.has('data/liuyao-semantic-fallback-identity-v0.1-calibration.json'), 'old Fallback calibration must be forbidden');
assert([...forbidden].some((value) => value.includes('independent')), 'independent corpora must remain forbidden');
assert([...forbidden].some((value) => value.includes('sealed blind')), 'sealed blind corpora must remain forbidden');

assert(contract.representation?.textsPerEncoderCall === 1 && contract.representation?.multiTextEncoderBatchAllowed === false, 'representation contract drift');
assert(contract.evidenceDiscipline?.oldFallbackCalibrationMayCalibrateThisGate === false, 'old Fallback calibration reuse forbidden');
assert(contract.evidenceDiscipline?.diagnosticThresholdsMayBecomeProductionThresholds === false, 'diagnostic thresholds cannot become production thresholds');
assert(contract.evidenceDiscipline?.freshPostCandidateLockIndependentRequired === true, 'post-lock independent requirement missing');

console.log('LiuYao Fallback Acceptance Gate v0.1 architecture contract verified.');
console.log('- pure fallback ranking: frozen Identity v0.2 global argmax across all 22 routes');
console.log('- acceptance: exactly two global thresholds (Routeability + Identity Top1)');
console.log('- Router TopK and margin are not acceptance boundaries');
console.log('- old Fallback calibration is development-only and forbidden for v0.1 gate calibration');
console.log(`- corrected dependency SHA: ${dependencies.artifactSha256}`);
console.log(`- corrected Routeability SHA: ${routeability.artifactSha256}`);
console.log(`- corrected Identity SHA: ${identity.artifactSha256}`);
console.log(`- contract SHA-256: ${sha256('data/liuyao-semantic-fallback-acceptance-v0.1-contract.json')}`);
