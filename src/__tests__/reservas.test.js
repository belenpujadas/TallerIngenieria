const { crearReserva, cancelarReservaPorId } = require('../storage');

// HU-07: El formulario de reserva debe solicitar los datos necesarios para realizar una reserva
describe('HU-07: crearReserva', function () {
  var camposFormulario = {
    nombre: 'Ana Rodríguez',
    email: 'ana@email.com',
    telefono: '+598 99 123 456',
    entrada: '2026-08-10',
    salida: '2026-08-15',
    habitacion: 'Habitación Doble',
    huespedes: '2',
    pago: 'Tarjeta',
    servicios: ['Desayuno buffet', 'Estacionamiento'],
  };

  test('la reserva se arma con el nombre y la habitación correctos', function () {
    var reserva = crearReserva(camposFormulario);
    expect(reserva.nombre).toBe('Ana Rodríguez');
    expect(reserva.habitacion).toBe('Habitación Doble');
  });

  test('la cantidad de huéspedes se guarda como número', function () {
    var reserva = crearReserva(camposFormulario);
    expect(reserva.huespedes).toBe(2);
  });
});

// HU-12: La vista de administrador debe permitir cancelar una reserva
describe('HU-12: cancelarReservaPorId', function () {
  var reservas = [
    { id: 'LG-1', nombre: 'Ana', estado: 'Confirmada' },
    { id: 'LG-2', nombre: 'Beto', estado: 'Confirmada' },
    { id: 'LG-3', nombre: 'Caro', estado: 'Confirmada' },
  ];

  test('la reserva cancelada queda con estado Cancelada', function () {
    var resultado = cancelarReservaPorId(reservas, 'LG-2');
    var reservaCancelada = resultado.find(function (reserva) {
      return reserva.id === 'LG-2';
    });
    expect(reservaCancelada.estado).toBe('Cancelada');
  });

  test('después de cancelar una reserva, quedan menos de 3 activas', function () {
    var resultado = cancelarReservaPorId(reservas, 'LG-2');
    var activas = resultado.filter(function (reserva) {
      return reserva.estado === 'Confirmada';
    });
    expect(activas.length).toBeLessThan(3);
  });
});
