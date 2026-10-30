import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { CLAVE_CORREO_POR_RECUPERAR, olvidePassword, restablecerPassword } from '../api/auth.js'
import { primerError } from '../utilidades/errores.js'
import './Contrasena.css'

// HU-33 · Paso 2 "Nueva contraseña" (sin sesión). POST /auth/restablecer-password.
// Al cambiarla se cierran todas las sesiones de la cuenta (CA-04): por eso al final se manda al Login.
export default function NuevaContrasena() {
  const [correo] = useState(() => sessionStorage.getItem(CLAVE_CORREO_POR_RECUPERAR))
  const [datos, setDatos] = useState({ codigo: '', password: '', confirmacion: '' })

  const cambio = useMutation({
    mutationFn: () => restablecerPassword({ correo, ...datos }),
    onSuccess: () => sessionStorage.removeItem(CLAVE_CORREO_POR_RECUPERAR),
  })

  // "No me llegó": vuelve a pedir el código. El servidor no manda otro si pasó menos de un minuto.
  const reenvio = useMutation({ mutationFn: () => olvidePassword(correo) })

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
          Tu contraseña cambió. Por seguridad cerramos tu sesión en todos tus dispositivos.
        </p>
        <Link className="contrasena__enlace-boton" to="/login" replace>
          Iniciar sesión
        </Link>
      </main>
    )
  }

  if (!correo) return <Navigate to="/olvide-contrasena" replace />

  const errores = cambio.error?.campos ?? {}
  const errorGeneral = cambio.isError && !Object.keys(errores).length

  return (
    <main className="pantalla">
      <h1>Crea tu contraseña nueva</h1>
      <p className="contrasena__texto">
        Si <strong>{correo}</strong> tiene cuenta, le mandamos un código de 6 dígitos. Vence en 10 minutos.
      </p>

      <form className="contrasena__formulario" onSubmit={enviar} noValidate>
        <Campo etiqueta="Código" error={primerError(errores, 'codigo')}>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="mono"
            value={datos.codigo}
            onChange={(e) => setDatos((anteriores) => ({ ...anteriores, codigo: e.target.value.replace(/\D/g, '') }))}
          />
        </Campo>

        <Campo etiqueta="Contraseña nueva" error={primerError(errores, 'password')}>
          <input type="password" autoComplete="new-password" value={datos.password} onChange={cambiar('password')} />
        </Campo>

        <Campo etiqueta="Confirma la contraseña">
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
          disabled={datos.codigo.length < 6 || !datos.password}
        />
      </form>

      <button
        type="button"
        className="boton-texto contrasena__reenviar"
        disabled={reenvio.isPending}
        onClick={() => reenvio.mutate()}
      >
        {reenvio.isPending ? 'Enviando…' : reenvio.isSuccess ? 'Te mandamos otro código' : 'No me llegó el código'}
      </button>
    </main>
  )
}
