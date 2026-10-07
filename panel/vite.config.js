import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/panel/',
  plugins: [react()],
  // #223: puerto fijo para que la PWA sepa a dónde reenviar /panel
  server: { port: 5174, strictPort: true },
  resolve: {
    // shared/ no tiene node_modules propio: así sus imports usan la misma copia que la app.
    // react-router-dom tiene que ser la misma copia o RutaProtegida no encuentra el router.
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
