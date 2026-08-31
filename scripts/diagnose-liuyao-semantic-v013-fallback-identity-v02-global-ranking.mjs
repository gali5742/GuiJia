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
assert(identity.status === 'frozen_representation_corrected', 'corrected Identity missing');
assert(corrected.encoder?.textsPerEncoderCall === 1 && routeability.encoder?.textsPerEncoderCall === 1, 'canonical representation missing');

const context = { console, Math, JSON, Float32Array, Float64Array, Array, Object, Number, Date, Intl, Set, Map };
context.window=context; context.globalThis=context; vm.createContext(context);
for(const relative of [
  'js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const evidenceApi=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceApi?.extract && arbitrationApi?.arbitrate,'fallback semantic path unavailable');

const dot=(weights,vector)=>{let total=0;for(let i=0;i<weights.length;i+=1)total+=weights[i]*vector[i];return total;};
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const percentile=(values,p)=>{if(!values.length)return null;const s=[...values].sort((a,b)=>a-b);const x=(s.length-1)*p,l=Math.floor(x),h=Math.ceil(x);return l===h?s[l]:s[l]+(s[h]-s[l])*(x-l);};
const summarize=(values)=>({n:values.length,min:values.length?Math.min(...values):null,p10:percentile(values,.1),p25:percentile(values,.25),median:percentile(values,.5),p75:percentile(values,.75),p90:percentile(values,.9),max:values.length?Math.max(...values):null});

const encoder=corrected.encoder;
env.allowLocalModels=false;env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',encoder.modelId,{dtype:encoder.dtype,revision:encoder.revision});
const embedOne=async(text)=>{const out=await extractor(String(text||''),{pooling:encoder.pooling,normalize:encoder.normalize});if(out?.dims?.[out.dims.length-1]!==512)throw new Error('embedding size');const v=new Float32Array(512);for(let i=0;i<512;i+=1)v[i]=Number(out.data[i]);return v;};
const identityRanking=(vector)=>routeIds.map((id)=>({id,score:sigmoid(dot(identity.model.heads[id].weights,vector)+identity.model.heads[id].bias)})).sort((a,b)=>b.score-a.score);
const routeabilityScore=(vector)=>sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);

const rows=[];
for(let i=0;i<calibration.rows.length;i+=1){
  const source=calibration.rows[i];const vector=await embedOne(source.text);const evidence=evidenceApi.extract(source.text);const arbitration=arbitrationApi.arbitrate(source.text,evidence);
  const r=routeabilityScore(vector);const ranking=identityRanking(vector);const semanticEligible=(evidence.unsupportedTargets||[]).length===0&&arbitration==null;
  rows.push({...source,semanticEligible,routeability:r,identity:ranking});
  if((i+1)%40===0||i+1===calibration.rows.length)console.log(`global-ranking embedded ${i+1}/${calibration.rows.length}`);
}
const known=rows.filter((r)=>r.expectedRoute!=null),nonRoute=rows.filter((r)=>r.expectedRoute==null);
const semanticKnown=known.filter((r)=>r.semanticEligible),semanticNonRoute=nonRoute.filter((r)=>r.semanticEligible);
const topK=(row,k)=>row.identity.slice(0,k).some((c)=>c.id===row.expectedRoute);
const correctRank=semanticKnown.map((row)=>row.identity.findIndex((c)=>c.id===row.expectedRoute)+1);
const correctScore=semanticKnown.map((row)=>row.identity.find((c)=>c.id===row.expectedRoute)?.score).filter(Number.isFinite);
const knownTopScore=semanticKnown.map((row)=>row.identity[0].score);
const nonRouteTopScore=semanticNonRoute.map((row)=>row.identity[0].score);
const knownMargin=semanticKnown.map((row)=>row.identity[0].score-row.identity[1].score);
const nonRouteMargin=semanticNonRoute.map((row)=>row.identity[0].score-row.identity[1].score);

const thresholdValues=new Set([0.5,identity.calibration.threshold]);
const marginValues=new Set([0]);
const routeabilityValues=new Set([routeability.calibration.threshold,0]);
for(const row of rows.filter((r)=>r.semanticEligible)){
  thresholdValues.add(row.identity[0].score);
  marginValues.add(Math.max(0,row.identity[0].score-row.identity[1].score));
  routeabilityValues.add(row.routeability);
}
const midpointFill=(set)=>{const base=[...set].filter(Number.isFinite).sort((a,b)=>a-b);for(let i=0;i+1<base.length;i+=1)set.add((base[i]+base[i+1])/2);};
midpointFill(thresholdValues);midpointFill(marginValues);midpointFill(routeabilityValues);

const evaluate=({identityThreshold,marginThreshold=0,routeabilityThreshold=null})=>{
  const decide=(row)=>{
    if(!row.semanticEligible)return null;
    if(routeabilityThreshold!=null&&row.routeability<routeabilityThreshold)return null;
    const top=row.identity[0],second=row.identity[1];
    if(top.score<identityThreshold)return null;
    if(top.score-second.score<marginThreshold)return null;
    return top.id;
  };
  const selected=rows.filter((r)=>decide(r)!=null);const correct=selected.filter((r)=>r.expectedRoute!=null&&decide(r)===r.expectedRoute).length;
  const knownExact=known.filter((r)=>decide(r)===r.expectedRoute).length;const wrongKnown=known.filter((r)=>decide(r)!=null&&decide(r)!==r.expectedRoute).length;
  const fa=nonRoute.filter((r)=>decide(r)!=null).length;const bySubtype={};
  for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']){const subset=nonRoute.filter((r)=>r.subtype===subtype);const activated=subset.filter((r)=>decide(r)!=null).length;bySubtype[subtype]={n:subset.length,activated,falseActivation:ratio(activated,subset.length)};}
  return{identityThreshold,marginThreshold,routeabilityThreshold,knownExact,knownRetention:ratio(knownExact,known.length),wrongKnownSelected:wrongKnown,selectedTotal:selected.length,acceptedRouteAccuracy:ratio(correct,selected.length,1),overallFalseActivation:ratio(fa,nonRoute.length),maxSubtypeFalseActivation:Math.max(...Object.values(bySubtype).map((x)=>x.falseActivation)),bySubtype};
};
const safe=(r)=>r.acceptedRouteAccuracy>=.98-1e-12&&r.overallFalseActivation<=.05+1e-12&&r.maxSubtypeFalseActivation<=.05+1e-12;
const better=(a,b)=>!b||a.knownRetention>b.knownRetention+1e-12||(Math.abs(a.knownRetention-b.knownRetention)<=1e-12&&a.acceptedRouteAccuracy>b.acceptedRouteAccuracy+1e-12)||(Math.abs(a.knownRetention-b.knownRetention)<=1e-12&&Math.abs(a.acceptedRouteAccuracy-b.acceptedRouteAccuracy)<=1e-12&&a.overallFalseActivation<b.overallFalseActivation-1e-12);
const sweepFixedRouteability=(rt,withMargin)=>{let best=null;for(const t of thresholdValues){if(!(t>0&&t<1))continue;for(const m of (withMargin?marginValues:[0])){const r=evaluate({identityThreshold:t,marginThreshold:m,routeabilityThreshold:rt});if(safe(r)&&better(r,best))best=r;}}return best;};
const sweepRelaxedRouteability=()=>{
  let best=null;
  const identityCandidates=[...thresholdValues].filter((x)=>x>0&&x<1);
  const routeCandidates=[...routeabilityValues].filter((x)=>x>=0&&x<1);
  for(const rt of routeCandidates){
    for(const t of identityCandidates){const r=evaluate({identityThreshold:t,marginThreshold:0,routeabilityThreshold:rt});if(safe(r)&&better(r,best))best=r;}
  }
  return best;
};

const currentRt=routeability.calibration.threshold;
const report={
  version:'0.13-fallback-identity-v0.2-global-ranking-diagnostic-v0.1',status:'diagnostic_only_calibration_consumed_for_architecture',
  policy:{mayRetuneFrozenV02:false,mayClaimFreshGeneralization:false,thisCalibrationMayNotCalibrateNextCandidate:true,nextArchitectureRequiresFreshCalibration:true},
  counts:{known:known.length,semanticEligibleKnown:semanticKnown.length,nonRoute:nonRoute.length,semanticEligibleNonRoute:semanticNonRoute.length},
  globalIdentityCoverage:{top1:ratio(semanticKnown.filter((r)=>topK(r,1)).length,semanticKnown.length),top2:ratio(semanticKnown.filter((r)=>topK(r,2)).length,semanticKnown.length),top3:ratio(semanticKnown.filter((r)=>topK(r,3)).length,semanticKnown.length),top5:ratio(semanticKnown.filter((r)=>topK(r,5)).length,semanticKnown.length),top10:ratio(semanticKnown.filter((r)=>topK(r,10)).length,semanticKnown.length),meanCorrectRank:correctRank.reduce((a,b)=>a+b,0)/Math.max(1,correctRank.length)},
  scoreDistributions:{correctRouteScore:summarize(correctScore),knownGlobalTopScore:summarize(knownTopScore),nonRouteGlobalTopScore:summarize(nonRouteTopScore),knownTop1Margin:summarize(knownMargin),nonRouteTop1Margin:summarize(nonRouteMargin)},
  safetyConstrainedSweeps:{
    currentRouteability_globalArgmax:sweepFixedRouteability(currentRt,false),
    currentRouteability_globalArgmaxWithMargin:sweepFixedRouteability(currentRt,true),
    noRouteability_globalArgmax:sweepFixedRouteability(null,false),
    noRouteability_globalArgmaxWithMargin:sweepFixedRouteability(null,true),
    relaxedRouteability_globalArgmax:sweepRelaxedRouteability()
  }
};
writeJson('data/liuyao-semantic-fallback-identity-v0.2-global-ranking-diagnostic.json',report);
console.log(JSON.stringify(report,null,2));
