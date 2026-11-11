import { useMutation, useQuery } from '@tanstack/react-query'
import BotonPrincipal from '@shared/componentes/BotonPrincipal.jsx'
import EstadoCarga from '@shared/componentes/EstadoCarga.jsx'
import EstadoError from '@shared/componentes/EstadoError.jsx'
import { iniciarAltaCuenta, obtenerEstadoCuenta } from '../api/pagos.js'
import './ConfiguraPagos.css'

// Vista "Configura tus pagos" (#147, HU-24). GET /tienda/pagos/estado y POST /tienda/pagos/onboarding (#109).
// El dinero de cada venta va directo a la cuenta bancaria de la tienda, por Stripe.
// CA-01: el RFC, la identificación y la cuenta bancaria los captura Stripe en su formulario, nunca UASnack:
//        aquí solo hay un botón que lleva a ese formulario.
// CA-02: mientras la cuenta no esté verificada, la tienda no recibe pedidos.
// CA-03: el encargado ve el estado de su cuenta: pendiente, verificada o rechazada.
// Clave de caché: ['tienda', 'pagos', 'estado'] (general → particular).
const CLAVE = ['tienda', 'pagos', 'estado']

// Lo que se le dice al encargado en cada estado. El estado lo decide el servidor (con lo que avisa Stripe);
// aquí solo se elige el texto y el color.
const ESTADOS = {
  verificado: {
    titulo: 'Tu cuenta está verificada',
    mensaje:
      'Ya puedes recibir pedidos. Stripe deposita el dinero de tus ventas en tu cuenta bancaria.',
    boton: null,
  },
  pendiente: {
    titulo: 'Tu cuenta todavía no está verificada',
    mensaje:
      'Mientras no esté verificada, tu tienda no recibe pedidos. Si ya terminaste el alta, Stripe puede tardar un poco en revisarla.',
    boton: 'Configurar mi cuenta en Stripe',
  },
  rechazado: {
    titulo: 'Stripe no pudo verificar tu cuenta',
    mensaje: 'Tu tienda no recibe pedidos. Revisa tus datos en Stripe y vuelve a enviarlos.',
    boton: 'Revisar mis datos en Stripe',
  },
}

export default function ConfiguraPagos() {
  // Se vuelve a pedir al regresar de Stripe: la vista se monta de nuevo y React Query la refresca,
  // y también al volver a la pestaña (refetchOnWindowFocus viene activado por defecto).
  const consulta = useQuery({ queryKey: CLAVE, queryFn: obtenerEstadoCuenta })
  const clave = consulta.data?.datos?.estado
  const estado = ESTADOS[clave]

  const irAStripe = useMutation({
    mutationFn: iniciarAltaCuenta,
    // El enlace de Stripe es temporal: se pide justo al tocar el botón y se abre en la misma pestaña.
    // Al terminar, Stripe regresa a esta vista.
    onSuccess: (respuesta) => window.location.assign(respuesta.datos.url),
  })

  return (
    <section>
      <h1>Configura tus pagos</h1>
      <p className="configura-pagos__ayuda">
        El dinero de cada pedido llega directo a la cuenta bancaria de tu tienda. Tus datos (RFC,
        identificación y cuenta bancaria) los capturas en el formulario de Stripe: UASnack nunca los
        ve ni los guarda.
      </p>

      {consulta.isPending && <EstadoCarga mensaje="Revisando tu cuenta…" />}
      {consulta.isError && (
        <EstadoError
          error={consulta.error}
          alReintentar={consulta.refetch}
          reintentando={consulta.isFetching}
        />
      )}

      {consulta.isSuccess && estado && (
        <div className={`estado-cuenta estado-cuenta--${clave}`} role="status">
          <p className="estado-cuenta__titulo">{estado.titulo}</p>
          <p className="estado-cuenta__mensaje">{estado.mensaje}</p>
        </div>
      )}

      {/* Un estado que esta vista no conoce no se inventa: se muestra tal cual */}
      {consulta.isSuccess && !estado && (
        <p className="configura-pagos__ayuda">
          Estado de la cuenta: <span className="mono">{String(clave)}</span>
        </p>
      )}

      {consulta.isSuccess && estado?.boton && (
        <div className="configura-pagos__acciones">
          <BotonPrincipal
            texto={estado.boton}
            cargando={irAStripe.isPending}
            onClick={() => irAStripe.mutate()}
          />
          {irAStripe.isError && (
            <p role="alert" className="configura-pagos__error">
              {irAStripe.error.mensaje}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
