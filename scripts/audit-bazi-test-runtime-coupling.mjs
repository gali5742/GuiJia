import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const testsDir = path.join(root, 'tests');
const files = fs.readdirSync(testsDir)
    .filter((name) => name.startsWith('bazi-') && name.endsWith('-tests.js'))
    .sort();

// These phrases encode the old architectural contract that research modules must be
// reachable through the production page/Assessment loader. Production and research
// runtimes are now intentionally separate, so reintroducing this premise is a failure.
const stalePatterns = [
    /生产加载路径/,
    /生产页面没有[^\n]*加载路径/,
    /静态页面存在[^\n]*生产加载路径/
];

const findings = [];
for (const name of files) {
    const source = fs.readFileSync(path.join(testsDir, name), 'utf8');
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
        if (!stalePatterns.some((pattern) => pattern.test(line))) return;
        findings.push({ file:name, line:index + 1, text:line.trim() });
    });
}

if (findings.length) {
    const details = findings.map((item) => `${item.file}:${item.line}: ${item.text}`).join('\n');
    throw new Error(`Stale BaZi production/research coupling assertions detected:\n${details}`);
}

console.log(`BaZi test/runtime coupling audit passed (${files.length} test file(s) scanned)`);
