import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const frozen=readJson('data/liuyao-semantic-frozen-dependencies-v0.1.json');
const routeability=readJson('data/liuyao-semantic-routeability-v0.2.json');
const identity=readJson('data/liuyao-semantic-fallback-identity-v0.1.json');
const calibration=readJson('data/liuyao-semantic-fallback-identity-v0.1-calibration.json');
const texts=calibration.rows.slice(0,24).map(r=>r.text);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const softmax=(logits)=>{const m=Math.max(...logits),e=logits.map(v=>Math.exp(v-m)),t=e.reduce((s,v)=>s+v,0);return e.map(v=>v/t);};
const cosine=(a,b)=>dot(a,b)/Math.max(Math.sqrt(dot(a,a))*Math.sqrt(dot(b,b)),1e-12);

env.allowLocalModels=false;env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',frozen.encoder.modelId,{dtype:frozen.encoder.dtype,revision:frozen.encoder.revision});
const tensorVectors=(output,count)=>{const hidden=output.dims[output.dims.length-1];const vectors=[];for(let r=0;r<count;r++){const v=new Float32Array(hidden);const off=r*hidden;for(let i=0;i<hidden;i++)v[i]=Number(output.data[off+i]);vectors.push(v);}return vectors;};
const single=[];for(const text of texts){const out=await extractor(text,{pooling:frozen.encoder.pooling,normalize:frozen.encoder.normalize});single.push(tensorVectors(out,1)[0]);}
const batch24=tensorVectors(await extractor(texts,{pooling:frozen.encoder.pooling,normalize:frozen.encoder.normalize}),texts.length);
const batch6=[];for(let s=0;s<texts.length;s+=6){const chunk=texts.slice(s,s+6);batch6.push(...tensorVectors(await extractor(chunk,{pooling:frozen.encoder.pooling,normalize:frozen.encoder.normalize}),chunk.length));}
const routeIds=frozen.router.routeOrder;
const score=(vector)=>{
  const logits=frozen.router.routeHead.weights.map((w,i)=>dot(w,vector)+frozen.router.routeHead.biases[i]);const probs=softmax(logits);const ranked=routeIds.map((id,i)=>({id,p:probs[i]})).sort((a,b)=>b.p-a.p);
  const routeabilityProbability=sigmoid(dot(routeability.model.weights,vector)+routeability.model.bias);
  const idScores={};for(const id of [ranked[0].id,ranked[1].id]){const h=identity.model.heads[id];idScores[id]=sigmoid(dot(h.weights,vector)+h.bias);}
  return{top1:ranked[0].id,top2:ranked[1].id,routeabilityProbability,routeabilityAccepted:routeabilityProbability>=0.7675678218564946,idScores};
};
const compare=(base,other)=>{
  const rows=base.map((v,i)=>{const b=score(v),o=score(other[i]);let maxAbs=0;for(let j=0;j<v.length;j++)maxAbs=Math.max(maxAbs,Math.abs(v[j]-other[i][j]));const ids=new Set([...Object.keys(b.idScores),...Object.keys(o.idScores)]);let maxIdentityDelta=0;for(const id of ids){const h=identity.model.heads[id];const bp=sigmoid(dot(h.weights,v)+h.bias),op=sigmoid(dot(h.weights,other[i])+h.bias);maxIdentityDelta=Math.max(maxIdentityDelta,Math.abs(bp-op));}return{cosine:cosine(v,other[i]),maxAbs,routerTop1Changed:b.top1!==o.top1,routerTop2SetChanged:new Set([b.top1,b.top2]).size!==new Set([o.top1,o.top2]).size||![b.top1,b.top2].every(id=>[o.top1,o.top2].includes(id)),routeabilityDelta:Math.abs(b.routeabilityProbability-o.routeabilityProbability),routeabilityDispositionChanged:b.routeabilityAccepted!==o.routeabilityAccepted,maxIdentityDelta};});
  return{n:rows.length,minCosine:Math.min(...rows.map(r=>r.cosine)),maxVectorAbsDelta:Math.max(...rows.map(r=>r.maxAbs)),routerTop1Changes:rows.filter(r=>r.routerTop1Changed).length,routerTop2SetChanges:rows.filter(r=>r.routerTop2SetChanged).length,maxRouteabilityProbabilityDelta:Math.max(...rows.map(r=>r.routeabilityDelta)),routeabilityDispositionChanges:rows.filter(r=>r.routeabilityDispositionChanged).length,maxIdentityProbabilityDelta:Math.max(...rows.map(r=>r.maxIdentityDelta))};
};
const report={version:'0.13-embedding-batch-invariance-audit-v0.1',status:'diagnostic_only',sampleCount:texts.length,comparisons:{single_vs_batch6:compare(single,batch6),single_vs_batch24:compare(single,batch24)}};
fs.writeFileSync(path.join(root,'data/liuyao-semantic-embedding-batch-invariance-audit-v0.1.json'),`${JSON.stringify(report,null,2)}\n`,'utf8');
console.log(JSON.stringify(report,null,2));
