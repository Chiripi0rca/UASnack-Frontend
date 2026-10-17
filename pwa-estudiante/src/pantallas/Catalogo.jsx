import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { nombreCategoria } from '@shared/catalogo/categorias.js'
import ChipOpcion from '@shared/componentes/ChipOpcion.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { formatearPrecio } from '@shared/utilidades/formatearPrecio.js'
import { useCarrito } from '../hooks/useCarrito.js'
import { useCatalogo } from '../hooks/useCatalogo.js'
import { useTiendas } from '../hooks/useTiendas.js'
import './Catalogo.css'

// Pantalla 5 · Catálogo (#47). GET /tiendas/{id}/productos?id_categoria=
// Un producto agotado se ve al 45 %, con su etiqueta, y no abre. NUNCA se oculta.
export default function Catalogo() {
  const { idTienda } = useParams()
  // null = "Todo"
  const [idCategoria, setIdCategoria] = useState(null)

  // Lista filtrada (el servidor filtra) y lista completa (para saber qué chips de categoría mostrar).
  // TanStack Query guarda cada una en caché aparte: cambiar de chip la segunda vez es instantáneo.
  const { datos: productos, cargando, error, reintentar } = useCatalogo(idTienda, idCategoria)
  const { datos: todos } = useCatalogo(idTienda)

  // El nombre de la tienda sale de la caché de GET /tiendas (ya se cargó en la pantalla anterior)
  const { datos: tiendas } = useTiendas()
  const tienda = tiendas?.find((t) => String(t.id) === idTienda)

  // Cuántos artículos hay en el carrito, para el botón "Ver carrito" (#168)
  const { lineas } = useCarrito()
  const articulos = lineas.reduce((suma, linea) => suma + linea.cantidad, 0)

  // Solo las categorías que de verdad tiene esta tienda
  const categorias = [...new Set((todos ?? []).map((p) => p.id_categoria))].sort((a, b) => a - b)

  return (
    <main className="pantalla">
      <Link className="catalogo__volver" to="/tiendas">
        ← Tiendas
      </Link>
      <h1>{tienda?.nombre ?? 'Catálogo'}</h1>

      {/* Filtro por categoría. Chip activo = primary container (Anexo B), no solo un borde. */}
      {categorias.length > 1 && (
        <div className="catalogo__categorias" role="group" aria-label="Categorías">
          <ChipOpcion texto="Todo" activo={idCategoria === null} onClick={() => setIdCategoria(null)} />
          {categorias.map((id) => (
            <ChipOpcion
              key={id}
              texto={nombreCategoria(id)}
              activo={idCategoria === id}
              onClick={() => setIdCategoria(id)}
            />
          ))}
        </div>
      )}

      {cargando && <EstadoCarga mensaje="Cargando productos…" />}
      {error && <EstadoError error={error} alReintentar={reintentar} />}
      {!cargando && !error && !productos?.length && (
        <EstadoVacio titulo="Sin productos" mensaje="Esta tienda todavía no tiene productos aquí." />
      )}

      {!!productos?.length && (
        <ul className="catalogo__lista">
          {productos.map((producto) => (
            <li key={producto.id}>
              <TarjetaProducto producto={producto} />
            </li>
          ))}
        </ul>
      )}

      {/* Solo aparece si el carrito tiene algo */}
      {articulos > 0 && (
        <Link className="catalogo__ver-carrito" to="/carrito">
          Ver carrito · <span className="mono">{articulos}</span>
        </Link>
      )}
    </main>
  )
}

function TarjetaProducto({ producto }) {
  const contenido = (
    <>
      {producto.foto_url && (
        <img className="tarjeta-producto__foto" src={producto.foto_url} alt="" loading="lazy" />
      )}
      <span className="tarjeta-producto__info">
        <span className="tarjeta-producto__nombre">{producto.nombre}</span>
        {producto.descripcion && (
          <span className="tarjeta-producto__descripcion">{producto.descripcion}</span>
        )}
        <span className="tarjeta-producto__precio mono">{formatearPrecio(producto.precio)}</span>
      </span>
      {producto.agotado && <span className="tarjeta-producto__etiqueta">Agotado</span>}
    </>
  )

  // Agotado: se ve (al 45 %) pero no es enlace, así no abre el detalle
  if (producto.agotado) {
    return (
      <div className="tarjeta-producto tarjeta-producto--agotado" aria-disabled="true">
        {contenido}
      </div>
    )
  }
  return (
    <Link className="tarjeta-producto" to={`/productos/${producto.id}`}>
      {contenido}
    </Link>
  )
}
