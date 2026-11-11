import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const DAY = '#e5daef' // --bg de tokens.css

/**
 * Ce qui dépend de l'adresse du site ou de l'hébergement, ajouté à index.html au build (voir docs/DEPLOY.md) :
 * - l'aperçu des liens (Open Graph) veut des adresses absolues. Elles viennent de SITE_URL, ou de `URL` que Netlify
 *   fournit au build (son adresse principale, nom de domaine compris). Sans adresse, l'image n'est pas déclarée ;
 * - la mesure d'audience, si ANALYTICS_SRC est défini (adresse du script du service choisi). ANALYTICS_ATTRS
 *   ajoute ses attributs, par exemple « data-domain=exemple.fr ».
 */
function siteMeta(analytics = true): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml() {
      const site = (process.env.SITE_URL || process.env.URL || process.env.CF_PAGES_URL || '').replace(/\/$/, '')
      const tags: { tag: string; attrs: Record<string, string | boolean>; injectTo: 'head' }[] = []
      const add = (tag: string, attrs: Record<string, string | boolean>) => tags.push({ tag, attrs, injectTo: 'head' })
      if (site) {
        add('link', { rel: 'canonical', href: `${site}/` })
        add('meta', { property: 'og:url', content: `${site}/` })
        add('meta', { property: 'og:image', content: `${site}/og.jpg` })
        add('meta', { property: 'og:image:width', content: '1200' })
        add('meta', { property: 'og:image:height', content: '630' })
        add('meta', { property: 'og:image:alt', content: 'Une chambre en 3D isométrique : lit, chat, bureau avec radio, fenêtre et nuage.' })
        add('meta', { name: 'twitter:image', content: `${site}/og.jpg` })
      }
      if (analytics && process.env.ANALYTICS_SRC) {
        const extra = Object.fromEntries((process.env.ANALYTICS_ATTRS ?? '').split(/\s+/).filter(Boolean).map((a) => a.split(/=(.*)/s).slice(0, 2) as [string, string]))
        add('script', { defer: true, src: process.env.ANALYTICS_SRC, ...extra })
      }
      return tags
    },
  }
}

export default defineConfig(({ mode }) => ({
  build: {
    rolldownOptions: {
      output: {
        // Les pièces sont des chunks à part (src/scene/scenes.ts) ; les briques qu'elles partagent tombent dans des chunks communs.
        // Les bibliothèques lourdes ont leur nom (et leur cache) : three.js ne bouge pas quand le décor d'une pièce change.
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|@react-three|three-stdlib|troika|meshline|maath|its-fine|suspend-react|zustand|react-reconciler|scheduler)[\\/]/, priority: 20 },
            { name: 'react', test: /node_modules[\\/](react|react-dom)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    // Build mobile (`npm run build:mobile`, --mode mobile) : aucune mesure d'audience dans l'app des stores.
    siteMeta(mode !== 'mobile'),
    VitePWA({
      // La nouvelle version prend la main toute seule, sans recharger la page : la musique ne s'arrête pas.
      registerType: 'autoUpdate',
      // Enregistré à la main dans src/main.tsx : seulement sur le site, jamais dans l'app mobile (Capacitor), qui a déjà tout sur place.
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'LufiRoom',
        short_name: 'LufiRoom',
        description: "Des chambres en 3D où chaque objet est un interrupteur de son : radio lofi, pluie, bruit blanc, feu de cheminée…",
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: DAY,
        theme_color: DAY,
        categories: ['music', 'lifestyle', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // L'app (HTML, JS, CSS, icônes) est dans le cache dès la première visite.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        // Le JS est coupé en chunks (un par pièce, les briques communes, three.js) : tous sont précachés dès la première visite pour que
        // changer de pièce marche hors ligne, mais aucun n'approche plus les 2 Mio par défaut (three.js, le plus gros, fait ~1 Mo).
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Les sons : chacun est gardé au premier téléchargement. Les lecteurs <audio> demandent des morceaux (Range) :
          // le service worker les découpe dans le fichier complet (rangeRequests). Le fichier n'est mis en cache que
          // s'il arrive entier (200) : voir `keepOffline` dans src/audio/recordings.ts.
          {
            urlPattern: ({ url }) => /^\/audio\/.+\.(webm|mp3)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'sons',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 60 },
            },
          },
        ],
      },
    }),
  ],
}))
