// ESQUELETO (Sprint 03). Lo completa #172 (Alfredo) con el diseño final.
// Rejilla de franjas de la pantalla de Elección de retiro (#54):
// - franjas: lo que regresa useFranjas (máximo 8)
// - seleccionada: la franja elegida, o null
// - onSeleccionar(franja): se llama al tocar una franja con cupo
// Una franja llena (disponible: false) sale deshabilitada; una con descuento lleva "−10%".
// Las props no se cambian sin avisar: José Ángel (#54) ya las está usando.
export default function SelectorFranja({ franjas = [], seleccionada = null, onSeleccionar }) {
  return (
    <div role="group" aria-label="Franjas de retiro">
      {franjas.map((franja) => {
        const activa = seleccionada?.fecha === franja.fecha && seleccionada?.inicio === franja.inicio
        return (
          <button
            key={`${franja.fecha} ${franja.inicio}`}
            type="button"
            aria-pressed={activa}
            disabled={!franja.disponible}
            onClick={() => onSeleccionar?.(franja)}
          >
            {franja.inicio}–{franja.fin}
            {franja.descuento ? ` · −${franja.descuento}%` : ''}
          </button>
        )
      })}
    </div>
  )
}
