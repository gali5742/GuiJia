import {verify,sealCorpus,makeLock,write,exists,assert} from './liuyao-semantic-v013-candidate-v07-fallback-identity-v05-data-lib.mjs';
const {c,d,a}=verify({requireCommitted:process.argv.includes('--committed-inputs')});
if(exists(c.outputs.dataLock)){verify({requireSeal:true});console.log('Existing complete seal verified; no rewrite.');}
else {
  assert(!d.training.sealed,'Partial seal forbidden');
  const sealed=Object.fromEntries(Object.entries(d).map(([k,v])=>[k,sealCorpus(v)]));
  for(const [k,v]of Object.entries(sealed))write(c.outputs[k],v);
  write(c.outputs.audit,a);write(c.outputs.dataLock,makeLock(c,sealed,a));
  verify({requireSeal:true});console.log('Training, augmentation and entire raw calibration sealed before encoder.');
}
