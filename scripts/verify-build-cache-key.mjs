import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const target = path.resolve(root, process.argv[2] || '.site');
const metaPath = path.join(target, 'build-meta.json');
const inspectExtensions = new Set(['.html', '.js', '.css', '.json', '.md']);

function fail(message) {
  throw new Error(message);
}

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name === 'vendor') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath, files);
    else if (inspectExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

if (!fs.existsSync(metaPath)) fail(`Missing build metadata: ${metaPath}`);

let meta;
try {
  meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
} catch (error) {
  fail(`Invalid build-meta.json: ${error.message}`);
}

if (meta.schemaVersion !== 1) fail(`Unexpected build metadata schema: ${meta.schemaVersion}`);
if (typeof meta.sourceVersion !== 'string' || !meta.sourceVersion.trim()) fail('build-meta sourceVersion is missing');
if (typeof meta.cacheKey !== 'string' || !/^[A-Za-z0-9._-]+$/.test(meta.cacheKey)) fail(`Invalid build cacheKey: ${meta.cacheKey}`);
if (!Number.isInteger(meta.replacementCount) || meta.replacementCount <= 0) fail(`Invalid replacementCount: ${meta.replacementCount}`);
if (meta.cacheKey === meta.sourceVersion) fail('Built cache key must be distinct from the source release version');

const staleToken = `?v=${meta.sourceVersion}`;
const builtToken = `?v=${meta.cacheKey}`;
const staleFiles = [];
let builtReferenceCount = 0;

for (const file of collectFiles(target)) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(staleToken)) staleFiles.push(path.relative(target, file));
  builtReferenceCount += source.split(builtToken).length - 1;
}

if (staleFiles.length) {
  fail(`Built artifact still contains stale ${staleToken} reference(s):\n- ${staleFiles.join('\n- ')}`);
}
if (builtReferenceCount < meta.replacementCount) {
  fail(`Built cache-key reference count ${builtReferenceCount} is below recorded replacement count ${meta.replacementCount}`);
}

for (const relative of ['index.html', 'js/bazi-research-bootstrap.js']) {
  const file = path.join(target, relative);
  if (!fs.existsSync(file)) fail(`Missing cache-key verification target: ${relative}`);
  const source = fs.readFileSync(file, 'utf8');
  const versionTokens = [...source.matchAll(/\?v=([A-Za-z0-9._-]+)/g)].map((match) => match[1]);
  if (!versionTokens.length) fail(`${relative} contains no versioned static references`);
  const mismatched = [...new Set(versionTokens.filter((value) => value !== meta.cacheKey))];
  if (mismatched.length) fail(`${relative} contains cache key(s) other than ${meta.cacheKey}: ${mismatched.join(', ')}`);
}

console.log(`Built static cache-key verification passed: ${target}`);
console.log(`- source version: ${meta.sourceVersion}`);
console.log(`- cache key: ${meta.cacheKey} (${meta.buildIdentitySource || 'unknown source'})`);
console.log(`- ${meta.replacementCount} source-version reference(s) rewritten`);
console.log(`- ${builtReferenceCount} build-key reference(s) inspected outside vendor snapshots`);
