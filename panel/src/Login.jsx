import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { peticion } from '@shared/api/cliente.js'
import { inicioEnPanel } from '@shared/auth/inicioEnPanel.js'
import { useSesion } from '@shared/auth/SesionContext.jsx'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import './Login.css'

// Login propio del panel (/panel/login). El panel web es solo para encargados y administradores;
// el alumno usa la app de Android, así que aquí no hay registro ni verificación de correo.
// Un encargado nuevo se registra y verifica su correo en la app, y el admin lo asigna a una tienda.
//
// POST /auth/login responde { token, usuario }. Si la cuenta es de alumno, la sesión se cierra
// de inmediato (se revoca el token) y se le dice que use la app.
export default function Login() {
  const { haySesion, usuario, iniciarSesion, cerrarSesion } = useSesion()
  const [credenciales, setCredenciales] = useState({ correo_institucional: '', password: '' })
  const [verPassword, setVerPassword] = useState(false)
  const [esAlumno, setEsAlumno] = useState(false)

  const acceso = useMutation({
    mutationFn: (datos) => peticion('/auth/login', { method: 'POST', body: datos }),
    onSuccess: async (respuesta) => {
      // Se guarda la sesión para poder revocarla con cerrarSesion() si no es de este panel
      iniciarSesion(respuesta.token, respuesta.usuario)
      if (!inicioEnPanel(respuesta.usuario?.rol)) {
        setEsAlumno(true)
        await cerrarSesion()
      }
    },
  })

  // Con sesión de encargado o admin no tiene caso mostrar el login: entra directo
  const inicio = haySesion ? inicioEnPanel(usuario?.rol) : null
  if (inicio) return <Navigate to={inicio} replace />

  const errores = acceso.error?.campos ?? {}
  const hayErroresDeCampo = Object.keys(errores).length > 0
  // 429 = demasiados intentos: el mensaje del servidor ya dice cuánto esperar
  const mostrarError = acceso.isError && !hayErroresDeCampo

  function cambiar(campo) {
    return (e) => setCredenciales((anterior) => ({ ...anterior, [campo]: e.target.value }))
  }

  function enviar(e) {
    e.preventDefault()
    if (acceso.isPending) return
    setEsAlumno(false)
    acceso.mutate(credenciales)
  }

  return (
    <main className="login-panel">
      <div className="login-panel__tarjeta">
        <p className="login-panel__marca">UASnack · Panel</p>
        <h1>Iniciar sesión</h1>
        <p className="login-panel__subtitulo">Para encargados de tienda y administradores.</p>

        <form className="login-panel__formulario" onSubmit={enviar} noValidate>
          <Campo etiqueta="Correo institucional" error={errores.correo_institucional?.[0]}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={credenciales.correo_institucional}
              onChange={cambiar('correo_institucional')}
            />
          </Campo>

          <Campo etiqueta="Contraseña" error={errores.password?.[0]}>
            <input
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={credenciales.password}
              onChange={cambiar('password')}
            />
          </Campo>
          <label className="login-panel__ver">
            <input
              type="checkbox"
              checked={verPassword}
              onChange={(e) => setVerPassword(e.target.checked)}
            />
            Mostrar contraseña
          </label>

          {esAlumno && (
            <p role="alert" className="login-panel__aviso">
              Esta cuenta es de alumno. Para pedir, usa la app de UASnack en Android.
            </p>
          )}
          {mostrarError && (
            <p role="alert" className="login-panel__error">
              {acceso.error.mensaje}
            </p>
          )}

          <BotonPrincipal
            type="submit"
            texto={acceso.isPending ? 'Entrando…' : 'Entrar'}
            cargando={acceso.isPending}
          />
        </form>

        <p className="login-panel__nota">
          ¿Eres encargado nuevo? Regístrate y verifica tu correo en la app de Android; después el
          administrador te asigna tu tienda. Para recuperar tu contraseña, usa también la app.
        </p>
      </div>
    </main>
  )
}
