import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'scripts/generate-liuyao-semantic-v013-candidate-v04-fallback-identity-v02-calibration-v03.mjs');
let source = fs.readFileSync(target, 'utf8');
const marker = 'const nearDomain = {';
const start = source.indexOf(marker);
const end = source.indexOf('\n};\n\nconst outsideCurrent22', start);
if (start < 0 || end < 0) throw new Error('nearDomain block not found');
const before = source.slice(0, start);
let block = source.slice(start, end + 3);
const after = source.slice(end + 3);
const malformed = block.match(/^    '[^'\n]*','[^'\n]*'\],?$/gm) || [];
if (malformed.length === 0) {
  const repaired = block.match(/^    \['[^'\n]*','[^'\n]*'\],?$/gm) || [];
  if (repaired.length !== 88) throw new Error(`expected 88 repaired near-domain pairs, found ${repaired.length}`);
  console.log('Calibration v0.3 generator syntax already repaired.');
  process.exit(0);
}
if (malformed.length !== 88) throw new Error(`expected 88 malformed near-domain pairs, found ${malformed.length}`);
block = block.replace(/^(    )('[^'\n]*','[^'\n]*'\],?)$/gm, '$1[$2');
const repaired = block.match(/^    \['[^'\n]*','[^'\n]*'\],?$/gm) || [];
if (repaired.length !== 88) throw new Error(`repair produced ${repaired.length} near-domain pairs, expected 88`);
source = before + block + after;
fs.writeFileSync(target, source, 'utf8');
console.log('Calibration v0.3 generator syntax repaired deterministically.');
console.log('- repaired near-domain [text, wordingPattern] pairs: 88');
console.log('- calibration wording/labels/schema unchanged');
console.log('- encoder scoring: 0');
