import { NavLink, Outlet } from 'react-router-dom'
import { useSesion } from '@shared/auth/SesionContext.jsx'
import './LayoutAdmin.css'

// Layout del panel de administración (#198): barra lateral con sus destinos y el usuario con
// "Cerrar sesión". La vista actual se dibuja en <Outlet/>.
// Las rutas son relativas al basename "/panel" de main.jsx: "/admin/tiendas" = /panel/admin/tiendas.
// La administración NO ve ventas ni demanda de las tiendas: por eso solo tiene estos dos destinos.
// Los que aún no tienen vista salen deshabilitados; cuando exista su ruta se les pone "ruta".
const DESTINOS = [
  { texto: 'Tiendas', ruta: '/admin/tiendas' },
  { texto: 'Reglas de la facultad' }, // HU-32
]

export default function LayoutAdmin() {
  const { usuario, cerrarSesion } = useSesion()

  // Igual que en el panel de la tienda: el login es ÚNICO y vive en la PWA (otra app),
  // por eso se recarga la página con location en vez de navegar con React Router.
  async function salir() {
    await cerrarSesion()
    window.location.assign('/login')
  }

  return (
    <div className="layout-admin">
      <aside className="layout-admin__lateral">
        <p className="layout-admin__marca">UASnack · Administración</p>

        <nav className="layout-admin__nav" aria-label="Panel de administración">
          {DESTINOS.map(({ texto, ruta }) =>
            ruta ? (
              <NavLink
                key={texto}
                to={ruta}
                className={({ isActive }) =>
                  isActive ? 'layout-admin__destino activo' : 'layout-admin__destino'
                }
              >
                {texto}
              </NavLink>
            ) : (
              <span
                key={texto}
                className="layout-admin__destino layout-admin__destino--pendiente"
                aria-disabled="true"
              >
                {texto}
              </span>
            )
          )}
        </nav>

        <div className="layout-admin__usuario">
          <span>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <span className="layout-admin__correo">{usuario?.correo_institucional}</span>
          <button type="button" className="boton-texto" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="layout-admin__contenido">
        <Outlet />
      </main>
    </div>
  )
}