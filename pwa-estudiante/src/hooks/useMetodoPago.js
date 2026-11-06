// ESQUELETO (Sprint 04). Lo completa #189 (José Ángel).
// GET, POST y DELETE /pagos/metodos: las tarjetas guardadas del alumno.
//
// Por ahora regresa DATOS DE EJEMPLO para que Métodos de pago (#67) y Confirmación y pago (#63) se
// puedan hacer sin esperar al backend. #189 cambia SOLO el contenido: el nombre y lo que regresa se
// quedan igual.
//   import { useMutation, useQuery } from '@tanstack/react-query'
//   import { agregarMetodo, eliminarMetodo, obtenerMetodos } from '../api/pagos.js'
const METODOS_DE_EJEMPLO = [{ id: 'pm_ejemplo', marca: 'visa', ultimos4: '4242', vence: '12/28' }]

export function useMetodoPago() {
  return {
    datos: METODOS_DE_EJEMPLO,
    cargando: false,
    error: null,
    reintentar: () => {},
    // Regresa una promesa con el client_secret para que Stripe.js guarde la tarjeta
    guardar: async () => 'seti_ejemplo_secret_ejemplo',
    // eslint-disable-next-line no-unused-vars
    eliminar: async (id) => {},
  }
}
