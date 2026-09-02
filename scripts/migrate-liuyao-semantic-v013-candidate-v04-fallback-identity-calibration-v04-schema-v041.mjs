import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=[
  'scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs',
  'scripts/verify-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs',
  'scripts/seal-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v04.mjs',
  '.github/workflows/liuyao-v013-v04-fallback-identity-v02-calibration-v04-data.yml'
];
const oldPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json';
const newPath='data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.1.json';
const oldStatus='frozen_after_v03_sealed_reachability_failure_before_new_calibration_generation';
const newStatus='frozen_after_v04_pregeneration_hash_type_failure_before_any_calibration_generation';
for(const relative of files){
  const full=path.join(root,relative);
  let source=fs.readFileSync(full,'utf8');
  source=source.split(oldPath).join(newPath);
  source=source.split(oldStatus).join(newStatus);
  if(relative.includes('verify-liuyao')){
    const oldLine="assert(sha256(schema.supersededCalibration.reachabilityReportPath)===schema.supersededCalibration.reachabilityReportSha256,'v0.3 reachability report drift');";
    const newLine="const gitBlobSha=(relative)=>{const bytes=fs.readFileSync(path.join(root,relative));return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\\0`)).update(bytes).digest('hex');};\nassert(gitBlobSha(schema.supersededCalibration.reachabilityReportPath)===schema.supersededCalibration.reachabilityReportGitBlobSha,'v0.3 reachability report Git blob drift');";
    if(source.includes(oldLine)) source=source.replace(oldLine,newLine);
    else if(!source.includes('reachabilityReportGitBlobSha')) throw new Error('verifier provenance patch anchor missing');
  }
  if(relative.includes('calibration-v04-data.yml')){
    const oldNode="const fs=require('fs');const crypto=require('crypto');const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');";
    const newNode="const fs=require('fs');const crypto=require('crypto');const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const blob=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\\0`)).update(b).digest('hex');};";
    source=source.replace(oldNode,newNode);
    source=source.replace("if(sha(s.supersededCalibration.reachabilityReportPath)!==s.supersededCalibration.reachabilityReportSha256)process.exit(1);","if(blob(s.supersededCalibration.reachabilityReportPath)!==s.supersededCalibration.reachabilityReportGitBlobSha)process.exit(1);");
    source=source.replace("data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.json","data/liuyao-semantic-v013-candidate-v04-fallback-identity-v02-data-schema-v0.4.1.json");
  }
  if(!source.includes(newPath)) throw new Error(`schema v0.4.1 pointer missing after migration: ${relative}`);
  fs.writeFileSync(full,source,'utf8');
}
console.log('Calibration v0.4 execution files migrated to schema v0.4.1 before any calibration generation.');
console.log('- provenance report check now uses explicit Git blob SHA');
console.log('- corpus generation/scoring performed: 0');
