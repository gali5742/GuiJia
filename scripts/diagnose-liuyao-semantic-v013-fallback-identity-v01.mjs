import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ratio = (n,d) => d ? n/d : 0;
const dot = (weights, vector) => weights.reduce((sum, value, i) => sum + value * vector[i], 0);
const sigmoid = (x) => x >= 0 ? 1/(1+Math.exp(-x)) : Math.exp(x)/(1+Math.exp(x));
const softmax = (logits) => {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value-max));
  const total = exps.reduce((sum,value)=>sum+value,0);
  return exps.map((value)=>value/Math.max(total,1e-12));
};
const quantiles = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a,b)=>a-b);
  if (!sorted.length) return null;
  const q = (p) => {
    const index = (sorted.length-1)*p;
    const low = Math.floor(index); const high = Math.ceil(index);
    if (low === high) return sorted[low];
    return sorted[low] + (sorted[high]-sorted[low])*(index-low);
  };
  return { n:sorted.length, min:sorted[0], p10:q(.1), p25:q(.25), median:q(.5), p75:q(.75), p90:q(.9), max:sorted[sorted.length-1] };
};

const artifact = readJson('data/liuyao-semantic-fallback-identity-v0.1.json');
const calibration = readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const frozen = readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.2.json');
const routeIds = artifact.routeOrder;
const threshold = artifact.calibration.threshold;
assert(artifact.status === 'frozen' && routeIds.length === 22, 'Fallback Identity artifact missing');
assert(calibration.sealed === true && calibration.rows?.length === 134, 'sealed calibration corpus missing');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number, Date, Intl, Set, Map };
context.window=context; context.globalThis=context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative),'utf8'), context, {filename:relative});
const evidenceApi=context.GuiJia.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi=context.GuiJia.liuyaoSemanticRouteArbitrationV012;

env.allowLocalModels=false; env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction', frozen.encoder.modelId, {dtype:frozen.encoder.dtype,revision:frozen.encoder.revision});
const embed=async(texts,chunkSize=24)=>{
  const vectors=[];
  for(let start=0;start<texts.length;start+=chunkSize){
    const chunk=texts.slice(start,start+chunkSize);
    const output=await extractor(chunk,{pooling:frozen.encoder.pooling,normalize:frozen.encoder.normalize});
    const hidden=output.dims[output.dims.length-1];
    for(let row=0;row<chunk.length;row+=1){
      const vector=new Float32Array(hidden); const offset=row*hidden;
      for(let i=0;i<hidden;i+=1) vector[i]=Number(output.data[offset+i]);
      vectors.push(vector);
    }
  }
  return vectors;
};
const vectors=await embed(calibration.rows.map((row)=>row.text));
const rows=calibration.rows.map((row,index)=>{
  const vector=vectors[index];
  const evidence=evidenceApi.extract(row.text);
  const arbitration=arbitrationApi.arbitrate(row.text,evidence);
  const routeabilityProbability=sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);
  const logits=frozen.router.routeHead.weights.map((weights,i)=>dot(weights,vector)+frozen.router.routeHead.biases[i]);
  const probs=softmax(logits);
  const head=routeIds.map((id,i)=>({id,score:probs[i]})).sort((a,b)=>b.score-a.score).slice(0,2);
  const identity=head.map((candidate)=>{
    const model=artifact.model.heads[candidate.id];
    return {routeId:candidate.id, probability:sigmoid(dot(model.weights,vector)+model.bias)};
  });
  const eligible=(evidence.unsupportedTargets||[]).length===0 && arbitration==null && routeabilityProbability>=0.7675678218564946;
  return { expectedRoute:row.expectedRoute, subtype:row.subtype, eligible, head, identity };
});

const known=rows.filter((row)=>row.expectedRoute!=null);
const eligibleKnown=known.filter((row)=>row.eligible);
const nonRoute=rows.filter((row)=>row.expectedRoute==null);
const eligibleNonRoute=nonRoute.filter((row)=>row.eligible);
const top1Correct=eligibleKnown.filter((row)=>row.head[0].id===row.expectedRoute);
const top2Covered=eligibleKnown.filter((row)=>row.head.some((candidate)=>candidate.id===row.expectedRoute));
const correctScores=[]; const competingScores=[];
for(const row of eligibleKnown){
  const correct=row.identity.find((candidate)=>candidate.routeId===row.expectedRoute);
  if(correct) correctScores.push(correct.probability);
  for(const candidate of row.identity) if(candidate.routeId!==row.expectedRoute) competingScores.push(candidate.probability);
}
const nonRouteMaxScores=eligibleNonRoute.map((row)=>Math.max(...row.identity.map((candidate)=>candidate.probability)));
const knownWrongCandidateMax=eligibleKnown.filter((row)=>!row.head.some((candidate)=>candidate.id===row.expectedRoute)).map((row)=>Math.max(...row.identity.map((candidate)=>candidate.probability)));

const decisions=rows.map((row)=>{
  if(!row.eligible) return {row,selected:null,outcome:'ineligible'};
  const admitted=row.identity.filter((candidate)=>candidate.probability>=threshold);
  return {row,selected:admitted.length===1?admitted[0].routeId:null,outcome:admitted.length===1?'selected':admitted.length===0?'reject_all':'multiple'};
});
const eligibleKnownSelectedCorrect=decisions.filter(({row,selected})=>row.expectedRoute!=null&&row.eligible&&selected===row.expectedRoute).length;
const eligibleKnownRejectAll=decisions.filter(({row,outcome})=>row.expectedRoute!=null&&row.eligible&&outcome==='reject_all').length;
const eligibleKnownMultiple=decisions.filter(({row,outcome})=>row.expectedRoute!=null&&row.eligible&&outcome==='multiple').length;
const eligibleKnownWrong=decisions.filter(({row,selected})=>row.expectedRoute!=null&&row.eligible&&selected!=null&&selected!==row.expectedRoute).length;

const byRoute={};
for(const routeId of routeIds){
  const routeRows=known.filter((row)=>row.expectedRoute===routeId);
  const routeEligible=routeRows.filter((row)=>row.eligible);
  const routeCovered=routeEligible.filter((row)=>row.head.some((candidate)=>candidate.id===routeId));
  const routeSelected=decisions.filter(({row,selected})=>row.expectedRoute===routeId&&selected===routeId);
  byRoute[routeId]={total:routeRows.length,eligible:routeEligible.length,top2Covered:routeCovered.length,selectedExact:routeSelected.length};
}

const report={
  version:'0.13-fallback-identity-v0.1-calibration-diagnostic-v0.1',
  status:'diagnostic_only',
  sourcePolicy:{calibrationUsedForTraining:false,mayRetuneFrozenV01:false,mayInformNextVersionArchitecture:true,rowTextStored:false},
  threshold,
  counts:{known:known.length,eligibleKnown:eligibleKnown.length,nonRoute:nonRoute.length,eligibleNonRoute:eligibleNonRoute.length},
  ceilings:{
    routeabilityKnownCeiling:ratio(eligibleKnown.length,known.length),
    routerTop1WithinEligible:ratio(top1Correct.length,eligibleKnown.length),
    routerTop2WithinEligible:ratio(top2Covered.length,eligibleKnown.length),
    routerTop2OverallCeiling:ratio(top2Covered.length,known.length)
  },
  identityAtFrozenThreshold:{
    eligibleKnownSelectedCorrect,
    eligibleKnownRetention:ratio(eligibleKnownSelectedCorrect,eligibleKnown.length),
    overallKnownRetention:ratio(eligibleKnownSelectedCorrect,known.length),
    eligibleKnownRejectAll,
    eligibleKnownMultiple,
    eligibleKnownWrong
  },
  scoreDistributions:{
    correctCandidateWhenInTop2:quantiles(correctScores),
    competingKnownCandidate:quantiles(competingScores),
    eligibleNonRouteMaxCandidate:quantiles(nonRouteMaxScores),
    top2MissKnownMaxCandidate:quantiles(knownWrongCandidateMax)
  },
  byRoute
};
fs.writeFileSync(path.join(root,'data/liuyao-semantic-fallback-identity-v0.1-calibration-diagnostic.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log('Fallback Identity v0.1 calibration diagnosis complete.');
console.log(JSON.stringify({counts:report.counts,ceilings:report.ceilings,identity:report.identityAtFrozenThreshold,scoreDistributions:report.scoreDistributions},null,2));
