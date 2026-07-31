localStorage.removeItem("las-gaviotas-reservas");

window.LasGaviotasDB = {
  CLAVE_RESERVAS: "las-gaviotas-reservas-v2",
  CLAVE_RESENAS: "las-gaviotas-resenas",
  ADMINISTRADORES: [{ usuario: "Carolina", clave: "admin" }],
  RESERVAS_INICIALES: [],
  SERVICIOS_HOTEL: [
    "Desayuno",
    "Piscina",
    "Estacionamiento",
    "Recepción 24 horas",
    "Servicio de limpieza",
    "Traslados",
  ],
  RESENAS_INICIALES: [
    {
      id: "RS-1001", nombre: "María González",
      puntuacion: 5,
      comentario: "La ubicación es soñada y el equipo nos hizo sentir como en casa. El desayuno mirando el mar fue lo mejor del viaje.",
      fecha: "2026-06-18T12:00:00.000Z",
    },
    {
      id: "RS-1002", nombre: "Rodrigo Pereira",
      puntuacion: 5,
      comentario: "Habitaciones impecables, piscina tranquila y excelente atención. Volveríamos sin dudarlo.",
      fecha: "2026-07-02T12:00:00.000Z",
    },
  ],
  leerColeccion(clave, datosIniciales) {
    const guardados = localStorage.getItem(clave);
    if (guardados) {
      try {
        const datosGuardados = JSON.parse(guardados);
        const datosPorId = new Map(
          datosIniciales.map((registro) => [registro.id, registro]),
        );
        datosGuardados.forEach((registro) => datosPorId.set(registro.id, registro));
        const datosCompletos = Array.from(datosPorId.values());
        localStorage.setItem(clave, JSON.stringify(datosCompletos));
        return datosCompletos;
      } catch {
        localStorage.removeItem(clave);
      }
    }
    const copia = JSON.parse(JSON.stringify(datosIniciales));
    localStorage.setItem(clave, JSON.stringify(copia));
    return copia;
  },
  guardarColeccion(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
  },
  crearReserva(campos) {
    return {
      id: `LG-${Date.now().toString().slice(-8)}`,
      nombre: campos.nombre,
      email: campos.email,
      telefono: campos.telefono,
      entrada: campos.entrada,
      salida: campos.salida,
      habitacion: campos.habitacion,
      huespedes: Number(campos.huespedes),
      pago: campos.pago,
      servicios: campos.servicios || [],
      estado: "Confirmada",
      creada: new Date().toISOString(),
    };
  },
  cancelarReservaPorId(reservas, id) {
    return reservas.map((reserva) =>
      reserva.id === id ? { ...reserva, estado: "Cancelada" } : reserva,
    );
  },
  crearResena(campos) {
    return {
      id: `RS-${Date.now().toString().slice(-8)}`,
      nombre: campos.nombre,
      puntuacion: Number(campos.puntuacion),
      comentario: campos.comentario,
      fecha: new Date().toISOString(),
    };
  },
  obtenerIniciales(nombre) {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join("");
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = window.LasGaviotasDB;
}
