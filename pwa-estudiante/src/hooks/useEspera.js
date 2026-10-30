import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { obtenerEspera } from '../api/pedidos.js'

// Cada cuánto se vuelve a pedir la espera mientras la pantalla está abierta. La cola de la cocina
// cambia minuto a minuto (§7.4): si se destraba, el alumno ve bajar el rango sin recargar.
const REFRESCO_MS = 30_000

// GET /tiendas/{id}/espera (#174). Cuánto tardaría el pedido en modo "voy saliendo".
// Recibe:
//   idTienda → la tienda donde el alumno está pidiendo
//   minutos  → minutos de cocina del carrito (tiempo_prep_min × cantidad de cada producto)
// Regresa { datos, cargando, error, reintentar }, igual que useFranjas.
//   datos = { min, max, saturada, pedidos_en_cocina, voy_saliendo_disponible }
// Siempre un rango (min–max), nunca un tiempo fijo: lo calcula el servidor.
export function useEspera(idTienda, minutos) {
  // Sin minutos todavía, se pide para un carrito de 0 min en vez de mandar "minutos=undefined"
  const minutosCocina = minutos ?? 0

  const consulta = useQuery({
    // Si cambia la tienda o los minutos del carrito, se vuelve a pedir
    queryKey: ['tiendas', idTienda, 'espera', minutosCocina],
    queryFn: () => obtenerEspera(idTienda, minutosCocina),
    enabled: Boolean(idTienda),
    // Mientras llega la respuesta nueva se sigue viendo la anterior: el panel no parpadea
    placeholderData: keepPreviousData,
    // Se refresca solo mientras la pestaña está visible
    refetchInterval: REFRESCO_MS,
  })

  return {
    // El servidor responde { datos: {...} }: aquí solo se pasa el objeto
    datos: consulta.data?.datos,
    cargando: consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}
