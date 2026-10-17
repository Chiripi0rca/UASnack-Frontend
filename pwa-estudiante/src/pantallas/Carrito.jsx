import { Link, useNavigate } from 'react-router-dom'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { formatearPrecio } from '@shared/utilidades/formatearPrecio.js'
import { useCarrito } from '../hooks/useCarrito.js'
import './Carrito.css'

// Pantalla 7 · Carrito (#168). Solo local (localStorage), sin llamadas a la API.
// Al quitar la ÚLTIMA línea regresa al catálogo de esa tienda.
// totalLocal es solo para mostrar; el cobro real lo calcula el servidor (#49).
export default function Carrito() {
  const navegar = useNavigate()
  const { lineas, quitar, cambiarCantidad, totalLocal } = useCarrito()

  // Entrar con el carrito vacío (por ejemplo, escribiendo la URL)
  if (!lineas.length) {
    return (
      <main className="pantalla">
        <h1>Carrito</h1>
        <EstadoVacio titulo="Tu carrito está vacío" mensaje="Agrega productos desde una tienda.">
          <Link to="/tiendas">Ver tiendas</Link>
        </EstadoVacio>
      </main>
    )
  }

  const idTienda = lineas[0].id_tienda

  // Si el cambio deja el carrito vacío, regresa al catálogo de la tienda
  function regresarSiQuedaVacio(clave, nuevaCantidad) {
    const eraLaUltima = lineas.length === 1 && lineas[0].clave === clave
    if (eraLaUltima && nuevaCantidad <= 0) navegar(`/tiendas/${idTienda}`, { replace: true })
  }

  function cambiar(linea, nuevaCantidad) {
    cambiarCantidad(linea.clave, nuevaCantidad)
    regresarSiQuedaVacio(linea.clave, nuevaCantidad)
  }

  function quitarLinea(linea) {
    quitar(linea.clave)
    regresarSiQuedaVacio(linea.clave, 0)
  }

  return (
    <main className="pantalla">
      <h1>Carrito</h1>

      <ul className="carrito__lista">
        {lineas.map((linea) => {
          // Subtotal de la línea, solo para mostrar
          const precioExtras = linea.extras.reduce((suma, extra) => suma + Number(extra.precio ?? 0), 0)
          const subtotal = (linea.precio + precioExtras) * linea.cantidad
          // Extras y quitables en una sola línea de texto: "Queso extra · Sin cebolla"
          const opciones = [
            ...linea.extras.map((extra) => extra.nombre),
            ...linea.quitables.map((quitable) => `Sin ${quitable.nombre.toLowerCase()}`),
          ]

          return (
            <li key={linea.clave} className="carrito__linea">
              <div className="carrito__info">
                <span className="carrito__nombre">{linea.nombre}</span>
                {opciones.length > 0 && <span className="carrito__opciones">{opciones.join(' · ')}</span>}
                <span className="mono">{formatearPrecio(subtotal)}</span>
              </div>

              <div className="carrito__acciones">
                <button
                  type="button"
                  aria-label={`Quitar una de ${linea.nombre}`}
                  onClick={() => cambiar(linea, linea.cantidad - 1)}
                >
                  −
                </button>
                <span className="mono">{linea.cantidad}</span>
                <button
                  type="button"
                  aria-label={`Agregar una de ${linea.nombre}`}
                  onClick={() => cambiar(linea, linea.cantidad + 1)}
                >
                  +
                </button>
                <button type="button" className="boton-texto carrito__quitar" onClick={() => quitarLinea(linea)}>
                  Quitar
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <Link className="carrito__seguir" to={`/tiendas/${idTienda}`}>
        Agregar más productos
      </Link>

      {/* "Continuar" lleva a Elección de retiro (pantalla 8), que aún no existe:
          queda deshabilitado hasta esa tarea. */}
      <BotonPrincipal texto="Continuar" importe={formatearPrecio(totalLocal)} disabled />
    </main>
  )
}
