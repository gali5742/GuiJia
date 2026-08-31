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

const contractFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-contract.json';
const calibrationFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.json';
const calibrationLockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1-calibration.lock.json';
const correctedFile = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const routeabilityFile = 'data/liuyao-semantic-routeability-v0.4.json';
const identityFile = 'data/liuyao-semantic-fallback-identity-v0.2.json';
const inventoryFile = 'data/liuyao-semantic-route-inventory-v0.2.json';
const outputFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.json';
const outputLockFile = 'data/liuyao-semantic-fallback-acceptance-v0.1.lock.json';

const contract = readJson(contractFile);
const calibration = readJson(calibrationFile);
const calibrationLock = readJson(calibrationLockFile);
const corrected = readJson(correctedFile);
const routeability = readJson(routeabilityFile);
const identity = readJson(identityFile);
const inventory = readJson(inventoryFile);
const routeIds = inventory.routes.map((row) => row.routeId);

assert(contract.status === 'frozen_architecture_before_fresh_calibration', 'acceptance architecture contract not frozen');
assert(calibration.status === 'sealed_fresh_calibration' && calibration.sealed === true, 'fresh calibration must be sealed before scoring');
assert(calibrationLock.status === 'locked' && calibrationLock.calibrationSha256 === sha256(calibrationFile), 'fresh calibration lock drift');
assert(calibrationLock.contractSha256 === sha256(contractFile), 'contract lock drift');
assert(corrected.status === 'frozen_representation_corrected' && corrected.encoder?.textsPerEncoderCall === 1, 'corrected semantic dependencies missing');
assert(routeability.status === 'frozen_representation_corrected' && routeability.encoder?.textsPerEncoderCall === 1, 'corrected Routeability missing');
assert(identity.status === 'frozen_representation_corrected' && identity.encoder?.textsPerEncoderCall === 1, 'corrected Identity ranker missing');
assert(routeIds.length === 22 && routeIds.every((id) => identity.model?.heads?.[id]), '22 Identity heads required');
assert(routeability.model?.weights?.length === 512, 'Routeability model size drift');
assert(calibration.rows?.length === 178, 'fresh calibration count drift');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename: relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'pure fallback semantic path unavailable');

const encoder = corrected.encoder;
env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', encoder.modelId, { dtype: encoder.dtype, revision: encoder.revision });
const embedOne = async (text) => {
  const output = await extractor(String(text || ''), { pooling: encoder.pooling, normalize: encoder.normalize });
  assert(output?.dims?.[output.dims.length - 1] === 512, `embedding size ${output?.dims?.[output.dims.length - 1]} != 512`);
  const vector = new Float32Array(512);
  for (let i = 0; i < 512; i += 1) vector[i] = Number(output.data[i]);
  return vector;
};
const routeabilityScore = (vector) => sigmoid(dot(routeability.model.weights, vector) + routeability.model.bias);
const identityRanking = (vector) => routeIds.map((id) => {
  const head = identity.model.heads[id];
  return { routeId: id, score: sigmoid(dot(head.weights, vector) + head.bias) };
}).sort((a, b) => b.score - a.score || a.routeId.localeCompare(b.routeId));

const scored = [];
for (let index = 0; index < calibration.rows.length; index += 1) {
  const row = calibration.rows[index];
  const evidence = evidenceApi.extract(row.text);
  const arbitration = arbitrationApi.arbitrate(row.text, evidence);
  const semanticEligible = (evidence.unsupportedTargets || []).length === 0 && arbitration == null;
  if (row.label === 'route_known') assert(semanticEligible, `sealed known row left pure fallback path: ${row.id}`);
  const vector = await embedOne(row.text);
  const ranking = identityRanking(vector);
  scored.push({
    ...row,
    semanticEligible,
    routeabilityScore: routeabilityScore(vector),
    identityTop1Route: ranking[0].routeId,
    identityTop1Score: ranking[0].score,
    identityExpectedScore: row.expectedRoute ? ranking.find((candidate) => candidate.routeId === row.expectedRoute)?.score ?? null : null
  });
  if ((index + 1) % 50 === 0 || index + 1 === calibration.rows.length) console.log(`fallback acceptance embedded ${index + 1}/${calibration.rows.length}`);
}

const known = scored.filter((row) => row.label === 'route_known');
const nonRoute = scored.filter((row) => row.label === 'non_route');
const subtypes = ['outside_current_22', 'route_unresolved', 'near_domain_not_current_route'];
const thresholdCandidates = (values) => [...new Set([0, 1, ...values.filter(Number.isFinite)])].sort((a, b) => a - b);
const routeabilityThresholds = thresholdCandidates(scored.filter((row) => row.semanticEligible).map((row) => row.routeabilityScore));
const identityThresholds = thresholdCandidates(scored.filter((row) => row.semanticEligible).map((row) => row.identityTop1Score));

const evaluate = (routeabilityThreshold, identityThreshold) => {
  const decide = (row) => {
    if (!row.semanticEligible) return null;
    if (row.routeabilityScore < routeabilityThreshold) return null;
    if (row.identityTop1Score < identityThreshold) return null;
    return row.identityTop1Route;
  };
  let knownExact = 0;
  let wrongKnownSelected = 0;
  let selectedTotal = 0;
  for (const row of known) {
    const decision = decide(row);
    if (decision != null) selectedTotal += 1;
    if (decision === row.expectedRoute) knownExact += 1;
    else if (decision != null) wrongKnownSelected += 1;
  }
  const bySubtype = {};
  let falseActivations = 0;
  for (const subtype of subtypes) {
    const subset = nonRoute.filter((row) => row.subtype === subtype);
    const activated = subset.filter((row) => decide(row) != null).length;
    falseActivations += activated;
    selectedTotal += activated;
    bySubtype[subtype] = {
      total: subset.length,
      gateReachable: subset.filter((row) => row.semanticEligible).length,
      activated,
      falseActivation: ratio(activated, subset.length)
    };
  }
  const acceptedRouteAccuracy = ratio(knownExact, selectedTotal, 1);
  const overallFalseActivation = ratio(falseActivations, nonRoute.length);
  const maxSubtypeFalseActivation = Math.max(...subtypes.map((subtype) => bySubtype[subtype].falseActivation));
  return {
    routeabilityThreshold,
    identityThreshold,
    knownExact,
    knownTotal: known.length,
    knownRetention: ratio(knownExact, known.length),
    wrongKnownSelected,
    selectedTotal,
    acceptedRouteAccuracy,
    falseActivations,
    nonRouteTotal: nonRoute.length,
    overallFalseActivation,
    maxSubtypeFalseActivation,
    bySubtype
  };
};

const constraints = contract.freshCalibration.constraints;
const safe = (metrics) => metrics.acceptedRouteAccuracy >= constraints.minimumAcceptedRouteAccuracy - 1e-12
  && metrics.overallFalseActivation <= constraints.maximumOverallNonRouteFalseActivation + 1e-12
  && metrics.maxSubtypeFalseActivation <= constraints.maximumFalseActivationPerNonRouteSubtype + 1e-12;
const better = (candidate, best) => {
  if (!best) return true;
  if (candidate.knownExact !== best.knownExact) return candidate.knownExact > best.knownExact;
  if (Math.abs(candidate.acceptedRouteAccuracy - best.acceptedRouteAccuracy) > 1e-12) return candidate.acceptedRouteAccuracy > best.acceptedRouteAccuracy;
  if (Math.abs(candidate.overallFalseActivation - best.overallFalseActivation) > 1e-12) return candidate.overallFalseActivation < best.overallFalseActivation;
  if (Math.abs(candidate.maxSubtypeFalseActivation - best.maxSubtypeFalseActivation) > 1e-12) return candidate.maxSubtypeFalseActivation < best.maxSubtypeFalseActivation;
  if (Math.abs(candidate.identityThreshold - best.identityThreshold) > 1e-12) return candidate.identityThreshold > best.identityThreshold;
  return candidate.routeabilityThreshold > best.routeabilityThreshold;
};

let best = null;
let safePairs = 0;
for (const routeabilityThreshold of routeabilityThresholds) {
  for (const identityThreshold of identityThresholds) {
    const metrics = evaluate(routeabilityThreshold, identityThreshold);
    if (!safe(metrics)) continue;
    safePairs += 1;
    if (better(metrics, best)) best = metrics;
  }
}
assert(best, 'no safety-constrained global threshold pair found');

const byRoute = {};
for (const routeId of routeIds) {
  const subset = known.filter((row) => row.expectedRoute === routeId);
  const top1Correct = subset.filter((row) => row.identityTop1Route === routeId).length;
  const acceptedExact = subset.filter((row) => row.semanticEligible && row.routeabilityScore >= best.routeabilityThreshold && row.identityTop1Score >= best.identityThreshold && row.identityTop1Route === routeId).length;
  byRoute[routeId] = { total: subset.length, identityTop1Correct: top1Correct, acceptedExact };
}

const rejection = {
  knownIdentityTop1Wrong: known.filter((row) => row.identityTop1Route !== row.expectedRoute).length,
  knownBelowRouteabilityThreshold: known.filter((row) => row.routeabilityScore < best.routeabilityThreshold).length,
  knownBelowIdentityThreshold: known.filter((row) => row.identityTop1Score < best.identityThreshold).length,
  knownBelowBothThresholds: known.filter((row) => row.routeabilityScore < best.routeabilityThreshold && row.identityTop1Score < best.identityThreshold).length
};

const artifact = {
  version: '0.13-fallback-acceptance-v0.1',
  status: 'frozen_fresh_calibrated',
  scope: 'liuyao_semantic_pure_fallback_acceptance',
  architecture: {
    ranker: 'frozen_identity_v0.2_global_argmax_all_22_routes',
    gate: 'routeability_probability_and_identity_top1_probability_two_global_threshold_conjunction',
    routerTopKHardBoundary: false,
    marginThreshold: null,
    routeSpecificThresholds: false
  },
  dependencies: {
    contract: { path: contractFile, sha256: sha256(contractFile) },
    calibration: { path: calibrationFile, sha256: sha256(calibrationFile) },
    calibrationLock: { path: calibrationLockFile, sha256: sha256(calibrationLockFile) },
    correctedSemanticDependencies: { path: correctedFile, sha256: sha256(correctedFile) },
    correctedRouteability: { path: routeabilityFile, sha256: sha256(routeabilityFile) },
    identityRanker: { path: identityFile, sha256: sha256(identityFile) },
    routeInventory: { path: inventoryFile, sha256: sha256(inventoryFile) }
  },
  encoder: {
    modelId: encoder.modelId,
    revision: encoder.revision,
    transformersJsVersion: encoder.transformersJsVersion,
    dtype: encoder.dtype,
    vectorSize: encoder.vectorSize,
    pooling: encoder.pooling,
    normalize: encoder.normalize,
    textsPerEncoderCall: 1
  },
  thresholds: {
    routeabilityAcceptThreshold: best.routeabilityThreshold,
    identityAcceptThreshold: best.identityThreshold
  },
  calibration: {
    fresh: true,
    independentGeneralizationClaim: false,
    totalRows: scored.length,
    knownRows: known.length,
    nonRouteRows: nonRoute.length,
    thresholdCandidates: {
      routeability: routeabilityThresholds.length,
      identity: identityThresholds.length,
      safePairs
    },
    identityGlobalTop1AccuracyBeforeGate: ratio(known.filter((row) => row.identityTop1Route === row.expectedRoute).length, known.length),
    metrics: best,
    rejection,
    byRoute
  },
  nextEvidenceRequirement: 'candidate_lock_then_fresh_post_lock_independent_evaluation'
};
writeJson(outputFile, artifact);
const lock = {
  version: '0.13-fallback-acceptance-v0.1-lock-v0.1',
  status: 'locked_fresh_calibrated',
  artifactPath: outputFile,
  artifactSha256: sha256(outputFile),
  calibrationSha256: sha256(calibrationFile),
  contractSha256: sha256(contractFile),
  thresholds: artifact.thresholds,
  safety: {
    acceptedRouteAccuracy: best.acceptedRouteAccuracy,
    overallFalseActivation: best.overallFalseActivation,
    maxSubtypeFalseActivation: best.maxSubtypeFalseActivation
  },
  freshIndependentStillRequired: true
};
writeJson(outputLockFile, lock);

console.log('LiuYao Fallback Acceptance v0.1 fresh calibration complete.');
console.log(`- routeability threshold: ${best.routeabilityThreshold}`);
console.log(`- identity threshold: ${best.identityThreshold}`);
console.log(`- known retention: ${best.knownExact}/${best.knownTotal} = ${best.knownRetention}`);
console.log(`- accepted route accuracy: ${best.acceptedRouteAccuracy}`);
console.log(`- non-route false activation: ${best.falseActivations}/${best.nonRouteTotal} = ${best.overallFalseActivation}`);
console.log(`- max subtype false activation: ${best.maxSubtypeFalseActivation}`);
console.log(`- Identity global Top1 before gate: ${artifact.calibration.identityGlobalTop1AccuracyBeforeGate}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
