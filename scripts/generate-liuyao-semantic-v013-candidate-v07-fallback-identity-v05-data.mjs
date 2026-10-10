import {contract,generate,verify,equal,exists,json,write,assert} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
const {c}=contract(),g=generate(c);
const present=['augmentation','training','calibration'].filter(k=>exists(c.outputs[k]));
if(present.length){assert(present.length===3,'Partial generated corpus forbidden');verify();}
else for(const [k,v]of Object.entries(g))write(c.outputs[k],v);
console.log(JSON.stringify({status:'generated_or_verified_literal_corpora_without_encoder',trainingRows:g.training.rows.length,rawCalibrationRows:g.calibration.rows.length,encoderInvocations:0}));
