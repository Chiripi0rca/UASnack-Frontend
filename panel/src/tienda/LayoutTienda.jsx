import { NavLink, Outlet } from 'react-router-dom'
import { useSesion } from '@shared/auth/SesionContext.jsx'
import './LayoutTienda.css'

// Layout del panel de la tienda (#201): barra lateral con los 6 destinos, interruptor
// "Aceptando pedidos" y el usuario con "Cerrar sesión". La vista actual se dibuja en <Outlet/>.
// Las rutas son relativas al basename "/panel" de main.jsx: "/catalogo" = /panel/catalogo.
// Los destinos sin vista todavía salen deshabilitados; cuando exista su ruta se les pone "ruta".
const DESTINOS = [
  { texto: 'Cola de pedidos' },
  { texto: 'Producción' },
  { texto: 'Catálogo y stock', ruta: '/catalogo' },
  { texto: 'Franjas y capacidad', ruta: '/capacidad' },
  { texto: 'Corte de caja' },
  { texto: 'Configura tus pagos' },
]

export default function LayoutTienda() {
  const { usuario, cerrarSesion } = useSesion()

  // Cerrar sesión: revoca el token y vuelve al login ÚNICO, que vive en la PWA (otra app):
  // por eso se recarga la página con location en vez de navegar con React Router.
  async function salir() {
    await cerrarSesion()
    window.location.assign('/login')
  }

  return (
    <div className="layout-tienda">
      <aside className="layout-tienda__lateral">
        <p className="layout-tienda__marca">UASnack · Tienda</p>

        {/* Interruptor "Aceptando pedidos". Todavía no hay endpoint para guardarlo:
            queda deshabilitado hasta la HU de la cola de pedidos. */}
        <label className="interruptor">
          <input type="checkbox" role="switch" disabled />
          <span>Aceptando pedidos</span>
        </label>

        <nav className="layout-tienda__nav" aria-label="Panel de la tienda">
          {DESTINOS.map(({ texto, ruta }) =>
            ruta ? (
              <NavLink
                key={texto}
                to={ruta}
                className={({ isActive }) => (isActive ? 'destino activo' : 'destino')}
              >
                {texto}
              </NavLink>
            ) : (
              <span key={texto} className="destino destino--pendiente" aria-disabled="true">
                {texto}
              </span>
            )
          )}
        </nav>

        <div className="layout-tienda__usuario">
          <span>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <button type="button" className="boton-texto" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="layout-tienda__contenido">
        <Outlet />
      </main>
    </div>
  )
}
