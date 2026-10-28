import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NOMBRES_CATEGORIA, sePreparaPorDefecto } from '@shared/catalogo/categorias.js'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import Campo from '@shared/componentes/CampoTexto.jsx'
import { actualizarProducto, crearProducto, subirFoto } from '../api/productos.js'

// Alta y edición de un producto (POST / PATCH /tienda/productos), parte de "Catálogo y stock" (#100).
// producto = null → nuevo (pide el stock inicial). Con producto → editar (el stock se cambia en la tabla).
// Los errores por campo y sus textos vienen del servidor (422, campos).
// #238: la foto se elige como archivo y se sube aparte (POST /tienda/productos/{id}/foto),
// después de guardar los datos, porque para subirla hace falta el id del producto.
// #237: casilla "Se prepara al momento". Desmarcada (botanas, refrescos) oculta los tiempos y los
// manda en 0: el producto no ocupa cupo de cocina y la app del alumno no le muestra tiempo.
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
  })

  // #237: al editar, lo que ya tiene el producto. Al crear empieza desmarcada (todavía no hay
  // categoría) y sigue a la categoría elegida hasta que el encargado toque la casilla.
  const [sePrepara, setSePrepara] = useState(producto ? producto.tiempo_prep_min > 0 : false)
  const [tocoCasilla, setTocoCasilla] = useState(!esNuevo)

  // #238: la foto que eligió el encargado (un File del navegador), o null si no ha elegido.
  const [archivo, setArchivo] = useState(null)

  // #238: id del producto ya guardado: el que se edita, o el que se acaba de crear.
  // Si al crear se guardan los datos pero falla la foto, el siguiente "Guardar" edita ese
  // producto en vez de crear otro igual.
  const [idGuardado, setIdGuardado] = useState(producto?.id ?? null)

  // #238: vista previa de la foto elegida. createObjectURL da una dirección temporal
  // (blob:...) para mostrar el archivo en un <img> sin subirlo todavía.
  const vistaPrevia = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo])
  // Al cambiar de foto o cerrar el formulario se libera esa dirección temporal de la memoria.
  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia)
    }
  }, [vistaPrevia])

  const guardar = useMutation({
    mutationFn: async () => {
      // Un campo vacío se manda como null para que el servidor responda con su propio mensaje
      const numero = (texto) => (texto === '' ? null : Number(texto))
      const datos = {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
        id_categoria: numero(valores.id_categoria),
        precio: numero(valores.precio),
        // #237: lo que no se cocina va en 0 y 0, aunque haya quedado algo escrito en los campos
        tiempo_prep_min: sePrepara ? numero(valores.tiempo_prep_min) : 0,
        tiempo_prep_max: sePrepara ? numero(valores.tiempo_prep_max) : 0,
      }

      // 1. Los datos. stock_hoy solo existe al crear (ActualizarProductoRequest no lo acepta).
      let id = idGuardado
      if (id === null) {
        const creado = await crearProducto({ ...datos, stock_hoy: numero(valores.stock_hoy) })
        id = creado.datos.id
        // Se recuerda en seguida, por si el paso 2 falla.
        setIdGuardado(id)
      } else {
        await actualizarProducto(id, datos)
      }

      // 2. #238: la foto, solo si eligió una. Si el servidor la rechaza (422), el error
      // llega en campos.foto y se muestra debajo del campo "Foto".
      if (archivo) await subirFoto(id, archivo)
    },
    // Pase lo que pase se refresca la tabla: aunque falle la foto, los datos ya se guardaron.
    onSettled: () => clienteQuery.invalidateQueries({ queryKey: ['tienda', 'productos'] }),
    onSuccess: () => alCerrar(),
  })

  // Primer mensaje del servidor para un campo, o undefined
  const errorDe = (campo) => guardar.error?.campos?.[campo]?.[0]
  const hayErroresDeCampo = Object.keys(guardar.error?.campos ?? {}).length > 0

  const cambiar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }))

  // #237: mientras no toque la casilla, la categoría decide si se prepara
  function cambiarCategoria(e) {
    cambiar('id_categoria')(e)
    if (!tocoCasilla) setSePrepara(sePreparaPorDefecto(e.target.value))
  }

  function cambiarSePrepara(e) {
    setTocoCasilla(true)
    setSePrepara(e.target.checked)
  }

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
        <select value={valores.id_categoria} onChange={cambiarCategoria}>
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
      {/* El stock inicial solo se pide mientras el producto no existe */}
      {idGuardado === null && (
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
      {/* #237 */}
      <label className="formulario-producto__casilla">
        <input type="checkbox" checked={sePrepara} onChange={cambiarSePrepara} />
        <span>
          Se prepara al momento
          <span className="formulario-producto__ayuda">
            Desmárcala para lo que ya está listo, como botanas o refrescos: no ocupa cupo de cocina.
          </span>
        </span>
      </label>
      {sePrepara && (
        <>
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
        </>
      )}

      {/* #238: la foto se elige del equipo. accept solo filtra el explorador de archivos;
          quien de verdad revisa tipo y peso (máximo 2 MB) es el servidor. */}
      <Campo etiqueta="Foto (opcional) · JPG, PNG o WebP, máximo 2 MB" error={errorDe('foto')}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        />
      </Campo>
      {/* La foto nueva si eligió una; si no, la que ya tiene el producto */}
      {(vistaPrevia || producto?.foto_url) && (
        <img
          className="formulario-producto__foto"
          src={vistaPrevia ?? producto.foto_url}
          alt={`Foto de ${valores.nombre || 'el producto'}`}
        />
      )}

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
          // Si el producto ya se creó (aunque la foto haya fallado), ahora se guardan cambios.
          texto={idGuardado === null ? 'Crear producto' : 'Guardar cambios'}
          cargando={guardar.isPending}
        />
      </div>
    </form>
  )
}
