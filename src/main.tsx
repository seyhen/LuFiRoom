import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import './scene/anisotropy' // avant tout module qui fabrique des textures
import './audio/engine' // s'abonne au store
import './audio/session'
import './ui/splash'
import { App } from './App'
import { registerSW } from 'virtual:pwa-register'
import { Capacitor } from '@capacitor/core'

// Le service worker (hors ligne, mises à jour) sert le site. L'app mobile embarque déjà tous ses fichiers : pas de service worker.
if (!Capacitor.isNativePlatform()) registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
