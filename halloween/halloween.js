/* Presentación estacional exclusivamente local; no consulta ni modifica datos. */
(() => {
  "use strict";

  const root = document.documentElement;
  const mode = window.AITANA_CONFIG?.halloween ?? "auto";
  const preview = new URLSearchParams(window.location.search).get("halloween");
  const excluded = /^\/admin(?:\/|$)/i.test(window.location.pathname) ||
    /^\/revision\/?$/i.test(window.location.pathname) ||
    window.AITANA_CONFIG?.modoActualizacion === true;
  let banner;
  let timer;
  let audio;
  let soundButton;
  let soundRequest = 0;

  function mute() {
    soundRequest++;
    if (audio) audio.pause();
    if (soundButton) {
      soundButton.setAttribute("aria-pressed", "false");
      soundButton.textContent = "Activar sonido mágico";
    }
  }

  async function toggleSound() {
    if (document.hidden || !root.classList.contains("tema-halloween") ||
        window.AITANA_HALLOWEEN_SOUNDS?.enabled === false) return;
    if (audio && !audio.paused) { mute(); return; }
    if (!audio) {
      audio = new Audio("/halloween/audio/haunted-beauty.wav");
      audio.loop = true;
      audio.volume = 0.22;
      audio.preload = "none";
    }
    // Marcar antes de play() permite cancelar incluso durante la carga.
    const enabling = soundButton.getAttribute("aria-pressed") !== "true";
    if (!enabling) { mute(); return; }
    soundButton.setAttribute("aria-pressed", "true");
    soundButton.textContent = "Silenciar sonido mágico";
    const request = ++soundRequest;
    try {
      await audio.play();
      if (request !== soundRequest) {
        if (soundButton?.getAttribute("aria-pressed") !== "true") audio.pause();
        return;
      }
      if (document.hidden || !root.classList.contains("tema-halloween") ||
          soundButton?.getAttribute("aria-pressed") !== "true") mute();
    } catch {
      if (request !== soundRequest) return;
      mute();
      if (soundButton) soundButton.textContent = "Reintentar sonido mágico";
    }
  }

  function refresh() {
    const now = new Date();
    const seasonal = now.getMonth() === 9 && now.getDate() >= 20;
    // "off" es el interruptor maestro. La URL solo previsualiza en este navegador.
    const active = !excluded && mode !== "off" &&
      (mode === "on" || (mode === "auto" &&
        (preview === "on" || (preview !== "off" && seasonal))));

    root.classList.toggle("tema-halloween", active);
    window.AITANA_HALLOWEEN_SOUNDS?.sync(active);
    if (active && !banner) {
      const header = document.querySelector("body > .header");
      if (header) {
        banner = document.createElement("section");
        banner.className = "halloween-banner";
        banner.setAttribute("aria-label", "Edición Halloween");
        banner.innerHTML = `<div class="haunted-copy">
          <div class="haunted-brand" aria-label="Aitana Make Up">Aitana<small>MAKE UP</small></div>
          <span class="haunted-eyebrow">🎃 EDICIÓN HALLOWEEN 🎃</span>
          <h2>AITANA <span>HAUNTED BEAUTY</span></h2>
          <p>Belleza que hechiza ✨</p>
          <small>Tu próximo favorito llena un poco de magia 💕</small>
          <button class="haunted-sound" type="button" aria-pressed="false">Activar sonido mágico</button>
        </div>
        <div class="haunted-stardust" aria-hidden="true"><span>?</span><span>?</span></div>`;
        soundButton = banner.querySelector(".haunted-sound");
        soundButton.addEventListener("click", () => toggleSound());
        header.insertAdjacentElement("afterend", banner);
        window.AITANA_HALLOWEEN_AMBIENCE.setEnabled(window.AITANA_HALLOWEEN_SOUNDS?.enabled !== false);
      }
    }
    if (!active && banner) {
      mute();
      banner.remove();
      banner = undefined;
      soundButton = undefined;
    }

    // Recalcular a medianoche, también si la app quedó abierta desde octubre.
    clearTimeout(timer);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 100);
  }

  if (excluded) return;
  window.AITANA_HALLOWEEN_AMBIENCE = Object.freeze({
    mute,
    setEnabled(enabled) {
      if (!enabled) mute();
      if (soundButton) {
        soundButton.disabled = !enabled;
        soundButton.title = enabled ? "Ambiente opcional" : "Activa primero los sonidos generales";
      }
    }
  });
  refresh();
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) mute(); else refresh();
  });
  window.addEventListener("pagehide", mute);
  // Las vistas de consulta/favoritos conservan su ambiente habitual.
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(() => {
      if (document.body.classList.contains("pwa-vista-favoritos") ||
          document.body.classList.contains("pwa-vista-consulta")) mute();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
})();
