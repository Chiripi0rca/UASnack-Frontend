import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { CLAVE_CORREO_POR_RECUPERAR, olvidePassword } from '../api/auth.js'
import { primerError } from '../utilidades/errores.js'
import './Contrasena.css'

// HU-33 · Paso 1 "Olvidé mi contraseña" (sin sesión). POST /auth/olvide-password.
// El servidor responde igual exista o no la cuenta (CA-02), así que aquí siempre se pasa al paso 2.
export default function OlvideContrasena() {
  const navegar = useNavigate()
  const [correo, setCorreo] = useState('')

  const envio = useMutation({
    mutationFn: olvidePassword,
    onSuccess: () => {
      sessionStorage.setItem(CLAVE_CORREO_POR_RECUPERAR, correo.trim().toLowerCase())
      navegar('/nueva-contrasena')
    },
  })

  function enviar(e) {
    e.preventDefault()
    if (envio.isPending) return
    envio.mutate(correo.trim())
  }

  const errores = envio.error?.campos ?? {}
  const errorGeneral = envio.isError && !Object.keys(errores).length

  return (
    <main className="pantalla">
      <h1>Recupera tu contraseña</h1>
      <p className="contrasena__texto">
        Escribe tu correo institucional y te mandaremos un código para crear una contraseña nueva.
      </p>

      <form className="contrasena__formulario" onSubmit={enviar} noValidate>
        <Campo etiqueta="Correo institucional" error={primerError(errores, 'correo_institucional')}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </Campo>

        {errorGeneral && (
          <p role="alert" className="error-general">
            {envio.error.mensaje}
          </p>
        )}

        <BotonPrincipal type="submit" texto="Mandar código" cargando={envio.isPending} disabled={!correo.trim()} />
      </form>

      <p className="acceso__alterno">
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </main>
  )
}
