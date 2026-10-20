import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { actualizarTienda, CLAVE_TIENDAS, obtenerTiendas } from '../api/tiendasAdmin.js'
import FormularioTienda from './FormularioTienda.jsx'
import SelectorEncargado from './SelectorEncargado.jsx'
import './Tiendas.css'

// Vista "Tiendas" del administrador (#103). GET /admin/tiendas.
// - Lista las tiendas de su facultad, activas y de baja.
// - Alta y edición en el formulario; baja y reactivación en la misma fila.
// - Asignar o cambiar el encargado por correo con el selector (#164).
// - La administración NO ve ventas ni demanda: aquí solo hay datos de operación.
// Clave de caché: CLAVE_TIENDAS = ['admin', 'tiendas'] (general → particular).

export default function Tiendas() {
  const consulta = useQuery({ queryKey: CLAVE_TIENDAS, queryFn: obtenerTiendas })
  const tiendas = consulta.data?.datos
  // null = cerrado · { tienda: null } = nueva · { tienda } = editar
  const [formulario, setFormulario] = useState(null)
  // Tienda a la que se le está eligiendo encargado, o null. Solo un panel abierto a la vez.
  const [selector, setSelector] = useState(null)

  function abrirFormulario(tienda) {
    setSelector(null)
    setFormulario({ tienda })
  }

  function abrirSelector(tienda) {
    setFormulario(null)
    setSelector(tienda)
  }

  return (
    <section>
      <div className="tiendas__encabezado">
        <h1>Tiendas</h1>
        <button type="button" className="boton-texto" onClick={() => abrirFormulario(null)}>
          + Nueva tienda
        </button>
      </div>

      {/* key: al cambiar de tienda el formulario arranca de cero con sus datos */}
      {formulario && (
        <FormularioTienda
          key={formulario.tienda?.id ?? 'nueva'}
          tienda={formulario.tienda}
          alCerrar={() => setFormulario(null)}
        />
      )}

      {selector && (
        <SelectorEncargado key={selector.id} tienda={selector} alCerrar={() => setSelector(null)} />
      )}

      {consulta.isPending && <EstadoCarga mensaje="Cargando tiendas…" />}
      {consulta.isError && <EstadoError error={consulta.error} alReintentar={consulta.refetch} />}
      {consulta.isSuccess && !tiendas.length && (
        <EstadoVacio titulo="Sin tiendas" mensaje="Da de alta la primera con “Nueva tienda”." />
      )}

      {!!tiendas?.length && (
        <table className="tiendas__tabla">
          <thead>
            <tr>
              <th>Tienda</th>
              <th>Horario</th>
              <th>Encargado</th>
              <th>Estado</th>
              <th>
                <span className="solo-lector">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tiendas.map((tienda) => (
              <FilaTienda
                key={tienda.id}
                tienda={tienda}
                alEditar={() => abrirFormulario(tienda)}
                alAsignar={() => abrirSelector(tienda)}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function FilaTienda({ tienda, alEditar, alAsignar }) {
  const clienteQuery = useQueryClient()

  // Dar de baja o reactivar. Se refresca la lista desde el servidor: nunca se muestra
  // un estado que él no confirmó.
  const cambiarEstado = useMutation({
    mutationFn: () => actualizarTienda(tienda.id, { activa: !tienda.activa }),
    onSuccess: () => clienteQuery.invalidateQueries({ queryKey: CLAVE_TIENDAS }),
  })

  function alternar() {
    // Dar de baja la saca del catálogo de los alumnos: se confirma antes.
    if (
      tienda.activa &&
      !window.confirm(`¿Dar de baja “${tienda.nombre}”? Dejará de verse en la app.`)
    ) {
      return
    }
    cambiarEstado.mutate()
  }

  return (
    <tr className={tienda.activa ? 'fila-tienda' : 'fila-tienda fila-tienda--baja'}>
      <td>
        <span className="fila-tienda__nombre">{tienda.nombre}</span>
        <span className="fila-tienda__detalle">{tienda.ubicacion}</span>
      </td>
      <td className="mono">
        {tienda.horario_apertura}–{tienda.horario_cierre}
      </td>
      <td>
        {tienda.encargado ? (
          <>
            <span>{tienda.encargado.nombre}</span>
            <span className="fila-tienda__detalle">{tienda.encargado.correo}</span>
          </>
        ) : (
          <span className="fila-tienda__sin-asignar">Sin asignar</span>
        )}
      </td>
      <td>
        <span className={tienda.activa ? 'etiqueta etiqueta--activa' : 'etiqueta etiqueta--baja'}>
          {tienda.activa ? 'Activa' : 'De baja'}
        </span>
      </td>
      <td>
        <div className="fila-tienda__acciones">
          <button type="button" className="boton-texto" onClick={alEditar}>
            Editar
          </button>
          <button type="button" className="boton-texto" onClick={alAsignar}>
            {tienda.encargado ? 'Cambiar encargado' : 'Asignar encargado'}
          </button>
          <button
            type="button"
            className="boton-texto"
            disabled={cambiarEstado.isPending}
            onClick={alternar}
          >
            {cambiarEstado.isPending ? 'Guardando…' : tienda.activa ? 'Dar de baja' : 'Reactivar'}
          </button>
        </div>
        {cambiarEstado.isError && (
          <span className="fila-tienda__error">{cambiarEstado.error.mensaje}</span>
        )}
      </td>
    </tr>
  )
}