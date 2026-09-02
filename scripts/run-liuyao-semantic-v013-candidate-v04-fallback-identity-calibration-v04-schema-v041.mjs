import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mode=String(process.argv[2]||'').trim();
const configs={
  generate:{base:'scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs'},
  verify:{base:'scripts/verify-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs'},
  seal:{base:'scripts/seal-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs'}
};
if(!configs[mode])throw new Error('usage: node run-...-schema-v041.mjs <generate|verify|seal>');
const oldSchema='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json';
const newSchema='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.1.json';
const oldStatus='frozen_after_v03_sealed_reachability_failure_before_new_calibration_generation';
const newStatus='frozen_after_v04_pregeneration_hash_type_failure_before_any_calibration_generation';
const basePath=path.join(root,configs[mode].base);
const baseBytes=fs.readFileSync(basePath);
const baseSha256=crypto.createHash('sha256').update(baseBytes).digest('hex');
let source=baseBytes.toString('utf8');
const replaceExact=(from,to,expected,label)=>{
  const count=source.split(from).length-1;
  if(count!==expected)throw new Error(`${mode} ${label} anchor count ${count} != ${expected}`);
  source=source.split(from).join(to);
};
replaceExact(oldSchema,newSchema,1,'schema-path');
if(mode==='generate'||mode==='verify')replaceExact(oldStatus,newStatus,1,'schema-status');
if(mode==='verify'){
  const oldLine="assert(sha256(schema.supersededCalibration.reachabilityReportPath)===schema.supersededCalibration.reachabilityReportSha256,'v0.3 reachability report drift');";
  const newLine="const gitBlobSha=(relative)=>{const bytes=fs.readFileSync(path.join(root,relative));return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\\0`)).update(bytes).digest('hex');};\nassert(gitBlobSha(schema.supersededCalibration.reachabilityReportPath)===schema.supersededCalibration.reachabilityReportGitBlobSha,'v0.3 reachability report Git blob drift');";
  replaceExact(oldLine,newLine,1,'report-hash-type');
}
const tempPath=path.join(root,'scripts',`.tmp-fallback-cal-v04-v041-${mode}-${process.pid}.mjs`);
fs.writeFileSync(tempPath,source,'utf8');
try{
  console.log(`Calibration v0.4 schema v0.4.1 wrapper: ${mode}`);
  console.log(`- immutable base script: ${configs[mode].base}`);
  console.log(`- base SHA256: ${baseSha256}`);
  console.log('- permitted transform: schema path/status and verifier report hash-type check only');
  console.log('- model/data generation algorithm changes: 0');
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
}finally{
  if(fs.existsSync(tempPath))fs.unlinkSync(tempPath);
}
