import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, verifyVendorTree } from './vendor-lib.mjs';

const target = path.resolve(ROOT, process.argv[2] || '.');
const lock = verifyVendorTree(target);

for (const entry of Object.values(lock.packages)) {
  const file = path.join(target, entry.file);
  const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (checked.status !== 0) {
    process.stderr.write(checked.stderr || checked.stdout || '');
    throw new Error(`JavaScript syntax check failed: ${entry.file}`);
  }
}

const lunarPath = path.join(target, 'vendor/lunar.js');
const lunarSmoke = spawnSync(process.execPath, ['-e', `const x=require(${JSON.stringify(lunarPath)}); if(!x.Solar||!x.Lunar) process.exit(2); const s=x.Solar.fromYmd(2026,8,8); if(!s.getLunar()) process.exit(3);`], { encoding: 'utf8' });
if (lunarSmoke.status !== 0) {
  process.stderr.write(lunarSmoke.stderr || lunarSmoke.stdout || '');
  throw new Error('lunar-javascript vendor smoke test failed');
}

console.log(`Vendor verification passed: ${target}`);
for (const [name, entry] of Object.entries(lock.packages)) {
  console.log(`- ${name}@${entry.version}: ${entry.bytes} bytes, sha256 ${entry.sha256}`);
}
