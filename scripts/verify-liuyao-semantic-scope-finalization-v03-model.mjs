import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n, d, empty = 0) => d ? n / d : empty;
const close = (a, b, eps = 1e-12) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps;

const artifactFile = 'data/liuyao-semantic-scope-finalization-v0.3.json';
const lockFile = 'data/liuyao-semantic-scope-finalization-v0.3.lock.json';
const designFile = 'data/liuyao-semantic-v013-candidate-v05-design-v0.1.json';
const calibrationFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration.json';
const calibrationLockFile = 'data/liuyao-semantic-scope-finalization-v0.3-calibration.lock.json';
const correctedFile = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const routeabilityFile = 'data/liuyao-semantic-routeability-v0.4.json';
const identityFile = 'data/liuyao-semantic-fallback-identity-v0.2.json';
const acceptanceFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.json';
const acceptanceLockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.lock.json';
const inventoryFile = 'data/liuyao-semantic-route-inventory-v0.2.json';

const artifact = readJson(artifactFile);
const lock = readJson(lockFile);
const design = readJson(designFile);
const calibration = readJson(calibrationFile);
const calibrationLock = readJson(calibrationLockFile);
const corrected = readJson(correctedFile);
const routeability = readJson(routeabilityFile);
const identity = readJson(identityFile);
const acceptance = readJson(acceptanceFile);
const acceptanceLock = readJson(acceptanceLockFile);
const inventory = readJson(inventoryFile);

assert(artifact.version === '0.13-scope-finalization-v0.3' && artifact.status === 'frozen_fresh_calibrated', 'Scope Finalization v0.3 artifact contract mismatch');
assert(artifact.scope === 'liuyao_semantic_candidate_v0.5_scope_finalization', 'Scope Finalization v0.3 scope drift');
assert(artifact.architecture?.weightMutation === false && artifact.architecture?.otherThresholdsRetuned === false, 'Scope Finalization v0.3 mutated frozen model/gate parameters');
assert(artifact.architecture?.parameter === 'one_global_hard_veto_cutoff', 'Scope Finalization v0.3 parameter contract drift');
assert(artifact.architecture?.hardVetoCondition === 'scope_probability < hard_veto_cutoff', 'Scope hard-veto comparison drift');
assert(artifact.architecture?.confirmedStrongScopeBypass === true && artifact.architecture?.pureFallbackScopeBypass === false, 'Scope bypass contract drift');
assert(artifact.encoder?.textsPerEncoderCall === 1 && artifact.encoder?.vectorSize === 512, 'Scope Finalization v0.3 representation drift');
assert(Number.isFinite(artifact.hardVetoCutoff) && artifact.hardVetoCutoff >= 0 && artifact.hardVetoCutoff <= 1, 'invalid Scope hard-veto cutoff');
assert(calibration.status === 'sealed_fresh_scope_calibration' && calibration.sealed === true, 'Scope v0.3 calibration is not sealed');
assert(calibrationLock.status === 'locked' && calibrationLock.calibrationSha256 === sha256(calibrationFile), 'Scope v0.3 calibration lock drift');
assert(design.status === 'design_frozen_before_v05_calibration_data', 'Candidate v0.5 design status drift');
assert(corrected.status === 'frozen_representation_corrected' && routeability.status === 'frozen_representation_corrected' && identity.status === 'frozen_representation_corrected', 'corrected learned dependencies drift');
assert(acceptance.status === 'frozen_fresh_calibrated' && acceptanceLock.artifactSha256 === sha256(acceptanceFile), 'Fallback Acceptance dependency drift');
assert(inventory.routes?.length === 22, 'route inventory drift');

const expectedDeps = {
  candidateV05Design:[designFile, sha256(designFile)],
  sealedCalibration:[calibrationFile, sha256(calibrationFile)],
  sealedCalibrationLock:[calibrationLockFile, sha256(calibrationLockFile)],
  correctedSemanticDependencies:[correctedFile, sha256(correctedFile)],
  correctedRouteability:[routeabilityFile, sha256(routeabilityFile)],
  correctedIdentity:[identityFile, sha256(identityFile)],
  fallbackAcceptance:[acceptanceFile, sha256(acceptanceFile)],
  fallbackAcceptanceLock:[acceptanceLockFile, sha256(acceptanceLockFile)],
  routeInventory:[inventoryFile, sha256(inventoryFile)]
};
for (const [key, [relative, hash]] of Object.entries(expectedDeps)) {
  assert(artifact.dependencies?.[key]?.path === relative, `${key} path drift`);
  assert(artifact.dependencies?.[key]?.sha256 === hash, `${key} SHA drift`);
}
for (const [relative, hash] of Object.entries(artifact.dependencies?.runtimeSources || {})) {
  assert(fs.existsSync(path.join(root, relative)), `runtime source missing: ${relative}`);
  assert(hash === sha256(relative), `runtime source SHA drift: ${relative}`);
}
assert(artifact.dependencies?.runtimeSources?.['js/liuyao-semantic-route-evidence-v04.js'], 'Evidence v0.4 runtime dependency missing');
assert(artifact.dependencies?.runtimeSources?.['js/liuyao-semantic-route-arbitration-v013.js'], 'Arbitration v0.13 runtime dependency missing');

assert(lock.version === '0.13-scope-finalization-v0.3-lock-v0.1' && lock.status === 'locked_fresh_calibrated', 'Scope Finalization v0.3 lock contract mismatch');
assert(lock.artifactPath === artifactFile && lock.artifactSha256 === sha256(artifactFile), 'Scope Finalization v0.3 artifact lock SHA drift');
assert(lock.calibrationSha256 === sha256(calibrationFile) && lock.calibrationLockSha256 === sha256(calibrationLockFile), 'Scope v0.3 calibration provenance lock drift');
assert(lock.candidateV05DesignSha256 === sha256(designFile), 'Candidate v0.5 design lock drift');
assert(close(lock.hardVetoCutoff, artifact.hardVetoCutoff), 'Scope cutoff lock drift');
assert(lock.weightMutation === false && lock.otherThresholdsRetuned === false, 'Scope v0.3 lock mutation policy drift');
assert(lock.freshPrelockDevelopmentStillRequired === true && lock.freshPostCandidateLockIndependentStillRequired === true, 'future evidence requirement drift');

const rows = artifact.calibration?.scoredRows || [];
assert(rows.length === 222, `Scope v0.3 scored rows ${rows.length} != 222`);
assert(artifact.calibration?.fresh === true && artifact.calibration?.independentGeneralizationClaim === false, 'Scope v0.3 calibration evidence status drift');
assert(artifact.calibration?.knownRows === 132 && artifact.calibration?.nonRouteRows === 90, 'Scope v0.3 calibration count drift');
const known = rows.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = rows.filter((row) => row.expectedDisposition === 'non_route');
const knownPaths = ['strong_arbitration','support_arbitration','pure_fallback'];
const subtypes = ['outside_current_22','route_unresolved','near_domain_not_current_route'];
for (const pathName of knownPaths) assert(known.filter((row) => row.expectedCandidatePath === pathName).length === 44, `${pathName} count drift`);
for (const subtype of subtypes) assert(nonRoute.filter((row) => row.subtype === subtype).length === 30, `${subtype} count drift`);

const finalizeRow = (row, cutoff) => {
  if (row.preScopeDisposition !== 'route_known' || !row.preScopeRoute) return { disposition:row.preScopeDisposition, routeId:row.preScopeRoute, reasonCode:row.preScopeReasonCode, scopeBypassed:false, rawHardVeto:false };
  const rawHardVeto = row.scopeProbability < cutoff;
  if (!rawHardVeto) return { disposition:'route_known', routeId:row.preScopeRoute, reasonCode:row.preScopeReasonCode, scopeBypassed:false, rawHardVeto:false };
  if (row.strongScopeBypassEligible) return { disposition:'route_known', routeId:row.preScopeRoute, reasonCode:'confirmed_strong_scope_bypass', scopeBypassed:true, rawHardVeto:true };
  return { disposition:'non_route', routeId:null, reasonCode:'scope_hard_veto', scopeBypassed:false, rawHardVeto:true };
};
const evaluate = (cutoff) => {
  let knownExact = 0, knownActivated = 0, wrongKnownActivated = 0, falseActivations = 0, strongScopeBypassCount = 0;
  const byPath = {}, bySubtype = {};
  for (const pathName of knownPaths) {
    const subset = known.filter((row) => row.expectedCandidatePath === pathName);
    let exact = 0, activated = 0, wrongActivated = 0;
    for (const row of subset) {
      const final = finalizeRow(row, cutoff);
      if (final.disposition === 'route_known') { activated += 1; if (final.routeId === row.expectedRoute) exact += 1; else wrongActivated += 1; }
    }
    byPath[pathName] = { total:subset.length, exact, exactRetention:ratio(exact, subset.length), activated, wrongActivated };
  }
  for (const row of known) {
    const final = finalizeRow(row, cutoff);
    if (final.scopeBypassed) strongScopeBypassCount += 1;
    if (final.disposition === 'route_known') { knownActivated += 1; if (final.routeId === row.expectedRoute) knownExact += 1; else wrongKnownActivated += 1; }
  }
  for (const subtype of subtypes) {
    const subset = nonRoute.filter((row) => row.subtype === subtype);
    let activated = 0, scopeVetoed = 0;
    for (const row of subset) {
      const final = finalizeRow(row, cutoff);
      if (final.disposition === 'route_known') activated += 1;
      if (final.reasonCode === 'scope_hard_veto') scopeVetoed += 1;
    }
    falseActivations += activated;
    bySubtype[subtype] = { total:subset.length, activated, falseActivation:ratio(activated, subset.length), scopeVetoed };
  }
  const acceptedRouteAccuracy = ratio(knownExact, knownActivated, 1);
  const overallFalseActivation = ratio(falseActivations, nonRoute.length);
  const maxSubtypeFalseActivation = Math.max(...subtypes.map((subtype) => bySubtype[subtype].falseActivation));
  return { hardVetoCutoff:cutoff, knownExact, knownTotal:known.length, knownExactRetention:ratio(knownExact, known.length), knownActivated, wrongKnownActivated, acceptedRouteAccuracy, falseActivations, nonRouteTotal:nonRoute.length, overallFalseActivation, maxSubtypeFalseActivation, byPath, bySubtype, strongScopeBypassCount };
};

const constraints = artifact.calibration?.constraints || {};
assert(close(constraints.minimumAcceptedRouteAccuracy, design.evaluationPolicy.promotionGates.minimumAcceptedRouteAccuracy), 'minimum accepted accuracy constraint drift');
assert(close(constraints.maximumOverallFalseRouteActivation, design.evaluationPolicy.promotionGates.maximumOverallFalseRouteActivation), 'overall FA constraint drift');
assert(close(constraints.maximumFalseRouteActivationPerNonRouteSubtype, design.evaluationPolicy.promotionGates.maximumFalseRouteActivationPerNonRouteSubtype), 'subtype FA constraint drift');
const safe = (metrics) => metrics.acceptedRouteAccuracy >= constraints.minimumAcceptedRouteAccuracy - 1e-12
  && metrics.overallFalseActivation <= constraints.maximumOverallFalseRouteActivation + 1e-12
  && metrics.maxSubtypeFalseActivation <= constraints.maximumFalseRouteActivationPerNonRouteSubtype + 1e-12;
const better = (candidate, best) => {
  if (!best) return true;
  if (candidate.knownExact !== best.knownExact) return candidate.knownExact > best.knownExact;
  if (!close(candidate.acceptedRouteAccuracy, best.acceptedRouteAccuracy)) return candidate.acceptedRouteAccuracy > best.acceptedRouteAccuracy;
  if (!close(candidate.overallFalseActivation, best.overallFalseActivation)) return candidate.overallFalseActivation < best.overallFalseActivation;
  if (!close(candidate.maxSubtypeFalseActivation, best.maxSubtypeFalseActivation)) return candidate.maxSubtypeFalseActivation < best.maxSubtypeFalseActivation;
  return candidate.hardVetoCutoff > best.hardVetoCutoff;
};
const candidates = [...new Set([0, 1, ...rows.map((row) => row.scopeProbability).filter(Number.isFinite)])].sort((a, b) => a - b);
let best = null, safeCount = 0;
for (const cutoff of candidates) {
  const metrics = evaluate(cutoff);
  if (!safe(metrics)) continue;
  safeCount += 1;
  if (better(metrics, best)) best = metrics;
}
assert(best, 'no safety-constrained Scope cutoff in frozen scored rows');
assert(close(best.hardVetoCutoff, artifact.hardVetoCutoff), `Scope cutoff is not deterministic optimum: ${artifact.hardVetoCutoff} vs ${best.hardVetoCutoff}`);
assert(artifact.calibration.thresholdCandidateCount === candidates.length && artifact.calibration.safeThresholdCount === safeCount, 'Scope v0.3 threshold search count drift');
const stored = artifact.calibration.metrics;
for (const key of ['hardVetoCutoff','knownExact','knownTotal','knownExactRetention','knownActivated','wrongKnownActivated','acceptedRouteAccuracy','falseActivations','nonRouteTotal','overallFalseActivation','maxSubtypeFalseActivation','strongScopeBypassCount']) {
  assert(close(Number(stored[key]), Number(best[key])), `stored Scope v0.3 metric drift: ${key}`);
}
for (const pathName of knownPaths) for (const key of ['total','exact','exactRetention','activated','wrongActivated']) assert(close(Number(stored.byPath[pathName][key]), Number(best.byPath[pathName][key])), `stored path metric drift: ${pathName}.${key}`);
for (const subtype of subtypes) for (const key of ['total','activated','falseActivation','scopeVetoed']) assert(close(Number(stored.bySubtype[subtype][key]), Number(best.bySubtype[subtype][key])), `stored subtype metric drift: ${subtype}.${key}`);
assert(safe(best), 'frozen Scope v0.3 cutoff violates safety constraints');
assert(close(lock.safety.acceptedRouteAccuracy, best.acceptedRouteAccuracy), 'lock accepted accuracy drift');
assert(close(lock.safety.overallFalseActivation, best.overallFalseActivation), 'lock overall FA drift');
assert(close(lock.safety.maxSubtypeFalseActivation, best.maxSubtypeFalseActivation), 'lock subtype FA drift');

console.log('LiuYao Candidate v0.5 Scope Finalization v0.3 calibrated artifact verified.');
console.log(`- hard-veto cutoff=${best.hardVetoCutoff}`);
console.log(`- known exact=${best.knownExact}/${best.knownTotal} = ${best.knownExactRetention}`);
console.log(`- accepted route accuracy=${best.acceptedRouteAccuracy}`);
console.log(`- non-route false activation=${best.falseActivations}/${best.nonRouteTotal} = ${best.overallFalseActivation}; max subtype=${best.maxSubtypeFalseActivation}`);
console.log(`- path exact: strong=${best.byPath.strong_arbitration.exact}/44; support=${best.byPath.support_arbitration.exact}/44; fallback=${best.byPath.pure_fallback.exact}/44`);
console.log(`- artifact SHA-256=${lock.artifactSha256}`);
