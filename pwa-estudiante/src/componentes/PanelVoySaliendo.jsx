// ESQUELETO (Sprint 03). Lo completa #59 (Alfredo) con el diseño final.
// Panel del modo "voy saliendo" en la pantalla de Elección de retiro (#54):
// - espera: lo que regresa useEspera → { min, max, saturada, pedidos_en_cocina, voy_saliendo_disponible }
// - seleccionado: true si el alumno eligió este modo
// - onSeleccionar(): se llama al elegir "voy saliendo"
// Siempre muestra un rango, nunca un tiempo fijo. Si la cocina está saturada, lo advierte y
// sugiere apartar una franja. Si voy_saliendo_disponible es false, el modo sale deshabilitado.
// Las props no se cambian sin avisar: José Ángel (#54) ya las está usando.
export default function PanelVoySaliendo({ espera, seleccionado = false, onSeleccionar }) {
  if (!espera) return null

  return (
    <section aria-label="Voy saliendo">
      <button
        type="button"
        aria-pressed={seleccionado}
        disabled={!espera.voy_saliendo_disponible}
        onClick={() => onSeleccionar?.()}
      >
        Voy saliendo
      </button>
      <p>
        Tu pedido tardaría unos {espera.min}–{espera.max} min.
      </p>
      {espera.saturada && (
        <p role="alert">
          Ahorita hay {espera.pedidos_en_cocina} pedidos en cocina. Te conviene apartar una franja.
        </p>
      )}
    </section>
  )
}
