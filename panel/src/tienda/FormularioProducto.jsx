import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NOMBRES_CATEGORIA } from '@shared/catalogo/categorias.js'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { actualizarProducto, crearProducto } from '../api/productos.js'

// Alta y edición de un producto (POST / PATCH /tienda/productos), parte de "Catálogo y stock" (#100).
// producto = null → nuevo (pide el stock inicial). Con producto → editar (el stock se cambia en la tabla).
// Los errores por campo y sus textos vienen del servidor (422, campos).
export default function FormularioProducto({ producto, alCerrar }) {
  const clienteQuery = useQueryClient()
  const esNuevo = !producto

  // Los inputs manejan texto; se convierten a número solo al enviar
  const [valores, setValores] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    id_categoria: producto?.id_categoria ? String(producto.id_categoria) : '',
    precio: producto ? String(producto.precio) : '',
    stock_hoy: '0',
    tiempo_prep_min: producto ? String(producto.tiempo_prep_min) : '',
    tiempo_prep_max: producto ? String(producto.tiempo_prep_max) : '',
    foto_url: producto?.foto_url ?? '',
  })

  const guardar = useMutation({
    mutationFn: () => {
      // Un campo vacío se manda como null para que el servidor responda con su propio mensaje
      const numero = (texto) => (texto === '' ? null : Number(texto))
      const datos = {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
        id_categoria: numero(valores.id_categoria),
        precio: numero(valores.precio),
        tiempo_prep_min: numero(valores.tiempo_prep_min),
        tiempo_prep_max: numero(valores.tiempo_prep_max),
        foto_url: valores.foto_url.trim() || null,
      }
      // stock_hoy solo existe al crear (ActualizarProductoRequest no lo acepta)
      return esNuevo
        ? crearProducto({ ...datos, stock_hoy: numero(valores.stock_hoy) })
        : actualizarProducto(producto.id, datos)
    },
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: ['tienda', 'productos'] })
      alCerrar()
    },
  })

  // Primer mensaje del servidor para un campo, o undefined
  const errorDe = (campo) => guardar.error?.campos?.[campo]?.[0]
  const hayErroresDeCampo = Object.keys(guardar.error?.campos ?? {}).length > 0

  const cambiar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }))

  function enviar(e) {
    e.preventDefault()
    if (!guardar.isPending) guardar.mutate()
  }

  return (
    <form className="formulario-producto" noValidate onSubmit={enviar}>
      <h2>{esNuevo ? 'Nuevo producto' : `Editar ${producto.nombre}`}</h2>

      <Campo etiqueta="Nombre" error={errorDe('nombre')}>
        <input value={valores.nombre} onChange={cambiar('nombre')} />
      </Campo>
      <Campo etiqueta="Descripción" error={errorDe('descripcion')}>
        <input value={valores.descripcion} onChange={cambiar('descripcion')} />
      </Campo>
      <Campo etiqueta="Categoría" error={errorDe('id_categoria')}>
        <select value={valores.id_categoria} onChange={cambiar('id_categoria')}>
          <option value="">Elige una</option>
          {Object.entries(NOMBRES_CATEGORIA).map(([id, nombre]) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Precio" error={errorDe('precio')}>
        <input
          type="number"
          min="0"
          step="0.50"
          inputMode="decimal"
          value={valores.precio}
          onChange={cambiar('precio')}
        />
      </Campo>
      {esNuevo && (
        <Campo etiqueta="Stock de hoy" error={errorDe('stock_hoy')}>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={valores.stock_hoy}
            onChange={cambiar('stock_hoy')}
          />
        </Campo>
      )}
      <Campo etiqueta="Preparación mínima (min)" error={errorDe('tiempo_prep_min')}>
        <input
          type="number"
          min="1"
          inputMode="numeric"
          value={valores.tiempo_prep_min}
          onChange={cambiar('tiempo_prep_min')}
        />
      </Campo>
      <Campo etiqueta="Preparación máxima (min)" error={errorDe('tiempo_prep_max')}>
        <input
          type="number"
          min="1"
          inputMode="numeric"
          value={valores.tiempo_prep_max}
          onChange={cambiar('tiempo_prep_max')}
        />
      </Campo>
      <Campo etiqueta="URL de la foto (opcional)" error={errorDe('foto_url')}>
        <input type="url" value={valores.foto_url} onChange={cambiar('foto_url')} />
      </Campo>

      {/* Error general (403, sin conexión…) cuando no viene por campo */}
      {guardar.isError && !hayErroresDeCampo && (
        <p role="alert" className="error-general">
          {guardar.error.mensaje}
        </p>
      )}

      <div className="formulario-producto__acciones">
        <button type="button" className="boton-texto" onClick={alCerrar}>
          Cancelar
        </button>
        <BotonPrincipal
          type="submit"
          texto={esNuevo ? 'Crear producto' : 'Guardar cambios'}
          cargando={guardar.isPending}
        />
      </div>
    </form>
  )
}
