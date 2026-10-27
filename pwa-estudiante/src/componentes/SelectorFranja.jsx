// Los estilos de este componente (archivo nuevo, en la misma carpeta).
import './SelectorFranja.css'

// Rejilla de franjas de la pantalla de Elección de retiro (#54, #172).
// Props (no se cambian sin avisar: José Ángel (#54) ya las está usando):
//   franjas       → lo que regresa useFranjas (máximo 8; el servidor ya las limita)
//   seleccionada  → la franja que el alumno eligió, o null si todavía no elige
//   onSeleccionar → se llama con la franja cuando el alumno toca una que tiene cupo
export default function SelectorFranja({ franjas = [], seleccionada = null, onSeleccionar }) {
  // role="group" + aria-label: el lector de pantalla anuncia "Franjas de retiro" antes de los botones.
  return (
    <div className="selector-franja" role="group" aria-label="Franjas de retiro">
      {/* Un botón por cada franja */}
      {franjas.map((franja) => {
        // ¿Es la franja elegida? Las franjas no traen id: la fecha y la hora de inicio,
        // juntas, son las que identifican a cada una.
        const activa =
          seleccionada?.fecha === franja.fecha && seleccionada?.inicio === franja.inicio

        return (
          <button
            // key: React la usa para saber qué botón es cuál de un render a otro.
            key={`${franja.fecha} ${franja.inicio}`}
            // type="button": nunca envía un formulario por accidente.
            type="button"
            // La clase "activa" la pinta con primary container (ver el CSS).
            className={activa ? 'selector-franja__opcion activa' : 'selector-franja__opcion'}
            // aria-pressed: el lector de pantalla dice si el botón está elegido o no.
            aria-pressed={activa}
            // Una franja llena (disponible: false) no se puede tocar.
            disabled={!franja.disponible}
            // Al tocarla le avisa a la pantalla cuál se eligió. El "?." evita un error
            // si la pantalla no mandó onSeleccionar.
            onClick={() => onSeleccionar?.(franja)}
          >
            {/* La hora, por ejemplo "11:00–11:10" */}
            <span className="selector-franja__hora">
              {/* Palomita solo cuando está elegida, para no depender únicamente del color */}
              {activa && <span aria-hidden="true">✓ </span>}
              {franja.inicio}–{franja.fin}
            </span>

            {/* Debajo de la hora: "Llena" si ya no hay cupo; si hay cupo y descuento, "−10%";
                si no, nada. El porcentaje lo decide el servidor: aquí solo se muestra. */}
            {!franja.disponible ? (
              <span className="selector-franja__nota">Llena</span>
            ) : franja.descuento ? (
              <span className="selector-franja__descuento">−{franja.descuento}%</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
