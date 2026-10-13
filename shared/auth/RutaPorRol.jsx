import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useSesion } from './SesionContext.jsx'

export default function RutaPorRol({ rol }) {
  const { haySesion, usuario } = useSesion()

  useEffect(() => {
    if (!haySesion) {
      const loginUrl = import.meta.env.VITE_PWA_LOGIN_URL

      if (loginUrl) {
        window.location.replace(loginUrl)
      } else {
        console.error(
          'Falta configurar VITE_PWA_LOGIN_URL en el archivo de entorno.'
        )
      }
    }
  }, [haySesion])

  if (!haySesion) {
    return null
  }

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
