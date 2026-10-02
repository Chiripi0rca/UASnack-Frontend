import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'UASnack',
        short_name: 'UASnack',
        description: 'Pide en las tiendas de tu facultad y pasa a retirar sin fila',
        theme_color: '#3F7B39',
        background_color: '#3F7B39',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // El shell (JS/CSS/HTML del build) ya queda cache-first vía precache,
        // versionado automáticamente en cada deploy por el hash del build.
        //
        // navigateFallbackDenylist: sin esto, el Service Worker (registrado en "/")
        // intercepta TODAS las navegaciones del dominio, incluyendo /panel/, /api/ y
        // /app/ (que son de otras apps/servicios detras del mismo nginx) y les sirve
        // por error el index.html de esta PWA en vez de dejarlas pasar a la red.
        // (\/|$) al final: cubre tanto "/panel/algo" como "/panel" pelón (sin barra),
        // que es justo el caso que se colaba antes.
        navigateFallbackDenylist: [/^\/panel(\/|$)/, /^\/api(\/|$)/, /^\/app(\/|$)/],
        runtimeCaching: [
          {
            // Catálogo: GET /tiendas, /tiendas/{id}/productos, /productos/{id}
            urlPattern: ({ url }) =>
              /\/api\/v\d+\/(tiendas(\/[^/]+\/productos)?|productos)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'uasnack-catalogo' },
          },
          {
            // Pedido activo y franjas: no pueden estar viejos
            urlPattern: ({ url }) =>
              /\/api\/v\d+\/(pedidos|tiendas\/[^/]+\/(franjas|espera))/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'uasnack-pedido-franjas', networkTimeoutSeconds: 5 },
          },
          {
            // Imágenes de producto: cache-first con límite de tamaño
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'uasnack-imagenes',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    // shared/ no tiene node_modules propio: así sus imports usan la misma copia que la app.
    // react-router-dom tiene que ser la misma copia o RutaProtegida no encuentra el router.
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
