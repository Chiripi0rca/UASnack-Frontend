// useQuery: pide los datos al servidor y los guarda en caché.
// keepPreviousData: mientras llega una respuesta nueva, deja ver la anterior.
import { keepPreviousData, useQuery } from '@tanstack/react-query'
// La función que hace el GET /tiendas/{id}/franjas (ya existe en api/pedidos.js).
import { obtenerFranjas } from '../api/pedidos.js'

// GET /tiendas/{id}/franjas (#172). Trae las próximas franjas de una tienda (máximo 8).
// Recibe:
//   idTienda → la tienda donde el alumno está pidiendo
//   minutos  → minutos de cocina del carrito (tiempo_prep_min × cantidad de cada producto)
// Regresa { datos, cargando, error, reintentar }, igual que useCatalogo y useTiendas.
export function useFranjas(idTienda, minutos) {
  // Si todavía no llegan los minutos, se piden las franjas para un carrito de 0 min
  // en vez de mandarle "minutos=undefined" al servidor.
  const minutosCocina = minutos ?? 0

  const consulta = useQuery({
    // La "llave" de la caché. Lleva la tienda y los minutos: si cambia cualquiera de los dos,
    // se vuelven a pedir las franjas, porque donde cabían 6 min puede no haber lugar para 18.
    queryKey: ['tiendas', idTienda, 'franjas', minutosCocina],
    // Cómo se traen los datos: llamando al endpoint.
    queryFn: () => obtenerFranjas(idTienda, minutosCocina),
    // Sin tienda no hay nada que pedir (por ejemplo, mientras se lee la URL).
    enabled: Boolean(idTienda),
    // Al cambiar los minutos se siguen viendo las franjas anteriores hasta que lleguen las nuevas:
    // así la rejilla no parpadea a "cargando" cada vez que el alumno cambia el carrito.
    placeholderData: keepPreviousData,
  })

  return {
    // El servidor responde { datos: [...], meta: { total } }: aquí solo se pasa la lista.
    // Mientras carga la primera vez vale undefined.
    datos: consulta.data?.datos,
    // true solo la primera vez, cuando todavía no hay nada que mostrar.
    cargando: consulta.isPending,
    // El ErrorApi del cliente HTTP (trae el codigo y el mensaje del servidor), o null.
    error: consulta.error,
    // Vuelve a pedir las franjas: va directo al botón "Reintentar" de EstadoError.
    reintentar: consulta.refetch,
  }
}
