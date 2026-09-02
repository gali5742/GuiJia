import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const calibrationPath=path.join(root,'data/liuyao-semantic-v013-candidate-v04-fallback-identity-calibration-v0.4.json');
const calibration=JSON.parse(fs.readFileSync(calibrationPath,'utf8'));
if(calibration.status!=='presealed_fallback_stage_calibration'||calibration.sealed!==false)throw new Error('calibration v0.4 is not editable preseal data');
if(calibration.policy?.encoderScoringObserved!==false||calibration.policy?.semanticActProbabilityUsedForGeneration!==false||calibration.policy?.routeabilityProbabilityUsedForGeneration!==false)throw new Error('model scoring/probability already observed');

const corrections=[
  {id:'V04-FI-C4-125',route:'investment_suitability',from:'这个地方我还没决定要不要放钱进去，接下来会不会对我妥当',to:'眼前这个去处目前还没决定是否放一部分积蓄进去，接下来会不会对我妥当'},
  {id:'V04-FI-C4-126',route:'investment_suitability',from:'这个地方我还没决定要不要放钱进去，往后能不能适宜我现在参与',to:'眼前这个去处目前还没决定是否放一部分积蓄进去，往后能不能适宜我现在参与'}
];
for(const correction of corrections){
  const row=calibration.rows.find((item)=>item.id===correction.id);
  if(!row)throw new Error(`missing row ${correction.id}`);
  if(row.identityLabel!=='route_identity_positive'||row.expectedRoute!==correction.route)throw new Error(`route/label drift ${correction.id}`);
  if(row.text===correction.to)continue;
  if(row.text!==correction.from)throw new Error(`unexpected source text ${correction.id}: ${row.text}`);
  row.text=correction.to;
}
calibration.presealLexicalCorrections=corrections.map(({id,route})=>({id,route,reason:'remove_incidental_debt_repayment_regex_collision_before_encoder_scoring'}));
calibration.presealLexicalCorrectionPolicy={changedRows:2,labelChanges:0,routeChanges:0,encoderScoringObserved:false,modelProbabilityUsed:false,thresholdChanges:0};
fs.writeFileSync(calibrationPath,`${JSON.stringify(calibration,null,2)}\n`,'utf8');
console.log('Calibration v0.4 deterministic preseal lexical correction applied.');
console.log('- corrected investment_suitability rows: V04-FI-C4-125, V04-FI-C4-126');
console.log('- removed incidental “我还…钱” debt-repayment regex collision');
console.log('- label/route/threshold changes: 0; encoder/model probability used: 0');
