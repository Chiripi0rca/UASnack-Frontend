import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import ChipOpcion from '@shared/componentes/ChipOpcion.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import EstadoVacio from '@shared/componentes/EstadoVacio.jsx'
import { formatearPrecio } from '@shared/utilidades/formatearPrecio.js'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PanelVoySaliendo from '../componentes/PanelVoySaliendo.jsx'
import SelectorFranja from '../componentes/SelectorFranja.jsx'
import { useCarrito } from '../hooks/useCarrito.js'
import { useEspera } from '../hooks/useEspera.js'
import { useFranjas } from '../hooks/useFranjas.js'
import './EleccionRetiro.css'

// Pantalla 8 · Elección de retiro GET /tiendas/{id}/franjas y /tiendas/{id}/espera.
// Dos modos: "Elegir hora" (rejilla de franjas) y "Voy saliendo" (rango de espera).
// Ningún tiempo va escrito a mano: franjas, cupos y rangos los calcula el servidor.
export default function EleccionRetiro() {
  const { idTienda } = useParams()
  const navegar = useNavigate()
  const { lineas, totalLocal } = useCarrito()

  // 'hora' = elegir franja, 'voy' = voy saliendo
  const [modo, setModo] = useState('hora')
  const [elegida, setElegida] = useState(null)

  // Minutos de cocina del carrito: lo que tarda cada producto por las veces que se pidió.
  // Un carrito guardado antes de este cambio no trae tiempo_prep_min y cuenta como 0.
  const minutos = lineas.reduce(
    (suma, linea) => suma + (linea.tiempo_prep_min ?? 0) * linea.cantidad,
    0
  )

  // Los hooks van antes del "return" de carrito vacío: React exige llamarlos siempre en el mismo orden
  const franjas = useFranjas(idTienda, minutos)
  const espera = useEspera(idTienda, minutos)

  if (!lineas.length) {
    return (
      <main className="pantalla">
        <h1>Elige cuándo recoger</h1>
        <EstadoVacio titulo="Tu carrito está vacío" mensaje="Agrega productos desde una tienda.">
          <Link to="/tiendas">Ver tiendas</Link>
        </EstadoVacio>
      </main>
    )
  }

  // La franja elegida solo vale si sigue en la lista y con cupo: si la lista se refresca
  // y se llenó, se pierde la elección en vez de mandar al alumno a una franja llena.
  const franjaValida =
    franjas.datos?.find(
      (f) => f.fecha === elegida?.fecha && f.inicio === elegida?.inicio && f.disponible
    ) ?? null

  const puedeContinuar =
    modo === 'hora' ? Boolean(franjaValida) : Boolean(espera.datos?.voy_saliendo_disponible)

  // La pantalla 9 (Confirmación y pago) recibe la elección por el estado de la navegación
  function continuar() {
    navegar('/pago', {
      state: { idTienda, modo, franja: modo === 'hora' ? franjaValida : null },
    })
  }

  return (
    <main className="pantalla">
      <Link className="eleccion-retiro__volver" to="/carrito">
        ← Carrito
      </Link>
      <h1>Elige cuándo recoger</h1>

      <div className="eleccion-retiro__modos" role="group" aria-label="Modo de retiro">
        <ChipOpcion texto="Elegir hora" activo={modo === 'hora'} onClick={() => setModo('hora')} />
        <ChipOpcion texto="Voy saliendo" activo={modo === 'voy'} onClick={() => setModo('voy')} />
      </div>

      {modo === 'hora' && (
        <section aria-label="Elegir hora">
          {franjas.cargando && <EstadoCarga mensaje="Cargando franjas…" />}
          {franjas.error && <EstadoError error={franjas.error} alReintentar={franjas.reintentar} />}
          {franjas.datos && !franjas.datos.length && (
            <EstadoVacio
              titulo="Sin franjas disponibles"
              mensaje="La tienda no tiene franjas para hoy. Prueba con “Voy saliendo”."
            />
          )}
          {!!franjas.datos?.length && (
            <SelectorFranja
              franjas={franjas.datos}
              seleccionada={franjaValida}
              onSeleccionar={setElegida}
            />
          )}
        </section>
      )}

      {modo === 'voy' && (
        <>
          {espera.cargando && <EstadoCarga mensaje="Calculando la espera…" />}
          {espera.error && <EstadoError error={espera.error} alReintentar={espera.reintentar} />}
          <PanelVoySaliendo
            espera={espera.datos}
            seleccionado
            onSeleccionar={() => setModo('voy')}
          />
        </>
      )}

      <div className="eleccion-retiro__continuar">
        <BotonPrincipal
          texto="Continuar"
          importe={formatearPrecio(totalLocal)}
          disabled={!puedeContinuar}
          onClick={continuar}
        />
      </div>
    </main>
  )
}
