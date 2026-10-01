import { Navigate, Route, Routes } from "react-router-dom"
import RutaProtegida from '@shared/auth/RutaProtegida.jsx'
import Login from './pantallas/Login.jsx'
import Registro from './pantallas/Registro.jsx'
import Tiendas from './pantallas/Tiendas.jsx'
import Verificacion from './pantallas/Verificacion.jsx'

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/registro" element={<Registro/>} />
      <Route path="/verificacion" element={<Verificacion/>}/>
      {/* Rutas que piden sesión: sin token, RutaProtegida manda al login */}
      <Route element={<RutaProtegida/>}>
        <Route path="/tiendas" element={<Tiendas/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}
