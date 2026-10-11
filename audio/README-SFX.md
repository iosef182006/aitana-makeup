# Efectos Halloween originales

Generador: `generate_effects.py`. Licencia: CC0-1.0, detallada en `LICENSE.md`.
Síntesis propia; sin sonidos de Discord ni grabaciones de terceros.

| Archivo | Interacción | Duración | Bytes |
| --- | --- | --- | --- |
| halloween-welcome.wav | Risa fantasmal sintetizada, bienvenida | 0.84 s | 26924 |
| halloween-search.wav | Campanita al enfocar buscador | 0.28 s | 9004 |
| halloween-favorite.wav | Hechizo ascendente al agregar favorito | 0.48 s | 15404 |
| halloween-consult.wav | Tres golpes de huesitos al agregar consulta | 0.34 s | 10924 |
| halloween-navigate.wav | Tres aleteos al cambiar de sección | 0.36 s | 11564 |

Formato mono PCM WAV, 16 kHz, 16 bit. Total 73820 bytes (~74 KB).
Reproductor de efectos al 32% de volumen; los archivos no tienen clipping.
El ambiente original `haunted-beauty.wav` conserva su botón y volumen de 22%.

## Escuchar localmente

http://localhost:8010/audio/halloween-preview.html

Controles nativos para escuchar cada efecto. Solo reproduce un clip a la vez y
pausa al ocultar la página. Esta página de pruebas está excluida de Vercel.
La tienda real se encuentra en http://localhost:8010/.

## Implementación

`halloween-sounds.js` observa foco y clics, y comprueba aria-pressed después de
la acción real de agregar. No cambia productos, favoritos o consulta. No añade
sonidos al quitar, escribir letras, acciones fallidas o navegar a la misma vista.

El control global del encabezado guarda exclusivamente
`aitana-halloween-sounds=on|off` en localStorage. Si no existe, los efectos están
habilitados. Si almacenamiento privado falla, conserva la preferencia en memoria.
Silenciar detiene efectos y ambiente y deshabilita el botón de ambiente hasta
volver a activar los sonidos generales. Activar no inicia automáticamente la
música ambiental. La bienvenida suena una sola vez por carga de página, con
intento inicial y fallback al primer toque/clic o Enter/Espacio permitido.

Un solo elemento Audio para todos los efectos. La bienvenida tiene prioridad
durante 840 ms. El resto tiene protección de 120 ms ante clics repetidos y el
efecto siguiente sustituye al anterior. A lo sumo suenan un efecto y el ambiente.
Ninguna acción comercial espera al audio; no se cancela ningún evento de compra.

El service worker v27 precarga únicamente la bienvenida entre los efectos.
Los demás se guardan offline tras su primer uso y soportan Range de Safari.
No estarán disponibles offline si aún no se han reproducido con conexión.

## Validación

15 pruebas automatizadas del tema y SFX, sintaxis JS, git diff --check,
validación de formato, duración y ausencia de clipping de los cinco WAV, y
respuestas HTTP locales con archivos idénticos a disco.

No se ha realizado escucha humana ni comprobación en Safari/iPhone o Chrome
Android reales. El navegador de revisión sigue sin inicializarse en este entorno.
Los sonidos quedan sujetos a tu aprobación auditiva en la página local.
