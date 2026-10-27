import { expirarSesion, leerToken } from '../auth/almacenSesion.js'

const URL_API = import.meta.env.VITE_API_URL

export class ErrorApi extends Error {
  constructor({ status, codigo, mensaje, campos = {}, reintentarEn = null, intentosRestantes = null }) {
    super(mensaje)
    this.status = status
    this.codigo = codigo
    this.mensaje = mensaje
    this.campos = campos
    this.reintentarEn = reintentarEn
    // Se guarda en el error para que las pantallas, puedan mostrar "Te quedan X intentos".
    this.intentosRestantes = intentosRestantes
  }
}

export async function peticion(ruta, { method = 'GET', body } = {}) {
  // Si hay sesión guardada, cada petición lleva su token para que auth:sanctum sepa quién es.
  const token = leerToken()
  // Un archivo (por ejemplo, la foto de un producto, #238) viaja como FormData (multipart):
  // ese body se manda tal cual, sin convertirlo a JSON, y sin poner el Content-Type a mano,
  // porque el navegador lo pone solo junto con el "boundary" que separa cada parte.
  const esArchivo = body instanceof FormData
  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body && !esArchivo && { 'Content-Type': 'application/json; charset=UTF-8' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: esArchivo ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErrorApi({
      status: 0,
      codigo: 'SIN_CONEXION',
      mensaje: 'No hay conexión. Revisa tu internet e intenta de nuevo.',
    })
  }
  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  // 401 con token = la sesión venció o se revocó: se borra y RutaProtegida manda al login.
  // Sin token no se toca nada: es el 401 del login (CREDENCIALES_INVALIDAS) y la pantalla lo muestra.
  if (respuesta.status === 401 && token) expirarSesion()

  if (!respuesta.ok) {
    throw new ErrorApi({
      status: respuesta.status,
      codigo: datos?.error?.codigo ?? 'ERROR_DESCONOCIDO',
      mensaje: datos?.error?.mensaje ?? 'Ocurrió un error inesperado.',
      campos: datos?.error?.campos ?? {},
      reintentarEn: Number(respuesta.headers.get('Retry-After')) || null,
      // Lee el header X-RateLimit-Remaining que manda el backend.
      // Se usa headers.has() porque si el header no llega, Number(null) daría 0
      // y la pantalla pensaría que ya no quedan intentos. Así, sin header, queda en null.
      // Nota: el navegador solo deja leer este header si el backend lo expone
      // en config/cors.php (exposed_headers).
      intentosRestantes: respuesta.headers.has('X-RateLimit-Remaining')
        ? Number(respuesta.headers.get('X-RateLimit-Remaining'))
        : null,
    })
  }
  return datos
}
