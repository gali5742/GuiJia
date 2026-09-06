import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '..');
const root = path.resolve(defaultRoot, process.argv[2] || '.');
const indexPath = path.join(root, 'index.html');
const MAX_PRODUCTION_JS_FILES = 32;
const MAX_PRODUCTION_JS_BYTES = 1_310_720; // 1.25 MiB, excludes vendor snapshots.
const forbiddenLoaderPatterns = Object.freeze([
    { label:'document.write', pattern:/\bdocument\.write\s*\(/ },
    { label:'script element creation', pattern:/createElement\s*\(\s*['"]script['"]\s*\)/ },
    { label:'dynamic script src assignment', pattern:/\.src\s*=\s*['"`][^'"`]*\.js/ }
]);

function fail(message) {
    throw new Error(message);
}

if (!fs.existsSync(indexPath)) fail(`Missing production entry: ${indexPath}`);
const html = fs.readFileSync(indexPath, 'utf8');
const scriptRefs = [...html.matchAll(/<script\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter((value) => !/^https?:\/\//i.test(value))
    .map((value) => value.split('#', 1)[0].split('?', 1)[0].replace(/^\.\//, ''))
    .filter((value) => value.startsWith('js/'));
const productionScripts = [...new Set(scriptRefs)];

if (productionScripts.includes('js/bazi-research-bootstrap.js')) {
    fail('Production entry must not opt into the BaZi research bootstrap.');
}

const missing = [];
const implicitLoaders = [];
let totalBytes = 0;
for (const relative of productionScripts) {
    const filename = path.join(root, relative);
    if (!fs.existsSync(filename)) {
        missing.push(relative);
        continue;
    }
    const source = fs.readFileSync(filename, 'utf8');
    totalBytes += Buffer.byteLength(source);
    for (const rule of forbiddenLoaderPatterns) {
        if (rule.pattern.test(source)) implicitLoaders.push(`${relative}: ${rule.label}`);
    }
}

if (missing.length) fail(`Production scripts missing:\n- ${missing.join('\n- ')}`);
if (implicitLoaders.length) {
    fail(`Production runtime contains implicit script loading:\n- ${implicitLoaders.join('\n- ')}`);
}
if (productionScripts.length > MAX_PRODUCTION_JS_FILES) {
    fail(`Production JS file budget exceeded: ${productionScripts.length} > ${MAX_PRODUCTION_JS_FILES}`);
}
if (totalBytes > MAX_PRODUCTION_JS_BYTES) {
    fail(`Production JS byte budget exceeded: ${totalBytes} > ${MAX_PRODUCTION_JS_BYTES}`);
}

console.log('Production runtime boundary verification passed');
console.log(`- ${productionScripts.length} explicit production JS file(s)`);
console.log(`- ${totalBytes} production JS byte(s), excluding vendor snapshots`);
console.log('- 0 implicit production script loader(s)');
