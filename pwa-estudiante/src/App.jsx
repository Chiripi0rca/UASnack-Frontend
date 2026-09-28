import { Navigate, Route, Routes } from "react-router-dom"
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
      <Route path="/tiendas" element={<Tiendas/>}/>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}