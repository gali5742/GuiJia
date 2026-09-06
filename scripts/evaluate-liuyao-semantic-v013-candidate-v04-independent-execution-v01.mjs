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
const dot = (weights, vector) => weights.reduce((sum, value, index) => sum + value * vector[index], 0)
const sigmoid = (value) => value >= 0 ? 1 / (1 + Math.exp(-value)) : Math.exp(value) / (1 + Math.exp(value))
const softmax = (logits) => {
  const max = Math.max(...logits)
  const exps = logits.map((value) => Math.exp(value - max))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / Math.max(total, 1e-12))
}

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-independent-scoring-contract-v0.1.json'
const independentPath = 'data/liuyao-semantic-v013-candidate-v04-independent.json'
const independentLockPath = 'data/liuyao-semantic-v013-candidate-v04-independent.lock-v0.1.1.json'
const candidateLockPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.4.lock.json'
const runtimeLockPath = 'data/liuyao-semantic-v013-candidate-v04-runtime.lock.json'
const embeddingContractPath = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-independent-execution-v0.1-report.json'

assert(!fs.existsSync(path.join(root, reportPath)), 'official independent report already exists; rerun forbidden')
const contract = readJson(contractPath)
const independent = readJson(independentPath)
const independentLock = readJson(independentLockPath)
const candidateLock = readJson(candidateLockPath)
const runtimeLock = readJson(runtimeLockPath)
const embeddingContract = readJson(embeddingContractPath)

assert(contract.status === 'locked_before_first_candidate_v04_independent_encoder_scoring', 'independent scoring contract not locked')
assert(contract.protectedEvaluationBoundary?.independentEncoderOrModelScoringObservedBeforeThisContract === false, 'pre-contract independent scoring boundary violated')
assert(contract.correctedIndependentLock?.gitBlobSha === gitBlobSha(independentLockPath), 'corrected independent lock Git blob drift')
assert(contract.correctedIndependentLock?.sha256 === sha256(independentLockPath), 'corrected independent lock SHA256 drift')
assert(independentLock.status === 'corrected_lock_sealed_before_first_post_lock_independent_encoder_scoring', 'corrected independent lock status drift')
assert(independentLock.invariants?.sealedBeforeFirstIndependentEncoderScoring === true, 'independent not sealed before scoring')
assert(independentLock.invariants?.postSealWordingMutationAllowed === false, 'independent wording mutation allowed')
assert(contract.sealedIndependent.artifactGitBlobSha === gitBlobSha(independentPath), 'independent artifact Git blob drift')
assert(contract.sealedIndependent.artifactSha256 === sha256(independentPath), 'independent artifact SHA256 drift')
assert(contract.candidateLock.gitBlobSha === gitBlobSha(candidateLockPath), 'Candidate lock Git blob drift')
assert(contract.candidateLock.sha256 === sha256(candidateLockPath), 'Candidate lock SHA256 drift')
assert(candidateLock.status === 'locked_after_fresh_development_pass_before_independent_evaluation', 'Candidate v0.4 lock status drift')
assert(contract.frozenRuntime.lockGitBlobSha === gitBlobSha(runtimeLockPath), 'runtime lock Git blob drift')
assert(contract.frozenRuntime.lockSha256 === sha256(runtimeLockPath), 'runtime lock SHA256 drift')
assert(runtimeLock.status === 'runtime_locked_before_fresh_development', 'runtime lock status drift')
assert(runtimeLock.isolation?.freshV04DevelopmentMayModifyRuntime === false, 'runtime mutation boundary drift')
assert(contract.embeddingExecution.contractGitBlobSha === gitBlobSha(embeddingContractPath), 'embedding contract Git blob drift')
assert(contract.embeddingExecution.contractSha256 === sha256(embeddingContractPath), 'embedding contract SHA256 drift')
assert(embeddingContract.canonicalExecution?.textsPerEncoderCall === 1, 'embedding execution shape drift')
assert(embeddingContract.canonicalExecution?.multiTextFeatureExtractionBatchForbidden === true, 'multi-text feature extraction allowed')
assert(Array.isArray(independent.rows) && independent.rows.length === 198, 'sealed independent must contain exactly 198 rows')
assert(independent.encoderScoringObserved === false && independent.modelProbabilityObserved === false, 'sealed independent indicates prior scoring')

const rowCounts = {
  route_known: independent.rows.filter((row) => row.expectedDisposition === 'route_known').length,
  non_route: independent.rows.filter((row) => row.expectedDisposition === 'non_route').length,
  strong_arbitration: independent.rows.filter((row) => row.expectedCandidatePath === 'strong_arbitration').length,
  support_arbitration: independent.rows.filter((row) => row.expectedCandidatePath === 'support_arbitration').length,
  fallback_head: independent.rows.filter((row) => row.expectedCandidatePath === 'fallback_head').length,
  outside_current_22: independent.rows.filter((row) => row.nonRouteSubtype === 'outside_current_22').length,
  route_unresolved: independent.rows.filter((row) => row.nonRouteSubtype === 'route_unresolved').length,
  near_domain_not_current_route: independent.rows.filter((row) => row.nonRouteSubtype === 'near_domain_not_current_route').length
}
for (const [key, expected] of Object.entries(contract.sealedIndependent.expectedCounts)) assert(rowCounts[key] === expected, `independent count drift ${key}`)

assert(runtimeLock.execution.encoderModelId === contract.embeddingExecution.modelId, 'encoder model id drift')
assert(runtimeLock.execution.encoderRevision === contract.embeddingExecution.revision, 'encoder revision drift')
assert(runtimeLock.execution.vectorSize === contract.embeddingExecution.vectorSize, 'vector size drift')
assert(runtimeLock.execution.semanticActThreshold === contract.frozenRuntime.semanticActThreshold, 'Semantic Act threshold drift')
assert(runtimeLock.execution.routeabilityThreshold === contract.frozenRuntime.routeabilityThreshold, 'Routeability threshold drift')
assert(runtimeLock.execution.scopeHardVetoCutoff === contract.frozenRuntime.scopeHardVetoCutoff, 'scope cutoff drift')
assert(runtimeLock.execution.fallbackGlobalThreshold === contract.frozenRuntime.fallbackIdentityGlobalThreshold, 'Fallback threshold drift')
assert(runtimeLock.execution.fallbackCandidateUniverse === 'all_current_22_routes', 'Fallback universe drift')
assert(runtimeLock.execution.routerTop2FallbackRestriction === false, 'Router Top2 fallback restriction enabled')
assert(runtimeLock.execution.routeSpecificFallbackThresholds === false, 'route-specific Fallback thresholds enabled')
for (const [relative, expectedBlob] of Object.entries(runtimeLock.modules || {})) assert(gitBlobSha(relative) === expectedBlob, `frozen runtime module drift: ${relative}`)

const frozenPath = runtimeLock.frozenArtifacts.representationCorrectedDependencies.path
const semanticActModelPath = runtimeLock.frozenArtifacts.semanticActModel.path
const routeabilityPath = runtimeLock.frozenArtifacts.routeabilityBaseExecution.path
const routeabilityThresholdPath = runtimeLock.frozenArtifacts.routeabilityThresholdExecution.path
const fallbackModelPath = runtimeLock.frozenArtifacts.fallbackIdentityModel.path
const fallbackThresholdLockPath = runtimeLock.frozenArtifacts.fallbackIdentityModel.thresholdLockPath
assert(sha256(frozenPath) === runtimeLock.frozenArtifacts.representationCorrectedDependencies.sha256, 'corrected dependencies SHA drift')
assert(sha256(semanticActModelPath) === contract.frozenRuntime.semanticActModelSha256, 'Semantic Act model SHA drift')
assert(sha256(routeabilityPath) === contract.frozenRuntime.routeabilityBaseSha256, 'Routeability base SHA drift')
assert(sha256(routeabilityThresholdPath) === contract.frozenRuntime.routeabilityThresholdArtifactSha256, 'Routeability threshold artifact SHA drift')
assert(sha256(fallbackModelPath) === contract.frozenRuntime.fallbackIdentityModelSha256, 'Fallback model SHA drift')

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
assert(semanticActModel.threshold === contract.frozenRuntime.semanticActThreshold, 'Semantic Act threshold artifact drift')
assert(fallbackThresholdLock.globalThreshold === contract.frozenRuntime.fallbackIdentityGlobalThreshold, 'Fallback threshold lock drift')
assert(fallbackThresholdLock.routeSpecificThresholds === false && fallbackThresholdLock.scoreAll22Heads === true, 'Fallback threshold policy drift')

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number, Float32Array, Float64Array }
context.window = context
context.globalThis = context
vm.createContext(context)
for (const relative of Object.keys(runtimeLock.modules)) vm.runInContext(read(relative).toString('utf8'), context, { filename: relative })
const candidateRuntime = context.GuiJia?.liuyaoSemanticCandidateV04RuntimeV01
assert(candidateRuntime?.decide, 'Candidate v0.4 runtime failed to load')
assert(candidateRuntime.fallbackCandidateUniverse === 'all_current_22_routes', 'runtime Fallback universe drift')
assert(candidateRuntime.routerTop2FallbackRestriction === false, 'runtime Top2 fallback restriction drift')
assert(candidateRuntime.semanticActBeforeArbitrationRescue === true, 'runtime Semantic Act ordering drift')

const classifyRouter = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights, index) => dot(weights, vector) + frozen.router.routeHead.biases[index])
  const probabilities = softmax(logits)
  const scores = frozen.router.routeOrder.map((id, index) => ({ id, score: probabilities[index] })).sort((a, b) => b.score - a.score)
  return { top1: scores[0], top2: scores[1], routeMargin: scores[0].score - scores[1].score }
}
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights, vector) + routeabilityModel.model.bias)
const scopeScore = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights, vector) + frozen.scopeGate.gate.bias)
  return { probability, hardVetoCutoff: contract.frozenRuntime.scopeHardVetoCutoff, hardVeto: probability < contract.frozenRuntime.scopeHardVetoCutoff }
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
  assert(normalized, 'empty independent question')
  encoderInvocationCount += 1
  canonicalTextsSubmitted += 1
  const output = await extractor([normalized], { pooling: contract.embeddingExecution.pooling, normalize: contract.embeddingExecution.normalize })
  if ((index + 1) % 10 === 0 || index === total - 1) console.log(`Candidate v0.4 independent single-text embedded ${index + 1}/${total}`)
  return tensorToVector(output)
}

const results = []
for (let index = 0; index < independent.rows.length; index += 1) {
  const row = independent.rows[index]
  const vector = await embedOne(row.text, index, independent.rows.length)
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
assert(encoderInvocationCount === contract.scoring.encoderInvocationCountMustEqual, `encoder invocation count ${encoderInvocationCount} != 198`)
assert(canonicalTextsSubmitted === contract.scoring.canonicalTextsSubmittedMustEqual, `canonical text submission count ${canonicalTextsSubmitted} != 198`)

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
    acceptedAccuracy: ratio(accepted.filter((row) => row.final.routeId === row.expectedRoute).length, accepted.length)
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
const readyForBaseline10Promotion = Object.values(checks).every(Boolean)
const report = {
  version: '0.13-candidate-v0.4-independent-report-execution-v0.1',
  status: readyForBaseline10Promotion ? 'post_lock_independent_pass' : 'post_lock_independent_fail',
  policy: {
    usesIndependentEval: true,
    readsSealedBlindEval: false,
    training: false,
    calibration: false,
    selectsThresholds: false,
    retunesThresholds: false,
    mutatesRuntime: false,
    mutatesCandidate: false,
    mutatesIndependentData: false,
    independentRowsReusableForTrainingOrCalibration: false
  },
  execution: {
    scoringContractPath: contractPath,
    scoringContractGitBlobSha: gitBlobSha(contractPath),
    scoringContractSha256: sha256(contractPath),
    independentArtifactGitBlobSha: gitBlobSha(independentPath),
    independentArtifactSha256: sha256(independentPath),
    correctedIndependentLockGitBlobSha: gitBlobSha(independentLockPath),
    correctedIndependentLockSha256: sha256(independentLockPath),
    candidateLockGitBlobSha: gitBlobSha(candidateLockPath),
    runtimeLockGitBlobSha: gitBlobSha(runtimeLockPath),
    runtimeLockSha256: sha256(runtimeLockPath),
    canonicalTextsPerEncoderCall: 1,
    processorCallsPerQuestion: 1,
    modelForwardCallsPerQuestion: 1,
    encoderInvocationCount,
    canonicalTextsSubmitted,
    encoderModelId: contract.embeddingExecution.modelId,
    encoderRevision: contract.embeddingExecution.revision,
    transformersJsVersion: contract.embeddingExecution.transformersJsVersion,
    dtype: contract.embeddingExecution.dtype,
    vectorSize: contract.embeddingExecution.vectorSize,
    pooling: contract.embeddingExecution.pooling,
    normalize: contract.embeddingExecution.normalize,
    semanticActThreshold: contract.frozenRuntime.semanticActThreshold,
    routeabilityThreshold: contract.frozenRuntime.routeabilityThreshold,
    scopeHardVetoCutoff: contract.frozenRuntime.scopeHardVetoCutoff,
    fallbackIdentityGlobalThreshold: contract.frozenRuntime.fallbackIdentityGlobalThreshold,
    fallbackCandidateUniverse: 'all_current_22_routes',
    routerTop2FallbackRestriction: false
  },
  summary,
  checks,
  readyForBaseline10Promotion,
  failures: results.filter((row) => !row.finalExact).map((row) => row.id),
  results,
  nextAction: readyForBaseline10Promotion
    ? 'freeze_baseline_1_0_promotion_decision_before_any_further_evaluation_or_runtime_change'
    : 'freeze_immutable_candidate_v04_independent_failure_evidence_no_same_version_retuning'
}
writeJson(reportPath, report)
console.log(JSON.stringify({ status: report.status, readyForBaseline10Promotion, checks, summary }, null, 2))
