import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.json';
const lockPath = 'data/liuyao-semantic-frozen-dependencies-v0.2.lock.json';
const harnessPath = 'scripts/run-liuyao-semantic-frozen-dependencies-v02-node.mjs';
const generatorPath = 'scripts/generate-liuyao-semantic-frozen-dependencies-v02-single-text.mjs';
const tmpGenerator = path.join(root, 'scripts/.generate-liuyao-semantic-frozen-dependencies-v02.node-tmp.mjs');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = (relative) => JSON.parse(read(relative));
const sha256Text = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
const sha256File = (relative) => sha256Text(read(relative));
const sourceRecord = (relative) => ({ path:relative, sha256:sha256File(relative) });

const generatorSource = read(generatorPath);
const anchor = `  patched = replaceExact(\n    patched,\n    \"const MODEL_DTYPE = 'q8';\",`;
const replacement = `  patched = replaceExact(\n    patched,\n    'env.useBrowserCache = true;',\n    'env.useBrowserCache = false;',\n    \`\${kind} Node cache compatibility\`\n  );\n  patched = replaceExact(\n    patched,\n    \"const MODEL_DTYPE = 'q8';\",`;
if (!generatorSource.includes(anchor)) throw new Error('Node cache instrumentation anchor missing in corrected dependency generator');
const instrumentedGenerator = generatorSource.replace(anchor, replacement);
fs.writeFileSync(tmpGenerator, instrumentedGenerator, 'utf8');

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
  await import(`${pathToFileURL(tmpGenerator).href}?harness=${Date.now()}`);
} finally {
  globalThis.fetch = originalFetch;
  try { fs.unlinkSync(tmpGenerator); } catch {}
}

const artifact = readJson(artifactPath);
const lock = readJson(lockPath);
artifact.correction = {
  ...artifact.correction,
  nodeExecutionHarness:{
    ...sourceRecord(harnessPath),
    mode:'file_url_read_only_fetch_plus_node_cache_compatibility',
    purpose:'allow historical browser modules to read the exact same repository JSON files and load the pinned encoder under Node without changing data, model logic, hyperparameters, or encoder execution',
    networkFetchBehaviorChanged:false,
    localFileContentTransformed:false,
    browserCacheSettingChangedForNodeOnly:true,
    browserCacheSettingFrom:true,
    browserCacheSettingTo:false
  },
  underlyingGenerator:sourceRecord(generatorPath),
  generatorInstrumentation:{
    baseGeneratorSha256:sha256File(generatorPath),
    temporaryOnly:true,
    permittedChanges:['env.useBrowserCache_true_to_false_in_temporary_router_and_scope_modules'],
    modelOrDataLogicChanged:false
  }
};
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
fs.writeFileSync(path.join(root, artifactPath), serialized, 'utf8');
const artifactSha256 = sha256Text(serialized);
fs.writeFileSync(path.join(root, lockPath), `${JSON.stringify({
  ...lock,
  artifactSha256,
  nodeExecutionHarnessSha256:sha256File(harnessPath)
}, null, 2)}\n`, 'utf8');
console.log(`Corrected dependency artifact postprocessed with Node harness provenance: ${artifactSha256}`);
