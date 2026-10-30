import { peticion } from '@shared/api/cliente.js'

export const CLAVE_CORREO_POR_VERIFICACION = 'correoPorVerificar'
export const CLAVE_REENVIO_DISPONIBLE_EN = 'reenvioDisponibleEn'

export const obtenerFacultades = () => peticion('/facultades')

export const registrar = (datos) => peticion('/auth/registro', { method: 'POST', body: datos })

export const acceder = (credenciales) => peticion('/auth/login', {method: 'POST', body: credenciales})

export const verificar = (correo, codigo) =>
  peticion('/auth/verificar', {
    method: 'POST',
    body: { correo_institucional: correo, codigo },
  })

export const reenviarCodigo = (correo) =>
  peticion('/auth/reenviar-codigo', {
    method: 'POST',
    body: { correo_institucional: correo },
  })

// #218 (Ricardo): el perfil con datos frescos del servidor, cada vez que se abre Perfil (#219).
// { usuario: { id, nombre, apellido, correo_institucional, facultad: { id, nombre }, rol, reputacion, faltas } }
export const obtenerPerfil = () => peticion('/auth/yo')

// HU-33: recuperar la contraseña olvidada (dos pasos) y cambiarla con sesión. Las tres responden 204.
// El correo pasa de "Olvidé" a "Nueva contraseña" por sessionStorage, igual que en Verificación.
export const CLAVE_CORREO_POR_RECUPERAR = 'correoPorRecuperar'

// Paso 1: manda el código. Responde 204 exista o no la cuenta.
export const olvidePassword = (correo) =>
  peticion('/auth/olvide-password', {
    method: 'POST',
    body: { correo_institucional: correo },
  })

// Paso 2: código + contraseña nueva. Cierra todas las sesiones de la cuenta.
export const restablecerPassword = ({ correo, codigo, password, confirmacion }) =>
  peticion('/auth/restablecer-password', {
    method: 'POST',
    body: { correo_institucional: correo, codigo, password, password_confirmation: confirmacion },
  })

// Con sesión: la actual y la nueva. Cierra las demás sesiones; esta sigue abierta.
export const cambiarPassword = ({ actual, nueva, confirmacion }) =>
  peticion('/auth/cambiar-password', {
    method: 'POST',
    body: { password_actual: actual, password: nueva, password_confirmation: confirmacion },
  })
