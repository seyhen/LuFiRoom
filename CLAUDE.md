# Chambre Lofi

Webapp d'ambiance sonore : des pièces en 3D isométrique, style « gummy » (onze aujourd'hui : chambre, cabane, café, plage, train de nuit, toit-terrasse, atelier, onsen, phare, sous-marin, marché de nuit), où chaque objet est un interrupteur de son. On touche la radio pour lancer la musique lofi, le nuage pour faire tomber la pluie, le ventilo pour le bruit blanc, etc. On compose son ambiance pour travailler, lire ou dormir.

Nom de travail : « Chambre Lofi » (provisoire).

## Point de départ

`docs/prototype.html` est un prototype complet et fonctionnel (un seul fichier, Three.js r128 + Web Audio). **C'est la spec de référence** du moteur : caméra, éclairage, matériaux gummy, interactions, synthèse du son. Les décors des pièces ont depuis été redessinés (la chambre n'est plus celle du prototype) : pour eux, la référence est le code et `docs/ROOMS.md`. Ouvre le prototype avant de toucher au rendu ou au moteur.

- `docs/PROTOTYPE.md` : notes techniques du prototype (caméra, matériaux, moteur audio, valeurs exactes). À lire avant de porter une partie.
- `docs/PLAN.md` : les phases du projet et ce qui est fait. Les phases 1 à 5 sont faites ; la suite se décide pièce par pièce.
- `docs/ROOMS.md` : comment est faite une pièce, les outils de décor, le budget de dessin. À lire avant d'ajouter ou de refaire une pièce.
- `docs/RADIO.md` : les stations de la radio générative.
- `docs/captures/` : captures du prototype, jour et nuit, mobile et desktop.

## Stack cible

- Vite + React 18 + TypeScript (strict)
- React Three Fiber + @react-three/drei pour la 3D
- Zustand pour l'état global (sons actifs, volumes, jour/nuit)
- Web Audio API natif pour le son (pas Howler : on a besoin de chaînes de filtres, ex. pluie étouffée quand la fenêtre est fermée)
- CSS natif avec variables (tokens dans `src/styles/tokens.css`), pas de Tailwind
- PWA avec vite-plugin-pwa (service worker actif seulement dans le build : `npm run build` puis `npm run preview`)

Le développement se fait sous Windows : les commandes doivent fonctionner dans PowerShell (pas de `rm -rf`, `export`, etc. dans les scripts npm).

## Structure visée

```
src/
  main.tsx, App.tsx
  state/store.ts            # Zustand : on/off et volume par son, mode nuit, pièce, minuteur, ambiances
  state/mixes.ts            # ambiances : modèle, stockage, lien de partage (voir docs/MIXES.md)
  rooms/                    # types.ts (format d'une pièce), une pièce par fichier (bedroom, cabin, cafe, beach, train, roof, atelier, onsen, lighthouse, submarine, market), index.ts
  scene/
    Stage.tsx               # <Canvas>, caméra iso, lumières, cadrage, rotation au drag
    scenes.ts               # associe chaque pièce à sa scène 3D ; ajouter une pièce : docs/ROOMS.md
    bedroom/, cabin/, cafe/, beach/, train/, roof/, atelier/, onsen/, lighthouse/, submarine/, market/   # la scène de chaque pièce, un fichier par objet, ses matériaux et ses textures
    objects/                # objets partagés entre pièces : Window, Radio, Lamp, Cat, FairyLights, Candles, Candle, Steam, Flames, ScrollLayer, Garment
    nature/                 # pierres, feuillages, feuilles, fougères, plantes retombantes, rosettes : formes et matériaux partagés
    parts.tsx, Static.tsx   # briques (Part, Batch, rbox, cyl, worldUV, orient) ; <Static> regroupe le décor immobile en peu de tracés
    paint.ts, walls.ts      # vues peintes qui suivent le jour / la nuit, murs percés
    materials.ts            # palette de matériaux gummy partagés
    Floaters.tsx            # neige autour de la cabane, poussières de la chambre
    Hotspot.tsx             # bouton DOM projeté sur un objet 3D (drei <Html>)
  audio/
    engine.ts               # AudioContext, master, compresseur, un bus par son
    buffers.ts              # bruits en boucle sans couture, gouttes, crépitement, ronron
    recordings.ts           # chargement Opus/MP3, boucles en fondu, repli sur la synthèse
    session.ts              # Media Session : titre, pause / lecture depuis l'écran verrouillé
    stations.ts             # les stations de la radio générative (accords, rythmes, timbres) ; chaque pièce choisit les siennes
    events.ts               # canal d'évènements ponctuels (tasse qui tinte, page qui se tourne)
    channels/               # un canal par son : radio.ts, tracks.ts (pistes lofi), rain.ts, fan.ts, purr.ts, outside.ts, waves.ts, rails.ts…
  ui/                       # TopBar, RoomPicker, Mixer, MixerCard, SleepTimer, MixesMenu, SharedMix, InstallButton, splash.ts (écran de chargement, HTML dans index.html)
  styles/tokens.css
scripts/encode-audio.mjs    # npm run audio : sources → Opus/WebM + MP3 dans public/audio/
scripts/make-noises.mjs     # npm run noises : bruits colorés calculés
scripts/check-stations.mjs  # npm run stations : vérifie la musique des stations (accords, notes, rythmes)
netlify.toml                # hébergement : cache et en-têtes (voir docs/DEPLOY.md)
vite.config.ts              # dont vite-plugin-pwa : manifeste, service worker, cache des sons (voir docs/PWA.md)
```

Principe clé : **une chambre est une donnée**. Les objets interactifs, les sons qu'ils pilotent, leurs ancres, le ciel et les lumières viennent de `rooms/*.ts`, pour pouvoir ajouter d'autres pièces (café, cabane sous la neige, toit-terrasse...) sans toucher au moteur.

## Conventions

- Interface en français. Ton simple et chaleureux, tutoiement.
- Mobile-first : tout doit marcher au doigt sur un téléphone de milieu de gamme à 60 fps.
- L'audio ne démarre qu'après un geste utilisateur (règle d'autoplay des navigateurs). Le premier toucher crée ou relance l'`AudioContext`.
- Chaque hotspot est un vrai `<button>` avec `aria-label` et `aria-pressed`. Le mixeur reste utilisable sans toucher la 3D.
- Respecter `prefers-reduced-motion` (pas de flottement de la pièce, pas d'animations de pulsation).
- Pas de nouvelle dépendance sans raison claire. Demander avant d'en ajouter une lourde.
- Composants petits, un objet 3D par fichier. Pas de logique audio dans les composants 3D : ils lisent le store, l'audio s'abonne au store.
- Le décor immobile va dans `<Static>` (il fusionne les maillages), ce qui bouge reste dehors ; le budget de dessin par pièce est dans `docs/ROOMS.md`.

## Direction artistique

- 3D isométrique (caméra orthographique), pièce en diorama qui flotte sur un ciel doux.
- Style gummy : formes arrondies partout, matériaux un peu brillants (clearcoat), couleurs pastel, rien de pointu.
- Chaque pièce a sa propre ambiance, de la lumière à l'interface (`ui`, `light` et `sky` de sa fiche) : la chambre est rêveuse (lilas, menthe, rose, un soir de pluie), la cabane un cocon de Noël (miel, canneberge, sapin, feu), et ainsi de suite. Une nouvelle pièce ne ressemble pas aux autres.
- Palette de base : lavande, menthe, rose, bleu canard, beurre, toffee (valeurs dans `docs/PROTOTYPE.md`) ; chaque pièce y ajoute la sienne dans son `materials.ts`.
- Typo : Gluten (titre), Nunito (texte), DM Mono (données).
- L'image d'inspiration d'origine est le travail d'un autre artiste : on s'en inspire pour l'ambiance, on ne reproduit pas sa scène.

## Le soin des ambiances

Le cœur du projet, c'est qu'une pièce ait un thème unique et détaillé. **Chaque détail compte** et on a le temps : mieux vaut passer plus de temps sur un objet que laisser le propriétaire revenir sur le même défaut. Un objet n'est pas fini parce qu'il compile : il l'est quand on le regarde en gros plan et qu'on comprend ce que c'est.

Les défauts qui reviennent le plus, à traquer avant de dire « fini » (explications et correctifs : `docs/ROOMS.md`) :

- **Ça grésille** : deux surfaces à la même hauteur (une boisson dans une tasse, la terre d'un pot, l'eau d'une vasque, la glace d'un seau, un volet collé sur une boîte) se disputent le pixel. Décale-les de 0,005 à 0,015. Les arêtes en pointillés viennent des ombres (déjà réglées dans `Lights.tsx`). Un damier très contrasté scintille : baisse le contraste.
- **Ça traverse le solide** : disques qui sortent d'un bloc plein, plaid enfoncé dans une assise, tige de plante qui passe à travers une planche, rails dans un tissu. Vérifie que rien n'entre dans un volume plein. Un bac a ses parois basses côté caméra.
- **On ne sait pas ce que c'est** : un détail minuscule posé sur une surface se lit comme du bruit. Fais-le grand et reconnaissable (un seau de bouteilles a un corps, une épaule, un goulot et une capsule), ou supprime-le.
- **Trop entassé** : répartis les objets dans toute la pièce (le fond et le devant, la gauche et la droite) ; ne remplis pas un seul coin.
- **Le rebond de clic déplace l'objet** : `useSquash` agrandit le groupe autour de son origine. Un objet interactif se pose avec `position` à son pied, jamais à l'origine du monde avec des enfants en coordonnées du monde.
- **Une animation qui saute** : n'écris jamais `sin(t * f(k))` avec une fréquence qui change ; additionne la phase image après image.
- **Un bouton mal placé** : l'`anchor` de l'objet est sur son corps, centré, pas à côté ni sur l'objet voisin. Vérifie avec la boîte englobante projetée.
- **Une fumée grossière** : `emit(..., { soft: true })` avec des volutes fines (`wispTexes`) pour une tasse et du brouillard doux (`mistTex`) ailleurs.
- **Un objet à l'envers ou de dos** : regarde de quel côté il fait face (la table à dessin montrait son dos). La caméra voit les faces +x et +z.
- **Une radio qui ne va pas avec la pièce** : l'objet qui joue la musique est propre à la pièce (tourne-disque, shamisen, boombox, gramophone, ukulélé, jukebox…), pas une radio partout. Il a son id `radio`, le hook `useBeat` (`src/scene/objects/useBeat.ts`) et son libellé.

Comment travailler un objet :
1. Imagine-le entier (forme, matière, couleur dans la palette de la pièce, ce qu'il fait quand le son joue), puis construis-le avec les briques partagées (`Part`, `Batch`, `Vines`, `Rock`, `Garment`, `Steam`, `useBeat`…).
2. Regarde-le en **gros plan** (écran à densité 2, recadre dessus), pas seulement dans la vue d'ensemble de la pièce.
3. Cherche chaque défaut de la liste ci-dessus, objet par objet, avant d'annoncer que c'est fini.
4. Si une remarque du propriétaire revient, corrige la cause (ici ou dans les briques partagées) et ajoute-la à cette liste.

## Sons

Le moteur synthétise tout en direct (celui du prototype) : c'est le repli de tout son sans enregistrement, et la radio est générative (`src/audio/stations.ts`, `docs/RADIO.md`). Les boucles enregistrées se déclarent dans `loops` de la pièce (`docs/ASSETS.md`).
Licences : CC0 ou licence achetée qui permet l'usage commercial. Seule exception accordée par le propriétaire du projet (2026-10-02) : la Pixabay Content License, pour les boucles déjà listées. Toute autre licence se demande d'abord.
Note la source de chaque fichier dans `public/audio/CREDITS.md`.

## Commandes

```
npm install
npm run dev       # serveur local
npm run build     # doit passer sans erreur TS avant chaque commit
npm run preview
npm run audio     # encode audio-src/ vers public/audio/ (ffmpeg requis, voir docs/ASSETS.md)
npm run noises    # calcule les bruits colorés
npm run stations  # vérifie la musique des stations de la radio
```

## Avant de dire qu'une tâche est finie

1. `npm run build` passe (et `npm run stations` si la musique des stations a changé).
2. Vérifie ce que la modification touche, dans le navigateur, **en gros plan** pour un objet (voir « Le soin des ambiances » : chaque défaut de la liste, objet par objet). Pas besoin de revoir toutes les pièces, en mobile et en desktop, de jour et de nuit, à chaque fois : la vérification complète (largeur mobile 390 px et desktop, jour et nuit) est pour les gros changements de rendu ou de moteur.
3. Pour un changement de moteur, compare au prototype : mêmes sons, mêmes interactions (sauf changement voulu).
4. Ne commite et ne pousse que sur demande.
