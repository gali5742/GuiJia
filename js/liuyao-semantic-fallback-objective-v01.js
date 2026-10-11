(function (global) {
  'use strict';
  const GuiJia=global.GuiJia=global.GuiJia||{},base=GuiJia.liuyaoSemanticFallbackIdentityModelV02;
  if(!base)throw new Error('Frozen weighted model v0.2 required');
  function prepare(routeId,rows,vectors) {
    if(!base.routeIds.includes(routeId))throw new Error('Unknown objective route');
    const clean=base.deduplicateRows(rows);
    if(clean.length!==rows.length||vectors.length!==rows.length)throw new Error('Objective membership/vector mismatch');
    for(const v of vectors)if(v.length!==512||!Array.from(v).every(Number.isFinite))throw new Error('Objective finite512 vectors required');
    const positiveCount=clean.filter(r=>r.expectedRoute===routeId).length,negativeCount=clean.length-positiveCount;
    if(!positiveCount||!negativeCount)throw new Error('Objective requires both classes');
    const negativeCoefficientTotal=clean.reduce((s,r)=>s+(r.expectedRoute===routeId?0:base.negativeMultiplier(routeId,r.expectedRoute)),0);
    const sampleWeights=Float64Array.from(clean,r=>r.expectedRoute===routeId ? .5/positiveCount : .5*base.negativeMultiplier(routeId,r.expectedRoute)/negativeCoefficientTotal);
    const targets=Uint8Array.from(clean,r=>r.expectedRoute===routeId?1:0);
    return {routeId,vectors,targets,sampleWeights,positiveCount,negativeCount,negativeCoefficientTotal};
  }
  function evaluate(prepared,parameters) {
    if(parameters.length!==513||!Array.from(parameters).every(Number.isFinite))throw new Error('Finite513 objective parameters required');
    const gradient=new Float64Array(513);let dataLoss=0,regularizationLoss=0;
    for(let n=0;n<prepared.targets.length;n++) {
      const vector=prepared.vectors[n],target=prepared.targets[n],mass=prepared.sampleWeights[n];let z=parameters[512];
      for(let k=0;k<512;k++)z+=parameters[k]*vector[k];
      const exp=z>=0?Math.exp(-z):Math.exp(z),probability=z>=0?1/(1+exp):exp/(1+exp),error=(probability-target)*mass;
      dataLoss+=mass*(Math.max(z,0)-z*target+Math.log1p(Math.exp(-Math.abs(z))));
      for(let k=0;k<512;k++)gradient[k]+=error*vector[k];gradient[512]+=error;
    }
    const l2=base.hyperparameters.l2;
    for(let k=0;k<512;k++){regularizationLoss+=.5*l2*parameters[k]*parameters[k];gradient[k]+=l2*parameters[k];}
    return {weightedTrainingLoss:dataLoss+regularizationLoss,dataLoss,regularizationLoss,gradient,gradientInfinityNorm:Math.max(...Array.from(gradient,Math.abs)),gradientL2Norm:Math.sqrt(gradient.reduce((s,x)=>s+x*x,0))};
  }
  GuiJia.liuyaoSemanticFallbackObjectiveV01=Object.freeze({version:'0.1-same-frozen-weighted-convex-objective',prepare,evaluate,l2:base.hyperparameters.l2,biasRegularized:false,metadataFeaturesOrWeights:false});
})(typeof window!=='undefined'?window:globalThis);
