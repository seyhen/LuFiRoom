# L'app mobile (Android et iOS)

LufiRoom est publiée telle quelle sur les stores grâce à **Capacitor** : le site construit (`dist/`) est embarqué dans une coque
native (une WebView), avec ses sons. Une seule base de code ; rien à réécrire.

- `capacitor.config.ts` : identifiant des stores (`com.lufiroom.app`, définitif après la première publication), nom, dossier web.
- `android/` : le projet Android Studio. `ios/` : le projet Xcode (Swift Package Manager, pas de CocoaPods).
- Les fichiers web copiés dans `android/app/src/main/assets/public` et `ios/App/App/public` ne sont pas suivis par git : ils se
  recopient à chaque `cap sync`.

## Commandes

```
npm run mobile:sync          # construit et copie les deux apps (Android puis iOS ; à refaire après chaque changement)
npm run mobile:sync:android  # Android seul : build --mode android (sons en WebM seulement), puis cap sync android
npm run mobile:sync:ios      # iOS seul : build --mode ios (sons en MP3 seulement), puis cap sync ios
npm run mobile:android   # ouvre Android Studio (lancer sur un téléphone, construire l'APK ou l'AAB)
npm run mobile:ios       # ouvre Xcode (Mac seulement)
```

Il faut Android Studio (et son SDK) pour Android, et un Mac avec Xcode pour iOS (ou un service de build dans le cloud).

## Ce qui change dans l'app

- **Pas de service worker** dans l'app : tous les fichiers sont déjà sur le téléphone (`src/main.tsx` ne l'enregistre que sur le site).
- **Le son en arrière-plan** :
  - iOS : mode d'arrière-plan « audio » (`Info.plist`, `UIBackgroundModes`) et session audio `.playback` (`AppDelegate.swift`) :
    le son continue écran verrouillé et n'est pas coupé par le bouton silencieux.
  - Android : la WebView continue de jouer tant que le système garde l'app. **À vérifier sur un vrai téléphone** : si Android
    coupe le son après quelques minutes d'écran éteint, il faudra un service de premier plan avec sa notification de lecture
    (un petit plugin natif).
- **Polices embarquées** (`@fontsource/*`, latin seulement, 127 Ko) : rien n'est demandé à Google, tout marche hors ligne.
- **Liens de partage** : dans l'app, ils pointent vers le site (`PUBLIC_SITE_URL` dans `src/state/mixes.ts`), pas vers `https://localhost`.
  Ouvrir un lien partagé *dans* l'app demande des App Links (Android) et des Universal Links (iOS), pas encore faits.
- **Pas de mesure d'audience** dans l'app : `npm run mobile:sync` construit avec `build:android` et `build:ios` (`--mode android` / `ios`), qui n'ajoutent jamais `ANALYTICS_SRC`.
- **Un seul format de son par app** (2026-11-27) : sur le site, chaque son existe en Opus/WebM et en MP3 ; les deux ensemble faisaient 262 Mo, au-delà des 200 Mo du paquet de base de Google Play. `scripts/mobile-audio.mjs` retire l'autre format de `dist/audio/` après la construction : **Android garde le WebM** (la WebView Chromium lit l'Opus ; 124 Mo de sons), **iOS garde le MP3** (138 Mo). `src/audio/recordings.ts` (`EXTS`) n'essaie alors que ce format (`import.meta.env.MODE`). Le script échoue si un son n'existe que dans l'autre format. Comme `cap sync` copie un seul `dist/` à la fois, les deux apps se construisent l'une après l'autre (`mobile:sync` enchaîne les deux).
- **Icônes et écrans de lancement** : dessinés à partir de `public/icon.svg` (Android : `res/mipmap-*`, `res/drawable*/splash.png` ; iOS : `Assets.xcassets`).
- **iOS** : `ITSAppUsesNonExemptEncryption` = false, `PrivacyInfo.xcprivacy` (aucun pistage, aucune donnée collectée).
- **Confidentialité** : pages `public/confidentialite.html` et `public/privacy.html` (l'adresse de contact est à compléter). Fiches des stores prêtes à copier : `docs/STORES.md`.

## Avant de publier (ce qu'il reste)

- **Bloquant : licences de la musique de la radio.** Les pistes de `public/audio/radio/` sont notées « à confirmer par le propriétaire »
  dans `public/audio/CREDITS.md` (dont une reprise, « Melancholic Lo-Fi Jazz Cover »). Il faut une preuve de licence commerciale, sinon retirer les pistes.
- **Le son en arrière-plan, à tester sur de vrais téléphones** : écran verrouillé et plusieurs minutes d'écran éteint. Android : si le son se coupe,
  il faut un service de premier plan et sa notification de lecture.
- Compléter l'adresse de contact des pages de confidentialité, puis les déployer : l'adresse doit répondre avant l'envoi aux stores.
- Iconographie : vérifier les icônes sur un vrai appareil (zone sûre de l'icône adaptative Android).
- Taille : réglé, un seul format de son par plateforme (123 Mo copiés dans Android, 135 Mo dans iOS, le 2026-11-27). Toute nouvelle piste de radio ajoute environ 3 Mo.
- Licences Pixabay : les sons sont embarqués dans le paquet ; leur licence interdit de les redistribuer seuls, tels quels. À vérifier.
- App Store : règle 4.2 (voir `docs/STORES.md`, notes pour la revue). Comptes : Google Play (25 € une fois), Apple Developer (99 € par an).
- Signature : clé Android (à garder précieusement), équipe de développement dans Xcode.
