import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseGenerator = 'scripts/generate-liuyao-semantic-v013-candidate-v03-development.mjs';
const outPath = 'data/liuyao-semantic-v013-candidate-v03-development.json';
const correctedModelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-execution-v0.1-model.lock.json';
const contractPath = 'data/liuyao-semantic-v013-candidate-v03-development-execution-v0.1-contract.json';
const expectedBaseGeneratorGitBlob = 'a417ec6925484f0c56290dc55e1df2dacbeabc8f';
const read = (relative) => fs.readFileSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(read(relative).toString('utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (relative) => crypto.createHash('sha256').update(read(relative)).digest('hex');
const gitBlobSha = (relative) => {
  const bytes = read(relative);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const contract = readJson(contractPath);
assert(contract.status === 'locked_before_first_corrected_development_encoder_scoring', `development correction contract not locked: ${contract.status}`);
assert(gitBlobSha(baseGenerator) === expectedBaseGeneratorGitBlob, `base development generator blob drift: ${gitBlobSha(baseGenerator)}`);
assert(contract.freshDevelopment.baseGenerator.gitBlobSha === expectedBaseGeneratorGitBlob, 'contract/base generator blob mismatch');
assert(contract.correctedFallbackIdentity.modelLock.path === correctedModelLockPath, 'contract corrected model-lock path drift');

const source = read(baseGenerator).toString('utf8');
const from = "const modelLockPath = 'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json';";
const to = `const modelLockPath = '${correctedModelLockPath}';`;
const count = source.split(from).length - 1;
assert(count === 1, `expected exactly one legacy model-lock path anchor, found ${count}`);
const instrumented = source.replace(from, to);
const tempPath = path.join(root, 'scripts', `.tmp-candidate-v03-development-execution-v01-${process.pid}.mjs`);
try {
  fs.writeFileSync(tempPath, instrumented, 'utf8');
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
}

const generated = readJson(outPath);
const correctedLock = readJson(correctedModelLockPath);
assert(generated.status === 'generated_preseal' && generated.sealed === false, 'generated development data is not preseal');
assert(generated.fallbackIdentityModelLock?.path === correctedModelLockPath, 'generated development data did not bind corrected Fallback model lock');
assert(generated.fallbackIdentityModelLock?.artifactSha256 === correctedLock.artifactSha256, 'generated development data corrected model artifact binding drift');

generated.executionCorrection = {
  version:'0.1',
  contractPath,
  contractSha256:sha256(contractPath),
  baseGenerator:{ path:baseGenerator, gitBlobSha:expectedBaseGeneratorGitBlob, sha256:sha256(baseGenerator) },
  temporaryInstrumentation:{
    repositorySourceMutation:false,
    onlyChange:'fallback_identity_model_lock_path',
    from:'data/liuyao-semantic-fallback-identity-v0.1-model.lock.json',
    to:correctedModelLockPath,
    exactReplacementCount:1
  },
  independentEvaluationDataRead:false,
  encoderScoringPerformed:false
};
writeJson(outPath, generated);
console.log('Generated corrected fresh Candidate v0.3 development data before any encoder scoring.');
console.log(`- rows: ${generated.rows.length}`);
console.log(`- corrected fallback artifact: ${correctedLock.artifactSha256}`);
console.log(`- contract SHA-256: ${sha256(contractPath)}`);
