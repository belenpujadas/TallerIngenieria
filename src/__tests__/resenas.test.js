const { crearResena, obtenerIniciales } = require('../storage');

// HU-17: La página web debe contar con una sección de reseñas
describe('HU-17: reseñas', function () {
  test('la reseña se arma con el comentario correcto', function () {
    var resena = crearResena({
      nombre: 'María González',
      puntuacion: '5',
      comentario: 'Excelente atención y ubicación.',
    });
    expect(resena.comentario).toEqual('Excelente atención y ubicación.');
  });

  test('obtenerIniciales devuelve las iniciales en mayúsculas', function () {
    expect(obtenerIniciales('María González')).toBe('MG');
  });
});
