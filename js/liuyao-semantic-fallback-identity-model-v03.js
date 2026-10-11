(function (global) {
  'use strict';
  const G=global.GuiJia=global.GuiJia||{},base=G.liuyaoSemanticFallbackIdentityModelV02,objective=G.liuyaoSemanticFallbackObjectiveV01;
  if(!base||!objective)throw new Error('Frozen v0.2 labels and objective v0.1 required');
  const hyperparameters=Object.freeze({l2:0.00025,maxIterations:1000,gradientInfinityTolerance:1e-7,memory:10,armijo:1e-4,backtrackFactor:0.5,initialStep:1,minStep:1e-12,maxLineSearchSteps:50});
  const dot=(a,b)=>a.reduce((sum,x,n)=>sum+x*b[n],0);
  function trainHead(routeId,rows,vectors,options={}) {
    for(const [k,v]of Object.entries(options))if(!Object.hasOwn(hyperparameters,k)||v!==hyperparameters[k])throw new Error('Fallback v0.3 frozen optimizer drift');
    const prepared=objective.prepare(routeId,rows,vectors);let parameters=new Float64Array(513),state=objective.evaluate(prepared,parameters),iterations=0,evaluations=1,stopReason='maximum_iterations',history=[];
    const trace=[{iteration:0,loss:state.weightedTrainingLoss,gradientInfinityNorm:state.gradientInfinityNorm}];
    for(;iterations<hyperparameters.maxIterations;) {
      if(state.gradientInfinityNorm<=hyperparameters.gradientInfinityTolerance){stopReason='gradient_tolerance';break;}
      const q=Float64Array.from(state.gradient),alphas=new Float64Array(history.length);
      for(let i=history.length-1;i>=0;i--){const h=history[i];alphas[i]=h.rho*dot(h.s,q);for(let n=0;n<513;n++)q[n]-=alphas[i]*h.y[n];}
      const last=history.at(-1),scale=last?dot(last.s,last.y)/dot(last.y,last.y):1;
      const direction=Float64Array.from(q,x=>x*scale);
      for(let i=0;i<history.length;i++){const h=history[i],beta=h.rho*dot(h.y,direction);for(let n=0;n<513;n++)direction[n]+=h.s[n]*(alphas[i]-beta);}
      for(let n=0;n<513;n++)direction[n]=-direction[n];
      let slope=dot(state.gradient,direction);
      if(!Number.isFinite(slope)||slope>=0){history=[];for(let n=0;n<513;n++)direction[n]=-state.gradient[n];slope=-dot(state.gradient,state.gradient);}
      let step=hyperparameters.initialStep,next=null,nextParameters=null;
      for(let attempt=0;attempt<hyperparameters.maxLineSearchSteps&&step>=hyperparameters.minStep;attempt++,step*=hyperparameters.backtrackFactor){
        const trial=Float64Array.from(parameters,(x,n)=>x+step*direction[n]);const evaluated=objective.evaluate(prepared,trial);evaluations++;
        if(Number.isFinite(evaluated.weightedTrainingLoss)&&evaluated.weightedTrainingLoss<=state.weightedTrainingLoss+hyperparameters.armijo*step*slope){next=evaluated;nextParameters=trial;break;}
      }
      if(!next){stopReason='line_search_failed';break;}
      const s=Float64Array.from(parameters,(x,n)=>nextParameters[n]-x),y=Float64Array.from(state.gradient,(x,n)=>next.gradient[n]-x),curvature=dot(s,y);
      if(Number.isFinite(curvature)&&curvature>0){history.push({s,y,rho:1/curvature});if(history.length>hyperparameters.memory)history.shift();}
      parameters=nextParameters;state=next;iterations++;trace.push({iteration:iterations,loss:state.weightedTrainingLoss,gradientInfinityNorm:state.gradientInfinityNorm});
    }
    const converged=state.gradientInfinityNorm<=hyperparameters.gradientInfinityTolerance;if(converged)stopReason='gradient_tolerance';
    return Object.freeze({routeId,weights:parameters.slice(0,512),bias:parameters[512],positiveCount:prepared.positiveCount,negativeCount:prepared.negativeCount,negativeCoefficientTotal:prepared.negativeCoefficientTotal,weightedTrainingLoss:state.weightedTrainingLoss,optimization:Object.freeze({converged,stopReason,iterations,evaluations,gradientInfinityNorm:state.gradientInfinityNorm,gradientL2Norm:state.gradientL2Norm,trace})});
  }
  function trainAll(rows,vectors,options={}){const heads={};for(const routeId of base.routeIds){heads[routeId]=trainHead(routeId,rows,vectors,options);if(!heads[routeId].optimization.converged)throw new Error(`Unconverged fallback head: ${routeId}`);}return Object.freeze({version:'0.3-frozen-same-objective-lbfgs',vectorSize:512,routeIds:base.routeIds,hyperparameters,heads:Object.freeze(heads)});}
  G.liuyaoSemanticFallbackIdentityModelV03=Object.freeze({version:'0.3-frozen-same-objective-lbfgs',vectorSize:512,routeIds:base.routeIds,hyperparameters,trainHead,trainAll,probability:base.probability,scoreAll:base.scoreAll,negativeMultiplier:base.negativeMultiplier,deduplicateRows:base.deduplicateRows,classBalancing:base.classBalancing,confusableFamilies:base.confusableFamilies,lossMultipliers:base.lossMultipliers});
})(typeof globalThis==='object'?globalThis:this);
