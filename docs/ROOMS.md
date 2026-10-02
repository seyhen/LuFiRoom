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

Exemples : `src/rooms/bedroom.ts` et `src/scene/rooms/BedroomScene.tsx` (la chambre), `src/rooms/cabin.ts` et `src/scene/cabin/` (la cabane : un fichier par objet).
Les objets déjà écrits se réutilisent : `Window`, `Radio`, `Lamp` et `FairyLights` servent aux deux pièces (`Radio` et `Lamp` prennent une `position`).

## Les étapes

1. `src/rooms/<nom>.ts` : exporte la pièce, sur le modèle de `bedroom.ts`.
2. `src/rooms/index.ts` : ajoute-la à `rooms`. Le sélecteur apparaît dès qu'il y a deux pièces ; la première est celle d'une première visite.
3. `src/scene/rooms/<Nom>Scene.tsx` : le décor et les objets de la pièce (hors hotspots, que le moteur ajoute depuis `objects`).
   Un objet interactif est un groupe avec `userData={{ id }}` qui appelle `useSquash(id, ref)`, comme `Cat.tsx` ; il lit son état avec `isActive(s, id)`.
4. `src/scene/scenes.ts` : associe l'identifiant de la pièce à sa scène.
5. Nouvel objet, ou nouveau son : ajoute son identifiant à `ObjectId` ou `SoundId` (`src/rooms/types.ts`), son icône à `src/ui/icons.tsx`,
   et pour un son son canal dans `src/audio/channels/` puis `CHANNELS` (`src/audio/engine.ts`). Un canal reçoit la pièce : ses enregistrements sont `room.loops`.

## Comment ça se passe à l'écran

- Choisir une pièce coupe tous les sons, efface la scène, le mixeur et les hotspots en 350 ms, puis affiche la nouvelle pièce avec son ciel et son mixeur.
  Les boucles de la pièce visée commencent à se télécharger pendant l'effacement. Avec `prefers-reduced-motion`, le changement est immédiat.
- Chaque pièce a ses propres canaux audio (bus et graphe par pièce) : le ronron de la chambre n'est pas celui d'une autre pièce.
  Les canaux d'une pièce quittée restent construits, muets, pour que le retour soit instantané.
- La dernière pièce visitée est mémorisée dans le navigateur (`localStorage`).
- Volumes : un son qui porte le même identifiant dans deux pièces garde son volume d'une pièce à l'autre.
- Jour / nuit : un seul réglage pour toute l'app, que chaque pièce habille à sa façon (`sky`, `light`, scène).
