import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRelative = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.json';
const generatorRelative = 'scripts/generate-liuyao-semantic-v013-independent-eval.mjs';
const verifierRelative = 'scripts/verify-liuyao-semantic-v013-independent-eval.mjs';
const lockRelative = 'data/liuyao-semantic-decision-stack-v0.13-independent-eval.lock.json';
const candidateLockRelative = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.1.lock.json';
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const candidateLock = readJson(candidateLockRelative);
if (candidateLock.status !== 'locked') throw new Error('candidate lock is not locked');
const data = readJson(dataRelative);
if (data.version !== '0.13-independent-eval-v0.1' || data.rows?.length !== 198) throw new Error('independent eval not ready to seal');
if (data.candidate?.candidateSha256 !== candidateLock.candidateSha256) throw new Error('independent eval candidate mismatch');
if (data.status !== 'presealed_independent_eval' || data.sealed !== false) throw new Error(`expected presealed independent eval, got ${data.status}/${data.sealed}`);

const sealed = {
  ...data,
  status:'sealed_independent_eval',
  sealed:true,
  sealPolicy:{
    candidateImmutable:true,
    noTraining:true,
    noCalibration:true,
    noPostRunWordingPatch:true,
    futureBlindReuse:false
  }
};
writeJson(dataRelative, sealed);
const lock = {
  version:'0.13-independent-eval-v0.1-lock',
  status:'locked',
  scope:'liuyao_semantic_decision_stack_v0.13',
  candidateSha256:candidateLock.candidateSha256,
  dataFile:dataRelative,
  dataSha256:sha256(dataRelative),
  generatorSha256:sha256(generatorRelative),
  verifierSha256:sha256(verifierRelative),
  candidateLockSha256:sha256(candidateLockRelative),
  rowCount:sealed.rows.length,
  policy:{ training:false, calibration:false, candidateMutation:false, postRunWordingPatch:false, futureBlindReuse:false }
};
writeJson(lockRelative, lock);
console.log(`Sealed independent eval for candidate ${lock.candidateSha256}.`);
console.log(`- data SHA-256: ${lock.dataSha256}`);
