import { peticion } from '@shared/api/cliente.js'

// Capacidad de cocina por franja del encargado (#106). El backend sabe de qué tienda es por el token:
// el cliente nunca manda id_tienda.
//
// GET → { datos: [{ dia_semana, hora_inicio, hora_fin, minutos_cocina, personas }],
//         meta: { total, duracion_franja_min } }
// "personas" son las que cocinan pedidos de la app en esa franja (minutos_cocina ÷ duración).
export const obtenerCapacidad = () => peticion('/tienda/capacidad')

// PUT: el dueño contesta en PERSONAS y el servidor las convierte a minutos de cocina
// (personas × duración de la franja). franjas = [{ dia_semana: 1, hora_inicio: '11:00', personas: 2 }, ...].
// Solo hace falta mandar las que cambiaron.
// Responde igual que el GET, ya con lo guardado.
export const actualizarCapacidad = (franjas) =>
  peticion('/tienda/capacidad', { method: 'PUT', body: { franjas } })
