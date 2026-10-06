import { Navigate, Route, Routes } from 'react-router-dom'
import RutaPorRol from '@shared/auth/RutaPorRol.jsx'
import LayoutAdmin from './admin/LayoutAdmin.jsx'
import LayoutTienda from './tienda/LayoutTienda.jsx'

// ESQUELETO (Sprint 02). Rutas del panel; el prefijo /panel lo pone el basename de main.jsx.
// Cada vista nueva agrega UNA línea dentro de su rama y vive en su propio archivo.

// Marca de lugar para las vistas que aún no existen. Se borra cuando ya no la use nadie.
function Pendiente({ titulo }) {
  return (
    <main>
      <h1>{titulo}</h1>
      <p>Vista pendiente.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Panel de administración: /panel/admin/... */}
      <Route path="admin" element={<RutaPorRol rol="administrador" />}>
        <Route element={<LayoutAdmin />}>
          <Route index element={<Navigate to="tiendas" replace />} />
          {/* #103 reemplaza Pendiente por la vista "Tiendas" */}
          <Route path="tiendas" element={<Pendiente titulo="Tiendas" />} />
          {/* HU-32 (Sprint 06): <Route path="reglas" element={<Reglas />} /> */}
        </Route>
      </Route>

      {/* Panel de la tienda: /panel/... */}
      <Route element={<RutaPorRol rol="encargado_tienda" />}>
        <Route element={<LayoutTienda />}>
          <Route index element={<Navigate to="catalogo" replace />} />
          {/* #100 reemplaza Pendiente por la vista "Catálogo y stock" */}
          <Route path="catalogo" element={<Pendiente titulo="Catálogo y stock" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
