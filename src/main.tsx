import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import './scene/anisotropy' // avant tout module qui fabrique des textures
import './audio/engine' // s'abonne au store
import './audio/session'
import './ui/splash'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
