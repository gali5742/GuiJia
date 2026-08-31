import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ratio = (n,d,empty=0) => d ? n/d : empty;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const identity = readJson('data/liuyao-semantic-fallback-identity-v0.2.json');
const calibration = readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const corrected = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.4.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row) => row.routeId);
assert(identity.status === 'frozen_representation_corrected', 'corrected Fallback Identity missing');
assert(corrected.encoder?.textsPerEncoderCall === 1 && routeability.encoder?.textsPerEncoderCall === 1, 'corrected representation missing');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number, Date, Intl, Set, Map };
context.window = context; context.globalThis = context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root, relative), 'utf8'), context, { filename:relative });
const evidenceApi = context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi = context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate, 'semantic fallback path unavailable');

const dot = (weights, vector) => { let total = 0; for (let i=0;i<weights.length;i+=1) total += weights[i]*vector[i]; return total; };
const sigmoid = (x) => x >= 0 ? 1/(1+Math.exp(-x)) : Math.exp(x)/(1+Math.exp(x));
const softmax = (values) => { const max=Math.max(...values); const exps=values.map((v)=>Math.exp(v-max)); const sum=exps.reduce((a,b)=>a+b,0); return exps.map((v)=>v/Math.max(sum,1e-12)); };
const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted=[...values].sort((a,b)=>a-b); const index=(sorted.length-1)*p; const lo=Math.floor(index); const hi=Math.ceil(index);
  return lo===hi ? sorted[lo] : sorted[lo] + (sorted[hi]-sorted[lo])*(index-lo);
};
const summarize = (values) => ({ n:values.length, min:values.length?Math.min(...values):null, p10:percentile(values,0.1), p25:percentile(values,0.25), median:percentile(values,0.5), p75:percentile(values,0.75), p90:percentile(values,0.9), max:values.length?Math.max(...values):null });

const routerScores = (vector) => {
  const logits = corrected.router.routeHead.weights.map((weights,index)=>dot(weights,vector)+corrected.router.routeHead.biases[index]);
  const probs = softmax(logits);
  return routeIds.map((id,index)=>({ id, score:probs[index] })).sort((a,b)=>b.score-a.score);
};
const routeabilityScore = (vector) => sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);
const identityScore = (routeId, vector) => { const head=identity.model.heads[routeId]; return sigmoid(dot(head.weights,vector)+head.bias); };

const encoder = corrected.encoder;
env.allowLocalModels=false; env.useBrowserCache=false;
const extractor = await pipeline('feature-extraction', encoder.modelId, { dtype:encoder.dtype, revision:encoder.revision });
const embedOne = async (text) => {
  const output = await extractor(String(text||''), { pooling:encoder.pooling, normalize:encoder.normalize });
  const hidden=output?.dims?.[output.dims.length-1]; if (hidden!==512) throw new Error(`embedding ${hidden}`);
  const vector=new Float32Array(512); for(let i=0;i<512;i+=1) vector[i]=Number(output.data[i]); return vector;
};

const rows=[];
for (let i=0;i<calibration.rows.length;i+=1) {
  const source=calibration.rows[i];
  const vector=await embedOne(source.text);
  const evidence=evidenceApi.extract(source.text);
  const arbitration=arbitrationApi.arbitrate(source.text,evidence);
  const rScore=routeabilityScore(vector);
  const eligible=(evidence.unsupportedTargets||[]).length===0 && arbitration==null && rScore>=routeability.calibration.threshold;
  const router=routerScores(vector);
  const candidates=router.slice(0,5).map((candidate)=>({ ...candidate, identity:identityScore(candidate.id,vector) }));
  rows.push({ ...source, eligible, routeability:rScore, router:candidates });
  if ((i+1)%40===0 || i+1===calibration.rows.length) console.log(`diagnostic embedded ${i+1}/${calibration.rows.length}`);
}

const known=rows.filter((row)=>row.expectedRoute!=null);
const nonRoute=rows.filter((row)=>row.expectedRoute==null);
const eligibleKnown=known.filter((row)=>row.eligible);
const eligibleNonRoute=nonRoute.filter((row)=>row.eligible);
const coverage=(k, subset=eligibleKnown)=>ratio(subset.filter((row)=>row.router.slice(0,k).some((c)=>c.id===row.expectedRoute)).length, subset.length);

const currentThreshold=identity.calibration.threshold;
const currentDecide=(row)=>{
  if(!row.eligible) return null;
  const admitted=row.router.slice(0,2).filter((c)=>c.identity>=currentThreshold);
  return admitted.length===1 ? admitted[0].id : null;
};
const currentKnownExact=known.filter((row)=>currentDecide(row)===row.expectedRoute).length;
const currentSelected=rows.filter((row)=>currentDecide(row)!=null);
const currentCorrectSelected=currentSelected.filter((row)=>row.expectedRoute!=null && currentDecide(row)===row.expectedRoute).length;
const currentRejectAll=rows.filter((row)=>row.eligible && row.router.slice(0,2).every((c)=>c.identity<currentThreshold)).length;
const currentMultiple=rows.filter((row)=>row.eligible && row.router.slice(0,2).filter((c)=>c.identity>=currentThreshold).length>1).length;

const evaluatePolicy=(k, threshold, margin=0, requireMargin=false)=>{
  const decide=(row)=>{
    if(!row.eligible) return null;
    const ranked=[...row.router.slice(0,k)].sort((a,b)=>b.identity-a.identity);
    if(!ranked.length || ranked[0].identity<threshold) return null;
    if(requireMargin && ranked.length>1 && ranked[0].identity-ranked[1].identity<margin) return null;
    return ranked[0].id;
  };
  const selected=rows.filter((row)=>decide(row)!=null);
  const correctSelected=selected.filter((row)=>row.expectedRoute!=null && decide(row)===row.expectedRoute).length;
  const knownExact=known.filter((row)=>decide(row)===row.expectedRoute).length;
  const falseActivated=nonRoute.filter((row)=>decide(row)!=null).length;
  const bySubtype={};
  for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']){
    const subset=nonRoute.filter((row)=>row.subtype===subtype); const activated=subset.filter((row)=>decide(row)!=null).length;
    bySubtype[subtype]={ n:subset.length, falseActivation:ratio(activated,subset.length), activated };
  }
  return { k, threshold, margin, requireMargin, knownExact, knownRetention:ratio(knownExact,known.length), selectedTotal:selected.length, acceptedRouteAccuracy:ratio(correctSelected,selected.length,1), overallFalseActivation:ratio(falseActivated,nonRoute.length), maxSubtypeFalseActivation:Math.max(...Object.values(bySubtype).map((v)=>v.falseActivation)), bySubtype };
};

const candidateThresholds=new Set([0.5,currentThreshold]);
for(const row of rows.filter((row)=>row.eligible)) for(const c of row.router.slice(0,5)) candidateThresholds.add(c.identity);
const sortedT=[...candidateThresholds].filter((v)=>v>0&&v<1).sort((a,b)=>a-b);
for(let i=0;i+1<sortedT.length;i+=1) candidateThresholds.add((sortedT[i]+sortedT[i+1])/2);
const candidateMargins=new Set([0]);
for(const row of rows.filter((row)=>row.eligible)){
  const ranked=[...row.router.slice(0,5)].sort((a,b)=>b.identity-a.identity);
  if(ranked.length>1) candidateMargins.add(Math.max(0,ranked[0].identity-ranked[1].identity));
}
const sortedM=[...candidateMargins].sort((a,b)=>a-b);
for(let i=0;i+1<sortedM.length;i+=1) candidateMargins.add((sortedM[i]+sortedM[i+1])/2);

const safe=(r)=>r.acceptedRouteAccuracy>=0.98-1e-12 && r.overallFalseActivation<=0.05+1e-12 && r.maxSubtypeFalseActivation<=0.05+1e-12;
const better=(a,b)=>!b || a.knownRetention>b.knownRetention+1e-12 || (Math.abs(a.knownRetention-b.knownRetention)<=1e-12 && a.acceptedRouteAccuracy>b.acceptedRouteAccuracy+1e-12) || (Math.abs(a.knownRetention-b.knownRetention)<=1e-12 && Math.abs(a.acceptedRouteAccuracy-b.acceptedRouteAccuracy)<=1e-12 && a.overallFalseActivation<b.overallFalseActivation-1e-12);
const bestFor=(k,withMargin)=>{
  let best=null;
  for(const threshold of candidateThresholds){
    if(!(threshold>0&&threshold<1)) continue;
    const margins=withMargin ? candidateMargins : [0];
    for(const margin of margins){
      const r=evaluatePolicy(k,threshold,margin,withMargin);
      if(safe(r)&&better(r,best)) best=r;
    }
  }
  return best;
};

const inTop2=eligibleKnown.filter((row)=>row.router.slice(0,2).some((c)=>c.id===row.expectedRoute));
const correctScores=inTop2.map((row)=>row.router.find((c)=>c.id===row.expectedRoute).identity);
const competitorScores=inTop2.map((row)=>Math.max(...row.router.slice(0,2).filter((c)=>c.id!==row.expectedRoute).map((c)=>c.identity)));
const correctMargins=inTop2.map((row)=>{
  const correct=row.router.find((c)=>c.id===row.expectedRoute).identity;
  const other=Math.max(...row.router.slice(0,2).filter((c)=>c.id!==row.expectedRoute).map((c)=>c.identity));
  return correct-other;
});

const report={
  version:'0.13-fallback-identity-v0.2-architecture-diagnostic-v0.1',
  status:'diagnostic_only_calibration_consumed_for_architecture',
  policy:{
    mayRetuneFrozenV02:false,
    mayClaimFreshGeneralization:false,
    thisCalibrationMayNotCalibrateNextCandidate:true,
    nextIdentityArchitectureRequiresFreshCalibration:true,
    candidateLockStillRequiredBeforeFreshIndependent:true
  },
  counts:{ known:known.length, eligibleKnown:eligibleKnown.length, nonRoute:nonRoute.length, eligibleNonRoute:eligibleNonRoute.length },
  ceilings:{
    routeabilityEligibilityOverall:ratio(eligibleKnown.length,known.length),
    routerTop1WithinEligible:coverage(1),
    routerTop2WithinEligible:coverage(2),
    routerTop3WithinEligible:coverage(3),
    routerTop5WithinEligible:coverage(5),
    routerTop2OverallCeiling:ratio(eligibleKnown.filter((row)=>row.router.slice(0,2).some((c)=>c.id===row.expectedRoute)).length,known.length),
    routerTop3OverallCeiling:ratio(eligibleKnown.filter((row)=>row.router.slice(0,3).some((c)=>c.id===row.expectedRoute)).length,known.length),
    routerTop5OverallCeiling:ratio(eligibleKnown.filter((row)=>row.router.slice(0,5).some((c)=>c.id===row.expectedRoute)).length,known.length)
  },
  currentExactlyOne:{ threshold:currentThreshold, knownExact:currentKnownExact, knownRetention:ratio(currentKnownExact,known.length), selectedTotal:currentSelected.length, acceptedRouteAccuracy:ratio(currentCorrectSelected,currentSelected.length,1), rejectAll:currentRejectAll, multipleAdmissions:currentMultiple },
  scoreSeparation:{ correctCandidateWhenInTop2:summarize(correctScores), competingCandidateWhenCorrectInTop2:summarize(competitorScores), correctMinusCompetitor:summarize(correctMargins), correctCandidateHigherThanCompetitor:ratio(correctMargins.filter((v)=>v>0).length,correctMargins.length) },
  diagnosticPolicySweep:{
    top2ArgmaxAbsoluteThreshold:bestFor(2,false),
    top2ArgmaxAbsolutePlusMargin:bestFor(2,true),
    top3ArgmaxAbsoluteThreshold:bestFor(3,false),
    top3ArgmaxAbsolutePlusMargin:bestFor(3,true),
    top5ArgmaxAbsoluteThreshold:bestFor(5,false),
    top5ArgmaxAbsolutePlusMargin:bestFor(5,true)
  }
};
writeJson('data/liuyao-semantic-fallback-identity-v0.2-architecture-diagnostic.json',report);
console.log(JSON.stringify(report,null,2));
