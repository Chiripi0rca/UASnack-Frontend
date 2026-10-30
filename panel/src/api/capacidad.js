import { peticion } from '@shared/api/cliente.js'

// Capacidad de cocina por franja del encargado (#106). El backend sabe de qué tienda es por el token:
// el cliente nunca manda id_tienda.
//
// GET → { datos: [{ dia_semana, hora_inicio, hora_fin, minutos_cocina, piezas }],
//         meta: { total, minutos_por_pieza } }
// "piezas" y "minutos_por_pieza" son null si la tienda todavía no tiene productos que se cocinen.
export const obtenerCapacidad = () => peticion('/tienda/capacidad')

// PUT: el dueño contesta en PIEZAS y el servidor las convierte a minutos de cocina.
// franjas = [{ dia_semana: 1, hora_inicio: '11:00', piezas: 5 }, ...]. Solo hace falta mandar las que cambiaron.
// Responde igual que el GET, ya con lo guardado.
export const actualizarCapacidad = (franjas) =>
  peticion('/tienda/capacidad', { method: 'PUT', body: { franjas } })
