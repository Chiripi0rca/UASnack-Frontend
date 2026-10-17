import './ChipOpcion.css'

// Chip para elegir una opción (#167): extras y quitables en Detalle de producto (#50)
// y categorías en el Catálogo.
// - activo: seleccionado → fondo primary container (Anexo B: "no solo un borde")
// - detalle: texto chico a la derecha, por ejemplo "+$5.00" (solo para mostrar)
// aria-pressed le dice al lector de pantalla que es un botón que se prende y se apaga.
export default function ChipOpcion({ texto, detalle, activo = false, disabled = false, onClick }) {
  return (
    <button
      type="button"
      className={activo ? 'chip-opcion activo' : 'chip-opcion'}
      aria-pressed={activo}
      disabled={disabled}
      onClick={onClick}
    >
      {/* Palomita solo cuando está activo, para no depender únicamente del color */}
      {activo && (
        <span className="chip-opcion__marca" aria-hidden="true">
          ✓
        </span>
      )}
      <span>{texto}</span>
      {detalle && <span className="chip-opcion__detalle">{detalle}</span>}
    </button>
  )
}
