import {contract,generate,sealed,audit,makeLock,write,json,exists,equal,assert,verify} from './liuyao-semantic-v013-candidate-v10-fallback-identity-v08-data-lib.mjs';
if(process.argv.includes('--seal')) {
  const {c}=contract({requireCommitted:true}),generated=generate(c),d=Object.fromEntries(Object.entries(generated).map(([s,v])=>[s,sealed(v)])),a=audit(c,d);
  const paths=[c.outputs.training,c.outputs.calibration,c.outputs.trainingSupplement,c.outputs.audit,c.outputs.dataLock];
  if(paths.some(exists)){assert(paths.every(exists),'Partial existing seal forbidden');verify({requireCommitted:false});}
  else{for(const s of ['training','calibration','trainingSupplement'])write(c.outputs[s],d[s]);write(c.outputs.audit,a);write(c.outputs.dataLock,makeLock(c,d,a));verify({requireCommitted:false});}
  console.log(JSON.stringify({status:'sealed_complete_training_and_fresh_raw_calibration',counts:a.counts,duplicateAudit:a.duplicateAudit,encoderInvocations:0}));
}else{const {a}=verify({requireCommitted:!process.argv.includes('--uncommitted-outputs')});console.log(JSON.stringify({status:a.status,counts:a.counts,duplicateAudit:a.duplicateAudit,encoderInvocations:0}));}
