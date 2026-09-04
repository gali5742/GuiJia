import fs from 'node:fs';
import path from 'node:path';
import { ROOT, verifyVendorTree } from './vendor-lib.mjs';

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const sourceVersion = packageJson.version;
const buildIdentitySource = process.env.GUIJIA_BUILD_ID
  ? 'GUIJIA_BUILD_ID'
  : process.env.GITHUB_SHA
    ? 'GITHUB_SHA'
    : 'local-fallback';
const rawBuildIdentity = String(process.env.GUIJIA_BUILD_ID || process.env.GITHUB_SHA || `local-${sourceVersion}`).trim();
const cacheKey = /^[0-9a-f]{7,40}$/i.test(rawBuildIdentity)
  ? rawBuildIdentity.slice(0, 12).toLowerCase()
  : rawBuildIdentity
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);

if (!cacheKey) {
  throw new Error('Unable to derive a static cache key from GUIJIA_BUILD_ID, GITHUB_SHA, or the local fallback.');
}

const sourceCacheToken = `?v=${sourceVersion}`;
const builtCacheToken = `?v=${cacheKey}`;
const sourceRuntimeLabel = `GuiJia v${sourceVersion}`;
const builtRuntimeLabel = `GuiJia build ${cacheKey}`;
const rewriteExtensions = new Set(['.html', '.js', '.css', '.json', '.md']);

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

function rewriteStaticCacheKeys(directory) {
  let replacementCount = 0;
  for (const file of collectFiles(directory)) {
    if (!rewriteExtensions.has(path.extname(file).toLowerCase())) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes(sourceCacheToken)) continue;
    const matches = source.split(sourceCacheToken).length - 1;
    fs.writeFileSync(file, source.replaceAll(sourceCacheToken, builtCacheToken));
    replacementCount += matches;
  }
  return replacementCount;
}

function rewriteRuntimeIdentityComment(file) {
  const source = fs.readFileSync(file, 'utf8');
  const matches = source.split(sourceRuntimeLabel).length - 1;
  if (matches !== 1) {
    throw new Error(`Expected exactly one ${sourceRuntimeLabel} runtime label in ${path.relative(ROOT, file)}, found ${matches}.`);
  }
  fs.writeFileSync(file, source.replace(sourceRuntimeLabel, builtRuntimeLabel));
  return matches;
}

const out = path.join(ROOT, '.site');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const name of ['index.html', 'rule-registry-test.html', 'semantic-router-poc.html', 'semantic-router-poc-v02.html', 'semantic-router-poc-v03.html', 'semantic-router-poc-v04.html', 'semantic-router-poc-v05.html', 'semantic-router-poc-v06.html', 'semantic-router-poc-v07.html', 'semantic-router-poc-v08.html', 'semantic-router-poc-v081.html', 'semantic-router-candidate-eval-v01.html', 'semantic-router-decision-v09.html', 'semantic-scope-gate-v01.html', 'semantic-decision-stack-v010.html', 'semantic-decision-stack-v011.html', 'semantic-decision-stack-v011-sealed-blind-v01.html', 'semantic-decision-stack-v012.html', 'semantic-decision-stack-v012-sealed-blind-v01.html', 'semantic-router-runtime-v01.html', 'semantic-sufficiency-test.html', 'semantic-slot-provider-test.html', 'semantic-object-resolver-test.html', 'semantic-entity-typing-poc.html', 'semantic-entity-typing-blind-eval.html', 'semantic-contextual-object-role-poc.html', 'semantic-contextual-object-role-blind-eval.html', 'README.md', 'vendor-versions.json', '.nojekyll']) {
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

const replacementCount = rewriteStaticCacheKeys(out);
if (!replacementCount) {
  throw new Error(`No static cache references matched ${sourceCacheToken}; source version/query markers may have drifted.`);
}
const runtimeLabelReplacementCount = rewriteRuntimeIdentityComment(path.join(out, 'index.html'));

fs.writeFileSync(
  path.join(out, 'build-meta.json'),
  `${JSON.stringify({
    schemaVersion:1,
    sourceVersion,
    cacheKey,
    buildIdentitySource,
    replacementCount,
    runtimeLabelReplacementCount
  }, null, 2)}\n`
);

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
console.log(`Static cache key: ${cacheKey} (${buildIdentitySource}); replaced ${replacementCount} ${sourceCacheToken} reference(s)`);
console.log(`Runtime identity comment: ${builtRuntimeLabel}`);
