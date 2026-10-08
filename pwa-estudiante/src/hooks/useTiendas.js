import { useQuery } from '@tanstack/react-query'
import { obtenerTiendas } from '../api/catalogo.js'

// GET /tiendas → { datos, cargando, error, reintentar }.
// reintentar va directo al alReintentar de EstadoError.
export function useTiendas() {
  const consulta = useQuery({ queryKey: ['tiendas'], queryFn: obtenerTiendas })
  return {
    datos: consulta.data?.datos,
    cargando: consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}