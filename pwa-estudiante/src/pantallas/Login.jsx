import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { acceder, CLAVE_CORREO_POR_VERIFICACION } from "../api/auth.js";
import Campo from "@shared/componentes/CampoTexto.jsx";
import IconoOjo from "../componentes/IconoOjo.jsx";
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva.js';
import { primerError } from '../utilidades/errores.js';
import { formatearTiempo } from "../utilidades/formatearTiempo.js";
import './Login.css';


export default function Login() {
    const navegar = useNavigate ()
    const [credenciales , setCredenciales] = useState ({ correo_institucional: '', password: ''})
    const [verPassword, setVerPassword] = useState (false)
    const [segundosBloque , programarFinBloqueo] = useCuentaRegresiva(0)

    const acceso = useMutation ({
        mutationFn: acceder,
        onSuccess: () => {
            navegar('/tiendas', {replace: true})
        },
        onError: (error, datos) =>{
            if (error.codigo === 'CORREO_NO_VERIFICADO') {
                sessionStorage.setItem(CLAVE_CORREO_POR_VERIFICACION, datos.correo_institucional)
            navegar('/verificacion')
            return
            }
            if (error.reintentarEn) programarFinBloqueo(Date.now() + error.reintentarEn * 1000)
        },
    })

    const bloqueado = segundosBloque > 0
    const errores = acceso.error?.campos ?? {}
    const hayErroresDeCampo = Object.keys(errores).length > 0
    const mostrarError = acceso.isError && !hayErroresDeCampo && (acceso.error.status !== 429 || bloqueado)

    function cambiar (campo ) {
        return (e) => setCredenciales((anterior) => ({ ...anterior, [campo]: e.target.value}))
    }

    function enviar (e) {
        e.preventDefault()
        if (bloqueado || acceso.isPending) return 
        acceso.mutate(credenciales)
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
                        <IconoOjo tachado = {verPassword}/>
                    </button>
                    </div>
                </Campo>

                {mostrarError &&(
                    <p role="alert" className="error-general">
                        {acceso.error.mensaje}
                        {bloqueado &&(
                            <>
                            {' '}
                            Intenta de nuevo en <span className="mono">{formatearTiempo(segundosBloque)}</span>
                            .
                            </>
                        )}
                    </p>
                )} 

                <button type="submit" className="boton-principal" disabled={bloqueado || acceso.isPending}>
                    {acceso.isPending ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p className="acceso__alterno">
                No tienes cuenta? <Link to="/registro">Crea una</Link>
            </p>
        </main>
    )
}