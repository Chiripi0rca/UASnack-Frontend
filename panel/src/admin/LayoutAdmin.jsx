import { Outlet } from 'react-router-dom'

// ESQUELETO (Sprint 02). Lo completa la tarea #198.
// Pendiente: barra lateral (Tiendas, Reglas) y encabezado con el usuario y "Cerrar sesión".
export default function LayoutAdmin() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
