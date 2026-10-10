// Preload for this Candidate's directed checks. Reject protected data paths
// before I/O, including binary hashes, so a generic validator cannot open them.
const fs=require('node:fs');
const path=require('node:path');
const {fileURLToPath}=require('node:url');
const {syncBuiltinESMExports}=require('node:module');
const dataDir=path.resolve(__dirname,'../data');
function check(value) {
  if(typeof value==='number')return;
  const filename=value instanceof URL?fileURLToPath(value):Buffer.isBuffer(value)?value.toString():value;
  if(typeof filename!=='string')return;
  const resolved=path.resolve(filename);
  if(resolved.startsWith(dataDir+path.sep)&&/(independent|blind|literature|research|next-topic|next-five)/i.test(path.basename(resolved))) {
    const error=new Error(`Protected evaluation/research read rejected before I/O: ${path.basename(resolved)}`);
    error.code='GUIJIA_EVALUATION_READ_FORBIDDEN';throw error;
  }
}
for(const method of ['readFileSync','readFile','openSync','open','createReadStream']) {
  const original=fs[method];fs[method]=function(value,...args){check(value);return original.call(this,value,...args);};
}
for(const method of ['readFile','open']) {
  const original=fs.promises[method];fs.promises[method]=async function(value,...args){check(value);return original.call(this,value,...args);};
}
syncBuiltinESMExports();
