const {
  CLAVE_RESERVAS,
  RESENAS_INICIALES,
  SERVICIOS_HOTEL,
  leerColeccion,
  guardarColeccion,
  crearReserva,
} = require('../storage');

beforeEach(function () {
  localStorage.clear();
});

// HU-05: La página web debe permitir a los clientes realizar reservas
describe('HU-05: Persistencia de reservas', function () {
  test('leerColeccion guarda los datos iniciales cuando no hay nada guardado', function () {
    var reservas = leerColeccion(CLAVE_RESERVAS, RESENAS_INICIALES);
    expect(reservas).toEqual(RESENAS_INICIALES);
  });

  test('una reserva enviada queda registrada en el listado', function () {
    var nuevaReserva = crearReserva({
      nombre: 'Rodrigo Pereira',
      email: 'rodrigo@email.com',
      telefono: '099111222',
      entrada: '2026-09-01',
      salida: '2026-09-05',
      habitacion: 'Suite Las Gaviotas',
      huespedes: '3',
      pago: 'Efectivo',
      servicios: [],
    });

    var reservas = leerColeccion(CLAVE_RESERVAS, []);
    reservas.unshift(nuevaReserva);
    guardarColeccion(CLAVE_RESERVAS, reservas);

    var reservasGuardadas = leerColeccion(CLAVE_RESERVAS, []);
    expect(reservasGuardadas.length).toBe(1);
  });
});

// HU-15: La página web debe mostrar los servicios ofrecidos por el hotel
describe('HU-15: Servicios del hotel', function () {
  test('el hotel ofrece exactamente 6 servicios', function () {
    expect(SERVICIOS_HOTEL.length).toBe(6);
  });

  test('la piscina está entre los servicios ofrecidos', function () {
    expect(SERVICIOS_HOTEL.includes('Piscina')).toBeTruthy();
  });
});
