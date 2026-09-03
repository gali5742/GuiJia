import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const testsDir = path.join(root, 'tests');
const files = fs.readdirSync(testsDir)
    .filter((name) => name.startsWith('bazi-') && name.endsWith('-tests.js'))
    .sort();

const findings = [];
for (const name of files) {
    const source = fs.readFileSync(path.join(testsDir, name), 'utf8');
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
        if (!/(index\.html|生产加载路径|生产页面没有|静态页面存在)/.test(line)) return;
        findings.push({ file:name, line:index + 1, text:line.trim() });
    });
}

console.log(`BaZi test/runtime coupling audit: ${findings.length} matching line(s)`);
findings.forEach((item) => console.log(`${item.file}:${item.line}: ${item.text}`));
