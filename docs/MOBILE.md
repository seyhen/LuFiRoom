# L'app mobile (Android et iOS)

LufiRoom est publiée telle quelle sur les stores grâce à **Capacitor** : le site construit (`dist/`) est embarqué dans une coque
native (une WebView), avec ses sons. Une seule base de code ; rien à réécrire.

- `capacitor.config.ts` : identifiant des stores (`com.lufiroom.app`, définitif après la première publication), nom, dossier web.
- `android/` : le projet Android Studio. `ios/` : le projet Xcode (Swift Package Manager, pas de CocoaPods).
- Les fichiers web copiés dans `android/app/src/main/assets/public` et `ios/App/App/public` ne sont pas suivis par git : ils se
  recopient à chaque `cap sync`.

## Commandes

```
npm run mobile:sync      # construit le site puis le copie dans android/ et ios/ (à refaire après chaque changement)
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
- Les polices viennent de Google Fonts : hors ligne, l'app retombe sur les polices du système. À embarquer avant la publication.

## Avant de publier

- Icônes et écran de lancement aux tailles des stores (à générer depuis `public/icon.svg`).
- Taille : les sons pèsent environ 160 Mo, dont 124 Mo pour les pistes de la radio (chacune en WebM et en MP3). Pistes à alléger
  (un seul format dans l'app) ou à lire en flux depuis le site.
- Licences : les sons Pixabay sont embarqués dans le paquet ; leur licence interdit de les redistribuer seuls, tels quels. À vérifier.
- App Store : Apple refuse les simples sites emballés (règle 4.2). Mettre en avant ce que l'app apporte (son en arrière-plan,
  commandes de l'écran verrouillé, hors ligne, minuteur de sommeil).
- Comptes : Google Play (25 € une fois), Apple Developer (99 € par an).
