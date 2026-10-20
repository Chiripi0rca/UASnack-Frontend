import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { actualizarTienda, CLAVE_TIENDAS, crearTienda } from '../api/tiendasAdmin.js'

// Alta y edición de una tienda (POST / PATCH /admin/tiendas), parte de "Tiendas" (#103).
// tienda = null → nueva (se crea sin encargado; se asigna después por correo, #164).
// La facultad no se pide: el servidor usa la del administrador.
// Los errores por campo y sus textos vienen del servidor (422, campos).
export default function FormularioTienda({ tienda, alCerrar }) {
  const clienteQuery = useQueryClient()
  const esNueva = !tienda

  const [valores, setValores] = useState({
    nombre: tienda?.nombre ?? '',
    ubicacion: tienda?.ubicacion ?? '',
    horario_apertura: tienda?.horario_apertura ?? '07:00',
    horario_cierre: tienda?.horario_cierre ?? '19:00',
  })

  const guardar = useMutation({
    mutationFn: () => {
      const datos = {
        nombre: valores.nombre.trim(),
        ubicacion: valores.ubicacion.trim(),
        horario_apertura: valores.horario_apertura,
        horario_cierre: valores.horario_cierre,
      }
      return esNueva ? crearTienda(datos) : actualizarTienda(tienda.id, datos)
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: CLAVE_TIENDAS })
      alCerrar()
    },
  })

  // Primer mensaje del servidor para un campo, o undefined
  const errorDe = (campo) => guardar.error?.campos?.[campo]?.[0]
  const hayErroresDeCampo = Object.keys(guardar.error?.campos ?? {}).length > 0

  const cambiar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }))

  function enviar(e) {
    e.preventDefault()
    if (!guardar.isPending) guardar.mutate()
  }

  return (
    <form className="formulario-tienda" noValidate onSubmit={enviar}>
      <h2>{esNueva ? 'Nueva tienda' : `Editar ${tienda.nombre}`}</h2>

      <Campo etiqueta="Nombre" error={errorDe('nombre')}>
        <input value={valores.nombre} onChange={cambiar('nombre')} />
      </Campo>
      <Campo etiqueta="Ubicación" error={errorDe('ubicacion')}>
        <input value={valores.ubicacion} onChange={cambiar('ubicacion')} />
      </Campo>
      <Campo etiqueta="Abre a las" error={errorDe('horario_apertura')}>
        <input
          type="time"
          value={valores.horario_apertura}
          onChange={cambiar('horario_apertura')}
        />
      </Campo>
      <Campo etiqueta="Cierra a las" error={errorDe('horario_cierre')}>
        <input type="time" value={valores.horario_cierre} onChange={cambiar('horario_cierre')} />
      </Campo>

      {/* Error general (403, sin conexión…) cuando no viene por campo */}
      {guardar.isError && !hayErroresDeCampo && (
        <p role="alert" className="error-general">
          {guardar.error.mensaje}
        </p>
      )}

      <div className="formulario-tienda__acciones">
        <button type="button" className="boton-texto" onClick={alCerrar}>
          Cancelar
        </button>
        <BotonPrincipal
          type="submit"
          texto={esNueva ? 'Dar de alta' : 'Guardar cambios'}
          cargando={guardar.isPending}
        />
      </div>
    </form>
  )
}