import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n, d, empty = 0) => d ? n / d : empty;
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const dot = (weights, vector) => { let total = 0; for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i]; return total; };
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / Math.max(total, 1e-12));
};

const designFile = 'data/liuyao-semantic-v013-candidate-v04-design-v0.1.json';
const calibrationFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration.json';
const calibrationLockFile = 'data/liuyao-semantic-scope-finalization-v0.2-calibration.lock.json';
const correctedFile = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const routeabilityFile = 'data/liuyao-semantic-routeability-v0.4.json';
const identityFile = 'data/liuyao-semantic-fallback-identity-v0.2.json';
const acceptanceFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.json';
const acceptanceLockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.lock.json';
const inventoryFile = 'data/liuyao-semantic-route-inventory-v0.2.json';
const outputFile = 'data/liuyao-semantic-scope-finalization-v0.2.json';
const outputLockFile = 'data/liuyao-semantic-scope-finalization-v0.2.lock.json';

const sourceFiles = [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-compatibility-v03.js',
  'js/liuyao-semantic-routeability-v06.js',
  'js/liuyao-semantic-route-selection-v04.js',
  'js/liuyao-semantic-route-selection-v05.js',
  'js/liuyao-semantic-finalization-v02.js'
];

const design = readJson(designFile);
const calibration = readJson(calibrationFile);
const calibrationLock = readJson(calibrationLockFile);
const corrected = readJson(correctedFile);
const routeability = readJson(routeabilityFile);
const identity = readJson(identityFile);
const acceptance = readJson(acceptanceFile);
const acceptanceLock = readJson(acceptanceLockFile);
const inventory = readJson(inventoryFile);
const routeIds = inventory.routes.map((row) => row.routeId);

assert(design.status === 'assembly_frozen_before_scope_revalidation_and_development', 'Candidate v0.4 assembly design is not frozen');
assert(calibration.status === 'sealed_fresh_scope_calibration' && calibration.sealed === true, 'Scope calibration must be sealed before scoring');
assert(calibrationLock.status === 'locked' && calibrationLock.calibrationSha256 === sha256(calibrationFile), 'Scope calibration lock drift');
assert(calibrationLock.designSha256 === sha256(designFile), 'Candidate v0.4 design SHA drift');
assert(calibrationLock.policy?.parameterCount === 1 && calibrationLock.policy?.parameter === 'scope_hard_veto_cutoff', 'Scope calibration parameter contract drift');
assert(calibrationLock.policy?.otherModelOrGateParametersMayChange === false, 'Scope calibration may not retune other parameters');
assert(corrected.status === 'frozen_representation_corrected' && corrected.encoder?.textsPerEncoderCall === 1, 'corrected semantic dependencies missing');
assert(routeability.status === 'frozen_representation_corrected' && routeability.encoder?.textsPerEncoderCall === 1, 'corrected Routeability missing');
assert(identity.status === 'frozen_representation_corrected' && identity.encoder?.textsPerEncoderCall === 1, 'corrected Identity missing');
assert(acceptance.status === 'frozen_fresh_calibrated', 'Fallback Acceptance v0.1 is not frozen');
assert(acceptanceLock.status === 'locked_fresh_calibrated' && acceptanceLock.artifactSha256 === sha256(acceptanceFile), 'Fallback Acceptance lock drift');
assert(routeIds.length === 22 && routeIds.every((id) => identity.model?.heads?.[id]), '22 Identity heads required');
assert(calibration.rows?.length === 222, 'Scope calibration count drift');
assert(corrected.scopeGate?.gate?.weights?.length === 512 && Number.isFinite(corrected.scopeGate?.gate?.bias), 'corrected Scope model shape drift');
assert(Number.isFinite(routeability.calibration?.threshold), 'corrected Routeability model threshold missing');
assert(Number.isFinite(acceptance.thresholds?.routeabilityAcceptThreshold) && Number.isFinite(acceptance.thresholds?.identityAcceptThreshold), 'Fallback Acceptance thresholds missing');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of sourceFiles) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
const compatibilityApi = context.GuiJia?.liuyaoSemanticRouteCompatibilityV03;
const routeabilityApi = context.GuiJia?.liuyaoSemanticRouteabilityV06;
const selectionApi = context.GuiJia?.liuyaoSemanticRouteSelectionV05;
const finalizationApi = context.GuiJia?.liuyaoSemanticFinalizationV02;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate && compatibilityApi?.evaluate, 'Candidate v0.4 semantic evidence modules unavailable');
assert(routeabilityApi?.decide && selectionApi?.decide && finalizationApi?.finalize, 'Candidate v0.4 runtime modules unavailable');

const encoder = corrected.encoder;
env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', encoder.modelId, { dtype:encoder.dtype, revision:encoder.revision });
const embedOne = async (text) => {
  const output = await extractor(String(text || ''), { pooling:encoder.pooling, normalize:encoder.normalize });
  const hidden = output?.dims?.[output.dims.length - 1];
  assert(hidden === encoder.vectorSize, `embedding size ${hidden} != ${encoder.vectorSize}`);
  const vector = new Float32Array(encoder.vectorSize);
  for (let i = 0; i < encoder.vectorSize; i += 1) vector[i] = Number(output.data[i]);
  return vector;
};
const routerHead = (vector) => {
  const logits = corrected.router.routeHead.weights.map((weights, index) => dot(weights, vector) + corrected.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = corrected.router.routeOrder.map((id, index) => ({ id, score:probabilities[index] }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score - scores[1].score };
};
const routeabilityScore = (vector) => sigmoid(dot(routeability.model.weights, vector) + routeability.model.bias);
const scopeScore = (vector) => sigmoid(dot(corrected.scopeGate.gate.weights, vector) + corrected.scopeGate.gate.bias);
const identityRanking = (vector) => routeIds.map((routeId) => {
  const head = identity.model.heads[routeId];
  return { routeId, score:sigmoid(dot(head.weights, vector) + head.bias) };
}).sort((a, b) => b.score - a.score || a.routeId.localeCompare(b.routeId));

const makeAcceptance = ({ arbitration, evidence, routeabilityProbability, identityTop1 }) => {
  if (arbitration?.routeId) return null;
  if ((evidence.unsupportedTargets || []).length) {
    return Object.freeze({ status:'route_unresolved', routeId:null, reasonCode:'explicit_unsupported_target', routeabilityProbability, identityTop1Probability:identityTop1.score });
  }
  const routeabilityAccepted = routeabilityProbability >= acceptance.thresholds.routeabilityAcceptThreshold;
  const identityAccepted = identityTop1.score >= acceptance.thresholds.identityAcceptThreshold;
  if (routeabilityAccepted && identityAccepted) {
    return Object.freeze({
      status:'selected',
      routeId:identityTop1.routeId,
      reasonCode:'fallback_acceptance_two_thresholds_passed',
      routeabilityProbability,
      identityTop1Probability:identityTop1.score
    });
  }
  return Object.freeze({
    status:'route_unresolved',
    routeId:null,
    reasonCode:!routeabilityAccepted && !identityAccepted ? 'fallback_acceptance_both_thresholds_rejected' : !routeabilityAccepted ? 'fallback_acceptance_routeability_rejected' : 'fallback_acceptance_identity_rejected',
    routeabilityProbability,
    identityTop1Probability:identityTop1.score
  });
};

const scored = [];
for (let index = 0; index < calibration.rows.length; index += 1) {
  const row = calibration.rows[index];
  const evidence = evidenceApi.extract(row.text);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  const vector = await embedOne(row.text);
  const head = routerHead(vector);
  const routeabilityProbability = routeabilityScore(vector);
  const routeabilityDecision = routeabilityApi.decide({
    probability:routeabilityProbability,
    modelThreshold:routeability.calibration.threshold,
    arbitration,
    evidence
  });
  const identity = identityRanking(vector);
  const identityTop1 = identity[0];
  const fallbackAcceptanceDecision = makeAcceptance({ arbitration, evidence, routeabilityProbability, identityTop1 });
  const selection = selectionApi.decide({
    arbitration,
    head,
    evidence,
    routeabilityDisposition:routeabilityDecision.disposition,
    fallbackAcceptanceDecision
  });
  const scopeProbability = scopeScore(vector);
  const preScopeFinal = finalizationApi.finalize({
    routeability:routeabilityDecision,
    selection,
    scope:{ probability:scopeProbability, hardVeto:false },
    arbitration,
    evidence,
    fallbackAcceptanceDecision
  });
  const strongScopeBypassEligible = Boolean(
    arbitration?.strength === 'strong'
    && selection?.status === 'selected'
    && arbitration.routeId === selection.routeId
    && compatibilityApi.evaluate(arbitration.routeId, evidence).status === 'confirmed'
  );
  const declaredActualPath = arbitration?.strength === 'strong' ? 'strong_arbitration' : arbitration?.strength === 'support' ? 'support_arbitration' : arbitration == null ? 'pure_fallback' : `other:${arbitration?.strength}`;
  if (row.expectedDisposition === 'route_known') {
    assert(declaredActualPath === row.expectedCandidatePath, `sealed path drift ${row.id}: ${row.expectedCandidatePath} -> ${declaredActualPath}`);
    if (arbitration?.routeId) assert(arbitration.routeId === row.expectedRoute, `sealed arbitration route drift ${row.id}: ${arbitration.routeId} != ${row.expectedRoute}`);
  }
  scored.push({
    id:row.id,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute,
    expectedCandidatePath:row.expectedCandidatePath,
    subtype:row.subtype,
    headTop1Route:head.top1.id,
    headTop1Probability:head.top1.score,
    headTop2Route:head.top2.id,
    headTop2Probability:head.top2.score,
    routeabilityProbability,
    routeabilityDisposition:routeabilityDecision.disposition,
    routeabilityReasonCode:routeabilityDecision.reasonCode,
    arbitrationRoute:arbitration?.routeId || null,
    arbitrationStrength:arbitration?.strength || null,
    identityTop1Route:identityTop1.routeId,
    identityTop1Probability:identityTop1.score,
    fallbackAcceptanceStatus:fallbackAcceptanceDecision?.status || null,
    fallbackAcceptanceRoute:fallbackAcceptanceDecision?.routeId || null,
    fallbackAcceptanceReasonCode:fallbackAcceptanceDecision?.reasonCode || null,
    selectionStatus:selection?.status || null,
    selectionRoute:selection?.routeId || null,
    selectionReasonCode:selection?.reasonCode || null,
    scopeProbability,
    strongScopeBypassEligible,
    preScopeDisposition:preScopeFinal.disposition,
    preScopeRoute:preScopeFinal.routeId,
    preScopeReasonCode:preScopeFinal.reasonCode
  });
  if ((index + 1) % 50 === 0 || index + 1 === calibration.rows.length) console.log(`scope finalization embedded ${index + 1}/${calibration.rows.length}`);
}

const known = scored.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = scored.filter((row) => row.expectedDisposition === 'non_route');
const knownPaths = ['strong_arbitration','support_arbitration','pure_fallback'];
const subtypes = ['outside_current_22','route_unresolved','near_domain_not_current_route'];

const finalizeRow = (row, cutoff) => {
  if (row.preScopeDisposition !== 'route_known' || !row.preScopeRoute) {
    return { disposition:row.preScopeDisposition, routeId:row.preScopeRoute, reasonCode:row.preScopeReasonCode, scopeBypassed:false, rawHardVeto:false };
  }
  const rawHardVeto = row.scopeProbability < cutoff;
  if (!rawHardVeto) return { disposition:'route_known', routeId:row.preScopeRoute, reasonCode:row.preScopeReasonCode, scopeBypassed:false, rawHardVeto:false };
  if (row.strongScopeBypassEligible) return { disposition:'route_known', routeId:row.preScopeRoute, reasonCode:'confirmed_strong_scope_bypass', scopeBypassed:true, rawHardVeto:true };
  return { disposition:'non_route', routeId:null, reasonCode:'scope_hard_veto', scopeBypassed:false, rawHardVeto:true };
};

const evaluate = (cutoff) => {
  let knownExact = 0;
  let knownActivated = 0;
  let wrongKnownActivated = 0;
  let falseActivations = 0;
  let strongScopeBypassCount = 0;
  const byPath = {};
  const bySubtype = {};
  const scopeVeto = { correctKnown:0, wrongKnown:0, nonRoute:0, total:0, rawHardVeto:0 };
  const finalDispositions = { route_known:0, route_unresolved:0, non_route:0 };

  for (const pathName of knownPaths) {
    const subset = known.filter((row) => row.expectedCandidatePath === pathName);
    let exact = 0;
    let activated = 0;
    let wrongActivated = 0;
    for (const row of subset) {
      const final = finalizeRow(row, cutoff);
      if (final.disposition === 'route_known') {
        activated += 1;
        if (final.routeId === row.expectedRoute) exact += 1;
        else wrongActivated += 1;
      }
    }
    byPath[pathName] = { total:subset.length, exact, exactRetention:ratio(exact, subset.length), activated, wrongActivated };
  }

  for (const row of known) {
    const final = finalizeRow(row, cutoff);
    finalDispositions[final.disposition] = (finalDispositions[final.disposition] || 0) + 1;
    if (final.rawHardVeto) scopeVeto.rawHardVeto += 1;
    if (final.scopeBypassed) strongScopeBypassCount += 1;
    if (final.disposition === 'route_known') {
      knownActivated += 1;
      if (final.routeId === row.expectedRoute) knownExact += 1;
      else wrongKnownActivated += 1;
    } else if (final.reasonCode === 'scope_hard_veto') {
      scopeVeto.total += 1;
      if (row.preScopeRoute === row.expectedRoute) scopeVeto.correctKnown += 1;
      else scopeVeto.wrongKnown += 1;
    }
  }

  for (const subtype of subtypes) {
    const subset = nonRoute.filter((row) => row.subtype === subtype);
    let activated = 0;
    let vetoed = 0;
    for (const row of subset) {
      const final = finalizeRow(row, cutoff);
      finalDispositions[final.disposition] = (finalDispositions[final.disposition] || 0) + 1;
      if (final.rawHardVeto) scopeVeto.rawHardVeto += 1;
      if (final.disposition === 'route_known') activated += 1;
      if (final.reasonCode === 'scope_hard_veto') { vetoed += 1; scopeVeto.total += 1; scopeVeto.nonRoute += 1; }
    }
    falseActivations += activated;
    bySubtype[subtype] = { total:subset.length, activated, falseActivation:ratio(activated, subset.length), scopeVetoed:vetoed };
  }

  const acceptedRouteAccuracy = ratio(knownExact, knownActivated, 1);
  const overallFalseActivation = ratio(falseActivations, nonRoute.length);
  const maxSubtypeFalseActivation = Math.max(...subtypes.map((subtype) => bySubtype[subtype].falseActivation));
  return {
    hardVetoCutoff:cutoff,
    knownExact,
    knownTotal:known.length,
    knownExactRetention:ratio(knownExact, known.length),
    knownActivated,
    wrongKnownActivated,
    acceptedRouteAccuracy,
    falseActivations,
    nonRouteTotal:nonRoute.length,
    overallFalseActivation,
    maxSubtypeFalseActivation,
    byPath,
    bySubtype,
    strongScopeBypassCount,
    scopeVeto,
    finalDispositions
  };
};

const gates = design.evaluationPolicy?.promotionGates || {};
const constraints = {
  minimumAcceptedRouteAccuracy:gates.minimumAcceptedRouteAccuracy,
  maximumOverallFalseRouteActivation:gates.maximumOverallFalseRouteActivation,
  maximumFalseRouteActivationPerNonRouteSubtype:gates.maximumFalseRouteActivationPerNonRouteSubtype
};
assert(Number.isFinite(constraints.minimumAcceptedRouteAccuracy) && Number.isFinite(constraints.maximumOverallFalseRouteActivation) && Number.isFinite(constraints.maximumFalseRouteActivationPerNonRouteSubtype), 'Candidate v0.4 safety constraints missing');
const safe = (metrics) => metrics.acceptedRouteAccuracy >= constraints.minimumAcceptedRouteAccuracy - 1e-12
  && metrics.overallFalseActivation <= constraints.maximumOverallFalseRouteActivation + 1e-12
  && metrics.maxSubtypeFalseActivation <= constraints.maximumFalseRouteActivationPerNonRouteSubtype + 1e-12;
const better = (candidate, best) => {
  if (!best) return true;
  if (candidate.knownExact !== best.knownExact) return candidate.knownExact > best.knownExact;
  if (Math.abs(candidate.acceptedRouteAccuracy - best.acceptedRouteAccuracy) > 1e-12) return candidate.acceptedRouteAccuracy > best.acceptedRouteAccuracy;
  if (Math.abs(candidate.overallFalseActivation - best.overallFalseActivation) > 1e-12) return candidate.overallFalseActivation < best.overallFalseActivation;
  if (Math.abs(candidate.maxSubtypeFalseActivation - best.maxSubtypeFalseActivation) > 1e-12) return candidate.maxSubtypeFalseActivation < best.maxSubtypeFalseActivation;
  return candidate.hardVetoCutoff > best.hardVetoCutoff;
};
const thresholdCandidates = [...new Set([0, 1, ...scored.map((row) => row.scopeProbability).filter(Number.isFinite)])].sort((a, b) => a - b);
let best = null;
let safeThresholds = 0;
for (const cutoff of thresholdCandidates) {
  const metrics = evaluate(cutoff);
  if (!safe(metrics)) continue;
  safeThresholds += 1;
  if (better(metrics, best)) best = metrics;
}
assert(best, 'no safety-constrained Scope hard-veto cutoff found');

const headTop1Exact = known.filter((row) => row.headTop1Route === row.expectedRoute).length;
const pureFallback = known.filter((row) => row.expectedCandidatePath === 'pure_fallback');
const pureFallbackIdentityTop1Exact = pureFallback.filter((row) => row.identityTop1Route === row.expectedRoute).length;
const pureFallbackAcceptanceSelected = pureFallback.filter((row) => row.fallbackAcceptanceStatus === 'selected');
const pureFallbackAcceptanceExact = pureFallbackAcceptanceSelected.filter((row) => row.fallbackAcceptanceRoute === row.expectedRoute).length;
const preScopeKnownSelected = known.filter((row) => row.preScopeDisposition === 'route_known');
const preScopeKnownExact = preScopeKnownSelected.filter((row) => row.preScopeRoute === row.expectedRoute).length;
const preScopeNonRouteActivated = nonRoute.filter((row) => row.preScopeDisposition === 'route_known').length;

const knownFailureStages = { routeability_reject:0, acceptance_reject:0, selection_unresolved:0, scope_veto:0, wrong_selected_route:0, other:0 };
for (const row of known) {
  const final = finalizeRow(row, best.hardVetoCutoff);
  if (final.disposition === 'route_known' && final.routeId === row.expectedRoute) continue;
  if (final.disposition === 'route_known') { knownFailureStages.wrong_selected_route += 1; continue; }
  if (final.reasonCode === 'scope_hard_veto') { knownFailureStages.scope_veto += 1; continue; }
  if (row.arbitrationRoute && row.routeabilityDisposition !== 'route_known') { knownFailureStages.routeability_reject += 1; continue; }
  if (!row.arbitrationRoute && row.fallbackAcceptanceStatus !== 'selected') { knownFailureStages.acceptance_reject += 1; continue; }
  if (row.selectionStatus !== 'selected') { knownFailureStages.selection_unresolved += 1; continue; }
  knownFailureStages.other += 1;
}

const sourceHashes = Object.fromEntries(sourceFiles.map((relative) => [relative, sha256(relative)]));
const artifact = {
  version:'0.13-scope-finalization-v0.2',
  status:'frozen_fresh_calibrated',
  scope:'liuyao_semantic_candidate_v0.4_scope_finalization',
  architecture:{
    model:'corrected_scope_gate_from_semantic_dependencies_v0.2',
    weightMutation:false,
    parameter:'one_global_hard_veto_cutoff',
    otherThresholdsRetuned:false,
    hardVetoCondition:'scope_probability < hard_veto_cutoff',
    confirmedStrongScopeBypass:true,
    pureFallbackScopeBypass:false
  },
  dependencies:{
    candidateV04Design:{ path:designFile, sha256:sha256(designFile) },
    sealedCalibration:{ path:calibrationFile, sha256:sha256(calibrationFile) },
    sealedCalibrationLock:{ path:calibrationLockFile, sha256:sha256(calibrationLockFile) },
    correctedSemanticDependencies:{ path:correctedFile, sha256:sha256(correctedFile) },
    correctedRouteability:{ path:routeabilityFile, sha256:sha256(routeabilityFile) },
    correctedIdentity:{ path:identityFile, sha256:sha256(identityFile) },
    fallbackAcceptance:{ path:acceptanceFile, sha256:sha256(acceptanceFile) },
    fallbackAcceptanceLock:{ path:acceptanceLockFile, sha256:sha256(acceptanceLockFile) },
    routeInventory:{ path:inventoryFile, sha256:sha256(inventoryFile) },
    runtimeSources:sourceHashes
  },
  encoder:{
    modelId:encoder.modelId,
    revision:encoder.revision,
    transformersJsVersion:encoder.transformersJsVersion,
    dtype:encoder.dtype,
    vectorSize:encoder.vectorSize,
    pooling:encoder.pooling,
    normalize:encoder.normalize,
    textsPerEncoderCall:1
  },
  hardVetoCutoff:best.hardVetoCutoff,
  calibration:{
    fresh:true,
    independentGeneralizationClaim:false,
    totalRows:scored.length,
    knownRows:known.length,
    nonRouteRows:nonRoute.length,
    thresholdCandidateCount:thresholdCandidates.length,
    safeThresholdCount:safeThresholds,
    objective:'maximize_final_known_exact_retention_subject_to_candidate_v0.4_safety_constraints',
    tieBreak:['higher_accepted_route_accuracy','lower_overall_nonroute_false_activation','lower_max_subtype_false_activation','higher_hard_veto_cutoff'],
    constraints,
    metrics:best,
    diagnostics:{
      headTop1Exact,
      headTop1Accuracy:ratio(headTop1Exact, known.length),
      pureFallbackIdentityTop1Exact,
      pureFallbackIdentityTop1Accuracy:ratio(pureFallbackIdentityTop1Exact, pureFallback.length),
      pureFallbackAcceptanceSelected:pureFallbackAcceptanceSelected.length,
      pureFallbackAcceptanceExact,
      pureFallbackAcceptanceAccuracy:ratio(pureFallbackAcceptanceExact, pureFallbackAcceptanceSelected.length, 1),
      preScopeKnownSelected:preScopeKnownSelected.length,
      preScopeKnownExact,
      preScopeAcceptedRouteAccuracy:ratio(preScopeKnownExact, preScopeKnownSelected.length, 1),
      preScopeNonRouteActivated,
      preScopeNonRouteFalseActivation:ratio(preScopeNonRouteActivated, nonRoute.length),
      knownFailureStages
    },
    scoredRows:scored
  },
  nextEvidenceRequirement:'fresh_prelock_candidate_v0.4_full_stack_development_then_candidate_lock_then_fresh_post_lock_independent'
};
writeJson(outputFile, artifact);
const lock = {
  version:'0.13-scope-finalization-v0.2-lock-v0.1',
  status:'locked_fresh_calibrated',
  artifactPath:outputFile,
  artifactSha256:sha256(outputFile),
  calibrationSha256:sha256(calibrationFile),
  calibrationLockSha256:sha256(calibrationLockFile),
  candidateV04DesignSha256:sha256(designFile),
  hardVetoCutoff:best.hardVetoCutoff,
  safety:{
    acceptedRouteAccuracy:best.acceptedRouteAccuracy,
    overallFalseActivation:best.overallFalseActivation,
    maxSubtypeFalseActivation:best.maxSubtypeFalseActivation
  },
  weightMutation:false,
  otherThresholdsRetuned:false,
  freshPrelockDevelopmentStillRequired:true,
  freshPostCandidateLockIndependentStillRequired:true
};
writeJson(outputLockFile, lock);

console.log('LiuYao Candidate v0.4 Scope Finalization v0.2 fresh calibration complete.');
console.log(`- hard-veto cutoff: ${best.hardVetoCutoff}`);
console.log(`- known exact retention: ${best.knownExact}/${best.knownTotal} = ${best.knownExactRetention}`);
console.log(`- accepted route accuracy: ${best.acceptedRouteAccuracy}`);
console.log(`- non-route false activation: ${best.falseActivations}/${best.nonRouteTotal} = ${best.overallFalseActivation}`);
console.log(`- max subtype false activation: ${best.maxSubtypeFalseActivation}`);
console.log(`- paths: strong=${best.byPath.strong_arbitration.exact}/${best.byPath.strong_arbitration.total}; support=${best.byPath.support_arbitration.exact}/${best.byPath.support_arbitration.total}; fallback=${best.byPath.pure_fallback.exact}/${best.byPath.pure_fallback.total}`);
console.log(`- strong Scope bypass count: ${best.strongScopeBypassCount}`);
console.log(`- safe thresholds: ${safeThresholds}/${thresholdCandidates.length}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
