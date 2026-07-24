const CLAVE_RESENAS = "las-gaviotas-resenas";
const formReserva = document.querySelector("#form-reserva");
const modalReservaElement = document.querySelector("#modalReserva");
const formResena = document.querySelector("#form-resena");
const listaResenas = document.querySelector("#lista-resenas");

if (formReserva && modalReservaElement) {
  const modalReserva = new bootstrap.Modal(modalReservaElement);
  const formatoFecha = new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    return formatoFecha.format(new Date(Date.UTC(anio, mes - 1, dia)));
  };

  formReserva.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formReserva.checkValidity()) {
      formReserva.reportValidity();
      return;
    }

    const datos = new FormData(formReserva);
    const solicitud = {
      nombre: datos.get("nombre"),
      email: datos.get("email"),
      telefono: datos.get("telefono"),
      entrada: datos.get("entrada"),
      salida: datos.get("salida"),
      habitacion: datos.get("habitacion"),
      huespedes: Number(datos.get("huespedes")),
      pago: datos.get("pago"),
    };

    const botonEnviar = formReserva.querySelector('button[type="submit"]');
    const mensajeReserva = document.querySelector("#mensaje-reserva");
    botonEnviar.disabled = true;
    botonEnviar.textContent = "Guardando reserva...";
    mensajeReserva.textContent = "";

    try {
      const respuesta = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(solicitud),
      });
      if (!respuesta.ok) throw new Error("No se pudo guardar la reserva.");
      const nuevaReserva = await respuesta.json();

      document.querySelector("#confirmacion-nombre").textContent = nuevaReserva.nombre;
      document.querySelector("#confirmacion-habitacion").textContent = nuevaReserva.habitacion;
      document.querySelector("#confirmacion-fechas").textContent =
        `${formatearFecha(nuevaReserva.entrada)} — ${formatearFecha(nuevaReserva.salida)}`;
      document.querySelector("#confirmacion-huespedes").textContent =
        `${nuevaReserva.huespedes} ${nuevaReserva.huespedes === 1 ? "persona" : "personas"}`;

      modalReserva.show();
      formReserva.reset();
    } catch {
      mensajeReserva.textContent = "No pudimos guardar la reserva. Verificá que el servidor esté iniciado.";
    } finally {
      botonEnviar.disabled = false;
      botonEnviar.innerHTML = 'Solicitar reserva <i class="bi bi-arrow-right"></i>';
    }
  });
}

const cargarResenasIniciales = async () => {
  const guardadas = localStorage.getItem(CLAVE_RESENAS);
  if (guardadas) return JSON.parse(guardadas);

  try {
    const respuesta = await fetch("data/resenas.json");
    if (!respuesta.ok) throw new Error("No se pudieron cargar las reseñas.");
    const resenas = await respuesta.json();
    localStorage.setItem(CLAVE_RESENAS, JSON.stringify(resenas));
    return resenas;
  } catch {
    return [];
  }
};

const obtenerIniciales = (nombre) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

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
  const origen = document.createElement("small");
  origen.textContent = resena.origen || "Huésped de Las Gaviotas";
  datos.append(nombre, origen);

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
  const promedio = resenas.length
    ? resenas.reduce((total, resena) => total + Number(resena.puntuacion), 0) / resenas.length
    : 0;
  document.querySelector("#promedio-resenas").textContent = promedio.toFixed(1);
  document.querySelector("#cantidad-resenas").textContent =
    `Basado en ${resenas.length} ${resenas.length === 1 ? "reseña" : "reseñas"}`;
};

if (formResena && listaResenas) {
  cargarResenasIniciales().then(renderizarResenas);

  formResena.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formResena.checkValidity()) {
      formResena.reportValidity();
      return;
    }

    const datos = new FormData(formResena);
    const resenas = await cargarResenasIniciales();
    const nuevaResena = {
      id: `RS-${Date.now().toString().slice(-6)}`,
      nombre: datos.get("nombre"),
      origen: "Huésped de Las Gaviotas",
      puntuacion: Number(datos.get("puntuacion")),
      comentario: datos.get("comentario"),
      fecha: new Date().toISOString(),
    };

    resenas.unshift(nuevaResena);
    localStorage.setItem(CLAVE_RESENAS, JSON.stringify(resenas));
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
