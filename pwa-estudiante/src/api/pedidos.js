import { peticion } from '@shared/api/cliente.js'

// ESQUELETO (Sprint 03). Franjas y espera de una tienda.
// minutos = minutos de cocina del carrito (tiempo_prep_min × cantidad de cada producto).
// La forma de las respuestas está en el documento de turnos del Sprint 03: no se cambia sin avisar.

// #53 (Ricardo): { datos: [{ fecha, inicio, fin, minutos_restantes, disponible, descuento }], meta: { total } }
export const obtenerFranjas = (idTienda, minutos, limite = 8) =>
  peticion(`/tiendas/${idTienda}/franjas?minutos=${minutos}&limite=${limite}`)

// #57 (José Ángel): { datos: { min, max, saturada, pedidos_en_cocina, voy_saliendo_disponible } }
export const obtenerEspera = (idTienda, minutos) =>
  peticion(`/tiendas/${idTienda}/espera?minutos=${minutos}`)

// ESQUELETO (Sprint 04). #148 (José Ángel): 201, o 200 si la clave se repite.
// datos = { id_tienda, modo_retiro, franja, lineas: [{ id_producto, cantidad, extras, quitables }] }
// → { datos: { codigo_pedido, estado, total, franja_inicio, franja_fin, pago: { client_secret, stripe_account } } }
export const crearPedido = (datos, claveIdempotencia) =>
  peticion('/pedidos', {
    method: 'POST',
    body: datos,
    headers: { 'Idempotency-Key': claveIdempotencia },
  })
