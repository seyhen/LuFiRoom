# Plan

On avance phase par phase. Une phase est finie quand ses critères sont remplis, pas avant.
Les phases 1 à 5 sont faites (sauf les cases encore vides) ; la suite se décide pièce par pièce (« Pistes », en bas).

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
État : sons et radio faits (enregistrements, 28 morceaux) ; le modèle Blender est en suspens. Guide : `docs/ASSETS.md`.

- [x] Formats Opus/WebM avec MP3 en repli, outil d'encodage `npm run audio` (sonie unifiée à -20 LUFS).
- [x] Moteur : boucles enregistrées sans couture (fondu entre les passages), radio sur pistes mélangées en flux, jour / nuit des sons du dehors.
      Tout son sans enregistrement, ou dont le fichier ne charge pas, reste synthétisé.
- [x] Préchargement des boucles et écran de chargement léger.
- [x] `public/audio/CREDITS.md` : gabarit et règles de licence.
- [x] Enregistrements en boucle : pluie, ventilo, ronron, oiseaux, grillons, et feu et vent de la cabane. Pris sur Pixabay (Pixabay Content License, **pas CC0** : accord du propriétaire le 2026-10-02), niveaux calés sur la synthèse ; **à écouter et à régler à l'oreille** (`gain` dans `src/rooms/`). Sources et licences : `public/audio/CREDITS.md`.
- [x] Pistes lofi pour la radio : 28 morceaux (RhythmicInk) fournis par le propriétaire (7 le 2026-10-17, 21 le 2026-10-18), playlist partagée par toutes les pièces (`src/rooms/playlist.ts`, tempo et premier temps mesurés), bouton « morceau suivant » (« disque suivant » au tourne-disque) et touche multimédia. **Licence d'usage commercial à confirmer** par le propriétaire avant toute vente (`public/audio/CREDITS.md`).
- [x] Radio générative en repli (pas de morceau, ou morceau qui ne charge pas) : dix stations aujourd'hui (`npm run stations` les vérifie), à changer depuis le mixeur ou l'écran verrouillé. Voir `docs/RADIO.md`.
- [x] Vrais enregistrements pour presque tous les sons des onze pièces (Pixabay Content License, crédits dans `public/audio/CREDITS.md`), lus en boucle, en grains (segments fondus) ou en tirs espacés selon le son (`grainsOr`, `shotsOr`). Restent synthétisés : vagues, cloche de bouée et ronron du phare, ronron de la plage, shishi-odoshi de l'onsen, pluie du marché.
- [x] Contrôle des fichiers son : `npm run audio:check` (crête vraie au plus -0,5 dBTP, sonie, paires webm + mp3, boucles courtes) ; 15 fichiers qui dépassaient ont été limités et réencodés.
- [ ] Modèle Blender en `.glb` compressé, puis son chargement (nœuds nommés, lumière cuite) : à valider d'abord, voir `docs/ASSETS.md`.

Cahier des charges d'origine :
- Modéliser la chambre dans Blender, exporter en `.glb` compressé (Draco ou meshopt), lumière précalculée dans les textures.
- Garder les objets interactifs comme meshes séparés et nommés pour le raycast et les animations.
- Remplacer les sons synthétisés par des boucles enregistrées (pluie, ventilo, ronron, dehors) et des pistes lofi sous licence pour la radio.
- Préchargement avec écran de chargement léger. Formats audio : Opus/WebM, avec MP3 en repli pour Safari si besoin.
- `public/audio/CREDITS.md` à jour.

## Phase 3 : plusieurs chambres
État : douze pièces (chambre, cabane, café, plage, train de nuit, toit-terrasse, atelier, onsen, phare, sous-marin, marché de nuit, igloo). Guide : `docs/ROOMS.md`.

- [x] Format de pièce stabilisé : `src/rooms/types.ts` (objets, sons, enregistrements, ciel, lumières), scène associée dans `src/scene/scenes.ts`.
- [x] Moteur lu depuis la pièce courante : scène, lumières, hotspots, mixeur, audio (bus et canaux par pièce).
- [x] Sélecteur de pièce (caché tant qu'il n'y en a qu'une) et transition en fondu, sons coupés, dernière pièce mémorisée.
- [x] 2e pièce : cabane sous la neige (cheminée et feu, fenêtre sur la tempête, coffre et radio, fauteuil, lampe). Sons : feu et vent enregistrés (Pixabay, voir `public/audio/CREDITS.md`) ; la radio est celle de la chambre.
- [x] Cabane habillée pour Noël, en cocon : murs en rondins, cheminée en pierre et manteau en bois (chaussettes, guirlande, bougies, fumée de cheminée), sapin décoré et cadeaux, couronne, tapis tressé, fauteuil canneberge et plaid écossais, pouf, chocolat chaud qui fume, lanterne, poinsettia, patères (écharpe, bonnet, moufles), caisse de disques, neige sur les murs et qui tombe autour (poussée par le vent), lumière chaude, interface canneberge et ambre. Le chat dort devant le feu et ronronne (ronron de la chambre). La radio devient un **tourne-disque** valise (disque qui tourne, bras qui se pose, haut-parleur dans le couvercle).
- [x] Chambre refaite, avec son ambiance à elle (rêveuse, pastel, un soir de pluie) : papier peint étoilé et boiseries menthe, fresque et étoiles qui brillent dans le noir, tête de lit en nuage, couette matelassée, plaid, lune en peluche, tapis nuage, rideaux qui ondulent avec la fenêtre et le ventilo, tache de lumière de la fenêtre, gouttes sur la vitre quand il pleut, polaroïds, cadres, guirlande de lunes, bureau (portable lofi, cahier, pot à crayons), étagère (bougie, plante qui retombe), monstera, sansevière, coin lecture (pouf-poire, tabouret, bougie), poussières de lumière, étoile filante à la fenêtre.
- [x] 3e pièce : café d'Édimbourg sous la pluie, avec son coin bibliothèque (comptoir et machine à café, mur de livres et échelle, clients, ardoise, horloge, fenêtre sur le Château et la Old Town). Sons synthétisés : la rue, le brouhaha, l'expresso, les pages et le tic-tac ; pluie et radio sont celles de la chambre.
- [x] Café, 2e version : un cocon chaud face à une ville froide. Dedans : cheminée victorienne (feu, charbons, carreaux, papier peint damassé, tableau du Château), fauteuil à oreilles en tartan Royal Stewart, skye terrier endormi (clin d'œil à Greyfriars Bobby), deux bibliothèques autour du feu, lampe de banquier (jour / nuit), guirlande guinguette, bougies, chardons et bruyère, clients à la fenêtre, table de lecture, entrée trempée (portemanteau, parapluies, flaques, paillasson « Fàilte »). Dehors : la vieille ville repeinte (Château, Victoria Street), réverbère à lumière froide, vitrine embuée avec son enseigne dorée. Nouveau son dans le café : le feu de bois.
- [x] 4e pièce : plage, un bungalow au coucher du soleil (grande porte sur la mer qui bouge, phare, voilages, lit de jour et chat roux, fauteuils de rotin). Sons : vagues, mouettes, carillon ; radio et ronron repris.
- [x] 5e pièce : train de nuit, un compartiment de voiture-lits dans les Alpes (paysage qui défile, couchettes, lampe plissée, verre de thé, roues et voie sous la caisse). Sons : le train, le thé ; pluie, radio, pages repris.
- [x] 6e pièce : toit-terrasse à Brooklyn un soir d'été (tours qui s'allument, château d'eau, braséro, guirlande, linge au vent, pigeons). Sons : la ville, les pigeons ; feu, vent (en brise), radio repris.
- [x] 7e pièce : atelier d'illustratrice sous les toits de Paris (verrière d'acier, tour Eiffel qui scintille, table à dessin, clavier, tourne-disque, bouilloire). Sons : clavier, crayon, bouilloire ; pluie et radio repris.
- [x] 8e pièce : onsen en automne (bassin qui fume, source, shishi-odoshi, érable, lanterne de pierre, furin, ryokan et montagnes). Sons : source, shishi-odoshi, furin ; jardin et radio repris.
- [x] 9e pièce : phare (quartier du gardien dans la tempête : hublot de laiton sur la houle, escalier de fonte, poêle, table à cartes, baromètre, corne de brume, cloche de bouée, concertina). Sons : corne de brume, cloche ; houle (sur les rochers), tempête et poêle repris.
- [x] 10e pièce : sous-marin (carré de légende : hublot sur l'abysse avec baleine, sonar qui balaie, tube de ballast à bulles, manomètre, télégraphe de machines, orgue de capitaine, lampe de banquier). Sons : sonar, bulles, coque, machines, baleine.
- [x] 11e pièce : marché de nuit (ruelle sous la pluie : carriole de ramen, wok, marmite, néon, télé, distributeur, tram sur le boulevard). Sons : wok, marmite, néon, tram ; pluie et radio repris.
- [x] 12e pièce : igloo, le bivouac d'un explorateur sous les aurores (dôme de blocs ouvert sur le devant, fenêtre de glace, banquette et duvet, radio de secours à manivelle, lampe tempête, réchaud, thermos, moufle, husky endormi, trou de pêche ; l'aurore danse dans le ciel). 2e passe : une île de neige autour du dôme, avec un traîneau chargé, trois sapins enneigés, une lanterne de boules de neige, des skis et leur lanterne à l'entrée, des traces de pas, un muret de blocs et sa scie ; dedans, un séchoir de linge près du réchaud, le seau et le tabouret du pêcheur ; deux manchots, un rose et un bleu, qui se dandinent près du seau. Sons nouveaux, synthétisés pour l'instant : aurore, trou de pêche, couture, cacao (l'objet bouge au moment du geste : `pulse`, `audio/events.ts`).
- [x] Les signatures de chaque pièce (2e passe) : rais de soleil et filet de pêcheur (plage), lumières de gare et compartiment habité (train), néon, escalier de secours et vapeur (toit), poutres, mur de cadres et guirlande (atelier), noren ゆ, lanternes rouges et lucioles (onsen).
- [x] Cabane : le tourne-disque joue sa propre liste (Noël, Veillée, Brume, Nuit douce) ; la chambre garde les cinq stations d'origine. Chaque pièce retient sa station.
- [ ] Cabane : son de neige / bois qui craque, vraies pistes de Noël sous licence.
- [x] Les sons du phare, du sous-marin et du marché sont enregistrés (corne de brume, sonar, bulles, coque, machines, baleine, wok, marmite, néon, tram), sauf la cloche de bouée, les vagues du phare et la pluie du marché, encore synthétisées.
- [x] Un objet de plus par pièce, avec un son à lui : diffuseur (chambre), tricot (cabane), manteau qui goutte (café), bâton de pluie (plage), cartes (train), arrosoir (toit), pinceau (atelier), fouet à matcha (onsen), plume (phare), conque (sous-marin), boulier (marché). Méthode : skill `room-objects`.
- [x] Mémoire : à la sortie d'une pièce, ses géométries et textures sont libérées sur le GPU, et ses canaux audio et sons décodés déchargés.

Cahier des charges d'origine :
- Format de chambre stabilisé (modèle, objets, sons, palette, ciel).
- Sélecteur de pièce et transition entre chambres.
- Idées de pièces : café un jour de pluie, cabane sous la neige, bibliothèque, toit-terrasse la nuit.

## Phase 4 : app installable
État : tout est fait ; la lecture en arrière-plan reste à essayer sur un vrai téléphone. Guides : `docs/PWA.md`, `docs/MIXES.md`.

- [x] PWA : manifeste, icônes, installation (bouton « Installer l'app » là où le navigateur la propose), hors ligne.
- [x] Minuteur de sommeil : 15 min, 30 min, 1 h ou 2 h, fondu de 30 s puis tout s'éteint.
- [x] Lecture en arrière-plan et contrôles écran verrouillé (Media Session) : codés et testés dans Chromium ; **à vérifier sur iPhone et Android**.
- [x] Ambiances sauvegardées (dans le navigateur), partage d'une ambiance par lien.
- [x] Préréglages : sur le mixeur silencieux, les puces Travailler / Lire / Dormir (trois ambiances prêtes par pièce, `presets` de sa fiche ; « Dormir » passe en nuit et lance le minuteur) et « Reprendre » la dernière ambiance.
- [x] Minuteur de concentration 25/5 ou 50/10, avec carillon, écran gardé allumé et temps dans le titre de l'onglet.
- [x] Volume général : un curseur dans l'en-tête du mixeur, retenu dans le navigateur (hors des ambiances et des liens).
- [x] Français et anglais (`src/i18n.ts`, bouton EN / FR, langue du navigateur par défaut).
- [x] Radio sur iPhone et iPad : morceaux décodés et joués par Web Audio, pour que le volume agisse.

Cahier des charges d'origine :
- PWA (installable, hors ligne une fois les sons en cache).
- Lecture en arrière-plan et contrôles écran verrouillé (Media Session), surtout sur iOS.
- Minuteur de sommeil, mixes sauvegardés, partage d'un mix par lien.

## Phase 5 : mise en ligne
État : le site est en ligne sur Cloudflare Workers (`wrangler.jsonc`, adresse `lufiroom.an-alexcore.workers.dev`) ; chaque push sur `main` republie. Guide : `docs/DEPLOY.md`.

- [x] Config d'hébergement : cache, service worker toujours revalidé, types des sons, en-têtes de sécurité. Pour Cloudflare, c'est `public/_headers` (copié dans `dist/`) ; `netlify.toml` dit la même chose pour Netlify.
- [x] Déploiement : d'abord prévu sur Netlify, passé à Cloudflare (gratuit, sans plafond de bande passante, utile avec ~160 Mo de sons) : Pages (`ce1319d`), puis Workers en site statique (`d1dc73b`).
- [ ] Nom de domaine à soi (depuis le compte Cloudflare).
- [x] Image et titre d'aperçu des liens (Open Graph) : adresses absolues ajoutées au build (`SITE_URL`, ou `URL` de Netlify, ou `CF_PAGES_URL` de Cloudflare Pages).
- [ ] Sur Cloudflare Workers, aucune de ces variables n'est fournie toute seule : définir `SITE_URL` dans les variables de construction du Worker, sinon l'image d'aperçu n'est pas déclarée (à vérifier sur la page en ligne).
- [x] Mesure d'audience : point d'accroche prêt, inactif (`ANALYTICS_SRC`).
- [ ] Choisir le service d'audience : comparaison et recommandation dans `docs/DEPLOY.md` (« Mesure d'audience »).
- [x] Modèle économique : note de réflexion, `docs/MODELE-ECONOMIQUE.md`.
- [x] Vérifications automatiques : `npm test` (build, stations, test de fumée dans Chromium : chaque pièce en 390 px et en desktop), et CI GitHub Actions à chaque push et pull request (`.github/workflows/ci.yml`, avec `npm run audio:check`). Avant une mise en ligne : skill `release-check`.

Cahier des charges d'origine :
- Déploiement (Vercel ou Netlify), nom de domaine.
- Mesure d'audience légère et respectueuse de la vie privée.
- Modèle économique éventuel (chambres ou sons premium).

## Pistes

Rien de ceci n'est décidé une fois pour toutes : à confirmer avant de l'attaquer.

- [x] **Ciel vivant et vrai jour / nuit** : le jour et la nuit suivent l'heure (passage de 40 s avec crépuscule, un geste prend la main jusqu'au prochain changement de période, `src/state/daylight.ts`) ; orage rare et doux (éclair dehors, tonnerre grave, jamais pendant le fondu du minuteur), étoile filante et oiseau dans le ciel, mouette et avion à la plage, pigeon au toit. Écartés : la feuille d'érable de l'onsen (cachée par la brume) et le jet de vapeur de l'expresso (invisible sur le carrelage).
- [x] **Météo** (1re version) : un sélecteur dans la barre du haut remplace le nuage ; dégagé, bruine, pluie, orage, neige, tempête de neige, dans toutes les pièces (carte « Météo » du mixeur, entendue d'où l'on est), pluie et neige dans le ciel du fond. Voir `docs/WEATHER.md`.
- [ ] Météo : vrais enregistrements de bruine, orage, neige et tempête de neige ; vues peintes enneigées.
- [ ] Les derniers sons synthétisés à enregistrer (voir Phase 2), son de neige et de bois qui craque pour la cabane, pistes de Noël.
- [ ] Modèle Blender en `.glb` (Phase 2) : en suspens, les pièces sont construites en code.
- [ ] Lecture en arrière-plan et écran verrouillé à essayer sur un vrai iPhone et un vrai Android (Phase 4).
