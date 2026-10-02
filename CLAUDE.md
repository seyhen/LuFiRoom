# Chambre Lofi

Webapp d'ambiance sonore : des chambres en 3D isométrique, style « gummy », où chaque objet est un interrupteur de son. On touche la radio pour lancer la musique lofi, le nuage pour faire tomber la pluie, le ventilo pour le bruit blanc, etc. On compose son ambiance pour travailler, lire ou dormir.

Nom de travail : « Chambre Lofi » (provisoire).

## Point de départ

`docs/prototype.html` est un prototype complet et fonctionnel (un seul fichier, Three.js r128 + Web Audio). **C'est la spec de référence** pour le rendu, les interactions et le son. Ouvre-le dans un navigateur avant de coder quoi que ce soit.

- `docs/PROTOTYPE.md` : notes techniques du prototype (caméra, matériaux, moteur audio, valeurs exactes). À lire avant de porter une partie.
- `docs/PLAN.md` : les phases du projet. On travaille phase par phase.
- `docs/captures/` : captures du prototype, jour et nuit, mobile et desktop.

## Stack cible

- Vite + React 18 + TypeScript (strict)
- React Three Fiber + @react-three/drei pour la 3D
- Zustand pour l'état global (sons actifs, volumes, jour/nuit)
- Web Audio API natif pour le son (pas Howler : on a besoin de chaînes de filtres, ex. pluie étouffée quand la fenêtre est fermée)
- CSS natif avec variables (tokens dans `src/styles/tokens.css`), pas de Tailwind
- PWA en phase 4 (vite-plugin-pwa)

Le développement se fait sous Windows : les commandes doivent fonctionner dans PowerShell (pas de `rm -rf`, `export`, etc. dans les scripts npm).

## Structure visée

```
src/
  main.tsx, App.tsx
  state/store.ts            # Zustand : on/off et volume par son, mode nuit
  rooms/bedroom.ts          # config de la chambre : objets, sons liés, ancres des hotspots
  scene/
    Stage.tsx               # <Canvas>, caméra iso, lumières, cadrage, rotation au drag
    materials.ts            # palette de matériaux gummy partagés
    objects/                # Radio, Cloud, Rain, Fan, Cat, Window, Lamp, Bed, Desk...
    Hotspot.tsx             # bouton DOM projeté sur un objet 3D (drei <Html>)
  audio/
    engine.ts               # AudioContext, master, compresseur, un bus par son
    buffers.ts              # bruits en boucle sans couture, gouttes, crépitement, ronron
    channels/               # radio.ts, rain.ts, fan.ts, purr.ts, outside.ts
  ui/                       # TopBar, Mixer, MixerCard
  styles/tokens.css
```

Principe clé : **une chambre est une donnée**. Les objets interactifs, les sons qu'ils pilotent et leurs ancres viennent de `rooms/*.ts`, pour pouvoir ajouter d'autres pièces (café, cabane sous la neige...) sans toucher au moteur.

## Conventions

- Interface en français. Ton simple et chaleureux, tutoiement.
- Mobile-first : tout doit marcher au doigt sur un téléphone de milieu de gamme à 60 fps.
- L'audio ne démarre qu'après un geste utilisateur (règle d'autoplay des navigateurs). Le premier toucher crée ou relance l'`AudioContext`.
- Chaque hotspot est un vrai `<button>` avec `aria-label` et `aria-pressed`. Le mixeur reste utilisable sans toucher la 3D.
- Respecter `prefers-reduced-motion` (pas de flottement de la pièce, pas d'animations de pulsation).
- Pas de nouvelle dépendance sans raison claire. Demander avant d'en ajouter une lourde.
- Composants petits, un objet 3D par fichier. Pas de logique audio dans les composants 3D : ils lisent le store, l'audio s'abonne au store.

## Direction artistique

- 3D isométrique (caméra orthographique), pièce en diorama qui flotte sur un ciel doux.
- Style gummy : formes arrondies partout, matériaux un peu brillants (clearcoat), couleurs pastel, rien de pointu.
- Palette : lavande, menthe, rose, bleu canard, beurre, toffee. Valeurs exactes dans `docs/PROTOTYPE.md`.
- Typo : Gluten (titre), Nunito (texte), DM Mono (données).
- L'image d'inspiration d'origine est le travail d'un autre artiste : on s'en inspire pour l'ambiance, on ne reproduit pas sa scène.

## Sons

Tous les sons du prototype sont synthétisés en direct. On garde ce moteur en phase 1. En phase 2, on passe à de vrais enregistrements en boucle. N'utiliser que des sons dont la licence permet un usage commercial (CC0 ou licence achetée), et noter la source de chaque fichier dans `public/audio/CREDITS.md`.

## Commandes

```
npm install
npm run dev       # serveur local
npm run build     # doit passer sans erreur TS avant chaque commit
npm run preview
```

## Avant de dire qu'une tâche est finie

1. `npm run build` passe.
2. Vérifier dans le navigateur, en largeur mobile (390 px) et desktop.
3. Comparer au prototype : même rendu, mêmes sons, mêmes interactions (sauf changement voulu).
