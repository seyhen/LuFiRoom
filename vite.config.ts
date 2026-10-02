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
function siteMeta(): Plugin {
  return {
    name: 'site-meta',
    transformIndexHtml() {
      const site = (process.env.SITE_URL || process.env.URL || '').replace(/\/$/, '')
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
      if (process.env.ANALYTICS_SRC) {
        const extra = Object.fromEntries((process.env.ANALYTICS_ATTRS ?? '').split(/\s+/).filter(Boolean).map((a) => a.split(/=(.*)/s).slice(0, 2) as [string, string]))
        add('script', { defer: true, src: process.env.ANALYTICS_SRC, ...extra })
      }
      return tags
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    siteMeta(),
    VitePWA({
      // La nouvelle version prend la main toute seule, sans recharger la page : la musique ne s'arrête pas.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Chambre Lofi',
        short_name: 'Chambre Lofi',
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
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
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
          // Les polices du titre et du texte.
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'polices-css' } },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'polices', cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
