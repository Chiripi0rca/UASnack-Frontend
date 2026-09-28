export function soloNumero(texto, maximo) {
  const numeros = texto.replace(/\D/g, '')
  return maximo ? numeros.slice(0, maximo) : numeros
}
