import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Polices embarquées (latin suffit : français et anglais), servies par l'app, donc hors ligne et sans rien envoyer à un tiers.
import '@fontsource/gluten/latin-600.css'
import '@fontsource/gluten/latin-800.css'
import '@fontsource/nunito/latin-500.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/dm-mono/latin-400.css'
import '@fontsource/dm-mono/latin-500.css'
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
