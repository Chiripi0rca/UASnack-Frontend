import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { cambiarPassword } from '../api/auth.js'
import { primerError } from '../utilidades/errores.js'
import './Contrasena.css'

// HU-33 · "Cambiar contraseña" (con sesión), desde el botón del Perfil. POST /auth/cambiar-password.
// CA-05: hay que escribir la actual. Las demás sesiones se cierran; esta sigue abierta.
export default function CambiarContrasena() {
  const [datos, setDatos] = useState({ actual: '', nueva: '', confirmacion: '' })

  const cambio = useMutation({ mutationFn: () => cambiarPassword(datos) })

  function cambiar(campo) {
    return (e) => setDatos((anteriores) => ({ ...anteriores, [campo]: e.target.value }))
  }

  function enviar(e) {
    e.preventDefault()
    if (cambio.isPending) return
    cambio.mutate()
  }

  if (cambio.isSuccess) {
    return (
      <main className="pantalla">
        <h1>Listo</h1>
        <p className="contrasena__texto">
          Tu contraseña cambió. Cerramos tu sesión en tus otros dispositivos; aquí sigues dentro.
        </p>
        <Link className="contrasena__enlace-boton" to="/perfil" replace>
          Volver al perfil
        </Link>
      </main>
    )
  }

  const errores = cambio.error?.campos ?? {}
  // La contraseña actual equivocada no es un error de formato: llega como código, no en "campos"
  const actualIncorrecta = cambio.error?.codigo === 'PASSWORD_ACTUAL_INCORRECTA' ? cambio.error.mensaje : null
  const errorGeneral = cambio.isError && !actualIncorrecta && !Object.keys(errores).length

  return (
    <main className="pantalla">
      <h1>Cambiar contraseña</h1>

      <form className="contrasena__formulario" onSubmit={enviar} noValidate>
        <Campo etiqueta="Contraseña actual" error={actualIncorrecta ?? primerError(errores, 'password_actual')}>
          <input type="password" autoComplete="current-password" value={datos.actual} onChange={cambiar('actual')} />
        </Campo>

        <Campo etiqueta="Contraseña nueva" error={primerError(errores, 'password')}>
          <input type="password" autoComplete="new-password" value={datos.nueva} onChange={cambiar('nueva')} />
        </Campo>

        <Campo etiqueta="Confirma la contraseña nueva">
          <input
            type="password"
            autoComplete="new-password"
            value={datos.confirmacion}
            onChange={cambiar('confirmacion')}
          />
        </Campo>

        {errorGeneral && (
          <p role="alert" className="error-general">
            {cambio.error.mensaje}
          </p>
        )}

        <BotonPrincipal
          type="submit"
          texto="Cambiar contraseña"
          cargando={cambio.isPending}
          disabled={!datos.actual || !datos.nueva}
        />
      </form>

      <p className="acceso__alterno">
        <Link to="/perfil">Cancelar</Link>
      </p>
    </main>
  )
}
