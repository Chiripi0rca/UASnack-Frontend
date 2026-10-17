import { peticion } from '@shared/api/cliente.js'

// Catálogo del encargado (#99, ya en dev). El backend sabe de qué tienda es por el token:
// el cliente nunca manda id_tienda.
export const obtenerProductos = () => peticion('/tienda/productos')

export const crearProducto = (datos) => peticion('/tienda/productos', { method: 'POST', body: datos })

// Solo cambia lo que se manda (las reglas del backend son "sometimes"). El stock NO va aquí.
export const actualizarProducto = (id, datos) =>
  peticion(`/tienda/productos/${id}`, { method: 'PATCH', body: datos })

// 0 = agotado. El servidor decide estado_producto según el stock.
export const actualizarStock = (id, stockHoy) =>
  peticion(`/tienda/productos/${id}/stock`, { method: 'PATCH', body: { stock_hoy: stockHoy } })
