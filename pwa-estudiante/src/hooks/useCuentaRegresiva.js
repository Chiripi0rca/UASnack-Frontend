import { useEffect, useState } from 'react'

export function useCuentaRegresiva(finInicial) {
  const [fin, setFin] = useState(finInicial)
  const [ahora, setAhora] = useState(() => Date.now())
  const segundos = Math.max(0, Math.ceil((fin - ahora) / 1000))
  const activa = segundos > 0

  useEffect(() => {
    if (!activa) return
    const id = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [activa])

  function programarFin(nuevoFin) {
    setAhora(Date.now())
    setFin(nuevoFin)
  }

  return [segundos, programarFin]
}
