# Plan

On avance phase par phase. Une phase est finie quand ses critères sont remplis, pas avant.
Les phases 3 à 5 sont des pistes : à confirmer avant de les attaquer.

## Phase 1 : portage à parité
Porter le prototype dans la stack cible, sans rien ajouter.

- Initialiser Vite + React + TypeScript, installer three, @react-three/fiber, @react-three/drei, zustand.
- Store Zustand : état on/off et volume de chaque son, mode nuit (défaut selon l'heure).
- Scène : caméra iso orthographique, cadrage entre titre et mixeur, lumières jour/nuit, pièce, mobilier, objets interactifs et leurs animations.
- Config `rooms/bedroom.ts` : liste des objets interactifs, son associé, ancre du hotspot.
- Moteur audio dans `src/audio/` (porté tel quel depuis le prototype), abonné au store.
- Interface : barre du haut, mixeur, hotspots accessibles.

Fini quand :
- le rendu et les sons sont identiques au prototype (comparer côte à côte) ;
- `npm run build` passe en TypeScript strict ;
- ça tourne fluide en largeur mobile et desktop.

## Phase 2 : vrais assets
- Modéliser la chambre dans Blender, exporter en `.glb` compressé (Draco ou meshopt), lumière précalculée dans les textures.
- Garder les objets interactifs comme meshes séparés et nommés pour le raycast et les animations.
- Remplacer les sons synthétisés par des boucles enregistrées (pluie, ventilo, ronron, dehors) et des pistes lofi sous licence pour la radio.
- Préchargement avec écran de chargement léger. Formats audio : Opus/WebM, avec MP3 en repli pour Safari si besoin.
- `public/audio/CREDITS.md` à jour.

## Phase 3 : plusieurs chambres (piste)
- Format de chambre stabilisé (modèle, objets, sons, palette, ciel).
- Sélecteur de pièce et transition entre chambres.
- Idées de pièces : café un jour de pluie, cabane sous la neige, bibliothèque, toit-terrasse la nuit.

## Phase 4 : app installable (piste)
- PWA (installable, hors ligne une fois les sons en cache).
- Lecture en arrière-plan et contrôles écran verrouillé (Media Session), surtout sur iOS.
- Minuteur de sommeil, mixes sauvegardés, partage d'un mix par lien.

## Phase 5 : mise en ligne (piste)
- Déploiement (Vercel ou Netlify), nom de domaine.
- Mesure d'audience légère et respectueuse de la vie privée.
- Modèle économique éventuel (chambres ou sons premium).
