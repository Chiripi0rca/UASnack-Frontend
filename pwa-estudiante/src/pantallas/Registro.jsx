import { useMutation, useQuery } from '@tanstack/react-query'
import {  useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CLAVE_CORREO_POR_VERIFICACION,
  CLAVE_REENVIO_DISPONIBLE_EN,
  obtenerFacultades,
  registrar,
} from '../api/auth'
import Campo from '../componentes/Campo'
import { primerError } from '../utilidades/errores.js'
import { soloNumero } from '../utilidades/soloNumero.js'
import './Registro.css'

const TELEFONO_CAPACIDAD = 10

const FORMULARIO_VACIO = {
  nombre: '',
  apellido: '',
  correo_institucional: '',
  id_facultad: '',
  password: '',
  telefono: '',
}

export default function Registro() {
  const navegar = useNavigate()
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [correoPendiente] = useState (() => 
  sessionStorage.getItem(CLAVE_CORREO_POR_VERIFICACION))

  const facultades = useQuery({ queryKey: ['facultades'], queryFn: obtenerFacultades })

  const registro = useMutation({
    mutationFn: registrar,
    onSuccess: (respuesta, datos) => {
      const reenvioDisponibleEn = Date.now() + respuesta.reenviar_en_segundos * 1000
      sessionStorage.setItem(CLAVE_CORREO_POR_VERIFICACION, datos.correo_institucional)
      sessionStorage.setItem(CLAVE_REENVIO_DISPONIBLE_EN, String(reenvioDisponibleEn))
      navegar('/verificacion')
    },
  })

  const errores = registro.error?.campos ?? {}
  const hayErroresDeCampo = Object.keys(errores).length > 0

  function cambiar(campo) {
    return (e) => setFormulario((anterior) => ({ ...anterior, [campo]: e.target.value }))
  }

  function enviar(e) {
    e.preventDefault()
    if (!aceptoTerminos || registro.isPending) return
    registro.mutate({
      ...formulario,
      id_facultad: Number(formulario.id_facultad) || null,
      acepto_terminos: true,
    })
  }
  return (
    <main className="pantalla pantalla-registro">
      <h1>Crea tu cuenta</h1>

      {correoPendiente && (
        <p className="aviso-pendiente">
          Ya creaste una cuenta con <strong>{correoPendiente}</strong>.{' '}
          <Link to="/verificacion">Continúa con la verificación</Link>
        </p>
      )}

      <form className="formulario-registro" onSubmit={enviar} noValidate>
        <Campo etiqueta="Nombre" error={primerError(errores, 'nombre')}>
          <input autoComplete="given-name" value={formulario.nombre} onChange={cambiar('nombre')} />
        </Campo>

        <Campo etiqueta="Apellido" error={primerError(errores, 'apellido')}>
          <input
            autoComplete="family-name"
            value={formulario.apellido}
            onChange={cambiar('apellido')}
          />
        </Campo>

        <Campo etiqueta="Correo institucional" error={primerError(errores, 'correo_institucional')}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={formulario.correo_institucional}
            onChange={cambiar('correo_institucional')}
          />
        </Campo>

        <Campo etiqueta="Facultad" error={primerError(errores, 'id_facultad')}>
          <select
            value={formulario.id_facultad}
            onChange={cambiar('id_facultad')}
            disabled={!facultades.isSuccess}
          >
            <option value="">
              {facultades.isPending && 'Cargando facultades…'}
              {facultades.isError && 'No se pudieron cargar'}
              {facultades.isSuccess && 'Elige tu facultad'}
            </option>
            {facultades.data?.datos.map((facultad) => (
              <option key={facultad.id} value={facultad.id}>
                {facultad.nombre}
              </option>
            ))}
          </select>
        </Campo>
        {facultades.isError && (
          <button type="button" className="boton-texto" onClick={() => facultades.refetch()}>
            Reintentar
          </button>
        )}

        <Campo etiqueta="Contraseña" error={primerError(errores, 'password')}>
          <input
            type="password"
            autoComplete="new-password"
            value={formulario.password}
            onChange={cambiar('password')}
          />
        </Campo>

        <Campo etiqueta="Telefono" error={primerError(errores, 'telefono')}>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="[0-9]*"
            maxLength={TELEFONO_CAPACIDAD}
            value={formulario.telefono}
            onChange={(e) =>
              setFormulario((anterior) => ({
                ...anterior,
                telefono: soloNumero(e.target.value, TELEFONO_CAPACIDAD),
              }))
            }
          />
        </Campo>

        <label className="casilla-terminos">
          <input
            type="checkbox"
            checked={aceptoTerminos}
            onChange={(e) => setAceptoTerminos(e.target.checked)}
          />
          <span>
            {/* rutas reales del aviso y de las reglas */}
            He leído y acepto el <a href="#">aviso de privacidad</a> y las{' '}
            <a href="#">reglas de faltas</a>.
          </span>
        </label>

        {registro.isError && !hayErroresDeCampo && (
          <p role="alert" className="error-general">
            {registro.error.mensaje}
          </p>
        )}

        <button
          type="submit"
          className="boton-principal"
          disabled={!aceptoTerminos || registro.isPending}
        >
          {registro.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  )
}
