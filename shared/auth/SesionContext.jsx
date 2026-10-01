import { createContext, useContext, useEffect, useState } from 'react'
import { peticion } from '../api/cliente.js'
import { alExpirarSesion, borrarSesion, guardarSesion, leerSesion } from './almacenSesion.js'

const SesionContext = createContext(null)

// Envuelve la app y reparte la sesión: usuario, token, iniciarSesion() y cerrarSesion().
// Arranca con lo guardado en localStorage, así quien ya inició sesión entra directo.
export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)

  // Si el cliente HTTP recibe un 401 con token (sesión vencida o revocada), aquí se limpia el estado
  // y RutaProtegida manda al login. Se deja de escuchar al desmontar.
  useEffect(() => alExpirarSesion(() => setSesion(null)), [])

  // Recibe lo que devuelve POST /auth/login (o /auth/verificar): { token, usuario }.
  function iniciarSesion(token, usuario) {
    const nueva = { token, usuario }
    guardarSesion(nueva)
    setSesion(nueva)
  }

  // Revoca el token en el servidor y limpia la sesión local. Si el servidor no responde
  // (sin señal, token ya vencido) se cierra igual: el usuario pidió salir.
  async function cerrarSesion() {
    try {
      await peticion('/auth/logout', { method: 'POST' })
    } catch {
      // El token se queda sin usar en el servidor y vence solo a los 7 días.
    }
    borrarSesion()
    setSesion(null)
  }

  const valor = {
    usuario: sesion?.usuario ?? null,
    token: sesion?.token ?? null,
    haySesion: Boolean(sesion?.token),
    iniciarSesion,
    cerrarSesion,
  }

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion() {
  const contexto = useContext(SesionContext)
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return contexto
}
