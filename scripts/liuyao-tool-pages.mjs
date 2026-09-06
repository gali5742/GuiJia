import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(ROOT, 'tools/liuyao/pages.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (manifest.version !== 1 || !Array.isArray(manifest.pages)) {
  throw new Error('Invalid tools/liuyao/pages.json manifest');
}

const byDeployedName = new Map();
const sourcePaths = new Set();
for (const page of manifest.pages) {
  if (!page || typeof page.source !== 'string' || typeof page.deployAs !== 'string' || typeof page.group !== 'string') {
    throw new Error('Malformed LiuYao tool page manifest entry');
  }
  if (byDeployedName.has(page.deployAs)) throw new Error(`Duplicate LiuYao deployAs: ${page.deployAs}`);
  if (sourcePaths.has(page.source)) throw new Error(`Duplicate LiuYao tool source: ${page.source}`);
  const absolute = path.join(ROOT, page.source);
  if (!fs.existsSync(absolute)) throw new Error(`Missing LiuYao tool page source: ${page.source}`);
  byDeployedName.set(page.deployAs, Object.freeze({ ...page, absolute }));
  sourcePaths.add(page.source);
}

export const LIUYAO_TOOL_PAGES = Object.freeze(manifest.pages.map((page) => Object.freeze({ ...page })));

export function resolveLiuYaoToolPage(deployedName) {
  const page = byDeployedName.get(deployedName);
  if (!page) throw new Error(`Unknown LiuYao tool page: ${deployedName}`);
  return page.absolute;
}

export function getLiuYaoToolPage(deployedName) {
  const page = byDeployedName.get(deployedName);
  if (!page) throw new Error(`Unknown LiuYao tool page: ${deployedName}`);
  return page;
}
