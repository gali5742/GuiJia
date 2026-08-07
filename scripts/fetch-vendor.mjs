import path from 'node:path';
import { ROOT, materializeVendor } from './vendor-lib.mjs';

const args = process.argv.slice(2);
const targetIndex = args.indexOf('--target');
const target = targetIndex >= 0 && args[targetIndex + 1]
  ? path.resolve(ROOT, args[targetIndex + 1])
  : ROOT;
const rewriteHtml = !args.includes('--no-rewrite-html');

await materializeVendor(target, { rewriteHtml });
console.log(`Vendor snapshots materialized at ${target}`);
