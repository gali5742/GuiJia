import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calibrationPath = path.join(root, 'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration.json');
const calibration = JSON.parse(fs.readFileSync(calibrationPath, 'utf8'));
if (calibration.sealed !== false || calibration.status !== 'presealed_calibration_data') throw new Error('Fallback v0.2 calibration is not editable preseal data');
if (calibration.policy?.encoderScoringObserved !== false) throw new Error('Fallback v0.2 encoder scoring already observed');

const corrections = [
  {
    id:'V04-FI-C-066',
    from:'项目结束后的奖励金会不会有我的份',
    to:'这次项目收尾以后，公司另外那份奖励最后会不会发到我这里',
    reason:'remove_train_calibration_near_duplicate_before_any_encoder_scoring'
  }
];
for (const correction of corrections) {
  const row = calibration.rows.find((item) => item.id === correction.id);
  if (!row) throw new Error(`missing preseal correction row ${correction.id}`);
  if (row.text === correction.to) continue;
  if (row.text !== correction.from) throw new Error(`unexpected text for ${correction.id}: ${row.text}`);
  row.text = correction.to;
}
calibration.presealCorrections = corrections.map(({id,reason}) => ({id,reason}));
fs.writeFileSync(calibrationPath, `${JSON.stringify(calibration, null, 2)}\n`, 'utf8');
console.log('Candidate v0.4 Fallback Identity v0.2 deterministic preseal corrections applied.');
console.log('- V04-FI-C-066: near-duplicate wording replaced; label/route/axis unchanged');
