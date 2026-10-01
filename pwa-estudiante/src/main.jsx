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
      {/* SesionProvider envuelve la app para que cualquier pantalla pueda leer o cerrar la sesión */}
      <SesionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SesionProvider>
    </QueryClientProvider>
  </StrictMode>
)
