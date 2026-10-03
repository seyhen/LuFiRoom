# Ajouter une pièce

Une pièce est une donnée (`src/rooms/<nom>.ts`, type `Room` dans `src/rooms/types.ts`) plus une scène 3D (`src/scene/rooms/<Nom>Scene.tsx`).
Le moteur (scène, audio, mixeur, sélecteur) ne change pas.

## Ce que contient une pièce

| Champ | Rôle |
|---|---|
| `id`, `name`, `description` | identifiant stable (mémorisé entre deux visites), nom de la puce du sélecteur, description pour les lecteurs d'écran |
| `objects` | les objets interactifs : quel son (ou le jour / nuit) ils pilotent, leur bulle, l'ancre de leur hotspot |
| `sounds` | les cartes du mixeur, dans l'ordre : nom, pastille, volume par défaut, sous-titre vivant |
| `loops`, `playlist` | enregistrements de la pièce (voir `docs/ASSETS.md`). Un son sans enregistrement reste synthétisé |
| `sky` | dégradé du fond, de jour et de nuit |
| `light` | hémisphérique et soleil (ou lune), de jour et de nuit |
| `dimmedBy` | l'objet dont l'activation assombrit la pièce (la pluie), s'il y en a un |

Exemples : `src/rooms/cafe.ts` et `src/scene/cafe/` (le café : le plus complet, avec des objets animés, des murs de livres en instances, une vue peinte en canvas, un réverbère derrière la vitre et des pièces immobiles fusionnées par `<Static>`), `src/rooms/bedroom.ts` et `src/scene/rooms/BedroomScene.tsx` (la chambre), `src/rooms/cabin.ts` et `src/scene/cabin/` (la cabane : un fichier par objet).
Les objets déjà écrits se réutilisent : `Window`, `Radio`, `Lamp` et `FairyLights` servent à plusieurs pièces (`Radio`, `Lamp` et `SideTable` prennent une `position`). `Window` prend aussi une peinture de cadre, des vitres (le café y met sa buée et son enseigne) et une variante vitrine (`transom`). `Flames` fait le feu d'une cheminée (flammes, lumière, halo, braises), dans la cabane comme dans le café. Le nuage et la pluie (`Cloud`, `Rain`) se placent derrière la fenêtre : toute pièce qui garde cette fenêtre les reprend tels quels, comme le café.

### Garder 60 images par seconde

Chaque maillage coûte un appel de dessin, deux s'il porte une ombre. Une pièce riche en petits objets (le café en compte des centaines) se dessine vite trop lentement sur un téléphone.
Enveloppe le décor dans `<Static>` (`src/scene/Static.tsx`) : une fois monté, il fusionne les maillages immobiles qui partagent un matériau (le café passe de 816 à 274 appels par image).
Il laisse de côté les objets interactifs (`userData.id`) et ce qui est marqué `userData={LIVE}` (une flamme, une aiguille d'horloge, un chien qui respire), avec leurs enfants. Pour fusionner l'intérieur d'un objet interactif, place un autre `<Static>` dans son groupe, comme la cheminée du café.
Garde aussi au plus trois lumières ponctuelles par pièce : les bougies et les petites lampes se contentent d'un halo (sprite), sans lumière.
Les boîtes arrondies (`rbox`) n'affichent que le centre d'une texture : pour un tapis ou un paillasson, pose la texture sur un plan.

## Les étapes

1. `src/rooms/<nom>.ts` : exporte la pièce, sur le modèle de `bedroom.ts`.
2. `src/rooms/index.ts` : ajoute-la à `rooms`. Le sélecteur apparaît dès qu'il y a deux pièces ; la première est celle d'une première visite.
3. `src/scene/rooms/<Nom>Scene.tsx` : le décor et les objets de la pièce (hors hotspots, que le moteur ajoute depuis `objects`).
   Un objet interactif est un groupe avec `userData={{ id }}` qui appelle `useSquash(id, ref)`, comme `Cat.tsx` ; il lit son état avec `isActive(s, id)`.
4. `src/scene/scenes.ts` : associe l'identifiant de la pièce à sa scène.
5. Nouvel objet, ou nouveau son : ajoute son identifiant à `ObjectId` ou `SoundId` (`src/rooms/types.ts`), son icône à `src/ui/icons.tsx`,
   et pour un son son canal dans `src/audio/channels/` puis `CHANNELS` (`src/audio/engine.ts`). Un canal reçoit la pièce : ses enregistrements sont `room.loops`. Pour un son fait d'évènements ponctuels (une tasse qui tinte), `kit.loopOrChannel` et `scheduled` (`src/audio/events.ts`) évitent de réécrire l'ordonnanceur : voir `street.ts`, `espresso.ts`, `pages.ts`.

## Comment ça se passe à l'écran

- Choisir une pièce coupe tous les sons, efface la scène, le mixeur et les hotspots en 350 ms, puis affiche la nouvelle pièce avec son ciel et son mixeur.
  Les boucles de la pièce visée commencent à se télécharger pendant l'effacement. Avec `prefers-reduced-motion`, le changement est immédiat.
- Chaque pièce a ses propres canaux audio (bus et graphe par pièce) : le ronron de la chambre n'est pas celui d'une autre pièce.
  Les canaux d'une pièce quittée restent construits, muets, pour que le retour soit instantané.
- La dernière pièce visitée est mémorisée dans le navigateur (`localStorage`).
- Volumes : un son qui porte le même identifiant dans deux pièces garde son volume d'une pièce à l'autre.
- Jour / nuit : un seul réglage pour toute l'app, que chaque pièce habille à sa façon (`sky`, `light`, scène).
