// Pantalla de inicio de cada rol DENTRO del panel (rutas relativas al basename "/panel").
// El panel web es solo para encargados y administradores: el alumno usa la app de Android.
// La usan el login del panel y RutaPorRol.
const INICIO_EN_PANEL = {
  encargado_tienda: '/',
  administrador: '/admin',
}

// null = ese rol no entra al panel (el alumno, o un rol desconocido)
export function inicioEnPanel(rol) {
  return INICIO_EN_PANEL[rol] ?? null
}
