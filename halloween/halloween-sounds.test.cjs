const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync(`${__dirname}/halloween-sounds.js`, 'utf8');

function setup({ blocked = false, preference = 'on', path = '/' } = {}) {
  let now = 1000, control, player, instances = 0, section = '#inicio', attempts = 0, ambientMuted = false;
  const played = [], listeners = {}, storage = new Map([['aitana-halloween-sounds', preference]]);
  const root = { classList: { contains: () => true } };
  function node(attrs = {}) {
    return {
      attrs, disabled: false, callbacks: {},
      setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; },
      hasAttribute(k) { return k in this.attrs; },
      addEventListener(k, fn) { this.callbacks[k] = fn; }, remove() { control = undefined; },
      closest(selector) {
        if (selector.includes('data-favorito-index') && this.hasAttribute('data-favorito-index')) return this;
        if (selector.includes('data-consulta-index') && this.hasAttribute('data-consulta-index')) return this;
        if (selector.includes('data-pwa-vista') && this.hasAttribute('data-pwa-vista')) return this;
        return null;
      },
      matches(selector) { return selector.includes('#buscador') && this.attrs.id === 'buscador'; }
    };
  }
  const document = {
    hidden: false, documentElement: root, body: { className: '' },
    createElement: () => node(),
    querySelector(selector) {
      if (selector === 'body > .header') return { append(button) { control = button; } };
      if (selector === '.nav-link.activo-menu') return { getAttribute: () => section };
      return null;
    },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); }
  };
  const window = { AITANA_CONFIG: {}, AITANA_HALLOWEEN_AMBIENCE: { setEnabled(v) { ambientMuted = !v; } }, addEventListener: document.addEventListener };
  const context = {
    window, document, location: { pathname: path }, localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    Date: { now: () => now }, queueMicrotask,
    Audio: class {
      constructor() { instances++; player = this; this.paused = true; }
      pause() { this.paused = true; }
      async play() {
        if (++attempts === 1 && blocked) throw new Error('NotAllowedError');
        this.paused = false; played.push(this.src);
      }
    }
  };
  vm.runInNewContext(code, context);
  const manager = window.AITANA_HALLOWEEN_SOUNDS;
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  return {
    node, played, storage, flush, manager,
    get instances() { return instances; }, get paused() { return player?.paused; }, get ambientMuted() { return ambientMuted; },
    async start() { manager?.sync(true); await flush(); }, advance() { now += 1000; },
    async emit(type, target = node(), action = () => {}) {
      for (const fn of listeners[type] || []) fn({ type, target, key: 'Enter' });
      action(); await flush();
    },
    async toggle() { control.callbacks.click(); await flush(); },
    async hide() { document.hidden = true; await this.emit('visibilitychange'); },
    navigate() { section = '#productos'; }
  };
}

test('Bienvenida original: autoplay y primer gesto tras bloqueo, una sola vez', async () => {
  const p = setup({ blocked: true }); await p.start();
  assert.equal(p.played.length, 0);
  await p.emit('pointerdown');
  assert.match(p.played[0], /welcome.wav$/);
  p.advance(); await p.emit('pointerdown');
  assert.equal(p.played.length, 1);
  assert.equal(p.instances, 1);
  const allowed = setup(); await allowed.start();
  assert.match(allowed.played[0], /welcome.wav$/);
});

test('Buscador: campanita al foco, ninguna por escribir', async () => {
  const p = setup(); await p.start(); p.advance();
  await p.emit('focusin', p.node({ id: 'buscador' }));
  assert.match(p.played.at(-1), /search.wav$/);
  const count = p.played.length;
  await p.emit('input', p.node({ id: 'buscador' }));
  assert.equal(p.played.length, count);
});

for (const [kind, attr] of [['favorite', 'data-favorito-index'], ['consult', 'data-consulta-index']]) {
  test(`${kind}: solo tras agregar correctamente, no al quitar ni fallar`, async () => {
    const p = setup(); await p.start(); p.advance();
    const button = p.node({ [attr]: '3', 'aria-pressed': 'false' });
    await p.emit('click', button);
    assert.equal(p.played.length, 1, 'sin cambio de estado no suena');
    await p.emit('click', button, () => button.setAttribute('aria-pressed', 'true'));
    assert.match(p.played.at(-1), new RegExp(`${kind}.wav$`));
    p.advance(); const count = p.played.length;
    await p.emit('click', button, () => button.setAttribute('aria-pressed', 'false'));
    assert.equal(p.played.length, count);
  });
}

test('Navegación: al cambiar realmente de sección, sin acumular clics', async () => {
  const p = setup(); await p.start(); p.advance();
  const link = p.node({ 'data-pwa-vista': 'catalogo' });
  await p.emit('click', link, p.navigate);
  assert.match(p.played.at(-1), /navigate.wav$/);
  const count = p.played.length;
  await p.emit('click', link);
  assert.equal(p.played.length, count);
  assert.equal(p.instances, 1);
});

test('Global: persiste silencio, detiene ambiente/efectos y respeta off/admin', async () => {
  const p = setup(); await p.start(); await p.toggle();
  assert.equal(p.storage.get('aitana-halloween-sounds'), 'off');
  assert.equal(p.paused, true); assert.equal(p.ambientMuted, true);
  p.advance(); await p.emit('focusin', p.node({ id: 'buscador' }));
  assert.equal(p.played.length, 1);
  const saved = setup({ preference: 'off' }); await saved.start(); assert.equal(saved.instances, 0);
  await p.toggle(); p.manager.sync(false); p.advance();
  await p.emit('focusin', p.node({ id: 'buscador' })); assert.equal(p.played.length, 1);
  const admin = setup({ path: '/admin' }); await admin.start(); assert.equal(admin.manager, undefined);
});

test('Segundo plano y prioridad bienvenida: silencio y máximo un efecto', async () => {
  const p = setup(); await p.start();
  await p.emit('focusin', p.node({ id: 'buscador' })); assert.equal(p.played.length, 1);
  p.advance(); await p.hide(); assert.equal(p.paused, true);
  await p.emit('focusin', p.node({ id: 'buscador' })); assert.equal(p.played.length, 1);
});
