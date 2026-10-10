import {verify,sealCorpus,audit,makeLock,exists,json,equal,assert,write} from './liuyao-semantic-v013-candidate-v05-fallback-identity-v03-data-lib.mjs';
const {c,d}=verify(), sealed=Object.fromEntries(Object.entries(d).map(([k,x])=>[k,sealCorpus(x)])),a=audit(c,sealed);
const lock=makeLock;
if(exists(c.outputs.dataLock)) {verify({requireSeal:true});console.log('Existing deterministic seal verified; no rewrite.');}
else {
  assert(!exists(c.outputs.audit)&&!Object.values(d).some(x=>x.sealed),'Partial seal forbidden');
  for(const [k,x]of Object.entries(sealed))write(c.outputs[k],x);
  write(c.outputs.audit,a);write(c.outputs.dataLock,lock(c,sealed,a));
  verify({requireSeal:true});console.log('Phase B data sealed without encoder scoring.');
}
