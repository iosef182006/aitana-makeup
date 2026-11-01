const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const source = fs.readFileSync(`${__dirname}/script.js`, 'utf8');
const start = source.indexOf('const imagenesFallidasReportadas = new Set();');
const end = source.indexOf('function codificarDatoImagen(', start);
const imageFallback = source.slice(start, end);

function setup() {
  const context = vm.createContext({
    URL,
    window: { location: { protocol: 'https:' }, AITANA_SUPABASE_CONFIG: { url: 'https://supabase.example' } },
    document: { baseURI: 'https://aitana.example/' },
    console: { warn() {} }
  });
  vm.runInContext(`const SUPABASE_PRODUCT_IMAGES_BUCKET = 'product-images'; ${imageFallback}`, context);
  return context;
}

function createImage({ alt, original } = {}) {
  return {
    alt,
    dataset: original ? { imageOriginal: original, imageUrl: original } : { imageUrl: 'https://supabase.example/image' },
    src: '',
    onerror() {}
  };
}

test('Si falla la miniatura, intenta primero la imagen original de Supabase', () => {
  const context = setup();
  const image = createImage({ alt: 'Labial', original: 'https://supabase.example/original.jpeg' });
  context.image = image;
  vm.runInContext('reportarErrorImagen(image)', context);
  assert.equal(image.src, 'https://supabase.example/original.jpeg');
  assert.equal(image.dataset.imageOriginal, undefined);
});

test('Si falla Supabase, busca la foto local asociada al producto', () => {
  const context = setup();
  const image = createImage({ alt: 'Parches de ojeras' });
  context.image = image;
  vm.runInContext('reportarErrorImagen(image)', context);
  assert.equal(
    image.src,
    'https://aitana.example/img/Parches%20de%20ojeras%20contiene%20colageno%2C%20%C3%A1cido%20hialuronico%20y%20baba%20de%20caracol.jpeg'
  );
});

test('Si no existe una foto local, termina en el icono del sitio', () => {
  const context = setup();
  const image = createImage({ alt: 'Producto sin foto local' });
  context.image = image;
  for (let attempt = 0; attempt < 5; attempt++) {
    vm.runInContext('reportarErrorImagen(image)', context);
  }
  assert.equal(image.src, 'https://aitana.example/img/app-icon-aitana.webp');
  vm.runInContext('reportarErrorImagen(image)', context);
  assert.equal(image.onerror, null);
});
