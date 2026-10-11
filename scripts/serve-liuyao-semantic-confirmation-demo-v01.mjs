import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const demoFiles = Object.freeze(['demos/liuyao-role-target-confirmation.html', 'demos/liuyao-role-target-confirmation.css',
  'demos/liuyao-role-target-confirmation.js', 'js/liuyao-semantic-fallback-identity-model-v02.js',
  'js/liuyao-semantic-role-target-gate-v01.js', 'js/liuyao-semantic-confirmation-session-v01.js']);

export function createDemoServer() {
  const assets = new Map(demoFiles.map(file => [`/${file}`, fs.readFileSync(path.join(root, file))]));
  const server = http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, {allow: 'GET, HEAD'}); response.end(); return; }
    let pathname;
    try { pathname = new URL(request.url, 'http://demo.invalid').pathname; }
    catch { response.writeHead(400); response.end(); return; }
    if (pathname === '/') pathname = '/demos/liuyao-role-target-confirmation.html';
    // No directory serving or dynamic filesystem access; every other path is rejected.
    if (!assets.has(pathname)) { response.writeHead(404); response.end('Not an allowed demo asset'); return; }
    const type = pathname.endsWith('.html') ? 'text/html' : pathname.endsWith('.css') ? 'text/css' : 'text/javascript';
    response.writeHead(200, {'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store'});
    response.end(request.method === 'HEAD' ? undefined : assets.get(pathname));
  });
  return {server, assets};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.GUIJIA_CONFIRMATION_PORT || 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('GUIJIA_CONFIRMATION_PORT must be between 1 and 65535');
  const {server} = createDemoServer();
  server.on('error', error => { console.error(`Demo server failed: ${error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Confirmation demo listening on port ${port}; only six demo assets are served.`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}
