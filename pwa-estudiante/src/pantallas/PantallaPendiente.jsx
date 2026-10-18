import './PantallaPendiente.css'

// Marca de lugar para los destinos de la barra inferior que aún no tienen pantalla (Pedidos, Pagos,
// Perfil). Igual que PantallaPendiente de Android (#229): título centrado y "Pantalla pendiente.".
// Cuando exista la pantalla real, su ruta en App.jsx deja de usar este componente.
// Se borra cuando ya nadie la use.
export default function PantallaPendiente({ titulo }) {
  return (
    <main className="pantalla pantalla-pendiente">
      <h1 className="pantalla-pendiente__titulo">{titulo}</h1>
      <p className="pantalla-pendiente__mensaje">Pantalla pendiente.</p>
    </main>
  )
}
