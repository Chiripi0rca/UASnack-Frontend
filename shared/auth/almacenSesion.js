// Guarda la sesión (token + usuario) en localStorage para que sobreviva al recargar o cerrar la pestaña.
// Vive fuera de React porque también lo usa el cliente HTTP, que no es un componente.

const CLAVE_SESION = 'sesionUasnack'

// Funciones que quieren enterarse cuando el servidor da la sesión por vencida (401).
const avisosDeExpiracion = new Set()

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION)) ?? null
  } catch {
    // Modo privado, almacenamiento bloqueado o JSON corrupto: se trata como si no hubiera sesión.
    return null
  }
}

export function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  } catch {
    // Si no se puede guardar, la sesión dura solo mientras la pestaña esté abierta.
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}

export function leerToken() {
  return leerSesion()?.token ?? null
}

// Lo llama el cliente HTTP ante un 401 con token: borra la sesión y avisa a quien esté escuchando.
export function expirarSesion() {
  borrarSesion()
  avisosDeExpiracion.forEach((aviso) => aviso())
}

// Regresa la función para dejar de escuchar (se usa en el cleanup de un useEffect).
export function alExpirarSesion(aviso) {
  avisosDeExpiracion.add(aviso)
  return () => avisosDeExpiracion.delete(aviso)
}
