const numeroWhatsapp = "51982797861";


// ======================================
// PRODUCTOS
// ======================================

const productos = [

  // ==========================
  // TINTAS LABIALES
  // ==========================

  {
    nombre: "Tinta Samantha",
    categoria: "Tintas labiales",
    imagen: "Tinta Samantha",
    precio: "5.00",
    detalles: [
      "Codigo 4"
    ]
  },

  {
    nombre: "Tinta Jarusa",
    categoria: "Tintas labiales",
    imagen: "Tinta jarusa",
    precio: "4.00",
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
    imagen: "Gloss dup dior",
    precio: "8.00",
    agotado: true
  },

  {
    nombre: "Gloss Mirror",
    categoria: "Lip Gloss",
    imagen: "Gloss mirror",
    precio: "4.00"
  },

  {
    nombre: "Gloss Conejo",
    categoria: "Lip Gloss",
    imagen: "Gloss conejo",
    precio: "6.00",
    agotado: true
  },

  {
    nombre: "Gloss Terciopelo Revel",
    categoria: "Lip Gloss",
    imagen: "Gloss terciopelo revel",
    precio: "8.00",
    detalles: [
      "tonos-gloss-revel"
    ]
  },


  // ==========================
  // LABIALES
  // ==========================

  {
    nombre: "Labial Líquido Matte",
    categoria: "Labiales",
    imagen: "Labial liquido matte",
    precio: "8.00",
    detalles: [
      "5 codigos"
    ]
  },

  {
    nombre: "Labial Corazón Matte",
    categoria: "Labiales",
    imagen: "Labial corazon matte",
    precio: "8.00",
    detalles: [
      "5 codigos labial corazon"
    ]
  },

  {
    nombre: "Labial Osito",
    categoria: "Labiales",
    imagen: "Labial osito",
    precio: "6.50",
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
    imagen: "delineadores",
    precio: "3.00"
  },


  // ==========================
  // RUBORES E ILUMINADORES
  // ==========================

  {
    nombre: "Rubor Líquido",
    categoria: "Rostro",
    imagen: "rubor liquido",
    precio: "8.00"
  },

  {
    nombre: "Iluminador",
    categoria: "Rostro",
    imagen: "iluminador",
    precio: "9.00"
  },

  {
    nombre: "Iluminador y Rubor 2 en 1",
    categoria: "Rostro",
    imagen: "iluminador y rubor 2 en 1",
    precio: "10.00"
  },


  // ==========================
  // CORRECTORES
  // ==========================

  {
    nombre: "Corrector Líquido Samantha",
    categoria: "Correctores",
    imagen: "corrector liquido samantha",
    precio: "8.00"
  },

  {
    nombre: "Corrector Líquido Bellespa",
    categoria: "Correctores",
    imagen: "corrector liquido bellespa",
    precio: "8.50"
  },


  // ==========================
  // BÁLSAMOS
  // ==========================

  {
    nombre: "Bálsamo Dup Nivea",
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
    nombre: "Concealer Revel",
    categoria: "Rostro",
    imagen: "conncealer revel",
    precio: "8.00"
  },


  // ==========================
  // BEAUTY BLENDER
  // ==========================

  {
    nombre: "Beauty Blender",
    categoria: "Accesorios",
    imagen: "beauty blender",
    precio: "3.50"
  },

  {
    nombre: "Magic Box 7 en 1",
    categoria: "Accesorios",
    imagen: "magic box 7 en 1",
    precio: "8.00"
  },


  // ==========================
  // BROCHAS
  // ==========================

  {
    nombre: "Brocha para Cejas",
    categoria: "Brochas",
    imagen: "brocha para cejas",
    precio: "3.00"
  },

  {
    nombre: "Set de 6 Brochas para Ojos",
    categoria: "Brochas",
    imagen: "juego de 6 brochas para ojos",
    precio: "10.00"
  },


  // ==========================
  // PALETAS
  // ==========================

  {
    nombre: "Disco Revel",
    categoria: "Paletas",
    imagen: "disco revel",
    precio: "10.00"
  },

  {
    nombre: "Paleta Glitter",
    categoria: "Paletas",
    imagen: "paleta gliter",
    precio: "5.00"
  },


  // ==========================
  // CUIDADO FACIAL
  // ==========================

  {
    nombre: "Mascarillas Faciales Bioaqua",
    categoria: "Cuidado facial",
    imagen: "mascarillas faciales bioaqua",
    precio: "3.50"
  },


  // ==========================
  // ACCESORIOS
  // ==========================

  {
    nombre: "Perfiladores",
    categoria: "Accesorios",
    imagen: "perfiladores",
    precio: "3.50"
  },

  {
    nombre: "Rizadores",
    categoria: "Accesorios",
    imagen: "rizadores",
    precio: "6.00"
  },

  {
    nombre: "Toallitas Desmaquillantes",
    categoria: "Cuidado facial",
    imagen: "toallitas desmaquillantes",
    precio: "3.50"
  },

  {
    nombre: "Ganchos Hawaianos",
    categoria: "Accesorios",
    imagen: "ganchos hawaianos",
    precio: "3.00"
  }

];



// ======================================
// BUSCAR JPG O PNG AUTOMÁTICAMENTE
// ======================================

function imagenHTML(nombre, alt, clase = "") {

  return `
    <img
      src="img/${nombre}.jpg"
      alt="${alt}"
      class="${clase}"
      loading="lazy"
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


function crearProductos() {

  contenedor.innerHTML = "";

  productos.forEach((producto, index) => {

    const tieneDetalles =
      producto.detalles &&
      producto.detalles.length > 0;


    const mensajeWhatsapp =
      encodeURIComponent(
        `Hola Aitana Make Up, quiero consultar por ${producto.nombre} - S/${producto.precio}`
      );


    const tarjeta =
      document.createElement("article");

    tarjeta.classList.add("producto");


    if(producto.agotado){
      tarjeta.classList.add("producto-agotado");
    }


    tarjeta.innerHTML = `

      <div class="producto-imagen">

        ${imagenHTML(
          producto.imagen,
          producto.nombre
        )}

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
            <span class="boton-agotado">
              Producto agotado
            </span>
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
            `
          }

        </div>

      </div>

    `;


    contenedor.appendChild(tarjeta);

  });

}


crearProductos();



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
  .querySelectorAll(".producto, .titulo-catalogo, .hero-texto")
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


  modal.classList.add("activo");

  document.body.style.overflow = "hidden";

}



function cerrarVentana() {

  modal.classList.remove("activo");

  document.body.style.overflow = "auto";

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



// ======================================
// BUSCADOR
// ======================================

const buscador =
  document.getElementById("buscador");

const botonesFiltro =
  document.querySelectorAll(".filtro");

let categoriaActual =
  "Todos";



function filtrarProductos() {

  const texto =
    buscador
      ? buscador.value.toLowerCase().trim()
      : "";


  const tarjetas =
    document.querySelectorAll(".producto");


  tarjetas.forEach((tarjeta, index) => {

    const producto =
      productos[index];


    const coincideTexto =
      producto.nombre
        .toLowerCase()
        .includes(texto) ||

      producto.categoria
        .toLowerCase()
        .includes(texto);


    const coincideCategoria =
      categoriaActual === "Todos" ||
      producto.categoria === categoriaActual;


    if(
      coincideTexto &&
      coincideCategoria
    ){

      tarjeta.style.display = "flex";

    }
    else {

      tarjeta.style.display = "none";

    }

  });

}



if (buscador) {

  buscador.addEventListener(
    "input",
    filtrarProductos
  );

}



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
// MENÚ CELULAR
// ======================================

const menuToggle =
  document.getElementById("menuToggle");

const menu =
  document.getElementById("menu");


if(menuToggle && menu){

  menuToggle.addEventListener("click", () => {

    menu.classList.toggle("abierto");

  });


  document
    .querySelectorAll("#menu a")
    .forEach(enlace => {

      enlace.addEventListener("click", () => {

        menu.classList.remove("abierto");

      });

    });

}



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

  window.scrollTo(0, 0);

});



// ======================================
// FORMULARIO DE OPINIONES
// ======================================

const estrellas =
  document.querySelectorAll(".estrellas i");

const calificacionInput =
  document.getElementById("calificacion");

const formularioOpinion =
  document.querySelector(".formulario-opinion");

const mensajeFormulario =
  document.getElementById("mensajeFormulario");


function pintarEstrellas(valor) {

  estrellas.forEach(estrella => {

    const numero =
      parseInt(estrella.dataset.valor);

    if(numero <= valor){

      estrella.classList.add("seleccionada");

    }
    else {

      estrella.classList.remove("seleccionada");

    }

  });

}


estrellas.forEach(estrella => {

  estrella.addEventListener("click", () => {

    const valor =
      parseInt(estrella.dataset.valor);

    calificacionInput.value = valor;

    pintarEstrellas(valor);

  });

});


if (formularioOpinion) {

  formularioOpinion.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      mensajeFormulario.textContent = "";

      const datos =
        new FormData(formularioOpinion);

      try {

        const respuesta =
          await fetch(
            formularioOpinion.action,
            {
              method: "POST",
              body: datos,
              headers: {
                "Accept": "application/json"
              }
            }
          );

        if (respuesta.ok) {

          mensajeFormulario.textContent =
            "¡Gracias por tu opinión! 💗";

          formularioOpinion.reset();

          pintarEstrellas(0);

        }
        else {

          mensajeFormulario.textContent =
            "Ocurrió un error, vuelve a intentarlo.";

        }

      }
      catch (error) {

        mensajeFormulario.textContent =
          "Revisa la conexión e inténtalo de nuevo.";

      }

    }
  );

}
