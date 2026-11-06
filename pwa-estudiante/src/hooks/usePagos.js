// ESQUELETO (Sprint 04). Lo completa #185 (José Ángel).
// GET /pagos: pagos y reembolsos del alumno, paginado.
//
// Por ahora regresa DATOS DE EJEMPLO para que Historial de pagos (#71) se pueda hacer sin esperar al
// backend. #185 cambia SOLO el contenido: el nombre y lo que regresa se quedan igual.
//   import { useQuery } from '@tanstack/react-query'
//   import { obtenerPagos } from '../api/pagos.js'
const PAGOS_DE_EJEMPLO = [
  {
    id: 12,
    codigo_pedido: 'TA-2451',
    monto: '85.00',
    estado: 'pagado',
    creado_en: '2026-11-09 11:21:00',
  },
]

export function usePagos() {
  return {
    datos: PAGOS_DE_EJEMPLO,
    meta: { total: PAGOS_DE_EJEMPLO.length },
    cargando: false,
    error: null,
    reintentar: () => {},
  }
}
