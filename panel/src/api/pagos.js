import { peticion } from '@shared/api/cliente.js'

// ESQUELETO (Sprint 04). Cuenta de Stripe de la tienda (#109). El backend sabe de qué tienda es por el
// token: el cliente nunca manda id_tienda.

// { datos: { url } }: el enlace de Stripe donde el encargado da de alta su cuenta bancaria
export const iniciarAltaCuenta = () => peticion('/tienda/pagos/onboarding', { method: 'POST' })

// { datos: { estado } } con "verificado", "pendiente" o "rechazado"
export const obtenerEstadoCuenta = () => peticion('/tienda/pagos/estado')
