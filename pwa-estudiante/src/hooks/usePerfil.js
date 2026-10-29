import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSesion } from '@shared/auth/SesionContext.jsx'
import { obtenerPerfil } from '../api/auth.js'

// GET /auth/yo (#218) → { datos, cargando, error, reintentar }.
// HU-34, CA-03: se pide al servidor CADA vez que se abre el Perfil (refetchOnMount: 'always'),
// nunca se muestra solo lo que la app guardó al iniciar sesión.
// Lo que llega también refresca la sesión guardada, igual que hace el panel al abrir.
export function usePerfil() {
  const { actualizarUsuario } = useSesion()
  const consulta = useQuery({
    queryKey: ['perfil'],
    queryFn: obtenerPerfil,
    refetchOnMount: 'always',
  })

  const usuario = consulta.data?.usuario
  useEffect(() => {
    if (usuario) actualizarUsuario(usuario)
    // actualizarUsuario cambia en cada render del proveedor: basta con reaccionar a datos nuevos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  return {
    datos: usuario,
    cargando: consulta.isPending,
    error: consulta.error,
    reintentar: consulta.refetch,
  }
}
