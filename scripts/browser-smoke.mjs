import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const siteRoot = path.resolve(root, process.argv[2] || '.site');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(fs.existsSync(path.join(siteRoot, 'index.html')), `Missing built site index: ${path.join(siteRoot, 'index.html')}`);

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon']
]);
const allowedOptionalLocalMisses = new Set(['/data/iching.json']);

const server = http.createServer((request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
    const file = path.resolve(siteRoot, relativePath);

    if (file !== siteRoot && !file.startsWith(`${siteRoot}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end('Not Found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes.get(path.extname(file).toLowerCase()) || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(response);
  } catch (error) {
    response.writeHead(500).end(error.message);
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const address = server.address();
assert(address && typeof address === 'object', 'Browser smoke server did not expose an address');
const baseUrl = `http://127.0.0.1:${address.port}/`;
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage();
const pageErrors = [];
const failedLocalResponses = [];
const optionalLocalMisses = [];

page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('response', (response) => {
  if (!response.url().startsWith(baseUrl) || response.status() < 400) return;
  const pathname = new URL(response.url()).pathname;
  if (response.status() === 404 && allowedOptionalLocalMisses.has(pathname)) {
    optionalLocalMisses.push(`${response.status()} ${pathname}`);
    return;
  }
  failedLocalResponses.push(`${response.status()} ${response.url()}`);
});

const assertBrowserHealthy = (stage) => {
  assert(pageErrors.length === 0, `Browser page error(s) ${stage}:\n- ${pageErrors.join('\n- ')}`);
  assert(failedLocalResponses.length === 0, `Built-site request failure(s) ${stage}:\n- ${failedLocalResponses.join('\n- ')}`);
};

try {
  const response = await page.goto(baseUrl, { waitUntil:'domcontentloaded', timeout:30_000 });
  assert(response?.ok(), `Initial page request failed: ${response?.status() || 'no response'}`);

  await page.waitForFunction(() => {
    const app = document.querySelector('#app');
    return Boolean(app && !app.hasAttribute('v-cloak'));
  }, undefined, { timeout:15_000 });

  assertBrowserHealthy('after initial mount');

  const app = page.locator('#app');
  assert(await app.count() === 1, 'Mounted #app root is missing');
  assert(await page.locator('.module-tab-name', { hasText:'八字' }).count() === 1, 'BaZi module entry is missing');
  assert(await page.locator('.module-tab-name', { hasText:'六爻' }).count() === 1, 'LiuYao module entry is missing');
  assert(await page.getByText('出生信息', { exact:true }).count() >= 1, 'Default BaZi input view did not render');
  assert(await page.locator('input[type="datetime-local"]').count() >= 1, 'BaZi datetime input did not render');

  const baziDateTime = page.locator('input[type="datetime-local"]').first();
  await baziDateTime.fill('2000-01-01T12:00');
  await page.getByRole('button', { name:'开始八字排盘', exact:true }).click();
  await page.waitForURL(/#bazi-result$/, { timeout:10_000 });
  await page.getByRole('heading', { name:'原局四柱', exact:true }).waitFor({ state:'visible', timeout:10_000 });
  assert(await page.locator('.bazi-item').count() === 4, 'BaZi happy path did not render four pillars');
  assertBrowserHealthy('after BaZi calculation');

  await page.getByRole('button', { name:'← 返回修改信息', exact:true }).click();
  await page.getByText('出生信息', { exact:true }).waitFor({ state:'visible', timeout:5_000 });

  const liuyaoTab = page.locator('button.module-tab').filter({ hasText:'六爻' });
  await liuyaoTab.click();
  await page.getByRole('heading', { name:'六爻排盘', exact:true }).first().waitFor({ state:'visible', timeout:5_000 });

  const liuyaoDateTime = page.locator('input[type="datetime-local"]').first();
  await liuyaoDateTime.fill('2026-01-15T12:00');
  const lineSelectors = page.locator('.yao-entry-grid select');
  assert(await lineSelectors.count() === 6, 'LiuYao input did not render six line selectors');
  const deterministicLinesTopToBottom = ['8', '7', '6', '7', '8', '9'];
  for (let index = 0; index < deterministicLinesTopToBottom.length; index += 1) {
    await lineSelectors.nth(index).selectOption(deterministicLinesTopToBottom[index]);
  }
  await page.getByRole('button', { name:'开始六爻排盘', exact:true }).click();
  await page.waitForURL(/#liuyao-result$/, { timeout:10_000 });
  await page.getByRole('heading', { name:'卦象总览', exact:true }).waitFor({ state:'visible', timeout:10_000 });
  assert(await page.locator('.hexagram-summary-card').count() === 2, 'LiuYao happy path did not render original and changed hexagrams');
  assertBrowserHealthy('after LiuYao calculation');

  console.log(`Built-site browser smoke passed: ${baseUrl}`);
  console.log('- Vue mounted and removed v-cloak');
  console.log('- BaZi input → calculation → four-pillar result completed in Chromium');
  console.log('- LiuYao input → six-line calculation → original/changed hexagram result completed in Chromium');
  console.log('- no browser page errors or unexpected failed same-origin asset responses');
  if (optionalLocalMisses.length) {
    console.log(`- allowed optional local fallback miss(es): ${optionalLocalMisses.join(', ')}`);
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
