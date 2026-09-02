import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const calibrationPath=path.join(root,'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.3.json');
const calibration=JSON.parse(fs.readFileSync(calibrationPath,'utf8'));
if(calibration.sealed!==false||calibration.status!=='presealed_fallback_stage_calibration') throw new Error('calibration v0.3 is not editable preseal data');
if(calibration.policy?.encoderScoringObserved!==false) throw new Error('encoder scoring already observed');

const corrections=[{
  id:'V04-FI-C3-056',
  expectedRoute:'partnership',
  from:'我和他把各自手里的东西合在一起做，后面能不能稳',
  to:'我和他各自拿出手里的东西把这摊事一块做下去，后面能不能稳',
  reason:'remove_deterministic_romance_substring_collision_before_any_encoder_scoring'
}];
for(const correction of corrections){
  const row=calibration.rows.find((item)=>item.id===correction.id);
  if(!row) throw new Error(`missing correction row ${correction.id}`);
  if(row.expectedRoute!==correction.expectedRoute||row.identityLabel!=='route_identity_positive') throw new Error(`label drift for ${correction.id}`);
  if(row.text===correction.to) continue;
  if(row.text!==correction.from) throw new Error(`unexpected text for ${correction.id}: ${row.text}`);
  row.text=correction.to;
}
calibration.presealCorrections=corrections.map(({id,expectedRoute,reason})=>({id,expectedRoute,reason}));
calibration.presealCorrectionPolicy={labelChanges:0,encoderScoringObserved:false,modelProbabilityUsed:false};
fs.writeFileSync(calibrationPath,`${JSON.stringify(calibration,null,2)}\n`,'utf8');
console.log('Calibration v0.3 deterministic preseal correction applied.');
console.log('- V04-FI-C3-056: removed incidental “在一起” substring collision; partnership label unchanged');
console.log('- label changes: 0; encoder scoring: 0; model probability used: 0');
