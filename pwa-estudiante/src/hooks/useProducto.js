import { useQuery } from '@tanstack/react-query'
import { obtenerProducto } from '../api/catalogo.js'

// GET /productos/{id}. Lo usa la pantalla de detalle (#50).
export function useProducto(idProducto) {
  const consulta = useQuery({
    queryKey: ['productos', idProducto],
    queryFn: () => obtenerProducto(idProducto),
    enabled: Boolean(idProducto),
  })
  return {
    datos: consulta.data?.datos,
    cargando: consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}