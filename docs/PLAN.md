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
État : huit pièces (chambre, cabane, café, plage, train de nuit, toit-terrasse, atelier, onsen). Guide : `docs/ROOMS.md`.

- [x] Format de pièce stabilisé : `src/rooms/types.ts` (objets, sons, enregistrements, ciel, lumières), scène associée dans `src/scene/scenes.ts`.
- [x] Moteur lu depuis la pièce courante : scène, lumières, hotspots, mixeur, audio (bus et canaux par pièce).
- [x] Sélecteur de pièce (caché tant qu'il n'y en a qu'une) et transition en fondu, sons coupés, dernière pièce mémorisée.
- [x] 2e pièce : cabane sous la neige (cheminée et feu, fenêtre sur la tempête, coffre et radio, fauteuil, lampe). Sons synthétisés : feu, vent ; la radio est celle de la chambre. Enregistrements `fire` et `wind` à fournir (`docs/ASSETS.md`).
- [x] 3e pièce : café d'Édimbourg sous la pluie, avec son coin bibliothèque (comptoir et machine à café, mur de livres et échelle, clients, ardoise, horloge, fenêtre sur le Château et la Old Town). Sons synthétisés : la rue, le brouhaha, l'expresso, les pages et le tic-tac ; pluie et radio sont celles de la chambre.
- [x] Café, 2e version : un cocon chaud face à une ville froide. Dedans : cheminée victorienne (feu, charbons, carreaux, papier peint damassé, tableau du Château), fauteuil à oreilles en tartan Royal Stewart, skye terrier endormi (clin d'œil à Greyfriars Bobby), deux bibliothèques autour du feu, lampe de banquier (jour / nuit), guirlande guinguette, bougies, chardons et bruyère, clients à la fenêtre, table de lecture, entrée trempée (portemanteau, parapluies, flaques, paillasson « Fàilte »). Dehors : la vieille ville repeinte (Château, Victoria Street), réverbère à lumière froide, vitrine embuée avec son enseigne dorée. Nouveau son dans le café : le feu de bois.
- [x] 4e pièce : plage, un bungalow au coucher du soleil (grande porte sur la mer qui bouge, phare, voilages, lit de jour et chat roux, fauteuils de rotin). Sons : vagues, mouettes, carillon ; radio et ronron repris.
- [x] 5e pièce : train de nuit, un compartiment de voiture-lits dans les Alpes (paysage qui défile, couchettes, lampe plissée, verre de thé, roues et voie sous la caisse). Sons : le train, le thé ; pluie, radio, pages repris.
- [x] 6e pièce : toit-terrasse à Brooklyn un soir d'été (tours qui s'allument, château d'eau, braséro, guirlande, linge au vent, pigeons). Sons : la ville, les pigeons ; feu, vent (en brise), radio repris.
- [x] 7e pièce : atelier d'illustratrice sous les toits de Paris (verrière d'acier, tour Eiffel qui scintille, table à dessin, clavier, tourne-disque, bouilloire). Sons : clavier, crayon, bouilloire ; pluie et radio repris.
- [x] 8e pièce : onsen en automne (bassin qui fume, source, shishi-odoshi, érable, lanterne de pierre, furin, ryokan et montagnes). Sons : source, shishi-odoshi, furin ; jardin et radio repris.
- [ ] Enregistrements pour les nouveaux sons (liste et mots-clés dans `docs/ASSETS.md`).
- [ ] Cabane : son de neige / bois qui craque, un objet de plus (chat devant le feu ?), pistes de radio propres à la pièce.

Cahier des charges d'origine :
- Format de chambre stabilisé (modèle, objets, sons, palette, ciel).
- Sélecteur de pièce et transition entre chambres.
- Idées de pièces : café un jour de pluie, cabane sous la neige, bibliothèque, toit-terrasse la nuit.

## Phase 4 : app installable (piste)
État : tout est fait ; la lecture en arrière-plan reste à essayer sur un vrai téléphone. Guides : `docs/PWA.md`, `docs/MIXES.md`.

- [x] PWA : manifeste, icônes, installation (bouton « Installer l'app » là où le navigateur la propose), hors ligne.
- [x] Minuteur de sommeil : 15 min, 30 min, 1 h ou 2 h, fondu de 30 s puis tout s'éteint.
- [x] Lecture en arrière-plan et contrôles écran verrouillé (Media Session) : codés et testés dans Chromium ; **à vérifier sur iPhone et Android**.
- [x] Ambiances sauvegardées (dans le navigateur), partage d'une ambiance par lien.

Cahier des charges d'origine :
- PWA (installable, hors ligne une fois les sons en cache).
- Lecture en arrière-plan et contrôles écran verrouillé (Media Session), surtout sur iOS.
- Minuteur de sommeil, mixes sauvegardés, partage d'un mix par lien.

## Phase 5 : mise en ligne (piste)
État : config Netlify, aperçu des liens, point d'accroche de la mesure d'audience et note sur le modèle économique faits ; le déploiement, le nom de domaine et le choix du service d'audience se font depuis tes comptes.

- [x] Config d'hébergement : cache, service worker toujours revalidé, types des sons, en-têtes de sécurité.
- [ ] Déploiement sur Netlify depuis le dépôt (à faire depuis ton compte) et nom de domaine.
- [x] Image et titre d'aperçu des liens (Open Graph) : adresses absolues ajoutées au build (`URL` de Netlify ou `SITE_URL`).
- [x] Mesure d'audience : point d'accroche prêt, inactif (`ANALYTICS_SRC`) ; reste à choisir un service sans cookie.
- [x] Modèle économique : note de réflexion, `docs/MODELE-ECONOMIQUE.md`.

Cahier des charges d'origine :
- Déploiement (Vercel ou Netlify), nom de domaine.
- Mesure d'audience légère et respectueuse de la vie privée.
- Modèle économique éventuel (chambres ou sons premium).
