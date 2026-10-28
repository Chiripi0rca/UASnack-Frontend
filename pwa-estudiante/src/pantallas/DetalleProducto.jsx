import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import ChipOpcion from '@shared/componentes/ChipOpcion.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import { formatearPrecio } from '@shared/utilidades/formatearPrecio.js'
import { useCarrito } from '../hooks/useCarrito.js'
import { useProducto } from '../hooks/useProducto.js'
import './DetalleProducto.css'

// Pantalla 6 · Detalle de producto (#50). GET /productos/{id}.
// El importe del botón se recalcula con cada extra y cada unidad. Es SOLO para mostrar:
// el total que se cobra lo calcula el servidor (#49).
export default function DetalleProducto() {
  const { idProducto } = useParams()
  const navegar = useNavigate()
  const { datos: producto, cargando, error, reintentar } = useProducto(idProducto)
  const { lineas, agregar, vaciar } = useCarrito()

  // Ids de las opciones elegidas
  const [extrasElegidos, setExtrasElegidos] = useState([])
  const [quitablesElegidos, setQuitablesElegidos] = useState([])
  const [cantidad, setCantidad] = useState(1)
  // true cuando el carrito trae productos de otra tienda y hay que preguntar si se vacía
  const [preguntarVaciar, setPreguntarVaciar] = useState(false)

  if (cargando) {
    return (
      <main className="pantalla">
        <EstadoCarga />
      </main>
    )
  }
  if (error) {
    return (
      <main className="pantalla">
        <EstadoError error={error} alReintentar={reintentar} />
      </main>
    )
  }

  // personalizaciones: [{ tipo: 'extras', opciones: [...] }, { tipo: 'quitables', opciones: [...] }]
  const opcionesDe = (tipo) =>
    producto.personalizaciones?.find((grupo) => grupo.tipo === tipo)?.opciones ?? []
  const extras = opcionesDe('extras')
  const quitables = opcionesDe('quitables')

  // Existencias: no se puede pedir más de stock_hoy contando lo que ya está en el carrito
  // (con y sin extras es el mismo stock). Igual que CarritoRepository en Android.
  const yaEnCarrito = lineas
    .filter((linea) => linea.id_producto === producto.id)
    .reduce((suma, linea) => suma + linea.cantidad, 0)
  const disponibles = Math.max(0, producto.stock_hoy - yaEnCarrito)
  const puedeAgregar = !producto.agotado && disponibles > 0 && cantidad <= disponibles

  // Importe para mostrar: (precio + extras elegidos) × cantidad
  const precioExtras = extras
    .filter((extra) => extrasElegidos.includes(extra.id))
    .reduce((suma, extra) => suma + Number(extra.precio ?? 0), 0)
  const importe = (Number(producto.precio) + precioExtras) * cantidad

  // Prende o apaga un id dentro de la lista de elegidos
  function alternar(setLista, id) {
    setLista((lista) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]))
  }

  // Un carrito es de UNA tienda. Si ya tiene de otra, se pregunta antes de vaciarlo.
  const carritoDeOtraTienda = lineas.length > 0 && lineas[0].id_tienda !== producto.id_tienda

  function agregarAlCarrito() {
    if (carritoDeOtraTienda) {
      setPreguntarVaciar(true)
      return
    }
    confirmarAgregar()
  }

  function confirmarAgregar() {
    agregar(producto, {
      cantidad,
      // Se guardan las opciones completas (id, nombre, precio) para mostrarlas en el carrito
      extras: extras.filter((extra) => extrasElegidos.includes(extra.id)),
      quitables: quitables.filter((quitable) => quitablesElegidos.includes(quitable.id)),
    })
    navegar(-1) // regresa al catálogo
  }

  // vaciar() y agregar() guardan al momento (fuera de React), así que el orden se respeta
  function vaciarYAgregar() {
    vaciar()
    confirmarAgregar()
  }

  return (
    <main className="pantalla detalle">
      <button type="button" className="boton-texto detalle__volver" onClick={() => navegar(-1)}>
        ← Volver
      </button>

      {producto.foto_url && <img className="detalle__foto" src={producto.foto_url} alt="" />}
      <h1>{producto.nombre}</h1>
      {producto.descripcion && <p className="detalle__descripcion">{producto.descripcion}</p>}
      <p className="detalle__precio mono">{formatearPrecio(producto.precio)}</p>
      {/* Rango de preparación tal como lo manda el servidor: nunca un tiempo fijo.
          #237: lo que no se cocina (se_prepara = false) no muestra tiempo. */}
      {producto.se_prepara !== false && producto.tiempo_prep_min > 0 && (
        <p className="detalle__descripcion">
          Preparación:{' '}
          <span className="mono">
            {producto.tiempo_prep_min}–{producto.tiempo_prep_max} min
          </span>
        </p>
      )}

      {extras.length > 0 && (
        <section className="detalle__grupo">
          <h2>Extras</h2>
          <div className="detalle__chips">
            {extras.map((extra) => (
              <ChipOpcion
                key={extra.id}
                texto={extra.nombre}
                detalle={`+${formatearPrecio(extra.precio)}`}
                activo={extrasElegidos.includes(extra.id)}
                onClick={() => alternar(setExtrasElegidos, extra.id)}
              />
            ))}
          </div>
        </section>
      )}

      {quitables.length > 0 && (
        <section className="detalle__grupo">
          <h2>Quitar</h2>
          <div className="detalle__chips">
            {quitables.map((quitable) => (
              <ChipOpcion
                key={quitable.id}
                texto={`Sin ${quitable.nombre.toLowerCase()}`}
                activo={quitablesElegidos.includes(quitable.id)}
                onClick={() => alternar(setQuitablesElegidos, quitable.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Cantidad: entre 1 y las unidades disponibles */}
      <div className="detalle__cantidad">
        <button
          type="button"
          aria-label="Quitar una"
          disabled={cantidad <= 1}
          onClick={() => setCantidad((c) => c - 1)}
        >
          −
        </button>
        <span className="mono" aria-live="polite">
          {cantidad}
        </span>
        <button
          type="button"
          aria-label="Agregar una"
          disabled={cantidad >= disponibles}
          onClick={() => setCantidad((c) => c + 1)}
        >
          +
        </button>
      </div>

      {!puedeAgregar && (
        <p className="error-general">
          {producto.agotado
            ? 'Este producto está agotado.'
            : 'Ya tienes en el carrito todas las unidades disponibles.'}
        </p>
      )}

      {/* Aviso de "otra tienda": vaciar y agregar, o cancelar */}
      {preguntarVaciar && (
        <div className="detalle__aviso" role="alertdialog" aria-label="Carrito de otra tienda">
          <p>Tu carrito tiene productos de otra tienda. ¿Lo vacías para agregar este?</p>
          <div className="detalle__aviso-acciones">
            <button type="button" className="boton-texto" onClick={() => setPreguntarVaciar(false)}>
              Cancelar
            </button>
            <button type="button" className="boton-texto" onClick={vaciarYAgregar}>
              Vaciar y agregar
            </button>
          </div>
        </div>
      )}

      <BotonPrincipal
        texto="Agregar al carrito"
        importe={formatearPrecio(importe)}
        disabled={!puedeAgregar}
        onClick={agregarAlCarrito}
      />
    </main>
  )
}
