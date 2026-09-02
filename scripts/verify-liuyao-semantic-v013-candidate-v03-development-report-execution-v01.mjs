import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-report.json';
const developmentPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const developmentLockPath = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const fallbackLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.lock.json';
const frozenLockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const ratio = (n,d) => d ? n/d : 0;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const nearly = (a,b,epsilon=1e-12) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) <= epsilon;

const report = readJson(reportPath);
const development = readJson(developmentPath);
const developmentLock = readJson(developmentLockPath);
const fallbackLock = readJson(fallbackLockPath);
const frozenLock = readJson(frozenLockPath);
const contract = readJson(contractPath);

assert(report.version === '0.13-candidate-v0.3-development-report-execution-v0.1', `report version drift: ${report.version}`);
assert(report.status === 'corrected_pre_lock_development_diagnostic', `report status drift: ${report.status}`);
assert(report.scope === 'liuyao_semantic_decision_stack_v0.13_candidate_v0.3', 'report scope drift');
assert(report.policy?.usesIndependentEval === false && report.policy?.readsIndependentEval === false, 'report uses/reads independent evaluation');
assert(report.policy?.training === false && report.policy?.calibration === false, 'development report claims training/calibration');
assert(report.policy?.retunesThresholds === false, 'development report retunes thresholds');
assert(report.policy?.claimsGeneralization === false && report.policy?.developmentOnly === true, 'development report policy drift');
assert(/^[0-9a-f]{40}$/.test(report.execution?.developmentSealCommit || ''), 'report lacks committed development seal SHA');
assert(report.execution?.canonicalTextsPerEncoderCall === 1, 'report execution is not single-text');
assert(report.execution?.developmentArtifactSha256 === developmentLock.artifactSha256, 'report development artifact SHA drift');
assert(developmentLock.artifactSha256 === sha256(developmentPath), 'development artifact/lock SHA drift');
assert(report.execution?.correctedFrozenDependenciesSha256 === frozenLock.artifactSha256, 'report corrected dependency SHA drift');
assert(report.execution?.correctedFallbackIdentityArtifactSha256 === fallbackLock.artifactSha256, 'report corrected Fallback SHA drift');
assert(report.execution?.routeabilityThreshold === fallbackLock.routeabilityThreshold, 'report Routeability threshold drift');
assert(report.execution?.scopeHardVetoCutoff === fallbackLock.scopeHardVetoCutoff, 'report Scope cutoff drift');
assert(report.execution?.fallbackIdentityGlobalThreshold === fallbackLock.globalThreshold, 'report Fallback threshold drift');
assert(report.execution?.routeabilityRuntimeTemporaryThresholdReplacementCount === 1, 'Routeability temporary threshold replacement count drift');
assert(report.execution.routeabilityThreshold === contract.thresholds.routeability, 'contract/report Routeability mismatch');
assert(report.execution.scopeHardVetoCutoff === contract.thresholds.scopeHardVeto, 'contract/report Scope mismatch');
assert(report.execution.fallbackIdentityGlobalThreshold === contract.thresholds.fallbackIdentityGlobal, 'contract/report Fallback mismatch');
assert(report.execution.routeabilityThreshold !== 0.7675678218564946, 'legacy Routeability threshold leaked into development report');
assert(report.execution.scopeHardVetoCutoff !== 0.4196, 'legacy Scope cutoff leaked into development report');

const results = report.results || [];
assert(results.length === 198, `report result rows ${results.length} != 198`);
assert(development.rows?.length === 198, 'development rows drift');
const devById = new Map(development.rows.map((row)=>[row.id,row]));
assert(devById.size === 198, 'development IDs not unique');
for (const row of results) {
  const source = devById.get(row.id);
  assert(source, `report contains unknown row ${row.id}`);
  assert(row.text === source.text, `report text drift for ${row.id}`);
  assert(row.expectedDisposition === source.expectedDisposition, `report disposition-label drift for ${row.id}`);
  assert((row.expectedRoute || null) === (source.expectedRoute || null), `report route-label drift for ${row.id}`);
  assert((row.expectedCandidatePath || null) === (source.expectedCandidatePath || null), `report path-label drift for ${row.id}`);
  assert((row.nonRouteSubtype || null) === (source.nonRouteSubtype || null), `report subtype-label drift for ${row.id}`);
  assert(row.routeability?.threshold === fallbackLock.routeabilityThreshold, `row Routeability threshold drift ${row.id}`);
  assert(row.scope?.hardVetoCutoff === fallbackLock.scopeHardVetoCutoff, `row Scope cutoff drift ${row.id}`);
  if (row.reachesFallbackIdentity) {
    assert(row.fallbackIdentity?.decision, `fallback row missing decision ${row.id}`);
    for (const candidate of row.fallbackIdentity.decision.candidates || []) {
      assert(candidate.threshold === fallbackLock.globalThreshold, `row Fallback threshold drift ${row.id}/${candidate.routeId}`);
    }
  }
  const expectedFinalExact = source.expectedDisposition === 'route_known'
    ? row.final?.disposition === 'route_known' && row.final?.routeId === source.expectedRoute
    : row.final?.disposition === 'non_route';
  assert(row.finalExact === expectedFinalExact, `row finalExact mismatch ${row.id}`);
  const expectedFalseActivation = source.expectedDisposition === 'non_route' && row.final?.disposition === 'route_known';
  assert(row.falseRouteActivation === expectedFalseActivation, `row falseRouteActivation mismatch ${row.id}`);
}

const known = results.filter((row)=>row.expectedDisposition === 'route_known');
const nonRoute = results.filter((row)=>row.expectedDisposition === 'non_route');
assert(known.length === 132 && nonRoute.length === 66, `report known/nonroute count drift ${known.length}/${nonRoute.length}`);
const acceptedKnown = known.filter((row)=>row.final?.disposition === 'route_known');
const recomputed = {
  rows:198,
  known:132,
  nonRoute:66,
  routeabilityKnownRecall:ratio(known.filter((row)=>row.routeability?.disposition === 'route_known').length, known.length),
  knownFinalRetention:ratio(acceptedKnown.length, known.length),
  knownExactRoute:ratio(known.filter((row)=>row.final?.disposition === 'route_known' && row.final?.routeId === row.expectedRoute).length, known.length),
  acceptedRouteAccuracy:ratio(acceptedKnown.filter((row)=>row.final?.routeId === row.expectedRoute).length, acceptedKnown.length),
  nonRouteFalseRouteActivation:ratio(nonRoute.filter((row)=>row.falseRouteActivation).length, nonRoute.length),
  nonRouteNoRouteActivationSafety:ratio(nonRoute.filter((row)=>row.final?.disposition !== 'route_known').length, nonRoute.length)
};
for (const key of Object.keys(recomputed)) {
  assert(nearly(report.summary?.[key], recomputed[key]), `summary ${key} mismatch: ${report.summary?.[key]} vs ${recomputed[key]}`);
}

const pathIds = ['strong_arbitration','support_arbitration','fallback_head'];
for (const pathId of pathIds) {
  const subset = known.filter((row)=>row.expectedCandidatePath === pathId);
  assert(subset.length === 44, `${pathId} count ${subset.length}`);
  const accepted = subset.filter((row)=>row.final?.disposition === 'route_known');
  const expected = {
    n:subset.length,
    routeabilityRecall:ratio(subset.filter((row)=>row.routeability?.disposition === 'route_known').length, subset.length),
    fallbackReached:subset.filter((row)=>row.reachesFallbackIdentity).length,
    fallbackSelected:subset.filter((row)=>row.fallbackIdentity?.decision?.status === 'selected').length,
    finalRetention:ratio(accepted.length, subset.length),
    finalExact:ratio(subset.filter((row)=>row.final?.disposition === 'route_known' && row.final?.routeId === row.expectedRoute).length, subset.length),
    acceptedAccuracy:ratio(accepted.filter((row)=>row.final?.routeId === row.expectedRoute).length, accepted.length),
    scopeHardVeto:subset.filter((row)=>row.final?.reasonCode === 'scope_hard_veto').length,
    wrongSelected:subset.filter((row)=>row.final?.disposition === 'route_known' && row.final?.routeId !== row.expectedRoute).length
  };
  const actual = report.summary?.byKnownPath?.[pathId];
  assert(actual, `missing path summary ${pathId}`);
  for (const [key,value] of Object.entries(expected)) assert(nearly(actual[key], value), `${pathId}.${key} mismatch`);
}

const subtypeIds = ['outside_current_22','route_unresolved','near_domain_not_current_route'];
for (const subtype of subtypeIds) {
  const subset = nonRoute.filter((row)=>row.nonRouteSubtype === subtype);
  assert(subset.length === 22, `${subtype} count ${subset.length}`);
  const expected = {
    n:22,
    falseRouteActivation:ratio(subset.filter((row)=>row.falseRouteActivation).length, 22),
    noRouteActivationSafety:ratio(subset.filter((row)=>row.final?.disposition !== 'route_known').length, 22),
    fallbackReached:subset.filter((row)=>row.reachesFallbackIdentity).length
  };
  const actual = report.summary?.byNonRouteSubtype?.[subtype];
  assert(actual, `missing subtype summary ${subtype}`);
  for (const [key,value] of Object.entries(expected)) assert(nearly(actual[key], value), `${subtype}.${key} mismatch`);
}

const gates = contract.promotionPolicy;
assert(JSON.stringify(report.promotionGates) === JSON.stringify({
  minimumKnownExactRoute:gates.minimumKnownExactRoute,
  minimumAcceptedRouteAccuracy:gates.minimumAcceptedRouteAccuracy,
  maximumOverallFalseRouteActivation:gates.maximumOverallFalseRouteActivation,
  maximumFalseRouteActivationPerNonRouteSubtype:gates.maximumFalseRouteActivationPerNonRouteSubtype,
  requireNoStructuralPathCollapse:gates.requireNoStructuralPathCollapse
}), 'report promotion gates drift from locked Phase C contract');
const expectedChecks = {
  knownExactRoute:recomputed.knownExactRoute >= gates.minimumKnownExactRoute,
  acceptedRouteAccuracy:recomputed.acceptedRouteAccuracy >= gates.minimumAcceptedRouteAccuracy,
  overallFalseRouteActivation:recomputed.nonRouteFalseRouteActivation <= gates.maximumOverallFalseRouteActivation,
  perSubtypeFalseActivation:subtypeIds.every((subtype)=>report.summary.byNonRouteSubtype[subtype].falseRouteActivation <= gates.maximumFalseRouteActivationPerNonRouteSubtype),
  noStructuralPathCollapse:pathIds.every((pathId)=>report.summary.byKnownPath[pathId].finalExact > 0)
};
assert(JSON.stringify(report.checks) === JSON.stringify(expectedChecks), `development checks mismatch: ${JSON.stringify(report.checks)} vs ${JSON.stringify(expectedChecks)}`);
assert(report.readyForCandidateLock === Object.values(expectedChecks).every(Boolean), 'readyForCandidateLock does not equal recomputed checks');

const serialized = JSON.stringify(report);
for (const forbidden of ['routeThresholds','thresholdByRoute','routeSpecificThresholdMap','perRouteThresholds']) {
  assert(!serialized.includes(`\"${forbidden}\"`), `forbidden route-specific threshold structure in report: ${forbidden}`);
}
assert(!serialized.includes('freshPostLockIndependentRows'), 'independent-evaluation payload leaked into development report');

console.log('Corrected Candidate v0.3 development report verified.');
console.log(JSON.stringify({
  reportSha256:sha256(reportPath),
  readyForCandidateLock:report.readyForCandidateLock,
  checks:report.checks,
  knownExactRoute:report.summary.knownExactRoute,
  acceptedRouteAccuracy:report.summary.acceptedRouteAccuracy,
  nonRouteFalseRouteActivation:report.summary.nonRouteFalseRouteActivation,
  byKnownPath:report.summary.byKnownPath,
  byNonRouteSubtype:report.summary.byNonRouteSubtype,
  attrition:report.summary.attrition
}, null, 2));
