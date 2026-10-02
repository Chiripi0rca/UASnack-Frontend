import './Estados.css'

// Se muestra mientras llegan los datos de la API (isPending de TanStack Query).
// role="status" hace que el lector de pantalla anuncie el mensaje sin interrumpir.
export default function EstadoCarga({ mensaje = 'Cargando…' }) {
  return (
    <div className="estado" role="status" aria-live="polite">
      <span className="estado__indicador" aria-hidden="true" />
      <p className="estado__mensaje">{mensaje}</p>
    </div>
  )
}
