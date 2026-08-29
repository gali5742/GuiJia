import fs from 'node:fs';
import path from 'node:path';
import { ROOT, verifyVendorTree } from './vendor-lib.mjs';

const out = path.join(ROOT, '.site');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of ['index.html', 'rule-registry-test.html', 'semantic-router-poc.html', 'semantic-router-poc-v02.html', 'semantic-router-poc-v03.html', 'semantic-router-poc-v04.html', 'semantic-router-poc-v05.html', 'semantic-router-poc-v06.html', 'semantic-router-runtime-v01.html', 'semantic-sufficiency-test.html', 'semantic-slot-provider-test.html', 'README.md', 'vendor-versions.json', '.nojekyll']) {
  fs.copyFileSync(path.join(ROOT, name), path.join(out, name));
}
for (const dir of ['assets', 'data', 'js']) {
  const source = path.join(ROOT, dir);
  const target = path.join(out, dir);
  fs.cpSync(source, target, {
    recursive: true,
    filter: (entry) => !(dir === 'js' && path.basename(entry) === 'liuyao-time-review.js')
  });
}

const vendorDir = path.join(ROOT, 'vendor');
const vendorLock = path.join(ROOT, 'vendor-lock.json');
if (!fs.existsSync(vendorDir) || !fs.existsSync(vendorLock)) {
  throw new Error('Checked-in vendor snapshots are required for Pages builds. Run the Vendor Snapshot PR workflow first.');
}

verifyVendorTree(ROOT);
fs.cpSync(vendorDir, path.join(out, 'vendor'), { recursive: true });
fs.copyFileSync(vendorLock, path.join(out, 'vendor-lock.json'));

verifyVendorTree(out);
console.log(`GitHub Pages site built from checked-in verified vendor snapshots at ${out}`);
