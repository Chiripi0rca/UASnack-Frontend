// ESQUELETO (Sprint 03). Lo completa #174 (Ricardo).
// GET /tiendas/{id}/espera: cuánto tardaría el pedido en modo "voy saliendo". Siempre un rango.
// Debe volver a pedirla cuando cambien los minutos (queryKey con idTienda y minutos).
//
// Por ahora regresa DATOS DE EJEMPLO para que el panel "Voy saliendo" (#59) y la pantalla de
// Elección de retiro (#54) se puedan hacer sin esperar al backend. #174 cambia SOLO el contenido:
// el nombre y lo que regresa se quedan igual.
//   import { useQuery } from '@tanstack/react-query'
//   import { obtenerEspera } from '../api/pedidos.js'
const ESPERA_DE_EJEMPLO = {
  min: 16,
  max: 22,
  saturada: true,
  pedidos_en_cocina: 14,
  voy_saliendo_disponible: true,
}

// eslint-disable-next-line no-unused-vars
export function useEspera(idTienda, minutos) {
  return {
    datos: ESPERA_DE_EJEMPLO,
    cargando: false,
    error: null,
    reintentar: () => {},
  }
}
