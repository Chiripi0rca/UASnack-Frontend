import { NavLink } from 'react-router-dom'
import './BarraNavegacion.css'

// Barra de navegación inferior de la PWA (#227). Mismos 4 destinos, orden y textos que Android (#229).
// Pedidos, Pagos y Perfil todavía no tienen pantalla: mientras no exista su ruta en App.jsx,
// tocarlos regresa a Tiendas (la ruta "*" manda al login y el login, con sesión, manda a /tiendas).
const DESTINOS = [
  { ruta: '/tiendas', texto: 'Tiendas', icono: IconoTienda },
  { ruta: '/pedidos', texto: 'Pedidos', icono: IconoPedidos },
  { ruta: '/pagos', texto: 'Pagos', icono: IconoPagos },
  { ruta: '/perfil', texto: 'Perfil', icono: IconoPerfil },
]

export default function BarraNavegacion() {
  return (
    <nav className="barra-navegacion" aria-label="Navegación principal">
      {DESTINOS.map(({ ruta, texto, icono: Icono }) => (
        // NavLink pone la clase "activo" cuando la URL empieza con "ruta":
        // /tiendas/3 (Catálogo) también marca "Tiendas".
        <NavLink
          key={ruta}
          to={ruta}
          className={({ isActive }) =>
            isActive ? 'barra-navegacion__destino activo' : 'barra-navegacion__destino'
          }
        >
          {/* La pastilla detrás del ícono se pinta con primary container cuando está activo */}
          <span className="barra-navegacion__icono">
            <Icono />
          </span>
          <span className="barra-navegacion__texto">{texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// Íconos en línea (SVG), sin librería: usan currentColor para tomar el color del destino.
function IconoTienda() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  )
}

function IconoPedidos() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
    </svg>
  )
}

function IconoPagos() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18v12H3zM3 10h18M7 15h3" />
    </svg>
  )
}

function IconoPerfil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
    </svg>
  )
}
