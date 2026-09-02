import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const lockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const harnessPath = 'scripts/run-liuyao-semantic-frozen-dependencies-v02-node.mjs';
const generatorPath = 'scripts/generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs';
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (relative) => sha256Text(read(relative));
const sourceRecord = (relative) => ({ path:relative, sha256:sha256File(relative) });

const originalFetch = globalThis.fetch;
if (typeof originalFetch !== 'function') throw new Error('Node global fetch is unavailable');

globalThis.fetch = async (input, init) => {
  const url = input instanceof URL ? input : (() => {
    try { return new URL(String(input)); } catch { return null; }
  })();
  if (url?.protocol === 'file:') {
    const body = fs.readFileSync(url);
    return new Response(body, {
      status:200,
      headers:{ 'content-type':'application/json; charset=utf-8' }
    });
  }
  return originalFetch(input, init);
};

try {
  await import(`./generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs?harness=${Date.now()}`);
} finally {
  globalThis.fetch = originalFetch;
}

const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
artifact.correction = {
  ...artifact.correction,
  nodeExecutionHarness:{
    ...sourceRecord(harnessPath),
    mode:'file_url_read_only_fetch_compatibility',
    purpose:'allow historical browser modules to read the exact same repository JSON files under Node without changing data, model logic, or encoder execution',
    networkFetchBehaviorChanged:false,
    localFileContentTransformed:false
  },
  underlyingGenerator:sourceRecord(generatorPath)
};
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
fs.writeFileSync(path.join(root, artifactPath), serialized, 'utf8');
const artifactSha256 = sha256Text(serialized);
fs.writeFileSync(path.join(root, lockPath), `${JSON.stringify({
  ...lock,
  artifactSha256,
  nodeExecutionHarnessSha256:sha256File(harnessPath)
}, null, 2)}\n`, 'utf8');
console.log(`Corrected dependency artifact postprocessed with Node local-file harness provenance: ${artifactSha256}`);
