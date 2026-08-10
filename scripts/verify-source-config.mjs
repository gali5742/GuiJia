import fs from 'node:fs';
import path from 'node:path';
import { ROOT, getConfig, readJson } from './vendor-lib.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const config = getConfig();
const pkg = readJson(path.join(ROOT, 'package.json'));
const versions = readJson(path.join(ROOT, 'vendor-versions.json'));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

for (const dep of Object.values(config.packages)) {
  assert(pkg.devDependencies?.[dep.packageName] === dep.version,
    `package.json pin mismatch: ${dep.packageName}`);
  assert(versions.production?.[dep.packageName] === dep.version,
    `vendor-versions.json mismatch: ${dep.packageName}`);
  assert(html.includes(dep.localScript),
    `index.html must use checked-in local vendor reference: ${dep.packageName}`);
  assert(!html.includes(dep.sourceScript),
    `index.html still contains remote runtime reference: ${dep.packageName}`);
}

assert(fs.existsSync(path.join(ROOT, '.github/dependabot.yml')), 'Missing Dependabot config');
assert(fs.existsSync(path.join(ROOT, '.github/workflows/dependency-watch.yml')), 'Missing dependency watch workflow');
assert(fs.existsSync(path.join(ROOT, '.github/workflows/pages.yml')), 'Missing Pages vendor deployment workflow');
assert(fs.existsSync(path.join(ROOT, '.github/workflows/test.yml')), 'Missing CI workflow');

console.log('Source dependency configuration verified: runtime references are local vendor only.');
