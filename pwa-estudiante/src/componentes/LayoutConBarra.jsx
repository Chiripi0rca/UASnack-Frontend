import { Outlet } from 'react-router-dom'

// ESQUELETO (Sprint 02). Lo completa la tarea #227.
// Envuelve las pantallas con sesión: arriba la pantalla (Outlet) y abajo la barra de navegación.
// Las pantallas nuevas se agregan como rutas hijas de este layout en App.jsx.
export default function LayoutConBarra() {
  return (
    <>
      <Outlet />
      {/* #227: aquí va <BarraNavegacion /> con Tiendas, Pedidos, Pagos y Perfil */}
    </>
  )
}
