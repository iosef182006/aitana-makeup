const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

test('Admin muestra un error recuperable si la dependencia no carga', () => {
  const elements = new Map();
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { hidden: false, disabled: false, textContent: '' });
    return elements.get(id);
  } };
  const context = vm.createContext({ document, window: { scrollTo() {} } });
  vm.runInContext(fs.readFileSync(`${__dirname}/admin/admin.js`, 'utf8'), context);
  assert.equal(elements.get('loginView').hidden, false);
  assert.equal(elements.get('loadingView').hidden, true);
  assert.equal(elements.get('loginButton').disabled, true);
  assert.match(elements.get('loginError').textContent, /conexión/);
});

const source = fs.readFileSync(`${__dirname}/script.js`, 'utf8');
const focusHandler = source.slice(source.indexOf('// Mantener el teclado'), source.indexOf('const entregasGaleria'));

function focusSetup() {
  let handler;
  let focused;
  const control = () => ({ disabled: false, tabIndex: 0, closest: () => null, getClientRects: () => [1], focus() { focused = this; } });
  const first = control();
  const last = control();
  const dialog = {
    hidden: false, getAttribute: () => 'false', getClientRects: () => [1],
    querySelectorAll: () => [first, last], contains: element => [first, last].includes(element)
  };
  const document = { activeElement: last, querySelectorAll: () => [dialog], addEventListener: (type, callback) => { handler = callback; } };
  vm.runInNewContext(focusHandler, { document, getComputedStyle: () => ({ zIndex: '5000' }) });
  function press(shiftKey = false) {
    let prevented = false;
    handler({ key: 'Tab', shiftKey, stopImmediatePropagation() {}, preventDefault() { prevented = true; } });
    return { focused, prevented };
  }
  return { document, first, last, press };
}

test('Tab vuelve al primer control del diálogo', () => {
  const h = focusSetup();
  const result = h.press();
  assert.equal(result.focused, h.first);
  assert.equal(result.prevented, true);
});

test('Shift+Tab vuelve al último control del diálogo', () => {
  const h = focusSetup(); h.document.activeElement = h.first;
  assert.equal(h.press(true).focused, h.last);
});

test('Un foco externo regresa al diálogo al pulsar Tab', () => {
  const h = focusSetup(); h.document.activeElement = {};
  assert.equal(h.press().focused, h.first);
});
