localStorage.removeItem("las-gaviotas-reservas");

window.LasGaviotasDB = {
  CLAVE_RESERVAS: "las-gaviotas-reservas-v2",
  CLAVE_RESENAS: "las-gaviotas-resenas",
  ADMINISTRADORES: [{ usuario: "Carolina", clave: "admin" }],
  RESERVAS_INICIALES: [],
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
};
