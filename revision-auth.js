(function iniciarRevisionPrivada() {
  "use strict";

  const esRutaRevision =
    window.location.pathname.replace(/\/+$/, "") === "/revision";

  if (!esRutaRevision) return;

  const acceso = document.getElementById("revisionAcceso");
  const cargando = document.getElementById("revisionCargando");
  const formulario = document.getElementById("revisionForm");
  const correo = document.getElementById("revisionCorreo");
  const password = document.getElementById("revisionPassword");
  const verPassword = document.getElementById("revisionVerPassword");
  const errorMensaje = document.getElementById("revisionError");
  const ingresar = document.getElementById("revisionIngresar");
  const barra = document.getElementById("revisionBarra");
  const cerrarSesion = document.getElementById("revisionCerrarSesion");
  const configuracion = window.AITANA_SUPABASE_CONFIG;

  acceso.hidden = false;
  bloquearContenido(true);

  if (!window.supabase || !configuracion) {
    mostrarLogin("No fue posible conectar con el servicio de acceso. Inténtalo nuevamente.");
    return;
  }

  const clienteSupabase = window.supabase.createClient(
    configuracion.url,
    configuracion.publishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  function bloquearContenido(bloquear) {
    document.querySelectorAll("body > :not(#revisionAcceso)").forEach(elemento => {
      if (elemento.id !== "revisionBarra") {
        elemento.inert = bloquear;
      }
    });
  }

  function limpiarError() {
    errorMensaje.hidden = true;
    errorMensaje.textContent = "";
  }

  function mostrarLogin(mensaje = "") {
    document.documentElement.classList.remove("revision-autorizada");
    barra.hidden = true;
    acceso.hidden = false;
    cargando.hidden = true;
    formulario.hidden = false;
    formulario.reset();
    bloquearContenido(true);

    if (mensaje) {
      errorMensaje.textContent = mensaje;
      errorMensaje.hidden = false;
    }
    else {
      limpiarError();
    }

    correo.focus();
  }

  function mostrarCatalogo() {
    limpiarError();
    acceso.hidden = true;
    barra.hidden = false;
    bloquearContenido(false);
    document.documentElement.classList.add("revision-autorizada");
  }

  async function validarSesionActual() {
    try {
      const { data, error } = await clienteSupabase.auth.getUser();

      if (error || !data.user) {
        mostrarLogin();
        return;
      }

      mostrarCatalogo();
    }
    catch (error) {
      mostrarLogin("No pudimos verificar la sesión. Revisa tu conexión e inténtalo nuevamente.");
    }
  }

  formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    limpiarError();
    ingresar.disabled = true;
    ingresar.textContent = "Ingresando…";

    try {
      const { error } = await clienteSupabase.auth.signInWithPassword({
        email: correo.value.trim(),
        password: password.value
      });

      if (error) {
        mostrarLogin("Correo o contraseña incorrectos.");
        return;
      }

      password.value = "";
      await validarSesionActual();
    }
    catch (error) {
      mostrarLogin("No fue posible iniciar sesión. Inténtalo nuevamente.");
    }
    finally {
      ingresar.disabled = false;
      ingresar.textContent = "Ingresar";
    }
  });

  verPassword.addEventListener("click", () => {
    const mostrar = password.type === "password";
    password.type = mostrar ? "text" : "password";
    verPassword.setAttribute("aria-pressed", String(mostrar));
    verPassword.setAttribute(
      "aria-label",
      mostrar ? "Ocultar contraseña" : "Mostrar contraseña"
    );
    verPassword.innerHTML = mostrar
      ? '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-eye" aria-hidden="true"></i>';
  });

  cerrarSesion.addEventListener("click", async () => {
    cerrarSesion.disabled = true;
    cerrarSesion.textContent = "Cerrando…";

    try {
      await clienteSupabase.auth.signOut();
    }
    finally {
      cerrarSesion.disabled = false;
      cerrarSesion.textContent = "Cerrar sesión";
      mostrarLogin();
    }
  });

  clienteSupabase.auth.onAuthStateChange(evento => {
    if (evento === "SIGNED_OUT") {
      mostrarLogin();
    }
  });

  validarSesionActual();
})();
