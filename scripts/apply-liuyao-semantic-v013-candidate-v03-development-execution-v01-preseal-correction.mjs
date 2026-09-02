import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v03-development.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (data.version !== '0.13-candidate-v0.3-development-v0.1' || data.status !== 'generated_preseal' || data.sealed !== false) {
  throw new Error('Candidate v0.3 execution preseal correction may run only on generated_preseal data');
}
if (data.presealPatch?.rowsPatched !== 25 || data.presealPatch?.modelOrThresholdChanged !== false) {
  throw new Error('Historical 25-row deterministic preseal patch must run before execution-v0.1 correction');
}
const row = (data.rows || []).find((item) => item.id === 'V013-V03-D-089');
if (!row) throw new Error('Execution preseal correction target V013-V03-D-089 missing');
if (row.expectedDisposition !== 'route_known' || row.expectedRoute !== 'financial_fortune' || row.expectedCandidatePath !== 'fallback_head') {
  throw new Error(`Execution preseal correction target contract drift: ${JSON.stringify(row)}`);
}
const from = '往后这阵子我手头会不会比现在宽松一点';
const to = '往后这阵子我的日子会不会过得更宽裕些';
if (row.text !== from) throw new Error(`Execution preseal correction source wording drift: ${row.text}`);
row.text = to;
data.executionPresealCorrection = {
  version:'execution-v0.1',
  reason:'remove deterministic finance-domain support cue from one freshly authored pure-fallback row before sealing; no encoder/model output was consulted',
  targetId:row.id,
  from,
  to,
  expectedRoute:row.expectedRoute,
  expectedCandidatePath:row.expectedCandidatePath,
  encoderScoringObserved:false,
  independentEvaluationRead:false,
  labelChanged:false,
  modelOrThresholdChanged:false,
  verifierWeakened:false
};
fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log('Applied Candidate v0.3 execution-v0.1 preseal correction to V013-V03-D-089 before any encoder scoring.');
