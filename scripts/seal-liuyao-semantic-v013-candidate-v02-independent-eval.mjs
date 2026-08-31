import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.json';
const candidateLockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v0.2.lock.json';
const lockFile = 'data/liuyao-semantic-decision-stack-v0.13-candidate-v02-independent-eval.lock.json';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');

const data = readJson(dataFile);
const candidateLock = readJson(candidateLockFile);
if (candidateLock.status !== 'locked') throw new Error('Candidate v0.2 must remain locked');
if (data.status !== 'presealed_independent_eval' || data.sealed !== false) throw new Error('independent eval must be presealed before sealing');
if (data.candidate?.candidateSha256 !== candidateLock.candidateSha256) throw new Error('candidate SHA mismatch');

data.status = 'sealed_independent_eval';
data.sealed = true;
Object.freeze(data.rows);
fs.writeFileSync(path.join(root, dataFile), `${JSON.stringify(data, null, 2)}\n`, 'utf8');

const lock = {
  version:'0.13-candidate-v0.2-independent-eval-v0.1-lock',
  status:'locked',
  dataPath:dataFile,
  dataSha256:sha256(dataFile),
  candidateLockPath:candidateLockFile,
  candidateLockSha256:sha256(candidateLockFile),
  candidateSha256:candidateLock.candidateSha256,
  rowCount:data.rows.length,
  policy:{ training:false, calibration:false, candidateMutation:false, postRunWordingPatch:false }
};
fs.writeFileSync(path.join(root, lockFile), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Sealed Candidate v0.2 independent eval: ${lock.dataSha256}`);
