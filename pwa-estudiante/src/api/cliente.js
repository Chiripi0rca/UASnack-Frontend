const URL_API = import.meta.env.VITE_API_URL

export class ErrorApi extends Error {
  constructor({ status, codigo, mensaje, campos = {}, reintentarEn = null }) {
    super(mensaje)
    this.status = status
    this.codigo = codigo
    this.mensaje = mensaje
    this.campos = campos
    this.reintentarEn = reintentarEn
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
    })
  }
  return datos
}
