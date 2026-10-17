import { Link } from 'react-router-dom'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { useTiendas } from '../hooks/useTiendas.js'
import './Tiendas.css'

// Pantalla 4 · Tiendas (#47). GET /tiendas.
// El servidor ya manda primero las de la facultad del alumno (es_mi_facultad = true);
// aquí solo se separan en dos bloques. Una tienda cerrada se ve atenuada y no se puede tocar.
// "Repetir último pedido" llega cuando exista GET /pedidos.
export default function Tiendas() {
  const { datos: tiendas, cargando, error, reintentar } = useTiendas()

  // Los tres estados de la Definición de Terminado: cargando, error y vacío
  if (cargando) {
    return (
      <main className="pantalla">
        <EstadoCarga mensaje="Cargando tiendas…" />
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
  if (!tiendas?.length) {
    return (
      <main className="pantalla">
        <EstadoVacio titulo="No hay tiendas" mensaje="Todavía no hay tiendas disponibles." />
      </main>
    )
  }

  const deMiFacultad = tiendas.filter((tienda) => tienda.es_mi_facultad)
  const otras = tiendas.filter((tienda) => !tienda.es_mi_facultad)

  return (
    <main className="pantalla">
      <h1>Tiendas</h1>
      <BloqueTiendas titulo="Tu facultad" tiendas={deMiFacultad} />
      <BloqueTiendas titulo="Otras facultades" tiendas={otras} />
    </main>
  )
}

// Un bloque con título. Si no tiene tiendas no se dibuja nada.
function BloqueTiendas({ titulo, tiendas }) {
  if (!tiendas.length) return null
  return (
    <section className="tiendas__bloque">
      <h2 className="tiendas__titulo">{titulo}</h2>
      <ul className="tiendas__lista">
        {tiendas.map((tienda) => (
          <li key={tienda.id}>
            <TarjetaTienda tienda={tienda} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TarjetaTienda({ tienda }) {
  const contenido = (
    <>
      <span className="tarjeta-tienda__nombre">{tienda.nombre}</span>
      {tienda.ubicacion && <span className="tarjeta-tienda__detalle">{tienda.ubicacion}</span>}
      <span className="tarjeta-tienda__detalle">
        {tienda.abierta ? 'Abierta' : 'Cerrada'} ·{' '}
        <span className="mono">
          {tienda.horario_apertura}–{tienda.horario_cierre}
        </span>
      </span>
    </>
  )

  // Cerrada: un div sin enlace (no se puede tocar) y atenuado con la clase --cerrada
  if (!tienda.abierta) {
    return (
      <div className="tarjeta-tienda tarjeta-tienda--cerrada" aria-disabled="true">
        {contenido}
      </div>
    )
  }

  return (
    <Link className="tarjeta-tienda" to={`/tiendas/${tienda.id}`}>
      {contenido}
    </Link>
  )
}
