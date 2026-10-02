import './Estados.css'

// Se muestra cuando la petición salió bien pero no hay nada que listar (por ejemplo, sin pedidos).
// children es opcional: una acción para salir del vacío, como un enlace a "Ver tiendas".
export default function EstadoVacio({ titulo, mensaje, children }) {
  return (
    <div className="estado">
      <p className="estado__titulo">{titulo}</p>
      {mensaje && <p className="estado__mensaje">{mensaje}</p>}
      {children}
    </div>
  )
}
