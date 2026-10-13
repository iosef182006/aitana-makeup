# Aitana Halloween — referencia visual aprobada

## Último cambio: únicamente fondo móvil rosado

Se usa el archivo proporcionado `halloween/referencias/halloween-fondo-rosa-mobile.png`.
Original intacto, copia optimizada en `halloween/assets/haunted-pink-mobile.webp`.
No se generó otra imagen. Solo se modifica el bloque de fondo de hasta 768px:
capa fija `body::before`, cover proporcional, sin repetición y sin interacción.
Un sombreado central tenue del fondo ayuda a conservar legibilidad sin cambiar
textos ni controles. Cover puede recortar los laterales; nunca deforma la imagen.
La capa fija evita depender de background-attachment en Safari.

Se comprobaron matemáticamente las proporciones para 375×812, 390×844 y 430×932.
No se realizó comprobación visual en navegador real (limitación Browser documentada).
El bloque desktop permanece idéntico; también index, scripts, sonido, CSS base,
imagen desktop y PNG original mantienen sus hashes previos.

PWA v28: sustituye el recurso móvil precargado y cacheado por la nueva copia.
Una PWA instalada requiere recibir/activar la actualización. Las 15 pruebas del
tema y sonidos, sintaxis y git diff --check siguen pasando.

Vista local: http://localhost:8010/ . En una ventana de PC de más de 768px se
seguirá viendo el fondo desktop; activar la vista móvil para revisar el nuevo.
Sin cambios de componentes, Supabase, admin ni lógica comercial. Sin commit,
push o publicación.

## Vista local

http://localhost:8010/

Servidor desde la raíz real: `python preview-local.py`. Envía Cache-Control: no-store y bloquea backups/archivos ocultos. El HTML servido debe coincidir con el index principal; no existe un segundo index de la tienda.

Configuración actual en index.html: `AITANA_CONFIG.halloween: "on"` para revisión. Cambiar a `"auto"` después de aprobar: activo del 20 al 31 de octubre, fecha local, retorno al diseño habitual desde noviembre. `"off"` desactiva el tema. En modo auto se admiten `?halloween=on` y `?halloween=off`. On es un forzado manual y no expira. Se recalcula a medianoche y al regresar a la página.

## Composición y recursos

Se inspeccionó `halloween/referencias/aitana-halloween-diseno.png` (la carpeta encontrada es singular). La nueva escena sigue luna rosa, castillo, fantasmas, murciélagos, estantes de maquillaje decorativos, velas, calabazas, rosas, telarañas y niebla en los márgenes. Fue creada por ImageGen sin texto ni interfaz: no se utiliza la captura completa como fondo. Archivos, dimensiones y prompt exacto en `halloween/assets/README.md`.

El título, marca, subtítulo, botón de sonido, buscadores, filtros y productos son HTML real. Tipografía serif rosa luminosa, buscador claro, sección de novedades con tarjetas blancas y brillo rosa. En móvil se ordenan buscador, novedades, favoritos destacados y descubrimiento; ningún control se elimina. El fondo se extiende al catálogo y PWA; la navegación inferior conserva sus alturas, safe areas y controles. Los sheets de Favoritos y Mi consulta mantienen superficies claras y borde rosa, con decoración en el entorno. La PWA de escritorio también conserva el diseño responsive.

El SVG simplificado anterior queda en `halloween/backup/`; la versión actual usa una escena nueva según la referencia definitiva. Los productos, fotografías del catálogo, precios y datos no se sustituyen por los de la captura. No se añaden promociones ni artículos.

La escena móvil WebP pesa ~104KB y la de escritorio ~255KB. Se seleccionan con CSS; sin dependencias visuales nuevas ni fuentes externas. El service worker v25 incluye ambas para offline. Niebla y dos destellos CSS usan transform/opacity y se detienen con prefers-reduced-motion. Los fantasmas y elementos de la escena son ilustración estática.

## Audio actual: efectos y ambiente opcional

Cinco efectos originales CC0 en audio/: bienvenida, buscador, favoritos, consulta y navegacion. Documentacion completa, archivos, duraciones, licencia y limites en audio/README-SFX.md. Escucha individual: http://localhost:8010/halloween/audio/halloween-preview.html .

El control de altavoz del encabezado activa/silencia todos los sonidos y recuerda solo esa preferencia local. Por defecto los efectos estan habilitados; se intenta una risa breve al entrar y, si autoplay se bloquea, tras el primer gesto permitido. No se garantiza autoplay en Safari ni en otros navegadores.

El ambiente se conserva con su boton independiente, pero ahora es opcional y comienza apagado. Silencio global detiene tanto efectos como ambiente. Todos se pausan al ocultar la pagina y quedan inactivos con Halloween off o en admin. Se usa un unico reproductor de efectos para limitar solapamientos, sin retrasar acciones.

## Comprobación y límites

Pruebas desde la raíz: `node halloween/halloween.test.cjs` y `node halloween/halloween-sounds.test.cjs`; sintaxis de halloween/halloween.js, script.js y service-worker.js, y git diff --check. Cubren calendario/rutas, restauración, audio permitido/bloqueado, primera interacción, silencio, cancelación, ocultación y rangos de audio offline.

Se inspeccionaron la referencia y la ilustración generada. Se revisaron las reglas responsive con especial atención a 430px: dos tarjetas dentro del 82% del viewport, márgenes ilustrados, texto adaptable, tamaños de botón de 44px o más, imágenes de producto contain. Esto no sustituye una captura real.

Browser volvió a fallar al inicializarse: Importing module "node:process" is not allowed in node_repl. No se pudo capturar el navegador a 430px ni comprobar consola/renderizado/audio real. No se afirma igualdad visual. Antes de aprobar/publicar, revisar la URL local en Safari iPhone, Chrome Android y PWA.

## Respaldo y alcance

halloween/backup/ conserva index/CSS originales de Git y el estado previo al forzado on. Excluido de Git y Vercel. Se excluyen de Vercel también la referencia y el PNG fuente; los WebP sí se usan en la tienda.

No se modifica Supabase, administración, autenticación, productos, precios, stock, imágenes de catálogo, lógica de favoritos, consulta o WhatsApp. No se ejecutan git add, commit, push ni publicación.


## Correcci?n exclusiva de escritorio

La causa de las franjas era `background-size: min(100%, 1440px) auto` sobre una imagen vertical. Se a?ade ?nicamente un bloque final `@media (min-width: 769px)`: escena panor?mica desktop espec?fica, cover, posici?n central superior, sin repetici?n y attachment fixed. El fondo se extiende por todo el viewport y permanece continuo al desplazarse entre categor?as, novedades, favoritos destacados y cat?logo. La capa de lectura es un degradado oscuro tenue sobre el fondo; no se altera el contenido del hero ni las tarjetas.

Cover conserva las proporciones, aunque puede recortar los bordes en ventanas con otra relaci?n de aspecto. Se comprob? matem?ticamente la cobertura de 1024?768, 1440?900, 1920?1080 y 2560?1440, sin huecos ni escalado desigual. No se usa 100% 100%. No son comprobaciones de renderizado real. La fuente panor?mica nativa tiene 1672?941; a 2560px se ampl?a uniformemente, por lo que la nitidez puede ser inferior a una imagen nativa 2560px.

Para 375, 390, 430 y 768px no se modifica ninguna regla previa. Se compararon hashes: imagen m?vil, escena vertical, halloween.js (incluido sonido), index.html, script.js, style.css y WAV permanecen iguales al inicio de este ajuste. El CSS original tambi?n permanece ?ntegro como prefijo, con solo el bloque desktop a?adido. Respaldo y hashes en halloween/backup/desktop-before/.

El service worker v26 a?ade el WebP panor?mico (~290KB) a la cach? offline. No se cambia su c?digo de audio ni l?gica comercial. El incremento de instalaci?n offline aplica tambi?n a m?viles; el dise?o m?vil no cambia.

Nueve pruebas aprobadas, sintaxis del service worker y git diff --check correctos. Se inspeccion? la ilustraci?n panor?mica generada. No se pudieron realizar las capturas comparativas desktop/m?vil solicitadas: el navegador sigue fallando al inicializarse con Importing module "node:process" is not allowed in node_repl. No se han verificado en un navegador real los tama?os ni el comportamiento de background-attachment fixed en Safari/iPad. Las capturas y esa revisi?n quedan pendientes; no se presentan montajes como capturas.

Vista local: http://localhost:8010/ . Sin publicaci?n, git add, commit ni push.


## Entrega del sistema de efectos

Se agregan halloween-sounds.js, su prueba y cinco WAV sintetizados con generate_effects.py. index.html carga el controlador antes de halloween.js; este sincroniza el tema y el ambiente con el interruptor global. El unico retoque visual es el control compacto de 44px en el encabezado. No se modifica la composicion Halloween ni el codigo comercial script.js.

Service worker v27: bienvenida precargada; demas efectos bajo demanda y cache despues de su primer uso, con rangos de audio para Safari. La prueba local individual no se publica por .vercelignore. Licencia y generador documentados en audio/.

15 pruebas aprobadas, sintaxis y diff --check correctos. Se comprueban los cinco efectos individualmente mediante eventos simulados y la validez de sus WAV; no se afirma haber escuchado o probado audio en dispositivos reales. Revisar el volumen y timbre en localhost antes de aprobar. Sin git add, commit, push ni publicacion.
