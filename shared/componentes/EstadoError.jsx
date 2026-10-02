import BotonPrincipal from './BotonPrincipal.jsx'
import './Estados.css'

// Se muestra cuando la petición falla (isError de TanStack Query).
// El texto es el que manda el servidor (error.mensaje del ErrorApi), la app no inventa mensajes.
// Si se pasa alReintentar, aparece el botón para volver a pedir los datos (por ejemplo refetch).
export default function EstadoError({ error, alReintentar, reintentando = false }) {
  const mensaje = error?.mensaje ?? 'Ocurrió un error inesperado.'

  return (
    <div className="estado estado--error" role="alert">
      <p className="estado__titulo">No se pudo cargar</p>
      <p className="estado__mensaje">{mensaje}</p>
      {alReintentar && (
        <div className="estado__accion">
          <BotonPrincipal texto="Reintentar" cargando={reintentando} onClick={alReintentar} />
        </div>
      )}
    </div>
  )
}
