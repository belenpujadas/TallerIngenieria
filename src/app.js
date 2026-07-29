const {
  CLAVE_RESERVAS,
  CLAVE_RESENAS,
  RESERVAS_INICIALES,
  RESENAS_INICIALES,
  leerColeccion,
  guardarColeccion,
} = window.LasGaviotasDB;

if (new URLSearchParams(window.location.search).get("mockup") === "reserva") {
  document.body.classList.add("mockup-reserva");
}

const formReserva = document.querySelector("#form-reserva");
const modalReservaElement = document.querySelector("#modalReserva");

if (formReserva && modalReservaElement) {
  const modalReserva = new bootstrap.Modal(modalReservaElement);

  leerColeccion(CLAVE_RESERVAS, RESERVAS_INICIALES);

  formReserva.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!formReserva.checkValidity()) {
      formReserva.reportValidity();
      return;
    }

    const datos = new FormData(formReserva);
    const nuevaReserva = {
      id: `LG-${Date.now().toString().slice(-8)}`,
      nombre: datos.get("nombre"),
      email: datos.get("email"),
      telefono: datos.get("telefono"),
      entrada: datos.get("entrada"),
      salida: datos.get("salida"),
      habitacion: datos.get("habitacion"),
      huespedes: Number(datos.get("huespedes")),
      pago: datos.get("pago"),
      servicios: datos.getAll("servicios"),
      estado: "Confirmada",
      creada: new Date().toISOString(),
    };
    const reservas = leerColeccion(CLAVE_RESERVAS, RESERVAS_INICIALES);
    reservas.unshift(nuevaReserva);
    guardarColeccion(CLAVE_RESERVAS, reservas);

    modalReserva.show();
    formReserva.reset();
  });
}

const formResena = document.querySelector("#form-resena");
const listaResenas = document.querySelector("#lista-resenas");
const obtenerIniciales = (nombre) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0].toUpperCase()).join("");

const crearTarjetaResena = (resena) => {
  const tarjeta = document.createElement("article");
  tarjeta.className = "review-card";
  const encabezado = document.createElement("div");
  encabezado.className = "review-top";
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = obtenerIniciales(resena.nombre);
  const datos = document.createElement("div");
  const nombre = document.createElement("h3");
  nombre.textContent = resena.nombre;
  datos.append(nombre);
  const estrellas = document.createElement("span");
  estrellas.className = "stars ms-auto";
  estrellas.setAttribute("aria-label", `${resena.puntuacion} de 5 estrellas`);
  estrellas.textContent = `${"★".repeat(resena.puntuacion)}${"☆".repeat(5 - resena.puntuacion)}`;
  const comentario = document.createElement("p");
  comentario.textContent = `“${resena.comentario}”`;
  encabezado.append(avatar, datos, estrellas);
  tarjeta.append(encabezado, comentario);
  return tarjeta;
};

const renderizarResenas = (resenas) => {
  listaResenas.replaceChildren(...resenas.map(crearTarjetaResena));
};

if (formResena && listaResenas) {
  renderizarResenas(leerColeccion(CLAVE_RESENAS, RESENAS_INICIALES));
  formResena.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!formResena.checkValidity()) {
      formResena.reportValidity();
      return;
    }
    const datos = new FormData(formResena);
    const resenas = leerColeccion(CLAVE_RESENAS, RESENAS_INICIALES);
    resenas.unshift({
      id: `RS-${Date.now().toString().slice(-8)}`,
      nombre: datos.get("nombre"),
      puntuacion: Number(datos.get("puntuacion")),
      comentario: datos.get("comentario"),
      fecha: new Date().toISOString(),
    });
    guardarColeccion(CLAVE_RESENAS, resenas);
    renderizarResenas(resenas);
    formResena.reset();
    const mensaje = document.querySelector("#mensaje-resena");
    mensaje.textContent = "¡Gracias! Tu reseña fue publicada.";
    mensaje.classList.add("success");
    setTimeout(() => {
      mensaje.textContent = "";
      mensaje.classList.remove("success");
    }, 4000);
  });
}
