import { useSesion } from '@shared/auth/SesionContext.jsx'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  CLAVE_CORREO_POR_VERIFICACION,
  CLAVE_REENVIO_DISPONIBLE_EN,
  reenviarCodigo,
  verificar,
} from '../api/auth.js'
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva.js'
import { formatearTiempo } from '../utilidades/formatearTiempo.js'
import './Verificacion.css'

const CODIGO = 6

const codigoVacio = () => Array(CODIGO).fill('')

const leerReenvioDisponibleEn = () =>
  Number(sessionStorage.getItem(CLAVE_REENVIO_DISPONIBLE_EN)) || 0

export default function Verificacion() {
  const navegar = useNavigate()
   const { iniciarSesion } = useSesion()
  const [correo] = useState(() => sessionStorage.getItem(CLAVE_CORREO_POR_VERIFICACION))

  const [digitos, setDigitos] = useState(codigoVacio)
  const casillas = useRef([])
  const [segundos, programarFin] = useCuentaRegresiva(leerReenvioDisponibleEn)

  function esperarReenvio(segundosDeEspera) {
    const fin = Date.now() + segundosDeEspera * 1000
    sessionStorage.setItem(CLAVE_REENVIO_DISPONIBLE_EN, String(fin))
    programarFin(fin)
  }

  const verificacion = useMutation({
    mutationFn: (codigo) => verificar(correo, codigo),
    onSuccess: (respuesta) => {
      iniciarSesion(respuesta.token, respuesta.usuario)
      sessionStorage.removeItem(CLAVE_CORREO_POR_VERIFICACION)
      sessionStorage.removeItem(CLAVE_REENVIO_DISPONIBLE_EN)
      navegar('/tiendas', { replace: true })
    },
    onError: () => {
      setDigitos(codigoVacio())
      casillas.current[0]?.focus()
    },
  })

  const reenvio = useMutation({
    mutationFn: () => reenviarCodigo(correo),
    onSuccess: (respuesta) => {
      verificacion.reset()
      setDigitos(codigoVacio())
      esperarReenvio(respuesta.reenviar_en_segundos)
      casillas.current[0]?.focus()
    },
    onError: (error) => {
      if (error.reintentarEn) esperarReenvio(error.reintentarEn)
    },
  })

  function escribirDesde(indice, texto) {
    if (verificacion.isPending) return
    const numeros = texto
      .replace(/\D/g, '')
      .slice(0, CODIGO - indice)
      .split('')
    if (numeros.length === 0) return

    const nuevos = [...digitos]
    numeros.forEach((digito, i) => {
      nuevos[indice + i] = digito
    })
    setDigitos(nuevos)
    if (verificacion.isError) verificacion.reset()

    casillas.current[Math.min(indice + numeros.length, CODIGO - 1)]?.focus()

    const codigo = nuevos.join('')
    if (codigo.length === CODIGO) verificacion.mutate(codigo)
  }

  function alCambiar(indice, valor) {
    if (valor === '') {
      setDigitos((anteriores) => anteriores.map((d, i) => (i === indice ? '' : d)))
      return
    }
    escribirDesde(indice, valor.length === 2 ? valor.slice(-1) : valor)
  }

  function alTeclear(indice, e) {
    if (e.key === 'Backspace' && !digitos[indice] && indice > 0) {
      casillas.current[indice - 1]?.focus()
    }
  }

  function alPegar(indice, e) {
    e.preventDefault()
    escribirDesde(indice, e.clipboardData.getData('text'))
  }

  if (!correo) return <Navigate to="/registro" replace />

  const error = verificacion.error ?? reenvio.error

  return (
    <main className="pantalla pantalla-verificacion">
      <h1>Verifica tu correo</h1>
      <p className="verificacion__texto">
        Enviamos un código de {CODIGO} dígitos a <strong>{correo}</strong>
      </p>

      <div className="casillas-codigo" role="group" aria-label="Código de verificación">
        {digitos.map((digito, i) => (
          <input
            key={i}
            ref={(el) => {
              casillas.current[i] = el
            }}
            value={digito}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={i === 0}
            aria-label={`Dígito ${i + 1} de ${CODIGO}`}
            aria-invalid={verificacion.isError}
            readOnly={verificacion.isPending}
            onChange={(e) => alCambiar(i, e.target.value)}
            onKeyDown={(e) => alTeclear(i, e)}
            onPaste={(e) => alPegar(i, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      <p className="verificacion__estado" aria-live="polite">
        {verificacion.isPending ? 'Verificando…' : ''}
      </p>

      {error && (
        <p role="alert" className="error-general">
          {error.mensaje}
        </p>
      )}

      <button
        type="button"
        className="boton-texto verificacion__reenviar"
        disabled={segundos > 0 || reenvio.isPending}
        onClick={() => reenvio.mutate()}
      >
        {segundos > 0 ? (
          <>
            Reenviar código en <span className="mono">{formatearTiempo(segundos)}</span>
          </>
        ) : reenvio.isPending ? (
          'Enviando…'
        ) : (
          'Reenviar código'
        )}
      </button>
    </main>
  )
}
