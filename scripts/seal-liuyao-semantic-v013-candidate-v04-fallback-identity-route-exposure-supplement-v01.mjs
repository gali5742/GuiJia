import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative));
const readJson=(relative)=>JSON.parse(read(relative).toString('utf8'));
const writeJson=(relative,value)=>fs.writeFileSync(path.join(root,relative),`${JSON.stringify(value,null,2)}\n`,'utf8');
const sha256=(relative)=>crypto.createHash('sha256').update(read(relative)).digest('hex');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-route-exposure-supplement-schema-v0.1.json';
const supplementPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-route-exposure-supplement-v0.1.lock.json';
const schema=readJson(schemaPath);
const supplement=readJson(supplementPath);

assert(schema.status==='frozen_after_calibration_v04_aggregate_reachability_failure_before_supplement_generation','supplement schema not frozen');
assert(supplement.status==='presealed_route_exposure_supplement'&&supplement.sealed===false,'supplement not in preseal state');
assert(supplement.rows?.length===120,'supplement row count drift');
assert(supplement.policy?.oneShotSupplement===true,'one-shot policy missing');
assert(supplement.policy?.encoderScoringObserved===false,'encoder scoring observed before supplement seal');
assert(supplement.policy?.fallbackIdentityTrainingPerformed===false&&supplement.policy?.fallbackIdentityProbabilityUsed===false&&supplement.policy?.fallbackThresholdSelected===false,'Fallback model boundary violated before supplement seal');
assert(supplement.policy?.v04CalibrationTextReadForGeneration===false&&supplement.policy?.v04ReachabilityRowResultsRead===false,'v0.4 base leakage into supplement generation');
assert(supplement.policy?.independentEvaluationRead===false&&supplement.policy?.sealedBlindEvaluationRead===false&&supplement.policy?.candidateV03FailureRowsRead===false,'protected evaluation leakage before supplement seal');

supplement.status='sealed_route_exposure_supplement';
supplement.sealed=true;
supplement.sealedBeforeFirstPostsealSupplementEncoderAudit=true;
writeJson(supplementPath,supplement);

const lock={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-route-exposure-supplement-v0.1-lock-v0.1',
  status:'locked',
  scope:'liuyao_semantic_fallback_identity_v0.2_one_shot_route_exposure_supplement',
  supplementPath,
  supplementSha256:sha256(supplementPath),
  schemaPath,
  schemaSha256:sha256(schemaPath),
  immutableBaseCalibrationPath:schema.immutableBase.calibrationPath,
  immutableBaseCalibrationSha256:schema.immutableBase.calibrationSha256,
  supplementRows:120,
  perRoute:40,
  routes:['investment_price_trend','marital_relationship','relationship_development'],
  oneShotSupplement:true,
  secondSamplingRoundAllowed:false,
  encoderScoringBeforeSeal:false,
  fallbackIdentityTrainingPerformed:false,
  fallbackIdentityProbabilityUsed:false,
  fallbackThresholdSelected:false,
  v04CalibrationTextReadForGeneration:false,
  v04ReachabilityRowResultsRead:false,
  independentEvaluationRead:false,
  sealedBlindEvaluationRead:false,
  candidateV03FailureRowsRead:false
};
writeJson(lockPath,lock);
console.log('One-shot Fallback route-exposure supplement sealed before any encoder audit.');
console.log(`- supplement SHA256: ${lock.supplementSha256}`);
console.log(`- schema SHA256: ${lock.schemaSha256}`);
console.log('- Fallback training/probability/threshold selection: not performed');
