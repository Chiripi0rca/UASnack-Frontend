import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nombreCategoria } from '@shared/catalogo/categorias.js'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { formatearPrecio } from '@shared/utilidades/formatearPrecio.js'
import { actualizarStock, obtenerProductos } from '../api/productos.js'
import FormularioProducto from './FormularioProducto.jsx'
import './CatalogoStock.css'

// Vista "Catálogo y stock" (#100). GET /tienda/productos.
// - Existencias bajas en ámbar, cero en rojo.
// - El stock se ajusta en la misma fila; nombre, precio, etc. se editan en el formulario.
// Clave de caché: ['tienda', 'productos'] (general → particular).
const CLAVE = ['tienda', 'productos']

// Desde cuántas unidades se considera "stock bajo". Es solo visual.
const STOCK_BAJO = 5

export default function CatalogoStock() {
  const consulta = useQuery({ queryKey: CLAVE, queryFn: obtenerProductos })
  const productos = consulta.data?.datos
  // null = cerrado · { producto: null } = nuevo · { producto } = editar
  const [formulario, setFormulario] = useState(null)

  return (
    <section>
      <div className="catalogo-stock__encabezado">
        <h1>Catálogo y stock</h1>
        <button type="button" className="boton-texto" onClick={() => setFormulario({ producto: null })}>
          + Nuevo producto
        </button>
      </div>

      {/* key: al cambiar de producto el formulario arranca de cero con sus datos */}
      {formulario && (
        <FormularioProducto
          key={formulario.producto?.id ?? 'nuevo'}
          producto={formulario.producto}
          alCerrar={() => setFormulario(null)}
        />
      )}

      {consulta.isPending && <EstadoCarga mensaje="Cargando productos…" />}
      {consulta.isError && <EstadoError error={consulta.error} alReintentar={consulta.refetch} />}
      {consulta.isSuccess && !productos.length && (
        <EstadoVacio titulo="Sin productos" mensaje="Agrega el primero con “Nuevo producto”." />
      )}

      {!!productos?.length && (
        <table className="catalogo-stock__tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock de hoy</th>
              <th>
                <span className="solo-lector">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              // key con el stock: si el servidor cambia el stock, la fila arranca con el valor nuevo
              <FilaProducto
                key={`${producto.id}-${producto.stock_hoy}`}
                producto={producto}
                alEditar={() => setFormulario({ producto })}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

// Una fila con su propio campo de stock. Se guarda con el botón o con Enter.
function FilaProducto({ producto, alEditar }) {
  const clienteQuery = useQueryClient()
  const [stock, setStock] = useState(String(producto.stock_hoy))

  const guardar = useMutation({
    mutationFn: () => actualizarStock(producto.id, Number(stock)),
    // Se refresca la lista desde el servidor: la pantalla nunca muestra algo que él no confirmó
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: CLAVE }),
  })

  const cambiado = stock !== String(producto.stock_hoy)
  // El color sigue lo que guardó el servidor, no lo que se está escribiendo
  const nivel = producto.stock_hoy === 0 ? 'cero' : producto.stock_hoy <= STOCK_BAJO ? 'bajo' : 'ok'

  function enviar(e) {
    e.preventDefault()
    if (cambiado && !guardar.isPending) guardar.mutate()
  }

  return (
    <tr className={`fila-producto fila-producto--${nivel}`}>
      <td>{producto.nombre}</td>
      <td>{nombreCategoria(producto.id_categoria)}</td>
      <td className="mono">{formatearPrecio(producto.precio)}</td>
      <td>
        {/* noValidate: el mensaje de error lo da el servidor, no el globito del navegador */}
        <form className="fila-producto__stock" noValidate onSubmit={enviar}>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            aria-label={`Stock de ${producto.nombre}`}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <button type="submit" className="boton-texto" disabled={!cambiado || guardar.isPending}>
            {guardar.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
        {/* Mensaje del servidor si algo falla: el del campo (p. ej. stock negativo) o el general */}
        {guardar.isError && (
          <span className="fila-producto__error">
            {guardar.error.campos?.stock_hoy?.[0] ?? guardar.error.mensaje}
          </span>
        )}
      </td>
      <td>
        <button type="button" className="boton-texto" onClick={alEditar}>
          Editar
        </button>
      </td>
    </tr>
  )
}
