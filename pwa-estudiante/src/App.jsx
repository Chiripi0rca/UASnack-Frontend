import { Navigate, Route, Routes } from 'react-router-dom'
import Verificacion from './pantallas/Verificacion.jsx'
import Registro from './pantallas/Registro.jsx'
import Tiendas from './pantallas/Tiendas.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/registro" element={<Registro />} />
      <Route path="/verificacion" element={<Verificacion />} />
      <Route path="/tiendas" element={<Tiendas />} />
      <Route path="*" element={<Navigate to="/registro" replace />} />
    </Routes>
  )
}
