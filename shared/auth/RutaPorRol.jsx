import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { peticion } from '../api/cliente.js'
import { inicioEnPanel } from './inicioEnPanel.js'
import { useSesion } from './SesionContext.jsx'

// Ruta padre del panel que deja pasar solo a un rol (#200):
//   <Route element={<RutaPorRol rol="administrador" />}> ...vistas del admin... </Route>
// - Sin sesión: al login del propio panel (/panel/login).
// - Con otro rol: "No tienes acceso". Si es del panel, con un botón a su inicio; si es alumno, se le
//   dice que use la app de Android. Siempre con un botón para cerrar sesión.
// - Al abrir el panel se confirma el rol con GET /auth/yo (#199): el de localStorage puede ser viejo
//   (por ejemplo, el admin le quitó la tienda a un encargado). Si el token ya no sirve, el cliente
//   HTTP recibe 401, borra la sesión y este mismo componente manda al login.
// La redirección por rol es comodidad, no seguridad: el backend rechaza a quien no tenga el rol.
export default function RutaPorRol({ rol }) {
  const { haySesion, usuario, actualizarUsuario, cerrarSesion } = useSesion()
  const navegar = useNavigate()

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
    navegar('/login', { replace: true })
  }

  if (!haySesion) return <Navigate to="/login" replace />

  if (usuario?.rol !== rol) {
    const inicio = inicioEnPanel(usuario?.rol)
    return (
      <main>
        <h1>No tienes acceso</h1>
        <p>
          {inicio
            ? 'No tienes permisos para acceder a esta parte del panel.'
            : 'El panel es para encargados y administradores. Para pedir, usa la app de UASnack en Android.'}
        </p>
        <p>
          {inicio && (
            <button type="button" className="boton-texto" onClick={() => navegar(inicio)}>
              Ir a mi inicio
            </button>
          )}
          <button type="button" className="boton-texto" onClick={salir}>
            Cerrar sesión
          </button>
        </p>
      </main>
    )
  }

  return <Outlet />
}
