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

const contractPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-route-exposure-supplement-reachability-contract-v0.1.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.lock.json';
const reportPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-reachability-v0.1.json';
const actModelPath='data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.json';
const actLockPath='data/liuyao-semantic-v013-candidate-v04-semantic-act-v01-model.lock.json';
const routeabilityPath='data/liuyao-semantic-routeability-v0.2-execution-v0.1.json';
const routeabilityThresholdPath='data/liuyao-semantic-routeability-v0.3-execution-v0.1.json';
const executionContractPath='data/liuyao-semantic-embedding-execution-contract-v0.1.json';

const contract=readJson(contractPath);
const lock=readJson(lockPath);
const supplement=readJson(lock.supplementPath);
const schema=readJson(lock.schemaPath);
const actModel=readJson(actModelPath);
const actLock=readJson(actLockPath);
const routeabilityModel=readJson(routeabilityPath);
const routeabilityThresholdArtifact=readJson(routeabilityThresholdPath);
const executionContract=readJson(executionContractPath);

assert(contract.status==='locked_before_first_postseal_supplement_encoder_audit','supplement reachability contract not frozen');
assert(lock.status==='locked'&&lock.oneShotSupplement===true&&lock.secondSamplingRoundAllowed===false,'supplement lock drift');
assert(sha256(lock.supplementPath)===contract.sealedSupplement.sha256,'sealed supplement SHA drift');
assert(sha256(lock.schemaPath)===contract.sealedSupplement.schemaSha256,'sealed supplement schema SHA drift');
assert(supplement.status==='sealed_route_exposure_supplement'&&supplement.sealed===true&&supplement.sealedBeforeFirstPostsealSupplementEncoderAudit===true,'supplement not sealed before encoder audit');
assert(lock.encoderScoringBeforeSeal===false&&lock.fallbackIdentityTrainingPerformed===false&&lock.fallbackIdentityProbabilityUsed===false&&lock.fallbackThresholdSelected===false,'preseal model boundary drift');
assert(supplement.rows?.length===120&&lock.supplementRows===120,'supplement row count drift');
assert(JSON.stringify(lock.routes)===JSON.stringify(contract.sealedSupplement.routes),'supplement route set drift');
assert(sha256(contract.immutableBaseEvidence.calibrationV04Path)===contract.immutableBaseEvidence.calibrationV04Sha256,'immutable v0.4 base calibration drift');
assert(contract.immutableBaseEvidence.readRowLevelResultsInThisAudit===false,'v0.4 row-level result read policy drift');
assert(schema.oneShotPolicy?.secondSamplingRoundAllowed===false,'schema one-shot policy drift');
assert(sha256(actModelPath)===contract.semanticAct.modelSha256,'Semantic Act model SHA drift');
assert(sha256(actLockPath)===contract.semanticAct.modelLockSha256,'Semantic Act lock SHA drift');
assert(actLock.threshold===contract.semanticAct.threshold,'Semantic Act threshold drift');
assert(sha256(routeabilityPath)===contract.routeability.baseModelSha256,'Routeability base SHA drift');
assert(sha256(routeabilityThresholdPath)===contract.routeability.thresholdArtifactSha256,'Routeability threshold artifact SHA drift');
assert(routeabilityThresholdArtifact.calibration?.threshold===contract.routeability.threshold,'Routeability threshold drift');
assert(sha256(executionContractPath)===contract.encoder.executionContractSha256,'embedding execution contract SHA drift');
assert(executionContract.canonicalExecution?.textsPerEncoderCall===1,'single-text execution contract missing');
assert(actModel.model?.weights?.length===512&&Number.isFinite(actModel.model.bias),'Semantic Act model invalid');
assert(routeabilityModel.model?.weights?.length===512&&Number.isFinite(routeabilityModel.model.bias),'Routeability model invalid');

const context={console,Date,Math,JSON,Intl,Set,Map,Array,Object,Number};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const relative of ['js/liuyao-semantic-route-evidence-v01.js','js/liuyao-semantic-route-evidence-v02.js','js/liuyao-semantic-route-evidence-v03.js','js/liuyao-semantic-route-arbitration-v011.js','js/liuyao-semantic-route-arbitration-v012.js'])vm.runInContext(read(relative).toString('utf8'),context,{filename:relative});
const evidenceExtractor=context.GuiJia?.liuyaoSemanticRouteEvidenceV03;
const arbitration=context.GuiJia?.liuyaoSemanticRouteArbitrationV012;
assert(evidenceExtractor?.extract&&arbitration?.arbitrate,'deterministic path modules failed to load');

const dot=(weights,vector)=>{let total=0;for(let i=0;i<weights.length;i+=1)total+=weights[i]*vector[i];return total;};
const sigmoid=(x)=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
env.allowLocalModels=false;env.useBrowserCache=false;
const encoder=await pipeline('feature-extraction',contract.encoder.modelId,{dtype:contract.encoder.dtype,revision:contract.encoder.revision});
const tensorToVector=(tensor)=>{const hidden=tensor?.dims?.[tensor.dims.length-1];assert(hidden===contract.encoder.vectorSize,`embedding size ${hidden} != ${contract.encoder.vectorSize}`);const vector=new Float32Array(hidden);for(let i=0;i<hidden;i+=1)vector[i]=Number(tensor.data[i]);return vector;};
let encoderCalls=0;
const embedOne=async(text,index,total)=>{const normalized=String(text||'').trim();assert(normalized,'empty supplement audit text');const output=await encoder([normalized],{pooling:contract.encoder.pooling,normalize:contract.encoder.normalize});encoderCalls+=1;if((index+1)%20===0||index===total-1)console.log(`single-text supplement reachability embedded ${index+1}/${total}`);return tensorToVector(output);};

const results=[];
for(let index=0;index<supplement.rows.length;index+=1){
  const row=supplement.rows[index];
  const vector=await embedOne(row.text,index,supplement.rows.length);
  const evidence=evidenceExtractor.extract(row.text);
  const arb=arbitration.arbitrate(row.text,evidence);
  const semanticActProbability=sigmoid(dot(actModel.model.weights,vector)+actModel.model.bias);
  const semanticActEligible=semanticActProbability>=contract.semanticAct.threshold;
  const routeabilityProbability=sigmoid(dot(routeabilityModel.model.weights,vector)+routeabilityModel.model.bias);
  const routeabilityAccepted=routeabilityProbability>=contract.routeability.threshold;
  const unsupportedTargets=[...(evidence.unsupportedTargets||[])];
  const reachesFallback=semanticActEligible&&unsupportedTargets.length===0&&!arb?.routeId&&routeabilityAccepted;
  results.push({id:row.id,expectedRoute:row.expectedRoute,semanticAct:{probability:semanticActProbability,threshold:contract.semanticAct.threshold,eligible:semanticActEligible},unsupportedTargets,arbitration:arb?{routeId:arb.routeId,strength:arb.strength,rationale:arb.rationale??null}:null,routeability:{probability:routeabilityProbability,threshold:contract.routeability.threshold,accepted:routeabilityAccepted},reachesFallback});
}
assert(encoderCalls===contract.encoder.expectedEncoderCalls&&encoderCalls===supplement.rows.length,`encoder calls ${encoderCalls} != expected ${contract.encoder.expectedEncoderCalls}`);

const knownRetention=ratio(results.filter((row)=>row.semanticAct.eligible).length,results.length);
const byRoute={};
for(const routeId of contract.sealedSupplement.routes){const subset=results.filter((row)=>row.expectedRoute===routeId);byRoute[routeId]={n:subset.length,semanticActEligible:subset.filter((row)=>row.semanticAct.eligible).length,arbitrationNull:subset.filter((row)=>!row.arbitration).length,routeabilityAccepted:subset.filter((row)=>row.routeability.accepted).length,reachesFallback:subset.filter((row)=>row.reachesFallback).length};}
const checks={supplementKnownSemanticActRetention:knownRetention>=contract.frozenChecks.minimumSupplementKnownSemanticActRetention,everySupplementRouteFallbackExposure:Object.values(byRoute).every((row)=>row.n===40&&row.reachesFallback>=1)};
const pass=Object.values(checks).every(Boolean);
const report={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-route-exposure-supplement-reachability-v0.1',
  status:pass?'pass_locked_sealed_one_shot_supplement_reachability':'fail_locked_sealed_one_shot_supplement_reachability',
  scope:contract.scope,
  immutableInputs:{auditContract:{path:contractPath,sha256:sha256(contractPath)},supplementLock:{path:lockPath,sha256:sha256(lockPath)},supplement:{path:lock.supplementPath,sha256:sha256(lock.supplementPath)},schema:{path:lock.schemaPath,sha256:sha256(lock.schemaPath)},baseCalibrationV04:{path:contract.immutableBaseEvidence.calibrationV04Path,sha256:sha256(contract.immutableBaseEvidence.calibrationV04Path)},semanticActModel:{path:actModelPath,sha256:sha256(actModelPath),threshold:contract.semanticAct.threshold},routeabilityBase:{path:routeabilityPath,sha256:sha256(routeabilityPath)},routeabilityThresholdArtifact:{path:routeabilityThresholdPath,sha256:sha256(routeabilityThresholdPath),threshold:contract.routeability.threshold},executionContract:{path:executionContractPath,sha256:sha256(executionContractPath)}},
  policy:{auditOnly:true,oneShotSupplement:true,secondSamplingRoundAllowed:false,fallbackIdentityWeightsTrained:false,fallbackIdentityProbabilitiesScored:false,fallbackThresholdSelected:false,routerLoaded:false,routerTopKRead:false,scopeHardVetoUsedForReachability:false,v04ReachabilityRowResultsRead:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV03FailureRowsRead:false,corpusMutationAllowed:false},
  execution:{canonicalTextsPerEncoderCall:1,encoderCalls,rowsScored:supplement.rows.length},
  frozenChecks:contract.frozenChecks,
  summary:{supplementKnown:results.length,supplementKnownSemanticActRetention:knownRetention,supplementKnownReachingFallback:results.filter((row)=>row.reachesFallback).length},
  byRoute,checks,pass,
  nextAction:pass?'freeze_composite_v05_reachability_decision_then_fallback_identity_v02_training_calibration_contract':'audit_routeability_representation_and_semantic_boundary_for_remaining_zero_exposure_routes_without_second_sampling_round',
  results
};
writeJson(reportPath,report);
console.log('One-shot Fallback route-exposure supplement post-seal reachability audit complete.');
console.log(JSON.stringify({summary:report.summary,byRoute,checks,pass},null,2));
if(!pass)process.exitCode=2;
