const CLAVE_RESERVAS = "las-gaviotas-reservas";
const CLAVE_SESION = "las-gaviotas-admin";
const vistaLogin = document.querySelector("#vista-login");
const vistaPanel = document.querySelector("#vista-panel");
const formLogin = document.querySelector("#form-login");
const mensajeLogin = document.querySelector("#mensaje-login");
const tablaReservas = document.querySelector("#tabla-reservas");
const modalCancelarElement = document.querySelector("#modalCancelar");
const modalCancelar = new bootstrap.Modal(modalCancelarElement);
let reservaSeleccionada = null;

const escaparHTML = (valor) => {
  const elemento = document.createElement("span");
  elemento.textContent = valor ?? "";
  return elemento.innerHTML;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(anio, mes - 1, dia)));
};

const cargarReservas = async () => {
  const guardadas = localStorage.getItem(CLAVE_RESERVAS);
  if (guardadas) return JSON.parse(guardadas);

  const respuesta = await fetch("data/reservas.json");
  if (!respuesta.ok) throw new Error("No se pudo cargar la base de reservas.");
  const reservas = await respuesta.json();
  localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
  return reservas;
};

const mostrarPanel = (usuario) => {
  vistaLogin.classList.add("d-none");
  vistaPanel.classList.remove("d-none");
  document.querySelector("#nombre-admin").textContent = usuario;
  renderizarReservas();
};

const renderizarReservas = async () => {
  try {
    const reservas = await cargarReservas();
    document.querySelector("#cantidad-total").textContent = `${reservas.length} ${reservas.length === 1 ? "registro" : "registros"} en total`;
    document.querySelector("#cantidad-activas").textContent = reservas.filter((reserva) => reserva.estado !== "Cancelada").length;
    document.querySelector("#sin-reservas").classList.toggle("d-none", reservas.length !== 0);

    tablaReservas.innerHTML = reservas.map((reserva) => {
      const cancelada = reserva.estado === "Cancelada";
      const fechaCreacion = reserva.creada ? new Date(reserva.creada).toLocaleDateString("es-UY") : "—";
      return `
        <tr class="${cancelada ? "cancelled-row" : ""}">
          <td><span class="reservation-id">${escaparHTML(reserva.id)}</span><span class="guest-date">Creada ${fechaCreacion}</span></td>
          <td><span class="guest-name">${escaparHTML(reserva.nombre)}</span></td>
          <td class="contact-data"><a href="mailto:${escaparHTML(reserva.email)}">${escaparHTML(reserva.email)}</a><span>${escaparHTML(reserva.telefono)}</span></td>
          <td class="stay-data"><span><i class="bi bi-box-arrow-in-right"></i>${formatearFecha(reserva.entrada)}</span><br /><span><i class="bi bi-box-arrow-right"></i>${formatearFecha(reserva.salida)}</span></td>
          <td>${escaparHTML(reserva.habitacion)}</td>
          <td>${escaparHTML(reserva.huespedes)}</td>
          <td>${escaparHTML(reserva.pago)}</td>
          <td><span class="status-badge ${cancelada ? "cancelled" : ""}">${escaparHTML(reserva.estado)}</span></td>
          <td><button class="btn cancel-button" type="button" data-cancelar="${escaparHTML(reserva.id)}" ${cancelada ? "disabled" : ""}><i class="bi bi-x-circle"></i> ${cancelada ? "Cancelada" : "Cancelar"}</button></td>
        </tr>`;
    }).join("");
  } catch {
    tablaReservas.innerHTML = `<tr><td colspan="9" class="text-center py-5">No fue posible cargar las reservas. Abrí el proyecto mediante un servidor local.</td></tr>`;
  }
};

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeLogin.textContent = "";

  try {
    const respuesta = await fetch("data/administradores.json");
    if (!respuesta.ok) throw new Error();
    const administradores = await respuesta.json();
    const usuario = formLogin.usuario.value.trim();
    const clave = formLogin.clave.value;
    const administrador = administradores.find(
      (item) => item.usuario.toLowerCase() === usuario.toLowerCase() && item.clave === clave,
    );

    if (!administrador) {
      mensajeLogin.textContent = "El usuario o la contraseña no son correctos.";
      return;
    }

    sessionStorage.setItem(CLAVE_SESION, administrador.usuario);
    mostrarPanel(administrador.usuario);
  } catch {
    mensajeLogin.textContent = "No fue posible acceder. Abrí el proyecto mediante un servidor local.";
  }
});

tablaReservas.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("[data-cancelar]");
  if (!boton) return;
  const reservas = await cargarReservas();
  reservaSeleccionada = reservas.find((reserva) => reserva.id === boton.dataset.cancelar);
  if (!reservaSeleccionada) return;
  document.querySelector("#cancelar-id").textContent = reservaSeleccionada.id;
  document.querySelector("#cancelar-nombre").textContent = reservaSeleccionada.nombre;
  modalCancelar.show();
});

document.querySelector("#confirmar-cancelacion").addEventListener("click", async () => {
  if (!reservaSeleccionada) return;
  const reservas = await cargarReservas();
  const reserva = reservas.find((item) => item.id === reservaSeleccionada.id);
  if (reserva) reserva.estado = "Cancelada";
  localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas));
  reservaSeleccionada = null;
  modalCancelar.hide();
  renderizarReservas();
});

document.querySelector("#cerrar-sesion").addEventListener("click", () => {
  sessionStorage.removeItem(CLAVE_SESION);
  window.location.reload();
});

const sesionActiva = sessionStorage.getItem(CLAVE_SESION);
if (sesionActiva) mostrarPanel(sesionActiva);
