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
const gitBlobSha = (relative) => {
  const bytes = read(relative)
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
}
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const ratio = (n, d) => d ? n / d : 0
const dot = (weights, vector) => {
  let total = 0
  for (let index = 0; index < weights.length; index += 1) total += weights[index] * vector[index]
  return total
}
const sigmoid = (value) => value >= 0 ? 1 / (1 + Math.exp(-value)) : Math.exp(value) / (1 + Math.exp(value))
const softmax = (logits) => {
  const max = Math.max(...logits)
  const exps = logits.map((value) => Math.exp(value - max))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / Math.max(total, 1e-12))
}

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-contract-v0.1.1.json'
const developmentPath = 'data/liuyao-semantic-v013-candidate-v04-development.json'
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v04-development.lock.json'
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'
const embeddingContractPath = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-development-execution-v0.1-report.json'

const contract = readJson(contractPath)
const development = readJson(developmentPath)
const developmentLock = readJson(developmentLockPath)
const runtimeLock = readJson(runtimeLockPath)
const embeddingContract = readJson(embeddingContractPath)

assert(contract.status === 'locked_before_first_candidate_v04_development_encoder_scoring', 'corrected Candidate v0.4 scoring contract not locked')
assert(contract.correctionEvidence?.encoderOrModelScoringObservedBeforeCorrection === false, 'contract correction did not preserve pre-scoring boundary')
assert(gitBlobSha(developmentPath) === contract.sealedDevelopment.artifactGitBlobSha, 'sealed development Git blob drift')
assert(sha256(developmentPath) === contract.sealedDevelopment.artifactSha256, 'sealed development SHA256 drift')
assert(gitBlobSha(developmentLockPath) === contract.sealedDevelopment.lockGitBlobSha, 'development lock Git blob drift')
assert(developmentLock.status === 'locked_before_first_candidate_v04_development_encoder_scoring', 'development lock status drift')
assert(developmentLock.artifact.gitBlobSha === contract.sealedDevelopment.artifactGitBlobSha, 'development lock artifact Git blob mismatch')
assert(developmentLock.artifact.sha256 === contract.sealedDevelopment.artifactSha256, 'development lock artifact SHA256 mismatch')
assert(developmentLock.sealing?.sealedBeforeFirstDevelopmentEncoderScoring === true, 'development was not sealed before first scoring')
assert(developmentLock.sealing?.postSealWordingMutationAllowed === false, 'development lock permits post-seal wording mutation')
assert(developmentLock.protectedEvaluationBoundary?.independentEvaluationReadBeforeSeal === false, 'development seal read independent evaluation')
assert(developmentLock.protectedEvaluationBoundary?.sealedBlindEvaluationReadBeforeSeal === false, 'development seal read sealed blind evaluation')
assert(gitBlobSha(runtimeLockPath) === contract.frozenRuntime.lockGitBlobSha, 'runtime lock Git blob drift')
assert(sha256(runtimeLockPath) === contract.frozenRuntime.lockSha256, 'runtime lock SHA256 drift')
assert(runtimeLock.status === 'runtime_locked_before_fresh_development', 'runtime lock status drift')
assert(runtimeLock.isolation?.freshV04DevelopmentMayModifyRuntime === false, 'runtime lock permits development mutation')
assert(gitBlobSha(embeddingContractPath) === contract.embeddingExecution.contractGitBlobSha, 'embedding execution contract Git blob drift')
assert(sha256(embeddingContractPath) === contract.embeddingExecution.contractSha256, 'embedding execution contract SHA256 drift')
assert(embeddingContract.canonicalExecution?.textsPerEncoderCall === 1, 'embedding execution shape drift')
assert(embeddingContract.canonicalExecution?.multiTextFeatureExtractionBatchForbidden === true, 'multi-text feature extraction unexpectedly allowed')
assert(contract.embeddingExecution.canonicalTextsPerEncoderCall === 1, 'scoring contract canonical text count drift')
assert(contract.embeddingExecution.processorCallsPerQuestion === 1, 'scoring contract processor call count drift')
assert(contract.embeddingExecution.modelForwardCallsPerQuestion === 1, 'scoring contract model forward count drift')
assert(Array.isArray(development.rows) && development.rows.length === 198, 'sealed development must contain exactly 198 rows')
assert(development.encoderScoringObserved === false && development.modelProbabilityObserved === false, 'sealed development indicates prior model scoring')
assert(development.runtimeMutationAllowed === false, 'sealed development permits runtime mutation')

const rowCounts = {
  route_known: development.rows.filter((row) => row.expectedDisposition === 'route_known').length,
  non_route: development.rows.filter((row) => row.expectedDisposition === 'non_route').length,
  strong_arbitration: development.rows.filter((row) => row.expectedCandidatePath === 'strong_arbitration').length,
  support_arbitration: development.rows.filter((row) => row.expectedCandidatePath === 'support_arbitration').length,
  fallback_head: development.rows.filter((row) => row.expectedCandidatePath === 'fallback_head').length,
  outside_current_22: development.rows.filter((row) => row.nonRouteSubtype === 'outside_current_22').length,
  route_unresolved: development.rows.filter((row) => row.nonRouteSubtype === 'route_unresolved').length,
  near_domain_not_current_route: development.rows.filter((row) => row.nonRouteSubtype === 'near_domain_not_current_route').length
}
for (const [key, expected] of Object.entries(contract.sealedDevelopment.expectedCounts)) {
  assert(rowCounts[key] === expected, `development count drift ${key}: ${rowCounts[key]} != ${expected}`)
}

assert(runtimeLock.execution.canonicalTextsPerEncoderCall === 1, 'runtime lock execution shape drift')
assert(runtimeLock.execution.encoderModelId === contract.embeddingExecution.modelId, 'runtime/embedding model id mismatch')
assert(runtimeLock.execution.encoderRevision === contract.embeddingExecution.revision, 'runtime/embedding encoder revision mismatch')
assert(runtimeLock.execution.vectorSize === contract.embeddingExecution.vectorSize, 'runtime/embedding vector size mismatch')
assert(runtimeLock.execution.scopeHardVetoCutoff === contract.frozenRuntime.scopeHardVetoCutoff, 'scope cutoff drift')
assert(runtimeLock.execution.routeabilityThreshold === contract.frozenRuntime.routeabilityThreshold, 'routeability threshold drift')
assert(runtimeLock.execution.semanticActThreshold === contract.frozenRuntime.semanticActThreshold, 'semantic act threshold drift')
assert(runtimeLock.execution.fallbackGlobalThreshold === contract.frozenRuntime.fallbackIdentityGlobalThreshold, 'fallback threshold drift')
assert(runtimeLock.execution.routeInventoryCount === 22, 'route inventory count drift')
assert(runtimeLock.execution.fallbackCandidateUniverse === 'all_current_22_routes', 'fallback candidate universe drift')
assert(runtimeLock.execution.routerTop2FallbackRestriction === false, 'Router Top2 fallback restriction unexpectedly enabled')
assert(runtimeLock.execution.routeSpecificFallbackThresholds === false, 'route-specific fallback thresholds unexpectedly enabled')

for (const [relative, expectedBlob] of Object.entries(runtimeLock.modules || {})) {
  assert(gitBlobSha(relative) === expectedBlob, `frozen Candidate v0.4 module blob drift: ${relative}`)
}

const frozenPath = runtimeLock.frozenArtifacts.representationCorrectedDependencies.path
const semanticActModelPath = runtimeLock.frozenArtifacts.semanticActModel.path
const routeabilityPath = runtimeLock.frozenArtifacts.routeabilityBaseExecution.path
const routeabilityThresholdPath = runtimeLock.frozenArtifacts.routeabilityThresholdExecution.path
const fallbackModelPath = runtimeLock.frozenArtifacts.fallbackIdentityModel.path
const fallbackThresholdLockPath = runtimeLock.frozenArtifacts.fallbackIdentityModel.thresholdLockPath

assert(sha256(frozenPath) === runtimeLock.frozenArtifacts.representationCorrectedDependencies.sha256, 'corrected frozen dependencies SHA drift')
assert(sha256(semanticActModelPath) === contract.frozenRuntime.semanticActModelSha256, 'Semantic Act model SHA drift')
assert(sha256(routeabilityPath) === contract.frozenRuntime.routeabilityBaseSha256, 'Routeability base SHA drift')
assert(sha256(routeabilityThresholdPath) === contract.frozenRuntime.routeabilityThresholdArtifactSha256, 'Routeability threshold artifact SHA drift')
assert(sha256(fallbackModelPath) === contract.frozenRuntime.fallbackIdentityModelSha256, 'Fallback Identity v0.2 model SHA drift')

const frozen = readJson(frozenPath)
const semanticActModel = readJson(semanticActModelPath)
const routeabilityModel = readJson(routeabilityPath)
const fallbackModel = readJson(fallbackModelPath)
const fallbackThresholdLock = readJson(fallbackThresholdLockPath)

assert(frozen.encoder?.modelId === contract.embeddingExecution.modelId, 'frozen encoder model id drift')
assert(frozen.encoder?.revision === contract.embeddingExecution.revision, 'frozen encoder revision drift')
assert(frozen.encoder?.dtype === contract.embeddingExecution.dtype, 'frozen encoder dtype drift')
assert(frozen.encoder?.vectorSize === contract.embeddingExecution.vectorSize, 'frozen encoder vector size drift')
assert(frozen.encoder?.pooling === contract.embeddingExecution.pooling, 'frozen encoder pooling drift')
assert(frozen.encoder?.normalize === contract.embeddingExecution.normalize, 'frozen encoder normalization drift')
assert(semanticActModel.threshold === contract.frozenRuntime.semanticActThreshold, 'Semantic Act model threshold drift')
assert(fallbackThresholdLock.globalThreshold === contract.frozenRuntime.fallbackIdentityGlobalThreshold, 'Fallback threshold lock drift')
assert(fallbackThresholdLock.routeSpecificThresholds === false, 'Fallback threshold lock contains route-specific thresholds')
assert(fallbackThresholdLock.scoreAll22Heads === true, 'Fallback threshold lock does not require all-22 scoring')
assert(Array.isArray(routeabilityModel.model?.weights) && routeabilityModel.model.weights.length === 512, 'Routeability model shape invalid')

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const relative of Object.keys(runtimeLock.modules)) {
  vm.runInContext(read(relative).toString('utf8'), context, { filename: relative })
}
const G = context.GuiJia
const candidateRuntime = G?.liuyaoSemanticCandidateV04RuntimeV01
assert(candidateRuntime?.decide, 'Candidate v0.4 runtime failed to load')
assert(candidateRuntime.fallbackCandidateUniverse === 'all_current_22_routes', 'Candidate runtime fallback universe drift')
assert(candidateRuntime.routerTop2FallbackRestriction === false, 'Candidate runtime Top2 fallback restriction drift')
assert(candidateRuntime.semanticActBeforeArbitrationRescue === true, 'Candidate runtime Semantic Act ordering drift')

const classifyRouter = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index])
  const probabilities = softmax(logits)
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score: probabilities[index] })).sort((a, b) => b.score - a.score)
  return { top1: scores[0], top2: scores[1], routeMargin: scores[0].score - scores[1].score }
}
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias)
const scopeScore = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias)
  return {
    probability,
    hardVetoCutoff: contract.frozenRuntime.scopeHardVetoCutoff,
    hardVeto: probability < contract.frozenRuntime.scopeHardVetoCutoff
  }
}

env.allowLocalModels = false
env.useBrowserCache = false
const extractor = await pipeline('feature-extraction', contract.embeddingExecution.modelId, {
  dtype: contract.embeddingExecution.dtype,
  revision: contract.embeddingExecution.revision
})
let encoderInvocationCount = 0
let canonicalTextsSubmitted = 0
const tensorToVector = (tensor) => {
  const hidden = tensor?.dims?.[tensor.dims.length - 1]
  assert(hidden === contract.embeddingExecution.vectorSize, `embedding size ${hidden} != ${contract.embeddingExecution.vectorSize}`)
  const vector = new Float32Array(hidden)
  for (let index = 0; index < hidden; index += 1) vector[index] = Number(tensor.data[index])
  return vector
}
const embedOne = async (text, index, total) => {
  const normalized = String(text || '').trim()
  assert(normalized, 'empty development question')
  encoderInvocationCount += 1
  canonicalTextsSubmitted += 1
  const output = await extractor([normalized], { pooling: contract.embeddingExecution.pooling, normalize: contract.embeddingExecution.normalize })
  if ((index + 1) % 10 === 0 || index === total - 1) console.log(`Candidate v0.4 single-text embedded ${index + 1}/${total}`)
  return tensorToVector(output)
}

const results = []
for (let index = 0; index < development.rows.length; index += 1) {
  const row = development.rows[index]
  const vector = await embedOne(row.text, index, development.rows.length)
  const routerHead = classifyRouter(vector)
  const routeabilityP = routeabilityProbability(vector)
  const scope = scopeScore(vector)
  const runtimeResult = candidateRuntime.decide({
    text: row.text,
    vector,
    semanticActArtifact: semanticActModel,
    routeabilityProbability: routeabilityP,
    routerHead,
    scope,
    fallbackArtifact: fallbackModel,
    fallbackThresholdLock
  })
  const expectedKnown = row.expectedDisposition === 'route_known'
  const finalExact = expectedKnown
    ? runtimeResult.final.disposition === 'route_known' && runtimeResult.final.routeId === row.expectedRoute
    : runtimeResult.final.disposition === 'non_route'
  const falseRouteActivation = !expectedKnown && runtimeResult.final.disposition === 'route_known'
  const reachesFallbackIdentity = runtimeResult.fallbackIdentity !== null
  const admittedFallbackCount = reachesFallbackIdentity
    ? runtimeResult.fallbackIdentity.decision.candidates.filter((candidate) => candidate.admitted).length
    : 0
  results.push({
    id: row.id,
    text: row.text,
    expectedDisposition: row.expectedDisposition,
    expectedRoute: row.expectedRoute || null,
    expectedCandidatePath: row.expectedCandidatePath || null,
    nonRouteSubtype: row.nonRouteSubtype || null,
    construction: row.construction || null,
    semanticAct: runtimeResult.semanticAct,
    router: routerHead,
    routeabilityProbability: routeabilityP,
    arbitration: runtimeResult.arbitration,
    routeability: runtimeResult.routeability,
    reachesFallbackIdentity,
    fallbackIdentity: reachesFallbackIdentity ? {
      threshold: runtimeResult.fallbackIdentity.scored.threshold,
      probabilities: runtimeResult.fallbackIdentity.scored.probabilities,
      decision: runtimeResult.fallbackIdentity.decision,
      admittedCount: admittedFallbackCount
    } : null,
    selection: runtimeResult.selection,
    scope,
    final: runtimeResult.final,
    headTop1Exact: expectedKnown && routerHead.top1.id === row.expectedRoute,
    headTop2ContainsExpected: expectedKnown && [routerHead.top1.id, routerHead.top2.id].includes(row.expectedRoute),
    finalExact,
    falseRouteActivation
  })
}
assert(encoderInvocationCount === 198, `encoder invocation count ${encoderInvocationCount} != 198`)
assert(canonicalTextsSubmitted === 198, `canonical text submission count ${canonicalTextsSubmitted} != 198`)

const known = results.filter((row) => row.expectedDisposition === 'route_known')
const nonRoute = results.filter((row) => row.expectedDisposition === 'non_route')
const acceptedKnown = known.filter((row) => row.final.disposition === 'route_known')
const summary = {
  rows: results.length,
  known: known.length,
  nonRoute: nonRoute.length,
  semanticActKnownRetention: ratio(known.filter((row) => row.semanticAct.status === 'eligible').length, known.length),
  semanticActNonRouteRejection: ratio(nonRoute.filter((row) => row.semanticAct.status === 'ineligible').length, nonRoute.length),
  routeabilityKnownRecall: ratio(known.filter((row) => row.routeability?.disposition === 'route_known').length, known.length),
  knownFinalRetention: ratio(acceptedKnown.length, known.length),
  knownExactRoute: ratio(known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, known.length),
  acceptedRouteAccuracy: ratio(acceptedKnown.filter((row) => row.final.routeId === row.expectedRoute).length, acceptedKnown.length),
  nonRouteFalseRouteActivation: ratio(nonRoute.filter((row) => row.falseRouteActivation).length, nonRoute.length),
  nonRouteNoRouteActivationSafety: ratio(nonRoute.filter((row) => row.final.disposition !== 'route_known').length, nonRoute.length),
  attrition: {
    semanticActRejectedKnown: known.filter((row) => row.semanticAct.status !== 'eligible').length,
    semanticActRejectedNonRoute: nonRoute.filter((row) => row.semanticAct.status !== 'eligible').length,
    routeabilityAcceptedKnown: known.filter((row) => row.routeability?.disposition === 'route_known').length,
    routeabilityRejectedKnownAfterSemanticAct: known.filter((row) => row.semanticAct.status === 'eligible' && row.routeability?.disposition !== 'route_known').length,
    fallbackReachedKnown: known.filter((row) => row.reachesFallbackIdentity).length,
    fallbackSelectedKnown: known.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length,
    fallbackRejectAllKnown: known.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_reject_all').length,
    fallbackMultipleAdmissionsKnown: known.filter((row) => row.fallbackIdentity?.decision?.reasonCode === 'fallback_identity_all22_multiple_admissions').length,
    selectionSelectedKnown: known.filter((row) => row.selection?.status === 'selected').length,
    selectionUnresolvedKnown: known.filter((row) => row.routeability?.disposition === 'route_known' && row.selection?.status !== 'selected').length,
    scopeHardVetoKnown: known.filter((row) => row.final.reasonCode === 'scope_hard_veto').length,
    finalRouteKnown: acceptedKnown.length,
    finalExact: known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length,
    wrongSelectedRoute: known.filter((row) => row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
  },
  byKnownPath: {},
  byNonRouteSubtype: {}
}
for (const pathId of ['strong_arbitration', 'support_arbitration', 'fallback_head']) {
  const subset = known.filter((row) => row.expectedCandidatePath === pathId)
  const accepted = subset.filter((row) => row.final.disposition === 'route_known')
  summary.byKnownPath[pathId] = {
    n: subset.length,
    semanticActRetention: ratio(subset.filter((row) => row.semanticAct.status === 'eligible').length, subset.length),
    routeabilityRecall: ratio(subset.filter((row) => row.routeability?.disposition === 'route_known').length, subset.length),
    fallbackReached: subset.filter((row) => row.reachesFallbackIdentity).length,
    fallbackSelected: subset.filter((row) => row.fallbackIdentity?.decision?.status === 'selected').length,
    finalRetention: ratio(accepted.length, subset.length),
    finalExact: ratio(subset.filter((row) => row.final.disposition === 'route_known' && row.final.routeId === row.expectedRoute).length, subset.length),
    acceptedAccuracy: ratio(accepted.filter((row) => row.final.routeId === row.expectedRoute).length, accepted.length),
    scopeHardVeto: subset.filter((row) => row.final.reasonCode === 'scope_hard_veto').length,
    wrongSelected: subset.filter((row) => row.final.disposition === 'route_known' && row.final.routeId !== row.expectedRoute).length
  }
}
for (const subtype of ['outside_current_22', 'route_unresolved', 'near_domain_not_current_route']) {
  const subset = nonRoute.filter((row) => row.nonRouteSubtype === subtype)
  summary.byNonRouteSubtype[subtype] = {
    n: subset.length,
    semanticActRejection: ratio(subset.filter((row) => row.semanticAct.status === 'ineligible').length, subset.length),
    falseRouteActivation: ratio(subset.filter((row) => row.falseRouteActivation).length, subset.length),
    noRouteActivationSafety: ratio(subset.filter((row) => row.final.disposition !== 'route_known').length, subset.length),
    fallbackReached: subset.filter((row) => row.reachesFallbackIdentity).length
  }
}

const gates = contract.promotionGates
const checks = {
  knownExactRoute: summary.knownExactRoute >= gates.minimumKnownExactRoute,
  acceptedRouteAccuracy: summary.acceptedRouteAccuracy >= gates.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation: summary.nonRouteFalseRouteActivation <= gates.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation: Object.values(summary.byNonRouteSubtype).every((row) => row.falseRouteActivation <= gates.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse: Object.values(summary.byKnownPath).every((row) => row.finalExact > 0)
}
const readyForCandidateLock = Object.values(checks).every(Boolean)
const report = {
  version: '0.13-candidate-v0.4-development-report-execution-v0.1',
  status: readyForCandidateLock ? 'pre_lock_development_pass' : 'pre_lock_development_fail',
  scope: 'liuyao_semantic_decision_stack_v0.13_candidate_v0.4',
  policy: {
    usesIndependentEval: false,
    readsIndependentEval: false,
    readsSealedBlindEval: false,
    training: false,
    calibration: false,
    retunesThresholds: false,
    mutatesRuntime: false,
    mutatesDevelopmentData: false,
    claimsGeneralization: false,
    developmentOnly: true
  },
  execution: {
    correctedContractPath: contractPath,
    correctedContractGitBlobSha: gitBlobSha(contractPath),
    developmentSealCommit: contract.sealedDevelopment.sealCommit,
    developmentArtifactGitBlobSha: gitBlobSha(developmentPath),
    developmentArtifactSha256: sha256(developmentPath),
    developmentLockGitBlobSha: gitBlobSha(developmentLockPath),
    runtimeLockGitBlobSha: gitBlobSha(runtimeLockPath),
    runtimeLockSha256: sha256(runtimeLockPath),
    embeddingExecutionContractGitBlobSha: gitBlobSha(embeddingContractPath),
    canonicalTextsPerEncoderCall: 1,
    processorCallsPerQuestion: 1,
    modelForwardCallsPerQuestion: 1,
    encoderInvocationCount,
    canonicalTextsSubmitted,
    semanticActModelSha256: sha256(semanticActModelPath),
    routeabilityBaseSha256: sha256(routeabilityPath),
    routeabilityThresholdArtifactSha256: sha256(routeabilityThresholdPath),
    fallbackIdentityModelSha256: sha256(fallbackModelPath),
    semanticActThreshold: contract.frozenRuntime.semanticActThreshold,
    routeabilityThreshold: contract.frozenRuntime.routeabilityThreshold,
    scopeHardVetoCutoff: contract.frozenRuntime.scopeHardVetoCutoff,
    fallbackIdentityGlobalThreshold: contract.frozenRuntime.fallbackIdentityGlobalThreshold,
    fallbackCandidateUniverse: 'all_current_22_routes',
    routerTop2FallbackRestriction: false
  },
  candidate: {
    semanticActEligibility: 'v0.1',
    evidence: 'v0.3',
    arbitration: 'v0.12',
    compatibility: 'v0.3',
    routeability: 'v0.5-execution-v0.1',
    fallbackIdentity: 'v0.2-all22',
    selection: 'v0.5',
    finalization: 'v0.1'
  },
  metricDefinitions: contract.metricDefinitions,
  promotionGates: gates,
  summary,
  checks,
  readyForCandidateLock,
  failures: results.filter((row) => !row.finalExact),
  results
}
writeJson(reportPath, report)
console.log(JSON.stringify({ readyForCandidateLock, checks, summary }, null, 2))
