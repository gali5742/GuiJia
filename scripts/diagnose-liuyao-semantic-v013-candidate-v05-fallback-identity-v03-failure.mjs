import {json,binding,write,equal,assert,exists} from './liuyao-semantic-v013-candidate-v05-route-sufficiency-data-lib.mjs';
const prefix='data/liuyao-semantic-v013-candidate-v05-fallback-identity-v03';
const output=`${prefix}-failure-diagnostic-v0.1.json`;
function diagnose() {
  // This report contains only IDs, labels and saved head probabilities, never question wording.
  const source=`${prefix}-calibration-report.json`,r=json(source);
  assert(r.status==='calibration_failed_no_feasible_global_threshold'&&r.result.selectedThreshold===null&&r.result.feasibleRegimes===0,'Expected preserved component failure');
  const known=r.rows.filter(x=>x.expectedRoute),routes=Object.keys(known[0].probabilities),rankCounts={},confusions={},rows=[];
  for(const row of known) {
    const expected=row.probabilities[row.expectedRoute];
    const other=routes.filter(x=>x!==row.expectedRoute).map(route=>({route,probability:row.probabilities[route]})).sort((a,b)=>b.probability-a.probability||a.route.localeCompare(b.route,'en'));
    const rank=1+other.filter(x=>x.probability>expected).length;
    rankCounts[rank]=(rankCounts[rank]||0)+1;
    const key=`${row.expectedRoute}->${other[0].route}`;confusions[key]=(confusions[key]||0)+1;
    rows.push({id:row.id,expectedRoute:row.expectedRoute,expectedProbability:expected,strongestOther:other[0],expectedRank:rank,uniqueCorrectThresholdInterval:expected>other[0].probability?{lowerExclusive:other[0].probability,upperInclusive:expected}:null});
  }
  const perHead=Object.fromEntries(routes.map(route=>{
    const positive=known.filter(x=>x.expectedRoute===route).map(x=>x.probabilities[route]);
    const negative=r.rows.filter(x=>x.expectedRoute!==route).map(x=>x.probabilities[route]);
    const positiveMin=Math.min(...positive),negativeMax=Math.max(...negative);
    return [route,{positiveCount:positive.length,positiveMin,positiveMax:Math.max(...positive),negativeMax,allRawCalibrationSeparable:positiveMin>negativeMax}];
  }));
  const safety=m=>m.known.acceptedAccuracy!==null&&m.known.acceptedAccuracy>=.98&&m.nonRoute.falseActivation<=.05&&Object.values(m.bySubtype).every(x=>x.falseActivation!==null&&x.falseActivation<=.05)&&Object.values(m.byRoleSafetyGroup).every(x=>x.falseActivation!==null&&x.falseActivation<=.05);
  return {version:'0.13-candidate-v0.5-fallback-identity-v0.3-failure-diagnostic-v0.1',status:'immutable_read_only_diagnosis_of_preserved_probabilities',bindings:[source,`${prefix}-model.lock.json`,`${prefix}-data.lock.json`].map(binding),knownRows:66,rankCounts,perRowCorrectlyRanked:rows.filter(x=>x.expectedRank===1).length,maximumGlobalExactKnown:Math.max(...r.result.regimes.map(x=>x.known.correct)),maximumGlobalExactKnownUnderPrecisionAndSafety:Math.max(0,...r.result.regimes.filter(safety).map(x=>x.known.correct)),separableHeads:Object.values(perHead).filter(x=>x.allRawCalibrationSeparable).length,confusionPairs:confusions,perHead,rows,interpretation:{rankingErrors:'9/66 known rows lack any threshold interval for unique correct admission',globalThresholdCoordination:'57/66 rank correctly but at most 38/66 intervals overlap under one threshold',perHeadOverlap:'19/22 heads have raw positive/negative score overlap',trainingConvergence:'not established by saved artifacts; no training loss or optimizer sweep was performed',perRouteThresholds:'forbidden; descriptive ranges are not calibration parameters'},permittedNextRevision:{architecture:'retain22_independent_logistic_heads_one_global_threshold',proposal:'version training schedule/regularization and negative loss weighting; use fresh augmentation and fresh raw calibration; no experiment on old calibration',gates:'retain all v0.3 numeric feasibility gates'},governance:{encoderInvocations:0,newHeadScoring:false,questionWordingRead:false,trainingOrCalibrationRowsCreated:false,thresholdSelected:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,postHocRepair:false},nextAction:'new_candidate_v06_design_and_fallback_v04_contract_before_fresh_data_seal_and_encoder_scoring'};
}
const report=diagnose();
if(exists(output))assert(equal(json(output),report),'Immutable diagnosis drift');
else {assert(!process.argv.includes('--verify'),'Diagnosis missing');write(output,report);}
console.log(JSON.stringify({rankCounts:report.rankCounts,maximumGlobalExactKnown:report.maximumGlobalExactKnown,separableHeads:report.separableHeads,encoderInvocations:0}));
