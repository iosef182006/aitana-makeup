// Ejecutar: node --test --test-isolation=none halloween.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(`${__dirname}/halloween.js`, 'utf8');

function page({ date = [2026, 9, 20], mode = 'auto', path = '/', search = '', maintenance = false, playGate, playError = false, allowAutoplay = false } = {}) {
  let current = new Date(...date);
  let active = false;
  let banners = 0;
  let midnight;
  let soundClick;
  let instances = 0;
  let playing = false;
  let playCalls = 0;
  const attributes = { 'aria-pressed': 'false' };
  const button = {
    setAttribute(name, value) { attributes[name] = value; },
    getAttribute(name) { return attributes[name]; },
    addEventListener(name, fn) { soundClick = fn; }
  };
  const events = {};
  class LocalDate extends Date {
    constructor(...args) { super(...(args.length ? args : [current.getTime()])); }
  }
  const context = {
    Date: LocalDate, URLSearchParams,
    Audio: class {
      constructor() { instances++; this.paused = true; }
      async play() {
        if (playError) throw new Error('Playback unavailable');
        if (playGate) await playGate;
        this.paused = false; playing = true;
      }
      pause() { this.paused = true; playing = false; }
    },
    clearTimeout() {}, setTimeout(fn, delay) { midnight = { fn, delay }; },
    window: {
      AITANA_CONFIG: { halloween: mode, modoActualizacion: maintenance },
      location: { pathname: path, search },
      addEventListener(name, fn) { events[name] = fn; }
    },
    document: {
      hidden: false,
      documentElement: { classList: { toggle(name, value) { active = value; }, contains() { return active; } } },
      querySelector() { return { insertAdjacentElement() { banners++; } }; },
      createElement() { return { setAttribute() {}, querySelector() { return button; }, remove() { banners--; } }; },
      addEventListener(name, fn) { events[name] = fn; }
      ,removeEventListener(name) { delete events[name]; }
    }
  };
  vm.runInNewContext(source, context);
  return {
    get active() { return active; }, get banners() { return banners; },
    get delay() { return midnight?.delay; },
    get instances() { return instances; }, get playing() { return playing; },
    get soundPressed() { return attributes['aria-pressed']; },
    async ready() { await Promise.resolve(); await Promise.resolve(); },
    clickSound() { return soundClick(); },
    async interact() { await Promise.resolve(); await Promise.resolve(); events.pointerdown?.({ type: 'pointerdown' }); await Promise.resolve(); await Promise.resolve(); },
    hide() { context.document.hidden = true; events.visibilitychange(); },
    advance(date, event) {
      current = new Date(...date);
      if (event) events[event](); else midnight.fn();
    }
  };
}

test('Calendario local: límites de octubre y otros meses/años', () => {
  for (const [date, expected] of [
    [[2026, 9, 19, 23, 59], false], [[2026, 9, 20], true],
    [[2026, 9, 31, 23, 59], true], [[2026, 10, 1], false],
    [[2026, 8, 25], false], [[2027, 9, 20], true]
  ]) assert.equal(page({ date }).active, expected, date.join('-'));
});

test('Audio: error recuperable y cancelación durante carga', async () => {
  const failure = page({ playError: true });
  await failure.ready();
  await failure.clickSound();
  assert.equal(failure.playing, false);
  assert.equal(failure.soundPressed, 'false');
  let resolve;
  const gate = new Promise(done => { resolve = done; });
  const pending = page({ playGate: gate });
  await pending.ready();
  const firstClick = pending.clickSound();
  await pending.clickSound();
  resolve();
  await firstClick;
  assert.equal(pending.playing, false);
  assert.equal(pending.soundPressed, 'false');
  assert.equal(pending.instances, 1);
});

test('Ambiente opcional: silencio inicial, una instancia y pausa', async () => {
  const p = page();
  await p.ready();
  assert.equal(p.instances, 0);
  assert.equal(p.playing, false);
  await p.clickSound();
  assert.equal(p.playing, true);
  await p.clickSound();
  assert.equal(p.playing, false);
  await p.clickSound();
  assert.equal(p.instances, 1);
  p.hide();
  assert.equal(p.playing, false);
  p.advance([2026, 9, 21], 'pageshow');
  assert.equal(p.playing, false);
});

test('Desactivar el tema al cambiar de fecha detiene el audio', async () => {
  const p = page();
  await p.ready();
  await p.clickSound();
  p.advance([2026, 10, 1]);
  assert.equal(p.playing, false);
  assert.equal(p.banners, 0);
});

test('Audio offline: respuestas completas y Range compatibles con Safari', async () => {
  const context = {
    self: { addEventListener() {} }, Response, URL,
    caches: { async open() { return { async match() { return new Response(new Uint8Array(100)); } }; } }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(`${__dirname}/../service-worker.js`, 'utf8'), context);
  for (const [range, status, length] of [[null, 200, 100], ['bytes=0-1', 206, 2],
    ['bytes=90-', 206, 10], ['bytes=-10', 206, 10], ['bytes=100-', 416, 0]]) {
    context.request = new Request('https://aitana.local/halloween/audio/haunted-beauty.wav', {
      headers: range ? { Range: range } : {}
    });
    const response = await vm.runInContext('halloweenAudio(request)', context);
    assert.equal(response.status, status);
    assert.equal((await response.arrayBuffer()).byteLength, length);
  }
});

test('Previsualización, interruptor maestro y modo forzado', () => {
  assert.equal(page({ date: [2026, 9, 10], search: '?halloween=on' }).active, true);
  assert.equal(page({ search: '?halloween=off' }).active, false);
  assert.equal(page({ mode: 'off', search: '?halloween=on' }).active, false);
  assert.equal(page({ mode: 'on', date: [2026, 0, 1] }).active, true);
});

test('Admin, revisión y mantenimiento nunca reciben el tema', () => {
  for (const path of ['/admin', '/admin/', '/admin/index.html', '/ADMIN/products', '/revision']) {
    const p = page({ path, mode: 'on', search: '?halloween=on' });
    assert.equal(p.active, false);
    assert.equal(p.banners, 0);
  }
  assert.equal(page({ mode: 'on', maintenance: true }).active, false);
});

test('App abierta: activar a medianoche, evitar duplicados y restaurar noviembre', () => {
  const p = page({ date: [2026, 9, 19, 23, 59] });
  assert.equal(p.delay, 60100);
  p.advance([2026, 9, 20]);
  assert.equal(p.active, true);
  assert.equal(p.banners, 1);
  p.advance([2026, 9, 31], 'pageshow');
  assert.equal(p.banners, 1);
  p.advance([2026, 10, 1], 'visibilitychange');
  assert.equal(p.active, false);
  assert.equal(p.banners, 0);
});
