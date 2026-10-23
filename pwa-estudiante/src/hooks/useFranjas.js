// ESQUELETO (Sprint 03). Lo completa #172 (Alfredo).
// GET /tiendas/{id}/franjas: las próximas franjas de la tienda para un carrito de "minutos" de cocina.
// Debe volver a pedirlas cuando cambien los minutos (queryKey con idTienda y minutos).
//
// Por ahora regresa DATOS DE EJEMPLO para que la pantalla de Elección de retiro (#54) se pueda hacer
// sin esperar al backend. #172 cambia SOLO el contenido: el nombre y lo que regresa se quedan igual.
//   import { useQuery } from '@tanstack/react-query'
//   import { obtenerFranjas } from '../api/pedidos.js'
const FRANJAS_DE_EJEMPLO = [
  { fecha: '2026-10-22', inicio: '11:00', fin: '11:10', minutos_restantes: 24, disponible: true, descuento: null },
  { fecha: '2026-10-22', inicio: '11:10', fin: '11:20', minutos_restantes: 6, disponible: false, descuento: null },
  { fecha: '2026-10-22', inicio: '11:20', fin: '11:30', minutos_restantes: 30, disponible: true, descuento: 10 },
  { fecha: '2026-10-22', inicio: '11:30', fin: '11:40', minutos_restantes: 18, disponible: true, descuento: null },
]

// eslint-disable-next-line no-unused-vars
export function useFranjas(idTienda, minutos) {
  return {
    datos: FRANJAS_DE_EJEMPLO,
    cargando: false,
    error: null,
    reintentar: () => {},
  }
}
