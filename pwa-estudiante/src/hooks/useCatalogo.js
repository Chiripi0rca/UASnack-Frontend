import { useQuery } from '@tanstack/react-query'
import { obtenerCatalogo } from '../api/catalogo.js'

// GET /tiendas/{id}/productos. Cada combinación tienda + categoría se guarda aparte en la caché.
export function useCatalogo(idTienda, idCategoria) {
  const consulta = useQuery({
    queryKey: ['tiendas', idTienda, 'productos', idCategoria ?? 'todas'],
    queryFn: () => obtenerCatalogo(idTienda, idCategoria),
    enabled: Boolean(idTienda),
  })
  return {
    datos: consulta.data?.datos,
    cargando: consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}