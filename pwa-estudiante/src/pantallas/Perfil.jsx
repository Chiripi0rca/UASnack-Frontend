import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSesion } from '@shared/auth/SesionContext.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import { usePerfil } from '../hooks/usePerfil.js'
import './Perfil.css'

// Pantalla 16 · Perfil (#219, HU-34). GET /auth/yo cada vez que se abre.
// CA-01: nombre, correo institucional y facultad.
// CA-02: tarjeta de faltas que cambia de color: verde sin faltas, ámbar con 1 o 2, roja con 3 o más.
//        Solo cambia el color: qué pasa con cada falta lo decide el servidor (HU-17).
// CA-04: cerrar sesión.
export default function Perfil() {
  const { datos: usuario, cargando, error, reintentar } = usePerfil()
  const { cerrarSesion } = useSesion()
  const navegar = useNavigate()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    await cerrarSesion()
    navegar('/login', { replace: true })
  }

  if (cargando) {
    return (
      <main className="pantalla">
        <EstadoCarga mensaje="Cargando tu perfil…" />
      </main>
    )
  }
  if (error) {
    return (
      <main className="pantalla">
        <EstadoError error={error} alReintentar={reintentar} />
      </main>
    )
  }

  return (
    <main className="pantalla perfil">
      <h1>Perfil</h1>

      <section className="perfil__datos" aria-label="Tus datos">
        <p className="perfil__nombre">
          {usuario.nombre} {usuario.apellido}
        </p>
        <p className="perfil__dato">{usuario.correo_institucional}</p>
        <p className="perfil__dato">{usuario.facultad?.nombre}</p>
      </section>

      <TarjetaFaltas faltas={usuario.faltas ?? 0} />

      <nav className="perfil__acciones" aria-label="Cuenta">
        <Link className="perfil__accion" to="/perfil/contrasena">
          Cambiar contraseña
        </Link>
        <button type="button" className="perfil__accion perfil__salir" onClick={salir} disabled={saliendo}>
          {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </nav>
    </main>
  )
}

function TarjetaFaltas({ faltas }) {
  const nivel = faltas === 0 ? 'sin-faltas' : faltas < 3 ? 'pocas' : 'muchas'

  return (
    <section className={`tarjeta-faltas tarjeta-faltas--${nivel}`} aria-label="Faltas">
      <p className="tarjeta-faltas__numero">
        {faltas === 0 ? 'Sin faltas' : faltas === 1 ? '1 falta' : `${faltas} faltas`}
      </p>
      <p className="tarjeta-faltas__mensaje">
        {faltas === 0
          ? 'Recoges tus pedidos a tiempo.'
          : 'Una falta es un pedido que no recogiste. Se quita una por cada 10 pedidos recogidos.'}
      </p>
    </section>
  )
}
