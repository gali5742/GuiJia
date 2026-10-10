import {contract,generate,sealCorpus,exists,json,equal,assert,write} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
const c=contract(),d=generate(c);
for(const k of Object.keys(d)) {
  const p=c.outputs[k];
  if(exists(p))assert(equal(json(p),json(p).sealed?sealCorpus(d[k]):d[k]),`Refusing divergent overwrite: ${k}`);
  else {assert(!exists(c.outputs.dataLock),'Partial committed seal');write(p,d[k]);}
}
console.log('Literal Phase B augmentation/training/calibration generated or checked; encoder calls: 0');
