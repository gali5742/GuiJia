import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const reportPath = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-report-v0.1.json';
const outputPath = 'data/liuyao-semantic-v013-candidate-v02-independent-diagnostic-v0.1.json';
const report = readJson(reportPath);

if (report.status !== 'first_post_lock_independent_result' || report.immutable !== true) {
  throw new Error('immutable Candidate v0.2 independent report required');
}
if (report.candidate?.candidateSha256 !== '23368e0911f1164f6af5d7e72dd894ebfcc767524840e5bba796aaff6940f828') {
  throw new Error('unexpected Candidate v0.2 SHA');
}
if (report.promotionPassed !== false) throw new Error('diagnostic is only for failed Candidate v0.2');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
}
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const compatibility = context.GuiJia?.liuyaoSemanticRouteCompatibilityV02;
if (!evidenceExtractor?.extract || !compatibility?.evaluate) throw new Error('diagnostic dependencies failed to load');

const failures = (report.failures || []).map((row) => {
  const evidence = evidenceExtractor.extract(row.text);
  const expectedCompatibility = row.expectedRoute ? compatibility.evaluate(row.expectedRoute, evidence) : null;
  const arbitrationCompatibility = row.arbitration?.routeId ? compatibility.evaluate(row.arbitration.routeId, evidence) : null;
  const selectedCompatibility = row.selection?.routeId ? compatibility.evaluate(row.selection.routeId, evidence) : null;
  const expectedHeadRank = row.expectedRoute
    ? row.head?.top1?.id === row.expectedRoute ? 1 : row.head?.top2?.id === row.expectedRoute ? 2 : null
    : null;
  const failureClass = row.expectedDisposition === 'route_known'
    ? row.routeability?.disposition === 'non_route'
      ? 'known_routeability_reject'
      : row.selection?.status !== 'selected'
        ? 'known_selection_unresolved'
        : row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute
          ? 'known_wrong_selected_route'
          : row.finalReason === 'scope_hard_veto'
            ? 'known_scope_hard_veto'
            : 'known_other_failure'
    : row.routeability?.reasonCode === 'confirmed_support_rescue'
      ? 'nonroute_support_rescue_activation'
      : row.routeability?.reasonCode === 'confirmed_strong_rescue'
        ? 'nonroute_strong_rescue_activation'
        : row.arbitration?.routeId
          ? 'nonroute_arbitration_activation'
          : 'nonroute_score_accept_head_fallback_activation';
  return {
    id:row.id,
    text:row.text,
    expectedDisposition:row.expectedDisposition,
    expectedRoute:row.expectedRoute || null,
    expectedCandidatePath:row.expectedCandidatePath || null,
    nonRouteSubtype:row.nonRouteSubtype || null,
    failureClass,
    routeability:row.routeability,
    head:row.head,
    expectedHeadRank,
    arbitration:row.arbitration,
    selection:row.selection,
    finalDisposition:row.finalDisposition,
    finalRoute:row.finalRoute,
    finalReason:row.finalReason,
    evidence:{
      domains:evidence.domains,
      events:evidence.events,
      directions:evidence.directions,
      relations:evidence.relations,
      goals:evidence.goals,
      currentTargets:evidence.currentTargets,
      unsupportedTargets:evidence.unsupportedTargets
    },
    compatibility:{
      expected:expectedCompatibility,
      arbitration:arbitrationCompatibility,
      selected:selectedCompatibility
    }
  };
});

const countBy = (rows, getter) => {
  const out = {};
  for (const row of rows) {
    const key = String(getter(row) ?? 'null');
    out[key] = (out[key] || 0) + 1;
  }
  return out;
};
const knownFailures = failures.filter((row) => row.expectedDisposition === 'route_known');
const nonRouteFailures = failures.filter((row) => row.expectedDisposition === 'non_route');
const routeabilityRejects = knownFailures.filter((row) => row.failureClass === 'known_routeability_reject');
const wrongSelections = knownFailures.filter((row) => row.failureClass === 'known_wrong_selected_route');
const unresolved = knownFailures.filter((row) => row.failureClass === 'known_selection_unresolved');
const fallbackFailures = knownFailures.filter((row) => row.expectedCandidatePath === 'fallback_head');
const supportFailures = knownFailures.filter((row) => row.expectedCandidatePath === 'support_arbitration');
const strongFailures = knownFailures.filter((row) => row.expectedCandidatePath === 'strong_arbitration');
const falseFallbackActivations = nonRouteFailures.filter((row) => row.failureClass === 'nonroute_score_accept_head_fallback_activation');
const supportRescueFalseActivations = nonRouteFailures.filter((row) => row.failureClass === 'nonroute_support_rescue_activation');

const margins = (rows) => rows.map((row) => row.head?.routeMargin).filter(Number.isFinite);
const summarizeMargins = (values) => {
  if (!values.length) return { n:0, min:null, max:null, mean:null };
  return {
    n:values.length,
    min:Math.min(...values),
    max:Math.max(...values),
    mean:values.reduce((sum, value) => sum + value, 0) / values.length
  };
};

const diagnosis = {
  version:'0.13-candidate-v0.2-independent-diagnostic-v0.1',
  status:'post_failure_diagnostic_only',
  source:{
    reportPath,
    candidateSha256:report.candidate.candidateSha256,
    evaluationSha256:report.evaluation.dataSha256
  },
  policy:{
    trainingEligible:false,
    calibrationEligible:false,
    independentEvidence:false,
    candidateV02MutationAllowed:false,
    thresholdSelectionAllowed:false,
    mayInformNextVersionArchitecture:true,
    nextVersionRequiresFreshDevelopmentCalibrationAndPostLockIndependent:true
  },
  summary:{
    failures:failures.length,
    knownFailures:knownFailures.length,
    nonRouteFalseActivations:nonRouteFailures.length,
    failureClasses:countBy(failures, (row) => row.failureClass),
    knownFailureByPath:countBy(knownFailures, (row) => row.expectedCandidatePath),
    routeabilityRejectByRoute:countBy(routeabilityRejects, (row) => row.expectedRoute),
    wrongSelectionByExpectedRoute:countBy(wrongSelections, (row) => row.expectedRoute),
    wrongSelectionBySelectedRoute:countBy(wrongSelections, (row) => row.finalRoute),
    nonRouteFalseActivationBySubtype:countBy(nonRouteFailures, (row) => row.nonRouteSubtype),
    nonRouteFalseActivationByMode:countBy(nonRouteFailures, (row) => row.failureClass),
    expectedCompatibilityOnKnownFailures:countBy(knownFailures, (row) => row.compatibility.expected?.status),
    expectedHeadRankOnKnownFailures:countBy(knownFailures, (row) => row.expectedHeadRank),
    expectedHeadRankOnFallbackFailures:countBy(fallbackFailures, (row) => row.expectedHeadRank),
    headMarginOnWrongSelections:summarizeMargins(margins(wrongSelections)),
    headMarginOnFalseFallbackActivations:summarizeMargins(margins(falseFallbackActivations)),
    supportFailureExpectedCompatibility:countBy(supportFailures, (row) => row.compatibility.expected?.status),
    strongFailureExpectedCompatibility:countBy(strongFailures, (row) => row.compatibility.expected?.status),
    supportRescueFalseActivationUnsupportedTargets:countBy(supportRescueFalseActivations, (row) => (row.evidence.unsupportedTargets || []).join('|') || 'none')
  },
  architecturalFindings:[
    {
      id:'V03-DIAG-001',
      responsibility:'fallback_admission',
      finding:'Arbitration-null fallback is not safe when Routeability is barely positive; the failed independent set contains both wrong known-route selections and non-route activations through pure Head fallback.',
      evidenceIds:[...wrongSelections.filter((row) => row.expectedCandidatePath === 'fallback_head').map((row) => row.id), ...falseFallbackActivations.map((row) => row.id)]
    },
    {
      id:'V03-DIAG-002',
      responsibility:'support_rescue_boundary',
      finding:'Confirmed-support rescue can activate procedural or informational near-domain questions when event semantics are present but the current target is a rule, fee, tax, or administration question.',
      evidenceIds:supportRescueFalseActivations.map((row) => row.id)
    },
    {
      id:'V03-DIAG-003',
      responsibility:'compatibility',
      finding:'Compatibility still has false contradiction or confirmation gaps: a strong Head-correct debt-collection case can become unresolved, while valid topic-only support cases can remain merely compatible and miss rescue.',
      evidenceIds:[...strongFailures.map((row) => row.id), ...supportFailures.map((row) => row.id)]
    },
    {
      id:'V03-DIAG-004',
      responsibility:'routeability',
      finding:'The scalar Routeability score cannot be repaired by lowering one global threshold: it rejects many valid fallback questions while already accepting vague and near-domain non-routes.',
      evidenceIds:[...routeabilityRejects.filter((row) => row.expectedCandidatePath === 'fallback_head').map((row) => row.id), ...nonRouteFailures.map((row) => row.id)]
    }
  ],
  nextVersionConstraints:[
    'Do not lower the frozen Routeability threshold as the primary v0.3 fix.',
    'Do not use this independent set to choose a fallback margin threshold or train a fallback gate.',
    'Add an explicit modern informational/procedural target boundary before support rescue and pure Head fallback.',
    'Separate fallback admission from Routeability so route membership and route identity confidence are not conflated.',
    'Repair Compatibility semantics with deterministic contracts before any learned fallback calibration.',
    'Create fresh v0.3 development and calibration corpora; after Candidate v0.3 lock, create another fresh independent set.'
  ],
  failures
};

fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(diagnosis, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(diagnosis.summary, null, 2));
