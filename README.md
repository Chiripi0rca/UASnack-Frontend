# UASnack · Frontend

Dos aplicaciones React independientes que comparten código vía `shared/`. Ver `UASnack-web.md` (documento de desarrollo) para el detalle completo de pantallas, hooks y flujo de trabajo.

| Carpeta | Qué es |
|---|---|
| `pwa-estudiante/` | PWA instalable para el estudiante (iPhone, Android, laptop) |
| `panel/` | Panel web de tienda y administración. Sin versión móvil |
| `shared/` | Cliente HTTP, sesión, tiempo real, tipos y diseño. Se importa con el alias `@shared` |

No es un monorepo con workspaces: cada app tiene su propio `package.json` y sus propias dependencias. `shared/` no se instala, se importa por alias de Vite.

## Arrancar

```bash
cd pwa-estudiante && npm install && cp .env.example .env
cd ../panel && npm install && cp .env.example .env
```

Llena las variables de cada `.env` (URL del API, llaves de Reverb; la PWA además necesita `VITE_VAPID_PUBLIC_KEY`).

```bash
npm run dev        # dentro de pwa-estudiante/ o panel/
```

## Scripts (en cada app)

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Convenciones

- Los datos que vienen de la API conservan su `snake_case` tal cual; no se convierte a `camelCase`.
- El cliente nunca calcula precios ni disponibilidad — solo muestra y envía.
- HTTPS es obligatorio incluso en desarrollo para probar Service Worker y Web Push (`pwa-estudiante/`).
