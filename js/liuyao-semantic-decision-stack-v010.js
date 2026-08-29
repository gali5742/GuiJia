import { semanticRouterPocV081 as router } from './liuyao-semantic-router-poc-v081.js?v=poc0.8.1';
import { semanticScopeGateV01 as scopeGate } from './liuyao-semantic-scope-gate-v01.js?v=scope0.1';
import { semanticRouteIdentifiabilityV010 as identifiabilityGate } from './liuyao-semantic-route-identifiability-v010.js?v=ident0.10';

const DATA_URL = new URL('../data/liuyao-semantic-decision-stack-v0.10-development.json', import.meta.url);
const PATCH_URL = new URL('../data/liuyao-semantic-decision-stack-v0.10-preuse-patch.json', import.meta.url);
const INVENTORY_URL = new URL('../data/liuyao-semantic-route-inventory-v0.2.json', import.meta.url);
const VERSION = '0.10-development';

let data = null;
let dataPatch = null;
let inventory = null;
let trained = false;
let scopeHardRejectThreshold = null;
let scopePolicyCalibration = null;
let identifiabilityValidation = null;

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};
const safeRatio = (n, d) => d ? n / d : NaN;
const mean = (values) => values.length ? values.reduce((a,b)=>a+b,0)/values.length : NaN;
const ruleStatusOf = (routeId) => {
  const row = (inventory?.routes || []).find((item) => item.routeId === routeId);
  if (!row) return 'not_applicable';
  return row.ruleStatus || 'confirmed';
};
const ensureData = async () => {
  if (!data || !inventory) {
    [data, dataPatch, inventory] = await Promise.all([fetchJson(DATA_URL), fetchJson(PATCH_URL), fetchJson(INVENTORY_URL)]);
    if (data.version !== VERSION || data.status !== 'development_preuse') throw new Error('Semantic Decision Stack v0.10 data mismatch');
    if (data.policy?.modifyV081 !== false || data.policy?.modifyScopeGateV01 !== false) throw new Error('v0.10 frozen-component policy mismatch');
    if (data.policy?.sufficiencyUsesOracleModernSemanticFixtures !== true) throw new Error('v0.10 Sufficiency fixture policy mismatch');
    if (dataPatch.version !== '0.10-preuse-wording-patch' || dataPatch.status !== 'development_preuse_patch' || dataPatch.base !== 'liuyao-semantic-decision-stack-v0.10-development.json') throw new Error('Semantic Decision Stack v0.10 wording patch mismatch');
    if (inventory.version !== '0.2' || (inventory.routes || []).length !== 22) throw new Error('22-route inventory mismatch');
  }
  return { data, inventory };
};
const effectiveText = (text) => dataPatch?.replacements?.[text] || text;

const flattenStackRows = async () => {
  await ensureData();
  const routeMeta = new Map((inventory.routes || []).map((row)=>[row.routeId,row]));
  const rows = [];
  let index = 1;
  for (const [routeId, spec] of Object.entries(data.stack_validation?.routes || {})) {
    for (const sample of spec.sufficient || []) rows.push({
      id:`V10-${String(index++).padStart(3,'0')}`,
      text:effectiveText(sample.text),
      kind:'known',
      expectedDisposition:'route_known',
      expectedRoute:routeId,
      expectedSufficiencyStatus:'sufficient',
      expectedRuleAvailabilityStatus:ruleStatusOf(routeId),
      goalType:sample.goalType,
      slots:sample.slots || [],
      domain:routeMeta.get(routeId)?.domain || 'unknown'
    });
    if (spec.insufficient) rows.push({
      id:`V10-${String(index++).padStart(3,'0')}`,
      text:effectiveText(spec.insufficient.text),
      kind:'known',
      expectedDisposition:'route_known',
      expectedRoute:routeId,
      expectedSufficiencyStatus:spec.insufficient.expectedSufficiencyStatus || 'semantic_insufficient',
      expectedRuleAvailabilityStatus:ruleStatusOf(routeId),
      goalType:spec.insufficient.goalType,
      slots:spec.insufficient.slots || [],
      domain:routeMeta.get(routeId)?.domain || 'unknown'
    });
  }
  for (const text of data.stack_validation?.outside_current_22 || []) rows.push({
    id:`V10-${String(index++).padStart(3,'0')}`,
    text:effectiveText(text),
    kind:'outside',
    expectedDisposition:'outside_current_22',
    expectedRoute:'__outside_current_22__',
    expectedSufficiencyStatus:'not_applicable',
    expectedRuleAvailabilityStatus:'not_applicable',
    goalType:'unknown', slots:[], domain:'__outside__'
  });
  for (const text of data.stack_validation?.route_unresolved || []) rows.push({
    id:`V10-${String(index++).padStart(3,'0')}`,
    text:effectiveText(text),
    kind:'unresolved',
    expectedDisposition:'route_unresolved',
    expectedRoute:'__unresolved__',
    expectedSufficiencyStatus:'not_applicable',
    expectedRuleAvailabilityStatus:'not_applicable',
    goalType:'unknown', slots:[], domain:'__unresolved__'
  });
  if (rows.length !== 110) throw new Error(`v0.10 stack validation rows ${rows.length} != 110`);
  return rows;
};

const calibrationKnownTexts = async () => {
  const rows = await identifiabilityGate.flattenSplit('calibration');
  return rows.filter((row)=>row.identifiable).map((row)=>row.text);
};
const chooseHardOutsideThreshold = (insideRows, outsideRows) => {
  const all = [...insideRows, ...outsideRows];
  const values = [...new Set(all.map((row)=>row.probability))].sort((a,b)=>a-b);
  const candidates = [0.01,0.03,0.05,0.08,0.1,0.12,0.15,0.18,0.2,0.25,0.3,0.35,0.4,0.45,0.5];
  for (const value of values) candidates.push(value);
  for (let i=0;i+1<values.length;i+=1) candidates.push((values[i]+values[i+1])/2);
  let best = null;
  for (const threshold of [...new Set(candidates.filter((v)=>v>0&&v<1))].sort((a,b)=>a-b)) {
    const insideRecall = safeRatio(insideRows.filter((row)=>row.probability>=threshold).length, insideRows.length);
    const outsideReject = safeRatio(outsideRows.filter((row)=>row.probability<threshold).length, outsideRows.length);
    if (insideRecall < 0.95) continue;
    const record = { threshold, insideRecall, outsideReject };
    if (!best || record.outsideReject > best.outsideReject + 1e-12 ||
      (Math.abs(record.outsideReject-best.outsideReject)<=1e-12 && record.insideRecall > best.insideRecall + 1e-12) ||
      (Math.abs(record.outsideReject-best.outsideReject)<=1e-12 && Math.abs(record.insideRecall-best.insideRecall)<=1e-12 && record.threshold < best.threshold)) best = record;
  }
  if (!best) return { threshold:0, insideRecall:1, outsideReject:0 };
  return best;
};

const calibrateScopePolicy = async ({ onProgress } = {}) => {
  await ensureData();
  const insideTexts = await calibrationKnownTexts();
  const outsideTexts = (data.scope_policy_calibration?.outside_current_22 || []).map(effectiveText);
  const insideRows = [];
  const outsideRows = [];
  let done = 0;
  const total = insideTexts.length + outsideTexts.length;
  for (const text of insideTexts) {
    const result = await scopeGate.classifyScope(text);
    insideRows.push({ text, probability:result.probability });
    onProgress?.(++done,total,'scope policy calibration');
  }
  for (const text of outsideTexts) {
    const result = await scopeGate.classifyScope(text);
    outsideRows.push({ text, probability:result.probability });
    onProgress?.(++done,total,'scope policy calibration');
  }
  scopePolicyCalibration = chooseHardOutsideThreshold(insideRows, outsideRows);
  scopeHardRejectThreshold = scopePolicyCalibration.threshold;
  return { ...scopePolicyCalibration, insideCount:insideRows.length, outsideCount:outsideRows.length, insideRows, outsideRows };
};

const evaluateSufficiency = (routeId, row) => {
  const api = globalThis.GuiJia?.liuyaoSemanticSufficiency;
  if (!api?.evaluateIntentSufficiency) throw new Error('Semantic Sufficiency v0.2 未加载');
  const intent = {
    version:'decision-stack-v0.10-oracle-fixture',
    status:'resolved',
    goals:[{ type:row.goalType }],
    event:{ type:'decision_stack_fixture' },
    semantics:{},
    participants:[]
  };
  const slots = (row.slots || []).map((id)=>({ id, source:'v0.10_oracle_fixture', evidence:row.id }));
  return api.evaluateIntentSufficiency(routeId, intent, slots, []);
};
const arbitrate = (text) => {
  const api = globalThis.GuiJia?.liuyaoSemanticRouteArbitrationV091;
  if (!api?.arbitrate) throw new Error('Semantic Arbitration v0.9.1 未加载');
  return api.arbitrate(text);
};

const train = async ({ onStage, onProgress } = {}) => {
  await ensureData();
  onStage?.('router','训练冻结的 v0.8.1 Route Head / legacy local gate（仅复用既有 recipe）…');
  const routerTraining = await router.train({ onStage:(stage,message)=>onStage?.(`router:${stage}`,message), onEmbeddingProgress:(done,total)=>onProgress?.(done,total,'router embedding') });
  onStage?.('scope','训练未改动的 Scope Gate v0.1…');
  const scopeTraining = await scopeGate.train({ onProgress:(done,total,label)=>onProgress?.(done,total,label) });
  onStage?.('ident','训练 Route Identifiability v0.10…');
  const identTraining = await identifiabilityGate.train({ onProgress:(done,total,label)=>onProgress?.(done,total,label) });
  identifiabilityValidation = await identifiabilityGate.runValidation({ onProgress:(done,total,label)=>onProgress?.(done,total,label) });
  onStage?.('scope-policy','用 v0.10 独立 calibration 选择 Scope hard-reject cutoff…');
  const scopePolicy = await calibrateScopePolicy({ onProgress });
  trained = true;
  onStage?.('done','v0.10 组件训练/校准完成');
  return { routerTraining, scopeTraining, identTraining, identifiabilityValidation, scopePolicy };
};

const runStackValidation = async ({ onProgress } = {}) => {
  if (!trained || scopeHardRejectThreshold === null) throw new Error('请先运行 v0.10 训练/校准');
  const rows = await flattenStackRows();
  const results = [];
  for (let i=0;i<rows.length;i+=1) {
    const row = rows[i];
    const [scopeResult, identResult, routerResult] = await Promise.all([
      scopeGate.classifyScope(row.text),
      identifiabilityGate.classify(row.text),
      router.classify(row.text)
    ]);
    const arbitration = arbitrate(row.text);
    const scopeHardRejected = scopeResult.probability < scopeHardRejectThreshold;
    const routeIdentified = Boolean(arbitration) || identResult.identifiable;
    let finalDisposition = 'route_unresolved';
    let finalRoute = '__unresolved__';
    if (scopeHardRejected) {
      finalDisposition = 'outside_current_22';
      finalRoute = '__outside_current_22__';
    } else if (routeIdentified) {
      finalDisposition = 'route_known';
      finalRoute = arbitration?.routeId || routerResult.top1?.id || '__unresolved__';
    }

    const dispositionCorrect = finalDisposition === row.expectedDisposition;
    const routeCorrect = row.kind === 'known' ? (finalDisposition === 'route_known' && finalRoute === row.expectedRoute) : dispositionCorrect;
    const headTop1Correct = row.kind === 'known' ? routerResult.top1?.id === row.expectedRoute : false;
    const arbitrationHit = Boolean(arbitration);
    const arbitrationCorrect = row.kind === 'known' ? arbitration?.routeId === row.expectedRoute : !arbitration;

    let oracleSufficiency = 'not_applicable';
    let chainSufficiency = 'not_applicable';
    let oracleSufficiencyCorrect = row.kind !== 'known';
    let sufficiencyE2ECorrect = row.kind !== 'known' ? dispositionCorrect : false;
    let actualRuleAvailability = 'not_applicable';
    let ruleAvailabilityE2ECorrect = row.kind !== 'known' ? dispositionCorrect : false;
    if (row.kind === 'known') {
      const oracle = evaluateSufficiency(row.expectedRoute,row);
      oracleSufficiency = oracle.status;
      oracleSufficiencyCorrect = oracle.status === row.expectedSufficiencyStatus;
      if (finalDisposition === 'route_known') {
        const chain = evaluateSufficiency(finalRoute,row);
        chainSufficiency = chain.status;
        actualRuleAvailability = ruleStatusOf(finalRoute);
      }
      sufficiencyE2ECorrect = routeCorrect && chainSufficiency === row.expectedSufficiencyStatus;
      ruleAvailabilityE2ECorrect = routeCorrect && actualRuleAvailability === row.expectedRuleAvailabilityStatus;
    }
    const jointExact = row.kind === 'known'
      ? dispositionCorrect && routeCorrect && sufficiencyE2ECorrect && ruleAvailabilityE2ECorrect
      : dispositionCorrect;

    results.push({
      ...row,
      scope:{ probability:scopeResult.probability, originalThreshold:scopeResult.threshold, hardRejectThreshold:scopeHardRejectThreshold, hardRejected:scopeHardRejected },
      identifiability:identResult,
      router:{ top1:routerResult.top1, top2:routerResult.top2, routeMargin:routerResult.routeMargin, legacyLocalGate:routerResult.gate },
      arbitration,
      routeIdentified,
      finalDisposition,
      finalRoute,
      dispositionCorrect,
      routeCorrect,
      headTop1Correct,
      arbitrationHit,
      arbitrationCorrect,
      oracleSufficiency,
      oracleSufficiencyCorrect,
      chainSufficiency,
      sufficiencyE2ECorrect,
      actualRuleAvailability,
      ruleAvailabilityE2ECorrect,
      jointExact
    });
    onProgress?.(i+1,rows.length,'stack validation');
    if ((i+1)%6===0) await new Promise((resolve)=>setTimeout(resolve,0));
  }
  return { version:VERSION, results, summary:summarize(results) };
};

const summarize = (results) => {
  const known = results.filter((row)=>row.kind==='known');
  const outside = results.filter((row)=>row.kind==='outside');
  const unresolved = results.filter((row)=>row.kind==='unresolved');
  const activatedKnown = known.filter((row)=>row.finalDisposition==='route_known');
  const routeIds = [...new Set(known.map((row)=>row.expectedRoute))];
  const routeSummaries = routeIds.map((routeId)=>{
    const rows = known.filter((row)=>row.expectedRoute===routeId);
    return {
      routeId,
      n:rows.length,
      scopePass:safeRatio(rows.filter((row)=>!row.scope.hardRejected).length,rows.length),
      identifiable:safeRatio(rows.filter((row)=>row.routeIdentified).length,rows.length),
      headTop1:safeRatio(rows.filter((row)=>row.headTop1Correct).length,rows.length),
      finalRouteExact:safeRatio(rows.filter((row)=>row.routeCorrect).length,rows.length),
      sufficiencyE2E:safeRatio(rows.filter((row)=>row.sufficiencyE2ECorrect).length,rows.length),
      ruleE2E:safeRatio(rows.filter((row)=>row.ruleAvailabilityE2ECorrect).length,rows.length),
      joint:safeRatio(rows.filter((row)=>row.jointExact).length,rows.length)
    };
  });
  const domains = [...new Set(known.map((row)=>row.domain))];
  const domainSummaries = domains.map((domain)=>{
    const rows = known.filter((row)=>row.domain===domain);
    return { domain, n:rows.length, finalRouteExact:safeRatio(rows.filter((row)=>row.routeCorrect).length,rows.length), joint:safeRatio(rows.filter((row)=>row.jointExact).length,rows.length) };
  });
  const arbitrationHits = results.filter((row)=>row.arbitrationHit);
  const arbitrationCorrectHits = arbitrationHits.filter((row)=>row.kind==='known' ? row.arbitration?.routeId===row.expectedRoute : false);
  const rejectRows = [...outside,...unresolved];
  return {
    total:results.length,
    knownCount:known.length,
    outsideCount:outside.length,
    unresolvedCount:unresolved.length,
    scopeHardRejectThreshold,
    scopePolicyCalibration,
    identifiabilityValidation,
    knownScopePass:safeRatio(known.filter((row)=>!row.scope.hardRejected).length,known.length),
    knownIdentifiable:safeRatio(known.filter((row)=>row.routeIdentified).length,known.length),
    routeHeadTop1:safeRatio(known.filter((row)=>row.headTop1Correct).length,known.length),
    knownRouteExact:safeRatio(known.filter((row)=>row.routeCorrect).length,known.length),
    knownActivationCoverage:safeRatio(activatedKnown.length,known.length),
    acceptedKnownAccuracy:safeRatio(activatedKnown.filter((row)=>row.routeCorrect).length,activatedKnown.length),
    outsideDispositionExact:safeRatio(outside.filter((row)=>row.finalDisposition==='outside_current_22').length,outside.length),
    unresolvedDispositionExact:safeRatio(unresolved.filter((row)=>row.finalDisposition==='route_unresolved').length,unresolved.length),
    safeNonRouteRate:safeRatio(rejectRows.filter((row)=>row.finalDisposition!=='route_known').length,rejectRows.length),
    falseRouteActivation:safeRatio(rejectRows.filter((row)=>row.finalDisposition==='route_known').length,rejectRows.length),
    arbitrationHits:arbitrationHits.length,
    arbitrationCorrectKnownHits:arbitrationCorrectHits.length,
    oracleSufficiency:safeRatio(known.filter((row)=>row.oracleSufficiencyCorrect).length,known.length),
    sufficiencyE2E:safeRatio(known.filter((row)=>row.sufficiencyE2ECorrect).length,known.length),
    ruleAvailabilityE2E:safeRatio(known.filter((row)=>row.ruleAvailabilityE2ECorrect).length,known.length),
    overallDispositionExact:safeRatio(results.filter((row)=>row.dispositionCorrect).length,results.length),
    jointExact:safeRatio(results.filter((row)=>row.jointExact).length,results.length),
    routeMacro:mean(routeSummaries.map((row)=>row.finalRouteExact)),
    domainMacro:mean(domainSummaries.map((row)=>row.finalRouteExact)),
    routeSummaries,
    domainSummaries
  };
};

export const semanticDecisionStackV010 = Object.freeze({
  version:VERSION,
  loadModels:async(onStage)=>{
    onStage?.('scope-model','加载 Scope Gate v0.1 BGE…');
    const scope = await scopeGate.loadModel((info)=>onStage?.('scope-model-progress',info));
    onStage?.('router-model','加载 v0.8.1 Router BGE…');
    const routerModel = await router.loadModel((info)=>onStage?.('router-model-progress',info));
    onStage?.('ident-model','加载 Route Identifiability BGE…');
    const ident = await identifiabilityGate.loadModel((info)=>onStage?.('ident-model-progress',info));
    return { scope, router:routerModel, identifiability:ident };
  },
  train,
  runStackValidation,
  flattenStackRows
});
