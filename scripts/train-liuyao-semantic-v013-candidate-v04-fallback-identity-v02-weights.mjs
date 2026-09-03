import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const writeJson=(relative,value)=>fs.writeFileSync(path.join(root,relative),`${JSON.stringify(value,null,2)}\n`,'utf8');
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha=(relative)=>{const b=read(relative);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');};
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const countBy=(rows,key)=>rows.reduce((acc,row)=>{const value=row[key]??'unspecified';acc[value]=(acc[value]||0)+1;return acc;},{});

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-training-calibration-contract-v0.1.json';
const contract=readJson(contractPath);
assert(contract.status==='locked_before_first_v02_training_encoder_pass','Fallback Identity v0.2 training/calibration contract is not locked');
assert(contract.weightTrainingLifecycle?.trainFromScratch===true,'Fallback Identity v0.2 must train from scratch');
assert(contract.weightTrainingLifecycle?.calibrationRowsMayBeEmbeddedDuringTraining===false,'training lifecycle unexpectedly permits calibration embedding');
assert(contract.weightTrainingLifecycle?.calibrationRowsMayBeScoredByFallbackHeadsDuringTraining===false,'training lifecycle unexpectedly permits calibration scoring');
assert(contract.weightTrainingLifecycle?.thresholdSelectionMayOccurBeforeWeightLock===false,'training lifecycle unexpectedly permits threshold selection');
assert(contract.runtimeAdmissionContract?.candidateUniverse==='all_current_22_routes'&&contract.runtimeAdmissionContract?.scoreAll22Heads===true,'all-22 Fallback runtime contract drift');

const verifySha256=(relative,expected,label)=>assert(sha256(relative)===expected,`${label} SHA256 drift: ${relative}`);
const verifyGitBlob=(relative,expected,label)=>assert(gitBlobSha(relative)===expected,`${label} git blob drift: ${relative}`);
verifyGitBlob(contract.compositeReachabilityDecision.path,contract.compositeReachabilityDecision.gitBlobSha,'composite reachability decision');
verifyGitBlob(contract.trainingAssembly.reportPath,contract.trainingAssembly.gitBlobSha,'training assembly report');
verifySha256(contract.encoder.executionContractPath,contract.encoder.executionContractSha256,'encoder execution contract');
verifySha256(contract.algorithm.modulePath,contract.algorithm.moduleSha256,'Fallback Identity algorithm module');
for(const source of contract.trainingSources.historicalTrainOnly){
  verifySha256(source.path,source.sha256,'historical training source');
  verifyGitBlob(source.path,source.gitBlobSha,'historical training source');
}
verifySha256(contract.trainingSources.expansionLabelOverride.path,contract.trainingSources.expansionLabelOverride.sha256,'expansion label override');
verifyGitBlob(contract.trainingSources.expansionLabelOverride.path,contract.trainingSources.expansionLabelOverride.gitBlobSha,'expansion label override');
verifySha256(contract.trainingSources.freshTrainingAugmentation.path,contract.trainingSources.freshTrainingAugmentation.sha256,'fresh training augmentation');
verifyGitBlob(contract.trainingSources.freshTrainingAugmentation.path,contract.trainingSources.freshTrainingAugmentation.gitBlobSha,'fresh training augmentation');

const executionContract=readJson(contract.encoder.executionContractPath);
assert(executionContract.canonicalExecution?.textsPerEncoderCall===1,'encoder execution contract no longer requires single-text calls');
assert(executionContract.encoder?.modelId===contract.encoder.modelId,'encoder model drift');
assert(executionContract.encoder?.revision===contract.encoder.revision,'encoder revision drift');
assert(executionContract.encoder?.dtype===contract.encoder.dtype,'encoder dtype drift');
assert(executionContract.encoder?.vectorSize===contract.encoder.vectorSize,'encoder vector size drift');
assert(executionContract.encoder?.pooling===contract.encoder.pooling,'encoder pooling drift');
assert(executionContract.encoder?.normalize===contract.encoder.normalize,'encoder normalize drift');
assert(contract.encoder.canonicalTextsPerEncoderCall===1&&contract.encoder.multiTextBatchForbidden===true,'training contract no longer forbids multi-text batches');
assert(contract.encoder.trainingEncoderCalls===contract.trainingAssembly.deduplicatedRows,'training encoder-call count must equal deduplicated training rows');

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number,Float32Array,Float64Array};
context.window=context;context.globalThis=context;vm.createContext(context);
vm.runInContext(read(contract.algorithm.modulePath).toString('utf8'),context,{filename:contract.algorithm.modulePath});
const identityModel=context.GuiJia?.liuyaoSemanticFallbackIdentityModelV01;
assert(identityModel?.trainAll&&identityModel?.deduplicateRows&&identityModel?.normalizeText,'Fallback Identity training module failed to load');
const routeIds=[...contract.algorithm.routeOrder];
const routeSet=new Set(routeIds);
assert(routeIds.length===22,'Fallback Identity v0.2 route count drift');
assert(JSON.stringify([...identityModel.routeIds])===JSON.stringify(routeIds),'algorithm route order drift');
assert(identityModel.hyperparameters.epochs===contract.algorithm.hyperparameters.epochs,'epochs drift');
assert(identityModel.hyperparameters.learningRate===contract.algorithm.hyperparameters.learningRate,'learning-rate drift');
assert(identityModel.hyperparameters.l2===contract.algorithm.hyperparameters.l2,'L2 drift');
assert(identityModel.classBalancing.positiveTotalWeight===contract.algorithm.classBalancing.positiveTotalWeight,'positive class balancing drift');
assert(identityModel.classBalancing.negativeTotalWeight===contract.algorithm.classBalancing.negativeTotalWeight,'negative class balancing drift');
assert(identityModel.biasRegularized===false&&identityModel.weightRegularization==='l2','regularization drift');

const historicalPaths=contract.trainingSources.historicalTrainOnly.map((item)=>item.path);
const expansionPath='data/liuyao-semantic-route-training-v0.4-expansion.json';
const patchPath=contract.trainingSources.expansionLabelOverride.path;
const augmentationPath=contract.trainingSources.freshTrainingAugmentation.path;
assert(historicalPaths.includes(expansionPath),'historical training manifest missing v0.4 expansion');
const expansionPatch=readJson(patchPath);
assert(Object.keys(expansionPatch.train||{}).length===contract.trainingSources.expansionLabelOverride.trainMappings,'expansion label override mapping count drift');

const assembled=[];
const addRow=({text,expectedRoute=null,source,subtype,originId=null})=>{
  const cleanText=String(text||'').trim();
  assert(cleanText,`empty Fallback Identity training text from ${source}`);
  const route=expectedRoute===null||expectedRoute===undefined||expectedRoute==='__other__'?null:expectedRoute;
  assert(route===null||routeSet.has(route),`unknown Fallback Identity training route ${expectedRoute} from ${source}`);
  assembled.push({text:cleanText,expectedRoute:route,source,subtype,originId});
};

for(const relative of historicalPaths){
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
assert(augmentation.status==='sealed_training_augmentation'&&augmentation.sealed===true,'Fallback Identity v0.2 training augmentation is not sealed');
assert(augmentation.policy?.useForFallbackIdentityTraining===true&&augmentation.policy?.useForThresholdCalibration===false,'training augmentation role drift');
assert(augmentation.policy?.encoderScoringObserved===false,'training augmentation declares pre-seal encoder scoring');
assert(augmentation.rows?.length===contract.trainingSources.freshTrainingAugmentation.rows,'fresh training augmentation row count drift');
for(const row of augmentation.rows){
  const route=routeSet.has(row.expectedRoute)?row.expectedRoute:null;
  if(row.identityLabel==='route_identity_positive')assert(route,`positive augmentation row lacks current22 route: ${row.id}`);
  else assert(!route,`non-positive augmentation row carries current22 route: ${row.id}`);
  addRow({text:row.text,expectedRoute:route,source:augmentationPath,subtype:row.subtype||(route?'fresh_known':'fresh_nonroute'),originId:row.id||null});
}

const trainingRows=[...identityModel.deduplicateRows(assembled)];
assert(assembled.length===contract.trainingAssembly.rawRows,`raw training rows ${assembled.length} != ${contract.trainingAssembly.rawRows}`);
assert(trainingRows.length===contract.trainingAssembly.deduplicatedRows,`deduplicated training rows ${trainingRows.length} != ${contract.trainingAssembly.deduplicatedRows}`);
const known=trainingRows.filter((row)=>row.expectedRoute);
const nonRoute=trainingRows.filter((row)=>!row.expectedRoute);
assert(known.length===contract.trainingAssembly.knownRows,`known training rows ${known.length} != ${contract.trainingAssembly.knownRows}`);
assert(nonRoute.length===contract.trainingAssembly.nonRouteRows,`non-route training rows ${nonRoute.length} != ${contract.trainingAssembly.nonRouteRows}`);
const byRoute={};
for(const routeId of routeIds){
  byRoute[routeId]=known.filter((row)=>row.expectedRoute===routeId).length;
  assert(byRoute[routeId]===contract.trainingAssembly.byRoute[routeId],`training route count drift for ${routeId}: ${byRoute[routeId]} != ${contract.trainingAssembly.byRoute[routeId]}`);
}

// Production runtime normalization is trim-only. The identity model's stronger whitespace
// normalization remains a deterministic duplicate/conflict audit rule, not an encoder-input transform.
const canonicalQuestion=(value)=>String(value||'').trim();
for(const row of trainingRows)assert(canonicalQuestion(row.text)===row.text,'training row is not trim-canonical');

const outputModelPath=contract.weightTrainingLifecycle.outputModelPath;
const outputLockPath=contract.weightTrainingLifecycle.outputModelLockPath;

env.allowLocalModels=false;
env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction',contract.encoder.modelId,{
  dtype:contract.encoder.dtype,
  revision:contract.encoder.revision
});

let encoderCalls=0;
const vectors=[];
for(let index=0;index<trainingRows.length;index+=1){
  const normalized=canonicalQuestion(trainingRows[index].text);
  // CRITICAL: one normalized question per encoder invocation. Never pass a multi-text array here.
  const output=await extractor(normalized,{pooling:contract.encoder.pooling,normalize:contract.encoder.normalize});
  encoderCalls+=1;
  const dims=output?.dims||[];
  const hidden=dims[dims.length-1];
  assert(hidden===contract.encoder.vectorSize,`embedding size ${hidden} != ${contract.encoder.vectorSize} at row ${index+1}`);
  const raw=output?.data;
  assert(raw&&raw.length>=contract.encoder.vectorSize,`embedding data missing at row ${index+1}`);
  const vector=new Float32Array(contract.encoder.vectorSize);
  for(let dimension=0;dimension<contract.encoder.vectorSize;dimension+=1)vector[dimension]=Number(raw[dimension]);
  vectors.push(vector);
  if((index+1)%25===0||index+1===trainingRows.length)console.log(`Fallback Identity v0.2 single-text embeddings ${index+1}/${trainingRows.length}`);
}
assert(encoderCalls===contract.encoder.trainingEncoderCalls,`training encoder calls ${encoderCalls} != ${contract.encoder.trainingEncoderCalls}`);
assert(vectors.length===trainingRows.length,'training vectors/rows mismatch');

const trained=identityModel.trainAll(trainingRows,vectors,contract.algorithm.hyperparameters);
assert(trained.routeIds.length===22&&Object.keys(trained.heads).length===22,'trained model does not contain exactly 22 heads');
for(const routeId of routeIds){
  const head=trained.heads[routeId];
  assert(head&&head.weights?.length===contract.encoder.vectorSize,`trained head missing/invalid: ${routeId}`);
  assert(head.positiveCount===contract.trainingAssembly.byRoute[routeId],`positive count drift in trained head ${routeId}`);
  assert(head.negativeCount===trainingRows.length-head.positiveCount,`negative count drift in trained head ${routeId}`);
}

const heads=Object.fromEntries(routeIds.map((routeId)=>{
  const head=trained.heads[routeId];
  return [routeId,{routeId,weights:Array.from(head.weights),bias:head.bias,positiveCount:head.positiveCount,negativeCount:head.negativeCount}];
}));
const trainingAssemblyReport=readJson(contract.trainingAssembly.reportPath);
assert(trainingAssemblyReport.status===contract.trainingAssembly.status,'training assembly report status drift');

const model={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-model-v0.1',
  status:contract.weightTrainingLifecycle.requiredModelStatus,
  scope:contract.scope,
  trainingContract:{path:contractPath,sha256:sha256(contractPath)},
  trainingAssembly:{path:contract.trainingAssembly.reportPath,gitBlobSha:gitBlobSha(contract.trainingAssembly.reportPath)},
  algorithm:{
    modulePath:contract.algorithm.modulePath,
    moduleSha256:sha256(contract.algorithm.modulePath),
    type:contract.algorithm.type,
    trainedFromScratch:true,
    legacyV01WeightsReused:false,
    routeOrder:routeIds,
    hyperparameters:contract.algorithm.hyperparameters,
    optimizer:contract.algorithm.optimizer,
    classBalancing:contract.algorithm.classBalancing,
    regularization:contract.algorithm.regularization
  },
  encoder:{
    executionContractPath:contract.encoder.executionContractPath,
    executionContractSha256:sha256(contract.encoder.executionContractPath),
    modelId:contract.encoder.modelId,
    revision:contract.encoder.revision,
    transformersJsVersion:contract.encoder.transformersJsVersion,
    dtype:contract.encoder.dtype,
    vectorSize:contract.encoder.vectorSize,
    pooling:contract.encoder.pooling,
    normalize:contract.encoder.normalize,
    canonicalTextsPerEncoderCall:1,
    inputNormalization:'String(text).trim()'
  },
  execution:{
    trainingRows:trainingRows.length,
    rowsEmbedded:trainingRows.length,
    encoderCalls,
    canonicalTextsPerEncoderCall:1,
    multiTextFeatureExtractionBatchUsed:false,
    representation:'production_equivalent_single_text'
  },
  training:{
    total:trainingRows.length,
    known:known.length,
    nonRoute:nonRoute.length,
    byRoute,
    bySource:countBy(trainingRows,'source'),
    bySubtype:countBy(trainingRows,'subtype')
  },
  globalThreshold:null,
  thresholdSelected:false,
  calibrationProbabilitiesScored:false,
  calibrationRowsEmbedded:false,
  calibrationRowsRead:false,
  routerLoaded:false,
  routerTopKRead:false,
  traditionalLiuYaoFeaturesUsed:false,
  heads
};
writeJson(outputModelPath,model);

const lock={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-model-lock-v0.1',
  status:contract.weightTrainingLifecycle.requiredModelStatus,
  scope:contract.scope,
  artifact:outputModelPath,
  artifactSha256:sha256(outputModelPath),
  trainingContract:{path:contractPath,sha256:sha256(contractPath)},
  trainingAssembly:{path:contract.trainingAssembly.reportPath,gitBlobSha:gitBlobSha(contract.trainingAssembly.reportPath)},
  encoderExecutionContract:{path:contract.encoder.executionContractPath,sha256:sha256(contract.encoder.executionContractPath)},
  algorithm:{path:contract.algorithm.modulePath,sha256:sha256(contract.algorithm.modulePath)},
  routeCount:routeIds.length,
  vectorSize:contract.encoder.vectorSize,
  trainingRows:trainingRows.length,
  trainingKnown:known.length,
  trainingNonRoute:nonRoute.length,
  canonicalTextsPerEncoderCall:1,
  trainingEncoderCalls:encoderCalls,
  trainFromScratch:true,
  legacyV01WeightsReused:false,
  globalThreshold:null,
  thresholdSelected:false,
  calibrationProbabilitiesScored:false,
  calibrationRowsEmbedded:false,
  calibrationRowsRead:false,
  nextAction:'run_locked_125_row_all22_global_threshold_calibration'
};
writeJson(outputLockPath,lock);

console.log('Fallback Identity v0.2 weights-only training complete.');
console.log(JSON.stringify({status:model.status,trainingRows:trainingRows.length,known:known.length,nonRoute:nonRoute.length,encoderCalls,routeCount:routeIds.length,globalThreshold:model.globalThreshold,thresholdSelected:model.thresholdSelected,calibrationProbabilitiesScored:model.calibrationProbabilitiesScored},null,2));
