import { Navigate, Route, Routes } from "react-router-dom"
import RutaProtegida from '@shared/auth/RutaProtegida.jsx'
import LayoutConBarra from './componentes/LayoutConBarra.jsx'
import Catalogo from './pantallas/Catalogo.jsx'
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
        {/* Pantallas con barra de navegación inferior (#227). Cada pantalla nueva agrega UNA línea aquí. */}
        <Route element={<LayoutConBarra/>}>
          <Route path="/tiendas" element={<Tiendas/>}/>
          <Route path="/tiendas/:idTienda" element={<Catalogo/>}/>
          {/* #50:  <Route path="/productos/:idProducto" element={<DetalleProducto/>}/> */}
          {/* #168: <Route path="/carrito" element={<Carrito/>}/> */}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}
