import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/panel/',
  plugins: [react()],
  resolve: {
    // shared/ no tiene node_modules propio: así sus imports usan la misma copia que la app.
    // react-router-dom tiene que ser la misma copia o RutaProtegida no encuentra el router.
    dedupe: ['react', 'react-dom', 'react-router-dom'],
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
