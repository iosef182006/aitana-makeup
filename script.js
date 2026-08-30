const MODO_ACTUALIZACION = window.AITANA_CONFIG?.modoActualizacion === true;
const numeroWhatsapp = "51982797861";

const esRutaRevision =
  window.location.pathname.replace(/\/+$/, "") === "/revision";

const pantallaActualizacion = document.getElementById("modoActualizacion");

if (pantallaActualizacion) {
  const mostrarActualizacion =
    MODO_ACTUALIZACION && !esRutaRevision;

  pantallaActualizacion.hidden = !mostrarActualizacion;
  document.body.classList.toggle("modo-actualizacion-activo", mostrarActualizacion);

  if (mostrarActualizacion) {
    document.querySelectorAll("body > :not(#modoActualizacion)").forEach((elemento) => {
      elemento.inert = true;
    });
  }
}

const TOTAL_PRODUCTOS_SUPABASE_ESPERADO = 55;

async function cargarCatalogoSupabase() {
  if (esRutaRevision || MODO_ACTUALIZACION) return;

  mostrarCargaCatalogo();

  try {
    const cargaSupabase = await obtenerProductosSupabase();
    if (cargaSupabase.productos.length !== TOTAL_PRODUCTOS_SUPABASE_ESPERADO) {
      throw new Error(`Se esperaban ${TOTAL_PRODUCTOS_SUPABASE_ESPERADO} productos activos de Supabase y se recibieron ${cargaSupabase.productos.length}.`);
    }

    const [filasImagenes, filasVariantes] = await Promise.all([
      cargarImagenesSupabase(cargaSupabase),
      cargarVariantesSupabase(cargaSupabase)
    ]);
    productos = normalizarCatalogoSupabase(cargaSupabase, filasImagenes, filasVariantes);
    refrescarInterfazCatalogo();
  } catch (error) {
    productos = [];
    console.warn("Aitana: no se pudo cargar el catálogo de Supabase.", error);
    mostrarErrorCatalogo();
    guardarConsultaPersistente();
  }
}

function mostrarErrorCatalogo() {
  if (!contenedor) return;
  desregistrarImagenesDiferidas(contenedor);
  desregistrarImagenesDiferidas(contenedorRecienLlegados);
  contenedor.innerHTML = `
    <div role="alert" style="grid-column: 1 / -1; padding: 32px 20px; text-align: center;">
      <h3>No pudimos cargar el catálogo</h3>
      <p>Revisa tu conexión e inténtalo nuevamente.</p>
      <button type="button" id="reintentarCatalogo" class="filtro">Reintentar</button>
    </div>
  `;
  if (contenedorRecienLlegados) contenedorRecienLlegados.innerHTML = "";
  contenedor.setAttribute("aria-busy", "false");
  contenedorRecienLlegados?.setAttribute("aria-busy", "false");
  document.getElementById("contadorProductos").textContent = "0";
  const etiquetaContador = document.getElementById("contadorProductosEtiqueta");
  if (etiquetaContador) etiquetaContador.hidden = false;
  document.getElementById("reintentarCatalogo")?.addEventListener("click", cargarCatalogoSupabase, { once: true });
}

function refrescarInterfazCatalogo() {
  try {

    consultaGuardadaInicial.forEach(valorGuardado => {
      const id = typeof valorGuardado === "object" ? valorGuardado?.id : valorGuardado;
      const varianteGuardada = typeof valorGuardado === "object" ? valorGuardado?.variante : null;
      const index = productos.findIndex(producto => obtenerIdProductoConsulta(producto) === id);
      const producto = productos[index];
      if (index < 0 || !producto || producto.agotado) return;
      if (varianteGuardada) {
        const varianteDisponible = producto.variantes?.find(variante => variante.value === varianteGuardada && !variante.agotada);
        if (!varianteDisponible) return;
        variantesConsulta.set(id, varianteGuardada);
      }
      productosConsulta.add(index);
    });

    renderizarCategoriasCatalogo();
    crearProductos();
    observarAnimacionesCatalogo();
    ordenarCatalogo();
    reiniciarCargaYActualizar();
    actualizarBotonesFavoritos();
    renderizarFavoritos();
    actualizarConsultaMultiple();
    actualizarCarruselRecientes();
    if (window.matchMedia("(max-width: 768px)").matches) renderizarMobileProductos();
    guardarConsultaPersistente();
    finalizarCargaCatalogo();
  } catch (error) {
    console.error("Aitana: el catálogo se cargó, pero ocurrió un error al refrescar la interfaz.", error);
    throw error;
  }
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}


// ======================================
// PRODUCTOS
// ======================================

let productos = [];
const SUPABASE_TONES_IMAGE_ALT = "tones";
const SUPABASE_PRODUCT_IMAGES_BUCKET = "product-images";

function normalizeSupabaseProduct(producto, imagenes, variantes, clienteSupabase) {
  const esImagenTonos = imagen => imageIsNonPrimaryTones(imagen);
  const stockQuantity = producto.stock_quantity == null ? null : Number(producto.stock_quantity);
  const imagenesPrincipales = imagenes
    .filter(imagen => !esImagenTonos(imagen))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const imagenPrincipal = imagenesPrincipales.find(imagen => imagen.is_primary === true) || imagenesPrincipales[0];
  const imagenesTonos = imagenes
    .filter(esImagenTonos)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const { data: datosImagenPublica } = imagenPrincipal?.storage_path
    ? clienteSupabase.storage.from("product-images").getPublicUrl(imagenPrincipal.storage_path)
    : { data: { publicUrl: null } };
  const imagenPublica = datosImagenPublica?.publicUrl || new URL("img/app-icon-aitana.webp", document.baseURI).href;
  const imagenesTonosPublicas = imagenesTonos
    .filter(imagen => imagen.storage_path)
    .map(imagen => clienteSupabase.storage.from("product-images").getPublicUrl(imagen.storage_path).data.publicUrl)
    .filter(Boolean);
  const imagenesTonosDiagnostico = imagenesTonos
    .filter(imagen => imagen.storage_path)
    .map((imagen, index) => ({ productId: producto.id, storagePath: imagen.storage_path, url: imagenesTonosPublicas[index] }));

  return {
    id: producto.id,
    slug: producto.slug,
    nombre: producto.name,
    descripcion: producto.description || "",
    categoria: producto.category,
    marca: producto.brand || "",
    imagen: imagenPublica,
    imagenTonos: imagenesTonosPublicas[0] || null,
    imagenesTonos: imagenesTonosPublicas,
    imagenDiagnostico: imagenPrincipal?.storage_path ? { productId: producto.id, storagePath: imagenPrincipal.storage_path, url: imagenPublica } : null,
    imagenTonosDiagnostico: imagenesTonosDiagnostico[0] || null,
    imagenesTonosDiagnostico,
    precio: Number(producto.price).toFixed(2),
    precioAnterior: producto.compare_at_price == null ? null : Number(producto.compare_at_price),
    stockQuantity,
    agotado: stockQuantity === 0,
    nuevo: producto.is_new === true,
    destacado: producto.is_featured === true,
    prioridadReciente: producto.priority_recent === true,
    reingreso: producto.is_restock === true,
    nota: producto.catalog_note || "",
    sortOrder: Number(producto.sort_order) || 0,
    fechaCreacion: producto.created_at,
    origenSupabase: true,
    variantes: variantes
      .filter(variante => variante.is_active === true)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
      .map(variante => ({
        id: variante.id,
        name: variante.name,
        value: variante.value,
        stockQuantity: Number(variante.stock_quantity) || 0,
        agotada: Number(variante.stock_quantity) === 0
      }))
  };
}

function imageIsNonPrimaryTones(imagen) {
  return String(imagen?.alt_text || "").trim().toLowerCase() === SUPABASE_TONES_IMAGE_ALT;
}

async function obtenerProductosSupabase() {
  const configuracion = window.AITANA_SUPABASE_CONFIG;
  if (!window.supabase || !configuracion?.url || !configuracion?.publishableKey) {
    throw new Error("La configuración pública de Supabase no está disponible.");
  }

  const clienteSupabase = window.supabase.createClient(configuracion.url, configuracion.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  const { data: filasProductos, error: errorProductos } = await clienteSupabase
    .from("products")
    .select("id, slug, name, description, category, brand, price, compare_at_price, stock_quantity, is_active, is_new, is_featured, priority_recent, is_restock, catalog_note, sort_order, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (errorProductos) throw errorProductos;
  const productosPrincipales = (filasProductos || []).map(producto => normalizeSupabaseProduct(producto, [], [], clienteSupabase));

  return {
    clienteSupabase,
    filasProductos: filasProductos || [],
    filasImagenes: [],
    productos: productosPrincipales
  };
}

async function cargarImagenesSupabase(cargaSupabase) {
  const { clienteSupabase, filasProductos } = cargaSupabase;
  if (!filasProductos.length) return [];

  const { data: filasImagenes, error } = await clienteSupabase
    .from("product_images")
    .select("id, product_id, storage_path, alt_text, sort_order, is_primary, created_at")
    .in("product_id", filasProductos.map(producto => producto.id))
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("ERROR REAL product_images:", error);
    throw error;
  }

  return filasImagenes || [];
}

async function cargarVariantesSupabase({ clienteSupabase, filasProductos }) {
  if (!filasProductos.length) return [];

  const idsProductos = filasProductos.map(producto => producto.id);
  const { data, error } = await clienteSupabase
    .from("product_variants")
    .select("id, product_id, name, value, stock_quantity, sort_order, is_active, created_at, updated_at")
    .in("product_id", idsProductos)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

function normalizarCatalogoSupabase({ clienteSupabase, filasProductos }, filasImagenes, filasVariantes) {
  return filasProductos.map(producto => normalizeSupabaseProduct(
    producto,
    filasImagenes.filter(imagen => imagen.product_id === producto.id),
    filasVariantes.filter(variante => variante.product_id === producto.id),
    clienteSupabase
  ));
}

const CONSULTA_ACTUALIZACION_KEY = "aitana-consulta-actualizacion";
const CONSULTA_STORAGE_KEY = "aitana-mi-consulta";
const productosConsulta = new Set();
const FAVORITOS_STORAGE_KEY = "aitana-favoritos";
const productosFavoritos = new Set();
const variantesConsulta = new Map();
let consultaGuardadaInicial = [];

function obtenerIdProductoConsulta(producto) {
  return producto?.slug || producto?.imagen || producto?.nombre || "";
}

function obtenerIdProductoFavorito(producto) {
  return producto?.slug || producto?.nombre || "";
}

function guardarConsultaPersistente() {
  const ids = [...productosConsulta]
    .map(index => productos[index])
    .filter(producto => producto && !producto.agotado)
    .map(producto => ({
      id: obtenerIdProductoConsulta(producto),
      variante: variantesConsulta.get(obtenerIdProductoConsulta(producto)) || null
    }))
    .filter(item => item.id);

  try {
    localStorage.setItem(CONSULTA_STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch (error) {
    return false;
  }
}

try {
  const idsGuardados = JSON.parse(
    localStorage.getItem(CONSULTA_STORAGE_KEY) || "[]"
  );

  consultaGuardadaInicial = Array.isArray(idsGuardados) ? idsGuardados : [];

  if (Array.isArray(idsGuardados)) {
    idsGuardados.forEach(valorGuardado => {
      const id = typeof valorGuardado === "object" ? valorGuardado?.id : valorGuardado;
      const index = productos.findIndex(
        producto => obtenerIdProductoConsulta(producto) === id || producto.imagen === id || producto.nombre === id
      );
      if (index >= 0 && !productos[index].agotado) {
        productosConsulta.add(index);
        if (valorGuardado?.variante) variantesConsulta.set(id, valorGuardado.variante);
      }
    });
  }

  let consultaTemporal = "";
  try {
    consultaTemporal = sessionStorage.getItem(CONSULTA_ACTUALIZACION_KEY) || "";
  } catch (error) {
    // Se intenta recuperar desde localStorage.
  }
  if (!consultaTemporal) {
    try {
      consultaTemporal = localStorage.getItem(CONSULTA_ACTUALIZACION_KEY) || "";
    } catch (error) {
      // La pÃ¡gina continÃºa sin restauraciÃ³n si el almacenamiento estÃ¡ bloqueado.
    }
  }

  const consultaGuardadaParaActualizar = JSON.parse(consultaTemporal || "[]");

  if (Array.isArray(consultaGuardadaParaActualizar)) {
    consultaGuardadaParaActualizar.forEach(valorGuardado => {
      const index = productos.findIndex(producto =>
        obtenerIdProductoConsulta(producto) === valorGuardado ||
        producto.imagen === valorGuardado ||
        producto.nombre === valorGuardado
      );
      if (index >= 0 && !productos[index].agotado) {
        productosConsulta.add(index);
      }
    });
  }

  try { sessionStorage.removeItem(CONSULTA_ACTUALIZACION_KEY); } catch (error) {}
  try { localStorage.removeItem(CONSULTA_ACTUALIZACION_KEY); } catch (error) {}
} catch (error) {
  // La consulta solo se restaura si el almacenamiento temporal estÃ¡ disponible.
}

try {
  const favoritosGuardados = JSON.parse(localStorage.getItem(FAVORITOS_STORAGE_KEY) || "[]");
  if (Array.isArray(favoritosGuardados)) {
    favoritosGuardados.forEach(valorGuardado => {
      const producto = productos.find(item => item.nombre === valorGuardado || item.slug === valorGuardado);
      productosFavoritos.add(producto ? obtenerIdProductoFavorito(producto) : valorGuardado);
    });
  }
} catch (error) {
  // La página continúa sin persistencia si el navegador bloquea el almacenamiento.
}



// ======================================
// BUSCAR JPG O PNG AUTOMÁTICAMENTE
// ======================================

const dimensionesImagenes = {
  "10 tonos": [450, 800],
  "10 tonos-2": [450, 800],
  "5 codigos labial corazon": [536, 640],
  "5 codigos": [485, 640],
  "beauty blender": [480, 640],
  "belsamo con color": [480, 640],
  "belsamo dup  nivea": [480, 640],
  "belsamo fresita": [480, 640],
  "belsamo fresita-2": [600, 600],
  "brocha para cejas": [480, 640],
  "cepillo-cabello-akoya": [1280, 1010],
  "crema-manos-arroz-bioaqua": [720, 1280],
  "Codigo 4": [450, 800],
  "Codigo 6": [450, 800],
  "conncealer revel": [480, 640],
  "corrector liquido bellespa": [576, 768],
  "corrector liquido samantha": [576, 768],
  "delineadores": [600, 800],
  "disco revel": [480, 640],
  "doble-espejo-cartera": [960, 1280],
  "agua-rosas-revel": [960, 1280],
  "aozy-1": [960, 1280],
  "ganchos hawaianos": [720, 960],
  "Gloss conejo": [480, 640],
  "Gloss dup dior": [480, 640],
  "Gloss mirror": [480, 640],
  "Gloss terciopelo revel": [480, 640],
  "iluminador y rubor 2 en 1": [480, 640],
  "iluminador": [480, 640],
  "juego de 6 brochas para ojos": [480, 640],
  "Labial corazon matte": [480, 640],
  "Labial liquido matte": [480, 640],
  "Labial osito": [480, 640],
  "labial-matte-ever-beauty": [960, 1280],
  "labial-waterproof-super-stay": [1044, 1280],
  "lapiz-labios-ushas": [960, 1280],
  "ligas-cabello-set-6": [1200, 1600],
  "lip-gloss-3d-plump-lips": [960, 1280],
  "lip-gloss-aozy": [960, 1280],
  "magic box 7 en 1": [576, 768],
  "mascarillas faciales bioaqua": [672, 896],
  "mascarillas-hidratantes-faciales": [960, 1280],
  "mascarilla-colageno-ojeras": [960, 1280],
  "mascarilla-limpieza-flower-secret": [960, 1280],
  "paleta gliter": [576, 768],
  "peine-cabello": [960, 1280],
  "peine-desenredante": [960, 1280],
  "perfiladores": [672, 896],
  "polvo compacto flower secret": [466, 640],
  "polvo translucido banana jarusa": [480, 640],
  "rizadores": [576, 768],
  "rubor liquido": [480, 640],
  "rubor-crema-samantha": [960, 1280],
  "set-lima-saca-cuticula-akoya": [1153, 1280],
  "set-peine-espejo": [1280, 1278],
  "Tinta jarusa": [480, 640],
  "Tinta Samantha": [480, 640],
  "toallitas desmaquillantes": [720, 960],
  "toallitas-ecorincia": [1280, 1148],
  "tonos-aozy-matte": [1219, 1280],
  "tonos-corrector-bellespa": [1280, 1040],
  "tonos-corrector-samantha": [1280, 1257],
  "tonos-ever-beauty": [1280, 1048],
  "tonos-gloss-3d": [1280, 966],
  "tonos-gloss-revel": [900, 1600],
  "tonos-labial-waterproof": [1242, 1266],
  "tratamiento-reparador-puntas": [960, 1280],
  "vinchas-skincare": [960, 1280]
};

const imagenesFallidasReportadas = new Set();

function reportarErrorImagen(elemento) {
  const productId = decodeURIComponent(elemento.dataset.imageProductId || "");
  const storagePath = decodeURIComponent(elemento.dataset.imageStoragePath || "");
  const url = decodeURIComponent(elemento.dataset.imageUrl || elemento.currentSrc || elemento.src || "");
  const clave = `${productId}|${storagePath}|${url}`;
  if (!imagenesFallidasReportadas.has(clave)) {
    imagenesFallidasReportadas.add(clave);
    console.warn("Aitana: falló la carga de una imagen de Supabase.", {
      product_id: productId,
      storage_path: storagePath,
      generated_url: url,
      bucket: SUPABASE_PRODUCT_IMAGES_BUCKET
    });
  }
  elemento.onerror = null;
}

function codificarDatoImagen(valor) {
  return encodeURIComponent(String(valor || "")).replace(/'/g, "%27");
}

function imagenHTML(nombre, alt, clase = "", diagnostico = null, opciones = {}) {

  if (/^https?:\/\//i.test(nombre || "")) {
    const {
      diferirSrc = true,
      loading = "lazy",
      fetchPriority = null
    } = opciones;
    const atributoOrigen = diferirSrc
      ? `data-src="${nombre}"`
      : `src="${nombre}"`;
    const atributoPrioridad = fetchPriority
      ? `fetchpriority="${fetchPriority}"`
      : "";

    return `
      <img
        ${atributoOrigen}
        alt="${alt}"
        class="${clase}"
        data-image-product-id="${codificarDatoImagen(diagnostico?.productId)}"
        data-image-storage-path="${codificarDatoImagen(diagnostico?.storagePath)}"
        data-image-url="${codificarDatoImagen(diagnostico?.url || nombre)}"
        loading="${loading}"
        ${atributoPrioridad}
        decoding="async"
        onerror="reportarErrorImagen(this)"
      >
    `;
  }

  const dimensiones = dimensionesImagenes[nombre] || [];
  const atributosDimensiones = dimensiones.length
    ? `width="${dimensiones[0]}" height="${dimensiones[1]}"`
    : "";

  return `
    <img
      src="img/${nombre}.webp"
      alt="${alt}"
      class="${clase}"
      ${atributosDimensiones}
      loading="lazy"
      decoding="async"
      onerror="
        if(!this.dataset.intento){
          this.dataset.intento='jpg';
          this.src='img/${nombre}.jpg';
        } else if(this.dataset.intento === 'jpg'){
          this.dataset.intento='png';
          this.src='img/${nombre}.png';
        }
      "
    >
  `;
}

const observadorImagenesDiferidas = "IntersectionObserver" in window
  ? new IntersectionObserver((entradas, observador) => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;
        const imagen = entrada.target;
        if (imagen.dataset.src && !imagen.getAttribute("src")) {
          imagen.src = imagen.dataset.src;
        }
        observador.unobserve(imagen);
      });
    }, { rootMargin: "240px 160px" })
  : null;

function registrarImagenesDiferidas(raiz = document) {
  raiz?.querySelectorAll("img[data-src]").forEach(imagen => {
    if (imagen.getAttribute("src")) return;
    if (observadorImagenesDiferidas) {
      observadorImagenesDiferidas.observe(imagen);
    } else {
      imagen.src = imagen.dataset.src;
    }
  });
}

function desregistrarImagenesDiferidas(raiz) {
  if (!observadorImagenesDiferidas) return;
  raiz?.querySelectorAll("img[data-src]").forEach(imagen => {
    observadorImagenesDiferidas.unobserve(imagen);
  });
}



// ======================================
// CREAR PRODUCTOS
// ======================================

const contenedor = document.getElementById("lista-productos");
const contenedorRecienLlegados =
  document.getElementById("lista-recien-llegados");

function crearSkeletonProducto(claseAdicional = "") {
  const skeleton = document.createElement("div");
  skeleton.className = `producto catalogo-skeleton${claseAdicional ? ` ${claseAdicional}` : ""}`;
  skeleton.setAttribute("aria-hidden", "true");
  skeleton.innerHTML = `
    <div class="producto-imagen skeleton-bloque"></div>
    <div class="producto-info">
      <span class="skeleton-linea skeleton-linea-corta"></span>
      <span class="skeleton-linea skeleton-linea-titulo"></span>
      <span class="skeleton-linea skeleton-linea-precio"></span>
      <span class="skeleton-linea skeleton-linea-stock"></span>
      <span class="skeleton-boton"></span>
    </div>
  `;
  return skeleton;
}

function mostrarCargaCatalogo() {
  if (!contenedor) return;
  desregistrarImagenesDiferidas(contenedor);
  desregistrarImagenesDiferidas(contenedorRecienLlegados);
  contenedor.replaceChildren(...Array.from({ length: 8 }, () => crearSkeletonProducto()));
  contenedor.setAttribute("aria-busy", "true");

  if (contenedorRecienLlegados) {
    contenedorRecienLlegados.replaceChildren(
      ...Array.from({ length: 3 }, () => crearSkeletonProducto("producto-reciente"))
    );
    contenedorRecienLlegados.setAttribute("aria-busy", "true");
  }

  const contador = document.getElementById("contadorProductos");
  if (contador) contador.textContent = "Cargando catálogo...";
  const etiquetaContador = document.getElementById("contadorProductosEtiqueta");
  if (etiquetaContador) etiquetaContador.hidden = true;
}

function finalizarCargaCatalogo() {
  contenedor?.setAttribute("aria-busy", "false");
  contenedorRecienLlegados?.setAttribute("aria-busy", "false");
  const etiquetaContador = document.getElementById("contadorProductosEtiqueta");
  if (etiquetaContador) etiquetaContador.hidden = false;
}


function productoTieneTonos(producto) {
  return Boolean(
    (producto.imagenesTonos && producto.imagenesTonos.length > 0) ||
    producto.imagenTonos ||
    (producto.variantes && producto.variantes.length > 0) ||
    (producto.detalles && producto.detalles.length > 0)
  );
}

function productoRequiereSeleccionTono(producto) {
  return Array.isArray(producto?.variantes) && producto.variantes.length > 0;
}

function obtenerTextoStock(producto) {
  if (producto.stockQuantity == null) return "Disponible";
  const cantidad = Number(producto.stockQuantity);
  if (cantidad === 0) return "Agotado";
  if (cantidad === 1) return "Última unidad";
  if (cantidad <= 5) return `Quedan ${cantidad}`;
  return "Disponible";
}

function crearPrecioHTML(producto, clase = "precio") {
  const anterior = Number(producto.precioAnterior);
  const actual = Number(producto.precio);
  const tieneOferta = Number.isFinite(anterior) && anterior > actual;
  const descuento = tieneOferta ? Math.round((1 - actual / anterior) * 100) : 0;
  return `<div class="${clase}">${tieneOferta ? `<span class="precio-anterior">S/${anterior.toFixed(2)}</span>` : ""}<span class="precio-actual">S/${producto.precio}</span>${tieneOferta && descuento > 0 ? `<small class="precio-descuento">-${descuento}%</small>` : ""}</div>`;
}


function formatearPrecioWhatsapp(precio) {
  const valor = Number(precio);
  return Number.isFinite(valor) ? `S/ ${valor.toFixed(2)}` : "";
}

function crearMensajeProductoWhatsapp(producto, variante = null) {
  const precio = formatearPrecioWhatsapp(producto?.precio);
  const detalles = [
    `• ${producto?.nombre || "Producto"}`,
    precio ? `• Precio: ${precio}` : "",
    variante ? `• Tono: ${variante}` : ""
  ].filter(Boolean).join("\n");
  const pregunta = producto?.agotado
    ? "¿Tendrán reposición próximamente?"
    : "¿Está disponible?";

  return `Hola Aitana Make Up 💗\n\nEstoy interesada en este producto:\n\n${detalles}\n\n${pregunta}`;
}

function crearUrlWhatsapp(mensaje) {
  return `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function consultarProductoWhatsapp(index) {
  const producto = productos[index];
  if (!producto || producto.agotado) return;

  const variante = variantesConsulta.get(obtenerIdProductoConsulta(producto)) || null;
  if (productoRequiereSeleccionTono(producto) && !variante) {
    if (vistaRapidaModal?.classList.contains("activo")) cerrarVistaRapida();
    abrirModal(index, false, "Selecciona un tono antes de consultar.");
    return;
  }

  const mensaje = crearMensajeProductoWhatsapp(producto, variante);
  window.open(crearUrlWhatsapp(mensaje), "_blank", "noopener,noreferrer");
}

document.addEventListener("click", evento => {
  const enlace = evento.target.closest("[data-whatsapp-producto-index]");
  if (!enlace) return;
  evento.preventDefault();
  consultarProductoWhatsapp(Number(enlace.dataset.whatsappProductoIndex));
});


function crearTarjetaProducto(producto, index, claseAdicional = "") {

    const tieneDetalles =
      productoTieneTonos(producto);


    const urlWhatsappProducto = crearUrlWhatsapp(
      crearMensajeProductoWhatsapp(producto)
    );


    const tarjeta =
      document.createElement("article");

    tarjeta.classList.add("producto");

    if (claseAdicional) {
      tarjeta.classList.add(claseAdicional);
    }

    tarjeta.dataset.index = index;
    if (producto.id) tarjeta.dataset.productId = producto.id;


    if(producto.agotado){
      tarjeta.classList.add("producto-agotado");
    }


    tarjeta.innerHTML = `

      <div class="producto-imagen">

        <button
          type="button"
          class="producto-favorito"
          data-favorito-index="${index}"
          aria-label="Agregar ${producto.nombre} a favoritos"
          aria-pressed="false"
        >
          <i class="fa-regular fa-heart" aria-hidden="true"></i>
        </button>

        ${
          producto.reingreso === true
          ? `<div class="etiqueta-nuevo etiqueta-reingreso">↻ REINGRESO</div>`
          : producto.nuevo === true
            ? `<div class="etiqueta-nuevo">✨ NUEVO</div>`
            : ""
        }

        <button
          type="button"
          class="vista-rapida-trigger"
          data-vista-rapida-index="${index}"
          aria-label="Ver detalles de ${producto.nombre}"
        >
          ${imagenHTML(
            producto.imagen,
            producto.nombre,
            "",
            producto.imagenDiagnostico
          )}
          <span class="vista-rapida-pista">
            <i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>
            Vista rápida
          </span>
        </button>

        ${
          !producto.agotado
          ?
          `
          <div class="etiqueta-disponible">
            <i class="fa-solid fa-circle-check"></i>
            ${obtenerTextoStock(producto)}
          </div>
          `
          :
          ""
        }

        ${
          producto.agotado
          ?
          `
          <div class="sello-agotado">
            AGOTADO
          </div>
          `
          :
          ""
        }

      </div>


      <div class="producto-info">

        <span class="categoria">
          ${producto.categoria}
        </span>

        ${producto.nota ? `<span class="producto-nota">${producto.nota}</span>` : ""}


        <h3>
          ${producto.nombre}
        </h3>


        ${crearPrecioHTML(producto)}

        <small class="producto-stock-unidades">${producto.stockQuantity == null ? "Stock sin registrar" : `${producto.stockQuantity} ${producto.stockQuantity === 1 ? "unidad" : "unidades"}`}</small>


        <div class="acciones-producto">

          ${
            !producto.agotado && tieneDetalles
            ?
            `
            <button
              class="ver-tonos"
              onclick="abrirModal(${index})"
            >
              Ver tonos
            </button>
            `
            :
            ""
          }


          ${
            producto.agotado
            ?
            `
            <button type="button" class="boton-agotado" disabled>
              Producto agotado
            </button>
            `
            :
            `
            <a
              href="${urlWhatsappProducto}"
              target="_blank"
              rel="noopener noreferrer"
              class="whatsapp"
              data-whatsapp-producto-index="${index}"
            >
              <i class="fa-brands fa-whatsapp"></i>
              Consultar
            </a>
            <button
              type="button"
              class="agregar-consulta"
              data-consulta-index="${index}"
              aria-label="Agregar ${producto.nombre} a Mi consulta"
              aria-pressed="false"
            >
              + Agregar a consulta
            </button>
            `
          }

        </div>

      </div>

    `;

    return tarjeta;
}


function crearProductos() {

  desregistrarImagenesDiferidas(contenedor);
  desregistrarImagenesDiferidas(contenedorRecienLlegados);
  contenedor.innerHTML = "";

  productos.forEach((producto, index) => {
    contenedor.appendChild(
      crearTarjetaProducto(producto, index)
    );
  });

  if (contenedorRecienLlegados) {
    contenedorRecienLlegados.innerHTML = "";

    productos
      .map((producto, index) => ({ producto, index }))
      .filter(({ producto }) => producto.nuevo === true)
      .sort((a, b) =>
        new Date(b.producto.fechaCreacion || 0) - new Date(a.producto.fechaCreacion || 0) ||
        Number(b.producto.prioridadReciente === true) - Number(a.producto.prioridadReciente === true)
      )
      .forEach(({ producto, index }) => {
        contenedorRecienLlegados.appendChild(
          crearTarjetaProducto(producto, index, "producto-reciente")
        );
      });
  }

  registrarImagenesDiferidas(contenedor);
  registrarImagenesDiferidas(contenedorRecienLlegados);

}

const favoritosSheet = document.getElementById("favoritosSheet");
const favoritosLista = document.getElementById("favoritosLista");
const consultaSheet = document.getElementById("consultaSheet");
const consultaSheetLista = document.getElementById("consultaSheetLista");
const mobileFavoritosContador = document.getElementById("mobileFavoritosContador");
const favoritosPantallaContador = document.getElementById("favoritosPantallaContador");
const consultaPantallaSubtitulo = document.getElementById("consultaPantallaSubtitulo");
const consultaPantallaResumen = document.getElementById("consultaPantallaResumen");
const pwaFavoritosVista = document.getElementById("pwaFavoritosVista");
const pwaFavoritosLista = document.getElementById("pwaFavoritosLista");
const pwaFavoritosContador = document.getElementById("pwaFavoritosContador");
const pwaConsultaVista = document.getElementById("pwaConsultaVista");
const pwaConsultaLista = document.getElementById("pwaConsultaLista");
const pwaConsultaSubtitulo = document.getElementById("pwaConsultaSubtitulo");
const pwaConsultaResumen = document.getElementById("pwaConsultaResumen");
const pwaConsultaWhatsapp = document.getElementById("pwaConsultaWhatsapp");
const pwaConsultaCtaResumen = document.getElementById("pwaConsultaCtaResumen");
let sheetAbierto = null;
let elementoAntesSheet = null;

function guardarFavoritos() {
  try {
    localStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify([...productosFavoritos]));
  } catch (error) {
    // La interfaz sigue funcionando aunque el navegador bloquee localStorage.
  }
}

function actualizarBotonesFavoritos() {
  document.querySelectorAll("[data-favorito-index]").forEach(boton => {
    const producto = productos[Number(boton.dataset.favoritoIndex)];
    if (!producto) return;
    const favorito = productosFavoritos.has(obtenerIdProductoFavorito(producto));
    boton.classList.toggle("activo", favorito);
    boton.setAttribute("aria-pressed", String(favorito));
    boton.setAttribute("aria-label", `${favorito ? "Quitar" : "Agregar"} ${producto.nombre} ${favorito ? "de" : "a"} favoritos`);
    boton.innerHTML = `<i class="${favorito ? "fa-solid" : "fa-regular"} fa-heart" aria-hidden="true"></i>`;
  });

  if (mobileFavoritosContador) {
    const cantidadFavoritos = productos.filter(producto =>
      productosFavoritos.has(obtenerIdProductoFavorito(producto))
    ).length;
    mobileFavoritosContador.hidden = cantidadFavoritos === 0;
    mobileFavoritosContador.textContent = String(cantidadFavoritos);
  }
}

function plantillaEstadoVacio(icono, titulo, texto) {
  return `<div class="mobile-sheet-vacio"><span aria-hidden="true">${icono}</span><h3>${titulo}</h3><p>${texto}</p></div>`;
}

function renderizarFavoritos() {
  if (!favoritosLista) return;
  desregistrarImagenesDiferidas(favoritosLista);
  const favoritos = productos
    .map((producto, index) => ({ producto, index }))
    .filter(({ producto }) => productosFavoritos.has(obtenerIdProductoFavorito(producto)));

  const vistaPwa = estaEnModoStandalone();
  if (favoritosPantallaContador) {
    favoritosPantallaContador.textContent = `${favoritos.length} ${favoritos.length === 1 ? "producto" : "productos"}`;
  }
  if (pwaFavoritosContador) {
    pwaFavoritosContador.textContent = `${favoritos.length} ${favoritos.length === 1 ? "producto guardado" : "productos guardados"}`;
  }

  const contenidoFavoritos = favoritos.length
    ? favoritos.map(({ producto, index }) => `
      <article class="mobile-sheet-producto">
        <div class="mobile-sheet-miniatura">${imagenHTML(producto.imagen, producto.nombre, "", producto.imagenDiagnostico)}</div>
        <div class="mobile-sheet-producto-info">
          <h3>${producto.nombre}</h3>
          <strong>S/${producto.precio}</strong>
          ${vistaPwa ? `<small class="pwa-favorito-stock ${producto.agotado ? "agotado" : ""}">${obtenerTextoStock(producto)}</small>` : ""}
        </div>
        <button type="button" class="mobile-sheet-quitar" data-favorito-index="${index}" aria-label="Quitar ${producto.nombre} de favoritos">Quitar</button>
        ${vistaPwa ? `<div class="pwa-favorito-acciones">
          ${producto.agotado ? '<span class="pwa-producto-agotado">Agotado</span>' : `<a href="${crearUrlWhatsapp(crearMensajeProductoWhatsapp(producto))}" data-whatsapp-producto-index="${index}" target="_blank" rel="noopener noreferrer">Consultar</a>
          <button type="button" class="agregar-consulta" data-consulta-index="${index}" aria-label="Agregar ${producto.nombre} a Mi consulta" aria-pressed="false">+ Mi consulta</button>`}
        </div>` : ""}
      </article>`).join("")
    : `${plantillaEstadoVacio("♡", "Aún no tienes favoritos", vistaPwa ? "Guarda los productos que más te gusten." : "Toca el corazón de un producto para guardarlo aquí.")}${vistaPwa ? '<button type="button" class="pwa-explorar-productos" data-pwa-vista="catalogo">Explorar productos</button>' : ""}`;

  favoritosLista.innerHTML = contenidoFavoritos;
  if (vistaPwa && pwaFavoritosLista) pwaFavoritosLista.innerHTML = contenidoFavoritos;

  registrarImagenesDiferidas(favoritosLista);
  if (vistaPwa && pwaFavoritosLista) registrarImagenesDiferidas(pwaFavoritosLista);
  actualizarConsultaMultiple();
}

function alternarFavorito(index, boton) {
  const producto = productos[index];
  if (!producto) return;
  const idFavorito = obtenerIdProductoFavorito(producto);
  if (productosFavoritos.has(idFavorito)) productosFavoritos.delete(idFavorito);
  else productosFavoritos.add(idFavorito);
  guardarFavoritos();
  actualizarBotonesFavoritos();
  renderizarFavoritos();
  if (boton) {
    boton.classList.remove("pop");
    requestAnimationFrame(() => boton.classList.add("pop"));
  }
}

function abrirMobileSheet(sheet) {
  if (!sheet) return;
  if (estaEnModoStandalone() && (sheet === favoritosSheet || sheet === consultaSheet)) {
    navegarVistaPwa(sheet === favoritosSheet ? "favoritos" : "consulta");
    return;
  }
  elementoAntesSheet = document.activeElement;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add("activo"));
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("mobile-sheet-abierto");
  sheetAbierto = sheet;
  abrirFavoritos?.classList.toggle("active", sheet === favoritosSheet);
  abrirMiConsulta?.classList.toggle("active", sheet === consultaSheet);
  sheet.querySelector(".mobile-sheet-cerrar")?.focus();
}

function cerrarMobileSheet(sheet = sheetAbierto) {
  if (!sheet) return;
  sheet.classList.remove("activo");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("mobile-sheet-abierto");
  setTimeout(() => { if (!sheet.classList.contains("activo")) sheet.hidden = true; }, 220);
  sheetAbierto = null;
  abrirFavoritos?.classList.remove("active");
  abrirMiConsulta?.classList.remove("active");
  elementoAntesSheet?.focus();
}

document.addEventListener("click", (evento) => {
  const botonFavorito = evento.target.closest("[data-favorito-index]");
  if (botonFavorito) {
    evento.preventDefault();
    evento.stopPropagation();
    alternarFavorito(Number(botonFavorito.dataset.favoritoIndex), botonFavorito);
  }
});

actualizarBotonesFavoritos();


const panelConsultaMultiple =
  document.getElementById("consultaMultiplePanel");

const contadorConsultaMultiple =
  document.getElementById("consultaMultipleContador");

const limpiarConsulta =
  document.getElementById("limpiarConsulta");

const enviarConsultaWhatsapp =
  document.getElementById("enviarConsultaWhatsapp");

const verConsultaMobile = document.getElementById("verConsultaMobile");
const abrirMiConsulta = document.getElementById("abrirMiConsulta");
const abrirFavoritos = document.getElementById("abrirFavoritos");
const mobileConsultaContador = document.getElementById("mobileConsultaContador");
const consultaSheetWhatsapp = document.getElementById("consultaSheetWhatsapp");

function productoTieneTonoPendiente(producto) {
  return productoRequiereSeleccionTono(producto) &&
    !variantesConsulta.has(obtenerIdProductoConsulta(producto));
}

function renderizarConsultaSheet(mostrarAvisoTonos = false) {
  if (!consultaSheetLista) return;
  desregistrarImagenesDiferidas(consultaSheetLista);
  const seleccionados = [...productosConsulta]
    .map(index => ({ producto: productos[index], index }))
    .filter(({ producto }) => producto);
  const tieneTonosPendientes = seleccionados.some(({ producto }) => productoTieneTonoPendiente(producto));
  const totalReferencial = seleccionados.reduce((total, { producto }) => {
    const precio = Number(producto.precio);
    return Number.isFinite(precio) ? total + precio : total;
  }, 0);

  if (consultaPantallaSubtitulo) {
    consultaPantallaSubtitulo.textContent = `${seleccionados.length} ${seleccionados.length === 1 ? "producto seleccionado" : "productos seleccionados"}`;
  }
  if (consultaPantallaResumen) {
    consultaPantallaResumen.textContent = `${seleccionados.length} ${seleccionados.length === 1 ? "producto" : "productos"} · S/ ${totalReferencial.toFixed(2)}`;
  }
  if (pwaConsultaSubtitulo) {
    pwaConsultaSubtitulo.textContent = `${seleccionados.length} ${seleccionados.length === 1 ? "producto seleccionado" : "productos seleccionados"}`;
  }
  if (pwaConsultaCtaResumen) {
    pwaConsultaCtaResumen.textContent = `${seleccionados.length} ${seleccionados.length === 1 ? "producto" : "productos"} · S/ ${totalReferencial.toFixed(2)}`;
  }

  const contenidoConsulta = seleccionados.length
    ? `${mostrarAvisoTonos && tieneTonosPendientes ? '<p class="mobile-sheet-aviso" role="alert">Selecciona los tonos pendientes antes de enviar tu consulta.</p>' : ""}${seleccionados.map(({ producto, index }) => `
      <article class="mobile-sheet-producto${productoTieneTonoPendiente(producto) ? " tono-pendiente" : ""}">
        <div class="mobile-sheet-miniatura">${imagenHTML(producto.imagen, producto.nombre, "", producto.imagenDiagnostico)}</div>
        <div class="mobile-sheet-producto-info">
          <h3>${producto.nombre}</h3>
          ${variantesConsulta.get(obtenerIdProductoConsulta(producto)) ? `<small>Tono: ${variantesConsulta.get(obtenerIdProductoConsulta(producto))}</small>` : ""}
          ${productoTieneTonoPendiente(producto) ? '<small class="mobile-sheet-tono-pendiente">Tono pendiente</small>' : ""}
          <strong>S/${producto.precio}</strong>
          ${productoTieneTonoPendiente(producto) ? `<button type="button" class="mobile-sheet-elegir-tono" data-consulta-tono-index="${index}">Elegir tono</button>` : ""}
        </div>
        <button type="button" class="mobile-sheet-quitar" data-consulta-quitar-index="${index}" aria-label="Quitar ${producto.nombre} de mi consulta">Quitar</button>
      </article>`).join("")}`
    : `${plantillaEstadoVacio("🛍️", "Tu consulta está vacía", estaEnModoStandalone() ? "Agrega los productos que te interesan y consúltanos por WhatsApp." : "Agrega productos y aparecerán aquí para consultarlos juntos.")}${estaEnModoStandalone() ? '<button type="button" class="pwa-explorar-productos" data-pwa-vista="catalogo">Explorar catálogo</button>' : ""}`;

  consultaSheetLista.innerHTML = contenidoConsulta;
  if (estaEnModoStandalone() && pwaConsultaLista) pwaConsultaLista.innerHTML = contenidoConsulta;

  if (pwaConsultaResumen) {
    pwaConsultaResumen.hidden = seleccionados.length === 0;
    pwaConsultaResumen.innerHTML = seleccionados.length ? `
      <h3>Resumen</h3>
      <div><span>${seleccionados.length} ${seleccionados.length === 1 ? "producto seleccionado" : "productos seleccionados"}</span></div>
      <div><span>Total referencial</span><strong>S/ ${totalReferencial.toFixed(2)}</strong></div>
    ` : "";
  }

  if (consultaSheetWhatsapp) consultaSheetWhatsapp.hidden = seleccionados.length === 0;
  if (pwaConsultaWhatsapp) pwaConsultaWhatsapp.hidden = seleccionados.length === 0;
  registrarImagenesDiferidas(consultaSheetLista);
  if (estaEnModoStandalone() && pwaConsultaLista) registrarImagenesDiferidas(pwaConsultaLista);
}


function actualizarConsultaMultiple() {

  const cantidad = productosConsulta.size;

  if (contadorConsultaMultiple) {
    contadorConsultaMultiple.textContent = cantidad === 1
      ? "1 producto seleccionado"
      : `${cantidad} productos seleccionados`;
  }

  if (panelConsultaMultiple) {
    panelConsultaMultiple.hidden = cantidad === 0;
  }

  if (mobileConsultaContador) {
    mobileConsultaContador.hidden = cantidad === 0;
    mobileConsultaContador.textContent = String(cantidad);
  }

  document.body.classList.toggle(
    "consulta-multiple-activa",
    cantidad > 0
  );

  document
    .querySelectorAll("[data-consulta-index]")
    .forEach(boton => {
      const index = Number(boton.dataset.consultaIndex);
      const seleccionado = productosConsulta.has(index);
      const producto = productos[index];

      boton.classList.toggle("agregado", seleccionado);
      boton.setAttribute("aria-pressed", String(seleccionado));
      boton.setAttribute(
        "aria-label",
        seleccionado
          ? `Quitar ${producto.nombre} de Mi consulta`
          : `Agregar ${producto.nombre} a Mi consulta`
      );
      boton.textContent = seleccionado
        ? (boton.classList.contains("vista-rapida-agregar") ? "✓ Agregado a Mi consulta" : "✓ Agregado")
        : (boton.classList.contains("vista-rapida-agregar") ? "+ Agregar a Mi consulta" : "+ Agregar a consulta");
    });

  renderizarConsultaSheet();

}


function alternarProductoConsulta(index) {

  const producto = productos[index];

  if (!producto || producto.agotado) return;

  const idProducto = obtenerIdProductoConsulta(producto);

  if (producto.variantes?.length && !variantesConsulta.has(idProducto)) {
    if (vistaRapidaModal?.classList.contains("activo")) cerrarVistaRapida();
    abrirModal(index, true);
    return;
  }

  if (productosConsulta.has(index)) {
    productosConsulta.delete(index);
    variantesConsulta.delete(idProducto);
  }
  else {
    productosConsulta.add(index);
  }

  guardarConsultaPersistente();
  actualizarConsultaMultiple();

}


function obtenerProductosConsultaDisponibles() {
  return [...productosConsulta]
    .map(index => ({ producto: productos[index], index }))
    .filter(({ producto }) => producto && !producto.agotado);
}

function crearMensajeConsultaWhatsapp(productosSeleccionados) {
  let totalReferencial = 0;
  let tienePrecioValido = false;

  const productosNumerados = productosSeleccionados.map(({ producto }, posicion) => {
    const variante = variantesConsulta.get(obtenerIdProductoConsulta(producto));
    const precioNumerico = Number(producto.precio);
    const precio = formatearPrecioWhatsapp(producto.precio);
    if (Number.isFinite(precioNumerico)) {
      totalReferencial += precioNumerico;
      tienePrecioValido = true;
    }

    return [
      `${posicion + 1}. ${producto.nombre}`,
      precio ? `   Precio: ${precio}` : "",
      variante ? `   Tono: ${variante}` : ""
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const total = tienePrecioValido
    ? `\n\nTotal referencial: S/ ${totalReferencial.toFixed(2)}`
    : "";

  return `Hola Aitana Make Up 💗\n\nQuiero consultar por estos productos:\n\n${productosNumerados}${total}\n\n¿Me confirman disponibilidad y envío, por favor? ✨`;
}

function enviarConsultaPorWhatsapp() {
  const productosSeleccionados = obtenerProductosConsultaDisponibles();
  if (!productosSeleccionados.length) return;

  const pendientes = productosSeleccionados.filter(({ producto }) => productoTieneTonoPendiente(producto));
  if (pendientes.length) {
    renderizarConsultaSheet(true);
    if (window.matchMedia("(max-width: 768px)").matches) {
      abrirMobileSheet(consultaSheet);
    } else {
      abrirModal(pendientes[0].index, false, "Selecciona los tonos pendientes antes de enviar tu consulta.");
    }
    return;
  }

  const mensaje = crearMensajeConsultaWhatsapp(productosSeleccionados);
  window.open(crearUrlWhatsapp(mensaje), "_blank", "noopener,noreferrer");
}


document.addEventListener("click", (e) => {

  const boton = e.target.closest("[data-consulta-index]");

  if (!boton) return;

  alternarProductoConsulta(
    Number(boton.dataset.consultaIndex)
  );

});


if (limpiarConsulta) {
  limpiarConsulta.addEventListener("click", () => {
    productosConsulta.clear();
    variantesConsulta.clear();
    guardarConsultaPersistente();
    actualizarConsultaMultiple();
  });
}


if (enviarConsultaWhatsapp) {
  enviarConsultaWhatsapp.addEventListener("click", enviarConsultaPorWhatsapp);
}

function abrirConsultaSheet() {
  renderizarConsultaSheet();
  if (estaEnModoStandalone()) navegarVistaPwa("consulta");
  else abrirMobileSheet(consultaSheet);
}

verConsultaMobile?.addEventListener("click", abrirConsultaSheet);
abrirMiConsulta?.addEventListener("click", abrirConsultaSheet);
abrirFavoritos?.addEventListener("click", () => {
  renderizarFavoritos();
  if (estaEnModoStandalone()) navegarVistaPwa("favoritos");
  else abrirMobileSheet(favoritosSheet);
});

consultaSheetWhatsapp?.addEventListener("click", () => {
  enviarConsultaPorWhatsapp();
});
pwaConsultaWhatsapp?.addEventListener("click", () => {
  enviarConsultaPorWhatsapp();
});

document.addEventListener("click", (evento) => {
  const elegirTono = evento.target.closest("[data-consulta-tono-index]");
  if (elegirTono) {
    const index = Number(elegirTono.dataset.consultaTonoIndex);
    cerrarMobileSheet(consultaSheet);
    abrirModal(index, false, "Selecciona un tono para completar tu consulta.");
    return;
  }

  const quitarConsulta = evento.target.closest("[data-consulta-quitar-index]");
  if (quitarConsulta) {
    alternarProductoConsulta(Number(quitarConsulta.dataset.consultaQuitarIndex));
    return;
  }

  const cerrar = evento.target.closest("[data-cerrar-sheet]");
  if (cerrar) cerrarMobileSheet(document.getElementById(cerrar.dataset.cerrarSheet));
});

[favoritosSheet, consultaSheet].forEach(sheet => {
  sheet?.addEventListener("click", evento => {
    if (evento.target === sheet) cerrarMobileSheet(sheet);
  });
});

function habilitarCierrePorGesto(panel, cerrar) {
  if (!panel) return;
  let inicioY = 0;
  let desplazamiento = 0;

  panel.addEventListener("touchstart", evento => {
    if (estaEnModoStandalone() && (panel.closest("#favoritosSheet") || panel.closest("#consultaSheet"))) return;
    if (panel.scrollTop > 0) return;
    inicioY = evento.touches[0].clientY;
    desplazamiento = 0;
  }, { passive: true });

  panel.addEventListener("touchmove", evento => {
    if (estaEnModoStandalone() && (panel.closest("#favoritosSheet") || panel.closest("#consultaSheet"))) return;
    if (!inicioY || panel.scrollTop > 0) return;
    desplazamiento = Math.max(0, evento.touches[0].clientY - inicioY);
    if (desplazamiento) panel.style.transform = `translateY(${Math.min(desplazamiento, 150)}px)`;
  }, { passive: true });

  panel.addEventListener("touchend", () => {
    if (estaEnModoStandalone() && (panel.closest("#favoritosSheet") || panel.closest("#consultaSheet"))) return;
    panel.style.transform = "";
    if (desplazamiento > 90) cerrar();
    inicioY = 0;
    desplazamiento = 0;
  });
}

habilitarCierrePorGesto(favoritosSheet?.querySelector(".mobile-sheet-panel"), () => cerrarMobileSheet(favoritosSheet));
habilitarCierrePorGesto(consultaSheet?.querySelector(".mobile-sheet-panel"), () => cerrarMobileSheet(consultaSheet));


// Navegación ligera exclusiva de la PWA instalada.
const scrollVistasPwa = new Map([["inicio", 0], ["catalogo", 0]]);
let vistaPwaActiva = "inicio";

function actualizarNavegacionPwa(vista) {
  document.querySelectorAll(".aitana-mobile-bottom-link[data-pwa-vista]").forEach(enlace => {
    const activo = enlace.dataset.pwaVista === vista;
    enlace.classList.toggle("active", activo);
    if (activo) enlace.setAttribute("aria-current", "page");
    else enlace.removeAttribute("aria-current");
  });
}

function ocultarPantallasPwa() {
  [pwaFavoritosVista, pwaConsultaVista].forEach(vista => {
    if (vista) vista.hidden = true;
  });
  [favoritosSheet, consultaSheet].forEach(sheet => {
    if (!sheet) return;
    sheet.classList.remove("activo");
    sheet.setAttribute("aria-hidden", "true");
    sheet.hidden = true;
  });
  sheetAbierto = null;
  document.body.classList.remove("mobile-sheet-abierto");
}

function actualizarBloquesVistaPwa(vista) {
  document.querySelectorAll(".aitana-mobile-cta, .beneficios-home").forEach(bloque => {
    bloque.hidden = true;
    bloque.classList.add("pwa-oculto-inicio");
  });

  document.querySelectorAll(".recien-llegados").forEach(bloque => {
    const ocultarEnCatalogo = vista === "catalogo";
    bloque.hidden = ocultarEnCatalogo;
    bloque.classList.toggle("pwa-oculto-catalogo", ocultarEnCatalogo);
  });
}

function restaurarBloquesVistaWeb() {
  document.querySelectorAll(".pwa-oculto-catalogo, .pwa-oculto-inicio").forEach(bloque => {
    bloque.hidden = false;
    bloque.classList.remove("pwa-oculto-catalogo", "pwa-oculto-inicio");
  });
}

function navegarVistaPwa(vista, opciones = {}) {
  if (!estaEnModoStandalone()) return false;
  const vistasValidas = ["inicio", "catalogo", "favoritos", "consulta"];
  if (!vistasValidas.includes(vista)) return false;

  if (["inicio", "catalogo"].includes(vistaPwaActiva)) {
    scrollVistasPwa.set(vistaPwaActiva, window.scrollY);
  }

  ocultarPantallasPwa();
  vistaPwaActiva = vista;
  document.body.classList.remove("pwa-vista-inicio", "pwa-vista-catalogo", "pwa-vista-favoritos", "pwa-vista-consulta");
  document.body.classList.add(`pwa-vista-${vista}`);
  actualizarBloquesVistaPwa(vista);
  actualizarNavegacionPwa(vista);

  if (vista === "favoritos" || vista === "consulta") {
    const pantalla = vista === "favoritos" ? pwaFavoritosVista : pwaConsultaVista;
    if (vista === "favoritos") renderizarFavoritos();
    else renderizarConsultaSheet();
    pantalla.hidden = false;
    pantalla.scrollTo({ top: 0 });
  } else {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: opciones.inicio ? 0 : (scrollVistasPwa.get(vista) || 0),
        behavior: "auto"
      });
    });
  }
  return true;
}

function inicializarNavegacionPwa() {
  if (!estaEnModoStandalone() || document.body.classList.contains("pwa-navegacion-lista")) return;
  document.body.classList.add("pwa-navegacion-lista");
  navegarVistaPwa("inicio", { inicio: true });
}

document.addEventListener("click", evento => {
  const destino = evento.target.closest("[data-pwa-vista]");
  if (!destino || !estaEnModoStandalone()) return;
  if (destino === abrirFavoritos || destino === abrirMiConsulta) return;
  evento.preventDefault();
  navegarVistaPwa(destino.dataset.pwaVista, { inicio: destino.dataset.pwaVista === vistaPwaActiva });
});


// ======================================
// VISTA RÁPIDA DEL PRODUCTO
// ======================================

const vistaRapidaModal =
  document.getElementById("vistaRapidaModal");

const vistaRapidaCuerpo =
  document.getElementById("vistaRapidaCuerpo");

const vistaRapidaCerrar =
  document.getElementById("vistaRapidaCerrar");

let elementoAntesVistaRapida = null;


function obtenerElementosFocoVistaRapida() {
  return [...vistaRapidaModal.querySelectorAll(
    'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
  )].filter(elemento => !elemento.hidden && elemento.offsetParent !== null);
}


function cerrarVistaRapida() {
  if (!vistaRapidaModal.classList.contains("activo")) return;

  vistaRapidaModal.classList.remove("activo");
  vistaRapidaModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("vista-rapida-abierta");

  if (elementoAntesVistaRapida) {
    elementoAntesVistaRapida.focus();
  }
}


function abrirVistaRapida(index) {
  const producto = productos[index];
  if (!producto) return;
  const idProducto = obtenerIdProductoConsulta(producto);
  const tonoSeleccionado = variantesConsulta.get(idProducto) || "";
  const tieneTonos = productoTieneTonos(producto);

  const urlWhatsappProducto = crearUrlWhatsapp(
    crearMensajeProductoWhatsapp(producto)
  );

  vistaRapidaCuerpo.innerHTML = `
    <div class="vista-rapida-imagen-contenedor">
      ${imagenHTML(producto.imagen, producto.nombre, "vista-rapida-imagen", producto.imagenDiagnostico, {
        diferirSrc: false,
        loading: "eager"
      })}
      <button
        type="button"
        class="producto-favorito vista-rapida-favorito"
        data-favorito-index="${index}"
        aria-label="Agregar ${producto.nombre} a favoritos"
        aria-pressed="false"
      >
        <i class="fa-regular fa-heart" aria-hidden="true"></i>
      </button>
      ${
        producto.reingreso === true
          ? '<span class="vista-rapida-nuevo vista-rapida-reingreso">↻ REINGRESO</span>'
          : producto.nuevo === true
            ? '<span class="vista-rapida-nuevo">✨ NUEVO</span>'
            : ""
      }
    </div>

    <div class="vista-rapida-info">
      <span class="vista-rapida-categoria">${producto.categoria}</span>
      <h2 id="vistaRapidaTitulo">${producto.nombre}</h2>
      <div class="vista-rapida-resumen">
        ${crearPrecioHTML(producto, "vista-rapida-precio")}
        <div class="vista-rapida-stock ${producto.agotado ? "agotado" : "disponible"}">
          <i class="fa-solid ${producto.agotado ? "fa-circle-xmark" : "fa-circle"}" aria-hidden="true"></i>
          ${obtenerTextoStock(producto)}
        </div>
      </div>
      ${producto.nota ? `<p class="vista-rapida-nota">${producto.nota}</p>` : ""}

      ${tieneTonos ? `
        <div class="vista-rapida-tonos-resumen">
          <span>Tonos disponibles</span>
          ${tonoSeleccionado ? `<strong>Tono seleccionado: ${tonoSeleccionado} <i class="fa-solid fa-check" aria-hidden="true"></i></strong>` : ""}
          <button type="button" class="vista-rapida-tonos" data-vista-tonos-index="${index}">
            ${tonoSeleccionado ? "Cambiar tono" : "Ver tonos"}
          </button>
        </div>
      ` : ""}

      <div class="vista-rapida-acciones">
        ${producto.agotado ? `
          <button type="button" class="vista-rapida-sin-stock" disabled>Producto agotado</button>
        ` : `
          <button
            type="button"
            class="agregar-consulta vista-rapida-agregar"
            data-consulta-index="${index}"
            aria-label="Agregar ${producto.nombre} a Mi consulta"
            aria-pressed="false"
          >
            + Agregar a Mi consulta
          </button>
          <a
            class="vista-rapida-whatsapp"
            href="${urlWhatsappProducto}"
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-producto-index="${index}"
            aria-label="Consultar ${producto.nombre} por WhatsApp"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            Consultar por WhatsApp
          </a>
        `}
      </div>
    </div>
  `;

  elementoAntesVistaRapida = document.activeElement;
  vistaRapidaModal.classList.add("activo");
  vistaRapidaModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("vista-rapida-abierta");
  actualizarConsultaMultiple();
  actualizarBotonesFavoritos();
  vistaRapidaCerrar.focus();
}


document.addEventListener("click", (e) => {
  const disparador = e.target.closest("[data-vista-rapida-index]");

  if (disparador) {
    abrirVistaRapida(Number(disparador.dataset.vistaRapidaIndex));
    return;
  }

  const botonTonos = e.target.closest("[data-vista-tonos-index]");

  if (botonTonos) {
    const index = Number(botonTonos.dataset.vistaTonosIndex);
    cerrarVistaRapida();
    abrirModal(index);
  }
});


vistaRapidaCerrar.addEventListener("click", cerrarVistaRapida);

vistaRapidaModal.addEventListener("click", (e) => {
  if (e.target === vistaRapidaModal) cerrarVistaRapida();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cerrarVistaRapida();
    cerrarMobileSheet();
    return;
  }

  if (e.key === "Tab" && vistaRapidaModal.classList.contains("activo")) {
    const elementosFoco = obtenerElementosFocoVistaRapida();
    if (!elementosFoco.length) return;
    const primero = elementosFoco[0];
    const ultimo = elementosFoco[elementosFoco.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
});

habilitarCierrePorGesto(vistaRapidaModal.querySelector(".vista-rapida-contenido"), cerrarVistaRapida);


actualizarConsultaMultiple();



// ======================================
// ANIMACIONES AL HACER SCROLL
// ======================================

const observadorAnimaciones =
  new IntersectionObserver(
    (entradas) => {

      entradas.forEach(entrada => {

        if(entrada.isIntersecting){

          entrada.target.classList.add("visible");

          observadorAnimaciones.unobserve(
            entrada.target
          );

        }

      });

    },
    { threshold: 0.08 }
  );


function observarAnimacionesCatalogo() {
  document
    .querySelectorAll(".producto, .catalogo-panel, .hero-texto")
    .forEach(elemento => {
      if (elemento.classList.contains("visible")) return;
      observadorAnimaciones.observe(elemento);
    });
}

observarAnimacionesCatalogo();



// ======================================
// BOTÓN VOLVER ARRIBA
// ======================================

const volverArriba =
  document.getElementById("volverArriba");


if (volverArriba) {

  const actualizarVisibilidadVolverArriba = () => {
    if (estaEnModoStandalone()) {
      volverArriba.hidden = true;
      volverArriba.classList.remove("mostrar");
      return;
    }

    volverArriba.hidden = false;
    volverArriba.classList.toggle("mostrar", window.scrollY > 400);
  };

  window.addEventListener("scroll", () => {
    actualizarVisibilidadVolverArriba();
  });

  actualizarVisibilidadVolverArriba();


  volverArriba.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

}



// ======================================
// MODAL PARA TONOS / DETALLES
// ======================================

const modal =
  document.getElementById("modalProducto");

const modalTitulo =
  document.getElementById("modalTitulo");

const modalImagenes =
  document.getElementById("modalImagenes");

const cerrarModal =
  document.getElementById("cerrarModal");

let elementoAntesDelModal = null;



function abrirModal(index, agregarAlElegir = false, mensajeAyuda = "") {

  const producto = productos[index];


  modalTitulo.textContent =
    `${producto.nombre} - S/${producto.precio}`;


  desregistrarImagenesDiferidas(modalImagenes);
  modalImagenes.innerHTML = "";

  const imagenesTonos = producto.imagenesTonos?.length
    ? producto.imagenesTonos
    : (producto.imagenTonos ? [producto.imagenTonos] : []);

  imagenesTonos.forEach((imagenTonos, toneIndex) => {
    const divTonos = document.createElement("div");
    divTonos.classList.add("detalle-imagen");
    const diagnostico = producto.imagenesTonosDiagnostico?.[toneIndex] || producto.imagenTonosDiagnostico;
    divTonos.innerHTML = imagenHTML(
      imagenTonos,
      `Tonos de ${producto.nombre} ${toneIndex + 1}`,
      "",
      diagnostico,
      toneIndex === 0
        ? { diferirSrc: false, loading: "eager", fetchPriority: "high" }
        : { diferirSrc: true, loading: "lazy" }
    );
    modalImagenes.appendChild(divTonos);
  });

  if (producto.variantes?.length) {
    const selector = document.createElement("div");
    selector.className = "selector-variantes";
    selector.innerHTML = `
      <p>Selecciona un tono:</p>
      <div class="selector-variantes-opciones">
        ${producto.variantes.map(variante => `
          <button
            type="button"
            class="selector-variante"
            data-variante-index="${index}"
            data-variante-value="${variante.value}"
            data-agregar-consulta="${agregarAlElegir}"
            ${variante.agotada ? "disabled" : ""}
          >
            <span>${variante.name}: ${variante.value}</span>
            <small>${variante.agotada ? "Agotado" : variante.stockQuantity === 1 ? "Última unidad" : variante.stockQuantity <= 5 ? `Quedan ${variante.stockQuantity}` : "Disponible"}</small>
          </button>
        `).join("")}
      </div>
      ${mensajeAyuda ? `<p class="selector-variantes-ayuda" role="status">${mensajeAyuda}</p>` : agregarAlElegir ? '<p class="selector-variantes-ayuda">Al elegir el tono se agregará a Mi consulta.</p>' : ""}
    `;
    modalImagenes.appendChild(selector);
  }

  (producto.detalles || []).forEach(detalle => {

    const div =
      document.createElement("div");

    div.classList.add("detalle-imagen");


    div.innerHTML =
      imagenHTML(
        detalle,
        producto.nombre
      );


    modalImagenes.appendChild(div);

  });


  elementoAntesDelModal = document.activeElement;

  modal.classList.add("activo");

  modal.setAttribute("aria-hidden", "false");

  registrarImagenesDiferidas(modalImagenes);

  document.body.style.overflow = "hidden";

  cerrarModal.focus();

}

modalImagenes.addEventListener("click", evento => {
  const boton = evento.target.closest("[data-variante-index]");
  if (!boton || boton.disabled) return;
  const index = Number(boton.dataset.varianteIndex);
  const producto = productos[index];
  if (!producto) return;
  variantesConsulta.set(obtenerIdProductoConsulta(producto), boton.dataset.varianteValue);
  if (boton.dataset.agregarConsulta === "true") {
    productosConsulta.add(index);
    guardarConsultaPersistente();
    actualizarConsultaMultiple();
    cerrarVentana();
  } else {
    modalImagenes.querySelectorAll(".selector-variante").forEach(opcion => opcion.classList.toggle("seleccionada", opcion === boton));
    if (productosConsulta.has(index)) {
      guardarConsultaPersistente();
      actualizarConsultaMultiple();
    }
  }
});



function cerrarVentana() {

  if (!modal || !modal.classList.contains("activo")) return;

  modal.classList.remove("activo");

  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  if (elementoAntesDelModal) {
    elementoAntesDelModal.focus();
  }

}



if (cerrarModal) {

  cerrarModal.addEventListener("click", () => {

    cerrarVentana();

  });

}



if (modal) {

  modal.addEventListener("click", (e) => {

    if(e.target === modal){

      cerrarVentana();

    }

  });

}



document.addEventListener("keydown", (e) => {

  if(e.key === "Escape"){

    cerrarVentana();

  }

});



/* =====================================
   CATÁLOGO: BÚSQUEDA + FILTROS + ORDEN
===================================== */

const buscadorCatalogo =
  document.getElementById("buscador");

const selectOrden =
  document.getElementById("ordenProductos");

const contadorProductos =
  document.getElementById("contadorProductos");

const sinResultados =
  document.getElementById("sinResultados");

const botonesStock =
  document.querySelectorAll(".stock-filtro");

const filtrosCategorias =
  document.querySelector(".filtros");

function obtenerBotonesCategoria() {
  return filtrosCategorias?.querySelectorAll(".filtro") || [];
}

const botonVerTodosNuevos =
  document.getElementById("verTodosNuevos");

const botonLimpiarBusqueda =
  document.getElementById("limpiarBusqueda");

const botonLimpiarFiltros =
  document.getElementById("limpiarFiltros");

const botonVerMasProductos =
  document.getElementById("verMasProductos");

const progresoProductos =
  document.getElementById("progresoProductos");

const botonSinResultadosLimpiar =
  document.getElementById("sinResultadosLimpiar");

const PRODUCTOS_POR_CARGA = 12;


let categoriaSeleccionada = "Todos";

let stockSeleccionado = "todos";

let cantidadProductosVisible = PRODUCTOS_POR_CARGA;


function normalizarTexto(texto) {

  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

}


function actualizarCatalogo() {

  const terminosBusqueda =
    normalizarTexto(buscadorCatalogo.value)
      .split(/\s+/)
      .filter(Boolean);


  const tarjetas =
    contenedor.querySelectorAll(".producto");


  let totalResultados = 0;


  tarjetas.forEach(tarjeta => {

    const index =
      Number(tarjeta.dataset.index);


    const producto =
      productos[index];


    const textoDisponibilidad = producto.agotado
      ? "agotado agotados"
      : "disponible disponibles";


    const contenidoBusqueda = normalizarTexto(
      `${producto.nombre} ${producto.categoria} ${textoDisponibilidad} ${producto.nuevo === true ? "nuevo nuevos" : ""} ${producto.reingreso === true ? "reingreso repuesto volvió" : ""}`
    );


    const coincideBusqueda =
      terminosBusqueda.every(termino =>
        contenidoBusqueda.includes(termino)
      );


    const coincideCategoria =

      categoriaSeleccionada === "Todos"

      ||

      producto.categoria ===
      categoriaSeleccionada;


    let coincideStock = true;


    if(stockSeleccionado === "disponible") {

      coincideStock =
        producto.agotado !== true;

    }


    if(stockSeleccionado === "agotado") {

      coincideStock =
        producto.agotado === true;

    }


    const mostrar =

      coincideBusqueda &&
      coincideCategoria &&
      coincideStock;


    if(mostrar) {

      tarjeta.style.display =
        totalResultados < cantidadProductosVisible
          ? "flex"
          : "none";

      totalResultados++;

    }
    else {

      tarjeta.style.display = "none";

    }

  });


  contadorProductos.textContent =
    totalResultados;

  const cantidadMostrada =
    Math.min(cantidadProductosVisible, totalResultados);

  progresoProductos.textContent =
    `Mostrando ${cantidadMostrada} de ${totalResultados} productos`;

  progresoProductos.hidden = totalResultados === 0;


  sinResultados.style.display =
    totalResultados === 0
      ? "block"
      : "none";

  botonVerMasProductos.hidden =
    totalResultados <= cantidadProductosVisible;


  const hayBusqueda =
    buscadorCatalogo.value.trim().length > 0;

  const hayFiltrosActivos =
    hayBusqueda ||
    categoriaSeleccionada !== "Todos" ||
    stockSeleccionado !== "todos";

  botonLimpiarBusqueda.hidden = !hayBusqueda;
  botonLimpiarFiltros.hidden = !hayFiltrosActivos;

}


function reiniciarCargaYActualizar() {
  cantidadProductosVisible = PRODUCTOS_POR_CARGA;
  actualizarCatalogo();
}



/* BUSCADOR */

buscadorCatalogo.addEventListener(
  "input",
  reiniciarCargaYActualizar
);


botonLimpiarBusqueda.addEventListener("click", () => {
  buscadorCatalogo.value = "";
  reiniciarCargaYActualizar();
  buscadorCatalogo.focus();
});



/* CATEGORÍAS */

const ORDEN_CATEGORIAS_CONOCIDAS = [
  "Tintas labiales",
  "Lip Gloss",
  "Labiales",
  "Rostro",
  "Ojos y labios",
  "Correctores",
  "Bálsamos",
  "Brochas",
  "Accesorios",
  "Cuidado facial"
];

const PRESENTACION_CATEGORIAS = {
  "Tintas labiales": { etiqueta: "Tintas labiales", iconoFa: "fa-solid fa-droplet" },
  "Labiales": { etiqueta: "Labiales", icono: "img/icons/labiales-128.png", width: 128, height: 126 },
  "Lip Gloss": { etiqueta: "Gloss", icono: "img/icons/gloss-128.png", width: 128, height: 123 },
  "Rostro": { etiqueta: "Rostro", icono: "img/icons/rost-128.png", width: 128, height: 128 },
  "Ojos y labios": { etiqueta: "Ojos", icono: "img/icons/ojos-128.png", width: 128, height: 122 },
  "Correctores": { etiqueta: "Correctores", iconoFa: "fa-solid fa-highlighter" },
  "Bálsamos": { etiqueta: "Bálsamos", iconoFa: "fa-solid fa-heart" },
  "Brochas": { etiqueta: "Brochas", iconoFa: "fa-solid fa-paintbrush" },
  "Accesorios": { etiqueta: "Accesorios", icono: "img/icons/accesorios-128.png", width: 128, height: 128 },
  "Cuidado facial": { etiqueta: "Cuidado facial", iconoFa: "fa-solid fa-spa" },
  "Perfume": { etiqueta: "Perfume", iconoFa: "fa-solid fa-spray-can-sparkles" }
};

function claveCategoria(categoria) {
  return String(categoria || "").trim().toLocaleLowerCase("es-PE");
}

function obtenerCategoriasActivas() {
  const categoriasUnicas = new Map();
  productos.forEach(producto => {
    const categoria = String(producto.categoria || "").trim();
    const clave = claveCategoria(categoria);
    if (!categoria || clave === "todos" || categoriasUnicas.has(clave)) return;
    categoriasUnicas.set(clave, categoria);
  });

  const ordenConocido = new Map(
    ORDEN_CATEGORIAS_CONOCIDAS.map((categoria, index) => [claveCategoria(categoria), index])
  );

  return [...categoriasUnicas.values()].sort((categoriaA, categoriaB) => {
    const ordenA = ordenConocido.get(claveCategoria(categoriaA));
    const ordenB = ordenConocido.get(claveCategoria(categoriaB));
    if (ordenA != null || ordenB != null) {
      return (ordenA ?? Number.MAX_SAFE_INTEGER) - (ordenB ?? Number.MAX_SAFE_INTEGER);
    }
    return categoriaA.localeCompare(categoriaB, "es", { sensitivity: "base" });
  });
}

function crearRepresentacionCategoria(categoria) {
  const presentacion = PRESENTACION_CATEGORIAS[categoria];
  const contenedorIcono = document.createElement("span");
  contenedorIcono.className = "aitana-mobile-cat-circle";

  if (presentacion?.icono) {
    const imagen = document.createElement("img");
    imagen.src = presentacion.icono;
    imagen.alt = "";
    imagen.width = presentacion.width;
    imagen.height = presentacion.height;
    imagen.loading = "lazy";
    imagen.decoding = "async";
    contenedorIcono.appendChild(imagen);
  } else {
    contenedorIcono.classList.add("categoria-icono-generico");
    const icono = document.createElement("i");
    icono.className = categoria === "Todos"
      ? "fa-solid fa-icons"
      : (presentacion?.iconoFa || "fa-solid fa-wand-magic-sparkles");
    icono.setAttribute("aria-hidden", "true");
    contenedorIcono.appendChild(icono);
  }

  return contenedorIcono;
}

function crearBotonFiltroCategoria(categoria, activo = false) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `filtro${activo ? " activo" : ""}`;
  boton.dataset.categoria = categoria;
  boton.textContent = categoria === "Todos" ? "Todas las categorías" : categoria;
  return boton;
}

function renderizarCategoriasCatalogo() {
  const categorias = obtenerCategoriasActivas();
  const clavesActivas = new Set(categorias.map(claveCategoria));

  if (!clavesActivas.has(claveCategoria(categoriaSeleccionada))) {
    categoriaSeleccionada = "Todos";
  }

  if (filtrosCategorias) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "grupo-etiqueta";
    etiqueta.textContent = "Categorías";
    filtrosCategorias.replaceChildren(
      etiqueta,
      crearBotonFiltroCategoria("Todos", categoriaSeleccionada === "Todos"),
      ...categorias.map(categoria => crearBotonFiltroCategoria(
        categoria,
        categoria === categoriaSeleccionada
      ))
    );
  }

  if (categoriasMobile) {
    const categoriasMoviles = ["Todos", ...categorias];
    const botonesMoviles = categoriasMoviles.map(categoria => {
      const boton = document.createElement("button");
      const presentacion = PRESENTACION_CATEGORIAS[categoria];
      boton.type = "button";
      boton.className = "aitana-mobile-cat";
      boton.dataset.categoria = categoria;
      boton.setAttribute("aria-label", categoria);
      boton.appendChild(crearRepresentacionCategoria(categoria));

      const etiqueta = document.createElement("span");
      etiqueta.className = "aitana-mobile-cat-label";
      etiqueta.textContent = categoria === "Todos"
        ? "Todos"
        : (presentacion?.etiqueta || categoria);
      boton.appendChild(etiqueta);
      return boton;
    });
    categoriasMobile.replaceChildren(...botonesMoviles);
  }

  document.querySelectorAll(".busca-hoy [data-descubrimiento-categoria]").forEach(boton => {
    boton.hidden = !clavesActivas.has(claveCategoria(boton.dataset.descubrimientoCategoria));
  });

  requestAnimationFrame(actualizarIndicadorCategorias);
}

filtrosCategorias?.addEventListener("click", evento => {
  const boton = evento.target.closest(".filtro[data-categoria]");
  if (!boton || !filtrosCategorias.contains(boton)) return;

  obtenerBotonesCategoria().forEach(elemento => elemento.classList.remove("activo"));
  boton.classList.add("activo");
  categoriaSeleccionada = boton.dataset.categoria;
  reiniciarCargaYActualizar();

  if (window.matchMedia("(max-width: 700px)").matches) {
    boton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
});


botonLimpiarFiltros.addEventListener("click", () => {
  buscadorCatalogo.value = "";
  categoriaSeleccionada = "Todos";
  stockSeleccionado = "todos";

  obtenerBotonesCategoria().forEach(boton => {
    boton.classList.toggle(
      "activo",
      boton.dataset.categoria === "Todos"
    );
  });

  botonesStock.forEach(boton => {
    boton.classList.toggle(
      "activo",
      boton.dataset.stock === "todos"
    );
  });

  reiniciarCargaYActualizar();
});



/* STOCK */

botonesStock.forEach(boton => {

  boton.addEventListener("click", () => {

    botonesStock.forEach(b => {

      b.classList.remove("activo");

    });


    boton.classList.add("activo");


    stockSeleccionado =
      boton.dataset.stock;


    reiniciarCargaYActualizar();

  });

});



/* ORDEN */

function ordenarCatalogo() {

  const tarjetas =
    [
      ...contenedor.querySelectorAll(".producto")
    ];


  tarjetas.sort((tarjetaA, tarjetaB) => {

    const productoA =
      productos[
        Number(tarjetaA.dataset.index)
      ];


    const productoB =
      productos[
        Number(tarjetaB.dataset.index)
      ];

    const indexA = Number(tarjetaA.dataset.index);
    const indexB = Number(tarjetaB.dataset.index);


    switch(selectOrden.value) {


      case "precio-asc":

        return (
          parseFloat(productoA.precio) -
          parseFloat(productoB.precio)
        );


      case "precio-desc":

        return (
          parseFloat(productoB.precio) -
          parseFloat(productoA.precio)
        );


      case "nombre":

        return productoA.nombre
          .localeCompare(
            productoB.nombre,
            "es"
          );


      case "recientes":

        return (
          Number(productoB.nuevo === true) -
          Number(productoA.nuevo === true)
        ) || (indexA - indexB);


      default:

        return (
          Number(productoA.agotado === true) -
          Number(productoB.agotado === true)
        ) || (indexA - indexB);

    }

  });


  tarjetas.forEach(tarjeta => {

    contenedor.appendChild(tarjeta);

  });

}


selectOrden.addEventListener("change", () => {
  ordenarCatalogo();
  reiniciarCargaYActualizar();
});


if (botonVerTodosNuevos) {
  botonVerTodosNuevos.addEventListener("click", () => {
    buscadorCatalogo.value = "nuevo";
    categoriaSeleccionada = "Todos";
    stockSeleccionado = "todos";

    obtenerBotonesCategoria().forEach(boton => {
      boton.classList.toggle(
        "activo",
        boton.dataset.categoria === "Todos"
      );
    });

    botonesStock.forEach(boton => {
      boton.classList.toggle(
        "activo",
        boton.dataset.stock === "todos"
      );
    });

    reiniciarCargaYActualizar();
    document.querySelector(".catalogo-panel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    buscadorCatalogo.focus({ preventScroll: true });
  });
}


botonVerMasProductos.addEventListener("click", () => {
  cantidadProductosVisible += PRODUCTOS_POR_CARGA;
  actualizarCatalogo();
});

botonSinResultadosLimpiar.addEventListener("click", () => {
  botonLimpiarFiltros.click();
});


const botonRecienAnterior =
  document.getElementById("recienLlegadosAnterior");

const botonRecienSiguiente =
  document.getElementById("recienLlegadosSiguiente");

const progresoRecienLlegados =
  document.getElementById("recienLlegadosProgreso");


function actualizarCarruselRecientes() {
  if (!contenedorRecienLlegados) return;

  const maximoScroll =
    contenedorRecienLlegados.scrollWidth -
    contenedorRecienLlegados.clientWidth;

  const progreso = maximoScroll > 0
    ? contenedorRecienLlegados.scrollLeft / maximoScroll
    : 0;

  progresoRecienLlegados.style.transform =
    `scaleX(${Math.max(.18, progreso)})`;

  botonRecienAnterior.disabled =
    contenedorRecienLlegados.scrollLeft <= 2;

  botonRecienSiguiente.disabled =
    contenedorRecienLlegados.scrollLeft >= maximoScroll - 2;
}


function desplazarRecienLlegados(direccion) {
  contenedorRecienLlegados.scrollBy({
    left: direccion * contenedorRecienLlegados.clientWidth * .9,
    behavior: "smooth"
  });
}


botonRecienAnterior.addEventListener("click", () => {
  desplazarRecienLlegados(-1);
});

botonRecienSiguiente.addEventListener("click", () => {
  desplazarRecienLlegados(1);
});

contenedorRecienLlegados.addEventListener(
  "scroll",
  actualizarCarruselRecientes,
  { passive: true }
);

window.addEventListener("resize", actualizarCarruselRecientes);

ordenarCatalogo();
actualizarCatalogo();
actualizarCarruselRecientes();



// ======================================
// MENÚ CELULAR
// ======================================

const menuToggle =
  document.getElementById("menuToggle");

const menu =
  document.getElementById("menu");


if(menuToggle && menu){

  menuToggle.addEventListener("click", () => {

    menu.classList.toggle("abierto");

    const abierto = menu.classList.contains("abierto");
    menuToggle.setAttribute("aria-expanded", String(abierto));
    menuToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");

  });


  document
    .querySelectorAll("#menu a")
    .forEach(enlace => {

      enlace.addEventListener("click", () => {

        const href = enlace.getAttribute("href");

        if (href && href.startsWith("#")) {
          marcarActivo(href.slice(1));
        }

        menu.classList.remove("abierto");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");

      });

  });


  document.addEventListener("click", (e) => {

    if (
      menu.classList.contains("abierto") &&
      !menu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {

      menu.classList.remove("abierto");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");

    }

  });

}



// ======================================
// MENÚ ACTIVO / SCROLLSPY
// ======================================

function marcarActivo(id) {

  const enlace =
    document.querySelector(
      '.nav-link[href="#' + id + '"]'
    );

  if (!enlace) return;


  const activo =
    document.querySelector(
      ".nav-link.activo-menu"
    );

  if (activo && activo !== enlace) {
    activo.classList.remove("activo-menu");
  }

  enlace.classList.add("activo-menu");

}


function actualizarScrollspy() {

  const header =
    document.querySelector(".header");

  const altoHeader =
    header ? header.offsetHeight : 0;

  const seccionReferencia =
    document.getElementById("productos");

  const margenScroll =
    seccionReferencia
      ? parseFloat(
          getComputedStyle(
            seccionReferencia
          ).scrollMarginTop
        ) || 0
      : 0;

  const margen =
    Math.max(
      altoHeader + 12,
      margenScroll + 10
    );

  const secciones = [
    "inicio",
    "productos",
    "entregas",
    "contacto"
  ];

  let seccionActiva = secciones[0];

  for (const id of secciones) {

    const seccion =
      document.getElementById(id);

    if (!seccion) continue;

    if (
      seccion.getBoundingClientRect().top
        <= margen
    ) {

      seccionActiva = id;

    }

  }

  marcarActivo(seccionActiva);

}


let scrollspyProgramado = false;

window.addEventListener(
  "scroll",
  () => {

    if (scrollspyProgramado) return;

    scrollspyProgramado = true;

    requestAnimationFrame(() => {

      actualizarScrollspy();

      scrollspyProgramado = false;

    });

  },
  { passive: true }
);


actualizarScrollspy();

window.addEventListener(
  "resize",
  actualizarScrollspy
);



// ======================================
// MENSAJE CONSOLA
// ======================================

console.log(
  "Aitana Make Up cargó correctamente."
);



// ======================================
// RECARGAR SIEMPRE AL INICIO
// ======================================

window.addEventListener("load", () => {

  history.replaceState(
    null,
    null,
    window.location.pathname
  );

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });

});



// ======================================
// ENTREGAS REALES: CARRUSEL Y VISOR
// ======================================

const entregasGaleria = document.getElementById("entregasGaleria");
const entregaModal = document.getElementById("entregaModal");
const entregaModalImagen = document.getElementById("entregaModalImagen");
const entregaModalCerrar = document.getElementById("entregaModalCerrar");
const entregasIndicadores = document.querySelectorAll(".entregas-indicadores i");
let entregaDisparadorActivo = null;

function cerrarEntregaModal() {
  if (!entregaModal) return;
  entregaModal.classList.remove("activo");
  entregaModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("entrega-modal-abierto");
  entregaModalImagen.removeAttribute("src");
  if (entregaDisparadorActivo) entregaDisparadorActivo.focus();
}

if (entregasGaleria && entregaModal && entregaModalImagen) {
  entregasGaleria.addEventListener("click", (evento) => {
    const disparador = evento.target.closest("[data-entrega-imagen]");
    if (!disparador) return;
    entregaDisparadorActivo = disparador;
    entregaModalImagen.src = disparador.dataset.entregaImagen;
    entregaModalImagen.alt = disparador.querySelector("img")?.alt || "Entrega real de Aitana Make Up";
    entregaModal.classList.add("activo");
    entregaModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("entrega-modal-abierto");
    entregaModalCerrar?.focus();
  });

  entregasGaleria.addEventListener("scroll", () => {
    const tarjetas = [...entregasGaleria.querySelectorAll(".entrega-tarjeta")];
    if (!tarjetas.length) return;
    const indice = tarjetas.reduce((mejor, tarjeta, actual) =>
      Math.abs(tarjeta.offsetLeft - entregasGaleria.scrollLeft) <
      Math.abs(tarjetas[mejor].offsetLeft - entregasGaleria.scrollLeft) ? actual : mejor, 0);
    entregasIndicadores.forEach((punto, actual) => punto.classList.toggle("activo", actual === indice));
  }, { passive: true });
}

entregaModalCerrar?.addEventListener("click", cerrarEntregaModal);
entregaModal?.addEventListener("click", (evento) => {
  if (evento.target === entregaModal) cerrarEntregaModal();
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && entregaModal?.classList.contains("activo")) cerrarEntregaModal();
});


// ======================================
// PORTADA MÓVIL AITANA (solo <=768px)
// Reutiliza: menuToggle, #menu, buscador (#buscador),
// .filtro (data-categoria), #productos, modal, scrollspy.
// ======================================

const productosDestacadosMobile = [
  "Lip Gloss Terciopelo Revel",
  "Labial Osito Revel",
  "Iluminador Compacto Revel",
  "Paleta Gliter Flower"
];

document.querySelectorAll("[data-pwa-abrir]").forEach(boton => {
  boton.addEventListener("click", () => {
    document.getElementById(boton.dataset.pwaAbrir)?.click();
  });
});

const entregasSeccionPwa = document.getElementById("entregas");
const entregasPadreOriginal = entregasSeccionPwa?.parentNode;
const entregasSiguienteOriginal = entregasSeccionPwa?.nextSibling;

function ajustarEntregasPwa(isMobile) {
  if (!entregasSeccionPwa || !entregasPadreOriginal) return;

  const buscaHoyMobile = document.querySelector(".busca-hoy-mobile");
  const mostrarAntesEnPwa = isMobile && estaEnModoStandalone();

  if (mostrarAntesEnPwa && buscaHoyMobile) {
    buscaHoyMobile.before(entregasSeccionPwa);
    return;
  }

  entregasPadreOriginal.insertBefore(
    entregasSeccionPwa,
    entregasSiguienteOriginal
  );
}

function ajustarMobile() {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const home = document.querySelector(".aitana-mobile-home");
  const recienLlegados = document.querySelector(".recien-llegados");
  const recienLlegadosMobileSlot =
    document.getElementById("recienLlegadosMobileSlot");
  const productosSeccion = document.getElementById("productos");
  const catalogoPanel = document.querySelector(".catalogo-panel");

  if (recienLlegados && recienLlegadosMobileSlot && productosSeccion && catalogoPanel) {
    if (isMobile) {
      recienLlegadosMobileSlot.appendChild(recienLlegados);
    }
    else {
      productosSeccion.insertBefore(recienLlegados, productosSeccion.firstElementChild);
    }
  }

  if (home) {
    home.style.display = isMobile ? "block" : "none";
  }

  ajustarEntregasPwa(isMobile);

  const heroViejo = document.querySelectorAll(".hero-texto, .hero-imagen");
  if (home) {
    heroViejo.forEach(el => {
      if (el) el.style.display = isMobile ? "none" : "";
    });
  }

  if (isMobile) {
    renderizarMobileProductos();
    sincronizarBottomNav();
  }
}

function renderizarMobileProductos() {
  const contenedor = document.getElementById("aitanaMobileProducts");
  if (!contenedor) return;
  desregistrarImagenesDiferidas(contenedor);
  contenedor.innerHTML = "";

  const mapa = {};
  productos.forEach((producto, index) => {
    mapa[producto.nombre] = { producto, index };
  });

  const nombresDestacados = [
    ...productosDestacadosMobile,
    ...productos.filter(producto => producto.destacado === true).map(producto => producto.nombre)
  ].filter((nombre, index, lista) => lista.indexOf(nombre) === index);

  nombresDestacados.forEach(nombre => {
    const destacado = mapa[nombre];
    if (!destacado || destacado.producto.agotado) return;

    const { producto, index } = destacado;

    const tarjeta = document.createElement("div");
    tarjeta.className = "aitana-mobile-product";
    const vistaPwa = estaEnModoStandalone();

    const hrefWA =
      crearUrlWhatsapp(crearMensajeProductoWhatsapp(producto));

    tarjeta.innerHTML = `
      <button
        type="button"
        class="producto-favorito producto-favorito-mobile"
        data-favorito-index="${index}"
        aria-label="Agregar ${producto.nombre} a favoritos"
        aria-pressed="false"
      >
        <i class="fa-regular fa-heart" aria-hidden="true"></i>
      </button>
      ${vistaPwa ? `<button type="button" class="aitana-mobile-destacado-trigger" data-vista-rapida-index="${index}" aria-label="Ver detalles de ${producto.nombre}">` : `<a href="${hrefWA}" target="_blank" rel="noopener noreferrer" data-whatsapp-producto-index="${index}" aria-label="Consultar ${producto.nombre} por WhatsApp">`}
        ${imagenHTML(producto.imagen, producto.nombre, "", producto.imagenDiagnostico)}
      ${vistaPwa ? "</button>" : "</a>"}
      <h3>${producto.nombre}</h3>
      <div class="aitana-mobile-precio">S/${producto.precio}</div>
      ${vistaPwa ? "" : `<a href="${hrefWA}" target="_blank" rel="noopener noreferrer" class="aitana-mobile-whatsapp" data-whatsapp-producto-index="${index}" aria-label="Consultar por WhatsApp">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <button
        type="button"
        class="agregar-consulta agregar-consulta-mobile"
        data-consulta-index="${index}"
        aria-label="Agregar ${producto.nombre} a Mi consulta"
        aria-pressed="false"
      >
        + Agregar a consulta
      </button>`}
    `;

    contenedor.appendChild(tarjeta);
  });

  actualizarConsultaMultiple();
  actualizarBotonesFavoritos();
  registrarImagenesDiferidas(contenedor);
}

function sincronizarBottomNav() {
  const linksNav = document.querySelectorAll(".aitana-mobile-bottom-link");
  if (estaEnModoStandalone()) {
    actualizarNavegacionPwa(vistaPwaActiva);
    return;
  }
  const linksNavMap = {};
  linksNav.forEach(link => {
    const href = link.getAttribute("href");
    linksNavMap[href] = link;
  });

  const seccionActiva =
    document.querySelector(".nav-link.activo-menu") ||
    document.querySelector("a[href='#inicio']");

  const hrefActivo = seccionActiva
    ? seccionActiva.getAttribute("href")
    : "#inicio";

  linksNav.forEach(link => link.classList.remove("active"));
  if (linksNavMap[hrefActivo]) {
    linksNavMap[hrefActivo].classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", ajustarMobile);
window.addEventListener("resize", ajustarMobile);

// Buscador móvil → controla el buscador real del catálogo
const mobileSearch = document.getElementById("aitanaMobileSearch");
const buscadorReal = document.getElementById("buscador");
if (mobileSearch && buscadorReal) {
  mobileSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const texto = mobileSearch.value.trim();
      buscadorReal.value = texto;
      buscadorReal.dispatchEvent(
        new Event("input", { bubbles: true })
      );
      if (estaEnModoStandalone()) {
        navegarVistaPwa("catalogo", { inicio: true });
      } else {
        const productosSec = document.getElementById("productos");
        productosSec?.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
}

const categoriasMobile = document.getElementById("aitanaMobileCategories");

// Categorías móviles → activan el filtro real del catálogo
categoriasMobile?.addEventListener("click", evento => {
  const boton = evento.target.closest(".aitana-mobile-cat[data-categoria]");
  if (!boton || !categoriasMobile.contains(boton)) return;
  const categoria = boton.dataset.categoria;
  const filtroReal = [...obtenerBotonesCategoria()].find(
    filtro => filtro.dataset.categoria === categoria
  );
  filtroReal?.click();

  const stockTodos = document.querySelector('.stock-filtro[data-stock="todos"]');
  stockTodos?.click();
  if (estaEnModoStandalone()) navegarVistaPwa("catalogo", { inicio: true });
  else document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
});

// Indicador visual discreto mientras quedan categorías fuera de pantalla.

function actualizarIndicadorCategorias() {
  if (!categoriasMobile) return;
  const quedanCategorias =
    categoriasMobile.scrollLeft + categoriasMobile.clientWidth <
    categoriasMobile.scrollWidth - 2;
  categoriasMobile.classList.toggle("hay-mas-categorias", quedanCategorias);
}

categoriasMobile?.addEventListener("scroll", actualizarIndicadorCategorias, { passive: true });
window.addEventListener("resize", actualizarIndicadorCategorias);
window.addEventListener("load", actualizarIndicadorCategorias);


// Atajos visuales del Home → reutilizan filtros reales del catálogo
document.addEventListener("click", evento => {
  const boton = evento.target.closest("[data-descubrimiento-categoria]");
  if (!boton) return;
  const categoria = boton.dataset.descubrimientoCategoria;
  const filtroReal = [...obtenerBotonesCategoria()].find(
    filtro => filtro.dataset.categoria === categoria
  );
  const stockTodos = document.querySelector('.stock-filtro[data-stock="todos"]');

  filtroReal?.click();
  stockTodos?.click();
  if (estaEnModoStandalone()) navegarVistaPwa("catalogo", { inicio: true });
  else {
    document.getElementById("catalogoPrincipal")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
});

// Scrollspy: mantener la barra inferior móvil sincronizada
let syncNavPendiente = false;
window.addEventListener("scroll", () => {
  if (syncNavPendiente) return;
  syncNavPendiente = true;
  requestAnimationFrame(() => {
    sincronizarBottomNav();
    syncNavPendiente = false;
  });
}, { passive: true });

// Anuncio de bienvenida: se muestra una sola vez por sesión.
const anuncioAitana = document.getElementById("anuncioAitana");
const cerrarAnuncio = document.getElementById("cerrarAnuncio");
const claveAnuncioVisto = "aitanaBannerNuevosVisto";
let focoAntesDelAnuncio = null;

function mostrarAnuncioAitana() {
  if (
    !anuncioAitana ||
    estaEnModoStandalone() ||
    sessionStorage.getItem(claveAnuncioVisto)
  ) return;

  const imagenAnuncio = anuncioAitana.querySelector("img[data-src]");
  if (imagenAnuncio && !imagenAnuncio.getAttribute("src")) {
    imagenAnuncio.src = imagenAnuncio.dataset.src;
  }

  focoAntesDelAnuncio = document.activeElement;
  anuncioAitana.hidden = false;
  anuncioAitana.setAttribute("aria-hidden", "false");
  document.body.classList.add("anuncio-abierto");

  requestAnimationFrame(() => {
    anuncioAitana.classList.add("anuncio-visible");
    cerrarAnuncio?.focus();
  });
}

function ocultarAnuncioAitana() {
  if (!anuncioAitana || anuncioAitana.hidden) return;

  sessionStorage.setItem(claveAnuncioVisto, "true");
  anuncioAitana.classList.remove("anuncio-visible");
  anuncioAitana.setAttribute("aria-hidden", "true");
  document.body.classList.remove("anuncio-abierto");

  const finalizarCierre = () => {
    anuncioAitana.hidden = true;
    focoAntesDelAnuncio?.focus?.();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finalizarCierre();
  } else {
    window.setTimeout(finalizarCierre, 240);
  }
}

cerrarAnuncio?.addEventListener("click", ocultarAnuncioAitana);
anuncioAitana?.addEventListener("click", (evento) => {
  if (evento.target === anuncioAitana) ocultarAnuncioAitana();
});
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && anuncioAitana?.classList.contains("anuncio-visible")) {
    ocultarAnuncioAitana();
  }
});
document.addEventListener("DOMContentLoaded", mostrarAnuncioAitana);


// ======================================
// PWA: INSTALACIÓN Y MODO STANDALONE
// ======================================

const pwaIosAviso = document.getElementById("pwaIosAviso");
const pwaIosEntendido = document.getElementById("pwaIosEntendido");
const pwaAndroidInstalar = document.getElementById("pwaAndroidInstalar");
const pwaActualizacionAviso = document.getElementById("pwaActualizacionAviso");
const pwaActualizarAhora = document.getElementById("pwaActualizarAhora");
const PWA_IOS_AVISO_KEY = "aitana-pwa-ios-aviso-cerrado";
const PWA_UPDATE_RELOAD_KEY = "aitana-pwa-actualizacion-recarga";
const PWA_UPDATE_INTERVALO = 5 * 60 * 1000;
const PWA_UPDATE_MINIMO = 60 * 1000;
const aitanaSplash = document.getElementById("aitanaSplash");
let eventoInstalacionPwa = null;
let splashAitanaActiva = false;
let splashAitanaMostrada = false;
let recargaActualizacionEnCurso = false;
let ultimaComprobacionPwa = 0;
let workerActualizacionPendiente = null;

function estaEnModoStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
}

function actualizarModoPwa() {
  const standalone = estaEnModoStandalone();
  document.documentElement.classList.toggle("modo-standalone", standalone);

  if (standalone) {
    if (pwaIosAviso) pwaIosAviso.hidden = true;
    if (pwaAndroidInstalar) pwaAndroidInstalar.hidden = true;
    inicializarNavegacionPwa();
    if (window.matchMedia("(max-width: 768px)").matches) {
      renderizarMobileProductos();
    }
  } else {
    restaurarBloquesVistaWeb();
  }

  if (volverArriba) {
    volverArriba.hidden = standalone;
    if (standalone) volverArriba.classList.remove("mostrar");
  }
}

function mostrarSplashPwa() {
  if (
    !aitanaSplash ||
    splashAitanaActiva ||
    splashAitanaMostrada ||
    esRutaRevision ||
    MODO_ACTUALIZACION ||
    !estaEnModoStandalone()
  ) {
    return;
  }

  if (window.AITANA_SPLASH_FALLBACK) return;

  const tipoNavegacion = performance.getEntriesByType?.("navigation")[0]?.type;
  if (tipoNavegacion === "reload") {
    return;
  }

  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiempoTranscurrido = Math.max(
    0,
    performance.now() - Number(window.AITANA_SPLASH_INICIO || performance.now())
  );
  const duracionObjetivo = movimientoReducido ? 80 : 320;
  const duracion = Math.max(0, duracionObjetivo - tiempoTranscurrido);
  const duracionSalida = movimientoReducido ? 0 : 120;

  splashAitanaMostrada = true;
  splashAitanaActiva = true;
  aitanaSplash.hidden = false;
  aitanaSplash.setAttribute("aria-hidden", "false");
  document.body.classList.add("splash-aitana-activa");

  if (window.AITANA_SPLASH_PREPARADA) {
    aitanaSplash.classList.add("splash-visible");
    document.documentElement.classList.remove("aitana-splash-pendiente");
    window.AITANA_SPLASH_PREPARADA = false;
  } else {
    requestAnimationFrame(() => {
      aitanaSplash.classList.add("splash-visible");
    });
  }

  window.setTimeout(() => {
    aitanaSplash.classList.add("splash-saliendo");

    window.setTimeout(() => {
      aitanaSplash.hidden = true;
      aitanaSplash.classList.remove("splash-visible", "splash-saliendo");
      aitanaSplash.setAttribute("aria-hidden", "true");
      document.body.classList.remove("splash-aitana-activa");
      document.documentElement.classList.remove("aitana-splash-pendiente");
      splashAitanaActiva = false;
    }, duracionSalida);
  }, duracion);
}

function puedeMostrarInstalacionPwa() {
  return !esRutaRevision && !MODO_ACTUALIZACION && !estaEnModoStandalone();
}

function esSafariIos() {
  const agente = navigator.userAgent;
  const dispositivoIos = /iPad|iPhone|iPod/.test(agente) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const otroNavegadorIos = /CriOS|FxiOS|EdgiOS|OPiOS/.test(agente);
  return dispositivoIos && /Safari/.test(agente) && !otroNavegadorIos;
}

function mostrarAvisoIosPwa() {
  if (!pwaIosAviso || !puedeMostrarInstalacionPwa() || !esSafariIos()) return;

  try {
    if (localStorage.getItem(PWA_IOS_AVISO_KEY) === "true") return;
  } catch (error) {
    // Si el almacenamiento está bloqueado, el aviso sigue siendo descartable en la sesión actual.
  }

  pwaIosAviso.hidden = false;
}

pwaIosEntendido?.addEventListener("click", () => {
  pwaIosAviso.hidden = true;
  try {
    localStorage.setItem(PWA_IOS_AVISO_KEY, "true");
  } catch (error) {
    // Sin persistencia, simplemente se oculta durante esta carga.
  }
});

window.addEventListener("beforeinstallprompt", evento => {
  evento.preventDefault();
  eventoInstalacionPwa = evento;
  if (pwaAndroidInstalar && puedeMostrarInstalacionPwa()) {
    pwaAndroidInstalar.hidden = false;
  }
});

pwaAndroidInstalar?.addEventListener("click", async () => {
  if (!eventoInstalacionPwa) return;
  pwaAndroidInstalar.hidden = true;
  await eventoInstalacionPwa.prompt();
  await eventoInstalacionPwa.userChoice;
  eventoInstalacionPwa = null;
});

window.addEventListener("appinstalled", () => {
  eventoInstalacionPwa = null;
  if (pwaAndroidInstalar) pwaAndroidInstalar.hidden = true;
  actualizarModoPwa();
});

window.matchMedia("(display-mode: standalone)").addEventListener?.("change", actualizarModoPwa);

document.addEventListener("DOMContentLoaded", () => {
  actualizarModoPwa();
  mostrarSplashPwa();
  window.setTimeout(mostrarAvisoIosPwa, 1200);
});

function guardarConsultaParaActualizacion() {
  if (guardarConsultaPersistente()) return true;
  if (!productosConsulta.size) return true;

  const ids = [...productosConsulta]
    .map(index => obtenerIdProductoConsulta(productos[index]))
    .filter(Boolean);
  const contenido = JSON.stringify(ids);
  let guardado = false;

  try {
    sessionStorage.setItem(CONSULTA_ACTUALIZACION_KEY, contenido);
    guardado = true;
  } catch (error) {
    // Se intenta tambiÃ©n con localStorage como respaldo.
  }

  try {
    localStorage.setItem(CONSULTA_ACTUALIZACION_KEY, contenido);
    guardado = true;
  } catch (error) {
    // Si ambos almacenamientos fallan, no se fuerza la recarga.
  }

  return guardado;
}

function hayActividadImportanteParaActualizar() {
  const activo = document.activeElement;
  const estaEscribiendo = activo?.matches?.(
    "input, textarea, select, [contenteditable='true']"
  );
  const interfazActivaQueCancelaRecarga = document.querySelector(
    ".header nav.abierto, form:focus-within"
  );

  return Boolean(estaEscribiendo) ||
    Boolean(interfazActivaQueCancelaRecarga);
}

function mostrarActualizacionPwa() {
  if (!pwaActualizacionAviso || !estaEnModoStandalone() || esRutaRevision) return;
  pwaActualizacionAviso.hidden = false;
}

function recargarConActualizacion() {
  if (recargaActualizacionEnCurso || !guardarConsultaParaActualizacion()) {
    mostrarActualizacionPwa();
    return;
  }

  recargaActualizacionEnCurso = true;
  try {
    sessionStorage.setItem(PWA_UPDATE_RELOAD_KEY, String(Date.now()));
  } catch (error) {
    // La bandera en memoria tambiÃ©n evita una segunda recarga en esta carga.
  }
  if (workerActualizacionPendiente) {
    pwaActualizarAhora?.setAttribute("disabled", "");
    workerActualizacionPendiente.postMessage({ type: "SKIP_WAITING" });
    return;
  }

  window.location.reload();
}

pwaActualizarAhora?.addEventListener("click", recargarConActualizacion);

if ("serviceWorker" in navigator && ["http:", "https:"].includes(window.location.protocol)) {
  window.addEventListener("load", async () => {
    const controladorInicial = navigator.serviceWorker.controller;

    try {
      const registro = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
        updateViaCache: "none"
      });

      if (!esRutaRevision && estaEnModoStandalone()) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!controladorInicial) return;
          if (recargaActualizacionEnCurso) window.location.reload();
        });

        const anunciarWorkerNuevo = worker => {
          if (worker?.state === "installed" && navigator.serviceWorker.controller) {
            workerActualizacionPendiente = worker;
            mostrarActualizacionPwa();
          }
        };

        registro.addEventListener("updatefound", () => {
          const workerNuevo = registro.installing;
          workerNuevo?.addEventListener("statechange", () => anunciarWorkerNuevo(workerNuevo));
        });

        if (registro.waiting && navigator.serviceWorker.controller) {
          workerActualizacionPendiente = registro.waiting;
          mostrarActualizacionPwa();
        }

        const comprobarActualizacion = async ({ forzar = false } = {}) => {
          if (document.visibilityState !== "visible") return;
          const ahora = Date.now();
          if (!forzar && ahora - ultimaComprobacionPwa < PWA_UPDATE_MINIMO) return;
          ultimaComprobacionPwa = ahora;
          try {
            await registro.update();
          } catch (error) {
            // La aplicación continúa con normalidad si no hay conexión.
          }
        };

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") comprobarActualizacion();
        });

        window.addEventListener("focus", () => {
          comprobarActualizacion();
        });

        window.setInterval(comprobarActualizacion, PWA_UPDATE_INTERVALO);
        comprobarActualizacion({ forzar: true });
      }
    } catch (error) {
      // La web sigue funcionando normalmente si el navegador no permite el registro.
    }
  });
}

cargarCatalogoSupabase();
