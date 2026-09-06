import fs from 'node:fs';
import path from 'node:path';
import { ROOT, verifyVendorTree } from './vendor-lib.mjs';

const out = path.join(ROOT, '.site');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of ['index.html', 'README.md', 'vendor-versions.json', '.nojekyll']) {
  fs.copyFileSync(path.join(ROOT, name), path.join(out, name));
}

const legacyToolPages = [
  ['tools/liuyao/traditional/rule-registry-test.html', 'rule-registry-test.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc.html', 'semantic-router-poc.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v02.html', 'semantic-router-poc-v02.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v03.html', 'semantic-router-poc-v03.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v04.html', 'semantic-router-poc-v04.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v05.html', 'semantic-router-poc-v05.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v06.html', 'semantic-router-poc-v06.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v07.html', 'semantic-router-poc-v07.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v08.html', 'semantic-router-poc-v08.html'],
  ['tools/liuyao/semantic/router/semantic-router-poc-v081.html', 'semantic-router-poc-v081.html'],
  ['tools/liuyao/semantic/router/semantic-router-candidate-eval-v01.html', 'semantic-router-candidate-eval-v01.html'],
  ['tools/liuyao/semantic/router/semantic-router-decision-v09.html', 'semantic-router-decision-v09.html'],
  ['tools/liuyao/semantic/router/semantic-router-runtime-v01.html', 'semantic-router-runtime-v01.html'],
  ['tools/liuyao/semantic/decision-stack/semantic-decision-stack-v010.html', 'semantic-decision-stack-v010.html'],
  ['tools/liuyao/semantic/decision-stack/semantic-decision-stack-v011.html', 'semantic-decision-stack-v011.html'],
  ['tools/liuyao/semantic/decision-stack/semantic-decision-stack-v011-sealed-blind-v01.html', 'semantic-decision-stack-v011-sealed-blind-v01.html'],
  ['tools/liuyao/semantic/decision-stack/semantic-decision-stack-v012.html', 'semantic-decision-stack-v012.html'],
  ['tools/liuyao/semantic/decision-stack/semantic-decision-stack-v012-sealed-blind-v01.html', 'semantic-decision-stack-v012-sealed-blind-v01.html'],
  ['tools/liuyao/semantic/resolution/semantic-object-resolver-test.html', 'semantic-object-resolver-test.html'],
  ['tools/liuyao/semantic/resolution/semantic-entity-typing-poc.html', 'semantic-entity-typing-poc.html'],
  ['tools/liuyao/semantic/resolution/semantic-entity-typing-blind-eval.html', 'semantic-entity-typing-blind-eval.html'],
  ['tools/liuyao/semantic/resolution/semantic-contextual-object-role-poc.html', 'semantic-contextual-object-role-poc.html'],
  ['tools/liuyao/semantic/resolution/semantic-contextual-object-role-blind-eval.html', 'semantic-contextual-object-role-blind-eval.html'],
  ['tools/liuyao/semantic/gates/semantic-scope-gate-v01.html', 'semantic-scope-gate-v01.html'],
  ['tools/liuyao/semantic/gates/semantic-sufficiency-test.html', 'semantic-sufficiency-test.html'],
  ['tools/liuyao/semantic/gates/semantic-slot-provider-test.html', 'semantic-slot-provider-test.html']
];
for (const [sourceRelative, deployedName] of legacyToolPages) {
  fs.copyFileSync(path.join(ROOT, sourceRelative), path.join(out, deployedName));
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
