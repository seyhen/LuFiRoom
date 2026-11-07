import type { CapacitorConfig } from '@capacitor/cli'

// L'app mobile (Android et iOS) : le site construit (dist/) embarqué dans une coque native. Voir docs/MOBILE.md.
const config: CapacitorConfig = {
  // L'identifiant des stores : définitif après la première publication.
  appId: 'com.lufiroom.app',
  appName: 'LufiRoom',
  webDir: 'dist',
  // La teinte du fond pendant le chargement (--bg de tokens.css), pour ne pas voir de flash blanc.
  backgroundColor: '#e5daef',
  ios: {
    // La page gère elle-même les encoches (env(safe-area-inset-*) dans app.css).
    contentInset: 'never',
  },
}

export default config
