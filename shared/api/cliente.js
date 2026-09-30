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
  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErrorApi({
      status: 0,
      codigo: 'SIN_CONEXION',
      mensaje: 'No hay conexion. Revisa tu internet e intenta de nuevo.',
    })
  }
  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    throw new ErrorApi({
      status: respuesta.status,
      codigo: datos?.error?.codigo ?? 'ERROR_DESCONOCIDO',
      mensaje: datos?.error?.mensaje ?? 'Ocurrio un error inesperado.',
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
