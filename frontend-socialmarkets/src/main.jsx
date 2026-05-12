import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Punto de inicio de la aplicación.
// React se conecta con el HTML para mostrar todo el contenido.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Cargamos el componente principal que contiene todas las rutas */}
    <App />
  </StrictMode>,
)
