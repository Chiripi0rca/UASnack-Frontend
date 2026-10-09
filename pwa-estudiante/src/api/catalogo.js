import { peticion } from '@shared/api/cliente.js'

// Catálogo del alumno. Las rutas las crea José Ángel en #46.
export const obtenerTiendas = () => peticion('/tiendas')

// El nombre del filtro (id_categoria) hay que confirmarlo con #46.
export const obtenerCatalogo = (idTienda, idCategoria) =>
  peticion(`/tiendas/${idTienda}/productos${idCategoria ? `?id_categoria=${idCategoria}` : ''}`)

export const obtenerProducto = (idProducto) => peticion(`/productos/${idProducto}`)