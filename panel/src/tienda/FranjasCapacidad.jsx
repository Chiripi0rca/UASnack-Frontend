import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import ChipOpcion from '@shared/componentes/ChipOpcion.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { actualizarCapacidad, obtenerCapacidad } from '../api/capacidad.js'
import './FranjasCapacidad.css'

// Vista "Franjas y capacidad" (#107). GET y PUT /tienda/capacidad (#106).
// Al dueño no se le piden minutos: se le pregunta cuántas piezas alcanza a preparar en cada franja,
// y el servidor las convierte a minutos de cocina. Aquí solo se muestra lo que él confirma:
// los minutos de cada franja son los GUARDADOS, el cliente no hace la conversión (README: el cliente no calcula).
// Clave de caché: ['tienda', 'capacidad'] (general → particular).
const CLAVE = ['tienda', 'capacidad']

// El índice es dia_semana, igual que Carbon::dayOfWeek en el backend: 0 = domingo.
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Mismo tope que el servidor (ActualizarCapacidadRequest). Solo para avisar antes de enviar:
// el mensaje de error de verdad lo da el servidor.
const MAXIMO_PIEZAS = 500

const llave = (franja) => `${franja.dia_semana}|${franja.hora_inicio}`
const esPiezas = (texto) => /^\d+$/.test(texto) && Number(texto) <= MAXIMO_PIEZAS

// Regresa una copia de "cambios" con la franja puesta en "texto".
// Si el texto es igual a lo guardado, deja de contar como cambio.
function ponerCambio(cambios, franja, texto) {
  const nuevo = { ...cambios }
  if (texto === String(franja.piezas)) delete nuevo[llave(franja)]
  else nuevo[llave(franja)] = texto
  return nuevo
}

export default function FranjasCapacidad() {
  const clienteQuery = useQueryClient()
  const consulta = useQuery({ queryKey: CLAVE, queryFn: obtenerCapacidad })
  const franjas = consulta.data?.datos ?? []
  const minutosPorPieza = consulta.data?.meta?.minutos_por_pieza ?? null

  // Lo que el dueño ha escrito y todavía no guarda: { '1|11:00': '5' }. Los inputs manejan texto.
  const [cambios, setCambios] = useState({})
  const [diaElegido, setDiaElegido] = useState(null)
  const [paraTodas, setParaTodas] = useState('')

  // Solo salen los días en que la tienda tiene franjas
  const dias = [...new Set(franjas.map((f) => f.dia_semana))].sort((a, b) => a - b)
  const dia = dias.includes(diaElegido) ? diaElegido : dias[0]
  const delDia = franjas.filter((f) => f.dia_semana === dia)

  // Sin productos que se cocinen no hay con qué medir una pieza: se muestra pero no se edita
  const puedeEditar = minutosPorPieza !== null
  const totalCambios = Object.keys(cambios).length
  const hayInvalidos = Object.values(cambios).some((texto) => !esPiezas(texto))

  const guardar = useMutation({
    // Solo se mandan las franjas que cambiaron
    mutationFn: () =>
      actualizarCapacidad(
        Object.entries(cambios).map(([clave, piezas]) => {
          const [diaSemana, horaInicio] = clave.split('|')
          return { dia_semana: Number(diaSemana), hora_inicio: horaInicio, piezas: Number(piezas) }
        })
      ),
    // El PUT responde con lo guardado, en la misma forma que el GET: la pantalla muestra
    // lo que el servidor confirmó, no lo que se escribió.
    onSuccess: (respuesta) => {
      clienteQuery.setQueryData(CLAVE, respuesta)
      setCambios({})
    },
  })

  function aplicarATodoElDia() {
    if (!esPiezas(paraTodas)) return
    setCambios((actual) =>
      delDia.reduce((acumulado, f) => ponerCambio(acumulado, f, paraTodas), actual)
    )
  }

  // El servidor da el mensaje; si además marca un campo (por ejemplo una hora que no es franja), se agrega
  const errorGuardar = guardar.error
  const detalleError = errorGuardar ? Object.values(errorGuardar.campos ?? {})[0]?.[0] : null

  return (
    <section>
      <h1>Franjas y capacidad</h1>
      <p className="franjas-capacidad__ayuda">
        ¿Cuántas piezas alcanzas a preparar en cada franja? Es lo que cabe en tu cocina mientras
        atiendes también a quien llega al mostrador.
      </p>

      {consulta.isPending && <EstadoCarga mensaje="Cargando capacidad…" />}
      {consulta.isError && (
        <EstadoError
          error={consulta.error}
          alReintentar={consulta.refetch}
          reintentando={consulta.isFetching}
        />
      )}
      {consulta.isSuccess && !franjas.length && (
        <EstadoVacio
          titulo="Sin capacidad configurada"
          mensaje="Tu tienda todavía no tiene capacidad registrada por franja."
        />
      )}

      {consulta.isSuccess && !!franjas.length && (
        <>
          {puedeEditar ? (
            <p className="franjas-capacidad__equivalencia">
              1 pieza equivale a <span className="mono">{minutosPorPieza}</span> min de cocina, el
              promedio de tus productos que se preparan.
            </p>
          ) : (
            <p className="error-general">
              Aún no tienes productos que se preparen. Agrégalos en “Catálogo y stock” para poder
              medir tu capacidad en piezas.
            </p>
          )}

          <div className="franjas-capacidad__dias" role="group" aria-label="Día de la semana">
            {dias.map((numero) => {
              const sinGuardar = Object.keys(cambios).filter((c) =>
                c.startsWith(`${numero}|`)
              ).length
              return (
                <ChipOpcion
                  key={numero}
                  texto={DIAS[numero]}
                  detalle={sinGuardar ? `${sinGuardar} sin guardar` : undefined}
                  activo={numero === dia}
                  onClick={() => setDiaElegido(numero)}
                />
              )
            })}
          </div>

          {puedeEditar && (
            <form
              className="franjas-capacidad__todas"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                aplicarATodoElDia()
              }}
            >
              <label htmlFor="piezas-todas">
                Mismas piezas en todo el {DIAS[dia].toLowerCase()}
              </label>
              <input
                id="piezas-todas"
                type="number"
                min="0"
                max={MAXIMO_PIEZAS}
                inputMode="numeric"
                value={paraTodas}
                onChange={(e) => setParaTodas(e.target.value)}
              />
              <button type="submit" className="boton-texto" disabled={!esPiezas(paraTodas)}>
                Aplicar
              </button>
            </form>
          )}

          <table className="franjas-capacidad__tabla">
            <thead>
              <tr>
                <th>Franja</th>
                <th>Piezas</th>
                <th>Minutos de cocina guardados</th>
              </tr>
            </thead>
            <tbody>
              {delDia.map((franja) => {
                const clave = llave(franja)
                const cambiada = clave in cambios
                const texto = cambios[clave] ?? String(franja.piezas ?? '')
                return (
                  <tr
                    key={clave}
                    className={cambiada ? 'fila-franja fila-franja--cambiada' : 'fila-franja'}
                  >
                    <td className="mono">
                      {franja.hora_inicio}–{franja.hora_fin}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={MAXIMO_PIEZAS}
                        inputMode="numeric"
                        disabled={!puedeEditar}
                        aria-label={`Piezas de la franja ${franja.hora_inicio} a ${franja.hora_fin}`}
                        aria-invalid={cambiada && !esPiezas(texto)}
                        value={texto}
                        onChange={(e) =>
                          setCambios((actual) => ponerCambio(actual, franja, e.target.value))
                        }
                      />
                    </td>
                    <td className="mono">{franja.minutos_cocina} min</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {hayInvalidos && (
            <p className="error-general">
              Escribe las piezas como número entero, de 0 a {MAXIMO_PIEZAS}.
            </p>
          )}
          {guardar.isError && (
            <p className="error-general" role="alert">
              {errorGuardar.mensaje}
              {detalleError ? ` ${detalleError}` : ''}
            </p>
          )}

          <div className="franjas-capacidad__acciones">
            <button
              type="button"
              className="boton-texto"
              disabled={!totalCambios || guardar.isPending}
              onClick={() => {
                setCambios({})
                guardar.reset()
              }}
            >
              Descartar cambios
            </button>
            <BotonPrincipal
              texto={
                totalCambios
                  ? `Guardar ${totalCambios} cambio${totalCambios === 1 ? '' : 's'}`
                  : 'Guardar'
              }
              cargando={guardar.isPending}
              disabled={!totalCambios || hayInvalidos}
              onClick={() => guardar.mutate()}
            />
          </div>
        </>
      )}
    </section>
  )
}
