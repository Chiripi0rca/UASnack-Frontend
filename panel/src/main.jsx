import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SesionProvider } from '@shared/auth/SesionContext.jsx'
import '@shared/diseno/tokens.css'
import './index.css'
import App from './App.jsx'

const clienteQuery = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={clienteQuery}>
      {/* Sesión del panel: token y usuario guardados en localStorage (shared/auth/almacenSesion.js) */}
      <SesionProvider>
        {/* El panel se sirve bajo /panel/ (base en vite.config.js): las rutas de App.jsx no lo repiten */}
        <BrowserRouter basename="/panel">
          <App />
        </BrowserRouter>
      </SesionProvider>
    </QueryClientProvider>
  </StrictMode>,
)
