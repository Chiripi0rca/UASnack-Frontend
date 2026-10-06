import { Outlet } from 'react-router-dom'

// ESQUELETO (Sprint 02). Lo completa la tarea #200 (y lo usa #199 para el admin).
// Ruta padre del panel que deja pasar solo a un rol:
//   <Route element={<RutaPorRol rol="administrador" />}> ...vistas del admin... </Route>
//
// Pendiente #200:
//   - sin sesión: mandar al login de la PWA con window.location.assign('/login')
//   - con otro rol: mostrar "No tienes acceso" y no dibujar el panel
// Por ahora deja pasar a todos.
// eslint-disable-next-line no-unused-vars
export default function RutaPorRol({ rol }) {
  return <Outlet />
}
