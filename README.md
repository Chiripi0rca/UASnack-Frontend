# UASnack · Frontend

Panel web de **encargados de tienda y administradores**. Todo lo del alumno (registro, catálogo, carrito, pedidos y pagos) vive **solo en la app de Android**. La PWA del alumno se retiró en el Sprint 04; su código sigue en el historial de Git.

| Carpeta | Qué es |
|---|---|
| `panel/` | Panel web de tienda y administración, con su propio login (`/panel/login`). Sin versión móvil |
| `shared/` | Cliente HTTP, sesión, componentes y diseño. Se importa con el alias `@shared` |

`shared/` no se instala: se importa por alias de Vite desde `panel/`.

## Arrancar

```bash
cd panel && npm install && cp .env.example .env
```

Llena las variables del `.env` (URL del API y llaves de Reverb).

```bash
npm run dev        # dentro de panel/ → http://localhost:5174/panel/
```

Entran solo cuentas de encargado o administrador. Un encargado nuevo se registra y verifica su correo en la app de Android, y el administrador lo asigna a su tienda.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Convenciones

- Los datos que vienen de la API conservan su `snake_case` tal cual; no se convierte a `camelCase`.
- El cliente nunca calcula precios ni disponibilidad — solo muestra y envía.
