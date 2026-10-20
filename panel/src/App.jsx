import { Navigate, Route, Routes } from 'react-router-dom'
import RutaPorRol from '@shared/auth/RutaPorRol.jsx'
import LayoutAdmin from './admin/LayoutAdmin.jsx'
import Tiendas from './admin/Tiendas.jsx'
import CatalogoStock from './tienda/CatalogoStock.jsx'
import LayoutTienda from './tienda/LayoutTienda.jsx'

// ESQUELETO (Sprint 02). Rutas del panel; el prefijo /panel lo pone el basename de main.jsx.
// Cada vista nueva agrega UNA línea dentro de su rama y vive en su propio archivo.

export default function App() {
  return (
    <Routes>
      {/* Panel de administración: /panel/admin/... */}
      <Route path="admin" element={<RutaPorRol rol="administrador" />}>
        <Route element={<LayoutAdmin />}>
          <Route index element={<Navigate to="tiendas" replace />} />
          <Route path="tiendas" element={<Tiendas />} />
          {/* HU-32 (Sprint 06): <Route path="reglas" element={<Reglas />} /> */}
        </Route>
      </Route>

      {/* Panel de la tienda: /panel/... */}
      <Route element={<RutaPorRol rol="encargado_tienda" />}>
        <Route element={<LayoutTienda />}>
          <Route index element={<Navigate to="catalogo" replace />} />
          <Route path="catalogo" element={<CatalogoStock />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}