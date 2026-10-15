import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext.jsx'

// Ruta padre del panel que deja pasar solo a un rol (#200):
//   <Route element={<RutaPorRol rol="administrador" />}> ...vistas del admin... </Route>
// - Sin sesión: al login de la PWA. Es otra app en el mismo dominio (#233): se recarga la página.
// - Con otro rol: "No tienes acceso" y no se dibuja el panel.
export default function RutaPorRol({ rol }) {
  const { haySesion, usuario } = useSesion()

  // Cambiar de página va en un useEffect, no mientras React dibuja
  useEffect(() => {
    if (!haySesion) window.location.replace('/login')
  }, [haySesion])

  if (!haySesion) return null

  if (usuario?.rol !== rol) {
    return (
      <main>
        <h1>No tienes acceso</h1>
        <p>No tienes permisos para acceder a este panel.</p>
      </main>
    )
  }

  return <Outlet />
}
