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
const gitBlobSha=(relative)=>{const b=read(relative);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const reportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-assembly-audit-v0.1.json';
const modelModulePath='js/liuyao-semantic-fallback-identity-model-v01.js';
const augmentationPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-training-augmentation.json';
const expansionPath='data/liuyao-semantic-route-training-v0.4-expansion.json';
const patchPath='data/liuyao-semantic-route-training-v0.4-expansion-label-patch.json';
const historicalDataPaths=[
  'data/liuyao-semantic-route-training-v0.1.json',
  'data/liuyao-semantic-route-training-v0.2-augmentation.json',
  'data/liuyao-semantic-route-training-v0.3-targeted.json',
  expansionPath,
  'data/liuyao-semantic-route-training-v0.5-targeted-22.json'
];

const protectedTrainingExclusions=[
  'data/liuyao-semantic-fallback-identity-v0.1-training.json',
  'data/liuyao-semantic-fallback-identity-v0.1-calibration.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json',
  'data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json',
  'all Router validation splits',
  'all independent evaluation',
  'all sealed blind evaluation',
  'all development evaluation/failure rows'
];

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number,Float32Array,Float64Array};
context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(read(modelModulePath).toString('utf8'),context,{filename:modelModulePath});
const identityModel=context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(identityModel?.deduplicateRows&&identityModel?.normalizeText,'Fallback Identity model assembly helpers unavailable');
const routeIds=[...identityModel.routeIds];
const routeSet=new Set(routeIds);
assert(routeIds.length===22,'Fallback Identity route count drift');
assert(identityModel.hyperparameters.epochs===360&&identityModel.hyperparameters.learningRate===0.42&&identityModel.hyperparameters.l2===0.0015,'Fallback Identity algorithm hyperparameter drift');

const expansionPatch=readJson(patchPath);
assert(expansionPatch.base==='liuyao-semantic-route-training-v0.4-expansion.json','expansion patch base drift');
assert(expansionPatch.purpose?.includes('Correct the semantic label'),'expansion patch no longer declares label-correction semantics');
const expansion=readJson(expansionPath);
const expansionHardNegatives=expansion.hardNegatives?.train||[];
const expansionHardNegativeTexts=new Map();
for(const raw of expansionHardNegatives){
  const text=typeof raw==='string'?raw:String(raw?.text||'').trim();
  assert(text, 'empty expansion hard negative');
  expansionHardNegativeTexts.set(text,(expansionHardNegativeTexts.get(text)||0)+1);
}
const patchTrainEntries=Object.entries(expansionPatch.train||{});
const patchMissingFromExpansion=[];
const patchDuplicateExpansionTargets=[];
const patchUnknownRoutes=[];
for(const [text,routeId] of patchTrainEntries){
  const count=expansionHardNegativeTexts.get(text)||0;
  if(count===0)patchMissingFromExpansion.push({text,routeId});
  if(count>1)patchDuplicateExpansionTargets.push({text,routeId,count});
  if(!routeSet.has(routeId))patchUnknownRoutes.push({text,routeId});
}
assert(patchMissingFromExpansion.length===0,`label patch contains train text absent from expansion hard negatives: ${JSON.stringify(patchMissingFromExpansion)}`);
assert(patchDuplicateExpansionTargets.length===0,`label patch maps non-unique expansion hard-negative text: ${JSON.stringify(patchDuplicateExpansionTargets)}`);
assert(patchUnknownRoutes.length===0,`label patch contains unknown route: ${JSON.stringify(patchUnknownRoutes)}`);

const assembled=[];
const sourceRawCounts={};
const subtypeRawCounts={};
const addRow=({text,expectedRoute=null,source,subtype,originId=null})=>{
  const cleanText=String(text||'').trim();
  assert(cleanText,`empty training text from ${source}`);
  const route=expectedRoute===null||expectedRoute===undefined||expectedRoute==='__other__'?null:expectedRoute;
  assert(route===null||routeSet.has(route),`unknown training route ${expectedRoute} from ${source}`);
  assembled.push({text:cleanText,expectedRoute:route,source,subtype,originId});
  sourceRawCounts[source]=(sourceRawCounts[source]||0)+1;
  subtypeRawCounts[subtype]=(subtypeRawCounts[subtype]||0)+1;
};

for(const relative of historicalDataPaths){
  const source=readJson(relative);
  for(const routeId of routeIds){
    for(const text of source.routes?.[routeId]?.train||[]){
      addRow({text,expectedRoute:routeId,source:relative,subtype:'historical_route_train'});
    }
  }
  for(const sample of source.hardNegatives?.train||[]){
    const text=typeof sample==='string'?sample:sample?.text;
    let expectedRoute=typeof sample==='object'&&sample?sample.expectedRoute||null:null;
    if(!expectedRoute&&relative===expansionPath)expectedRoute=expansionPatch.train?.[String(text||'').trim()]||null;
    addRow({
      text,
      expectedRoute:routeSet.has(expectedRoute)?expectedRoute:null,
      source:relative,
      subtype:routeSet.has(expectedRoute)?'historical_contrastive_known':'historical_genuine_nonroute'
    });
  }
}

const augmentation=readJson(augmentationPath);
assert(augmentation.status==='sealed_training_augmentation'&&augmentation.sealed===true,'Fallback Identity v0.2 training augmentation not sealed');
assert(augmentation.policy?.useForFallbackIdentityTraining===true&&augmentation.policy?.useForThresholdCalibration===false,'training augmentation role drift');
assert(augmentation.policy?.encoderScoringObserved===false,'training augmentation was scored before seal');
assert(augmentation.policy?.independentEvaluationRead===false&&augmentation.policy?.sealedBlindEvaluationRead===false,'protected evaluation leakage declared in training augmentation');
assert(augmentation.rows?.length===198,`training augmentation rows ${augmentation.rows?.length} !=198`);
for(const row of augmentation.rows){
  const route=routeSet.has(row.expectedRoute)?row.expectedRoute:null;
  if(row.identityLabel==='route_identity_positive')assert(route,`positive augmentation row lacks current22 route: ${row.id}`);
  else assert(!route,`non-positive augmentation row carries current22 route: ${row.id}/${row.identityLabel}/${row.expectedRoute}`);
  addRow({text:row.text,expectedRoute:route,source:augmentationPath,subtype:row.subtype|| (route?'fresh_known':'fresh_nonroute'),originId:row.id||null});
}

// Audit normalized text conflicts before dedup so same-text/different-label cannot be hidden.
const byNormalized=new Map();
const conflicts=[];
const sameLabelDuplicates=[];
for(const row of assembled){
  const normalized=identityModel.normalizeText(row.text);
  const existing=byNormalized.get(normalized);
  if(existing){
    if(existing.expectedRoute!==row.expectedRoute)conflicts.push({normalized,first:{text:existing.text,expectedRoute:existing.expectedRoute,source:existing.source},second:{text:row.text,expectedRoute:row.expectedRoute,source:row.source}});
    else sameLabelDuplicates.push({normalized,expectedRoute:row.expectedRoute,firstSource:existing.source,duplicateSource:row.source});
  }else byNormalized.set(normalized,row);
}
assert(conflicts.length===0,`normalized-text label conflicts (${conflicts.length}): ${JSON.stringify(conflicts.slice(0,20))}`);
const deduped=[...identityModel.deduplicateRows(assembled)];
assert(deduped.length===byNormalized.size,'dedup result does not match normalized unique count');

const known=deduped.filter((row)=>row.expectedRoute);
const nonRoute=deduped.filter((row)=>!row.expectedRoute);
assert(known.length>0&&nonRoute.length>0,'training assembly lacks known or nonroute rows');
const byRoute={};
for(const routeId of routeIds){
  const n=known.filter((row)=>row.expectedRoute===routeId).length;
  assert(n>0,`training assembly has no positive rows for ${routeId}`);
  byRoute[routeId]=n;
}
const bySubtype={};
for(const subtype of [...new Set(deduped.map((row)=>row.subtype))].sort())bySubtype[subtype]=deduped.filter((row)=>row.subtype===subtype).length;
const bySource={};
for(const source of [...new Set(deduped.map((row)=>row.source))].sort()){
  const subset=deduped.filter((row)=>row.source===source);
  bySource[source]={total:subset.length,known:subset.filter((row)=>row.expectedRoute).length,nonRoute:subset.filter((row)=>!row.expectedRoute).length};
}

const report={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-training-assembly-audit-v0.1',
  status:'pass_encoder_free_training_assembly_audit',
  scope:'liuyao_semantic_fallback_identity_v0.2_training_manifest_preparation',
  policy:{encoderUsed:false,modelProbabilityUsed:false,thresholdSelected:false,calibrationRead:false,v04CalibrationUsedForTraining:false,routeExposureSupplementUsedForTraining:false,legacyFallbackV01FreshTrainingUsed:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV03FailureRowsRead:false},
  algorithmReuse:{modulePath:modelModulePath,moduleSha256:sha256(modelModulePath),routeCount:routeIds.length,hyperparameters:identityModel.hyperparameters,classBalancing:identityModel.classBalancing,weightRegularization:identityModel.weightRegularization,biasRegularized:identityModel.biasRegularized},
  inputs:{
    historicalData:historicalDataPaths.map((relative)=>({path:relative,sha256:sha256(relative),gitBlobSha:gitBlobSha(relative)})),
    expansionLabelPatch:{path:patchPath,sha256:sha256(patchPath),gitBlobSha:gitBlobSha(patchPath),semantics:'override_labels_for_matching_v04_expansion_hard_negative_train_texts_not_additive_rows',trainMappings:patchTrainEntries.length,allTrainMappingsMatchExactlyOneExpansionHardNegative:true},
    freshTrainingAugmentation:{path:augmentationPath,sha256:sha256(augmentationPath),gitBlobSha:gitBlobSha(augmentationPath),rows:augmentation.rows.length},
    excludedFromTraining:protectedTrainingExclusions
  },
  rawAssembly:{rows:assembled.length,bySource:sourceRawCounts,bySubtype:subtypeRawCounts},
  normalizationAudit:{conflictingLabels:conflicts.length,sameLabelDuplicateOccurrences:sameLabelDuplicates.length,uniqueNormalizedTexts:byNormalized.size,deduplicatedRows:deduped.length,removedSameLabelDuplicates:assembled.length-deduped.length},
  finalTrainingManifest:{rows:deduped.length,known:known.length,nonRoute:nonRoute.length,byRoute,bySubtype,bySource},
  checks:{patchIsOverrideNotAdditive:true,all22RoutesHavePositives:true,knownAndNonRoutePresent:true,normalizedLabelConflictsZero:true,augmentationSealedForTrainingOnly:true,calibrationExcluded:true,encoderFree:true},
  nextAction:'freeze_fallback_identity_v02_training_and_calibration_contract_with_exact_input_hashes_and_final_manifest_counts_before_first_training_encoder_pass'
};
writeJson(reportPath,report);
console.log('Fallback Identity v0.2 encoder-free training assembly audit PASS.');
console.log(JSON.stringify({rawRows:report.rawAssembly.rows,dedupedRows:report.finalTrainingManifest.rows,known:report.finalTrainingManifest.known,nonRoute:report.finalTrainingManifest.nonRoute,patchMappings:report.inputs.expansionLabelPatch.trainMappings,duplicatesRemoved:report.normalizationAudit.removedSameLabelDuplicates,byRoute:report.finalTrainingManifest.byRoute},null,2));
