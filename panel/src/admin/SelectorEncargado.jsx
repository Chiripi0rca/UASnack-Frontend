import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { asignarEncargado, buscarUsuario, CLAVE_TIENDAS } from '../api/tiendasAdmin.js'

// Selector de encargado (#164), parte de "Tiendas" (#103). Dos pasos:
//   1. "Correo del encargado" → GET /admin/usuarios/buscar: muestra QUIÉN es antes de guardar.
//   2. "Asignar" → PATCH /admin/tiendas/{id}/encargado.
// La persona tiene que haberse registrado antes en la app. Si no se puede (correo sin verificar,
// es admin, ya tiene otra tienda), el motivo lo da el servidor; aquí no se repiten sus reglas.
export default function SelectorEncargado({ tienda, alCerrar }) {
  const clienteQuery = useQueryClient()
  const [correo, setCorreo] = useState('')

  const buscar = useMutation({
    mutationFn: () => buscarUsuario(correo.trim(), tienda.id),
  })
  const candidato = buscar.data?.datos

  const asignar = useMutation({
    mutationFn: () => asignarEncargado(tienda.id, candidato.correo),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: CLAVE_TIENDAS })
      alCerrar()
    },
  })

  const yaEsElEncargado = candidato && tienda.encargado?.id === candidato.id

  function cambiarCorreo(e) {
    setCorreo(e.target.value)
    // Si cambia el correo, lo que se encontró antes ya no aplica
    buscar.reset()
    asignar.reset()
  }

  function enviarBusqueda(e) {
    e.preventDefault()
    if (!buscar.isPending) buscar.mutate()
  }

  return (
    <div className="selector-encargado">
      <h2>Encargado de {tienda.nombre}</h2>

      <p className="selector-encargado__actual">
        {tienda.encargado
          ? `Encargado actual: ${tienda.encargado.nombre} (${tienda.encargado.correo}). Si lo cambias, vuelve a ser usuario normal.`
          : 'Esta tienda no tiene encargado. La persona debe registrarse antes en la app.'}
      </p>

      {/* noValidate: el mensaje de error lo da el servidor, no el globito del navegador */}
      <form className="selector-encargado__busqueda" noValidate onSubmit={enviarBusqueda}>
        <Campo
          etiqueta="Correo del encargado"
          error={
            buscar.error?.campos?.correo?.[0] ?? (buscar.isError ? buscar.error.mensaje : undefined)
          }
        >
          <input
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="nombre@info.uas.edu.mx"
            value={correo}
            onChange={cambiarCorreo}
          />
        </Campo>
        <button type="submit" className="boton-texto" disabled={!correo.trim() || buscar.isPending}>
          {buscar.isPending ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {candidato && (
        <div
          className={
            candidato.puede_ser_encargado
              ? 'selector-encargado__candidato'
              : 'selector-encargado__candidato selector-encargado__candidato--no'
          }
        >
          <p className="selector-encargado__nombre">{candidato.nombre}</p>
          <p className="selector-encargado__detalle">{candidato.correo}</p>
          {candidato.tienda && (
            <p className="selector-encargado__detalle">Encargado de: {candidato.tienda.nombre}</p>
          )}
          {!candidato.puede_ser_encargado && (
            <p role="alert" className="selector-encargado__motivo">
              {candidato.motivo?.mensaje}
            </p>
          )}
          {yaEsElEncargado && (
            <p className="selector-encargado__detalle">Ya es el encargado de esta tienda.</p>
          )}
        </div>
      )}

      {asignar.isError && (
        <p role="alert" className="error-general">
          {asignar.error.mensaje}
        </p>
      )}

      <div className="selector-encargado__acciones">
        <button type="button" className="boton-texto" onClick={alCerrar}>
          Cancelar
        </button>
        <BotonPrincipal
          texto={candidato ? `Asignar a ${candidato.nombre}` : 'Asignar'}
          disabled={!candidato?.puede_ser_encargado || yaEsElEncargado}
          cargando={asignar.isPending}
          onClick={() => asignar.mutate()}
        />
      </div>
    </div>
  )
}