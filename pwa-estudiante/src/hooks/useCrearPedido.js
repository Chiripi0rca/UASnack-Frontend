// ESQUELETO (Sprint 04). Lo completa #193 (José Ángel).
// POST /pedidos: arma el header Idempotency-Key con shared/api/idempotencia.js, llama a crearPedido
// (api/pedidos.js) e invalida ['pedidos'].
//
// Por ahora regresa DATOS DE EJEMPLO para que Confirmación y pago (#63) se pueda hacer sin esperar al
// backend. #193 cambia SOLO el contenido: el nombre y lo que regresa se quedan igual.
//   import { useMutation } from '@tanstack/react-query'
//   import { crearPedido } from '../api/pedidos.js'
const PEDIDO_DE_EJEMPLO = {
  codigo_pedido: 'TA-2451',
  estado: 'PENDIENTE_PAGO',
  total: '85.00',
  franja_inicio: '11:30',
  franja_fin: '11:40',
  pago: {
    client_secret: 'pi_ejemplo_secret_ejemplo',
    stripe_account: 'acct_ejemplo',
  },
}

export function useCrearPedido() {
  return {
    // datos = { id_tienda, modo_retiro, franja, lineas: [{ id_producto, cantidad, extras, quitables }] }
    // Regresa una promesa con el pedido, o la rechaza con el ErrorApi.
    // eslint-disable-next-line no-unused-vars
    crear: async (datos) => PEDIDO_DE_EJEMPLO,
    creando: false,
    error: null,
  }
}
