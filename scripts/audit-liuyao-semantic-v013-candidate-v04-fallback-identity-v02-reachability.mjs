import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pipeline, env } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const ratio = (n,d) => d ? n/d : 0;
const assert = (condition,message) => { if(!condition) throw new Error(message); };

const contractPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-reachability-audit-contract-v0.1.json';
const dataLockPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data.lock.json';
const reportPath = 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-reachability-audit-v0.1.json';
const actModelPath = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.json';
const actLockPath = 'data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json';
const routeabilityPath = 'data/liuyao-semantic-routeability-v0.2-execution-v0.1.json';
const routeabilityThresholdPath = 'data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const executionContractPath = 'data/liuyao-semantic-embedding-execution-contract-v0.1.json';
const frozenPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';

const contract = readJson(contractPath);
const dataLock = readJson(dataLockPath);
const training = readJson(dataLock.trainingPath);
const calibration = readJson(dataLock.calibrationPath);
const actModel = readJson(actModelPath);
const actLock = readJson(actLockPath);
const routeabilityModel = readJson(routeabilityPath);
const routeabilityThresholdArtifact = readJson(routeabilityThresholdPath);
const executionContract = readJson(executionContractPath);
const frozen = readJson(frozenPath);

assert(contract.status === 'locked_before_first_postseal_fallback_data_encoder_audit', 'reachability audit contract not frozen');
assert(dataLock.status === 'locked', 'Fallback v0.2 data not locked');
assert(sha256(dataLock.trainingPath) === contract.sealedData.trainingSha256, 'sealed training SHA drift');
assert(sha256(dataLock.calibrationPath) === contract.sealedData.calibrationSha256, 'sealed calibration SHA drift');
assert(sha256(dataLock.schemaPath) === contract.sealedData.schemaSha256, 'sealed schema SHA drift');
assert(training.sealed === true && training.sealedBeforeFirstEncoderScoring === true, 'training not sealed before audit');
assert(calibration.sealed === true && calibration.sealedBeforeFirstEncoderScoring === true, 'calibration not sealed before audit');
assert(dataLock.encoderScoringBeforeSeal === false && dataLock.fallbackThresholdSelectionBeforeSeal === false, 'preseal scoring boundary drift');
assert(sha256(actModelPath) === contract.semanticAct.modelSha256, 'Semantic Act model SHA drift');
assert(sha256(actLockPath) === contract.semanticAct.modelLockSha256, 'Semantic Act lock SHA drift');
assert(actLock.threshold === contract.semanticAct.threshold, 'Semantic Act threshold drift');
assert(sha256(routeabilityPath) === contract.routeability.baseModelSha256, 'Routeability base SHA drift');
assert(sha256(routeabilityThresholdPath) === contract.routeability.thresholdArtifactSha256, 'Routeability threshold artifact SHA drift');
assert(routeabilityThresholdArtifact.calibration?.threshold === contract.routeability.threshold, 'Routeability threshold drift');
assert(sha256(executionContractPath) === contract.encoder.executionContractSha256, 'embedding execution contract SHA drift');
assert(executionContract.canonicalExecution?.textsPerEncoderCall === 1, 'single-text execution contract missing');
assert(frozen.status === 'frozen' && frozen.correction?.canonicalTextsPerEncoderCall === 1, 'corrected frozen dependencies missing');
assert(actModel.model?.weights?.length === 512 && Number.isFinite(actModel.model.bias), 'Semantic Act model invalid');
assert(routeabilityModel.model?.weights?.length === 512 && Number.isFinite(routeabilityModel.model.bias), 'Routeability model invalid');

const context = { console, Date, Math, JSON, Intl, Set, Map, Array, Object, Number };
context.window=context; context.globalThis=context; vm.createContext(context);
for (const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(read(relative).toString('utf8'),context,{filename:relative});
const evidenceExtractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceExtractor?.extract && arbitration?.arbitrate,'deterministic path modules failed to load');

const dot=(weights,vector)=>{ let total=0; for(let i=0;i<weights.length;i+=1) total+=weights[i]*vector[i]; return total; };
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));

env.allowLocalModels=false;
env.useBrowserCache=false;
const extractor=await pipeline('feature-extraction', contract.encoder.modelId, {
  dtype:contract.encoder.dtype,
  revision:contract.encoder.revision
});
const tensorToVector=(tensor)=>{
  const hidden=tensor?.dims?.[tensor.dims.length-1];
  assert(hidden===contract.encoder.vectorSize,`embedding size ${hidden} != ${contract.encoder.vectorSize}`);
  const vector=new Float32Array(hidden);
  for(let i=0;i<hidden;i+=1) vector[i]=Number(tensor.data[i]);
  return vector;
};
let encoderCalls=0;
const embedOne=async(text,index,total)=>{
  const normalized=String(text||'').trim();
  assert(normalized,'empty reachability audit text');
  const output=await extractor([normalized],{pooling:contract.encoder.pooling,normalize:contract.encoder.normalize});
  encoderCalls += 1;
  if ((index+1)%25===0 || index===total-1) console.log(`single-text reachability embedded ${index+1}/${total}`);
  return tensorToVector(output);
};

const sourceRows=[
  ...training.rows.map((row)=>({...row,corpus:'training'})),
  ...calibration.rows.map((row)=>({...row,corpus:'calibration'}))
];
const results=[];
for(let index=0;index<sourceRows.length;index+=1){
  const row=sourceRows[index];
  const vector=await embedOne(row.text,index,sourceRows.length);
  const evidence=evidenceExtractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const semanticActProbability=sigmoid(dot(actModel.model.weights,vector)+actModel.model.bias);
  const semanticActEligible=semanticActProbability>=contract.semanticAct.threshold;
  const routeabilityProbability=sigmoid(dot(routeabilityModel.model.weights,vector)+routeabilityModel.model.bias);
  const routeabilityAccepted=routeabilityProbability>=contract.routeability.threshold;
  const unsupportedTargets=[...(evidence.unsupportedTargets||[])];
  const reachesFallback = semanticActEligible && unsupportedTargets.length===0 && !arb?.routeId && routeabilityAccepted;
  results.push({
    id:row.id,
    corpus:row.corpus,
    identityLabel:row.identityLabel,
    expectedRoute:row.expectedRoute??null,
    subtype:row.subtype,
    text:row.text,
    deterministicPath:row.deterministicPath??null,
    semanticAct:{probability:semanticActProbability,threshold:contract.semanticAct.threshold,eligible:semanticActEligible},
    unsupportedTargets,
    arbitration:arb?{routeId:arb.routeId,strength:arb.strength,reasonCode:arb.reasonCode}:null,
    routeability:{probability:routeabilityProbability,threshold:contract.routeability.threshold,accepted:routeabilityAccepted},
    reachesFallback
  });
}
assert(encoderCalls===sourceRows.length,`encoder calls ${encoderCalls} != rows ${sourceRows.length}`);

const trainingKnown=results.filter((row)=>row.corpus==='training'&&row.identityLabel==='route_identity_positive');
const calibrationKnown=results.filter((row)=>row.corpus==='calibration'&&row.identityLabel==='route_identity_positive');
const calibrationNonRoute=results.filter((row)=>row.corpus==='calibration'&&row.identityLabel==='non_route');
const trainingKnownSemanticActRetention=ratio(trainingKnown.filter((row)=>row.semanticAct.eligible).length,trainingKnown.length);
const calibrationKnownSemanticActRetention=ratio(calibrationKnown.filter((row)=>row.semanticAct.eligible).length,calibrationKnown.length);
const byRoute={};
for(const routeId of [...new Set(calibrationKnown.map((row)=>row.expectedRoute))].sort()){
  const subset=calibrationKnown.filter((row)=>row.expectedRoute===routeId);
  byRoute[routeId]={
    n:subset.length,
    semanticActEligible:subset.filter((row)=>row.semanticAct.eligible).length,
    arbitrationNull:subset.filter((row)=>!row.arbitration).length,
    routeabilityAccepted:subset.filter((row)=>row.routeability.accepted).length,
    reachesFallback:subset.filter((row)=>row.reachesFallback).length
  };
}
const byNonRouteSubtype={};
for(const subtype of [...new Set(calibrationNonRoute.map((row)=>row.subtype))].sort()){
  const subset=calibrationNonRoute.filter((row)=>row.subtype===subtype);
  byNonRouteSubtype[subtype]={
    n:subset.length,
    semanticActEligible:subset.filter((row)=>row.semanticAct.eligible).length,
    arbitrationNull:subset.filter((row)=>!row.arbitration).length,
    routeabilityAccepted:subset.filter((row)=>row.routeability.accepted).length,
    reachesFallback:subset.filter((row)=>row.reachesFallback).length
  };
}
const calibrationNonRouteReachingFallback=calibrationNonRoute.filter((row)=>row.reachesFallback).length;
const nearDomainReachingFallback=byNonRouteSubtype.near_domain_not_current_route?.reachesFallback??0;
const checks={
  trainingKnownSemanticActRetention:trainingKnownSemanticActRetention>=contract.frozenChecks.minimumTrainingKnownSemanticActRetention,
  calibrationKnownSemanticActRetention:calibrationKnownSemanticActRetention>=contract.frozenChecks.minimumCalibrationKnownSemanticActRetention,
  everyRouteCalibrationFallbackExposure:Object.values(byRoute).every((row)=>row.reachesFallback>=1),
  calibrationNearDomainFallbackExposure:nearDomainReachingFallback>=contract.frozenChecks.minimumCalibrationNearDomainNonRouteReachingFallback,
  calibrationTotalNonRouteFallbackExposure:calibrationNonRouteReachingFallback>=contract.frozenChecks.minimumCalibrationTotalNonRouteReachingFallback
};
const pass=Object.values(checks).every(Boolean);

const report={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-reachability-audit-v0.1',
  status:pass?'pass_locked_sealed_data_reachability':'fail_locked_sealed_data_reachability',
  scope:contract.scope,
  immutableInputs:{
    auditContract:{path:contractPath,sha256:sha256(contractPath)},
    dataLock:{path:dataLockPath,sha256:sha256(dataLockPath)},
    training:{path:dataLock.trainingPath,sha256:sha256(dataLock.trainingPath)},
    calibration:{path:dataLock.calibrationPath,sha256:sha256(dataLock.calibrationPath)},
    semanticActModel:{path:actModelPath,sha256:sha256(actModelPath),threshold:contract.semanticAct.threshold},
    routeabilityBase:{path:routeabilityPath,sha256:sha256(routeabilityPath)},
    routeabilityThresholdArtifact:{path:routeabilityThresholdPath,sha256:sha256(routeabilityThresholdPath),threshold:contract.routeability.threshold},
    executionContract:{path:executionContractPath,sha256:sha256(executionContractPath)}
  },
  policy:{
    auditOnly:true,
    fallbackIdentityWeightsTrained:false,
    fallbackIdentityProbabilitiesScored:false,
    fallbackThresholdSelected:false,
    routerTopKRead:false,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    candidateV03FailureRowsRead:false,
    newThemeResearchRead:false,
    corpusMutationAllowed:false
  },
  execution:{canonicalTextsPerEncoderCall:1,encoderCalls,rowsScored:sourceRows.length},
  summary:{
    trainingKnown:trainingKnown.length,
    calibrationKnown:calibrationKnown.length,
    calibrationNonRoute:calibrationNonRoute.length,
    trainingKnownSemanticActRetention,
    calibrationKnownSemanticActRetention,
    calibrationKnownReachingFallback:calibrationKnown.filter((row)=>row.reachesFallback).length,
    calibrationNonRouteReachingFallback,
    nearDomainReachingFallback
  },
  byRoute,
  byNonRouteSubtype,
  checks,
  pass,
  nextAction:pass
    ? 'freeze_fallback_identity_v02_training_and_calibration_contract_before_any_identity_training'
    : 'freeze_this_failure_and_create_new_versioned_fallback_data_corpus_without_mutating_current_sealed_data',
  results
};
writeJson(reportPath,report);
console.log('Candidate v0.4 Fallback Identity v0.2 sealed-data reachability audit complete.');
console.log(JSON.stringify({summary:report.summary,checks,pass},null,2));
if(!pass) process.exitCode=2;
