import './BotonPrincipal.css'

// importe llega ya formateado (p. ej. "$45.00"): el cliente solo lo muestra, no lo calcula.
// type es "button" por defecto; dentro de un formulario se pasa type="submit".
export default function BotonPrincipal({
  texto,
  importe,
  cargando = false,
  disabled = false,
  onClick,
  type = 'button',
}) {
  return (
    <button
      type={type}
      className="boton-principal"
      disabled={disabled || cargando}
      aria-busy={cargando}
      onClick={onClick}
    >
      {cargando && <span className="boton-principal__indicador" aria-hidden="true" />}
      <span>{texto}</span>
      {importe != null && <span className="boton-principal__importe">{importe}</span>}
    </button>
  )
}
