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
État : le code est prêt, il manque les fichiers (sons et modèle). Guide : `docs/ASSETS.md`.

- [x] Formats Opus/WebM avec MP3 en repli, outil d'encodage `npm run audio` (sonie unifiée à -20 LUFS).
- [x] Moteur : boucles enregistrées sans couture (fondu entre les passages), radio sur pistes mélangées en flux, jour / nuit des sons du dehors.
      Tout son sans enregistrement, ou dont le fichier ne charge pas, reste synthétisé.
- [x] Préchargement des boucles et écran de chargement léger.
- [x] `public/audio/CREDITS.md` : gabarit et règles de licence.
- [ ] Enregistrements en boucle : pluie, ventilo, ronron, oiseaux, grillons (à fournir, CC0 ou achetés).
- [ ] Pistes lofi sous licence pour la radio.
- [ ] Modèle Blender en `.glb` compressé, puis son chargement (nœuds nommés, lumière cuite) : à valider d'abord, voir `docs/ASSETS.md`.

Cahier des charges d'origine :
- Modéliser la chambre dans Blender, exporter en `.glb` compressé (Draco ou meshopt), lumière précalculée dans les textures.
- Garder les objets interactifs comme meshes séparés et nommés pour le raycast et les animations.
- Remplacer les sons synthétisés par des boucles enregistrées (pluie, ventilo, ronron, dehors) et des pistes lofi sous licence pour la radio.
- Préchargement avec écran de chargement léger. Formats audio : Opus/WebM, avec MP3 en repli pour Safari si besoin.
- `public/audio/CREDITS.md` à jour.

## Phase 3 : plusieurs chambres (piste)
État : socle, sélecteur et 2e pièce (la cabane sous la neige) faits. Guide : `docs/ROOMS.md`.

- [x] Format de pièce stabilisé : `src/rooms/types.ts` (objets, sons, enregistrements, ciel, lumières), scène associée dans `src/scene/scenes.ts`.
- [x] Moteur lu depuis la pièce courante : scène, lumières, hotspots, mixeur, audio (bus et canaux par pièce).
- [x] Sélecteur de pièce (caché tant qu'il n'y en a qu'une) et transition en fondu, sons coupés, dernière pièce mémorisée.
- [x] 2e pièce : cabane sous la neige (cheminée et feu, fenêtre sur la tempête, coffre et radio, fauteuil, lampe). Sons synthétisés : feu, vent ; la radio est celle de la chambre. Enregistrements `fire` et `wind` à fournir (`docs/ASSETS.md`).
- [ ] Autres pièces : café un jour de pluie, bibliothèque, toit-terrasse la nuit.
- [ ] Cabane : son de neige / bois qui craque, un objet de plus (chat devant le feu ?), pistes de radio propres à la pièce.

Cahier des charges d'origine :
- Format de chambre stabilisé (modèle, objets, sons, palette, ciel).
- Sélecteur de pièce et transition entre chambres.
- Idées de pièces : café un jour de pluie, cabane sous la neige, bibliothèque, toit-terrasse la nuit.

## Phase 4 : app installable (piste)
État : PWA et minuteur de sommeil faits ; reste la lecture en arrière-plan / écran verrouillé, et les mixes sauvegardés. Guide : `docs/PWA.md`.

- [x] PWA : manifeste, icônes, installation (bouton « Installer l'app » là où le navigateur la propose), hors ligne.
- [x] Minuteur de sommeil : 15 min, 30 min, 1 h ou 2 h, fondu de 30 s puis tout s'éteint.
- [ ] Lecture en arrière-plan et contrôles écran verrouillé (Media Session), surtout sur iOS.
- [ ] Mixes sauvegardés, partage d'un mix par lien.

Cahier des charges d'origine :
- PWA (installable, hors ligne une fois les sons en cache).
- Lecture en arrière-plan et contrôles écran verrouillé (Media Session), surtout sur iOS.
- Minuteur de sommeil, mixes sauvegardés, partage d'un mix par lien.

## Phase 5 : mise en ligne (piste)
État : config Netlify et guide faits (`netlify.toml`, `docs/DEPLOY.md`) ; le déploiement lui-même se fait depuis ton compte Netlify.

- [x] Config d'hébergement : cache, service worker toujours revalidé, types des sons, en-têtes de sécurité.
- [ ] Déploiement sur Netlify depuis le dépôt (à faire depuis ton compte) et nom de domaine.
- [ ] Image et titre d'aperçu des liens (Open Graph), une fois l'adresse définitive connue.
- [ ] Mesure d'audience légère et respectueuse de la vie privée.
- [ ] Modèle économique éventuel.

Cahier des charges d'origine :
- Déploiement (Vercel ou Netlify), nom de domaine.
- Mesure d'audience légère et respectueuse de la vie privée.
- Modèle économique éventuel (chambres ou sons premium).
