import { Outlet } from 'react-router-dom'
import BarraNavegacion from './BarraNavegacion.jsx'

// Envuelve las pantallas con sesión: arriba la pantalla (Outlet) y abajo la barra de navegación (#227).
// Las pantallas nuevas se agregan como rutas hijas de este layout en App.jsx.
// El div deja espacio abajo para que la barra fija no tape el final de la pantalla.
export default function LayoutConBarra() {
  return (
    <>
      <div className="con-barra">
        <Outlet />
      </div>
      <BarraNavegacion />
    </>
  )
}
