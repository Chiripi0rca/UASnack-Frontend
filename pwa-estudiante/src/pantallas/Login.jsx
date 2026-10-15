import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { acceder, CLAVE_CORREO_POR_VERIFICACION } from "../api/auth.js";
import { useSesion } from "@shared/auth/SesionContext.jsx";
import { destinoPorRol } from "@shared/auth/destinoPorRol.js";
import BotonPrincipal from "@shared/componentes/BotonPrincipal.jsx";
import Campo from "@shared/componentes/CampoTexto.jsx";
import IconoOjo from "../componentes/IconoOjo.jsx";
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva.js';
import { primerError } from '../utilidades/errores.js';
import { formatearTiempo } from "../utilidades/formatearTiempo.js";
import './Login.css';

export default function Login() {
    const navegar = useNavigate()
    const ubicacion = useLocation()
    const { haySesion, usuario, iniciarSesion } = useSesion()
    const [credenciales, setCredenciales] = useState({ correo_institucional: '', password: '' })
    const [verPassword, setVerPassword] = useState(false)
    const [segundosBloque, programarFinBloqueo] = useCuentaRegresiva(0)

    // Pantalla a la que quería entrar el alumno antes de que RutaProtegida lo mandara aquí.
    const desde = ubicacion.state?.desde?.pathname

    // A dónde va cada rol. El alumno regresa a donde iba, si había algo guardado.
    function rutaPara(rol) {
        const ruta = destinoPorRol(rol)
        return rol === 'usuario' && desde ? desde : ruta
    }

    const acceso = useMutation({
        mutationFn: acceder,
        // La respuesta trae { token, usuario }: se guarda la sesión antes de navegar a una ruta protegida.
        // El panel es otra app: se llega recargando la página, no con navegar().
        onSuccess: (respuesta) => {
            iniciarSesion(respuesta.token, respuesta.usuario)
            const ruta = rutaPara(respuesta.usuario?.rol)
            if (ruta.startsWith('/panel')) {
                window.location.assign(ruta)
                return
            }
            navegar(ruta, { replace: true })
        },
        onError: (error, datos) => {
            if (error.codigo === 'CORREO_NO_VERIFICADO') {
                sessionStorage.setItem(CLAVE_CORREO_POR_VERIFICACION, datos.correo_institucional)
                navegar('/verificacion')
                return
            }
            if (error.reintentarEn) programarFinBloqueo(Date.now() + error.reintentarEn * 1000)
        },
    })

    // Si ya hay sesión guardada no tiene caso mostrar el login: entra directo.
    // Mientras se envía el formulario no se redirige aquí, eso lo hace onSuccess.
    const rutaConSesion = haySesion && !acceso.isPending ? rutaPara(usuario?.rol) : null
    const vaAlPanel = rutaConSesion?.startsWith('/panel') ?? false

    // Ir al panel recarga la página: va en un useEffect, no mientras se dibuja.
    useEffect(() => {
        if (vaAlPanel) window.location.assign(rutaConSesion)
    }, [vaAlPanel, rutaConSesion])

    const bloqueado = segundosBloque > 0
    const errores = acceso.error?.campos ?? {}
    const hayErroresDeCampo = Object.keys(errores).length > 0
    const mostrarError = acceso.isError && !hayErroresDeCampo && (acceso.error.status !== 429 || bloqueado)

    function cambiar(campo) {
        return (e) => setCredenciales((anterior) => ({ ...anterior, [campo]: e.target.value }))
    }

    function enviar(e) {
        e.preventDefault()
        if (bloqueado || acceso.isPending) return
        acceso.mutate(credenciales)
    }

    if (rutaConSesion) {
        if (vaAlPanel) return null
        return <Navigate to={rutaConSesion} replace />
    }

    return (
        <main className="pantalla pantalla-login">

            <h1>Iniciar sesion</h1>
            <p className="login-subtitulo"> Entra con tu correo institucional</p>

            <form className="formulario-login" onSubmit={enviar} noValidate>
                <Campo etiqueta="Correo institucional" error={primerError(errores, 'correo_institucional')}>
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={credenciales.correo_institucional}
                        onChange={cambiar('correo_institucional')}
                    />
                </Campo>

                <Campo etiqueta="Contraseña" error={primerError(errores, 'password')}>
                    <div className="campo__con-accion">
                        <input
                            type={verPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={credenciales.password}
                            onChange={cambiar('password')}
                        />
                        <button
                            type="button"
                            className="campo__accion"
                            aria-label={verPassword ? 'Ocultar Contraseña' : 'Mostrar Contraseña'}
                            aria-pressed={verPassword}
                            onClick={() => setVerPassword((visible) => !visible)}
                        >
                            <IconoOjo tachado={verPassword} />
                        </button>
                    </div>
                </Campo>

                {mostrarError && (
                    <p role="alert" className="error-general">
                        {acceso.error.mensaje}
                        {bloqueado && (
                            <>
                                {' '}
                                Intenta de nuevo en <span className="mono">{formatearTiempo(segundosBloque)}</span>
                                .
                            </>
                        )}
                    </p>
                )}

                <BotonPrincipal
                    type="submit"
                    texto={acceso.isPending ? 'Entrando...' : 'Entrar'}
                    cargando={acceso.isPending}
                    disabled={bloqueado}
                />
            </form>

            <p className="acceso__alterno">
                No tienes cuenta? <Link to="/registro">Crea una</Link>
            </p>
        </main>
    )
}
