import { useSyncExternalStore } from 'react'

// Carrito del alumno (#166). Vive solo en el cliente hasta que se confirma el pedido y se guarda
// en localStorage para que no se pierda al cerrar la pestaña.
// totalLocal es solo para mostrar: el total real lo calcula el servidor (calcularTotal, #49).

const CLAVE_CARRITO = 'carritoUasnack'

// El carrito vive fuera de React (como almacenSesion.js): todas las pantallas que usan
// useCarrito leen la misma copia y se enteran al instante de cada cambio.
const suscriptores = new Set()
let lineas = leerLineas()

function leerLineas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? []
  } catch {
    // Modo privado o JSON corrupto: se empieza con el carrito vacío.
    return []
  }
}

function guardarLineas(nuevas) {
  lineas = nuevas
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(nuevas))
  } catch {
    // Sin almacenamiento, el carrito dura solo mientras la pestaña esté abierta.
  }
  suscriptores.forEach((avisar) => avisar())
}

function suscribir(avisar) {
  suscriptores.add(avisar)
  return () => suscriptores.delete(avisar)
}

// Mismo producto con los mismos extras y quitables = misma línea (solo se suma la cantidad).
function claveDeLinea(idProducto, extras, quitables) {
  // sort() sin comparador ordena como texto: sirve igual si los ids son números o texto.
  const ids = (lista) =>
    lista
      .map((opcion) => opcion.id)
      .sort()
      .join(',')
  return `${idProducto}|${ids(extras)}|${ids(quitables)}`
}

export function useCarrito() {
  const lineasActuales = useSyncExternalStore(suscribir, () => lineas)

  // producto: lo que devuelve GET /productos/{id}. El precio de Laravel llega como texto ("25.00").
  function agregar(producto, { cantidad = 1, extras = [], quitables = [] } = {}) {
    const clave = claveDeLinea(producto.id, extras, quitables)
    const existente = lineas.find((linea) => linea.clave === clave)

    if (existente) {
      guardarLineas(
        lineas.map((linea) =>
          linea.clave === clave ? { ...linea, cantidad: linea.cantidad + cantidad } : linea
        )
      )
      return
    }

    guardarLineas([
      ...lineas,
      {
        clave,
        id_producto: producto.id,
        id_tienda: producto.id_tienda,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad,
        extras,
        quitables,
      },
    ])
  }

  function quitar(clave) {
    guardarLineas(lineas.filter((linea) => linea.clave !== clave))
  }

  function vaciar() {
    guardarLineas([])
  }

  // Cambia la cantidad de una línea (pantalla de Carrito, #168). 0 o menos la quita, igual que
  // cambiarCantidad en Android. No revisa existencias: pueden haber cambiado desde el catálogo,
  // y el servidor las revisa al crear el pedido.
  function cambiarCantidad(clave, cantidad) {
    if (cantidad <= 0) {
      quitar(clave)
      return
    }
    guardarLineas(lineas.map((linea) => (linea.clave === clave ? { ...linea, cantidad } : linea)))
  }

  const totalLocal = lineasActuales.reduce((total, linea) => {
    const precioExtras = linea.extras.reduce((suma, extra) => suma + Number(extra.precio ?? 0), 0)
    return total + (linea.precio + precioExtras) * linea.cantidad
  }, 0)

  return { lineas: lineasActuales, agregar, quitar, vaciar, cambiarCantidad, totalLocal }
}
