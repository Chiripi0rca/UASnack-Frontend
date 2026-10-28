// Nombres de las categorías por id (tabla "categorias").
// TEMPORAL: el backend todavía no tiene GET /categorias. Cuando exista, esto se cambia por un hook
// y se borra este archivo. Los ids tienen que coincidir con los de la base.
export const NOMBRES_CATEGORIA = {
  1: 'Bebidas',
  2: 'Botanas',
  3: 'Dulces',
  4: 'Comida rápida',
}

export function nombreCategoria(idCategoria) {
  return NOMBRES_CATEGORIA[idCategoria] ?? 'Otros'
}

// #237: categorías cuyos productos casi siempre se cocinan. Solo es el valor inicial de la casilla
// "Se prepara al momento" al crear un producto: el encargado la cambia si vende, por ejemplo, café.
const CATEGORIAS_QUE_SE_PREPARAN = new Set([4]) // Comida rápida

export function sePreparaPorDefecto(idCategoria) {
  return CATEGORIAS_QUE_SE_PREPARAN.has(Number(idCategoria))
}
