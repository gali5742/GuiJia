import fs from 'node:fs';
import { env } from '@huggingface/transformers';

// Historical browser modules set this to true. The freeze runner uses the same
// model/training code under Node, where browser cache is unavailable.
Object.defineProperty(env, 'useBrowserCache', {
  configurable:true,
  enumerable:true,
  get:() => false,
  set:() => {}
});

const nativeFetch = globalThis.fetch;
if (typeof nativeFetch !== 'function') throw new Error('global fetch is unavailable');

globalThis.fetch = async (input, init) => {
  const raw = input instanceof Request ? input.url : String(input);
  let url;
  try { url = new URL(raw); } catch { return nativeFetch(input, init); }
  if (url.protocol !== 'file:') return nativeFetch(input, init);
  try {
    const body = fs.readFileSync(url, 'utf8');
    return new Response(body, { status:200, headers:{ 'content-type':'application/json; charset=utf-8' } });
  } catch {
    return new Response('', { status:404 });
  }
};
