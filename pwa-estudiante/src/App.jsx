import { Navigate, Route, Routes } from "react-router-dom"
import RutaProtegida from '@shared/auth/RutaProtegida.jsx'
import LayoutConBarra from './componentes/LayoutConBarra.jsx'
import CambiarContrasena from './pantallas/CambiarContrasena.jsx'
import Carrito from './pantallas/Carrito.jsx'
import Catalogo from './pantallas/Catalogo.jsx'
import DetalleProducto from './pantallas/DetalleProducto.jsx'
import Login from './pantallas/Login.jsx'
import NuevaContrasena from './pantallas/NuevaContrasena.jsx'
import OlvideContrasena from './pantallas/OlvideContrasena.jsx'
import PantallaPendiente from './pantallas/PantallaPendiente.jsx'
import Perfil from './pantallas/Perfil.jsx'
import Registro from './pantallas/Registro.jsx'
import Tiendas from './pantallas/Tiendas.jsx'
import Verificacion from './pantallas/Verificacion.jsx'

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/registro" element={<Registro/>} />
      <Route path="/verificacion" element={<Verificacion/>}/>
      {/* HU-33: recuperar la contraseña, sin sesión */}
      <Route path="/olvide-contrasena" element={<OlvideContrasena/>}/>
      <Route path="/nueva-contrasena" element={<NuevaContrasena/>}/>
      {/* Rutas que piden sesión: sin token, RutaProtegida manda al login */}
      <Route element={<RutaProtegida/>}>
        {/* Pantallas con barra de navegación inferior (#227). Cada pantalla nueva agrega UNA línea aquí. */}
        <Route element={<LayoutConBarra/>}>
          <Route path="/tiendas" element={<Tiendas/>}/>
          <Route path="/tiendas/:idTienda" element={<Catalogo/>}/>
          <Route path="/productos/:idProducto" element={<DetalleProducto/>}/>
          <Route path="/carrito" element={<Carrito/>}/>
          {/* #54 (José Ángel): <Route path="/retiro/:idTienda" element={<EleccionRetiro/>}/> */}
          {/* Destinos de la barra que aún no tienen pantalla, igual que en Android (#229).
              Cuando exista la pantalla real, se cambia PantallaPendiente por ella. */}
          <Route path="/pedidos" element={<PantallaPendiente titulo="Pedidos"/>}/>
          <Route path="/pagos" element={<PantallaPendiente titulo="Pagos"/>}/>
          <Route path="/perfil" element={<Perfil/>}/>
          {/* HU-33: cambiar la contraseña desde el Perfil (#215) */}
          <Route path="/perfil/contrasena" element={<CambiarContrasena/>}/>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
  )
}
