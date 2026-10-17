// Convierte un número (o el texto "25.00" que manda Laravel) en "$25.00".
// Solo es para mostrar: el cobro real lo calcula el servidor (#49).
const FORMATO_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatearPrecio(valor) {
  return FORMATO_MXN.format(Number(valor ?? 0))
}
