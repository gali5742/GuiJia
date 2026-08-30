import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRelative = 'data/liuyao-semantic-decision-stack-v0.13-development.json';
const generatorRelative = 'scripts/generate-liuyao-semantic-v013-development-eval.mjs';
const verifierRelative = 'scripts/verify-liuyao-semantic-v013-development-eval.mjs';
const lockRelative = 'data/liuyao-semantic-decision-stack-v0.13-development.lock.json';
const sha256 = (relative) => createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex');
const data = JSON.parse(fs.readFileSync(path.join(root, dataRelative), 'utf8'));
if (data.version !== '0.13-development-v0.1' || data.sealed !== true || data.rows?.length !== 198) throw new Error('development eval not ready to lock');
const lock = {
  version:'0.13-development-v0.1-lock',
  status:'locked',
  scope:'liuyao_semantic_decision_stack_v0.13',
  dataFile:dataRelative,
  dataSha256:sha256(dataRelative),
  generatorSha256:sha256(generatorRelative),
  verifierSha256:sha256(verifierRelative),
  rowCount:data.rows.length,
  policy:{
    currentRouteabilityTraining:false,
    currentRouteabilityCalibration:false,
    futureBlindReuse:false
  }
};
fs.writeFileSync(path.join(root, lockRelative), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Locked ${dataRelative}: ${lock.dataSha256}`);
