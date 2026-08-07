import fs from 'node:fs';
import path from 'node:path';
import { ROOT, materializeVendor, verifyVendorTree } from './vendor-lib.mjs';

const out = path.join(ROOT, '.site');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of ['index.html', 'README.md', 'vendor-versions.json', '.nojekyll']) {
  fs.copyFileSync(path.join(ROOT, name), path.join(out, name));
}
for (const dir of ['assets', 'data', 'js']) {
  fs.cpSync(path.join(ROOT, dir), path.join(out, dir), { recursive: true });
}

let reusedCheckedInVendor = false;
if (fs.existsSync(path.join(ROOT, 'vendor-lock.json')) && fs.existsSync(path.join(ROOT, 'vendor'))) {
  try {
    verifyVendorTree(ROOT);
    fs.cpSync(path.join(ROOT, 'vendor'), path.join(out, 'vendor'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'vendor-lock.json'), path.join(out, 'vendor-lock.json'));
    reusedCheckedInVendor = true;
    console.log('Using checked-in verified vendor snapshots.');
  } catch (error) {
    console.warn(`Checked-in vendor not reusable: ${error.message}`);
  }
}

if (!reusedCheckedInVendor) {
  await materializeVendor(out, { rewriteHtml: true });
  console.log('Built Pages artifact with verified vendor snapshots from pinned npm tarballs.');
}

verifyVendorTree(out);
console.log(`GitHub Pages site built at ${out}`);
