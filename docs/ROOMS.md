# Ajouter une pièce

Une pièce est une donnée (`src/rooms/<nom>.ts`, type `Room` dans `src/rooms/types.ts`) plus une scène 3D (`src/scene/<nom>/<Nom>Scene.tsx`, avec un fichier par objet à côté).
Le moteur (scène, audio, mixeur, sélecteur) ne change pas.

## Ce que contient une pièce

| Champ | Rôle |
|---|---|
| `id`, `name`, `description` | identifiant stable (mémorisé entre deux visites), nom de la puce du sélecteur, description pour les lecteurs d'écran |
| `objects` | les objets interactifs : quel son (ou le jour / nuit) ils pilotent, leur bulle, l'ancre de leur hotspot |
| `sounds` | les cartes du mixeur, dans l'ordre : nom, pastille, volume par défaut, sous-titre vivant ; en option une icône (`icon: 'vinyl'`) et le nom du bouton qui change la musique (`skip`) |
| `loops`, `playlist` | enregistrements de la pièce (voir `docs/ASSETS.md`). Un son sans enregistrement reste synthétisé |
| `sky` | dégradé du fond, de jour et de nuit |
| `ui` | les teintes d'interface de la pièce (accent, encre, panneau du mixeur, fond), de jour et de nuit. Chaque pièce a la sienne : canneberge et ambre pour la cabane, vert bouteille et laiton pour le café, corail pour la plage, bordeaux pour le train, brique le jour et néon rose la nuit pour le toit, bleu de Paris et ocre pour l'atelier, vermillon et lanterne pour l'onsen ; la chambre garde le teal de base |
| `stations` | les stations de la radio générative (`src/audio/stations.ts`), dans l'ordre : la première est celle d'une première visite (`noel` pour la cabane, `bureau` pour l'atelier, `brume` pour le café et l'onsen…) |
| `light` | hémisphérique et soleil (ou lune), de jour et de nuit |
| `dimmedBy` | l'objet dont l'activation assombrit la pièce (la pluie), s'il y en a un |

Exemples : `src/rooms/bedroom.ts` et `src/scene/bedroom/` (la chambre), `src/rooms/cabin.ts` et `src/scene/cabin/` (la cabane).
Les objets partagés sont dans `src/scene/objects/` : `Window` (avec une vitre en option : gouttes de pluie…), `Radio`, `Lamp`, `Cat`, `FairyLights` (couleurs au choix) et `Candles` servent aux deux pièces ; la plupart prennent une `position`.
Les briques sont dans `src/scene/parts.tsx` : `Part` (un maillage, avec ombre sauf s'il est minuscule), `Batch` (une série de copies d'une forme en un seul tracé, avec une teinte chacune), `rbox`, `cyl`, `worldUV` (une texture à l'échelle de la pièce), `orient`.
Et les six autres : `cafe/` (objets animés, murs de livres en instances, vue peinte, réverbère derrière la vitre), et cinq pièces qui montrent chacune une autre façon de faire le dehors : `beach/` (une grande porte sur une vue peinte, des vagues qui défilent par-dessus), `train/` (un paysage en trois bandes qui défilent), `roof/` (en plein air : la ville en volumes derrière les parapets), `atelier/` (une verrière à petits carreaux), `onsen/` (une palissade et des montagnes découpées, sans fenêtre).
`Window` prend aussi une peinture de cadre, une vitre par battant (le café y met sa buée et son enseigne) et une variante vitrine (`transom`). `Flames` fait le feu d'une cheminée (flammes, lumière, halo, braises), dans la cabane comme dans le café. Le nuage et la pluie (`Cloud`, `Rain`) se placent derrière la fenêtre : toute pièce qui garde cette fenêtre les reprend tels quels, comme le café. La pluie s'entend nette quand l'objet `window` de la pièce a son son allumé, étouffée sinon (ou s'il n'y a pas de fenêtre : une verrière).

Outils pour le décor :
- `holedWall(ouvertures)` (`src/scene/walls.ts`) : le mur du fond percé où l'on veut (grande porte, verrière, fenêtre de train).
- `usePainted(l, h, dessin)` (`src/scene/paint.ts`) : une vue peinte en canvas, redessinée seulement quand le jour, la nuit ou la pluie changent. Pose le plan juste derrière l'ouverture ; ce qui est derrière le mur remonte et glisse vers la droite à l'écran (la caméra regarde d'en haut, depuis la droite), place-le en conséquence.
- `ScrollLayer` : un plan transparent dont la texture défile (vagues, collines vues du train), sans rien redessiner. `glow` pour des fenêtres qui s'allument la nuit.
- `Candle`, `Steam`, `Flames`, `Cat` (position, pelage) : partagés entre les pièces.
- `Garment` (`src/scene/objects/Garment.tsx`) : un vêtement suspendu (manteau, chemise, robe), sa silhouette avec épaules, manches et ourlet ; en option un cintre, et des détails posés sur le devant. Jamais un cône ou une planche pour un manteau.
- Des pieds inclinés autour d'un centre (trépied, tabouret, braséro) : `rotation={[-Math.sin(a) * t, 0, Math.cos(a) * t]}` pour un pied posé en `[cos(a), y, sin(a)]` dont le haut rejoint le centre. Les signes inverses écartent le haut (crochets d'un portemanteau, bouquet qui s'évase).
- La nature (`src/scene/nature/`) : jamais une sphère étirée pour une pierre, une feuille ou un buisson.
  - `Rock` : une pierre (bosses, faces taillées aux arêtes arrondies, dessous à plat), avec sa mousse en option ; huit formes dont deux plates (pas japonais).
  - `Foliage` : une masse de feuillage, `wild` (houppier, olivier) ou `clipped` (azalée taillée, coussin de pin, herbes en pot). Ses UV portent la lumière : la texture peint l'ombre dessous et le soleil dessus.
  - `Leaf` : une feuille bombée et pliée sur sa nervure, `ovate`, `heart`, `lance`, `round`, `pinnate` (palme, fougère) ou `split` (monstera). Elle part le long de +z : pour l'incliner, place-la dans un groupe qui la tourne d'abord autour de y.
  - `Fern`, `Vines` (plante retombante : pothos, lierre), `Rosette` (aloès, échévéria) : assemblés à partir de `Leaf`.
  - Les matériaux viennent des fabriques de `nature/materials.ts` (`stone`, `moss`, `foliage`, `leafy`), appelées avec les couleurs de la pièce dans son `materials.ts`.
- `Motes` (`src/scene/Floaters.tsx`) : les poussières qui flottent dans la lumière. Passe-lui des couleurs et des opacités de jour et de nuit à l'image de la pièce (sable doré à la plage, poussière chaude dans l'atelier), sinon elles deviennent des lucioles bleutées la nuit.
- Des points lumineux (`<points>` : lucioles, halos d'une guirlande) : la caméra est orthographique, donc la taille d'un point est en pixels et `sizeAttenuation` n'y change rien. Mets `sizeAttenuation={false}` et `useWorldPointSize(matériau, taille)` (`src/scene/anim.ts`) : la taille, donnée en unités de la pièce, suit le zoom et l'écran.
- Un même son peut changer de timbre selon la pièce : le canal reçoit la pièce (le carillon devient un furin de verre dans l'onsen, le vent une brise sur le toit).

### Garder 60 images par seconde

Chaque maillage coûte un appel de dessin, deux s'il porte une ombre. Une pièce riche en petits objets (le café en compte des centaines) se dessine vite trop lentement sur un téléphone.
Enveloppe le décor dans `<Static>` (`src/scene/Static.tsx`) : une fois monté, il fusionne les maillages immobiles qui partagent un matériau (le café passe de 816 à 274 appels par image).
Il laisse de côté les objets interactifs (`userData.id`) et ce qui est marqué `userData={LIVE}` (une flamme, une aiguille d'horloge, un chien qui respire, un plan qui défile), avec leurs enfants. Une géométrie qu'on déforme à chaque image (un voilage, du linge) doit rester dans un objet interactif ou être marquée `LIVE`.
Repères mesurés (appels de dessin par image, nuit comprise) : chambre 216, cabane 230, café 271, plage 200, train 177, toit 246, atelier 153, onsen 204. Surveille aussi les triangles (300 à 370 milliers par image pour la plupart des pièces) : une forme de la nature coûte de 1 000 à 1 600 triangles, deux fois avec l'ombre. Pour fusionner l'intérieur d'un objet interactif, place un autre `<Static>` dans son groupe, comme la cheminée du café.
Garde aussi au plus trois lumières ponctuelles par pièce : les bougies et les petites lampes se contentent d'un halo (sprite), sans lumière. Garde-en une pour la source chaude du soir (le lampadaire de l'atelier, la bougie de la plage) : c'est elle qui fait le cocon la nuit, avec un sol d'hémisphère tiède plutôt que bleu.
Les boîtes arrondies (`rbox`) n'affichent que le centre d'une texture : pour un tapis, un paillasson ou un parquet qu'on veut voir à sa taille (le chevron du café), pose la texture sur un plan.

## Les étapes

1. `src/rooms/<nom>.ts` : exporte la pièce, sur le modèle de `bedroom.ts`.
2. `src/rooms/index.ts` : ajoute-la à `rooms`. Le sélecteur apparaît dès qu'il y a deux pièces ; la première est celle d'une première visite.
3. `src/scene/<nom>/<Nom>Scene.tsx` : le décor et les objets de la pièce (hors hotspots, que le moteur ajoute depuis `objects`).
   Le décor qui ne bouge jamais va dans `<Static>` (`src/scene/Static.tsx`) : ses maillages de même matériau sont regroupés en un seul, ce qui divise le nombre de tracés (la chambre est passée de 355 à 210). Ce qui bouge, rebondit ou s'anime reste dehors.
   Un objet interactif est un groupe avec `userData={{ id }}` qui appelle `useSquash(id, ref)`, comme `Cat.tsx` ; il lit son état avec `isActive(s, id)`.
4. `src/scene/scenes.ts` : associe l'identifiant de la pièce à sa scène.
5. Nouvel objet, ou nouveau son : ajoute son identifiant à `ObjectId` ou `SoundId` (`src/rooms/types.ts`), son icône à `src/ui/icons.tsx`,
   et pour un son son canal dans `src/audio/channels/` puis `CHANNELS` (`src/audio/engine.ts`). Un canal reçoit la pièce : ses enregistrements sont `room.loops`.
   Un même son peut avoir un autre visage dans une autre pièce : la cabane joue le son `radio` sur un tourne-disque (objet `turntable`, carte « Tourne-disque » avec l'icône `vinyl` et le bouton « Disque suivant »). Pour un son fait d'évènements ponctuels (une tasse qui tinte), `kit.loopOrChannel` et `scheduled` (`src/audio/events.ts`) évitent de réécrire l'ordonnanceur : voir `street.ts`, `espresso.ts`, `pages.ts`.

## Comment ça se passe à l'écran

- Choisir une pièce coupe tous les sons, efface la scène, le mixeur et les hotspots en 350 ms, puis affiche la nouvelle pièce avec son ciel et son mixeur.
  Les boucles de la pièce visée commencent à se télécharger pendant l'effacement. Avec `prefers-reduced-motion`, le changement est immédiat.
- Chaque pièce a ses propres canaux audio (bus et graphe par pièce) : le ronron de la chambre n'est pas celui d'une autre pièce.
  Les canaux d'une pièce quittée restent construits, muets, pour que le retour soit instantané.
- La dernière pièce visitée est mémorisée dans le navigateur (`localStorage`).
- Volumes : un son qui porte le même identifiant dans deux pièces garde son volume d'une pièce à l'autre.
- Jour / nuit : un seul réglage pour toute l'app, que chaque pièce habille à sa façon (`sky`, `light`, scène).
