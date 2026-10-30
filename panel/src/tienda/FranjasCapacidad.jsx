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
// Al dueño no se le piden minutos: se le pregunta cuántas personas cocinan en cada franja,
// y el servidor las convierte a minutos de cocina (personas × duración de la franja).
// Aquí solo se muestra lo que él confirma:
// los minutos de cada franja son los GUARDADOS, el cliente no hace la conversión (README: el cliente no calcula).
// Clave de caché: ['tienda', 'capacidad'] (general → particular).
const CLAVE = ['tienda', 'capacidad']

// El índice es dia_semana, igual que Carbon::dayOfWeek en el backend: 0 = domingo.
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Mismo tope que el servidor (ActualizarCapacidadRequest). Solo para avisar antes de enviar:
// el mensaje de error de verdad lo da el servidor.
const MAXIMO_PERSONAS = 20

const llave = (franja) => `${franja.dia_semana}|${franja.hora_inicio}`
const esPersonas = (texto) => /^\d+$/.test(texto) && Number(texto) <= MAXIMO_PERSONAS

// Regresa una copia de "cambios" con la franja puesta en "texto".
// Si el texto es igual a lo guardado, deja de contar como cambio.
function ponerCambio(cambios, franja, texto) {
  const nuevo = { ...cambios }
  if (texto === String(franja.personas)) delete nuevo[llave(franja)]
  else nuevo[llave(franja)] = texto
  return nuevo
}

export default function FranjasCapacidad() {
  const clienteQuery = useQueryClient()
  const consulta = useQuery({ queryKey: CLAVE, queryFn: obtenerCapacidad })
  const franjas = consulta.data?.datos ?? []
  const duracion = consulta.data?.meta?.duracion_franja_min ?? 10

  // Lo que el dueño ha escrito y todavía no guarda: { '1|11:00': '5' }. Los inputs manejan texto.
  const [cambios, setCambios] = useState({})
  const [diaElegido, setDiaElegido] = useState(null)
  const [paraTodas, setParaTodas] = useState('')

  // Solo salen los días en que la tienda tiene franjas
  const dias = [...new Set(franjas.map((f) => f.dia_semana))].sort((a, b) => a - b)
  const dia = dias.includes(diaElegido) ? diaElegido : dias[0]
  const delDia = franjas.filter((f) => f.dia_semana === dia)

  const totalCambios = Object.keys(cambios).length
  const hayInvalidos = Object.values(cambios).some((texto) => !esPersonas(texto))

  const guardar = useMutation({
    // Solo se mandan las franjas que cambiaron
    mutationFn: () =>
      actualizarCapacidad(
        Object.entries(cambios).map(([clave, personas]) => {
          const [diaSemana, horaInicio] = clave.split('|')
          return {
            dia_semana: Number(diaSemana),
            hora_inicio: horaInicio,
            personas: Number(personas),
          }
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
    if (!esPersonas(paraTodas)) return
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
        ¿Cuántas personas cocinan los pedidos de la app en cada franja? Si en la hora de la comida
        alguien se pasa a atender el mostrador, cuéntalo aquí.
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
          <p className="franjas-capacidad__equivalencia">
            Tus franjas duran <span className="mono">{duracion}</span> min: cada persona aporta{' '}
            <span className="mono">{duracion}</span> min de cocina en cada una.
          </p>

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

          <form
            className="franjas-capacidad__todas"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              aplicarATodoElDia()
            }}
          >
            <label htmlFor="personas-todas">
              Mismas personas en todo el {DIAS[dia].toLowerCase()}
            </label>
            <input
              id="personas-todas"
              type="number"
              min="0"
              max={MAXIMO_PERSONAS}
              inputMode="numeric"
              value={paraTodas}
              onChange={(e) => setParaTodas(e.target.value)}
            />
            <button type="submit" className="boton-texto" disabled={!esPersonas(paraTodas)}>
              Aplicar
            </button>
          </form>

          <table className="franjas-capacidad__tabla">
            <thead>
              <tr>
                <th>Franja</th>
                <th>Personas</th>
                <th>Minutos de cocina guardados</th>
              </tr>
            </thead>
            <tbody>
              {delDia.map((franja) => {
                const clave = llave(franja)
                const cambiada = clave in cambios
                const texto = cambios[clave] ?? String(franja.personas ?? '')
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
                        max={MAXIMO_PERSONAS}
                        inputMode="numeric"
                        aria-label={`Personas de la franja ${franja.hora_inicio} a ${franja.hora_fin}`}
                        aria-invalid={cambiada && !esPersonas(texto)}
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
              Escribe las personas como número entero, de 0 a {MAXIMO_PERSONAS}.
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
