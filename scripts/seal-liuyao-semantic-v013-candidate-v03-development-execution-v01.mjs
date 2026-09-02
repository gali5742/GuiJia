import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const lockPath = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const modelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.lock.json';
const frozenLockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const data = readJson(dataPath);
const modelLock = readJson(modelLockPath);
const frozenLock = readJson(frozenLockPath);
const contract = readJson(contractPath);
assert(data.version === '0.13-candidate-v0.3-development-v0.1', `unexpected development version: ${data.version}`);
assert(data.status === 'generated_preseal' && data.sealed === false, 'development data must be generated_preseal before corrected seal');
assert(modelLock.status === 'locked', 'corrected Fallback Identity model lock missing');
assert(contract.status === 'locked_before_first_corrected_development_encoder_scoring', 'development execution contract not locked');
assert(data.fallbackIdentityModelLock?.path === modelLockPath, 'development data is not bound to corrected Fallback lock');
assert(data.fallbackIdentityModelLock?.artifactSha256 === modelLock.artifactSha256, 'development/model artifact binding drift before seal');
assert(data.executionCorrection?.independentEvaluationDataRead === false, 'development generation must not read independent evaluation data');
assert(data.executionCorrection?.encoderScoringPerformed === false, 'development generation unexpectedly reports encoder scoring before seal');

const sealed = {
  ...data,
  status:'sealed_development_eval',
  sealed:true,
  policy:{ ...data.policy, sealedBeforeFirstDevelopmentEncoderScoring:true },
  seal:{
    version:'execution-v0.1',
    sealedAfterCorrectedFallbackIdentityModelLock:true,
    sealedBeforeFirstDevelopmentEncoderScoring:true,
    postSealWordingMutationAllowed:false,
    independentEvaluationDataReadBeforeSeal:false,
    correctedDependenciesArtifactSha256:frozenLock.artifactSha256,
    correctedFallbackIdentityArtifactSha256:modelLock.artifactSha256,
    routeabilityThreshold:modelLock.routeabilityThreshold,
    scopeHardVetoCutoff:modelLock.scopeHardVetoCutoff,
    fallbackIdentityGlobalThreshold:modelLock.globalThreshold,
    canonicalTextsPerEncoderCall:modelLock.canonicalTextsPerEncoderCall
  }
};
writeJson(dataPath, sealed);
const lock = {
  version:'0.13-candidate-v0.3-development-lock-execution-v0.1',
  status:'locked',
  artifact:dataPath,
  artifactSha256:sha256(dataPath),
  rowCount:sealed.rows.length,
  developmentExecutionContract:{ path:contractPath, sha256:sha256(contractPath) },
  correctedFallbackIdentityModelLock:{ path:modelLockPath, sha256:sha256(modelLockPath), artifactSha256:modelLock.artifactSha256 },
  correctedFrozenDependenciesLock:{ path:frozenLockPath, sha256:sha256(frozenLockPath), artifactSha256:frozenLock.artifactSha256 },
  sealedBeforeFirstDevelopmentEncoderScoring:true,
  independentEvaluationDataReadBeforeSeal:false,
  postSealWordingMutationAllowed:false,
  canonicalTextsPerEncoderCall:1,
  routeabilityThreshold:modelLock.routeabilityThreshold,
  scopeHardVetoCutoff:modelLock.scopeHardVetoCutoff,
  fallbackIdentityGlobalThreshold:modelLock.globalThreshold
};
writeJson(lockPath, lock);
console.log('Sealed corrected fresh Candidate v0.3 development data before first encoder scoring.');
console.log(`- rows: ${sealed.rows.length}`);
console.log(`- artifact SHA-256: ${lock.artifactSha256}`);
console.log(`- corrected fallback artifact SHA-256: ${modelLock.artifactSha256}`);
