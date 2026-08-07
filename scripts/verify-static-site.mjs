import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const target = path.resolve(root, process.argv[2] || '.');
const mode = process.argv[3] || 'source';
const indexPath = path.join(target, 'index.html');

function fail(message) {
  throw new Error(message);
}
function isRemote(value) {
  return /^https?:\/\//i.test(value);
}
function isIgnorable(value) {
  return !value || value.startsWith('#') || value.startsWith('data:') || value.startsWith('mailto:') || value.startsWith('tel:') || value.startsWith('javascript:');
}
function cleanLocal(value) {
  const stripped = value.split('#', 1)[0].split('?', 1)[0];
  return stripped.replace(/^\.\//, '');
}

if (!fs.existsSync(indexPath)) fail(`Missing index.html: ${indexPath}`);
const html = fs.readFileSync(indexPath, 'utf8');

const refs = [];
for (const match of html.matchAll(/<(script|img|link)\b[^>]*?\b(src|href)=["']([^"']+)["'][^>]*>/gi)) {
  refs.push({ tag: match[1].toLowerCase(), attr: match[2].toLowerCase(), value: match[3] });
}

const missing = [];
const remoteScripts = [];
for (const ref of refs) {
  if (isIgnorable(ref.value)) continue;
  if (isRemote(ref.value)) {
    if (ref.tag === 'script') remoteScripts.push(ref.value);
    continue;
  }
  const local = cleanLocal(ref.value);
  if (!local) continue;
  const file = path.join(target, local);
  if (!fs.existsSync(file)) missing.push(`${ref.tag} ${ref.attr}=${ref.value}`);
}

if (missing.length) fail(`Missing local resources:\n- ${missing.join('\n- ')}`);

if (mode === 'deployed') {
  if (remoteScripts.length) fail(`Deployed artifact contains remote executable scripts:\n- ${remoteScripts.join('\n- ')}`);
  for (const expected of ['vendor/vue.global.prod.js', 'vendor/lunar.js', 'assets/app.css', 'assets/tailwind-utilities.css', 'js/app.js']) {
    if (!fs.existsSync(path.join(target, expected))) fail(`Deployed artifact missing required file: ${expected}`);
  }
  if (!fs.existsSync(path.join(target, 'vendor-lock.json'))) fail('Deployed artifact missing vendor-lock.json');
} else {
  const approvedRemoteScripts = new Set([
    'https://unpkg.com/vue@3.5.40/dist/vue.global.prod.js',
    'https://unpkg.com/lunar-javascript@1.7.7/lunar.js'
  ]);
  const unexpected = remoteScripts.filter((url) => !approvedRemoteScripts.has(url));
  if (unexpected.length) fail(`Source contains unexpected remote executable scripts:\n- ${unexpected.join('\n- ')}`);
}

if (!html.includes('<meta name="viewport"')) fail('Missing viewport meta');
if (!html.includes('<meta name="description"')) fail('Missing description meta');
if (!html.includes('<html lang="zh-CN">')) fail('Unexpected or missing html lang');

console.log(`Static site verification passed (${mode}): ${target}`);
console.log(`- ${refs.length} static refs inspected`);
console.log(`- ${remoteScripts.length} remote script ref(s)`);
