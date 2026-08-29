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

const normalize = (value)=>String(value||'').trim().replace(/\s+/g,'');
const semanticArbitration = (question) => {
  const text=normalize(question);
  if(!text) return null;

  // Money direction: modern participant/fund-flow semantics only.
  if (/(?:欠我的|欠我|应收款|催款|讨债|追债|货款[^，。？！?]{0,8}欠着我|借给[^，。？！?]{0,8}的钱[^，。？！?]{0,8}(?:收回|追回|要回))/.test(text)) return {routeId:'debt_collection',evidence:'creditor-direction'};
  if (/(?:我|本人)[^，。？！?]{0,8}(?:欠|还|偿还|清偿)[^，。？！?]{0,10}(?:贷款|房贷|欠款|债务|钱)|(?:房贷|贷款|欠款|债务)[^，。？！?]{0,10}(?:还清|还完|结清|偿还))/.test(text)) return {routeId:'debt_repayment',evidence:'debtor-direction'};
  if (/(?:向我借|找我借|从我这里借|我[^，。？！?]{0,10}(?:借给|贷给|出借)|借出去)/.test(text)) return {routeId:'lend_money',evidence:'funds-outward'};
  if (/(?:我|本人)[^，。？！?]{0,8}(?:向|找|跟|从)[^，。？！?]{0,10}(?:借|周转)|(?:我|本人)[^，。？！?]{0,8}(?:申请|办)[^，。？！?]{0,6}(?:贷款|房贷|信贷)|(?:贷款|房贷|信贷)[^，。？！?]{0,10}(?:申请|获批|批下来))/.test(text)) return {routeId:'borrow_money',evidence:'funds-inward'};

  // Relationship semantics: existing marriage > marriage target > romance development.
  if (/(?:妻子|老婆|丈夫|老公|夫妻|已婚|婚后)/.test(text)) return {routeId:'marital_relationship',evidence:'existing-marriage'};
  if (/(?:结婚|婚事|亲事|领证|婚约|成为夫妻|结为夫妻|结婚计划)/.test(text)) return {routeId:'marriage_match',evidence:'marriage-target'};
  if (/(?:恋人|情侣|恋爱|表白|暧昧|在一起|恋爱方面|女朋友|男朋友)/.test(text)) return {routeId:'relationship_development',evidence:'romantic-development'};

  // Investment semantics before ordinary purchase semantics.
  const investment=/(?:股票|基金|ETF|etf|债券|期货|外汇|投资项目|投资机会|投资标的|仓位|持仓)/.test(text);
  if (investment) {
    if (/(?:继续持有|继续拿|加仓|减仓|持有[^，。？！?]{0,10}还是[^，。？！?]{0,10}卖|该不该减仓|要不要减仓|要不要继续留|犹豫[^，。？！?]{0,8}退出)/.test(text)) return {routeId:'investment_position_decision',evidence:'position-choice'};
    if (/(?:赎回|清仓|套现|变现|全部卖掉|全部卖出|退出投资|投资退出|卖掉套现|卖出套现)/.test(text)) return {routeId:'investment_liquidation',evidence:'liquidation-action'};
    if (/(?:走势|净值|价格[^，。？！?]{0,8}(?:涨|跌)|会不会涨|会不会跌|继续涨|继续跌|偏涨|偏跌|偏强|偏弱)/.test(text)) return {routeId:'investment_price_trend',evidence:'price-trend'};
    if (/(?:适不适合|合不合适|值不值得投资|要不要投资|是否要投|参与[^，。？！?]{0,8}合适|进场[^，。？！?]{0,8}合适)/.test(text)) return {routeId:'investment_suitability',evidence:'investment-suitability'};
    if (/(?:盈利|利润|收益|赚钱|回本)/.test(text)) return {routeId:'investment_profit',evidence:'investment-profit'};
  }

  // Income semantics.
  if (/(?:年终奖|奖金|绩效奖|项目奖励|季度奖励|奖励金)/.test(text)) return {routeId:'income_bonus',evidence:'bonus-income'};
  if (/(?:工资|薪水|薪资|月薪|调薪|加薪|涨薪|基本工资|固定薪酬)/.test(text)) return {routeId:'income_salary',evidence:'salary-income'};

  // Delivery before purchase.
  if (/(?:快递|包裹|发货|寄出|寄来|运输途中|送达|送到|到手|收到)/.test(text) && /(?:订单|商品|键盘|耳机|相机|显示器|平板|镜头|包裹|快递|发货|寄出|运输)/.test(text)) return {routeId:'receive_item',evidence:'delivery-event'};

  // Commercial event semantics.
  if (/(?:进货|补货|补库存|采购库存|经营用货[^，。？！?]{0,8}进库)/.test(text)) return {routeId:'inventory_purchase',evidence:'inventory-in'};
  if (/(?:库存|存货|尾货)[^，。？！?]{0,12}(?:卖|出货|出清|清掉|没清|压着)|(?:清库存|清仓库)/.test(text)) return {routeId:'inventory_sale',evidence:'inventory-out'};
  if (/(?:合伙|合伙人|共同经营|一起经营|搭档[^，。？！?]{0,8}经营)/.test(text)) return {routeId:'partnership',evidence:'partnership'};
  if (/(?:这笔批发|这单商业|商业订单|商业交易|批发生意|批发单|采购合同)[^，。？！?]{0,18}(?:成交|签|做成|谈成|落地)|(?:客户|买家|供应商)[^，。？！?]{0,16}(?:订单|交易|成交)/.test(text)) return {routeId:'commercial_transaction',evidence:'bounded-commercial-trade'};
  if (/(?:经营|门店|网店|工作室|开的[^，。？！?]{0,5}店|这家[^，。？！?]{0,5}店|长期生意)[^，。？！?]{0,16}(?:盈利|利润|亏|赚钱|收益|经营状况|稳定)/.test(text)) return {routeId:'business_operation',evidence:'business-operation'};
  if (/(?:财运|总体财务|整体财务|综合进账|总体钱财|整体收支|手头[^，。？！?]{0,8}(?:紧|宽裕|充裕))/.test(text)) return {routeId:'financial_fortune',evidence:'overall-finance'};

  // Ordinary item purchase is last, after investment/delivery guards.
  if (/(?:买|入手|换)[^，。？！?]{0,8}(?:投影仪|空气净化器|耳机|路由器|显示器|相机|平板|手机|电脑|键盘|镜头)|(?:投影仪|空气净化器|耳机|路由器|显示器|相机|平板|手机|电脑|键盘|镜头)[^，。？！?]{0,10}(?:值得买|该不该买|好不好|合不合适|入手)/.test(text)) return {routeId:'item_purchase',evidence:'ordinary-purchase'};
  return null;
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
  const rows=await enrichRows(await flattenSplit('validation'),{onProgress,label:'validation'});
  for(const row of rows){
    row.globalProbability=globalProbability(row.features);
    row.arbitration=semanticArbitration(row.text);
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
  semanticArbitration
});
