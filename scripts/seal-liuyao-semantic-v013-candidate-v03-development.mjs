import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const lockPath = 'data/liuyao-semantic-v013-candidate-v03-development.lock.json';
const modelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json';
const full = (relative) => path.join(root, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(full(relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(full(relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256File = (relative) => crypto.createHash('sha256').update(fs.readFileSync(full(relative))).digest('hex');

const data = readJson(dataPath);
const modelLock = readJson(modelLockPath);
if (data.version !== '0.13-candidate-v0.3-development-v0.1') throw new Error(`Unexpected development version: ${data.version}`);
if (data.status !== 'generated_preseal' || data.sealed !== false) throw new Error('Development data must be generated_preseal before sealing');
if (modelLock.status !== 'locked') throw new Error('Fallback Identity model lock missing');
if (data.fallbackIdentityModelLock?.artifactSha256 !== modelLock.artifactSha256) throw new Error('Development/model artifact binding drift before seal');

const sealed = {
  ...data,
  status:'sealed_development_eval',
  sealed:true,
  policy:{
    ...data.policy,
    sealedBeforeFirstDevelopmentEncoderScoring:true
  },
  seal:{
    sealedAfterFallbackIdentityModelLock:true,
    sealedBeforeFirstDevelopmentEncoderScoring:true,
    postSealWordingMutationAllowed:false
  }
};
writeJson(dataPath, sealed);
const artifactSha256 = sha256File(dataPath);
const lock = {
  version:'0.13-candidate-v0.3-development-lock-v0.1',
  status:'locked',
  artifact:dataPath,
  artifactSha256,
  rowCount:sealed.rows.length,
  fallbackIdentityModelLock:modelLockPath,
  fallbackIdentityModelLockSha256:sha256File(modelLockPath),
  fallbackIdentityModelArtifactSha256:modelLock.artifactSha256,
  sealedBeforeFirstDevelopmentEncoderScoring:true,
  postSealWordingMutationAllowed:false
};
writeJson(lockPath, lock);
console.log('Sealed fresh Candidate v0.3 development data before first encoder scoring.');
console.log(`- rows: ${sealed.rows.length}`);
console.log(`- artifact SHA-256: ${artifactSha256}`);
console.log(`- Fallback Identity model artifact SHA-256: ${modelLock.artifactSha256}`);
