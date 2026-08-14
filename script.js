const numeroWhatsapp = "51982797861";


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

    tarjeta.dataset.index = index;


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


let categoriaSeleccionada = "Todos";

let stockSeleccionado = "todos";


function actualizarCatalogo() {

  const texto =
    buscadorCatalogo.value
      .toLowerCase()
      .trim();


  const tarjetas =
    document.querySelectorAll(".producto");


  let totalVisible = 0;


  tarjetas.forEach(tarjeta => {

    const index =
      Number(tarjeta.dataset.index);


    const producto =
      productos[index];


    const coincideBusqueda =

      producto.nombre
        .toLowerCase()
        .includes(texto)

      ||

      producto.categoria
        .toLowerCase()
        .includes(texto);


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


    tarjeta.style.display =
      mostrar ? "flex" : "none";


    if(mostrar) {

      totalVisible++;

    }

  });


  contadorProductos.textContent =
    totalVisible;


  sinResultados.style.display =
    totalVisible === 0
      ? "block"
      : "none";

}



/* BUSCADOR */

buscadorCatalogo.addEventListener(
  "input",
  actualizarCatalogo
);



/* CATEGORÍAS */

botonesCategoria.forEach(boton => {

  boton.addEventListener("click", () => {

    botonesCategoria.forEach(b => {

      b.classList.remove("activo");

    });


    boton.classList.add("activo");


    categoriaSeleccionada =
      boton.dataset.categoria;


    actualizarCatalogo();

  });

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


    actualizarCatalogo();

  });

});



/* ORDEN */

selectOrden.addEventListener("change", () => {

  const tarjetas =
    [
      ...document.querySelectorAll(".producto")
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


      default:

        return (
          Number(tarjetaA.dataset.index) -
          Number(tarjetaB.dataset.index)
        );

    }

  });


  tarjetas.forEach(tarjeta => {

    contenedor.appendChild(tarjeta);

  });

});


actualizarCatalogo();



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


  document.addEventListener("click", (e) => {

    if (
      menu.classList.contains("abierto") &&
      !menu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {

      menu.classList.remove("abierto");

    }

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

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });

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

  const campoGusto =
    formularioOpinion.querySelector(
      '[name="me_gusto"]'
    );

  const campoMejorar =
    formularioOpinion.querySelector(
      '[name="mejorar"]'
    );


  function mostrarError(texto) {

    mensajeFormulario.textContent = texto;

    mensajeFormulario.classList.add("error");

  }


  function limpiarMensaje() {

    mensajeFormulario.textContent = "";

    mensajeFormulario.classList.remove("error");

  }


  estrellas.forEach(estrella => {

    estrella.addEventListener("click", () => {

      limpiarMensaje();

    });

  });


  [campoGusto, campoMejorar].forEach(campo => {

    if (campo) {

      campo.addEventListener("input", () => {

        limpiarMensaje();

      });

    }

  });


  formularioOpinion.addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      limpiarMensaje();

      const calificacionValor =
        parseInt(calificacionInput.value) || 0;

      const textoGusto =
        campoGusto
          ? campoGusto.value.trim()
          : "";

      const textoMejorar =
        campoMejorar
          ? campoMejorar.value.trim()
          : "";


      if (calificacionValor < 1) {

        mostrarError(
          "⚠️ Selecciona una calificación de 1 a 5 estrellas."
        );

        return;

      }


      if (!textoGusto && !textoMejorar) {

        mostrarError(
          "⚠️ Cuéntanos qué te gustó o qué podríamos mejorar."
        );

        return;

      }


      const datos =
        new FormData(formularioOpinion);

      const botonEnviar =
        formularioOpinion.querySelector(
          'button[type="submit"]'
        );

      botonEnviar.disabled = true;
      botonEnviar.innerHTML = "Enviando...";

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
            "💗 ¡Gracias por tu opinión! Nos ayuda a seguir mejorando.";

          formularioOpinion.reset();

          pintarEstrellas(0);

          setTimeout(() => {
            limpiarMensaje();
          }, 6000);

        }
        else {

          mostrarError(
            "Ocurrió un error, vuelve a intentarlo."
          );

        }

      }
      catch (error) {

        mostrarError(
          "Revisa la conexión e inténtalo de nuevo."
        );

      }
      finally {

        botonEnviar.disabled = false;
        botonEnviar.innerHTML =
          '<i class="fa-solid fa-heart"></i> Enviar opinión';

      }

    }
  );

}
