import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { HealthProvider } from './context/HealthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <HealthProvider>
        <App />
      </HealthProvider>
    </LanguageProvider>
  </StrictMode>,
)
