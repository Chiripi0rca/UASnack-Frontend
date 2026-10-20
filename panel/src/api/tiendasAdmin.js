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

// #104: a quién se va a asignar, ANTES de guardar. Responde nombre, correo, rol, tienda actual,
// puede_ser_encargado y, si no se puede, motivo { codigo, mensaje }. 404 si el correo no existe.
export const buscarUsuario = (correo, idTienda) =>
  peticion(`/admin/usuarios/buscar?${new URLSearchParams({ correo, id_tienda: String(idTienda) })}`)

// #104: asigna (o cambia) el encargado por correo. El anterior vuelve a ser "usuario".
// Responde la tienda con la misma forma que la lista.
export const asignarEncargado = (idTienda, correo) =>
  peticion(`/admin/tiendas/${idTienda}/encargado`, {
    method: 'PATCH',
    body: { correo_institucional: correo },
  })