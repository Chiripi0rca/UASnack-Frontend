import { peticion } from '@shared/api/cliente.js'

// ESQUELETO (Sprint 04). Pagos del alumno.
// La forma de las respuestas está en el documento de turnos del Sprint 04: no se cambia sin avisar.

// #69 (Alfredo): { datos: [{ id, codigo_pedido, monto, estado, creado_en }], meta: { total } }
export const obtenerPagos = (pagina = 1) => peticion(`/pagos?pagina=${pagina}`)

// #188 (Alfredo): { datos: [{ id, marca, ultimos4, vence }] }
export const obtenerMetodos = () => peticion('/pagos/metodos')

// #65 (Alfredo): { datos: { client_secret } }. Con él, Stripe.js guarda la tarjeta en la app.
export const agregarMetodo = () => peticion('/pagos/metodos', { method: 'POST' })

// #65 (Alfredo): 204 sin contenido
export const eliminarMetodo = (id) => peticion(`/pagos/metodos/${id}`, { method: 'DELETE' })
