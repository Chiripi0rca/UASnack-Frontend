// Ruta a la que va cada rol después de iniciar sesión (login único de la PWA).
// La usan el login de la PWA (#222) y el panel (#199, #200): nadie escribe otra tabla igual.
//
// /panel/... es otra app (otro build): para llegar ahí se recarga la página con
// window.location.assign(ruta), no con navigate() de React Router.
const DESTINO_POR_ROL = {
  usuario: '/tiendas',
  encargado_tienda: '/panel/',
  administrador: '/panel/admin',
}

export function destinoPorRol(rol) {
  return DESTINO_POR_ROL[rol] ?? '/login'
}
