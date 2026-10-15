import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from './SesionContext.jsx'

// Deja pasar solo a quien tiene sesión; si no, lo manda al login.
// Se usa como ruta padre: <Route element={<RutaProtegida />}> ...rutas privadas... </Route>
// Guarda en "desde" la pantalla que se quería abrir, para regresar ahí después de entrar.
export default function RutaProtegida({ redirigirA = '/login' }) {
  const { haySesion } = useSesion()
  const ubicacion = useLocation()

  if (!haySesion) return <Navigate to={redirigirA} replace state={{ desde: ubicacion }} />

  return <Outlet />
}
