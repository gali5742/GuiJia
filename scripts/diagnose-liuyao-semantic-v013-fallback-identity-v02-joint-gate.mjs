import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const ratio = (n,d,empty=0) => d ? n/d : empty;
const assert = (condition,message) => { if(!condition) throw new Error(message); };

const identity = readJson('data/liuyao-semantic-fallback-identity-v0.2.json');
const calibration = readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const corrected = readJson('data/liuyao-semantic-frozen-dependencies-v0.2.json');
const routeability = readJson('data/liuyao-semantic-routeability-v0.4.json');
const inventory = readJson('data/liuyao-semantic-route-inventory-v0.2.json');
const routeIds = inventory.routes.map((row)=>row.routeId);
assert(identity.status==='frozen_representation_corrected','corrected Identity missing');
assert(corrected.encoder?.textsPerEncoderCall===1&&routeability.encoder?.textsPerEncoderCall===1,'canonical representation missing');

const context={console,Math,JSON,Float32Array,Float64Array,Array,Object,Number,Date,Intl,Set,Map};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js']){
  vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
}
const evidenceApi=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitrationApi=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceApi?.extract&&arbitrationApi?.arbitrate,'semantic path unavailable');

const dot=(w,v)=>{let t=0;for(let i=0;i<w.length;i+=1)t+=w[i]*v[i];return t;};
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const encoder=corrected.encoder;
env.allowLocalModels=false;env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',encoder.modelId,{dtype:encoder.dtype,revision:encoder.revision});
const embedOne=async(text)=>{const out=await extractor(String(text||''),{pooling:encoder.pooling,normalize:encoder.normalize});if(out?.dims?.[out.dims.length-1]!==512)throw new Error('embedding size');const v=new Float32Array(512);for(let i=0;i<512;i+=1)v[i]=Number(out.data[i]);return v;};
const rankIdentity=(vector)=>routeIds.map((id)=>({id,score:sigmoid(dot(identity.model.heads[id].weights,vector)+identity.model.heads[id].bias)})).sort((a,b)=>b.score-a.score);
const scoreRouteability=(vector)=>sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);

const rows=[];
for(let i=0;i<calibration.rows.length;i+=1){
  const source=calibration.rows[i],vector=await embedOne(source.text),evidence=evidenceApi.extract(source.text),arbitration=arbitrationApi.arbitrate(source.text,evidence),ranking=rankIdentity(vector);
  rows.push({...source,semanticEligible:(evidence.unsupportedTargets||[]).length===0&&arbitration==null,routeability:scoreRouteability(vector),predictedRoute:ranking[0].id,identityTop:ranking[0].score,identityMargin:ranking[0].score-ranking[1].score});
  if((i+1)%40===0||i+1===calibration.rows.length)console.log(`joint-gate embedded ${i+1}/${calibration.rows.length}`);
}
const known=rows.filter((r)=>r.expectedRoute!=null),nonRoute=rows.filter((r)=>r.expectedRoute==null);
const semanticRows=rows.filter((r)=>r.semanticEligible);
const routeThresholds=[...new Set(semanticRows.map((r)=>r.routeability))].sort((a,b)=>a-b);
const identityThresholds=[...new Set(semanticRows.map((r)=>r.identityTop))].sort((a,b)=>a-b);

const statsFromSelected=(selected,rt,it,mt)=>{
  const correct=selected.filter((r)=>r.expectedRoute!=null&&r.predictedRoute===r.expectedRoute).length;
  const wrongKnown=selected.filter((r)=>r.expectedRoute!=null&&r.predictedRoute!==r.expectedRoute).length;
  const falseRows=selected.filter((r)=>r.expectedRoute==null);
  const bySubtype={};
  for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']){
    const total=nonRoute.filter((r)=>r.subtype===subtype).length,activated=falseRows.filter((r)=>r.subtype===subtype).length;
    bySubtype[subtype]={n:total,activated,falseActivation:ratio(activated,total)};
  }
  return {routeabilityThreshold:rt,identityThreshold:it,marginThreshold:mt,knownExact:correct,knownRetention:ratio(correct,known.length),wrongKnownSelected:wrongKnown,selectedTotal:selected.length,acceptedRouteAccuracy:ratio(correct,selected.length,1),overallFalseActivation:ratio(falseRows.length,nonRoute.length),maxSubtypeFalseActivation:Math.max(...Object.values(bySubtype).map((v)=>v.falseActivation)),bySubtype};
};
const safe=(r)=>r.acceptedRouteAccuracy>=.98-1e-12&&r.overallFalseActivation<=.05+1e-12&&r.maxSubtypeFalseActivation<=.05+1e-12;
const better=(a,b)=>!b||a.knownRetention>b.knownRetention+1e-12||(Math.abs(a.knownRetention-b.knownRetention)<=1e-12&&a.acceptedRouteAccuracy>b.acceptedRouteAccuracy+1e-12)||(Math.abs(a.knownRetention-b.knownRetention)<=1e-12&&Math.abs(a.acceptedRouteAccuracy-b.acceptedRouteAccuracy)<=1e-12&&a.overallFalseActivation<b.overallFalseActivation-1e-12)||(Math.abs(a.knownRetention-b.knownRetention)<=1e-12&&Math.abs(a.acceptedRouteAccuracy-b.acceptedRouteAccuracy)<=1e-12&&Math.abs(a.overallFalseActivation-b.overallFalseActivation)<=1e-12&&a.maxSubtypeFalseActivation<b.maxSubtypeFalseActivation-1e-12);

let best=null;
for(const rt of routeThresholds){
  const routeSubset=semanticRows.filter((r)=>r.routeability>=rt);
  if(!routeSubset.length)continue;
  for(const it of identityThresholds){
    const base=routeSubset.filter((r)=>r.identityTop>=it);
    if(!base.length)continue;
    const ordered=[...base].sort((a,b)=>b.identityMargin-a.identityMargin);
    let index=0;
    while(index<ordered.length){
      const mt=ordered[index].identityMargin;
      let end=index;
      while(end+1<ordered.length&&Math.abs(ordered[end+1].identityMargin-mt)<=1e-15)end+=1;
      const selected=ordered.slice(0,end+1);
      const current=statsFromSelected(selected,rt,it,mt);
      if(safe(current)&&better(current,best))best=current;
      index=end+1;
    }
  }
}

const report={
  version:'0.13-fallback-identity-v0.2-joint-gate-diagnostic-v0.1',
  status:'diagnostic_only_calibration_consumed_for_architecture',
  policy:{mayRetuneFrozenV02:false,mayClaimFreshGeneralization:false,thresholdsAreDiagnosticOnly:true,nextArchitectureRequiresFreshCalibration:true},
  counts:{known:known.length,nonRoute:nonRoute.length,semanticEligible:semanticRows.length},
  searchSpace:{routeabilityThresholds:routeThresholds.length,identityThresholds:identityThresholds.length,marginThresholds:'observed_within_each_joint_subset'},
  bestSafetyConstrainedJointGate:best
};
writeJson('data/liuyao-semantic-fallback-identity-v0.2-joint-gate-diagnostic.json',report);
console.log(JSON.stringify(report,null,2));
