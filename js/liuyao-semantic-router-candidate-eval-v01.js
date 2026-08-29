import { semanticRouterPocV081 as router } from './liuyao-semantic-router-poc-v081.js?v=poc0.8.1';

const DATA_URL = new URL('../data/liuyao-semantic-router-candidate-eval-v0.1.json', import.meta.url);
const INVENTORY_URL = new URL('../data/liuyao-semantic-route-inventory-v0.2.json', import.meta.url);

let candidateData = null;
let inventoryData = null;
let trained = false;

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};
const mean = (values) => values.length ? values.reduce((a,b) => a+b, 0) / values.length : NaN;
const safeRatio = (n, d) => d ? n / d : NaN;
const ruleStatusOf = (routeId) => {
  const row = (inventoryData?.routes || []).find((item) => item.routeId === routeId);
  if (!row) return 'not_applicable';
  return row.ruleStatus || 'confirmed';
};
const ensureData = async () => {
  if (!candidateData || !inventoryData) {
    [candidateData, inventoryData] = await Promise.all([fetchJson(DATA_URL), fetchJson(INVENTORY_URL)]);
    if (candidateData.status !== 'sealed_candidate_eval' || candidateData.sealed !== true || candidateData.sampleCount !== 300) throw new Error('Candidate Eval v0.1 seal mismatch');
    if (inventoryData.version !== '0.2' || (inventoryData.routes || []).length !== 22) throw new Error('22-route inventory mismatch');
  }
  return { candidateData, inventoryData };
};

const flattenRows = async () => {
  await ensureData();
  const inventoryMap = new Map((inventoryData.routes || []).map((row) => [row.routeId, row]));
  const rows = [];
  let index = 1;
  for (const [routeId, spec] of Object.entries(candidateData.routes || {})) {
    const routeMeta = inventoryMap.get(routeId);
    for (const raw of spec.samples || []) {
      const sample = typeof raw === 'string' ? { text:raw } : raw;
      rows.push({
        id:`FC-${String(index++).padStart(3,'0')}`,
        text:sample.text,
        expectedRoute:routeId,
        expectedRouterDisposition:'route_known',
        expectedSufficiencyStatus:sample.expectedSufficiencyStatus || 'sufficient',
        expectedRuleAvailabilityStatus:spec.ruleAvailability,
        goalType:sample.goalType ?? spec.goalType,
        slots:sample.slots ?? spec.slots,
        domain:routeMeta?.domain || 'unknown',
        kind:'known'
      });
    }
  }
  for (const text of candidateData.rejection?.out_of_scope || []) {
    rows.push({
      id:`FC-${String(index++).padStart(3,'0')}`,
      text,
      expectedRoute:'__other__',
      expectedRouterDisposition:'route_out_of_scope',
      expectedSufficiencyStatus:'not_applicable',
      expectedRuleAvailabilityStatus:'not_applicable',
      goalType:'unknown', slots:[], domain:'__reject__', kind:'out_of_scope'
    });
  }
  for (const text of candidateData.rejection?.underspecified || []) {
    rows.push({
      id:`FC-${String(index++).padStart(3,'0')}`,
      text,
      expectedRoute:'__unresolved__',
      expectedRouterDisposition:'route_unresolved_underspecified',
      expectedSufficiencyStatus:'not_applicable',
      expectedRuleAvailabilityStatus:'not_applicable',
      goalType:'unknown', slots:[], domain:'__reject__', kind:'underspecified'
    });
  }
  if (rows.length !== 300) throw new Error(`Candidate Eval rows ${rows.length} != 300`);
  return rows;
};

const evaluateSufficiency = (routeId, row) => {
  const api = globalThis.GuiJia?.liuyaoSemanticSufficiency;
  if (!api?.evaluateIntentSufficiency) throw new Error('Semantic Sufficiency v0.2 未加载');
  const intent = {
    version:'candidate-eval-fixture-v0.1',
    status:'resolved',
    goals:[{ type:row.goalType }],
    event:{ type:'candidate_eval_fixture' },
    semantics:{},
    participants:[]
  };
  const slots = (row.slots || []).map((id) => ({ id, source:'sealed_candidate_fixture', evidence:row.id }));
  return api.evaluateIntentSufficiency(routeId, intent, slots, []);
};

const summarize = (results) => {
  const known = results.filter((row) => row.kind === 'known');
  const out = results.filter((row) => row.kind === 'out_of_scope');
  const under = results.filter((row) => row.kind === 'underspecified');
  const acceptedKnown = known.filter((row) => row.accepted);
  const routeIds = [...new Set(known.map((row) => row.expectedRoute))];
  const domains = [...new Set(known.map((row) => row.domain))];

  const routeSummaries = routeIds.map((routeId) => {
    const rows = known.filter((row) => row.expectedRoute === routeId);
    const accepted = rows.filter((row) => row.accepted);
    const correctAccepted = accepted.filter((row) => row.finalRouteCorrect);
    return {
      routeId,
      count:rows.length,
      top1Accuracy:safeRatio(rows.filter((row) => row.top1Correct).length, rows.length),
      coverage:safeRatio(accepted.length, rows.length),
      acceptedAccuracy:safeRatio(correctAccepted.length, accepted.length),
      finalRouteAccuracy:safeRatio(rows.filter((row) => row.finalRouteCorrect).length, rows.length),
      sufficiencyE2E:safeRatio(rows.filter((row) => row.sufficiencyE2ECorrect).length, rows.length),
      ruleAvailabilityE2E:safeRatio(rows.filter((row) => row.ruleAvailabilityE2ECorrect).length, rows.length),
      jointExact:safeRatio(rows.filter((row) => row.jointExact).length, rows.length)
    };
  });
  const domainSummaries = domains.map((domain) => {
    const rows = known.filter((row) => row.domain === domain);
    return {
      domain,
      count:rows.length,
      finalRouteAccuracy:safeRatio(rows.filter((row) => row.finalRouteCorrect).length, rows.length),
      sufficiencyE2E:safeRatio(rows.filter((row) => row.sufficiencyE2ECorrect).length, rows.length),
      ruleAvailabilityE2E:safeRatio(rows.filter((row) => row.ruleAvailabilityE2ECorrect).length, rows.length),
      jointExact:safeRatio(rows.filter((row) => row.jointExact).length, rows.length)
    };
  });

  return {
    knownCount:known.length,
    rejectCount:out.length + under.length,
    routeTop1Accuracy:safeRatio(known.filter((row) => row.top1Correct).length, known.length),
    knownCoverage:safeRatio(acceptedKnown.length, known.length),
    acceptedKnownAccuracy:safeRatio(acceptedKnown.filter((row) => row.finalRouteCorrect).length, acceptedKnown.length),
    outOfScopeRejection:safeRatio(out.filter((row) => !row.accepted).length, out.length),
    underspecifiedRejection:safeRatio(under.filter((row) => !row.accepted).length, under.length),
    falseActivationRate:safeRatio(results.filter((row) => row.kind !== 'known' && row.accepted).length, out.length + under.length),
    routeMacro:mean(routeSummaries.map((row) => row.finalRouteAccuracy)),
    domainMacro:mean(domainSummaries.map((row) => row.finalRouteAccuracy)),
    oracleSufficiencyAccuracy:safeRatio(known.filter((row) => row.oracleSufficiencyCorrect).length, known.length),
    sufficiencyE2E:safeRatio(known.filter((row) => row.sufficiencyE2ECorrect).length, known.length),
    ruleAvailabilityE2E:safeRatio(known.filter((row) => row.ruleAvailabilityE2ECorrect).length, known.length),
    jointExact:safeRatio(results.filter((row) => row.jointExact).length, results.length),
    routeSummaries,
    domainSummaries
  };
};

const runCandidateEval = async ({ onProgress } = {}) => {
  if (!trained) throw new Error('请先按冻结 recipe 训练 v0.8.1');
  const rows = await flattenRows();
  const results = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const prediction = await router.classify(row.text);
    const accepted = Boolean(prediction.gate?.accepted);
    const finalRoute = accepted ? prediction.gate.predicted : '__rejected__';
    const top1Correct = row.kind === 'known' ? prediction.top1?.id === row.expectedRoute : false;
    const finalRouteCorrect = row.kind === 'known' ? (accepted && finalRoute === row.expectedRoute) : !accepted;

    let oracleSufficiency = 'not_applicable';
    let chainSufficiency = 'not_applicable';
    let oracleSufficiencyCorrect = row.kind !== 'known';
    let sufficiencyE2ECorrect = row.kind !== 'known' ? !accepted : false;
    let actualRuleAvailability = 'not_applicable';
    let ruleAvailabilityE2ECorrect = row.kind !== 'known' ? !accepted : false;

    if (row.kind === 'known') {
      const oracle = evaluateSufficiency(row.expectedRoute, row);
      oracleSufficiency = oracle.status;
      oracleSufficiencyCorrect = oracle.status === row.expectedSufficiencyStatus;
      if (accepted) {
        const chain = evaluateSufficiency(finalRoute, row);
        chainSufficiency = chain.status;
        actualRuleAvailability = ruleStatusOf(finalRoute);
      }
      sufficiencyE2ECorrect = finalRouteCorrect && chainSufficiency === row.expectedSufficiencyStatus;
      ruleAvailabilityE2ECorrect = finalRouteCorrect && actualRuleAvailability === row.expectedRuleAvailabilityStatus;
    }

    const jointExact = row.kind === 'known'
      ? finalRouteCorrect && sufficiencyE2ECorrect && ruleAvailabilityE2ECorrect
      : !accepted;

    results.push({
      ...row,
      accepted,
      finalRoute,
      top1:prediction.top1,
      top2:prediction.top2,
      routeMargin:prediction.routeMargin,
      gate:prediction.gate,
      top1Correct,
      finalRouteCorrect,
      oracleSufficiency,
      oracleSufficiencyCorrect,
      chainSufficiency,
      sufficiencyE2ECorrect,
      actualRuleAvailability,
      ruleAvailabilityE2ECorrect,
      jointExact
    });
    onProgress?.(i + 1, rows.length, row);
    if ((i + 1) % 8 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { version:'0.1', results, summary:summarize(results) };
};

export const semanticRouterCandidateEvalV01 = Object.freeze({
  version:'0.1',
  modelCandidate:'semantic-router-v0.8.1',
  loadModel:(progress) => router.loadModel(progress),
  train:async (options) => {
    const result = await router.train(options);
    trained = true;
    return result;
  },
  runCandidateEval,
  flattenRows
});
