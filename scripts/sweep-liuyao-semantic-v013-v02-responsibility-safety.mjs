import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ratio = (n,d) => d ? n/d : 0;

const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeabilityModel = readJson('data/liuyao-semantic-routeability-v0.2.json');
const routeabilityV03 = readJson('data/liuyao-semantic-routeability-v0.3.json');
const development = readJson('data/liuyao-semantic-decision-stack-v0.13-development.json');
const calibration = readJson('data/liuyao-semantic-routeability-v0.3-calibration.json');

if (development.status !== 'sealed_development_eval' || development.rows?.length !== 198) throw new Error('sealed v0.13 development set missing');
if (calibration.status !== 'fresh_calibration' || calibration.rows?.length !== 223) throw new Error('fresh v0.3 calibration set missing');
if (routeabilityV03.status !== 'frozen') throw new Error('frozen Routeability v0.3 missing');
if (frozen.encoder?.revision !== routeabilityModel.encoder?.revision) throw new Error('encoder/model revision mismatch');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window = context;
context.globalThis = context;
vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js',
  'js/liuyao-semantic-route-compatibility-v01.js',
  'js/liuyao-semantic-route-compatibility-v02.js',
  'js/liuyao-semantic-route-selection-v02.js',
  'js/liuyao-semantic-routeability-v03.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceExtractor = context.GuiJia?.liuyaoSemanticRouteEvidenceV02;
const arbitration = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
const compatibility = context.GuiJia?.liuyaoSemanticRouteCompatibilityV02;
const selection = context.GuiJia?.liuyaoSemanticRouteSelectionV02;
const routeabilityGate = context.GuiJia?.liuyaoSemanticRouteabilityV03;
if (!evidenceExtractor?.extract || !arbitration?.arbitrate || !compatibility?.evaluate || !selection?.decide || !routeabilityGate?.decide) throw new Error('v0.13 candidate modules failed to load');

const dot = (weights, vector) => {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i] * vector[i];
  return total;
};
const sigmoid = (x) => x >= 0 ? 1/(1+Math.exp(-x)) : Math.exp(x)/(1+Math.exp(x));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value-max));
  const total = exps.reduce((sum,value) => sum+value,0);
  return exps.map((value) => value/Math.max(total,1e-12));
};
const routerHead = (vector) => {
  const logits = frozen.router.routeHead.weights.map((weights,index) => dot(weights,vector)+frozen.router.routeHead.biases[index]);
  const probabilities = softmax(logits);
  const scores = frozen.router.routeOrder.map((id,index) => ({ id, score:probabilities[index] })).sort((a,b)=>b.score-a.score);
  return { top1:scores[0], top2:scores[1], routeMargin:scores[0].score-scores[1].score };
};
const routeabilityProbability = (vector) => sigmoid(dot(routeabilityModel.model.weights,vector)+routeabilityModel.model.bias);
const scopeScore = (vector) => {
  const probability = sigmoid(dot(frozen.scopeGate.gate.weights,vector)+frozen.scopeGate.gate.bias);
  return { probability, hardVeto:probability < frozen.semanticStackPolicy.hardVetoCutoff };
};

env.allowLocalModels = false;
env.useBrowserCache = false;
const extractor = await pipeline('feature-extraction', frozen.encoder.modelId, { dtype:frozen.encoder.dtype, revision:frozen.encoder.revision });
const tensorToVectors = (tensor,count) => {
  const hidden = tensor?.dims?.[tensor.dims.length-1];
  if (hidden !== frozen.encoder.vectorSize) throw new Error(`embedding size ${hidden}`);
  const vectors=[];
  for (let row=0; row<count; row+=1) {
    const vector=new Float32Array(hidden);
    const offset=row*hidden;
    for (let i=0;i<hidden;i+=1) vector[i]=Number(tensor.data[offset+i]);
    vectors.push(vector);
  }
  return vectors;
};
const embed = async (texts,chunkSize=24) => {
  const vectors=[];
  for (let start=0; start<texts.length; start+=chunkSize) {
    const chunk=texts.slice(start,start+chunkSize);
    const output=await extractor(chunk,{ pooling:frozen.encoder.pooling, normalize:frozen.encoder.normalize });
    vectors.push(...tensorToVectors(output,chunk.length));
    console.log(`embedded ${Math.min(start+chunk.length,texts.length)}/${texts.length}`);
  }
  return vectors;
};

const datasets = [
  {
    id:'sealed_development_198',
    rows:development.rows.map((row) => ({
      id:row.id,
      text:row.text,
      label:row.expectedDisposition,
      expectedRoute:row.expectedRoute || null,
      path:row.expectedCandidatePath || null,
      subtype:row.nonRouteSubtype || null
    }))
  },
  {
    id:'fresh_calibration_223',
    rows:calibration.rows.map((row) => ({
      id:row.id,
      text:row.text,
      label:row.routeabilityLabel === 'route_known' ? 'route_known' : 'non_route',
      expectedRoute:row.routeId || null,
      path:row.candidatePath || null,
      subtype:row.subtype || null
    }))
  }
];
const allRows=datasets.flatMap((dataset)=>dataset.rows.map((row)=>({ ...row, datasetId:dataset.id })));
const vectors=await embed(allRows.map((row)=>row.text));

const evaluated=allRows.map((row,index) => {
  const vector=vectors[index];
  const probability=routeabilityProbability(vector);
  const head=routerHead(vector);
  const scope=scopeScore(vector);
  const evidence=evidenceExtractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const arbCompatibility=arb?.routeId ? compatibility.evaluate(arb.routeId,evidence) : null;
  const routeability=routeabilityGate.decide({ probability, threshold:routeabilityV03.calibration.threshold, arbitration:arb, evidence });
  const currentSelection=routeability.disposition === 'route_known'
    ? selection.decide({ arbitration:arb, head, evidence, routeabilityDisposition:'route_known' })
    : null;
  const candidates=currentSelection?.candidates || selection.buildCandidateSet(arb,head).map((candidate)=>({ ...candidate, compatibility:compatibility.evaluate(candidate.routeId,evidence) }));
  const supportCandidate=candidates.find((candidate)=>candidate.arbitrationStrength === 'support') || null;
  const otherConfirmed=candidates.filter((candidate)=>candidate.routeId !== supportCandidate?.routeId && candidate.compatibility?.status === 'confirmed');
  const supportPriorityEligible=Boolean(routeability.disposition === 'route_known' && supportCandidate && supportCandidate.compatibility?.status !== 'contradicted' && otherConfirmed.length === 0);
  const belowThresholdSupportConfirmed=Boolean(routeability.disposition === 'non_route' && arb?.strength === 'support' && arbCompatibility?.status === 'confirmed');
  const strongConfirmedScopeBypass=Boolean(routeability.disposition === 'route_known' && currentSelection?.status === 'selected' && scope.hardVeto && arb?.strength === 'strong' && arbCompatibility?.status === 'confirmed');
  return { ...row, probability, head, scope, evidence, arbitration:arb, arbitrationCompatibility:arbCompatibility, routeability, currentSelection, supportCandidate, otherConfirmedCount:otherConfirmed.length, supportPriorityEligible, belowThresholdSupportConfirmed, strongConfirmedScopeBypass };
});

const compact=(row)=>({
  dataset:row.datasetId,id:row.id,text:row.text,label:row.label,expectedRoute:row.expectedRoute,path:row.path,subtype:row.subtype,
  probability:row.probability,routeabilityReason:row.routeability.reasonCode,
  arbitration:row.arbitration?{routeId:row.arbitration.routeId,strength:row.arbitration.strength}:null,
  arbitrationCompatibility:row.arbitrationCompatibility?.status || null,
  headTop1:row.head.top1,scopeProbability:row.scope.probability,scopeHardVeto:row.scope.hardVeto,
  currentSelection:row.currentSelection?{status:row.currentSelection.status,routeId:row.currentSelection.routeId,reasonCode:row.currentSelection.reasonCode}:null
});
const countBy=(items,keyFn)=>Object.fromEntries([...items.reduce((map,item)=>{const key=keyFn(item)||'__none__';map.set(key,(map.get(key)||0)+1);return map;},new Map()).entries()].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]))));

const summarizeDataset=(datasetId) => {
  const rows=evaluated.filter((row)=>row.datasetId===datasetId);
  const known=rows.filter((row)=>row.label==='route_known');
  const nonRoute=rows.filter((row)=>row.label==='non_route');

  const strongBypassKnown=known.filter((row)=>row.strongConfirmedScopeBypass && row.currentSelection?.routeId===row.expectedRoute);
  const strongBypassNonRoute=nonRoute.filter((row)=>row.strongConfirmedScopeBypass);

  const supportPriorityKnown=known.filter((row)=>row.supportPriorityEligible);
  const supportPriorityFixes=supportPriorityKnown.filter((row)=>row.supportCandidate.routeId===row.expectedRoute && row.currentSelection?.routeId!==row.expectedRoute);
  const supportPriorityHarms=supportPriorityKnown.filter((row)=>row.currentSelection?.routeId===row.expectedRoute && row.supportCandidate.routeId!==row.expectedRoute);
  const supportPriorityNonRoute=nonRoute.filter((row)=>row.supportPriorityEligible && !row.scope.hardVeto);

  const supportRescueKnown=known.filter((row)=>row.belowThresholdSupportConfirmed);
  const supportRescueKnownExact= supportRescueKnown.filter((row)=>row.arbitration.routeId===row.expectedRoute && !row.scope.hardVeto);
  const supportRescueNonRoute=nonRoute.filter((row)=>row.belowThresholdSupportConfirmed && !row.scope.hardVeto);

  return {
    rows:rows.length,known:known.length,nonRoute:nonRoute.length,
    strongConfirmedScopeBypass:{
      recoverableKnown:strongBypassKnown.length,
      newlyActivatedNonRoute:strongBypassNonRoute.length,
      knownRows:strongBypassKnown.map(compact),
      nonRouteRows:strongBypassNonRoute.map(compact)
    },
    supportPriorityAfterAcceptedGate:{
      eligibleKnown:supportPriorityKnown.length,
      correctableWrongSelections:supportPriorityFixes.length,
      currentlyCorrectSelectionsHarmed:supportPriorityHarms.length,
      newlyActivatedNonRoute:supportPriorityNonRoute.length,
      correctableRows:supportPriorityFixes.map(compact),
      harmRows:supportPriorityHarms.map(compact),
      nonRouteRows:supportPriorityNonRoute.map(compact)
    },
    belowThresholdSupportConfirmedRescue:{
      eligibleKnown:supportRescueKnown.length,
      exactKnownRecoverableAfterScope:supportRescueKnownExact.length,
      newlyActivatedNonRouteAfterScope:supportRescueNonRoute.length,
      nonRouteBySubtype:countBy(supportRescueNonRoute,(row)=>row.subtype),
      knownRows:supportRescueKnown.map(compact),
      nonRouteRows:supportRescueNonRoute.map(compact)
    }
  };
};

const byDataset=Object.fromEntries(datasets.map((dataset)=>[dataset.id,summarizeDataset(dataset.id)]));
const pooledNonRouteSupportRescue=evaluated.filter((row)=>row.label==='non_route'&&row.belowThresholdSupportConfirmed&&!row.scope.hardVeto);
const pooledNonRouteStrongBypass=evaluated.filter((row)=>row.label==='non_route'&&row.strongConfirmedScopeBypass);
const pooledNonRouteSupportPriority=evaluated.filter((row)=>row.label==='non_route'&&row.supportPriorityEligible&&!row.scope.hardVeto);
const result={
  version:'0.13-v0.2-responsibility-safety-sweep-v0.1',
  status:'development_and_calibration_diagnostic_only',
  policy:{ usesIndependentEval:false, trainsModel:false, calibratesThreshold:false, mutatesCandidateV01:false, claimsGeneralization:false },
  threshold:routeabilityV03.calibration.threshold,
  sources:[
    { id:'sealed_development_198', path:'data/liuyao-semantic-decision-stack-v0.13-development.json' },
    { id:'fresh_calibration_223', path:'data/liuyao-semantic-routeability-v0.3-calibration.json' }
  ],
  byDataset,
  pooledSafety:{
    nonRouteRows:evaluated.filter((row)=>row.label==='non_route').length,
    strongConfirmedScopeBypassNewActivations:pooledNonRouteStrongBypass.length,
    supportPriorityNewActivations:pooledNonRouteSupportPriority.length,
    belowThresholdSupportConfirmedNewActivations:pooledNonRouteSupportRescue.length,
    belowThresholdSupportConfirmedBySubtype:countBy(pooledNonRouteSupportRescue,(row)=>row.subtype)
  }
};
writeJson('data/liuyao-semantic-v013-candidate-v02-responsibility-safety-sweep.json',result);
console.log(JSON.stringify({ byDataset:Object.fromEntries(Object.entries(byDataset).map(([id,value])=>[id,{
  strongBypass:{ recoverableKnown:value.strongConfirmedScopeBypass.recoverableKnown, newlyActivatedNonRoute:value.strongConfirmedScopeBypass.newlyActivatedNonRoute },
  supportPriority:{ correctableWrongSelections:value.supportPriorityAfterAcceptedGate.correctableWrongSelections, currentlyCorrectSelectionsHarmed:value.supportPriorityAfterAcceptedGate.currentlyCorrectSelectionsHarmed, newlyActivatedNonRoute:value.supportPriorityAfterAcceptedGate.newlyActivatedNonRoute },
  supportRescue:{ eligibleKnown:value.belowThresholdSupportConfirmedRescue.eligibleKnown, exactKnownRecoverableAfterScope:value.belowThresholdSupportConfirmedRescue.exactKnownRecoverableAfterScope, newlyActivatedNonRouteAfterScope:value.belowThresholdSupportConfirmedRescue.newlyActivatedNonRouteAfterScope }
}])), pooledSafety:result.pooledSafety },null,2));
