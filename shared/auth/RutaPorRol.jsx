import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { peticion } from '../api/cliente.js'
import { destinoPorRol } from './destinoPorRol.js'
import { useSesion } from './SesionContext.jsx'

// Ruta padre del panel que deja pasar solo a un rol (#200):
//   <Route element={<RutaPorRol rol="administrador" />}> ...vistas del admin... </Route>
// - Sin sesión: al login de la PWA. Es otra app en el mismo dominio (#233): se recarga la página.
// - Con otro rol: "No tienes acceso", con un botón a su propio destino y otro para cerrar sesión.
// - Al abrir el panel se confirma el rol con GET /auth/yo (#199): el de localStorage puede ser viejo
//   (por ejemplo, el admin le quitó la tienda a un encargado). Si el token ya no sirve, el cliente
//   HTTP recibe 401, borra la sesión y este mismo componente manda al login.
// La redirección por rol es comodidad, no seguridad: el backend rechaza a quien no tenga el rol.
export default function RutaPorRol({ rol }) {
  const { haySesion, usuario, actualizarUsuario, cerrarSesion } = useSesion()

  // Cambiar de página va en un useEffect, no mientras React dibuja
  useEffect(() => {
    if (!haySesion) window.location.replace('/login')
  }, [haySesion])

  // Una vez por apertura del panel. Si falla por red, se queda con lo guardado.
  useEffect(() => {
    if (!haySesion) return
    let vigente = true
    peticion('/auth/yo')
      .then((respuesta) => {
        if (vigente && respuesta?.usuario) actualizarUsuario(respuesta.usuario)
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haySesion])

  async function salir() {
    await cerrarSesion()
    window.location.assign('/login')
  }

  if (!haySesion) return null

  if (usuario?.rol !== rol) {
    return (
      <main>
        <h1>No tienes acceso</h1>
        <p>No tienes permisos para acceder a este panel.</p>
        <p>
          <button
            type="button"
            className="boton-texto"
            onClick={() => window.location.assign(destinoPorRol(usuario?.rol))}
          >
            Ir a mi inicio
          </button>
          <button type="button" className="boton-texto" onClick={salir}>
            Cerrar sesión
          </button>
        </p>
      </main>
    )
  }

  return <Outlet />
}