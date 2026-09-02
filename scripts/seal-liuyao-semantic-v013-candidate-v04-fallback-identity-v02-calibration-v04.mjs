import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const calibrationPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json';
const schemaPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json';
const lockPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.lock.json';
const readJson=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const writeJson=(relative,value)=>fs.writeFileSync(path.join(root,relative),`${JSON.stringify(value,null,2)}\n`,'utf8');
const sha256=(relative)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');

const schema=readJson(schemaPath);const calibration=readJson(calibrationPath);
if(calibration.sealed){if(calibration.status!=='sealed_fallback_stage_calibration'||!fs.existsSync(path.join(root,lockPath)))throw new Error('partial v0.4 calibration seal');console.log('Fallback calibration v0.4 already sealed.');process.exit(0);}
if(calibration.status!=='presealed_fallback_stage_calibration')throw new Error(`unexpected v0.4 status ${calibration.status}`);
for(const [field,expected] of Object.entries({encoderScoringObserved:false,semanticActProbabilityUsedForGeneration:false,routeabilityProbabilityUsedForGeneration:false,fallbackIdentityProbabilityUsed:false,v03CalibrationTextReadForGeneration:false,v03ReachabilityRowResultsRead:false,candidateV03FailureRowsRead:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,routerTopKUsedForGeneration:false}))if(calibration.policy?.[field]!==expected)throw new Error(`preseal policy drift ${field}`);
if(sha256(schema.carriedTrainingAugmentation.path)!==schema.carriedTrainingAugmentation.sha256)throw new Error('carried training drift');
if(sha256(schema.supersededCalibration.path)!==schema.supersededCalibration.sha256)throw new Error('superseded v0.3 calibration drift');
if(calibration.rows?.length!==704)throw new Error('v0.4 calibration row count drift');

calibration.status='sealed_fallback_stage_calibration';calibration.sealed=true;calibration.sealedBeforeFirstPostsealReachabilityScoring=true;calibration.thresholdSelectionEligibleOnlyAfterPostsealReachabilityPass=true;writeJson(calibrationPath,calibration);
const lock={
  version:'0.13-candidate-v0.4-fallback-identity-v0.2-calibration-v0.4-lock-v0.1',status:'locked',scope:'liuyao_semantic_fallback_identity_v0.2_fallback_stage_calibration_v0.4',
  calibrationPath,calibrationSha256:sha256(calibrationPath),schemaPath,schemaSha256:sha256(schemaPath),
  carriedTrainingPath:schema.carriedTrainingAugmentation.path,carriedTrainingSha256:schema.carriedTrainingAugmentation.sha256,
  supersededCalibrationPath:schema.supersededCalibration.path,supersededCalibrationSha256:schema.supersededCalibration.sha256,
  calibrationRows:704,routeKnownRows:220,nearDomainRows:440,outsideCurrent22Rows:22,routeUnresolvedRows:22,
  encoderScoringBeforeSeal:false,semanticActProbabilityUsedForGeneration:false,routeabilityProbabilityUsedForGeneration:false,fallbackIdentityProbabilityUsed:false,fallbackIdentityTrainingPerformed:false,fallbackThresholdSelected:false,
  v03CalibrationTextReadForGeneration:false,v03ReachabilityRowResultsRead:false,independentEvaluationRead:false,sealedBlindEvaluationRead:false,candidateV03FailureRowsRead:false,newThemeResearchImported:false,traditionalLiuYaoFeaturesUsed:false
};
writeJson(lockPath,lock);
console.log('Candidate v0.4 Fallback Identity v0.2 calibration v0.4 sealed before post-seal reachability scoring.');
console.log(`- calibration SHA256: ${lock.calibrationSha256}`);console.log(`- schema SHA256: ${lock.schemaSha256}`);console.log('- Fallback training/threshold selection: not performed');
