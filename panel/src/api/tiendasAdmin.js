import { peticion } from '@shared/api/cliente.js'

// Tiendas del panel de administración (#102, ya en dev). El backend sabe la facultad por el token:
// el cliente nunca manda id_facultad.
// Clave de TanStack Query de la lista; la usan la vista, el formulario y el selector de encargado.
export const CLAVE_TIENDAS = ['admin', 'tiendas']

export const obtenerTiendas = () => peticion('/admin/tiendas')

// nombre, ubicacion, horario_apertura y horario_cierre ("HH:MM"). Se crea sin encargado.
export const crearTienda = (datos) => peticion('/admin/tiendas', { method: 'POST', body: datos })

// Solo cambia lo que se manda. { activa: false } da de baja la tienda; { activa: true } la reactiva.
export const actualizarTienda = (id, datos) =>
  peticion(`/admin/tiendas/${id}`, { method: 'PATCH', body: datos })