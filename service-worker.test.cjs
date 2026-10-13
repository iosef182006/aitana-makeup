const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(`${__dirname}/service-worker.js`, 'utf8');

function setup() {
  const handlers = {};
  let staticOptions;
  const context = vm.createContext({
    URL, Request, Response,
    self: { location: { origin: 'https://aitana.local' }, addEventListener: (type, fn) => { handlers[type] = fn; } },
    fetch: async () => { throw Error('offline'); },
    caches: { open: async name => ({
      match: async (request, options) => {
        if (name.endsWith('-static')) { staticOptions = options; return new Response('cached script'); }
        if (typeof request !== 'string' && request.url.includes('/_vercel/image')) return new Response('cached image');
        return undefined;
      }
    }) }
  });
  vm.runInContext(source, context);
  return { context, handlers, options: () => staticOptions };
}

test('Los scripts versionados usan el respaldo estático sin conexión', async () => {
  const h = setup();
  h.context.request = new Request('https://aitana.local/script.js?v=22');
  const response = await vm.runInContext('networkFirst(request)', h.context);
  assert.equal(await response.text(), 'cached script');
  assert.equal(h.options().ignoreSearch, true);
});

test('Las miniaturas optimizadas ya vistas funcionan sin conexión', async () => {
  const h = setup(); let result;
  h.handlers.fetch({ request: { method: 'GET', url: 'https://aitana.local/_vercel/image?url=product&w=640', destination: 'image' }, respondWith: promise => { result = promise; } });
  assert.ok(result);
  assert.equal(await (await result).text(), 'cached image');
});

test('El worker no almacena peticiones de datos ni autenticación de Supabase', () => {
  const h = setup();
  for (const path of ['/rest/v1/products', '/auth/v1/user']) {
    let intercepted = false;
    h.handlers.fetch({ request: { method: 'GET', url: `https://vbbnjaquoxzcoanzrhuk.supabase.co${path}`, destination: '' }, respondWith() { intercepted = true; } });
    assert.equal(intercepted, false);
  }
});
