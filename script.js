const numeroWhatsapp = "51914745871";


const productos = [

  // ==========================
  // TINTAS LABIALES
  // ==========================

  {
    nombre: "Tinta Samantha",
    categoria: "Tintas labiales",
    imagen: "Tinta Samantha",
    detalles: [
      "Codigo 4"
    ]
  },

  {
    nombre: "Tinta Jarusa",
    categoria: "Tintas labiales",
    imagen: "Tinta jarusa",
    detalles: [
      "Codigo 6"
    ]
  },


  // ==========================
  // LIP GLOSSES
  // ==========================

  {
    nombre: "Gloss Dup Dior",
    categoria: "Lip Gloss",
    imagen: "Gloss dup dior"
  },

  {
    nombre: "Gloss Mirror",
    categoria: "Lip Gloss",
    imagen: "Gloss mirror"
  },

  {
    nombre: "Gloss Conejo",
    categoria: "Lip Gloss",
    imagen: "Gloss conejo"
  },

  {
    nombre: "Gloss Terciopelo Revel",
    categoria: "Lip Gloss",
    imagen: "Gloss terciopelo revel"
  },


  // ==========================
  // LABIALES
  // ==========================

  {
    nombre: "Labial Líquido Matte",
    categoria: "Labiales",
    imagen: "Labial liquido matte",
    detalles: [
      "5 codigos"
    ]
  },

  {
    nombre: "Labial Corazón Matte",
    categoria: "Labiales",
    imagen: "Labial corazon matte",
    detalles: [
      "5 codigos labial corazon"
    ]
  },

  {
    nombre: "Labial Osito",
    categoria: "Labiales",
    imagen: "Labial osito",
    detalles: [
      "10 tonos",
      "10 tonos-2"
    ]
  },


  // ==========================
  // DELINEADORES
  // ==========================

  {
    nombre: "Delineadores",
    categoria: "Ojos y labios",
    imagen: "delineadores"
  },


  // ==========================
  // RUBORES E ILUMINADORES
  // ==========================

  {
    nombre: "Rubor Líquido",
    categoria: "Rostro",
    imagen: "rubor liquido"
  },

  {
    nombre: "Iluminador",
    categoria: "Rostro",
    imagen: "iluminador"
  },

  {
    nombre: "Iluminador y Rubor 2 en 1",
    categoria: "Rostro",
    imagen: "iluminador y rubor 2 en 1"
  },


  // ==========================
  // CORRECTORES
  // ==========================

  {
    nombre: "Corrector Líquido Samantha",
    categoria: "Correctores",
    imagen: "corrector liquido samantha"
  },

  {
    nombre: "Corrector Líquido Bellespa",
    categoria: "Correctores",
    imagen: "corrector liquido bellespa"
  },


  // ==========================
  // BÁLSAMOS
  // ==========================

  {
    nombre: "Bálsamo Dup Nivea",
    categoria: "Bálsamos",
    imagen: "belsamo dup  nivea"
  },

  {
    nombre: "Bálsamo con Color",
    categoria: "Bálsamos",
    imagen: "belsamo con color"
  },

  {
    nombre: "Bálsamo Fresita",
    categoria: "Bálsamos",
    imagen: "belsamo fresita",
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
    imagen: "polvo translucido banana jarusa"
  },

  {
    nombre: "Polvo Compacto Flower Secret",
    categoria: "Rostro",
    imagen: "polvo compacto flower secret"
  },

  {
    nombre: "Concealer Revel",
    categoria: "Rostro",
    imagen: "conncealer revel"
  },


  // ==========================
  // BEAUTY BLENDER
  // ==========================

  {
    nombre: "Beauty Blender",
    categoria: "Accesorios",
    imagen: "beauty blender"
  },

  {
    nombre: "Magic Box 7 en 1",
    categoria: "Accesorios",
    imagen: "magic box 7 en 1"
  },


  // ==========================
  // BROCHAS
  // ==========================

  {
    nombre: "Brocha para Cejas",
    categoria: "Brochas",
    imagen: "brocha para cejas"
  },

  {
    nombre: "Juego de 6 Brochas para Ojos",
    categoria: "Brochas",
    imagen: "juego de 6 brochas para ojos"
  },


  // ==========================
  // PALETAS
  // ==========================

  {
    nombre: "Disco Revel",
    categoria: "Paletas",
    imagen: "disco revel"
  },

  {
    nombre: "Paleta Gliter",
    categoria: "Paletas",
    imagen: "paleta gliter"
  },


  // ==========================
  // CUIDADO FACIAL
  // ==========================

  {
    nombre: "Mascarillas Faciales Bioaqua",
    categoria: "Cuidado facial",
    imagen: "mascarillas faciales bioaqua"
  },


  // ==========================
  // ACCESORIOS
  // ==========================

  {
    nombre: "Perfiladores",
    categoria: "Accesorios",
    imagen: "perfiladores"
  },

  {
    nombre: "Rizadores",
    categoria: "Accesorios",
    imagen: "rizadores"
  },

  {
    nombre: "Toallitas Desmaquillantes",
    categoria: "Cuidado facial",
    imagen: "toallitas desmaquillantes"
  },

  {
    nombre: "Ganchos Hawaianos",
    categoria: "Accesorios",
    imagen: "ganchos hawaianos"
  }

];


// ======================================
// BUSCA JPG O PNG AUTOMÁTICAMENTE
// ======================================

function imagenHTML(nombre, alt, clase = "") {

  return `
    <img
      src="img/${nombre}.jpg"
      alt="${alt}"
      class="${clase}"
      onerror="
        if(!this.dataset.intento){
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


productos.forEach((producto, index) => {

  const tieneDetalles =
    producto.detalles &&
    producto.detalles.length > 0;


  const mensajeWhatsapp =
    encodeURIComponent(
      `Hola Aitana Make Up, quiero consultar por ${producto.nombre}`
    );


  const tarjeta = document.createElement("article");

  tarjeta.classList.add("producto");


  tarjeta.innerHTML = `

    <div class="producto-imagen">

      ${imagenHTML(
        producto.imagen,
        producto.nombre
      )}

    </div>


    <div class="producto-info">

      <span class="categoria">
        ${producto.categoria}
      </span>

      <h3>
        ${producto.nombre}
      </h3>

      <p>
        Consulta disponibilidad, tonos y precio.
      </p>


      <div class="acciones-producto">

        ${
          tieneDetalles
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


        <a
          href="https://wa.me/${numeroWhatsapp}?text=${mensajeWhatsapp}"
          target="_blank"
          class="whatsapp"
        >
          Consultar
        </a>

      </div>

    </div>

  `;


  contenedor.appendChild(tarjeta);

});



// ======================================
// MODAL
// ======================================

const modal =
  document.getElementById("modalProducto");

const modalTitulo =
  document.getElementById("modalTitulo");

const modalImagenes =
  document.getElementById("modalImagenes");

const cerrarModal =
  document.getElementById("cerrarModal");



function abrirModal(index) {

  const producto = productos[index];

  modalTitulo.textContent =
    producto.nombre;


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


  modal.classList.add("activo");

  document.body.style.overflow = "hidden";

}



cerrarModal.addEventListener("click", () => {

  cerrarVentana();

});



modal.addEventListener("click", (e) => {

  if(e.target === modal){

    cerrarVentana();

  }

});



function cerrarVentana(){

  modal.classList.remove("activo");

  document.body.style.overflow = "auto";

}



// ESC CIERRA MODAL

document.addEventListener("keydown", (e) => {

  if(e.key === "Escape"){

    cerrarVentana();

  }

});


// ======================================
// BUSCADOR Y FILTROS
// ======================================

const buscador = document.getElementById("buscador");

const botonesFiltro = document.querySelectorAll(".filtro");

let categoriaActual = "Todos";


function filtrarProductos() {

  const texto =
    buscador.value.toLowerCase();


  const tarjetas =
    document.querySelectorAll(".producto");


  tarjetas.forEach((tarjeta, index) => {

    const producto =
      productos[index];


    const coincideTexto =
      producto.nombre
        .toLowerCase()
        .includes(texto);


    const coincideCategoria =
      categoriaActual === "Todos" ||
      producto.categoria === categoriaActual;


    if(coincideTexto && coincideCategoria){

      tarjeta.style.display = "block";

    } else {

      tarjeta.style.display = "none";

    }

  });

}


buscador.addEventListener(
  "input",
  filtrarProductos
);


botonesFiltro.forEach(boton => {

  boton.addEventListener("click", () => {

    botonesFiltro.forEach(b => {
      b.classList.remove("activo");
    });


    boton.classList.add("activo");


    categoriaActual =
      boton.dataset.categoria;


    filtrarProductos();

  });

});


// ======================================
// MENÚ MÓVIL
// ======================================

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("abierto");
});

document.querySelectorAll("#menu a").forEach(enlace => {

  enlace.addEventListener("click", () => {
    menu.classList.remove("abierto");
  });

});
