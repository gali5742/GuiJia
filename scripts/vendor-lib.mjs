import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(SCRIPT_DIR, '..');

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function getConfig() {
  return readJson(path.join(ROOT, 'vendor-config.json'));
}

export function sha256File(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

export function verifyIntegrity(buffer, integrity) {
  const [algorithm, expected] = integrity.split('-', 2);
  if (!algorithm || !expected) throw new Error(`Invalid integrity: ${integrity}`);
  const actual = crypto.createHash(algorithm).update(buffer).digest('base64');
  if (actual !== expected) {
    throw new Error(`Integrity mismatch: expected ${integrity}, got ${algorithm}-${actual}`);
  }
}

export async function downloadBuffer(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'Guijia-vendor-builder/13.32.0' }
  });
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function extractTarball(tgzFile, extractDir) {
  fs.mkdirSync(extractDir, { recursive: true });
  const result = spawnSync('tar', ['-xzf', tgzFile, '-C', extractDir], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    throw new Error('Unable to extract npm tarball. A tar-compatible command is required.');
  }
}

function copyChecked(src, dest, minimumBytes = 1) {
  if (!fs.existsSync(src)) throw new Error(`Missing extracted file: ${src}`);
  const size = fs.statSync(src).size;
  if (size < minimumBytes) throw new Error(`Unexpectedly small file: ${src} (${size} bytes)`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return size;
}

export function rewriteIndexToLocal(targetRoot, config = getConfig()) {
  const indexPath = path.join(targetRoot, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  for (const pkg of Object.values(config.packages)) {
    if (html.includes(pkg.sourceScript)) {
      html = html.split(pkg.sourceScript).join(pkg.localScript);
    }
    if (!html.includes(pkg.localScript)) {
      throw new Error(`index.html contains neither expected remote nor local reference for ${pkg.packageName}`);
    }
  }
  fs.writeFileSync(indexPath, html);
}

export async function materializeVendor(targetRoot, { rewriteHtml = true } = {}) {
  const config = getConfig();
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'guijia-vendor-'));
  const lock = {
    schemaVersion: 1,
    source: 'verified npm package tarballs',
    packages: {}
  };

  try {
    for (const [key, pkg] of Object.entries(config.packages)) {
      process.stdout.write(`Fetching ${pkg.packageName}@${pkg.version}... `);
      const tgz = await downloadBuffer(pkg.tarballUrl);
      verifyIntegrity(tgz, pkg.tarballIntegrity);
      console.log('integrity OK');

      const tgzPath = path.join(work, `${key}.tgz`);
      const extractDir = path.join(work, key);
      fs.writeFileSync(tgzPath, tgz);
      extractTarball(tgzPath, extractDir);

      const outputPath = path.join(targetRoot, pkg.outputFile);
      const licensePath = path.join(targetRoot, pkg.licenseOutputFile);
      const bytes = copyChecked(path.join(extractDir, pkg.archiveFile), outputPath, pkg.minimumBytes);
      copyChecked(path.join(extractDir, pkg.licenseFile), licensePath, 500);

      lock.packages[key] = {
        packageName: pkg.packageName,
        version: pkg.version,
        tarballIntegrity: pkg.tarballIntegrity,
        file: pkg.outputFile,
        bytes,
        sha256: sha256File(outputPath),
        license: pkg.licenseOutputFile
      };
    }

    if (rewriteHtml) rewriteIndexToLocal(targetRoot, config);
    fs.writeFileSync(path.join(targetRoot, 'vendor-lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
    return lock;
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

export function verifyVendorTree(targetRoot) {
  const config = getConfig();
  const lockPath = path.join(targetRoot, 'vendor-lock.json');
  if (!fs.existsSync(lockPath)) throw new Error(`Missing ${lockPath}`);
  const lock = readJson(lockPath);
  const html = fs.readFileSync(path.join(targetRoot, 'index.html'), 'utf8');

  for (const [key, pkg] of Object.entries(config.packages)) {
    const entry = lock.packages?.[key];
    if (!entry) throw new Error(`Missing vendor lock entry: ${key}`);
    if (entry.version !== pkg.version) throw new Error(`${key} lock version mismatch`);
    if (entry.tarballIntegrity !== pkg.tarballIntegrity) throw new Error(`${key} integrity metadata mismatch`);
    if (!html.includes(pkg.localScript)) throw new Error(`index.html is not using local ${key}`);
    if (html.includes(pkg.sourceScript)) throw new Error(`index.html still uses remote ${key}`);

    const file = path.join(targetRoot, pkg.outputFile);
    if (!fs.existsSync(file)) throw new Error(`Missing vendor file: ${pkg.outputFile}`);
    const bytes = fs.statSync(file).size;
    if (bytes < pkg.minimumBytes) throw new Error(`${pkg.outputFile} is too small (${bytes})`);
    const digest = sha256File(file);
    if (digest !== entry.sha256) throw new Error(`${pkg.outputFile} SHA-256 mismatch`);

    const license = path.join(targetRoot, pkg.licenseOutputFile);
    if (!fs.existsSync(license) || fs.statSync(license).size < 500) {
      throw new Error(`Missing/invalid license: ${pkg.licenseOutputFile}`);
    }
  }

  return lock;
}
