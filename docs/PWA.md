# App installable, hors ligne, minuteur

## Installation

`vite-plugin-pwa` (voir `vite.config.ts`) produit au build `manifest.webmanifest`, le service worker `sw.js` et `registerSW.js`.

- **Android, Chrome, Edge** : un bouton « Installer l'app » apparaît dans la barre du haut quand le navigateur propose l'installation (`src/ui/InstallButton.tsx`). Il disparaît une fois l'app installée.
- **iPhone / iPad (Safari)** : pas d'évènement d'installation, donc pas de bouton. On passe par « Partager », puis « Sur l'écran d'accueil ». L'icône et le nom viennent des balises `apple-touch-icon` et `apple-mobile-web-app-title` de `index.html`.
- La barre du navigateur (`theme-color`) suit le jour / nuit (`src/App.tsx`).

## Hors ligne

- **L'app** (HTML, JS, CSS, icônes) est mise en cache dès la première visite.
- **Les sons** passent par le cache `sons` (`/audio/**.webm|mp3`, au plus 60 fichiers) : une boucle y entre à son préchargement, une piste de la radio quand elle démarre
  (`keepOffline`, `src/audio/recordings.ts`). Le lecteur `<audio>` demande des morceaux (206) que le cache ne peut pas stocker : on télécharge donc le fichier entier une fois, de plus ; le service worker sert ensuite les morceaux depuis ce fichier.
  Ce téléchargement double n'a pas lieu en mode « économie de données ».
  Conséquence : on est hors ligne pour ce qu'on a déjà écouté, pas pour ce qu'on n'a jamais lancé.
- **Les polices** (Google Fonts) sont gardées elles aussi ; sans elles, le texte s'affiche avec les polices du système.
- **Mises à jour** : la nouvelle version prend la main toute seule (`registerType: 'autoUpdate'`) sans recharger la page, pour ne pas couper la musique. Elle s'affiche au prochain chargement.

### Tester

Le service worker n'existe que dans le build (pas avec `npm run dev`) :

```
npm run build
npm run preview
```

Puis dans le navigateur : outils de développement, Application, « Service Workers » (il doit être actif), « Manifest » (aucune erreur, installable),
et dans le réseau, « Hors connexion » puis recharger : l'app doit démarrer. Pour tester en vrai, ouvrir l'adresse de `preview` en HTTPS ou sur `localhost`.

## Icônes

`public/icon.svg` (ronde), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (pleine, contenu dans la zone sûre) et `apple-touch-icon.png` (180 px).
Le dessin est la chambre en diorama isométrique, aux couleurs de l'app. Pour la changer, remplacer ces cinq fichiers (mêmes noms et tailles).

## Minuteur de sommeil

Bouton « Minuteur » dans l'en-tête du mixeur : 15 min, 30 min, 1 h ou 2 h, et « Annuler le minuteur » une fois lancé (le temps restant s'affiche).

- Pendant les **30 dernières secondes**, le volume général descend en fondu (programmé sur l'horloge audio : l'onglet peut être en arrière-plan). À l'échéance, tous les sons s'éteignent, puis le volume général se rouvre.
- Réallumer un son pendant ce fondu final annule le minuteur (il serait resté inaudible).
- Changer de pièce ne l'arrête pas. Il n'est pas mémorisé entre deux visites.
- État : `sleepEnd` dans le store (instant d'échéance), logique audio dans `src/audio/engine.ts`, interface dans `src/ui/SleepTimer.tsx`.

## Pas encore fait

- **Lecture en arrière-plan et écran verrouillé** : sur iOS, le Web Audio se coupe quand l'écran se verrouille. Il faudra passer par un élément `<audio>` et la Media Session API.
- **Mixes sauvegardés et partage par lien.**
