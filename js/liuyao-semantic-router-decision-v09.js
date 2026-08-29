import { semanticRouterPocV081 as router } from './liuyao-semantic-router-poc-v081.js?v=poc0.8.1';

const DATA_URL = new URL('../data/liuyao-semantic-router-decision-v0.9-development.json', import.meta.url);
const VERSION = '0.9-dev';
let data = null;
let trained = false;
let globalGate = null;
let lowThreshold = 0.5;
let highThreshold = 0.75;
const predictionCache = new Map();

const fetchJson = async (url) => {
  const response = await fetch(url, { cache:'no-cache' });
  if (!response.ok) throw new Error(`无法读取 ${url.pathname}: HTTP ${response.status}`);
  return response.json();
};
const sigmoid = (x) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
const mean = (xs) => xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0;
const safeRatio = (n,d) => d ? n/d : NaN;
const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
const arbitrationApi = () => globalThis.GuiJia?.liuyaoSemanticRouteArbitrationV09;

const ensureData = async () => {
  if (!data) {
    data = await fetchJson(DATA_URL);
    if (data.version !== '0.9-dev-routeability-0.1' || data.status !== 'development') throw new Error('Router Decision v0.9 development data mismatch');
    if (data.policy?.reuseSealedCandidateEvalV01 !== false) throw new Error('v0.9 must not reuse sealed Candidate Eval v0.1');
  }
  return data;
};

const flattenSplit = async (split) => {
  await ensureData();
  const rows = [];
  let index = 1;
  for (const [routeId,spec] of Object.entries(data.routes || {})) {
    for (const row of spec[split] || []) rows.push({
      id:`V09-${split}-${String(index++).padStart(3,'0')}`,
      text:row.text,
      kind:'known',
      routeable:true,
      expectedRoute:routeId,
      form:row.form || 'question'
    });
  }
  for (const text of data.rejection?.[split]?.out_of_scope || []) rows.push({
    id:`V09-${split}-${String(index++).padStart(3,'0')}`,
    text, kind:'out_of_scope', routeable:false, expectedRoute:'__other__', form:'reject'
  });
  for (const text of data.rejection?.[split]?.underspecified || []) rows.push({
    id:`V09-${split}-${String(index++).padStart(3,'0')}`,
    text, kind:'underspecified', routeable:false, expectedRoute:'__unresolved__', form:'reject'
  });
  return rows;
};

const predict = async (text) => {
  if (predictionCache.has(text)) return predictionCache.get(text);
  const value = await router.classify(text);
  predictionCache.set(text,value);
  return value;
};

const normalizedEntropy = (scores) => {
  const rows = scores || [];
  if (rows.length < 2) return 0;
  let h = 0;
  for (const row of rows) {
    const p = Math.max(1e-12, Number(row.score) || 0);
    h -= p * Math.log(p);
  }
  return h / Math.log(rows.length);
};
const rawFeatures = (prediction) => {
  const t1 = Number(prediction.top1?.score) || 0;
  const t2 = Number(prediction.top2?.score) || 0;
  const margin = Number(prediction.routeMargin) || 0;
  const gateScore = Number(prediction.gate?.score) || 0;
  const gateThreshold = Number(prediction.gate?.threshold) || 0;
  const gateGap = gateScore - gateThreshold;
  const entropy = normalizedEntropy(prediction.scores);
  const ratio = t2 > 1e-9 ? t1 / t2 : t1 * 100;
  return [t1,t2,margin,gateScore,gateGap,entropy,ratio];
};
const fitScaler = (matrix) => {
  const width = matrix[0]?.length || 0;
  const means = Array.from({length:width},(_,j)=>mean(matrix.map(row=>row[j])));
  const stds = Array.from({length:width},(_,j)=>{
    const variance = mean(matrix.map(row=>(row[j]-means[j])**2));
    return Math.max(1e-6,Math.sqrt(variance));
  });
  return { means,stds };
};
const scaleFeatures = (features, scaler) => features.map((v,j)=>(v-scaler.means[j])/scaler.stds[j]);

const trainLogistic = (rows, { epochs=900, learningRate=0.08, l2=0.008 } = {}) => {
  const matrix = rows.map(row=>row.features);
  const scaler = fitScaler(matrix);
  const x = matrix.map(row=>scaleFeatures(row,scaler));
  const weights = new Float64Array(x[0].length);
  let bias = 0;
  for (let epoch=0; epoch<epochs; epoch+=1) {
    const grad = new Float64Array(weights.length);
    let gradBias = 0;
    for (let i=0;i<rows.length;i+=1) {
      let z=bias;
      for (let j=0;j<weights.length;j+=1) z += weights[j]*x[i][j];
      const p=sigmoid(z);
      const error=p-(rows[i].routeable?1:0);
      gradBias += error;
      for (let j=0;j<weights.length;j+=1) grad[j]+=error*x[i][j];
    }
    const lr=learningRate/(1+epoch*0.004);
    const scale=1/rows.length;
    for (let j=0;j<weights.length;j+=1) weights[j]-=lr*(grad[j]*scale+l2*weights[j]);
    bias-=lr*gradBias*scale;
  }
  return { weights,bias,scaler };
};
const globalProbability = (features) => {
  if (!globalGate) throw new Error('Global Routeability Gate 尚未训练');
  const x=scaleFeatures(features,globalGate.scaler);
  let z=globalGate.bias;
  for (let j=0;j<globalGate.weights.length;j+=1) z+=globalGate.weights[j]*x[j];
  return sigmoid(z);
};

const routeabilityStats = (rows, threshold) => {
  const pos=rows.filter(r=>r.routeable), neg=rows.filter(r=>!r.routeable);
  const tpr=safeRatio(pos.filter(r=>r.globalProbability>=threshold).length,pos.length);
  const tnr=safeRatio(neg.filter(r=>r.globalProbability<threshold).length,neg.length);
  return { tpr,tnr,balanced:(tpr+tnr)/2 };
};
const calibrateLowThreshold = (rows) => {
  const candidates=[...new Set([0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,...rows.map(r=>r.globalProbability)])].sort((a,b)=>a-b);
  let best={threshold:0.5,balanced:-1,tnr:-1};
  for(const threshold of candidates){
    const s=routeabilityStats(rows,threshold);
    if(s.balanced>best.balanced+1e-12 || (Math.abs(s.balanced-best.balanced)<=1e-12 && s.tnr>best.tnr)) best={threshold,...s};
  }
  return best;
};

const decisionA = (row) => {
  const p=row.prediction;
  const accepted=Boolean(p.gate?.accepted);
  return { accepted, routeId:accepted?p.gate.predicted:'__rejected__', reason:'v0.8.1-local-gate' };
};
const decisionB = (row) => {
  const accepted=row.globalProbability>=lowThreshold;
  return { accepted, routeId:accepted?row.prediction.top1.id:'__rejected__', reason:'global-routeability' };
};
const decisionCWith = (row, high) => {
  const p=row.globalProbability;
  const accepted=p>=high || (p>=lowThreshold && Boolean(row.prediction.gate?.accepted));
  return { accepted, routeId:accepted?row.prediction.top1.id:'__rejected__', reason:p>=high?'global-high-confidence':(accepted?'global-borderline-local-confirmed':'routeability-rejected') };
};

const strategyStats = (rows, strategyId, decide) => {
  const evaluated=rows.map(row=>{
    const decision=decide(row);
    const correct=row.kind==='known' ? (decision.accepted && decision.routeId===row.expectedRoute) : !decision.accepted;
    return {...row,decision,correct,strategyId};
  });
  const known=evaluated.filter(r=>r.kind==='known');
  const out=evaluated.filter(r=>r.kind==='out_of_scope');
  const under=evaluated.filter(r=>r.kind==='underspecified');
  const acceptedKnown=known.filter(r=>r.decision.accepted);
  return {
    id:strategyId,
    exact:safeRatio(evaluated.filter(r=>r.correct).length,evaluated.length),
    knownExact:safeRatio(known.filter(r=>r.correct).length,known.length),
    knownCoverage:safeRatio(acceptedKnown.length,known.length),
    acceptedKnownAccuracy:safeRatio(acceptedKnown.filter(r=>r.decision.routeId===r.expectedRoute).length,acceptedKnown.length),
    outOfScopeRejection:safeRatio(out.filter(r=>!r.decision.accepted).length,out.length),
    underspecifiedRejection:safeRatio(under.filter(r=>!r.decision.accepted).length,under.length),
    falseActivation:safeRatio(evaluated.filter(r=>r.kind!=='known'&&r.decision.accepted).length,out.length+under.length),
    rows:evaluated
  };
};

const calibrateHighThreshold = (rows) => {
  const candidates=[...new Set([lowThreshold,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,...rows.map(r=>r.globalProbability).filter(p=>p>=lowThreshold)])].sort((a,b)=>a-b);
  let best={threshold:Math.max(lowThreshold,0.75),score:-1,falseActivation:Infinity};
  for(const high of candidates){
    const stats=strategyStats(rows,'C-cal',row=>decisionCWith(row,high));
    const score=mean([stats.knownExact,stats.outOfScopeRejection,stats.underspecifiedRejection]);
    if(score>best.score+1e-12 || (Math.abs(score-best.score)<=1e-12 && stats.falseActivation<best.falseActivation)) best={threshold:high,score,falseActivation:stats.falseActivation};
  }
  return best;
};

const enrichRows = async (rows,{onProgress,label='predict'}={}) => {
  const output=[];
  for(let i=0;i<rows.length;i+=1){
    const row=rows[i];
    const prediction=await predict(row.text);
    output.push({...row,prediction,features:rawFeatures(prediction)});
    onProgress?.(i+1,rows.length,`${label} ${i+1}/${rows.length}`);
    if((i+1)%8===0) await new Promise(resolve=>setTimeout(resolve,0));
  }
  return output;
};

const trainDecisionLayer = async ({onProgress}={}) => {
  if(!trained) throw new Error('请先训练冻结 v0.8.1');
  const trainRows=await enrichRows(await flattenSplit('train'),{onProgress,label:'train-features'});
  globalGate=trainLogistic(trainRows);
  const calibrationRows=await enrichRows(await flattenSplit('calibration'),{onProgress,label:'calibration'});
  for(const row of calibrationRows) row.globalProbability=globalProbability(row.features);
  const low=calibrateLowThreshold(calibrationRows);
  lowThreshold=clamp(low.threshold,0.05,0.95);
  const high=calibrateHighThreshold(calibrationRows);
  highThreshold=clamp(Math.max(lowThreshold,high.threshold),lowThreshold,0.99);
  return { lowThreshold,highThreshold,routeabilityCalibration:low,borderlineCalibration:high,trainCount:trainRows.length,calibrationCount:calibrationRows.length };
};

const runValidation = async ({onProgress}={}) => {
  if(!globalGate) throw new Error('请先训练并校准 v0.9 Decision Layer');
  const arb=arbitrationApi();
  if(!arb?.arbitrate || arb.version!=='0.9-dev') throw new Error('Semantic Route Arbitration v0.9 未加载');
  const rows=await enrichRows(await flattenSplit('validation'),{onProgress,label:'validation'});
  for(const row of rows){
    row.globalProbability=globalProbability(row.features);
    row.arbitration=arb.arbitrate(row.text);
  }
  const A=strategyStats(rows,'A-v0.8.1-local',decisionA);
  const B=strategyStats(rows,'B-global-top1',decisionB);
  const C=strategyStats(rows,'C-global-local-borderline',row=>decisionCWith(row,highThreshold));
  const D=strategyStats(rows,'D-C-plus-semantic-arbitration',row=>{
    if(row.arbitration) return {accepted:true,routeId:row.arbitration.routeId,reason:`semantic:${row.arbitration.evidence}`};
    return decisionCWith(row,highThreshold);
  });
  const arbitrationRows=D.rows.filter(r=>r.arbitration);
  return {
    version:VERSION,
    thresholds:{lowThreshold,highThreshold},
    strategies:[A,B,C,D].map(({rows:_,...summary})=>summary),
    validationRows:rows,
    detail:{A:A.rows,B:B.rows,C:C.rows,D:D.rows},
    arbitration:{
      count:arbitrationRows.length,
      correct:arbitrationRows.filter(r=>r.correct).length,
      overrides:arbitrationRows.filter(r=>r.arbitration?.routeId!==r.prediction.top1?.id).length
    }
  };
};

export const semanticRouterDecisionV09 = Object.freeze({
  version:VERSION,
  loadModel:(progress)=>router.loadModel(progress),
  trainRouter:async(options)=>{const result=await router.train(options);trained=true;return result;},
  trainDecisionLayer,
  runValidation,
  flattenSplit,
  semanticArbitration:(text)=>arbitrationApi()?.arbitrate(text)||null
});
