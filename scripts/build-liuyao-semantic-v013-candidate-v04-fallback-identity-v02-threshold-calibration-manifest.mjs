import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const writeJson=(relative,value)=>fs.writeFileSync(path.join(root,relative),`${JSON.stringify(value,null,2)}\n`,'utf8');
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const modelModulePath='js/liuyao-semantic-fallback-identity-model-v01.js';
const assemblyReportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-assembly-audit-v0.1.json';
const baseDataPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json';
const baseReportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4-reachability-audit-v0.1.json';
const supplementDataPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json';
const supplementReportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-reachability-v0.1.json';
const augmentationPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json';
const expansionPath='data/liuyao-semantic-route-training-v0.4-expansion.json';
const patchPath='data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json';
const historicalDataPaths=['data/liuyao-semantic-route-training-v0.1.json','data/liuyao-semantic-route-training-v0.2-augmentation.json','data/liuyao-semantic-route-training-v0.3-targeted.json',expansionPath,'data/liuyao-semantic-route-training-v0.5-targeted-22.json'];
const outputPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-threshold-calibration-manifest-v0.1.json';

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number,Float32Array,Float64Array};context.window=context;context.globalThis=context;vm.createContext(context);vm.runInContext(read(modelModulePath).toString('utf8'),context,{filename:modelModulePath});
const identityModel=context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(identityModel?.normalizeText&&identityModel?.deduplicateRows,'identity model assembly helpers unavailable');
const routeIds=[...identityModel.routeIds];const routeSet=new Set(routeIds);

const assemblyReport=readJson(assemblyReportPath);
assert(assemblyReport.status==='pass_encoder_free_training_assembly_audit','training assembly audit not passed');
assert(assemblyReport.finalTrainingManifest?.rows===1016&&assemblyReport.finalTrainingManifest?.known===805&&assemblyReport.finalTrainingManifest?.nonRoute===211,'training manifest count drift');
const baseData=readJson(baseDataPath);const baseReport=readJson(baseReportPath);const supplementData=readJson(supplementDataPath);const supplementReport=readJson(supplementReportPath);
assert(baseData.sealed===true&&supplementData.sealed===true,'calibration inputs not sealed');
assert(baseReport.execution?.encoderCalls===704&&baseReport.summary?.calibrationKnownReachingFallback===101&&baseReport.summary?.calibrationNonRouteReachingFallback===15,'base reachability report drift');
assert(supplementReport.execution?.encoderCalls===120&&supplementReport.summary?.supplementKnownReachingFallback===9&&supplementReport.pass===true,'supplement reachability report drift');

const byId=(rows)=>new Map(rows.map((row)=>[row.id,row]));
const baseRows=byId(baseData.rows||[]);const supplementRows=byId(supplementData.rows||[]);
const selected=[];
const addSelected=(result,source,sourceRows)=>{
  if(result.reachesFallback!==true)return;
  const row=sourceRows.get(result.id);assert(row,`reachability result missing sealed source row: ${result.id}`);
  const expectedRoute=routeSet.has(row.expectedRoute)?row.expectedRoute:null;
  if(row.identityLabel==='route_identity_positive')assert(expectedRoute,`selected known row lacks route ${row.id}`);else assert(!expectedRoute,`selected nonroute row carries current22 route ${row.id}`);
  selected.push({id:row.id,text:row.text,expectedRoute,expectedDisposition:expectedRoute?'route_known':'non_route',subtype:row.subtype,source});
};
for(const result of baseReport.results||[])addSelected(result,'calibration_v0.4',baseRows);
for(const result of supplementReport.results||[])addSelected(result,'route_exposure_supplement_v0.1',supplementRows);
assert(selected.length===125,`threshold calibration selected rows ${selected.length} !=125`);
const known=selected.filter((row)=>row.expectedRoute);const nonRoute=selected.filter((row)=>!row.expectedRoute);
assert(known.length===110&&nonRoute.length===15,`threshold calibration composition ${known.length} known/${nonRoute.length} nonroute !=110/15`);
const byRoute={};for(const routeId of routeIds){const n=known.filter((row)=>row.expectedRoute===routeId).length;assert(n>=1,`threshold calibration has no known row for ${routeId}`);byRoute[routeId]=n;}
const byNonRouteSubtype={};for(const subtype of ['near_domain_not_current_route','route_unresolved','outside_current_22'])byNonRouteSubtype[subtype]=nonRoute.filter((row)=>row.subtype===subtype).length;
assert(byNonRouteSubtype.near_domain_not_current_route===9&&byNonRouteSubtype.route_unresolved===6&&byNonRouteSubtype.outside_current_22===0,`nonroute subtype composition drift: ${JSON.stringify(byNonRouteSubtype)}`);

// Reassemble training corpus exactly as frozen assembly audit and prove no calibration-training text overlap.
const patch=readJson(patchPath);const assembled=[];
const addTrain=(text,expectedRoute=null)=>{const clean=String(text||'').trim();assert(clean,'empty training text');const route=routeSet.has(expectedRoute)?expectedRoute:null;assembled.push({text:clean,expectedRoute:route});};
for(const relative of historicalDataPaths){const source=readJson(relative);for(const routeId of routeIds)for(const text of source.routes?.[routeId]?.train||[])addTrain(text,routeId);for(const sample of source.hardNegatives?.train||[]){const text=typeof sample==='string'?sample:sample?.text;let expectedRoute=typeof sample==='object'&&sample?sample.expectedRoute||null:null;if(!expectedRoute&&relative===expansionPath)expectedRoute=patch.train?.[String(text||'').trim()]||null;addTrain(text,expectedRoute);}}
for(const row of readJson(augmentationPath).rows||[])addTrain(row.text,row.identityLabel==='route_identity_positive'?row.expectedRoute:null);
const trainingRows=[...identityModel.deduplicateRows(assembled)];assert(trainingRows.length===1016,'reassembled training manifest count drift');
const trainingTexts=new Set(trainingRows.map((row)=>identityModel.normalizeText(row.text)));const calibrationTexts=new Set();
const overlaps=[];const duplicates=[];
for(const row of selected){const normalized=identityModel.normalizeText(row.text);if(trainingTexts.has(normalized))overlaps.push({id:row.id,text:row.text,source:row.source});if(calibrationTexts.has(normalized))duplicates.push({id:row.id,text:row.text});calibrationTexts.add(normalized);}
assert(overlaps.length===0,`threshold calibration overlaps training (${overlaps.length}): ${JSON.stringify(overlaps.slice(0,20))}`);
assert(duplicates.length===0,`threshold calibration duplicate normalized texts (${duplicates.length}): ${JSON.stringify(duplicates.slice(0,20))}`);

const manifest={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-threshold-calibration-manifest-v0.1',
  status:'locked_membership_before_fallback_identity_v02_training',
  scope:'liuyao_semantic_fallback_identity_v0.2_global_threshold_calibration',
  derivation:'reachesFallback=true membership from immutable post-seal upstream reachability reports; no Fallback Identity weights or probabilities existed during membership selection',
  policy:{fallbackIdentityWeightsTrainedAtMembershipFreeze:false,fallbackIdentityProbabilitiesUsedForMembership:false,fallbackThresholdSelected:false,routerTopKUsedForMembership:false,upstreamProbabilityValuesCopied:false,calibrationMayTrainWeights:false,baseOrSupplementTextEdited:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV03FailureRowsRead:false},
  immutableInputs:{trainingAssemblyReport:{path:assemblyReportPath,gitBlobSha:'9a910b6f6097a346d25c879f994960bde868979f'},baseCalibration:{path:baseDataPath,sha256:sha256(baseDataPath)},baseReachabilityReport:{path:baseReportPath,gitBlobSha:'f270dbcb50335f178bf594161c0f190eb0fa438a'},supplement:{path:supplementDataPath,sha256:sha256(supplementDataPath)},supplementReachabilityReport:{path:supplementReportPath,gitBlobSha:'66adacddfc7c42f39de875cacf150dedd026e522'}},
  composition:{total:selected.length,known:known.length,nonRoute:nonRoute.length,byRoute,byNonRouteSubtype},
  statisticalCaveat:{overallNonRouteN:15,maximumFalseActivationRateTarget:0.05,oneFalseActivationRate:1/15,implication:'overall <=0.05 requires zero false route activations on these 15 conditional non-route rows',outsideCurrent22FallbackN:0,outsideCurrent22ThresholdBehavior:'not_estimable_at_fallback_stage_from_this_calibration; must remain a fresh-development promotion gate'},
  isolation:{trainingRows:trainingRows.length,normalizedTrainingOverlap:overlaps.length,normalizedCalibrationDuplicates:duplicates.length},
  rows:selected,
  nextAction:'freeze_training_and_threshold_calibration_contract_then_train_and_lock_v02_weights_before_any_probability_scoring_on_these_rows'
};
writeJson(outputPath,manifest);
console.log('Fallback Identity v0.2 threshold-calibration membership frozen before model training.');
console.log(JSON.stringify({composition:manifest.composition,statisticalCaveat:manifest.statisticalCaveat,isolation:manifest.isolation},null,2));
