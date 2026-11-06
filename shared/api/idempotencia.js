// ESQUELETO (Sprint 04). Lo completa #181 (José Ángel).
// La clave que evita pedidos y cobros repetidos: se genera UNA vez por intento de pedido y se reutiliza
// en cada reintento, también desde la cola offline (#182). Va en el header Idempotency-Key de POST /pedidos.
// Por ahora regresa una clave de ejemplo. #181 cambia SOLO el contenido.

const CLAVE_DE_EJEMPLO = '00000000-0000-4000-8000-000000000000'

// Una clave nueva (UUID) para un intento de pedido
export function generarClave() {
  return CLAVE_DE_EJEMPLO
}

// La clave del intento en curso: si ya hay una, regresa esa
export function obtenerClaveDePedidoActual() {
  return CLAVE_DE_EJEMPLO
}
