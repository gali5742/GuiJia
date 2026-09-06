import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pipeline, env } from '@huggingface/transformers'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'))
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const ratio = (n, d) => d ? n / d : 0

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-reachability-contract-v0.1.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-reachability-report-v0.1.json'
const contract = readJson(contractPath)
const dataLock = readJson(contract.sealedDataBundle.lockPath)
const calibration = readJson(contract.sealedDataBundle.calibration.path)
const methodology = readJson(contract.designAndMethodology.fallbackV03Methodology.path)
const runtimeLock = readJson(contract.frozenUpstream.v04RuntimeLock.path)
const actModel = readJson(contract.frozenUpstream.semanticAct.modelPath)
const routeabilityModel = readJson(contract.frozenUpstream.routeability.baseModelPath)
const routeabilityThresholdArtifact = readJson(contract.frozenUpstream.routeability.thresholdArtifactPath)
const executionContract = readJson(contract.encoder.executionContractPath)

assert(contract.status === 'locked_before_first_v05_postseal_calibration_encoder_audit', 'reachability contract not frozen')
assert(dataLock.status === 'locked_before_first_v05_encoder_scoring', 'sealed data lock status drift')
assert(sha256(contract.sealedDataBundle.lockPath) === contract.sealedDataBundle.lockSha256, 'sealed data lock SHA drift')
assert(sha256(contract.sealedDataBundle.training.path) === contract.sealedDataBundle.training.sha256, 'sealed training SHA drift')
assert(sha256(contract.sealedDataBundle.calibration.path) === contract.sealedDataBundle.calibration.sha256, 'sealed calibration SHA drift')
assert(sha256(contract.designAndMethodology.dataContract.path) === contract.designAndMethodology.dataContract.sha256, 'data contract SHA drift')
assert(sha256(contract.designAndMethodology.fallbackV03Methodology.path) === contract.designAndMethodology.fallbackV03Methodology.sha256, 'methodology SHA drift')
assert(sha256(contract.frozenUpstream.v04RuntimeLock.path) === contract.frozenUpstream.v04RuntimeLock.sha256, 'frozen upstream runtime lock SHA drift')
assert(sha256(contract.frozenUpstream.semanticAct.modelPath) === contract.frozenUpstream.semanticAct.modelSha256, 'Semantic Act model SHA drift')
assert(sha256(contract.frozenUpstream.routeability.baseModelPath) === contract.frozenUpstream.routeability.baseModelSha256, 'Routeability base model SHA drift')
assert(sha256(contract.frozenUpstream.routeability.thresholdArtifactPath) === contract.frozenUpstream.routeability.thresholdArtifactSha256, 'Routeability threshold artifact SHA drift')
assert(sha256(contract.encoder.executionContractPath) === contract.encoder.executionContractSha256, 'embedding execution contract SHA drift')
assert(dataLock.encoderScoringObserved === false && dataLock.fallbackWeightsTrained === false && dataLock.fallbackProbabilitiesObserved === false && dataLock.globalThresholdSelected === false, 'v0.5 model work occurred before reachability audit')
assert(calibration.status === 'sealed_fallback_identity_v03_calibration' && calibration.sealed === true, 'calibration is not sealed')
assert(calibration.rows?.length === contract.sealedDataBundle.calibration.rows, 'calibration row count drift')
assert(runtimeLock.execution.semanticActThreshold === contract.frozenUpstream.semanticAct.threshold, 'Semantic Act threshold drift')
assert(runtimeLock.execution.routeabilityThreshold === contract.frozenUpstream.routeability.threshold, 'Routeability threshold drift')
assert(routeabilityThresholdArtifact.calibration?.threshold === contract.frozenUpstream.routeability.threshold, 'Routeability threshold artifact value drift')
assert(executionContract.canonicalExecution?.textsPerEncoderCall === 1, 'single-text execution contract missing')
assert(actModel.model?.weights?.length === contract.encoder.vectorSize && Number.isFinite(actModel.model.bias), 'Semantic Act model invalid')
assert(routeabilityModel.model?.weights?.length === contract.encoder.vectorSize && Number.isFinite(routeabilityModel.model.bias), 'Routeability model invalid')
assert(methodology.training?.classOrder?.length === 22, 'Fallback methodology class order drift')

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, RegExp, String }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(read(relative).toString('utf8'), context, { filename: relative })
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV03
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012
assert(evidenceExtractor?.extract && arbitration?.arbitrate, 'deterministic path modules failed to load')

const dot = (weights, vector) => { let total = 0; for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i]; return total }
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x))

env.allowLocalModels = false
env.useBrowserCache = false
const encoder = await pipeline('feature-extraction', contract.encoder.modelId, { dtype: contract.encoder.dtype, revision: contract.encoder.revision })
const tensorToVector = (tensor) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1]
  assert(hidden === contract.encoder.vectorSize, `embedding size ${hidden} != ${contract.encoder.vectorSize}`)
  const vector = new Float32Array(hidden)
  for (let i = 0; i < hidden; i += 1) vector[i] = Number(tensor.data[i])
  return vector
}
let encoderCalls = 0
const embedOne = async (text, index, total) => {
  const normalized = String(text || '').trim()
  assert(normalized, 'empty sealed v0.5 calibration text')
  const output = await encoder([normalized], { pooling: contract.encoder.pooling, normalize: contract.encoder.normalize })
  encoderCalls += 1
  if ((index + 1) % 25 === 0 || index === total - 1) console.log(`single-text v0.5 calibration reachability embedded ${index + 1}/${total}`)
  return tensorToVector(output)
}

const routeIds = methodology.training.classOrder
const byRoute = Object.fromEntries(routeIds.map((routeId) => [routeId, { n: 0, semanticActEligible: 0, arbitrationNull: 0, routeabilityAccepted: 0, reachesFallback: 0 }]))
const subtypeOrder = ['near_domain_not_current_route', 'outside_current_22', 'route_unresolved']
const byNonRouteSubtype = Object.fromEntries(subtypeOrder.map((subtype) => [subtype, { n: 0, semanticActEligible: 0, arbitrationNull: 0, routeabilityAccepted: 0, reachesFallback: 0 }]))
let known = 0
let nonRoute = 0
let knownSemanticActEligible = 0
let knownReachesFallback = 0
let nonRouteReachesFallback = 0
let deterministicEligibilityFailures = 0

for (let index = 0; index < calibration.rows.length; index += 1) {
  const row = calibration.rows[index]
  const vector = await embedOne(row.text, index, calibration.rows.length)
  const evidence = evidenceExtractor.extract(row.text)
  const arb = arbitration.arbitrate(row.text, evidence)
  const unsupportedTargets = evidence.unsupportedTargets || []
  const semanticActProbability = sigmoid(dot(actModel.model.weights, vector) + actModel.model.bias)
  const semanticActEligible = semanticActProbability >= contract.frozenUpstream.semanticAct.threshold
  const routeabilityProbability = sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias)
  const routeabilityAccepted = routeabilityProbability >= contract.frozenUpstream.routeability.threshold
  const arbitrationNull = !arb?.routeId
  const deterministicEligible = unsupportedTargets.length === 0 && arbitrationNull
  const reachesFallback = semanticActEligible && deterministicEligible && routeabilityAccepted
  if (!deterministicEligible) deterministicEligibilityFailures += 1

  if (row.identityLabel === 'route_identity_positive') {
    known += 1
    const bucket = byRoute[row.expectedRoute]
    assert(bucket, `unknown expected route ${row.expectedRoute}`)
    bucket.n += 1
    if (semanticActEligible) { knownSemanticActEligible += 1; bucket.semanticActEligible += 1 }
    if (arbitrationNull) bucket.arbitrationNull += 1
    if (routeabilityAccepted) bucket.routeabilityAccepted += 1
    if (reachesFallback) { knownReachesFallback += 1; bucket.reachesFallback += 1 }
  } else {
    nonRoute += 1
    const bucket = byNonRouteSubtype[row.subtype]
    assert(bucket, `unknown non-route subtype ${row.subtype}`)
    bucket.n += 1
    if (semanticActEligible) bucket.semanticActEligible += 1
    if (arbitrationNull) bucket.arbitrationNull += 1
    if (routeabilityAccepted) bucket.routeabilityAccepted += 1
    if (reachesFallback) { nonRouteReachesFallback += 1; bucket.reachesFallback += 1 }
  }
}

assert(encoderCalls === contract.encoder.expectedEncoderCalls, `encoder calls ${encoderCalls} != ${contract.encoder.expectedEncoderCalls}`)
assert(known === contract.sealedDataBundle.calibration.knownRows, `known rows ${known} drift`)
assert(nonRoute === contract.sealedDataBundle.calibration.nonRouteRows, `non-route rows ${nonRoute} drift`)

const knownSemanticActRetention = ratio(knownSemanticActEligible, known)
const minimumRouteExposure = Math.min(...Object.values(byRoute).map((row) => row.reachesFallback))
const checks = {
  calibrationKnownSemanticActRetention: knownSemanticActRetention >= contract.frozenChecks.minimumCalibrationKnownSemanticActRetention,
  everyRouteMinimumKnownFallbackExposure: Object.values(byRoute).every((row) => row.reachesFallback >= contract.frozenChecks.minimumKnownReachingFallbackPerRoute),
  calibrationTotalKnownFallbackExposure: knownReachesFallback >= contract.frozenChecks.minimumTotalKnownReachingFallback,
  calibrationTotalNonRouteFallbackExposure: nonRouteReachesFallback >= contract.frozenChecks.minimumTotalNonRouteReachingFallback,
  calibrationNearDomainFallbackExposure: byNonRouteSubtype.near_domain_not_current_route.reachesFallback >= contract.frozenChecks.minimumNearDomainNonRouteReachingFallback,
  calibrationOutsideCurrent22FallbackExposure: byNonRouteSubtype.outside_current_22.reachesFallback >= contract.frozenChecks.minimumOutsideCurrent22ReachingFallback,
  calibrationRouteUnresolvedFallbackExposure: byNonRouteSubtype.route_unresolved.reachesFallback >= contract.frozenChecks.minimumRouteUnresolvedReachingFallback,
  deterministicCalibrationEligibilityRemainsClean: deterministicEligibilityFailures === 0
}
const pass = Object.values(checks).every(Boolean)

const report = {
  version: '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-reachability-report-v0.1',
  status: pass ? 'pass_locked_sealed_v05_calibration_reachability' : 'fail_locked_sealed_v05_calibration_reachability',
  scope: contract.scope,
  immutableInputs: {
    auditContract: { path: contractPath, sha256: sha256(contractPath) },
    dataLock: { path: contract.sealedDataBundle.lockPath, sha256: sha256(contract.sealedDataBundle.lockPath) },
    training: { path: contract.sealedDataBundle.training.path, sha256: sha256(contract.sealedDataBundle.training.path), usedInThisAudit: false },
    calibration: { path: contract.sealedDataBundle.calibration.path, sha256: sha256(contract.sealedDataBundle.calibration.path) },
    semanticActModel: { path: contract.frozenUpstream.semanticAct.modelPath, sha256: sha256(contract.frozenUpstream.semanticAct.modelPath), threshold: contract.frozenUpstream.semanticAct.threshold },
    routeabilityBase: { path: contract.frozenUpstream.routeability.baseModelPath, sha256: sha256(contract.frozenUpstream.routeability.baseModelPath) },
    routeabilityThresholdArtifact: { path: contract.frozenUpstream.routeability.thresholdArtifactPath, sha256: sha256(contract.frozenUpstream.routeability.thresholdArtifactPath), threshold: contract.frozenUpstream.routeability.threshold },
    embeddingExecutionContract: { path: contract.encoder.executionContractPath, sha256: sha256(contract.encoder.executionContractPath) }
  },
  policy: {
    auditOnly: true,
    aggregateOnlyReport: true,
    rowLevelTextsReported: false,
    rowLevelProbabilitiesReported: false,
    trainingRowsEncoded: false,
    fallbackV03WeightsTrained: false,
    fallbackV03ProbabilitiesScored: false,
    fallbackV03ThresholdSelected: false,
    routerLoaded: false,
    routerTopKRead: false,
    scopeHardVetoUsedForReachability: false,
    officialV04IndependentResultsRead: false,
    sealedBlindEvaluationRead: false,
    calibrationMutationAllowed: false
  },
  execution: { canonicalTextsPerEncoderCall: 1, encoderCalls, rowsScored: calibration.rows.length },
  frozenChecks: contract.frozenChecks,
  summary: {
    calibrationKnown: known,
    calibrationNonRoute: nonRoute,
    calibrationKnownSemanticActRetention: knownSemanticActRetention,
    calibrationKnownReachingFallback: knownReachesFallback,
    minimumKnownReachingFallbackPerRouteObserved: minimumRouteExposure,
    calibrationNonRouteReachingFallback: nonRouteReachesFallback,
    nearDomainReachingFallback: byNonRouteSubtype.near_domain_not_current_route.reachesFallback,
    outsideCurrent22ReachingFallback: byNonRouteSubtype.outside_current_22.reachesFallback,
    routeUnresolvedReachingFallback: byNonRouteSubtype.route_unresolved.reachesFallback,
    deterministicEligibilityFailures
  },
  byRoute,
  byNonRouteSubtype,
  checks,
  pass,
  nextAction: pass
    ? 'freeze_fallback_identity_v03_weight_training_execution_contract_before_encoding_training_rows_or_fitting_softmax_weights'
    : 'freeze_immutable_v05_calibration_reachability_failure_and_create_new_versioned_calibration_without_mutating_this_sealed_bundle'
}
writeJson(reportPath, report)
console.log('Candidate v0.5 Fallback Identity v0.3 post-seal calibration reachability audit complete.')
console.log(JSON.stringify({ summary: report.summary, checks, pass }, null, 2))
