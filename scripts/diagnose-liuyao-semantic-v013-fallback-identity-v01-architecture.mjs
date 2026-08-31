import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const ratio=(n,d,empty=0)=>d?n/d:empty;
const dot=(weights,vector)=>weights.reduce((sum,value,i)=>sum+value*vector[i],0);
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const softmax=(logits)=>{const max=Math.max(...logits);const exps=logits.map(v=>Math.exp(v-max));const total=exps.reduce((s,v)=>s+v,0);return exps.map(v=>v/Math.max(total,1e-12));};

const artifact=readJson('data/liuyao-semantic-fallback-identity-v0.1.json');
const calibration=readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const frozen=readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeability=readJson('data/liuyao-semantic-routeability-v0.2.json');
const routeIds=artifact.routeOrder;
const routeabilityThreshold=0.7675678218564946;

const context={console,Math,JSON,Float32Array,Float64Array,Array,Object,Number,Date,Intl,Set,Map};context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js']) vm.runInContext(fs.readFileSync(path.join(root,relative),'utf8'),context,{filename:relative});
const evidenceApi=context.GuiJia.liuyaoSemanticRouteEvidenceV03;const arbitrationApi=context.GuiJia.liuyaoSemanticRouteArbitrationV012;

env.allowLocalModels=false;env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',frozen.encoder.modelId,{dtype:frozen.encoder.dtype,revision:frozen.encoder.revision});
const output=await extractor(calibration.rows.map(r=>r.text),{pooling:frozen.encoder.pooling,normalize:frozen.encoder.normalize});
const hidden=output.dims[output.dims.length-1];
const vectors=calibration.rows.map((_,row)=>{const vector=new Float32Array(hidden);const offset=row*hidden;for(let i=0;i<hidden;i+=1)vector[i]=Number(output.data[offset+i]);return vector;});
const rows=calibration.rows.map((row,index)=>{
  const vector=vectors[index];const evidence=evidenceApi.extract(row.text);const arbitration=arbitrationApi.arbitrate(row.text,evidence);
  const routeabilityProbability=sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);
  const logits=frozen.router.routeHead.weights.map((weights,i)=>dot(weights,vector)+frozen.router.routeHead.biases[i]);const probs=softmax(logits);
  const head=routeIds.map((id,i)=>({id,score:probs[i]})).sort((a,b)=>b.score-a.score).slice(0,2);
  const identity=head.map(c=>{const model=artifact.model.heads[c.id];return{routeId:c.id,probability:sigmoid(dot(model.weights,vector)+model.bias)};});
  return{expectedRoute:row.expectedRoute,subtype:row.subtype,unsupported:(evidence.unsupportedTargets||[]).length>0,arbitration,routeabilityAccepted:routeabilityProbability>=routeabilityThreshold,head,identity};
});

const allScores=rows.filter(r=>!r.unsupported&&r.arbitration==null).flatMap(r=>r.identity.map(c=>c.probability)).sort((a,b)=>a-b);const values=[...new Set(allScores)];const thresholds=new Set([0.5]);for(const v of values)thresholds.add(v);for(let i=0;i+1<values.length;i+=1)thresholds.add((values[i]+values[i+1])/2);thresholds.add(Math.max(1e-12,values[0]-1e-9));thresholds.add(Math.min(1-1e-12,values[values.length-1]+1e-9));
const constraints={minAccuracy:.98,maxFA:.05};

function evaluate(mode,threshold){
  const decisions=rows.map(row=>{
    if(row.unsupported||row.arbitration!=null)return{row,selected:null};
    if(mode.routeabilityRequired&&!row.routeabilityAccepted)return{row,selected:null};
    const admitted=row.identity.filter(c=>c.probability>=threshold);
    let selected=null;
    if(mode.multiplePolicy==='unresolved'){if(admitted.length===1)selected=admitted[0].routeId;}
    else if(mode.multiplePolicy==='higher_score'){if(admitted.length>=1)selected=[...admitted].sort((a,b)=>b.probability-a.probability)[0].routeId;}
    return{row,selected};
  });
  const known=decisions.filter(x=>x.row.expectedRoute!=null),nonRoute=decisions.filter(x=>x.row.expectedRoute==null),selected=decisions.filter(x=>x.selected!=null);
  const correct=selected.filter(x=>x.row.expectedRoute!=null&&x.selected===x.row.expectedRoute).length;
  const knownExact=known.filter(x=>x.selected===x.row.expectedRoute).length;
  const falseActivated=nonRoute.filter(x=>x.selected!=null).length;
  const bySubtype={};for(const subtype of ['outside_current_22','route_unresolved','near_domain_not_current_route']){const set=nonRoute.filter(x=>x.row.subtype===subtype);bySubtype[subtype]=ratio(set.filter(x=>x.selected!=null).length,set.length);}
  return{threshold,knownRetention:ratio(knownExact,known.length),knownExact,acceptedRouteAccuracy:ratio(correct,selected.length,1),selectedTotal:selected.length,overallFalseActivation:ratio(falseActivated,nonRoute.length),maxSubtypeFalseActivation:Math.max(...Object.values(bySubtype)),bySubtype};
}
function bestFor(mode){let best=null;for(const threshold of [...thresholds].filter(v=>v>0&&v<1)){const current=evaluate(mode,threshold);if(current.acceptedRouteAccuracy+1e-12<constraints.minAccuracy||current.overallFalseActivation>constraints.maxFA+1e-12||current.maxSubtypeFalseActivation>constraints.maxFA+1e-12)continue;if(!best||current.knownRetention>best.knownRetention+1e-12||(Math.abs(current.knownRetention-best.knownRetention)<=1e-12&&current.acceptedRouteAccuracy>best.acceptedRouteAccuracy+1e-12)||(Math.abs(current.knownRetention-best.knownRetention)<=1e-12&&Math.abs(current.acceptedRouteAccuracy-best.acceptedRouteAccuracy)<=1e-12&&current.overallFalseActivation<best.overallFalseActivation-1e-12)||(Math.abs(current.knownRetention-best.knownRetention)<=1e-12&&Math.abs(current.acceptedRouteAccuracy-best.acceptedRouteAccuracy)<=1e-12&&Math.abs(current.overallFalseActivation-best.overallFalseActivation)<=1e-12&&current.threshold>best.threshold))best=current;}return best;}
const modes={
  current_v01:{routeabilityRequired:true,multiplePolicy:'unresolved'},
  identity_only_unresolved:{routeabilityRequired:false,multiplePolicy:'unresolved'},
  routeability_then_higher_identity:{routeabilityRequired:true,multiplePolicy:'higher_score'},
  identity_only_higher_identity:{routeabilityRequired:false,multiplePolicy:'higher_score'}
};
const results=Object.fromEntries(Object.entries(modes).map(([name,mode])=>[name,bestFor(mode)]));
const report={version:'0.13-fallback-identity-v0.1-architecture-counterfactual-v0.1',status:'diagnostic_only',policy:{mayRetuneFrozenV01:false,thresholdsAreDiagnosticOnly:true,newVersionRequiresFreshCalibration:true},results};
fs.writeFileSync(path.join(root,'data/liuyao-semantic-fallback-identity-v0.1-architecture-counterfactual.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
