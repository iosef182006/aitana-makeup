const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(`${__dirname}/script.js`, 'utf8');
const prefix = source.slice(0, source.indexOf('if ("scrollRestoration"'));
const persistence = source.slice(source.indexOf('function guardarConsultaPersistente()'), source.indexOf('\ntry {\n  const idsGuardados'));

function setup({ saved, cached, fail = true, blocked = false } = {}) {
  const store = new Map();
  if (saved) store.set('consulta', JSON.stringify(saved));
  if (cached) store.set('aitana-catalogo-respaldo-v1', JSON.stringify(cached));
  const context = vm.createContext({
    window: { location: { pathname: '/' } },
    document: { getElementById: () => null },
    console: { warn() {}, error() {} },
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return store.get(key) || null; },
      setItem: (key, value) => { if (blocked) throw Error('blocked'); store.set(key, value); }
    },
    fail, errors: 0, notice: null, renders: 0
  });
  vm.runInContext(`
    let productos = [];
    const productosConsulta = new Set();
    const variantesConsulta = new Map();
    const CONSULTA_STORAGE_KEY = 'consulta';
    let consultaGuardadaInicial = ${JSON.stringify(saved || [])};
    function obtenerIdProductoConsulta(p) { return p.slug; }
    function mostrarCargaCatalogo() {}
    async function obtenerProductosSupabase() { if (fail) throw Error('offline'); return {}; }
    async function cargarImagenesSupabase() { return []; }
    async function cargarVariantesSupabase() { return []; }
    function normalizarCatalogoSupabase() { return [{ nombre: 'Labial', slug: 'labial', variantes: [] }]; }
    ${prefix}
    ${persistence}
    mostrarEstadoRespaldo = fecha => { notice = fecha; };
    mostrarErrorCatalogo = () => { errors++; };
    refrescarInterfazCatalogo = () => {
      renders++;
      consultaGuardadaInicial.forEach(item => {
        const index = productos.findIndex(p => p.slug === item.id);
        if (index >= 0) productosConsulta.add(index);
      });
      if (!catalogoEsRespaldo) guardarConsultaPersistente();
    };
  `, context);
  return { context, store, load: () => vm.runInContext('cargarCatalogoSupabase()', context) };
}

test('Una caída sin respaldo conserva la consulta guardada', async () => {
  const saved = [{ id: 'labial', variante: '03' }];
  const h = setup({ saved });
  await h.load();
  assert.deepEqual(JSON.parse(h.store.get('consulta')), saved);
  assert.equal(h.context.errors, 1);
});

test('El respaldo muestra aviso y no sobrescribe la consulta con stock antiguo', async () => {
  const saved = [{ id: 'labial', variante: '03' }];
  const fecha = '2026-10-13T15:00:00.000Z';
  const h = setup({ saved, cached: { fecha, productos: [{ nombre: 'Labial', slug: 'labial', variantes: [], agotado: true }] } });
  await h.load();
  assert.equal(h.context.notice, fecha);
  assert.equal(h.context.renders, 1);
  assert.deepEqual(JSON.parse(h.store.get('consulta')), saved);
});

test('Al volver la conexión se renueva el respaldo y desaparece el aviso', async () => {
  const h = setup({ saved: [{ id: 'labial', variante: null }], fail: false });
  await h.load();
  const cache = JSON.parse(h.store.get('aitana-catalogo-respaldo-v1'));
  assert.equal(cache.productos[0].slug, 'labial');
  assert.ok(Number.isFinite(Date.parse(cache.fecha)));
  assert.equal(h.context.notice, null);
  assert.equal(h.context.errors, 0);
});

test('Un respaldo inválido se ignora sin perder la consulta', async () => {
  const h = setup({ saved: [{ id: 'labial' }], cached: { fecha: 'incorrecta', productos: [null] } });
  await h.load();
  assert.equal(h.context.errors, 1);
  assert.equal(h.context.renders, 0);
  assert.equal(JSON.parse(h.store.get('consulta'))[0].id, 'labial');
});

test('El almacenamiento bloqueado no impide cargar el catálogo online', async () => {
  const h = setup({ blocked: true, fail: false });
  await h.load();
  assert.equal(h.context.renders, 1);
  assert.equal(h.context.errors, 0);
});
