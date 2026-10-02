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

## Lecture en arrière-plan et écran verrouillé

Le Web Audio seul est coupé par certains systèmes (iOS surtout) quand l'écran se verrouille. Le son de l'app sort donc par un élément `<audio>` :

- le compresseur final est branché sur un `MediaStreamAudioDestinationNode`, dont le flux est lu par un `<audio>` caché (`src/audio/engine.ts`). Pour le système, c'est un lecteur de média ;
- cet élément ne joue que quand un son est actif (lancé pendant le geste de l'utilisateur, mis en pause 2.5 s après le dernier son éteint), pour ne pas laisser de contrôles affichés ni user la batterie ;
- si le navigateur ne sait pas faire (ou refuse de lire), la sortie directe prend le relais, avec un avertissement dans la console : on perd la lecture en fond, pas le son.

La **Media Session** (`src/audio/session.ts`) donne au système ce qu'il affiche : titre (les sons actifs, ou le morceau de la radio quand elle joue des pistes), pièce, icône, et trois commandes.
« Pause » coupe l'ambiance en retenant ce qui jouait, « Lecture » la remet (ou lance le premier son de la pièce s'il n'y avait rien), « Stop » coupe.

Vérifié dans Chromium : le flux porte bien le son, l'élément joue et se met en pause comme prévu, les commandes agissent, les métadonnées suivent la pièce et les sons.
**Pas vérifié sur un vrai téléphone** : surtout iPhone (Safari), où le comportement en arrière-plan est le plus capricieux. À essayer : lancer une ambiance, verrouiller l'écran, attendre une minute, vérifier que ça joue et que les contrôles apparaissent. Si ça ne marche pas, les pistes à explorer sont le mode « plein écran » de l'app installée et la manière dont iOS traite le flux.
Un point d'attention : la radio générative programme ses notes avec des minuteurs ; en arrière-plan prolongé, un navigateur peut les ralentir (en général pas tant qu'un son est audible).

## Pas encore fait

- **Mixes sauvegardés et partage par lien.**
