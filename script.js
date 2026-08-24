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


if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}


// ======================================
// PRODUCTOS
// ======================================

const productos = [

  // ==========================
  // TINTAS LABIALES
  // ==========================

  {
    nombre: "Tinta para Labios Samantha",
    categoria: "Tintas labiales",
    imagen: "Tinta Samantha",
    precio: "5.00",
    detalles: [
      "Codigo 4"
    ]
  },

  {
    nombre: "Tinta para Labios The Game Jarusa",
    categoria: "Tintas labiales",
    imagen: "Tinta jarusa",
    precio: "4.00",
    agotado: false,
    detalles: [
      "Codigo 6"
    ]
  },


  // ==========================
  // LIP GLOSSES
  // ==========================

  {
    nombre: "Lip Gloss Dup Dior",
    categoria: "Lip Gloss",
    imagen: "Gloss dup dior",
    precio: "8.00",
    agotado: true
  },

  {
    nombre: "Lip Gloss Mirror Girl",
    categoria: "Lip Gloss",
    imagen: "Gloss mirror",
    precio: "4.00"
  },

  {
    nombre: "Lip Gloss Conejo",
    categoria: "Lip Gloss",
    imagen: "Gloss conejo",
    precio: "6.00",
    agotado: true
  },

  {
    nombre: "Lip Gloss Terciopelo Revel",
    categoria: "Lip Gloss",
    imagen: "Gloss terciopelo revel",
    precio: "8.00",
    detalles: [
      "tonos-gloss-revel"
    ]
  },

  {
    nombre: "Lip Gloss AOZY",
    categoria: "Lip Gloss",
    imagen: "lip-gloss-aozy",
    precio: "8.00",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Lip Gloss 3D Karité Plump Lips Super Volumen con Espejo",
    categoria: "Lip Gloss",
    imagen: "lip-gloss-3d-plump-lips",
    precio: "8.50",
    agotado: false,
    nuevo: true,
    detalles: [
      "tonos-gloss-3d"
    ]
  },


  // ==========================
  // LABIALES
  // ==========================

  {
    nombre: "Labial Líquido Matte AOZY",
    categoria: "Labiales",
    imagen: "aozy-1",
    precio: "8.00",
    agotado: false,
    nuevo: true,
    detalles: [
      "tonos-aozy-matte"
    ]
  },

  {
    nombre: "Labial Líquido Matte Lofshe",
    categoria: "Labiales",
    imagen: "Labial liquido matte",
    precio: "8.00",
    agotado: true,
    detalles: [
      "5 codigos"
    ]
  },

  {
    nombre: "Labial Corazón Mate Crazy Girl",
    categoria: "Labiales",
    imagen: "Labial corazon matte",
    precio: "8.00",
    agotado: true,
    detalles: [
      "5 codigos labial corazon"
    ]
  },

  {
    nombre: "Labial Osito Revel",
    categoria: "Labiales",
    imagen: "Labial osito",
    precio: "6.50",
    detalles: [
      "10 tonos",
      "10 tonos-2"
    ]
  },

  {
    nombre: "Labial Líquido Waterproof Super Stay",
    categoria: "Labiales",
    imagen: "labial-waterproof-super-stay",
    precio: "7.00",
    agotado: false,
    nuevo: true,
    detalles: [
      "tonos-labial-waterproof"
    ]
  },

  {
    nombre: "Lápiz Delineador de Labios USHAS",
    categoria: "Labiales",
    imagen: "lapiz-labios-ushas",
    precio: "3.50",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Labial Líquido Matte Ever Beauty",
    categoria: "Labiales",
    imagen: "labial-matte-ever-beauty",
    precio: "7.00",
    agotado: false,
    nuevo: true,
    detalles: [
      "tonos-ever-beauty"
    ]
  },


  // ==========================
  // DELINEADORES
  // ==========================

  {
    nombre: "Lápiz Delineador para Ojos, Labios y Cejas Magic Shop",
    categoria: "Ojos y labios",
    imagen: "delineadores",
    precio: "3.00"
  },


  // ==========================
  // RUBORES E ILUMINADORES
  // ==========================

  {
    nombre: "Rubor Líquido AOZY",
    categoria: "Rostro",
    imagen: "rubor liquido",
    precio: "8.00"
  },

  {
    nombre: "Iluminador Compacto Revel",
    categoria: "Rostro",
    imagen: "iluminador",
    precio: "9.00"
  },

  {
    nombre: "Rubor + Iluminador Compacto Revel",
    categoria: "Rostro",
    imagen: "iluminador y rubor 2 en 1",
    precio: "10.00"
  },


  // ==========================
  // CORRECTORES
  // ==========================

  {
    nombre: "Corrector Líquido Matte Waterproof Samantha",
    categoria: "Correctores",
    imagen: "corrector liquido samantha",
    precio: "8.00",
    detalles: [
      "tonos-corrector-samantha"
    ]
  },

  {
    nombre: "Corrector Matte Bellespa",
    categoria: "Correctores",
    imagen: "corrector liquido bellespa",
    precio: "8.50",
    detalles: [
      "tonos-corrector-bellespa"
    ]
  },


  // ==========================
  // BÁLSAMOS
  // ==========================

  {
    nombre: "Bálsamo Dup de Nivea",
    categoria: "Bálsamos",
    imagen: "belsamo dup  nivea",
    precio: "6.00"
  },

  {
    nombre: "Bálsamo con Color",
    categoria: "Bálsamos",
    imagen: "belsamo con color",
    precio: "3.00"
  },

  {
    nombre: "Bálsamo Fresita",
    categoria: "Bálsamos",
    imagen: "belsamo fresita",
    precio: "3.00",
    detalles: [
      "belsamo fresita-2"
    ]
  },


  // ==========================
  // POLVOS Y CONTORNOS
  // ==========================

  {
    nombre: "Polvo Translúcido Banana Jarusa",
    categoria: "Rostro",
    imagen: "polvo translucido banana jarusa",
    precio: "10.00"
  },

  {
    nombre: "Polvo Compacto Flower Secret",
    categoria: "Rostro",
    imagen: "polvo compacto flower secret",
    precio: "8.00"
  },

  {
    nombre: "Contorno en Crema Revel",
    categoria: "Rostro",
    imagen: "conncealer revel",
    precio: "8.00"
  },


  // ==========================
  // BEAUTY BLENDER
  // ==========================

  {
    nombre: "Beauty Blenders",
    categoria: "Accesorios",
    imagen: "beauty blender",
    precio: "3.50"
  },

  {
    nombre: "Magic Box 7 en 1 (Blenders)",
    categoria: "Accesorios",
    imagen: "magic box 7 en 1",
    precio: "9.00"
  },


  // ==========================
  // BROCHAS
  // ==========================

  {
    nombre: "Brocha para Ceja 2 en 1",
    categoria: "Brochas",
    imagen: "brocha para cejas",
    precio: "3.00",
    agotado: false
  },

  {
    nombre: "Set de 6 Brochas para Ojos",
    categoria: "Brochas",
    imagen: "juego de 6 brochas para ojos",
    precio: "10.00",
    agotado: true
  },


  // ==========================
  // OJOS y labios
  // ==========================

  {
    nombre: "Paletas de Sombras Revel",
    categoria: "Ojos y labios",
    imagen: "disco revel",
    precio: "10.00"
  },

  {
    nombre: "Paleta Gliter Flower",
    categoria: "Ojos y labios",
    imagen: "paleta gliter",
    precio: "5.00"
  },


  // ==========================
  // CUIDADO FACIAL
  // ==========================

  {
    nombre: "Mascarilla Bioaqua",
    categoria: "Cuidado facial",
    imagen: "mascarillas faciales bioaqua",
    precio: "3.50"
  },

  {
    nombre: "Mascarillas Hidratantes Faciales",
    categoria: "Cuidado facial",
    imagen: "mascarillas-hidratantes-faciales",
    precio: "3.50",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Mascarilla Hidratante de Limpieza Profunda Flower Secret",
    categoria: "Cuidado facial",
    imagen: "mascarilla-limpieza-flower-secret",
    precio: "3.00",
    agotado: true,
    nuevo: true
  },

  {
    nombre: "Tratamiento Reparador de Puntas",
    categoria: "Cuidado facial",
    imagen: "tratamiento-reparador-puntas",
    precio: "2.00",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Crema de Arroz para Manos Bioaqua",
    categoria: "Cuidado facial",
    imagen: "crema-manos-arroz-bioaqua",
    precio: "3.50",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Agua de Rosas Revel",
    categoria: "Cuidado facial",
    imagen: "agua-rosas-revel",
    precio: "6.00",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Mascarilla de Colágeno para Ojeras con Ácido Hialurónico y Baba de Caracol",
    categoria: "Cuidado facial",
    imagen: "mascarilla-colageno-ojeras",
    precio: "3.00",
    agotado: true,
    nuevo: true
  },


  // ==========================
  // ACCESORIOS
  // ==========================

  {
    nombre: "Set de 3 Perfiladores",
    categoria: "Accesorios",
    imagen: "perfiladores",
    precio: "3.50"
  },

  {
    nombre: "Rizadores de Pestañas",
    categoria: "Accesorios",
    imagen: "rizadores",
    precio: "6.00"
  },

  {
    nombre: "Vinchas para Skincare",
    categoria: "Accesorios",
    imagen: "vinchas-skincare",
    precio: "5.50",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Doble Espejo de Cartera",
    categoria: "Accesorios",
    imagen: "doble-espejo-cartera",
    precio: "5.50",
    agotado: false,
    nuevo: true
  },

  {
     nombre: "Toallitas Desmaquillantes Madison",
     categoria: "Cuidado facial",
     imagen: "toallitas desmaquillantes",
     precio: "3.50",
     agotado: true
  },

  {
    nombre: "Gancho Hawaiano",
    categoria: "Accesorios",
    imagen: "ganchos hawaianos",
    precio: "3.00"
  },

  {
    nombre: "Ligas para el Cabello Set de 6",
    categoria: "Accesorios",
    imagen: "ligas-cabello-set-6",
    precio: "2.00",
    agotado: false,
    nuevo: true
  },

  {
    nombre: "Peine para el Cabello",
    categoria: "Accesorios",
    imagen: "peine-cabello",
    precio: "8.50",
    agotado: true,
    nuevo: true
  },

  {
    nombre: "Cepillo Desenredante",
    categoria: "Accesorios",
    imagen: "peine-desenredante",
    precio: "7.00",
    agotado: false,
    nuevo: true
  }

];


const productosConsulta = new Set();
const FAVORITOS_STORAGE_KEY = "aitana-favoritos";
const productosFavoritos = new Set();

try {
  const favoritosGuardados = JSON.parse(localStorage.getItem(FAVORITOS_STORAGE_KEY) || "[]");
  if (Array.isArray(favoritosGuardados)) {
    favoritosGuardados.forEach(nombre => productosFavoritos.add(nombre));
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
  "Tinta jarusa": [480, 640],
  "Tinta Samantha": [480, 640],
  "toallitas desmaquillantes": [720, 960],
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

function imagenHTML(nombre, alt, clase = "") {

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



// ======================================
// CREAR PRODUCTOS
// ======================================

const contenedor = document.getElementById("lista-productos");
const contenedorRecienLlegados =
  document.getElementById("lista-recien-llegados");


function productoTieneTonos(producto) {
  return Boolean(
    producto.detalles &&
    producto.detalles.length > 0
  );
}


function crearMensajeProducto(producto) {
  const pregunta = productoTieneTonos(producto)
    ? "¿Podrían confirmarme su disponibilidad y qué tonos tienen disponibles?"
    : "¿Podrían confirmarme si está disponible?";

  return `Hola, Aitana Make Up 💕 Me interesa *${producto.nombre}* (S/ ${producto.precio}). ${pregunta} Gracias 😊`;
}


function crearTarjetaProducto(producto, index, claseAdicional = "") {

    const tieneDetalles =
      productoTieneTonos(producto);


    const mensajeWhatsapp =
      encodeURIComponent(
        crearMensajeProducto(producto)
      );


    const tarjeta =
      document.createElement("article");

    tarjeta.classList.add("producto");

    if (claseAdicional) {
      tarjeta.classList.add(claseAdicional);
    }

    tarjeta.dataset.index = index;


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
          producto.nuevo === true
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
            producto.nombre
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
            Disponible
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


        <h3>
          ${producto.nombre}
        </h3>


        <div class="precio">
          S/${producto.precio}
        </div>


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
              href="https://wa.me/${numeroWhatsapp}?text=${mensajeWhatsapp}"
              target="_blank"
              rel="noopener noreferrer"
              class="whatsapp"
            >
              <i class="fa-brands fa-whatsapp"></i>
              Consultar
            </a>
            <button
              type="button"
              class="agregar-consulta"
              data-consulta-index="${index}"
              aria-label="Agregar ${producto.nombre} a la consulta"
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

  contenedor.innerHTML = "";

  productos.forEach((producto, index) => {
    contenedor.appendChild(
      crearTarjetaProducto(producto, index)
    );
  });

  if (contenedorRecienLlegados) {
    contenedorRecienLlegados.innerHTML = "";

    productos.forEach((producto, index) => {
      if (producto.nuevo === true) {
        contenedorRecienLlegados.appendChild(
          crearTarjetaProducto(producto, index, "producto-reciente")
        );
      }
    });
  }

}


crearProductos();

const favoritosSheet = document.getElementById("favoritosSheet");
const favoritosLista = document.getElementById("favoritosLista");
const consultaSheet = document.getElementById("consultaSheet");
const consultaSheetLista = document.getElementById("consultaSheetLista");
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
    const favorito = productosFavoritos.has(producto.nombre);
    boton.classList.toggle("activo", favorito);
    boton.setAttribute("aria-pressed", String(favorito));
    boton.setAttribute("aria-label", `${favorito ? "Quitar" : "Agregar"} ${producto.nombre} ${favorito ? "de" : "a"} favoritos`);
    boton.innerHTML = `<i class="${favorito ? "fa-solid" : "fa-regular"} fa-heart" aria-hidden="true"></i>`;
  });
}

function plantillaEstadoVacio(icono, titulo, texto) {
  return `<div class="mobile-sheet-vacio"><span aria-hidden="true">${icono}</span><h3>${titulo}</h3><p>${texto}</p></div>`;
}

function renderizarFavoritos() {
  if (!favoritosLista) return;
  const favoritos = productos
    .map((producto, index) => ({ producto, index }))
    .filter(({ producto }) => productosFavoritos.has(producto.nombre));

  favoritosLista.innerHTML = favoritos.length
    ? favoritos.map(({ producto, index }) => `
      <article class="mobile-sheet-producto">
        <div class="mobile-sheet-miniatura">${imagenHTML(producto.imagen, producto.nombre)}</div>
        <div class="mobile-sheet-producto-info">
          <h3>${producto.nombre}</h3>
          <strong>S/${producto.precio}</strong>
        </div>
        <button type="button" class="mobile-sheet-quitar" data-favorito-index="${index}" aria-label="Quitar ${producto.nombre} de favoritos">Quitar</button>
      </article>`).join("")
    : plantillaEstadoVacio("♡", "Aún no tienes favoritos", "Toca el corazón de un producto para guardarlo aquí.");
}

function alternarFavorito(index, boton) {
  const producto = productos[index];
  if (!producto) return;
  if (productosFavoritos.has(producto.nombre)) productosFavoritos.delete(producto.nombre);
  else productosFavoritos.add(producto.nombre);
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
  elementoAntesSheet = document.activeElement;
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

function renderizarConsultaSheet() {
  if (!consultaSheetLista) return;
  const seleccionados = [...productosConsulta]
    .map(index => ({ producto: productos[index], index }))
    .filter(({ producto }) => producto);

  consultaSheetLista.innerHTML = seleccionados.length
    ? seleccionados.map(({ producto, index }) => `
      <article class="mobile-sheet-producto">
        <div class="mobile-sheet-miniatura">${imagenHTML(producto.imagen, producto.nombre)}</div>
        <div class="mobile-sheet-producto-info">
          <h3>${producto.nombre}</h3>
          <strong>S/${producto.precio}</strong>
        </div>
        <button type="button" class="mobile-sheet-quitar" data-consulta-quitar-index="${index}" aria-label="Quitar ${producto.nombre} de mi consulta">Quitar</button>
      </article>`).join("")
    : plantillaEstadoVacio("🛍️", "Tu consulta está vacía", "Agrega productos y aparecerán aquí para consultarlos juntos.");

  if (consultaSheetWhatsapp) consultaSheetWhatsapp.hidden = seleccionados.length === 0;
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
          ? `Quitar ${producto.nombre} de la consulta`
          : `Agregar ${producto.nombre} a la consulta`
      );
      boton.textContent = seleccionado
        ? "✓ Agregado"
        : "+ Agregar a consulta";
    });

  renderizarConsultaSheet();

}


function alternarProductoConsulta(index) {

  const producto = productos[index];

  if (!producto || producto.agotado) return;

  if (productosConsulta.has(index)) {
    productosConsulta.delete(index);
  }
  else {
    productosConsulta.add(index);
  }

  actualizarConsultaMultiple();

}


function crearMensajeConsulta() {

  const productosSeleccionados = [...productosConsulta]
    .map(index => productos[index])
    .filter(producto => producto && !producto.agotado);

  const lineasProductos = productosSeleccionados
    .map(producto => `• *${producto.nombre}* — S/ ${producto.precio}`)
    .join("\n");

  const preguntaTonos = productosSeleccionados.some(productoTieneTonos)
    ? "¿Podrían confirmarme su disponibilidad? En los productos que tienen tonos, quisiera saber cuáles están disponibles."
    : "¿Podrían confirmarme si están disponibles?";

  return `Hola, Aitana Make Up 💕 Quisiera consultar por:\n\n${lineasProductos}\n\n${preguntaTonos} Gracias 😊`;

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
    actualizarConsultaMultiple();
  });
}


if (enviarConsultaWhatsapp) {
  enviarConsultaWhatsapp.addEventListener("click", () => {
    if (productosConsulta.size === 0) return;

    const url =
      `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(crearMensajeConsulta())}`;

    window.open(url, "_blank", "noopener,noreferrer");
  });
}

function abrirConsultaSheet() {
  renderizarConsultaSheet();
  abrirMobileSheet(consultaSheet);
}

verConsultaMobile?.addEventListener("click", abrirConsultaSheet);
abrirMiConsulta?.addEventListener("click", abrirConsultaSheet);
abrirFavoritos?.addEventListener("click", () => {
  renderizarFavoritos();
  abrirMobileSheet(favoritosSheet);
});

consultaSheetWhatsapp?.addEventListener("click", () => {
  if (!productosConsulta.size) return;
  const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(crearMensajeConsulta())}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.addEventListener("click", (evento) => {
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
    if (panel.scrollTop > 0) return;
    inicioY = evento.touches[0].clientY;
    desplazamiento = 0;
  }, { passive: true });

  panel.addEventListener("touchmove", evento => {
    if (!inicioY || panel.scrollTop > 0) return;
    desplazamiento = Math.max(0, evento.touches[0].clientY - inicioY);
    if (desplazamiento) panel.style.transform = `translateY(${Math.min(desplazamiento, 150)}px)`;
  }, { passive: true });

  panel.addEventListener("touchend", () => {
    panel.style.transform = "";
    if (desplazamiento > 90) cerrar();
    inicioY = 0;
    desplazamiento = 0;
  });
}

habilitarCierrePorGesto(favoritosSheet?.querySelector(".mobile-sheet-panel"), () => cerrarMobileSheet(favoritosSheet));
habilitarCierrePorGesto(consultaSheet?.querySelector(".mobile-sheet-panel"), () => cerrarMobileSheet(consultaSheet));


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


function cerrarVistaRapida() {
  if (!vistaRapidaModal.classList.contains("activo")) return;

  vistaRapidaModal.classList.remove("activo");
  vistaRapidaModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (elementoAntesVistaRapida) {
    elementoAntesVistaRapida.focus();
  }
}


function abrirVistaRapida(index) {
  const producto = productos[index];
  if (!producto) return;

  const mensajeWhatsapp = encodeURIComponent(
    crearMensajeProducto(producto)
  );

  vistaRapidaCuerpo.innerHTML = `
    <div class="vista-rapida-imagen-contenedor">
      ${imagenHTML(producto.imagen, producto.nombre, "vista-rapida-imagen")}
      ${producto.nuevo === true ? '<span class="vista-rapida-nuevo">✨ NUEVO</span>' : ""}
    </div>

    <div class="vista-rapida-info">
      <div class="vista-rapida-stock ${producto.agotado ? "agotado" : "disponible"}">
        <i class="fa-solid ${producto.agotado ? "fa-circle-xmark" : "fa-circle-check"}" aria-hidden="true"></i>
        ${producto.agotado ? "Agotado" : "Disponible"}
      </div>
      <span class="vista-rapida-categoria">${producto.categoria}</span>
      <h2 id="vistaRapidaTitulo">${producto.nombre}</h2>
      <div class="vista-rapida-precio">S/${producto.precio}</div>

      <div class="vista-rapida-acciones">
        ${producto.agotado ? `
          <button type="button" class="vista-rapida-sin-stock" disabled>Producto agotado</button>
        ` : `
          <a
            class="vista-rapida-whatsapp"
            href="https://wa.me/${numeroWhatsapp}?text=${mensajeWhatsapp}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            Consultar por WhatsApp
          </a>
          <button
            type="button"
            class="agregar-consulta vista-rapida-agregar"
            data-consulta-index="${index}"
            aria-pressed="false"
          >
            + Agregar a consulta
          </button>
        `}
        ${producto.detalles && producto.detalles.length ? `
          <button type="button" class="vista-rapida-tonos" data-vista-tonos-index="${index}">
            Ver tonos disponibles
          </button>
        ` : ""}
      </div>
    </div>
  `;

  elementoAntesVistaRapida = document.activeElement;
  vistaRapidaModal.classList.add("activo");
  vistaRapidaModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  actualizarConsultaMultiple();
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


document
  .querySelectorAll(".producto, .catalogo-panel, .hero-texto")
  .forEach(elemento => {

    observadorAnimaciones.observe(elemento);

  });



// ======================================
// BOTÓN VOLVER ARRIBA
// ======================================

const volverArriba =
  document.getElementById("volverArriba");


if (volverArriba) {

  window.addEventListener("scroll", () => {

    if(window.scrollY > 400){

      volverArriba.classList.add("mostrar");

    }
    else {

      volverArriba.classList.remove("mostrar");

    }

  });


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



function abrirModal(index) {

  const producto = productos[index];


  modalTitulo.textContent =
    `${producto.nombre} - S/${producto.precio}`;


  modalImagenes.innerHTML = "";


  producto.detalles.forEach(detalle => {

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

  document.body.style.overflow = "hidden";

  cerrarModal.focus();

}



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

const botonesCategoria =
  document.querySelectorAll(".filtro");

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

const PRODUCTOS_POR_CARGA = 8;


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
      `${producto.nombre} ${producto.categoria} ${textoDisponibilidad} ${producto.nuevo === true ? "nuevo nuevos" : ""}`
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

botonesCategoria.forEach(boton => {

  boton.addEventListener("click", () => {

    botonesCategoria.forEach(b => {

      b.classList.remove("activo");

    });


    boton.classList.add("activo");


    categoriaSeleccionada =
      boton.dataset.categoria;


    reiniciarCargaYActualizar();

    if (window.matchMedia("(max-width: 700px)").matches) {
      boton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }

  });

});


botonLimpiarFiltros.addEventListener("click", () => {
  buscadorCatalogo.value = "";
  categoriaSeleccionada = "Todos";
  stockSeleccionado = "todos";

  botonesCategoria.forEach(boton => {
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

    botonesCategoria.forEach(boton => {
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
  contenedor.innerHTML = "";

  const mapa = {};
  productos.forEach((producto, index) => {
    mapa[producto.nombre] = { producto, index };
  });

  productosDestacadosMobile.forEach(nombre => {
    const destacado = mapa[nombre];
    if (!destacado || destacado.producto.agotado) return;

    const { producto, index } = destacado;

    const tarjeta = document.createElement("div");
    tarjeta.className = "aitana-mobile-product";

    const hrefWA =
      "https://wa.me/" + numeroWhatsapp +
      "?text=" + encodeURIComponent(
        crearMensajeProducto(producto)
      );

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
      <a href="${hrefWA}" target="_blank" rel="noopener noreferrer" aria-label="Consultar ${producto.nombre} por WhatsApp">
        ${imagenHTML(producto.imagen, producto.nombre)}
      </a>
      <h3>${producto.nombre}</h3>
      <div class="aitana-mobile-precio">S/${producto.precio}</div>
      <a href="${hrefWA}" target="_blank" rel="noopener noreferrer" class="aitana-mobile-whatsapp" aria-label="Consultar por WhatsApp">
        <i class="fa-brands fa-whatsapp"></i> WhatsApp
      </a>
      <button
        type="button"
        class="agregar-consulta agregar-consulta-mobile"
        data-consulta-index="${index}"
        aria-label="Agregar ${producto.nombre} a la consulta"
        aria-pressed="false"
      >
        + Agregar a consulta
      </button>
    `;

    contenedor.appendChild(tarjeta);
  });

  actualizarConsultaMultiple();
  actualizarBotonesFavoritos();
}

function sincronizarBottomNav() {
  const linksNav = document.querySelectorAll(".aitana-mobile-bottom-link");
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
      const productosSec = document.getElementById("productos");
      if (productosSec) {
        productosSec.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
}

// Categorías móviles → activan el filtro real del catálogo
document.querySelectorAll(".aitana-mobile-cat").forEach(boton => {
  boton.addEventListener("click", () => {
    const categoria = boton.dataset.categoria;

    const filtroReal = document.querySelector(
      '.filtro[data-categoria="' + categoria + '"]'
    );
    if (filtroReal) {
      filtroReal.click();
    }

    const stockTodos = document.querySelector(
      '.stock-filtro[data-stock="todos"]'
    );
    if (stockTodos) {
      stockTodos.click();
    }

    const productosSec = document.getElementById("productos");
    if (productosSec) {
      productosSec.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Indicador visual discreto mientras quedan categorías fuera de pantalla.
const categoriasMobile = document.getElementById("aitanaMobileCategories");

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
document
  .querySelectorAll("[data-descubrimiento-categoria]")
  .forEach(boton => {
    boton.addEventListener("click", () => {
      const categoria = boton.dataset.descubrimientoCategoria;
      const filtroReal = document.querySelector(
        '.filtro[data-categoria="' + categoria + '"]'
      );
      const stockTodos = document.querySelector(
        '.stock-filtro[data-stock="todos"]'
      );

      if (filtroReal) filtroReal.click();
      if (stockTodos) stockTodos.click();

      document.getElementById("catalogoPrincipal")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
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
const PWA_IOS_AVISO_KEY = "aitana-pwa-ios-aviso-cerrado";
const aitanaSplash = document.getElementById("aitanaSplash");
let eventoInstalacionPwa = null;
let splashAitanaActiva = false;
let splashAitanaOcultaDesde = 0;

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
  }
}

function mostrarSplashPwa({ alRegresar = false } = {}) {
  if (
    !aitanaSplash ||
    splashAitanaActiva ||
    esRutaRevision ||
    MODO_ACTUALIZACION ||
    !estaEnModoStandalone()
  ) {
    return;
  }

  if (!alRegresar && window.AITANA_SPLASH_FALLBACK) return;

  const tipoNavegacion = performance.getEntriesByType?.("navigation")[0]?.type;
  if (!alRegresar && tipoNavegacion === "reload") {
    return;
  }

  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duracion = movimientoReducido ? 300 : 980;

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
    }, movimientoReducido ? 0 : 220);
  }, duracion);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    splashAitanaOcultaDesde = Date.now();
    return;
  }

  if (
    splashAitanaOcultaDesde &&
    Date.now() - splashAitanaOcultaDesde >= 2000
  ) {
    mostrarSplashPwa({ alRegresar: true });
  }

  splashAitanaOcultaDesde = 0;
});

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

if ("serviceWorker" in navigator && ["http:", "https:"].includes(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch(() => {
      // La web sigue funcionando normalmente si el navegador no permite el registro.
    });
  });
}
