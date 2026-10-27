// Los estilos de este componente (archivo nuevo, en la misma carpeta).
import './PanelVoySaliendo.css'

// Panel del modo "voy saliendo" en la pantalla de Elección de retiro (#54, #59).
// En este modo el pedido se paga y queda en espera: entra a cocina hasta que el alumno avisa
// que ya va saliendo (§7.3).
// Props (no se cambian sin avisar: José Ángel (#54) ya las está usando):
//   espera        → lo que regresa useEspera:
//                   { min, max, saturada, pedidos_en_cocina, voy_saliendo_disponible }
//   seleccionado  → true si el alumno eligió este modo
//   onSeleccionar → se llama cuando el alumno toca "Voy saliendo"
// Siempre muestra un rango, nunca un tiempo fijo: el rango lo calcula el servidor (§7.4).
export default function PanelVoySaliendo({ espera, seleccionado = false, onSeleccionar }) {
  // Mientras useEspera no tenga datos (cargando o con error) no se dibuja nada:
  // la pantalla #54 es la que muestra EstadoCarga o EstadoError.
  if (!espera) return null

  // false cuando la tienda ya llenó su cupo de pedidos "voy saliendo" (cupo_bajo_demanda).
  const disponible = espera.voy_saliendo_disponible
  // "1 pedido" o "14 pedidos": singular o plural según el número.
  const pedidos = `${espera.pedidos_en_cocina} ${espera.pedidos_en_cocina === 1 ? 'pedido' : 'pedidos'}`

  // aria-label: el lector de pantalla anuncia "Voy saliendo" al entrar a esta sección.
  return (
    <section className="panel-voy-saliendo" aria-label="Voy saliendo">
      <button
        // type="button": nunca envía un formulario por accidente.
        type="button"
        // La clase "activo" lo pinta con primary container, igual que una franja elegida.
        className={
          seleccionado ? 'panel-voy-saliendo__opcion activo' : 'panel-voy-saliendo__opcion'
        }
        // aria-pressed: el lector de pantalla dice si este modo está elegido o no.
        aria-pressed={seleccionado}
        // Sin cupo para "voy saliendo" no se puede elegir: solo quedan las franjas.
        disabled={!disponible}
        // Le avisa a la pantalla que se eligió este modo. El "?." evita un error
        // si la pantalla no mandó onSeleccionar.
        onClick={() => onSeleccionar?.()}
      >
        <span className="panel-voy-saliendo__titulo">
          {/* Palomita solo cuando está elegido, para no depender únicamente del color */}
          {seleccionado && <span aria-hidden="true">✓ </span>}
          Voy saliendo
        </span>
        {/* El rango que calculó el servidor, por ejemplo "16–22 min" */}
        <span className="panel-voy-saliendo__rango">
          Tu pedido tardaría unos{' '}
          <span className="panel-voy-saliendo__minutos">
            {espera.min}–{espera.max} min
          </span>
        </span>
      </button>

      {/* Debajo del botón sale a lo mucho UN aviso: si no hay cupo, ese es el que importa;
          si hay cupo pero la cocina está saturada, se recomienda apartar una franja (§7.3).
          role="alert" hace que el lector de pantalla lo lea en cuanto aparece. */}
      {!disponible ? (
        <p className="panel-voy-saliendo__aviso" role="alert">
          Ahorita la tienda no acepta más pedidos en “voy saliendo”. Aparta una franja.
        </p>
      ) : espera.saturada ? (
        <p className="panel-voy-saliendo__aviso" role="alert">
          Ahorita hay {pedidos} en cocina. Te conviene apartar una franja.
        </p>
      ) : null}
    </section>
  )
}
