/* SFX propios. Observa la interfaz; no cambia estados ni acciones comerciales. */
(() => {
  'use strict';
  if (/^\/(admin|revision)(\/|$)/i.test(location.pathname) || window.AITANA_CONFIG?.modoActualizacion) return;
  const KEY = 'aitana-halloween-sounds';
  const root = document.documentElement;
  const files = Object.freeze({
    welcome: '/audio/halloween-welcome.wav', search: '/audio/halloween-search.wav',
    favorite: '/audio/halloween-favorite.wav', consult: '/audio/halloween-consult.wav',
    navigate: '/audio/halloween-navigate.wav'
  });
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch { /* Safari privado: preferencia en memoria. */ }
  let active = false;
  let control;
  let player;
  let sequence = 0;
  let welcomeDone = false;
  let welcomePending = true;
  let welcomeAttempted = false;
  let busyUntil = 0;
  let lastAt = -Infinity;

  function stop() {
    sequence++;
    if (player) player.pause();
    busyUntil = 0;
    lastAt = -Infinity;
  }

  function allowed() { return active && enabled && !document.hidden && root.classList.contains('tema-halloween'); }

  async function play(name) {
    if (!allowed() || !files[name]) return false;
    const now = Date.now();
    if (now < busyUntil || now - lastAt < 120) return false;
    if (name === 'welcome' && welcomeDone) return false;
    if (!player) { player = new Audio(); player.preload = 'none'; player.volume = .32; }
    // Un solo reproductor de efectos: el siguiente corta el anterior, nunca se acumulan.
    player.pause();
    player.src = files[name];
    player.currentTime = 0;
    const request = ++sequence;
    lastAt = now;
    if (name === 'welcome') busyUntil = now + 840;
    try {
      await player.play();
      if (request !== sequence || !allowed()) {
        if (!allowed()) player.pause();
        return false;
      }
      if (name === 'welcome') { welcomeDone = true; welcomePending = false; }
      return true;
    } catch {
      if (request === sequence) { busyUntil = 0; lastAt = -Infinity; }
      // Un autoplay bloqueado queda pendiente, sin reintentos ni descargas en bucle.
      return false;
    }
  }

  function updateControl() {
    if (!control) return;
    control.setAttribute('aria-pressed', String(enabled));
    const label = enabled ? 'Silenciar todos los sonidos Halloween' : 'Activar sonidos Halloween';
    control.setAttribute('aria-label', label);
    control.title = label;
    control.innerHTML = `<span aria-hidden="true">${enabled ? '&#128266;' : '&#128263;'}</span>`;
  }

  function setEnabled(value, persist = true) {
    enabled = value;
    if (persist) { try { localStorage.setItem(KEY, value ? 'on' : 'off'); } catch {} }
    if (!enabled) stop();
    window.AITANA_HALLOWEEN_AMBIENCE?.setEnabled(enabled);
    updateControl();
  }

  function sync(value) {
    active = value;
    if (!active) { stop(); control?.remove(); control = undefined; return; }
    if (!control) {
      const header = document.querySelector('body > .header');
      if (header) {
        control = document.createElement('button');
        control.type = 'button';
        control.className = 'haunted-effects-toggle';
        control.addEventListener('click', () => {
          setEnabled(!enabled);
          if (enabled && welcomePending) void play('welcome');
        });
        header.append(control);
        updateControl();
      }
    }
    if (!welcomeAttempted && welcomePending && allowed()) {
      welcomeAttempted = true;
      void play('welcome');
    }
  }

  window.AITANA_HALLOWEEN_SOUNDS = Object.freeze({ sync, get enabled() { return enabled; } });

  // La primera interacción desbloquea la bienvenida si autoplay no fue posible.
  function unlock(event) {
    if (!allowed() || event.target.closest?.('.haunted-effects-toggle, .haunted-sound')) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if (welcomePending) void play('welcome');
  }
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
  document.addEventListener('focusin', event => {
    if (event.target.matches?.('#buscador, #aitanaMobileSearch')) void play('search');
  });

  function section() {
    const match = document.body.className.match(/(?:^|\s)pwa-vista-(inicio|catalogo|favoritos|consulta)(?:\s|$)/);
    return match?.[1] || document.querySelector('.nav-link.activo-menu')?.getAttribute('href');
  }

  document.addEventListener('click', event => {
    if (!allowed()) return;
    // También cubre activación con teclado/lector de pantalla sin pointerdown.
    unlock(event);
    const button = event.target.closest?.('[data-favorito-index], [data-consulta-index]');
    if (button && !button.disabled) {
      const attr = button.hasAttribute('data-favorito-index') ? 'data-favorito-index' : 'data-consulta-index';
      const before = button.getAttribute('aria-pressed');
      const index = Number(button.getAttribute(attr));
      // Se comprueba el resultado DESPUÉS del controlador real, sin interceptarlo.
      queueMicrotask(() => {
        const current = document.querySelector(`[${attr}="${index}"]`) || button;
        if (before !== 'true' && current.getAttribute('aria-pressed') === 'true') {
          void play(attr === 'data-favorito-index' ? 'favorite' : 'consult');
        }
      });
      return;
    }
    const nav = event.target.closest?.('[data-pwa-vista], .nav-link[href^="#"]');
    if (nav) {
      const before = section();
      queueMicrotask(() => { if (section() !== before) void play('navigate'); });
    }
  }, true);

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('storage', event => { if (event.key === KEY) setEnabled(event.newValue !== 'off', false); });
})();
