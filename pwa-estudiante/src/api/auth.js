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
