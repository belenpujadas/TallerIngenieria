const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs/promises");

const PUERTO = Number(process.env.PORT) || 3000;
const RAIZ = __dirname;
const ARCHIVO_RESERVAS = path.join(RAIZ, "data", "reservas.json");
const CAMPOS_REQUERIDOS = [
  "nombre",
  "email",
  "telefono",
  "entrada",
  "salida",
  "habitacion",
  "huespedes",
  "pago",
];
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
let colaEscritura = Promise.resolve();

const responderJSON = (respuesta, estado, contenido) => {
  respuesta.writeHead(estado, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  respuesta.end(JSON.stringify(contenido));
};

const leerReservas = async () =>
  JSON.parse(await fs.readFile(ARCHIVO_RESERVAS, "utf8"));

const escribirReservas = async (reservas) => {
  await fs.writeFile(
    ARCHIVO_RESERVAS,
    `${JSON.stringify(reservas, null, 2)}\n`,
    "utf8",
  );
};

const actualizarReservas = (operacion) => {
  const tarea = colaEscritura.then(async () => {
    const reservas = await leerReservas();
    const resultado = await operacion(reservas);
    await escribirReservas(reservas);
    return resultado;
  });
  colaEscritura = tarea.catch(() => {});
  return tarea;
};

const leerCuerpoJSON = (solicitud) =>
  new Promise((resolve, reject) => {
    let cuerpo = "";
    solicitud.setEncoding("utf8");
    solicitud.on("data", (fragmento) => {
      cuerpo += fragmento;
      if (cuerpo.length > 1_000_000) solicitud.destroy();
    });
    solicitud.on("end", () => {
      try {
        resolve(JSON.parse(cuerpo));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
    solicitud.on("error", reject);
  });

const manejarAPI = async (solicitud, respuesta, ruta) => {
  if (ruta === "/api/reservas" && solicitud.method === "GET") {
    const reservas = await leerReservas();
    responderJSON(respuesta, 200, reservas);
    return true;
  }

  if (ruta === "/api/reservas" && solicitud.method === "POST") {
    const datos = await leerCuerpoJSON(solicitud);
    const faltantes = CAMPOS_REQUERIDOS.filter(
      (campo) => datos[campo] === undefined || String(datos[campo]).trim() === "",
    );
    if (faltantes.length) {
      responderJSON(respuesta, 400, {
        error: `Faltan campos requeridos: ${faltantes.join(", ")}`,
      });
      return true;
    }

    const nuevaReserva = {
      id: `LG-${Date.now().toString().slice(-8)}`,
      nombre: String(datos.nombre).trim(),
      email: String(datos.email).trim(),
      telefono: String(datos.telefono).trim(),
      entrada: String(datos.entrada),
      salida: String(datos.salida),
      habitacion: String(datos.habitacion),
      huespedes: Number(datos.huespedes),
      pago: String(datos.pago),
      estado: "Confirmada",
      creada: new Date().toISOString(),
    };
    await actualizarReservas((reservas) => {
      reservas.unshift(nuevaReserva);
      return nuevaReserva;
    });
    responderJSON(respuesta, 201, nuevaReserva);
    return true;
  }

  const coincidencia = ruta.match(/^\/api\/reservas\/([^/]+)\/cancelar$/);
  if (coincidencia && solicitud.method === "PATCH") {
    const id = decodeURIComponent(coincidencia[1]);
    const reserva = await actualizarReservas((reservas) => {
      const encontrada = reservas.find((item) => item.id === id);
      if (encontrada) encontrada.estado = "Cancelada";
      return encontrada;
    });
    if (!reserva) {
      responderJSON(respuesta, 404, { error: "Reserva no encontrada." });
      return true;
    }
    responderJSON(respuesta, 200, reserva);
    return true;
  }

  return false;
};

const servirArchivo = async (respuesta, ruta) => {
  const rutaSolicitada = ruta === "/" ? "/index.html" : ruta;
  const rutaArchivo = path.resolve(RAIZ, `.${rutaSolicitada}`);
  if (!rutaArchivo.startsWith(`${RAIZ}${path.sep}`)) {
    responderJSON(respuesta, 403, { error: "Acceso denegado." });
    return;
  }

  try {
    const contenido = await fs.readFile(rutaArchivo);
    respuesta.writeHead(200, {
      "Content-Type": TIPOS[path.extname(rutaArchivo).toLowerCase()] || "application/octet-stream",
      "Cache-Control": rutaArchivo.endsWith(".json") ? "no-store" : "no-cache",
    });
    respuesta.end(contenido);
  } catch {
    responderJSON(respuesta, 404, { error: "Recurso no encontrado." });
  }
};

const servidor = http.createServer(async (solicitud, respuesta) => {
  const ruta = new URL(solicitud.url, `http://${solicitud.headers.host}`).pathname;
  try {
    if (ruta.startsWith("/api/") && await manejarAPI(solicitud, respuesta, ruta)) return;
    if (ruta.startsWith("/api/")) {
      responderJSON(respuesta, 404, { error: "Endpoint no encontrado." });
      return;
    }
    await servirArchivo(respuesta, ruta);
  } catch (error) {
    responderJSON(respuesta, 500, { error: error.message || "Error interno." });
  }
});

servidor.listen(PUERTO, () => {
  console.log(`Hotel Las Gaviotas disponible en http://localhost:${PUERTO}`);
});
