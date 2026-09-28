export function primerError(campos, nombre) {
  const valor = campos?.[nombre]
  return Array.isArray(valor) ? valor[0] : valor
}
