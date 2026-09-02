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
const ratio=(n,d)=>d?n/d:0;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v03-reachability-audit-contract-v0.1.json';
const calibrationLockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.lock.json';
const reportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3-reachability-audit-v0.1.json';
const actModelPath='data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.json';
const actLockPath='data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json';
const routeabilityPath='data/liuyao-semantic-routeability-v0.2-execution-v0.1.json';
const routeabilityThresholdPath='data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const executionContractPath='data/liuyao-semantic-embedding-execution-contract-v0.1.json';

const contract=readJson(contractPath);
const calibrationLock=readJson(calibrationLockPath);
const calibration=readJson(calibrationLock.calibrationPath);
const schema=readJson(calibrationLock.schemaPath);
const actModel=readJson(actModelPath);
const actLock=readJson(actLockPath);
const routeabilityModel=readJson(routeabilityPath);
const routeabilityThresholdArtifact=readJson(routeabilityThresholdPath);
const executionContract=readJson(executionContractPath);

assert(contract.status==='locked_before_first_postseal_calibration_v03_encoder_audit','calibration v0.3 reachability contract not frozen');
assert(calibrationLock.status==='locked','calibration v0.3 lock missing');
assert(sha256(calibrationLockPath)===sha256(contract.sealedCalibration.lockPath),'calibration lock path drift');
assert(sha256(calibrationLock.calibrationPath)===contract.sealedCalibration.sha256,'sealed calibration SHA drift');
assert(sha256(calibrationLock.schemaPath)===contract.sealedCalibration.schemaSha256,'sealed schema SHA drift');
assert(calibration.status==='sealed_fallback_stage_calibration'&&calibration.sealed===true,'calibration v0.3 not sealed');
assert(calibration.sealedBeforeFirstPostsealReachabilityScoring===true,'calibration was not sealed before postseal audit');
assert(calibrationLock.encoderScoringBeforeSeal===false,'encoder scoring occurred before seal');
assert(calibrationLock.fallbackIdentityTrainingPerformed===false&&calibrationLock.fallbackThresholdSelected===false,'Fallback training/threshold already occurred');
assert(sha256(contract.carriedTraining.path)===contract.carriedTraining.sha256,'carried training drift');
assert(schema.postSealReachabilityAudit?.minimumKnownSemanticActRetention===contract.frozenChecks.minimumCalibrationKnownSemanticActRetention,'known retention gate drift');
assert(schema.postSealReachabilityAudit?.minimumNearDomainNonRouteReachingFallback===contract.frozenChecks.minimumCalibrationNearDomainNonRouteReachingFallback,'near-domain gate drift');
assert(schema.postSealReachabilityAudit?.minimumTotalNonRouteReachingFallback===contract.frozenChecks.minimumCalibrationTotalNonRouteReachingFallback,'total non-route gate drift');
assert(sha256(actModelPath)===contract.semanticAct.modelSha256,'Semantic Act model SHA drift');
assert(sha256(actLockPath)===contract.semanticAct.modelLockSha256,'Semantic Act lock SHA drift');
assert(actLock.threshold===contract.semanticAct.threshold,'Semantic Act threshold drift');
assert(sha256(routeabilityPath)===contract.routeability.baseModelSha256,'Routeability base SHA drift');
assert(sha256(routeabilityThresholdPath)===contract.routeability.thresholdArtifactSha256,'Routeability threshold artifact SHA drift');
assert(routeabilityThresholdArtifact.calibration?.threshold===contract.routeability.threshold,'Routeability threshold drift');
assert(sha256(executionContractPath)===contract.encoder.executionContractSha256,'embedding execution contract SHA drift');
assert(executionContract.canonicalExecution?.textsPerEncoderCall===1,'single-text execution contract missing');
assert(calibration.rows?.length===contract.sealedCalibration.rows,'calibration row count drift');
assert(actModel.model?.weights?.length===512&&Number.isFinite(actModel.model.bias),'Semantic Act model invalid');
assert(routeabilityModel.model?.weights?.length===512&&Number.isFinite(routeabilityModel.model.bias),'Routeability model invalid');

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of [
  'js/liuyao-semantic-route-evidence-v01.js',
  'js/liuyao-semantic-route-evidence-v02.js',
  'js/liuyao-semantic-route-evidence-v03.js',
  'js/liuyao-semantic-route-arbitration-v011.js',
  'js/liuyao-semantic-route-arbitration-v012.js'
]) vm.runInContext(read(relative).toString('utf8'),context,{filename:relative});
const evidenceExtractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceExtractor?.extract&&arbitration?.arbitrate,'deterministic path modules failed to load');

const dot=(weights,vector)=>{let total=0;for(let i=0;i<weights.length;i+=1)total+=weights[i]*vector[i];return total;};
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));

env.allowLocalModels=false;
env.useBrowserCache=false;
const encoder=await pipeline('feature-extraction',contract.encoder.modelId,{dtype:contract.encoder.dtype,revision:contract.encoder.revision});
const tensorToVector=(tensor)=>{
  const hidden=tensor?.dims?.[tensor.dims.length-1];
  assert(hidden===contract.encoder.vectorSize,`embedding size ${hidden} != ${contract.encoder.vectorSize}`);
  const vector=new Float32Array(hidden);
  for(let i=0;i<hidden;i+=1)vector[i]=Number(tensor.data[i]);
  return vector;
};
let encoderCalls=0;
const embedOne=async(text,index,total)=>{
  const normalized=String(text||'').trim();
  assert(normalized,'empty calibration v0.3 reachability text');
  const output=await encoder([normalized],{pooling:contract.encoder.pooling,normalize:contract.encoder.normalize});
  encoderCalls+=1;
  if((index+1)%25===0||index===total-1)console.log(`single-text calibration-v0.3 reachability embedded ${index+1}/${total}`);
  return tensorToVector(output);
};

const results=[];
for(let index=0;index<calibration.rows.length;index+=1){
  const row=calibration.rows[index];
  const vector=await embedOne(row.text,index,calibration.rows.length);
  const evidence=evidenceExtractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const semanticActProbability=sigmoid(dot(actModel.model.weights,vector)+actModel.model.bias);
  const semanticActEligible=semanticActProbability>=contract.semanticAct.threshold;
  const routeabilityProbability=sigmoid(dot(routeabilityModel.model.weights,vector)+routeabilityModel.model.bias);
  const routeabilityAccepted=routeabilityProbability>=contract.routeability.threshold;
  const unsupportedTargets=[...(evidence.unsupportedTargets||[])];
  const reachesFallback=semanticActEligible&&unsupportedTargets.length===0&&!arb?.routeId&&routeabilityAccepted;
  results.push({
    id:row.id,
    identityLabel:row.identityLabel,
    expectedRoute:row.expectedRoute??null,
    subtype:row.subtype,
    semanticAct:{probability:semanticActProbability,threshold:contract.semanticAct.threshold,eligible:semanticActEligible},
    unsupportedTargets,
    arbitration:arb?{routeId:arb.routeId,strength:arb.strength,rationale:arb.rationale??null}:null,
    routeability:{probability:routeabilityProbability,threshold:contract.routeability.threshold,accepted:routeabilityAccepted},
    reachesFallback
  });
}
assert(encoderCalls===contract.encoder.expectedEncoderCalls,`encoder calls ${encoderCalls} != expected ${contract.encoder.expectedEncoderCalls}`);
assert(encoderCalls===calibration.rows.length,`encoder calls ${encoderCalls} != rows ${calibration.rows.length}`);

const known=results.filter((row)=>row.identityLabel==='route_identity_positive');
const nonRoute=results.filter((row)=>row.identityLabel==='non_route');
const knownSemanticActRetention=ratio(known.filter((row)=>row.semanticAct.eligible).length,known.length);
const byRoute={};
for(const routeId of [...new Set(known.map((row)=>row.expectedRoute))].sort()){
  const subset=known.filter((row)=>row.expectedRoute===routeId);
  byRoute[routeId]={
    n:subset.length,
    semanticActEligible:subset.filter((row)=>row.semanticAct.eligible).length,
    arbitrationNull:subset.filter((row)=>!row.arbitration).length,
    routeabilityAccepted:subset.filter((row)=>row.routeability.accepted).length,
    reachesFallback:subset.filter((row)=>row.reachesFallback).length
  };
}
const byNonRouteSubtype={};
for(const subtype of [...new Set(nonRoute.map((row)=>row.subtype))].sort()){
  const subset=nonRoute.filter((row)=>row.subtype===subtype);
  byNonRouteSubtype[subtype]={
    n:subset.length,
    semanticActEligible:subset.filter((row)=>row.semanticAct.eligible).length,
    arbitrationNull:subset.filter((row)=>!row.arbitration).length,
    routeabilityAccepted:subset.filter((row)=>row.routeability.accepted).length,
    reachesFallback:subset.filter((row)=>row.reachesFallback).length
  };
}
const knownReachingFallback=known.filter((row)=>row.reachesFallback).length;
const nonRouteReachingFallback=nonRoute.filter((row)=>row.reachesFallback).length;
const nearDomainReachingFallback=byNonRouteSubtype.near_domain_not_current_route?.reachesFallback??0;
const checks={
  calibrationKnownSemanticActRetention:knownSemanticActRetention>=contract.frozenChecks.minimumCalibrationKnownSemanticActRetention,
  everyRouteCalibrationFallbackExposure:Object.values(byRoute).length===22&&Object.values(byRoute).every((row)=>row.reachesFallback>=1),
  calibrationNearDomainFallbackExposure:nearDomainReachingFallback>=contract.frozenChecks.minimumCalibrationNearDomainNonRouteReachingFallback,
  calibrationTotalNonRouteFallbackExposure:nonRouteReachingFallback>=contract.frozenChecks.minimumCalibrationTotalNonRouteReachingFallback
};
const pass=Object.values(checks).every(Boolean);

const report={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.3-reachability-audit-v0.1',
  status:pass?'pass_locked_sealed_calibration_v03_reachability':'fail_locked_sealed_calibration_v03_reachability',
  scope:contract.scope,
  immutableInputs:{
    auditContract:{path:contractPath,sha256:sha256(contractPath)},
    calibrationLock:{path:calibrationLockPath,sha256:sha256(calibrationLockPath)},
    calibration:{path:calibrationLock.calibrationPath,sha256:sha256(calibrationLock.calibrationPath)},
    schema:{path:calibrationLock.schemaPath,sha256:sha256(calibrationLock.schemaPath)},
    carriedTraining:{path:contract.carriedTraining.path,sha256:sha256(contract.carriedTraining.path),usedInThisAudit:false},
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
    routerLoaded:false,
    routerTopKRead:false,
    scopeHardVetoUsedForReachability:false,
    oldReachabilityRowResultsRead:false,
    independentEvaluationRead:false,
    sealedBlindEvaluationRead:false,
    candidateV03FailureRowsRead:false,
    newThemeResearchRead:false,
    corpusMutationAllowed:false
  },
  execution:{canonicalTextsPerEncoderCall:1,encoderCalls,rowsScored:calibration.rows.length},
  frozenChecks:contract.frozenChecks,
  summary:{
    calibrationKnown:known.length,
    calibrationNonRoute:nonRoute.length,
    calibrationKnownSemanticActRetention:knownSemanticActRetention,
    calibrationKnownReachingFallback:knownReachingFallback,
    calibrationNonRouteReachingFallback:nonRouteReachingFallback,
    nearDomainReachingFallback
  },
  byRoute,
  byNonRouteSubtype,
  checks,
  pass,
  nextAction:pass
    ?'freeze_fallback_identity_v02_training_and_calibration_contract_before_any_identity_training_or_probability_scoring'
    :'freeze_this_calibration_v03_failure_and_create_new_versioned_stage_specific_calibration_without_mutating_current_sealed_data',
  results
};
writeJson(reportPath,report);
console.log('Candidate v0.4 Fallback Identity v0.2 calibration v0.3 post-seal reachability audit complete.');
console.log(JSON.stringify({summary:report.summary,checks,pass},null,2));
if(!pass)process.exitCode=2;
