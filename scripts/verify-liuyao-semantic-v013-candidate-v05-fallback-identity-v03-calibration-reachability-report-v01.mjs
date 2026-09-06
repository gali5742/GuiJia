import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative))
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'))
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const contractPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-reachability-contract-v0.1.json'
const reportPath = 'data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03-calibration-reachability-report-v0.1.json'
const contract = readJson(contractPath)
const report = readJson(reportPath)

assert(contract.status === 'locked_before_first_v05_postseal_calibration_encoder_audit', 'reachability contract drift')
assert(report.version === '0.13-candidate-v0.5-fallback-identity-v0.3-calibration-reachability-report-v0.1', 'report version drift')
assert(report.scope === contract.scope, 'report scope drift')
assert(report.execution?.canonicalTextsPerEncoderCall === 1, 'report single-text execution drift')
assert(report.execution?.encoderCalls === contract.encoder.expectedEncoderCalls, 'encoder call count drift')
assert(report.execution?.rowsScored === contract.sealedDataBundle.calibration.rows, 'rows scored drift')
assert(report.policy?.aggregateOnlyReport === true, 'report is not aggregate-only')
assert(report.policy?.rowLevelTextsReported === false && report.policy?.rowLevelProbabilitiesReported === false, 'row-level protected output reported')
assert(!Object.hasOwn(report, 'results') && !Object.hasOwn(report, 'rows'), 'row-level result container forbidden')
assert(report.policy?.trainingRowsEncoded === false, 'training rows encoded during reachability')
assert(report.policy?.fallbackV03WeightsTrained === false && report.policy?.fallbackV03ProbabilitiesScored === false && report.policy?.fallbackV03ThresholdSelected === false, 'Fallback v0.3 work occurred during reachability')
assert(report.policy?.routerLoaded === false && report.policy?.routerTopKRead === false, 'Router use forbidden during reachability')
assert(report.policy?.officialV04IndependentResultsRead === false && report.policy?.sealedBlindEvaluationRead === false, 'protected evaluation read during reachability')

assert(report.immutableInputs?.auditContract?.sha256 === sha256(contractPath), 'audit contract SHA drift in report')
assert(report.immutableInputs?.dataLock?.sha256 === contract.sealedDataBundle.lockSha256, 'data lock SHA drift in report')
assert(report.immutableInputs?.training?.sha256 === contract.sealedDataBundle.training.sha256 && report.immutableInputs.training.usedInThisAudit === false, 'training binding/use drift')
assert(report.immutableInputs?.calibration?.sha256 === contract.sealedDataBundle.calibration.sha256, 'calibration binding drift')
assert(report.immutableInputs?.semanticActModel?.sha256 === contract.frozenUpstream.semanticAct.modelSha256, 'Semantic Act binding drift')
assert(report.immutableInputs?.semanticActModel?.threshold === contract.frozenUpstream.semanticAct.threshold, 'Semantic Act threshold drift')
assert(report.immutableInputs?.routeabilityBase?.sha256 === contract.frozenUpstream.routeability.baseModelSha256, 'Routeability base binding drift')
assert(report.immutableInputs?.routeabilityThresholdArtifact?.sha256 === contract.frozenUpstream.routeability.thresholdArtifactSha256, 'Routeability threshold binding drift')
assert(report.immutableInputs?.routeabilityThresholdArtifact?.threshold === contract.frozenUpstream.routeability.threshold, 'Routeability threshold value drift')
assert(report.immutableInputs?.embeddingExecutionContract?.sha256 === contract.encoder.executionContractSha256, 'execution contract binding drift')

const byRoute = report.byRoute || {}
const bySubtype = report.byNonRouteSubtype || {}
assert(Object.keys(byRoute).length === 22, 'byRoute must contain exactly 22 routes')
for (const [routeId, row] of Object.entries(byRoute)) {
  assert(row.n === 8, `${routeId} calibration known n ${row.n} !=8`)
  for (const field of ['semanticActEligible', 'arbitrationNull', 'routeabilityAccepted', 'reachesFallback']) assert(Number.isInteger(row[field]) && row[field] >= 0 && row[field] <= row.n, `${routeId} invalid ${field}`)
}
for (const [subtype, expectedN] of Object.entries({ near_domain_not_current_route: 88, outside_current_22: 44, route_unresolved: 44 })) {
  const row = bySubtype[subtype]
  assert(row?.n === expectedN, `${subtype} n drift`)
  for (const field of ['semanticActEligible', 'arbitrationNull', 'routeabilityAccepted', 'reachesFallback']) assert(Number.isInteger(row[field]) && row[field] >= 0 && row[field] <= row.n, `${subtype} invalid ${field}`)
}

const summary = report.summary
assert(summary.calibrationKnown === 176 && summary.calibrationNonRoute === 176, 'summary population drift')
const knownEligibleFromRoutes = Object.values(byRoute).reduce((sum, row) => sum + row.semanticActEligible, 0)
const knownFallbackFromRoutes = Object.values(byRoute).reduce((sum, row) => sum + row.reachesFallback, 0)
const nonRouteFallbackFromSubtype = Object.values(bySubtype).reduce((sum, row) => sum + row.reachesFallback, 0)
assert(Math.abs(summary.calibrationKnownSemanticActRetention - knownEligibleFromRoutes / 176) < 1e-12, 'known Semantic Act retention recomputation mismatch')
assert(summary.calibrationKnownReachingFallback === knownFallbackFromRoutes, 'known fallback exposure recomputation mismatch')
assert(summary.minimumKnownReachingFallbackPerRouteObserved === Math.min(...Object.values(byRoute).map((row) => row.reachesFallback)), 'minimum per-route exposure mismatch')
assert(summary.calibrationNonRouteReachingFallback === nonRouteFallbackFromSubtype, 'non-route fallback exposure recomputation mismatch')
assert(summary.nearDomainReachingFallback === bySubtype.near_domain_not_current_route.reachesFallback, 'near-domain summary mismatch')
assert(summary.outsideCurrent22ReachingFallback === bySubtype.outside_current_22.reachesFallback, 'outside summary mismatch')
assert(summary.routeUnresolvedReachingFallback === bySubtype.route_unresolved.reachesFallback, 'unresolved summary mismatch')

const expectedChecks = {
  calibrationKnownSemanticActRetention: summary.calibrationKnownSemanticActRetention >= contract.frozenChecks.minimumCalibrationKnownSemanticActRetention,
  everyRouteMinimumKnownFallbackExposure: Object.values(byRoute).every((row) => row.reachesFallback >= contract.frozenChecks.minimumKnownReachingFallbackPerRoute),
  calibrationTotalKnownFallbackExposure: summary.calibrationKnownReachingFallback >= contract.frozenChecks.minimumTotalKnownReachingFallback,
  calibrationTotalNonRouteFallbackExposure: summary.calibrationNonRouteReachingFallback >= contract.frozenChecks.minimumTotalNonRouteReachingFallback,
  calibrationNearDomainFallbackExposure: summary.nearDomainReachingFallback >= contract.frozenChecks.minimumNearDomainNonRouteReachingFallback,
  calibrationOutsideCurrent22FallbackExposure: summary.outsideCurrent22ReachingFallback >= contract.frozenChecks.minimumOutsideCurrent22ReachingFallback,
  calibrationRouteUnresolvedFallbackExposure: summary.routeUnresolvedReachingFallback >= contract.frozenChecks.minimumRouteUnresolvedReachingFallback,
  deterministicCalibrationEligibilityRemainsClean: summary.deterministicEligibilityFailures === 0
}
assert(JSON.stringify(report.checks) === JSON.stringify(expectedChecks), 'report checks do not independently recompute')
const expectedPass = Object.values(expectedChecks).every(Boolean)
assert(report.pass === expectedPass, 'report pass drift')
assert(report.status === (expectedPass ? 'pass_locked_sealed_v05_calibration_reachability' : 'fail_locked_sealed_v05_calibration_reachability'), 'report status drift')

console.log(JSON.stringify({ verified: true, status: report.status, summary, checks: expectedChecks, pass: expectedPass }, null, 2))
