import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const report = readJson('data/liuyao-semantic-decision-stack-v0.13-independent-report-v0.1.json');
const evaluation = readJson('data/liuyao-semantic-decision-stack-v0.13-independent-eval.json');
const textById = new Map(evaluation.rows.map((row) => [row.id, row.text]));
const rows = report.results.map((row) => ({ ...row, text:textById.get(row.id) || '' }));

const countBy = (items, keyFn) => {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Object.fromEntries([...map.entries()].sort((a,b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))));
};
const compact = (row) => ({
  id:row.id,
  text:row.text,
  expectedRoute:row.expectedRoute,
  expectedPath:row.expectedCandidatePath,
  subtype:row.nonRouteSubtype,
  routeabilityProbability:row.routeability?.probability,
  routeabilityReason:row.routeability?.reasonCode,
  arbitration:row.arbitration ? { routeId:row.arbitration.routeId, strength:row.arbitration.strength } : null,
  headTop1:row.head?.top1,
  headTop2:row.head?.top2,
  scopeProbability:row.scope?.probability,
  finalDisposition:row.finalDisposition,
  finalRoute:row.finalRoute,
  finalReason:row.finalReason
});

const known = rows.filter((row) => row.expectedDisposition === 'route_known');
const nonRoute = rows.filter((row) => row.expectedDisposition === 'non_route');
const routeabilityRejects = known.filter((row) => row.routeability?.disposition === 'non_route');
const scopeVetos = known.filter((row) => row.finalReason === 'scope_hard_veto');
const wrongSelected = known.filter((row) => row.finalDisposition === 'route_known' && row.finalRoute !== row.expectedRoute);
const falseActivations = nonRoute.filter((row) => row.finalDisposition === 'route_known');
const routeabilityFalseActivations = nonRoute.filter((row) => row.routeability?.disposition === 'route_known');
const headWrong = known.filter((row) => row.head?.top1?.id !== row.expectedRoute);
const headWrongFinalCorrect = known.filter((row) => row.head?.top1?.id !== row.expectedRoute && row.finalDisposition === 'route_known' && row.finalRoute === row.expectedRoute);

const diagnostic = {
  version:'0.13-candidate-v0.1-independent-diagnostic',
  status:'post_failure_diagnostic_only',
  policy:{ candidateMutation:false, evaluationReuseAsIndependentForNextCandidate:false },
  candidateSha256:report.candidate.candidateSha256,
  evalDataSha256:report.evaluation.dataSha256,
  headline:{
    routeabilityRejects:routeabilityRejects.length,
    scopeVetos:scopeVetos.length,
    wrongSelected:wrongSelected.length,
    routeabilityFalseActivations:routeabilityFalseActivations.length,
    finalFalseActivations:falseActivations.length,
    headWrong:headWrong.length,
    headWrongFinalCorrect:headWrongFinalCorrect.length
  },
  routeabilityRejects:{
    byPath:countBy(routeabilityRejects, (row) => row.expectedCandidatePath),
    byExpectedRoute:countBy(routeabilityRejects, (row) => row.expectedRoute),
    rows:routeabilityRejects.map(compact)
  },
  scopeVetos:{
    byPath:countBy(scopeVetos, (row) => row.expectedCandidatePath),
    byExpectedRoute:countBy(scopeVetos, (row) => row.expectedRoute),
    rows:scopeVetos.map(compact)
  },
  wrongSelected:{
    byPath:countBy(wrongSelected, (row) => row.expectedCandidatePath),
    transitions:countBy(wrongSelected, (row) => `${row.expectedRoute}->${row.finalRoute}`),
    rows:wrongSelected.map(compact)
  },
  falseActivations:{
    routeabilityBySubtype:countBy(routeabilityFalseActivations, (row) => row.nonRouteSubtype),
    finalBySubtype:countBy(falseActivations, (row) => row.nonRouteSubtype),
    finalRoutes:countBy(falseActivations, (row) => row.finalRoute),
    rows:falseActivations.map(compact)
  },
  router:{
    headWrongByPath:countBy(headWrong, (row) => row.expectedCandidatePath),
    headWrongTransitions:countBy(headWrong, (row) => `${row.expectedRoute}->${row.head?.top1?.id}`),
    correctedByStack:headWrongFinalCorrect.map(compact)
  }
};

fs.writeFileSync(path.join(root, 'data/liuyao-semantic-v013-candidate-v01-independent-diagnostic.json'), `${JSON.stringify(diagnostic, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  headline:diagnostic.headline,
  routeabilityRejectsByPath:diagnostic.routeabilityRejects.byPath,
  routeabilityRejectsByExpectedRoute:diagnostic.routeabilityRejects.byExpectedRoute,
  scopeVetos:diagnostic.scopeVetos.rows,
  wrongSelectedTransitions:diagnostic.wrongSelected.transitions,
  wrongSelectedRows:diagnostic.wrongSelected.rows,
  finalFalseActivations:diagnostic.falseActivations.rows,
  headWrongByPath:diagnostic.router.headWrongByPath,
  headWrongTransitions:diagnostic.router.headWrongTransitions
}, null, 2));
